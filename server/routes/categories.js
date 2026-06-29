// ============================================================
//  /api/categories routes
// ============================================================
import { Router } from 'express';
import { CategoryController } from '../controllers/ProductController.js';

const router = Router();

router.get('/',       CategoryController.list);
router.get('/:slug',  CategoryController.getBySlug);

export default router;
