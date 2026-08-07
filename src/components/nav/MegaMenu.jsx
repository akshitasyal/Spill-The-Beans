import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Star, ArrowRight } from 'lucide-react';
import { MEGA_MENU_DATA, DEFAULT_FEATURED } from '../../data/megaMenuData';
import './MegaMenu.css';

export default function MegaMenu({ isOpen, onClose }) {
  const navigate = useNavigate();
  const menuRef = useRef(null);

  // Active featured content for Column 4
  const [activeFeatured, setActiveFeatured] = useState(DEFAULT_FEATURED);
  const [isFading, setIsFading] = useState(false);

  // Smoothly update featured panel without abrupt jumps
  const updateFeatured = useCallback((newFeatured) => {
    if (!newFeatured || newFeatured.title === activeFeatured.title) return;
    setIsFading(true);
    setTimeout(() => {
      setActiveFeatured(newFeatured);
      setIsFading(false);
    }, 120); // 120ms fade out, then fade back in
  }, [activeFeatured]);

  // Reset featured panel when opening or leaving columns
  useEffect(() => {
    if (isOpen) {
      setActiveFeatured(DEFAULT_FEATURED);
    }
  }, [isOpen]);

  // Accessibility: Handle Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={menuRef}
      className="mega-menu-overlay"
      onMouseLeave={onClose}
      role="menu"
      aria-label="Shop categories mega menu"
    >
      <div className="mega-menu-container">
        <div className="mega-menu-grid">
          
          {/* Columns 1, 2, 3: Coffee, Tea, Accessories */}
          {MEGA_MENU_DATA.map((col) => (
            <div
              key={col.id}
              className="mega-menu-col"
              onMouseEnter={() => updateFeatured(col.defaultFeatured)}
            >
              <div className="mega-menu-col__header">
                <Link
                  to={col.viewAllLink}
                  className="mega-menu-col__title"
                  onClick={onClose}
                >
                  {col.title}
                </Link>
              </div>

              <ul className="mega-menu-list" role="list">
                {col.items.map((item) => (
                  <li key={item.id} className="mega-menu-item">
                    <Link
                      to={item.to}
                      className="mega-menu-link"
                      onMouseEnter={() => updateFeatured(item.featured)}
                      onFocus={() => updateFeatured(item.featured)}
                      onClick={onClose}
                      role="menuitem"
                    >
                      <span className="mega-menu-link__label">{item.label}</span>
                      <span className="mega-menu-link__arrow" aria-hidden="true">›</span>
                    </Link>
                  </li>
                ))}
              </ul>

              <div className="mega-menu-col__footer">
                <Link
                  to={col.viewAllLink}
                  className="mega-menu-view-all"
                  onClick={onClose}
                >
                  View All {col.title.charAt(0) + col.title.slice(1).toLowerCase()} →
                </Link>
              </div>
            </div>
          ))}

          {/* Column 4: Dynamic Featured Collection Panel */}
          <div className="mega-menu-col mega-menu-col--featured">
            <div className="mega-menu-featured-label">FEATURED COLLECTION</div>

            <div className={`mega-menu-card ${isFading ? 'mega-menu-card--fading' : ''}`}>
              <div className="mega-menu-card__image-wrap">
                <img
                  src={activeFeatured.image}
                  alt={activeFeatured.title}
                  className="mega-menu-card__image"
                  loading="lazy"
                />
                {activeFeatured.rating && (
                  <div className="mega-menu-card__badge">
                    <Star size={13} fill="#C27A0A" color="#C27A0A" />
                    <span>{activeFeatured.rating}</span>
                  </div>
                )}
              </div>

              <div className="mega-menu-card__body">
                <h4 className="mega-menu-card__title">{activeFeatured.title}</h4>
                <p className="mega-menu-card__desc">{activeFeatured.highlights}</p>
                
                <div className="mega-menu-card__footer">
                  <span className="mega-menu-card__price">{activeFeatured.price}</span>
                  <button
                    className="mega-menu-card__cta"
                    onClick={() => {
                      onClose();
                      navigate(activeFeatured.to || '/shop');
                    }}
                  >
                    <span>{activeFeatured.cta}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
