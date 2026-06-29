import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowRight, Leaf, Award, Heart, MapPin, Coffee, Users, Star, CheckCircle } from 'lucide-react';
import { aboutHero } from '../data/products';
import NewsletterSection from '../components/NewsletterSection';
import PageWrapper from '../components/PageWrapper';
import './About.css';

// ── Data ────────────────────────────────────────────────────────────────────

const STATS = [
  { num: '2019', label: 'Founded' },
  { num: '14+', label: 'Farm Partners' },
  { num: '5', label: 'Origins' },
  { num: '50K+', label: 'Happy Customers' },
  { num: '92+', label: 'Avg. Cupping Score' },
  { num: '100%', label: 'Direct Trade' },
];

const TIMELINE = [
  {
    year: '2018',
    title: 'The Terrible Cup',
    body: 'A trained Q-grader sits in a supposedly premium Bengaluru café and is served mediocre coffee at a luxury price. The frustration sparks an idea.',
  },
  {
    year: '2019',
    title: 'Six Months in the Estates',
    body: 'Rahul and Priya spend half a year in Coorg, Araku, and Anamalai — visiting farms, building relationships, and cupping hundreds of lots.',
  },
  {
    year: '2019',
    title: 'Launch Day',
    body: 'Spill The Beans launches with just four products. They sell out in 48 hours. The coffee-loving internet notices.',
  },
  {
    year: '2022',
    title: 'Going National',
    body: 'Partnerships with 14+ farms across 5 growing regions. A cult following of 20,000 customers and counting.',
  },
  {
    year: 'Today',
    title: 'India\'s Most-Loved Specialty D2C',
    body: 'Over 50,000 happy customers. Still sourcing direct. Still compromising on nothing. Still obsessed with your next perfect cup.',
  },
];

const VALUES = [
  {
    num: '01',
    icon: Leaf,
    title: 'Sustainable Sourcing',
    desc: 'We work directly with farms that prioritise shade-growing, biodiversity, and fair wages for pickers. Every purchase supports regenerative agriculture.',
    color: '#276044',
    bg: '#e8f5ee',
  },
  {
    num: '02',
    icon: Award,
    title: 'Specialty Grade Only',
    desc: 'We accept nothing below 80 on the SCA cupping scale. If a lot doesn\'t meet our standards, we don\'t sell it — simple.',
    color: '#C27A0A',
    bg: 'rgba(194,122,10,0.1)',
  },
  {
    num: '03',
    icon: Heart,
    title: 'Community First',
    desc: '5% of every sale goes back to the farming communities that grow our coffee. We\'re invested in their future, not just their output.',
    color: '#b52a2a',
    bg: '#fdecea',
  },
  {
    num: '04',
    icon: MapPin,
    title: 'Radical Transparency',
    desc: 'Every product page tells you the exact origin, altitude, process, and cupping notes. No vague "blends". Just honest, traceable coffee.',
    color: '#1a2a6c',
    bg: 'rgba(26,42,108,0.08)',
  },
];

const ORIGINS = [
  { name: 'Coorg', subtitle: 'Karnataka', desc: 'Estate-grown Arabica with earthy, spiced notes. Grown in the misty hills at 1,000–1,500m.' },
  { name: 'Araku Valley', subtitle: 'Andhra Pradesh', desc: 'Tribal-grown specialty with complex floral and chocolate notes. One of India\'s finest micro-regions.' },
  { name: 'Nilgiri Hills', subtitle: 'Tamil Nadu', desc: 'High-altitude estates producing bright, wine-like coffees with exceptional fruity complexity.' },
  { name: 'Anamalai Hills', subtitle: 'Tamil Nadu', desc: 'Honey-processed lots with gentle sweetness and smooth, full-bodied character.' },
  { name: 'Chikmagalur', subtitle: 'Karnataka', desc: 'The birthplace of Indian coffee. Shade-grown estates with centuries of tradition.' },
];

const TEAM = [
  {
    name: 'Rahul Sharma',
    role: 'Co-Founder & Head of Sourcing',
    bio: 'Former Q-grader with 10 years across South Indian coffee estates. Has personally cupped over 5,000 lots.',
    emoji: 'R',
  },
  {
    name: 'Priya Nair',
    role: 'Co-Founder & CEO',
    bio: 'Built two D2C brands before Spill The Beans. Obsessed with customer experience and scaling without compromising soul.',
    emoji: 'P',
  },
  {
    name: 'Arun Menon',
    role: 'Master Roaster',
    bio: 'Trained in Copenhagen, returned to roast India\'s finest coffees. Champion of the light roast revolution.',
    emoji: 'A',
  },
];

// ── Animated counter hook ──────────────────────────────────────────────────
function useCountUp(target, duration = 1400, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    const numericTarget = parseInt(target.replace(/\D/g, ''), 10);
    if (!numericTarget) return;
    let startTime = null;
    const step = (ts) => {
      if (!startTime) startTime = ts;
      const progress = Math.min((ts - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * numericTarget));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [start, target, duration]);
  return count;
}

// ── Stat pill ─────────────────────────────────────────────────────────────
function StatPill({ num, label, animate }) {
  const numeric = parseInt(num.replace(/\D/g, ''), 10);
  const suffix = num.replace(/[\d]/g, '');
  const count = useCountUp(num, 1400, animate);
  const display = numeric ? `${count}${suffix}` : num;
  return (
    <div className="about-stat">
      <span className="about-stat__num">{display}</span>
      <span className="about-stat__label">{label}</span>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────
export default function About() {
  const heroRef = useRef(null);
  const statsRef = useRef(null);
  const timelineRef = useRef(null);
  const valuesRef = useRef(null);
  const originsRef = useRef(null);
  const teamRef = useRef(null);
  const ctaRef = useRef(null);

  const [heroVisible, setHeroVisible] = useState(false);
  const [statsVisible, setStatsVisible] = useState(false);
  const [timelineVisible, setTimelineVisible] = useState(false);
  const [valuesVisible, setValuesVisible] = useState(false);
  const [originsVisible, setOriginsVisible] = useState(false);
  const [teamVisible, setTeamVisible] = useState(false);
  const [ctaVisible, setCtaVisible] = useState(false);

  useEffect(() => {
    const observe = (ref, setter, threshold = 0.15) => {
      if (!ref.current) return;
      const obs = new IntersectionObserver(
        ([e]) => { if (e.isIntersecting) { setter(true); obs.disconnect(); } },
        { threshold }
      );
      obs.observe(ref.current);
      return obs;
    };

    // Slight delay so hero fires after mount
    const t = setTimeout(() => setHeroVisible(true), 100);
    const obs = [
      observe(statsRef, setStatsVisible, 0.2),
      observe(timelineRef, setTimelineVisible, 0.1),
      observe(valuesRef, setValuesVisible, 0.1),
      observe(originsRef, setOriginsVisible, 0.1),
      observe(teamRef, setTeamVisible, 0.1),
      observe(ctaRef, setCtaVisible, 0.2),
    ];

    return () => {
      clearTimeout(t);
      obs.forEach(o => o?.disconnect());
    };
  }, []);

  return (
    <PageWrapper className="about-page">
      <Helmet>
        <title>Our Story | Spill The Beans</title>
        <meta name="description" content="Learn about Spill The Beans — a premium Indian coffee brand born from passion, built on quality, and sourced directly from India's finest estates." />
      </Helmet>

      {/* ── HERO ──────────────────────────────────────────────────────── */}
      <section className="about-hero grain-overlay" ref={heroRef}>
        <div className="about-hero__image" style={{ backgroundImage: `url(${aboutHero})` }} />
        <div className="about-hero__overlay" />

        <div className={`about-hero__content ${heroVisible ? 'about-hero__content--visible' : ''}`}>
          <div className="about-hero__eyebrow">
            <span className="about-hero__dot" />
            Our Story
          </div>
          <h1 className="about-hero__title">
            Built by Coffee Lovers,<br />
            <em>for</em> Coffee Lovers.
          </h1>
          <p className="about-hero__subtitle">
            We started Spill The Beans because we were tired of settling.
            Tired of mediocre instant. Tired of "premium" brands that charged luxury prices
            for ordinary coffee. We knew India had better. So we went and found it.
          </p>
          <div className="about-hero__actions">
            <Link to="/shop" id="about-hero-shop-btn" className="btn btn-primary btn-lg">
              Shop the Collection <ArrowRight size={16} />
            </Link>
            <a href="#story" className="about-hero__scroll-link">
              Read our story ↓
            </a>
          </div>
        </div>

        {/* Floating stats strip */}
        <div className="about-hero__stats-strip" ref={statsRef}>
          {STATS.map((s, i) => (
            <StatPill key={i} num={s.num} label={s.label} animate={statsVisible} />
          ))}
        </div>
      </section>

      {/* ── STORY / TIMELINE ──────────────────────────────────────────── */}
      <section className="about-story section" id="story" ref={timelineRef}>
        <div className="container">
          <div className={`about-story__header ${timelineVisible ? 'anim-in' : ''}`}>
            <span className="section-label">How It Started</span>
            <h2 className="heading-1">From a Frustration<br />to a Movement</h2>
            <p className="text-body about-story__intro">
              Every great brand begins with a problem worth solving. Ours began with one terrible cup.
            </p>
          </div>

          <div className="about-timeline">
            {TIMELINE.map((item, i) => (
              <div
                key={i}
                className={`about-timeline__item ${timelineVisible ? 'anim-in' : ''}`}
                style={{ animationDelay: `${i * 0.12}s` }}
              >
                <div className="about-timeline__year">{item.year}</div>
                <div className="about-timeline__connector">
                  <div className="about-timeline__dot" />
                  {i < TIMELINE.length - 1 && <div className="about-timeline__line" />}
                </div>
                <div className="about-timeline__content">
                  <h3 className="about-timeline__title">{item.title}</h3>
                  <p className="text-sm about-timeline__body">{item.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── VALUES ────────────────────────────────────────────────────── */}
      <section className="about-values-section section" id="values" ref={valuesRef}>
        <div className="container">
          <div className={`section-header ${valuesVisible ? 'anim-in' : ''}`}>
            <span className="section-label">What We Stand For</span>
            <h2 className="heading-1">Our Core Values</h2>
            <div className="section-divider" />
          </div>

          <div className="about-values-grid">
            {VALUES.map((v, i) => (
              <div
                key={i}
                className={`about-value-card ${valuesVisible ? 'anim-in' : ''}`}
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="about-value-card__top">
                  <span className="about-value-num">{v.num}</span>
                  <div
                    className="about-value-icon"
                    style={{ background: v.bg, color: v.color }}
                  >
                    <v.icon size={20} strokeWidth={2} />
                  </div>
                </div>
                <h3 className="about-value-title">{v.title}</h3>
                <p className="text-sm about-value-desc">{v.desc}</p>
                <div className="about-value-line" style={{ background: v.color }} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ORIGINS ───────────────────────────────────────────────────── */}
      <section className="about-origins-section section" id="origins" ref={originsRef}>
        <div className="container">
          <div className={`about-origins__header ${originsVisible ? 'anim-in' : ''}`}>
            <span className="section-label">Where Coffee Comes From</span>
            <h2 className="heading-1">Our Coffee Origins</h2>
            <p className="text-body about-origins__intro">
              India grows some of the world's most extraordinary coffees. We've searched every corner
              to find the best lots from these five remarkable regions.
            </p>
          </div>

          <div className="about-origins-grid">
            {ORIGINS.map((o, i) => (
              <div
                key={i}
                className={`about-origin-card ${originsVisible ? 'anim-in' : ''}`}
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                <div className="about-origin-card__number">{String(i + 1).padStart(2, '0')}</div>
                <div className="about-origin-card__body">
                  <h3 className="about-origin-card__name">{o.name}</h3>
                  <p className="about-origin-card__subtitle">{o.subtitle}</p>
                  <p className="text-sm about-origin-card__desc">{o.desc}</p>
                </div>
                <Coffee className="about-origin-card__icon" size={18} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROMISE BANNER ────────────────────────────────────────────── */}
      <div className="about-promise-banner">
        <div className="container about-promise-banner__inner">
          {[
            { icon: CheckCircle, text: '100% Direct Trade' },
            { icon: Star, text: '92+ Avg. Cupping Score' },
            { icon: Users, text: '50,000+ Happy Customers' },
            { icon: Leaf, text: 'Sustainable Farming' },
          ].map(({ icon: Icon, text }, i) => (
            <div key={i} className="about-promise-item">
              <Icon size={18} strokeWidth={2} />
              <span>{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── TEAM ──────────────────────────────────────────────────────── */}
      <section className="section" ref={teamRef}>
        <div className="container">
          <div className={`section-header ${teamVisible ? 'anim-in' : ''}`}>
            <span className="section-label">The People Behind It</span>
            <h2 className="heading-1">Meet the Team</h2>
            <div className="section-divider" />
          </div>

          <div className="about-team-grid">
            {TEAM.map((member, i) => (
              <div
                key={i}
                className={`about-team-card ${teamVisible ? 'anim-in' : ''}`}
                style={{ animationDelay: `${i * 0.12}s` }}
              >
                <div className="about-team-card__bg" />
                <div className="about-team-avatar">{member.emoji}</div>
                <div className="about-team-card__body">
                  <h3 className="about-team-name">{member.name}</h3>
                  <p className="about-team-role">{member.role}</p>
                  <p className="text-sm about-team-bio">{member.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────── */}
      <section className="about-cta-section" ref={ctaRef}>
        <div className="about-cta-section__bg" style={{ backgroundImage: `url(${aboutHero})` }} />
        <div className="about-cta-section__overlay" />
        <div className={`container about-cta-content ${ctaVisible ? 'anim-in' : ''}`}>
          <span className="about-cta-label">Zero Compromise</span>
          <h2 className="about-cta-title">
            Ready to Experience<br />the Difference?
          </h2>
          <p className="about-cta-subtitle">
            Taste what happens when extraordinary coffee meets radical transparency.
          </p>
          <div className="about-cta-actions">
            <Link to="/shop" id="about-cta-shop-btn" className="btn btn-primary btn-lg">
              Shop Now <ArrowRight size={16} />
            </Link>
            <Link to="/shop?category=Bundles" id="about-cta-bundles-btn" className="about-cta-ghost-btn">
              View Gift Bundles
            </Link>
          </div>
        </div>
      </section>

      <NewsletterSection />
    </PageWrapper>
  );
}
