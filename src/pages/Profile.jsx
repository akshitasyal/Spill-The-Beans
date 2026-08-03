import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../context/AuthContext';
import { Package, MapPin, ChevronRight, Plus, Trash2, Star } from 'lucide-react';
import PageWrapper from '../components/PageWrapper';
import { ReviewService } from '../services/ReviewService';
import { NotificationService } from '../services/NotificationService';
import { useCurrency } from '../context/CurrencyContext';
import './Profile.css';

function formatOrderForTracking(order) {
  if (!order) return null;
  
  const status = order.status || 'CONFIRMED';
  const isEarlyStage = ['CONFIRMED', 'PENDING', 'PLACED'].includes(status) && !order.courierPartner && !order.courier;

  const courier = order.courierPartner || order.courier || (isEarlyStage ? 'Pending Dispatch' : 'Delhivery Express');
  const trackingNumber = order.trackingId || order.trackingNumber || (isEarlyStage ? 'Pending' : 'DEL90184021');

  // Format estimated delivery
  const estDeliveryStr = order.estimatedDelivery
    ? new Date(order.estimatedDelivery).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : new Date(new Date(order.createdAt || Date.now()).getTime() + 3600000 * 24 * 3).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  // Format address
  const addressStr = typeof order.address === 'object'
    ? (() => { const a = order.address || {}; return `${a.line1 || a.street || ''}${a.line2 ? ', ' + a.line2 : ''}, ${a.city || ''}, ${a.state || ''} - ${a.pincode || a.zip || ''}`; })()
    : (order.address || '');

  const normalizedItems = (order.items || []).map(item => ({
    ...item,
    price: item.price > 1000 ? item.price / 100 : item.price
  }));
  const normalizedTotal = order.total > 1000 ? order.total / 100 : order.total;

  return {
    id: order.id,
    status: status,
    courier: courier,
    trackingNumber: trackingNumber,
    estimatedDelivery: estDeliveryStr,
    address: addressStr,
    items: normalizedItems,
    total: normalizedTotal,
    createdAt: order.createdAt,
    steps: order.steps || []
  };
}

function formatOrderDisplayId(order) {
  if (!order) return 'DEL16810175';
  if (typeof order === 'string') {
    if (order.startsWith('DEL') || order.startsWith('SB') || order.startsWith('IMP')) return order;
    return `DEL${order.substring(order.length - 8).toUpperCase()}`;
  }
  const trackId = order.trackingNumber || order.trackingId;
  if (trackId && trackId !== 'Pending') {
    return trackId;
  }
  const id = order.id || '';
  if (id.startsWith('DEL') || id.startsWith('SB') || id.startsWith('IMP')) return id;
  return `DEL${id.substring(id.length - 8).toUpperCase()}`;
}

export default function Profile() {
  const { user, logout, isLoggedIn } = useAuth();
  const { formatPrice } = useCurrency();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' or 'addresses'
  
  // Placed orders list
  const [orders, setOrders] = useState([]);
  // Placed addresses list
  const [addresses, setAddresses] = useState([]);
  
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    name: '',
    phone: '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    pincode: '',
    isDefault: false
  });

  // Inline review states
  const [activeReviewKey, setActiveReviewKey] = useState(null); // 'orderId-itemId'
  const [inlineRating, setInlineRating] = useState(5);
  const [inlineTitle, setInlineTitle] = useState('');
  const [inlineBody, setInlineBody] = useState('');
  const [inlineReviewError, setInlineReviewError] = useState('');
  const [submitSuccessKey, setSubmitSuccessKey] = useState(null); // 'orderId-itemId'

  const handleToggleReviewForm = (orderId, itemId) => {
    const key = `${orderId}-${itemId}`;
    if (activeReviewKey === key) {
      setActiveReviewKey(null);
    } else {
      setActiveReviewKey(key);
      setInlineRating(5);
      setInlineTitle('');
      setInlineBody('');
      setInlineReviewError('');
    }
  };

  const handleInlineReviewSubmit = async (e, orderId, productName) => {
    e.preventDefault();
    const key = activeReviewKey;
    if (!inlineTitle.trim() || !inlineBody.trim()) {
      setInlineReviewError('Please fill out all fields.');
      return;
    }
    setInlineReviewError('');
    try {
      const res = await ReviewService.createReview({
        rating: inlineRating,
        title: inlineTitle,
        body: inlineBody,
        userName: user?.name || 'Verified Buyer',
        userEmail: user?.email || 'verified@example.com',
        productName: productName,
        isApproved: true // Auto-approved since it's verified purchase!
      });
      if (res.success) {
        setSubmitSuccessKey(key);
        
        // Trigger New Review Notification
        try {
          NotificationService.createNotification(
            'NEW_REVIEW',
            `Verified Purchase: New ${inlineRating}-star review on ${productName} from ${user?.name || 'Verified Buyer'}`
          );
        } catch (notifErr) {
          console.error(notifErr);
        }

        setTimeout(() => {
          setActiveReviewKey(null);
          setSubmitSuccessKey(null);
          setInlineTitle('');
          setInlineBody('');
        }, 2000);
      }
    } catch (err) {
      setInlineReviewError(err.message || 'Failed to submit review.');
    }
  };

  // Redirect if not logged in — save intended path for post-login return
  useEffect(() => {
    if (!isLoggedIn) {
      sessionStorage.setItem('auth_redirect', '/profile');
      navigate('/auth');
    }
  }, [isLoggedIn, navigate]);

  // Load orders from API & local storage
  useEffect(() => {
    if (!user) return;

    const loadOrders = async () => {
      let apiOrders = [];
      try {
        const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';
        const clerkId = user.clerkId || user.id;
        const res = await fetch(`${API_BASE}/api/orders`, {
          headers: {
            'x-clerk-id': clerkId,
            'x-user-email': user.email || '',
          },
        });
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          apiOrders = data.data.map(formatOrderForTracking);
        }
      } catch (err) {
        console.error('Failed to fetch orders from API:', err);
      }

      // Local fallback orders
      const adminOrders = JSON.parse(localStorage.getItem('stb_admin_detailed_orders') || '[]');
      const userAdminOrders = adminOrders
        .filter(o => o.userId === user.email || o.customerEmail === user.email || o.email === user.email)
        .map(formatOrderForTracking);

      const allOrders = JSON.parse(localStorage.getItem('stb_placed_orders') || '{}');
      const userOrders = Object.values(allOrders)
        .filter(o => o.userId === user.email || o.userEmail === user.email || o.email === user.email)
        .map(formatOrderForTracking);

      const mergedMap = {};
      userOrders.forEach(o => { if (o) mergedMap[o.id] = o; });
      userAdminOrders.forEach(o => { if (o) mergedMap[o.id] = o; });
      apiOrders.forEach(o => { if (o) mergedMap[o.id] = o; });

      const displayOrders = Object.values(mergedMap);
      setOrders(displayOrders.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || '')));

      // Load user addresses
      const allAddresses = JSON.parse(localStorage.getItem('stb_saved_addresses') || '[]');
      const userAddresses = allAddresses.filter(a => a.userEmail === user.email);
      setAddresses(userAddresses);
    };

    loadOrders();
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleAddAddress = (e) => {
    e.preventDefault();
    if (!newAddress.name || !newAddress.phone || !newAddress.line1 || !newAddress.city || !newAddress.pincode) return;

    const allAddresses = JSON.parse(localStorage.getItem('stb_saved_addresses') || '[]');
    const addressToSave = {
      ...newAddress,
      id: `addr-${Date.now()}`,
      userEmail: user.email
    };

    if (newAddress.isDefault) {
      // Unset other default addresses for this user
      allAddresses.forEach(a => {
        if (a.userEmail === user.email) a.isDefault = false;
      });
    }

    const updated = [...allAddresses, addressToSave];
    localStorage.setItem('stb_saved_addresses', JSON.stringify(updated));
    setAddresses(updated.filter(a => a.userEmail === user.email));
    
    // Reset form
    setNewAddress({
      name: '',
      phone: '',
      line1: '',
      line2: '',
      city: '',
      state: '',
      pincode: '',
      isDefault: false
    });
    setShowAddressForm(false);
  };

  const handleDeleteAddress = (id) => {
    const allAddresses = JSON.parse(localStorage.getItem('stb_saved_addresses') || '[]');
    const updated = allAddresses.filter(a => a.id !== id);
    localStorage.setItem('stb_saved_addresses', JSON.stringify(updated));
    setAddresses(updated.filter(a => a.userEmail === user.email));
  };

  if (!isLoggedIn || !user) return null;

  return (
    <PageWrapper className="profile-page">
      <Helmet>
        <title>My Account | Spill The Beans</title>
      </Helmet>

      <div className="container profile-container">
        {/* Mockup Tabs Navbar */}
        <div className="profile-tabs-nav">
          <div className="profile-tabs">
            <button 
              className={`profile-tab ${activeTab === 'orders' ? 'profile-tab--active' : ''}`}
              onClick={() => setActiveTab('orders')}
            >
              Orders
            </button>
            <button 
              className={`profile-tab ${activeTab === 'addresses' ? 'profile-tab--active' : ''}`}
              onClick={() => setActiveTab('addresses')}
            >
              Addresses
            </button>
          </div>
          <button className="profile-logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>

        {/* Selected Tab View */}
        <div className="profile-tab-content">
          {activeTab === 'orders' ? (
            orders.length === 0 ? (
              <div className="profile-empty-orders">
                <div className="profile-empty-orders__icon-wrap">
                  <Package size={48} className="profile-empty-orders__icon" />
                  <span className="profile-empty-orders__badge">0</span>
                </div>
                <h2 className="profile-empty-orders__title">You haven't placed any orders yet.</h2>
                <Link to="/shop" className="profile-empty-orders__btn">
                  Continue shopping
                </Link>
              </div>
            ) : (
              <div className="profile-orders-list">
                <h2 className="profile-section-title">Order History</h2>
                {orders.map(order => (
                  <div key={order.id} className="profile-order-card">
                    <div className="profile-order-card__header">
                      <div>
                        <div className="profile-order-card__id">{formatOrderDisplayId(order)}</div>
                        <div className="profile-order-card__date">Estimated Delivery: {order.estimatedDelivery}</div>
                      </div>
                      <span className={`profile-order-status-badge profile-order-status-badge--${order.status.toLowerCase()}`}>
                        {order.status}
                      </span>
                    </div>
                    {/* Order Items Details */}
                    {order.items && order.items.length > 0 && (
                      <div className="profile-order-card__items" style={{ padding: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {order.items.map((item, idx) => {
                          const itemKey = item.id || item.productId || item.sku || `item-${idx}`;
                          const reviewKey = `${order.id}-${itemKey}`;

                          return (
                            <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '0.5rem 0', borderBottom: idx < order.items.length - 1 ? '1px dashed rgba(255,255,255,0.03)' : 'none' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                  {item.image && (
                                    <img 
                                      src={item.image} 
                                      alt={item.name} 
                                      style={{ width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover', background: 'rgba(255,255,255,0.03)' }} 
                                    />
                                  )}
                                  <div>
                                    <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-cream)', margin: 0 }}>{item.name}</p>
                                    <p className="text-xs text-muted" style={{ margin: 0 }}>
                                      {item.weight || 'Standard'} · {item.quantity} x {formatPrice(item.price)}
                                    </p>
                                  </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                  <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-cream)' }}>
                                    {formatPrice(item.quantity * item.price)}
                                  </span>
                                  {order.status === 'DELIVERED' && (
                                    <button 
                                      onClick={() => handleToggleReviewForm(order.id, itemKey)}
                                      className="btn btn-outline"
                                      style={{ 
                                        padding: '0.35rem 0.75rem', 
                                        fontSize: '0.78rem', 
                                        borderRadius: '6px', 
                                        borderColor: 'var(--accent-amber)',
                                        color: 'var(--accent-amber)',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '0.3rem'
                                      }}
                                    >
                                      <Star size={13} fill={activeReviewKey === reviewKey ? 'var(--accent-amber)' : 'none'} />
                                      {activeReviewKey === reviewKey ? 'Cancel' : 'Write Review'}
                                    </button>
                                  )}
                                </div>
                              </div>

                              {/* Inline Review Form */}
                              {activeReviewKey === reviewKey && (
                                <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '6px', marginTop: '0.5rem' }}>
                                  {submitSuccessKey === reviewKey ? (
                                    <p style={{ color: '#95d5b2', fontSize: '0.875rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                      ✓ Review submitted and published to product page!
                                    </p>
                                  ) : (
                                    <form onSubmit={(e) => handleInlineReviewSubmit(e, order.id, item.name)} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                      {inlineReviewError && <p style={{ color: '#f08080', fontSize: '0.75rem', margin: 0 }}>{inlineReviewError}</p>}
                                      
                                      <div>
                                        <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>Rating</label>
                                        <div style={{ display: 'flex', gap: '0.25rem' }}>
                                          {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                              key={star}
                                              type="button"
                                              onClick={() => setInlineRating(star)}
                                              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                                            >
                                              <Star 
                                                size={16} 
                                                fill={inlineRating >= star ? 'var(--accent-amber)' : 'none'} 
                                                color={inlineRating >= star ? 'var(--accent-amber)' : 'var(--text-muted)'} 
                                              />
                                            </button>
                                          ))}
                                        </div>
                                      </div>

                                      <div>
                                        <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>Title</label>
                                        <input 
                                          type="text" 
                                          required 
                                          value={inlineTitle} 
                                          onChange={e => setInlineTitle(e.target.value)} 
                                          placeholder="Summarize your experience..."
                                          style={{ width: '100%', background: 'rgba(253,224,193,0.03)', border: '1px solid var(--border-subtle)', color: 'var(--text-cream)', padding: '0.4rem 0.6rem', borderRadius: '4px', fontSize: '0.8125rem' }}
                                        />
                                      </div>

                                      <div>
                                        <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>Comment</label>
                                        <textarea 
                                          required 
                                          rows={3}
                                          value={inlineBody} 
                                          onChange={e => setInlineBody(e.target.value)} 
                                          placeholder="Would you recommend this roast? How does it taste?"
                                          style={{ width: '100%', background: 'rgba(253,224,193,0.03)', border: '1px solid var(--border-subtle)', color: 'var(--text-cream)', padding: '0.4rem 0.6rem', borderRadius: '4px', fontSize: '0.8125rem', resize: 'vertical' }}
                                        />
                                      </div>

                                      <button 
                                        type="submit" 
                                        className="btn btn-primary"
                                        style={{ padding: '0.4rem 1.25rem', fontSize: '0.8125rem', alignSelf: 'flex-start' }}
                                      >
                                        Submit Review
                                      </button>
                                    </form>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                    <div className="profile-order-card__footer" style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                      <div className="profile-order-card__details" style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                          Courier: <strong style={{ color: order.status === 'DELIVERED' ? '#95d5b2' : 'var(--text-cream)' }}>{order.courier}</strong> · Tracking: <strong style={{ color: 'var(--text-cream)' }}>{order.trackingNumber}</strong>
                        </div>
                        {order.total > 0 && (
                          <div style={{ fontSize: '0.875rem', color: 'var(--text-cream)' }}>
                            Total Paid: <strong>{formatPrice(order.total)}</strong>
                          </div>
                        )}
                      </div>

                      {order.status === 'DELIVERED' ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <span style={{ 
                            padding: '0.4rem 0.85rem', 
                            borderRadius: '8px', 
                            background: 'rgba(34, 197, 94, 0.15)', 
                            border: '1px solid rgba(34, 197, 94, 0.3)', 
                            color: '#4ade80', 
                            fontWeight: 700, 
                            fontSize: '0.85rem',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem'
                          }}>
                            ✓ Delivered
                          </span>
                          <Link to={`/track?id=${order.id}`} style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', textDecoration: 'none' }}>
                            Track History ›
                          </Link>
                        </div>
                      ) : (
                        <Link to={`/track?id=${order.id}`} className="profile-order-track-link">
                          Track Order <ChevronRight size={14} />
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            <div className="profile-addresses-section">
              <div className="profile-addresses-header">
                <h2 className="profile-section-title">Saved Addresses</h2>
                {!showAddressForm && (
                  <button className="profile-add-address-btn" onClick={() => setShowAddressForm(true)}>
                    <Plus size={14} /> Add New Address
                  </button>
                )}
              </div>

              {showAddressForm && (
                <form className="profile-address-form" onSubmit={handleAddAddress}>
                  <h3 className="profile-address-form__title">Add New Address</h3>
                  <div className="profile-form-grid">
                    <div className="profile-form-group">
                      <label>Recipient Name</label>
                      <input 
                        type="text" 
                        required 
                        value={newAddress.name} 
                        onChange={e => setNewAddress(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="John Doe"
                      />
                    </div>
                    <div className="profile-form-group">
                      <label>Phone Number</label>
                      <input 
                        type="tel" 
                        required 
                        value={newAddress.phone} 
                        onChange={e => setNewAddress(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="+91 99999 99999"
                      />
                    </div>
                    <div className="profile-form-group span-2">
                      <label>Address Line 1</label>
                      <input 
                        type="text" 
                        required 
                        value={newAddress.line1} 
                        onChange={e => setNewAddress(prev => ({ ...prev, line1: e.target.value }))}
                        placeholder="Flat, House No., Building, Street"
                      />
                    </div>
                    <div className="profile-form-group span-2">
                      <label>Address Line 2 (Optional)</label>
                      <input 
                        type="text" 
                        value={newAddress.line2} 
                        onChange={e => setNewAddress(prev => ({ ...prev, line2: e.target.value }))}
                        placeholder="Locality, Landmark, Area"
                      />
                    </div>
                    <div className="profile-form-group">
                      <label>City</label>
                      <input 
                        type="text" 
                        required 
                        value={newAddress.city} 
                        onChange={e => setNewAddress(prev => ({ ...prev, city: e.target.value }))}
                        placeholder="Bengaluru"
                      />
                    </div>
                    <div className="profile-form-group">
                      <label>State</label>
                      <input 
                        type="text" 
                        required 
                        value={newAddress.state} 
                        onChange={e => setNewAddress(prev => ({ ...prev, state: e.target.value }))}
                        placeholder="Karnataka"
                      />
                    </div>
                    <div className="profile-form-group">
                      <label>Pincode</label>
                      <input 
                        type="text" 
                        required 
                        value={newAddress.pincode} 
                        onChange={e => setNewAddress(prev => ({ ...prev, pincode: e.target.value }))}
                        placeholder="560034"
                      />
                    </div>
                    <div className="profile-form-group checkbox-group">
                      <label className="checkbox-label">
                        <input 
                          type="checkbox" 
                          checked={newAddress.isDefault} 
                          onChange={e => setNewAddress(prev => ({ ...prev, isDefault: e.target.checked }))}
                        />
                        Set as default shipping address
                      </label>
                    </div>
                  </div>
                  <div className="profile-form-actions">
                    <button type="submit" className="btn-save-address">Save Address</button>
                    <button type="button" className="btn-cancel-address" onClick={() => setShowAddressForm(false)}>Cancel</button>
                  </div>
                </form>
              )}

              {addresses.length === 0 ? (
                <div className="profile-empty-addresses">
                  <MapPin size={48} className="profile-empty-addresses__icon" />
                  <p>You haven't saved any addresses yet.</p>
                </div>
              ) : (
                <div className="profile-addresses-grid">
                  {addresses.map(addr => (
                    <div key={addr.id} className={`profile-address-card ${addr.isDefault ? 'profile-address-card--default' : ''}`}>
                      <div className="profile-address-card__header">
                        <span className="profile-address-card__name">{addr.name}</span>
                        {addr.isDefault && <span className="profile-address-default-badge">Default</span>}
                      </div>
                      <div className="profile-address-card__body">
                        <p>{addr.line1}</p>
                        {addr.line2 && <p>{addr.line2}</p>}
                        <p>{addr.city}, {addr.state} - {addr.pincode}</p>
                        <p className="profile-address-card__phone">📞 {addr.phone}</p>
                      </div>
                      <div className="profile-address-card__actions">
                        <button className="profile-delete-address-btn" onClick={() => handleDeleteAddress(addr.id)}>
                          <Trash2 size={13} /> Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </PageWrapper>
  );
}
