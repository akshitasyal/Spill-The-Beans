// ============================================================
//  WebhookController — Handles incoming webhooks from ShipMate
// ============================================================
import crypto from 'crypto';
import prisma from '../db/client.js';

export const WebhookController = {
  /**
   * POST /api/webhooks/shipmate
   * Receive shipment status updates from ShipMate
   */
  async handleShipMateWebhook(req, res, next) {
    try {
      const signature = req.headers['x-shipmate-signature'] || req.headers['x-webhook-signature'];
      const secret = process.env.SHIPMATE_WEBHOOK_SECRET;

      // Verify HMAC signature if secret is configured
      if (secret && signature) {
        const hmac = crypto.createHmac('sha256', secret);
        const digest = hmac.update(JSON.stringify(req.body)).digest('hex');
        if (digest !== signature) {
          console.warn('[ShipMate Webhook] Invalid signature rejected.');
          return res.status(401).json({ success: false, message: 'Invalid webhook signature.' });
        }
      }

      const { eventType, shipmentId, trackingNumber, referenceId, status, description, timestamp } = req.body || {};

      console.log(`[ShipMate Webhook] Received event "${eventType || status}" for shipment ${trackingNumber || shipmentId || referenceId}`);

      if (!referenceId && !trackingNumber && !shipmentId) {
        return res.status(400).json({ success: false, message: 'Missing shipment reference or tracking number.' });
      }

      // Find matching order in Spill the Beans
      let order = null;
      if (referenceId) {
        order = await prisma.order.findUnique({ where: { id: referenceId } }).catch(() => null);
      }
      if (!order && trackingNumber) {
        order = await prisma.order.findFirst({
          where: {
            OR: [
              { shipmateTrackingNumber: trackingNumber },
              { trackingId: trackingNumber },
            ],
          },
        }).catch(() => null);
      }
      if (!order && shipmentId) {
        order = await prisma.order.findFirst({
          where: { shipmateShipmentId: String(shipmentId) },
        }).catch(() => null);
      }

      if (!order) {
        console.warn(`[ShipMate Webhook] No matching order found for reference: ${referenceId || trackingNumber || shipmentId}`);
        // Return 200 to acknowledge webhook even if order not in this tenant
        return res.json({ success: true, message: 'Webhook received; no local order matched.' });
      }

      const newShipmateStatus = status || eventType;

      // Update order status if changed
      await prisma.order.update({
        where: { id: order.id },
        data: {
          shipmateStatus: String(newShipmateStatus),
          shipmateLastSyncAt: new Date(timestamp || Date.now()),
        },
      });

      // Append TrackingEvent to timeline
      if (newShipmateStatus) {
        await prisma.trackingEvent.create({
          data: {
            orderId: order.id,
            status: order.status,
            message: description || `ShipMate status update: ${newShipmateStatus}`,
            updatedBy: 'ShipMate Webhook',
            courierPartner: 'ShipMate',
            trackingNumber: trackingNumber || order.shipmateTrackingNumber,
          },
        }).catch(() => {});
      }

      // Append AuditLog
      await prisma.orderAuditLog.create({
        data: {
          orderId: order.id,
          actorName: 'ShipMate Logistics',
          action: 'SHIPMATE_WEBHOOK_STATUS_UPDATE',
          details: `Webhook received with status: ${newShipmateStatus}. ${description || ''}`,
        },
      }).catch(() => {});

      return res.json({
        success: true,
        message: 'Webhook processed successfully.',
        orderId: order.id,
        newStatus: newShipmateStatus,
      });
    } catch (err) {
      console.error('[ShipMate Webhook Error]', err);
      next(err);
    }
  },
};
