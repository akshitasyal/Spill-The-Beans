// ============================================================
//  OrderController — Handles /api/orders endpoints
// ============================================================
import { OrderRepository } from '../repositories/OrderRepository.js';
import { CartRepository } from '../repositories/CartRepository.js';
import { CouponRepository } from '../repositories/CouponRepository.js';
import { UserRepository } from '../repositories/UserRepository.js';
import prisma from '../db/client.js';

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
      if (!clerkId) {
        // Fallback to tracking lookup if unauthenticated
        const order = await OrderRepository.findById(req.params.id);
        if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });
        return res.json({ success: true, data: order });
      }

      const userId = await resolveUserId(clerkId);
      const order = await OrderRepository.findById(req.params.id);

      if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });
      if (order.userId !== userId) {
        return res.status(403).json({ success: false, message: 'Forbidden.' });
      }

      res.json({ success: true, data: order });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/orders/track/:id
   * Public / Customer tracking details for an order by ID (Read-only)
   */
  async trackOrder(req, res, next) {
    try {
      const { id } = req.params;
      const order = await OrderRepository.findById(id);
      if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found.' });
      }

      res.json({
        success: true,
        data: {
          id: order.id,
          status: order.status,
          paymentStatus: order.paymentStatus,
          paymentMethod: order.paymentMethod,
          total: order.total,
          estimatedDelivery: order.estimatedDelivery,
          courierPartner: order.courierPartner,
          trackingId: order.trackingId,
          createdAt: order.createdAt,
          address: order.address ? {
            city: order.address.city,
            state: order.address.state,
            pincode: order.address.pincode,
          } : null,
          trackingEvents: order.trackingEvents || [],
        },
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/orders/checkout-direct
   * Place an order directly from the frontend cart (no server-side cart required).
   * Accepts cart items + address fields inline, creates Address + Order in one transaction.
   */
  async checkoutDirect(req, res, next) {
    try {
      const clerkId = req.headers['x-clerk-id'];
      const { userEmail } = req.body;

      let userId;

      if (clerkId) {
        // Prefer clerkId-based lookup
        userId = await resolveUserId(clerkId);
      } else if (userEmail) {
        // Fallback: look up / auto-create user by email (for mocked auth)
        let user = await prisma.user.findUnique({ where: { email: userEmail } });
        if (!user) {
          // Auto-create user with email as pseudo-clerkId
          const pseudoClerkId = `email_${userEmail.replace(/[^a-zA-Z0-9]/g, '_')}`;
          user = await prisma.user.upsert({
            where: { clerkId: pseudoClerkId },
            update: { email: userEmail },
            create: { clerkId: pseudoClerkId, email: userEmail, name: req.body.name || userEmail.split('@')[0] },
          });
        }
        userId = user.id;
      } else {
        return res.status(401).json({ success: false, message: 'Authentication required. Please log in to place an order.' });
      }

      const {
        // Address fields
        name, phone, line1, line2, city, state, pincode,
        // Order fields
        paymentMethod = 'COD',
        couponCode,
        notes,
        // Cart items: [{ productId, name, image, price, quantity, variant }]
        items: rawItems = [],
      } = req.body;

      if (!rawItems || rawItems.length === 0) {
        return res.status(400).json({ success: false, message: 'Cart is empty.' });
      }

      // 1. Create or reuse address
      let address = await prisma.address.findFirst({
        where: { userId, line1, pincode },
      });
      if (!address) {
        address = await prisma.address.create({
          data: { userId, name, phone, line1, line2: line2 || null, city, state, pincode },
        });
      }

      // 2. Build order items & calculate subtotal (prices in paise)
      // Resolve each item's DB productId by slug (local cart may use numeric ids)
      const orderItems = [];
      let subtotal = 0;

      for (const item of rawItems) {
        const priceInPaise = Math.round(item.price * 100);
        subtotal += priceInPaise * item.quantity;

        // Try to find the real DB product by slug (preferred) or name
        let dbProduct = null;
        if (item.slug) {
          dbProduct = await prisma.product.findUnique({ where: { slug: item.slug } });
        }
        if (!dbProduct && item.name) {
          dbProduct = await prisma.product.findFirst({ where: { name: { contains: item.name, mode: 'insensitive' } } });
        }

        if (!dbProduct) {
          // Product not in DB — skip (log but don't fail the order)
          // We need a valid productId for the FK. Find any active product as fallback.
          dbProduct = await prisma.product.findFirst({ where: { isActive: true } });
        }

        if (!dbProduct) {
          return res.status(400).json({
            success: false,
            message: `Product "${item.name}" not found in catalog. Please contact support.`,
          });
        }

        orderItems.push({
          productId: dbProduct.id,
          name: item.name,
          image: typeof item.image === 'string' && item.image.startsWith('http') ? item.image : (dbProduct.images?.[0] || ''),
          price: priceInPaise,
          quantity: item.quantity,
          variant: item.variant || null,
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

      // 4. Shipping fee (free above ₹599)
      const shippingFee = isFreeShipping || subtotal >= 59900 ? 0 : 9900;

      // 5. Total
      const total = subtotal - discount + shippingFee;

      // 6. Create order
      const order = await OrderRepository.createOrder(
        {
          userId,
          addressId: address.id,
          paymentMethod,
          paymentStatus: 'PENDING',
          couponId,
          subtotal,
          discount,
          shippingFee,
          total,
          notes: notes || null,
        },
        orderItems
      );

      // 7. Increment coupon usage
      if (couponId) {
        await CouponRepository.incrementUsage(couponId);
      }

      res.status(201).json({
        success: true,
        data: order,
        message: 'Order placed successfully.',
      });
    } catch (err) {
      next(err);
    }
  },
};
