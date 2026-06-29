import { useParams, useNavigate, Link } from 'react-router-dom';
import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, ShoppingBag, Heart, Star, Package, Coffee, Zap, Globe, Share2, ChevronDown } from 'lucide-react';
import { getProductBySlug, getRelatedProducts } from '../data/products';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import StarRating from '../components/StarRating';
import RoastBadge from '../components/RoastBadge';
import ProductCard from '../components/ProductCard';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import PageWrapper from '../components/PageWrapper';
import './ProductDetail.css';

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const product = getProductBySlug(slug);
  const { addItem, toggleDrawer } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  const relatedRef = useScrollAnimation();

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

  const related = getRelatedProducts(product);
  const wishlisted = isWishlisted(product.id);
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  const handleAddToCart = () => {
    setAdding(true);
    for (let i = 0; i < qty; i++) addItem(product);
    setTimeout(() => {
      setAdding(false);
      toggleDrawer(true);
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

            {/* Price */}
            <div className="product-detail__price-row">
              <span className="product-detail__price">₹{product.price.toLocaleString('en-IN')}</span>
              {product.originalPrice && (
                <span className="product-detail__price-orig">₹{product.originalPrice.toLocaleString('en-IN')}</span>
              )}
              {discount && (
                <span className="badge badge-amber">{discount}% OFF</span>
              )}
              <span className="text-sm text-muted">/ {product.weight}</span>
            </div>

            {/* Flavour Notes */}
            {product.flavourNotes && (
              <div className="product-detail__flavour">
                <p className="text-xs text-muted" style={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Flavour Notes</p>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.375rem' }}>
                  {product.flavourNotes.map(note => (
                    <span key={note} className="badge badge-dark">{note}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Meta Info */}
            <div className="product-detail__meta-grid">
              {product.origin && (
                <div className="product-detail__meta-item">
                  <Globe size={14} /> <span>Origin: <strong>{product.origin}</strong></span>
                </div>
              )}
              {product.process && (
                <div className="product-detail__meta-item">
                  <Coffee size={14} /> <span>Process: <strong>{product.process}</strong></span>
                </div>
              )}
              {product.caffeineLevel && (
                <div className="product-detail__meta-item">
                  <Zap size={14} /> <span>Caffeine: <strong>{product.caffeineLevel}</strong></span>
                </div>
              )}
              {product.weight && (
                <div className="product-detail__meta-item">
                  <Package size={14} /> <span>Weight: <strong>{product.weight}</strong></span>
                </div>
              )}
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
              <span className="text-xs text-muted">🚚 Free shipping over ₹599</span>
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
                    <span>{product.rating.toFixed(1)}</span>
                    <StarRating rating={product.rating} />
                    <span className="text-sm text-muted">{product.reviewCount} reviews</span>
                  </div>
                </div>
                <div className="product-detail__review-list">
                  {[
                    { name: 'Priya R.', rating: 5, text: 'Absolutely love this coffee! The flavour is incredible and it arrived so quickly.', date: '2 weeks ago' },
                    { name: 'Rohan M.', rating: 5, text: 'Premium quality, beautiful packaging. Will definitely reorder.', date: '1 month ago' },
                    { name: 'Ananya K.', rating: 4, text: 'Great coffee, exactly as described. Would love a larger size option.', date: '1 month ago' },
                  ].map((r, i) => (
                    <div key={i} className="product-detail__review-card">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <p style={{ fontWeight: 600, color: 'var(--text-cream)', fontSize: '0.9rem' }}>{r.name}</p>
                          <StarRating rating={r.rating} small />
                        </div>
                        <span className="text-xs text-subtle">{r.date}</span>
                      </div>
                      <p className="text-sm text-muted" style={{ marginTop: '0.5rem' }}>{r.text}</p>
                    </div>
                  ))}
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
