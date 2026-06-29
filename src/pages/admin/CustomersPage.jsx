import { useState, useEffect, useCallback } from 'react';
import { CustomerService } from '../../services/CustomerService';
import { SectionHeader } from './AdminLayout';
import CustomerTable from '../../components/admin/CustomerTable';
import { Search, RefreshCw } from 'lucide-react';

const ITEMS_PER_PAGE = 20;

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const fetchCustomers = useCallback(() => {
    CustomerService.getCustomers({ search: searchQuery }).then(res => {
      if (res.success) {
        setCustomers(res.data);
        setCurrentPage(1);
      }
      setLoading(false);
    });
  }, [searchQuery]);

  useEffect(() => {
    let active = true;
    const timer = setTimeout(() => {
      if (active) setLoading(true);
    }, 0);
    CustomerService.getCustomers({ search: searchQuery }).then(res => {
      clearTimeout(timer);
      if (active) {
        if (res.success) {
          setCustomers(res.data);
          setCurrentPage(1);
        }
        setLoading(false);
      }
    });
    return () => { active = false; clearTimeout(timer); };
  }, [searchQuery]);

  // Stats
  const totalSpent = customers.reduce((sum, c) => sum + (c.totalSpent || 0), 0);
  const avgOrderValue = customers.length > 0 ? (totalSpent / Math.max(customers.reduce((sum, c) => sum + (c.orderCount || 0), 0), 1)) : 0;

  // Pagination
  const totalPages = Math.ceil(customers.length / ITEMS_PER_PAGE);
  const paginatedCustomers = customers.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <div>
      <SectionHeader
        title="Customers Directory"
        subtitle={`${customers.length} customers registered on the platform.`}
      >
        <button onClick={fetchCustomers} style={refreshBtn} title="Refresh list">
          <RefreshCw size={14} />
        </button>
      </SectionHeader>

      {/* Summary Stats */}
      <div style={statsRow}>
        <div style={statCard}>
          <span style={statLabel}>Total Customers</span>
          <span style={statValue}>{customers.length}</span>
        </div>
        <div style={statCard}>
          <span style={statLabel}>Total Revenue</span>
          <span style={statValue}>₹{(totalSpent / 100).toLocaleString()}</span>
        </div>
        <div style={statCard}>
          <span style={statLabel}>Avg Order Value</span>
          <span style={statValue}>₹{(avgOrderValue / 100).toFixed(2)}</span>
        </div>
        <div style={statCard}>
          <span style={statLabel}>Active Accounts</span>
          <span style={statValue}>{customers.filter(c => c.accountStatus !== 'SUSPENDED').length}</span>
        </div>
      </div>

      {/* Search Bar */}
      <div style={searchRow}>
        <div style={searchWrapper}>
          <Search size={14} style={searchIcon} />
          <input
            type="text"
            placeholder="Search by Name, Email, or Phone..."
            style={searchInput}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Customers Table */}
      <div className="recent-orders-card" style={{ overflowX: 'auto' }}>
        {loading ? (
          <div style={skeletonBox}>
            {[...Array(8)].map((_, i) => (
              <div key={i} style={skeletonRow}>
                <div style={{ ...skeletonCell, width: '2rem' }} />
                <div style={{ ...skeletonCell, width: '12rem' }} />
                <div style={{ ...skeletonCell, width: '6rem' }} />
                <div style={{ ...skeletonCell, width: '6rem' }} />
                <div style={{ ...skeletonCell, width: '5rem' }} />
                <div style={{ ...skeletonCell, width: '4rem' }} />
              </div>
            ))}
          </div>
        ) : customers.length === 0 ? (
          <div style={emptyState}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>👤</div>
            <h3 style={emptyTitle}>No customers found</h3>
            <p style={emptyText}>Try searching by name, email, or phone number.</p>
          </div>
        ) : (
          <CustomerTable customers={paginatedCustomers} />
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={paginationRow}>
          <span style={paginationInfo}>
            Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, customers.length)} of {customers.length}
          </span>
          <div style={paginationBtns}>
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} style={pageBtn} disabled={currentPage === 1}>
              Previous
            </button>
            {[...Array(Math.min(5, totalPages))].map((_, i) => {
              const p = i + 1;
              return (
                <button key={p} onClick={() => setCurrentPage(p)} style={p === currentPage ? activePageBtn : pageBtn}>
                  {p}
                </button>
              );
            })}
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} style={pageBtn} disabled={currentPage === totalPages}>
              Next
            </button>
          </div>
        </div>
      )}
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

const statsRow = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
  gap: '1rem',
  marginBottom: '1.5rem'
};

const statCard = {
  background: 'var(--bg-admin-card)',
  border: '1px solid var(--border-admin)',
  borderRadius: '10px',
  padding: '1rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.35rem'
};

const statLabel = {
  fontSize: '0.7rem',
  color: 'var(--text-admin-muted)',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.5px'
};

const statValue = {
  fontSize: '1.25rem',
  fontWeight: 'bold',
  color: 'var(--text-admin-bright)'
};

const searchRow = {
  marginBottom: '1.5rem'
};

const searchWrapper = {
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  maxWidth: '440px'
};

const searchIcon = {
  position: 'absolute',
  left: '0.75rem',
  color: 'var(--text-admin-muted)'
};

const searchInput = {
  width: '100%',
  padding: '0.5rem 1.75rem 0.5rem 2.25rem',
  background: 'rgba(253,224,193,0.02)',
  border: '1px solid var(--border-admin)',
  borderRadius: '8px',
  color: 'var(--text-admin-bright)',
  fontSize: '0.8125rem',
  outline: 'none',
  boxSizing: 'border-box'
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
