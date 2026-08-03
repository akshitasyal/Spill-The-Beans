import { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'SET_ITEMS':
      return { ...state, items: action.payload };

    case 'ADD_ITEM': {
      const existing = state.items.find(i => (i.id || i.productId) === (action.payload.id || action.payload.productId));
      if (existing) {
        return {
          ...state,
          items: state.items.map(i =>
            (i.id || i.productId) === (action.payload.id || action.payload.productId)
              ? { ...i, quantity: Math.min(i.quantity + 1, 10) }
              : i
          ),
        };
      }
      return { ...state, items: [...state.items, { ...action.payload, quantity: action.payload.quantity || 1 }] };
    }

    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter(i => (i.id || i.productId) !== action.payload && i.cartItemId !== action.payload),
      };

    case 'UPDATE_QUANTITY': {
      if (action.payload.quantity <= 0) {
        return {
          ...state,
          items: state.items.filter(i => (i.id || i.productId) !== action.payload.id && i.cartItemId !== action.payload.id),
        };
      }
      return {
        ...state,
        items: state.items.map(i =>
          (i.id || i.productId) === action.payload.id || i.cartItemId === action.payload.id
            ? { ...i, quantity: Math.min(action.payload.quantity, 10) }
            : i
        ),
      };
    }

    case 'CLEAR_CART':
      return { ...state, items: [] };

    case 'TOGGLE_DRAWER':
      return { ...state, isOpen: action.payload ?? !state.isOpen };

    default:
      return state;
  }
};

const initialState = {
  items: [],
  isOpen: false,
};

// Map backend DB cart item structure to client format
function formatDbCartItem(dbItem) {
  const prod = dbItem.product || {};
  return {
    cartItemId: dbItem.id,
    id: prod.id || dbItem.productId,
    productId: prod.id || dbItem.productId,
    name: prod.name || 'Coffee Product',
    slug: prod.slug || '',
    price: prod.salePrice || prod.price ? Math.round((prod.salePrice || prod.price) / (prod.price > 1000 ? 100 : 1)) : 0,
    originalPrice: prod.salePrice ? Math.round(prod.price / 100) : null,
    image: Array.isArray(prod.images) && prod.images.length ? prod.images[0] : '/images/products/classic-instant.png',
    quantity: dbItem.quantity,
    variant: dbItem.variant || null,
    stock: prod.stock ?? 50,
  };
}

export const CartProvider = ({ children }) => {
  const { user, token, isLoggedIn } = useAuth();

  const [state, dispatch] = useReducer(cartReducer, initialState, (init) => {
    try {
      const saved = localStorage.getItem('spill_the_beans_cart');
      return saved ? { ...init, items: JSON.parse(saved) } : init;
    } catch {
      return init;
    }
  });

  // Sync guest cart to LocalStorage when unauthenticated
  useEffect(() => {
    if (!isLoggedIn) {
      localStorage.setItem('spill_the_beans_cart', JSON.stringify(state.items));
    }
  }, [state.items, isLoggedIn]);

  // Merge LocalStorage cart into database cart
  const mergeCartWithBackend = useCallback(async (authUser) => {
    const activeUser = authUser || user;
    if (!activeUser) return;

    try {
      const savedLsCart = localStorage.getItem('spill_the_beans_cart');
      const lsItems = savedLsCart ? JSON.parse(savedLsCart) : [];

      const authToken = token || localStorage.getItem('stb_token');
      const res = await fetch(`${API_BASE}/api/cart/merge`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
        body: JSON.stringify({ items: lsItems }),
      });

      const data = await res.json();
      if (data.success && data.data?.items) {
        const formatted = data.data.items.map(formatDbCartItem);
        dispatch({ type: 'SET_ITEMS', payload: formatted });
        // Clear guest local storage after successful merge into PostgreSQL
        localStorage.removeItem('spill_the_beans_cart');
      }
    } catch (err) {
      console.error('Failed to merge cart with server:', err);
    }
  }, [user]);

  // Fetch logged in user's cart from PostgreSQL
  const fetchDbCart = useCallback(async () => {
    if (!user) return;
    try {
      const authToken = token || localStorage.getItem('stb_token');
      const res = await fetch(`${API_BASE}/api/cart`, {
        headers: {
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
      });
      const data = await res.json();
      if (data.success && data.data?.items) {
        const formatted = data.data.items.map(formatDbCartItem);
        dispatch({ type: 'SET_ITEMS', payload: formatted });
      }
    } catch (err) {
      console.error('Failed to fetch user cart:', err);
    }
  }, [user]);

  // On auth transition -> merge guest cart if items exist, or fetch DB cart
  useEffect(() => {
    if (isLoggedIn && user) {
      const savedLsCart = localStorage.getItem('spill_the_beans_cart');
      const lsItems = savedLsCart ? JSON.parse(savedLsCart) : [];

      if (lsItems.length > 0) {
        mergeCartWithBackend(user);
      } else {
        fetchDbCart();
      }
    }
  }, [isLoggedIn, user, mergeCartWithBackend, fetchDbCart]);

  // Add Item handler
  const addItem = async (product) => {
    dispatch({ type: 'ADD_ITEM', payload: product });

    if (isLoggedIn && user) {
      try {
        const authToken = token || localStorage.getItem('stb_token');
        await fetch(`${API_BASE}/api/cart/items`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
          },
          body: JSON.stringify({
            productId: product.id || product.productId,
            quantity: 1,
            variant: product.variant || null,
          }),
        });
      } catch (err) {
        console.error('Failed to sync add item to server:', err);
      }
    }
  };

  // Remove Item handler
  const removeItem = async (id) => {
    dispatch({ type: 'REMOVE_ITEM', payload: id });

    if (isLoggedIn && user) {
      try {
        const authToken = token || localStorage.getItem('stb_token');
        await fetch(`${API_BASE}/api/cart/items/${id}`, {
          method: 'DELETE',
          headers: {
            ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
          },
        });
      } catch (err) {
        console.error('Failed to sync remove item to server:', err);
      }
    }
  };

  // Update Quantity handler
  const updateQuantity = async (id, quantity) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } });

    if (isLoggedIn && user) {
      try {
        const authToken = token || localStorage.getItem('stb_token');
        await fetch(`${API_BASE}/api/cart/items/${id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
          },
          body: JSON.stringify({ quantity }),
        });
      } catch (err) {
        console.error('Failed to sync quantity to server:', err);
      }
    }
  };

  // Clear Cart handler
  const clearCart = async () => {
    dispatch({ type: 'CLEAR_CART' });
    localStorage.removeItem('spill_the_beans_cart');

    if (isLoggedIn && user) {
      try {
        const authToken = token || localStorage.getItem('stb_token');
        await fetch(`${API_BASE}/api/cart`, {
          method: 'DELETE',
          headers: {
            ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
          },
        });
      } catch (err) {
        console.error('Failed to clear cart on server:', err);
      }
    }
  };

  const toggleDrawer = (open) => dispatch({ type: 'TOGGLE_DRAWER', payload: open });

  const itemCount = state.items.reduce((sum, i) => sum + (Number(i.quantity) || 1), 0);
  const subtotal = state.items.reduce((sum, i) => sum + (Number(i.price) || 0) * (Number(i.quantity) || 1), 0);
  const savings = state.items.reduce((sum, i) =>
    i.originalPrice ? sum + (i.originalPrice - i.price) * (Number(i.quantity) || 1) : sum, 0);

  return (
    <CartContext.Provider value={{
      items: state.items,
      isOpen: state.isOpen,
      itemCount,
      subtotal,
      savings,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      toggleDrawer,
      mergeCartWithBackend,
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
