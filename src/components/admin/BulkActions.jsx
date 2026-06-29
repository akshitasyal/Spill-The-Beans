import PropTypes from 'prop-types';
import { Package, Truck, CheckCircle2, XCircle, Download, Trash2 } from 'lucide-react';

export default function BulkActions({ selectedCount, onAction }) {
  if (selectedCount === 0) return null;

  return (
    <div style={container}>
      <span style={label}>
        Selected <strong>{selectedCount}</strong> orders
      </span>

      <div style={actionRow}>
        <button onClick={() => onAction('processing')} style={btn} title="Mark selected as Processing">
          <Package size={14} /> Processing
        </button>
        <button onClick={() => onAction('shipped')} style={btn} title="Mark selected as Shipped">
          <Truck size={14} /> Shipped
        </button>
        <button onClick={() => onAction('delivered')} style={btn} title="Mark selected as Delivered">
          <CheckCircle2 size={14} /> Delivered
        </button>
        <button onClick={() => onAction('cancel')} style={cancelBtn} title="Cancel selected orders">
          <XCircle size={14} /> Cancel
        </button>
        <button onClick={() => onAction('export')} style={btn} title="Export selected orders reports">
          <Download size={14} /> Export
        </button>
        <button onClick={() => onAction('delete')} style={deleteBtn} title="Delete selected orders record">
          <Trash2 size={14} /> Delete
        </button>
      </div>
    </div>
  );
}

BulkActions.propTypes = {
  selectedCount: PropTypes.number.isRequired,
  onAction: PropTypes.func.isRequired
};

const container = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  background: 'rgba(194, 122, 10, 0.08)',
  border: '1.5px solid var(--accent-admin-amber)',
  borderRadius: '12px',
  padding: '0.8rem 1.25rem',
  marginBottom: '1.5rem',
  flexWrap: 'wrap',
  gap: '1rem',
  animation: 'slideDown 0.2s ease-out'
};

const label = {
  fontSize: '0.8125rem',
  color: 'var(--text-admin-bright)'
};

const actionRow = {
  display: 'flex',
  gap: '0.5rem',
  flexWrap: 'wrap'
};

const btn = {
  background: 'var(--bg-admin-card)',
  border: '1px solid var(--border-admin)',
  color: 'var(--text-admin-bright)',
  padding: '0.35rem 0.65rem',
  borderRadius: '6px',
  fontSize: '0.75rem',
  fontWeight: 600,
  display: 'flex',
  alignItems: 'center',
  gap: '0.25rem',
  cursor: 'pointer'
};

const cancelBtn = {
  background: 'none',
  border: '1px solid rgba(211, 47, 47, 0.2)',
  color: '#d32f2f',
  padding: '0.35rem 0.65rem',
  borderRadius: '6px',
  fontSize: '0.75rem',
  fontWeight: 600,
  display: 'flex',
  alignItems: 'center',
  gap: '0.25rem',
  cursor: 'pointer'
};

const deleteBtn = {
  background: '#d32f2f',
  border: 'none',
  color: '#FFFFFF',
  padding: '0.35rem 0.65rem',
  borderRadius: '6px',
  fontSize: '0.75rem',
  fontWeight: 600,
  display: 'flex',
  alignItems: 'center',
  gap: '0.25rem',
  cursor: 'pointer'
};
