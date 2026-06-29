import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../context/AuthContext';
import { Package, MapPin, ChevronRight, Plus, Trash2 } from 'lucide-react';
import PageWrapper from '../components/PageWrapper';
import './Profile.css';

function formatOrderForTracking(order) {
  if (!order) return null;
  
  // If it's already a formatted tracking object from stb_placed_orders
  if (order.steps && Array.isArray(order.steps)) {
    // If status has been updated in admin but steps weren't, synchronize steps
    if (order.status !== 'CONFIRMED' && order.status !== 'PROCESSING') {
      return {
        ...order,
        courier: order.status === 'CONFIRMED' || order.status === 'PROCESSING' ? 'Pending Dispatch' : (order.courier || 'Delhivery'),
        trackingNumber: order.status === 'CONFIRMED' || order.status === 'PROCESSING' ? 'Pending' : (order.trackingNumber || 'DEL' + Math.floor(Math.random() * 90000000)),
        steps: order.steps.map((step, idx) => {
          if (idx === 0) return { ...step, done: true };
          if (idx === 1 && ['PROCESSING', 'SHIPPED', 'DELIVERED'].includes(order.status)) return { ...step, done: true };
          if (idx === 2 && ['SHIPPED', 'DELIVERED'].includes(order.status)) return { ...step, done: true };
          if (idx === 3 && ['DELIVERED'].includes(order.status)) return { ...step, done: true };
          if (idx === 4 && order.status === 'DELIVERED') return { ...step, done: true };
          return step;
        })
      };
    }
    return {
      ...order,
      courier: order.status === 'CONFIRMED' || order.status === 'PROCESSING' ? 'Pending Dispatch' : order.courier,
      trackingNumber: order.status === 'CONFIRMED' || order.status === 'PROCESSING' ? 'Pending' : order.trackingNumber
    };
  }

  // If it's a standard order object from stb_admin_detailed_orders
  const timeline = order.timeline || {};
  
  // Format estimated delivery
  let estDeliveryStr = 'Pending';
  if (order.estimatedDelivery) {
    estDeliveryStr = new Date(order.estimatedDelivery).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  } else {
    estDeliveryStr = new Date(new Date(order.createdAt).getTime() + 3600000 * 24 * 3).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  // Format address
  let addressStr = '';
  if (typeof order.address === 'object') {
    const a = order.address;
    addressStr = `${a.line1 || a.street || ''}${a.line2 ? ', ' + a.line2 : ''}, ${a.city || ''}, ${a.state || ''} - ${a.pincode || a.zip || ''}`;
  } else {
    addressStr = order.address || '';
  }

  const steps = [
    { 
      label: 'Order Placed', 
      time: order.createdAt ? new Date(order.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'Pending', 
      done: true 
    },
    { 
      label: 'Processing & Roasting', 
      time: timeline.processing ? new Date(timeline.processing).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'Pending', 
      done: ['PROCESSING', 'PACKED', 'SHIPPED', 'DELIVERED'].includes(order.status) || !!timeline.processing 
    },
    { 
      label: 'Dispatched from Warehouse', 
      time: timeline.shipped ? new Date(timeline.shipped).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'Pending', 
      done: ['SHIPPED', 'DELIVERED'].includes(order.status) || !!timeline.shipped 
    },
    { 
      label: 'Out for Delivery', 
      time: timeline.shipped ? new Date(new Date(timeline.shipped).getTime() + 3600000 * 12).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'Pending', 
      done: order.status === 'DELIVERED' 
    },
    { 
      label: 'Delivered', 
      time: timeline.delivered ? new Date(timeline.delivered).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'Pending', 
      done: order.status === 'DELIVERED' || !!timeline.delivered 
    },
  ];

  return {
    id: order.id,
    status: order.status,
    courier: order.status === 'CONFIRMED' || order.status === 'PROCESSING' ? 'Pending Dispatch' : (order.courierPartner || 'Delhivery'),
    trackingNumber: order.status === 'CONFIRMED' || order.status === 'PROCESSING' ? 'Pending' : (order.trackingId || 'Pending'),
    estimatedDelivery: estDeliveryStr,
    address: addressStr,
    steps
  };
}

export default function Profile() {
  const { user, logout, isLoggedIn } = useAuth();
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

  // Redirect if not logged in
  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/auth');
    }
  }, [isLoggedIn, navigate]);

  // Load orders and addresses
  useEffect(() => {
    if (user) {
      // 1. Load from stb_admin_detailed_orders first
      const adminOrders = JSON.parse(localStorage.getItem('stb_admin_detailed_orders') || '[]');
      const userAdminOrders = adminOrders.filter(
        o => o.userId === user.email || o.customerEmail === user.email || o.email === user.email
      );

      // 2. Load from stb_placed_orders
      const allOrders = JSON.parse(localStorage.getItem('stb_placed_orders') || '{}');
      const userOrders = Object.values(allOrders).filter(
        o => o.userId === user.email || o.userEmail === user.email || o.email === user.email
      );

      // Merge them, prefer adminOrders for tracking status updates
      const mergedMap = {};
      
      if (userOrders.length === 0 && userAdminOrders.length === 0) {
        Object.values(allOrders).forEach(o => {
          mergedMap[o.id] = formatOrderForTracking(o);
        });
        adminOrders.forEach(o => {
          mergedMap[o.id] = formatOrderForTracking(o);
        });
      } else {
        userOrders.forEach(o => {
          mergedMap[o.id] = formatOrderForTracking(o);
        });
        userAdminOrders.forEach(o => {
          mergedMap[o.id] = formatOrderForTracking(o);
        });
      }

      const displayOrders = Object.values(mergedMap);
      setOrders(displayOrders.sort((a, b) => b.id.localeCompare(a.id)));

      // Load user-specific addresses
      const allAddresses = JSON.parse(localStorage.getItem('stb_saved_addresses') || '[]');
      const userAddresses = allAddresses.filter(a => a.userEmail === user.email);
      setAddresses(userAddresses);
    }
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
                        <div className="profile-order-card__id">{order.id}</div>
                        <div className="profile-order-card__date">Estimated Delivery: {order.estimatedDelivery}</div>
                      </div>
                      <span className={`profile-order-status-badge profile-order-status-badge--${order.status.toLowerCase()}`}>
                        {order.status}
                      </span>
                    </div>
                    <div className="profile-order-card__footer">
                      <div className="profile-order-card__details">
                        Courier: <strong>{order.courier}</strong> · Tracking: <strong>{order.trackingNumber}</strong>
                      </div>
                      <Link to={`/track?id=${order.id}`} className="profile-order-track-link">
                        Track Order <ChevronRight size={14} />
                      </Link>
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
