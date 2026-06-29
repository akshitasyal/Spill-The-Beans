// ============================================================
//  /api/orders routes
// ============================================================
import { Router } from 'express';
import { OrderController } from '../controllers/OrderController.js';
import { validate } from '../middleware/validate.js';
import { placeOrderSchema, updateOrderStatusSchema } from '../validation/schemas.js';

const router = Router();

router.post('/',                                              validate(placeOrderSchema), OrderController.placeOrder);
router.get('/',                                              OrderController.getUserOrders);
router.get('/:id',                                           OrderController.getOrder);
router.patch('/:id/status', validate(updateOrderStatusSchema), OrderController.updateStatus);

export default router;
