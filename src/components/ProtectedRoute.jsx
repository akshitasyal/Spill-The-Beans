// ProtectedRoute.jsx -- Auth Guard for Protected Pages
import { useEffect } from 'react';
import { Lock, Coffee } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, message, redirectTo }) {
  const { isLoggedIn, openAuthModal } = useAuth();
  const intendedPath = redirectTo || window.location.pathname;
  const msg = message || 'Please sign in to continue.';

  useEffect(() => {
    if (!isLoggedIn) {
      sessionStorage.setItem('auth_redirect', intendedPath);
      openAuthModal({ message: msg, redirectUrl: intendedPath });
    }
  }, [isLoggedIn, intendedPath, msg, openAuthModal]);

  if (isLoggedIn) return children;

  return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1.25rem', padding: '3rem', textAlign: 'center' }}>
      <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(212,163,89,0.12)', border: '1.5px solid rgba(212,163,89,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Lock size={32} style={{ color: '#D4A359' }} />
      </div>
      <div>
        <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.6rem', color: '#FFF', margin: '0 0 0.5rem' }}>Sign In Required</h2>
        <p style={{ color: '#A89B95', margin: 0, fontSize: '0.95rem', maxWidth: 340 }}>{msg}</p>
      </div>
      <button
        id="protected-route-signin-btn"
        onClick={() => openAuthModal({ message: msg, redirectUrl: intendedPath })}
        style={{
          background: 'linear-gradient(135deg, #D4A359, #c4924a)',
          color: '#1A1208',
          border: 'none',
          borderRadius: 10,
          padding: '0.8rem 2rem',
          fontSize: '0.95rem',
          fontWeight: 700,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}
        onMouseOver={(e) => (e.currentTarget.style.opacity = '0.85')}
        onMouseOut={(e) => (e.currentTarget.style.opacity = '1')}
      >
        <Coffee size={16} /> Sign In to Continue
      </button>
    </div>
  );
}
