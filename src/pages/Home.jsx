import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowRight, ChevronDown, Star, Sprout, ChevronLeft, ChevronRight, Volume2, VolumeX } from 'lucide-react';
import { motion } from 'framer-motion';
import { heroBg, products } from '../data/products';
import ProductCard from '../components/ProductCard';
import NewsletterSection from '../components/NewsletterSection';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import PageWrapper from '../components/PageWrapper';
import './Home.css';

import slideIcedTea from '../assets/slide_iced_tea.png';
import slideSachets from '../assets/slide_sachets.png';
import slideHotChocolate from '../assets/slide_hot_chocolate.png';
import slideFrother from '../assets/slide_frother.png';
import brandVideo from '../assets/brand_video.mp4';

const HERO_SLIDES = [
  slideIcedTea,
  slideSachets,
  slideHotChocolate,
  slideFrother
];

// Custom silhouette map of India icon
const IndiaIcon = ({ size = 20, color = "#581312" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="currentColor"
    style={{ display: 'inline-block', verticalAlign: 'middle' }}
  >
    <path d="M16 2 l1 2 l1.5 1 l-1 1 l.5 2 l1.5 1 l2 1 l1.5 .5 l1 .5 l-.5 1 l-1.5 .5 l-.5 1.5 l-1 .5 l.5 1.5 l-1 .5 l-.5 1 l-1 .5 l-1 2.5 l-1 2.5 l-.5 2 l-.5 2 l-.5 1.5 h-.2 l-.3 -1.5 l-.5 -2 l-.5 -1.5 l-.5 -2.5 l-.5 -1.5 l-.5 -1.5 l-1 -1.5 l-.5 -1.5 l-1 -1 l-1 -.5 l-2.5 -.5 l-.5 -1 l-1.5 -.5 l.5 -1 l1 0 l1 .5 l1 .5 l0 -2 l1 -1.5 l.5 -1.5 l.5 -1.5 l.5 -1 l1.5 -1 Z" />
  </svg>
);

// Custom coffee beans icon
const CoffeeBeansIcon = ({ size = 20, color = "#581312" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="currentColor"
    style={{ display: 'inline-block', verticalAlign: 'middle' }}
  >
    <path d="M39 36.5c-3.4-9.3-14.1-15.7-24.1-14.3S-.3 32.3 3 41.5s14.1 15.7 24.1 14.3S42.4 45.7 39 36.5zm-4.1 9.3l-.9.2a2 2 0 0 1-1.8-1.1c-1.6-3.4-4.4-4.7-10.3-4.9s-9.4-1.2-13.5-6.8a2 2 0 0 1 3.2-2.4c3.2 4.2 4.7 5 10.5 5.2s10.8 1.1 13.7 7.1a2 2 0 0 1-.9 2.7z"/>
    <path d="M49.1 8.2C40.3 7 30.8 11.9 26.4 19.5a28.2 28.2 0 0 1 7.5 4 21.3 21.3 0 0 1 8-1.5c5.7-.2 7.3-.9 10.5-5.2a2 2 0 0 1 3.2 2.4c-4.1 5.6-7.1 6.6-13.5 6.8a22.4 22.4 0 0 0-4.7.6 24.5 24.5 0 0 1 5.4 8.5 20.4 20.4 0 0 1 1.2 6.4c7.5-1.5 14.4-6.9 17-14 3.3-9.2-2-17.9-11.9-19.3z"/>
  </svg>
);

// Selected products for the horizontal Explore slider
const EXPLORE_PRODUCT_IDS = [1, 114, 5, 112, 10, 113, 12, 3, 6, 7];

// Bestselling combo product IDs
const BESTSELLING_COMBO_IDS = [44, 45, 40];

const TESTIMONIALS = [
  { id: 1, name: 'Priya R.', location: 'Bengaluru', rating: 5, text: 'The Mocha pe Chauka is absolutely stunning. I\'ve tried many chocolate coffees, but the rich Belgian-inspired cocoa notes blended with smooth Arabica hits different. It\'s my daily chocolate-coffee escape!', product: 'Mocha pe Chauka' },
  { id: 2, name: 'Arjun M.', location: 'Mumbai', rating: 5, text: 'Gifted the Assorted 30-Pack to my sister and she loves it. 10 bold flavours like Caramel, Hazelnut, and Chocolate Raspberry in one premium box with no added sugar. Outstanding concept!', product: 'Assorted 30-Pack' },
  { id: 3, name: 'Shreya K.', location: 'Delhi', rating: 5, text: 'नटखट Hazelnut is my morning ritual now. The perfect balance of coffee and warm toasted hazelnut aroma. It dissolves instantly in cold milk for the ultimate iced latte.', product: 'नटखट Hazelnut' },
  { id: 4, name: 'Rohan P.', location: 'Pune', rating: 5, text: 'Raat ki Rani Espresso completely changed my late-night coding sessions. Bold, intense dark roast with an exceptionally smooth finish. A true savior for developers!', product: 'Raat ki Rani Espresso' },
  { id: 5, name: 'Ananya S.', location: 'Chennai', rating: 5, text: 'I tried the Guava Chilli Iced Tea and I\'m obsessed! The tropical sweetness of guava with a spicy kick of chilli is so refreshing. Best part? Low calorie and no refined sugar.', product: 'Guava Chilli Iced Tea' },
  { id: 6, name: 'Kiran J.', location: 'Hyderabad', rating: 5, text: 'Fast delivery, gorgeous packaging, and delicious variety. The Bestsellers 10-Pack let me try their top 5 flavours including Vanilla and Caramel. Spill The Beans has set a new standard!', product: 'Bestsellers 10-Pack' },
];


export default function Home() {
  const testimonialsRef = useScrollAnimation();
  const trustRef = useScrollAnimation();
  const exploreRef = useScrollAnimation();
  const sliderRef = useRef(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [heroLoaded, setHeroLoaded] = useState(false);
  const videoRef = useRef(null);
  const [isMuted, setIsMuted] = useState(true);

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  // Retrieve products in exact ID order
  const exploreProducts = EXPLORE_PRODUCT_IDS.map(id => 
    products.find(p => p.id === id)
  ).filter(Boolean);

  const handleScroll = () => {
    if (!sliderRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
    const totalScroll = scrollWidth - clientWidth;
    if (totalScroll <= 0) {
      setScrollProgress(0);
    } else {
      setScrollProgress((scrollLeft / totalScroll) * 100);
    }
  };

  const handleArrowClick = (direction) => {
    if (!sliderRef.current) return;
    const slider = sliderRef.current;
    const firstItem = slider.querySelector('.explore-section__slider-item');
    if (!firstItem) return;
    
    const itemWidth = firstItem.offsetWidth;
    const style = window.getComputedStyle(slider);
    const gap = parseInt(style.gap) || 24;
    const cardStep = itemWidth + gap;
    
    // Determine how many cards are visible and scroll by that step
    const visibleCards = Math.max(1, Math.floor(slider.clientWidth / cardStep));
    const scrollAmount = visibleCards * cardStep;
    
    const currentScroll = slider.scrollLeft;
    let targetScroll;
    
    if (direction === 'left') {
      targetScroll = Math.ceil((currentScroll - scrollAmount) / cardStep) * cardStep;
      if (targetScroll >= currentScroll && currentScroll > 0) {
        targetScroll = (Math.floor(currentScroll / cardStep) - 1) * cardStep;
      }
    } else {
      targetScroll = Math.floor((currentScroll + scrollAmount) / cardStep) * cardStep;
      if (targetScroll <= currentScroll) {
        targetScroll = (Math.ceil(currentScroll / cardStep) + 1) * cardStep;
      }
    }
    
    const maxScroll = slider.scrollWidth - slider.clientWidth;
    targetScroll = Math.max(0, Math.min(targetScroll, maxScroll));
    
    slider.scrollTo({
      left: targetScroll,
      behavior: 'smooth'
    });
  };
  const [currentSlide, setCurrentSlide] = useState(0);
  const [progressActive, setProgressActive] = useState(false);

  // Preload all slideshow images
  useEffect(() => {
    HERO_SLIDES.forEach(src => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  // Timer loop for slideshow (5 seconds visible per slide)
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentSlide(prev => (prev + 1) % HERO_SLIDES.length);
    }, 5000);
    return () => clearTimeout(timer);
  }, [currentSlide]);

  // Sync progress bar animation state (resets on slide change)
  useEffect(() => {
    setProgressActive(false);
    const raf = requestAnimationFrame(() => {
      setProgressActive(true);
    });
    return () => cancelAnimationFrame(raf);
  }, [currentSlide]);

  return (
    <>
      <Helmet>
        <title>Spill The Beans | Premium Coffee for Bold Thinkers</title>
        <meta name="description" content="Premium Indian coffee crafted for creators, dreamers, developers, and coffee lovers. Shop instant, bundles and gift packs." />
        <meta property="og:title" content="Spill The Beans | Premium Coffee for Bold Thinkers" />
        <meta property="og:description" content="Premium Indian coffee crafted for creators, dreamers, developers, and coffee lovers." />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Spill The Beans | Premium Coffee for Bold Thinkers" />
      </Helmet>
      <PageWrapper className="home-page">
      {/* ── HERO ──────────────────────────────────────────── */}
      <section className="hero grain-overlay" aria-label="Hero section">
        <div className="hero__slideshow">
          {HERO_SLIDES.map((slide, index) => (
            <div
              key={index}
              className={`hero__slide ${index === currentSlide ? 'hero__slide--active' : ''}`}
              style={{ backgroundImage: `url(${slide})` }}
            />
          ))}
        </div>
        <div className="hero__overlay" />
        <div className="hero__glow" aria-hidden="true" />



        {/* Slideshow Indicators */}
        <div className="hero__indicators">
          {HERO_SLIDES.map((_, index) => (
            <button
              key={index}
              className={`hero__indicator-dot ${index === currentSlide ? 'hero__indicator-dot--active' : ''}`}
              onClick={() => setCurrentSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Slideshow Progress Bar */}
        <div className="hero__progress-container">
          <div
            className="hero__progress-bar"
            style={{
              width: progressActive ? '100%' : '0%',
              transition: progressActive ? 'width 10s linear' : 'none'
            }}
          />
        </div>

        {/* Scroll Indicator */}
        <div className="hero__scroll" aria-hidden="true">
          <ChevronDown size={20} className="hero__scroll-icon" />
        </div>
      </section>

      {/* ── TRUST BAR ────────────────────────────────────── */}
      <section className="trust-bar" ref={trustRef}>
        <div className="container trust-bar__container">
          <div className="trust-bar__item">
            <IndiaIcon size={22} color="#581312" />
            <span>Made in India</span>
          </div>
          <div className="trust-bar__item">
            <CoffeeBeansIcon size={22} color="#581312" />
            <span>100% Pure Coffee</span>
          </div>
          <div className="trust-bar__item">
            <Sprout size={22} color="#581312" />
            <span>USDA Organic Flavouring</span>
          </div>
        </div>
      </section>

      {/* ── EXPLORE SECTION ──────────────────────────────── */}
      <section className="explore-section" ref={exploreRef}>
        <div className="container">
          <div className="explore-section__header">
            <h2 className="explore-section__title">Explore</h2>
            <Link to="/shop" id="explore-view-all" className="explore-section__view-all">
              <span>View all</span>
              <span className="explore-section__view-all-circle">
                <ArrowRight size={14} />
              </span>
            </Link>
          </div>

          <div 
            className="explore-section__slider" 
            ref={sliderRef}
            onScroll={handleScroll}
          >
            {exploreProducts.map((product) => (
              <div key={product.id} className="explore-section__slider-item">
                <ProductCard product={product} />
              </div>
            ))}
          </div>

          {/* Controls: Scroll Progress Line & Circular Navigation Arrows */}
          <div className="explore-section__controls">
            <div className="explore-section__progress-track">
              <div 
                className="explore-section__progress-bar"
                style={{ width: `${scrollProgress}%` }}
              />
            </div>
            <div className="explore-section__arrows">
              <button 
                onClick={() => handleArrowClick('left')}
                className="explore-section__arrow-btn"
                id="explore-prev-btn"
                aria-label="Previous slide"
              >
                <ChevronLeft size={18} />
              </button>
              <button 
                onClick={() => handleArrowClick('right')}
                className="explore-section__arrow-btn"
                id="explore-next-btn"
                aria-label="Next slide"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── BESTSELLING COMBOS ────────────────────────────── */}
      <section className="combos-section">
        <div className="combos-section__inner">
          <div className="combos-section__header">
            <h2 className="combos-section__title">Our Bestselling Combos</h2>
            <Link to="/shop?category=Bundles" id="combos-view-all" className="combos-section__view-all">
              <span>View all</span>
              <span className="combos-section__view-all-chevron">
                <ChevronRight size={16} />
              </span>
            </Link>
          </div>

          <div className="combos-section__grid">
            {BESTSELLING_COMBO_IDS.map(id => {
              const product = products.find(p => p.id === id);
              if (!product) return null;
              const savePct = product.originalPrice
                ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
                : 0;
              return (
                <Link
                  key={product.id}
                  to={`/product/${product.slug}`}
                  className="combo-card"
                  id={`combo-card-${product.id}`}
                >
                  {savePct > 0 && (
                    <span className="combo-card__save-badge">Save {savePct}%</span>
                  )}
                  <div className="combo-card__image-wrap">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="combo-card__image"
                      loading="lazy"
                    />
                  </div>
                  <div className="combo-card__info">
                    <p className="combo-card__name">{product.name}</p>
                    {product.rating && (
                      <div className="combo-card__rating">
                        <span className="combo-card__rating-score">{product.rating.toFixed(1)}</span>
                        <Star size={13} fill="#D4880A" color="#D4880A" />
                      </div>
                    )}
                    <div className="combo-card__price-row">
                      <span className="combo-card__price-current">Rs.{product.price.toFixed(2)}</span>
                      {product.originalPrice && (
                        <span className="combo-card__price-original">Rs.{product.originalPrice.toFixed(2)}</span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── BEST COFFEE SACHETS IN INDIA ────────────────────── */}
      <section className="explore-section" style={{ padding: '3.5rem 0' }}>
        <div className="container">
          <div className="explore-section__header">
            <h2 className="explore-section__title">Best Coffee Sachets in India</h2>
            <Link to="/shop?category=Bundles" id="sachets-view-all" className="explore-section__view-all">
              <span>View all</span>
              <span className="explore-section__view-all-circle">
                <ArrowRight size={14} />
              </span>
            </Link>
          </div>

          <div className="products-grid">
            {[109, 108, 46, 47].map(id => {
              const product = products.find(p => p.id === id);
              if (!product) return null;
              return (
                <div key={product.id}>
                  <ProductCard product={product} />
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── PURE ARABICA SECTION ──────────────────────────── */}
      <section className="arabica-banners-section">
        <div className="container" style={{ textAlign: 'center' }}>
          <div className="arabica-banners__header" style={{ marginBottom: 0 }}>
            <h2 className="arabica-banners__title">100%</h2>
            <p className="arabica-banners__subtitle">Pure Arabica Coffee</p>
          </div>
        </div>
      </section>

      {/* ── VIDEO SECTION (FULL-SCREEN VIEWPORT) ────────────── */}
      <section className="video-section">
        <div className="video-section__wrapper">
          <video 
            ref={videoRef}
            className="video-section__video"
            autoPlay
            loop
            muted={isMuted}
            playsInline
            preload="metadata"
          >
            <source src={brandVideo} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <button 
            onClick={toggleMute} 
            className="video-section__mute-btn"
            aria-label={isMuted ? "Unmute video" : "Mute video"}
            id="video-mute-toggle"
          >
            {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
          </button>
        </div>
      </section>

      <div className="amber-divider" style={{ margin: 0 }} />








      {/* ── TESTIMONIALS ─────────────────────────────────── */}
      <section className="section testimonials-section" ref={testimonialsRef}>
        <div className="container">
          <div className="section-header fade-in-up">
            <span className="section-label">Customer Stories</span>
            <h2 className="heading-1">What Coffee Lovers Say</h2>
            <div className="section-divider" />
          </div>
        </div>
        <div className="testimonials-track">
          <div className="testimonials-scroll">
            {[...TESTIMONIALS, ...TESTIMONIALS].map((t, i) => (
              <div key={`${t.id}-${i}`} className="testimonial-card">
                <div className="testimonial-card__header">
                  <div className="stars">
                    {[1,2,3,4,5].map(s => (
                      <Star key={s} size={14} fill="#D4880A" color="#D4880A" />
                    ))}
                  </div>
                  <span className="testimonial-card__product text-xs">{t.product}</span>
                </div>
                <p className="testimonial-card__text">"{t.text}"</p>
                <div className="testimonial-card__author">
                  <div className="testimonial-card__avatar">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm" style={{ fontWeight: 600, color: 'var(--text-cream)' }}>{t.name}</p>
                    <p className="text-xs text-muted">{t.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── NEWSLETTER ────────────────────────────────────── */}
      <NewsletterSection />
    </PageWrapper>
    </>
  );
}
