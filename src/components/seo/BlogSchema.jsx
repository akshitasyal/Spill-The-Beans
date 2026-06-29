import { Helmet } from 'react-helmet-async';

export default function BlogSchema({ article }) {
  if (!article) return null;

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: article.title,
    image: article.imageUrl || 'https://spillthebeans.in/og-image.jpg',
    genre: 'Coffee culture',
    keywords: 'coffee, instant coffee, Arabica, premium coffee',
    publisher: {
      '@type': 'Organization',
      name: 'Spill The Beans',
      logo: {
        '@type': 'ImageObject',
        url: 'https://spillthebeans.in/logo.png',
      },
    },
    url: `https://spillthebeans.in/blog/${article.slug || ''}`,
    datePublished: article.publishedAt || new Date().toISOString(),
    dateCreated: article.createdAt || new Date().toISOString(),
    author: {
      '@type': 'Person',
      name: article.author || 'Spill The Beans Editor',
    },
    description: article.summary || article.body?.substring(0, 150) || 'Spill The Beans article.',
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
}
