// ============================================================
//  CouponRepository — Data access layer for Coupons
// ============================================================
import prisma from '../db/client.js';

export const CouponRepository = {
  /**
   * Find a coupon by code (case-insensitive)
   */
  async findByCode(code) {
    return prisma.coupon.findUnique({
      where: { code: code.toUpperCase().trim() },
    });
  },

  /**
   * Validate a coupon against business rules.
   * Returns { valid: true, coupon, discount } or { valid: false, error }
   *
   * @param {string} code
   * @param {number} subtotal  — cart subtotal in paise
   * @param {string} userId
   */
  async validateCoupon(code, subtotal, userId) {
    const coupon = await this.findByCode(code);

    if (!coupon) {
      return { valid: false, error: 'Coupon not found.' };
    }
    if (!coupon.isActive) {
      return { valid: false, error: 'This coupon is no longer active.' };
    }
    if (coupon.expiresAt && coupon.expiresAt < new Date()) {
      return { valid: false, error: 'This coupon has expired.' };
    }
    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      return { valid: false, error: 'This coupon has reached its usage limit.' };
    }
    if (coupon.minOrderAmount && subtotal < coupon.minOrderAmount) {
      const min = (coupon.minOrderAmount / 100).toLocaleString('en-IN');
      return { valid: false, error: `Minimum order of ₹${min} required for this coupon.` };
    }

    // Check per-user usage
    if (coupon.perUserLimit && userId) {
      const usedByUser = await prisma.order.count({
        where: { userId, couponId: coupon.id },
      });
      if (usedByUser >= coupon.perUserLimit) {
        return { valid: false, error: 'You have already used this coupon.' };
      }
    }

    // Calculate discount
    let discount = 0;
    if (coupon.type === 'PERCENTAGE') {
      discount = Math.round((subtotal * coupon.value) / 100);
      if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
    } else if (coupon.type === 'FIXED') {
      discount = coupon.value;
    } else if (coupon.type === 'FREE_SHIPPING') {
      discount = 0; // handled in checkout
    }

    return { valid: true, coupon, discount };
  },

  /**
   * Increment usage count when coupon is applied at checkout
   */
  async incrementUsage(couponId) {
    return prisma.coupon.update({
      where: { id: couponId },
      data: { usageCount: { increment: 1 } },
    });
  },

  /**
   * Create a new coupon (admin)
   */
  async createCoupon(data) {
    return prisma.coupon.create({
      data: { ...data, code: data.code.toUpperCase().trim() },
    });
  },

  /**
   * Deactivate a coupon (soft delete)
   */
  async deactivate(id) {
    return prisma.coupon.update({
      where: { id },
      data: { isActive: false },
    });
  },

  /**
   * List all coupons (admin)
   */
  async findAll() {
    return prisma.coupon.findMany({ orderBy: { createdAt: 'desc' } });
  },
};
