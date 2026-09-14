// ============================================================
//  OrderRepository — Data access layer for Orders, Items,
//  TrackingEvents & OrderAuditLogs
// ============================================================
import prisma from '../db/client.js';

export const ORDER_STAGES = [
  'PLACED',
  'PACKED',
  'ROASTED',
  'DISPATCHED',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
];

export const STAGE_TRANSITIONS = {
  PLACED: 'PACKED',
  PENDING: 'PACKED',
  CONFIRMED: 'PACKED',
  PACKED: 'ROASTED',
  PROCESSING: 'ROASTED',
  ROASTED: 'DISPATCHED',
  DISPATCHED: 'OUT_FOR_DELIVERY',
  SHIPPED: 'OUT_FOR_DELIVERY',
  OUT_FOR_DELIVERY: 'DELIVERED',
};

export const DEFAULT_STAGE_MESSAGES = {
  PLACED: 'Order placed successfully and queued for fulfillment.',
  PACKED: 'Beans carefully packed using protective packaging.',
  ROASTED: 'Freshly roasted today for maximum freshness and aroma.',
  DISPATCHED: 'Dispatched from warehouse and handed over to shipping courier.',
  OUT_FOR_DELIVERY: 'Out for delivery! Your fresh coffee is arriving today.',
  DELIVERED: 'Package delivered successfully. Enjoy your coffee!',
  CANCELLED: 'Order has been cancelled.',
};

export const OrderRepository = {
  /**
   * Create an order with its items in a single transaction.
   * Decrements product stock atomically & creates initial TrackingEvent + OrderAuditLog.
   */
  async createOrder(orderData, items) {
    return prisma.$transaction(
      async (tx) => {
        // 1. Calculate estimated delivery date (3 days from now by default)
        const estimatedDelivery = new Date();
        estimatedDelivery.setDate(estimatedDelivery.getDate() + 3);

        // 2. Create the order
        const order = await tx.order.create({
          data: {
            ...orderData,
            status: 'PLACED',
            estimatedDelivery,
            items: {
              create: items.map((item) => ({
                productId: item.productId,
                name: item.name,
                image: item.image,
                price: item.price,
                quantity: item.quantity,
                variant: item.variant ?? null,
              })),
            },
          },
          include: {
            items: true,
            address: true,
            user: { select: { name: true, email: true } },
            trackingEvents: true,
            auditLogs: true,
          },
        });

        // 3. Decrement stock for each product
        await Promise.all(
          items.map(async (item) => {
            try {
              await tx.product.update({
                where: { id: item.productId },
                data: { stock: { decrement: item.quantity } },
              });
            } catch (_e) {
              // Ignore stock decrement if product is un-tracked or fallback product
            }
          })
        );

        // 4. Create payment record
        await tx.payment.create({
          data: {
            orderId: order.id,
            method: orderData.paymentMethod,
            status: 'PENDING',
            amount: orderData.total,
            currency: 'INR',
          },
        });

        // 5. Initial Tracking Event
        await tx.trackingEvent.create({
          data: {
            orderId: order.id,
            status: 'PLACED',
            message: DEFAULT_STAGE_MESSAGES.PLACED,
            updatedBy: 'System',
          },
        });

        // 6. Initial Audit Log
        await tx.orderAuditLog.create({
          data: {
            orderId: order.id,
            actorName: order.user?.name || 'Customer',
            action: 'ORDER_PLACED',
            toStatus: 'PLACED',
            details: 'Order placed by customer.',
          },
        });

        return order;
      },
      { maxWait: 20000, timeout: 30000 }
    );
  },

  /**
   * Find a single order by ID (with all relations including trackingEvents & auditLogs)
   */
  async findById(id) {
    if (!id) return null;
    const cleanId = id.trim().replace('#', '');

    const includeRelations = {
      items: {
        include: {
          product: { select: { slug: true, images: true } },
        },
      },
      address: true,
      coupon: true,
      payment: true,
      user: { select: { id: true, name: true, email: true, phone: true } },
      trackingEvents: {
        orderBy: { createdAt: 'asc' },
      },
      auditLogs: {
        orderBy: { createdAt: 'desc' },
      },
    };

    // 1. First try exact unique match
    let order = await prisma.order.findUnique({
      where: { id: cleanId },
      include: includeRelations,
    });

    // 2. If not found, try case-insensitive match
    if (!order) {
      order = await prisma.order.findFirst({
        where: { id: { equals: cleanId, mode: 'insensitive' } },
        include: includeRelations,
      });
    }

    return order;
  },

  /**
   * Get all orders for a user (most recent first)
   */
  async getOrdersByUserId(userId, { page = 1, limit = 10 } = {}) {
    const skip = (page - 1) * limit;

    const [items, total] = await prisma.$transaction([
      prisma.order.findMany({
        where: { userId },
        include: {
          items: { select: { id: true, name: true, image: true, quantity: true, price: true } },
          address: { select: { city: true, state: true } },
          payment: { select: { status: true, method: true } },
          trackingEvents: { orderBy: { createdAt: 'asc' } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.order.count({ where: { userId } }),
    ]);

    return { items, total, page, totalPages: Math.ceil(total / limit) };
  },

  /**
   * Advance order status using strict stage transition validation.
   */
  async advanceOrderStatus(id, { newStatus, message, actorName, courierPartner, trackingNumber }) {
    const currentOrder = await prisma.order.findUnique({
      where: { id },
      include: { trackingEvents: true },
    });

    if (!currentOrder) {
      throw Object.assign(new Error('Order not found.'), { status: 404 });
    }

    const currentStatus = currentOrder.status;

    // Validate Status Transition
    if (newStatus !== 'CANCELLED') {
      const expectedNext = STAGE_TRANSITIONS[currentStatus];
      if (expectedNext !== newStatus && currentStatus !== newStatus) {
        throw Object.assign(
          new Error(`Invalid status transition from ${currentStatus} to ${newStatus}. Next stage must be ${expectedNext || 'terminal'}.`),
          { status: 400 }
        );
      }
    }

    const finalMessage = message?.trim() || DEFAULT_STAGE_MESSAGES[newStatus] || `Status updated to ${newStatus}`;
    const actor = actorName || 'Admin';

    return prisma.$transaction(
      async (tx) => {
        // 1. Update Order record
        await tx.order.update({
          where: { id },
          data: {
            status: newStatus,
            courierPartner: courierPartner !== undefined ? courierPartner : currentOrder.courierPartner,
            trackingId: trackingNumber !== undefined ? trackingNumber : currentOrder.trackingId,
          },
        });

        // 2. Create Tracking Event
        await tx.trackingEvent.create({
          data: {
            orderId: id,
            status: newStatus,
            message: finalMessage,
            updatedBy: actor,
            courierPartner: courierPartner || currentOrder.courierPartner || null,
            trackingNumber: trackingNumber || currentOrder.trackingId || null,
          },
        });

        // 3. Create Audit Log
        await tx.orderAuditLog.create({
          data: {
            orderId: id,
            actorName: actor,
            action: newStatus === 'CANCELLED' ? 'ORDER_CANCELLED' : 'STATUS_ADVANCED',
            fromStatus: currentStatus,
            toStatus: newStatus,
            details: `Moved order from ${currentStatus} → ${newStatus}. Note: "${finalMessage}"`,
          },
        });

        return tx.order.findUnique({
          where: { id },
          include: {
            items: true,
            address: true,
            user: { select: { id: true, name: true, email: true, phone: true } },
            trackingEvents: { orderBy: { createdAt: 'asc' } },
            auditLogs: { orderBy: { createdAt: 'desc' } },
          },
        });
      },
      { maxWait: 20000, timeout: 30000 }
    );
  },

  /**
   * Log an arbitrary administrative audit action (e.g., printed invoice, contacted customer)
   */
  async logAdminAudit(orderId, { actorName, action, details }) {
    return prisma.orderAuditLog.create({
      data: {
        orderId,
        actorName: actorName || 'Admin',
        action,
        details,
      },
    });
  },

  /**
   * Update courier & shipping information (Shiprocket, Delhivery, Blue Dart)
   */
  async updateCourierDetails(id, { courierPartner, trackingNumber, estimatedDelivery, actorName }) {
    const currentOrder = await prisma.order.findUnique({ where: { id } });
    if (!currentOrder) throw Object.assign(new Error('Order not found.'), { status: 404 });

    const actor = actorName || 'Admin';

    return prisma.$transaction(
      async (tx) => {
        const updated = await tx.order.update({
          where: { id },
          data: {
            courierPartner,
            trackingId: trackingNumber,
            estimatedDelivery: estimatedDelivery ? new Date(estimatedDelivery) : undefined,
          },
        });

        await tx.orderAuditLog.create({
          data: {
            orderId: id,
            actorName: actor,
            action: 'COURIER_DETAILS_UPDATED',
            fromStatus: currentOrder.status,
            toStatus: currentOrder.status,
            details: `Courier updated to ${courierPartner} (Tracking / AWB: ${trackingNumber})`,
          },
        });

        return updated;
      },
      { maxWait: 20000, timeout: 30000 }
    );
  },

  /**
   * Update payment status and gateway IDs
   */
  async updatePayment(orderId, { status, razorpayOrderId, razorpayPaymentId, stripeSessionId }) {
    return prisma.$transaction([
      prisma.payment.update({
        where: { orderId },
        data: { status, razorpayOrderId, razorpayPaymentId, stripeSessionId },
      }),
      prisma.order.update({
        where: { id: orderId },
        data: { paymentStatus: status },
      }),
    ]);
  },

  /**
   * Legacy simple status update method
   */
  async updateOrderStatus(id, status) {
    return prisma.order.update({ where: { id }, data: { status } });
  },
};
