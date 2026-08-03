// ============================================================
//  /api/orders routes
// ============================================================
import { Router } from 'express';
import { OrderController } from '../controllers/OrderController.js';
import { validate } from '../middleware/validate.js';
import { placeOrderSchema } from '../validation/schemas.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// Public order tracking (no auth required — read-only status info)
router.get('/track/:id', OrderController.trackOrder);

// Protected order endpoints (require authentication)
router.use(requireAuth);
router.post('/checkout-direct',  OrderController.checkoutDirect);
router.post('/',                 validate(placeOrderSchema), OrderController.placeOrder);
router.get('/',                  OrderController.getUserOrders);
router.get('/my-orders',         OrderController.getUserOrders);  // Alias for frontend convenience
router.get('/:id',               OrderController.getOrder);
router.patch('/:id/cancel',      OrderController.cancelOrder);

export default router;

