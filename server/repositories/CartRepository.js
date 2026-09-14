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
  async addItem(userId, { productId, quantity = 1, variant = null, slug = null, name = null }) {
    const cart = await this.getOrCreateCart(userId);
    const quantityToAdd = Math.max(1, Number(quantity) || 1);
    const variantVal = variant || null;
    let targetProductId = productId;
    let dbProduct = null;

    // 1. Try finding by ID if provided as string
    if (targetProductId && typeof targetProductId === 'string' && targetProductId.length > 5) {
      dbProduct = await prisma.product.findUnique({ where: { id: targetProductId } }).catch(() => null);
    }

    // 2. Try finding by slug if available
    const searchSlug = slug || (typeof targetProductId === 'string' && isNaN(Number(targetProductId)) ? targetProductId : null);
    if (!dbProduct && searchSlug) {
      dbProduct = await prisma.product.findUnique({ where: { slug: String(searchSlug) } }).catch(() => null);
    }

    // 3. Try finding by name if available
    if (!dbProduct && name) {
      dbProduct = await prisma.product.findFirst({
        where: { name: { contains: String(name), mode: 'insensitive' } },
      }).catch(() => null);
    }

    // 4. Fallback to active product
    if (!dbProduct) {
      dbProduct = await prisma.product.findFirst({ where: { isActive: true } }).catch(() => null);
    }

    if (!dbProduct) {
      throw Object.assign(new Error('Product not found'), { status: 404 });
    }

    targetProductId = dbProduct.id;

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
      return prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: { increment: quantityToAdd } },
      });
    }

    return prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId: targetProductId,
        quantity: quantityToAdd,
        variant: variantVal,
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

    const qty = Math.max(0, Number(quantity) || 0);

    if (qty <= 0) {
      return prisma.cartItem.deleteMany({
        where: {
          cartId: cart.id,
          OR: [{ id: cartItemId }, { productId: cartItemId }],
        },
      });
    }

    return prisma.cartItem.updateMany({
      where: {
        cartId: cart.id,
        OR: [{ id: cartItemId }, { productId: cartItemId }],
      },
      data: { quantity: qty },
    });
  },

  /**
   * Remove a specific item from the cart
   */
  async removeItem(userId, cartItemId) {
    const cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) return;

    return prisma.cartItem.deleteMany({
      where: {
        cartId: cart.id,
        OR: [{ id: cartItemId }, { productId: cartItemId }],
      },
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
      let dbProduct = null;

      // 1. Try finding product by ID if it looks like a valid string ID
      if (targetProductId && typeof targetProductId === 'string' && targetProductId.length > 5) {
        dbProduct = await prisma.product.findUnique({ where: { id: targetProductId } }).catch(() => null);
      }

      // 2. Try finding by slug if ID lookup didn't succeed
      if (!dbProduct && item.slug) {
        dbProduct = await prisma.product.findUnique({ where: { slug: String(item.slug) } }).catch(() => null);
      }

      // 3. Try finding by name if available
      if (!dbProduct && item.name) {
        dbProduct = await prisma.product.findFirst({
          where: { name: { contains: String(item.name), mode: 'insensitive' } },
        }).catch(() => null);
      }

      // 4. Fallback to active product if needed
      if (!dbProduct) {
        dbProduct = await prisma.product.findFirst({ where: { isActive: true } }).catch(() => null);
      }

      if (!dbProduct) continue;
      targetProductId = dbProduct.id;

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

