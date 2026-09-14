// ============================================================
//  CartController — Handles /api/cart endpoints
// ============================================================
import { CartRepository } from '../repositories/CartRepository.js';
import { UserRepository } from '../repositories/UserRepository.js';

/**
 * Helper: resolve userId from req.user
 */
function getUserIdFromReq(req) {
  if (req.user?.id) return req.user.id;
  throw Object.assign(new Error('Unauthorized. Please sign in.'), { status: 401 });
}


export const CartController = {
  /**
   * GET /api/cart
   * Get the authenticated user's cart
   */
  async getCart(req, res, next) {
    try {
      const userId = await getUserIdFromReq(req);
      const cart = await CartRepository.getOrCreateCart(userId);
      res.json({ success: true, data: cart });
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/cart/items
   * Add a product to cart
   */
  async addItem(req, res, next) {
    try {
      const userId = await getUserIdFromReq(req);
      const { productId, quantity, variant, slug, name } = req.body;

      await CartRepository.addItem(userId, { productId, quantity, variant, slug, name });
      const cart = await CartRepository.getOrCreateCart(userId);

      res.status(201).json({ success: true, data: cart, message: 'Item added to cart.' });
    } catch (err) {
      next(err);
    }
  },

  /**
   * PATCH /api/cart/items/:itemId
   * Update quantity of a cart item (0 = remove)
   */
  async updateItem(req, res, next) {
    try {
      const userId = await getUserIdFromReq(req);
      await CartRepository.updateItemQuantity(userId, req.params.itemId, req.body.quantity);
      const cart = await CartRepository.getOrCreateCart(userId);

      res.json({ success: true, data: cart });
    } catch (err) {
      next(err);
    }
  },

  /**
   * DELETE /api/cart/items/:itemId
   * Remove a specific item from cart
   */
  async removeItem(req, res, next) {
    try {
      const userId = await getUserIdFromReq(req);
      await CartRepository.removeItem(userId, req.params.itemId);
      const cart = await CartRepository.getOrCreateCart(userId);

      res.json({ success: true, data: cart, message: 'Item removed.' });
    } catch (err) {
      next(err);
    }
  },

  /**
   * DELETE /api/cart
   * Clear the entire cart
   */
  async clearCart(req, res, next) {
    try {
      const userId = await getUserIdFromReq(req);
      await CartRepository.clearCart(userId);

      res.json({ success: true, message: 'Cart cleared.' });
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/cart/merge
   * Merge guest cart items from LocalStorage into DB cart
   */
  async mergeCart(req, res, next) {
    try {
      const userId = await getUserIdFromReq(req);
      const { items } = req.body;

      const updatedCart = await CartRepository.mergeCart(userId, Array.isArray(items) ? items : []);
      res.json({ success: true, data: updatedCart, message: 'Guest cart merged successfully.' });
    } catch (err) {
      next(err);
    }
  },
};
