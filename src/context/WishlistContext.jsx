import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';

const WishlistContext = createContext(null);
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export const WishlistProvider = ({ children }) => {
  const { user, isLoggedIn, openAuthModal } = useAuth();
  const [wishlist, setWishlist] = useState([]);

  // Fetch wishlist from PostgreSQL backend when logged in
  const fetchWishlist = useCallback(async () => {
    if (!user) return;
    try {
      const clerkId = user.clerkId || user.id;
      const res = await fetch(`${API_BASE}/api/wishlist`, {
        headers: { 'x-clerk-id': clerkId },
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        // Data format: array of wishlist records or products
        const productIds = data.data.map(item => item.productId || item.product?.id || item.id);
        setWishlist(productIds);
      }
    } catch (err) {
      console.error('Failed to fetch wishlist:', err);
    }
  }, [user]);

  useEffect(() => {
    if (isLoggedIn && user) {
      fetchWishlist();
    } else {
      setWishlist([]);
    }
  }, [isLoggedIn, user, fetchWishlist]);

  const toggleWishlist = async (productId) => {
    if (!isLoggedIn || !user) {
      openAuthModal({
        message: 'Please sign in to save items to your wishlist.',
      });
      return false;
    }

    // Optimistic UI update
    const isCurrentlyWishlisted = wishlist.includes(productId);
    setWishlist(prev =>
      isCurrentlyWishlisted
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );

    try {
      const clerkId = user.clerkId || user.id;
      const res = await fetch(`${API_BASE}/api/wishlist/toggle`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-clerk-id': clerkId,
        },
        body: JSON.stringify({ productId }),
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        const productIds = data.data.map(item => item.productId || item.product?.id || item.id);
        setWishlist(productIds);
      }
      return true;
    } catch (err) {
      console.error('Failed to toggle wishlist:', err);
      // Revert optimistic update
      fetchWishlist();
      return false;
    }
  };

  const isWishlisted = (productId) => wishlist.includes(productId);

  return (
    <WishlistContext.Provider value={{ wishlist, toggleWishlist, isWishlisted, fetchWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider');
  return ctx;
};
