// ============================================================
//  /api/coupons routes
// ============================================================
import { Router } from 'express';
import { CouponController } from '../controllers/CouponController.js';
import { validate } from '../middleware/validate.js';
import { createCouponSchema, applyCouponSchema } from '../validation/schemas.js';

const router = Router();

// Public — validate coupon at checkout
router.post('/validate',  validate(applyCouponSchema),   CouponController.validate);

// Admin — coupon management (auth guard added in Phase 3)
router.get('/',                                          CouponController.list);
router.post('/',          validate(createCouponSchema),  CouponController.create);
router.delete('/:id',                                    CouponController.deactivate);

export default router;
