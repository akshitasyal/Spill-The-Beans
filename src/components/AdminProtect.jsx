import { useUser, RedirectToSignIn } from '@clerk/clerk-react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Clerk Key Check
const isClerkEnabled = !!import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

export default function AdminProtect({ children }) {
  if (isClerkEnabled) {
    return <ClerkAdminGuard>{children}</ClerkAdminGuard>;
  }

  return <MockAdminGuard>{children}</MockAdminGuard>;
}

function ClerkAdminGuard({ children }) {
  const { isLoaded, isSignedIn, user } = useUser();

  if (!isLoaded) {
    return (
      <div style={loadingStyles}>
        <span style={{ fontSize: '2.5rem' }}>☕</span>
        <p>Loading Admin Session...</p>
      </div>
    );
  }

  if (!isSignedIn) {
    return <RedirectToSignIn />;
  }

  // Clerk roles are typically saved in publicMetadata
  const role = user?.publicMetadata?.role || 'CUSTOMER';
  if (role !== 'ADMIN') {
    return <Navigate to="/" replace />;
  }

  return children;
}

function MockAdminGuard({ children }) {
  const { user, isLoggedIn } = useAuth();

  if (!isLoggedIn || !user) {
    return <Navigate to="/auth" replace />;
  }

  // A simple test check: email containing 'admin' or explicit 'role === ADMIN'
  const email = user.email || '';
  const isMockAdmin = user.role === 'ADMIN' || email.toLowerCase().includes('admin');

  if (!isMockAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
}

const loadingStyles = {
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '1rem',
  background: '#120404',
  color: '#FDE0C1',
  fontFamily: 'sans-serif'
};
