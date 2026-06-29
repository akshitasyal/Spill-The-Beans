import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Package, Search, Truck, CheckCircle2, Clock, MapPin, AlertCircle } from 'lucide-react';
import PageWrapper from '../components/PageWrapper';

// Mock order tracker details database
const MOCK_TRACKING = {
  'STB-12345': {
    id: 'STB-12345',
    status: 'DELIVERED',
    courier: 'Delhivery',
    trackingNumber: 'DEL90184021',
    estimatedDelivery: 'June 25, 2026',
    address: 'Koramangala, Bengaluru, Karnataka - 560034',
    steps: [
      { label: 'Order Placed', time: 'June 22, 10:30 AM', done: true },
      { label: 'Processing & Roasting', time: 'June 22, 02:15 PM', done: true },
      { label: 'Dispatched from Warehouse', time: 'June 23, 11:00 AM', done: true },
      { label: 'Out for Delivery', time: 'June 25, 09:30 AM', done: true },
      { label: 'Delivered', time: 'June 25, 02:45 PM', done: true },
    ]
  },
  'STB-67890': {
    id: 'STB-67890',
    status: 'SHIPPED',
    courier: 'BlueDart',
    trackingNumber: 'BD71840194',
    estimatedDelivery: 'July 01, 2026',
    address: 'Andheri West, Mumbai, Maharashtra - 400053',
    steps: [
      { label: 'Order Placed', time: 'Yesterday, 04:30 PM', done: true },
      { label: 'Processing & Roasting', time: 'Today, 09:00 AM', done: true },
      { label: 'Dispatched from Warehouse', time: 'Today, 02:00 PM', done: true },
      { label: 'Out for Delivery', time: 'Pending', done: false },
      { label: 'Delivered', time: 'Pending', done: false },
    ]
  }
};

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

export default function TrackPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [orderId, setOrderId] = useState(searchParams.get('id') || '');
  const [trackingData, setTrackingData] = useState(null);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    const id = searchParams.get('id');
    if (id) {
      // 1. Search in stb_admin_detailed_orders first (source of truth for admin updates)
      const adminOrders = JSON.parse(localStorage.getItem('stb_admin_detailed_orders') || '[]');
      let order = adminOrders.find(o => o.id.toUpperCase() === id.toUpperCase());
      
      if (!order) {
        // 2. Search in stb_placed_orders (frontend fallback)
        const savedOrders = JSON.parse(localStorage.getItem('stb_placed_orders') || '{}');
        order = savedOrders[id.toUpperCase()];
      }

      // 3. Fallback to hardcoded MOCK_TRACKING
      if (!order) {
        order = MOCK_TRACKING[id.toUpperCase()];
      }

      const data = formatOrderForTracking(order);
      setTrackingData(data);
      setSearched(true);
    }
  }, [searchParams]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (orderId.trim()) {
      setSearchParams({ id: orderId.trim() });
    }
  };

  return (
    <>
      <Helmet>
        <title>Track Your Order | Spill The Beans</title>
        <meta name="description" content="Track your Spill The Beans coffee delivery status in real time." />
      </Helmet>

      <PageWrapper style={container}>
        <div className="container" style={{ maxWidth: '640px', width: '100%' }}>
          <div style={headerSection}>
            <Package size={36} color="var(--accent-admin-amber)" />
            <h1 style={title}>Track Your Beans</h1>
            <p style={subtitle}>Enter your Order ID (e.g. STB-12345) to view real-time shipping logs.</p>
          </div>

          <form onSubmit={handleSearch} style={searchForm}>
            <div style={inputContainer}>
              <Search size={18} style={searchIcon} />
              <input
                type="text"
                placeholder="Enter Order ID…"
                style={input}
                value={orderId}
                onChange={e => setOrderId(e.target.value)}
              />
            </div>
            <button type="submit" style={btn}>Track</button>
          </form>

          {searched && (
            <div style={resultCard}>
              {trackingData ? (
                <div>
                  <div style={metaHeader}>
                    <div>
                      <div style={metaLabel}>Order ID</div>
                      <div style={metaVal}>{trackingData.id}</div>
                    </div>
                    <div>
                      <div style={metaLabel}>Est. Delivery</div>
                      <div style={metaVal}>{trackingData.estimatedDelivery}</div>
                    </div>
                    <div>
                      <div style={metaLabel}>Carrier</div>
                      <div style={metaVal}>{trackingData.courier} ({trackingData.trackingNumber})</div>
                    </div>
                  </div>

                  <div style={stepperContainer}>
                    {trackingData.steps.map((step, idx) => {
                      const isLast = idx === trackingData.steps.length - 1;
                      return (
                        <div key={idx} style={stepRow}>
                          <div style={stepIndicator}>
                            <div style={{
                              ...indicatorCircle,
                              background: step.done ? 'var(--accent-amber)' : 'var(--bg-espresso-deep)',
                              borderColor: step.done ? 'var(--accent-amber)' : 'var(--border-amber)'
                            }}>
                              {step.done ? <CheckCircle2 size={14} color="#FFF" /> : <Clock size={14} color="var(--text-muted)" />}
                            </div>
                            {!isLast && <div style={{
                              ...indicatorLine,
                              background: step.done && trackingData.steps[idx + 1].done ? 'var(--accent-amber)' : 'var(--border-amber)'
                            }} />}
                          </div>
                          <div style={stepContent}>
                            <div style={{
                              ...stepLabel,
                              color: step.done ? 'var(--text-cream)' : 'var(--text-muted)',
                              fontWeight: step.done ? 700 : 500
                            }}>{step.label}</div>
                            <div style={stepTime}>{step.time}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div style={shippingInfo}>
                    <MapPin size={16} color="var(--text-muted)" style={{ marginTop: '0.1rem' }} />
                    <div>
                      <div style={metaLabel}>Shipping Address</div>
                      <div style={addressText}>{trackingData.address}</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div style={errorContainer}>
                  <AlertCircle size={24} color="#ef4444" />
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontWeight: 'bold', color: 'var(--text-cream)' }}>Order Not Found</div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                      We couldn't locate any shipment records for "{orderId}". Double-check the ID or contact support.
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </PageWrapper>
    </>
  );
}

// Inline Styles matching STB Design System
const container = {
  minHeight: '80vh',
  paddingTop: 'var(--header-total)',
  paddingBottom: '4rem',
  background: 'var(--bg-espresso)',
  color: 'var(--text-cream)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
};

const headerSection = {
  textAlign: 'center',
  marginBottom: '2rem',
};

const title = {
  fontFamily: 'var(--font-heading), serif',
  fontSize: '2.25rem',
  margin: '0.75rem 0 0.5rem 0',
  color: 'var(--text-cream)',
};

const subtitle = {
  fontSize: '0.9375rem',
  color: 'var(--text-muted)',
  margin: 0,
};

const searchForm = {
  display: 'flex',
  gap: '0.75rem',
  background: 'var(--surface-card)',
  border: '1px solid var(--border-amber)',
  padding: '0.5rem',
  borderRadius: '12px',
  marginBottom: '2rem',
  boxShadow: 'var(--shadow-card)',
};

const inputContainer = {
  position: 'relative',
  flex: 1,
};

const searchIcon = {
  position: 'absolute',
  left: '0.75rem',
  top: '50%',
  transform: 'translateY(-50%)',
  color: 'var(--text-muted)',
};

const input = {
  width: '100%',
  padding: '0.75rem 0.75rem 0.75rem 2.5rem',
  background: 'none',
  border: 'none',
  outline: 'none',
  color: 'var(--text-cream)',
  fontSize: '1rem',
  boxSizing: 'border-box',
};

const btn = {
  background: 'var(--accent-amber)',
  border: 'none',
  borderRadius: '8px',
  color: '#FFF',
  padding: '0 1.5rem',
  fontWeight: 'bold',
  cursor: 'pointer',
  fontSize: '0.9375rem',
  boxShadow: '0 2px 8px rgba(194, 122, 10, 0.2)',
};

const resultCard = {
  background: 'var(--surface-card)',
  border: '1px solid var(--border-amber)',
  borderRadius: '16px',
  padding: '2rem',
  boxShadow: 'var(--shadow-card)',
};

const metaHeader = {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: '1rem',
  borderBottom: '1px solid var(--border-subtle)',
  paddingBottom: '1.25rem',
  marginBottom: '1.5rem',
};

const metaLabel = {
  fontSize: '0.7rem',
  textTransform: 'uppercase',
  color: 'var(--text-muted)',
  fontWeight: 700,
  letterSpacing: '0.5px',
  marginBottom: '0.2rem',
};

const metaVal = {
  fontSize: '0.875rem',
  fontWeight: 700,
  color: 'var(--text-cream)',
};

const stepperContainer = {
  display: 'flex',
  flexDirection: 'column',
  marginBottom: '1.5rem',
};

const stepRow = {
  display: 'flex',
  gap: '1rem',
};

const stepIndicator = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  width: '24px',
};

const indicatorCircle = {
  width: '24px',
  height: '24px',
  borderRadius: '50%',
  border: '1px solid',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1,
};

const indicatorLine = {
  width: '2px',
  flex: 1,
  minHeight: '28px',
};

const stepContent = {
  paddingTop: '0.1rem',
  paddingBottom: '1.5rem',
};

const stepLabel = {
  fontSize: '0.9375rem',
};

const stepTime = {
  fontSize: '0.75rem',
  color: 'var(--text-muted)',
  marginTop: '0.15rem',
};

const shippingInfo = {
  borderTop: '1px dashed var(--border-subtle)',
  paddingTop: '1.25rem',
  display: 'flex',
  gap: '0.5rem',
};

const addressText = {
  fontSize: '0.875rem',
  color: 'var(--text-cream)',
  lineHeight: 1.4,
};

const errorContainer = {
  display: 'flex',
  gap: '1rem',
  alignItems: 'flex-start',
  padding: '0.5rem 0',
};
