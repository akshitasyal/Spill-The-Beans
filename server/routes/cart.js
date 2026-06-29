// ============================================================
//  /api/cart routes
// ============================================================
import { Router } from 'express';
import { CartController } from '../controllers/CartController.js';
import { validate } from '../middleware/validate.js';
import { addCartItemSchema, updateCartItemSchema } from '../validation/schemas.js';

const router = Router();

router.get('/',                                               CartController.getCart);
router.post('/items',     validate(addCartItemSchema),        CartController.addItem);
router.patch('/items/:itemId', validate(updateCartItemSchema), CartController.updateItem);
router.delete('/items/:itemId',                               CartController.removeItem);
router.delete('/',                                            CartController.clearCart);

export default router;
