import { motion } from 'framer-motion';
import { staggerFast, slideUp, viewportOnce } from '../lib/animations';
const galleryImg1 = '/gallery-coffee-1.png';
import './GallerySection.css';

const InstagramIcon = ({ size = 18, className, style, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    style={style}
    {...props}
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
);

const GALLERY_ITEMS = [
  {
    id: 1,
    src: galleryImg1,
    alt: 'Steaming black coffee in a white ceramic cup, morning light',
    caption: 'Morning ritual ☕',
    span: 'tall',
  },
  {
    id: 2,
    src: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=600&q=80',
    alt: 'Coffee beans scattered on wooden surface',
    caption: 'Fresh from the farm 🌿',
    span: '',
  },
  {
    id: 3,
    src: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&q=80',
    alt: 'Latte art pour',
    caption: 'Crafted with care 🎨',
    span: '',
  },
  {
    id: 4,
    src: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600&q=80',
    alt: 'Premium coffee cup on marble surface',
    caption: 'Simplicity perfected ✨',
    span: 'wide',
  },
  {
    id: 5,
    src: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&q=80',
    alt: 'Coffee estate landscape',
    caption: 'From the hills of Coorg 🌄',
    span: '',
  },
  {
    id: 6,
    src: 'https://images.unsplash.com/photo-1511537190424-bbbab87ac5eb?w=600&q=80',
    alt: 'Creative lifestyle with coffee',
    caption: 'Fuel your boldest ideas 🚀',
    span: '',
  },
];

export default function GallerySection() {
  return (
    <section className="gallery-section section" aria-label="Coffee lifestyle gallery">
      <div className="container">
        <motion.div
          className="section-header"
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={slideUp}
        >
          <span className="section-label">
            <InstagramIcon size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '0.375rem' }} />
            @spillthebeans.in
          </span>
          <h2 className="heading-1">Life's Better with Coffee</h2>
          <p className="text-body">Tag us in your brew moments. We're always watching.</p>
          <div className="section-divider" />
        </motion.div>

        <motion.div
          className="gallery-section__grid"
          variants={staggerFast}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
        >
          {GALLERY_ITEMS.map((item) => (
            <motion.div
              key={item.id}
              className={`gallery-section__item gallery-section__item--${item.span || 'normal'}`}
              variants={slideUp}
            >
              <div className="gallery-section__frame">
                <img
                  src={item.src}
                  alt={item.alt}
                  className="gallery-section__img"
                  loading="lazy"
                />
                <div className="gallery-section__overlay">
                  <p className="gallery-section__caption">{item.caption}</p>
                  <InstagramIcon size={16} className="gallery-section__icon" />
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          className="gallery-section__cta"
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={slideUp}
        >
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline"
            id="gallery-instagram-btn"
          >
            <InstagramIcon size={16} />
            Follow on Instagram
          </a>
        </motion.div>
      </div>
    </section>
  );
}
