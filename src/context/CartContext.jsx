import { createContext, useState, useEffect, useContext } from 'react';
import { useAuth } from './AuthContext';
import axios from 'axios';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const { isAuthenticated, accessToken, user } = useAuth();
  const [items, setItems] = useState([]);
  const [subtotal, setSubtotal] = useState(0);
  const [itemCount, setItemCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Load cart on mount
  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    } else {
      loadLocalCart();
    }
  }, [isAuthenticated]);

  // Calculate subtotal and item count
  useEffect(() => {
    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const count = items.reduce((sum, item) => sum + item.quantity, 0);
    setSubtotal(total);
    setItemCount(count);
  }, [items]);

  const loadLocalCart = () => {
    try {
      const localCart = localStorage.getItem('cart');
      if (localCart) {
        setItems(JSON.parse(localCart));
      }
    } catch (error) {
      console.error('Error loading local cart:', error);
    }
  };

  const saveLocalCart = (cartItems) => {
    try {
      localStorage.setItem('cart', JSON.stringify(cartItems));
    } catch (error) {
      console.error('Error saving local cart:', error);
    }
  };

  const fetchCart = async () => {
    if (!accessToken) return;

    setIsLoading(true);
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/cart`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (response.data.success) {
        setItems(response.data.cart.items || []);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addToCart = async (productId, price, quantity = 1, variant = null) => {
    try {
      if (isAuthenticated && accessToken) {
        // Add to backend cart
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/cart/items`,
          { productId, price, quantity, variant },
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );

        if (response.data.success) {
          setItems(response.data.cart.items);
          return { success: true };
        }
      } else {
        // Add to local cart
        const existingItemIndex = items.findIndex(
          (item) => item.product === productId && item.variant === variant
        );

        let newItems;
        if (existingItemIndex >= 0) {
          newItems = [...items];
          newItems[existingItemIndex].quantity += quantity;
        } else {
          newItems = [...items, { product: productId, variant, quantity, price }];
        }

        setItems(newItems);
        saveLocalCart(newItems);
        return { success: true };
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      return { success: false, message: 'Failed to add item to cart' };
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    try {
      if (isAuthenticated && accessToken) {
        const response = await axios.put(
          `${import.meta.env.VITE_API_URL}/cart/items/${itemId}`,
          { quantity },
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );

        if (response.data.success) {
          setItems(response.data.cart.items);
          return { success: true };
        }
      } else {
        const newItems = items.map((item) =>
          item._id === itemId ? { ...item, quantity } : item
        );
        setItems(newItems);
        saveLocalCart(newItems);
        return { success: true };
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
      return { success: false, message: 'Failed to update quantity' };
    }
  };

  const removeItem = async (itemId) => {
    try {
      if (isAuthenticated && accessToken) {
        const response = await axios.delete(
          `${import.meta.env.VITE_API_URL}/cart/items/${itemId}`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );

        if (response.data.success) {
          setItems(response.data.cart.items);
          return { success: true };
        }
      } else {
        const newItems = items.filter((item) => item._id !== itemId);
        setItems(newItems);
        saveLocalCart(newItems);
        return { success: true };
      }
    } catch (error) {
      console.error('Error removing item:', error);
      return { success: false, message: 'Failed to remove item' };
    }
  };

  const clearCart = async () => {
    try {
      if (isAuthenticated && accessToken) {
        const response = await axios.delete(
          `${import.meta.env.VITE_API_URL}/cart`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );

        if (response.data.success) {
          setItems([]);
          return { success: true };
        }
      } else {
        setItems([]);
        localStorage.removeItem('cart');
        return { success: true };
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
      return { success: false, message: 'Failed to clear cart' };
    }
  };

  const mergeGuestCart = async () => {
    try {
      const localCart = localStorage.getItem('cart');
      if (localCart && accessToken) {
        const guestItems = JSON.parse(localCart);

        // Add each guest cart item to user cart
        for (const item of guestItems) {
          await addToCart(item.product, item.price, item.quantity, item.variant);
        }

        // Clear local cart
        localStorage.removeItem('cart');
      }
    } catch (error) {
      console.error('Error merging cart:', error);
    }
  };

  const value = {
    items,
    subtotal,
    itemCount,
    isLoading,
    addToCart,
    updateQuantity,
    removeItem,
    clearCart,
    mergeGuestCart,
    fetchCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export default CartContext;
