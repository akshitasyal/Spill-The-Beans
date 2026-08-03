import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useUser, useClerk } from '@clerk/clerk-react';

const AuthContext = createContext(null);
const IS_CLERK_ACTIVE = !!import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

export function AuthProvider({ children }) {
  // Clerk hooks (safely accessed when Clerk is wrapped)
  let clerkUserObj = null;
  let clerkSignOut = null;
  
  try {
    if (IS_CLERK_ACTIVE) {
      const clerkUser = useUser();
      const clerk = useClerk();
      clerkUserObj = clerkUser?.user;
      clerkSignOut = clerk?.signOut;
    }
  } catch (err) {
    console.warn('Clerk context not found, fallback to standard auth context.', err);
  }

  const [localUser, setLocalUser] = useState(() => {
    try {
      const stored = localStorage.getItem('stb_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [authModal, setAuthModal] = useState({
    isOpen: false,
    message: '',
    redirectUrl: null,
    onAuthSuccess: null,
  });

  // Effective active user
  const effectiveUser = clerkUserObj
    ? {
        id: clerkUserObj.id,
        clerkId: clerkUserObj.id,
        email: clerkUserObj.primaryEmailAddress?.emailAddress || '',
        name: clerkUserObj.fullName || clerkUserObj.firstName || 'Coffee Enthusiast',
        role: clerkUserObj.publicMetadata?.role || 'CUSTOMER',
      }
    : localUser;

  const login = useCallback((userData) => {
    const u = { ...userData, loginAt: Date.now() };
    localStorage.setItem('stb_user', JSON.stringify(u));
    setLocalUser(u);
  }, []);

  const logout = useCallback(async () => {
    if (clerkSignOut) {
      try { await clerkSignOut(); } catch (e) { console.error(e); }
    }
    localStorage.removeItem('stb_user');
    setLocalUser(null);
  }, [clerkSignOut]);

  const openAuthModal = useCallback(({ message = '', redirectUrl = null, onAuthSuccess = null } = {}) => {
    setAuthModal({
      isOpen: true,
      message,
      redirectUrl,
      onAuthSuccess,
    });
  }, []);

  const closeAuthModal = useCallback(() => {
    setAuthModal({
      isOpen: false,
      message: '',
      redirectUrl: null,
      onAuthSuccess: null,
    });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user: effectiveUser,
        isLoggedIn: !!effectiveUser,
        login,
        logout,
        authModal,
        openAuthModal,
        closeAuthModal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
