// ============================================================
//  /api/wishlist routes
// ============================================================
import { Router } from 'express';
import { WishlistController } from '../controllers/WishlistController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// All wishlist routes require authentication
router.use(requireAuth);

router.get('/', WishlistController.getWishlist);
router.post('/toggle', WishlistController.toggleWishlist);
router.delete('/:productId', WishlistController.removeItem);

export default router;
