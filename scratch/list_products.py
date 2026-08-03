import re
import json

with open('src/data/products.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Match each product block
# Find all name, slug, price, category, stock, images
blocks = content.split('// ── ')

products = []
for b in blocks:
    name_m = re.search(r"name:\s*['\"](.*?)['\"]", b)
    slug_m = re.search(r"slug:\s*['\"](.*?)['\"]", b)
    price_m = re.search(r"price:\s*([\d\.]+)", b)
    sale_price_m = re.search(r"originalPrice:\s*([\d\.]+)", b)
    cat_m = re.search(r"category:\s*(CATEGORIES\.\w+|['\"].*?['\"])", b)
    weight_m = re.search(r"weight:\s*['\"](.*?)['\"]", b)
    roast_m = re.search(r"roast:\s*['\"](.*?)['\"]", b)

    if name_m and slug_m:
        name = name_m.group(1)
        slug = slug_m.group(1)
        price = float(price_m.group(1)) if price_m else 0
        sale_price = float(sale_price_m.group(1)) if sale_price_m else None
        cat = cat_m.group(1) if cat_m else 'Flavoured Instant'
        weight = weight_m.group(1) if weight_m else '100g'
        roast = roast_m.group(1) if roast_m else 'Medium'

        products.append({
            'name': name,
            'slug': slug,
            'price': price,
            'originalPrice': sale_price,
            'category': cat,
            'weight': weight,
            'roast': roast
        })

print(f"Total products extracted: {len(products)}")
print(json.dumps(products, indent=2))
