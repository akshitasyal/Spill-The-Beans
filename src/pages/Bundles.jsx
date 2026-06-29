import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowRight, Package } from 'lucide-react';
import { getProductsByCategory, CATEGORIES } from '../data/products';
import ProductCard from '../components/ProductCard';
import NewsletterSection from '../components/NewsletterSection';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import PageWrapper from '../components/PageWrapper';
import './CategoryPage.css';

export default function Bundles() {
  const bundles = getProductsByCategory(CATEGORIES.BUNDLE);
  const ref = useScrollAnimation();

  return (
    <>
      <Helmet>
        <title>Coffee Bundles | Spill The Beans</title>
        <meta name="description" content="Save more and taste more with Spill The Beans coffee bundles. Handpicked combinations designed to elevate your daily ritual." />
      </Helmet>
      <PageWrapper className="category-page" ref={ref}>




        {/* Bundle Products */}
        <section className="section-sm" style={{ paddingTop: '1.5rem' }}>
          <div className="container">
            <div className="section-header">
              <span className="section-label">All Bundles</span>
              <h2 className="heading-1">Pick Your Bundle</h2>
              <div className="section-divider" />
            </div>
            <div className="products-grid">
              {bundles.map(product => (
                <div key={product.id}>
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
            <div style={{ textAlign: 'center', marginTop: 'var(--space-2xl)' }}>
              <Link to="/shop" id="bundles-browse-all" className="btn btn-outline btn-lg">
                Browse All Products <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>

        {/* Bundle CTA Strip */}
        <section className="bundle-cta-strip">
          <div className="container bundle-cta-strip__content">
            <div>
              <h2 className="heading-2">Can't Decide?</h2>
              <p className="text-body">Let us build a custom bundle for you based on your taste profile.</p>
            </div>
            <a
              href="mailto:hello@spillthebeans.in?subject=Custom Bundle Request"
              id="bundles-custom-request"
              className="btn btn-primary btn-lg"
            >
              Request Custom Bundle <ArrowRight size={16} />
            </a>
          </div>
        </section>

        <NewsletterSection />
      </PageWrapper>
    </>
  );
}
