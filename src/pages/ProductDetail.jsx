import { useParams, useNavigate, Link } from 'react-router-dom';
import { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, ShoppingBag, Heart, Star, Package, Coffee, Zap, Globe, CheckCircle2 } from 'lucide-react';
import { getProductBySlug, getRelatedProducts, products as allProducts, CATEGORIES } from '../data/products';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import StarRating from '../components/StarRating';
import RoastBadge from '../components/RoastBadge';
import ProductCard from '../components/ProductCard';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import PageWrapper from '../components/PageWrapper';
import { useAuth } from '../context/AuthContext';
import { ReviewService } from '../services/ReviewService';
import { NotificationService } from '../services/NotificationService';
import { useCurrency } from '../context/CurrencyContext';
import './ProductDetail.css';

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const product = getProductBySlug(slug);
  const { addItem, toggleDrawer } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const { formatPrice } = useCurrency();
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  const relatedRef = useScrollAnimation();

  const { user, isLoggedIn } = useAuth();

  const currentFlavour = product?.flavour ?? null;
  const currentSize = product?.weight ?? null;

  // ── Variant selector logic (built from local data) ─────────────────
  // Only show variants for Flavoured Instant single-serve products
  const siblings = useMemo(() => {
    if (!product || product.category !== CATEGORIES.INSTANT) return [];
    // Group siblings: same category, exclude bundles (weight contains 'x')
    return allProducts.filter(
      p => p.category === CATEGORIES.INSTANT &&
           !p.weight?.toLowerCase().includes('x') &&
           !p.weight?.toLowerCase().includes('pack')
    );
  }, [product]);

  // Flavours filtered by currently selected size — only show flavours that exist for that size
  const flavours = useMemo(() => {
    const seen = new Set();
    const result = [];
    for (const p of siblings) {
      if (p.weight === currentSize && p.flavour && !seen.has(p.flavour)) {
        seen.add(p.flavour);
        result.push(p.flavour);
      }
    }
    return result;
  }, [siblings, currentSize]);

  const sizes = useMemo(() => {
    const seen = new Set();
    const result = [];
    for (const p of siblings) {
      if (p.weight && !seen.has(p.weight)) {
        seen.add(p.weight);
        result.push(p.weight);
      }
    }
    return result;
  }, [siblings]);

  const findSibling = (flavour, size) =>
    siblings.find(p => p.flavour === flavour && p.weight === size) ?? null;

  const handleFlavourClick = (flavour) => {
    if (flavour === currentFlavour) return;
    // Flavours shown are already filtered to currentSize, so target always exists
    const target = findSibling(flavour, currentSize);
    if (target) navigate(`/product/${target.slug}`);
  };

  const handleSizeClick = (size) => {
    if (size === currentSize) return;
    // Try to preserve current flavour in the new size
    let target = findSibling(currentFlavour, size);
    // Fallback: current flavour not in new size → navigate to first available flavour for that size
    if (!target) target = siblings.find(p => p.weight === size) ?? null;
    if (target) navigate(`/product/${target.slug}`);
  };

  // A size is available if ANY sibling exists for it (so both size buttons are always enabled)
  const isSizeAvailable = (size) =>
    siblings.some(p => p.weight === size);
  // ── End variant selector logic ─────────────────────────────────────

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
            // fallback mock reviews
            setReviewsList([
              { id: 'mock-1', rating: 5, title: 'Love this coffee!', body: 'Absolutely love this coffee! The flavour is incredible and it arrived so quickly.', createdAt: new Date(Date.now() - 3600000 * 24 * 14).toISOString(), user: { name: 'Priya R.' }, isApproved: true },
              { id: 'mock-2', rating: 5, title: 'Premium quality', body: 'Premium quality, beautiful packaging. Will definitely reorder.', createdAt: new Date(Date.now() - 3600000 * 24 * 30).toISOString(), user: { name: 'Rohan M.' }, isApproved: true },
              { id: 'mock-3', rating: 4, title: 'Great coffee', body: 'Great coffee, exactly as described. Would love a larger size option.', createdAt: new Date(Date.now() - 3600000 * 24 * 30).toISOString(), user: { name: 'Ananya K.' }, isApproved: true }
            ]);
          }
        }
      }).catch(() => {
        // fallback mock reviews
        setReviewsList([
          { id: 'mock-1', rating: 5, title: 'Love this coffee!', body: 'Absolutely love this coffee! The flavour is incredible and it arrived so quickly.', createdAt: new Date(Date.now() - 3600000 * 24 * 14).toISOString(), user: { name: 'Priya R.' }, isApproved: true },
          { id: 'mock-2', rating: 5, title: 'Premium quality', body: 'Premium quality, beautiful packaging. Will definitely reorder.', createdAt: new Date(Date.now() - 3600000 * 24 * 30).toISOString(), user: { name: 'Rohan M.' }, isApproved: true },
          { id: 'mock-3', rating: 4, title: 'Great coffee', body: 'Great coffee, exactly as described. Would love a larger size option.', createdAt: new Date(Date.now() - 3600000 * 24 * 30).toISOString(), user: { name: 'Ananya K.' }, isApproved: true }
        ]);
      });
    }
  }, [product, user]);

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

        // Trigger New Review Notification
        try {
          NotificationService.createNotification(
            'NEW_REVIEW',
            `New ${rating}-star review on ${product.name} from ${user?.name || 'Gourmet Drinker'}`
          );
        } catch (notifErr) {
          console.error(notifErr);
        }

        // Reload reviews to show the new pending/approved review in local list
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

  if (!product) {
    return (
      <>
        <Helmet>
          <title>Product Not Found | Spill The Beans</title>
          <meta name="description" content="The requested coffee could not be found. Explore our selection of premium coffee instead." />
        </Helmet>
        <PageWrapper className="product-detail-page" style={{ paddingTop: 'var(--header-total)' }}>
          <div className="container" style={{ padding: 'var(--space-5xl) var(--space-xl)', textAlign: 'center' }}>
            <h1 className="heading-2" style={{ color: 'var(--text-muted)' }}>Coffee not found</h1>
            <Link to="/shop" className="btn btn-primary" style={{ marginTop: '2rem' }}>Back to Shop</Link>
          </div>
        </PageWrapper>
      </>
    );
  }

  const related = getRelatedProducts(product, 4);
  const wishlisted = isWishlisted(product.id);
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  const handleAddToCart = () => {
    setAdding(true);
    addItem(product, qty);
    toggleDrawer(true);
    setTimeout(() => {
      setAdding(false);
    }, 600);
  };

  return (
    <>
      <Helmet>
        <title>{product.name} | Spill The Beans</title>
        <meta name="description" content={product.subtitle || product.description} />
        <meta property="og:title" content={`${product.name} | Spill The Beans`} />
        <meta property="og:description" content={product.subtitle || product.description} />
        <meta property="og:image" content={product.image} />
        <meta property="og:type" content="product" />
      </Helmet>
      <PageWrapper className="product-detail-page">
      <div className="container">
        {/* Breadcrumb */}
        <div className="product-detail__breadcrumb">
          <button onClick={() => navigate(-1)} className="btn btn-ghost btn-sm" id="product-back-btn">
            <ArrowLeft size={16} /> Back
          </button>
          <span className="text-xs text-subtle">
            <Link to="/shop" className="product-detail__bc-link">Shop</Link>
            {' / '}
            <Link to={`/shop?cat=${encodeURIComponent(product.category)}`} className="product-detail__bc-link">
              {product.category}
            </Link>
            {' / '}
            {product.name}
          </span>
        </div>

        {/* Main Layout */}
        <div className="product-detail__grid">
          {/* Image */}
          <div className="product-detail__image-col">
            <div className="product-detail__image-frame">
              <img
                src={product.image}
                alt={product.name}
                className="product-detail__image"
              />
              {product.isLimited && (
                <div className="product-detail__limited-badge">
                  <span>⚡ Limited Edition</span>
                </div>
              )}
            </div>
            {/* Thumbnails placeholder */}
            <div className="product-detail__thumbs">
              {[1,2,3].map(i => (
                <div key={i} className="product-detail__thumb">
                  <img src={product.image} alt={`${product.name} view ${i}`} />
                </div>
              ))}
            </div>
          </div>

          {/* Info */}
          <div className="product-detail__info-col">
            <div className="product-detail__badges">
              <span className="badge badge-amber">{product.category}</span>
              <RoastBadge roast={product.roast} />
              {product.isNew && <span className="badge badge-new">New</span>}
              {product.isBestseller && <span className="badge badge-amber">Bestseller</span>}
            </div>

            <h1 className="product-detail__name">{product.name}</h1>
            <p className="product-detail__subtitle text-body">{product.subtitle}</p>

            <div className="product-detail__rating">
              <StarRating rating={product.rating} showNumber />
              <span className="text-sm text-muted">({product.reviewCount} reviews)</span>
            </div>

            {/* ── Variant Selector ──────────────────────────────── */}
            {siblings.length > 0 && (
              <div className="pd-variant-selector">
                {/* Flavour row */}
                {flavours.length > 0 && (
                  <div className="pd-variant-selector__group">
                    <p className="pd-variant-selector__label">
                      Flavour: <strong>{currentFlavour}</strong>
                    </p>
                    <div className="pd-variant-selector__grid">
                      {flavours.map(flavour => (
                        <button
                          key={flavour}
                          id={`flavour-${flavour.toLowerCase().replace(/\s+/g, '-')}`}
                          className={[
                            'pd-variant-btn',
                            flavour === currentFlavour ? 'pd-variant-btn--active' : ''
                          ].join(' ')}
                          onClick={() => handleFlavourClick(flavour)}
                          aria-pressed={flavour === currentFlavour}
                        >
                          {flavour}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Size row */}
                {sizes.length > 0 && (
                  <div className="pd-variant-selector__group">
                    <p className="pd-variant-selector__label">
                      Size: <strong>{currentSize}</strong>
                    </p>
                    <div className="pd-variant-selector__grid pd-variant-selector__grid--size">
                      {sizes.map(size => {
                        const available = isSizeAvailable(size);
                        const isActive  = size === currentSize;
                        return (
                          <button
                            key={size}
                            id={`size-${size.replace(/\s+/g, '-').toLowerCase()}`}
                            className={[
                              'pd-variant-btn',
                              isActive ? 'pd-variant-btn--active' : '',
                              !available && !isActive ? 'pd-variant-btn--disabled' : '',
                            ].join(' ')}
                            onClick={() => handleSizeClick(size)}
                            disabled={!available && !isActive}
                            aria-pressed={isActive}
                          >
                            {size}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Price */}
            <div className="product-detail__price-row">
              <span className="product-detail__price">{formatPrice(product.price)}</span>
              {product.originalPrice && (
                <span className="product-detail__price-orig">{formatPrice(product.originalPrice)}</span>
              )}
              {discount && (
                <span className="badge badge-amber">{discount}% OFF</span>
              )}
              <span className="text-sm text-muted">/ {product.weight}</span>
            </div>



            {/* Limited Stock */}
            {product.isLimited && product.remainingQty && (
              <div className="product-detail__stock-alert">
                <div className="product-detail__stock-bar">
                  <div
                    className="product-detail__stock-fill"
                    style={{ width: `${(product.remainingQty / product.limitedQty) * 100}%` }}
                  />
                </div>
                <span className="text-sm" style={{ color: '#f08080' }}>
                  ⚡ Only <strong>{product.remainingQty}</strong> bags remaining out of {product.limitedQty}
                </span>
              </div>
            )}

            {/* Add to Cart */}
            <div className="product-detail__actions">
              <div className="product-detail__qty">
                <button
                  id="qty-dec-detail"
                  onClick={() => setQty(q => Math.max(1, q - 1))}
                  className="product-detail__qty-btn"
                  aria-label="Decrease quantity"
                >−</button>
                <span className="product-detail__qty-num">{qty}</span>
                <button
                  id="qty-inc-detail"
                  onClick={() => setQty(q => Math.min(10, q + 1))}
                  className="product-detail__qty-btn"
                  aria-label="Increase quantity"
                >+</button>
              </div>
              <button
                id="product-add-to-cart"
                className={`btn btn-primary btn-lg product-detail__add-btn ${adding ? 'product-detail__add-btn--added' : ''}`}
                onClick={handleAddToCart}
                disabled={adding || !product.inStock}
              >
                <ShoppingBag size={18} />
                {adding ? 'Added!' : 'Add to Cart'}
              </button>
              <button
                id={`wishlist-detail-${product.id}`}
                className={`product-detail__wishlist-btn ${wishlisted ? 'product-detail__wishlist-btn--active' : ''}`}
                onClick={() => toggleWishlist(product.id)}
                aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
              >
                <Heart size={20} fill={wishlisted ? 'currentColor' : 'none'} />
              </button>
            </div>

            {/* Trust */}
            <div className="product-detail__trust">
              <span className="text-xs text-muted">🚚 Free shipping over {formatPrice(599)}</span>
              <span className="text-xs text-muted">• 📦 Shipped within 48h</span>
              <span className="text-xs text-muted">• 🔒 Secure checkout</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="product-detail__tabs">
          <div className="product-detail__tab-list" role="tablist">
            {['details', 'highlights', 'brewing', 'reviews'].map(tab => (
              <button
                key={tab}
                id={`tab-${tab}`}
                role="tab"
                aria-selected={activeTab === tab}
                className={`product-detail__tab ${activeTab === tab ? 'product-detail__tab--active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          <div className="product-detail__tab-content" role="tabpanel">
            {activeTab === 'details' && (
              <div className="product-detail__tab-pane">
                <p className="text-body">{product.description}</p>
              </div>
            )}
            {activeTab === 'highlights' && (
              <div className="product-detail__tab-pane">
                <ul className="product-detail__highlights">
                  {product.highlights.map((h, i) => (
                    <li key={i} className="product-detail__highlight-item">
                      <span className="product-detail__highlight-dot" />
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
                {product.contents && (
                  <div style={{ marginTop: '1.5rem' }}>
                    <p className="text-sm" style={{ fontWeight: 600, color: 'var(--text-cream)', marginBottom: '0.75rem' }}>What's Included:</p>
                    <ul className="product-detail__highlights">
                      {product.contents.map((c, i) => (
                        <li key={i} className="product-detail__highlight-item">
                          <span className="product-detail__highlight-dot" />
                          <span>{c}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
            {activeTab === 'brewing' && (
              <div className="product-detail__tab-pane">
                <p className="text-body">{product.servingSuggestion}</p>
                <div className="product-detail__brewing-tips">
                  <p className="text-sm" style={{ fontWeight: 600, color: 'var(--text-cream)' }}>General Tips:</p>
                  <ul style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <li className="text-sm text-muted">• Use freshly ground coffee for best results</li>
                    <li className="text-sm text-muted">• Store in a cool, dry place away from light</li>
                    <li className="text-sm text-muted">• Consume within 4 weeks of opening</li>
                    <li className="text-sm text-muted">• Water temperature: 90–95°C for most brewing methods</li>
                  </ul>
                </div>
              </div>
            )}
            {activeTab === 'reviews' && (
              <div className="product-detail__tab-pane">
                <div className="product-detail__reviews-summary">
                  <div className="product-detail__rating-big">
                    <span>
                      {reviewsList.length > 0 
                        ? (reviewsList.reduce((acc, r) => acc + r.rating, 0) / reviewsList.length).toFixed(1)
                        : product.rating.toFixed(1)}
                    </span>
                    <StarRating 
                      rating={reviewsList.length > 0 
                        ? (reviewsList.reduce((acc, r) => acc + r.rating, 0) / reviewsList.length)
                        : product.rating} 
                    />
                    <span className="text-sm text-muted">{reviewsList.length} reviews</span>
                  </div>
                </div>
                
                <div className="product-detail__review-list">
                  {reviewsList.map((rev) => (
                    <div key={rev.id} className="product-detail__review-card">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <p style={{ fontWeight: 600, color: 'var(--text-cream)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            {rev.user?.name || 'Anonymous'}
                            {!rev.isApproved && (
                              <span style={{ color: 'var(--accent-amber)', fontSize: '0.75rem', fontWeight: 'bold' }}>
                                (Pending Moderation)
                              </span>
                            )}
                          </p>
                          <StarRating rating={rev.rating} small />
                        </div>
                        <span className="text-xs text-subtle">
                          {new Date(rev.createdAt).toLocaleDateString('en-IN')}
                        </span>
                      </div>
                      <h5 style={{ fontWeight: 600, color: 'var(--text-cream)', fontSize: '0.875rem', marginTop: '0.5rem', marginBottom: '0.25rem' }}>
                        {rev.title}
                      </h5>
                      <p className="text-sm text-muted">{rev.body}</p>
                    </div>
                  ))}
                </div>

                {/* Write a Review Form */}
                <div className="product-detail__write-review-section" style={{ marginTop: '3rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '2rem' }}>
                  <h4 className="heading-3 text-cream" style={{ marginBottom: '1rem' }}>Write a Review</h4>
                  {submitSuccess ? (
                    <div className="review-submit-success-card" style={{ display: 'flex', gap: '1rem', background: 'rgba(149, 213, 178, 0.08)', border: '1px solid rgba(149, 213, 178, 0.2)', padding: '1.25rem', borderRadius: '6px', maxWidth: '600px' }}>
                      <CheckCircle2 size={20} style={{ color: '#95d5b2', flexShrink: 0, marginTop: '0.15rem' }} />
                      <div>
                        <h5 style={{ fontWeight: 'bold', color: 'var(--text-cream)', margin: '0 0 0.25rem 0' }}>Review Submitted!</h5>
                        <p className="text-sm text-muted" style={{ margin: 0 }}>
                          Thank you for your feedback. Your review has been sent for moderation and will appear once approved.
                        </p>
                      </div>
                    </div>
                  ) : isLoggedIn ? (
                    <form onSubmit={handleSubmitReview} style={{ maxWidth: '600px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {submitError && <p className="text-sm" style={{ color: '#f08080' }}>{submitError}</p>}
                      
                      <div>
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

                      <div>
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

                      <div>
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
                        style={{ marginTop: '0.5rem', alignSelf: 'flex-start', padding: '0.625rem 2rem', fontSize: '0.875rem' }}
                      >
                        {isSubmitting ? 'Submitting...' : 'Submit Review'}
                      </button>
                    </form>
                  ) : (
                    <div className="review-form-login-prompt" style={{ background: 'rgba(253, 224, 193, 0.02)', border: '1px dashed rgba(255,255,255,0.1)', padding: '1.5rem', borderRadius: '6px', textAlign: 'center', maxWidth: '600px' }}>
                      <p className="text-sm text-muted" style={{ marginBottom: '1rem' }}>You must be signed in to submit a review.</p>
                      <Link to="/auth" className="btn btn-outline btn-sm" style={{ textDecoration: 'none', display: 'inline-block' }}>
                        Sign In to Review
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <section className="product-detail__related" ref={relatedRef}>
            <div className="section-header fade-in-up">
              <span className="section-label">You May Also Like</span>
              <h2 className="heading-2">More {product.category}</h2>
              <div className="section-divider" />
            </div>
            <div className="products-grid">
              {related.map(p => (
                <div key={p.id} className="fade-in-up">
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </PageWrapper>
  </>
);
}
