import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowRight, Gift, MessageSquare, Truck } from 'lucide-react';
import { getProductsByCategory, CATEGORIES } from '../data/products';
import ProductCard from '../components/ProductCard';
import NewsletterSection from '../components/NewsletterSection';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import PageWrapper from '../components/PageWrapper';
import './CategoryPage.css';

export default function GiftPacks() {
  const gifts = getProductsByCategory(CATEGORIES.GIFT);
  const ref = useScrollAnimation();

  return (
    <>
      <Helmet>
        <title>Gift Packs | Spill The Beans</title>
        <meta name="description" content="Share the love of coffee. Gift Spill The Beans' curated premium coffee gift packs and boxes with personalized messages." />
      </Helmet>
      <PageWrapper className="category-page" ref={ref}>
      {/* Hero */}
      <section className="category-hero">
        <div className="category-hero__glow" />
        <div className="container category-hero__content">
          <div className="fade-in-up">
            <span className="section-label">For Those You Love</span>
            <h1 className="heading-display">Gift Packs</h1>
            <p className="text-body category-hero__desc">
              The most thoughtful gift for coffee lovers. Luxury packaging, premium coffees, 
              and the warmth of Spill The Beans — delivered to their door.
            </p>
            <div className="category-hero__meta">
              <div className="category-hero__badge">
                <Gift size={14} /> Complimentary gift message
              </div>
              <div className="category-hero__badge">
                ✍️ Personalised ribbon available
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Gift Experience Steps */}
      <section className="section-sm">
        <div className="container">
          <div className="section-header fade-in-up">
            <span className="section-label">The Spill The Beans Gift Experience</span>
            <h2 className="heading-2">What Makes It Special</h2>
            <div className="section-divider" />
          </div>
          <div className="gift-steps fade-in-up">
            {[
              { step: '01', title: 'Choose Your Pack', desc: 'Select from our curated gift collections' },
              { step: '02', title: 'Add a Message', desc: 'Personalise with a heartfelt note at checkout' },
              { step: '03', title: 'We Gift-Wrap', desc: 'Premium matte black box with gold ribbon' },
              { step: '04', title: 'Express Delivery', desc: 'Delivered within 2-3 business days' },
            ].map((s, i) => (
              <div key={i} className="gift-step">
                <span className="gift-step__num">{s.step}</span>
                <h3 style={{ fontWeight: 600, color: 'var(--text-cream)', fontSize: '0.9375rem' }}>{s.title}</h3>
                <p className="text-xs text-muted">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gift Products */}
      <section className="section-sm">
        <div className="container">
          <div className="section-header fade-in-up">
            <span className="section-label">Gift Collections</span>
            <h2 className="heading-1">Find the Perfect Gift</h2>
            <div className="section-divider" />
          </div>
          <div className="products-grid">
            {gifts.map(product => (
              <div key={product.id} className="fade-in-up">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Custom Gift CTA */}
      <section className="bundle-cta-strip fade-in-up">
        <div className="container bundle-cta-strip__content">
          <div>
            <h2 className="heading-2">Corporate Gifting?</h2>
            <p className="text-body">Custom orders for 20+ recipients. Branded packaging available.</p>
          </div>
          <a
            href="mailto:hello@spillthebeans.in?subject=Corporate Gifting"
            id="gifts-corporate-btn"
            className="btn btn-primary btn-lg"
          >
            <MessageSquare size={16} /> Enquire Now
          </a>
        </div>
      </section>

      <NewsletterSection />
    </PageWrapper>
  </>
);
}
