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
import heroBg from '../assets/specialty_coffee_hero.png';
import productMocha50g from '../assets/product_mocha_50g.png';
import productVanilla50g from '../assets/product_vanilla_50g.png';
import productHazelnut50g from '../assets/product_hazelnut_50g.png';
import productEspresso50g from '../assets/product_espresso_50g.png';
import accessoryMilkFrother from '../assets/accessory_milk_frother.png';
import accessoryTumbler from '../assets/accessory_tumbler.png';

const ARTICLE_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'What Is Specialty Coffee — And Why Should You Care?',
  description: 'Not all coffee is created equal. Learn what makes a coffee specialty grade, the SCA cupping scale, and why direct trade specialty coffee matters.',
  author: { '@type': 'Person', name: 'Spill The Beans Team' },
  publisher: { '@type': 'Organization', name: 'Spill The Beans', logo: { '@type': 'ImageObject', url: 'https://spillthebeans.in/logo.png' } },
  datePublished: '2026-06-27',
  dateModified: '2026-06-27',
  mainEntityOfPage: 'https://spillthebeans.in/blog/what-is-specialty-coffee',
};

const BREADCRUMB_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://spillthebeans.in/' },
    { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://spillthebeans.in/blog' },
    { '@type': 'ListItem', position: 3, name: 'What Is Specialty Coffee', item: 'https://spillthebeans.in/blog/what-is-specialty-coffee' }
  ]
};

const CRITERIA = [
  { name: 'SCA Score above 80', desc: 'To be certified as specialty, a coffee must score 80 or above on a 100-point scale evaluated by certified Q-graders.', icon: Star, color: '#C27A0A' },
  { name: 'Zero Category 1 Defects', desc: 'Beans must have absolutely zero primary defects like sour beans, black beans, or severe mould.', icon: Check, color: '#276044' },
  { name: 'Full Traceability', desc: 'From the exact micro-region and farmer down to the crop altitude and processing method, the origin details must be fully transparent.', icon: BookOpen, color: '#581312' }
];

const STEPS = [
  { step: 1, title: 'Evaluation of Green Beans', desc: 'Before roasting, green coffee beans are visual-screened to detect primary and secondary defects. High moisture levels or insect damage immediately disqualifies them.', tip: 'Only a few defect-free beans pass this rigorous quality check.' },
  { step: 2, title: 'Sample Roasting', desc: 'Evaluating roasters roast small sample batches of green beans in a precise manner to extract origin flavors without adding roasted char taste.', tip: 'Light to medium roasts are used during cupping to highlight origin differences.' },
  { step: 3, title: 'Grinding and Olfactory Check', desc: 'The samples are freshly ground and smelled dry. Fresh water heated exactly to 93°C is poured directly onto the grounds, creating a crust. Sniffing the wet aroma is vital.', tip: 'Aromas can range from floral, jasmine, and citrus to woody or cardboard-like.' },
  { step: 4, title: 'Tasting & Scoring', desc: 'After letting the brew cool to 71°C, Q-graders break the crust with a spoon and slurp the coffee to coat their palate, grading it on acidity, body, sweetness, and aftertaste.', tip: 'Specialty scoring determines if the bean gets a gourmet premium price.' }
];

const MISTAKES = [
  { title: 'Buying Pre-Ground Specialty Beans', desc: 'Once coffee is ground, the cellular structure collapses, causing volatile aroma compounds to escape within minutes. Always grind fresh right before brewing.', type: 'danger' },
  { title: 'Using Clear Glass Jars on Countertops', desc: 'Direct exposure to light degrades specialty beans within days, destroying delicate lipids and causing stale, woody flavors.', type: 'warning' },
  { title: 'Brewing with Boiling Water', desc: 'Pouring boiling water (100°C) straight onto specialty grounds burns the coffee, bringing out harsh, bitter notes and masking delicate floral acidity.', type: 'danger' }
];

const FAQS = [
  { q: 'What is the difference between commercial and specialty coffee?', a: 'Commercial coffee is roasted in massive industrial batches and sourced with high defect tolerances (often low-grade Robusta). Specialty coffee is meticulously grown, direct-trade Arabica evaluated with zero primary defects.' },
  { q: 'What is a Q-Grader?', a: 'A certified professional cupper who has passed rigorous exams by the Coffee Quality Institute (CQI) to score coffee beans on the 100-point SCA scale.' },
  { q: 'Is specialty coffee more expensive?', a: 'Yes, because direct-trade farmers are paid a premium well above the standard commodity exchange price for their hard labor, ensuring sustainable agriculture.' }
];

const COFFEE_PRODUCTS = [
  { name: 'Raat Ki Rani Espresso', desc: 'Bold dark roast — intense, smoky, perfectly bitter.', slug: 'raat-ki-rani-espresso-50g', img: productEspresso50g, tag: '82+ SCA score' },
  { name: 'Nutkhat Hazelnut', desc: 'Rich hazelnut warmth — smooth, nutty, aromatic.', slug: 'nutkhat-hazelnut-50g', img: productHazelnut50g, tag: 'Barista Favorite' },
  { name: 'Vichaar Over Vanilla', desc: 'Silky vanilla — creamy, sweet, and comforting.', slug: 'vichaar-over-vanilla-50g', img: productVanilla50g, tag: 'Smooth Body' },
  { name: 'Mocha pe Chauka', desc: 'Rich chocolate and coffee — double the indulgence.', slug: 'mocha-pe-chauka-50g', img: productMocha50g, tag: 'Indulgent Roast' },
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
  { id: 'criteria', label: 'SCA Grading Criteria' },
  { id: 'cupping', label: 'The Cupping Process' },
  { id: 'common-mistakes', label: 'Mistakes to Avoid' },
  { id: 'recommended-products', label: 'Fresh Specialty Coffees' },
  { id: 'recommended-accessories', label: 'Accessories' },
  { id: 'faq', label: 'Specialty FAQ' }
];

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0 } } };
const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.15, ease: [0.22, 1, 0.36, 1] } },
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
        Walk into any trendy third-wave coffee shop today, and you will hear the term <strong>"specialty coffee"</strong> tossed around constantly. But what exactly distinguishes a specialty coffee from the commercial canister sitting in a supermarket aisle?
      </p>
      <p>
        At its core, specialty coffee represents the highest grade of coffee available, tracing every step of the bean's journey—from seed to cup. Unlike bulk commercial beans, specialty coffee is grown at high altitudes, harvested by hand, processed meticulously, and roasted to highlight regional origin flavor characteristics.
      </p>
      <p>
        In this guide, we dive into the Specialty Coffee Association (SCA) grading scale. We explain the rigorous cupping process, outline the criteria that separate specialty beans, and show you why investing in high-grade coffee makes a world of difference for your palate.
      </p>
    </div>
  );
}

function SpecialtyCriteria() {
  return (
    <div className="blog-section" id="criteria">
      <span className="recipe-section__label">The Scale</span>
      <h2 className="recipe-section__title">SCA Specialty Coffee Criteria</h2>
      <div className="educational-grid">
        {CRITERIA.map((c, idx) => (
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
      id="cupping"
      initial="hidden" whileInView="show"
      viewport={{ once: true, margin: '-60px' }}
      variants={stagger}
    >
      <motion.div variants={staggerItem} className="recipe-section__header">
        <span className="recipe-section__label">Cupping</span>
        <h2 className="recipe-section__title">The Cupping Process Step-by-Step</h2>
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
      <h2 className="recipe-section__title">Common Mistakes to Avoid</h2>
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
        <span className="recipe-section__label">Fresh Specialty</span>
        <h2 className="recipe-section__title">Shop Specialty Coffees</h2>
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
        <img src={heroBg} alt="What Is Specialty Coffee" className="recipe-hero-editorial__img" />
      </div>
    </section>
  );
}

export default function SpecialtyCoffeePage() {
  const [copied, setCopied] = useState(false);
  const url = 'https://spillthebeans.in/blog/what-is-specialty-coffee';
  const title = 'What Is Specialty Coffee — And Why Should You Care?';

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
        <title>What Is Specialty Coffee | Spill The Beans</title>
        <meta
          name="description"
          content="Learn what makes a coffee specialty grade, the 100-point SCA scale, the cupping process, and why direct trade specialty coffee matters."
        />
        <meta property="og:type" content="article" />
        <meta property="og:title" content="What Is Specialty Coffee | Spill The Beans" />
        <meta property="og:description" content="Not all coffee is created equal. We decode the specialty coffee grading criteria, the SCA cupping scale, and why it matters." />
        <meta property="og:url" content="https://spillthebeans.in/blog/what-is-specialty-coffee" />
        <meta property="og:site_name" content="Spill The Beans" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="What Is Specialty Coffee | Spill The Beans" />
        <meta name="twitter:description" content="Not all coffee is created equal. We decode the specialty coffee grading criteria, the SCA cupping scale, and why it matters." />
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
