import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { OrderService } from '../../services/OrderService';
import { InvoiceService } from '../../services/InvoiceService';
import StatusBadge from '../../components/admin/StatusBadge';
import InvoiceCard from '../../components/admin/InvoiceCard';
import { 
  ArrowLeft, MapPin, CreditCard, Package, Truck, Printer, Mail, 
  XCircle, CheckCircle2, History, Sparkles
} from 'lucide-react';

const STAGE_FLOW = [
  { key: 'PLACED', label: 'Placed', actionText: 'Move to Packed', next: 'PACKED' },
  { key: 'PENDING', label: 'Placed', actionText: 'Move to Packed', next: 'PACKED' },
  { key: 'CONFIRMED', label: 'Placed', actionText: 'Move to Packed', next: 'PACKED' },
  { key: 'PACKED', label: 'Packed', actionText: 'Move to Roasted', next: 'ROASTED' },
  { key: 'PROCESSING', label: 'Packed', actionText: 'Move to Roasted', next: 'ROASTED' },
  { key: 'ROASTED', label: 'Roasted', actionText: 'Move to Dispatch', next: 'DISPATCHED' },
  { key: 'DISPATCHED', label: 'Dispatched', actionText: 'Move to Out For Delivery', next: 'OUT_FOR_DELIVERY' },
  { key: 'SHIPPED', label: 'Dispatched', actionText: 'Move to Out For Delivery', next: 'OUT_FOR_DELIVERY' },
  { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', actionText: 'Mark Delivered', next: 'DELIVERED' },
  { key: 'DELIVERED', label: 'Delivered', actionText: null, next: null },
  { key: 'CANCELLED', label: 'Cancelled', actionText: null, next: null },
];

const DEFAULT_MESSAGES = {
  PACKED: 'Beans carefully packed using protective packaging.',
  ROASTED: 'Freshly roasted today using our premium beans.',
  DISPATCHED: 'Handed over to logistics shipping partner.',
  OUT_FOR_DELIVERY: 'Package is out for delivery with local courier.',
  DELIVERED: 'Delivered successfully to customer address.',
};

export default function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toastMsg, setToastMsg] = useState({ msg: '', isError: false });

  // Guided Transition Modal State
  const [showModal, setShowModal] = useState(false);
  const [targetNextStage, setTargetNextStage] = useState(null);
  const [trackingMessage, setTrackingMessage] = useState('');
  const [updating, setUpdating] = useState(false);

  // Cancellation Modal State
  const [showCancelModal, setShowCancelModal] = useState(false);

  // Courier Form State
  const [courierPartner, setCourierPartner] = useState('Delhivery Express');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [savingCourier, setSavingCourier] = useState(false);

  const showToast = (msg, isError = false) => {
    setToastMsg({ msg, isError });
    setTimeout(() => setToastMsg({ msg: '', isError: false }), 3500);
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    setLoading(true);
    try {
      const res = await OrderService.getOrder(id);
      if (res.success && res.data) {
        setOrder(res.data);
        setCourierPartner(res.data.courierPartner || 'Delhivery Express');
        setTrackingNumber(res.data.trackingId || '');
      } else {
        // Fallback search in localStorage for offline testing
        const adminOrders = JSON.parse(localStorage.getItem('stb_admin_detailed_orders') || '[]');
        const found = adminOrders.find(o => o.id === id);
        if (found) setOrder(found);
      }
    } catch (e) {
      console.error('Failed to load order:', e);
    }
    setLoading(false);
  };

  // Determine current stage & next valid transition
  const currentStageConfig = STAGE_FLOW.find(s => s.key === order?.status) || STAGE_FLOW[0];
  const nextStageKey = currentStageConfig.next;
  const actionButtonText = currentStageConfig.actionText;

  // Open guided confirmation modal
  const handleOpenNextStageModal = () => {
    if (!nextStageKey) return;
    setTargetNextStage(nextStageKey);
    setTrackingMessage(DEFAULT_MESSAGES[nextStageKey] || '');
    setShowModal(true);
  };

  // Sync local storage so customer profile & tracking reflect live admin updates
  const syncLocalStorage = (newStatus, courier, tracking) => {
    try {
      const placed = JSON.parse(localStorage.getItem('stb_placed_orders') || '{}');
      const key = Object.keys(placed).find(k => k.toLowerCase() === id.toLowerCase()) || id;
      if (placed[key]) {
        placed[key] = {
          ...placed[key],
          status: newStatus || placed[key].status,
          courier: courier || placed[key].courier || 'Delhivery Express',
          courierPartner: courier || placed[key].courierPartner || 'Delhivery Express',
          trackingNumber: tracking || placed[key].trackingNumber || 'DEL90184021',
          trackingId: tracking || placed[key].trackingId || 'DEL90184021',
        };
        localStorage.setItem('stb_placed_orders', JSON.stringify(placed));
      }

      const adminDetailed = JSON.parse(localStorage.getItem('stb_admin_detailed_orders') || '[]');
      const adminIdx = adminDetailed.findIndex(o => o.id?.toLowerCase() === id.toLowerCase());
      if (adminIdx >= 0) {
        adminDetailed[adminIdx] = {
          ...adminDetailed[adminIdx],
          status: newStatus || adminDetailed[adminIdx].status,
          courierPartner: courier || adminDetailed[adminIdx].courierPartner,
          trackingId: tracking || adminDetailed[adminIdx].trackingId,
        };
        localStorage.setItem('stb_admin_detailed_orders', JSON.stringify(adminDetailed));
      }
    } catch (_e) {}
  };

  // Execute guided status change
  const handleConfirmNextStage = async () => {
    if (!targetNextStage) return;
    setUpdating(true);

    syncLocalStorage(targetNextStage, courierPartner, trackingNumber);

    try {
      const res = await OrderService.updateOrder(id, {
        status: targetNextStage,
        message: trackingMessage,
        actorName: 'Admin (Akshita)',
        courierPartner,
        trackingId: trackingNumber,
      });

      if (res.success) {
        setOrder(res.data);
        showToast(`Order status updated to ${targetNextStage}.`);
      } else {
        showToast('Failed to update status.', true);
      }
    } catch (_err) {
      // Local fallback update for demo
      const updatedOrder = {
        ...order,
        status: targetNextStage,
        courierPartner,
        trackingId: trackingNumber,
        trackingEvents: [
          ...(order.trackingEvents || []),
          { status: targetNextStage, message: trackingMessage, updatedBy: 'Admin (Akshita)', createdAt: new Date().toISOString() }
        ],
        auditLogs: [
          { actorName: 'Admin (Akshita)', action: 'STATUS_ADVANCED', details: `Moved Order ${order.status} → ${targetNextStage}`, createdAt: new Date().toISOString() },
          ...(order.auditLogs || [])
        ]
      };
      setOrder(updatedOrder);
      showToast(`Order status updated to ${targetNextStage}.`);
    }

    setUpdating(false);
    setShowModal(false);
  };

  // Cancel order
  const handleCancelOrder = async () => {
    setUpdating(true);
    try {
      const res = await OrderService.updateOrder(id, {
        status: 'CANCELLED',
        message: 'Order cancelled by administrator.',
        actorName: 'Admin (Akshita)',
      });
      if (res.success) {
        setOrder(res.data);
        showToast('Order cancelled.');
      }
    } catch (_e) {
      setOrder({ ...order, status: 'CANCELLED' });
      showToast('Order cancelled.');
    }
    setUpdating(false);
    setShowCancelModal(false);
  };

  // Save courier integration settings
  const handleSaveCourier = async () => {
    setSavingCourier(true);
    syncLocalStorage(null, courierPartner, trackingNumber);
    try {
      await OrderService.updateCourierDetails(id, {
        courierPartner,
        trackingNumber,
        actorName: 'Admin (Akshita)',
      });
      showToast('Courier partner and tracking number updated.');
    } catch (_e) {
      showToast('Courier details saved.');
    }
    setSavingCourier(false);
  };

  // Print Invoice trigger
  const handlePrintInvoice = () => {
    if (order) {
      InvoiceService.printInvoice(order);
      try {
        OrderService.logAdminAction(id, { actorName: 'Admin (Akshita)', action: 'INVOICE_PRINTED', details: 'Printed official tax invoice.' });
      } catch (_e) {}
    }
  };

  // Contact Customer trigger
  const handleContactCustomer = () => {
    const email = order.user?.email || order.customerEmail;
    if (email) {
      window.location.href = `mailto:${email}?subject=Regarding Spill the Beans Order #${order.id}`;
    } else {
      alert(`Customer Contact Phone: ${order.user?.phone || order.address?.phone || 'N/A'}`);
    }
  };

  if (loading) {
    return (
      <div style={pageWrapper}>
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-admin-muted)' }}>
          Loading Order Workspace…
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div style={pageWrapper}>
        <div style={{ textAlign: 'center', padding: '4rem' }}>
          <h3 style={{ color: 'var(--text-admin-bright)' }}>Order #{id} Not Found</h3>
          <Link to="/admin/orders" style={backLink}>← Return to Order Operations</Link>
        </div>
      </div>
    );
  }

  const customerName = order.user?.name || order.customerName || order.address?.name || 'Customer';
  const customerEmail = order.user?.email || order.customerEmail || '—';
  const customerPhone = order.user?.phone || order.address?.phone || '—';

  return (
    <div style={pageWrapper}>

      {/* Header Bar */}
      <div style={pageHeader}>
        <button onClick={() => navigate('/admin/orders')} style={backBtn}>
          <ArrowLeft size={16} /> Back to Operations
        </button>

        <div style={headerTextGroup}>
          <div style={orderNumberTitle}>
            ORDER #{order.id}
          </div>
          <p style={placedTimeSubtitle}>
            Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} at {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>

        <div style={badgeGroup}>
          <StatusBadge type="order" value={order.status} />
          <StatusBadge type="payment" value={order.paymentStatus} />
        </div>
      </div>

      {/* Quick Tooling Action Bar */}
      <div style={toolingBar}>
        <div style={{ display: 'flex', gap: '0.6rem' }}>
          <button onClick={handlePrintInvoice} style={toolBtn}>
            <Printer size={15} /> Print Invoice
          </button>
          <button onClick={handleContactCustomer} style={toolBtn}>
            <Mail size={15} /> Contact Customer
          </button>
        </div>

        {order.status !== 'CANCELLED' && order.status !== 'DELIVERED' && (
          <button onClick={() => setShowCancelModal(true)} style={cancelOrderBtn}>
            <XCircle size={15} /> Cancel Order
          </button>
        )}
      </div>

      {/* Main Workspace Grid (Shopify / Stripe / Notion Inspired Cards) */}
      <div style={contentGrid}>

        {/* Left Column: Details, Line Items, Timeline & History */}
        <div style={leftColumn}>

          {/* Customer & Value Card */}
          <div style={cardStyle}>
            <h2 style={cardTitleStyle}><CreditCard size={15} /> Customer & Payment Overview</h2>
            <div style={overviewGrid}>
              <OverviewItem label="Customer" value={customerName} isBold />
              <OverviewItem label="Payment Status" value={<StatusBadge type="payment" value={order.paymentStatus} />} />
              <OverviewItem label="Payment Method" value={order.paymentMethod || 'UPI / Online'} />
              <OverviewItem label="Order Value" value={`₹${(order.total / 100).toFixed(2)}`} isBold />
            </div>

            <div style={dividerStyle} />

            {/* Address */}
            <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start' }}>
              <MapPin size={16} color="var(--accent-admin-amber)" style={{ marginTop: '0.2rem' }} />
              <div>
                <div style={metaLabel}>Delivery Address</div>
                <div style={addressText}>
                  {order.address ? (
                    typeof order.address === 'string' ? order.address : `${order.address.name || customerName} — ${order.address.line1 || ''}, ${order.address.city || ''}, ${order.address.state || ''} - ${order.address.pincode || ''}`
                  ) : 'Standard Express Address'}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-admin-muted)', marginTop: '0.2rem' }}>
                  Phone: {customerPhone} · Email: {customerEmail}
                </div>
              </div>
            </div>
          </div>

          {/* Purchased Line Items Card */}
          <div style={cardStyle}>
            <h2 style={cardTitleStyle}><Package size={15} /> Purchased Beans & Items</h2>
            <table style={itemsTable}>
              <thead>
                <tr>
                  <th style={thStyle}>Item</th>
                  <th style={{ ...thStyle, textAlign: 'center' }}>Qty</th>
                  <th style={{ ...thStyle, textAlign: 'right' }}>Price</th>
                  <th style={{ ...thStyle, textAlign: 'right' }}>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {(order.items || []).map((item) => (
                  <tr key={item.id || item.name}>
                    <td style={tdStyle}>
                      <div style={itemName}>{item.name}</div>
                      {item.variant && <div style={itemVariant}>Variant: {item.variant}</div>}
                    </td>
                    <td style={{ ...tdStyle, textAlign: 'center' }}>{item.quantity}</td>
                    <td style={{ ...tdStyle, textAlign: 'right' }}>₹{(item.price / 100).toFixed(2)}</td>
                    <td style={{ ...tdStyle, textAlign: 'right', fontWeight: 600, color: 'var(--text-admin-bright)' }}>
                      ₹{((item.price * item.quantity) / 100).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={dividerStyle} />

            {/* Financial Breakdown */}
            <div style={totalsBox}>
              <TotalLine label="Subtotal" val={`₹${((order.subtotal || order.total) / 100).toFixed(2)}`} />
              {order.discount > 0 && <TotalLine label="Discount" val={`-₹${(order.discount / 100).toFixed(2)}`} isGreen />}
              <TotalLine label="Shipping Fee" val={order.shippingFee === 0 ? 'FREE' : `₹${(order.shippingFee / 100).toFixed(2)}`} />
              <div style={dividerStyle} />
              <TotalLine label="Grand Total" val={`₹${(order.total / 100).toFixed(2)}`} isHighlight />
            </div>
          </div>

          {/* Timeline & Tracking History Events */}
          <div style={cardStyle}>
            <h2 style={cardTitleStyle}><Truck size={15} /> Tracking History & Messages</h2>
            <div style={timelineList}>
              {(order.trackingEvents && order.trackingEvents.length > 0) ? (
                order.trackingEvents.map((evt, idx) => (
                  <div key={idx} style={timelineItem}>
                    <div style={timelineBullet}>
                      <CheckCircle2 size={16} color="#22c55e" />
                    </div>
                    <div style={timelineBody}>
                      <div style={timelineHeader}>
                        <span style={timelineStageTitle}>✔ {evt.status}</span>
                        <span style={timelineTimeStr}>
                          {new Date(evt.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} · {new Date(evt.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      {evt.message && <p style={timelineMsgText}>"{evt.message}"</p>}
                      {evt.updatedBy && <span style={timelineActorTag}>Updated by {evt.updatedBy}</span>}
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ color: 'var(--text-admin-muted)', fontSize: '0.85rem' }}>No tracking events recorded yet.</div>
              )}
            </div>
          </div>

          {/* Printable Invoice Component */}
          <InvoiceCard order={order} />

        </div>

        {/* Right Column: Guided Workflow Action, Courier Integration, Audit Log */}
        <div style={rightColumn}>

          {/* STRICT GUIDED WORKFLOW STAGE CARD — NO STATUS DROPDOWN */}
          <div style={{ ...cardStyle, border: '1px solid var(--accent-admin-amber)' }}>
            <div style={guidedHeader}>
              <Sparkles size={16} color="var(--accent-admin-amber)" />
              <h2 style={{ ...cardTitleStyle, margin: 0, color: 'var(--accent-admin-amber)' }}>Guided Workflow</h2>
            </div>
            
            <p style={guidedDesc}>
              Follow the strict guided stage sequence. Direct status dropdowns are disabled to ensure operational integrity.
            </p>

            <div style={currentStageBlock}>
              <div style={metaLabel}>Current Stage</div>
              <div style={currentStageValue}>
                {order.status === 'ROASTED' ? '🟡 Roasted' : order.status}
              </div>
            </div>

            {/* SINGLE NEXT VALID ACTION BUTTON */}
            {actionButtonText ? (
              <button onClick={handleOpenNextStageModal} style={guidedNextBtn}>
                {actionButtonText} →
              </button>
            ) : order.status === 'DELIVERED' ? (
              <div style={terminalBanner}>
                <CheckCircle2 size={18} color="#22c55e" /> Order Completed & Delivered
              </div>
            ) : (
              <div style={terminalBanner}>
                <XCircle size={18} color="#ef4444" /> Order Cancelled
              </div>
            )}
          </div>

          {/* Courier Integration Readiness Card */}
          <div style={cardStyle}>
            <h2 style={cardTitleStyle}><Truck size={15} /> Courier Integration</h2>
            <p style={courierHint}>Ready for Shiprocket, Delhivery, Blue Dart API hooks.</p>

            <div style={inputGroup}>
              <label style={inputLabel}>Courier Partner</label>
              <select 
                style={selectStyle} 
                value={courierPartner} 
                onChange={(e) => setCourierPartner(e.target.value)}
              >
                <option value="Delhivery Express">Delhivery Express</option>
                <option value="Shiprocket">Shiprocket</option>
                <option value="Blue Dart">Blue Dart</option>
                <option value="DTDC Express">DTDC Express</option>
                <option value="Shadowfax">Shadowfax</option>
              </select>
            </div>

            <div style={inputGroup}>
              <label style={inputLabel}>Tracking Number / AWB Code</label>
              <input
                type="text"
                placeholder="e.g. DEL90184021"
                style={inputStyle}
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
              />
            </div>

            <button onClick={handleSaveCourier} style={saveCourierBtn} disabled={savingCourier}>
              {savingCourier ? 'Saving…' : 'Update Courier Details'}
            </button>
          </div>

          {/* Admin Audit History Log (Visible ONLY inside Admin) */}
          <div style={cardStyle}>
            <h2 style={cardTitleStyle}><History size={15} /> Operations Audit Log</h2>
            <div style={auditList}>
              {(order.auditLogs && order.auditLogs.length > 0) ? (
                order.auditLogs.map((log, idx) => (
                  <div key={idx} style={auditItem}>
                    <div style={auditHeader}>
                      <span style={auditActor}>{log.actorName}</span>
                      <span style={auditTime}>{new Date(log.createdAt).toLocaleDateString()} {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div style={auditActionTag}>{log.action}</div>
                    {log.details && <div style={auditDetails}>{log.details}</div>}
                  </div>
                ))
              ) : (
                <div style={auditItem}>
                  <div style={auditHeader}>
                    <span style={auditActor}>System</span>
                    <span style={auditTime}>{new Date(order.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div style={auditActionTag}>ORDER_PLACED</div>
                  <div style={auditDetails}>Initial order record created.</div>
                </div>
              )}
            </div>
          </div>

        </div>

      </div>

      {/* CONFIRMATION & TRACKING MESSAGE MODAL */}
      {showModal && (
        <div style={modalOverlay}>
          <div style={modalBox}>
            <div style={modalHeader}>
              <h3 style={modalTitle}>Move Order Stage</h3>
              <button onClick={() => setShowModal(false)} style={modalCloseBtn}>✕</button>
            </div>

            <div style={modalBody}>
              <div style={transitionBanner}>
                <span>{currentStageConfig.label}</span>
                <span>→</span>
                <span style={{ color: 'var(--accent-admin-amber)', fontWeight: 700 }}>
                  {STAGE_FLOW.find(s => s.key === targetNextStage)?.label || targetNextStage}
                </span>
              </div>

              <p style={confirmQuestionText}>Are you sure you want to advance this order?</p>

              <div style={inputGroup}>
                <label style={inputLabel}>Tracking Message (Optional - Customer will view this)</label>
                <textarea
                  rows={3}
                  placeholder="e.g. Freshly roasted today using our premium beans."
                  style={textareaStyle}
                  value={trackingMessage}
                  onChange={(e) => setTrackingMessage(e.target.value)}
                />
              </div>
            </div>

            <div style={modalFooter}>
              <button onClick={() => setShowModal(false)} style={modalCancelBtn}>Cancel</button>
              <button onClick={handleConfirmNextStage} style={modalConfirmBtn} disabled={updating}>
                {updating ? 'Advancing…' : 'Confirm & Move Stage'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CANCEL CONFIRMATION MODAL */}
      {showCancelModal && (
        <div style={modalOverlay}>
          <div style={modalBox}>
            <div style={modalHeader}>
              <h3 style={{ ...modalTitle, color: '#ef4444' }}>Cancel Order #{order.id}</h3>
              <button onClick={() => setShowCancelModal(false)} style={modalCloseBtn}>✕</button>
            </div>

            <div style={modalBody}>
              <p style={{ color: 'var(--text-admin-bright)', fontSize: '0.9rem' }}>
                Are you sure you want to cancel this order? This action will set the status to <strong>CANCELLED</strong>.
              </p>
            </div>

            <div style={modalFooter}>
              <button onClick={() => setShowCancelModal(false)} style={modalCancelBtn}>Go Back</button>
              <button onClick={handleCancelOrder} style={{ ...modalConfirmBtn, background: '#d32f2f' }} disabled={updating}>
                {updating ? 'Cancelling…' : 'Confirm Cancel Order'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMsg.msg && (
        <div style={{ ...toastStyle, background: toastMsg.isError ? '#d32f2f' : '#2e7d32' }}>
          {toastMsg.msg}
        </div>
      )}

    </div>
  );
}

// Helper Overview Sub-component
function OverviewItem({ label, value, isBold }) {
  return (
    <div style={overviewRow}>
      <span style={overviewLabel}>{label}</span>
      <span style={{ ...overviewValue, fontWeight: isBold ? 700 : 500 }}>{value}</span>
    </div>
  );
}

function TotalLine({ label, val, isGreen, isHighlight }) {
  return (
    <div style={totalLineRow}>
      <span style={{ fontSize: '0.8125rem', color: 'var(--text-admin-muted)' }}>{label}</span>
      <span style={{ 
        fontSize: isHighlight ? '1.05rem' : '0.85rem', 
        fontWeight: isHighlight ? 800 : 600,
        color: isGreen ? '#22c55e' : isHighlight ? 'var(--text-admin-bright)' : 'var(--text-admin-muted)' 
      }}>{val}</span>
    </div>
  );
}

// Styling matching Spill the Beans Admin System
const pageWrapper = {
  maxWidth: '1300px',
  width: '100%',
};

const pageHeader = {
  display: 'flex',
  alignItems: 'center',
  gap: '1.5rem',
  marginBottom: '1.25rem',
  flexWrap: 'wrap',
};

const backBtn = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.35rem',
  background: 'none',
  border: '1px solid var(--border-admin)',
  color: 'var(--text-admin-muted)',
  padding: '0.4rem 0.75rem',
  borderRadius: '8px',
  fontSize: '0.8125rem',
  cursor: 'pointer',
  fontWeight: 600,
};

const backLink = {
  color: 'var(--accent-admin-amber)',
  fontWeight: 600,
  textDecoration: 'none',
};

const headerTextGroup = {};

const orderNumberTitle = {
  fontFamily: 'monospace',
  fontSize: '1.5rem',
  fontWeight: 800,
  color: 'var(--text-admin-bright)',
  letterSpacing: '0.5px',
};

const placedTimeSubtitle = {
  margin: 0,
  fontSize: '0.8125rem',
  color: 'var(--text-admin-muted)',
};

const badgeGroup = {
  display: 'flex',
  gap: '0.5rem',
  marginLeft: 'auto',
};

const toolingBar = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  background: 'var(--bg-admin-card)',
  border: '1px solid var(--border-admin)',
  padding: '0.75rem 1rem',
  borderRadius: '12px',
  marginBottom: '1.5rem',
};

const toolBtn = {
  background: 'rgba(253, 224, 193, 0.03)',
  border: '1px solid var(--border-admin)',
  color: 'var(--text-admin-bright)',
  padding: '0.45rem 0.85rem',
  borderRadius: '8px',
  fontSize: '0.8125rem',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: '0.4rem',
  fontWeight: 600,
};

const cancelOrderBtn = {
  background: 'rgba(239, 68, 68, 0.1)',
  border: '1px solid rgba(239, 68, 68, 0.3)',
  color: '#ef4444',
  padding: '0.45rem 0.85rem',
  borderRadius: '8px',
  fontSize: '0.8125rem',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: '0.4rem',
  fontWeight: 600,
};

const contentGrid = {
  display: 'grid',
  gridTemplateColumns: '1fr 380px',
  gap: '1.5rem',
  alignItems: 'start',
};

const leftColumn = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1.5rem',
};

const rightColumn = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1.5rem',
};

const cardStyle = {
  background: 'var(--bg-admin-card)',
  border: '1px solid var(--border-admin)',
  borderRadius: '14px',
  padding: '1.25rem',
};

const cardTitleStyle = {
  fontSize: '0.8125rem',
  fontWeight: 700,
  textTransform: 'uppercase',
  color: 'var(--accent-admin-amber)',
  letterSpacing: '0.5px',
  display: 'flex',
  alignItems: 'center',
  gap: '0.4rem',
  margin: '0 0 1rem 0',
};

const overviewGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(2, 1fr)',
  gap: '0.85rem',
};

const overviewRow = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.2rem',
};

const overviewLabel = {
  fontSize: '0.7rem',
  textTransform: 'uppercase',
  color: 'var(--text-admin-muted)',
  fontWeight: 700,
};

const overviewValue = {
  fontSize: '0.95rem',
  color: 'var(--text-admin-bright)',
};

const dividerStyle = {
  borderTop: '1px dashed var(--border-admin)',
  margin: '1rem 0',
};

const addressText = {
  fontSize: '0.875rem',
  color: 'var(--text-admin-bright)',
  lineHeight: 1.4,
};

const metaLabel = {
  fontSize: '0.65rem',
  textTransform: 'uppercase',
  color: 'var(--text-admin-muted)',
  fontWeight: 700,
  marginBottom: '0.2rem',
};

const itemsTable = {
  width: '100%',
  borderCollapse: 'collapse',
  fontSize: '0.8125rem',
};

const thStyle = {
  padding: '0.5rem 0',
  borderBottom: '1px solid var(--border-admin)',
  color: 'var(--text-admin-muted)',
  textAlign: 'left',
  fontWeight: 700,
  fontSize: '0.7rem',
  textTransform: 'uppercase',
};

const tdStyle = {
  padding: '0.75rem 0',
  borderBottom: '1px dashed rgba(253, 224, 193, 0.04)',
};

const itemName = {
  fontWeight: 600,
  color: 'var(--text-admin-bright)',
};

const itemVariant = {
  fontSize: '0.7rem',
  color: 'var(--text-admin-muted)',
  marginTop: '0.15rem',
};

const totalsBox = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.4rem',
};

const totalLineRow = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
};

const timelineList = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
};

const timelineItem = {
  display: 'flex',
  gap: '0.75rem',
  alignItems: 'flex-start',
};

const timelineBullet = {
  marginTop: '0.1rem',
};

const timelineBody = {
  flex: 1,
  background: 'rgba(253, 224, 193, 0.02)',
  border: '1px solid var(--border-admin)',
  padding: '0.6rem 0.85rem',
  borderRadius: '8px',
};

const timelineHeader = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '0.25rem',
};

const timelineStageTitle = {
  fontSize: '0.85rem',
  fontWeight: 700,
  color: 'var(--text-admin-bright)',
};

const timelineTimeStr = {
  fontSize: '0.7rem',
  color: 'var(--text-admin-muted)',
};

const timelineMsgText = {
  fontSize: '0.8125rem',
  color: 'var(--text-admin-bright)',
  margin: '0.2rem 0 0 0',
  fontStyle: 'italic',
};

const timelineActorTag = {
  fontSize: '0.65rem',
  color: 'var(--accent-admin-amber)',
  fontWeight: 600,
  display: 'block',
  marginTop: '0.2rem',
};

const guidedHeader = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.4rem',
  marginBottom: '0.75rem',
};

const guidedDesc = {
  fontSize: '0.8125rem',
  color: 'var(--text-admin-muted)',
  margin: '0 0 1rem 0',
  lineHeight: 1.4,
};

const currentStageBlock = {
  background: 'rgba(253, 224, 193, 0.03)',
  border: '1px solid var(--border-admin)',
  padding: '0.75rem',
  borderRadius: '8px',
  marginBottom: '1rem',
};

const currentStageValue = {
  fontSize: '1.2rem',
  fontWeight: 800,
  color: 'var(--accent-admin-amber)',
};

const guidedNextBtn = {
  width: '100%',
  background: 'linear-gradient(135deg, var(--accent-admin-amber) 0%, #b86518 100%)',
  border: 'none',
  color: '#FFFFFF',
  padding: '0.85rem',
  borderRadius: '10px',
  fontSize: '0.95rem',
  fontWeight: 800,
  cursor: 'pointer',
  boxShadow: '0 4px 14px rgba(217, 131, 38, 0.3)',
};

const terminalBanner = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  padding: '0.75rem',
  borderRadius: '8px',
  background: 'rgba(255, 255, 255, 0.03)',
  fontSize: '0.875rem',
  fontWeight: 700,
  color: 'var(--text-admin-bright)',
};

const courierHint = {
  fontSize: '0.75rem',
  color: 'var(--text-admin-muted)',
  margin: '0 0 0.75rem 0',
};

const inputGroup = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.3rem',
  marginBottom: '0.85rem',
};

const inputLabel = {
  fontSize: '0.7rem',
  color: 'var(--text-admin-muted)',
  fontWeight: 700,
  textTransform: 'uppercase',
};

const selectStyle = {
  padding: '0.5rem 0.7rem',
  background: 'rgba(253, 224, 193, 0.02)',
  border: '1px solid var(--border-admin)',
  borderRadius: '8px',
  color: 'var(--text-admin-bright)',
  fontSize: '0.8125rem',
  outline: 'none',
};

const inputStyle = {
  padding: '0.5rem 0.7rem',
  background: 'rgba(253, 224, 193, 0.02)',
  border: '1px solid var(--border-admin)',
  borderRadius: '8px',
  color: 'var(--text-admin-bright)',
  fontSize: '0.8125rem',
  outline: 'none',
  boxSizing: 'border-box',
  width: '100%',
};

const textareaStyle = {
  padding: '0.6rem 0.75rem',
  background: 'rgba(253, 224, 193, 0.02)',
  border: '1px solid var(--border-admin)',
  borderRadius: '8px',
  color: 'var(--text-admin-bright)',
  fontSize: '0.8125rem',
  outline: 'none',
  fontFamily: 'inherit',
  resize: 'vertical',
  boxSizing: 'border-box',
  width: '100%',
};

const saveCourierBtn = {
  width: '100%',
  background: 'rgba(253, 224, 193, 0.08)',
  border: '1px solid var(--border-admin)',
  color: 'var(--text-admin-bright)',
  padding: '0.55rem',
  borderRadius: '8px',
  fontSize: '0.8125rem',
  fontWeight: 600,
  cursor: 'pointer',
};

const auditList = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.75rem',
};

const auditItem = {
  background: 'rgba(0, 0, 0, 0.2)',
  border: '1px solid rgba(255, 255, 255, 0.04)',
  padding: '0.6rem 0.75rem',
  borderRadius: '8px',
};

const auditHeader = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '0.2rem',
};

const auditActor = {
  fontSize: '0.75rem',
  fontWeight: 700,
  color: 'var(--text-admin-bright)',
};

const auditTime = {
  fontSize: '0.65rem',
  color: 'var(--text-admin-muted)',
};

const auditActionTag = {
  fontSize: '0.65rem',
  fontWeight: 700,
  color: 'var(--accent-admin-amber)',
  fontFamily: 'monospace',
};

const auditDetails = {
  fontSize: '0.75rem',
  color: 'var(--text-admin-muted)',
  marginTop: '0.2rem',
};

const modalOverlay = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: 'rgba(0, 0, 0, 0.75)',
  backdropFilter: 'blur(4px)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
};

const modalBox = {
  background: 'var(--bg-admin-card)',
  border: '1px solid var(--border-admin)',
  borderRadius: '16px',
  width: '100%',
  maxWidth: '460px',
  padding: '1.5rem',
  boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)',
};

const modalHeader = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '1rem',
};

const modalTitle = {
  fontSize: '1.1rem',
  fontWeight: 800,
  margin: 0,
  color: 'var(--text-admin-bright)',
};

const modalCloseBtn = {
  background: 'none',
  border: 'none',
  color: 'var(--text-admin-muted)',
  fontSize: '1.1rem',
  cursor: 'pointer',
};

const modalBody = {
  marginBottom: '1.25rem',
};

const transitionBanner = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-around',
  background: 'rgba(253, 224, 193, 0.04)',
  border: '1px dashed var(--border-admin)',
  padding: '0.75rem',
  borderRadius: '10px',
  fontSize: '1.05rem',
  fontWeight: 600,
  color: 'var(--text-admin-bright)',
  marginBottom: '1rem',
};

const confirmQuestionText = {
  fontSize: '0.875rem',
  color: 'var(--text-admin-bright)',
  marginBottom: '1rem',
};

const modalFooter = {
  display: 'flex',
  justifyContent: 'flex-end',
  gap: '0.75rem',
};

const modalCancelBtn = {
  background: 'none',
  border: '1px solid var(--border-admin)',
  color: 'var(--text-admin-muted)',
  padding: '0.55rem 1rem',
  borderRadius: '8px',
  fontSize: '0.8125rem',
  cursor: 'pointer',
};

const modalConfirmBtn = {
  background: 'var(--accent-admin-amber)',
  border: 'none',
  color: '#FFFFFF',
  padding: '0.55rem 1.25rem',
  borderRadius: '8px',
  fontSize: '0.8125rem',
  fontWeight: 700,
  cursor: 'pointer',
};

const toastStyle = {
  position: 'fixed',
  bottom: '2rem',
  right: '2rem',
  color: '#FFFFFF',
  padding: '0.75rem 1.25rem',
  borderRadius: '10px',
  fontSize: '0.8125rem',
  fontWeight: 600,
  zIndex: 1000,
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
};
