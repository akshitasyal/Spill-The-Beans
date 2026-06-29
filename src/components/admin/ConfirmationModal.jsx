import { AlertTriangle, X } from 'lucide-react';

export default function ConfirmationModal({ isOpen, title, message, onConfirm, onCancel, confirmText = 'Confirm', type = 'danger' }) {
  if (!isOpen) return null;

  const isDanger = type === 'danger';

  return (
    <div style={backdrop}>
      <div style={modalBox}>
        {/* Header */}
        <div style={header}>
          <div style={titleArea}>
            <AlertTriangle size={18} color={isDanger ? '#d32f2f' : 'var(--accent-admin-amber)'} />
            <h3 style={titleStyle}>{title}</h3>
          </div>
          <button onClick={onCancel} style={closeBtn}>
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div style={body}>
          <p style={messageText}>{message}</p>
        </div>

        {/* Footer Actions */}
        <div style={footer}>
          <button onClick={onCancel} style={cancelBtn}>
            Cancel
          </button>
          <button
            onClick={onConfirm}
            style={{
              ...confirmBtn,
              background: isDanger ? '#d32f2f' : 'var(--accent-admin-amber)'
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

const backdrop = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(0, 0, 0, 0.75)',
  backdropFilter: 'blur(4px)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
  padding: '1rem'
};

const modalBox = {
  width: '100%',
  maxWidth: '440px',
  background: '#1a0a0a',
  border: '1px solid var(--border-admin)',
  borderRadius: '12px',
  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column'
};

const header = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '1rem 1.25rem',
  borderBottom: '1px solid var(--border-admin)'
};

const titleArea = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem'
};

const titleStyle = {
  fontSize: '1rem',
  fontWeight: 600,
  margin: 0,
  color: 'var(--text-admin-bright)'
};

const closeBtn = {
  background: 'none',
  border: 'none',
  color: 'var(--text-admin-muted)',
  cursor: 'pointer',
  padding: '0.25rem',
  borderRadius: '4px'
};

const body = {
  padding: '1.25rem',
  fontSize: '0.875rem',
  lineHeight: 1.5,
  color: 'var(--text-admin-muted)'
};

const messageText = {
  margin: 0
};

const footer = {
  display: 'flex',
  justifyContent: 'flex-end',
  gap: '0.75rem',
  padding: '1rem 1.25rem',
  background: 'rgba(253,224,193,0.01)',
  borderTop: '1px solid var(--border-admin)'
};

const cancelBtn = {
  background: 'none',
  border: '1px solid var(--border-admin)',
  color: 'var(--text-admin-muted)',
  padding: '0.45rem 1rem',
  borderRadius: '6px',
  fontSize: '0.8125rem',
  fontWeight: 600,
  cursor: 'pointer'
};

const confirmBtn = {
  border: 'none',
  color: '#FFFFFF',
  padding: '0.45rem 1rem',
  borderRadius: '6px',
  fontSize: '0.8125rem',
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'background 0.2s ease'
};
