import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, Search, Menu, X, Flame, ChevronDown, ChevronRight, User, LogOut } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';
import { useAuth } from '../context/AuthContext';
import MegaMenu from './nav/MegaMenu';
import { MEGA_MENU_DATA } from '../data/megaMenuData';
import './Navbar.css';

const NAV_LINKS = [
  { label: 'Shop', to: '/shop', hasMegaMenu: true },
  { label: 'Bundles', to: '/bundles' },
  { label: 'Blog', to: '/blog' },
  { label: 'Contact', to: '/contact' },
];

const ANNOUNCEMENTS = [
  '☕ Buy 3 Get Hot Chocolate Free!',
  '🎁 Up to 40% off on Money Saver Bundles',
  '✨ Free Shipping on orders above ₹599',
  '💛 Rated #1 Indian D2C Coffee Brand',
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [announcementIdx, setAnnouncementIdx] = useState(0);

  // Mega Menu & Mobile Accordion states
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const [mobileShopOpen, setMobileShopOpen] = useState(false);
  const [mobileSubSection, setMobileSubSection] = useState('coffee');
  const hoverTimeoutRef = useRef(null);

  const { currency, setCurrency, currencies } = useCurrency();
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const currencyRef = useRef(null);
  const { user, logout, isLoggedIn } = useAuth();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);
  
  const { itemCount, toggleDrawer } = useCart();
  const navigate = useNavigate();
  const searchRef = useRef(null);

  const handleMouseEnterShop = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setMegaMenuOpen(true);
  };

  const handleMouseLeaveShop = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setMegaMenuOpen(false);
    }, 150);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (currencyRef.current && !currencyRef.current.contains(e.target)) {
        setCurrencyOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const location = useLocation();
  const isHome = location.pathname === '/';
  const isTransparent = isHome && !scrolled;

  // Close mega menu on route change
  useEffect(() => {
    setMegaMenuOpen(false);
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const onScroll = () => {
      const threshold = window.location.pathname === '/' ? window.innerHeight - 100 : 20;
      setScrolled(window.scrollY > threshold);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [location.pathname]);

  useEffect(() => {
    if (searchOpen && searchRef.current) searchRef.current.focus();
  }, [searchOpen]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  // Cycle announcement messages
  useEffect(() => {
    const t = setInterval(() => {
      setAnnouncementIdx(i => (i + 1) % ANNOUNCEMENTS.length);
    }, 3500);
    return () => clearInterval(t);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <>
      {/* Announcement Bar */}
      <div className="announcement-bar" role="marquee" aria-live="polite">
        {/* Mobile: cycling single message */}
        <span className="announcement-bar__mobile hide-desktop">
          {ANNOUNCEMENTS[announcementIdx]}
        </span>
        {/* Desktop: infinite scroll ticker */}
        <div className="announcement-bar__ticker hide-mobile">
          <div className="announcement-bar__ticker-track">
            {[...ANNOUNCEMENTS, ...ANNOUNCEMENTS, ...ANNOUNCEMENTS].map((msg, i) => (
              <span key={i} className="announcement-bar__ticker-item">
                {msg}
                <span className="announcement-bar__dot">•</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      <nav
        className={`navbar ${isTransparent ? 'navbar--transparent' : scrolled ? 'navbar--scrolled' : ''} ${megaMenuOpen ? 'navbar--mega-open' : ''}`}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="navbar__inner container">
          {/* Logo */}
          <Link to="/" className="navbar__logo" aria-label="Spill The Beans Home">
            <Flame size={22} className="navbar__logo-icon" />
            <span className="navbar__logo-text">
              <span className="navbar__logo-spill">Spill The</span>
              <span className="navbar__logo-coffees">Beans</span>
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <ul className="navbar__links hide-mobile" role="list">
            {NAV_LINKS.map(link => (
              <li
                key={link.to}
                onMouseEnter={link.hasMegaMenu ? handleMouseEnterShop : undefined}
                onMouseLeave={link.hasMegaMenu ? handleMouseLeaveShop : undefined}
                className={link.hasMegaMenu ? 'navbar__item--has-mega' : ''}
              >
                <NavLink
                  to={link.to}
                  className={({ isActive }) =>
                    `navbar__link ${isActive ? 'navbar__link--active' : ''} ${link.hasMegaMenu && megaMenuOpen ? 'navbar__link--active' : ''}`
                  }
                  aria-expanded={link.hasMegaMenu ? megaMenuOpen : undefined}
                  aria-haspopup={link.hasMegaMenu ? 'true' : undefined}
                >
                  {link.label}
                  {link.hasMegaMenu && (
                    <ChevronDown size={14} className={`navbar__link-chevron ${megaMenuOpen ? 'rotated' : ''}`} />
                  )}
                </NavLink>
              </li>
            ))}
          </ul>

          {/* Actions */}
          <div className="navbar__actions">
            {/* Currency Selector */}
            <div className="navbar__currency" ref={currencyRef}>
              <button
                className="navbar__currency-btn"
                onClick={() => setCurrencyOpen(!currencyOpen)}
                aria-label="Select currency"
                aria-expanded={currencyOpen}
              >
                <img src={currency.flag} alt="" className="navbar__currency-flag-img" />
                <span className="navbar__currency-code">{currency.code}</span>
                <ChevronDown size={14} className={`navbar__currency-chevron ${currencyOpen ? 'rotated' : ''}`} />
              </button>
              
              {currencyOpen && (
                <div className="navbar__currency-dropdown">
                  {currencies.map(c => (
                    <button
                      key={c.code}
                      className={`navbar__currency-item ${currency.code === c.code ? 'active' : ''}`}
                      onClick={() => {
                        setCurrency(c);
                        setCurrencyOpen(false);
                      }}
                    >
                      <img src={c.flag} alt="" className="navbar__currency-item-flag-img" />
                      <span className="navbar__currency-item-label">{c.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              id="navbar-search-btn"
              className="navbar__action-btn"
              onClick={() => setSearchOpen(v => !v)}
              aria-label="Search"
            >
              <Search size={20} />
            </button>

            <button
              id="navbar-cart-btn"
              className="navbar__action-btn navbar__cart-btn"
              onClick={() => toggleDrawer(true)}
              aria-label={`Cart — ${itemCount} items`}
            >
              <ShoppingBag size={20} />
              {itemCount > 0 && (
                <span className="navbar__cart-count" aria-live="polite">
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              )}
            </button>

            {/* User / Login */}
            {isLoggedIn ? (
              <div className="navbar__user-menu" ref={userMenuRef}>
                <button
                  className="navbar__action-btn navbar__user-btn"
                  onClick={() => setUserMenuOpen(v => !v)}
                  aria-label="Account menu"
                  aria-expanded={userMenuOpen}
                  id="navbar-account-btn"
                >
                  <User size={20} />
                </button>
                {userMenuOpen && (
                  <div className="navbar__user-dropdown">
                    <div className="navbar__user-info">
                      <span className="navbar__user-name">{user.name}</span>
                      <span className="navbar__user-email">{user.email}</span>
                    </div>
                    <hr className="navbar__user-sep" />
                    <Link
                      to="/profile"
                      className="navbar__user-action"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <User size={14} style={{ marginRight: '0.5rem' }} />
                      My Account
                    </Link>
                    <hr className="navbar__user-sep" />
                    {(user.role === 'ADMIN' || user.email?.toLowerCase().includes('admin')) && (
                      <>
                        <Link
                          to="/admin"
                          className="navbar__user-action"
                          onClick={() => setUserMenuOpen(false)}
                          style={{ color: '#C27A0A', fontWeight: 'bold' }}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '0.5rem' }}>
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                            <path d="M9 17V7l7 5-7 5z"/>
                          </svg>
                          Admin Panel
                        </Link>
                        <hr className="navbar__user-sep" />
                      </>
                    )}
                    <button
                      className="navbar__user-action"
                      onClick={() => { logout(); setUserMenuOpen(false); }}
                      id="navbar-logout-btn"
                    >
                      <LogOut size={14} />
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/auth"
                className="navbar__action-btn navbar__signin-btn"
                id="navbar-login-btn"
                aria-label="Sign in to your account"
              >
                <User size={20} />
                <span className="navbar__signin-star" aria-hidden="true">★</span>
              </Link>
            )}

            <button
              id="navbar-menu-btn"
              className="navbar__action-btn hide-desktop"
              onClick={() => setMenuOpen(v => !v)}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Desktop Mega Menu Overlay */}
        <div
          onMouseEnter={handleMouseEnterShop}
          onMouseLeave={handleMouseLeaveShop}
        >
          <MegaMenu
            isOpen={megaMenuOpen}
            onClose={() => setMegaMenuOpen(false)}
          />
        </div>

        {/* Search Bar */}
        {searchOpen && (
          <div className="navbar__search">
            <form onSubmit={handleSearch} className="navbar__search-form container">
              <Search size={18} className="navbar__search-icon" />
              <input
                ref={searchRef}
                type="search"
                placeholder="Search coffees, origins, blends..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="navbar__search-input"
                id="navbar-search-input"
                aria-label="Search products"
              />
              <button type="button" className="navbar__search-close" onClick={() => setSearchOpen(false)}>
                <X size={18} />
              </button>
            </form>
          </div>
        )}
      </nav>

      {/* Mobile Menu Overlay */}
      {menuOpen && (
        <div className="mobile-menu" role="dialog" aria-label="Mobile navigation">
          <div className="mobile-menu__overlay" onClick={() => setMenuOpen(false)} />
          <div className="mobile-menu__panel">
            <div className="mobile-menu__header">
              <Link to="/" className="navbar__logo" onClick={() => setMenuOpen(false)}>
                <Flame size={20} className="navbar__logo-icon" />
                <span className="navbar__logo-text">
                  <span className="navbar__logo-spill">Spill The</span>
                  <span className="navbar__logo-coffees">Beans</span>
                </span>
              </Link>
              <button id="mobile-menu-close" className="navbar__action-btn" onClick={() => setMenuOpen(false)}>
                <X size={22} />
              </button>
            </div>

            <ul className="mobile-menu__links" role="list">
              {/* Mobile Accordion for Shop */}
              <li className="mobile-menu__accordion-item">
                <div
                  className="mobile-menu__accordion-header"
                  onClick={() => setMobileShopOpen(v => !v)}
                >
                  <span className="mobile-menu__link">Shop</span>
                  <ChevronDown size={18} className={`mobile-accordion-chevron ${mobileShopOpen ? 'rotated' : ''}`} />
                </div>

                {mobileShopOpen && (
                  <div className="mobile-menu__accordion-body">
                    {MEGA_MENU_DATA.map(section => (
                      <div key={section.id} className="mobile-section">
                        <div
                          className="mobile-section__title"
                          onClick={() => setMobileSubSection(mobileSubSection === section.id ? null : section.id)}
                        >
                          <span>{section.title}</span>
                          <ChevronRight size={14} className={`mobile-sub-chevron ${mobileSubSection === section.id ? 'rotated' : ''}`} />
                        </div>

                        {mobileSubSection === section.id && (
                          <ul className="mobile-sub-list">
                            {section.items.map(item => (
                              <li key={item.id}>
                                <Link
                                  to={item.to}
                                  className="mobile-sub-link"
                                  onClick={() => setMenuOpen(false)}
                                >
                                  {item.label}
                                </Link>
                              </li>
                            ))}
                            <li>
                              <Link
                                to={section.viewAllLink}
                                className="mobile-sub-link mobile-sub-link--all"
                                onClick={() => setMenuOpen(false)}
                              >
                                View All {section.title} →
                              </Link>
                            </li>
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </li>

              {/* Other Mobile Nav Links */}
              {NAV_LINKS.filter(l => !l.hasMegaMenu).map(link => (
                <li key={link.to}>
                  <NavLink
                    to={link.to}
                    className={({ isActive }) => `mobile-menu__link ${isActive ? 'mobile-menu__link--active' : ''}`}
                    onClick={() => setMenuOpen(false)}
                  >
                    {link.label}
                  </NavLink>
                </li>
              ))}
            </ul>

            <div className="mobile-menu__footer">
              <p className="text-xs text-muted">© 2025 Spill The Beans. Crafted in India.</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
