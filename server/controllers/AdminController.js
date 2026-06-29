// ============================================================
//  AdminController — Handles /api/admin endpoints using Prisma ORM
// ============================================================
import prisma from '../db/client.js';

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
            select: { id: true, name: true, email: true }
          },
          address: true,
          items: true
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
      const order = await prisma.order.findUnique({
        where: { id },
        include: {
          user: true,
          address: true,
          coupon: true,
          items: {
            include: {
              product: true
            }
          }
        }
      });
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
      const { status, paymentStatus, trackingId, notes } = req.body;
      const order = await prisma.order.update({
        where: { id },
        data: {
          status,
          paymentStatus: paymentStatus !== undefined ? paymentStatus : undefined,
          trackingId: trackingId !== undefined ? trackingId : undefined,
          notes: notes !== undefined ? notes : undefined
        }
      });
      res.json({ success: true, data: order });
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
};
