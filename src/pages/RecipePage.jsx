import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock, ChevronDown, ChevronUp, Share2, ArrowRight,
  Coffee, Zap, BookOpen, Star, CheckCircle, Check
} from 'lucide-react';
import PageWrapper from '../components/PageWrapper';
import './RecipePage.css';

// Assets
import heroBg from '../assets/proffee_hero_new.png';
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
  headline: 'Protein Coffee (Proffee): The Perfect Blend of Energy & Nutrition',
  description: 'Learn how to make a delicious protein coffee using Spill The Beans premium coffee.',
  author: { '@type': 'Person', name: 'Spill The Beans Team' },
  publisher: { '@type': 'Organization', name: 'Spill The Beans', logo: { '@type': 'ImageObject', url: 'https://spillthebeans.in/logo.png' } },
  datePublished: '2025-06-25',
  dateModified: '2026-06-26',
  mainEntityOfPage: 'https://spillthebeans.in/blog/protein-coffee-recipe',
};

const RECIPE_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'Recipe',
  name: 'Protein Coffee (Proffee)',
  description: 'A creamy, protein-packed coffee recipe that\'s perfect for busy mornings, workouts, or an afternoon energy boost.',
  prepTime: 'PT5M',
  cookTime: 'PT0M',
  totalTime: 'PT5M',
  recipeYield: '1 serving',
  recipeCategory: 'Beverage',
  recipeCuisine: 'Indian',
  keywords: 'protein coffee, proffee, coffee recipe, high protein, fitness coffee',
  nutrition: {
    '@type': 'NutritionInformation',
    calories: '240 calories',
    proteinContent: '28g',
    carbohydrateContent: '10g',
    fatContent: '5g',
  },
  recipeIngredient: [
    '1 cup freshly brewed Spill The Beans Coffee',
    '1 scoop vanilla or chocolate protein powder',
    '200ml milk (or almond/oat milk)',
    '4-5 ice cubes',
    '1 teaspoon honey (optional)',
    'Pinch of cinnamon (optional)',
  ],
  recipeInstructions: [
    { '@type': 'HowToStep', text: 'Brew one cup of Spill The Beans coffee.' },
    { '@type': 'HowToStep', text: 'Allow it to cool slightly.' },
    { '@type': 'HowToStep', text: 'Add protein powder and milk to a blender.' },
    { '@type': 'HowToStep', text: 'Pour in the coffee.' },
    { '@type': 'HowToStep', text: 'Blend until smooth.' },
    { '@type': 'HowToStep', text: 'Add ice.' },
    { '@type': 'HowToStep', text: 'Garnish with cinnamon.' },
    { '@type': 'HowToStep', text: 'Serve immediately.' },
  ],
};

const BREADCRUMB_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://spillthebeans.in/' },
    { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://spillthebeans.in/blog' },
    { '@type': 'ListItem', position: 3, name: 'Protein Coffee (Proffee) Recipe', item: 'https://spillthebeans.in/blog/protein-coffee-recipe' }
  ]
};



const INGREDIENTS = [
  { id: 1, text: '1 cup freshly brewed Spill The Beans Coffee', qty: '1 cup', emoji: '☕' },
  { id: 2, text: '1 scoop vanilla or chocolate protein powder', qty: '1 scoop', emoji: '💪' },
  { id: 3, text: '200ml milk (or almond/oat milk)', qty: '200 ml', emoji: '🥛' },
  { id: 4, text: '4–5 ice cubes', qty: '4–5', emoji: '🧊' },
  { id: 5, text: '1 teaspoon honey (optional)', qty: '1 tsp', emoji: '🍯' },
  { id: 6, text: 'Pinch of cinnamon (optional)', qty: 'pinch', emoji: '✨' },
];

const STEPS = [
  { step: 1, title: 'Brew Your Coffee', desc: 'Brew one cup of Spill The Beans coffee using your preferred method — French press, pour-over, or instant.', tip: 'Use slightly more coffee than usual for a bolder flavour.' },
  { step: 2, title: 'Let It Cool', desc: 'Allow the coffee to cool slightly — about 5 minutes at room temperature.', tip: 'For the iced version, use cold brew or chilled coffee directly.' },
  { step: 3, title: 'Add Protein & Milk', desc: 'Add your protein powder and milk to a blender. Seal firmly before proceeding.', tip: 'Almond milk creates a silkier texture; oat milk adds natural sweetness.' },
  { step: 4, title: 'Pour in the Coffee', desc: 'Pour your cooled coffee into the blender with the protein mixture.', tip: null },
  { step: 5, title: 'Blend Until Smooth', desc: 'Blend on high for 20–30 seconds until fully smooth and frothy. No lumps!', tip: 'A high-speed blender makes the protein foam incredibly creamy.' },
  { step: 6, title: 'Add Ice', desc: 'Drop in 4–5 ice cubes and give it one final quick blend or stir.', tip: null },
  { step: 7, title: 'Garnish with Cinnamon', desc: 'Dust a light pinch of cinnamon over the top for aroma and a subtle warm note.', tip: 'Chocolate protein pairs beautifully with a dark roast espresso.' },
  { step: 8, title: 'Serve Immediately', desc: 'Pour into a tall glass and enjoy right away while it\'s frothy and cold.', tip: 'Add a metal straw for the full café experience.' },
];



const COFFEE_PRODUCTS = [
  { name: 'Raat Ki Rani Espresso', desc: 'Bold dark roast — intense, smoky, perfectly bitter.', slug: 'raat-ki-rani-espresso-50g', img: productEspresso50g, tag: 'Best for Dark Roast' },
  { name: 'Nutkhat Hazelnut', desc: 'Rich hazelnut warmth — smooth, nutty, aromatic.', slug: 'nutkhat-hazelnut-50g', img: productHazelnut50g, tag: 'Best with Vanilla Protein' },
  { name: 'Vichaar Over Vanilla', desc: 'Silky vanilla — creamy, sweet, and utterly comforting.', slug: 'vichaar-over-vanilla-50g', img: productVanilla50g, tag: 'Most Popular' },
  { name: 'Mocha pe Chauka', desc: 'Mocha meets richness — chocolate and coffee in one sip.', slug: 'mocha-pe-chauka-50g', img: productMocha50g, tag: 'Best with Choco Protein' },
];

const ACCESSORIES = [
  { name: 'Spill The Beans Mug', desc: 'Perfect porcelain mug to keep your drinks hot or cold.', img: accessoryTumbler, slug: 'travel-tumbler' },
  { name: 'Premium Milk Frother', desc: 'Get café-quality foam in 15 seconds at home.', img: accessoryMilkFrother, slug: 'milk-frother' }
];

const FAQS = [
  { q: 'Can I drink protein coffee every day?', a: 'Yes! As long as it fits within your daily protein and caffeine limits, proffee can be a great daily ritual. Just be mindful of your total caffeine intake — 1–2 cups a day is generally fine for most adults.' },
  { q: 'Can I use plant-based protein?', a: 'Absolutely. Pea protein, hemp protein, and oat-based blends all work well. They blend smoothly and pair especially well with almond or oat milk for a fully plant-based proffee.' },
  { q: 'Which Spill The Beans coffee works best?', a: 'It depends on your protein flavour! Dark Roast Espresso pairs with chocolate protein, Vanilla flavour pairs with vanilla protein, and Hazelnut or Caramel work beautifully with any flavour. Experiment and find your favourite.' },
  { q: 'Can I make it hot instead of iced?', a: 'Yes! Skip the ice, reduce the milk slightly, and blend with warm coffee. You can also froth the milk separately using our milk frother and pour it over the coffee-protein mix for a hot latte version.' },
  { q: 'Can I prepare it in advance?', a: 'We recommend drinking it fresh for the best texture and flavour. However, you can pre-mix the protein powder and milk and store it in the fridge overnight, then blend with coffee in the morning for a 2-minute prep time.' },
];

const RELATED_RECIPES = [
  { title: 'Classic Iced Coffee at Home', time: '3 min', category: 'Brew Guides', color: '#581312', bg: 'rgba(88,19,18,0.07)', icon: Coffee, slug: 'how-to-make-the-perfect-iced-latte' },
  { title: 'French Press Brewing Guide', time: '5 min', category: 'Brew Guides', color: '#C27A0A', bg: 'rgba(194,122,10,0.1)', icon: Star, slug: 'guide-to-coffee-roast-levels' },
  { title: 'Arabica vs Robusta: What’s the Difference?', time: '4 min', category: 'Education', color: '#276044', bg: '#e8f5ee', icon: BookOpen, slug: 'what-is-specialty-coffee' },
  { title: 'How to Store Coffee Beans Correctly', time: '4 min', category: 'Tips', color: '#b52a2a', bg: '#fdecea', icon: Zap, slug: 'how-to-store-coffee-beans-correctly' }
];

// ── Animation Variants ─────────────────────────────────────────────────────


const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.09 } } };
const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
};

// ── New Reusable Sub-Components ────────────────────────────────────────────

// 1. Scroll Progress indicator
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

const TOC_ITEMS = [
  { id: 'intro', label: 'Introduction' },
  { id: 'what-is-proffee', label: 'What is Proffee?' },
  { id: 'benefits', label: 'Benefits' },
  { id: 'ingredients', label: 'Ingredients' },
  { id: 'recipe-steps', label: 'Step-by-Step' },
  { id: 'brewing-tips', label: 'Expert Tips' },
  { id: 'common-mistakes', label: 'Common Mistakes' },
  { id: 'recommended-products', label: 'Recommended Coffee' },
  { id: 'recommended-accessories', label: 'Accessories' },
  { id: 'faq', label: 'FAQ' }
];

// 2. Table of Contents
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

// 3. Author Card
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

// 4. Blog Introduction
function BlogIntroduction() {
  return (
    <div className="blog-section blog-intro" id="intro">
      <p className="lead-paragraph">
        If you've spent any time on fitness forums or social media recently, you've likely seen the term <strong>"Proffee"</strong> popping up. A portmanteau of protein and coffee, this beverage has quickly transitioned from a niche workout hack to a mainstream breakfast staple for busy professionals, athletes, and coffee aficionados alike.
      </p>
      <p>
        At its core, protein coffee is exactly what it sounds like: a premium brewed coffee combined with a scoop of high-quality protein powder. But it's far more than just a quick way to hit your daily macronutrient targets. Combining the natural caffeine of coffee with protein creates a synergistic effect that promotes sustained cognitive focus, wards off hunger spikes, and prevents the classic mid-morning caffeine crash.
      </p>
      <p>
        For professionals rushing through morning meetings or fitness enthusiasts looking for the ultimate pre-workout fuel, proffee offers a convenient, low-calorie, and delicious solution. In this guide, we'll walk you through how to brew the perfect cup, outline the science-backed benefits, and highlight expert tips to ensure your drink remains silky smooth every single time.
      </p>
    </div>
  );
}



// 6. What is Protein Coffee?
function WhatIsProffee() {
  return (
    <div className="blog-section" id="what-is-proffee">
      <span className="recipe-section__label">Education</span>
      <h2 className="recipe-section__title">What is Protein Coffee?</h2>
      <div className="editorial-content">
        <p>
          Protein coffee is the combination of cold-brew coffee, chilled espresso, or fresh drip coffee with protein powder and milk or dairy alternatives. Unlike standard sugary lattes, it is designed as a functional food that fuels your morning or workout routine while keeping your blood sugar stable.
        </p>
        <div className="educational-grid">
          <div className="edu-card">
            <h5>Why People Drink It</h5>
            <p>It delivers both caffeine-driven alertness and muscle-building protein in a single cup. It saves time in the morning and prevents mid-day sugar cravings.</p>
          </div>
          <div className="edu-card">
            <h5>Common Ingredients</h5>
            <p>Freshly brewed specialty coffee, whey or plant-based protein powder, ice cubes, and a splash of milk (almond, oat, or dairy) for texture.</p>
          </div>
          <div className="edu-card">
            <h5>Hot vs. Iced</h5>
            <p>While the cold iced version is the most popular, proffee can be served hot by frothing warmed milk with protein powder separately and gently pouring it over hot coffee.</p>
          </div>
          <div className="edu-card">
            <h5>Best Time to Drink It</h5>
            <p>Ideally as a morning meal replacement, a pre-workout booster (30-45 minutes before exercise), or a high-protein afternoon pick-me-up.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// 7. Benefits of Protein Coffee
function BenefitsOfProffee() {
  const benefits = [
    { title: 'Supports Daily Protein Intake', desc: 'Adding a single scoop of protein powder to your morning cup adds 20-30g of protein, helping you meet daily nutritional targets easily.' },
    { title: 'Sustained, Long-Lasting Energy', desc: 'The combination of dietary protein and slow-digesting fats slows the absorption of caffeine, providing a smooth energy curve without jitters.' },
    { title: 'Convenient Breakfast Option', desc: 'Perfect for busy mornings when you do not have time to cook. It takes only 5 minutes to blend, serve, and take on the go.' },
    { title: 'Ideal for Fitness Enthusiasts', desc: 'The caffeine enhances training focus and physical stamina, while protein supplies the amino acids needed for muscle repair post-exercise.' },
    { title: 'Promotes Satiety & Fullness', desc: 'Protein is highly satisfying. Drinking proffee in the morning helps regulate appetite and keeps you full longer, reducing snack cravings.' }
  ];

  return (
    <div className="blog-section" id="benefits">
      <span className="recipe-section__label">Benefits</span>
      <h2 className="recipe-section__title">Benefits of Protein Coffee</h2>
      <div className="benefits-list-modern">
        {benefits.map((b, i) => (
          <div key={i} className="benefits-row-modern">
            <div className="benefits-num-modern">0{i + 1}</div>
            <div className="benefits-text-modern">
              <h5>{b.title}</h5>
              <p>{b.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}



// 9. Expert Brewing Tips
function ExpertTips() {
  const tips = [
    { title: 'Brew it Strong', desc: 'Since protein powder and milk dilute the beverage, brew your Spill The Beans coffee slightly stronger than usual (using a 1:12 ratio) to maintain a bold coffee backbone.', emoji: '☕' },
    { title: 'Blend for Velvet Textures', desc: 'Always blend instead of stirring. Stirring protein powder directly into coffee will result in clumps. A quick 15-20 second pulse in a blender distributes the powder and forms a gorgeous, thick foam.', emoji: '🌪️' },
    { title: 'Chill Your Brew First', desc: 'Never blend hot coffee directly with ice and protein powder, as the heat can coagulate whey protein (forming clumps) and melt ice instantly, leading to a watery drink. Let the coffee cool to room temperature or chill it beforehand.', emoji: '🧊' },
    { title: 'Garnish with Warm Spices', desc: 'Dusting cinnamon or cocoa powder over the top doesn’t just look premium — the warm aroma complements both chocolate and vanilla protein, cutting down the artificial protein aftertaste.', emoji: '✨' }
  ];

  return (
    <div className="blog-section" id="brewing-tips">
      <span className="recipe-section__label">Pro Advice</span>
      <h2 className="recipe-section__title">Expert Brewing Tips</h2>
      <div className="tips-editorial-grid">
        {tips.map((tip, i) => (
          <div key={i} className="tip-callout-card">
            <div className="tip-callout-emoji">{tip.emoji}</div>
            <div className="tip-callout-content">
              <h5>{tip.title}</h5>
              <p>{tip.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// 10. Common Mistakes
function CommonMistakes() {
  const mistakes = [
    { title: 'Mixing with Boiling Coffee', desc: 'Whey protein coagulates and "cooks" above 70°C. If you dump it into freshly brewed boiling coffee, it will curdle, giving you a clumpy, unappetizing texture.', type: 'danger' },
    { title: 'Over-Sweetening', desc: 'Most commercial protein powders already contain heavy sweeteners (like sucralose or stevia). Adding sugar, caramel syrups, or honey without tasting first can make the proffee cloyingly sweet.', type: 'warning' },
    { title: 'Using Weak Instant Coffee', desc: 'If your coffee base is weak or watery, the strong, chalky taste of the protein powder will overpower it completely. Choose a dark roast or double the coffee dose.', type: 'warning' },
    { title: 'Shaking Instead of Blending', desc: 'Just shaking in a gym bottle leaves lumps of dry protein powder. A blender or a high-quality electric hand frother is mandatory for a uniform, café-style emulsion.', type: 'danger' }
  ];

  return (
    <div className="blog-section" id="common-mistakes">
      <span className="recipe-section__label">Caution</span>
      <h2 className="recipe-section__title">Common Mistakes to Avoid</h2>
      <div className="mistakes-grid">
        {mistakes.map((mistake, i) => (
          <div key={i} className={`mistake-card mistake-card--${mistake.type}`}>
            <div className="mistake-header">
              <span className="mistake-icon">{mistake.type === 'danger' ? '❌' : '⚠️'}</span>
              <h5>{mistake.title}</h5>
            </div>
            <p>{mistake.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}





// ── Reused Original Components (With Refinement) ──────────────────────────



// IngredientChecklist
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
      <p className="ingredient-list__hint">Tap an ingredient to mark it off</p>
    </motion.div>
  );
}

// RecipeSteps - Text-only layout without box cards
function RecipeSteps() {
  return (
    <motion.div
      className="recipe-section recipe-steps-text-only"
      id="recipe-steps"
      initial="hidden" whileInView="show"
      viewport={{ once: true, margin: '-60px' }}
      variants={stagger}
    >
      <motion.div variants={staggerItem} className="recipe-section__header">
        <span className="recipe-section__label">Instructions</span>
        <h2 className="recipe-section__title">Step-by-Step Method</h2>
      </motion.div>
      <div className="recipe-steps-text-flow">
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

// CoffeeRecommendations
function CoffeeRecommendations() {
  return (
    <motion.div
      className="recipe-section"
      initial="hidden" whileInView="show"
      viewport={{ once: true, margin: '-60px' }}
      variants={stagger}
    >
      <motion.div variants={staggerItem} className="recipe-section__header">
        <span className="recipe-section__label">Shop Ingredients</span>
        <h2 className="recipe-section__title">Recommended Coffees</h2>
        <p className="recipe-section__sub">Pick the perfect Spill The Beans coffee for your proffee</p>
      </motion.div>
      <div className="rec-coffee-grid">
        {COFFEE_PRODUCTS.map((p, i) => (
          <motion.div
            key={i}
            variants={staggerItem}
            className="rec-coffee-card"
            whileHover={{ y: -6, transition: { duration: 0.25 } }}
          >
            <div className="rec-coffee-card__img-wrap">
              <img src={p.img} alt={p.name} className="rec-coffee-card__img" loading="lazy" />
              <span className="rec-coffee-card__tag">{p.tag}</span>
            </div>
            <div className="rec-coffee-card__body">
              <h3 className="rec-coffee-card__name">{p.name}</h3>
              <p className="rec-coffee-card__desc">{p.desc}</p>
              <Link to={`/product/${p.slug}`} className="btn btn-primary btn-sm rec-coffee-card__btn" id={`recipe-product-${i}`}>
                View Product <ArrowRight size={14} />
              </Link>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

// AccessoriesSection
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

// RecipeFAQ
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

// RelatedRecipes
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

// RecipeNewsletterCTA
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

// Hero section incorporating requested metadata overlay
function RecipeHero() {
  return (
    <section className="recipe-hero-editorial">
      <div className="recipe-hero-editorial__img-wrap">
        <img src={heroBg} alt="Protein Coffee (Proffee)" className="recipe-hero-editorial__img" />
      </div>
    </section>
  );
}

// ── Default Page Export ──────────────────────────────────────────────────
export default function RecipePage() {
  const [copied, setCopied] = useState(false);
  const url = 'https://spillthebeans.in/blog/protein-coffee-recipe';
  const title = 'Protein Coffee (Proffee): The Perfect Blend of Energy & Nutrition';

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
        <title>Protein Coffee Recipe | Spill The Beans</title>
        <meta
          name="description"
          content="Learn how to make a delicious protein coffee using Spill The Beans premium coffee. A quick, high-protein recipe perfect for busy mornings and post-workout energy."
        />
        {/* Open Graph */}
        <meta property="og:type" content="article" />
        <meta property="og:title" content="Protein Coffee (Proffee) Recipe | Spill The Beans" />
        <meta property="og:description" content="A creamy, protein-packed coffee recipe — quick, energising, and absolutely delicious." />
        <meta property="og:url" content="https://spillthebeans.in/blog/protein-coffee-recipe" />
        <meta property="og:site_name" content="Spill The Beans" />
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Protein Coffee (Proffee) Recipe | Spill The Beans" />
        <meta name="twitter:description" content="A creamy, protein-packed coffee recipe — quick, energising, and absolutely delicious." />
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
          <WhatIsProffee />
          <BenefitsOfProffee />

          {/* Recipe Card (Ingredients) */}
          <div id="ingredients" className="scroll-margin-target">
            <IngredientChecklist />
          </div>

          <RecipeSteps />
          <ExpertTips />
          <CommonMistakes />

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
