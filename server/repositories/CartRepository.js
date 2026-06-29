// ============================================================
//  CartRepository — Data access layer for Cart & CartItems
// ============================================================
import prisma from '../db/client.js';

export const CartRepository = {
  /**
   * Get a user's full cart with product details.
   * Creates an empty cart if none exists.
   */
  async getOrCreateCart(userId) {
    return prisma.cart.upsert({
      where: { userId },
      update: {},
      create: { userId },
      include: {
        items: {
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
                isActive: true,
                weight: true,
                category: { select: { name: true } },
              },
            },
          },
          orderBy: { id: 'asc' },
        },
      },
    });
  },

  /**
   * Add an item to the cart.
   * If the same product+variant already exists, increments quantity.
   */
  async addItem(userId, { productId, quantity = 1, variant = null }) {
    const cart = await this.getOrCreateCart(userId);

    const existing = await prisma.cartItem.findUnique({
      where: {
        cartId_productId_variant: {
          cartId: cart.id,
          productId,
          variant: variant ?? '',
        },
      },
    });

    if (existing) {
      return prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: { increment: quantity } },
      });
    }

    return prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId,
        quantity,
        variant,
      },
    });
  },

  /**
   * Set an item's quantity explicitly.
   * Pass quantity = 0 to remove the item.
   */
  async updateItemQuantity(userId, cartItemId, quantity) {
    const cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) throw new Error('Cart not found');

    if (quantity <= 0) {
      return prisma.cartItem.deleteMany({
        where: { id: cartItemId, cartId: cart.id },
      });
    }

    return prisma.cartItem.updateMany({
      where: { id: cartItemId, cartId: cart.id },
      data: { quantity },
    });
  },

  /**
   * Remove a specific item from the cart
   */
  async removeItem(userId, cartItemId) {
    const cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) return;

    return prisma.cartItem.deleteMany({
      where: { id: cartItemId, cartId: cart.id },
    });
  },

  /**
   * Clear all items from the cart (called after order is placed)
   */
  async clearCart(userId) {
    const cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) return;

    return prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
  },

  /**
   * Get item count for navbar badge
   */
  async getItemCount(userId) {
    const cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) return 0;

    const result = await prisma.cartItem.aggregate({
      where: { cartId: cart.id },
      _sum: { quantity: true },
    });
    return result._sum.quantity ?? 0;
  },
};
