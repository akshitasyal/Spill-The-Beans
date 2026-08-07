import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useCurrency } from '../context/CurrencyContext';
import './ProductCard.css';

export default function ProductCard({ product, layout = 'grid' }) {
  const { addItem, toggleDrawer } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const { formatPrice } = useCurrency();
  const [adding, setAdding] = useState(false);
  const navigate = useNavigate();

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setAdding(true);
    addItem(product);
    toggleDrawer(true);
    setTimeout(() => {
      setAdding(false);
    }, 200);
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  const wishlisted = isWishlisted(product.id);

  return (
    <article
      className={`product-card ${layout === 'list' ? 'product-card--list' : ''}`}
      onClick={() => navigate(`/product/${product.slug}`)}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && navigate(`/product/${product.slug}`)}
      aria-label={`${product.name} — ₹${product.price}`}
    >
      {/* Image */}
      <div className="product-card__image-wrap">
        <img
          src={product.image}
          alt={product.name}
          className="product-card__image"
          loading="eager"
        />

        {/* Badges */}
        <div className="product-card__badges">
          {product.isLimited && <span className="badge badge-limited">Limited</span>}
          {product.isNew && <span className="badge badge-new">New</span>}
          {discount && <span className="product-card__discount-badge">Save {discount}%</span>}
        </div>

        {/* Wishlist */}
        <button
          id={`wishlist-${product.id}`}
          className={`product-card__wishlist ${wishlisted ? 'product-card__wishlist--active' : ''}`}
          onClick={handleWishlist}
          aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          aria-pressed={wishlisted}
        >
          <Heart size={16} fill={wishlisted ? 'currentColor' : 'none'} />
        </button>

        {/* Quick Add Button — slides up from bottom-right on hover */}
        {product.inStock !== false && (
          <button
            id={`add-to-cart-${product.id}`}
            className={`product-card__quick-add ${adding ? 'product-card__quick-add--added' : ''}`}
            onClick={handleAddToCart}
            disabled={adding}
            aria-label={`Quick add ${product.name} to cart`}
          >
            {adding ? '✓ Added!' : '+ Quick add'}
          </button>
        )}
      </div>
      <div className="product-card__flavour-strip" style={{ backgroundColor: product.stripColor }} />

      {/* Info */}
      <div className="product-card__info">
        <div className="product-card__title-row">
          <h3 className="product-card__name">{product.name}</h3>
          <div className="product-card__rating">
            <span className="product-card__rating-value">{product.rating || '4.8'}</span>
            <span className="product-card__rating-star">★</span>
          </div>
        </div>

        <div className="product-card__price-row">
          <span className="product-card__price-current">
            {formatPrice(product.price)}
          </span>
          {product.originalPrice && (
            <span className="product-card__price-original">
              {formatPrice(product.originalPrice)}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
