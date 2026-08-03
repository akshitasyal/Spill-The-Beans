// ============================================================
//  CouponController — Handles /api/coupons endpoints
// ============================================================
import { CouponRepository } from '../repositories/CouponRepository.js';
import { UserRepository } from '../repositories/UserRepository.js';

export const CouponController = {
  /**
   * POST /api/coupons/validate
   * Validate a coupon code against the current cart total
   */
  async validate(req, res, next) {
    try {
      const { code, subtotal } = req.body;

      // Get userId if authenticated
      const userId = req.user?.id || null;


      const result = await CouponRepository.validateCoupon(code, subtotal, userId);

      if (!result.valid) {
        return res.status(400).json({ success: false, message: result.error });
      }

      res.json({
        success: true,
        data: {
          code: result.coupon.code,
          type: result.coupon.type,
          value: result.coupon.value,
          discount: result.discount,
          discountFormatted: `₹${(result.discount / 100).toLocaleString('en-IN')}`,
        },
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/coupons  [Admin]
   * List all coupons
   */
  async list(req, res, next) {
    try {
      const coupons = await CouponRepository.findAll();
      res.json({ success: true, data: coupons });
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/coupons  [Admin]
   * Create a new coupon
   */
  async create(req, res, next) {
    try {
      const coupon = await CouponRepository.createCoupon(req.body);
      res.status(201).json({ success: true, data: coupon });
    } catch (err) {
      next(err);
    }
  },

  /**
   * DELETE /api/coupons/:id  [Admin]
   * Deactivate a coupon
   */
  async deactivate(req, res, next) {
    try {
      await CouponRepository.deactivate(req.params.id);
      res.json({ success: true, message: 'Coupon deactivated.' });
    } catch (err) {
      next(err);
    }
  },
};
