import { Helmet } from 'react-helmet-async';
import PageWrapper from '../../components/PageWrapper';

export default function NotFoundPage() {
  return (
    <>
      <Helmet>
        <title>404 - Page Not Found | Spill The Beans</title>
        <meta name="description" content="This page has gone cold. Explore our selection of premium coffee instead." />
      </Helmet>
      <PageWrapper style={container}>
        <div style={card}>
          <span style={{ fontSize: '4rem' }}>☕📭</span>
          <h1 style={title}>404 — Page Not Found</h1>
          <p style={desc}>
            This page has gone completely cold. Let's get you back to fresh, hot, premium coffee.
          </p>
          <a href="/" style={btn} id="404-home-btn">
            Back to Spill The Beans
          </a>
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

const btn = {
  display: 'inline-block',
  background: '#C27A0A',
  color: '#FFF',
  padding: '0.75rem 1.75rem',
  borderRadius: '6px',
  fontWeight: 'bold',
  textDecoration: 'none',
  fontSize: '0.9375rem',
  transition: 'background 0.2s',
};
