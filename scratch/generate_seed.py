import json

with open('scratch/seed_products.json', 'r', encoding='utf-8') as f:
    products = json.load(f)

# Deduplicate by slug
seen = set()
unique_products = []
for p in products:
    if p['slug'] and p['slug'] not in seen:
        seen.add(p['slug'])
        unique_products.append(p)

categories = [
  { 'name': 'Flavoured Instant', 'slug': 'flavoured-instant', 'description': 'Gourmet flavoured instant coffee powders.' },
  { 'name': 'Bundles', 'slug': 'bundles', 'description': 'Curated combo packs and bundle sets.' },
  { 'name': 'Gift Packs', 'slug': 'gift-packs', 'description': 'Specialty gift sets for coffee lovers.' },
  { 'name': 'Accessories', 'slug': 'accessories', 'description': 'Coffee frothers, tumblers, and accessories.' },
  { 'name': 'Iced Tea', 'slug': 'iced-tea', 'description': 'Refreshingly guilt-free iced teas.' },
  { 'name': 'Premium Arabica', 'slug': 'premium-arabica', 'description': 'Single-origin and blended Arabica coffee beans.' },
  { 'name': 'Limited Edition', 'slug': 'limited-edition', 'description': 'Exclusive micro-lot seasonal coffees.' },
]

coupons = [
  { 'code': 'BEANS10', 'type': 'PERCENTAGE', 'value': 10, 'minOrderAmount': 50000, 'maxDiscount': None, 'usageLimit': None, 'perUserLimit': 1, 'isActive': True },
  { 'code': 'FIRST15', 'type': 'PERCENTAGE', 'value': 15, 'minOrderAmount': 50000, 'maxDiscount': 30000, 'usageLimit': None, 'perUserLimit': 1, 'isActive': True },
  { 'code': 'COFFEE20', 'type': 'PERCENTAGE', 'value': 20, 'minOrderAmount': 100000, 'maxDiscount': 50000, 'usageLimit': 500, 'perUserLimit': 1, 'isActive': True },
]

seed_code = f"""// ============================================================
//  Spill The Beans — Database Seed
//  Contains authentic catalog products from website shop page
// ============================================================
import {{ PrismaClient }} from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

const categories = {json.dumps(categories, indent=2)};

const products = {json.dumps(unique_products, indent=2)};

const coupons = {json.dumps(coupons, indent=2)};

async function main() {{
  console.log('🌱 Starting database reset & seed...');

  // Clear existing products, cart items, order items, wishlist items to prevent foreign key errors
  console.log('🧹 Cleaning old product records...');
  await prisma.cartItem.deleteMany();
  await prisma.wishlist.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.inventoryLog.deleteMany();
  await prisma.review.deleteMany();
  await prisma.product.deleteMany();
  console.log('  ✓ Deleted old products cleanly.');

  // 1. Seed categories
  console.log('📂 Seeding categories...');
  const categoryMap = {{}};
  for (const cat of categories) {{
    const created = await prisma.category.upsert({{
      where: {{ slug: cat.slug }},
      update: {{ name: cat.name, description: cat.description }},
      create: cat,
    }});
    categoryMap[cat.slug] = created.id;
    console.log(`  ✓ ${{created.name}}`);
  }}

  // 2. Seed products
  console.log('☕ Seeding authentic products...');
  for (const product of products) {{
    const {{ categorySlug, ...productData }} = product;
    const categoryId = categoryMap[categorySlug] || categoryMap['flavoured-instant'];

    const created = await prisma.product.create({{
      data: {{
        ...productData,
        categoryId,
      }},
    }});
    console.log(`  ✓ ${{created.name}} (₹${{(created.price / 100).toLocaleString('en-IN')}})`);
  }}

  // 3. Seed coupons
  console.log('🎟️  Seeding coupons...');
  for (const coupon of coupons) {{
    await prisma.coupon.upsert({{
      where: {{ code: coupon.code }},
      update: {{}},
      create: coupon,
    }});
    console.log(`  ✓ ${{coupon.code}}`);
  }}

  console.log('\\n✅ Seed complete!');
  console.log(`  → ${{categories.length}} categories`);
  console.log(`  → ${{products.length}} products`);
  console.log(`  → ${{coupons.length}} coupons`);
}}

main()
  .catch((e) => {{
    console.error('❌ Seed failed:', e);
    process.exit(1);
  }})
  .finally(async () => {{
    await prisma.$disconnect();
  }});
"""

with open('server/prisma/seed.js', 'w', encoding='utf-8') as f:
    f.write(seed_code)

print("Generated server/prisma/seed.js successfully!")
