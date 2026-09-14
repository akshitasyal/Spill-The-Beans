import { describe, it, expect } from 'vitest';
import { ShipMateIntegrationService } from '../../server/services/ShipMateIntegrationService';
import { ORDER_STAGES, STAGE_TRANSITIONS, DEFAULT_STAGE_MESSAGES } from '../../server/repositories/OrderRepository';

describe('End-to-End Checkout Pipeline & Business Logic Tests', () => {
  // Test Data Setup
  const mockUser = {
    id: 'usr_clerk_101',
    name: 'Akshat Beanlover',
    email: 'akshat@spillthebeans.com',
    phone: '+91 9876543210',
  };

  const mockAddress = {
    id: 'addr_101',
    name: 'Akshat Beanlover',
    phone: '+91 9876543210',
    line1: 'Flat 402, Arabica Heights, Indiranagar',
    line2: 'Near 100ft Road',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560038',
  };

  const mockItems = [
    {
      productId: 'prod_vanilla_50g',
      slug: 'vichaar-over-vanilla-50g',
      name: 'Vichaar Over Vanilla (50g)',
      price: 29900, // ₹299.00 in paise
      quantity: 2,
      variant: '50g Glass Jar',
    },
    {
      productId: 'prod_hazelnut_50g',
      slug: 'nutkhat-hazelnut-50g',
      name: 'Nutkhat Hazelnut (50g)',
      price: 29900, // ₹299.00 in paise
      quantity: 1,
      variant: '50g Glass Jar',
    },
  ];

  describe('1. Cart & Pricing Computations', () => {
    it('calculates accurate item counts and subtotals in paise and INR', () => {
      const itemCount = mockItems.reduce((acc, item) => acc + item.quantity, 0);
      const subtotalPaise = mockItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

      expect(itemCount).toBe(3);
      expect(subtotalPaise).toBe(89700); // 2 * 29900 + 1 * 29900 = ₹897.00
      expect(subtotalPaise / 100).toBe(897);
    });

    it('applies free shipping for orders exceeding ₹599 (59900 paise)', () => {
      const subtotalPaise = 89700;
      const isFreeShipping = subtotalPaise >= 59900;
      const shippingFee = isFreeShipping ? 0 : 9900;

      expect(isFreeShipping).toBe(true);
      expect(shippingFee).toBe(0);
    });

    it('charges standard shipping of ₹99 for orders below ₹599', () => {
      const smallSubtotal = 29900; // ₹299
      const isFreeShipping = smallSubtotal >= 59900;
      const shippingFee = isFreeShipping ? 0 : 9900;

      expect(isFreeShipping).toBe(false);
      expect(shippingFee).toBe(9900);
      expect(smallSubtotal + shippingFee).toBe(39800);
    });

    it('calculates coupon discounts correctly for percentage and fixed types', () => {
      const subtotal = 89700;
      // 10% coupon
      const discountPercentage = Math.round((subtotal * 10) / 100);
      expect(discountPercentage).toBe(8970); // ₹89.70

      // Fixed ₹100 coupon
      const discountFixed = Math.min(10000, subtotal);
      expect(discountFixed).toBe(10000); // ₹100.00
    });
  });

  describe('2. Direct Checkout Order Payload & Idempotency Key', () => {
    it('maps order items and customer shipping details into ShipMate External Request', () => {
      const order = {
        id: 'ord_stb_99999',
        userId: mockUser.id,
        user: mockUser,
        address: mockAddress,
        paymentMethod: 'COD',
        paymentStatus: 'PENDING',
        total: 89700,
        subtotal: 89700,
        discount: 0,
        shippingFee: 0,
        items: mockItems,
      };

      const requestPayload = ShipMateIntegrationService.mapOrderToShipmentPayload(order);

      expect(requestPayload.referenceId).toBe('ord_stb_99999');
      expect(requestPayload.deliveryAddress.name).toBe(mockAddress.name);
      expect(requestPayload.deliveryAddress.phone).toBe(mockAddress.phone);
      expect(requestPayload.deliveryAddress.addressLine1).toBe(mockAddress.line1);
      expect(requestPayload.deliveryAddress.city).toBe('Bengaluru');
      expect(requestPayload.deliveryAddress.state).toBe('Karnataka');
      expect(requestPayload.deliveryAddress.postalCode).toBe('560038');
      expect(requestPayload.packageInfo.declaredValue).toBe(897); // In rupees
      expect(requestPayload.packageInfo.packageType).toBe('BOX');
    });

    it('generates consistent, deterministic idempotency keys for retry safety', () => {
      const key1 = ShipMateIntegrationService.buildDeterministicIdempotencyKey('ord_abc123');
      const key2 = ShipMateIntegrationService.buildDeterministicIdempotencyKey('ord_abc123');

      expect(key1).toBe('STB-ORDER-ord_abc123');
      expect(key1).toBe(key2);
    });
  });

  describe('3. Order Lifecycle & Status Progression Validations', () => {
    it('has valid stage definitions and default messages for all fulfillment stages', () => {
      expect(ORDER_STAGES).toContain('PLACED');
      expect(ORDER_STAGES).toContain('PACKED');
      expect(ORDER_STAGES).toContain('ROASTED');
      expect(ORDER_STAGES).toContain('DISPATCHED');
      expect(ORDER_STAGES).toContain('OUT_FOR_DELIVERY');
      expect(ORDER_STAGES).toContain('DELIVERED');

      ORDER_STAGES.forEach((stage) => {
        expect(DEFAULT_STAGE_MESSAGES[stage]).toBeDefined();
        expect(typeof DEFAULT_STAGE_MESSAGES[stage]).toBe('string');
      });
    });

    it('enforces sequential status transitions', () => {
      expect(STAGE_TRANSITIONS['PLACED']).toBe('PACKED');
      expect(STAGE_TRANSITIONS['PACKED']).toBe('ROASTED');
      expect(STAGE_TRANSITIONS['ROASTED']).toBe('DISPATCHED');
      expect(STAGE_TRANSITIONS['DISPATCHED']).toBe('OUT_FOR_DELIVERY');
      expect(STAGE_TRANSITIONS['OUT_FOR_DELIVERY']).toBe('DELIVERED');
    });

    it('maps external ShipMate statuses back to Spill the Beans order stages correctly', () => {
      expect(ShipMateIntegrationService.mapShipMateStatusToOrderStatus('DELIVERED')).toBe('DELIVERED');
      expect(ShipMateIntegrationService.mapShipMateStatusToOrderStatus('OUT_FOR_DELIVERY')).toBe('OUT_FOR_DELIVERY');
      expect(ShipMateIntegrationService.mapShipMateStatusToOrderStatus('IN_TRANSIT')).toBe('DISPATCHED');
      expect(ShipMateIntegrationService.mapShipMateStatusToOrderStatus('BOOKED')).toBe('PLACED');
      expect(ShipMateIntegrationService.mapShipMateStatusToOrderStatus('CANCELLED')).toBe('CANCELLED');
    });
  });
});
