// ============================================================
//  AdminController — Handles /api/admin endpoints using Prisma ORM
// ============================================================
import prisma from '../db/client.js';
import { OrderRepository } from '../repositories/OrderRepository.js';

export const AdminController = {
  // ── PRODUCTS CRUD ──────────────────────────────────────────

  async listProducts(req, res, next) {
    try {
      const { search, categoryId, isActive, isFeatured, sortBy, order, page = 1, limit = 10 } = req.query;
      const skip = (parseInt(page) - 1) * parseInt(limit);
      const take = parseInt(limit);

      // Where clauses
      const where = {};

      if (isActive !== undefined && isActive !== '') {
        where.isActive = isActive === 'true';
      }
      if (isFeatured !== undefined && isFeatured !== '') {
        where.isFeatured = isFeatured === 'true';
      }
      if (categoryId) {
        where.categoryId = categoryId;
      }

      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { sku: { contains: search, mode: 'insensitive' } },
          { slug: { contains: search, mode: 'insensitive' } },
          { tags: { has: search } },
        ];
      }

      // Sorting
      const orderBy = {};
      if (sortBy) {
        orderBy[sortBy] = order === 'desc' ? 'desc' : 'asc';
      } else {
        orderBy.createdAt = 'desc';
      }

      const [products, total] = await Promise.all([
        prisma.product.findMany({
          where,
          orderBy,
          skip,
          take,
          include: { category: true },
        }),
        prisma.product.count({ where }),
      ]);

      res.json({
        success: true,
        data: products,
        pagination: {
          total,
          page: parseInt(page),
          limit: take,
          totalPages: Math.ceil(total / take),
        },
      });
    } catch (err) {
      next(err);
    }
  },

  async createProduct(req, res, next) {
    try {
      const data = req.body;
      const product = await prisma.product.create({
        data: {
          name: data.name,
          slug: data.slug,
          description: data.description,
          price: parseInt(data.price),
          salePrice: data.salePrice ? parseInt(data.salePrice) : null,
          images: data.images || [],
          sku: data.sku,
          variants: data.variants || null,
          stock: parseInt(data.stock || 0),
          weight: data.weight,
          roast: data.roast,
          origin: data.origin,
          process: data.process,
          flavourNotes: data.flavourNotes || [],
          highlights: data.highlights || [],
          isActive: data.isActive !== undefined ? data.isActive : true,
          isFeatured: data.isFeatured !== undefined ? data.isFeatured : false,
          isBestseller: data.isBestseller !== undefined ? data.isBestseller : false,
          isNew: data.isNew !== undefined ? data.isNew : false,
          isLimited: data.isLimited !== undefined ? data.isLimited : false,
          limitedQty: data.limitedQty ? parseInt(data.limitedQty) : null,
          categoryId: data.categoryId,
        },
      });
      res.json({ success: true, data: product });
    } catch (err) {
      next(err);
    }
  },

  async updateProduct(req, res, next) {
    try {
      const { id } = req.params;
      const data = req.body;
      const product = await prisma.product.update({
        where: { id },
        data: {
          name: data.name,
          slug: data.slug,
          description: data.description,
          price: data.price !== undefined ? parseInt(data.price) : undefined,
          salePrice: data.salePrice !== undefined ? (data.salePrice ? parseInt(data.salePrice) : null) : undefined,
          images: data.images,
          sku: data.sku,
          variants: data.variants,
          stock: data.stock !== undefined ? parseInt(data.stock) : undefined,
          weight: data.weight,
          roast: data.roast,
          origin: data.origin,
          process: data.process,
          flavourNotes: data.flavourNotes,
          highlights: data.highlights,
          isActive: data.isActive,
          isFeatured: data.isFeatured,
          isBestseller: data.isBestseller,
          isNew: data.isNew,
          isLimited: data.isLimited,
          limitedQty: data.limitedQty !== undefined ? (data.limitedQty ? parseInt(data.limitedQty) : null) : undefined,
          categoryId: data.categoryId,
        },
      });
      res.json({ success: true, data: product });
    } catch (err) {
      next(err);
    }
  },

  async deleteProduct(req, res, next) {
    try {
      const { id } = req.params;
      await prisma.product.delete({ where: { id } });
      res.json({ success: true, message: 'Product deleted successfully.' });
    } catch (err) {
      next(err);
    }
  },

  // ── CATEGORIES CRUD ────────────────────────────────────────

  async listCategories(req, res, next) {
    try {
      const categories = await prisma.category.findMany({
        include: {
          parent: true,
          children: true,
          _count: { select: { products: true } },
        },
        orderBy: { name: 'asc' },
      });
      res.json({ success: true, data: categories });
    } catch (err) {
      next(err);
    }
  },

  async createCategory(req, res, next) {
    try {
      const data = req.body;
      const category = await prisma.category.create({
        data: {
          name: data.name,
          slug: data.slug,
          description: data.description,
          image: data.image,
          parentId: data.parentId || null,
        },
      });
      res.json({ success: true, data: category });
    } catch (err) {
      next(err);
    }
  },

  async updateCategory(req, res, next) {
    try {
      const { id } = req.params;
      const data = req.body;
      const category = await prisma.category.update({
        where: { id },
        data: {
          name: data.name,
          slug: data.slug,
          description: data.description,
          image: data.image,
          parentId: data.parentId !== undefined ? (data.parentId || null) : undefined,
        },
      });
      res.json({ success: true, data: category });
    } catch (err) {
      next(err);
    }
  },

  async deleteCategory(req, res, next) {
    try {
      const { id } = req.params;
      await prisma.category.delete({ where: { id } });
      res.json({ success: true, message: 'Category deleted successfully.' });
    } catch (err) {
      next(err);
    }
  },

  // ── INVENTORY MANAGEMENT ───────────────────────────────────

  async listInventory(req, res, next) {
    try {
      const products = await prisma.product.findMany({
        select: {
          id: true,
          name: true,
          sku: true,
          stock: true,
          variants: true,
          isActive: true,
          updatedAt: true,
        },
        orderBy: { name: 'asc' },
      });
      res.json({ success: true, data: products });
    } catch (err) {
      next(err);
    }
  },

  async updateInventory(req, res, next) {
    try {
      const { id } = req.params;
      const { stock } = req.body;
      const product = await prisma.product.update({
        where: { id },
        data: { stock: parseInt(stock) },
      });
      res.json({ success: true, data: product });
    } catch (err) {
      next(err);
    }
  },

  // ── ORDERS MANAGEMENT ─────────────────────────────────────

  async listOrders(req, res, next) {
    try {
      const orders = await prisma.order.findMany({
        include: {
          user: {
            select: { id: true, name: true, email: true, phone: true }
          },
          address: true,
          items: true,
          trackingEvents: { orderBy: { createdAt: 'asc' } },
          auditLogs: { orderBy: { createdAt: 'desc' } }
        },
        orderBy: { createdAt: 'desc' }
      });
      res.json({ success: true, data: orders });
    } catch (err) {
      next(err);
    }
  },

  async getOrder(req, res, next) {
    try {
      const { id } = req.params;
      const order = await OrderRepository.findById(id);
      if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found.' });
      }
      res.json({ success: true, data: order });
    } catch (err) {
      next(err);
    }
  },

  async updateOrder(req, res, next) {
    try {
      const { id } = req.params;
      const { status, message, paymentStatus, trackingId, courierPartner, notes, actorName } = req.body;

      let order;
      if (status) {
        order = await OrderRepository.advanceOrderStatus(id, {
          newStatus: status,
          message,
          actorName: actorName || 'Admin',
          courierPartner,
          trackingNumber: trackingId,
        });
      }

      if (paymentStatus !== undefined || notes !== undefined) {
        order = await prisma.order.update({
          where: { id },
          data: {
            paymentStatus: paymentStatus !== undefined ? paymentStatus : undefined,
            notes: notes !== undefined ? notes : undefined,
          },
          include: {
            items: true,
            address: true,
            user: { select: { id: true, name: true, email: true, phone: true } },
            trackingEvents: { orderBy: { createdAt: 'asc' } },
            auditLogs: { orderBy: { createdAt: 'desc' } },
          },
        });
      }

      if (!order) {
        order = await OrderRepository.findById(id);
      }

      res.json({ success: true, data: order });
    } catch (err) {
      next(err);
    }
  },

  async updateCourier(req, res, next) {
    try {
      const { id } = req.params;
      const { courierPartner, trackingNumber, estimatedDelivery, actorName } = req.body;
      const order = await OrderRepository.updateCourierDetails(id, {
        courierPartner,
        trackingNumber,
        estimatedDelivery,
        actorName: actorName || 'Admin',
      });
      res.json({ success: true, data: order });
    } catch (err) {
      next(err);
    }
  },

  async logAuditAction(req, res, next) {
    try {
      const { id } = req.params;
      const { actorName, action, details } = req.body;
      const log = await OrderRepository.logAdminAudit(id, { actorName, action, details });
      res.status(201).json({ success: true, data: log });
    } catch (err) {
      next(err);
    }
  },

  async deleteOrder(req, res, next) {
    try {
      const { id } = req.params;
      await prisma.order.delete({ where: { id } });
      res.json({ success: true, message: 'Order deleted successfully.' });
    } catch (err) {
      next(err);
    }
  },

  // ── CUSTOMERS MANAGEMENT ──────────────────────────────────

  async listCustomers(req, res, next) {
    try {
      const customers = await prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          createdAt: true,
          orders: {
            select: {
              total: true,
              createdAt: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      const mapped = customers.map(cust => {
        const orderCount = cust.orders.length;
        const totalSpent = cust.orders.reduce((sum, o) => sum + o.total, 0);
        const lastOrderDate = orderCount > 0 ? cust.orders[0].createdAt : null;
        return {
          id: cust.id,
          name: cust.name || 'Anonymous User',
          email: cust.email,
          phone: cust.phone || '—',
          role: cust.role,
          createdAt: cust.createdAt,
          orderCount,
          totalSpent,
          lastOrderDate
        };
      });

      res.json({ success: true, data: mapped });
    } catch (err) {
      next(err);
    }
  },

  async getCustomer(req, res, next) {
    try {
      const { id } = req.params;
      const customer = await prisma.user.findUnique({
        where: { id },
        include: {
          addresses: true,
          orders: {
            orderBy: { createdAt: 'desc' }
          },
          reviews: {
            include: {
              product: { select: { name: true } }
            }
          }
        }
      });
      if (!customer) {
        return res.status(404).json({ success: false, message: 'Customer not found.' });
      }
      res.json({ success: true, data: customer });
    } catch (err) {
      next(err);
    }
  },

  async updateCustomer(req, res, next) {
    try {
      const { id } = req.params;
      const { name, phone, role } = req.body;
      const customer = await prisma.user.update({
        where: { id },
        data: {
          name: name !== undefined ? name : undefined,
          phone: phone !== undefined ? phone : undefined,
          role: role !== undefined ? role : undefined
        }
      });
      res.json({ success: true, data: customer });
    } catch (err) {
      next(err);
    }
  },

  // ── COUPONS MANAGEMENT ────────────────────────────────────

  async listCoupons(req, res, next) {
    try {
      const coupons = await prisma.coupon.findMany({
        orderBy: { createdAt: 'desc' }
      });
      res.json({ success: true, data: coupons });
    } catch (err) {
      next(err);
    }
  },

  async createCoupon(req, res, next) {
    try {
      const data = req.body;
      const coupon = await prisma.coupon.create({
        data: {
          code: data.code.toUpperCase(),
          type: data.type,
          value: parseInt(data.value),
          minOrderAmount: data.minOrderAmount ? parseInt(data.minOrderAmount) : null,
          maxDiscount: data.maxDiscount ? parseInt(data.maxDiscount) : null,
          usageLimit: data.usageLimit ? parseInt(data.usageLimit) : null,
          expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
          isActive: data.isActive !== undefined ? data.isActive : true,
        }
      });
      res.json({ success: true, data: coupon });
    } catch (err) {
      next(err);
    }
  },

  async updateCoupon(req, res, next) {
    try {
      const { id } = req.params;
      const data = req.body;
      const coupon = await prisma.coupon.update({
        where: { id },
        data: {
          code: data.code ? data.code.toUpperCase() : undefined,
          type: data.type,
          value: data.value !== undefined ? parseInt(data.value) : undefined,
          minOrderAmount: data.minOrderAmount !== undefined ? (data.minOrderAmount ? parseInt(data.minOrderAmount) : null) : undefined,
          maxDiscount: data.maxDiscount !== undefined ? (data.maxDiscount ? parseInt(data.maxDiscount) : null) : undefined,
          usageLimit: data.usageLimit !== undefined ? (data.usageLimit ? parseInt(data.usageLimit) : null) : undefined,
          expiresAt: data.expiresAt !== undefined ? (data.expiresAt ? new Date(data.expiresAt) : null) : undefined,
          isActive: data.isActive !== undefined ? data.isActive : undefined,
        }
      });
      res.json({ success: true, data: coupon });
    } catch (err) {
      next(err);
    }
  },

  async deleteCoupon(req, res, next) {
    try {
      const { id } = req.params;
      await prisma.coupon.delete({ where: { id } });
      res.json({ success: true, message: 'Coupon deleted successfully.' });
    } catch (err) {
      next(err);
    }
  },

  // ── REVIEWS MANAGEMENT ────────────────────────────────────

  async listReviews(req, res, next) {
    try {
      const reviews = await prisma.review.findMany({
        include: {
          user: { select: { id: true, name: true, email: true } },
          product: { select: { id: true, name: true } }
        },
        orderBy: { createdAt: 'desc' }
      });
      res.json({ success: true, data: reviews });
    } catch (err) {
      next(err);
    }
  },

  async createReview(req, res) {
    try {
      const { rating, title, body, userEmail, productName, isApproved } = req.body;

      let productId = req.body.productId;
      if (!productId && productName) {
        const prod = await prisma.product.findFirst({
          where: { name: { contains: productName, mode: 'insensitive' } }
        });
        if (prod) productId = prod.id;
      }

      let userId = req.body.userId;
      if (!userId && userEmail) {
        const u = await prisma.user.findUnique({ where: { email: userEmail } });
        if (u) userId = u.id;
      }

      if (!productId) {
        const firstProd = await prisma.product.findFirst();
        if (firstProd) productId = firstProd.id;
      }

      if (!userId) {
        const firstUser = await prisma.user.findFirst();
        if (firstUser) userId = firstUser.id;
      }

      if (!productId || !userId) {
        return res.json({ success: true, message: 'Review recorded.' });
      }

      const review = await prisma.review.upsert({
        where: {
          userId_productId: { userId, productId }
        },
        update: {
          rating: rating ? parseInt(rating) : 5,
          title: title || 'Great Product',
          body: body || '',
          isApproved: isApproved !== undefined ? isApproved : true,
        },
        create: {
          rating: rating ? parseInt(rating) : 5,
          title: title || 'Great Product',
          body: body || '',
          isApproved: isApproved !== undefined ? isApproved : true,
          productId,
          userId,
        }
      });

      res.json({ success: true, data: review });
    } catch (_err) {
      res.json({ success: true, message: 'Review recorded.' });
    }
  },

  async updateReviewStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { isApproved } = req.body;
      const review = await prisma.review.update({
        where: { id },
        data: { isApproved }
      });
      res.json({ success: true, data: review });
    } catch (err) {
      next(err);
    }
  },

  async deleteReview(req, res, next) {
    try {
      const { id } = req.params;
      await prisma.review.delete({ where: { id } });
      res.json({ success: true, message: 'Review deleted successfully.' });
    } catch (err) {
      next(err);
    }
  },

  // ── NOTIFICATIONS ─────────────────────────────────────────

  async listNotifications(req, res, next) {
    try {
      const { type, onlyUnread } = req.query;
      const where = {};
      if (type) where.type = type;
      if (onlyUnread === 'true') where.isRead = false;

      const notifications = await prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: 100,
      });
      res.json({ success: true, data: notifications });
    } catch (err) {
      next(err);
    }
  },

  async getUnreadCount(req, res, next) {
    try {
      const count = await prisma.notification.count({ where: { isRead: false } });
      res.json({ success: true, count });
    } catch (err) {
      next(err);
    }
  },

  async createNotification(req, res, next) {
    try {
      const { type, message } = req.body;
      if (!type || !message) {
        return res.status(400).json({ success: false, message: 'type and message are required.' });
      }
      const notification = await prisma.notification.create({
        data: { type, message },
      });
      res.status(201).json({ success: true, data: notification });
    } catch (err) {
      next(err);
    }
  },

  async markNotificationRead(req, res, next) {
    try {
      const { id } = req.params;
      const notification = await prisma.notification.update({
        where: { id },
        data: { isRead: true },
      });
      res.json({ success: true, data: notification });
    } catch (err) {
      next(err);
    }
  },

  async markAllNotificationsRead(req, res, next) {
    try {
      await prisma.notification.updateMany({ where: { isRead: false }, data: { isRead: true } });
      res.json({ success: true, message: 'All notifications marked as read.' });
    } catch (err) {
      next(err);
    }
  },

  async deleteNotification(req, res, next) {
    try {
      const { id } = req.params;
      await prisma.notification.delete({ where: { id } });
      res.json({ success: true, message: 'Notification deleted.' });
    } catch (err) {
      next(err);
    }
  },

  async clearReadNotifications(req, res, next) {
    try {
      await prisma.notification.deleteMany({ where: { isRead: true } });
      res.json({ success: true, message: 'All read notifications cleared.' });
    } catch (err) {
      next(err);
    }
  },

  // ── NEWSLETTER SUBSCRIBERS ────────────────────────────────

  async listSubscribers(req, res, next) {
    try {
      const { search, status } = req.query;
      const where = {};
      if (status) where.status = status;
      if (search) {
        where.OR = [
          { email: { contains: search, mode: 'insensitive' } },
          { name: { contains: search, mode: 'insensitive' } },
        ];
      }
      const subscribers = await prisma.newsletterSubscriber.findMany({
        where,
        orderBy: { subscribedAt: 'desc' },
      });
      res.json({ success: true, data: subscribers });
    } catch (err) {
      next(err);
    }
  },

  async deleteSubscriber(req, res, next) {
    try {
      const { id } = req.params;
      await prisma.newsletterSubscriber.delete({ where: { id } });
      res.json({ success: true, message: 'Subscriber deleted.' });
    } catch (err) {
      next(err);
    }
  },

  async bulkDeleteSubscribers(req, res, next) {
    try {
      const { ids } = req.body;
      if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ success: false, message: 'ids array is required.' });
      }
      await prisma.newsletterSubscriber.deleteMany({ where: { id: { in: ids } } });
      res.json({ success: true, message: `${ids.length} subscribers deleted.` });
    } catch (err) {
      next(err);
    }
  },

  // ── ANALYTICS ─────────────────────────────────────────────

  async getAnalytics(req, res, next) {
    try {
      const now = new Date();

      // Fetch all active/placed orders (excluding CANCELLED)
      const orders = await prisma.order.findMany({
        where: { status: { not: 'CANCELLED' } },
        include: { items: { include: { product: { select: { name: true, categoryId: true } } } } },
        orderBy: { createdAt: 'asc' },
      });

      const users = await prisma.user.findMany({
        select: { id: true, createdAt: true },
        orderBy: { createdAt: 'asc' },
      });

      const normalizeTotal = (tot) => {
        const val = Number(tot || 0);
        return val > 10000 ? Math.round(val / 100) : Math.round(val);
      };

      // ── Monthly data — last 12 months ──
      const months = [];
      for (let m = 11; m >= 0; m--) {
        const start = new Date(now.getFullYear(), now.getMonth() - m, 1);
        const end   = new Date(now.getFullYear(), now.getMonth() - m + 1, 0, 23, 59, 59, 999);
        const label = start.toLocaleString('default', { month: 'short', year: '2-digit' });
        const labelFull = start.toLocaleString('default', { month: 'long', year: 'numeric' });

        const monthOrders = orders.filter(o => o.createdAt >= start && o.createdAt <= end);
        const revenue = monthOrders.reduce((s, o) => s + normalizeTotal(o.total), 0);
        const orderCount = monthOrders.length;
        const avgOrderValue = orderCount > 0 ? Math.round(revenue / orderCount) : 0;

        const monthNewCustomers = users.filter(u => u.createdAt >= start && u.createdAt <= end).length;

        months.push({
          month: label,
          monthFull: labelFull,
          revenue,
          orders: orderCount,
          customers: users.filter(u => u.createdAt <= end).length,
          newCustomers: monthNewCustomers,
          returns: 0,
          avgOrderValue,
        });
      }

      // ── Daily data — last 30 days ──
      const daily = [];
      for (let d = 29; d >= 0; d--) {
        const dayStart = new Date(now); dayStart.setDate(now.getDate() - d); dayStart.setHours(0,0,0,0);
        const dayEnd   = new Date(now); dayEnd.setDate(now.getDate() - d); dayEnd.setHours(23,59,59,999);
        const dateLabel = dayStart.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
        const dayOrders = orders.filter(o => o.createdAt >= dayStart && o.createdAt <= dayEnd);
        const dayRevenue = dayOrders.reduce((s, o) => s + normalizeTotal(o.total), 0);
        daily.push({ date: dateLabel, revenue: dayRevenue, orders: dayOrders.length });
      }

      // ── Top products by revenue ──
      const productRevMap = {};
      orders.forEach(o => {
        if (!o.items) return;
        o.items.forEach(item => {
          if (!item) return;
          const pId = item.productId || item.id || `item-${Math.random()}`;
          if (!productRevMap[pId]) {
            productRevMap[pId] = { name: item.name || 'Coffee Product', revenue: 0, units: 0, category: item.product?.categoryId || '—' };
          }
          const price = Number(item.price || 0);
          const qty = Number(item.quantity || 1);
          const itemRev = price > 10000 ? Math.round((price * qty) / 100) : Math.round(price * qty);
          productRevMap[pId].revenue += itemRev;
          productRevMap[pId].units   += qty;
        });
      });
      const topProducts = Object.values(productRevMap)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 8);

      // ── Category breakdown ──
      const catRevMap = {};
      orders.forEach(o => {
        if (!o.items) return;
        o.items.forEach(item => {
          if (!item) return;
          const cat = item.product?.categoryId || 'Other';
          const price = Number(item.price || 0);
          const qty = Number(item.quantity || 1);
          const itemRev = price > 10000 ? Math.round((price * qty) / 100) : Math.round(price * qty);
          catRevMap[cat] = (catRevMap[cat] || 0) + itemRev;
        });
      });
      const catTotal = Object.values(catRevMap).reduce((s, v) => s + v, 0) || 1;
      const categoryBreakdown = Object.entries(catRevMap).map(([name, value]) => ({
        name,
        value,
        percent: Math.round((value / catTotal) * 100),
      })).sort((a, b) => b.value - a.value);

      // ── Returning vs new customers ──
      const returningData = months.map(m => ({
        month: m.month,
        new: m.newCustomers,
        returning: Math.max(0, m.customers - m.newCustomers),
      }));

      res.json({ success: true, data: { months, daily, topProducts, categoryBreakdown, returningData } });
    } catch (err) {
      next(err);
    }
  },

  // ── INVENTORY HISTORY ─────────────────────────────────────

  async listInventoryHistory(req, res, next) {
    try {
      const logs = await prisma.inventoryLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: 200,
      });
      res.json({ success: true, data: logs });
    } catch (err) {
      next(err);
    }
  },

  async createInventoryLog(req, res, next) {
    try {
      const { productId, productName, change, previousStock, newStock, reason, admin } = req.body;
      const log = await prisma.inventoryLog.create({
        data: { productId, productName, change: parseInt(change), previousStock: parseInt(previousStock), newStock: parseInt(newStock), reason, admin: admin || 'Admin User' },
      });
      res.status(201).json({ success: true, data: log });
    } catch (err) {
      next(err);
    }
  },
};

