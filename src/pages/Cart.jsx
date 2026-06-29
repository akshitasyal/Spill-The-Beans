import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Minus, Trash2, ShoppingBag, ArrowRight, Tag, CheckCircle, ArrowLeft } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';
import { useAuth } from '../context/AuthContext';
import PageWrapper from '../components/PageWrapper';
import { CouponService } from '../services/CouponService';
import './Cart.css';

export default function Cart() {
  const { items, removeItem, updateQuantity, subtotal, savings, clearCart } = useCart();
  const { formatPrice } = useCurrency();
  const { user } = useAuth();
  
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(null); // stores coupon object
  const [promoError, setPromoError] = useState('');
  const [placedOrderId, setPlacedOrderId] = useState('');

  // Multi-step checkout state: 'cart', 'checkout', 'success'
  const [checkoutStep, setCheckoutStep] = useState('cart');

  // Checkout Form States
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [line1, setLine1] = useState('');
  const [line2, setLine2] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('RAZORPAY');
  const [validationError, setValidationError] = useState('');

  // Auto-fill address details if user is logged in
  useEffect(() => {
    if (user) {
      setEmail(user.email || '');
      setFullName(user.name || '');

      const allAddresses = JSON.parse(localStorage.getItem('stb_saved_addresses') || '[]');
      const defaultAddr = allAddresses.find(a => a.userEmail === user.email && a.isDefault) || allAddresses.find(a => a.userEmail === user.email);
      if (defaultAddr) {
        setFullName(defaultAddr.name);
        setPhone(defaultAddr.phone);
        setLine1(defaultAddr.line1);
        setLine2(defaultAddr.line2 || '');
        setCity(defaultAddr.city);
        setState(defaultAddr.state);
        setPincode(defaultAddr.pincode);
      }
    }
  }, [user]);

  const isFreeShippingApplied = promoApplied?.type === 'FREE_SHIPPING';
  const shipping = (subtotal >= 599 || isFreeShippingApplied) ? 0 : 99;

  let discountAmount = 0;
  if (promoApplied) {
    if (promoApplied.type === 'PERCENTAGE') {
      discountAmount = Math.round((subtotal * promoApplied.value) / 100);
      if (promoApplied.maxDiscount && discountAmount > (promoApplied.maxDiscount / 100)) {
        discountAmount = promoApplied.maxDiscount / 100;
      }
    } else if (promoApplied.type === 'FIXED') {
      discountAmount = promoApplied.value / 100;
    }
  }

  const total = subtotal + shipping - discountAmount;

  const applyPromo = async () => {
    const code = promoCode.toUpperCase().trim();
    if (!code) return;
    try {
      const res = await CouponService.validateCoupon(code, subtotal);
      if (res.success) {
        setPromoApplied(res.coupon);
        setPromoError('');
      }
    } catch (err) {
      setPromoError(err.message || 'Invalid promo code.');
      setPromoApplied(null);
    }
  };

  const handleConfirmOrder = () => {
    if (!email || !fullName || !phone || !line1 || !city || !state || !pincode) {
      setValidationError('Please fill out all required fields.');
      return;
    }
    setValidationError('');

    const idNum = Math.floor(Math.random() * 90000) + 10000;
    const orderId = `IMP${idNum}`;
    setPlacedOrderId(orderId);

    const fullAddress = `${line1}${line2 ? ', ' + line2 : ''}, ${city}, ${state} - ${pincode}`;

    // Save to tracking database in localStorage
    const savedOrders = JSON.parse(localStorage.getItem('stb_placed_orders') || '{}');
    savedOrders[orderId] = {
      id: orderId,
      status: 'CONFIRMED',
      courier: 'Delhivery',
      trackingNumber: `DEL${Math.floor(Math.random() * 90000000) + 10000000}`,
      estimatedDelivery: new Date(Date.now() + 3600000 * 24 * 3).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      address: fullAddress,
      userId: user?.email || email,
      userEmail: user?.email || email,
      steps: [
        { label: 'Order Placed', time: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) + ', ' + new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }), done: true },
        { label: 'Processing & Roasting', time: 'Pending', done: false },
        { label: 'Dispatched from Warehouse', time: 'Pending', done: false },
        { label: 'Out for Delivery', time: 'Pending', done: false },
        { label: 'Delivered', time: 'Pending', done: false },
      ]
    };
    localStorage.setItem('stb_placed_orders', JSON.stringify(savedOrders));

    // Save to admin orders database in localStorage so it appears in the Admin Portal live updates
    const adminOrders = JSON.parse(localStorage.getItem('stb_admin_detailed_orders') || '[]');
    const adminOrder = {
      id: orderId,
      userId: user?.email || email,
      customerName: fullName,
      customerEmail: email,
      customerPhone: phone,
      address: {
        line1,
        line2,
        city,
        state,
        pincode
      },
      status: 'CONFIRMED',
      paymentMethod,
      paymentStatus: paymentMethod === 'COD' ? 'PENDING' : 'PAID',
      subtotal: subtotal * 100, // in paise
      discount: discountAmount * 100, // in paise
      shippingFee: shipping * 100, // in paise
      tax: Math.round(subtotal * 0.18 * 100),
      total: total * 100,
      trackingId: null,
      courierPartner: null,
      shippingDate: null,
      estimatedDelivery: new Date(Date.now() + 3600000 * 24 * 3).toISOString(),
      deliveryDate: null,
      transactionId: paymentMethod === 'COD' ? null : `TXN-${Math.floor(Math.random() * 900000000 + 100000000)}`,
      notes: '',
      items: items.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price * 100,
        quantity: item.quantity,
        image: item.image,
        weight: item.weight
      })),
      timeline: {
        placed: new Date().toISOString(),
        confirmed: paymentMethod === 'COD' ? null : new Date().toISOString(),
        processing: null,
        packed: null,
        shipped: null,
        delivered: null
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    adminOrders.unshift(adminOrder);
    localStorage.setItem('stb_admin_detailed_orders', JSON.stringify(adminOrders));

    // Also save this address to user's saved addresses in profile if not already exists!
    if (user) {
      const allAddresses = JSON.parse(localStorage.getItem('stb_saved_addresses') || '[]');
      const addrExists = allAddresses.some(a => a.userEmail === user.email && a.line1 === line1 && a.pincode === pincode);
      if (!addrExists) {
        allAddresses.push({
          id: `addr-${Date.now()}`,
          userEmail: user.email,
          name: fullName,
          phone,
          line1,
          line2,
          city,
          state,
          pincode,
          isDefault: allAddresses.filter(a => a.userEmail === user.email).length === 0
        });
        localStorage.setItem('stb_saved_addresses', JSON.stringify(allAddresses));
      }
    }

    setCheckoutStep('success');
    clearCart();
  };

  if (checkoutStep === 'success') {
    return (
      <PageWrapper className="cart-page">
        <div className="container cart-success">
          <div className="cart-success__icon">
            <CheckCircle size={64} color="#95d5b2" strokeWidth={1.5} />
          </div>
          <h1 className="heading-2">Order Placed! 🎉</h1>
          <p className="text-body">
            Thank you for ordering from Spill The Beans. You'll receive a confirmation 
            email shortly. Your coffee will be roasted and shipped within 48 hours.
          </p>
          <div className="cart-success__order-id">
            Order ID: <strong>{placedOrderId}</strong>
          </div>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/shop" id="cart-success-shop" className="btn btn-primary btn-lg">
              Continue Shopping
            </Link>
            <Link to="/profile" id="cart-success-profile" className="btn btn-outline btn-lg">
              Go to Account
            </Link>
          </div>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper className="cart-page">
      <div className="container">
        {/* Header */}
        <div className="cart-page__header">
          <div>
            <span className="section-label">Your Selection</span>
            <h1 className="heading-1">
              {checkoutStep === 'checkout' ? 'Checkout & Shipping' : 'Shopping Cart'}
            </h1>
          </div>
          {items.length > 0 && checkoutStep === 'cart' && (
            <button id="cart-clear-btn" className="btn btn-ghost btn-sm" onClick={clearCart}>
              Clear Cart
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="cart-empty">
            <ShoppingBag size={64} strokeWidth={1} color="var(--text-subtle)" />
            <h2 className="heading-3" style={{ color: 'var(--text-muted)' }}>Your cart is empty</h2>
            <p className="text-body">Discover our exceptional coffees and find your perfect cup.</p>
            <Link to="/shop" id="cart-empty-shop" className="btn btn-primary btn-lg">
              Shop Coffee <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          <div className="cart-layout">
            {checkoutStep === 'checkout' ? (
              /* Checkout Form Column */
              <div className="checkout-form-container">
                <h2 className="checkout-section-title">Shipping & Billing Address</h2>
                <div className="checkout-grid">
                  <div className="checkout-group">
                    <label>Email Address</label>
                    <input 
                      type="email" 
                      required 
                      value={email} 
                      onChange={e => setEmail(e.target.value)} 
                      placeholder="alex@example.com"
                    />
                  </div>
                  <div className="checkout-group">
                    <label>Recipient Name</label>
                    <input 
                      type="text" 
                      required 
                      value={fullName} 
                      onChange={e => setFullName(e.target.value)} 
                      placeholder="Alex Smith"
                    />
                  </div>
                  <div className="checkout-group">
                    <label>Phone Number</label>
                    <input 
                      type="tel" 
                      required 
                      value={phone} 
                      onChange={e => setPhone(e.target.value)} 
                      placeholder="+91 98765 43210"
                    />
                  </div>
                  <div className="checkout-group span-2">
                    <label>Address Line 1</label>
                    <input 
                      type="text" 
                      required 
                      value={line1} 
                      onChange={e => setLine1(e.target.value)} 
                      placeholder="Flat, House No., Building, Street"
                    />
                  </div>
                  <div className="checkout-group span-2">
                    <label>Address Line 2 (Optional)</label>
                    <input 
                      type="text" 
                      value={line2} 
                      onChange={e => setLine2(e.target.value)} 
                      placeholder="Locality, Landmark, Area"
                    />
                  </div>
                  <div className="checkout-group">
                    <label>City</label>
                    <input 
                      type="text" 
                      required 
                      value={city} 
                      onChange={e => setCity(e.target.value)} 
                      placeholder="Bengaluru"
                    />
                  </div>
                  <div className="checkout-group">
                    <label>State</label>
                    <input 
                      type="text" 
                      required 
                      value={state} 
                      onChange={e => setState(e.target.value)} 
                      placeholder="Karnataka"
                    />
                  </div>
                  <div className="checkout-group">
                    <label>Pincode</label>
                    <input 
                      type="text" 
                      required 
                      value={pincode} 
                      onChange={e => setPincode(e.target.value)} 
                      placeholder="560034"
                    />
                  </div>
                </div>

                <h2 className="checkout-section-title" style={{ marginTop: '1.5rem' }}>Payment Method</h2>
                <div className="payment-selector-grid">
                  <div 
                    className={`payment-option-card ${paymentMethod === 'RAZORPAY' ? 'payment-option-card--active' : ''}`}
                    onClick={() => setPaymentMethod('RAZORPAY')}
                  >
                    Razorpay
                  </div>
                  <div 
                    className={`payment-option-card ${paymentMethod === 'STRIPE' ? 'payment-option-card--active' : ''}`}
                    onClick={() => setPaymentMethod('STRIPE')}
                  >
                    Stripe
                  </div>
                  <div 
                    className={`payment-option-card ${paymentMethod === 'UPI' ? 'payment-option-card--active' : ''}`}
                    onClick={() => setPaymentMethod('UPI')}
                  >
                    UPI / QR Code
                  </div>
                  <div 
                    className={`payment-option-card ${paymentMethod === 'COD' ? 'payment-option-card--active' : ''}`}
                    onClick={() => setPaymentMethod('COD')}
                  >
                    Cash on Delivery
                  </div>
                </div>
              </div>
            ) : (
              /* Items Column */
              <div className="cart-items-col">
                {items.map(item => (
                  <div key={item.id} className="cart-page-item">
                    <Link to={`/product/${item.slug}`} className="cart-page-item__image-wrap">
                      <img src={item.image} alt={item.name} className="cart-page-item__image" />
                    </Link>
                    <div className="cart-page-item__info">
                      <div className="cart-page-item__header">
                        <div>
                          <Link to={`/product/${item.slug}`} className="cart-page-item__name">
                            {item.name}
                          </Link>
                          <p className="cart-page-item__meta text-sm text-muted">
                            {item.category} · {item.weight}
                          </p>
                        </div>
                        <button
                          id={`cart-remove-${item.id}`}
                          className="cart-page-item__remove"
                          onClick={() => removeItem(item.id)}
                          aria-label={`Remove ${item.name}`}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <div className="cart-page-item__footer">
                        <div className="cart-page-item__qty">
                          <button
                            id={`cart-dec-${item.id}`}
                            className="cart-page-item__qty-btn"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            aria-label="Decrease quantity"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="cart-page-item__qty-num">{item.quantity}</span>
                          <button
                            id={`cart-inc-${item.id}`}
                            className="cart-page-item__qty-btn"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            aria-label="Increase quantity"
                            disabled={item.quantity >= 10}
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                        <div className="cart-page-item__price-wrap">
                          {item.originalPrice && (
                            <span className="cart-page-item__price-orig">
                              {formatPrice(item.originalPrice * item.quantity)}
                            </span>
                          )}
                          <span className="cart-page-item__price">
                            {formatPrice(item.price * item.quantity)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Summary Column */}
            <div className="cart-summary-col">
              <div className="cart-summary-card">
                <h2 className="cart-summary__title">Order Summary</h2>

                {checkoutStep === 'cart' && (
                  <div className="cart-promo">
                    <label className="text-sm" style={{ fontWeight: 600, color: 'var(--text-cream)' }}>
                      <Tag size={14} style={{ display: 'inline', marginRight: '0.375rem' }} />
                      Promo Code
                    </label>
                    <div className="cart-promo__input-row">
                      <input
                        id="promo-code-input"
                        type="text"
                        placeholder="Enter code (try BEANS10)"
                        value={promoCode}
                        onChange={e => setPromoCode(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && applyPromo()}
                        className="input cart-promo__input"
                        aria-label="Promo code input"
                      />
                      <button
                        id="promo-apply-btn"
                        className="btn btn-outline btn-sm"
                        onClick={applyPromo}
                      >
                        Apply
                      </button>
                    </div>
                    {promoApplied && (
                      <p className="text-sm" style={{ color: '#95d5b2' }}>
                        ✓ Coupon {promoApplied.code} applied!
                      </p>
                    )}
                    {promoError && (
                      <p className="text-sm" style={{ color: '#f08080' }}>{promoError}</p>
                    )}
                  </div>
                )}

                {/* Breakdown */}
                <div className="cart-summary__rows">
                  <div className="cart-summary__row">
                    <span className="text-sm text-muted">Subtotal</span>
                    <span className="text-sm">{formatPrice(subtotal)}</span>
                  </div>
                  {savings > 0 && (
                    <div className="cart-summary__row">
                      <span className="text-sm text-muted">Product savings</span>
                      <span className="text-sm" style={{ color: '#95d5b2' }}>-{formatPrice(savings)}</span>
                    </div>
                  )}
                  {promoApplied && discountAmount > 0 && (
                    <div className="cart-summary__row">
                      <span className="text-sm text-muted">Promo ({promoApplied.code})</span>
                      <span className="text-sm" style={{ color: '#95d5b2' }}>-{formatPrice(discountAmount)}</span>
                    </div>
                  )}
                  <div className="cart-summary__row">
                    <span className="text-sm text-muted">Shipping</span>
                    <span className="text-sm" style={{ color: shipping === 0 ? '#95d5b2' : undefined }}>
                      {shipping === 0 ? 'Free' : formatPrice(shipping)}
                    </span>
                  </div>
                  <div className="cart-summary__row cart-summary__row--total">
                    <span>Total</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                </div>

                {subtotal < 599 && checkoutStep === 'cart' && (
                  <p className="text-xs text-muted cart-summary__free-shipping">
                    Add {formatPrice(599 - subtotal)} more for free shipping
                  </p>
                )}

                {validationError && (
                  <div className="checkout-validation-error">
                    {validationError}
                  </div>
                )}

                {checkoutStep === 'cart' ? (
                  <button
                    id="cart-place-order-btn"
                    className="btn btn-primary w-full"
                    style={{ justifyContent: 'center' }}
                    onClick={() => setCheckoutStep('checkout')}
                  >
                    Place Order — {formatPrice(total)} <ArrowRight size={16} />
                  </button>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <button
                      id="cart-confirm-order-btn"
                      className="btn btn-primary w-full"
                      style={{ justifyContent: 'center' }}
                      onClick={handleConfirmOrder}
                    >
                      Confirm and Pay {formatPrice(total)} <ArrowRight size={16} />
                    </button>
                    <button
                      type="button"
                      className="checkout-back-link"
                      onClick={() => setCheckoutStep('cart')}
                    >
                      <ArrowLeft size={14} /> Back to Cart
                    </button>
                  </div>
                )}

                <div className="cart-summary__trust">
                  <span className="text-xs text-subtle">🔒 Secured checkout</span>
                  <span className="text-xs text-subtle">📦 Ships in 48h</span>
                  <span className="text-xs text-subtle">↩️ Easy returns</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
