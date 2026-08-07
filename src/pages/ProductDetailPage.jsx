import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Star, Loader2, CheckCircle2, XCircle, ShoppingBag, Heart } from 'lucide-react';
import { getProductBySlug } from '../services/products';
import ProductGallery from '../components/products/ProductGallery';
import RelatedProducts from '../components/products/RelatedProducts';
import VariantSelector from '../components/products/VariantSelector';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import StarRating from '../components/StarRating';
import RoastBadge from '../components/RoastBadge';
import PageWrapper from '../components/PageWrapper';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { ReviewService } from '../services/ReviewService';
import { useCurrency } from '../context/CurrencyContext';
import './ProductDetailPage.css';

export default function ProductDetailPage() {
  const { slug } = useParams();
  const { user, isLoggedIn } = useAuth();
  const { formatPrice } = useCurrency();
  const { addItem, toggleDrawer } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();

  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('about');

  // Add-to-cart state
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);

  // Submit review states
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewBody, setReviewBody] = useState('');
  const [reviewsList, setReviewsList] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    if (!slug) return;

    const fetchDetail = async () => {
      try {
        setIsLoading(true);
        setError(null);
        // Reset qty when navigating to a different variant
        setQty(1);
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

  const { product, variants = [], category, reviewSummary, relatedProducts } = data || {};

  useEffect(() => {
    if (product) {
      ReviewService.getReviews().then(res => {
        if (res && res.success && Array.isArray(res.data)) {
          const productReviews = res.data.filter(
            r => r && r.product?.name?.toLowerCase() === product.name?.toLowerCase() &&
            (r.isApproved || (user && r.user?.email === user.email))
          );
          if (productReviews.length > 0) {
            setReviewsList(productReviews);
          } else {
            setReviewsList(reviewSummary?.recentReviews || []);
          }
        } else {
          setReviewsList(reviewSummary?.recentReviews || []);
        }
      }).catch(() => {
        setReviewsList(reviewSummary?.recentReviews || []);
      });
    } else if (reviewSummary) {
      setReviewsList(reviewSummary.recentReviews || []);
    }
  }, [product, reviewSummary, user]);

  // Reset review form success message when slug changes
  useEffect(() => {
    setSubmitSuccess(false);
    setSubmitError('');
    setReviewTitle('');
    setReviewBody('');
    setRating(5);
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

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!reviewTitle.trim() || !reviewBody.trim()) {
      setSubmitError('Please fill out all fields.');
      return;
    }
    setSubmitError('');
    setIsSubmitting(true);
    try {
      const res = await ReviewService.createReview({
        rating,
        title: reviewTitle,
        body: reviewBody,
        userName: user?.name || 'Gourmet Drinker',
        userEmail: user?.email || 'anonymous@example.com',
        productName: product.name
      });
      if (res.success) {
        setSubmitSuccess(true);
        setReviewTitle('');
        setReviewBody('');

        // Reload reviews
        const updated = await ReviewService.getReviews();
        if (updated.success) {
          const productReviews = updated.data.filter(
            r => r.product.name.toLowerCase() === product.name.toLowerCase() &&
            (r.isApproved || (user && r.user.email === user.email))
          );
          if (productReviews.length > 0) {
            setReviewsList(productReviews);
          }
        }
      }
    } catch (err) {
      setSubmitError(err.message || 'Failed to submit review.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddToCart = () => {
    setAdding(true);
    // Build cart item from the DB product shape
    const cartItem = {
      id: product.id,
      name: product.name,
      price: product.salePrice ? product.salePrice / 100 : product.price / 100,
      originalPrice: product.salePrice ? product.price / 100 : undefined,
      image: product.images?.[0] || '',
      quantity: qty,
    };
    for (let i = 0; i < qty; i++) addItem(cartItem);
    toggleDrawer(true);
    setTimeout(() => setAdding(false), 700);
  };

  const discount = product.salePrice
    ? Math.round(((product.price - product.salePrice) / product.price) * 100)
    : null;

  const priceInINR = product.salePrice ? product.salePrice / 100 : product.price / 100;
  const originalPriceInINR = product.salePrice ? product.price / 100 : undefined;
  const inStock = product.stock > 0;
  const wishlisted = isWishlisted(product.id);

  // Mock data for tabs
  const getIngredients = () => {
    if (product.name.toLowerCase().includes('chocolate') || product.name.toLowerCase().includes('mocha')) {
      return '100% Premium Arabica Coffee Solubles, High-grade Premium Cocoa Powder, Natural Identical Flavouring Substances.';
    }
    if (product.name.toLowerCase().includes('strawberry') || product.name.toLowerCase().includes('mango') || product.name.toLowerCase().includes('pineapple')) {
      return '100% Premium Arabica Coffee Granules, Natural Fruit Identical Flavouring Extracts.';
    }
    return '100% Premium Arabica Coffee Solubles, Natural Madagascar Vanilla Extracts.';
  };

  const getBrewSteps = () => [
    'Add 1 to 2 teaspoons (approx. 2g) of Spill The Beans instant coffee powder to your favorite mug.',
    'Pour in 150ml of hot (80°C - not boiling) water or milk.',
    'Sweeten with honey, brown sugar, or normal sugar if desired.',
    'Stir vigorously for 10 seconds to unlock the rich crema and intense aroma. Enjoy the magic!',
  ];

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

              {/* ── Variant Selector ───────────────────────────── */}
              {variants.length > 0 && (
                <VariantSelector
                  variants={variants}
                  currentFlavour={product.flavour ?? null}
                  currentSize={product.size ?? null}
                  basePath="/products"
                />
              )}

              {/* Pricing */}
              <div className="product-detail-custom__price-row">
                <span className="product-detail-custom__price-current">
                  {formatPrice(priceInINR)}
                </span>
                {originalPriceInINR && (
                  <span className="product-detail-custom__price-original">
                    {formatPrice(originalPriceInINR)}
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
                    <CheckCircle2 size={16} /> In Stock &amp; Ready to Ship
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
                {product.description || 'Our signature coffee blend, crafted with handpicked specialty grade Arabica beans sourced from premium estates in India. Roasted to perfection and instant-ready for your morning ritual.'}
              </p>

              {/* Quantity + Add to Cart + Wishlist */}
              <div className="product-detail-custom__actions-row">
                {/* Qty selector */}
                <div className="product-detail-custom__qty">
                  <button
                    id="qty-dec-pdp"
                    className="product-detail-custom__qty-btn"
                    onClick={() => setQty(q => Math.max(1, q - 1))}
                    aria-label="Decrease quantity"
                    disabled={!inStock}
                  >
                    −
                  </button>
                  <span className="product-detail-custom__qty-num">{qty}</span>
                  <button
                    id="qty-inc-pdp"
                    className="product-detail-custom__qty-btn"
                    onClick={() => setQty(q => Math.min(10, q + 1))}
                    aria-label="Increase quantity"
                    disabled={!inStock || qty >= product.stock}
                  >
                    +
                  </button>
                </div>

                <button
                  id="product-add-to-cart-pdp"
                  className={`btn btn-primary btn-lg product-detail-custom__add-btn ${adding ? 'product-detail-custom__add-btn--added' : ''}`}
                  onClick={handleAddToCart}
                  disabled={adding || !inStock}
                >
                  <ShoppingBag size={18} />
                  {adding ? 'Added!' : 'Add to Cart'}
                </button>

                <button
                  id={`wishlist-pdp-${product.id}`}
                  className={`product-detail-custom__wishlist-btn ${wishlisted ? 'product-detail-custom__wishlist-btn--active' : ''}`}
                  onClick={() => toggleWishlist(product.id)}
                  aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                >
                  <Heart size={20} fill={wishlisted ? 'currentColor' : 'none'} />
                </button>
              </div>

              {/* Trust signals */}
              <div className="product-detail-custom__trust">
                <span className="text-xs text-muted">🚚 Free shipping over {formatPrice(599)}</span>
                <span className="text-xs text-muted">• 📦 Shipped within 48h</span>
                <span className="text-xs text-muted">• 🔒 Secure checkout</span>
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
                <span className="product-detail-custom__big-num">
                  {reviewsList.length > 0
                    ? (reviewsList.reduce((acc, r) => acc + r.rating, 0) / reviewsList.length).toFixed(1)
                    : (reviewSummary?.averageRating || 4.8)}
                </span>
                <StarRating
                  rating={reviewsList.length > 0
                    ? (reviewsList.reduce((acc, r) => acc + r.rating, 0) / reviewsList.length)
                    : (reviewSummary?.averageRating || 4.8)}
                />
                <span className="text-xs text-muted" style={{ marginTop: '0.25rem' }}>
                  Based on {reviewsList.length} ratings
                </span>
              </div>
              <div className="product-detail-custom__rating-breakdown">
                {[5, 4, 3, 2, 1].map((stars) => {
                  const count = reviewsList.filter(r => r.rating === stars).length;
                  const pct = reviewsList.length > 0 ? Math.round((count / reviewsList.length) * 100) : 0;
                  return (
                    <div key={stars} className="product-detail-custom__breakdown-row">
                      <span className="text-xs text-muted">{stars} ★</span>
                      <div className="product-detail-custom__breakdown-bar">
                        <div className="product-detail-custom__breakdown-fill" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-xs text-muted">{pct}%</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent Reviews List */}
            <div className="product-detail-custom__reviews-list">
              <h4 className="heading-3 text-cream">Verified Purchase Reviews</h4>
              {reviewsList.length === 0 ? (
                <p className="text-muted">There are no reviews written for this coffee yet.</p>
              ) : (
                <div className="product-detail-custom__review-cards">
                  {reviewsList.map((rev) => (
                    <div key={rev.id} className="product-detail-custom__review-card">
                      <div className="product-detail-custom__review-header">
                        <StarRating rating={rev.rating} small />
                        <span className="text-xs text-muted">
                          {new Date(rev.createdAt).toLocaleDateString('en-IN')}
                          {!rev.isApproved && (
                            <span style={{ marginLeft: '0.5rem', color: 'var(--accent-amber)', fontSize: '0.75rem', fontWeight: 'bold' }}>
                              (Pending Moderation)
                            </span>
                          )}
                        </span>
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

            {/* Write a Review Form */}
            <div className="product-detail-custom__write-review">
              <h4 className="heading-3 text-cream">Write a Review</h4>
              {submitSuccess ? (
                <div className="review-submit-success-card">
                  <CheckCircle2 size={20} style={{ color: '#95d5b2', flexShrink: 0, marginTop: '0.15rem' }} />
                  <div>
                    <h5 style={{ fontWeight: 'bold', color: 'var(--text-cream)', margin: '0 0 0.25rem 0' }}>Review Submitted!</h5>
                    <p className="text-sm text-muted" style={{ margin: 0 }}>
                      Thank you for your feedback. Your review has been sent for moderation and will appear once approved.
                    </p>
                  </div>
                </div>
              ) : isLoggedIn ? (
                <form onSubmit={handleSubmitReview} className="product-detail-custom__review-form">
                  {submitError && <p className="text-sm" style={{ color: '#f08080', marginBottom: '1rem' }}>{submitError}</p>}

                  <div className="review-form-group">
                    <label className="text-xs text-muted" style={{ fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.25rem', display: 'block' }}>Rating</label>
                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                        >
                          <Star
                            size={20}
                            fill={(hoverRating || rating) >= star ? 'var(--accent-amber)' : 'none'}
                            color={(hoverRating || rating) >= star ? 'var(--accent-amber)' : 'var(--text-muted)'}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="review-form-group" style={{ marginTop: '1rem' }}>
                    <label className="text-xs text-muted" style={{ fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.25rem', display: 'block' }}>Review Title</label>
                    <input
                      type="text"
                      required
                      value={reviewTitle}
                      onChange={e => setReviewTitle(e.target.value)}
                      placeholder="Excellent flavour! Highly recommended."
                      className="input"
                      style={{ width: '100%', background: 'rgba(253,224,193,0.03)', border: '1px solid var(--border-subtle)', color: 'var(--text-cream)', padding: '0.55rem 0.75rem', borderRadius: '6px' }}
                    />
                  </div>

                  <div className="review-form-group" style={{ marginTop: '1rem' }}>
                    <label className="text-xs text-muted" style={{ fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.25rem', display: 'block' }}>Review Comment</label>
                    <textarea
                      required
                      rows={4}
                      value={reviewBody}
                      onChange={e => setReviewBody(e.target.value)}
                      placeholder="Write your detailed experience here..."
                      className="input"
                      style={{ width: '100%', background: 'rgba(253,224,193,0.03)', border: '1px solid var(--border-subtle)', color: 'var(--text-cream)', resize: 'vertical', padding: '0.55rem 0.75rem', borderRadius: '6px' }}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn btn-primary"
                    style={{ marginTop: '1.25rem', padding: '0.625rem 2rem', fontSize: '0.875rem' }}
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Review'}
                  </button>
                </form>
              ) : (
                <div className="review-form-login-prompt">
                  <p className="text-sm text-muted" style={{ marginBottom: '1rem' }}>You must be signed in to submit a review.</p>
                  <Link to="/auth" className="btn btn-outline btn-sm" style={{ textDecoration: 'none', display: 'inline-block' }}>
                    Sign In to Review
                  </Link>
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
