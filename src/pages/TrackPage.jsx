import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Search, CheckCircle2, Clock, MapPin, Truck, AlertCircle, Sparkles, ShieldCheck } from 'lucide-react';
import PageWrapper from '../components/PageWrapper';

// Default Coffee Stages Sequence
const STAGES = [
  { key: 'PLACED', label: 'Order Placed', defaultMsg: 'Order placed and confirmed.' },
  { key: 'PACKED', label: 'Packed', defaultMsg: 'Beans carefully packed in protective packaging.' },
  { key: 'ROASTED', label: 'Roasted', defaultMsg: 'Freshly roasted today for maximum freshness.' },
  { key: 'DISPATCHED', label: 'Dispatched', defaultMsg: 'Handed over to courier express hub.' },
  { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', defaultMsg: 'Out for delivery to your doorstep.' },
  { key: 'DELIVERED', label: 'Delivered', defaultMsg: 'Order delivered successfully. Enjoy your brew!' },
];

const STAGE_INDEX = {
  PLACED: 0, PENDING: 0, CONFIRMED: 0,
  PACKED: 1, PROCESSING: 1,
  ROASTED: 2,
  DISPATCHED: 3, SHIPPED: 3,
  OUT_FOR_DELIVERY: 4,
  DELIVERED: 5,
  CANCELLED: -1,
};

// Initial Sample Orders for immediate demo/fallback
const MOCK_ORDER_MAP = {
  'SB1024': {
    id: 'SB1024',
    customerName: 'Akshita',
    status: 'ROASTED',
    paymentStatus: 'PAID',
    paymentMethod: 'UPI',
    total: 129900,
    estimatedDelivery: new Date(Date.now() + 86400000 * 2).toISOString(),
    courierPartner: 'Delhivery Express',
    trackingId: 'DEL90184021',
    address: 'Flat 402, Highrise Heights, Koramangala, Bengaluru, Karnataka - 560034',
    trackingEvents: [
      { status: 'PLACED', message: 'Order received and payment confirmed.', updatedBy: 'System', createdAt: '2026-07-24T09:02:00Z' },
      { status: 'PACKED', message: 'Beans have been carefully packed.', updatedBy: 'Warehouse', createdAt: '2026-07-24T10:30:00Z' },
      { status: 'ROASTED', message: 'Freshly roasted today for maximum freshness.', updatedBy: 'Master Roaster', createdAt: '2026-07-24T14:15:00Z' },
    ],
  },
  'SB1025': {
    id: 'SB1025',
    customerName: 'Rahul',
    status: 'PACKED',
    paymentStatus: 'PAID',
    paymentMethod: 'RAZORPAY',
    total: 79900,
    estimatedDelivery: new Date(Date.now() + 86400000 * 3).toISOString(),
    courierPartner: 'Blue Dart',
    trackingId: 'BD71840194',
    address: 'Villa 12, Palm Meadows, Whitefield, Bengaluru - 560066',
    trackingEvents: [
      { status: 'PLACED', message: 'Order confirmed and scheduled for roasting batch.', updatedBy: 'System', createdAt: '2026-07-24T11:00:00Z' },
      { status: 'PACKED', message: 'Beans carefully packed using protective packaging.', updatedBy: 'Packing Operations', createdAt: '2026-07-24T15:45:00Z' },
    ],
  },
};

export default function TrackPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [orderInput, setOrderInput] = useState(searchParams.get('id') || '');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const id = searchParams.get('id');
    if (id) {
      setOrderInput(id);
      fetchOrderTracking(id);
    } else {
      setOrderInput('SB1024');
      fetchOrderTracking('SB1024');
    }
  }, [searchParams]);

  const fetchOrderTracking = async (idToSearch) => {
    if (!idToSearch) return;
    const exactId = idToSearch.trim().replace('#', '');
    const upperId = exactId.toUpperCase();
    setLoading(true);
    setNotFound(false);

    try {
      // 1. Try real API backend with exact ID & track endpoint
      let res = await fetch(`http://localhost:4000/api/orders/track/${exactId}`);
      if (!res.ok) {
        res = await fetch(`http://localhost:4000/api/orders/${exactId}`);
      }
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setOrder(json.data);
          setSearched(true);
          setLoading(false);
          return;
        }
      }
    } catch (e) {
      // API unavailable or network offline
    }

    // 2. Check localStorage stb_placed_orders (where customer cart orders are saved)
    try {
      const savedOrders = JSON.parse(localStorage.getItem('stb_placed_orders') || '{}');
      const foundPlaced = savedOrders[exactId] || savedOrders[upperId] || Object.values(savedOrders).find(o => o.id?.toUpperCase() === upperId || o.id === exactId);
      if (foundPlaced) {
        setOrder(foundPlaced);
        setSearched(true);
        setLoading(false);
        return;
      }
    } catch (e) {}

    // 3. Check localStorage stb_admin_detailed_orders
    try {
      const adminOrders = JSON.parse(localStorage.getItem('stb_admin_detailed_orders') || '[]');
      const foundAdmin = adminOrders.find(o => o.id?.toUpperCase().replace('#', '') === upperId || o.id === exactId);
      if (foundAdmin) {
        setOrder(foundAdmin);
        setSearched(true);
        setLoading(false);
        return;
      }
    } catch (e) {}

    // 4. Check MOCK_ORDER_MAP fallback
    if (MOCK_ORDER_MAP[upperId] || MOCK_ORDER_MAP[exactId]) {
      setOrder(MOCK_ORDER_MAP[upperId] || MOCK_ORDER_MAP[exactId]);
      setSearched(true);
    } else {
      setOrder(null);
      setNotFound(true);
      setSearched(true);
    }
    setLoading(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (orderInput.trim()) {
      setSearchParams({ id: orderInput.trim() });
      fetchOrderTracking(orderInput.trim());
    }
  };

  // Compute active stage index & progress percentage
  const currentStageIndex = order ? (STAGE_INDEX[order.status] ?? 0) : 0;
  const isCancelled = order?.status === 'CANCELLED';
  const progressPercent = isCancelled ? 0 : Math.min(100, Math.max(0, (currentStageIndex / (STAGES.length - 1)) * 100));

  // Map events to stage sequence
  const eventsByStage = {};
  if (order?.trackingEvents && Array.isArray(order.trackingEvents)) {
    order.trackingEvents.forEach(evt => {
      const mappedIdx = STAGE_INDEX[evt.status];
      if (mappedIdx !== undefined && mappedIdx >= 0) {
        eventsByStage[mappedIdx] = evt;
      }
    });
  }

  return (
    <>
      <Helmet>
        <title>Order Tracking | Spill The Beans</title>
        <meta name="description" content="Real-time guided order tracking console for Spill The Beans premium coffee." />
      </Helmet>

      <PageWrapper style={containerStyle}>
        <div style={innerWrapper}>
          
          {/* Header Badge & Title */}
          <div style={headerSection}>
            <div style={brandPill}>
              <Sparkles size={14} color="var(--accent-amber)" />
              <span>Spill The Beans · Live Order Operations</span>
            </div>
            <h1 style={titleStyle}>Customer Order Tracking</h1>
            <p style={subtitleStyle}>
              Enter your Order Number (e.g. <strong style={{ color: 'var(--text-cream)' }}>SB1024</strong>) to track roasting & shipment logs.
            </p>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} style={searchForm}>
            <div style={inputGroup}>
              <Search size={18} style={searchIcon} />
              <input
                type="text"
                placeholder="Enter Order # (e.g. SB1024)…"
                style={inputStyle}
                value={orderInput}
                onChange={(e) => setOrderInput(e.target.value)}
              />
            </div>
            <button type="submit" style={btnStyle} disabled={loading}>
              {loading ? 'Fetching…' : 'Track Order'}
            </button>
          </form>

          {/* Quick Demo Buttons */}
          <div style={demoButtonsRow}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Try sample orders:</span>
            <button onClick={() => { setOrderInput('SB1024'); setSearchParams({ id: 'SB1024' }); fetchOrderTracking('SB1024'); }} style={demoTag}>#SB1024 (Roasted)</button>
            <button onClick={() => { setOrderInput('SB1025'); setSearchParams({ id: 'SB1025' }); fetchOrderTracking('SB1025'); }} style={demoTag}>#SB1025 (Packed)</button>
          </div>

          {/* Order Tracking Card */}
          {searched && (
            <AnimatePresence mode="wait">
              {order ? (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                  style={cardStyle}
                >
                  {/* Read-Only Banner */}
                  <div style={readOnlyNotice}>
                    <ShieldCheck size={14} color="#22c55e" />
                    <span>Customer Read-Only Tracking Portal · Live Updates Sync</span>
                  </div>

                  {/* Order Overview Header */}
                  <div style={orderHeaderRow}>
                    <div>
                      <div style={orderNumberLabel}>Order ID</div>
                      <div style={orderNumberVal}>#{order.id}</div>
                    </div>
                    <div>
                      <div style={orderNumberLabel}>Payment Status</div>
                      <div style={{ ...badgeStyle, ...getPaymentBadgeStyle(order.paymentStatus) }}>
                        {order.paymentStatus || 'PAID'}
                      </div>
                    </div>
                    <div>
                      <div style={orderNumberLabel}>Current Status</div>
                      <div style={{ ...badgeStyle, ...getStatusBadgeStyle(order.status) }}>
                        {order.status === 'ROASTED' ? '🟡 Roasted' : order.status}
                      </div>
                    </div>
                  </div>

                  {/* Order Summary Stats */}
                  <div style={statsGrid}>
                    <div style={statBox}>
                      <div style={statLabel}>Estimated Delivery</div>
                      <div style={statVal}>
                        {order.estimatedDelivery ? new Date(order.estimatedDelivery).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '3–4 Business Days'}
                      </div>
                    </div>
                    <div style={statBox}>
                      <div style={statLabel}>Courier Partner</div>
                      <div style={statVal}>
                        {order.courierPartner || 'Delhivery Express'} {order.trackingId ? `(${order.trackingId})` : ''}
                      </div>
                    </div>
                    <div style={statBox}>
                      <div style={statLabel}>Total Amount</div>
                      <div style={statVal}>₹{(order.total ? order.total / 100 : 1299).toFixed(2)}</div>
                    </div>
                  </div>

                  <div style={sectionDivider} />

                  {/* Animated Vertical Timeline Section */}
                  <div style={timelineHeaderRow}>
                    <h3 style={timelineTitle}><Truck size={18} color="var(--accent-amber)" /> Order Fulfillment Timeline</h3>
                    <span style={progressLabel}>{progressPercent.toFixed(0)}% Complete</span>
                  </div>

                  <div style={timelineContainer}>
                    {/* Vertical Progress Line */}
                    <div style={verticalLineBg}>
                      <motion.div
                        style={verticalLineFill}
                        initial={{ height: '0%' }}
                        animate={{ height: `${progressPercent}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                      />
                    </div>

                    {/* Timeline Steps */}
                    <div style={stepsList}>
                      {STAGES.map((stage, idx) => {
                        const isCompleted = idx < currentStageIndex;
                        const isCurrent = idx === currentStageIndex && !isCancelled;
                        const isFuture = idx > currentStageIndex && !isCancelled;
                        const evt = eventsByStage[idx];

                        // Time display formatting
                        let timeStr = 'Pending';
                        if (evt?.createdAt) {
                          const d = new Date(evt.createdAt);
                          timeStr = `${d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} · ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
                        } else if (isCompleted) {
                          timeStr = 'Completed';
                        }

                        // Message text
                        const messageText = evt?.message || (isCompleted || isCurrent ? stage.defaultMsg : null);

                        return (
                          <div key={stage.key} style={stepRow}>
                            {/* Circle Indicator */}
                            <div style={indicatorWrapper}>
                              {isCompleted ? (
                                <div style={completedCircle}>
                                  <CheckCircle2 size={16} color="#FFFFFF" />
                                </div>
                              ) : isCurrent ? (
                                <div style={currentCirclePulse}>
                                  <div style={pulseDot} />
                                </div>
                              ) : (
                                <div style={futureCircle}>
                                  <div style={innerGreyDot} />
                                </div>
                              )}
                            </div>

                            {/* Step Content */}
                            <div style={stepContentBlock}>
                              <div style={stepHeaderLine}>
                                <span style={{
                                  ...stepTitleStyle,
                                  color: isCompleted || isCurrent ? 'var(--text-cream)' : 'var(--text-muted)',
                                  fontWeight: isCurrent ? 700 : isCompleted ? 600 : 400
                                }}>
                                  {isCompleted ? `✔ ${stage.label}` : isCurrent ? `🟡 ${stage.label}` : `○ ${stage.label}`}
                                </span>
                                <span style={stepTimeStyle}>{timeStr}</span>
                              </div>

                              {/* Tracking Message (Optional custom message beneath status) */}
                              {messageText && (isCompleted || isCurrent) && (
                                <div style={{
                                  ...trackingMsgBox,
                                  borderColor: isCurrent ? 'rgba(217, 131, 38, 0.4)' : 'var(--border-subtle)',
                                  background: isCurrent ? 'rgba(217, 131, 38, 0.08)' : 'rgba(255, 255, 255, 0.02)'
                                }}>
                                  <p style={trackingMsgText}>"{messageText}"</p>
                                  {evt?.updatedBy && (
                                    <span style={updatedByTag}>Updated by {evt.updatedBy}</span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Delivery Address Details */}
                  {order.address && (
                    <div style={addressBox}>
                      <MapPin size={16} color="var(--accent-amber)" style={{ marginTop: '0.1rem' }} />
                      <div>
                        <div style={addressLabel}>Delivery Address</div>
                        <div style={addressText}>
                          {typeof order.address === 'string'
                            ? order.address
                            : `${order.address.name || ''} — ${order.address.line1 || ''}, ${order.address.city || ''}, ${order.address.state || ''} - ${order.address.pincode || ''}`}
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              ) : (
                <div style={errorContainer}>
                  <AlertCircle size={28} color="#ef4444" />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-cream)' }}>Order Not Found</div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                      We couldn't locate shipment logs for "{orderInput}". Double-check the Order ID or try sample ID <strong style={{ color: 'var(--text-cream)' }}>SB1024</strong>.
                    </div>
                  </div>
                </div>
              )}
            </AnimatePresence>
          )}

        </div>
      </PageWrapper>
    </>
  );
}

// Helper badge styles
function getPaymentBadgeStyle(status) {
  if (status === 'PAID') {
    return { background: 'rgba(34, 197, 94, 0.15)', color: '#4ade80', border: '1px solid rgba(34, 197, 94, 0.3)' };
  }
  return { background: 'rgba(234, 179, 8, 0.15)', color: '#fde047', border: '1px solid rgba(234, 179, 8, 0.3)' };
}

function getStatusBadgeStyle(status) {
  if (status === 'ROASTED' || status === 'PACKED') {
    return { background: 'rgba(217, 131, 38, 0.2)', color: '#f97316', border: '1px solid rgba(217, 131, 38, 0.4)' };
  }
  if (status === 'DELIVERED') {
    return { background: 'rgba(34, 197, 94, 0.2)', color: '#22c55e', border: '1px solid rgba(34, 197, 94, 0.4)' };
  }
  return { background: 'rgba(148, 163, 184, 0.15)', color: '#cbd5e1', border: '1px solid rgba(148, 163, 184, 0.3)' };
}

// STB Design System Styles
const containerStyle = {
  minHeight: '85vh',
  paddingTop: 'calc(var(--header-total, 90px) + 2rem)',
  paddingBottom: '5rem',
  background: '#120d0a',
  color: '#fdf3e7',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'flex-start',
};

const innerWrapper = {
  maxWidth: '680px',
  width: '100%',
  padding: '0 1rem',
};

const headerSection = {
  textAlign: 'center',
  marginBottom: '2rem',
};

const brandPill = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.4rem',
  padding: '0.35rem 0.85rem',
  borderRadius: '20px',
  background: 'rgba(217, 131, 38, 0.12)',
  border: '1px solid rgba(217, 131, 38, 0.3)',
  fontSize: '0.75rem',
  color: 'var(--accent-amber, #d98326)',
  fontWeight: 600,
  marginBottom: '0.75rem',
};

const titleStyle = {
  fontFamily: 'var(--font-heading), Georgia, serif',
  fontSize: '2.25rem',
  fontWeight: 700,
  margin: '0 0 0.5rem 0',
  color: '#fdf3e7',
  letterSpacing: '-0.02em',
};

const subtitleStyle = {
  fontSize: '0.9375rem',
  color: 'rgba(253, 243, 231, 0.65)',
  margin: 0,
  lineHeight: 1.5,
};

const searchForm = {
  display: 'flex',
  gap: '0.75rem',
  background: '#1c1410',
  border: '1px solid rgba(217, 131, 38, 0.25)',
  padding: '0.5rem',
  borderRadius: '14px',
  marginBottom: '1rem',
  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
};

const inputGroup = {
  position: 'relative',
  flex: 1,
};

const searchIcon = {
  position: 'absolute',
  left: '0.85rem',
  top: '50%',
  transform: 'translateY(-50%)',
  color: 'rgba(253, 243, 231, 0.4)',
};

const inputStyle = {
  width: '100%',
  padding: '0.75rem 0.75rem 0.75rem 2.6rem',
  background: 'none',
  border: 'none',
  outline: 'none',
  color: '#fdf3e7',
  fontSize: '1rem',
  fontFamily: 'inherit',
  boxSizing: 'border-box',
};

const btnStyle = {
  background: 'linear-gradient(135deg, #d98326 0%, #b86518 100%)',
  border: 'none',
  borderRadius: '10px',
  color: '#FFFFFF',
  padding: '0 1.5rem',
  fontWeight: 700,
  cursor: 'pointer',
  fontSize: '0.9375rem',
  boxShadow: '0 4px 14px rgba(217, 131, 38, 0.3)',
};

const demoButtonsRow = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  justifyContent: 'center',
  marginBottom: '2rem',
};

const demoTag = {
  background: 'rgba(255, 255, 255, 0.05)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  color: '#d98326',
  padding: '0.2rem 0.6rem',
  borderRadius: '6px',
  fontSize: '0.75rem',
  cursor: 'pointer',
  fontWeight: 600,
};

const cardStyle = {
  background: '#1c1410',
  border: '1px solid rgba(217, 131, 38, 0.25)',
  borderRadius: '20px',
  padding: '2rem',
  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)',
};

const readOnlyNotice = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.4rem',
  fontSize: '0.75rem',
  fontWeight: 600,
  color: '#4ade80',
  background: 'rgba(34, 197, 94, 0.08)',
  border: '1px solid rgba(34, 197, 94, 0.2)',
  padding: '0.4rem 0.8rem',
  borderRadius: '8px',
  marginBottom: '1.5rem',
};

const orderHeaderRow = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '1.5rem',
  flexWrap: 'wrap',
  gap: '1rem',
};

const orderNumberLabel = {
  fontSize: '0.7rem',
  textTransform: 'uppercase',
  color: 'rgba(253, 243, 231, 0.5)',
  fontWeight: 700,
  letterSpacing: '0.5px',
  marginBottom: '0.25rem',
};

const orderNumberVal = {
  fontFamily: 'monospace',
  fontSize: '1.5rem',
  fontWeight: 800,
  color: '#fdf3e7',
};

const badgeStyle = {
  padding: '0.35rem 0.75rem',
  borderRadius: '8px',
  fontSize: '0.8125rem',
  fontWeight: 700,
  display: 'inline-block',
};

const statsGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: '1rem',
  background: 'rgba(0, 0, 0, 0.25)',
  padding: '1rem',
  borderRadius: '12px',
  border: '1px solid rgba(255, 255, 255, 0.05)',
  marginBottom: '1.75rem',
};

const statBox = {};

const statLabel = {
  fontSize: '0.7rem',
  textTransform: 'uppercase',
  color: 'rgba(253, 243, 231, 0.45)',
  fontWeight: 700,
  marginBottom: '0.2rem',
};

const statVal = {
  fontSize: '0.875rem',
  fontWeight: 600,
  color: '#fdf3e7',
};

const sectionDivider = {
  borderTop: '1px solid rgba(255, 255, 255, 0.08)',
  margin: '1.5rem 0',
};

const timelineHeaderRow = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '1.5rem',
};

const timelineTitle = {
  fontSize: '1.05rem',
  fontWeight: 700,
  margin: 0,
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  color: '#fdf3e7',
};

const progressLabel = {
  fontSize: '0.75rem',
  fontWeight: 700,
  color: '#d98326',
  background: 'rgba(217, 131, 38, 0.12)',
  padding: '0.2rem 0.5rem',
  borderRadius: '6px',
};

const timelineContainer = {
  position: 'relative',
  paddingLeft: '2.5rem',
  marginBottom: '1.5rem',
};

const verticalLineBg = {
  position: 'absolute',
  left: '11px',
  top: '12px',
  bottom: '12px',
  width: '3px',
  background: 'rgba(255, 255, 255, 0.1)',
  borderRadius: '2px',
};

const verticalLineFill = {
  width: '100%',
  background: 'linear-gradient(to bottom, #22c55e, #d98326)',
  borderRadius: '2px',
};

const stepsList = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1.5rem',
};

const stepRow = {
  position: 'relative',
  display: 'flex',
  alignItems: 'flex-start',
};

const indicatorWrapper = {
  position: 'absolute',
  left: '-2.5rem',
  top: '0px',
  width: '26px',
  height: '26px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 2,
};

const completedCircle = {
  width: '24px',
  height: '24px',
  borderRadius: '50%',
  background: '#22c55e',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: '0 0 10px rgba(34, 197, 94, 0.4)',
};

const currentCirclePulse = {
  width: '24px',
  height: '24px',
  borderRadius: '50%',
  background: '#d98326',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: '0 0 0 6px rgba(217, 131, 38, 0.25)',
  animation: 'pulse 2s infinite ease-in-out',
};

const pulseDot = {
  width: '8px',
  height: '8px',
  borderRadius: '50%',
  background: '#FFFFFF',
};

const futureCircle = {
  width: '22px',
  height: '22px',
  borderRadius: '50%',
  background: '#120d0a',
  border: '2px solid rgba(255, 255, 255, 0.2)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const innerGreyDot = {
  width: '6px',
  height: '6px',
  borderRadius: '50%',
  background: 'rgba(255, 255, 255, 0.2)',
};

const stepContentBlock = {
  flex: 1,
};

const stepHeaderLine = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '0.35rem',
};

const stepTitleStyle = {
  fontSize: '0.95rem',
};

const stepTimeStyle = {
  fontSize: '0.75rem',
  color: 'rgba(253, 243, 231, 0.45)',
};

const trackingMsgBox = {
  padding: '0.65rem 0.85rem',
  borderRadius: '10px',
  border: '1px solid',
  marginTop: '0.35rem',
};

const trackingMsgText = {
  fontSize: '0.85rem',
  margin: 0,
  color: '#fdf3e7',
  fontStyle: 'italic',
  lineHeight: 1.4,
};

const updatedByTag = {
  display: 'inline-block',
  fontSize: '0.7rem',
  color: '#d98326',
  marginTop: '0.35rem',
  fontWeight: 600,
};

const addressBox = {
  display: 'flex',
  gap: '0.75rem',
  paddingTop: '1.25rem',
  borderTop: '1px dashed rgba(255, 255, 255, 0.1)',
  alignItems: 'flex-start',
};

const addressLabel = {
  fontSize: '0.7rem',
  textTransform: 'uppercase',
  color: 'rgba(253, 243, 231, 0.5)',
  fontWeight: 700,
  marginBottom: '0.2rem',
};

const addressText = {
  fontSize: '0.875rem',
  color: '#fdf3e7',
  lineHeight: 1.4,
};

const errorContainer = {
  background: '#1c1410',
  border: '1px solid rgba(239, 68, 68, 0.3)',
  borderRadius: '16px',
  padding: '1.5rem',
  display: 'flex',
  gap: '1rem',
  alignItems: 'flex-start',
};
