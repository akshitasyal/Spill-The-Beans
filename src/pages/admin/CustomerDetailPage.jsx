import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { CustomerService } from '../../services/CustomerService';
import StatusBadge from '../../components/admin/StatusBadge';
import { ArrowLeft, User, ShoppingBag, Star, Heart, MapPin, MessageSquare, Save } from 'lucide-react';

export default function CustomerDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [notesVal, setNotesVal] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  const showToast = (msg, isError = false) => {
    setToastMsg({ msg, isError });
    setTimeout(() => setToastMsg(''), 3500);
  };

  useEffect(() => {
    let active = true;
    CustomerService.getCustomer(id).then(res => {
      if (active && res.success) {
        setCustomer(res.data);
        setNotesVal(res.data.notes || '');
      }
      if (active) setLoading(false);
    }).catch(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id]);

  const handleSaveNotes = async () => {
    setSaving(true);
    const res = await CustomerService.updateCustomer(id, { notes: notesVal });
    setSaving(false);
    if (res.success) {
      setCustomer(prev => ({ ...prev, notes: notesVal }));
      showToast('Notes saved successfully.');
    } else {
      showToast('Failed to save notes.', true);
    }
  };

  const handleToggleSuspend = async () => {
    const newStatus = customer.accountStatus === 'SUSPENDED' ? 'ACTIVE' : 'SUSPENDED';
    const res = await CustomerService.updateCustomer(id, { accountStatus: newStatus });
    if (res.success) {
      setCustomer(prev => ({ ...prev, accountStatus: newStatus }));
      showToast(`Account ${newStatus === 'SUSPENDED' ? 'suspended' : 'reactivated'}.`);
    }
  };

  if (loading) {
    return (
      <div style={pageWrapper}>
        <div style={{ padding: '2rem' }}>
          {[...Array(5)].map((_, i) => (
            <div key={i} style={{ height: '1rem', background: 'rgba(253,224,193,0.04)', borderRadius: '6px', marginBottom: '1rem', width: i % 2 === 0 ? '60%' : '40%' }} />
          ))}
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div style={pageWrapper}>
        <div style={{ textAlign: 'center', padding: '4rem' }}>
          <h3 style={{ color: 'var(--text-admin-bright)' }}>Customer not found</h3>
          <Link to="/admin/customers" style={backLink}>← Back to Customers</Link>
        </div>
      </div>
    );
  }

  const isSuspended = customer.accountStatus === 'SUSPENDED';
  const orders = customer.orders || [];
  const totalOrders = orders.length;
  const totalSpent = orders.reduce((sum, o) => sum + (o.total || 0), 0);
  const avgOrder = totalOrders > 0 ? totalSpent / totalOrders : 0;
  const reviewCount = (customer.reviews || []).length;
  const wishlistCount = (customer.wishlist || []).length;

  return (
    <div style={pageWrapper}>
      {/* Page Header */}
      <div style={pageHeader}>
        <button onClick={() => navigate('/admin/customers')} style={backBtn}>
          <ArrowLeft size={16} /> Customers
        </button>
        <div style={heroRow}>
          <div style={avatarLarge}>
            <User size={28} color="#FFFFFF" />
          </div>
          <div>
            <h1 style={pageTitle}>{customer.name}</h1>
            <p style={pageSubtitle}>{customer.email} · Joined {new Date(customer.joinedDate).toLocaleDateString()}</p>
          </div>
        </div>
        <div style={headerActions}>
          <span className={`status-badge status-badge--${isSuspended ? 'cancelled' : 'delivered'}`}>
            {customer.accountStatus}
          </span>
          <button
            onClick={handleToggleSuspend}
            style={{ ...suspendBtn, background: isSuspended ? '#2e7d32' : '#d32f2f' }}
          >
            {isSuspended ? 'Activate Account' : 'Suspend Account'}
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div style={statsGrid}>
        <StatCard icon={<ShoppingBag size={18} color="var(--accent-admin-amber)" />} label="Total Orders" value={totalOrders} />
        <StatCard icon={<span style={{ fontSize: '1rem', fontWeight: 'bold', color: 'var(--accent-admin-amber)' }}>₹</span>} label="Total Spend" value={`₹${(totalSpent / 100).toFixed(0)}`} />
        <StatCard icon={<span style={{ fontSize: '1rem', fontWeight: 'bold', color: 'var(--accent-admin-amber)' }}>~</span>} label="Avg Order" value={`₹${(avgOrder / 100).toFixed(0)}`} />
        <StatCard icon={<Star size={18} color="var(--accent-admin-amber)" />} label="Reviews" value={reviewCount} />
        <StatCard icon={<Heart size={18} color="var(--accent-admin-amber)" />} label="Wishlist" value={wishlistCount} />
      </div>

      {/* Tab Navigation */}
      <div style={tabBar}>
        {['overview', 'orders', 'addresses', 'reviews', 'activity', 'notes'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={activeTab === tab ? activeTabBtn : tabBtn}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div style={tabContent}>
        {/* OVERVIEW */}
        {activeTab === 'overview' && (
          <div style={twoCol}>
            <div style={card}>
              <h3 style={cardTitle}><User size={14} /> Personal Information</h3>
              <InfoRow label="Full Name" value={customer.name} />
              <InfoRow label="Email Address" value={customer.email} />
              <InfoRow label="Phone" value={customer.phone} />
              <InfoRow label="Account Status" value={<span className={`status-badge status-badge--${isSuspended ? 'cancelled' : 'delivered'}`}>{customer.accountStatus}</span>} />
              <InfoRow label="Joined On" value={new Date(customer.joinedDate).toLocaleDateString()} />
            </div>
            <div style={card}>
              <h3 style={cardTitle}>Wishlist Products</h3>
              {wishlistCount > 0 ? (
                <ul style={wishlistList}>
                  {customer.wishlist.map((item, i) => (
                    <li key={i} style={wishlistItem}>
                      <Heart size={12} color="var(--accent-admin-amber)" /> {item}
                    </li>
                  ))}
                </ul>
              ) : (
                <p style={emptyMsg}>No products saved in wishlist.</p>
              )}
            </div>
          </div>
        )}

        {/* ORDERS */}
        {activeTab === 'orders' && (
          <div style={card}>
            <h3 style={cardTitle}><ShoppingBag size={14} /> Purchase History</h3>
            {orders.length > 0 ? (
              <table style={ordersTable}>
                <thead>
                  <tr>
                    <th style={orderTh}>Order ID</th>
                    <th style={orderTh}>Date</th>
                    <th style={orderTh}>Items</th>
                    <th style={orderTh}>Total</th>
                    <th style={orderTh}>Status</th>
                    <th style={orderTh}>Payment</th>
                    <th style={{ ...orderTh, textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(o => (
                    <tr key={o.id}>
                      <td style={orderTd}><code style={{ color: 'var(--accent-admin-amber)', fontSize: '0.75rem' }}>#{o.id}</code></td>
                      <td style={orderTd}>{new Date(o.createdAt).toLocaleDateString()}</td>
                      <td style={orderTd}>{(o.items || []).length} items</td>
                      <td style={{ ...orderTd, fontWeight: 600 }}>₹{(o.total / 100).toFixed(2)}</td>
                      <td style={orderTd}><StatusBadge type="order" value={o.status} /></td>
                      <td style={orderTd}><StatusBadge type="payment" value={o.paymentStatus} /></td>
                      <td style={{ ...orderTd, textAlign: 'right' }}>
                        <Link to={`/admin/orders/${o.id}`} style={viewLink}>View →</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p style={emptyMsg}>No orders placed yet by this customer.</p>
            )}
          </div>
        )}

        {/* ADDRESSES */}
        {activeTab === 'addresses' && (
          <div style={twoCol}>
            {(customer.addresses || []).length > 0 ? (
              customer.addresses.map((addr, i) => (
                <div key={i} style={card}>
                  <div style={addrHeader}>
                    <h3 style={cardTitle}><MapPin size={14} /> Address {i + 1}</h3>
                    {addr.isDefault && <span style={defaultTag}>Default</span>}
                  </div>
                  <p style={addrText}>
                    {addr.name}<br />
                    {addr.line1}<br />
                    {addr.line2 && <>{addr.line2}<br /></>}
                    {addr.city}, {addr.state} — {addr.pincode}<br />
                    {addr.phone}
                  </p>
                </div>
              ))
            ) : (
              <p style={emptyMsg}>No saved addresses on file.</p>
            )}
          </div>
        )}

        {/* REVIEWS */}
        {activeTab === 'reviews' && (
          <div style={card}>
            <h3 style={cardTitle}><Star size={14} /> Submitted Reviews</h3>
            {(customer.reviews || []).length > 0 ? (
              customer.reviews.map((r, i) => (
                <div key={i} style={reviewCard}>
                  <div style={reviewHeader}>
                    <span style={reviewProduct}>{r.productName}</span>
                    <div style={starsRow}>
                      {[...Array(5)].map((_, s) => (
                        <Star key={s} size={12} color={s < r.rating ? '#e5a93b' : 'var(--text-admin-muted)'} fill={s < r.rating ? '#e5a93b' : 'none'} />
                      ))}
                    </div>
                  </div>
                  <div style={reviewTitle}>{r.title}</div>
                  <div style={reviewBody}>{r.body}</div>
                  <div style={reviewDate}>{new Date(r.createdAt).toLocaleDateString()}</div>
                </div>
              ))
            ) : (
              <p style={emptyMsg}>No reviews submitted by this customer.</p>
            )}
          </div>
        )}

        {/* ACTIVITY */}
        {activeTab === 'activity' && (
          <div style={card}>
            <h3 style={cardTitle}>Recent Activity Timeline</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {(customer.activity || []).slice(0, 20).map((a, i) => (
                <div key={i} style={activityRow}>
                  <div style={activityDot} />
                  <div style={activityText}>
                    <span style={activityLabel}>{a.label}</span>
                    <span style={activityTime}>{new Date(a.timestamp).toLocaleDateString()} {new Date(a.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* NOTES */}
        {activeTab === 'notes' && (
          <div style={card}>
            <h3 style={cardTitle}><MessageSquare size={14} /> Internal Admin Notes</h3>
            <p style={notesHint}>Only visible to admins. Customer cannot see these notes.</p>
            <textarea
              rows={6}
              placeholder="Add private notes about this customer…"
              style={notesInput}
              value={notesVal}
              onChange={e => setNotesVal(e.target.value)}
            />
            <button onClick={handleSaveNotes} style={saveBtn} disabled={saving}>
              <Save size={14} /> {saving ? 'Saving...' : 'Save Notes'}
            </button>
          </div>
        )}
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

function StatCard({ icon, label, value }) {
  return (
    <div style={statCard}>
      <div style={statIcon}>{icon}</div>
      <div style={statValue}>{value}</div>
      <div style={statLabel}>{label}</div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div style={infoRow}>
      <span style={infoLabel}>{label}</span>
      <span style={infoValue}>{value}</span>
    </div>
  );
}

// Styles
const pageWrapper = { maxWidth: '1200px' };

const backLink = { color: 'var(--accent-admin-amber)', textDecoration: 'none', fontWeight: 600, fontSize: '0.875rem' };

const pageHeader = { display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.5rem', flexWrap: 'wrap' };

const backBtn = {
  display: 'flex', alignItems: 'center', gap: '0.35rem',
  background: 'none', border: '1px solid var(--border-admin)', color: 'var(--text-admin-muted)',
  padding: '0.4rem 0.75rem', borderRadius: '8px', fontSize: '0.8125rem', cursor: 'pointer', fontWeight: 600
};

const heroRow = { display: 'flex', alignItems: 'center', gap: '1rem' };

const avatarLarge = {
  width: '52px', height: '52px', borderRadius: '50%', background: 'var(--accent-admin-amber)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  boxShadow: '0 4px 12px rgba(194, 122, 10, 0.2)'
};

const pageTitle = { margin: '0 0 0.15rem 0', fontSize: '1.375rem', fontWeight: 'bold', color: 'var(--text-admin-bright)' };
const pageSubtitle = { margin: 0, fontSize: '0.8125rem', color: 'var(--text-admin-muted)' };

const headerActions = { display: 'flex', gap: '0.75rem', alignItems: 'center', marginLeft: 'auto' };

const suspendBtn = {
  border: 'none', color: '#FFFFFF', padding: '0.4rem 0.9rem',
  borderRadius: '8px', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer'
};

const statsGrid = {
  display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
  gap: '1rem', marginBottom: '1.5rem'
};

const statCard = {
  background: 'var(--bg-admin-card)', border: '1px solid var(--border-admin)',
  borderRadius: '10px', padding: '1rem 0.875rem', textAlign: 'center'
};

const statIcon = { marginBottom: '0.4rem', display: 'flex', justifyContent: 'center' };
const statValue = { fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--text-admin-bright)', marginBottom: '0.15rem' };
const statLabel = { fontSize: '0.7rem', color: 'var(--text-admin-muted)', textTransform: 'uppercase', fontWeight: 600 };

const tabBar = { display: 'flex', gap: '0.25rem', marginBottom: '1.5rem', flexWrap: 'wrap' };

const tabBtn = {
  background: 'none', border: '1px solid var(--border-admin)', color: 'var(--text-admin-muted)',
  padding: '0.4rem 0.9rem', borderRadius: '8px', fontSize: '0.8125rem', cursor: 'pointer'
};

const activeTabBtn = {
  background: 'var(--accent-admin-amber)', border: 'none', color: '#FFFFFF',
  padding: '0.4rem 0.9rem', borderRadius: '8px', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer'
};

const tabContent = {};

const twoCol = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' };

const card = { background: 'var(--bg-admin-card)', border: '1px solid var(--border-admin)', borderRadius: '12px', padding: '1.25rem' };

const cardTitle = {
  fontSize: '0.8125rem', fontWeight: 600, textTransform: 'uppercase',
  color: 'var(--accent-admin-amber)', letterSpacing: '0.5px',
  display: 'flex', alignItems: 'center', gap: '0.35rem', margin: '0 0 1rem 0'
};

const infoRow = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8125rem', marginBottom: '0.6rem' };
const infoLabel = { color: 'var(--text-admin-muted)' };
const infoValue = { color: 'var(--text-admin-bright)', fontWeight: 500 };

const wishlistList = { listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' };
const wishlistItem = { display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8125rem', color: 'var(--text-admin-bright)' };

const ordersTable = { width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem' };
const orderTh = { padding: '0.5rem 0', borderBottom: '1px solid var(--border-admin)', color: 'var(--text-admin-muted)', textAlign: 'left', fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 600 };
const orderTd = { padding: '0.75rem 0', borderBottom: '1px dashed rgba(253, 224, 193, 0.04)' };

const viewLink = { color: 'var(--accent-admin-amber)', textDecoration: 'none', fontWeight: 600, fontSize: '0.75rem' };

const addrHeader = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' };
const defaultTag = { background: 'rgba(194, 122, 10, 0.08)', color: 'var(--accent-admin-amber)', padding: '0.1rem 0.4rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 600 };
const addrText = { fontSize: '0.8125rem', color: 'var(--text-admin-bright)', lineHeight: 1.7, margin: 0 };

const reviewCard = { background: 'rgba(253, 224, 193, 0.01)', border: '1px solid var(--border-admin)', borderRadius: '8px', padding: '0.875rem', marginBottom: '0.75rem' };
const reviewHeader = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' };
const reviewProduct = { fontWeight: 600, fontSize: '0.8125rem', color: 'var(--text-admin-bright)' };
const starsRow = { display: 'flex', gap: '0.1rem' };
const reviewTitle = { fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-admin-bright)', marginBottom: '0.2rem' };
const reviewBody = { fontSize: '0.8125rem', color: 'var(--text-admin-muted)', lineHeight: 1.5, marginBottom: '0.35rem' };
const reviewDate = { fontSize: '0.7rem', color: 'var(--text-admin-muted)' };

const activityRow = { display: 'flex', gap: '0.75rem', alignItems: 'flex-start' };
const activityDot = { width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-admin-amber)', marginTop: '0.25rem', flexShrink: 0 };
const activityText = { display: 'flex', flexDirection: 'column', gap: '0.1rem' };
const activityLabel = { fontSize: '0.8125rem', color: 'var(--text-admin-bright)' };
const activityTime = { fontSize: '0.7rem', color: 'var(--text-admin-muted)' };

const notesHint = { fontSize: '0.75rem', color: 'var(--text-admin-muted)', margin: '0 0 0.75rem 0' };

const notesInput = {
  width: '100%', padding: '0.5rem 0.75rem',
  background: 'rgba(253,224,193,0.02)', border: '1px solid var(--border-admin)',
  borderRadius: '6px', color: 'var(--text-admin-bright)', fontSize: '0.8125rem',
  fontFamily: 'inherit', resize: 'vertical', outline: 'none',
  boxSizing: 'border-box', marginBottom: '0.75rem'
};

const saveBtn = {
  display: 'flex', alignItems: 'center', gap: '0.35rem',
  background: 'var(--accent-admin-amber)', border: 'none', color: '#FFFFFF',
  padding: '0.5rem 1rem', borderRadius: '6px', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer'
};

const emptyMsg = { color: 'var(--text-admin-muted)', fontSize: '0.875rem', margin: 0 };

const toast = {
  position: 'fixed', bottom: '2rem', right: '2rem', color: '#FFFFFF',
  padding: '0.75rem 1.25rem', borderRadius: '10px', fontSize: '0.8125rem', fontWeight: 600,
  zIndex: 1000, boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
};
