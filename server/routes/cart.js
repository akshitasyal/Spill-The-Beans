// ============================================================
//  /api/cart routes
// ============================================================
import { Router } from 'express';
import { CartController } from '../controllers/CartController.js';
import { validate } from '../middleware/validate.js';
import { addCartItemSchema, updateCartItemSchema } from '../validation/schemas.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// Protect all cart routes with requireAuth
router.use(requireAuth);

router.get('/',                                               CartController.getCart);
router.post('/items',     validate(addCartItemSchema),        CartController.addItem);
router.patch('/items/:itemId', validate(updateCartItemSchema), CartController.updateItem);
router.delete('/items/:itemId',                               CartController.removeItem);
router.delete('/',                                            CartController.clearCart);
router.post('/merge',                                         CartController.mergeCart);

export default router;
