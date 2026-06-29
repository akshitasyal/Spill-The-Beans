// ============================================================
//  Spill The Beans — Database Seed
//  Populates: 5 Categories + 14 Products + 3 Coupons
// ============================================================
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

// ─────────────────────────────────────────────────────────────
// CATEGORIES
// ─────────────────────────────────────────────────────────────
const categories = [
  {
    name: 'Flavoured Instant',
    slug: 'flavoured-instant',
    description: 'Premium instant coffees infused with natural flavours. Café-quality at home.',
  },
  {
    name: 'Premium Arabica',
    slug: 'premium-arabica',
    description: 'Single-origin and blended Arabica beans from India\'s finest estates.',
  },
  {
    name: 'Bundles',
    slug: 'bundles',
    description: 'Curated coffee collections designed to save more and taste more.',
  },
  {
    name: 'Gift Packs',
    slug: 'gift-packs',
    description: 'Beautifully packaged coffee gifts for every occasion.',
  },
  {
    name: 'Limited Edition',
    slug: 'limited-edition',
    description: 'Rare micro-lot and seasonal coffees. Once they\'re gone, they\'re gone.',
  },
  {
    name: 'Accessories',
    slug: 'accessories',
    description: 'Premium coffee mugs, frothers, and brewing equipment.',
  },
  {
    name: 'Iced Tea',
    slug: 'iced-tea',
    description: 'Refreshingly guilt-free iced teas.',
  },
];

// ─────────────────────────────────────────────────────────────
// PRODUCTS (prices stored in paise: INR × 100)
// ─────────────────────────────────────────────────────────────
const products = [
  // ── Flavoured Instant ──────────────────────────────────────
  {
    name: 'Hazelnut Bliss',
    slug: 'hazelnut-bliss-instant',
    description: 'A smooth, velvety cup infused with the warm embrace of roasted hazelnuts. Made from premium Indian Arabica, this instant blend delivers a café-quality hazelnut latte experience — no machine required.',
    price: 34900,
    salePrice: 44900,
    images: ['/assets/product_hazelnut.png'],
    stock: 150,
    weight: '100g',
    roast: 'Medium',
    origin: 'South India',
    process: 'Spray Dried',
    flavourNotes: ['Hazelnut', 'Cream', 'Caramel undertones'],
    highlights: ['Premium Arabica base', 'Natural hazelnut infusion', 'No artificial flavours', 'Dissolves instantly in hot or cold milk'],
    isActive: true,
    isFeatured: true,
    isBestseller: true,
    isNew: true,
    categorySlug: 'flavoured-instant',
  },
  {
    name: 'Caramel Surge',
    slug: 'caramel-surge-instant',
    description: 'Rich liquid caramel meets our finest Indian Arabica in this irresistible instant coffee. Every sip delivers a warm, buttery sweetness that energises and indulges simultaneously.',
    price: 34900,
    salePrice: null,
    images: ['/assets/product_caramel.png'],
    stock: 200,
    weight: '100g',
    roast: 'Medium',
    origin: 'South India',
    process: 'Spray Dried',
    flavourNotes: ['Caramel', 'Butterscotch', 'Dark toffee'],
    highlights: ['Rich caramel flavour', 'Bold Arabica base', 'Perfect for iced lattes', 'Premium instant blend'],
    isActive: true,
    isFeatured: false,
    isBestseller: true,
    isNew: false,
    categorySlug: 'flavoured-instant',
  },
  {
    name: 'Vanilla Dream',
    slug: 'vanilla-dream-instant',
    description: 'A gentle, aromatic cup with the soft warmth of Madagascar vanilla. Light-roasted for a delicate flavour profile that soothes and delights.',
    price: 34900,
    salePrice: null,
    images: ['/assets/product_vanilla.png'],
    stock: 120,
    weight: '100g',
    roast: 'Light',
    origin: 'South India',
    process: 'Spray Dried',
    flavourNotes: ['Vanilla', 'Cream', 'Soft floral'],
    highlights: ['Madagascar vanilla', 'Light roast profile', 'Gentle caffeine kick', 'Perfect for mornings'],
    isActive: true,
    isFeatured: false,
    isBestseller: false,
    isNew: false,
    categorySlug: 'flavoured-instant',
  },
  {
    name: 'Dark Chocolate Rush',
    slug: 'dark-chocolate-rush-instant',
    description: 'Bold, dark, and intensely satisfying. Our darkest roast meets 72% Belgian-inspired dark chocolate for a mocha experience that hits hard and lingers beautifully.',
    price: 37900,
    salePrice: 47900,
    images: ['/assets/product_dark_choco.png'],
    stock: 180,
    weight: '100g',
    roast: 'Dark',
    origin: 'South India',
    process: 'Spray Dried',
    flavourNotes: ['Dark chocolate', 'Espresso', 'Bittersweet'],
    highlights: ['72% dark chocolate infusion', 'Extra dark Arabica roast', 'Intense mocha flavour', 'High caffeine boost'],
    isActive: true,
    isFeatured: true,
    isBestseller: true,
    isNew: false,
    categorySlug: 'flavoured-instant',
  },

  // ── Premium Arabica ────────────────────────────────────────
  {
    name: 'Coorg Single Origin',
    slug: 'coorg-single-origin',
    description: 'From the misty hills of Coorg, Karnataka — India\'s coffee capital. This single-origin Arabica is shade-grown at 1,200m altitude, sun-dried on raised beds, and lightly roasted to preserve its natural sweetness.',
    price: 64900,
    salePrice: 79900,
    images: ['/assets/product_coorg.png'],
    stock: 80,
    weight: '200g',
    roast: 'Medium',
    origin: 'Coorg, Karnataka',
    process: 'Natural / Sun-Dried',
    flavourNotes: ['Dark cherry', 'Brown sugar', 'Mild citrus finish'],
    highlights: ['Single estate, shade-grown', 'Altitude: 1,200m', 'Sun-dried on raised beds', 'Zero additives'],
    isActive: true,
    isFeatured: true,
    isBestseller: true,
    isNew: false,
    categorySlug: 'premium-arabica',
  },
  {
    name: 'Monsoon Malabar Reserve',
    slug: 'monsoon-malabar-reserve',
    description: 'India\'s most legendary coffee processing method — Monsoon Malabar. Green coffee beans are exposed to the coastal monsoon winds for 12–16 weeks, creating a uniquely low-acid, earthy, full-bodied cup.',
    price: 74900,
    salePrice: null,
    images: ['/assets/product_monsoon_malabar.png'],
    stock: 60,
    weight: '200g',
    roast: 'Medium-Dark',
    origin: 'Malabar Coast, Kerala',
    process: 'Monsoon Washed',
    flavourNotes: ['Earthy spice', 'Aged wood', 'Dark chocolate', 'Low acid'],
    highlights: ['UNESCO-recognised process', '12-16 weeks monsoon exposure', 'Ultra low acidity', 'Full-bodied, earthy profile'],
    isActive: true,
    isFeatured: false,
    isBestseller: false,
    isNew: false,
    categorySlug: 'premium-arabica',
  },
  {
    name: 'Araku Valley Specialty',
    slug: 'araku-valley-specialty',
    description: 'Grown by tribal farming communities in the Araku Valley, Andhra Pradesh — one of India\'s most celebrated specialty coffee origins. Biodynamically farmed, hand-sorted, and processed with meticulous care.',
    price: 79900,
    salePrice: 99900,
    images: ['/assets/product_araku.png'],
    stock: 45,
    weight: '200g',
    roast: 'Light',
    origin: 'Araku Valley, Andhra Pradesh',
    process: 'Washed',
    flavourNotes: ['Jasmine', 'Orange blossom', 'Milk chocolate', 'Silky texture'],
    highlights: ['Tribal community farmed', 'Biodynamic cultivation', 'Hand-picked and sorted', 'Award-winning origin'],
    isActive: true,
    isFeatured: true,
    isBestseller: false,
    isNew: true,
    categorySlug: 'premium-arabica',
  },
  {
    name: 'Nilgiri Peaks Blend',
    slug: 'nilgiri-peaks-blend',
    description: 'A masterful blend sourced from the high-altitude Nilgiri hills of Tamil Nadu. Cool climate, fertile volcanic soil, and the signature blue mountain mist create a balanced, aromatic coffee.',
    price: 69900,
    salePrice: null,
    images: ['/assets/product_nilgiri.png'],
    stock: 70,
    weight: '200g',
    roast: 'Medium-Dark',
    origin: 'Nilgiri Hills, Tamil Nadu',
    process: 'Fully Washed',
    flavourNotes: ['Blackberry', 'Bergamot', 'Smooth chocolate finish'],
    highlights: ['High-altitude grown (2,000m)', 'Blue mountain terroir', 'Winey, aromatic character', 'Perfect everyday drinker'],
    isActive: true,
    isFeatured: false,
    isBestseller: false,
    isNew: false,
    categorySlug: 'premium-arabica',
  },

  // ── Bundles ────────────────────────────────────────────────
  {
    name: 'Morning Ritual Bundle',
    slug: 'morning-ritual-bundle',
    description: 'Start every morning with intention. This curated trio combines our top-selling Hazelnut Bliss, Caramel Surge, and Vanilla Dream instant coffees — a week\'s worth of variety.',
    price: 149900,
    salePrice: 184700,
    images: ['/assets/product_bundle.png'],
    stock: 50,
    weight: '3 × 100g',
    roast: 'Assorted',
    origin: 'South India',
    process: null,
    flavourNotes: [],
    highlights: ['Hazelnut Bliss + Caramel Surge + Vanilla Dream', 'Save ₹348 vs. individual purchase', 'Curated for morning routines', 'Premium gift-ready packaging'],
    isActive: true,
    isFeatured: false,
    isBestseller: true,
    isNew: false,
    categorySlug: 'bundles',
  },
  {
    name: "Explorer's Pack",
    slug: 'explorers-pack',
    description: 'A grand journey through Indian coffee country. Five premium selections — two flavoured instants and three single-origin Arabica bags — that cover every brewing method and mood.',
    price: 229900,
    salePrice: 299500,
    images: ['/assets/product_explorer_bundle.png'],
    stock: 30,
    weight: '5 × 100-200g',
    roast: 'Assorted',
    origin: 'Pan-India',
    process: null,
    flavourNotes: [],
    highlights: ['5 curated premium coffees', 'Save ₹696 vs. individual purchase', 'Mix of instant and specialty', 'Brew guide included'],
    isActive: true,
    isFeatured: false,
    isBestseller: false,
    isNew: true,
    categorySlug: 'bundles',
  },

  // ── Gift Packs ─────────────────────────────────────────────
  {
    name: 'The Connoisseur Gift Box',
    slug: 'connoisseur-gift-box',
    description: 'The ultimate gift for the coffee lover who appreciates the finer things. Presented in our signature matte black rigid box with gold foil and satin ribbon.',
    price: 199900,
    salePrice: 244900,
    images: ['/assets/product_gift_box.png'],
    stock: 40,
    weight: 'Curated Gift Set',
    roast: 'Assorted',
    origin: 'Multi-Estate',
    process: null,
    flavourNotes: [],
    highlights: ['Matte black rigid gift box', 'Gold foil and satin ribbon', 'Personalised tasting card included', 'Complimentary gift message'],
    isActive: true,
    isFeatured: true,
    isBestseller: true,
    isNew: false,
    categorySlug: 'gift-packs',
  },
  {
    name: 'The Coffee Lover Set',
    slug: 'coffee-lover-set',
    description: 'The most indulgent coffee gift you can give. This deluxe hamper arrives in a premium wooden crate and includes four Spill The Beans coffees, a stainless steel French press, a hand-crafted ceramic mug, and artisan coffee chocolates.',
    price: 249900,
    salePrice: 319900,
    images: ['/assets/product_coffee_lover.png'],
    stock: 25,
    weight: 'Complete Gift Hamper',
    roast: 'Assorted',
    origin: 'Multi-Estate',
    process: null,
    flavourNotes: [],
    highlights: ['Premium wooden gift crate', 'French press + ceramic mug included', 'Coffee chocolates from Coorg', 'Complete coffee kit'],
    isActive: true,
    isFeatured: false,
    isBestseller: false,
    isNew: false,
    categorySlug: 'gift-packs',
  },

  // ── Limited Edition ────────────────────────────────────────
  {
    name: 'Monsoon Special Reserve',
    slug: 'monsoon-special-reserve',
    description: 'Once a year. Only 500 bags. The most extraordinary monsoon-processed Arabica we\'ve ever sourced — a rare micro-lot from a single estate in Kerala, exposed to 18 weeks of coastal winds.',
    price: 99900,
    salePrice: null,
    images: ['/assets/product_limited_monsoon.png'],
    stock: 127,
    weight: '150g',
    roast: 'Medium-Dark',
    origin: 'Single Estate, Kerala',
    process: 'Extended Monsoon Washed',
    flavourNotes: ['Deep earth', 'Tobacco', 'Dark fruit', 'Aged bourbon whiskey'],
    highlights: ['Only 500 bags — ever', 'Single estate micro-lot', '18-week monsoon exposure', 'Hand-numbered bag', 'Certificate of authenticity'],
    isActive: true,
    isFeatured: false,
    isBestseller: false,
    isNew: true,
    isLimited: true,
    limitedQty: 500,
    categorySlug: 'limited-edition',
  },
  {
    name: 'Harvest Gold Micro-Lot',
    slug: 'harvest-gold-micro-lot',
    description: 'From a tiny 2-acre plot in the Bababudangiri hills — the birthplace of Indian coffee. Harvested at peak ripeness during the golden autumn, naturally processed, and roasted to a delicate light profile.',
    price: 119900,
    salePrice: null,
    images: ['/assets/product_harvest_gold.png'],
    stock: 74,
    weight: '150g',
    roast: 'Light',
    origin: 'Bababudangiri Hills, Karnataka',
    process: 'Natural / Honey Process',
    flavourNotes: ['Golden raisin', 'Peach', 'Floral jasmine', 'Silky sweetness'],
    highlights: ['Only 300 bags — hand-numbered', 'From the birthplace of Indian coffee', 'Natural process, peak harvest', 'Cupping score: 92+'],
    isActive: true,
    isFeatured: false,
    isBestseller: false,
    isNew: true,
    isLimited: true,
    limitedQty: 300,
    categorySlug: 'limited-edition',
  },
  {
    name: 'Mocha pe Chauka & Raat ki Rani Espresso Combo Duo (2 x 50g)',
    slug: 'mocha-pe-chauka-raat-ki-rani-espresso-combo',
    description: 'For the bold cocoa lovers. Pairing the intense, dark espresso kick of Raat ki Rani Espresso with the velvety-smooth, cocoa-rich profile of Mocha pe Chauka. The ultimate fuel for long days and late nights.',
    price: 99900,
    salePrice: 119900,
    images: ['/assets/combo_espresso_mocha.png'],
    stock: 100,
    weight: '2 x 50g',
    roast: 'Dark',
    origin: 'Araku & Coorg',
    process: 'Washed / Monsooned',
    flavourNotes: ['Bold Espresso', 'Sweet Cocoa', 'Dark Chocolate'],
    highlights: ['Includes 2 x 50g Jars', '100% Premium Arabica', 'Bold Dark Roast & Cocoa Infusion', 'Save ₹200 vs individual purchase'],
    isActive: true,
    isFeatured: true,
    isBestseller: true,
    isNew: false,
    categorySlug: 'bundles',
  },
  {
    name: 'Raat ki Rani + Mocha pe Chauka + Chocolate Raspberry Triple (3 × 50g)',
    slug: 'raat-ki-rani-mocha-choco-raspberry-triple',
    description: 'Three iconic flavours, one powerhouse trio. Pair the bold, dark intensity of Raat ki Rani Espresso with the velvety cocoa richness of Mocha pe Chauka and the romantic tart berry notes of Pyaarbhari Chocolate Raspberry. A complete coffee experience in one gift-ready set.',
    price: 149900,
    salePrice: 189900,
    images: ['/assets/combo_espresso_mocha.png'],
    stock: 100,
    weight: '3 x 50g',
    roast: 'Dark',
    origin: 'Coorg, Araku Valley & Nilgiri Hills',
    process: 'Monsooned / Washed / Sun Dried',
    flavourNotes: ['Bold Espresso', 'Sweet Cocoa', 'Red Raspberry', 'Dark Chocolate'],
    highlights: ['Includes 3 × 50g glass jars', '100% Premium Arabica', 'Bold, Rich & Fruity flavour journey', 'Save ₹400 vs individual purchase'],
    isActive: true,
    isFeatured: true,
    isBestseller: false,
    isNew: true,
    categorySlug: 'bundles',
  },
  {
    name: 'Espresso Froth Set | Raat Ki Rani Espresso 50gms Jar + The Frother',
    slug: 'espresso-froth-set',
    description: 'Be your own barista. The intense, dark kick of Raat ki Rani Espresso — our boldest 50g instant coffee jar — paired with The Frother, STB\'s rechargeable 3-speed milk frother. Whip up café-quality iced lattes, cappuccinos and cold foams at home in seconds.',
    price: 79900,
    salePrice: 99800,
    images: ['/assets/combo_frother_espresso.jpg'],
    stock: 100,
    weight: '50g Jar + Frother',
    roast: 'Dark',
    origin: 'Coorg',
    process: 'Monsooned',
    flavourNotes: ['Bold Espresso', 'Smoky Oak', 'Dark Chocolate'],
    highlights: [
      'Raat ki Rani Espresso 50g jar',
      'STB Rechargeable Milk Frother',
      '3-speed motor · Stainless steel whisk',
      'Save ₹199 vs buying separately',
      'Perfect home barista starter kit'
    ],
    isActive: true,
    isFeatured: true,
    isBestseller: true,
    isNew: true,
    categorySlug: 'bundles',
  },
  {
    name: 'Vichaar Over Vanilla & Mocha pe Chauka Combo Duo (2 x 50g)',
    slug: 'vichaar-over-vanilla-mocha-pe-chauka-combo',
    description: 'The perfect balance of comforting warmth and rich indulgence. Get the soothing, aromatic Madagascar vanilla of Vichaar Over Vanilla paired with the luscious, cocoa-infused notes of Mocha pe Chauka in one incredible value pack.',
    price: 99900,
    salePrice: 119900,
    images: ['/assets/combo_vanilla_mocha.png'],
    stock: 100,
    weight: '2 x 50g',
    roast: 'Medium',
    origin: 'Multiple Estates',
    process: 'Washed / Honey Processed',
    flavourNotes: ['Vanilla Bean', 'Dark Chocolate', 'Warm Caramel'],
    highlights: ['Includes 2 x 50g Jars', '100% Premium Arabica', 'Madagascar Vanilla & Premium Cocoa', 'Save ₹200 vs individual purchase'],
    isActive: true,
    isFeatured: true,
    isBestseller: true,
    isNew: false,
    categorySlug: 'bundles',
  },
  {
    name: 'Hustle Mode ON Combo | Best Seller Box + The Whip (Frother)',
    slug: 'hustle-mode-on-combo',
    description: 'The ultimate productivity kit. Includes our Bestsellers 10-Pack (10 single-serve sachets across 5 fan-favourite instant coffee flavours: Caramel, Hazelnut, Irish, Vanilla & Mocha) paired with The Whip, STB\'s premium 3-speed rechargeable milk frother. Get café-style frothy coffee in seconds, anywhere.',
    price: 89900,
    salePrice: 144800,
    images: ['/assets/combo_hustle_mode_frother_bestsellers.jpg'],
    stock: 100,
    weight: '10 Sachets + Frother',
    roast: 'Assorted',
    origin: 'Multiple Estates',
    process: 'Spray Dried',
    flavourNotes: ['Caramel', 'Hazelnut', 'Vanilla', 'Mocha', 'Irish'],
    highlights: [
      'Bestsellers 10-Pack (10 sachets)',
      'STB Rechargeable Milk Frother',
      '5 delicious coffee flavours',
      'Perfect gift for busy creators',
      'Save ₹549 vs original MRP'
    ],
    isActive: true,
    isFeatured: true,
    isBestseller: true,
    isNew: true,
    categorySlug: 'bundles',
  },
  {
    name: 'Hustlers Assembly Combo | Assorted 30-Pack + Hazelnut & Caramel Jars (2 x 50g)',
    slug: 'hustlers-assembly-combo-assorted-30-pack-hazelnut-caramel',
    description: 'The ultimate treasure box for serious coffee lovers. Featuring our Assorted 30-Pack Box (30 sachets across 10 unique flavours) alongside full-sized 50g jars of our two top bestsellers: Hassle Free Hazelnut and Caramel ka Kamal. Perfect for keeping your daily coffee routine diverse, satisfying and delicious.',
    price: 229900,
    salePrice: 366900,
    images: ['/assets/combo_assorted_box_hazelnut_caramel.jpg'],
    stock: 100,
    weight: '30 Sachets + 2 x 50g Jars',
    roast: 'Assorted',
    origin: 'Multiple Estates',
    process: 'Spray Dried / Washed',
    flavourNotes: ['Caramel', 'Hazelnut', 'Vanilla', 'Mocha', 'Irish', 'Espresso', 'Chocolate'],
    highlights: [
      'Assorted 30-Pack Box (30 sachets)',
      'Hassle Free Hazelnut 50g glass jar',
      'Caramel ka Kamal 50g glass jar',
      '10 different coffee flavours to try',
      'Save over ₹600 vs buying separately'
    ],
    isActive: true,
    isFeatured: true,
    isBestseller: true,
    isNew: true,
    categorySlug: 'bundles',
  },
];

// ─────────────────────────────────────────────────────────────
// COUPONS
// ─────────────────────────────────────────────────────────────
const coupons = [
  {
    code: 'BEANS10',
    type: 'PERCENTAGE',
    value: 10,
    minOrderAmount: 50000, // ₹500
    maxDiscount: null,
    usageLimit: null,
    perUserLimit: 1,
    isActive: true,
  },
  {
    code: 'FIRST15',
    type: 'PERCENTAGE',
    value: 15,
    minOrderAmount: 50000, // ₹500
    maxDiscount: 30000,    // max ₹300 off
    usageLimit: null,
    perUserLimit: 1,
    isActive: true,
  },
  {
    code: 'COFFEE20',
    type: 'PERCENTAGE',
    value: 20,
    minOrderAmount: 100000, // ₹1000
    maxDiscount: 50000,     // max ₹500 off
    usageLimit: 500,
    perUserLimit: 1,
    isActive: true,
  },
];

// ─────────────────────────────────────────────────────────────
// MAIN SEED FUNCTION
// ─────────────────────────────────────────────────────────────
async function main() {
  console.log('🌱 Starting seed...');

  // 1. Upsert categories
  console.log('📂 Seeding categories...');
  const categoryMap = {};
  for (const cat of categories) {
    const created = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
    categoryMap[cat.slug] = created.id;
    console.log(`  ✓ ${created.name}`);
  }

  // 2. Upsert products
  console.log('☕ Seeding products...');
  for (const product of products) {
    const { categorySlug, ...productData } = product;
    const categoryId = categoryMap[categorySlug];

    if (!categoryId) {
      console.warn(`  ⚠ Category "${categorySlug}" not found for product "${product.name}"`);
      continue;
    }

    const created = await prisma.product.upsert({
      where: { slug: product.slug },
      update: {},
      create: {
        ...productData,
        categoryId,
      },
    });
    console.log(`  ✓ ${created.name} (₹${(created.price / 100).toLocaleString('en-IN')})`);
  }

  // 3. Upsert coupons
  console.log('🎟️  Seeding coupons...');
  for (const coupon of coupons) {
    const created = await prisma.coupon.upsert({
      where: { code: coupon.code },
      update: {},
      create: coupon,
    });
    console.log(`  ✓ ${created.code} — ${created.value}% off`);
  }

  console.log('\n✅ Seed complete!');
  console.log(`  → ${categories.length} categories`);
  console.log(`  → ${products.length} products`);
  console.log(`  → ${coupons.length} coupons`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
