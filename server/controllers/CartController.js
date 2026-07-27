// ============================================================
//  CartController — Handles /api/cart endpoints
// ============================================================
import { CartRepository } from '../repositories/CartRepository.js';
import { UserRepository } from '../repositories/UserRepository.js';

/**
 * Helper: resolve userId from clerkId header/param
 */
async function resolveUserId(clerkId) {
  const user = await UserRepository.findByClerkId(clerkId);
  if (!user) throw Object.assign(new Error('User not found.'), { status: 404 });
  return user.id;
}

export const CartController = {
  /**
   * GET /api/cart
   * Get the authenticated user's cart
   * Requires header: x-clerk-id
   */
  async getCart(req, res, next) {
    try {
      const clerkId = req.headers['x-clerk-id'];
      if (!clerkId) return res.status(401).json({ success: false, message: 'Unauthorized.' });

      const userId = await resolveUserId(clerkId);
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
      const clerkId = req.headers['x-clerk-id'];
      if (!clerkId) return res.status(401).json({ success: false, message: 'Unauthorized.' });

      const userId = await resolveUserId(clerkId);
      const { productId, quantity, variant } = req.body;

      await CartRepository.addItem(userId, { productId, quantity, variant });
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
      const clerkId = req.headers['x-clerk-id'];
      if (!clerkId) return res.status(401).json({ success: false, message: 'Unauthorized.' });

      const userId = await resolveUserId(clerkId);
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
      const clerkId = req.headers['x-clerk-id'];
      if (!clerkId) return res.status(401).json({ success: false, message: 'Unauthorized.' });

      const userId = await resolveUserId(clerkId);
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
      const clerkId = req.headers['x-clerk-id'];
      if (!clerkId) return res.status(401).json({ success: false, message: 'Unauthorized.' });

      const userId = await resolveUserId(clerkId);
      await CartRepository.clearCart(userId);

      res.json({ success: true, message: 'Cart cleared.' });
    } catch (err) {
      next(err);
    }
  },
};
