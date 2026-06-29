import PropTypes from 'prop-types';
import StatusBadge from './StatusBadge';
import { Eye, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function OrdersTable({ orders, selectedIds, onSelectRow, onSelectAll, onDeleteOrder }) {
  const allSelected = orders.length > 0 && selectedIds.length === orders.length;

  return (
    <table className="admin-table">
      <thead>
        <tr>
          <th style={{ width: '40px', paddingLeft: '1rem' }}>
            <input
              type="checkbox"
              checked={allSelected}
              onChange={(e) => onSelectAll(e.target.checked)}
              style={checkboxStyle}
            />
          </th>
          <th>Order ID</th>
          <th>Customer</th>
          <th>Email</th>
          <th>Products</th>
          <th>Total</th>
          <th>Method</th>
          <th>Payment</th>
          <th>Status</th>
          <th>Placed Date</th>
          <th style={{ textAlign: 'right', paddingRight: '1rem' }}>Actions</th>
        </tr>
      </thead>
      <tbody>
        {orders.map((o) => {
          const isSelected = selectedIds.includes(o.id);
          const productsSummary = o.items.map(item => `${item.name} (${item.quantity}x)`).join(', ');

          return (
            <tr key={o.id} style={isSelected ? selectedRowStyle : undefined}>
              <td style={{ paddingLeft: '1rem' }}>
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={(e) => onSelectRow(o.id, e.target.checked)}
                  style={checkboxStyle}
                />
              </td>
              <td>
                <Link to={`/admin/orders/${o.id}`} style={idLinkStyle}>
                  #{o.id}
                </Link>
              </td>
              <td style={{ fontWeight: 600 }}>{o.customerName}</td>
              <td style={{ color: 'var(--text-admin-muted)' }}>{o.customerEmail}</td>
              <td style={prodCell}>
                <span title={productsSummary}>{productsSummary}</span>
              </td>
              <td style={{ fontWeight: 600 }}>₹{(o.total / 100).toFixed(2)}</td>
              <td style={{ fontSize: '0.75rem', fontWeight: 600 }}>{o.paymentMethod}</td>
              <td>
                <StatusBadge type="payment" value={o.paymentStatus} />
              </td>
              <td>
                <StatusBadge type="order" value={o.status} />
              </td>
              <td style={{ fontSize: '0.75rem', color: 'var(--text-admin-muted)' }}>
                {new Date(o.createdAt).toLocaleDateString()}
              </td>
              <td>
                <div style={actionsRow}>
                  <Link to={`/admin/orders/${o.id}`} style={actionBtn} title="View Details">
                    <Eye size={14} />
                  </Link>
                  <button onClick={() => onDeleteOrder(o.id)} style={deleteBtn} title="Delete Order">
                    <Trash2 size={14} />
                  </button>
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

OrdersTable.propTypes = {
  orders: PropTypes.array.isRequired,
  selectedIds: PropTypes.array.isRequired,
  onSelectRow: PropTypes.func.isRequired,
  onSelectAll: PropTypes.func.isRequired,
  onDeleteOrder: PropTypes.func.isRequired
};

const checkboxStyle = {
  cursor: 'pointer',
  accentColor: 'var(--accent-admin-amber)'
};

const selectedRowStyle = {
  background: 'rgba(253, 224, 193, 0.02)'
};

const idLinkStyle = {
  color: 'var(--accent-admin-amber)',
  fontWeight: 'bold',
  textDecoration: 'none',
  fontFamily: 'monospace'
};

const prodCell = {
  maxWidth: '180px',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  fontSize: '0.75rem',
  color: 'var(--text-admin-muted)'
};

const actionsRow = {
  display: 'flex',
  justifyContent: 'flex-end',
  gap: '0.4rem',
  paddingRight: '0.5rem'
};

const actionBtn = {
  background: 'rgba(253, 224, 193, 0.02)',
  border: '1px solid var(--border-admin)',
  color: 'var(--text-admin-bright)',
  padding: '0.25rem 0.4rem',
  borderRadius: '6px',
  display: 'flex',
  alignItems: 'center',
  cursor: 'pointer',
  textDecoration: 'none'
};

const deleteBtn = {
  background: 'none',
  border: '1px solid rgba(211, 47, 47, 0.2)',
  color: '#d32f2f',
  padding: '0.25rem 0.4rem',
  borderRadius: '6px',
  display: 'flex',
  alignItems: 'center',
  cursor: 'pointer'
};
