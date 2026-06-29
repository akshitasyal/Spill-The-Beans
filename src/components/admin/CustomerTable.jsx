import PropTypes from 'prop-types';
import { User, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function CustomerTable({ customers }) {
  return (
    <table className="admin-table">
      <thead>
        <tr>
          <th>Customer</th>
          <th>Contact Info</th>
          <th>Total Orders</th>
          <th>Total Spend</th>
          <th>Last Order Date</th>
          <th>Joined Date</th>
          <th>Account Status</th>
          <th style={{ textAlign: 'right', paddingRight: '1rem' }}>Actions</th>
        </tr>
      </thead>
      <tbody>
        {customers.map((c) => {
          const isSuspended = c.accountStatus === 'SUSPENDED';

          return (
            <tr key={c.id}>
              <td style={{ fontWeight: 600 }}>
                <div style={customerInfoCell}>
                  <div style={avatarStyle}>
                    <User size={14} color="#FFFFFF" />
                  </div>
                  <span>{c.name}</span>
                </div>
              </td>
              <td>
                <div style={{ fontSize: '0.8125rem' }}>{c.email}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-admin-muted)' }}>{c.phone}</div>
              </td>
              <td>{c.orderCount} orders</td>
              <td style={{ fontWeight: 600 }}>₹{(c.totalSpent / 100).toFixed(2)}</td>
              <td style={{ fontSize: '0.75rem', color: 'var(--text-admin-muted)' }}>
                {c.lastOrderDate ? new Date(c.lastOrderDate).toLocaleDateString() : '—'}
              </td>
              <td style={{ fontSize: '0.75rem', color: 'var(--text-admin-muted)' }}>
                {new Date(c.joinedDate).toLocaleDateString()}
              </td>
              <td>
                <span className={`status-badge status-badge--${isSuspended ? 'cancelled' : 'delivered'}`}>
                  {c.accountStatus}
                </span>
              </td>
              <td>
                <div style={actionsRow}>
                  <Link to={`/admin/customers/${c.id}`} style={actionBtn} title="View Details">
                    <Eye size={14} style={{ marginRight: '0.2rem' }} /> Profile
                  </Link>
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

CustomerTable.propTypes = {
  customers: PropTypes.array.isRequired
};

const customerInfoCell = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.6rem'
};

const avatarStyle = {
  width: '28px',
  height: '28px',
  borderRadius: '50%',
  background: 'var(--accent-admin-amber)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: '0 2px 5px rgba(194, 122, 10, 0.15)'
};

const actionsRow = {
  display: 'flex',
  justifyContent: 'flex-end',
  paddingRight: '0.5rem'
};

const actionBtn = {
  background: 'rgba(253, 224, 193, 0.02)',
  border: '1px solid var(--border-admin)',
  color: 'var(--text-admin-bright)',
  padding: '0.25rem 0.5rem',
  borderRadius: '6px',
  fontSize: '0.75rem',
  display: 'flex',
  alignItems: 'center',
  cursor: 'pointer',
  textDecoration: 'none'
};
