import { Helmet } from 'react-helmet-async';

export default function ProductSchema({ product }) {
  if (!product) return null;

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: product.imageUrl || product.images?.[0] || 'https://spillthebeans.in/logo.png',
    description: product.description || 'Premium coffee from Spill The Beans.',
    sku: product.sku || `STB-${product.id}`,
    mpn: product.sku || `STB-${product.id}`,
    brand: {
      '@type': 'Brand',
      name: 'Spill The Beans',
    },
    offers: {
      '@type': 'Offer',
      url: `https://spillthebeans.in/products/${product.slug || ''}`,
      priceCurrency: 'INR',
      price: ((product.price || 0) / 100).toFixed(2),
      priceValidUntil: '2027-12-31',
      itemCondition: 'https://schema.org/NewCondition',
      availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: 'Spill The Beans',
      },
    },
  };

  if (product.reviewsCount && product.rating) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: product.rating,
      reviewCount: product.reviewsCount,
      bestRating: '5',
      worstRating: '1',
    };
  }

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
}
