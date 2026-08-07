// ============================================================
//  Backfill Script — Populate baseProduct, flavour, size
//  Run with: node scripts/backfill-variants.mjs
// ============================================================
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

// Maps slug keyword → flavour label
const FLAVOUR_MAP = [
  { key: 'mocha-pe-chauka',            flavour: 'Mocha' },
  { key: 'raat-ki-rani-espresso',      flavour: 'Espresso' },
  { key: 'masti-bhari-strawberry',     flavour: 'Strawberry' },
  { key: 'nawabi-pistachio',           flavour: 'Pistachio' },
  { key: 'pyaarbhari-chocolate-raspberry', flavour: 'Chocolate Raspberry' },
  { key: 'vichaar-over-vanilla',       flavour: 'Vanilla' },
  { key: 'caramel-ka-kamal',           flavour: 'Caramel' },
  { key: 'nutkhat-hazelnut',           flavour: 'Hazelnut' },
  { key: 'pal-pal-pineapple',          flavour: 'Pineapple' },
  { key: 'keep-calm-with-kacha-aam',   flavour: 'Kaccha Aam' },
];

const SIZE_MAP = [
  { key: '-50g',  size: '50g' },
  { key: '-100g', size: '100g' },
  { key: '-50gm', size: '50g' },
  { key: '-100gm', size: '100g' },
  { key: '-50gms', size: '50g' },
  { key: '-100gms', size: '100g' },
];

const BASE_PRODUCT = 'Instant Coffee';

function extractFlavour(slug) {
  for (const { key, flavour } of FLAVOUR_MAP) {
    if (slug.startsWith(key) || slug.includes(key)) return flavour;
  }
  return null;
}

function extractSize(slug) {
  for (const { key, size } of SIZE_MAP) {
    if (slug.endsWith(key)) return size;
  }
  return null;
}

async function backfill() {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    select: { id: true, slug: true, name: true, baseProduct: true, flavour: true, size: true },
  });

  console.log(`Found ${products.length} products. Starting backfill...\n`);

  let updated = 0;
  let skipped = 0;

  for (const product of products) {
    // Skip if already populated
    if (product.flavour && product.size && product.baseProduct) {
      console.log(`  SKIP  [already set] ${product.slug}`);
      skipped++;
      continue;
    }

    const flavour = extractFlavour(product.slug);
    const size = extractSize(product.slug);

    // Only tag single-serve flavoured coffees (not bundles/combos/triples)
    const isBundle = product.slug.includes('combo') || 
                     product.slug.includes('triple') ||
                     product.slug.includes('duo') ||
                     product.slug.includes('gift') ||
                     product.slug.includes('pack') ||
                     product.slug.includes('frothing') ||
                     product.slug.includes('tumbler') ||
                     product.slug.includes('iced-tea');

    if (isBundle || !flavour || !size) {
      console.log(`  SKIP  [no match/bundle] ${product.slug}`);
      skipped++;
      continue;
    }

    await prisma.product.update({
      where: { id: product.id },
      data: { baseProduct: BASE_PRODUCT, flavour, size },
    });

    console.log(`  SET   ${product.slug} → flavour="${flavour}", size="${size}", baseProduct="${BASE_PRODUCT}"`);
    updated++;
  }

  console.log(`\nDone. Updated: ${updated}, Skipped: ${skipped}`);
  await prisma.$disconnect();
}

backfill().catch(async (err) => {
  console.error(err);
  await prisma.$disconnect();
  process.exit(1);
});
