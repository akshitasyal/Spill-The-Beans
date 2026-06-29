// ============================================================
//  /api/products routes
// ============================================================
import { Router } from 'express';
import { ProductController } from '../controllers/ProductController.js';
import { validate } from '../middleware/validate.js';
import { productQuerySchema } from '../validation/schemas.js';

const router = Router();

router.get('/',           validate(productQuerySchema, 'query'), ProductController.list);
router.get('/featured',                                          ProductController.featured);
router.get('/search',                                            ProductController.search);
router.get('/:slug',                                             ProductController.getBySlug);
router.get('/:slug/related',                                     ProductController.getRelated);

export default router;
