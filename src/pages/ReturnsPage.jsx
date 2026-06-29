import { Helmet } from 'react-helmet-async';
import PageWrapper from '../components/PageWrapper';
import { RotateCcw, AlertTriangle, Coffee, ShieldCheck, Mail } from 'lucide-react';

export default function ReturnsPage() {
  return (
    <>
      <Helmet>
        <title>Returns & Refunds Policy | Spill The Beans</title>
        <meta name="description" content="Read our simple guidelines for returns, replacements, and refunds on coffee items and accessories." />
      </Helmet>

      <PageWrapper style={container}>
        <div className="container" style={{ maxWidth: '720px' }}>
          <div style={header}>
            <RotateCcw size={36} color="var(--accent-amber)" />
            <h1 style={title}>Returns & Refunds</h1>
            <p style={subtitle}>Fresh coffee and premium gear, backed by our quality promise.</p>
          </div>

          <div style={section}>
            <h2 style={sectionTitle}><Coffee size={18} style={icon} /> Coffee Jars & Beans Policy</h2>
            <p style={text}>
              Because coffee is a fresh food item, **we do not accept returns or exchanges on instant coffee jars, combos, or single-origin beans** once shipped.
            </p>
            <div style={alertCard}>
              <AlertTriangle size={18} color="#C27A0A" style={{ marginTop: '0.1rem', flexShrink: 0 }} />
              <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-cream-dim)', lineHeight: 1.5 }}>
                <strong>Damaged or Wrong Items:</strong> If your order arrived broken, leaking, or you received the wrong roast/flavour, send a photo of the box within 48 hours to <a href="mailto:hello@spillthebeans.in" style={{ color: 'var(--accent-amber)', textDecoration: 'underline' }}>hello@spillthebeans.in</a>. We will ship a free replacement immediately.
              </p>
            </div>
          </div>

          <div style={section}>
            <h2 style={sectionTitle}><ShieldCheck size={18} style={icon} /> Coffee Gear & Accessories</h2>
            <p style={text}>
              We offer a **7-day return/replacement policy** for our physical hardware products, including:
            </p>
            <ul style={list}>
              <li>Handheld Milk Frother (The Whip)</li>
              <li>Spill The Beans Branded Tumblers (700ml)</li>
            </ul>
            <p style={text}>
              To qualify, items must be unused, in their original cardboard packaging, and include all manual inserts. Return shipping costs are covered by the customer unless the device arrived defective.
            </p>
          </div>

          <div style={section}>
            <h2 style={sectionTitle}><RotateCcw size={18} style={icon} /> Refund Timelines</h2>
            <p style={text}>
              Once a returned accessory is checked in at our warehouse, your refund will be processed:
            </p>
            <ul style={list}>
              <li><strong>Prepaid Orders (Card/UPI):</strong> Refunded directly to your bank account within 3–5 business days.</li>
              <li><strong>Cash on Delivery (COD):</strong> Refunded via a custom Spill The Beans store coupon code or bank transfer link.</li>
            </ul>
          </div>

          <div style={contactCard}>
            <Mail size={22} color="var(--accent-admin-amber)" />
            <h3 style={{ margin: '0 0 0.25rem 0', color: 'var(--text-cream)' }}>Questions?</h3>
            <p style={{ margin: '0 0 1rem 0', fontSize: '0.875rem', color: 'var(--text-muted)' }}>We are here to resolve any issues. Write to our customer support desk.</p>
            <a href="mailto:hello@spillthebeans.in" style={contactBtn}>Email Support</a>
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

const alertCard = {
  display: 'flex',
  gap: '0.75rem',
  background: 'var(--accent-amber-glow)',
  border: '1px dashed var(--border-amber)',
  borderRadius: '10px',
  padding: '1rem 1.25rem',
  marginTop: '1rem',
};

const contactCard = {
  background: 'var(--surface-card)',
  border: '1px solid var(--border-amber)',
  borderRadius: '12px',
  padding: '2rem',
  textAlign: 'center',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  marginTop: '3rem',
  boxShadow: 'var(--shadow-card)',
};

const contactBtn = {
  background: 'var(--accent-amber)',
  color: '#FFF',
  textDecoration: 'none',
  padding: '0.6rem 1.5rem',
  borderRadius: '6px',
  fontWeight: 'bold',
  fontSize: '0.875rem',
};
