import { Helmet } from 'react-helmet-async';
import PageWrapper from '../components/PageWrapper';
import { Eye, ShieldCheck, Database, Info } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <>
      <Helmet>
        <title>Privacy Policy | Spill The Beans</title>
        <meta name="description" content="Learn how Spill The Beans handles, protects, and stores your personal information." />
      </Helmet>

      <PageWrapper style={container}>
        <div className="container" style={{ maxWidth: '720px' }}>
          <div style={header}>
            <ShieldCheck size={36} color="var(--accent-amber)" />
            <h1 style={title}>Privacy Policy</h1>
            <p style={subtitle}>Last updated: June 27, 2026. Your privacy is paramount.</p>
          </div>

          <div style={section}>
            <h2 style={sectionTitle}><Eye size={18} style={icon} /> 1. Information We Collect</h2>
            <p style={text}>
              When you purchase coffee or register an account on Spill The Beans, we collect personal details necessary to verify and ship your order, including:
            </p>
            <ul style={list}>
              <li>Contact details (Full Name, Email Address, Phone Number).</li>
              <li>Delivery Address coordinates.</li>
              <li>Payment details processed securely through our partners (Stripe & Razorpay). We do not store credit card credentials on our servers.</li>
            </ul>
          </div>

          <div style={section}>
            <h2 style={sectionTitle}><Database size={18} style={icon} /> 2. How We Use Your Data</h2>
            <p style={text}>
              Your information is used solely to provide a premium e-commerce experience:
            </p>
            <ul style={list}>
              <li>Fulfilling and tracking shipments.</li>
              <li>Sending order updates and transactional notifications via SMS and email.</li>
              <li>Sharing marketing campaigns (if you explicitly opted in to our newsletter). You can opt out at any time.</li>
              <li>Analyzing website traffic to improve user interface performance.</li>
            </ul>
          </div>

          <div style={section}>
            <h2 style={sectionTitle}><Info size={18} style={icon} /> 3. Cookies and Analytics</h2>
            <p style={text}>
              We use standard session cookies to remember items added to your shopping cart and keep you logged in. We also integrate Google Analytics and Microsoft Clarity placeholders to assess page speed, click rates, and user flow patterns to optimize catalog browsing.
            </p>
          </div>

          <div style={section}>
            <h2 style={sectionTitle}><ShieldCheck size={18} style={icon} /> 4. Data Security & Storage</h2>
            <p style={text}>
              All customer transactions are encrypted over Secure Socket Layer (SSL) protocols. Administrative database tables are locked behind role-based authentication rules. You have the right to request access to, modification of, or total deletion of your personal data by contacting us.
            </p>
          </div>
        </div>
      </PageWrapper>
    </>
  );
}

const container = {
  minHeight: '85vh',
  paddingTop: 'var(--header-total)',
  paddingBottom: '5rem',
  background: 'var(--bg-espresso)',
  color: 'var(--text-cream)',
  display: 'flex',
  justifyContent: 'center',
};

const header = {
  textAlign: 'center',
  marginBottom: '3rem',
};

const title = {
  fontFamily: 'var(--font-heading), serif',
  fontSize: '2.5rem',
  margin: '0.75rem 0 0.5rem 0',
  color: 'var(--text-cream)',
};

const subtitle = {
  fontSize: '1rem',
  color: 'var(--text-muted)',
  margin: 0,
};

const section = {
  marginBottom: '2.5rem',
  borderBottom: '1px solid var(--border-subtle)',
  paddingBottom: '2rem',
};

const sectionTitle = {
  fontSize: '1.25rem',
  fontFamily: 'var(--font-heading), serif',
  color: 'var(--text-cream)',
  margin: '0 0 1rem 0',
  display: 'flex',
  alignItems: 'center',
};

const icon = {
  marginRight: '0.5rem',
  color: 'var(--accent-amber)',
};

const text = {
  fontSize: '0.9375rem',
  lineHeight: 1.6,
  color: 'var(--text-cream-dim)',
  margin: '0 0 1rem 0',
};

const list = {
  paddingLeft: '1.25rem',
  margin: '0 0 1.25rem 0',
  fontSize: '0.9375rem',
  color: 'var(--text-cream-dim)',
  lineHeight: 1.7,
};
