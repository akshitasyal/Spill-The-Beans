import PropTypes from 'prop-types';

export default function StatusBadge({ type, value }) {
  const getStyle = () => {
    const val = value.toUpperCase();
    if (type === 'order') {
      switch (val) {
        case 'DELIVERED':
          return { bg: 'rgba(46, 125, 50, 0.08)', color: '#2e7d32', border: '1px solid rgba(46, 125, 50, 0.2)' };
        case 'SHIPPED':
        case 'OUT_FOR_DELIVERY':
          return { bg: 'rgba(43, 108, 176, 0.08)', color: '#2b6cb0', border: '1px solid rgba(43, 108, 176, 0.2)' };
        case 'PACKED':
          return { bg: 'rgba(123, 52, 186, 0.08)', color: '#7b34ba', border: '1px solid rgba(123, 52, 186, 0.2)' };
        case 'PROCESSING':
          return { bg: 'rgba(229, 169, 59, 0.08)', color: '#e5a93b', border: '1px solid rgba(229, 169, 59, 0.2)' };
        case 'PENDING':
          return { bg: 'rgba(253, 220, 193, 0.04)', color: 'var(--text-admin-muted)', border: '1px solid var(--border-admin)' };
        case 'CANCELLED':
        case 'REFUNDED':
          return { bg: 'rgba(211, 47, 47, 0.08)', color: '#d32f2f', border: '1px solid rgba(211, 47, 47, 0.2)' };
        default:
          return { bg: 'rgba(253, 220, 193, 0.04)', color: 'var(--text-admin-muted)', border: '1px solid var(--border-admin)' };
      }
    } else {
      // payment
      switch (val) {
        case 'PAID':
          return { bg: 'rgba(46, 125, 50, 0.08)', color: '#2e7d32', border: '1px solid rgba(46, 125, 50, 0.2)' };
        case 'PENDING':
          return { bg: 'rgba(229, 169, 59, 0.08)', color: '#e5a93b', border: '1px solid rgba(229, 169, 59, 0.2)' };
        case 'FAILED':
        case 'REFUNDED':
          return { bg: 'rgba(211, 47, 47, 0.08)', color: '#d32f2f', border: '1px solid rgba(211, 47, 47, 0.2)' };
        default:
          return { bg: 'rgba(253, 220, 193, 0.04)', color: 'var(--text-admin-muted)', border: '1px solid var(--border-admin)' };
      }
    }
  };

  const style = getStyle();

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '0.2rem 0.5rem',
        borderRadius: '6px',
        fontSize: '0.7rem',
        fontWeight: 'bold',
        textTransform: 'uppercase',
        backgroundColor: style.bg,
        color: style.color,
        border: style.border,
        whiteSpace: 'nowrap'
      }}
    >
      {value}
    </span>
  );
}

StatusBadge.propTypes = {
  type: PropTypes.oneOf(['order', 'payment']).isRequired,
  value: PropTypes.string.isRequired
};
