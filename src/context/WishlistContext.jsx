import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import api from '../services/api';

const WishlistContext = createContext(null);

export const useWishlist = () => {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider');
  return ctx;
};

export const WishlistProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  // We only need the *set* of product IDs in the wishlist to render the heart
  // state on cards/PDP. The full populated list lives on /account/wishlist.
  const [ids, setIds] = useState(new Set());
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!isAuthenticated) {
      setIds(new Set());
      return;
    }
    try {
      setLoading(true);
      const res = await api.get('/users/wishlist');
      if (res.data?.success) {
        const list = res.data.wishlist || [];
        // Server returns populated product objects when authed. Fall back
        // to raw ids if the shape ever changes.
        const next = new Set(
          list.map((p) => (typeof p === 'string' ? p : p?._id)).filter(Boolean)
        );
        setIds(next);
      }
    } catch (err) {
      console.error('Wishlist refresh failed:', err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const isInWishlist = useCallback((productId) => ids.has(productId), [ids]);

  const add = useCallback(
    async (productId) => {
      // Optimistic — flip immediately, roll back on failure.
      setIds((prev) => new Set(prev).add(productId));
      try {
        await api.post(`/users/wishlist/${productId}`);
        return { success: true };
      } catch (err) {
        // Server says already-in-wishlist? Keep it; otherwise revert.
        const msg = err.response?.data?.message || '';
        if (!/already/i.test(msg)) {
          setIds((prev) => {
            const next = new Set(prev);
            next.delete(productId);
            return next;
          });
        }
        return { success: false, message: msg || 'Could not add to wishlist' };
      }
    },
    []
  );

  const remove = useCallback(async (productId) => {
    setIds((prev) => {
      const next = new Set(prev);
      next.delete(productId);
      return next;
    });
    try {
      await api.delete(`/users/wishlist/${productId}`);
      return { success: true };
    } catch (err) {
      // Roll back on real failure.
      setIds((prev) => new Set(prev).add(productId));
      return {
        success: false,
        message: err.response?.data?.message || 'Could not remove from wishlist',
      };
    }
  }, []);

  const toggle = useCallback(
    async (productId) => {
      if (ids.has(productId)) return remove(productId);
      return add(productId);
    },
    [ids, add, remove]
  );

  return (
    <WishlistContext.Provider
      value={{ ids, loading, isInWishlist, add, remove, toggle, refresh }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export default WishlistContext;
