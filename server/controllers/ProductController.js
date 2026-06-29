// ============================================================
//  ProductController — Handles /api/products endpoints
// ============================================================
import { ProductRepository } from '../repositories/ProductRepository.js';

export const ProductController = {
  /**
   * GET /api/products
   * List products with filtering, sorting, pagination
   */
  async list(req, res, next) {
    try {
      const result = await ProductRepository.findAll(req.query);
      res.json({ success: true, ...result });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/products/featured
   * Featured products for homepage
   */
  async featured(req, res, next) {
    try {
      const limit = parseInt(req.query.limit) || 4;
      const products = await ProductRepository.getFeatured(limit);
      res.json({ success: true, data: products });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/products/:slug
   * Single product detail page (returns product, category, reviewSummary, and relatedProducts)
   */
  async getBySlug(req, res, next) {
    try {
      const product = await ProductRepository.findBySlug(req.params.slug);
      if (!product || !product.isActive) {
        return res.status(404).json({ success: false, message: 'Product not found.' });
      }

      // Calculate Review Summary
      const reviews = product.reviews || [];
      const reviewCount = reviews.length;
      const avgRating = reviewCount > 0
        ? parseFloat((reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount).toFixed(1))
        : 0;

      // Get Related Products (limit 4)
      const related = await ProductRepository.getRelated(product.id, product.categoryId, 4);

      // Extract category from product and omit from product response if desired
      const { category, ...productData } = product;

      res.json({
        success: true,
        data: {
          product: productData,
          category,
          reviewSummary: {
            averageRating: avgRating,
            reviewCount,
            recentReviews: reviews,
          },
          relatedProducts: related,
        },
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/products/:slug/related
   * Related products (same category)
   */
  async getRelated(req, res, next) {
    try {
      const product = await ProductRepository.findBySlug(req.params.slug);
      if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });
      const related = await ProductRepository.getRelated(product.id, product.categoryId, 4);
      res.json({ success: true, data: related });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/products/search
   * Quick search endpoint returning compact results
   */
  async search(req, res, next) {
    try {
      const searchQuery = req.query.search || req.query.q || '';
      const results = await ProductRepository.search(searchQuery);
      res.json({ success: true, data: results });
    } catch (err) {
      next(err);
    }
  },
};

// ─────────────────────────────────────────────────────────────
// CategoryController — Handles /api/categories endpoints
// ─────────────────────────────────────────────────────────────
import { CategoryRepository } from '../repositories/ProductRepository.js';

export const CategoryController = {
  /**
   * GET /api/categories
   * All categories with product count
   */
  async list(req, res, next) {
    try {
      const categories = await CategoryRepository.findAll();
      const mapped = categories.map(c => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        image: c.image,
        description: c.description,
        productCount: c._count?.products || 0,
      }));
      res.json({ success: true, data: mapped });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/categories/:slug
   * Single category detail
   */
  async getBySlug(req, res, next) {
    try {
      const category = await CategoryRepository.findBySlug(req.params.slug);
      if (!category) return res.status(404).json({ success: false, message: 'Category not found.' });
      res.json({ success: true, data: category });
    } catch (err) {
      next(err);
    }
  },
};
