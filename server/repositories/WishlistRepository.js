// ============================================================
//  WishlistRepository — Data access layer for User Wishlists
// ============================================================
import prisma from '../db/client.js';

export const WishlistRepository = {
  /**
   * Get all wishlist items for a user including full product details
   */
  async getUserWishlist(userId) {
    const items = await prisma.wishlist.findMany({
      where: { userId },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            price: true,
            salePrice: true,
            images: true,
            stock: true,
            weight: true,
            roast: true,
            category: { select: { name: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return items;
  },

  /**
   * Toggle a product in user's wishlist.
   * If already exists -> remove it. If not -> add it.
   */
  async toggleWishlist(userId, productId) {
    const existing = await prisma.wishlist.findUnique({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });

    if (existing) {
      await prisma.wishlist.delete({
        where: { id: existing.id },
      });
      return { added: false, productId };
    }

    const created = await prisma.wishlist.create({
      data: { userId, productId },
    });
    return { added: true, item: created };
  },

  /**
   * Remove specific product from user's wishlist
   */
  async removeWishlistItem(userId, productId) {
    return prisma.wishlist.deleteMany({
      where: { userId, productId },
    });
  },

  /**
   * Check if a product is wishlisted by user
   */
  async isWishlisted(userId, productId) {
    const count = await prisma.wishlist.count({
      where: { userId, productId },
    });
    return count > 0;
  },
};
