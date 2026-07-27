// ============================================================
//  /api/orders routes
// ============================================================
import { Router } from 'express';
import { OrderController } from '../controllers/OrderController.js';
import { validate } from '../middleware/validate.js';
import { placeOrderSchema } from '../validation/schemas.js';

const router = Router();

router.post('/checkout-direct', OrderController.checkoutDirect);
router.post('/',                validate(placeOrderSchema), OrderController.placeOrder);
router.get('/',                 OrderController.getUserOrders);
router.get('/track/:id',        OrderController.trackOrder);
router.get('/:id',              OrderController.getOrder);

export default router;
