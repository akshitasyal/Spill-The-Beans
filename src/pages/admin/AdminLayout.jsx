import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, Package, Layers, ShoppingBag, Users, MessageSquare,
  Ticket, FileText, BarChart3, Settings, LogOut, Menu, X, ChevronLeft,
  ChevronRight, Search, Bell, Moon, Sun, Plus, User, Activity, UserCircle
} from 'lucide-react';
import './AdminLayout.css';
import SearchModal from '../../components/admin/SearchModal';
import { NotificationService } from '../../services/NotificationService';

const isClerkEnabled = false;

// Reusable Section Header Component
export function SectionHeader({ title, subtitle, children }) {
  return (
    <div className="admin-section-header">
      <div>
        <h1 className="admin-section-header__title">{title}</h1>
        {subtitle && <p className="admin-section-header__subtitle">{subtitle}</p>}
      </div>
      {children && <div className="admin-section-header__actions">{children}</div>}
    </div>
  );
}

// Reusable Sidebar Navigation Item List
const SIDEBAR_ITEMS = [
  { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/admin/products', label: 'Products', icon: Package },
  { path: '/admin/inventory', label: 'Inventory', icon: Layers },
  { path: '/admin/orders', label: 'Orders', icon: ShoppingBag },
  { path: '/admin/customers', label: 'Customers', icon: Users },
  { path: '/admin/reviews', label: 'Reviews', icon: MessageSquare },
  { path: '/admin/coupons', label: 'Coupons', icon: Ticket },
  { path: '/admin/blogs', label: 'Blog CMS', icon: FileText },
  { path: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { path: '/admin/notifications', label: 'Notifications', icon: Bell, badge: true },
  { path: '/admin/activity', label: 'Activity Logs', icon: Activity },
  { path: '/admin/settings', label: 'Settings', icon: Settings },
  { path: '/admin/profile', label: 'My Profile', icon: UserCircle },
];

function AdminSidebar({ collapsed, setCollapsed, mobileOpen, setMobileOpen, onLogout, unreadCount }) {
  const location = useLocation();

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div
          className="admin-sidebar-backdrop"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside className={`admin-sidebar ${collapsed ? 'admin-sidebar--collapsed' : ''} ${mobileOpen ? 'admin-sidebar--mobile-open' : ''}`}>
        <div className="admin-sidebar__brand">
          <Link to="/" className="admin-sidebar__logo">
            <span className="admin-sidebar__logo-icon">☕</span>
            <span className="admin-sidebar__logo-text">STB Admin</span>
          </Link>
          <button
            className="admin-sidebar__toggle hide-mobile"
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
          <button
            className="admin-sidebar__toggle show-mobile"
            onClick={() => setMobileOpen(false)}
            aria-label="Close Sidebar Menu"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="admin-sidebar__nav">
          {SIDEBAR_ITEMS.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`admin-sidebar__link ${isActive ? 'admin-sidebar__link--active' : ''}`}
                onClick={() => setMobileOpen(false)}
                style={{ position: 'relative' }}
              >
                <item.icon size={20} className="admin-sidebar__link-icon" />
                <span className="admin-sidebar__link-text">{item.label}</span>
                {item.badge && unreadCount > 0 && !collapsed && (
                  <span style={{ marginLeft: 'auto', background: '#ef4444', color: '#FFF', fontSize: '0.6rem', fontWeight: 700, minWidth: '18px', height: '18px', borderRadius: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 0.25rem' }}>
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="admin-sidebar__footer">
          <button
            onClick={onLogout}
            className="admin-sidebar__link"
            style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
          >
            <LogOut size={20} className="admin-sidebar__link-icon" />
            <span className="admin-sidebar__link-text">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}

function AdminNavbar({ setMobileOpen, onLogout, onOpenSearch, unreadCount, clerkUser, mockUser }) {
  const [profileOpen, setProfileOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const profileRef = useRef(null);
  const navigate = useNavigate();

  // Handle dropdown closes on clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Sync dark mode toggle effect
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    // Mock effect: toggle class on body/html
    document.documentElement.classList.toggle('admin-light-mode');
  };

  // Get Admin Details
  const adminName = isClerkEnabled ? (clerkUser?.fullName || clerkUser?.username || 'Clerk Admin') : (mockUser?.name || 'Admin User');
  const adminEmail = isClerkEnabled ? (clerkUser?.primaryEmailAddress?.emailAddress || '') : (mockUser?.email || 'admin@spillthebeans.in');
  const adminAvatar = isClerkEnabled ? clerkUser?.imageUrl : null;

  const handleDropdownLogout = () => {
    setProfileOpen(false);
    onLogout();
  };

  return (
    <header className="admin-navbar">
      {/* Hamburger menu for mobile layout */}
      <button
        className="admin-navbar__menu-toggle"
        onClick={() => setMobileOpen(true)}
        aria-label="Open Sidebar Menu"
      >
        <Menu size={22} />
      </button>

      {/* Quick Search — opens SearchModal */}
      <div className="admin-navbar__search" onClick={onOpenSearch} style={{ cursor: 'pointer' }}>
        <Search size={16} className="admin-navbar__search-icon" />
        <input
          type="search"
          placeholder="Quick search (⌘K)..."
          className="admin-navbar__search-input"
          readOnly
          style={{ cursor: 'pointer', caretColor: 'transparent' }}
          aria-label="Open global search"
        />
      </div>

      <div className="admin-navbar__actions">
        {/* Quick Add Actions */}
        <div className="profile-dropdown-wrap">
          <button
            className="admin-navbar__btn admin-navbar__btn--quickadd hide-mobile"
            onClick={() => navigate('/admin/products')}
          >
            <Plus size={16} /> Quick Add
          </button>
        </div>

        {/* Dark Mode Toggler */}
        <button
          className="admin-navbar__btn"
          onClick={toggleDarkMode}
          title="Toggle Color Theme"
        >
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Notifications Bell — links to notifications page */}
        <div style={{ position: 'relative' }}>
          <button
            className="admin-navbar__btn"
            onClick={() => navigate('/admin/notifications')}
            aria-label="Notification Center"
            style={{ position: 'relative' }}
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span style={{ position: 'absolute', top: '2px', right: '2px', background: '#ef4444', color: '#FFF', fontSize: '0.55rem', fontWeight: 700, minWidth: '14px', height: '14px', borderRadius: '7px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 2px', lineHeight: 1 }}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
        </div>

        {/* Profile Dropdown */}
        <div className="admin-navbar__profile" ref={profileRef}>
          <button
            className="admin-navbar__profile-trigger"
            onClick={() => setProfileOpen(!profileOpen)}
            aria-expanded={profileOpen}
          >
            {adminAvatar ? (
              <img src={adminAvatar} alt="Admin profile" className="admin-navbar__avatar" />
            ) : (
              <div className="admin-navbar__avatar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--accent-admin-maroon)' }}>
                <User size={18} color="var(--text-admin-bright)" />
              </div>
            )}
            <div className="admin-navbar__user-info hide-mobile">
              <span className="admin-navbar__user-name">{adminName}</span>
              <span className="admin-navbar__user-role">Administrator</span>
            </div>
          </button>

          {profileOpen && (
            <div className="admin-dropdown">
              <div style={{ padding: '0.5rem 0.875rem', borderBottom: '1px solid var(--border-admin)', marginBottom: '0.25rem' }}>
                <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-admin-muted)' }}>Signed in as</p>
                <p style={{ margin: 0, fontSize: '0.8125rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis' }}>{adminEmail}</p>
              </div>
              <Link to="/admin/profile" className="admin-dropdown__item" onClick={() => setProfileOpen(false)}>
                <UserCircle size={14} /> My Profile
              </Link>
              <Link to="/admin/settings" className="admin-dropdown__item" onClick={() => setProfileOpen(false)}>
                <Settings size={14} /> Settings
              </Link>
              <button className="admin-dropdown__item" onClick={handleDropdownLogout}>
                <LogOut size={14} /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function AdminLayoutWrapper({ clerkLogout, clerkUser }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { logout: mockLogout, user: mockUser } = useAuth();
  const navigate = useNavigate();

  // Fetch unread notification count
  useEffect(() => {
    NotificationService.getUnreadCount().then(res => {
      if (res.success) setUnreadCount(res.count);
    });
  }, []);

  // Global Cmd+K / Ctrl+K shortcut
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleLogout = async () => {
    if (isClerkEnabled && clerkLogout) {
      await clerkLogout();
    } else {
      mockLogout();
    }
    navigate('/');
  };

  return (
    <div className="admin-shell">
      <AdminSidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        onLogout={handleLogout}
        unreadCount={unreadCount}
      />

      <div className="admin-main">
        <AdminNavbar
          setMobileOpen={setMobileOpen}
          onLogout={handleLogout}
          onOpenSearch={() => setSearchOpen(true)}
          unreadCount={unreadCount}
          clerkUser={clerkUser}
          mockUser={mockUser}
        />
        <main className="admin-content">
          <Outlet />
        </main>
      </div>

      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}

export default function AdminLayout() {
  return <AdminLayoutWrapper clerkLogout={null} clerkUser={null} />;
}
