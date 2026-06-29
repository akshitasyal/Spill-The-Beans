import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { OrderService } from '../../services/OrderService';
import { ShippingService } from '../../services/ShippingService';
import OrderTimeline from '../../components/admin/OrderTimeline';
import InvoiceCard from '../../components/admin/InvoiceCard';
import StatusBadge from '../../components/admin/StatusBadge';
import { ArrowLeft, MapPin, CreditCard, Package, StickyNote, Save } from 'lucide-react';

export default function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [couriers, setCouriers] = useState([]);

  // Editable form state
  const [formStatus, setFormStatus] = useState('');
  const [formPaymentStatus, setFormPaymentStatus] = useState('');
  const [formTrackingId, setFormTrackingId] = useState('');
  const [formCourier, setFormCourier] = useState('');
  const [formNotes, setFormNotes] = useState('');

  const showToast = (msg, isError = false) => {
    setToastMsg({ msg, isError });
    setTimeout(() => setToastMsg(''), 3500);
  };

  useEffect(() => {
    let active = true;
    OrderService.getOrder(id).then(res => {
      if (active && res.success) {
        const o = res.data;
        setOrder(o);
        setFormStatus(o.status);
        setFormPaymentStatus(o.paymentStatus);
        setFormTrackingId(o.trackingId || '');
        setFormCourier(o.courierPartner || '');
        setFormNotes(o.notes || '');
      }
      if (active) setLoading(false);
    }).catch(() => { if (active) setLoading(false); });

    ShippingService.getCourierPartners().then(setCouriers);

    return () => { active = false; };
  }, [id]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    const res = await OrderService.updateOrder(id, {
      status: formStatus,
      paymentStatus: formPaymentStatus,
      trackingId: formTrackingId || null,
      courierPartner: formCourier || null,
      notes: formNotes
    });
    setSaving(false);
    if (res.success) {
      setOrder(res.data);
      showToast('Order updated successfully.');
    } else {
      showToast('Failed to update order.', true);
    }
  };

  if (loading) {
    return (
      <div style={pageWrapper}>
        <div style={skeletonPage}>
          {[...Array(6)].map((_, i) => (
            <div key={i} style={{ ...skeletonBlock, width: i % 2 === 0 ? '60%' : '40%', height: i === 0 ? '2rem' : '1rem', marginBottom: '1rem' }} />
          ))}
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div style={pageWrapper}>
        <div style={{ textAlign: 'center', padding: '4rem' }}>
          <h3 style={{ color: 'var(--text-admin-bright)' }}>Order not found</h3>
          <Link to="/admin/orders" style={backLink}>← Back to Orders</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={pageWrapper}>
      {/* Header */}
      <div style={pageHeader}>
        <button onClick={() => navigate('/admin/orders')} style={backBtn}>
          <ArrowLeft size={16} /> Orders
        </button>
        <div>
          <h1 style={pageTitle}>Order #{order.id}</h1>
          <p style={pageSubtitle}>
            Placed on {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
        <div style={badgeGroup}>
          <StatusBadge type="order" value={order.status} />
          <StatusBadge type="payment" value={order.paymentStatus} />
        </div>
      </div>

      <div style={contentGrid}>
        {/* Left Column — Core Details */}
        <div style={leftColumn}>

          {/* Order Summary Card */}
          <div style={card}>
            <h2 style={cardTitle}><Package size={15} /> Order Summary</h2>
            <div style={summaryGrid}>
              <SummaryRow label="Order ID" value={`#${order.id}`} mono />
              <SummaryRow label="Order Status" value={<StatusBadge type="order" value={order.status} />} />
              <SummaryRow label="Payment Status" value={<StatusBadge type="payment" value={order.paymentStatus} />} />
              <SummaryRow label="Payment Method" value={order.paymentMethod} />
              <SummaryRow label="Transaction ID" value={order.transactionId || '—'} mono />
            </div>
            <div style={divider} />
            <div style={totalsBlock}>
              <TotalRow label="Subtotal" value={`₹${(order.subtotal / 100).toFixed(2)}`} />
              {order.discount > 0 && <TotalRow label="Discount" value={`-₹${(order.discount / 100).toFixed(2)}`} isDiscount />}
              <TotalRow label="Shipping" value={order.shippingFee === 0 ? 'Free' : `₹${(order.shippingFee / 100).toFixed(2)}`} />
              <TotalRow label="GST (18%)" value={`₹${(order.tax / 100).toFixed(2)}`} />
              <div style={divider} />
              <TotalRow label="Grand Total" value={`₹${(order.total / 100).toFixed(2)}`} isBold />
            </div>
          </div>

          {/* Purchased Products */}
          <div style={card}>
            <h2 style={cardTitle}>Purchased Products</h2>
            <table style={prodTable}>
              <thead>
                <tr>
                  <th style={prodTh}>Product</th>
                  <th style={{ ...prodTh, textAlign: 'center' }}>Qty</th>
                  <th style={{ ...prodTh, textAlign: 'right' }}>Price</th>
                  <th style={{ ...prodTh, textAlign: 'right' }}>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item) => (
                  <tr key={item.id}>
                    <td style={prodTd}>
                      <div style={prodName}>{item.name}</div>
                      {item.variant && <div style={prodVariant}>Variant: {item.variant}</div>}
                    </td>
                    <td style={{ ...prodTd, textAlign: 'center' }}>{item.quantity}</td>
                    <td style={{ ...prodTd, textAlign: 'right' }}>₹{(item.price / 100).toFixed(2)}</td>
                    <td style={{ ...prodTd, textAlign: 'right', fontWeight: 600 }}>
                      ₹{((item.price * item.quantity) / 100).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Order Timeline */}
          <OrderTimeline timeline={order.timeline || {}} />

          {/* Invoice */}
          <InvoiceCard order={order} />
        </div>

        {/* Right Column — Actions & Info */}
        <div style={rightColumn}>

          {/* Customer Info */}
          <div style={card}>
            <h2 style={cardTitle}><CreditCard size={15} /> Customer</h2>
            <Link to={`/admin/customers/${order.userId}`} style={customerLink}>{order.customerName}</Link>
            <div style={infoLine}>{order.customerEmail}</div>
            <div style={infoLine}>{order.customerPhone}</div>
          </div>

          {/* Delivery Address */}
          <div style={card}>
            <h2 style={cardTitle}><MapPin size={15} /> Delivery Address</h2>
            {order.address ? (
              <div style={addressBlock}>
                <div style={{ fontWeight: 600 }}>{order.address.name}</div>
                <div>{order.address.line1}</div>
                {order.address.line2 && <div>{order.address.line2}</div>}
                <div>{order.address.city}, {order.address.state} — {order.address.pincode}</div>
                <div style={{ marginTop: '0.25rem' }}>{order.address.phone}</div>
              </div>
            ) : (
              <div style={{ color: 'var(--text-admin-muted)' }}>No address recorded.</div>
            )}
          </div>

          {/* Fulfillment Management Form */}
          <form onSubmit={handleSave} style={card}>
            <h2 style={cardTitle}><Save size={15} /> Fulfillment Controls</h2>

            <div style={inputGroup}>
              <label style={inputLabel}>Order Status</label>
              <select style={selectStyle} value={formStatus} onChange={e => setFormStatus(e.target.value)}>
                <option value="PENDING">Pending</option>
                <option value="PROCESSING">Processing</option>
                <option value="PACKED">Packed</option>
                <option value="SHIPPED">Shipped</option>
                <option value="DELIVERED">Delivered</option>
                <option value="CANCELLED">Cancelled</option>
                <option value="REFUNDED">Refunded</option>
              </select>
            </div>

            <div style={inputGroup}>
              <label style={inputLabel}>Payment Status</label>
              <select style={selectStyle} value={formPaymentStatus} onChange={e => setFormPaymentStatus(e.target.value)}>
                <option value="PENDING">Pending</option>
                <option value="PAID">Paid</option>
                <option value="FAILED">Failed</option>
                <option value="REFUNDED">Refunded</option>
              </select>
            </div>

            <div style={inputGroup}>
              <label style={inputLabel}>Courier Partner</label>
              <select style={selectStyle} value={formCourier} onChange={e => setFormCourier(e.target.value)}>
                <option value="">Not Assigned</option>
                {couriers.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div style={inputGroup}>
              <label style={inputLabel}>Tracking Number</label>
              <input
                type="text"
                placeholder="TRK-98123456"
                style={inputStyle}
                value={formTrackingId}
                onChange={e => setFormTrackingId(e.target.value)}
              />
            </div>

            <button type="submit" style={saveBtn} disabled={saving}>
              {saving ? 'Saving...' : 'Apply Changes'}
            </button>
          </form>

          {/* Internal Notes */}
          <div style={card}>
            <h2 style={cardTitle}><StickyNote size={15} /> Internal Notes</h2>
            <p style={notesHint}>Only visible to admin. Not shown to customer.</p>
            <textarea
              rows={4}
              placeholder="Add private admin notes here…"
              style={notesInput}
              value={formNotes}
              onChange={e => setFormNotes(e.target.value)}
            />
            <button onClick={handleSave} style={saveBtn}>Save Notes</button>
          </div>
        </div>
      </div>

      {/* Toast */}
      {toastMsg && (
        <div style={{ ...toast, background: toastMsg.isError ? '#d32f2f' : '#2e7d32' }}>
          {toastMsg.msg}
        </div>
      )}
    </div>
  );
}

// Helper sub-components
function SummaryRow({ label, value, mono }) {
  return (
    <div style={summaryRow}>
      <span style={summaryLabel}>{label}</span>
      <span style={{ ...summaryValue, fontFamily: mono ? 'monospace' : 'inherit' }}>{value}</span>
    </div>
  );
}

function TotalRow({ label, value, isBold, isDiscount }) {
  return (
    <div style={totalRow}>
      <span style={totalLabel}>{label}</span>
      <span style={{
        ...totalValue,
        fontWeight: isBold ? 'bold' : 500,
        fontSize: isBold ? '1rem' : '0.8125rem',
        color: isDiscount ? '#2e7d32' : isBold ? 'var(--text-admin-bright)' : 'var(--text-admin-muted)'
      }}>{value}</span>
    </div>
  );
}

// Styles
const pageWrapper = {
  maxWidth: '1300px'
};

const skeletonPage = {
  padding: '2rem'
};

const skeletonBlock = {
  borderRadius: '6px',
  background: 'rgba(253, 224, 193, 0.04)'
};

const pageHeader = {
  display: 'flex',
  alignItems: 'center',
  gap: '1.5rem',
  marginBottom: '2rem',
  flexWrap: 'wrap'
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
  textDecoration: 'none'
};

const backLink = {
  color: 'var(--accent-admin-amber)',
  textDecoration: 'none',
  fontWeight: 600,
  fontSize: '0.875rem'
};

const pageTitle = {
  margin: '0 0 0.15rem 0',
  fontSize: '1.375rem',
  fontWeight: 'bold',
  color: 'var(--text-admin-bright)'
};

const pageSubtitle = {
  margin: 0,
  fontSize: '0.8125rem',
  color: 'var(--text-admin-muted)'
};

const badgeGroup = {
  display: 'flex',
  gap: '0.5rem',
  marginLeft: 'auto'
};

const contentGrid = {
  display: 'grid',
  gridTemplateColumns: '1fr 360px',
  gap: '1.5rem',
  alignItems: 'start'
};

const leftColumn = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1.5rem'
};

const rightColumn = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1.5rem'
};

const card = {
  background: 'var(--bg-admin-card)',
  border: '1px solid var(--border-admin)',
  borderRadius: '12px',
  padding: '1.25rem'
};

const cardTitle = {
  fontSize: '0.8125rem',
  fontWeight: 600,
  textTransform: 'uppercase',
  color: 'var(--accent-admin-amber)',
  letterSpacing: '0.5px',
  display: 'flex',
  alignItems: 'center',
  gap: '0.35rem',
  margin: '0 0 1rem 0'
};

const summaryGrid = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.6rem'
};

const summaryRow = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  fontSize: '0.8125rem'
};

const summaryLabel = {
  color: 'var(--text-admin-muted)'
};

const summaryValue = {
  color: 'var(--text-admin-bright)',
  fontWeight: 500
};

const divider = {
  borderTop: '1px dashed var(--border-admin)',
  margin: '0.75rem 0'
};

const totalsBlock = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.4rem'
};

const totalRow = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center'
};

const totalLabel = {
  fontSize: '0.8125rem',
  color: 'var(--text-admin-muted)'
};

const totalValue = {};

const prodTable = {
  width: '100%',
  borderCollapse: 'collapse',
  fontSize: '0.8125rem'
};

const prodTh = {
  padding: '0.5rem 0',
  borderBottom: '1px solid var(--border-admin)',
  color: 'var(--text-admin-muted)',
  textAlign: 'left',
  fontWeight: 600,
  fontSize: '0.7rem',
  textTransform: 'uppercase'
};

const prodTd = {
  padding: '0.75rem 0',
  borderBottom: '1px dashed rgba(253, 224, 193, 0.04)'
};

const prodName = {
  fontWeight: 600,
  color: 'var(--text-admin-bright)'
};

const prodVariant = {
  fontSize: '0.7rem',
  color: 'var(--text-admin-muted)',
  marginTop: '0.15rem'
};

const customerLink = {
  display: 'block',
  color: 'var(--accent-admin-amber)',
  fontWeight: 600,
  fontSize: '0.9375rem',
  textDecoration: 'none',
  marginBottom: '0.25rem'
};

const infoLine = {
  fontSize: '0.8125rem',
  color: 'var(--text-admin-muted)',
  marginBottom: '0.15rem'
};

const addressBlock = {
  fontSize: '0.8125rem',
  color: 'var(--text-admin-bright)',
  lineHeight: 1.6
};

const inputGroup = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.3rem',
  marginBottom: '0.8rem'
};

const inputLabel = {
  fontSize: '0.7rem',
  color: 'var(--text-admin-muted)',
  fontWeight: 600,
  textTransform: 'uppercase'
};

const selectStyle = {
  padding: '0.45rem 0.6rem',
  background: 'rgba(253,224,193,0.02)',
  border: '1px solid var(--border-admin)',
  borderRadius: '6px',
  color: 'var(--text-admin-bright)',
  fontSize: '0.8125rem',
  outline: 'none',
  cursor: 'pointer',
  width: '100%'
};

const inputStyle = {
  padding: '0.45rem 0.6rem',
  background: 'rgba(253,224,193,0.02)',
  border: '1px solid var(--border-admin)',
  borderRadius: '6px',
  color: 'var(--text-admin-bright)',
  fontSize: '0.8125rem',
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box'
};

const saveBtn = {
  background: 'var(--accent-admin-amber)',
  border: 'none',
  color: '#FFFFFF',
  width: '100%',
  padding: '0.6rem',
  borderRadius: '6px',
  fontSize: '0.8125rem',
  fontWeight: 600,
  cursor: 'pointer'
};

const notesHint = {
  fontSize: '0.75rem',
  color: 'var(--text-admin-muted)',
  margin: '0 0 0.75rem 0'
};

const notesInput = {
  width: '100%',
  padding: '0.5rem 0.75rem',
  background: 'rgba(253,224,193,0.02)',
  border: '1px solid var(--border-admin)',
  borderRadius: '6px',
  color: 'var(--text-admin-bright)',
  fontSize: '0.8125rem',
  fontFamily: 'inherit',
  resize: 'vertical',
  outline: 'none',
  boxSizing: 'border-box',
  marginBottom: '0.75rem'
};

const toast = {
  position: 'fixed',
  bottom: '2rem',
  right: '2rem',
  color: '#FFFFFF',
  padding: '0.75rem 1.25rem',
  borderRadius: '10px',
  fontSize: '0.8125rem',
  fontWeight: 600,
  zIndex: 1000,
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
};
