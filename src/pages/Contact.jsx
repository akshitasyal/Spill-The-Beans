import { useState, useRef, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle, MessageSquare, Coffee } from 'lucide-react';

const InstagramIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
  </svg>
);
import PageWrapper from '../components/PageWrapper';
import NewsletterSection from '../components/NewsletterSection';
import './Contact.css';

const CONTACT_CHANNELS = [
  {
    icon: Mail,
    title: 'Email Us',
    value: 'hello@spillthebeans.in',
    sub: 'We reply within 24 hours',
    href: 'mailto:hello@spillthebeans.in',
    color: '#C27A0A',
    bg: 'rgba(194,122,10,0.08)',
  },
  {
    icon: Phone,
    title: 'Call Us',
    value: '+91 80000 00000',
    sub: 'Mon–Sat, 10am–6pm IST',
    href: 'tel:+918000000000',
    color: '#276044',
    bg: '#e8f5ee',
  },
  {
    icon: InstagramIcon,
    title: 'DM on Instagram',
    value: '@spillthebeanscoffee',
    sub: 'Usually responds in hours',
    href: 'https://instagram.com/spillthebeanscoffee',
    color: '#b52a2a',
    bg: '#fdecea',
  },
  {
    icon: MapPin,
    title: 'Visit Us',
    value: 'Bengaluru, Karnataka',
    sub: 'India — 560001',
    href: null,
    color: '#1a2a6c',
    bg: 'rgba(26,42,108,0.08)',
  },
];

const TOPICS = [
  'Order Inquiry',
  'Shipping & Delivery',
  'Returns & Refunds',
  'Product Question',
  'Wholesale / B2B',
  'Press & Media',
  'Other',
];

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', topic: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [errors, setErrors] = useState({});

  const cardsRef = useRef(null);
  const formRef = useRef(null);
  const [heroVisible, setHeroVisible] = useState(false);
  const [cardsVisible, setCardsVisible] = useState(false);
  const [formVisible, setFormVisible] = useState(false);

  useEffect(() => {
    const observe = (ref, setter, threshold = 0.05) => {
      if (!ref.current) return;
      const obs = new IntersectionObserver(
        ([e]) => { if (e.isIntersecting) { setter(true); obs.disconnect(); } },
        { threshold, rootMargin: '0px 0px 50px 0px' }
      );
      obs.observe(ref.current);
      // Also check if already in viewport
      const rect = ref.current.getBoundingClientRect();
      if (rect.top < window.innerHeight) { setter(true); obs.disconnect(); return; }
      return obs;
    };
    const t = setTimeout(() => setHeroVisible(true), 80);
    const o1 = observe(cardsRef, setCardsVisible);
    const o2 = observe(formRef, setFormVisible);
    return () => { clearTimeout(t); o1?.disconnect(); o2?.disconnect(); };
  }, []);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Please enter your name.';
    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) e.email = 'Enter a valid email address.';
    if (!form.topic) e.topic = 'Please choose a topic.';
    if (form.message.trim().length < 10) e.message = 'Message must be at least 10 characters.';
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setSubmitted(true);
    }, 1400);
  };

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  return (
    <PageWrapper className="contact-page">
      <Helmet>
        <title>Contact Us | Spill The Beans</title>
        <meta name="description" content="Get in touch with the Spill The Beans team. We're here to help with orders, questions, or just a good coffee chat." />
      </Helmet>

      {/* ── HERO ────────────────────────────────────────────────── */}
      <section className="contact-hero">
        <div className="contact-hero__bg" />
        <div className={`container contact-hero__content ${heroVisible ? 'ct-anim-in' : ''}`}>
          <div className="contact-hero__eyebrow">
            <MessageSquare size={14} />
            Get in Touch
          </div>
          <h1 className="contact-hero__title">
            We'd Love to<br />Hear From You
          </h1>
          <p className="contact-hero__subtitle">
            Whether it's about your order, a product question, or you just want to talk
            coffee — our team is always happy to help.
          </p>
        </div>
        <div className="contact-hero__wave" aria-hidden="true" />
      </section>

      {/* ── CONTACT CHANNELS ────────────────────────────────────── */}
      <section className="contact-channels section" ref={cardsRef}>
        <div className="container">
          <div className="contact-channels__grid">
            {CONTACT_CHANNELS.map((ch, i) => (
              <div
                key={i}
                className={`contact-channel-card ${cardsVisible ? 'ct-anim-in' : ''}`}
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                <div
                  className="contact-channel-card__icon"
                  style={{ background: ch.bg, color: ch.color }}
                >
                  <ch.icon size={20} strokeWidth={2} />
                </div>
                <div className="contact-channel-card__body">
                  <p className="contact-channel-card__title">{ch.title}</p>
                  {ch.href ? (
                    <a
                      href={ch.href}
                      target={ch.href.startsWith('http') ? '_blank' : undefined}
                      rel="noopener noreferrer"
                      className="contact-channel-card__value"
                    >
                      {ch.value}
                    </a>
                  ) : (
                    <p className="contact-channel-card__value contact-channel-card__value--text">{ch.value}</p>
                  )}
                  <p className="contact-channel-card__sub">{ch.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FORM + HOURS ─────────────────────────────────────────── */}
      <section className="contact-form-section section" ref={formRef}>
        <div className="container contact-form-section__inner">

          {/* Left: Form */}
          <div className={`contact-form-wrap ${formVisible ? 'ct-anim-in' : ''}`}>
            <div className="contact-form-wrap__header">
              <span className="section-label">Send a Message</span>
              <h2 className="heading-2">Drop Us a Line</h2>
              <p className="text-body" style={{ marginTop: '0.5rem' }}>
                Fill in the form and we'll get back to you within one business day.
              </p>
            </div>

            {submitted ? (
              <div className="contact-success">
                <div className="contact-success__icon">
                  <CheckCircle size={32} />
                </div>
                <h3 className="contact-success__title">Message Sent! ☕</h3>
                <p className="text-sm contact-success__body">
                  Thank you, <strong>{form.name}</strong>. We've received your message and will
                  reply to <strong>{form.email}</strong> within 24 hours.
                </p>
                <button
                  className="btn btn-primary"
                  onClick={() => { setSubmitted(false); setForm({ name: '', email: '', topic: '', message: '' }); }}
                >
                  Send Another
                </button>
              </div>
            ) : (
              <form className="contact-form" onSubmit={handleSubmit} noValidate>
                <div className="contact-form__row">
                  <div className={`contact-form__field ${errors.name ? 'contact-form__field--error' : ''}`}>
                    <label htmlFor="contact-name" className="contact-form__label">Your Name</label>
                    <input
                      id="contact-name"
                      type="text"
                      className="input contact-form__input"
                      placeholder="Rahul Sharma"
                      value={form.name}
                      onChange={e => handleChange('name', e.target.value)}
                      autoComplete="name"
                    />
                    {errors.name && <p className="contact-form__error">{errors.name}</p>}
                  </div>
                  <div className={`contact-form__field ${errors.email ? 'contact-form__field--error' : ''}`}>
                    <label htmlFor="contact-email" className="contact-form__label">Email Address</label>
                    <input
                      id="contact-email"
                      type="email"
                      className="input contact-form__input"
                      placeholder="rahul@email.com"
                      value={form.email}
                      onChange={e => handleChange('email', e.target.value)}
                      autoComplete="email"
                    />
                    {errors.email && <p className="contact-form__error">{errors.email}</p>}
                  </div>
                </div>

                <div className={`contact-form__field ${errors.topic ? 'contact-form__field--error' : ''}`}>
                  <label htmlFor="contact-topic" className="contact-form__label">Topic</label>
                  <select
                    id="contact-topic"
                    className="input contact-form__select"
                    value={form.topic}
                    onChange={e => handleChange('topic', e.target.value)}
                  >
                    <option value="">Select a topic…</option>
                    {TOPICS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  {errors.topic && <p className="contact-form__error">{errors.topic}</p>}
                </div>

                <div className={`contact-form__field ${errors.message ? 'contact-form__field--error' : ''}`}>
                  <label htmlFor="contact-message" className="contact-form__label">Your Message</label>
                  <textarea
                    id="contact-message"
                    className="input contact-form__textarea"
                    placeholder="Tell us how we can help…"
                    rows={5}
                    value={form.message}
                    onChange={e => handleChange('message', e.target.value)}
                  />
                  {errors.message && <p className="contact-form__error">{errors.message}</p>}
                </div>

                <button
                  id="contact-submit-btn"
                  type="submit"
                  className={`btn btn-primary btn-lg contact-form__submit ${sending ? 'contact-form__submit--sending' : ''}`}
                  disabled={sending}
                >
                  {sending ? (
                    <>
                      <span className="contact-form__spinner" />
                      Sending…
                    </>
                  ) : (
                    <>
                      Send Message <Send size={16} />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Right: Info sidebar */}
          <div className={`contact-sidebar ${formVisible ? 'ct-anim-in' : ''}`} style={{ animationDelay: '0.15s' }}>
            <div className="contact-sidebar__card">
              <div className="contact-sidebar__icon-wrap">
                <Clock size={20} />
              </div>
              <h3 className="contact-sidebar__title">Support Hours</h3>
              <div className="contact-sidebar__hours">
                <div className="contact-sidebar__hour-row">
                  <span>Monday – Friday</span>
                  <strong>10am – 6pm IST</strong>
                </div>
                <div className="contact-sidebar__hour-row">
                  <span>Saturday</span>
                  <strong>10am – 2pm IST</strong>
                </div>
                <div className="contact-sidebar__hour-row">
                  <span>Sunday</span>
                  <strong>Closed</strong>
                </div>
              </div>
            </div>

            <div className="contact-sidebar__card contact-sidebar__card--coffee">
              <Coffee size={28} className="contact-sidebar__coffee-icon" />
              <h3 className="contact-sidebar__title">Quick Answers</h3>
              <ul className="contact-sidebar__faq">
                {[
                  ['Where is my order?', 'Check your email for tracking info, or reach out with your order ID.'],
                  ['Can I return a product?', 'Yes! We accept returns within 7 days of delivery for sealed products.'],
                  ['Do you ship internationally?', 'Currently we ship within India. International shipping coming soon.'],
                ].map(([q, a], i) => (
                  <li key={i} className="contact-sidebar__faq-item">
                    <p className="contact-sidebar__faq-q">{q}</p>
                    <p className="contact-sidebar__faq-a">{a}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <NewsletterSection />
    </PageWrapper>
  );
}
