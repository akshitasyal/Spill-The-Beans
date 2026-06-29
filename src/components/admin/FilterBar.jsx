import PropTypes from 'prop-types';
import { Search } from 'lucide-react';

export default function FilterBar({
  searchQuery,
  onSearchChange,
  status,
  onStatusChange,
  paymentStatus,
  onPaymentStatusChange,
  paymentMethod,
  onPaymentMethodChange,
  amountMin,
  onAmountMinChange,
  amountMax,
  onAmountMaxChange,
  dateStart,
  onDateStartChange,
  dateEnd,
  onDateEndChange
}) {
  return (
    <div style={filterContainer}>
      {/* Search Input */}
      <div style={searchRow}>
        <div style={searchWrapper}>
          <Search size={14} style={searchIcon} />
          <input
            type="text"
            placeholder="Search Order ID, Customer Name, Tracking..."
            style={searchInput}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>

      {/* Grid of drop-down filters */}
      <div style={filtersGrid}>
        <div style={filterField}>
          <label style={filterLabel}>Order Status</label>
          <select style={selectInput} value={status} onChange={(e) => onStatusChange(e.target.value)}>
            <option value="">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="PROCESSING">Processing</option>
            <option value="PACKED">Packed</option>
            <option value="SHIPPED">Shipped</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="REFUNDED">Refunded</option>
          </select>
        </div>

        <div style={filterField}>
          <label style={filterLabel}>Payment Status</label>
          <select style={selectInput} value={paymentStatus} onChange={(e) => onPaymentStatusChange(e.target.value)}>
            <option value="">All Payment States</option>
            <option value="PENDING">Pending</option>
            <option value="PAID">Paid</option>
            <option value="FAILED">Failed</option>
            <option value="REFUNDED">Refunded</option>
          </select>
        </div>

        <div style={filterField}>
          <label style={filterLabel}>Payment Method</label>
          <select style={selectInput} value={paymentMethod} onChange={(e) => onPaymentMethodChange(e.target.value)}>
            <option value="">All Gateways</option>
            <option value="RAZORPAY">Razorpay</option>
            <option value="STRIPE">Stripe</option>
            <option value="COD">COD</option>
          </select>
        </div>

        <div style={filterField}>
          <label style={filterLabel}>Min Amount (₹)</label>
          <input
            type="number"
            placeholder="0"
            style={numberInput}
            value={amountMin}
            onChange={(e) => onAmountMinChange(e.target.value)}
          />
        </div>

        <div style={filterField}>
          <label style={filterLabel}>Max Amount (₹)</label>
          <input
            type="number"
            placeholder="10000"
            style={numberInput}
            value={amountMax}
            onChange={(e) => onAmountMaxChange(e.target.value)}
          />
        </div>

        <div style={filterField}>
          <label style={filterLabel}>From Date</label>
          <input
            type="date"
            style={selectInput}
            value={dateStart}
            onChange={(e) => onDateStartChange(e.target.value)}
          />
        </div>

        <div style={filterField}>
          <label style={filterLabel}>To Date</label>
          <input
            type="date"
            style={selectInput}
            value={dateEnd}
            onChange={(e) => onDateEndChange(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}

FilterBar.propTypes = {
  searchQuery: PropTypes.string.isRequired,
  onSearchChange: PropTypes.func.isRequired,
  status: PropTypes.string.isRequired,
  onStatusChange: PropTypes.func.isRequired,
  paymentStatus: PropTypes.string.isRequired,
  onPaymentStatusChange: PropTypes.func.isRequired,
  paymentMethod: PropTypes.string.isRequired,
  onPaymentMethodChange: PropTypes.func.isRequired,
  amountMin: PropTypes.string.isRequired,
  onAmountMinChange: PropTypes.func.isRequired,
  amountMax: PropTypes.string.isRequired,
  onAmountMaxChange: PropTypes.func.isRequired,
  dateStart: PropTypes.string.isRequired,
  onDateStartChange: PropTypes.func.isRequired,
  dateEnd: PropTypes.string.isRequired,
  onDateEndChange: PropTypes.func.isRequired
};

const filterContainer = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
  background: 'var(--bg-admin-card)',
  border: '1px solid var(--border-admin)',
  borderRadius: '12px',
  padding: '1.25rem',
  marginBottom: '1.5rem'
};

const searchRow = {
  display: 'flex',
  width: '100%'
};

const searchWrapper = {
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  width: '100%',
  maxWidth: '500px'
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

const filtersGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
  gap: '0.75rem',
  width: '100%'
};

const filterField = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.25rem'
};

const filterLabel = {
  fontSize: '0.7rem',
  color: 'var(--text-admin-muted)',
  fontWeight: 600,
  textTransform: 'uppercase'
};

const selectInput = {
  padding: '0.4rem 0.6rem',
  background: 'rgba(253,224,193,0.02)',
  border: '1px solid var(--border-admin)',
  borderRadius: '6px',
  color: 'var(--text-admin-bright)',
  fontSize: '0.78rem',
  outline: 'none',
  cursor: 'pointer',
  boxSizing: 'border-box',
  width: '100%',
  height: '32px'
};

const numberInput = {
  padding: '0.4rem 0.6rem',
  background: 'rgba(253,224,193,0.02)',
  border: '1px solid var(--border-admin)',
  borderRadius: '6px',
  color: 'var(--text-admin-bright)',
  fontSize: '0.78rem',
  outline: 'none',
  boxSizing: 'border-box',
  width: '100%',
  height: '32px'
};
