import { Helmet } from 'react-helmet-async';
import PageWrapper from '../components/PageWrapper';
import { Truck, MapPin, ShieldAlert, Award } from 'lucide-react';

export default function ShippingPage() {
  return (
    <>
      <Helmet>
        <title>Shipping & Delivery Policy | Spill The Beans</title>
        <meta name="description" content="View delivery times, shipping costs, and logistics partner information for Spill The Beans coffee." />
      </Helmet>

      <PageWrapper style={container}>
        <div className="container" style={{ maxWidth: '720px' }}>
          <div style={header}>
            <Truck size={36} color="var(--accent-amber)" />
            <h1 style={title}>Shipping & Delivery</h1>
            <p style={subtitle}>Freshly roasted coffee, delivered safely across India.</p>
          </div>

          <div style={section}>
            <h2 style={sectionTitle}><Truck size={18} style={icon} /> Shipping Rates</h2>
            <p style={text}>
              We aim to make getting fresh beans as affordable as possible. Our rules:
            </p>
            <ul style={list}>
              <li><strong>Orders above ₹599:</strong> Free Shipping nationwide.</li>
              <li><strong>Orders under ₹599:</strong> Flat shipping charge of ₹60 is applied at checkout.</li>
              <li><strong>Cash on Delivery (COD):</strong> An additional ₹40 COD collection handling fee applies to all COD orders regardless of total order value.</li>
            </ul>
          </div>

          <div style={section}>
            <h2 style={sectionTitle}><MapPin size={18} style={icon} /> Delivery Times & Service Areas</h2>
            <p style={text}>
              All orders are dispatched from our Bengaluru warehouse within 24 hours of placement. Estimated transit times:
            </p>
            <ul style={list}>
              <li><strong>Tier 1 Metro Cities (Bengaluru, Mumbai, Delhi-NCR, Chennai):</strong> 2–4 business days.</li>
              <li><strong>Tier 2 & Tier 3 Cities (State Capitals & Major Towns):</strong> 3–6 business days.</li>
              <li><strong>North-East & Jammu-Kashmir Regions:</strong> 5–8 business days.</li>
            </ul>
          </div>

          <div style={section}>
            <h2 style={sectionTitle}><Award size={18} style={icon} /> Logistics & Tracking</h2>
            <p style={text}>
              We partner with India's premier courier networks including <strong>Delhivery</strong>, <strong>BlueDart</strong>, and <strong>DTDC</strong> to ensure prompt delivery.
            </p>
            <p style={text}>
              As soon as your package leaves our roastery, a tracking link is sent via SMS and Email. You can also trace your package status at any time on our <a href="/track" style={{ color: 'var(--accent-amber)', textDecoration: 'underline', fontWeight: 'bold' }}>Track Order</a> page.
            </p>
          </div>

          <div style={section}>
            <h2 style={sectionTitle}><ShieldAlert size={18} style={icon} /> Lost or Misrouted Shipments</h2>
            <p style={text}>
              If your package is marked as delivered but you haven't received it, or if it hasn't progressed in transit for more than 5 days, please raise a ticket by emailing <a href="mailto:hello@spillthebeans.in" style={{ color: 'var(--accent-amber)', textDecoration: 'underline' }}>hello@spillthebeans.in</a>. We will coordinate with the courier immediately or arrange a replacement.
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
