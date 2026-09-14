import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ShipMateClient, ShipMateApiError } from '../../server/services/ShipMateClient.js';
import { ShipMateIntegrationService } from '../../server/services/ShipMateIntegrationService.js';

describe('ShipMate 3PL Logistics Integration Tests', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  describe('1. Configuration & Secret Masking', () => {
    it('should initialize ShipMateClient with configured options and sanitize URLs', () => {
      const client = new ShipMateClient({
        baseUrl: 'http://localhost:8080///',
        apiKey: 'sm_live_abcdef1234567890_sec_fedcba0987654321',
        organizationCode: 'STB-7821',
        timeoutMs: 5000,
        maxRetries: 1,
      });

      expect(client.baseUrl).toBe('http://localhost:8080');
      expect(client.apiKey).toBe('sm_live_abcdef1234567890_sec_fedcba0987654321');
      expect(client.organizationCode).toBe('STB-7821');
      expect(client.isConfigured()).toBe(true);
    });

    it('should mask secret API keys so credentials never leak into logs or UI', () => {
      expect(ShipMateClient.maskSecret('sm_live_1234567890_sec_abcdef')).toBe('sm_l...cdef');
      expect(ShipMateClient.maskSecret('short')).toBe('***');
      expect(ShipMateClient.maskSecret(null)).toBe('[NONE]');
      expect(ShipMateClient.maskSecret('')).toBe('[NONE]');
    });
  });

  describe('2. Order Mapping & Deterministic Idempotency Key', () => {
    it('should generate deterministic idempotency keys from order ID', () => {
      const key1 = ShipMateIntegrationService.buildDeterministicIdempotencyKey('STB-10001');
      const key2 = ShipMateIntegrationService.buildDeterministicIdempotencyKey('STB-10001');
      const key3 = ShipMateIntegrationService.buildDeterministicIdempotencyKey('#STB-10001');

      expect(key1).toBe('STB-ORDER-STB-10001');
      expect(key1).toBe(key2);
      expect(key1).toBe(key3);
    });

    it('should correctly map internal Order and Address to ShipMate ExternalCreateShipmentRequest', () => {
      const mockOrder = {
        id: 'STB-10001',
        total: 129900, // 1299 INR in paise
        user: { name: 'Rahul Sharma', phone: '+919876501234' },
        address: {
          name: 'Rahul Sharma',
          phone: '+919876501234',
          line1: 'Flat 402, Green Valley',
          line2: 'Bellandur',
          city: 'Bengaluru',
          state: 'Karnataka',
          pincode: '560103',
        },
        items: [
          { name: 'Dark Roast Coffee', quantity: 2 },
          { name: 'Cold Brew Blend', quantity: 1 },
        ],
      };

      const payload = ShipMateIntegrationService.mapOrderToShipmentPayload(mockOrder);

      expect(payload.referenceId).toBe('STB-10001');
      expect(payload.deliveryType).toBe('STANDARD');
      expect(payload.pickupAddress.name).toBe('Spill the Beans Cafe & Roastery');
      expect(payload.pickupAddress.city).toBe('Bengaluru');
      expect(payload.deliveryAddress.name).toBe('Rahul Sharma');
      expect(payload.deliveryAddress.addressLine1).toBe('Flat 402, Green Valley');
      expect(payload.deliveryAddress.city).toBe('Bengaluru');
      expect(payload.deliveryAddress.postalCode).toBe('560103');
      expect(payload.packageInfo.declaredValue).toBe(1299.0);
      expect(payload.packageInfo.packageType).toBe('BOX');
      expect(payload.packageInfo.weight).toBeGreaterThanOrEqual(1.0);
    });
  });

  describe('3. HTTP Dispatch & Response Parsing', () => {
    it('should successfully create shipment and parse ShipMate response', async () => {
      const mockResponse = {
        shipmentId: '77777777-7777-7777-7777-777777777777',
        trackingNumber: 'SHP-2026-STB10001',
        referenceId: 'STB-10001',
        status: 'CREATED',
        price: 150.0,
        currency: 'INR',
        deliveryType: 'STANDARD',
        estimatedDelivery: '2026-09-16T10:00:00Z',
        createdAt: '2026-09-13T20:00:00Z',
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 201,
        headers: { get: () => 'application/json' },
        json: async () => mockResponse,
      });

      const client = new ShipMateClient({
        baseUrl: 'http://localhost:8080',
        apiKey: 'sm_live_testkey_sec_testsecret',
        organizationCode: 'STB-7821',
      });

      const res = await client.createShipment({ referenceId: 'STB-10001' }, 'STB-ORDER-STB-10001');

      expect(res.trackingNumber).toBe('SHP-2026-STB10001');
      expect(res.status).toBe('CREATED');
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:8080/api/v1/shipments',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'X-API-Key': 'sm_live_testkey_sec_testsecret',
            'X-Organization-Code': 'STB-7821',
            'Idempotency-Key': 'STB-ORDER-STB-10001',
          }),
        })
      );
    });

    it('should throw ShipMateApiError on 401 Unauthorized without retrying', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        headers: { get: () => 'application/json' },
        json: async () => ({ code: 'UNAUTHORIZED', message: 'Invalid API key provided' }),
      });

      const client = new ShipMateClient({
        baseUrl: 'http://localhost:8080',
        apiKey: 'invalid_key',
        maxRetries: 2,
      });

      await expect(client.createShipment({ referenceId: 'STB-10001' }, 'STB-ORDER-STB-10001'))
        .rejects.toThrow(ShipMateApiError);

      expect(global.fetch).toHaveBeenCalledTimes(1); // Permanent failure — must not retry
    });

    it('should throw ShipMateApiError on 403 Forbidden for tenant isolation / mismatch', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 403,
        headers: { get: () => 'application/json' },
        json: async () => ({ code: 'FORBIDDEN', message: 'API key not authorized for organization code mismatch' }),
      });

      const client = new ShipMateClient({
        baseUrl: 'http://localhost:8080',
        apiKey: 'sm_live_spill_the_beans_key',
        organizationCode: 'ANOTHER-ORG',
        maxRetries: 2,
      });

      await expect(client.createShipment({ referenceId: 'STB-10001' }, 'STB-ORDER-STB-10001'))
        .rejects.toThrow('API key not authorized');

      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('should retry transient 503 errors up to maxRetries before failing', async () => {
      global.fetch = vi.fn()
        .mockResolvedValueOnce({
          ok: false,
          status: 503,
          headers: { get: () => 'application/json' },
          json: async () => ({ message: 'Service temporarily unavailable' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 201,
          headers: { get: () => 'application/json' },
          json: async () => ({
            shipmentId: 'uuid-1',
            trackingNumber: 'SHP-RETRY-SUCCESS',
            status: 'CREATED',
          }),
        });

      const client = new ShipMateClient({
        baseUrl: 'http://localhost:8080',
        apiKey: 'sm_live_key',
        maxRetries: 2,
        timeoutMs: 1000,
      });

      const res = await client.createShipment({ referenceId: 'STB-10001' }, 'STB-ORDER-STB-10001');

      expect(res.trackingNumber).toBe('SHP-RETRY-SUCCESS');
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    it('should fetch tracking history by tracking number', async () => {
      const mockTracking = {
        shipmentId: 'uuid-1',
        trackingNumber: 'SHP-2026-STB10001',
        referenceId: 'STB-10001',
        status: 'IN_TRANSIT',
        events: [
          { status: 'CREATED', description: 'Shipment created via API' },
          { status: 'PICKED_UP', description: 'Picked up from cafe' },
          { status: 'IN_TRANSIT', description: 'In transit to hub' },
        ],
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: { get: () => 'application/json' },
        json: async () => mockTracking,
      });

      const client = new ShipMateClient({ baseUrl: 'http://localhost:8080', apiKey: 'sm_live_key' });
      const tracking = await client.getTracking('SHP-2026-STB10001');

      expect(tracking.status).toBe('IN_TRANSIT');
      expect(tracking.events).toHaveLength(3);
    });
  });
});
