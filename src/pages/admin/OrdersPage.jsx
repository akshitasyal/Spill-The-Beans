import { useState, useEffect, useCallback } from 'react';
import { OrderService } from '../../services/OrderService';
import { SectionHeader } from './AdminLayout';
import OrdersTable from '../../components/admin/OrdersTable';
import FilterBar from '../../components/admin/FilterBar';
import BulkActions from '../../components/admin/BulkActions';
import ConfirmationModal from '../../components/admin/ConfirmationModal';
import { RefreshCw } from 'lucide-react';

const ITEMS_PER_PAGE = 25;

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);
  const [toastMsg, setToastMsg] = useState('');

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
    });
  }, [status, paymentStatus, paymentMethod, searchQuery, amountMin, amountMax, dateStart, dateEnd]);

  useEffect(() => {
    let active = true;
    const timer = setTimeout(() => {
      if (active) setLoading(true);
    }, 0);
    OrderService.getOrders({
      status, paymentStatus, paymentMethod,
      search: searchQuery, amountMin, amountMax,
      dateStart, dateEnd
    }).then(res => {
      clearTimeout(timer);
      if (active) {
        if (res.success) {
          setOrders(res.data);
          setCurrentPage(1);
          setSelectedIds([]);
        }
        setLoading(false);
      }
    });
    return () => { active = false; clearTimeout(timer); };
  }, [status, paymentStatus, paymentMethod, searchQuery, amountMin, amountMax, dateStart, dateEnd]);

  const handleSelectRow = (id, checked) => {
    setSelectedIds(prev => checked ? [...prev, id] : prev.filter(x => x !== id));
  };

  const handleSelectAll = (checked) => {
    const pageOrders = paginatedOrders;
    setSelectedIds(checked ? pageOrders.map(o => o.id) : []);
  };

  const handleDeleteOrder = (id) => {
    setPendingDeleteId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (pendingDeleteId) {
      await OrderService.deleteOrder(pendingDeleteId);
      setShowDeleteModal(false);
      setPendingDeleteId(null);
      fetchOrders();
      showToast('Order deleted successfully.');
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedIds.length === 0) return;

    if (action === 'delete') {
      if (confirm(`Permanently delete ${selectedIds.length} orders? This cannot be undone.`)) {
        await OrderService.bulkDeleteOrders(selectedIds);
        fetchOrders();
        showToast(`Deleted ${selectedIds.length} orders.`);
      }
      return;
    }

    if (action === 'export') {
      const exportData = orders.filter(o => selectedIds.includes(o.id));
      const csv = [
        'Order ID,Customer,Email,Total,Status,Payment,Date',
        ...exportData.map(o => `${o.id},${o.customerName},${o.customerEmail},${(o.total/100).toFixed(2)},${o.status},${o.paymentStatus},${new Date(o.createdAt).toLocaleDateString()}`)
      ].join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `orders_export_${Date.now()}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      showToast(`Exported ${selectedIds.length} orders as CSV.`);
      return;
    }

    const statusMap = {
      processing: 'PROCESSING',
      shipped: 'SHIPPED',
      delivered: 'DELIVERED',
      cancel: 'CANCELLED'
    };

    if (statusMap[action]) {
      await OrderService.bulkUpdateOrders(selectedIds, { status: statusMap[action] });
      fetchOrders();
      showToast(`Updated ${selectedIds.length} orders to ${statusMap[action]}.`);
    }
  };

  // Pagination
  const totalPages = Math.ceil(orders.length / ITEMS_PER_PAGE);
  const paginatedOrders = orders.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <div>
      <SectionHeader
        title="Orders Management"
        subtitle={`${orders.length} orders found. Manage fulfillment, shipments, and payment status.`}
      >
        <button onClick={fetchOrders} style={refreshBtn} title="Refresh orders">
          <RefreshCw size={14} />
        </button>
      </SectionHeader>

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

      <BulkActions selectedCount={selectedIds.length} onAction={handleBulkAction} />

      <div className="recent-orders-card" style={{ overflowX: 'auto' }}>
        {loading ? (
          <div style={skeletonBox}>
            {[...Array(8)].map((_, i) => (
              <div key={i} style={skeletonRow}>
                <div style={{ ...skeletonCell, width: '2rem' }} />
                <div style={{ ...skeletonCell, width: '8rem' }} />
                <div style={{ ...skeletonCell, width: '7rem' }} />
                <div style={{ ...skeletonCell, width: '9rem' }} />
                <div style={{ ...skeletonCell, width: '5rem' }} />
                <div style={{ ...skeletonCell, width: '5rem' }} />
                <div style={{ ...skeletonCell, width: '5rem' }} />
                <div style={{ ...skeletonCell, width: '5rem' }} />
              </div>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div style={emptyState}>
            <div style={emptyIcon}>📦</div>
            <h3 style={emptyTitle}>No orders matched</h3>
            <p style={emptyText}>Try adjusting your search filters to find what you are looking for.</p>
          </div>
        ) : (
          <OrdersTable
            orders={paginatedOrders}
            selectedIds={selectedIds}
            onSelectRow={handleSelectRow}
            onSelectAll={handleSelectAll}
            onDeleteOrder={handleDeleteOrder}
          />
        )}
      </div>

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
            {totalPages > 5 && <span style={{ color: 'var(--text-admin-muted)', padding: '0 0.25rem' }}>…</span>}
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

      {/* Toast */}
      {toastMsg && (
        <div style={toast}>{toastMsg}</div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        title="Delete Order"
        message="Are you sure you want to permanently delete this order? This action cannot be undone."
        confirmText="Delete Order"
        onConfirm={confirmDelete}
        onCancel={() => { setShowDeleteModal(false); setPendingDeleteId(null); }}
      />
    </div>
  );
}

// Styles
const refreshBtn = {
  background: 'rgba(253, 224, 193, 0.02)',
  border: '1px solid var(--border-admin)',
  color: 'var(--text-admin-muted)',
  padding: '0.4rem',
  borderRadius: '8px',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center'
};

const skeletonBox = {
  padding: '1rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.75rem'
};

const skeletonRow = {
  display: 'flex',
  gap: '1rem',
  alignItems: 'center'
};

const skeletonCell = {
  height: '14px',
  borderRadius: '4px',
  background: 'rgba(253, 224, 193, 0.04)',
  animation: 'pulse 1.5s ease-in-out infinite'
};

const emptyState = {
  padding: '4rem',
  textAlign: 'center'
};

const emptyIcon = {
  fontSize: '3rem',
  marginBottom: '1rem'
};

const emptyTitle = {
  fontSize: '1.125rem',
  fontWeight: 600,
  color: 'var(--text-admin-bright)',
  margin: '0 0 0.5rem 0'
};

const emptyText = {
  color: 'var(--text-admin-muted)',
  fontSize: '0.875rem',
  margin: 0
};

const paginationRow = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginTop: '1.5rem',
  flexWrap: 'wrap',
  gap: '1rem'
};

const paginationInfo = {
  fontSize: '0.75rem',
  color: 'var(--text-admin-muted)'
};

const paginationBtns = {
  display: 'flex',
  gap: '0.25rem'
};

const pageBtn = {
  background: 'none',
  border: '1px solid var(--border-admin)',
  color: 'var(--text-admin-muted)',
  padding: '0.3rem 0.65rem',
  borderRadius: '6px',
  fontSize: '0.75rem',
  cursor: 'pointer'
};

const activePageBtn = {
  background: 'var(--accent-admin-amber)',
  border: 'none',
  color: '#FFFFFF',
  padding: '0.3rem 0.65rem',
  borderRadius: '6px',
  fontSize: '0.75rem',
  cursor: 'pointer',
  fontWeight: 600
};

const toast = {
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
  animation: 'slideUp 0.3s ease-out'
};
