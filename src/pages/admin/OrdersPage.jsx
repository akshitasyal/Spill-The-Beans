import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { OrderService } from '../../services/OrderService';
import { SectionHeader } from './AdminLayout';
import FilterBar from '../../components/admin/FilterBar';
import StatusBadge from '../../components/admin/StatusBadge';
import ConfirmationModal from '../../components/admin/ConfirmationModal';
import { RefreshCw, Package, ArrowRight, Clock, CheckCircle2, Truck, Flame, LayoutGrid, List } from 'lucide-react';

const ITEMS_PER_PAGE = 20;

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);
  const [toastMsg, setToastMsg] = useState('');
  const [viewMode, setViewMode] = useState('cards'); // 'cards' or 'table'

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [status, setStatus] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [amountMin, setAmountMin] = useState('');
  const [amountMax, setAmountMax] = useState('');
  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const fetchOrders = useCallback(() => {
    setLoading(true);
    OrderService.getOrders({
      status, paymentStatus, paymentMethod,
      search: searchQuery, amountMin, amountMax,
      dateStart, dateEnd
    }).then(res => {
      if (res.success) {
        setOrders(res.data);
        setCurrentPage(1);
        setSelectedIds([]);
      }
      setLoading(false);
    }).catch(err => {
      console.error('Failed to fetch orders:', err);
      setLoading(false);
    });
  }, [status, paymentStatus, paymentMethod, searchQuery, amountMin, amountMax, dateStart, dateEnd]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const confirmDelete = async () => {
    if (pendingDeleteId) {
      await OrderService.deleteOrder(pendingDeleteId);
      setShowDeleteModal(false);
      setPendingDeleteId(null);
      fetchOrders();
      showToast('Order deleted successfully.');
    }
  };

  // Operational metrics summary
  const totalCount = orders.length;
  const pendingPack = orders.filter(o => ['PLACED', 'PENDING', 'CONFIRMED'].includes(o.status)).length;
  const inRoastPack = orders.filter(o => ['PACKED', 'ROASTED', 'PROCESSING'].includes(o.status)).length;
  const inTransit = orders.filter(o => ['DISPATCHED', 'SHIPPED', 'OUT_FOR_DELIVERY'].includes(o.status)).length;
  const delivered = orders.filter(o => o.status === 'DELIVERED').length;

  // Pagination
  const totalPages = Math.ceil(orders.length / ITEMS_PER_PAGE);
  const paginatedOrders = orders.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <div style={containerStyle}>
      <SectionHeader
        title="Order Operations Console"
        subtitle={`${orders.length} active orders requiring guided fulfillment and dispatch management.`}
      >
        <div style={headerActionsRow}>
          <div style={viewToggleGroup}>
            <button
              onClick={() => setViewMode('cards')}
              style={viewMode === 'cards' ? activeToggleBtn : toggleBtn}
              title="Shopify/Linear Cards View"
            >
              <LayoutGrid size={14} /> Operations Cards
            </button>
            <button
              onClick={() => setViewMode('table')}
              style={viewMode === 'table' ? activeToggleBtn : toggleBtn}
              title="Condensed List Table View"
            >
              <List size={14} /> Table View
            </button>
          </div>
          <button onClick={fetchOrders} style={refreshBtn} title="Refresh orders">
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
      </SectionHeader>

      {/* Operational Metrics Cards */}
      <div style={metricsGrid}>
        <div style={metricCard}>
          <div style={metricHeader}>
            <span style={metricLabel}>Total Orders</span>
            <Package size={16} color="var(--accent-admin-amber)" />
          </div>
          <div style={metricValue}>{totalCount}</div>
        </div>
        <div style={metricCard}>
          <div style={metricHeader}>
            <span style={metricLabel}>Needs Pack / Roast</span>
            <Flame size={16} color="#f97316" />
          </div>
          <div style={metricValue}>{pendingPack + inRoastPack}</div>
        </div>
        <div style={metricCard}>
          <div style={metricHeader}>
            <span style={metricLabel}>In Transit</span>
            <Truck size={16} color="#3b82f6" />
          </div>
          <div style={metricValue}>{inTransit}</div>
        </div>
        <div style={metricCard}>
          <div style={metricHeader}>
            <span style={metricLabel}>Delivered</span>
            <CheckCircle2 size={16} color="#22c55e" />
          </div>
          <div style={metricValue}>{delivered}</div>
        </div>
      </div>

      {/* Filters */}
      <FilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        status={status}
        onStatusChange={setStatus}
        paymentStatus={paymentStatus}
        onPaymentStatusChange={setPaymentStatus}
        paymentMethod={paymentMethod}
        onPaymentMethodChange={setPaymentMethod}
        amountMin={amountMin}
        onAmountMinChange={setAmountMin}
        amountMax={amountMax}
        onAmountMaxChange={setAmountMax}
        dateStart={dateStart}
        onDateStartChange={setDateStart}
        dateEnd={dateEnd}
        onDateEndChange={setDateEnd}
      />

      {/* Operations Content Area */}
      {loading ? (
        <div style={skeletonBox}>
          {[...Array(6)].map((_, i) => (
            <div key={i} style={skeletonCard} />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div style={emptyState}>
          <div style={emptyIcon}>☕</div>
          <h3 style={emptyTitle}>No orders match the current criteria</h3>
          <p style={emptyText}>Try clearing search parameters or status filters.</p>
        </div>
      ) : viewMode === 'cards' ? (
        /* Shopify/Linear Inspired Operations Cards List */
        <div style={cardsGrid}>
          {paginatedOrders.map((o) => {
            const displayId = o.id.startsWith('SB') || o.id.startsWith('STB') ? o.id : `SB${o.id.substring(0, 4).toUpperCase()}`;
            const customerName = o.user?.name || o.customerName || o.address?.name || 'Guest Customer';
            const totalInInr = (o.total / 100).toFixed(2);
            const createdDateStr = new Date(o.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

            return (
              <div key={o.id} style={opCardStyle}>
                <div style={opCardHeader}>
                  <div>
                    <div style={orderIdTag}>#{displayId}</div>
                    <div style={customerNameStyle}>{customerName}</div>
                  </div>
                  <div style={amountTag}>₹{totalInInr}</div>
                </div>

                <div style={cardDivider} />

                <div style={cardMetaRow}>
                  <div>
                    <div style={metaLabel}>Current Stage</div>
                    <StatusBadge type="order" value={o.status} />
                  </div>
                  <div>
                    <div style={metaLabel}>Payment</div>
                    <StatusBadge type="payment" value={o.paymentStatus} />
                  </div>
                  <div>
                    <div style={metaLabel}>Date</div>
                    <div style={dateVal}>{createdDateStr}</div>
                  </div>
                </div>

                <div style={cardActionRow}>
                  <Link to={`/admin/orders/${o.id}`} style={openOrderBtn}>
                    Open Order Workspace <ArrowRight size={15} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Alternative Condensed List */
        <div className="recent-orders-card" style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Payment</th>
                <th>Date</th>
                <th style={{ textAlign: 'right', paddingRight: '1rem' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {paginatedOrders.map((o) => (
                <tr key={o.id}>
                  <td style={{ fontFamily: 'monospace', fontWeight: 'bold', color: 'var(--accent-admin-amber)' }}>#{o.id}</td>
                  <td style={{ fontWeight: 600 }}>{o.user?.name || o.customerName || 'Customer'}</td>
                  <td style={{ fontWeight: 600 }}>₹{(o.total / 100).toFixed(2)}</td>
                  <td><StatusBadge type="order" value={o.status} /></td>
                  <td><StatusBadge type="payment" value={o.paymentStatus} /></td>
                  <td style={{ fontSize: '0.75rem', color: 'var(--text-admin-muted)' }}>{new Date(o.createdAt).toLocaleDateString()}</td>
                  <td style={{ textAlign: 'right', paddingRight: '1rem' }}>
                    <Link to={`/admin/orders/${o.id}`} style={tableOpenBtn}>
                      Open Order →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={paginationRow}>
          <span style={paginationInfo}>
            Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, orders.length)} of {orders.length}
          </span>
          <div style={paginationBtns}>
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              style={pageBtn}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            {[...Array(Math.min(5, totalPages))].map((_, i) => {
              const p = i + 1;
              return (
                <button
                  key={p}
                  onClick={() => setCurrentPage(p)}
                  style={p === currentPage ? activePageBtn : pageBtn}
                >
                  {p}
                </button>
              );
            })}
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              style={pageBtn}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMsg && <div style={toastStyle}>{toastMsg}</div>}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        title="Delete Order"
        message="Are you sure you want to delete this order record? Action cannot be undone."
        confirmText="Delete Order"
        onConfirm={confirmDelete}
        onCancel={() => { setShowDeleteModal(false); setPendingDeleteId(null); }}
      />
    </div>
  );
}

// Inline Styles matching Spill The Beans Admin Aesthetics
const containerStyle = {
  maxWidth: '1300px',
  width: '100%',
};

const headerActionsRow = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
};

const viewToggleGroup = {
  display: 'flex',
  background: 'rgba(253, 224, 193, 0.03)',
  border: '1px solid var(--border-admin)',
  borderRadius: '8px',
  padding: '0.2rem',
};

const toggleBtn = {
  background: 'none',
  border: 'none',
  color: 'var(--text-admin-muted)',
  padding: '0.3rem 0.65rem',
  borderRadius: '6px',
  fontSize: '0.75rem',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: '0.35rem',
};

const activeToggleBtn = {
  background: 'var(--accent-admin-amber)',
  border: 'none',
  color: '#FFFFFF',
  padding: '0.3rem 0.65rem',
  borderRadius: '6px',
  fontSize: '0.75rem',
  cursor: 'pointer',
  fontWeight: 600,
  display: 'flex',
  alignItems: 'center',
  gap: '0.35rem',
};

const refreshBtn = {
  background: 'none',
  border: '1px solid var(--border-admin)',
  color: 'var(--text-admin-bright)',
  padding: '0.4rem 0.75rem',
  borderRadius: '8px',
  fontSize: '0.8125rem',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: '0.35rem',
  fontWeight: 600,
};

const metricsGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(4, 1fr)',
  gap: '1rem',
  marginBottom: '1.5rem',
};

const metricCard = {
  background: 'var(--bg-admin-card)',
  border: '1px solid var(--border-admin)',
  borderRadius: '12px',
  padding: '1.1rem',
};

const metricHeader = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '0.5rem',
};

const metricLabel = {
  fontSize: '0.75rem',
  color: 'var(--text-admin-muted)',
  fontWeight: 600,
};

const metricValue = {
  fontSize: '1.6rem',
  fontWeight: 800,
  color: 'var(--text-admin-bright)',
};

const cardsGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
  gap: '1.25rem',
  marginBottom: '1.5rem',
};

const opCardStyle = {
  background: 'var(--bg-admin-card)',
  border: '1px solid var(--border-admin)',
  borderRadius: '14px',
  padding: '1.25rem',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  transition: 'transform 0.2s ease, border-color 0.2s ease',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
};

const opCardHeader = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
};

const orderIdTag = {
  fontFamily: 'monospace',
  fontSize: '1.1rem',
  fontWeight: 800,
  color: 'var(--accent-admin-amber)',
  letterSpacing: '0.5px',
};

const customerNameStyle = {
  fontSize: '0.95rem',
  fontWeight: 600,
  color: 'var(--text-admin-bright)',
  marginTop: '0.2rem',
};

const amountTag = {
  fontSize: '1.15rem',
  fontWeight: 800,
  color: 'var(--text-admin-bright)',
};

const cardDivider = {
  borderTop: '1px dashed var(--border-admin)',
  margin: '1rem 0',
};

const cardMetaRow = {
  display: 'flex',
  justifyContent: 'space-between',
  marginBottom: '1.25rem',
  gap: '0.5rem',
};

const metaLabel = {
  fontSize: '0.65rem',
  textTransform: 'uppercase',
  color: 'var(--text-admin-muted)',
  fontWeight: 700,
  marginBottom: '0.25rem',
};

const dateVal = {
  fontSize: '0.75rem',
  color: 'var(--text-admin-bright)',
  fontWeight: 500,
  marginTop: '0.2rem',
};

const cardActionRow = {
  display: 'flex',
  justifyContent: 'stretch',
};

const openOrderBtn = {
  width: '100%',
  background: 'rgba(253, 224, 193, 0.05)',
  border: '1px solid var(--accent-admin-amber)',
  color: 'var(--accent-admin-amber)',
  borderRadius: '8px',
  padding: '0.6rem 1rem',
  fontSize: '0.85rem',
  fontWeight: 700,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '0.5rem',
  textDecoration: 'none',
  transition: 'background 0.2s ease',
};

const tableOpenBtn = {
  color: 'var(--accent-admin-amber)',
  fontWeight: 700,
  textDecoration: 'none',
  fontSize: '0.8125rem',
};

const skeletonBox = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
  gap: '1.25rem',
};

const skeletonCard = {
  height: '180px',
  borderRadius: '14px',
  background: 'rgba(253, 224, 193, 0.04)',
  animation: 'pulse 1.5s ease-in-out infinite',
};

const emptyState = {
  padding: '4rem',
  textAlign: 'center',
  background: 'var(--bg-admin-card)',
  borderRadius: '14px',
  border: '1px solid var(--border-admin)',
};

const emptyIcon = {
  fontSize: '3rem',
  marginBottom: '1rem',
};

const emptyTitle = {
  fontSize: '1.125rem',
  fontWeight: 600,
  color: 'var(--text-admin-bright)',
  margin: '0 0 0.5rem 0',
};

const emptyText = {
  color: 'var(--text-admin-muted)',
  fontSize: '0.875rem',
  margin: 0,
};

const paginationRow = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginTop: '1.5rem',
  flexWrap: 'wrap',
  gap: '1rem',
};

const paginationInfo = {
  fontSize: '0.75rem',
  color: 'var(--text-admin-muted)',
};

const paginationBtns = {
  display: 'flex',
  gap: '0.25rem',
};

const pageBtn = {
  background: 'none',
  border: '1px solid var(--border-admin)',
  color: 'var(--text-admin-muted)',
  padding: '0.3rem 0.65rem',
  borderRadius: '6px',
  fontSize: '0.75rem',
  cursor: 'pointer',
};

const activePageBtn = {
  background: 'var(--accent-admin-amber)',
  border: 'none',
  color: '#FFFFFF',
  padding: '0.3rem 0.65rem',
  borderRadius: '6px',
  fontSize: '0.75rem',
  cursor: 'pointer',
  fontWeight: 600,
};

const toastStyle = {
  position: 'fixed',
  bottom: '2rem',
  right: '2rem',
  background: '#2e7d32',
  color: '#FFFFFF',
  padding: '0.75rem 1.25rem',
  borderRadius: '10px',
  fontSize: '0.8125rem',
  fontWeight: 600,
  zIndex: 1000,
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
};
