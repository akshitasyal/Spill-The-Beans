import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock, Share2, ArrowRight, BookOpen, Star, CheckCircle, Check,
  Coffee, Zap, ChevronDown, ChevronUp
} from 'lucide-react';
import PageWrapper from '../components/PageWrapper';
import './RecipePage.css'; // Reusing the premium recipe magazine styling

// Assets
import heroBg from '../assets/iced_coffee_hero.png';
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
  headline: 'How to Make the Perfect Iced Latte at Home: Classic Iced Coffee Guide',
  description: 'Make cafe-quality iced lattes at home! Step-by-step recipe, ingredients, tips on frothing, and common mistakes to avoid.',
  author: { '@type': 'Person', name: 'Spill The Beans Team' },
  publisher: { '@type': 'Organization', name: 'Spill The Beans', logo: { '@type': 'ImageObject', url: 'https://spillthebeans.in/logo.png' } },
  datePublished: '2026-06-27',
  dateModified: '2026-06-27',
  mainEntityOfPage: 'https://spillthebeans.in/blog/how-to-make-the-perfect-iced-latte',
};

const RECIPE_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'Recipe',
  name: 'Perfect Iced Latte at Home',
  description: 'A smooth, refreshing, and creamy iced coffee recipe made with Spill The Beans flavoured coffee.',
  prepTime: 'PT3M',
  cookTime: 'PT0M',
  totalTime: 'PT3M',
  recipeYield: '1 serving',
  recipeCategory: 'Beverage',
  recipeCuisine: 'Global',
  recipeIngredient: [
    '1.5 teaspoons Spill The Beans coffee (Hazelnut or Vanilla)',
    '1.5 teaspoons warm water',
    '200ml cold milk (dairy or oat milk)',
    '4-5 large ice cubes',
    '1 teaspoon sugar or caramel syrup (optional)'
  ],
  recipeInstructions: [
    { '@type': 'HowToStep', text: 'Dissolve the instant coffee in warm water.' },
    { '@type': 'HowToStep', text: 'Add ice cubes to a tall serving glass.' },
    { '@type': 'HowToStep', text: 'Pour the cold milk over the ice.' },
    { '@type': 'HowToStep', text: 'Pour the dissolved coffee mixture over the milk.' },
    { '@type': 'HowToStep', text: 'Sweeten, stir, and serve immediately.' }
  ]
};

const BREADCRUMB_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://spillthebeans.in/' },
    { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://spillthebeans.in/blog' },
    { '@type': 'ListItem', position: 3, name: 'How to Make the Perfect Iced Latte at Home', item: 'https://spillthebeans.in/blog/how-to-make-the-perfect-iced-latte' }
  ]
};

// ── Data ───────────────────────────────────────────────────────────────────
const INGREDIENTS = [
  { id: 1, text: '1.5 tsp Spill The Beans coffee (Hazelnut, Vanilla, or Espresso)', qty: '1.5 tsp', emoji: '☕' },
  { id: 2, text: '1.5 tsp warm water (just enough to dissolve coffee)', qty: '1.5 tsp', emoji: '💧' },
  { id: 3, text: '200ml cold milk (oat, almond, or full-cream dairy milk)', qty: '200 ml', emoji: '🥛' },
  { id: 4, text: '4–5 large ice cubes', qty: '4–5 pcs', emoji: '🧊' },
  { id: 5, text: '1 tsp sugar, honey, or caramel syrup (optional)', qty: '1 tsp', emoji: '🍯' }
];

const STEPS = [
  { step: 1, title: 'Dissolve the Coffee', desc: 'Add 1.5 teaspoons of Spill The Beans instant coffee to a small cup. Pour in 1.5 teaspoons of warm water and stir vigorously until smooth and completely dissolved. Do not use boiling water as it burns the coffee notes.', tip: 'Dissolving the coffee first prevents chalky instant granules at the bottom of the glass.' },
  { step: 2, title: 'Prepare the Glass with Ice', desc: 'Fill a tall café glass with 4–5 large ice cubes. Clean, solid ice cubes melt slower, preserving the coffee concentration for longer.', tip: 'Using larger ice cubes keeps the drink chilled without diluting it too quickly.' },
  { step: 3, title: 'Pour the Cold Milk', desc: 'Pour 200ml of cold milk over the ice. For a premium café look, leave a little gap at the top of the glass to pour the coffee layer.', tip: 'Froth the milk for 15 seconds with an electric milk frother beforehand for a velvety texture.' },
  { step: 4, title: 'Add the Coffee Concentration', desc: 'Slowly pour the dissolved coffee mixture over the milk and ice. Watch as it forms gorgeous dark brown swirls merging with the cold milk.', tip: 'Pouring it gently over an ice cube helps create clean visual layers.' },
  { step: 5, title: 'Sweeten, Stir, and Serve', desc: 'Add sweetener to taste (sugar, honey, or a splash of hazelnut syrup). Give it a good stir to blend the layers and enjoy immediately!', tip: 'Serve with a reusable straw for the complete café experience.' }
];

const MISTAKES = [
  { title: 'Using Too Much Hot Water', desc: 'If you dissolve the coffee in a large cup of hot water, it will melt the ice cubes instantly, resulting in a watered-down, tepid beverage.', type: 'danger' },
  { title: 'Using Weak Instant Coffee', desc: 'An iced latte requires a robust coffee base to stand up to the cold milk and melting ice. Double the instant coffee dose for a bolder cup.', type: 'warning' },
  { title: 'Adding Ice Last', desc: 'Dropping ice cubes into a full glass of milk and coffee causes splashes and messes up the visual swirling layers.', type: 'warning' },
  { title: 'Forgetting to Dissolve Coffee', desc: 'Dumping instant coffee crystals straight into cold milk makes them clump together, leaving you with dry granules and a poorly mixed drink.', type: 'danger' }
];

const FAQS = [
  { q: 'Can I use cold brew instead of instant coffee?', a: 'Absolutely! Replace the instant coffee mixture with 80-100ml of fresh cold brew concentrate. Pour it directly over the milk and ice.' },
  { q: 'What type of milk is recommended?', a: 'Full-fat dairy milk yields the creamiest flavor, but oat milk (especially barista blends) is a fantastic dairy-free option that froths beautifully.' },
  { q: 'How do I get café-quality foam at home?', a: 'Froth cold milk with our Premium Milk Frother for 10-15 seconds before pouring it over the ice. It creates a rich, micro-foam layer on top.' },
  { q: 'Can I prepare iced latte in advance?', a: 'You can pre-mix the dissolved coffee, milk, and sweetener, and keep it in the fridge. However, only add ice cubes right before serving to avoid dilution.' }
];

const COFFEE_PRODUCTS = [
  { name: 'Nutkhat Hazelnut', desc: 'Rich hazelnut warmth — smooth, nutty, aromatic.', slug: 'nutkhat-hazelnut-50g', img: productHazelnut50g, tag: 'Most Popular' },
  { name: 'Vichaar Over Vanilla', desc: 'Silky vanilla — creamy, sweet, and comforting.', slug: 'vichaar-over-vanilla-50g', img: productVanilla50g, tag: 'Cafe Classic' },
  { name: 'Raat Ki Rani Espresso', desc: 'Bold dark roast — intense, smoky, and strong.', slug: 'raat-ki-rani-espresso-50g', img: productEspresso50g, tag: 'Best for Strong Coffee' },
  { name: 'Mocha pe Chauka', desc: 'Rich chocolate and coffee — double the indulgence.', slug: 'mocha-pe-chauka-50g', img: productMocha50g, tag: 'Choco Latte' },
];

const ACCESSORIES = [
  { name: 'Premium Milk Frother', desc: 'Get café-quality foam in 15 seconds at home.', img: accessoryMilkFrother, slug: 'milk-frother' },
  { name: 'Spill The Beans Mug', desc: 'Perfect porcelain mug to keep your drinks hot or cold.', img: accessoryTumbler, slug: 'travel-tumbler' }
];

const RELATED_RECIPES = [
  { title: 'Protein Coffee (Proffee) Recipe', time: '3 min', category: 'Recipes', color: '#581312', bg: 'rgba(88,19,18,0.07)', icon: Coffee, slug: 'protein-coffee-recipe' },
  { title: 'How to Store Coffee Beans Correctly', time: '4 min', category: 'Tips', color: '#b52a2a', bg: '#fdecea', icon: Zap, slug: 'how-to-store-coffee-beans-correctly' },
  { title: 'French Press Brewing Guide', time: '5 min', category: 'Brew Guides', color: '#C27A0A', bg: 'rgba(194,122,10,0.1)', icon: Star, slug: 'guide-to-coffee-roast-levels' },
  { title: 'Arabica vs Robusta: What’s the Difference?', time: '4 min', category: 'Education', color: '#276044', bg: '#e8f5ee', icon: BookOpen, slug: 'what-is-specialty-coffee' }
];

const TOC_ITEMS = [
  { id: 'intro', label: 'Introduction' },
  { id: 'ingredients', label: 'Ingredients' },
  { id: 'recipe-steps', label: 'Step-by-Step' },
  { id: 'common-mistakes', label: 'Mistakes to Avoid' },
  { id: 'recommended-products', label: 'Recommended Coffee' },
  { id: 'recommended-accessories', label: 'Accessories' },
  { id: 'faq', label: 'FAQ' }
];

// Animation variants
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0 } } };
const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.15, ease: [0.22, 1, 0.36, 1] } },
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
        As soon as the summer temperatures begin to rise, hot coffee drinks quickly lose their morning appeal. Enter the classic iced latte: a refreshing, velvety combination of rich espresso, chilled milk, and clean ice cubes that keeps you energised throughout the warmest days.
      </p>
      <p>
        While buying iced lattes from café chains daily is convenient, it can easily burn a hole in your pocket. The good news? You do not need a multi-thousand rupee espresso machine to enjoy a premium, layered iced latte in your own kitchen.
      </p>
      <p>
        By using a few professional tricks—such as frothing cold milk, dissolving instant coffee correctly, and selecting the right coffee roast—you can make café-quality iced coffee in just under 3 minutes. Here is the ultimate step-by-step guide to mastering the perfect home-brewed iced latte.
      </p>
    </div>
  );
}

function IngredientChecklist() {
  const [checked, setChecked] = useState({});
  const toggle = (id) => setChecked(prev => ({ ...prev, [id]: !prev[id] }));

  return (
    <motion.div
      className="recipe-section"
      initial="hidden" whileInView="show"
      viewport={{ once: true, margin: '-60px' }}
      variants={stagger}
    >
      <motion.div variants={staggerItem} className="recipe-section__header">
        <span className="recipe-section__label">Ingredients</span>
        <h2 className="recipe-section__title">What You'll Need</h2>
        <p className="recipe-section__sub">Serves 1 · All ingredients measured per serving</p>
      </motion.div>
      <div className="ingredient-list">
        {INGREDIENTS.map((ing) => (
          <motion.div
            key={ing.id}
            variants={staggerItem}
            className={`ingredient-item ${checked[ing.id] ? 'ingredient-item--checked' : ''}`}
            onClick={() => toggle(ing.id)}
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="ingredient-item__check">
              {checked[ing.id] && <CheckCircle size={14} />}
            </div>
            <span className="ingredient-item__emoji">{ing.emoji}</span>
            <div className="ingredient-item__body">
              <span className="ingredient-item__text">{ing.text}</span>
            </div>
            <span className="ingredient-item__qty">{ing.qty}</span>
          </motion.div>
        ))}
      </div>
      <p className="ingredient-list__hint">Tip: Tap ingredients to check them off as you prepare your drink.</p>
    </motion.div>
  );
}

function RecipeSteps() {
  return (
    <motion.div
      className="recipe-section"
      id="recipe-steps"
      initial="hidden" whileInView="show"
      viewport={{ once: true, margin: '-60px' }}
      variants={stagger}
    >
      <motion.div variants={staggerItem} className="recipe-section__header">
        <span className="recipe-section__label">Method</span>
        <h2 className="recipe-section__title">Step-by-Step Instructions</h2>
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
        <span className="recipe-section__label">Recommended Flavours</span>
        <h2 className="recipe-section__title">Choose Your Coffee Flavor</h2>
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
        <img src={heroBg} alt="How to Make Iced Latte at Home" className="recipe-hero-editorial__img" />
      </div>
    </section>
  );
}

// ── Default Page Export ──────────────────────────────────────────────────
export default function IcedCoffeePage() {
  const [copied, setCopied] = useState(false);
  const url = 'https://spillthebeans.in/blog/how-to-make-the-perfect-iced-latte';
  const title = 'How to Make the Perfect Iced Latte at Home: Classic Iced Coffee Guide';

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
        <title>How to Make the Perfect Iced Latte at Home | Spill The Beans</title>
        <meta
          name="description"
          content="Learn how to make the perfect iced latte at home using instant flavoured coffee. Step-by-step guide, frothing tips, and mistakes to avoid."
        />
        {/* Open Graph */}
        <meta property="og:type" content="article" />
        <meta property="og:title" content="How to Make the Perfect Iced Latte at Home | Spill The Beans" />
        <meta property="og:description" content="Café-quality iced latte in 3 minutes! Step-by-step recipe, frothing tips, and mistakes to avoid." />
        <meta property="og:url" content="https://spillthebeans.in/blog/how-to-make-the-perfect-iced-latte" />
        <meta property="og:site_name" content="Spill The Beans" />
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="How to Make the Perfect Iced Latte at Home | Spill The Beans" />
        <meta name="twitter:description" content="Café-quality iced latte in 3 minutes! Step-by-step recipe, frothing tips, and mistakes to avoid." />
        {/* JSON-LD Schemas */}
        <script type="application/ld+json">{JSON.stringify(ARTICLE_SCHEMA)}</script>
        <script type="application/ld+json">{JSON.stringify(RECIPE_SCHEMA)}</script>
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
          <IngredientChecklist />
          <RecipeSteps />
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
