// ============================================================
//  WishlistController — Handles /api/wishlist endpoints
// ============================================================
import { WishlistRepository } from '../repositories/WishlistRepository.js';

export const WishlistController = {
  /**
   * GET /api/wishlist
   * Returns authenticated user's wishlist
   */
  async getWishlist(req, res, next) {
    try {
      const items = await WishlistRepository.getUserWishlist(req.user.id);
      res.json({ success: true, data: items });
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/wishlist/toggle
   * Toggle a product in user's wishlist
   */
  async toggleWishlist(req, res, next) {
    try {
      const { productId } = req.body;
      if (!productId) {
        return res.status(400).json({ success: false, message: 'productId is required.' });
      }

      const result = await WishlistRepository.toggleWishlist(req.user.id, productId);
      const items = await WishlistRepository.getUserWishlist(req.user.id);

      res.json({
        success: true,
        added: result.added,
        data: items,
        message: result.added ? 'Added to wishlist.' : 'Removed from wishlist.',
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * DELETE /api/wishlist/:productId
   * Remove item from wishlist
   */
  async removeItem(req, res, next) {
    try {
      const { productId } = req.params;
      await WishlistRepository.removeWishlistItem(req.user.id, productId);
      const items = await WishlistRepository.getUserWishlist(req.user.id);
      res.json({ success: true, data: items, message: 'Removed from wishlist.' });
    } catch (err) {
      next(err);
    }
  },
};
