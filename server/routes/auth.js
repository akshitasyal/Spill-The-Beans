// ============================================================
//  /api/auth routes
// ============================================================
import { Router } from 'express';
import { AuthController } from '../controllers/AuthController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.get('/me', requireAuth, AuthController.me);
router.post('/logout', AuthController.logout);

export default router;
