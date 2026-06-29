import { Helmet } from 'react-helmet-async';
import PageWrapper from '../../components/PageWrapper';

export default function MaintenancePage() {
  return (
    <>
      <Helmet>
        <title>Maintenance Mode | Spill The Beans</title>
        <meta name="description" content="We are currently brewing some major upgrades. We'll be back shortly!" />
      </Helmet>
      <PageWrapper style={container}>
        <div style={card}>
          <span style={{ fontSize: '4rem' }}>🚧☕</span>
          <h1 style={title}>Brewing Upgrades</h1>
          <p style={desc}>
            Spill The Beans is currently undergoing scheduled maintenance. We are brewing some exciting fresh features and database roasts.
          </p>
          <div style={badge}>We'll be back shortly!</div>
        </div>
      </PageWrapper>
    </>
  );
}

const container = {
  minHeight: '100vh',
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
  padding: '4rem 2.5rem',
  maxWidth: '480px',
  width: '100%',
  textAlign: 'center',
  boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
};

const title = {
  fontFamily: 'var(--font-heading)',
  fontSize: '2.2rem',
  color: 'var(--text-cream)',
  margin: '1.5rem 0 0.75rem 0',
};

const desc = {
  color: 'var(--text-muted)',
  fontSize: '1rem',
  lineHeight: 1.6,
  margin: '0 0 2rem 0',
};

const badge = {
  display: 'inline-block',
  background: 'rgba(194, 122, 10, 0.1)',
  color: '#C27A0A',
  border: '1px solid rgba(194, 122, 10, 0.2)',
  padding: '0.5rem 1.25rem',
  borderRadius: '30px',
  fontWeight: 'bold',
  fontSize: '0.875rem',
};
