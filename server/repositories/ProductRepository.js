// ============================================================
//  ProductRepository — Data access layer for Products & Categories
// ============================================================
import prisma from '../db/client.js';

export const ProductRepository = {
  /**
   * Find all active products with optional filters
   */
  async findAll({
    category,
    categorySlug,
    search,
    roast,
    minPrice,
    maxPrice,
    featured,
    isFeatured,
    isBestseller,
    isNew,
    isLimited,
    sort,
    inStock,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    page = 1,
    limit = 12,
  } = {}) {
    const where = { isActive: true };

    const catSlug = category || categorySlug;
    if (catSlug) {
      where.category = { slug: catSlug };
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { origin: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (roast) where.roast = roast;
    if (minPrice !== undefined) where.price = { ...(where.price || {}), gte: minPrice };
    if (maxPrice !== undefined) where.price = { ...(where.price || {}), lte: maxPrice };
    
    const feat = featured !== undefined ? featured : isFeatured;
    if (feat !== undefined) where.isFeatured = feat;
    if (isBestseller !== undefined) where.isBestseller = isBestseller;
    if (isNew !== undefined) where.isNew = isNew;
    if (isLimited !== undefined) where.isLimited = isLimited;

    if (inStock === true || inStock === 'true') {
      where.stock = { gt: 0 };
    }

    let orderBy = { createdAt: 'desc' };
    if (sort === 'price_asc') {
      orderBy = { price: 'asc' };
    } else if (sort === 'price_desc') {
      orderBy = { price: 'desc' };
    } else if (sort === 'popular') {
      // Order by bestseller and count of reviews
      orderBy = [
        { isBestseller: 'desc' },
        { reviews: { _count: 'desc' } }
      ];
    } else if (sort === 'newest') {
      orderBy = { createdAt: 'desc' };
    } else {
      const validSortFields = ['price', 'createdAt', 'name', 'stock'];
      if (validSortFields.includes(sortBy)) {
        orderBy = { [sortBy]: sortOrder };
      }
    }

    const skip = (page - 1) * limit;

    const [items, total] = await prisma.$transaction([
      prisma.product.findMany({
        where,
        include: { category: true },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  },

  /**
   * Search products by keyword returning compact representation
   */
  async search(queryStr, limit = 10) {
    if (!queryStr) return [];
    return prisma.product.findMany({
      where: {
        isActive: true,
        OR: [
          { name: { contains: queryStr, mode: 'insensitive' } },
          { description: { contains: queryStr, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        name: true,
        slug: true,
      },
      take: limit,
    });
  },

  /**
   * Find a single product by slug (public-facing URL)
   */
  async findBySlug(slug) {
    return prisma.product.findUnique({
      where: { slug },
      include: {
        category: true,
        reviews: {
          where: { isApproved: true },
          include: { user: { select: { name: true } } },
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    });
  },

  /**
   * Get all active variants that share the same baseProduct group.
   * Returns a lean projection suitable for the variant selector UI.
   */
  async getVariants(baseProduct) {
    if (!baseProduct) return [];
    return prisma.product.findMany({
      where: { isActive: true, baseProduct },
      select: {
        id: true,
        name: true,
        slug: true,
        flavour: true,
        size: true,
        price: true,
        salePrice: true,
        stock: true,
        images: true,
      },
      orderBy: [{ flavour: 'asc' }, { size: 'asc' }],
    });
  },

  /**
   * Find a single product by ID
   */
  async findById(id) {
    return prisma.product.findUnique({
      where: { id },
      include: { category: true },
    });
  },

  /**
   * Get featured products for the homepage
   */
  async getFeatured(limit = 4) {
    return prisma.product.findMany({
      where: { isActive: true, isFeatured: true },
      include: { category: true },
      take: limit,
      orderBy: { createdAt: 'desc' },
    });
  },

  /**
   * Get related products (same category, excluding current)
   */
  async getRelated(productId, categoryId, limit = 3) {
    return prisma.product.findMany({
      where: {
        isActive: true,
        categoryId,
        id: { not: productId },
      },
      include: { category: true },
      take: limit,
    });
  },

  /**
   * Create a new product (admin)
   */
  async createProduct(data) {
    return prisma.product.create({ data });
  },

  /**
   * Update a product (admin)
   */
  async updateProduct(id, data) {
    return prisma.product.update({ where: { id }, data });
  },

  /**
   * Decrement stock by quantity (used when order is placed)
   * Returns updated product.
   */
  async decrementStock(id, quantity) {
    return prisma.product.update({
      where: { id },
      data: { stock: { decrement: quantity } },
    });
  },

  /**
   * Check if product has sufficient stock
   */
  async checkStock(id, quantity) {
    const product = await prisma.product.findUnique({
      where: { id },
      select: { stock: true, isActive: true },
    });
    if (!product || !product.isActive) return false;
    return product.stock >= quantity;
  },
};

// ─────────────────────────────────────────────────────────────
// Category helpers
// ─────────────────────────────────────────────────────────────
export const CategoryRepository = {
  async findAll() {
    return prisma.category.findMany({
      orderBy: { name: 'asc' },
      include: { _count: { select: { products: { where: { isActive: true } } } } },
    });
  },

  async findBySlug(slug) {
    return prisma.category.findUnique({ where: { slug } });
  },
};
