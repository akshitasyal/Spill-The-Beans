import { useState, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

/* ---- Icons (inline SVGs to avoid extra deps) ---- */
function IconMail() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

function IconUser() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.58-7 8-7s8 3 8 7" />
    </svg>
  );
}

function IconLock() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function IconEye({ off }) {
  return off ? (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  ) : (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function IconGoogle() {
  return (
    <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
      <path fill="#FF3D00" d="m6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z"/>
      <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/>
      <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/>
    </svg>
  );
}

function IconPhone() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.15 11.8a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.06 1h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 21 16.92z" />
    </svg>
  );
}

/* ---- Password Strength ---- */
function getStrength(password) {
  if (!password) return { score: 0, label: '', color: '' };
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  const levels = [
    { label: 'Weak', color: 'weak' },
    { label: 'Fair', color: 'fair' },
    { label: 'Good', color: 'good' },
    { label: 'Strong', color: 'strong' },
  ];
  return { score, ...levels[score - 1] || { label: 'Weak', color: 'weak' } };
}

function PasswordStrength({ password }) {
  const { score, label, color } = getStrength(password);
  if (!password) return null;
  return (
    <div className="auth-strength">
      <div className="auth-strength-bar">
        {[1, 2, 3, 4].map(i => (
          <div
            key={i}
            className={`auth-strength-seg ${i <= score ? `filled-${color}` : ''}`}
          />
        ))}
      </div>
      <span className="auth-strength-label">{label} password</span>
    </div>
  );
}

/* ---- Validation ---- */
function validateLogin({ email, password }) {
  const errors = {};
  if (!email.trim()) errors.email = 'Email is required';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Enter a valid email';
  if (!password) errors.password = 'Password is required';
  return errors;
}

function validateSignup({ firstName, lastName, email, phone, password, confirm }) {
  const errors = {};
  if (!firstName.trim()) errors.firstName = 'Required';
  if (!lastName.trim()) errors.lastName = 'Required';
  if (!email.trim()) errors.email = 'Email is required';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Enter a valid email';
  if (phone && !/^\+?[\d\s\-()]{7,15}$/.test(phone)) errors.phone = 'Enter a valid phone number';
  if (!password) errors.password = 'Password is required';
  else if (password.length < 8) errors.password = 'Minimum 8 characters';
  if (!confirm) errors.confirm = 'Please confirm your password';
  else if (confirm !== password) errors.confirm = 'Passwords do not match';
  return errors;
}

/* ---- Login Form ---- */
function LoginForm({ onSuccess }) {
  const [form, setForm] = useState({ email: '', password: '', remember: false });
  const [errors, setErrors] = useState({});
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const set = (field) => (e) =>
    setForm(f => ({ ...f, [field]: field === 'remember' ? e.target.checked : e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validateLogin(form);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    // Simulate API call
    await new Promise(r => setTimeout(r, 1400));
    login({ email: form.email, name: form.email.split('@')[0] });
    setLoading(false);
    onSuccess('login');
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit} noValidate>
      {/* Email */}
      <div className="auth-field">
        <label className="auth-label" htmlFor="login-email">Email address</label>
        <div className="auth-input-wrap">
          <span className="auth-input-icon"><IconMail /></span>
          <input
            id="login-email"
            type="email"
            className={`auth-input ${errors.email ? 'error' : ''}`}
            placeholder="you@example.com"
            value={form.email}
            onChange={set('email')}
            autoComplete="email"
          />
        </div>
        {errors.email && <span className="auth-error-msg">{errors.email}</span>}
      </div>

      {/* Password */}
      <div className="auth-field">
        <label className="auth-label" htmlFor="login-password">Password</label>
        <div className="auth-input-wrap">
          <span className="auth-input-icon"><IconLock /></span>
          <input
            id="login-password"
            type={showPass ? 'text' : 'password'}
            className={`auth-input ${errors.password ? 'error' : ''}`}
            placeholder="Your password"
            value={form.password}
            onChange={set('password')}
            autoComplete="current-password"
          />
          <button
            type="button"
            className="auth-input-toggle"
            onClick={() => setShowPass(v => !v)}
            aria-label={showPass ? 'Hide password' : 'Show password'}
          >
            <IconEye off={showPass} />
          </button>
        </div>
        {errors.password && <span className="auth-error-msg">{errors.password}</span>}
      </div>

      {/* Remember / Forgot */}
      <div className="auth-meta">
        <label className="auth-remember">
          <input type="checkbox" checked={form.remember} onChange={set('remember')} />
          Remember me
        </label>
        <button type="button" className="auth-forgot">Forgot password?</button>
      </div>

      {/* Submit */}
      <button type="submit" className="auth-submit" id="login-submit-btn" disabled={loading}>
        {loading ? <span className="auth-submit-spinner" /> : null}
        {loading ? 'Signing in...' : 'Sign In'}
      </button>
    </form>
  );
}

/* ---- Signup Form ---- */
function SignupForm({ onSuccess }) {
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '', password: '', confirm: '',
  });
  const [errors, setErrors] = useState({});
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validateSignup(form);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    await new Promise(r => setTimeout(r, 1600));
    login({ email: form.email, name: `${form.firstName} ${form.lastName}` });
    setLoading(false);
    onSuccess('signup');
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit} noValidate>
      {/* First/Last row */}
      <div className="auth-field-row">
        <div className="auth-field">
          <label className="auth-label" htmlFor="signup-firstname">First name</label>
          <div className="auth-input-wrap">
            <span className="auth-input-icon"><IconUser /></span>
            <input
              id="signup-firstname"
              type="text"
              className={`auth-input ${errors.firstName ? 'error' : ''}`}
              placeholder="Aryan"
              value={form.firstName}
              onChange={set('firstName')}
              autoComplete="given-name"
            />
          </div>
          {errors.firstName && <span className="auth-error-msg">{errors.firstName}</span>}
        </div>
        <div className="auth-field">
          <label className="auth-label" htmlFor="signup-lastname">Last name</label>
          <div className="auth-input-wrap">
            <span className="auth-input-icon"><IconUser /></span>
            <input
              id="signup-lastname"
              type="text"
              className={`auth-input ${errors.lastName ? 'error' : ''}`}
              placeholder="Sharma"
              value={form.lastName}
              onChange={set('lastName')}
              autoComplete="family-name"
            />
          </div>
          {errors.lastName && <span className="auth-error-msg">{errors.lastName}</span>}
        </div>
      </div>

      {/* Email */}
      <div className="auth-field">
        <label className="auth-label" htmlFor="signup-email">Email address</label>
        <div className="auth-input-wrap">
          <span className="auth-input-icon"><IconMail /></span>
          <input
            id="signup-email"
            type="email"
            className={`auth-input ${errors.email ? 'error' : ''}`}
            placeholder="you@example.com"
            value={form.email}
            onChange={set('email')}
            autoComplete="email"
          />
        </div>
        {errors.email && <span className="auth-error-msg">{errors.email}</span>}
      </div>

      {/* Phone */}
      <div className="auth-field">
        <label className="auth-label" htmlFor="signup-phone">Phone <span style={{ fontWeight: 400, color: 'var(--text-subtle)' }}>(optional)</span></label>
        <div className="auth-input-wrap">
          <span className="auth-input-icon"><IconPhone /></span>
          <input
            id="signup-phone"
            type="tel"
            className={`auth-input ${errors.phone ? 'error' : ''}`}
            placeholder="+91 98765 43210"
            value={form.phone}
            onChange={set('phone')}
            autoComplete="tel"
          />
        </div>
        {errors.phone && <span className="auth-error-msg">{errors.phone}</span>}
      </div>

      {/* Password */}
      <div className="auth-field">
        <label className="auth-label" htmlFor="signup-password">Password</label>
        <div className="auth-input-wrap">
          <span className="auth-input-icon"><IconLock /></span>
          <input
            id="signup-password"
            type={showPass ? 'text' : 'password'}
            className={`auth-input ${errors.password ? 'error' : ''}`}
            placeholder="Min. 8 characters"
            value={form.password}
            onChange={set('password')}
            autoComplete="new-password"
          />
          <button
            type="button"
            className="auth-input-toggle"
            onClick={() => setShowPass(v => !v)}
            aria-label={showPass ? 'Hide password' : 'Show password'}
          >
            <IconEye off={showPass} />
          </button>
        </div>
        {errors.password && <span className="auth-error-msg">{errors.password}</span>}
        <PasswordStrength password={form.password} />
      </div>

      {/* Confirm */}
      <div className="auth-field">
        <label className="auth-label" htmlFor="signup-confirm">Confirm password</label>
        <div className="auth-input-wrap">
          <span className="auth-input-icon"><IconLock /></span>
          <input
            id="signup-confirm"
            type={showConfirm ? 'text' : 'password'}
            className={`auth-input ${errors.confirm ? 'error' : ''}`}
            placeholder="Re-enter your password"
            value={form.confirm}
            onChange={set('confirm')}
            autoComplete="new-password"
          />
          <button
            type="button"
            className="auth-input-toggle"
            onClick={() => setShowConfirm(v => !v)}
            aria-label={showConfirm ? 'Hide password' : 'Show password'}
          >
            <IconEye off={showConfirm} />
          </button>
        </div>
        {errors.confirm && <span className="auth-error-msg">{errors.confirm}</span>}
      </div>

      {/* Submit */}
      <button type="submit" className="auth-submit" id="signup-submit-btn" disabled={loading}>
        {loading ? <span className="auth-submit-spinner" /> : null}
        {loading ? 'Creating account...' : 'Create Account'}
      </button>

      <p className="auth-terms">
        By creating an account you agree to our{' '}
        <a href="#">Terms of Service</a> and{' '}
        <a href="#">Privacy Policy</a>.
      </p>
    </form>
  );
}

/* ---- Success Screen ---- */
function SuccessScreen({ type, userName, onContinue }) {
  return (
    <div className="auth-success">
      <div className="auth-success-icon">☕</div>
      <h2 className="auth-success-title">
        {type === 'login' ? 'Welcome back!' : 'Welcome to Spill The Beans!'}
      </h2>
      <p className="auth-success-sub">
        {type === 'login'
          ? `Good to see you again, ${userName}. Your coffee awaits.`
          : `Your account has been created. Let's find your perfect brew.`}
      </p>
      <button className="auth-submit" style={{ width: '100%', marginTop: '0.5rem' }} onClick={onContinue} id="auth-continue-btn">
        Explore Coffee →
      </button>
    </div>
  );
}

/* ---- Main Page ---- */
export default function Auth() {
  const [tab, setTab] = useState('login');
  const [done, setDone] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleSuccess = useCallback((type) => {
    setDone(type);
  }, []);

  const handleContinue = useCallback(() => {
    navigate('/shop');
  }, [navigate]);

  return (
    <>
      <Helmet>
        <title>
          {tab === 'login' ? 'Sign In' : 'Create Account'} | Spill The Beans
        </title>
        <meta
          name="description"
          content="Sign in or create your Spill The Beans account to track orders, save favourites, and get exclusive offers on premium Indian coffee."
        />
      </Helmet>

      <div className="auth-page">
        {/* Left — Visual Panel */}
        <div className="auth-visual">
          <div className="auth-visual__bg" />
          <div className="auth-visual__grain" />
          <div className="auth-visual__orb auth-visual__orb--1" />
          <div className="auth-visual__orb auth-visual__orb--2" />

          <div className="auth-visual__content">
            <div className="auth-visual__icon">☕</div>
            <h1 className="auth-visual__title">
              Your perfect brew,<br />
              <span>starts here.</span>
            </h1>
            <p className="auth-visual__subtitle">
              Join thousands of coffee lovers discovering India's finest single-origin and specialty roasts.
            </p>

            <div className="auth-visual__badges">
              <div className="auth-visual__badge">
                <span className="auth-visual__badge-icon">🚚</span>
                <span>Free delivery on orders above ₹599</span>
              </div>
              <div className="auth-visual__badge">
                <span className="auth-visual__badge-icon">🎁</span>
                <span>Exclusive member-only bundles & discounts</span>
              </div>
              <div className="auth-visual__badge">
                <span className="auth-visual__badge-icon">🌍</span>
                <span>Ethically sourced from 8+ Indian origins</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right — Form Panel */}
        <div className="auth-form-panel">
          <div className="auth-form-wrap">
            {done ? (
              <SuccessScreen
                type={done}
                userName={user?.name || 'there'}
                onContinue={handleContinue}
              />
            ) : (
              <>
                {/* Tabs */}
                <div className="auth-tabs" role="tablist">
                  <button
                    role="tab"
                    id="tab-login"
                    aria-selected={tab === 'login'}
                    className={`auth-tab ${tab === 'login' ? 'active' : ''}`}
                    onClick={() => setTab('login')}
                  >
                    Sign In
                  </button>
                  <button
                    role="tab"
                    id="tab-signup"
                    aria-selected={tab === 'signup'}
                    className={`auth-tab ${tab === 'signup' ? 'active' : ''}`}
                    onClick={() => setTab('signup')}
                  >
                    Create Account
                  </button>
                </div>

                {tab === 'login' ? (
                  <>
                    <h2 className="auth-form-title">Welcome back</h2>
                    <p className="auth-form-sub">Sign in to your Spill The Beans account</p>

                    {/* Social */}
                    <div className="auth-social">
                      <button className="auth-social-btn" id="google-login-btn" type="button">
                        <IconGoogle />
                        Continue with Google
                      </button>
                    </div>

                    <div className="auth-divider">OR</div>

                    <LoginForm onSuccess={handleSuccess} />
                  </>
                ) : (
                  <>
                    <h2 className="auth-form-title">Create account</h2>
                    <p className="auth-form-sub">Start your coffee journey today</p>

                    {/* Social */}
                    <div className="auth-social">
                      <button className="auth-social-btn" id="google-signup-btn" type="button">
                        <IconGoogle />
                        Sign up with Google
                      </button>
                    </div>

                    <div className="auth-divider">OR</div>

                    <SignupForm onSuccess={handleSuccess} />
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
