// ============================================================
//  ShipMateIntegrationService — Domain Orchestrator for ShipMate 3PL
//  Translates Spill the Beans domain models into ShipMate API contracts.
//  Enforces idempotency, non-blocking fault tolerance, and audit trails.
// ============================================================
import prisma from '../db/client.js';
import { shipMateClient, ShipMateApiError } from './ShipMateClient.js';
import { OrderRepository } from '../repositories/OrderRepository.js';

export class ShipMateIntegrationService {
  /**
   * Default pickup location for Spill the Beans cafe & roastery
   */
  static getPickupAddress() {
    return {
      name: process.env.SHIPMATE_PICKUP_NAME || 'Spill the Beans Cafe & Roastery',
      phone: process.env.SHIPMATE_PICKUP_PHONE || '+919876543210',
      addressLine1: process.env.SHIPMATE_PICKUP_LINE1 || '123 Coffee Roasters Lane, Indiranagar',
      addressLine2: process.env.SHIPMATE_PICKUP_LINE2 || 'Near Metro Pillar 42',
      city: process.env.SHIPMATE_PICKUP_CITY || 'Bengaluru',
      state: process.env.SHIPMATE_PICKUP_STATE || 'Karnataka',
      postalCode: process.env.SHIPMATE_PICKUP_PINCODE || '560038',
      country: process.env.SHIPMATE_PICKUP_COUNTRY || 'India',
    };
  }

  /**
   * Deterministic Idempotency Key generator
   * Formatted strictly as: STB-ORDER-<orderId>
   * Guaranteed same key for retries of the same order.
   */
  static buildDeterministicIdempotencyKey(orderId) {
    const cleanId = String(orderId || '').trim().replace(/^#/, '');
    return `STB-ORDER-${cleanId}`;
  }

  /**
   * Map internal Spill the Beans Order & Address to ShipMate ExternalCreateShipmentRequest
   */
  static mapOrderToShipmentPayload(order) {
    const pickupAddress = this.getPickupAddress();

    const customerAddress = order.address || {};
    const recipientName = customerAddress.name || order.user?.name || 'Valued Customer';
    const recipientPhone = customerAddress.phone || order.user?.phone || '+919876501234';

    const deliveryAddress = {
      name: recipientName,
      contactName: recipientName,
      phone: recipientPhone,
      phoneNumber: recipientPhone,
      addressLine1: customerAddress.line1 || 'Main Street Delivery Point',
      addressLine2: customerAddress.line2 || undefined,
      city: customerAddress.city || 'Bengaluru',
      state: customerAddress.state || 'Karnataka',
      postalCode: customerAddress.pincode || '560001',
      country: 'India',
    };

    // Calculate total weight (estimate 0.35kg per coffee item if not specified)
    let totalWeightKg = 0.5;
    if (order.items && order.items.length > 0) {
      const itemsCount = order.items.reduce((acc, item) => acc + (item.quantity || 1), 0);
      totalWeightKg = Math.max(0.5, Number((itemsCount * 0.35).toFixed(2)));
    }

    const declaredValueInRupees = order.total ? Number((order.total / 100).toFixed(2)) : 500.0;

    const packageInfo = {
      description: 'Artisan Roast Coffee Beans',
      weight: totalWeightKg,
      weightKg: totalWeightKg,
      length: 22.0,
      lengthCm: 22.0,
      width: 16.0,
      widthCm: 16.0,
      height: 12.0,
      heightCm: 12.0,
      packageType: 'BOX',
      declaredValue: declaredValueInRupees,
      fragile: false,
      isFragile: false,
      requiresColdStorage: false,
    };

    return {
      referenceId: order.id,
      deliveryType: 'STANDARD',
      pickupAddress: {
        ...pickupAddress,
        contactName: pickupAddress.name,
        phoneNumber: pickupAddress.phone,
      },
      deliveryAddress,
      packageInfo,
    };
  }

  /**
   * Map external ShipMate webhook / tracking status to internal OrderStatus
   */
  static mapShipMateStatusToOrderStatus(shipmateStatus) {
    const s = String(shipmateStatus || '').toUpperCase();
    switch (s) {
      case 'DELIVERED':
        return 'DELIVERED';
      case 'OUT_FOR_DELIVERY':
        return 'OUT_FOR_DELIVERY';
      case 'IN_TRANSIT':
      case 'DISPATCHED':
      case 'PICKED_UP':
        return 'DISPATCHED';
      case 'PROCESSING':
      case 'ROASTED':
      case 'PACKED':
        return 'PACKED';
      case 'CANCELLED':
      case 'FAILED':
        return 'CANCELLED';
      case 'BOOKED':
      case 'CREATED':
      default:
        return 'PLACED';
    }
  }

  /**
   * Dispatch an internal Spill the Beans order to ShipMate
   * Non-blocking: If ShipMate is offline, records failure state without destroying order.
   */
  static async dispatchOrderToShipMate(orderId, { client = shipMateClient, actorName = 'System' } = {}) {
    const order = await OrderRepository.findById(orderId);
    if (!order) {
      throw new Error(`Order ${orderId} not found in database.`);
    }

    // If already created and has tracking number, return existing
    if (order.shipmateShipmentId && order.shipmateTrackingNumber && order.shipmateIntegrationStatus === 'SHIPMENT_CREATED') {
      console.log(`[ShipMateIntegrationService] Order ${order.id} already has active ShipMate shipment: ${order.shipmateTrackingNumber}`);
      return order;
    }

    const idempotencyKey = this.buildDeterministicIdempotencyKey(order.id);
    const shipmentPayload = this.mapOrderToShipmentPayload(order);

    // Set integration status to PENDING_SHIPMENT before dispatch
    await prisma.order.update({
      where: { id: order.id },
      data: {
        shipmateIntegrationStatus: 'PENDING_SHIPMENT',
        shipmateLastSyncAt: new Date(),
      },
    });

    try {
      console.log(`[ShipMateIntegrationService] Dispatching order ${order.id} to ShipMate with Idempotency-Key: ${idempotencyKey}`);

      const shipmateResponse = await client.createShipment(shipmentPayload, idempotencyKey);

      const shipmentId = shipmateResponse.shipmentId || shipmateResponse.id;
      const trackingNumber = shipmateResponse.trackingNumber;
      const shipmateStatus = shipmateResponse.status || 'CREATED';

      // Persist ShipMate reference to Spill the Beans order
      const updatedOrder = await prisma.order.update({
        where: { id: order.id },
        data: {
          shipmateShipmentId: shipmentId ? String(shipmentId) : null,
          shipmateTrackingNumber: trackingNumber ? String(trackingNumber) : null,
          shipmateStatus: String(shipmateStatus),
          shipmateIntegrationStatus: 'SHIPMENT_CREATED',
          shipmateError: null,
          shipmateLastSyncAt: new Date(),
          trackingId: trackingNumber || order.trackingId,
          courierPartner: 'ShipMate',
          estimatedDelivery: shipmateResponse.estimatedDelivery ? new Date(shipmateResponse.estimatedDelivery) : order.estimatedDelivery,
        },
        include: {
          items: true,
          address: true,
          user: { select: { id: true, name: true, email: true, phone: true } },
          trackingEvents: { orderBy: { createdAt: 'asc' } },
          auditLogs: { orderBy: { createdAt: 'desc' } },
        },
      });

      // Add TrackingEvent & AuditLog
      await prisma.trackingEvent.create({
        data: {
          orderId: order.id,
          status: 'DISPATCHED',
          message: `Dispatched via ShipMate logistics. Tracking ID: ${trackingNumber}`,
          courierPartner: 'ShipMate',
          trackingNumber: trackingNumber,
          updatedBy: actorName,
        },
      }).catch((e) => console.warn('[TrackingEvent Error]', e.message));

      await prisma.orderAuditLog.create({
        data: {
          orderId: order.id,
          actorName,
          action: 'SHIPMATE_SHIPMENT_CREATED',
          details: `Shipment created in ShipMate logistics. Tracking: ${trackingNumber}, Shipment UUID: ${shipmentId}`,
        },
      }).catch((e) => console.warn('[AuditLog Error]', e.message));

      console.log(`[ShipMateIntegrationService] Order ${order.id} linked to ShipMate shipment ${trackingNumber} (${shipmentId})`);
      return updatedOrder;
    } catch (err) {
      console.error(`[ShipMateIntegrationService] Failed to dispatch order ${order.id} to ShipMate:`, err.message);

      // Record failure state on the order (Order is NOT lost)
      const failedOrder = await prisma.order.update({
        where: { id: order.id },
        data: {
          shipmateIntegrationStatus: 'SHIPMENT_FAILED',
          shipmateError: err.message || 'ShipMate API error',
          shipmateLastSyncAt: new Date(),
        },
        include: {
          items: true,
          address: true,
          user: { select: { id: true, name: true, email: true, phone: true } },
          trackingEvents: { orderBy: { createdAt: 'asc' } },
          auditLogs: { orderBy: { createdAt: 'desc' } },
        },
      });

      await prisma.orderAuditLog.create({
        data: {
          orderId: order.id,
          actorName,
          action: 'SHIPMATE_DISPATCH_FAILED',
          details: `ShipMate dispatch failed: ${err.message}. Order is preserved and available for retry.`,
        },
      }).catch((e) => console.warn('[AuditLog Error]', e.message));

      throw err;
    }
  }

  /**
   * Sync tracking status for an order from ShipMate
   */
  static async syncTracking(orderId, { client = shipMateClient } = {}) {
    const order = await OrderRepository.findById(orderId);
    if (!order) throw new Error(`Order ${orderId} not found.`);

    if (!order.shipmateTrackingNumber) {
      throw new Error(`Order ${orderId} does not have a ShipMate tracking number.`);
    }

    const trackingResponse = await client.getTracking(order.shipmateTrackingNumber);

    const latestStatus = trackingResponse.status || order.shipmateStatus;

    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: {
        shipmateStatus: String(latestStatus),
        shipmateLastSyncAt: new Date(),
        estimatedDelivery: trackingResponse.estimatedDelivery ? new Date(trackingResponse.estimatedDelivery) : order.estimatedDelivery,
      },
      include: {
        items: true,
        address: true,
        user: { select: { id: true, name: true, email: true, phone: true } },
        trackingEvents: { orderBy: { createdAt: 'asc' } },
        auditLogs: { orderBy: { createdAt: 'desc' } },
      },
    });

    return { order: updatedOrder, tracking: trackingResponse };
  }

  /**
   * Dispatches a realistic test order (e.g. STB-10001) over real HTTP to ShipMate
   */
  static async createTestOrder({ referenceId = 'STB-10001', client = shipMateClient } = {}) {
    const payload = {
      referenceId,
      deliveryType: 'STANDARD',
      pickupAddress: this.getPickupAddress(),
      deliveryAddress: {
        name: 'Rahul Sharma',
        phone: '+919876501234',
        addressLine1: 'Flat 402, Green Valley Apartments',
        addressLine2: 'Outer Ring Road, Bellandur',
        city: 'Bengaluru',
        state: 'Karnataka',
        postalCode: '560103',
        country: 'India',
      },
      packageInfo: {
        weight: 1.2,
        length: 20.0,
        width: 15.0,
        height: 10.0,
        packageType: 'BOX',
        declaredValue: 850.0,
        isFragile: false,
        requiresColdStorage: false,
      },
    };

    const idempotencyKey = this.buildDeterministicIdempotencyKey(referenceId);
    console.log(`[ShipMateIntegrationService] Sending Test Order ${referenceId} to ShipMate...`);

    const response = await client.createShipment(payload, idempotencyKey);
    return {
      success: true,
      referenceId,
      idempotencyKey,
      shipment: response,
      message: 'Test order successfully submitted to ShipMate public API.',
    };
  }
}
