import { Link } from 'react-router-dom';
import { Flame, Mail, Phone, MapPin } from 'lucide-react';
import './Footer.css';

const InstagramIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
  </svg>
);
const TwitterIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);
const YoutubeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

const SHOP_LINKS = [
  { label: 'Flavoured Instant', to: '/products?category=flavoured-instant' },
  { label: 'Premium Arabica', to: '/products?category=premium-arabica' },
  { label: 'Categories', to: '/categories' },
];

const COMPANY_LINKS = [
  { label: 'Blog', to: '/blog' },
  { label: 'Contact Us', to: '/contact' },
  { label: 'Careers', to: '/careers' },
];

const SUPPORT_LINKS = [
  { label: 'Track Order', to: '/track' },
  { label: 'Returns & Refunds', to: '/returns' },
  { label: 'Shipping Policy', to: '/shipping' },
  { label: 'Privacy Policy', to: '/privacy' },
  { label: 'Admin Dashboard 🔒', to: '/admin' },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer" role="contentinfo">
      {/* Glow line */}
      <div className="footer__glow-line" aria-hidden="true" />

      <div className="container">
        {/* Main Grid */}
        <div className="footer__grid">
          {/* Brand */}
          <div className="footer__brand">
            <Link to="/" className="footer__logo" aria-label="Spill The Beans Home">
              <Flame size={20} className="footer__logo-icon" />
              <div className="footer__logo-text">
                <span className="footer__logo-spill">Spill The</span>
                <span className="footer__logo-coffees">Beans</span>
              </div>
            </Link>
            <p className="footer__tagline text-sm text-muted">
              Bold. Energetic. Premium.<br />
              Crafted from India's finest coffee estates.
            </p>
            <div className="footer__socials">
              <a href="https://instagram.com/spillthebeanscoffee" target="_blank" rel="noopener noreferrer" className="footer__social-btn" aria-label="Spill The Beans on Instagram" id="footer-instagram">
                <InstagramIcon />
              </a>
              <a href="https://twitter.com/SpillTheBeans" target="_blank" rel="noopener noreferrer" className="footer__social-btn" aria-label="Spill The Beans on Twitter" id="footer-twitter">
                <TwitterIcon />
              </a>
              <a href="https://youtube.com/@spillthebeans" target="_blank" rel="noopener noreferrer" className="footer__social-btn" aria-label="Spill The Beans on YouTube" id="footer-youtube">
                <YoutubeIcon />
              </a>
            </div>

            {/* Trust Badges */}
            <div className="footer__trust">
              <div className="footer__trust-badge">🇮🇳 Made in India</div>
              <div className="footer__trust-badge">🌱 Sustainably Sourced</div>
              <div className="footer__trust-badge">☕ Specialty Grade</div>
            </div>
          </div>

          {/* Shop Links */}
          <div className="footer__col">
            <h3 className="footer__col-title">Shop</h3>
            <ul className="footer__links">
              {SHOP_LINKS.map(l => (
                <li key={l.to}>
                  <Link to={l.to} className="footer__link">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div className="footer__col">
            <h3 className="footer__col-title">Company</h3>
            <ul className="footer__links">
              {COMPANY_LINKS.map(l => (
                <li key={l.to}>
                  <Link to={l.to} className="footer__link">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support + Contact */}
          <div className="footer__col">
            <h3 className="footer__col-title">Support</h3>
            <ul className="footer__links">
              {SUPPORT_LINKS.map(l => (
                <li key={l.to}>
                  <Link to={l.to} className="footer__link">{l.label}</Link>
                </li>
              ))}
            </ul>
            <div className="footer__contact">
              <a href="mailto:hello@spillthebeans.in" className="footer__contact-link" id="footer-email">
                <Mail size={14} /> hello@spillthebeans.in
              </a>
              <a href="tel:+918000000000" className="footer__contact-link" id="footer-phone">
                <Phone size={14} /> +91 80000 00000
              </a>
              <span className="footer__contact-link" style={{ cursor: 'default' }}>
                <MapPin size={14} /> Bengaluru, India
              </span>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="amber-divider" />

        {/* Bottom Bar */}
        <div className="footer__bottom">
          <p className="text-xs text-subtle">
            © {currentYear} Spill The Beans. All rights reserved. Crafted with ☕ in India.
          </p>
          <p className="text-xs text-subtle">
            FSSAI Lic. No. 10000000000000 | GST: 29ABCDE1234F1Z5
          </p>
        </div>
      </div>
    </footer>
  );
}
