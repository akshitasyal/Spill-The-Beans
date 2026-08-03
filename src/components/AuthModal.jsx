import { useState } from 'react';
import { X, Lock, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SignIn, SignUp } from '@clerk/clerk-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import './AuthModal.css';

const IS_CLERK_ACTIVE = !!import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

export default function AuthModal({ isOpen, onClose, message, redirectUrl, onAuthSuccess }) {
  const { login } = useAuth();
  const { mergeCartWithBackend } = useCart();
  const navigate = useNavigate();

  const [tab, setTab] = useState('login'); // 'login' | 'signup'
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleCustomSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      // Simulate/Trigger login
      const userData = {
        id: `usr_${Date.now()}`,
        clerkId: `clerk_${Date.now()}`,
        email: email.trim(),
        name: name.trim() || email.split('@')[0],
      };

      await login(userData);
      // Merge guest cart items into the authenticated user's cart
      await mergeCartWithBackend(userData);

      if (onAuthSuccess) onAuthSuccess(userData);

      onClose();

      // Determine destination: prefer explicit prop, then sessionStorage, then home
      const dest = redirectUrl || sessionStorage.getItem('auth_redirect') || '/';
      sessionStorage.removeItem('auth_redirect');

      // Use React Router navigate to avoid a full page reload (preserves state)
      navigate(dest);
    } catch (err) {
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div className="auth-modal-card" onClick={(e) => e.stopPropagation()}>
        <button className="auth-modal-close" onClick={onClose} aria-label="Close modal">
          <X size={18} />
        </button>

        <div className="auth-modal-header">
          <div className="auth-modal-icon-badge">☕</div>
          <h2 className="auth-modal-title">Spill The Beans</h2>
          <p style={{ color: '#A89B95', fontSize: '0.9rem', margin: 0 }}>
            {tab === 'login' ? 'Welcome back, coffee lover' : 'Join our specialty coffee community'}
          </p>

          {message && (
            <div className="auth-modal-message-banner">
              <Lock size={15} />
              <span>{message}</span>
            </div>
          )}
        </div>

        <div className="auth-modal-body">
          {IS_CLERK_ACTIVE ? (
            <div className="auth-modal-clerk-container">
              {tab === 'login' ? (
                <SignIn routing="virtual" fallbackRedirectUrl={redirectUrl || '/'} />
              ) : (
                <SignUp routing="virtual" fallbackRedirectUrl={redirectUrl || '/'} />
              )}
            </div>
          ) : (
            <>
              <div className="auth-modal-tabs">
                <button
                  className={`auth-modal-tab ${tab === 'login' ? 'active' : ''}`}
                  onClick={() => setTab('login')}
                >
                  Sign In
                </button>
                <button
                  className={`auth-modal-tab ${tab === 'signup' ? 'active' : ''}`}
                  onClick={() => setTab('signup')}
                >
                  Create Account
                </button>
              </div>

              <form className="auth-modal-form" onSubmit={handleCustomSubmit}>
                {error && (
                  <div style={{ padding: '0.6rem 0.8rem', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)', borderRadius: '8px', color: '#FCA5A5', fontSize: '0.85rem' }}>
                    {error}
                  </div>
                )}

                {tab === 'signup' && (
                  <div className="auth-input-group">
                    <label>Full Name</label>
                    <input
                      type="text"
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                )}

                <div className="auth-input-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    placeholder="coffee.lover@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="auth-input-group">
                  <label>Password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <button type="submit" className="auth-submit-btn" disabled={loading}>
                  {loading ? (
                    'Processing...'
                  ) : (
                    <>
                      <Sparkles size={16} />
                      {tab === 'login' ? 'Sign In & Continue' : 'Create Account'}
                    </>
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
