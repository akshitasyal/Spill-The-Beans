import { Helmet } from 'react-helmet-async';
import PageWrapper from '../../components/PageWrapper';

export default function UnauthorizedPage() {
  return (
    <>
      <Helmet>
        <title>Unauthorized Access | Spill The Beans</title>
        <meta name="description" content="You do not have access to view this page." />
      </Helmet>
      <PageWrapper style={container}>
        <div style={card}>
          <span style={{ fontSize: '4rem' }}>🔒🚫</span>
          <h1 style={title}>Access Denied</h1>
          <p style={desc}>
            You do not have the administrator permissions required to access the requested route. If this is an error, please log in with your admin credentials.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <a href="/auth" style={loginBtn}>
              Log In
            </a>
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

const loginBtn = {
  background: '#C27A0A',
  color: '#FFF',
  padding: '0.75rem 1.5rem',
  borderRadius: '6px',
  fontWeight: 'bold',
  textDecoration: 'none',
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
