// ============================================================
//  OrderController — Handles /api/orders endpoints
// ============================================================
import { OrderRepository } from '../repositories/OrderRepository.js';
import { CartRepository } from '../repositories/CartRepository.js';
import { CouponRepository } from '../repositories/CouponRepository.js';
import { UserRepository } from '../repositories/UserRepository.js';
import { ProductRepository } from '../repositories/ProductRepository.js';

async function resolveUserId(clerkId) {
  const user = await UserRepository.findByClerkId(clerkId);
  if (!user) throw Object.assign(new Error('User not found.'), { status: 404 });
  return user.id;
}

export const OrderController = {
  /**
   * POST /api/orders
   * Place an order from the current cart
   */
  async placeOrder(req, res, next) {
    try {
      const clerkId = req.headers['x-clerk-id'];
      if (!clerkId) return res.status(401).json({ success: false, message: 'Unauthorized.' });

      const userId = await resolveUserId(clerkId);
      const { addressId, paymentMethod, couponCode, notes } = req.body;

      // 1. Get cart
      const cart = await CartRepository.getOrCreateCart(userId);
      if (!cart.items || cart.items.length === 0) {
        return res.status(400).json({ success: false, message: 'Cart is empty.' });
      }

      // 2. Validate stock and build order items
      const orderItems = [];
      let subtotal = 0;

      for (const item of cart.items) {
        const product = item.product;
        if (!product.isActive) {
          return res.status(400).json({
            success: false,
            message: `"${product.name}" is no longer available.`,
          });
        }
        if (product.stock < item.quantity) {
          return res.status(400).json({
            success: false,
            message: `Insufficient stock for "${product.name}". Only ${product.stock} left.`,
          });
        }

        const effectivePrice = product.salePrice ?? product.price;
        subtotal += effectivePrice * item.quantity;

        orderItems.push({
          productId: product.id,
          name: product.name,
          image: product.images?.[0] ?? '',
          price: effectivePrice,
          quantity: item.quantity,
          variant: item.variant,
        });
      }

      // 3. Apply coupon if provided
      let discount = 0;
      let couponId = null;
      let isFreeShipping = false;

      if (couponCode) {
        const validation = await CouponRepository.validateCoupon(couponCode, subtotal, userId);
        if (!validation.valid) {
          return res.status(400).json({ success: false, message: validation.error });
        }
        discount = validation.discount;
        couponId = validation.coupon.id;
        isFreeShipping = validation.coupon.type === 'FREE_SHIPPING';
      }

      // 4. Calculate shipping
      const shippingFee = isFreeShipping || subtotal >= 59900 ? 0 : 9900; // Free above ₹599

      // 5. Total
      const total = subtotal - discount + shippingFee;

      // 6. Create order (includes stock decrement + payment record in transaction)
      const order = await OrderRepository.createOrder(
        {
          userId,
          addressId,
          paymentMethod,
          paymentStatus: paymentMethod === 'COD' ? 'PENDING' : 'PENDING',
          couponId,
          subtotal,
          discount,
          shippingFee,
          total,
          notes,
        },
        orderItems
      );

      // 7. Increment coupon usage
      if (couponId) {
        await CouponRepository.incrementUsage(couponId);
      }

      // 8. Clear the cart
      await CartRepository.clearCart(userId);

      res.status(201).json({
        success: true,
        data: order,
        message: 'Order placed successfully.',
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/orders
   * Get all orders for the authenticated user
   */
  async getUserOrders(req, res, next) {
    try {
      const clerkId = req.headers['x-clerk-id'];
      if (!clerkId) return res.status(401).json({ success: false, message: 'Unauthorized.' });

      const userId = await resolveUserId(clerkId);
      const result = await OrderRepository.getOrdersByUserId(userId, req.query);
      res.json({ success: true, ...result });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/orders/:id
   * Get a single order by ID
   */
  async getOrder(req, res, next) {
    try {
      const clerkId = req.headers['x-clerk-id'];
      if (!clerkId) return res.status(401).json({ success: false, message: 'Unauthorized.' });

      const userId = await resolveUserId(clerkId);
      const order = await OrderRepository.findById(req.params.id);

      if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });
      // Ensure user can only see their own orders
      if (order.userId !== userId) {
        return res.status(403).json({ success: false, message: 'Forbidden.' });
      }

      res.json({ success: true, data: order });
    } catch (err) {
      next(err);
    }
  },

  /**
   * PATCH /api/orders/:id/status  [Admin only - placeholder]
   * Update order status
   */
  async updateStatus(req, res, next) {
    try {
      const order = await OrderRepository.updateOrderStatus(req.params.id, req.body.status);
      res.json({ success: true, data: order });
    } catch (err) {
      next(err);
    }
  },
};
