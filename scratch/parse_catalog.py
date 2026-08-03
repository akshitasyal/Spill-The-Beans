import re
import json

with open('src/data/products.js', 'r', encoding='utf-8') as f:
    text = f.read()

# Extract category map
category_map = {
    'CATEGORIES.INSTANT': 'Flavoured Instant',
    'CATEGORIES.BUNDLE': 'Bundles',
    'CATEGORIES.ACCESSORIES': 'Accessories',
    'CATEGORIES.ICED_TEA': 'Iced Tea',
    'CATEGORIES.ARABICA': 'Premium Arabica',
}

# Regex to extract product objects
# We can find all { ... } blocks inside export const products = [...]
start = text.find('export const products = [')
end = text.find('];', start)
products_block = text[start:end]

# Extract product objects
raw_products = []
import re

# Split by id:
items = re.split(r'\{\s*id:\s*\d+,', products_block)

parsed = []
for item in items[1:]:
    def get_val(key, default=''):
        m = re.search(r"%s:\s*['\"](.*?)['\"]" % key, item)
        return m.group(1) if m else default

    def get_num(key, default=0):
        m = re.search(r"%s:\s*([\d\.]+)" % key, item)
        return float(m.group(1)) if m else default

    def get_bool(key, default=False):
        m = re.search(r"%s:\s*(true|false)" % key, item)
        return m.group(1) == 'true' if m else default

    def get_arr(key):
        m = re.search(r"%s:\s*\[(.*?)\]" % key, item, re.DOTALL)
        if not m: return []
        raw = m.group(1)
        return [x.strip(" '\"\n") for x in raw.split(',') if x.strip(" '\"\n")]

    name = get_val('name')
    slug = get_val('slug')
    category_raw = get_val('category')
    price_rupees = get_num('price')
    orig_price_rupees = get_num('originalPrice')
    weight = get_val('weight')
    roast = get_val('roast')
    origin = get_val('origin')
    process = get_val('process')
    description = get_val('description')
    highlights = get_arr('highlights')
    flavour_notes = get_arr('flavourNotes')
    is_bestseller = get_bool('isBestseller')
    is_new = get_bool('isNew')
    is_limited = get_bool('isLimited')
    in_stock = get_bool('inStock', True)

    category_slug_map = {
        'CATEGORIES.INSTANT': 'flavoured-instant',
        'CATEGORIES.BUNDLE': 'bundles',
        'CATEGORIES.ACCESSORIES': 'accessories',
        'CATEGORIES.ICED_TEA': 'iced-tea',
    }

    parsed.append({
        'name': name,
        'slug': slug,
        'description': description,
        'price': int(price_rupees * 100), # in paise
        'salePrice': int(orig_price_rupees * 100) if orig_price_rupees else None,
        'images': [f"/assets/{slug}.png"],
        'stock': 100 if in_stock else 0,
        'weight': weight or '50g',
        'roast': roast or 'Medium',
        'origin': origin or 'India',
        'process': process or 'Spray Dried',
        'flavourNotes': flavour_notes or ['Coffee'],
        'highlights': highlights or ['100% Premium Arabica'],
        'isActive': True,
        'isFeatured': is_bestseller or is_new,
        'isBestseller': is_bestseller,
        'isNew': is_new,
        'isLimited': is_limited,
        'categorySlug': category_slug_map.get(category_raw, 'flavoured-instant')
    })

print(f"Parsed {len(parsed)} products for seed.js")
with open('scratch/seed_products.json', 'w', encoding='utf-8') as f:
    json.dump(parsed, f, indent=2)
print("Saved to scratch/seed_products.json")
