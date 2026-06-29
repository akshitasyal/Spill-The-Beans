import { Helmet } from 'react-helmet-async';
import PageWrapper from '../../components/PageWrapper';

export default function ServerErrorPage() {
  return (
    <>
      <Helmet>
        <title>500 - Server Error | Spill The Beans</title>
        <meta name="description" content="We encountered a problem brewing this page. Please try again later." />
      </Helmet>
      <PageWrapper style={container}>
        <div style={card}>
          <span style={{ fontSize: '4rem' }}>⚡🌧️</span>
          <h1 style={title}>500 — Server Error</h1>
          <p style={desc}>
            We encountered a problem brewing this page. Our team of developers is on it, fixing the leak. Please check back in a few minutes.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button onClick={() => window.location.reload()} style={reloadBtn}>
              Try Again
            </button>
            <a href="/" style={homeBtn}>
              Back Home
            </a>
          </div>
        </div>
      </PageWrapper>
    </>
  );
}

const container = {
  minHeight: '100vh',
  paddingTop: 'var(--header-total)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '4rem 2rem',
  boxSizing: 'border-box',
  background: '#120404',
};

const card = {
  background: '#1c0a0a',
  border: '1px solid #3c1e1e',
  borderRadius: '16px',
  padding: '3.5rem 2.5rem',
  maxWidth: '480px',
  width: '100%',
  textAlign: 'center',
  boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
};

const title = {
  fontFamily: 'var(--font-heading)',
  fontSize: '2rem',
  color: 'var(--text-cream)',
  margin: '1.5rem 0 0.5rem 0',
};

const desc = {
  color: 'var(--text-muted)',
  fontSize: '1rem',
  lineHeight: 1.6,
  margin: '0 0 2rem 0',
};

const reloadBtn = {
  background: '#C27A0A',
  color: '#FFF',
  border: 'none',
  padding: '0.75rem 1.5rem',
  borderRadius: '6px',
  fontWeight: 'bold',
  cursor: 'pointer',
  fontSize: '0.9375rem',
};

const homeBtn = {
  background: 'none',
  border: '1px solid #3c1e1e',
  color: 'var(--text-cream)',
  padding: '0.75rem 1.5rem',
  borderRadius: '6px',
  fontWeight: 'bold',
  textDecoration: 'none',
  fontSize: '0.9375rem',
};
