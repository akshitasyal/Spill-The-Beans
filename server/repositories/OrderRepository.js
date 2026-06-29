// ============================================================
//  OrderRepository — Data access layer for Orders & OrderItems
// ============================================================
import prisma from '../db/client.js';

export const OrderRepository = {
  /**
   * Create an order with its items in a single transaction.
   * Also decrements product stock atomically.
   *
   * @param {object} orderData - Order fields
   * @param {Array}  items     - Array of { productId, name, image, price, quantity, variant }
   */
  async createOrder(orderData, items) {
    return prisma.$transaction(async (tx) => {
      // 1. Create the order
      const order = await tx.order.create({
        data: {
          ...orderData,
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
        },
      });

      // 2. Decrement stock for each product
      await Promise.all(
        items.map((item) =>
          tx.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity } },
          })
        )
      );

      // 3. Create payment record
      await tx.payment.create({
        data: {
          orderId: order.id,
          method: orderData.paymentMethod,
          status: 'PENDING',
          amount: orderData.total,
          currency: 'INR',
        },
      });

      return order;
    });
  },

  /**
   * Find a single order by ID (with all relations)
   */
  async findById(id) {
    return prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: { select: { slug: true, images: true } },
          },
        },
        address: true,
        coupon: true,
        payment: true,
        user: { select: { name: true, email: true, phone: true } },
      },
    });
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
   * Update order status (CONFIRMED, SHIPPED, DELIVERED, etc.)
   */
  async updateOrderStatus(id, status) {
    return prisma.order.update({ where: { id }, data: { status } });
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
   * Update tracking ID (once shipped)
   */
  async updateTracking(id, trackingId) {
    return prisma.order.update({
      where: { id },
      data: { trackingId, status: 'SHIPPED' },
    });
  },
};
