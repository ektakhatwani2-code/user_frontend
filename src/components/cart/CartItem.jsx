import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiTrash2, FiMinus, FiPlus } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { useCart } from '../../context/CartContext';
import Button from '../common/Button';

const CartItem = ({ item }) => {
  const { updateQuantity, removeItem } = useCart();
  const [updating, setUpdating] = useState(false);
  const [removing, setRemoving] = useState(false);

  // Handle product data - could be populated or just ID
  const product = item.product;
  const productTitle = product?.title || item.title || 'Product';
  const productSlug = product?.slug || '';
  const productImage = product?.images?.[0]?.url || item.image || '';
  const productPrice = item.price || product?.price || 0;

  const handleUpdateQuantity = async (newQuantity) => {
    if (newQuantity < 1) return;

    setUpdating(true);
    try {
      const result = await updateQuantity(item._id, newQuantity);

      if (!result.success) {
        toast.error(result.message || 'Failed to update quantity');
      }
    } catch (error) {
      toast.error('Failed to update quantity');
    } finally {
      setUpdating(false);
    }
  };

  const handleRemove = async () => {
    if (removing) return;

    setRemoving(true);
    try {
      const result = await removeItem(item._id);

      if (result.success) {
        toast.success('Item removed from cart');
      } else {
        toast.error(result.message || 'Failed to remove item');
      }
    } catch (error) {
      toast.error('Failed to remove item');
    } finally {
      setRemoving(false);
    }
  };

  const itemTotal = productPrice * item.quantity;

  return (
    <div className="flex gap-4 py-6 border-b border-border">
      {/* Product Image */}
      <Link
        to={`/product/${productSlug}`}
        className="flex-shrink-0 w-24 h-24 md:w-32 md:h-32 border border-border rounded-lg overflow-hidden hover:opacity-75 transition-opacity"
      >
        {productImage ? (
          <img
            src={productImage}
            alt={productTitle}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-400 text-xs">No Image</span>
          </div>
        )}
      </Link>

      {/* Product Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <Link
              to={`/product/${productSlug}`}
              className="text-lg font-medium text-text-primary hover:text-primary transition-colors line-clamp-2"
            >
              {productTitle}
            </Link>

            {/* Variant */}
            {item.variant && (
              <p className="text-sm text-text-body mt-1">
                Size: <span className="font-medium">{item.variant}</span>
              </p>
            )}

            {/* Price */}
            <p className="text-lg font-semibold text-primary mt-2">
              ₹{productPrice.toLocaleString()}
            </p>
          </div>

          {/* Remove Button - Desktop */}
          <button
            onClick={handleRemove}
            disabled={removing}
            className="hidden md:flex items-center gap-2 text-sm text-text-body hover:text-red-600 transition-colors disabled:opacity-50"
            aria-label="Remove item"
          >
            <FiTrash2 size={18} />
            <span>{removing ? 'Removing...' : 'Remove'}</span>
          </button>
        </div>

        {/* Quantity Controls & Total */}
        <div className="flex items-center justify-between mt-4 gap-4">
          {/* Quantity Selector */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-text-body mr-2">Quantity:</span>
            <div className="flex items-center border border-border rounded">
              <button
                onClick={() => handleUpdateQuantity(item.quantity - 1)}
                disabled={updating || item.quantity <= 1}
                className="p-2 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Decrease quantity"
              >
                <FiMinus size={16} />
              </button>
              <span className="px-4 py-2 text-center min-w-[3rem] font-medium">
                {item.quantity}
              </span>
              <button
                onClick={() => handleUpdateQuantity(item.quantity + 1)}
                disabled={updating}
                className="p-2 hover:bg-gray-100 transition-colors disabled:opacity-50"
                aria-label="Increase quantity"
              >
                <FiPlus size={16} />
              </button>
            </div>
          </div>

          {/* Item Total */}
          <div className="text-right">
            <p className="text-sm text-text-body">Subtotal</p>
            <p className="text-xl font-bold text-text-primary">
              ₹{itemTotal.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Remove Button - Mobile */}
        <button
          onClick={handleRemove}
          disabled={removing}
          className="md:hidden flex items-center gap-2 text-sm text-red-600 hover:text-red-700 transition-colors mt-3 disabled:opacity-50"
        >
          <FiTrash2 size={16} />
          <span>{removing ? 'Removing...' : 'Remove from cart'}</span>
        </button>
      </div>
    </div>
  );
};

export default CartItem;
