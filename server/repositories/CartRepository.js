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

  /**
   * Merge guest cart items from LocalStorage with user DB cart
   */
  async mergeCart(userId, guestItems = []) {
    const cart = await this.getOrCreateCart(userId);

    for (const item of guestItems) {
      const quantityToAdd = Math.max(1, Number(item.quantity) || 1);
      const variantVal = item.variant || null;
      let targetProductId = item.productId || item.id;

      // If item was passed with slug instead of ID, resolve product ID
      if (!targetProductId && item.slug) {
        const prod = await prisma.product.findUnique({ where: { slug: item.slug } });
        if (prod) targetProductId = prod.id;
      }

      if (!targetProductId) continue;

      // Verify product exists in database
      const dbProduct = await prisma.product.findUnique({ where: { id: targetProductId } });
      if (!dbProduct) {
        // Try finding by slug if ID failed
        if (item.slug) {
          const prodBySlug = await prisma.product.findUnique({ where: { slug: item.slug } });
          if (prodBySlug) targetProductId = prodBySlug.id;
          else continue;
        } else {
          continue;
        }
      }

      const existing = await prisma.cartItem.findUnique({
        where: {
          cartId_productId_variant: {
            cartId: cart.id,
            productId: targetProductId,
            variant: variantVal ?? '',
          },
        },
      });

      if (existing) {
        const newQty = Math.min(existing.quantity + quantityToAdd, 10);
        await prisma.cartItem.update({
          where: { id: existing.id },
          data: { quantity: newQty },
        });
      } else {
        await prisma.cartItem.create({
          data: {
            cartId: cart.id,
            productId: targetProductId,
            quantity: Math.min(quantityToAdd, 10),
            variant: variantVal,
          },
        });
      }
    }

    return this.getOrCreateCart(userId);
  },
};

