import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Clock, ArrowRight, TrendingUp, BookOpen, Coffee, Leaf, Star } from 'lucide-react';
import PageWrapper from '../components/PageWrapper';
import NewsletterSection from '../components/NewsletterSection';
import './Blog.css';
import proffeeHero from '../assets/proffee_hero.png';
import storeBeansHero from '../assets/store_beans_hero.png';
import icedCoffeeHero from '../assets/iced_coffee_hero.png';
import specialtyCoffeeHero from '../assets/specialty_coffee_hero.png';
import directTradeHero from '../assets/direct_trade_hero.png';
import roastLevelsHero from '../assets/roast_levels_hero.png';
import flavouredCoffeesHero from '../assets/flavoured_coffees_hero.png';
import coffeeProductivityHero from '../assets/coffee_productivity_hero.png';
import nilgiriHillsHero from '../assets/nilgiri_hills_hero.png';

// ── Blog Data ──────────────────────────────────────────────────────────────
const BLOGS = [
  {
    id: 0,
    slug: 'protein-coffee-recipe',
    title: 'Protein Coffee (Proffee): The Perfect Blend of Energy & Nutrition',
    excerpt: 'A creamy, protein-packed coffee recipe that\'s perfect for busy mornings, workouts, or an afternoon energy boost. Ready in just 5 minutes.',
    category: 'Recipes',
    readTime: '3 min',
    date: 'June 25, 2025',
    featured: true,
    tags: ['Recipe', 'Protein', 'High-Protein', 'Fitness'],
    icon: Coffee,
    image: proffeeHero,
    color: '#581312',
    bg: 'rgba(88,19,18,0.08)',
  },
  {
    id: 1,
    slug: 'what-is-specialty-coffee',
    title: 'What Is Specialty Coffee — And Why Should You Care?',
    excerpt: 'Not all coffee is created equal. We break down what the SCA cupping scale means, what makes a coffee "specialty grade", and why it matters for your cup.',
    category: 'Education',
    readTime: '5 min',
    date: 'June 18, 2025',
    featured: true,
    tags: ['Specialty', 'SCA', 'Grading'],
    icon: BookOpen,
    image: specialtyCoffeeHero,
    color: '#276044',
    bg: '#e8f5ee',
  },

  {
    id: 3,
    slug: 'how-to-make-the-perfect-iced-latte',
    title: 'How to Make the Perfect Iced Latte at Home',
    excerpt: 'No espresso machine required. With our flavoured instant coffees, a frother, and good cold milk, you can pull café-quality iced lattes every single morning.',
    category: 'Brew Guide',
    readTime: '4 min',
    date: 'June 4, 2025',
    featured: false,
    tags: ['Brew Guide', 'Iced Latte', 'Tips'],
    icon: Coffee,
    image: icedCoffeeHero,
    color: '#581312',
    bg: 'rgba(88,19,18,0.08)',
  },
  {
    id: 4,
    slug: 'why-we-only-source-direct-trade',
    title: 'Why Direct Trade Is the Only Ethical Way to Buy Coffee',
    excerpt: 'The commodity coffee market keeps farmers trapped in poverty. Direct trade changes the equation. We explain how, and why it\'s core to everything we do at Spill The Beans.',
    category: 'Sustainability',
    readTime: '6 min',
    date: 'May 27, 2025',
    featured: false,
    tags: ['Sustainability', 'Direct Trade', 'Ethics'],
    icon: Leaf,
    image: directTradeHero,
    color: '#276044',
    bg: '#e8f5ee',
  },
  {
    id: 5,
    slug: 'guide-to-coffee-roast-levels',
    title: 'Light, Medium, Dark: A Plain-English Guide to Roast Levels',
    excerpt: 'Confused by roast levels? You\'re not alone. We decode the roast spectrum — what changes in the bean, what you taste, and which roast matches your lifestyle.',
    category: 'Education',
    readTime: '5 min',
    date: 'May 19, 2025',
    featured: false,
    tags: ['Roast', 'Education', 'Beginner'],
    icon: BookOpen,
    image: roastLevelsHero,
    color: '#1a2a6c',
    bg: 'rgba(26,42,108,0.08)',
  },
  {
    id: 6,
    slug: 'best-flavoured-coffees-india-2025',
    title: 'The 6 Best Flavoured Coffees You Need to Try in 2025',
    excerpt: 'From Caramel ka Kamal to Nawabi Pistachio — we\'ve ranked our most loved flavours based on over 50,000 customer reviews. Find your next obsession here.',
    category: 'Reviews',
    readTime: '8 min',
    date: 'May 12, 2025',
    featured: true,
    tags: ['Reviews', 'Bestsellers', 'Ranking'],
    icon: Star,
    image: flavouredCoffeesHero,
    color: '#b52a2a',
    bg: '#fdecea',
  },
  {
    id: 7,
    slug: 'coffee-and-productivity',
    title: 'Coffee and Productivity: The Science Behind Your Morning Ritual',
    excerpt: 'Is the productivity boost real or placebo? We dig into the neuroscience of caffeine, adenosine receptors, and why timing your coffee matters more than you think.',
    category: 'Lifestyle',
    readTime: '6 min',
    date: 'May 5, 2025',
    featured: false,
    tags: ['Science', 'Productivity', 'Caffeine'],
    icon: TrendingUp,
    image: coffeeProductivityHero,
    color: '#C27A0A',
    bg: 'rgba(194,122,10,0.1)',
  },
  {
    id: 8,
    slug: 'nilgiri-hills-coffee-guide',
    title: 'Nilgiri Hills: India\'s Most Underrated Coffee Origin',
    excerpt: 'High altitude. Cool mists. Wine-like acidity. The Nilgiri Hills produce some of India\'s most vibrant and complex coffees — and most people have never heard of them.',
    category: 'Origins',
    readTime: '5 min',
    date: 'Apr 28, 2025',
    featured: false,
    tags: ['Nilgiri', 'India', 'Origin'],
    icon: Leaf,
    image: nilgiriHillsHero,
    color: '#C27A0A',
    bg: 'rgba(194,122,10,0.1)',
  },

  {
    id: 10,
    slug: 'how-to-store-coffee-beans-correctly',
    title: 'How to Store Coffee Beans Correctly for Ultimate Freshness',
    excerpt: 'Keep your coffee tasting café-quality! Learn the science of storing coffee beans, the four enemies of freshness, and the freezer debate.',
    category: 'Brew Guide',
    readTime: '4 min',
    date: 'June 26, 2026',
    featured: true,
    tags: ['Storage', 'Freshness', 'Guide', 'Tips'],
    icon: Coffee,
    image: storeBeansHero,
    color: '#b52a2a',
    bg: '#fdecea',
  },
];

const CATEGORIES = ['All', 'Recipes', 'Education', 'Origins', 'Brew Guide', 'Sustainability', 'Reviews', 'Lifestyle'];

const FEATURED = BLOGS.filter(b => b.featured);

// ── Blog Card ──────────────────────────────────────────────────────────────
function BlogCard({ blog, delay = 0, visible }) {
  return (
    <Link
      to={`/blog/${blog.slug}`}
      id={`blog-card-${blog.id}`}
      className={`blog-card ${visible ? 'bl-anim-in' : ''}`}
      style={{ animationDelay: `${delay}s` }}
    >
      <div
        className="blog-card__thumb"
        style={{ background: blog.image ? 'transparent' : blog.bg }}
      >
        {blog.image ? (
          <img src={blog.image} alt={blog.title} className="blog-card__thumb-img" />
        ) : (
          <div className="blog-card__thumb-icon" style={{ color: blog.color }}>
            <blog.icon size={36} strokeWidth={1.5} />
          </div>
        )}
        <span
          className="blog-card__category-badge"
          style={{ background: blog.bg, color: blog.color, border: `1px solid ${blog.color}22` }}
        >
          {blog.category}
        </span>
      </div>
      <div className="blog-card__body">
        <div className="blog-card__meta">
          <span className="blog-card__date">
            <Clock size={12} /> {blog.readTime} read
          </span>
          <span className="blog-card__dot">·</span>
          <span className="blog-card__date">{blog.date}</span>
        </div>
        <h3 className="blog-card__title">{blog.title}</h3>
        <p className="blog-card__excerpt">{blog.excerpt}</p>
        <span className="blog-card__read-more">
          Read Article <ArrowRight size={14} />
        </span>
      </div>
    </Link>
  );
}

// ── Featured Card ──────────────────────────────────────────────────────────
function FeaturedCard({ blog, delay = 0, visible }) {
  return (
    <Link
      to={`/blog/${blog.slug}`}
      id={`featured-blog-${blog.id}`}
      className={`featured-blog-card ${visible ? 'bl-anim-in' : ''}`}
      style={{ animationDelay: `${delay}s` }}
    >
      <div className="featured-blog-card__thumb" style={{ background: blog.image ? 'transparent' : blog.bg }}>
        {blog.image ? (
          <img src={blog.image} alt={blog.title} className="featured-blog-card__thumb-img" />
        ) : (
          <div className="featured-blog-card__thumb-icon" style={{ color: blog.color }}>
            <blog.icon size={48} strokeWidth={1.3} />
          </div>
        )}
        <span
          className="featured-blog-card__badge"
          style={{ background: blog.color }}
        >
          {blog.category}
        </span>
      </div>
      <div className="featured-blog-card__body">
        <div className="blog-card__meta">
          <span className="blog-card__date"><Clock size={12} /> {blog.readTime} read</span>
          <span className="blog-card__dot">·</span>
          <span className="blog-card__date">{blog.date}</span>
        </div>
        <h3 className="featured-blog-card__title">{blog.title}</h3>
        <p className="featured-blog-card__excerpt">{blog.excerpt}</p>
        <span className="blog-card__read-more">
          Read Article <ArrowRight size={14} />
        </span>
      </div>
    </Link>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────
export default function Blog() {
  const [activeCategory, setActiveCategory] = useState('All');

  const featuredRef = useRef(null);
  const gridRef = useRef(null);
  const [featuredVisible, setFeaturedVisible] = useState(false);
  const [gridVisible, setGridVisible] = useState(false);

  useEffect(() => {
    const observe = (ref, setter, threshold = 0.05) => {
      if (!ref.current) return;
      // Pre-check: already in viewport?
      const rect = ref.current.getBoundingClientRect();
      if (rect.top < window.innerHeight) { setter(true); return; }
      const obs = new IntersectionObserver(
        ([e]) => { if (e.isIntersecting) { setter(true); obs.disconnect(); } },
        { threshold, rootMargin: '0px 0px 60px 0px' }
      );
      obs.observe(ref.current);
      return obs;
    };
    // Small delay so DOM is painted before checking
    const t2 = setTimeout(() => {
      const o1 = observe(featuredRef, setFeaturedVisible);
      const o2 = observe(gridRef, setGridVisible, 0.05);
      return () => { o1?.disconnect(); o2?.disconnect(); };
    }, 150);
    return () => { clearTimeout(t2); };
  }, []);

  const filtered = BLOGS.filter(b => {
    return activeCategory === 'All' || b.category === activeCategory;
  });

  return (
    <PageWrapper className="blog-page">
      <Helmet>
        <title>Coffee Blog | Spill The Beans</title>
        <meta name="description" content="Explore coffee origins, brew guides, sustainability stories, and expert tips from the Spill The Beans team." />
      </Helmet>

      {/* ── FEATURED ────────────────────────────────────────────── */}
      {activeCategory === 'All' && (
        <section className="section blog-featured" ref={featuredRef}>
          <div className="container">
            <div className={`blog-featured__header ${featuredVisible ? 'bl-anim-in' : ''}`}>
              <span className="section-label">Editor's Picks</span>
              <h2 className="heading-2">Featured Articles</h2>
            </div>
            <div className="blog-featured__grid">
              {FEATURED.slice(0, 3).map((b, i) => (
                <FeaturedCard key={b.id} blog={b} delay={i * 0.1} visible={featuredVisible} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── ALL POSTS ───────────────────────────────────────────── */}
      <section className="section blog-grid-section" ref={gridRef}>
        <div className="container">
          <div className={`blog-grid-section__header ${gridVisible ? 'bl-anim-in' : ''}`}>
            <h2 className="heading-2">
              All Articles
            </h2>
            {/* Category filters */}
            <div className="blog-categories" role="list" aria-label="Filter by category">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  id={`blog-cat-${cat.toLowerCase().replace(/\s+/g, '-')}`}
                  className={`blog-category-btn ${activeCategory === cat ? 'blog-category-btn--active' : ''}`}
                  onClick={() => setActiveCategory(cat)}
                  aria-pressed={activeCategory === cat}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="blog-empty">
              <span className="blog-empty__icon">☕</span>
              <p className="blog-empty__text">No articles found.</p>
              <button
                className="btn btn-outline"
                onClick={() => { setActiveCategory('All'); }}
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="blog-grid">
              {filtered.map((b, i) => (
                <BlogCard key={b.id} blog={b} delay={i * 0.06} visible={gridVisible} />
              ))}
            </div>
          )}
        </div>
      </section>

      <NewsletterSection />
    </PageWrapper>
  );
}
