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
import heroBg from '../assets/flavoured_coffees_hero.png';
import productMocha50g from '../assets/product_mocha_50g.png';
import productVanilla50g from '../assets/product_vanilla_50g.png';
import productHazelnut50g from '../assets/product_hazelnut_50g.png';
import productEspresso50g from '../assets/product_espresso_50g.png';
import accessoryMilkFrother from '../assets/accessory_milk_frother.png';
import accessoryTumbler from '../assets/accessory_tumbler.png';

const ARTICLE_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'The 6 Best Flavoured Coffees You Need to Try in 2025',
  description: 'Looking for a new coffee obsession? We rank the best flavoured instant coffees in India based on reviews, tasting profiles, and blend chemistry.',
  author: { '@type': 'Person', name: 'Spill The Beans Team' },
  publisher: { '@type': 'Organization', name: 'Spill The Beans', logo: { '@type': 'ImageObject', url: 'https://spillthebeans.in/logo.png' } },
  datePublished: '2026-06-27',
  dateModified: '2026-06-27',
  mainEntityOfPage: 'https://spillthebeans.in/blog/best-flavoured-coffees-india-2025',
};

const BREADCRUMB_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://spillthebeans.in/' },
    { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://spillthebeans.in/blog' },
    { '@type': 'ListItem', position: 3, name: 'The 6 Best Flavoured Coffees in India', item: 'https://spillthebeans.in/blog/best-flavoured-coffees-india-2025' }
  ]
};

const FLAVOURS = [
  { name: 'Nutkhat Hazelnut', desc: 'A rich hazelnut profile delivering smooth, toasted, nutty warmth. Perfect with or without milk.', icon: Star, color: '#C27A0A' },
  { name: 'Vichaar Over Vanilla', desc: 'Silky, warm, and highly comforting vanilla bean sweetness. Incredibly smooth mouthfeel.', icon: Check, color: '#276044' },
  { name: 'Mocha pe Chauka', desc: 'The ultimate merge of bold cocoa and premium espresso. Perfect for chocolate cravings.', icon: BookOpen, color: '#581312' }
];

const STEPS = [
  { step: 1, title: 'Bean Selection', desc: 'We select premium, high-altitude direct-trade Arabica beans that exhibit naturally sweet, low-acid profiles that pair perfectly with aromatic oils.', tip: 'Low acidity ensures the flavorings do not taste sour.' },
  { step: 2, title: 'Aromatics Infusion', desc: 'High-quality, food-grade natural flavoring extracts are introduced right after roasting when the bean pores are fully open, absorbing the oils uniformly.', tip: 'Infusing at precise temperatures locks in the aroma long-term.' },
  { step: 3, title: 'Agglomeration Processing', desc: 'The coffee is freeze-dried under extreme vacuum rather than spray-dried. This preserves volatile coffee oils and turns them into solid soluble crystals.', tip: 'Freeze drying maintains café-quality taste.' },
  { step: 4, title: 'Quality Batch Testing', desc: 'Every batch is cupped by our quality assurance team to check that flavor strengths balance nicely without tasting chemically synthetic.', tip: 'Taste it black first to evaluate natural sweetness.' }
];

const MISTAKES = [
  { title: 'Boiling Flavoured Coffee Crystals', desc: 'Dumping instant flavoured coffee directly into boiling water burns the delicate aromatic flavoring oils, releasing a bitter, burnt smell.', type: 'danger' },
  { title: 'Adding Too Much Sugar First', desc: 'Spill The Beans flavoured instant coffees contain natural aromatics that simulate sweetness. Adding heavy sugars before tasting makes it cloyingly sweet.', type: 'warning' },
  { title: 'Using Low-Quality Skimmed Milk', desc: 'Flavourings bind best to dairy and plant fats. Using watery skimmed milk results in a thin, watery cup with a strong chemical aftertaste.', type: 'danger' }
];

const FAQS = [
  { q: 'Do Spill The Beans flavoured coffees contain sugar?', a: 'No, our instant coffees contain zero added sugar or artificial sweeteners. The sweet taste is simulated by natural aromatic extracts.' },
  { q: 'Is flavoured coffee safe to drink black?', a: 'Absolutely! Our premium freeze-dried Arabica base makes it smooth, low-bitter, and perfect to enjoy black without any dairy.' },
  { q: 'How should I store instant flavoured coffee?', a: 'Keep the jar tightly sealed in a cool, dry place. Avoid using wet spoons to scoop out the granules, which introduces humidity.' }
];

const COFFEE_PRODUCTS = [
  { name: 'Nutkhat Hazelnut', desc: 'Rich hazelnut warmth — smooth, nutty, aromatic.', slug: 'nutkhat-hazelnut-50g', img: productHazelnut50g, tag: 'Customer Favorite' },
  { name: 'Vichaar Over Vanilla', desc: 'Silky vanilla — creamy, sweet, and comforting.', slug: 'vichaar-over-vanilla-50g', img: productVanilla50g, tag: 'Aromatic & Smooth' },
  { name: 'Mocha pe Chauka', desc: 'Rich chocolate and coffee — double the indulgence.', slug: 'mocha-pe-chauka-50g', img: productMocha50g, tag: 'Choco Infused' },
  { name: 'Raat Ki Rani Espresso', desc: 'Bold dark roast — intense, smoky, perfectly bitter.', slug: 'raat-ki-rani-espresso-50g', img: productEspresso50g, tag: 'Classic Bold' },
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
  { id: 'flavours', label: 'Top Flavours' },
  { id: 'science', label: 'How It Is Made' },
  { id: 'common-mistakes', label: 'Mistakes to Avoid' },
  { id: 'recommended-products', label: 'Recommended Coffee' },
  { id: 'recommended-accessories', label: 'Accessories' },
  { id: 'faq', label: 'Flavour FAQ' }
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
        Coffee purists often turn their noses up at the mention of flavoured coffee. But as a new wave of premium, freeze-dried flavoured coffees gains popularity in India, coffee lovers are discovering that flavorings can be balanced, complex, and incredibly delicious.
      </p>
      <p>
        Gone are the days of bitter, low-grade instant coffee masked with heavy artificial chemical sprays. Today's premium flavoured coffees utilize high-grade Arabica bean bases, honey-processing terroir notes, and organic aromatics to create smooth, balanced dessert-like experiences.
      </p>
      <p>
        In this article, we rank the top flavoured instant coffees based on customer reviews. We explain the science of how flavoured coffee is made, detail correct water and milk temperatures, and help you find your next morning obsession.
      </p>
    </div>
  );
}

function SpecialtyCriteria() {
  return (
    <div className="blog-section" id="flavours">
      <span className="recipe-section__label">Rankings</span>
      <h2 className="recipe-section__title">Top Recommended Flavoured Coffees</h2>
      <div className="educational-grid">
        {FLAVOURS.map((f, idx) => (
          <div key={idx} className="edu-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <f.icon size={20} color={f.color} />
              <h5 style={{ margin: 0 }}>{f.name}</h5>
            </div>
            <p>{f.desc}</p>
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
      id="science"
      initial="hidden" whileInView="show"
      viewport={{ once: true, margin: '-60px' }}
      variants={stagger}
    >
      <motion.div variants={staggerItem} className="recipe-section__header">
        <span className="recipe-section__label">Manufacturing</span>
        <h2 className="recipe-section__title">How We Make Premium Flavoured Crystals</h2>
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
      <h2 className="recipe-section__title">Common Flavouring Pitfalls</h2>
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
        <span className="recipe-section__label">Fresh Flavours</span>
        <h2 className="recipe-section__title">Shop Flavoured Coffees</h2>
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
        <img src={heroBg} alt="The 6 Best Flavoured Coffees You Need to Try" className="recipe-hero-editorial__img" />
      </div>
    </section>
  );
}

export default function FlavouredCoffeesPage() {
  const [copied, setCopied] = useState(false);
  const url = 'https://spillthebeans.in/blog/best-flavoured-coffees-india-2025';
  const title = 'The 6 Best Flavoured Coffees You Need to Try in 2025';

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
        <title>The 6 Best Flavoured Coffees in India | Spill The Beans</title>
        <meta
          name="description"
          content="Explore the best flavoured instant coffees in India. Nutkhat Hazelnut, Vichaar Over Vanilla, and Mocha. Learn how flavoured coffee is made without sugar."
        />
        <meta property="og:type" content="article" />
        <meta property="og:title" content="The 6 Best Flavoured Coffees in India | Spill The Beans" />
        <meta property="og:description" content="Discover our most loved instant coffee flavours based on reviews. Learn details on processing and how to avoid boiling crystals." />
        <meta property="og:url" content="https://spillthebeans.in/blog/best-flavoured-coffees-india-2025" />
        <meta property="og:site_name" content="Spill The Beans" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="The 6 Best Flavoured Coffees in India | Spill The Beans" />
        <meta name="twitter:description" content="Discover our most loved instant coffee flavours based on reviews. Learn details on processing and how to avoid boiling crystals." />
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
