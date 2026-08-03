import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CheckCircle2, ShieldCheck, Truck, CreditCard, ArrowRight, ArrowLeft, PackageCheck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import PageWrapper from '../components/PageWrapper';
import './Checkout.css';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export default function Checkout() {
  const { items, subtotal, savings, clearCart } = useCart();
  const { user, isLoggedIn } = useAuth();
  const { formatPrice } = useCurrency();
  const navigate = useNavigate();

  // Multi-step state: 1 = Shipping, 2 = Delivery & Payment, 3 = Confirmation
  const [step, setStep] = useState(1);

  // Form states
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState('');
  const [line1, setLine1] = useState('');
  const [line2, setLine2] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');

  // Shipping & Payment choice
  const [deliveryMethod, setDeliveryMethod] = useState('STANDARD'); // STANDARD | EXPRESS
  const [paymentMethod, setPaymentMethod] = useState('UPI'); // UPI | RAZORPAY | STRIPE | COD

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [completedOrder, setCompletedOrder] = useState(null);

  // Auto-fill address from saved addresses for logged-in user
  useEffect(() => {
    if (user) {
      const allAddresses = JSON.parse(localStorage.getItem('stb_saved_addresses') || '[]');
      const defaultAddr =
        allAddresses.find((a) => a.userEmail === user.email && a.isDefault) ||
        allAddresses.find((a) => a.userEmail === user.email);
      if (defaultAddr) {
        setName(defaultAddr.name || user?.name || '');
        setPhone(defaultAddr.phone || '');
        setLine1(defaultAddr.line1 || '');
        setLine2(defaultAddr.line2 || '');
        setCity(defaultAddr.city || '');
        setState(defaultAddr.state || '');
        setPincode(defaultAddr.pincode || '');
      }
    }
  }, [user]);

  // Shipping fee calculation
  const shippingFee = deliveryMethod === 'EXPRESS' ? 149 : (subtotal >= 599 ? 0 : 99);
  const grandTotal = subtotal + shippingFee;

  const handleNextToPayment = (e) => {
    e.preventDefault();
    setError('');
    if (!name || !phone || !line1 || !city || !state || !pincode) {
      setError('Please fill in all required shipping details.');
      return;
    }
    setStep(2);
  };

  const handlePlaceOrder = async () => {
    setLoading(true);
    setError('');

    try {
      const clerkId = user.clerkId || user.id;
      const payload = {
        userEmail: user.email,
        name,
        phone,
        line1,
        line2,
        city,
        state,
        pincode,
        paymentMethod,
        items: items.map(i => ({
          slug: i.slug,
          name: i.name,
          image: typeof i.image === 'string' ? i.image : '',
          price: i.price,
          quantity: i.quantity,
          variant: i.variant || null,
        })),
      };

      const res = await fetch(`${API_BASE}/api/orders/checkout-direct`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-clerk-id': clerkId,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to place order.');
      }

      setCompletedOrder({
        orderNumber: data.data?.id || `STB-${Math.floor(100000 + Math.random() * 900000)}`,
        date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
        items: [...items],
        total: grandTotal,
        address: `${line1}, ${city}, ${state} — ${pincode}`,
      });

      clearCart();
      setStep(3);
    } catch (err) {
      setError(err.message || 'Error processing order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageWrapper title="Secure Checkout — Spill The Beans">
      <div className="checkout-page">
        <div className="checkout-container">
          <div className="checkout-header">
            <h1 className="checkout-title">Express Checkout</h1>
            <p className="checkout-subtitle">Freshly roasted coffee delivered directly to your doorstep</p>

            {step < 3 && (
              <div className="checkout-stepper">
                <div className={`checkout-step-item ${step === 1 ? 'active' : 'completed'}`}>
                  <div className="checkout-step-num">{step > 1 ? '✓' : '1'}</div>
                  <span>Shipping Address</span>
                </div>
                <div className="checkout-step-divider" />
                <div className={`checkout-step-item ${step === 2 ? 'active' : ''}`}>
                  <div className="checkout-step-num">2</div>
                  <span>Delivery & Payment</span>
                </div>
                <div className="checkout-step-divider" />
                <div className="checkout-step-item">
                  <div className="checkout-step-num">3</div>
                  <span>Order Confirmation</span>
                </div>
              </div>
            )}
          </div>

          {step === 3 && completedOrder ? (
            <div className="checkout-success-box">
              <div className="checkout-success-icon">
                <CheckCircle2 size={40} />
              </div>
              <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '2rem', marginBottom: '0.5rem', color: '#FFF' }}>
                Order Placed Successfully!
              </h2>
              <p style={{ color: '#A89B95', marginBottom: '1.5rem' }}>
                Thank you for choosing Spill The Beans! Your fresh coffee is being prepared for roasting.
              </p>

              <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '12px', padding: '1.25rem', margin: '0 auto 2rem', textAlign: 'left', maxWidth: '400px', border: '1px solid rgba(255,255,255,0.08)' }}>
                <p style={{ margin: '0 0 0.5rem', color: '#D4A359', fontWeight: 600 }}>Order Number: #{completedOrder.orderNumber}</p>
                <p style={{ margin: '0 0 0.5rem', color: '#C2B4AA', fontSize: '0.9rem' }}>Date: {completedOrder.date}</p>
                <p style={{ margin: '0 0 0.5rem', color: '#C2B4AA', fontSize: '0.9rem' }}>Delivery To: {completedOrder.address}</p>
                <p style={{ margin: '0', color: '#FFF', fontWeight: 700, fontSize: '1rem' }}>Total Amount: {formatPrice(completedOrder.total)}</p>
              </div>

              {/* Order Tracking Timeline Preview */}
              <div style={{ margin: '2rem 0', padding: '1.5rem', background: 'rgba(0,0,0,0.3)', borderRadius: '14px', border: '1px solid rgba(212,163,89,0.2)' }}>
                <h4 style={{ margin: '0 0 1rem', color: '#D4A359', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <PackageCheck size={18} /> Tracking Timeline
                </h4>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#A89B95' }}>
                  <div style={{ color: '#4ADE80', fontWeight: 700 }}>● Placed</div>
                  <div>○ Packed</div>
                  <div>○ Roasted</div>
                  <div>○ Dispatched</div>
                  <div>○ Delivered</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                <Link to="/profile" className="checkout-place-btn" style={{ textDecoration: 'none', width: 'auto', padding: '0.8rem 1.5rem' }}>
                  View My Orders
                </Link>
                <Link to="/shop" style={{ textDecoration: 'none', color: '#C2B4AA', padding: '0.8rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  Continue Shopping <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          ) : (
            <div className="checkout-grid">
              <div className="checkout-main">
                {error && (
                  <div style={{ padding: '0.8rem 1rem', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)', borderRadius: '12px', color: '#FCA5A5', marginBottom: '1.5rem' }}>
                    {error}
                  </div>
                )}

                {step === 1 && (
                  <form onSubmit={handleNextToPayment} className="checkout-section-card">
                    <h3 className="checkout-card-title">
                      <Truck size={20} style={{ color: '#D4A359' }} /> Shipping Address
                    </h3>

                    <div className="checkout-form-grid">
                      <div className="checkout-field checkout-field-full">
                        <label>Full Name *</label>
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Akshat Syal"
                          required
                        />
                      </div>

                      <div className="checkout-field checkout-field-full">
                        <label>Phone Number *</label>
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+91 98765 43210"
                          required
                        />
                      </div>

                      <div className="checkout-field checkout-field-full">
                        <label>Address Line 1 *</label>
                        <input
                          type="text"
                          value={line1}
                          onChange={(e) => setLine1(e.target.value)}
                          placeholder="House / Flat No., Building Name, Street"
                          required
                        />
                      </div>

                      <div className="checkout-field checkout-field-full">
                        <label>Address Line 2 (Optional)</label>
                        <input
                          type="text"
                          value={line2}
                          onChange={(e) => setLine2(e.target.value)}
                          placeholder="Landmark or Suite"
                        />
                      </div>

                      <div className="checkout-field">
                        <label>City *</label>
                        <input
                          type="text"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          placeholder="Bengaluru"
                          required
                        />
                      </div>

                      <div className="checkout-field">
                        <label>State *</label>
                        <input
                          type="text"
                          value={state}
                          onChange={(e) => setState(e.target.value)}
                          placeholder="Karnataka"
                          required
                        />
                      </div>

                      <div className="checkout-field checkout-field-full">
                        <label>Pincode *</label>
                        <input
                          type="text"
                          value={pincode}
                          onChange={(e) => setPincode(e.target.value)}
                          placeholder="560001"
                          required
                        />
                      </div>
                    </div>

                    <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                      <button type="submit" className="checkout-place-btn" style={{ width: 'auto', padding: '0.85rem 2rem' }}>
                        Continue to Payment <ArrowRight size={18} />
                      </button>
                    </div>
                  </form>
                )}

                {step === 2 && (
                  <div>
                    <div className="checkout-section-card">
                      <h3 className="checkout-card-title">
                        <Truck size={20} style={{ color: '#D4A359' }} /> Select Delivery Speed
                      </h3>
                      <div className="checkout-options-list">
                        <div
                          className={`checkout-option-card ${deliveryMethod === 'STANDARD' ? 'selected' : ''}`}
                          onClick={() => setDeliveryMethod('STANDARD')}
                        >
                          <div className="checkout-option-left">
                            <input type="radio" checked={deliveryMethod === 'STANDARD'} readOnly />
                            <div className="checkout-option-info">
                              <h4>Standard Delivery (3-5 Days)</h4>
                              <p>Fresh roast dispatched within 24 hours</p>
                            </div>
                          </div>
                          <span style={{ fontWeight: 700, color: subtotal >= 599 ? '#4ADE80' : '#FFF' }}>
                            {subtotal >= 599 ? 'FREE' : formatPrice(99)}
                          </span>
                        </div>

                        <div
                          className={`checkout-option-card ${deliveryMethod === 'EXPRESS' ? 'selected' : ''}`}
                          onClick={() => setDeliveryMethod('EXPRESS')}
                        >
                          <div className="checkout-option-left">
                            <input type="radio" checked={deliveryMethod === 'EXPRESS'} readOnly />
                            <div className="checkout-option-info">
                              <h4>Express Priority Delivery (1-2 Days)</h4>
                              <p>Priority batch roast & express courier tracking</p>
                            </div>
                          </div>
                          <span style={{ fontWeight: 700, color: '#FFF' }}>{formatPrice(149)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="checkout-section-card">
                      <h3 className="checkout-card-title">
                        <CreditCard size={20} style={{ color: '#D4A359' }} /> Payment Method
                      </h3>
                      <div className="checkout-options-list">
                        <div
                          className={`checkout-option-card ${paymentMethod === 'UPI' ? 'selected' : ''}`}
                          onClick={() => setPaymentMethod('UPI')}
                        >
                          <div className="checkout-option-left">
                            <input type="radio" checked={paymentMethod === 'UPI'} readOnly />
                            <div className="checkout-option-info">
                              <h4>UPI (GPay / PhonePe / Paytm)</h4>
                              <p>Fastest zero-fee payment option</p>
                            </div>
                          </div>
                        </div>

                        <div
                          className={`checkout-option-card ${paymentMethod === 'RAZORPAY' ? 'selected' : ''}`}
                          onClick={() => setPaymentMethod('RAZORPAY')}
                        >
                          <div className="checkout-option-left">
                            <input type="radio" checked={paymentMethod === 'RAZORPAY'} readOnly />
                            <div className="checkout-option-info">
                              <h4>Credit / Debit Card / NetBanking</h4>
                              <p>Secure SSL encrypted transaction</p>
                            </div>
                          </div>
                        </div>

                        <div
                          className={`checkout-option-card ${paymentMethod === 'COD' ? 'selected' : ''}`}
                          onClick={() => setPaymentMethod('COD')}
                        >
                          <div className="checkout-option-left">
                            <input type="radio" checked={paymentMethod === 'COD'} readOnly />
                            <div className="checkout-option-info">
                              <h4>Cash On Delivery</h4>
                              <p>Pay upon delivery at your doorstep</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        style={{ background: 'none', border: 'none', color: '#C2B4AA', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                      >
                        <ArrowLeft size={16} /> Back to Shipping
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar Summary */}
              <div className="checkout-summary-card">
                <h3 className="checkout-summary-title">Order Summary</h3>

                <div className="checkout-items-list">
                  {items.map((item, idx) => (
                    <div className="checkout-item-row" key={idx}>
                      <img src={item.image} alt={item.name} className="checkout-item-img" />
                      <div className="checkout-item-details">
                        <div className="checkout-item-name">{item.name}</div>
                        <div className="checkout-item-sub">Qty: {item.quantity} × {formatPrice(item.price)}</div>
                      </div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                        {formatPrice(item.price * item.quantity)}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="checkout-summary-totals">
                  <div className="checkout-total-row">
                    <span>Subtotal</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>

                  <div className="checkout-total-row">
                    <span>Shipping</span>
                    <span>{shippingFee === 0 ? 'FREE' : formatPrice(shippingFee)}</span>
                  </div>

                  {savings > 0 && (
                    <div className="checkout-total-row" style={{ color: '#4ADE80' }}>
                      <span>Discount Savings</span>
                      <span>-{formatPrice(savings)}</span>
                    </div>
                  )}

                  <div className="checkout-total-row grand-total">
                    <span>Total Amount</span>
                    <span>{formatPrice(grandTotal)}</span>
                  </div>
                </div>

                {step === 2 && (
                  <button
                    className="checkout-place-btn"
                    onClick={handlePlaceOrder}
                    disabled={loading || items.length === 0}
                  >
                    {loading ? (
                      'Processing Order...'
                    ) : (
                      <>
                        <ShieldCheck size={18} /> Place Order ({formatPrice(grandTotal)})
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </PageWrapper>
  );
}
