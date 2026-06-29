import { useState } from 'react';
import { Mail, ArrowRight, CheckCircle } from 'lucide-react';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import './NewsletterSection.css';

export default function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const ref = useScrollAnimation();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.includes('@')) return;
    setStatus('loading');
    setTimeout(() => {
      setStatus('success');
      setEmail('');
    }, 1200);
  };

  return (
    <section className="newsletter-section" ref={ref}>
      <div className="newsletter-section__bg" aria-hidden="true" />
      <div className="container">
        <div className="newsletter-section__content fade-in-up">
          <div className="newsletter-section__icon">
            <Mail size={32} />
          </div>
          <h2 className="heading-2 newsletter-section__title">
            Join the <span className="shimmer-text">Inner Circle</span>
          </h2>
          <p className="text-body newsletter-section__desc">
            Be the first to know about limited edition drops, exclusive offers, and the stories behind every cup. 
            No spam — just extraordinary coffee news.
          </p>

          {status === 'success' ? (
            <div className="newsletter-section__success">
              <CheckCircle size={24} color="#95d5b2" />
              <span>You're in! Welcome to the Spill The Beans family.</span>
            </div>
          ) : (
            <form
              className="newsletter-section__form"
              onSubmit={handleSubmit}
              aria-label="Newsletter signup form"
            >
              <div className="newsletter-section__input-wrap">
                <Mail size={18} className="newsletter-section__input-icon" />
                <input
                  type="email"
                  id="newsletter-email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="newsletter-section__input"
                  required
                  aria-label="Email address for newsletter"
                />
              </div>
              <button
                type="submit"
                id="newsletter-submit"
                className="btn btn-primary"
                disabled={status === 'loading'}
                aria-label="Subscribe to newsletter"
              >
                {status === 'loading' ? 'Subscribing...' : (
                  <>Subscribe <ArrowRight size={16} /></>
                )}
              </button>
            </form>
          )}

          <p className="newsletter-section__privacy text-xs text-muted">
            No spam, unsubscribe any time. We respect your privacy.
          </p>
        </div>
      </div>
    </section>
  );
}
