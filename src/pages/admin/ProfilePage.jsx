import { useState, useEffect } from 'react';
import { useUser, useClerk } from '@clerk/clerk-react';
import { SectionHeader } from './AdminLayout';
import { User, Lock, Shield, Camera, Save, ExternalLink } from 'lucide-react';

const isClerkEnabled = !!import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

// Mock admin profile for non-Clerk environments
const MOCK_PROFILE = {
  name: 'Admin User',
  email: 'admin@spillthebeans.in',
  role: 'Super Admin',
  joinedAt: '2024-01-15',
  lastLogin: new Date().toISOString(),
  avatarUrl: '',
  twoFactorEnabled: false
};

export function ProfilePageContent({ user, openUserProfile }) {
  const [profile, setProfile] = useState(MOCK_PROFILE);
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');
  const [twoFA, setTwoFA] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState('');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3500); };

  useEffect(() => {
    if (isClerkEnabled && user) {
      setFormName(user.fullName || '');
      setFormEmail(user.primaryEmailAddress?.emailAddress || '');
      setAvatarPreview(user.imageUrl || '');
    } else {
      const stored = JSON.parse(localStorage.getItem('stb_admin_profile') || 'null') || MOCK_PROFILE;
      setProfile(stored);
      setFormName(stored.name);
      setFormEmail(stored.email);
      setTwoFA(stored.twoFactorEnabled || false);
      setAvatarPreview(stored.avatarUrl || '');
    }
  }, [user]);

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      if (isClerkEnabled && user) {
        const [firstName, ...rest] = formName.trim().split(' ');
        await user.update({ firstName, lastName: rest.join(' ') });
        showToast('Profile updated via Clerk.');
      } else {
        const updated = { ...profile, name: formName, email: formEmail, twoFactorEnabled: twoFA };
        localStorage.setItem('stb_admin_profile', JSON.stringify(updated));
        setProfile(updated);
        showToast('Profile saved successfully.');
      }
    } catch (err) {
      showToast(`Error: ${err.message}`);
    }
    setSaving(false);
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setAvatarPreview(ev.target.result);
      if (!isClerkEnabled) {
        const updated = { ...profile, avatarUrl: ev.target.result };
        localStorage.setItem('stb_admin_profile', JSON.stringify(updated));
        showToast('Profile picture updated.');
      }
    };
    reader.readAsDataURL(file);
  };

  const displayName = isClerkEnabled && user ? user.fullName : profile.name;
  const displayEmail = isClerkEnabled && user ? user.primaryEmailAddress?.emailAddress : profile.email;
  const displayRole = 'Super Admin';
  const lastLogin = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <div>
      <SectionHeader title="Admin Profile" subtitle="Manage your personal information, security, and preferences." />

      <div style={pageGrid}>
        {/* Left — Profile Card */}
        <div style={profileCard}>
          {/* Avatar */}
          <div style={avatarSection}>
            <div style={avatarWrap}>
              {avatarPreview ? (
                <img src={avatarPreview} alt="Profile" style={avatarImg} />
              ) : (
                <div style={avatarFallback}><User size={36} color="#FFF" /></div>
              )}
              <label style={cameraBtn} title="Change profile picture">
                <Camera size={14} />
                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarChange} />
              </label>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-admin-bright)', marginBottom: '0.25rem' }}>{displayName}</div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-admin-muted)', marginBottom: '0.5rem' }}>{displayEmail}</div>
              <span style={roleBadge}>{displayRole}</span>
            </div>
          </div>

          {/* Stats */}
          <div style={profileStats}>
            <div style={statItem}>
              <span style={statValue}>Admin</span>
              <span style={statLabel}>Account Type</span>
            </div>
            <div style={statDivider} />
            <div style={statItem}>
              <span style={statValue}>{lastLogin}</span>
              <span style={statLabel}>Last Login</span>
            </div>
          </div>
        </div>

        {/* Right — Forms */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Personal Info */}
          <div style={formCard}>
            <h3 style={cardTitle}><User size={14} /> Personal Information</h3>
            <div style={fieldsGrid}>
              <FormField label="Full Name" value={formName} onChange={setFormName} placeholder="Your full name" />
              <FormField label="Email Address" value={formEmail} onChange={setFormEmail} type="email" placeholder="admin@example.com" disabled={isClerkEnabled} hint={isClerkEnabled ? 'Managed by Clerk — use Account button to change' : undefined} />
            </div>
            <button onClick={handleSaveProfile} style={saveBtn} disabled={saving}>
              <Save size={14} /> {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>

          {/* Password & Security */}
          <div style={formCard}>
            <h3 style={cardTitle}><Lock size={14} /> Password & Security</h3>
            {isClerkEnabled ? (
              <div>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-admin-muted)', margin: '0 0 1rem' }}>
                  Your account is managed by Clerk. Use the Clerk user portal to change your password, linked accounts, and security settings.
                </p>
                <button onClick={() => openUserProfile?.()} style={clerkBtn}>
                  <ExternalLink size={14} /> Open Account Settings
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <FormField label="Current Password" value="" onChange={() => {}} type="password" placeholder="Enter current password" />
                <FormField label="New Password" value="" onChange={() => {}} type="password" placeholder="Minimum 8 characters" />
                <FormField label="Confirm New Password" value="" onChange={() => {}} type="password" placeholder="Repeat new password" />
                <button style={saveBtn} onClick={() => showToast('Password change requires Clerk or backend integration.')}>
                  <Lock size={14} /> Update Password
                </button>
              </div>
            )}
          </div>

          {/* 2FA */}
          <div style={formCard}>
            <h3 style={cardTitle}><Shield size={14} /> Two-Factor Authentication</h3>
            <div style={twoFARow}>
              <div>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-admin-bright)', marginBottom: '0.2' }}>
                  {twoFA ? '🟢 2FA is Enabled' : '🔴 2FA is Disabled'}
                </div>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-admin-muted)', margin: 0 }}>
                  {twoFA ? 'Your account is protected with two-factor authentication via an authenticator app.' : 'Add an extra layer of security by enabling 2FA for your admin account.'}
                </p>
              </div>
              <button
                onClick={() => { setTwoFA(v => !v); showToast(twoFA ? '2FA disabled.' : '2FA setup would open in production — requires Clerk or TOTP provider.'); }}
                style={{ ...toggleBtn, background: twoFA ? 'var(--accent-admin-amber)' : 'rgba(253,224,193,0.06)' }}
              >
                <div style={{ ...toggleThumb, transform: twoFA ? 'translateX(20px)' : 'translateX(2px)' }} />
              </button>
            </div>
            {!twoFA && (
              <div style={twoFAHint}>
                <p style={{ margin: '0 0 0.5rem', fontSize: '0.8125rem', color: 'var(--text-admin-muted)' }}>
                  In production, enabling 2FA will prompt you to scan a QR code with your authenticator app (Google Authenticator, Authy, etc.)
                </p>
              </div>
            )}
          </div>

          {/* Active Sessions */}
          <div style={formCard}>
            <h3 style={cardTitle}><Shield size={14} /> Active Sessions</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {[
                { device: 'Chrome on Windows', location: 'Bengaluru, India', current: true, time: 'Now' },
                { device: 'Safari on iPhone', location: 'Mumbai, India', current: false, time: '2 hours ago' }
              ].map((session, i) => (
                <div key={i} style={sessionRow}>
                  <div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-admin-bright)' }}>
                      {session.device} {session.current && <span style={currentTag}>Current</span>}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-admin-muted)' }}>{session.location} · {session.time}</div>
                  </div>
                  {!session.current && (
                    <button onClick={() => showToast('Session revocation requires backend integration.')} style={revokeBtn}>Revoke</button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {toast && <div style={toastEl}>{toast}</div>}
    </div>
  );
}

function ProfilePageClerk() {
  const { user } = useUser();
  const { openUserProfile } = useClerk();
  return <ProfilePageContent user={user} openUserProfile={openUserProfile} />;
}

function ProfilePageMock() {
  return <ProfilePageContent user={null} openUserProfile={null} />;
}

export default function ProfilePage() {
  if (isClerkEnabled) {
    return <ProfilePageClerk />;
  }
  return <ProfilePageMock />;
}

function FormField({ label, value, onChange, type = 'text', placeholder, disabled, hint }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
      <label style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-admin-muted)', letterSpacing: '0.4px' }}>{label}</label>
      {hint && <div style={{ fontSize: '0.7rem', color: 'var(--text-admin-muted)', fontStyle: 'italic' }}>{hint}</div>}
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        style={{ padding: '0.5rem 0.75rem', background: disabled ? 'rgba(253,224,193,0.01)' : 'rgba(253,224,193,0.02)', border: '1px solid var(--border-admin)', borderRadius: '8px', color: disabled ? 'var(--text-admin-muted)' : 'var(--text-admin-bright)', fontSize: '0.8125rem', outline: 'none', width: '100%', boxSizing: 'border-box', cursor: disabled ? 'not-allowed' : 'text' }}
      />
    </div>
  );
}

// Styles
const pageGrid = { display: 'grid', gridTemplateColumns: '260px 1fr', gap: '1.5rem', alignItems: 'start' };
const profileCard = { background: 'var(--bg-admin-card)', border: '1px solid var(--border-admin)', borderRadius: '16px', padding: '1.5rem', position: 'sticky', top: '5rem' };
const avatarSection = { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' };
const avatarWrap = { position: 'relative', width: '96px', height: '96px' };
const avatarImg = { width: '96px', height: '96px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--accent-admin-amber)' };
const avatarFallback = { width: '96px', height: '96px', borderRadius: '50%', background: 'var(--accent-admin-amber)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(194,122,10,0.25)' };
const cameraBtn = { position: 'absolute', bottom: 0, right: 0, width: '28px', height: '28px', background: 'var(--bg-admin-card)', border: '1px solid var(--border-admin)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-admin-muted)' };
const roleBadge = { background: 'rgba(194,122,10,0.12)', color: 'var(--accent-admin-amber)', padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase' };
const profileStats = { borderTop: '1px solid var(--border-admin)', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' };
const statItem = { display: 'flex', flexDirection: 'column', gap: '0.1rem' };
const statValue = { fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-admin-bright)' };
const statLabel = { fontSize: '0.68rem', color: 'var(--text-admin-muted)', textTransform: 'uppercase', fontWeight: 600 };
const statDivider = { height: '1px', background: 'var(--border-admin)' };
const formCard = { background: 'var(--bg-admin-card)', border: '1px solid var(--border-admin)', borderRadius: '12px', padding: '1.25rem' };
const cardTitle = { fontSize: '0.8125rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--accent-admin-amber)', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '0.35rem', margin: '0 0 1rem 0' };
const fieldsGrid = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' };
const saveBtn = { display: 'flex', alignItems: 'center', gap: '0.35rem', background: 'var(--accent-admin-amber)', border: 'none', color: '#FFF', padding: '0.5rem 1rem', borderRadius: '8px', fontSize: '0.8125rem', fontWeight: 700, cursor: 'pointer' };
const clerkBtn = { display: 'flex', alignItems: 'center', gap: '0.35rem', background: 'none', border: '1px solid var(--border-admin)', color: 'var(--text-admin-muted)', padding: '0.5rem 0.9rem', borderRadius: '8px', fontSize: '0.8125rem', cursor: 'pointer', fontWeight: 600 };
const twoFARow = { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '0.75rem' };
const toggleBtn = { width: '44px', height: '24px', borderRadius: '12px', border: 'none', cursor: 'pointer', position: 'relative', flexShrink: 0 };
const toggleThumb = { position: 'absolute', top: '2px', width: '20px', height: '20px', borderRadius: '50%', background: '#FFF', transition: 'transform 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.3)' };
const twoFAHint = { background: 'rgba(253,224,193,0.02)', border: '1px dashed var(--border-admin)', borderRadius: '8px', padding: '0.75rem' };
const sessionRow = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.625rem 0.75rem', background: 'rgba(253,224,193,0.02)', borderRadius: '8px', border: '1px solid var(--border-admin)' };
const currentTag = { background: 'rgba(16,185,129,0.1)', color: '#10b981', fontSize: '0.65rem', fontWeight: 700, padding: '0.1rem 0.35rem', borderRadius: '4px', marginLeft: '0.4rem' };
const revokeBtn = { background: 'rgba(239,68,68,0.08)', border: 'none', color: '#ef4444', padding: '0.3rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' };
const toastEl = { position: 'fixed', bottom: '2rem', right: '2rem', background: '#2e7d32', color: '#FFF', padding: '0.75rem 1.25rem', borderRadius: '10px', fontSize: '0.8125rem', fontWeight: 600, zIndex: 1000, boxShadow: '0 4px 20px rgba(0,0,0,0.3)' };
