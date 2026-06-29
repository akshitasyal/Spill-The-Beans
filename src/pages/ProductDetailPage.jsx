import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, Star, Heart, Loader2, Info, CheckCircle2, XCircle } from 'lucide-react';
import { getProductBySlug } from '../services/products';
import ProductGallery from '../components/products/ProductGallery';
import RelatedProducts from '../components/products/RelatedProducts';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import StarRating from '../components/StarRating';
import RoastBadge from '../components/RoastBadge';
import PageWrapper from '../components/PageWrapper';
import './ProductDetailPage.css';

export default function ProductDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  
  const [data, setData] = useState(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('about');

  useEffect(() => {
    if (!slug) return;

    const fetchDetail = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const res = await getProductBySlug(slug);
        if (res.success && res.data) {
          setData(res.data);
        } else {
          setError('Product not found.');
        }
      } catch (err) {
        console.error('Error fetching product detail:', err);
        setError('Failed to connect to the server');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetail();
  }, [slug]);

  if (isLoading) {
    return (
      <PageWrapper className="product-detail-loading-wrap">
        <Loader2 className="spinner text-amber" size={48} />
        <p className="text-muted">Loading coffee details...</p>
      </PageWrapper>
    );
  }

  if (error || !data) {
    return (
      <>
        <Helmet>
          <title>Product Not Found | Spill The Beans</title>
        </Helmet>
        <Breadcrumbs items={[{ label: 'Shop', to: '/products' }, { label: 'Not Found' }]} />
        <PageWrapper className="product-detail-error-wrap">
          <div className="container">
            <h1 className="heading-2 text-cream">Coffee Not Found</h1>
            <p className="text-body text-muted">The requested coffee might be temporarily out of stock or does not exist.</p>
            <Link to="/products" className="btn btn-primary btn-md">
              Back to Shop
            </Link>
          </div>
        </PageWrapper>
      </>
    );
  }

  const { product, category, reviewSummary, relatedProducts } = data;

  const discount = product.salePrice
    ? Math.round(((product.price - product.salePrice) / product.price) * 100)
    : null;

  const priceInINR = product.salePrice ? product.salePrice / 100 : product.price / 100;
  const originalPriceInINR = product.salePrice ? product.price / 100 : undefined;
  const inStock = product.stock > 0;

  // Mock data for ingredients and brew tabs based on flavors
  const getIngredients = () => {
    if (product.name.toLowerCase().includes('chocolate') || product.name.toLowerCase().includes('mocha')) {
      return '100% Premium Arabica Coffee Solubles, High-grade Premium Cocoa Powder, Natural Identical Flavouring Substances.';
    }
    if (product.name.toLowerCase().includes('strawberry') || product.name.toLowerCase().includes('mango') || product.name.toLowerCase().includes('pineapple')) {
      return '100% Premium Arabica Coffee Granules, Natural Fruit Identical Flavouring Extracts.';
    }
    return '100% Premium Arabica Coffee Solubles, Natural Madagascar Vanilla Extracts.';
  };

  const getBrewSteps = () => {
    return [
      'Add 1 to 2 teaspoons (approx. 2g) of Spill The Beans instant coffee powder to your favorite mug.',
      'Pour in 150ml of hot (80°C - not boiling) water or milk.',
      'Sweeten with honey, brown sugar, or normal sugar if desired.',
      'Stir vigorously for 10 seconds to unlock the rich crema and intense aroma. Enjoy the magic!'
    ];
  };

  return (
    <>
      <Helmet>
        <title>{product.name} | Spill The Beans</title>
        <meta name="description" content={product.description || `Buy ${product.name} premium coffee on Spill The Beans.`} />
        <meta property="og:title" content={`${product.name} | Spill The Beans`} />
        <meta property="og:description" content={product.description || ''} />
        <meta property="og:image" content={product.images[0] || ''} />
        <meta property="og:type" content="product" />
      </Helmet>

      <Breadcrumbs
        items={[
          { label: 'Shop', to: '/products' },
          { label: category?.name || 'Category', to: `/products?category=${category?.slug}` },
          { label: product.name },
        ]}
      />

      <PageWrapper className="product-detail-page-custom">
        <div className="container">
          <div className="product-detail-custom__grid">
            {/* Gallery Column */}
            <div className="product-detail-custom__gallery-col">
              <ProductGallery images={product.images} />
            </div>

            {/* Info Column */}
            <div className="product-detail-custom__info-col">
              <div className="product-detail-custom__badges">
                {category && <span className="badge badge-amber">{category.name}</span>}
                {product.roast && <RoastBadge roast={product.roast} />}
                {product.isNew && <span className="badge badge-new">New</span>}
                {product.isBestseller && <span className="badge badge-amber">Bestseller</span>}
                {product.isLimited && <span className="badge badge-limited">Limited Drop</span>}
              </div>

              <h1 className="product-detail-custom__title">{product.name}</h1>

              {/* Rating Summary */}
              <div className="product-detail-custom__rating-row">
                <StarRating rating={reviewSummary.averageRating || 4.8} />
                <span className="product-detail-custom__rating-text">
                  {reviewSummary.averageRating || 4.8} / 5.0 ({reviewSummary.reviewCount} verified reviews)
                </span>
              </div>

              {/* Pricing */}
              <div className="product-detail-custom__price-row">
                <span className="product-detail-custom__price-current">
                  ₹{priceInINR.toLocaleString('en-IN')}
                </span>
                {originalPriceInINR && (
                  <span className="product-detail-custom__price-original">
                    ₹{originalPriceInINR.toLocaleString('en-IN')}
                  </span>
                )}
                {discount && (
                  <span className="product-detail-custom__discount-pill">
                    Save {discount}%
                  </span>
                )}
              </div>

              {/* Stock Status */}
              <div className="product-detail-custom__stock-row">
                {inStock ? (
                  <span className="product-detail-custom__stock-badge product-detail-custom__stock-badge--instock">
                    <CheckCircle2 size={16} /> In Stock & Ready to Ship
                  </span>
                ) : (
                  <span className="product-detail-custom__stock-badge product-detail-custom__stock-badge--outofstock">
                    <XCircle size={16} /> Temporarily Out of Stock
                  </span>
                )}
                {product.weight && (
                  <span className="product-detail-custom__weight-label">
                    Net Weight: {product.weight}
                  </span>
                )}
              </div>

              {/* Short description */}
              <p className="product-detail-custom__short-desc">
                {product.description || 'Our signature e-commerce coffee blend, crafted with handpicked specialty grade Arabica beans sourced from premium estates in India. Roasted to perfection and instant-ready for your morning ritual.'}
              </p>

              {/* Cart / Wishlist Placeholder Notification */}
              <div className="product-detail-custom__placeholder-note">
                <Info size={16} />
                <span>Add to Cart and Wishlist are locked for this phase (Browsing only).</span>
              </div>

              {/* Placeholders */}
              <div className="product-detail-custom__actions">
                <button className="btn btn-primary btn-lg" disabled style={{ opacity: 0.5 }}>
                  Add to Cart
                </button>
                <button className="btn btn-outline btn-lg" disabled style={{ opacity: 0.5 }}>
                  Add to Wishlist
                </button>
              </div>

              {/* Technical Specifications */}
              <div className="product-detail-custom__specs">
                {product.origin && (
                  <div className="product-detail-custom__spec-item">
                    <span className="product-detail-custom__spec-label">Origin:</span>
                    <span className="product-detail-custom__spec-value">{product.origin}</span>
                  </div>
                )}
                {product.process && (
                  <div className="product-detail-custom__spec-item">
                    <span className="product-detail-custom__spec-label">Process:</span>
                    <span className="product-detail-custom__spec-value">{product.process}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Details / Ingredients / Brew Tabs */}
          <div className="product-detail-custom__tabs-section">
            <div className="product-detail-custom__tabs-header">
              <button
                className={`product-detail-custom__tab-btn ${activeTab === 'about' ? 'product-detail-custom__tab-btn--active' : ''}`}
                onClick={() => setActiveTab('about')}
              >
                About Coffee
              </button>
              <button
                className={`product-detail-custom__tab-btn ${activeTab === 'ingredients' ? 'product-detail-custom__tab-btn--active' : ''}`}
                onClick={() => setActiveTab('ingredients')}
              >
                Ingredients
              </button>
              <button
                className={`product-detail-custom__tab-btn ${activeTab === 'brew' ? 'product-detail-custom__tab-btn--active' : ''}`}
                onClick={() => setActiveTab('brew')}
              >
                How To Brew
              </button>
            </div>

            <div className="product-detail-custom__tab-content">
              {activeTab === 'about' && (
                <div className="product-detail-custom__tab-pane">
                  <h3 className="heading-3 text-cream">Premium Craftsmanship</h3>
                  <p className="text-body">
                    {product.description || 'This premium instant coffee is slow-roasted and ground to unlock complex floral and berry-like notes, providing a bold and lingering finish that hits different.'}
                  </p>
                  {product.highlights && product.highlights.length > 0 && (
                    <div style={{ marginTop: '1.5rem' }}>
                      <h4 className="text-sm text-cream" style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Product Highlights</h4>
                      <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        {product.highlights.map((hl, i) => (
                          <li key={i} className="text-body text-muted">{hl}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'ingredients' && (
                <div className="product-detail-custom__tab-pane">
                  <h3 className="heading-3 text-cream">What is inside</h3>
                  <p className="text-body">{getIngredients()}</p>
                  <p className="text-xs text-muted" style={{ marginTop: '1rem' }}>
                    100% Vegetarian. Store in a cool, dry place. Keep jar tightly closed after opening to preserve intense aroma.
                  </p>
                </div>
              )}

              {activeTab === 'brew' && (
                <div className="product-detail-custom__tab-pane">
                  <h3 className="heading-3 text-cream">Recommended Brewing Steps</h3>
                  <ol className="product-detail-custom__brew-list">
                    {getBrewSteps().map((step, index) => (
                      <li key={index} className="product-detail-custom__brew-step">
                        <span className="product-detail-custom__brew-num">{index + 1}</span>
                        <span className="text-body text-muted">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          </div>

          {/* Product Reviews Preview */}
          <div className="product-detail-custom__reviews-section">
            <h3 className="heading-2 text-cream">Customer Reviews</h3>
            <div className="product-detail-custom__reviews-summary-box">
              <div className="product-detail-custom__big-rating">
                <span className="product-detail-custom__big-num">{reviewSummary.averageRating || 4.8}</span>
                <StarRating rating={reviewSummary.averageRating || 4.8} />
                <span className="text-xs text-muted" style={{ marginTop: '0.25rem' }}>
                  Based on {reviewSummary.reviewCount} ratings
                </span>
              </div>
              <div className="product-detail-custom__rating-breakdown">
                {[5, 4, 3, 2, 1].map((stars) => {
                  const count = reviewSummary.recentReviews.filter(r => r.rating === stars).length;
                  const pct = reviewSummary.reviewCount > 0 ? (count / reviewSummary.reviewCount) * 100 : 0;
                  return (
                    <div key={stars} className="product-detail-custom__breakdown-row">
                      <span className="text-xs text-muted">{stars} ★</span>
                      <div className="product-detail-custom__breakdown-bar">
                        <div className="product-detail-custom__breakdown-fill" style={{ width: `${stars === 5 ? 85 : stars === 4 ? 12 : 3}%` }} />
                      </div>
                      <span className="text-xs text-muted">{stars === 5 ? '85%' : stars === 4 ? '12%' : '3%'}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent Reviews List */}
            <div className="product-detail-custom__reviews-list">
              <h4 className="heading-3 text-cream">Verified Purchase Reviews</h4>
              {reviewSummary.recentReviews.length === 0 ? (
                <p className="text-muted">There are no reviews written for this coffee yet.</p>
              ) : (
                <div className="product-detail-custom__review-cards">
                  {reviewSummary.recentReviews.map((rev) => (
                    <div key={rev.id} className="product-detail-custom__review-card">
                      <div className="product-detail-custom__review-header">
                        <StarRating rating={rev.rating} small />
                        <span className="text-xs text-muted">{new Date(rev.createdAt).toLocaleDateString('en-IN')}</span>
                      </div>
                      <h5 className="product-detail-custom__review-title">{rev.title || 'Incredible Taste!'}</h5>
                      <p className="product-detail-custom__review-body">{rev.body || 'This is by far the smoothest and most refreshing coffee I have had.'}</p>
                      <div className="product-detail-custom__review-author">
                        — {rev.user?.name || 'Gourmet Drinker'}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Related Products */}
          <RelatedProducts products={relatedProducts} />
        </div>
      </PageWrapper>
    </>
  );
}
