import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock, Share2, ArrowRight, BookOpen, Star, CheckCircle, Check,
  Wind, Droplet, Thermometer, Sun, Coffee, ChevronDown, ChevronUp
} from 'lucide-react';
import PageWrapper from '../components/PageWrapper';
import './RecipePage.css'; // Reusing the premium recipe magazine styling

// Assets
import heroBg from '../assets/store_beans_hero.png';
import productMocha50g from '../assets/product_mocha_50g.png';
import productVanilla50g from '../assets/product_vanilla_50g.png';
import productHazelnut50g from '../assets/product_hazelnut_50g.png';
import productEspresso50g from '../assets/product_espresso_50g.png';
import accessoryMilkFrother from '../assets/accessory_milk_frother.png';
import accessoryTumbler from '../assets/accessory_tumbler.png';

// ── SEO Schemas ────────────────────────────────────────────────────────────
const ARTICLE_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'How to Store Coffee Beans Correctly for Ultimate Freshness',
  description: 'Keep your coffee fresh! Learn the science of storing coffee beans, the four enemies of freshness, and best practices to preserve flavor oils.',
  author: { '@type': 'Person', name: 'Spill The Beans Team' },
  publisher: { '@type': 'Organization', name: 'Spill The Beans', logo: { '@type': 'ImageObject', url: 'https://spillthebeans.in/logo.png' } },
  datePublished: '2026-06-26',
  dateModified: '2026-06-26',
  mainEntityOfPage: 'https://spillthebeans.in/blog/how-to-store-coffee-beans-correctly',
};

const BREADCRUMB_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://spillthebeans.in/' },
    { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://spillthebeans.in/blog' },
    { '@type': 'ListItem', position: 3, name: 'How to Store Coffee Beans Correctly', item: 'https://spillthebeans.in/blog/how-to-store-coffee-beans-correctly' }
  ]
};

// ── Data ───────────────────────────────────────────────────────────────────
const ENEMIES = [
  { name: 'Oxygen (Air)', desc: 'Oxidation triggers the decay of delicate aromatic oils, turning bright tasting notes flat.', icon: Wind, color: '#C27A0A' },
  { name: 'Moisture', desc: 'Humidity encourages mould and ruins bean structure. Condensation accelerates staling.', icon: Droplet, color: '#276044' },
  { name: 'Heat', desc: 'Warm environment speeds up chemical reactions inside the roasted beans, causing oil leakage.', icon: Thermometer, color: '#b52a2a' },
  { name: 'Light', desc: 'UV rays break down organic compounds and lipids, causing photolytic degradation.', icon: Sun, color: '#E8960E' },
];

const STORAGE_METHODS = [
  { step: 1, title: 'Choose Airtight Opaque Canisters', desc: 'Invest in a dedicated coffee canister with a one-way CO2 release valve. Make sure it is completely opaque to keep out light.', tip: 'Ceramic, stainless steel, or amber-tinted jars are perfect options.' },
  { step: 2, title: 'Keep it Cool and Dark', desc: 'Store your beans on a dark cupboard shelf or pantry cabinet. Keep them away from high-heat areas like oven hoods, stoves, or direct windows.', tip: 'A stable indoor temperature of 18–22°C is optimal.' },
  { step: 3, title: 'Buy in Small Quantities', desc: 'Coffee reaches peak flavour about 7–10 days after roasting. To enjoy maximum vibrancy, purchase your beans in bi-weekly or monthly batches rather than bulk hoarding.', tip: 'Check the "Roast Date" rather than the expiry date.' },
  { step: 4, title: 'Keep the Original Valve Bag', desc: 'If you do not have an airtight canister, leave the beans in the original Spill The Beans pouch. Seal the zip lock tightly and squeeze out excess air after every use.', tip: 'The plastic circle is a one-way degassing valve that keeps oxygen out while letting CO2 escape.' },
];

const MISTAKES = [
  { title: 'Refrigerating Coffee Beans', desc: 'Every time you open the fridge door, temperature fluctuations create condensation inside the jar. Plus, coffee is highly porous and will absorb the smells of garlic or onion.', type: 'danger' },
  { title: 'Using Clear Glass Jars on Countertops', desc: 'While jar aesthetics look lovely on Pinterest, direct exposure to sunlight breaks down the beans and triggers staling within a matter of days.', type: 'warning' },
  { title: 'Buying Pre-Ground in Bulk', desc: 'Ground coffee has thousands of times more surface area than whole beans. Once ground, it stales in less than 20 minutes due to rapid oxidation.', type: 'danger' },
  { title: 'Storing Near Cooking Appliances', desc: 'Placing your jar on shelves right above your toaster, microwave, or next to your oven compromises the ambient temperature and ruins the delicate coffee oils.', type: 'warning' }
];

const FAQS = [
  { q: 'Does coffee actually go bad or expire?', a: 'Coffee does not spoil in a way that makes you sick (unless moisture gets in and causes mould), but it loses its aroma and flavour over time. Old beans taste flat, woody, or cardboard-like. We recommend using them within 4-6 weeks of the roast date.' },
  { q: 'Should I store coffee in the freezer?', a: 'Only for long-term storage (more than a month) in a vacuum-sealed bag. Once you take it out, let the package reach room temperature before opening to avoid moisture condensation on the cold beans. Never put daily-use coffee in the freezer.' },
  { q: 'What is the plastic circle on the coffee pouch?', a: 'Those are one-way degassing valves. Freshly roasted coffee releases carbon dioxide (degassing) for several days. The valve lets CO2 escape safely so the bag doesn\'t burst, while blocking oxygen from entering.' },
  { q: 'Why is whole bean coffee superior to pre-ground?', a: 'Whole beans act as natural protective capsules for volatile oils. Grinding increases the surface area exposed to oxygen by thousands of times, accelerating flavour decay. Always grind fresh right before brewing.' }
];

const COFFEE_PRODUCTS = [
  { name: 'Raat Ki Rani Espresso', desc: 'Bold dark roast — intense, smoky, perfectly bitter.', slug: 'raat-ki-rani-espresso-50g', img: productEspresso50g, tag: 'Best for Espresso' },
  { name: 'Nutkhat Hazelnut', desc: 'Rich hazelnut warmth — smooth, nutty, aromatic.', slug: 'nutkhat-hazelnut-50g', img: productHazelnut50g, tag: 'Best Seller' },
  { name: 'Vichaar Over Vanilla', desc: 'Silky vanilla — creamy, sweet, and utterly comforting.', slug: 'vichaar-over-vanilla-50g', img: productVanilla50g, tag: 'Smooth Roast' },
  { name: 'Mocha pe Chauka', desc: 'Mocha meets richness — chocolate and coffee in one sip.', slug: 'mocha-pe-chauka-50g', img: productMocha50g, tag: 'Chocolate Notes' },
];

const ACCESSORIES = [
  { name: 'Spill The Beans Mug', desc: 'Perfect porcelain mug to keep your drinks hot or cold.', img: accessoryTumbler, slug: 'travel-tumbler' },
  { name: 'Premium Milk Frother', desc: 'Get café-quality foam in 15 seconds at home.', img: accessoryMilkFrother, slug: 'milk-frother' }
];

const RELATED_RECIPES = [
  { title: 'Protein Coffee (Proffee) Recipe', time: '3 min', category: 'Recipes', color: '#581312', bg: 'rgba(88,19,18,0.07)', icon: Coffee, slug: 'protein-coffee-recipe' },
  { title: 'Classic Iced Coffee at Home', time: '3 min', category: 'Brew Guides', color: '#581312', bg: 'rgba(88,19,18,0.07)', icon: Coffee, slug: 'how-to-make-the-perfect-iced-latte' },
  { title: 'French Press Brewing Guide', time: '5 min', category: 'Brew Guides', color: '#C27A0A', bg: 'rgba(194,122,10,0.1)', icon: Star, slug: 'guide-to-coffee-roast-levels' },
  { title: 'Arabica vs Robusta: What’s the Difference?', time: '4 min', category: 'Education', color: '#276044', bg: '#e8f5ee', icon: BookOpen, slug: 'what-is-specialty-coffee' }
];

const TOC_ITEMS = [
  { id: 'intro', label: 'Introduction' },
  { id: 'why-freshness', label: 'Why Freshness Matters' },
  { id: 'enemies', label: 'The Four Enemies' },
  { id: 'best-methods', label: 'Best Storage Methods' },
  { id: 'freezer-debate', label: 'The Freezer Debate' },
  { id: 'common-mistakes', label: 'Mistakes to Avoid' },
  { id: 'recommended-products', label: 'Fresh Coffee Beans' },
  { id: 'recommended-accessories', label: 'Accessories' },
  { id: 'faq', label: 'Storage FAQ' }
];

// Animation variants
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.09 } } };
const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
};

// ── Shared Helper Components ──────────────────────────────────────────────
function ReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        setProgress((window.pageYOffset / totalHeight) * 100);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return <div className="reading-progress-bar" style={{ width: `${progress}%` }} />;
}

function TableOfContents() {
  const [activeId, setActiveId] = useState('');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '-20% 0px -60% 0px' }
    );

    TOC_ITEMS.forEach((item) => {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <nav className="toc-nav">
      <h4 className="toc-title">On This Page</h4>
      <ul className="toc-list">
        {TOC_ITEMS.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className={`toc-link ${activeId === item.id ? 'active' : ''}`}
              onClick={(e) => {
                e.preventDefault();
                document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function AuthorCard() {
  return (
    <div className="author-card">
      <div className="author-avatar">☕</div>
      <div className="author-info">
        <span className="author-label">Written By</span>
        <h5 className="author-name">Spill The Beans Team</h5>
        <p className="author-bio">Sourcing direct-trade coffees and sharing professional brewing secrets.</p>
      </div>
    </div>
  );
}

// ── Page Content Components ────────────────────────────────────────────────
function BlogIntroduction() {
  return (
    <div className="blog-section blog-intro" id="intro">
      <p className="lead-paragraph">
        There is nothing quite like opening a fresh bag of roasted coffee beans. The rush of aromatic cocoa, warm spices, and rich caramel notes immediately promises a café-quality morning. But within days of cracking that seal, oxygen, heat, and moisture quietly begin chipping away at that complex flavour profile.
      </p>
      <p>
        If your coffee has started tasting flat, bitter, or reminiscent of cardboard, the culprit is almost certainly improper storage. Coffee beans are organic substances containing delicate lipids, soluble solids, and volatile gases that degrade rapidly when exposed to the elements.
      </p>
      <p>
        In this guide, we dive into the science of coffee staling. You will learn the four ultimate enemies of coffee freshness, storage myths, and best practices to keep your beans tasting vibrant and aromatic down to the very last scoop.
      </p>
    </div>
  );
}

function WhyFreshnessMatters() {
  return (
    <div className="blog-section" id="why-freshness">
      <span className="recipe-section__label">The Science</span>
      <h2 className="recipe-section__title">Why Coffee Freshness Matters</h2>
      <div className="editorial-content">
        <p>
          Once roasted, coffee beans begin a process called <strong>degassing</strong>, where they release carbon dioxide trapped during roasting. CO2 is crucial because it keeps oxygen from reacting with the coffee oils. Over 2 to 3 weeks, as this gas dissipates, oxidation takes over.
        </p>
        <p>
          Oxidation breaks down the volatile flavor compounds, transforming bright fruit acids into stale, flat cup notes. Storing your coffee correctly doesn't just prolong its life; it actively locks in those delicate regional nuances that define high-quality specialty coffee.
        </p>
      </div>
    </div>
  );
}

function TheFourEnemies() {
  return (
    <div className="blog-section" id="enemies">
      <span className="recipe-section__label">Enemies of Coffee</span>
      <h2 className="recipe-section__title">The Four Enemies of Freshness</h2>
      <div className="educational-grid">
        {ENEMIES.map((e, idx) => (
          <div key={idx} className="edu-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <e.icon size={20} color={e.color} />
              <h5 style={{ margin: 0 }}>{e.name}</h5>
            </div>
            <p>{e.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function BestStorageLocations() {
  return (
    <motion.div
      className="recipe-section"
      id="best-methods"
      initial="hidden" whileInView="show"
      viewport={{ once: true, margin: '-60px' }}
      variants={stagger}
    >
      <motion.div variants={staggerItem} className="recipe-section__header">
        <span className="recipe-section__label">Storage Guide</span>
        <h2 className="recipe-section__title">Best Practices: How to Store Your Beans</h2>
      </motion.div>
      <div className="recipe-steps">
        {STORAGE_METHODS.map((s) => (
          <motion.div
            key={s.step}
            variants={staggerItem}
            className="recipe-step-text-item"
          >
            <h3 className="recipe-step-text-title">
              <span className="recipe-step-text-num">{s.step}.</span> {s.title}
            </h3>
            <p className="recipe-step-text-desc">{s.desc}</p>
            {s.tip && (
              <div className="recipe-step-text-tip">
                <strong>Pro Tip:</strong> {s.tip}
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

function FreezerDebate() {
  return (
    <div className="blog-section" id="freezer-debate">
      <span className="recipe-section__label">Myth Busting</span>
      <h2 className="recipe-section__title">The Coffee Freezer Debate</h2>
      <div className="editorial-content">
        <p>
          For decades, standard household advice suggested storing coffee bags in the freezer. However, this method does more harm than good for daily brewing.
        </p>
        <div className="tip-callout-card" style={{ borderLeft: '4px solid #b52a2a', background: '#fff5f5' }}>
          <div className="tip-callout-emoji">⚠️</div>
          <div className="tip-callout-content">
            <h5 style={{ color: '#b52a2a' }}>Avoid Daily Defrosting</h5>
            <p style={{ color: '#5C3A36', margin: 0 }}>
              Removing cold beans from the freezer exposes them to warm kitchen air. Condensation immediately forms on the bean surface. Putting it back in the freezer freezes that moisture, accelerating cell breakdown and staling the coffee instantly.
            </p>
          </div>
        </div>
        <p style={{ marginTop: '1.25rem' }}>
          If you must freeze coffee, vacuum-seal it in small single-serving portions. When you are ready to brew, let the package rest on your counter until it reaches room temperature completely before opening.
        </p>
      </div>
    </div>
  );
}

function CommonStorageMistakes() {
  return (
    <div className="blog-section" id="common-mistakes">
      <span className="recipe-section__label">Caution</span>
      <h2 className="recipe-section__title">Common Storage Mistakes to Avoid</h2>
      <div className="mistakes-grid">
        {MISTAKES.map((m, idx) => (
          <div key={idx} className={`mistake-card mistake-card--${m.type}`}>
            <div className="mistake-header">
              <span className="mistake-icon">{m.type === 'danger' ? '❌' : '⚠️'}</span>
              <h5>{m.title}</h5>
            </div>
            <p>{m.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function CoffeeRecommendations() {
  return (
    <motion.div
      className="recipe-section"
      initial="hidden" whileInView="show"
      viewport={{ once: true, margin: '-60px' }}
      variants={stagger}
    >
      <motion.div variants={staggerItem} className="recipe-section__header">
        <span className="recipe-section__label">Fresh Brews</span>
        <h2 className="recipe-section__title">Start with Fresh Coffee Beans</h2>
      </motion.div>
      <div className="rec-coffee-grid">
        {COFFEE_PRODUCTS.map((c, i) => (
          <motion.div
            key={i}
            variants={staggerItem}
            className="rec-coffee-card"
          >
            <div className="rec-coffee-card__img-wrap">
              <img src={c.img} alt={c.name} className="rec-coffee-card__img" loading="lazy" />
              {c.tag && <span className="rec-coffee-card__tag">{c.tag}</span>}
            </div>
            <div className="rec-coffee-card__body">
              <h3 className="rec-coffee-card__name">{c.name}</h3>
              <p className="rec-coffee-card__desc">{c.desc}</p>
              <Link to={`/products/${c.slug}`} className="btn btn-secondary rec-coffee-card__btn">
                Shop Fresh <ArrowRight size={14} />
              </Link>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

function AccessoriesSection() {
  return (
    <motion.div
      className="recipe-section"
      initial="hidden" whileInView="show"
      viewport={{ once: true, margin: '-60px' }}
      variants={stagger}
    >
      <motion.div variants={staggerItem} className="recipe-section__header">
        <span className="recipe-section__label">Tools</span>
        <h2 className="recipe-section__title">Recommended Accessories</h2>
      </motion.div>
      <div className="accessories-grid">
        {ACCESSORIES.map((a, i) => (
          <motion.div
            key={i}
            variants={staggerItem}
            className="accessory-card"
            whileHover={{ y: -5, transition: { duration: 0.25 } }}
          >
            <div className="accessory-card__img-wrap">
              <img src={a.img} alt={a.name} className="accessory-card__img" loading="lazy" />
            </div>
            <div className="accessory-card__body">
              <h3 className="accessory-card__name">{a.name}</h3>
              <p className="accessory-card__desc">{a.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

function RecipeFAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <motion.div
      className="recipe-section"
      initial="hidden" whileInView="show"
      viewport={{ once: true, margin: '-60px' }}
      variants={stagger}
    >
      <motion.div variants={staggerItem} className="recipe-section__header">
        <span className="recipe-section__label">FAQ</span>
        <h2 className="recipe-section__title">Frequently Asked Questions</h2>
      </motion.div>
      <div className="faq-list">
        {FAQS.map((faq, i) => (
          <motion.div key={i} variants={staggerItem} className={`faq-item ${openIndex === i ? 'faq-item--open' : ''}`}>
            <button
              className="faq-item__question"
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              aria-expanded={openIndex === i}
              id={`faq-${i}`}
            >
              <span>{faq.q}</span>
              {openIndex === i
                ? <ChevronUp size={18} className="faq-item__chevron" />
                : <ChevronDown size={18} className="faq-item__chevron" />
              }
            </button>
            <AnimatePresence>
              {openIndex === i && (
                <motion.div
                  key="answer"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1, transition: { duration: 0.32, ease: [0.22, 1, 0.36, 1] } }}
                  exit={{ height: 0, opacity: 0, transition: { duration: 0.22 } }}
                  className="faq-item__answer-wrap"
                >
                  <p className="faq-item__answer">{faq.a}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

function RelatedRecipes() {
  return (
    <motion.div
      className="recipe-section"
      initial="hidden" whileInView="show"
      viewport={{ once: true, margin: '-60px' }}
      variants={stagger}
    >
      <motion.div variants={staggerItem} className="recipe-section__header">
        <span className="recipe-section__label">More Reading</span>
        <h2 className="recipe-section__title">You Might Also Like</h2>
      </motion.div>
      <div className="related-recipes-grid">
        {RELATED_RECIPES.map((r, i) => (
          <motion.div key={i} variants={staggerItem} whileHover={{ y: -5, transition: { duration: 0.25 } }}>
            <Link to={`/blog/${r.slug}`} className="related-recipe-card" id={`related-recipe-${i}`}>
              <div className="related-recipe-card__thumb" style={{ background: r.bg, color: r.color }}>
                <r.icon size={32} strokeWidth={1.5} />
              </div>
              <div className="related-recipe-card__body">
                <span className="related-recipe-card__cat">{r.category}</span>
                <h3 className="related-recipe-card__title">{r.title}</h3>
                <p className="related-recipe-card__time">
                  <Clock size={12} /> {r.time} read
                </p>
              </div>
              <ArrowRight size={16} className="related-recipe-card__arrow" />
            </Link>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

function RecipeNewsletterCTA() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setSubmitted(true);
    }
  };

  return (
    <motion.section
      className="recipe-newsletter"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="recipe-newsletter__inner">
        <div className="recipe-newsletter__text">
          <p className="recipe-newsletter__label">☕ Never Miss a Post</p>
          <h2 className="recipe-newsletter__title">Join the Spill The Beans Community</h2>
          <p className="recipe-newsletter__desc">
            Love coffee? Join the Spill The Beans community for brewing guides, exclusive recipes, and early access to new coffee launches.
          </p>
        </div>
        {submitted ? (
          <div className="recipe-newsletter__success">
            <CheckCircle size={28} />
            <p>You're in! Check your inbox for a welcome surprise ☕</p>
          </div>
        ) : (
          <form className="recipe-newsletter__form" onSubmit={handleSubmit}>
            <input
              id="recipe-newsletter-email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="recipe-newsletter__input"
              required
            />
            <button type="submit" className="btn btn-primary recipe-newsletter__btn" id="recipe-newsletter-submit">
              Subscribe
            </button>
          </form>
        )}
      </div>
    </motion.section>
  );
}

function RecipeHero() {
  return (
    <section className="recipe-hero-editorial">
      <div className="recipe-hero-editorial__img-wrap">
        <img src={heroBg} alt="How to Store Coffee Beans Correctly" className="recipe-hero-editorial__img" />
      </div>
    </section>
  );
}

// ── Default Page Export ──────────────────────────────────────────────────
export default function StoreCoffeePage() {
  const [copied, setCopied] = useState(false);
  const url = 'https://spillthebeans.in/blog/how-to-store-coffee-beans-correctly';
  const title = 'How to Store Coffee Beans Correctly for Ultimate Freshness';

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href || url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    });
  };

  const sharePinterest = `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(url)}&description=${encodeURIComponent(title)}`;
  const shareFacebook = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
  const shareTwitter = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;
  const shareWhatsApp = `https://wa.me/?text=${encodeURIComponent(title + ' — ' + url)}`;

  return (
    <PageWrapper className="recipe-page">
      <ReadingProgress />

      <Helmet>
        <title>How to Store Coffee Beans Correctly | Spill The Beans</title>
        <meta
          name="description"
          content="Learn how to store coffee beans to keep them fresh. Discover the enemies of freshness, the freezer myth, and tips to protect coffee flavor."
        />
        {/* Open Graph */}
        <meta property="og:type" content="article" />
        <meta property="og:title" content="How to Store Coffee Beans Correctly | Spill The Beans" />
        <meta property="og:description" content="Keep your coffee fresh! The science of storing coffee beans, the four enemies, and storage best practices." />
        <meta property="og:url" content="https://spillthebeans.in/blog/how-to-store-coffee-beans-correctly" />
        <meta property="og:site_name" content="Spill The Beans" />
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="How to Store Coffee Beans Correctly | Spill The Beans" />
        <meta name="twitter:description" content="Keep your coffee fresh! The science of storing coffee beans, the four enemies, and storage best practices." />
        {/* JSON-LD Schemas */}
        <script type="application/ld+json">{JSON.stringify(ARTICLE_SCHEMA)}</script>
        <script type="application/ld+json">{JSON.stringify(BREADCRUMB_SCHEMA)}</script>
      </Helmet>

      <RecipeHero />

      <div className="recipe-layout container">
        {/* Sticky Left Sidebar */}
        <aside className="recipe-left-sidebar">
          <div className="sticky-sidebar-content">
            <TableOfContents />
            <AuthorCard />
            <div className="sidebar-share-wrap">
              <h5>Share This Post</h5>
              <div className="sidebar-share-buttons">
                <button
                  className={`share-btn-round ${copied ? 'copied' : ''}`}
                  onClick={copyLink}
                  title="Copy Link"
                >
                  {copied ? <Check size={16} /> : <Share2 size={16} />}
                </button>
                <a href={shareTwitter} target="_blank" rel="noopener noreferrer" className="share-btn-round twitter" title="Share on Twitter">🐦</a>
                <a href={shareFacebook} target="_blank" rel="noopener noreferrer" className="share-btn-round facebook" title="Share on Facebook">👥</a>
                <a href={sharePinterest} target="_blank" rel="noopener noreferrer" className="share-btn-round pinterest" title="Share on Pinterest">📌</a>
                <a href={shareWhatsApp} target="_blank" rel="noopener noreferrer" className="share-btn-round whatsapp" title="Share on WhatsApp">💬</a>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content Column */}
        <main className="recipe-main">
          <BlogIntroduction />
          <WhyFreshnessMatters />
          <TheFourEnemies />
          <BestStorageLocations />
          <FreezerDebate />
          <CommonStorageMistakes />

          <div id="recommended-products" className="scroll-margin-target">
            <CoffeeRecommendations />
          </div>

          <div id="recommended-accessories" className="scroll-margin-target">
            <AccessoriesSection />
          </div>

          <div id="faq" className="scroll-margin-target">
            <RecipeFAQ />
          </div>

          <RelatedRecipes />
        </main>
      </div>

      <RecipeNewsletterCTA />
    </PageWrapper>
  );
}
