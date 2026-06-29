import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock, Share2, ArrowRight, BookOpen, Star, CheckCircle, Check,
  ChevronDown, ChevronUp, Coffee, Zap
} from 'lucide-react';
import PageWrapper from '../components/PageWrapper';
import './RecipePage.css';

// Assets
import heroBg from '../assets/coffee_productivity_hero.png';
import productMocha50g from '../assets/product_mocha_50g.png';
import productVanilla50g from '../assets/product_vanilla_50g.png';
import productHazelnut50g from '../assets/product_hazelnut_50g.png';
import productEspresso50g from '../assets/product_espresso_50g.png';
import accessoryMilkFrother from '../assets/accessory_milk_frother.png';
import accessoryTumbler from '../assets/accessory_tumbler.png';

const ARTICLE_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'Coffee and Productivity: The Science Behind Your Morning Ritual',
  description: 'Is the productivity boost real or placebo? We dig into the neuroscience of caffeine, adenosine receptors, and how to time your coffee for focus.',
  author: { '@type': 'Person', name: 'Spill The Beans Team' },
  publisher: { '@type': 'Organization', name: 'Spill The Beans', logo: { '@type': 'ImageObject', url: 'https://spillthebeans.in/logo.png' } },
  datePublished: '2026-06-27',
  dateModified: '2026-06-27',
  mainEntityOfPage: 'https://spillthebeans.in/blog/coffee-and-productivity',
};

const BREADCRUMB_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://spillthebeans.in/' },
    { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://spillthebeans.in/blog' },
    { '@type': 'ListItem', position: 3, name: 'Coffee and Productivity Science', item: 'https://spillthebeans.in/blog/coffee-and-productivity' }
  ]
};

const CONCEPTS = [
  { name: 'Adenosine Blocker', desc: 'Caffeine binds to adenosine receptors in the brain, blocking the sleepiness-inducing chemical from making you feel tired.', icon: Star, color: '#C27A0A' },
  { name: 'Dopamine & Adrenaline Release', desc: 'By blocking adenosine, caffeine stimulates firing of neurons, triggering release of dopamine (mood boost) and adrenaline (alertness).', icon: Check, color: '#276044' },
  { name: 'Cortisol Synchronicity', desc: 'Timing coffee intake with natural daily fluctuations of cortisol (the stress hormone) maximizes focus without causing hormone resistance.', icon: BookOpen, color: '#581312' }
];

const STEPS = [
  { step: 1, title: 'Delay Your First Cup', desc: 'When you wake up, your cortisol levels naturally spike to make you alert. Consuming caffeine immediately blocks this process. Wait 90–120 minutes before brewing.', tip: 'Delaying caffeine prevents mid-day crashes and tolerance build-up.' },
  { step: 2, title: 'Hydrate First', desc: 'Coffee is a mild diuretic. Sleep causes dehydration. Drink 500ml of fresh water before having your first cup of coffee to support cellular function.', tip: 'Hydrating first improves metabolic rate and mental clarity.' },
  { step: 3, title: 'Use the 2 PM Rule', desc: 'Caffeine has a half-life of 5–7 hours. Having a cup at 3 PM means 50% of the caffeine is still active in your brain at 10 PM, ruining sleep architecture.', tip: 'Switch to decaf or herbal teas in the afternoon.' },
  { step: 4, title: 'Pair with L-Theanine', desc: 'Drinking coffee with L-Theanine (found naturally in green tea or as a supplement) rounds out caffeine jitters, promoting calm, laser-like focus.', tip: 'Adding vanilla or hazelnut also acts as a subtle mood booster.' }
];

const MISTAKES = [
  { title: 'Drinking Coffee Instantly Upon Waking', desc: 'Doing this replaces natural waking cortisol, training your brain to rely solely on coffee to wake up, leading to severe caffeine dependency.', type: 'danger' },
  { title: 'Consuming Caffeine Past 2 PM', desc: 'Caffeine blocks deep sleep waves, meaning you wake up tired, needing even more coffee, creating a vicious fatigue loop.', type: 'warning' },
  { title: 'Using Sugar-Heavy Syrups', desc: 'Sugary lattes cause insulin spikes and subsequent blood sugar crashes, making you feel sluggish within an hour of drinking.', type: 'danger' }
];

const FAQS = [
  { q: 'Why does coffee give me a mid-day energy crash?', a: 'When caffeine wears off, all the built-up adenosine floods your receptors at once. Delaying your first cup by 90 minutes prevents this flood.' },
  { q: 'Is it safe to drink coffee on an empty stomach?', a: 'For most people yes, but it can trigger acid reflux or spike cortisol in sensitive individuals. Having a small snack or milk is recommended.' },
  { q: 'How much caffeine is safe daily?', a: 'The FDA recommends keeping daily intake under 400mg (about 3-4 standard cups of Spill The Beans brewed coffee).' }
];

const COFFEE_PRODUCTS = [
  { name: 'Raat Ki Rani Espresso', desc: 'Bold dark roast — intense, smoky, perfectly bitter.', slug: 'raat-ki-rani-espresso-50g', img: productEspresso50g, tag: 'High Caffeine Alertness' },
  { name: 'Nutkhat Hazelnut', desc: 'Rich hazelnut warmth — smooth, nutty, aromatic.', slug: 'nutkhat-hazelnut-50g', img: productHazelnut50g, tag: 'Focus Blend' },
  { name: 'Vichaar Over Vanilla', desc: 'Silky vanilla — creamy, sweet, and comforting.', slug: 'vichaar-over-vanilla-50g', img: productVanilla50g, tag: 'Calm Alertness' },
  { name: 'Mocha pe Chauka', desc: 'Rich chocolate and coffee — double the indulgence.', slug: 'mocha-pe-chauka-50g', img: productMocha50g, tag: 'Study & Focus Companion' },
];

const ACCESSORIES = [
  { name: 'Premium Milk Frother', desc: 'Get café-quality foam in 15 seconds at home.', img: accessoryMilkFrother, slug: 'milk-frother' },
  { name: 'Spill The Beans Mug', desc: 'Perfect porcelain mug to keep your drinks hot or cold.', img: accessoryTumbler, slug: 'travel-tumbler' }
];

const RELATED_RECIPES = [
  { title: 'French Press Brewing Guide', time: '5 min', category: 'Brew Guides', color: '#C27A0A', bg: 'rgba(194,122,10,0.1)', icon: Star, slug: 'guide-to-coffee-roast-levels' },
  { title: 'Arabica vs Robusta: What’s the Difference?', time: '4 min', category: 'Education', color: '#276044', bg: '#e8f5ee', icon: BookOpen, slug: 'what-is-specialty-coffee' },
  { title: 'Protein Coffee (Proffee) Recipe', time: '3 min', category: 'Recipes', color: '#581312', bg: 'rgba(88,19,18,0.07)', icon: Coffee, slug: 'protein-coffee-recipe' },
  { title: 'How to Store Coffee Beans Correctly', time: '4 min', category: 'Tips', color: '#b52a2a', bg: '#fdecea', icon: Zap, slug: 'how-to-store-coffee-beans-correctly' }
];

const TOC_ITEMS = [
  { id: 'intro', label: 'Introduction' },
  { id: 'concepts', label: 'Caffeine Science' },
  { id: 'steps', label: 'How to Optimize' },
  { id: 'common-mistakes', label: 'Mistakes to Avoid' },
  { id: 'recommended-products', label: 'Recommended Coffee' },
  { id: 'recommended-accessories', label: 'Accessories' },
  { id: 'faq', label: 'Productivity FAQ' }
];

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.09 } } };
const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
};

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

function BlogIntroduction() {
  return (
    <div className="blog-section blog-intro" id="intro">
      <p className="lead-paragraph">
        For busy professionals, students, and creatives alike, coffee is the ultimate fuel. But does that morning cup actually boost your <strong>productivity and focus</strong>, or is it a placebo-driven illusion?
      </p>
      <p>
        Science shows that caffeine is a powerful cognitive enhancer. When used correctly, it improves working memory, speeds up reaction times, and ward off mental fatigue. However, drinking it at the wrong times or in excessive doses can lead to cortisol spikes, crashes, and insomnia.
      </p>
      <p>
        In this article, we dig into the neuroscience of caffeine. We explain how it interacts with adenosine receptors, outline the optimal timing for your daily cups, and highlight expert habits to make coffee your ultimate productivity partner.
      </p>
    </div>
  );
}

function SpecialtyCriteria() {
  return (
    <div className="blog-section" id="concepts">
      <span className="recipe-section__label">Neuroscience</span>
      <h2 className="recipe-section__title">How Caffeine Impacts Your Brain</h2>
      <div className="educational-grid">
        {CONCEPTS.map((c, idx) => (
          <div key={idx} className="edu-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <c.icon size={20} color={c.color} />
              <h5 style={{ margin: 0 }}>{c.name}</h5>
            </div>
            <p>{c.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function CuppingSteps() {
  return (
    <motion.div
      className="recipe-section"
      id="steps"
      initial="hidden" whileInView="show"
      viewport={{ once: true, margin: '-60px' }}
      variants={stagger}
    >
      <motion.div variants={staggerItem} className="recipe-section__header">
        <span className="recipe-section__label">Habits</span>
        <h2 className="recipe-section__title">Optimizing Your Caffeine Routine</h2>
      </motion.div>
      <div className="recipe-steps">
        {STEPS.map((s) => (
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

function CommonStorageMistakes() {
  return (
    <div className="blog-section" id="common-mistakes">
      <span className="recipe-section__label">Caution</span>
      <h2 className="recipe-section__title">Common Coffee Habits to Avoid</h2>
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
        <span className="recipe-section__label">Performance</span>
        <h2 className="recipe-section__title">Brews for High Focus</h2>
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
                Shop Now <ArrowRight size={14} />
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
        <img src={heroBg} alt="Coffee and Productivity Science" className="recipe-hero-editorial__img" />
      </div>
    </section>
  );
}

export default function CoffeeProductivityPage() {
  const [copied, setCopied] = useState(false);
  const url = 'https://spillthebeans.in/blog/coffee-and-productivity';
  const title = 'Coffee and Productivity: The Science Behind Your Morning Ritual';

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
        <title>Coffee and Productivity Science | Spill The Beans</title>
        <meta
          name="description"
          content="Discover the science of coffee and productivity. Learn about caffeine adenosine blockers, morning cortisol syncing, and optimal focus timing."
        />
        <meta property="og:type" content="article" />
        <meta property="og:title" content="Coffee and Productivity Science | Spill The Beans" />
        <meta property="og:description" content="Time your caffeine for maximum alertness without the crash. Neuroscience of adenosine receptors." />
        <meta property="og:url" content="https://spillthebeans.in/blog/coffee-and-productivity" />
        <meta property="og:site_name" content="Spill The Beans" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Coffee and Productivity Science | Spill The Beans" />
        <meta name="twitter:description" content="Time your caffeine for maximum alertness without the crash. Neuroscience of adenosine receptors." />
        <script type="application/ld+json">{JSON.stringify(ARTICLE_SCHEMA)}</script>
        <script type="application/ld+json">{JSON.stringify(BREADCRUMB_SCHEMA)}</script>
      </Helmet>

      <RecipeHero />

      <div className="recipe-layout container">
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

        <main className="recipe-main">
          <BlogIntroduction />
          <SpecialtyCriteria />
          <CuppingSteps />
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
