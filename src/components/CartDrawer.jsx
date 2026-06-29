import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';
import './CartDrawer.css';

export default function CartDrawer() {
  const { items, isOpen, toggleDrawer, removeItem, updateQuantity, subtotal, savings, itemCount } = useCart();
  const drawerRef = useRef(null);
  const { formatPrice } = useCurrency();

  // Close on Escape
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape' && isOpen) toggleDrawer(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, toggleDrawer]);

  // Trap focus
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      drawerRef.current?.querySelector('[data-first-focusable]')?.focus();
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const shipping = subtotal >= 599 ? 0 : 99;
  const total = subtotal + shipping;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`cart-backdrop ${isOpen ? 'cart-backdrop--open' : ''}`}
        onClick={() => toggleDrawer(false)}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <div
        ref={drawerRef}
        className={`cart-drawer ${isOpen ? 'cart-drawer--open' : ''}`}
        role="dialog"
        aria-label="Shopping cart"
        aria-modal="true"
      >
        {/* Header */}
        <div className="cart-drawer__header">
          <div className="cart-drawer__title-wrap">
            <ShoppingBag size={20} />
            <h2 className="cart-drawer__title">Cart</h2>
            {itemCount > 0 && <span className="cart-drawer__count">{itemCount}</span>}
          </div>
          <button
            id="cart-close-btn"
            className="cart-drawer__close"
            onClick={() => toggleDrawer(false)}
            data-first-focusable
            aria-label="Close cart"
          >
            <X size={20} />
          </button>
        </div>

        {/* Free Shipping Banner */}
        {subtotal > 0 && subtotal < 599 && (
          <div className="cart-drawer__shipping-banner">
            <span>Add <strong>{formatPrice(599 - subtotal)}</strong> more for free shipping!</span>
            <div className="cart-drawer__shipping-progress">
              <div
                className="cart-drawer__shipping-fill"
                style={{ width: `${Math.min((subtotal / 599) * 100, 100)}%` }}
              />
            </div>
          </div>
        )}
        {subtotal >= 599 && (
          <div className="cart-drawer__shipping-banner cart-drawer__shipping-banner--free">
            🎉 You've unlocked free shipping!
          </div>
        )}

        {/* Items */}
        <div className="cart-drawer__items">
          {items.length === 0 ? (
            <div className="cart-drawer__empty">
              <ShoppingBag size={48} strokeWidth={1} />
              <p>Your cart is empty</p>
              <p className="text-sm text-muted">Time to discover exceptional coffee</p>
              <Link
                to="/shop"
                className="btn btn-primary btn-sm"
                onClick={() => toggleDrawer(false)}
                id="cart-shop-link"
              >
                Shop Now
              </Link>
            </div>
          ) : (
            items.map(item => (
              <div key={item.id} className="cart-item">
                <div className="cart-item__image-wrap">
                  <img src={item.image} alt={item.name} className="cart-item__image" loading="lazy" />
                </div>
                <div className="cart-item__info">
                  <p className="cart-item__name">{item.name}</p>
                  <p className="cart-item__meta text-xs text-muted">{item.category} · {item.weight}</p>
                  <div className="cart-item__footer">
                    <div className="cart-item__qty">
                      <button
                        className="cart-item__qty-btn"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        aria-label="Decrease quantity"
                        id={`qty-dec-${item.id}`}
                      >
                        <Minus size={12} />
                      </button>
                      <span className="cart-item__qty-num">{item.quantity}</span>
                      <button
                        className="cart-item__qty-btn"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        aria-label="Increase quantity"
                        id={`qty-inc-${item.id}`}
                        disabled={item.quantity >= 10}
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                    <span className="cart-item__price">{formatPrice(item.price * item.quantity)}</span>
                  </div>
                </div>
                <button
                  className="cart-item__remove"
                  onClick={() => removeItem(item.id)}
                  aria-label={`Remove ${item.name}`}
                  id={`remove-${item.id}`}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="cart-drawer__footer">
            {savings > 0 && (
              <div className="cart-drawer__savings">
                <span className="text-sm">You save</span>
                <span className="text-sm" style={{ color: '#95d5b2' }}>{formatPrice(savings)}</span>
              </div>
            )}
            <div className="cart-drawer__summary">
              <div className="cart-drawer__row">
                <span className="text-sm text-muted">Subtotal</span>
                <span className="text-sm">{formatPrice(subtotal)}</span>
              </div>
              <div className="cart-drawer__row">
                <span className="text-sm text-muted">Shipping</span>
                <span className="text-sm" style={{ color: shipping === 0 ? '#95d5b2' : undefined }}>
                  {shipping === 0 ? 'Free' : formatPrice(shipping)}
                </span>
              </div>
              <div className="cart-drawer__row cart-drawer__row--total">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>
            <Link
              to="/cart"
              className="btn btn-primary w-full"
              id="cart-checkout-btn"
              onClick={() => toggleDrawer(false)}
              style={{ justifyContent: 'center' }}
            >
              Proceed to Checkout <ArrowRight size={16} />
            </Link>
            <button
              className="btn btn-ghost w-full text-center"
              style={{ justifyContent: 'center', marginTop: '0.5rem' }}
              onClick={() => toggleDrawer(false)}
              id="cart-continue-btn"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </>
  );
}
