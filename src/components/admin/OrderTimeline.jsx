import PropTypes from 'prop-types';
import { Check } from 'lucide-react';

export default function OrderTimeline({ timeline }) {
  const steps = [
    { label: 'Order Placed', key: 'placed' },
    { label: 'Payment Confirmed', key: 'confirmed' },
    { label: 'Processing', key: 'processing' },
    { label: 'Packed', key: 'packed' },
    { label: 'Shipped', key: 'shipped' },
    { label: 'Delivered', key: 'delivered' }
  ];

  return (
    <div style={container}>
      <h3 style={title}>Order Status Timeline</h3>
      <div style={timelineWrapper}>
        {steps.map((step, idx) => {
          const completedAt = timeline[step.key];
          const isDone = !!completedAt;
          const isLast = idx === steps.length - 1;

          return (
            <div key={step.key} style={stepItem}>
              {/* Graphic Node column */}
              <div style={graphicColumn}>
                <div style={isDone ? activeCircle : inactiveCircle}>
                  {isDone ? <Check size={12} color="#FFFFFF" /> : <div style={dot} />}
                </div>
                {!isLast && <div style={isDone ? activeLine : inactiveLine} />}
              </div>

              {/* Detail texts column */}
              <div style={textColumn}>
                <div style={isDone ? activeLabel : inactiveLabel}>{step.label}</div>
                {isDone ? (
                  <div style={timestamp}>
                    {new Date(completedAt).toLocaleDateString()} {new Date(completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                ) : (
                  <div style={pendingLabel}>Pending</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

OrderTimeline.propTypes = {
  timeline: PropTypes.shape({
    placed: PropTypes.string,
    confirmed: PropTypes.string,
    processing: PropTypes.string,
    packed: PropTypes.string,
    shipped: PropTypes.string,
    delivered: PropTypes.string
  }).isRequired
};

const container = {
  background: 'var(--bg-admin-card)',
  border: '1px solid var(--border-admin)',
  borderRadius: '12px',
  padding: '1.25rem',
  marginTop: '1.5rem'
};

const title = {
  fontSize: '0.875rem',
  fontWeight: 600,
  margin: '0 0 1rem 0',
  color: 'var(--accent-admin-amber)',
  textTransform: 'uppercase',
  letterSpacing: '0.5px'
};

const timelineWrapper = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.25rem'
};

const stepItem = {
  display: 'flex',
  gap: '1rem',
  alignItems: 'start'
};

const graphicColumn = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  minHeight: '60px'
};

const activeCircle = {
  width: '20px',
  height: '20px',
  borderRadius: '50%',
  background: '#2e7d32',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 2
};

const inactiveCircle = {
  width: '20px',
  height: '20px',
  borderRadius: '50%',
  background: 'rgba(253, 224, 193, 0.02)',
  border: '1.5px solid var(--border-admin)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 2
};

const dot = {
  width: '6px',
  height: '6px',
  borderRadius: '50%',
  background: 'var(--text-admin-muted)'
};

const activeLine = {
  width: '2px',
  flexGrow: 1,
  height: '35px',
  background: '#2e7d32',
  marginTop: '2px',
  marginBottom: '2px'
};

const inactiveLine = {
  width: '2px',
  flexGrow: 1,
  height: '35px',
  background: 'var(--border-admin)',
  marginTop: '2px',
  marginBottom: '2px'
};

const textColumn = {
  paddingTop: '2px'
};

const activeLabel = {
  fontSize: '0.8125rem',
  fontWeight: 600,
  color: 'var(--text-admin-bright)'
};

const inactiveLabel = {
  fontSize: '0.8125rem',
  fontWeight: 500,
  color: 'var(--text-admin-muted)'
};

const timestamp = {
  fontSize: '0.7rem',
  color: 'var(--text-admin-muted)',
  marginTop: '0.15rem'
};

const pendingLabel = {
  fontSize: '0.7rem',
  color: 'var(--text-admin-muted)',
  marginTop: '0.15rem',
  fontStyle: 'italic'
};
