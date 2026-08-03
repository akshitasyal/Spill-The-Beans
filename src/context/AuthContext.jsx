import { createContext, useContext, useState, useCallback, useEffect } from 'react';

const AuthContext = createContext(null);
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('stb_token') || null);
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('stb_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(false);

  const [authModal, setAuthModal] = useState({
    isOpen: false,
    message: '',
    redirectUrl: null,
    onAuthSuccess: null,
  });

  // Verify JWT token & hydrate current user on mount / token change
  useEffect(() => {
    async function verifySession() {
      const currentToken = localStorage.getItem('stb_token');
      if (!currentToken) {
        setUser(null);
        return;
      }

      try {
        const res = await fetch(`${API_BASE}/api/auth/me`, {
          headers: { Authorization: `Bearer ${currentToken}` },
        });
        const data = await res.json();
        if (data.success && data.user) {
          setUser(data.user);
          localStorage.setItem('stb_user', JSON.stringify(data.user));
        } else {
          // Token expired or invalid
          localStorage.removeItem('stb_token');
          localStorage.removeItem('stb_user');
          setToken(null);
          setUser(null);
        }
      } catch (err) {
        console.warn('Failed to verify user session:', err);
      }
    }

    verifySession();
  }, []);

  // Login handler — accepts (email, password) OR ({ email, password })
  const login = useCallback(async (emailOrObj, passwordArg) => {
    let email, password;
    if (typeof emailOrObj === 'object' && emailOrObj !== null) {
      email = emailOrObj.email;
      password = emailOrObj.password;
    } else {
      email = emailOrObj;
      password = passwordArg;
    }

    // If only email is provided (e.g. mock login), simulate or attempt default password
    if (!password) password = 'password123';

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Login failed. Please check your credentials.');
      }

      const authToken = data.token;
      const authUser = data.user;

      localStorage.setItem('stb_token', authToken);
      localStorage.setItem('stb_user', JSON.stringify(authUser));
      setToken(authToken);
      setUser(authUser);

      return authUser;
    } finally {
      setLoading(false);
    }
  }, []);

  // Register / Signup handler
  const register = useCallback(async (userData) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Registration failed. Please try again.');
      }

      const authToken = data.token;
      const authUser = data.user;

      localStorage.setItem('stb_token', authToken);
      localStorage.setItem('stb_user', JSON.stringify(authUser));
      setToken(authToken);
      setUser(authUser);

      return authUser;
    } finally {
      setLoading(false);
    }
  }, []);

  // Logout handler
  const logout = useCallback(async () => {
    try {
      const currentToken = localStorage.getItem('stb_token');
      if (currentToken) {
        await fetch(`${API_BASE}/api/auth/logout`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${currentToken}` },
        });
      }
    } catch (_) {}

    localStorage.removeItem('stb_token');
    localStorage.removeItem('stb_user');
    setToken(null);
    setUser(null);
  }, []);

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
        user,
        token,
        isLoggedIn: !!user,
        loading,
        login,
        register,
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

