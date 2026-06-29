import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowRight, Inbox } from 'lucide-react';
import { getCategories } from '../services/products';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import PageWrapper from '../components/PageWrapper';
import './CategoryPage.css';

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCats = async () => {
      try {
        setIsLoading(true);
        const res = await getCategories();
        if (res.success) {
          setCategories(res.data.filter(c => c.slug !== 'limited-edition'));
        } else {
          setError('Failed to load categories');
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError('Failed to connect to the server');
      } finally {
        setIsLoading(false);
      }
    };
    fetchCats();
  }, []);

  return (
    <>
      <Helmet>
        <title>Coffee Categories | Spill The Beans</title>
        <meta name="description" content="Explore Spill The Beans premium coffee collections. Browse categories of instant coffee powders, premium coffee bundles, and curated gift boxes." />
      </Helmet>

      <Breadcrumbs items={[{ label: 'Categories' }]} />

      <PageWrapper className="category-page">
        {/* Hero */}
        <section className="category-hero">
          <div className="category-hero__glow" />
          <div className="container category-hero__content">
            <div>
              <span className="section-label">Our Collections</span>
              <h1 className="heading-display">Coffee Categories</h1>
              <p className="text-body category-hero__desc">
                From bold instant blends ready in seconds to exclusive aged clay canister micro-lots — choose your coffee ritual.
              </p>
            </div>
          </div>
        </section>

        {/* Categories Grid */}
        <section className="section">
          <div className="container">
            {isLoading ? (
              <div className="category-grid-loading">
                {Array.from({ length: 3 }).map((_, idx) => (
                  <div key={idx} className="category-card-skeleton" />
                ))}
              </div>
            ) : error ? (
              <div className="category-error-state">
                <p className="text-lg text-muted">{error}</p>
                <button onClick={() => window.location.reload()} className="btn btn-outline">
                  Try Again
                </button>
              </div>
            ) : categories.length === 0 ? (
              <div className="category-empty-state">
                <Inbox size={48} className="text-muted" />
                <h2 className="heading-3">No Categories Available</h2>
                <p className="text-body">We are currently updating our shelves. Check back shortly!</p>
              </div>
            ) : (
              <div className="category-grid-custom">
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    to={`/products?category=${cat.slug}`}
                    className="category-card-custom"
                    style={{ backgroundImage: cat.image ? `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.85)), url(${cat.image})` : undefined }}
                  >
                    <div className="category-card-custom__content">
                      <div>
                        <h3 className="category-card-custom__title">{cat.name}</h3>
                        <p className="category-card-custom__desc">{cat.description || 'Premium select coffee series'}</p>
                      </div>
                      <div className="category-card-custom__footer">
                        <span className="category-card-custom__count">
                          {cat.productCount || 0} {cat.productCount === 1 ? 'Product' : 'Products'}
                        </span>
                        <span className="category-card-custom__link">
                          Browse Collection <ArrowRight size={16} />
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      </PageWrapper>
    </>
  );
}
