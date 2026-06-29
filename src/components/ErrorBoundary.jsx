import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log error to console or any external monitoring service (like Sentry placeholder)
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    if (window.Sentry) {
      window.Sentry.captureException(error);
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div style={errorContainer}>
          <div style={errorCard}>
            <span style={{ fontSize: '3rem' }}>☕💥</span>
            <h1 style={title}>Something went wrong</h1>
            <p style={desc}>Our team has been notified. Let's try reloading the page or heading back home.</p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button onClick={() => window.location.reload()} style={reloadBtn}>Reload Page</button>
              <a href="/" style={homeBtn}>Back Home</a>
            </div>
            {process.env.NODE_ENV !== 'production' && (
              <pre style={stackTrace}>{this.state.error?.toString()}</pre>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Styles
const errorContainer = {
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: '#120404',
  color: '#FDE0C1',
  padding: '2rem',
  boxSizing: 'border-box',
  fontFamily: 'sans-serif',
};

const errorCard = {
  background: '#1c0a0a',
  border: '1px solid #3c1e1e',
  borderRadius: '16px',
  padding: '3rem 2rem',
  maxWidth: '480px',
  width: '100%',
  textAlign: 'center',
  boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
};

const title = {
  fontSize: '1.5rem',
  fontWeight: 'bold',
  color: '#FDE0C1',
  margin: '1.5rem 0 0.5rem 0',
};

const desc = {
  fontSize: '0.9375rem',
  color: '#d0c0b0',
  lineHeight: 1.6,
  margin: '0 0 2rem 0',
};

const reloadBtn = {
  background: '#C27A0A',
  color: '#FFF',
  border: 'none',
  padding: '0.6rem 1.2rem',
  borderRadius: '6px',
  fontWeight: 'bold',
  cursor: 'pointer',
  fontSize: '0.875rem',
};

const homeBtn = {
  background: 'none',
  border: '1px solid #3c1e1e',
  color: '#FDE0C1',
  padding: '0.6rem 1.2rem',
  borderRadius: '6px',
  fontWeight: 'bold',
  textDecoration: 'none',
  fontSize: '0.875rem',
  display: 'flex',
  alignItems: 'center',
};

const stackTrace = {
  marginTop: '2rem',
  padding: '1rem',
  background: '#080202',
  border: '1px solid #220b0b',
  borderRadius: '8px',
  color: '#ef4444',
  fontSize: '0.75rem',
  textAlign: 'left',
  overflowX: 'auto',
};
