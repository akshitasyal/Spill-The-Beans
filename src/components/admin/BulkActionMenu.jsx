import { Trash2, ShieldCheck, ShieldAlert, Star, StarOff } from 'lucide-react';

export default function BulkActionMenu({ selectedCount, onAction }) {
  if (selectedCount === 0) return null;

  return (
    <div style={floatingBar}>
      <div style={countBadge}>
        <span>{selectedCount} item{selectedCount > 1 ? 's' : ''} selected</span>
      </div>

      <div style={actionsGroup}>
        <button
          onClick={() => onAction('activate')}
          style={actionBtn}
          title="Activate selected items"
        >
          <ShieldCheck size={16} color="#2e7d32" />
          <span style={btnText}>Activate</span>
        </button>

        <button
          onClick={() => onAction('deactivate')}
          style={actionBtn}
          title="Deactivate selected items"
        >
          <ShieldAlert size={16} color="var(--accent-admin-amber)" />
          <span style={btnText}>Deactivate</span>
        </button>

        <button
          onClick={() => onAction('feature')}
          style={actionBtn}
          title="Feature selected items"
        >
          <Star size={16} color="#e5a93b" fill="#e5a93b" />
          <span style={btnText}>Feature</span>
        </button>

        <button
          onClick={() => onAction('unfeature')}
          style={actionBtn}
          title="Remove feature status"
        >
          <StarOff size={16} color="var(--text-admin-muted)" />
          <span style={btnText}>Unfeature</span>
        </button>

        <div style={divider}></div>

        <button
          onClick={() => onAction('delete')}
          style={{ ...actionBtn, background: 'rgba(211,47,47,0.1)', borderColor: 'rgba(211,47,47,0.3)' }}
          title="Delete selected items"
        >
          <Trash2 size={16} color="#d32f2f" />
          <span style={{ ...btnText, color: '#d32f2f' }}>Delete</span>
        </button>
      </div>
    </div>
  );
}

const floatingBar = {
  position: 'fixed',
  bottom: '2rem',
  left: '50%',
  transform: 'translateX(-50%)',
  background: 'rgba(26, 10, 10, 0.95)',
  border: '1px solid var(--accent-admin-amber)',
  borderRadius: '9999px',
  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
  display: 'flex',
  alignItems: 'center',
  padding: '0.5rem 1.5rem',
  gap: '1.5rem',
  zIndex: 999,
  animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
};

const countBadge = {
  fontSize: '0.875rem',
  fontWeight: 600,
  color: 'var(--text-admin-bright)',
  borderRight: '1px solid var(--border-admin)',
  paddingRight: '1.5rem'
};

const actionsGroup = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem'
};

const actionBtn = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.4rem',
  background: 'rgba(253,224,193,0.03)',
  border: '1px solid var(--border-admin)',
  borderRadius: '9999px',
  padding: '0.4rem 0.875rem',
  cursor: 'pointer',
  transition: 'all 0.2s ease'
};

const btnText = {
  fontSize: '0.75rem',
  fontWeight: 600,
  color: 'var(--text-admin-bright)'
};

const divider = {
  width: '1px',
  height: '20px',
  background: 'var(--border-admin)'
};
