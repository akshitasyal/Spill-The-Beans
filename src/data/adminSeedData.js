import { products, CATEGORIES } from './products';

// ── ADMIN CATEGORIES ─────────────────────────────────────────
export const ADMIN_CATEGORIES = [
  { id: 'cat-1', name: 'Coffee', slug: 'coffee', description: 'Premium Indian specialty coffee beans and soluble blends.', parentId: null, isActive: true },
  { id: 'cat-1-1', name: 'Instant Coffee', slug: 'instant-coffee', description: 'Café-quality flavored instant roasts.', parentId: 'cat-1', isActive: true },
  { id: 'cat-2', name: 'Accessories', slug: 'accessories', description: 'Premium coffee mugs, milk frothers, and tumblers.', parentId: null, isActive: true },
  { id: 'cat-3', name: 'Gift Packs', slug: 'gift-packs', description: 'Artisanal gift boxes for coffee enthusiasts.', parentId: null, isActive: true },
  { id: 'cat-4', name: 'Bundles', slug: 'bundles', description: 'Curated value bundles combining beans and frothers.', parentId: null, isActive: true },
  { id: 'cat-5', name: 'Iced Tea', slug: 'iced-tea', description: 'Refreshingly guilt-free iced teas.', parentId: null, isActive: true }
];

// Helper to construct variants dynamically
const makeVariants = (sku, price, salePrice, inStock) => [
  { weight: '50g', price, salePrice, sku: `${sku}-50G`, stock: inStock ? 120 : 0 },
  { weight: '100g', price: Math.floor(price * 1.8), salePrice: salePrice ? Math.floor(salePrice * 1.8) : null, sku: `${sku}-100G`, stock: inStock ? 80 : 0 }
];

// ── SYNCED PRODUCTS (GENERATE DYNAMICALLY FROM STOREFRONT) ──
export const ADMIN_SEED_PRODUCTS = products.map(p => {
  let categoryId = 'cat-1-1'; // default Instant Coffee
  if (p.category === CATEGORIES.BUNDLE) categoryId = 'cat-4';
  else if (p.category === CATEGORIES.ACCESSORIES) categoryId = 'cat-2';
  else if (p.category === CATEGORIES.ICED_TEA) categoryId = 'cat-5';

  const sku = 'STB-' + p.slug.toUpperCase();
  const price = Math.floor(p.price);
  const originalPrice = p.originalPrice ? Math.floor(p.originalPrice) : null;

  return {
    id: `prod-${p.id}`,
    name: p.name,
    slug: p.slug,
    shortDescription: p.subtitle || p.description?.substring(0, 60) || '',
    description: p.description || '',
    categoryId,
    brand: 'Spill The Beans',
    sku,
    // In admin panel, base price is stored in price, discounted price in salePrice
    price: originalPrice || price,
    salePrice: originalPrice ? price : null,
    stock: p.inStock ? 120 : 0,
    weight: p.weight || '50g',
    image: p.image,
    images: [p.image],
    isActive: true,
    isFeatured: p.isBestseller || false,
    variants: makeVariants(sku, originalPrice || price, originalPrice ? price : null, p.inStock)
  };
});
