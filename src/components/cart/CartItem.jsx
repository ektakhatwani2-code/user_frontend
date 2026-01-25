import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiTrash2, FiMinus, FiPlus } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { useCart } from '../../context/CartContext';

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
    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 py-4 sm:py-6 border-b border-border">
      {/* Product Image */}
      <Link
        to={`/product/${productSlug}`}
        className="flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 border border-border rounded-lg overflow-hidden hover:opacity-75 transition-opacity"
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
        <div className="flex items-start justify-between gap-2 sm:gap-4">
          <div className="flex-1 min-w-0">
            <Link
              to={`/product/${productSlug}`}
              className="text-sm sm:text-base md:text-lg font-medium text-text-primary hover:text-primary transition-colors line-clamp-2"
            >
              {productTitle}
            </Link>

            {/* Variant */}
            {item.variant && (
              <p className="text-xs sm:text-sm text-text-body mt-1">
                Size: <span className="font-medium">{item.variant}</span>
              </p>
            )}

            {/* Price - Mobile */}
            <p className="text-sm sm:text-base font-semibold text-primary mt-1 sm:mt-2">
              ₹{productPrice.toLocaleString()}
            </p>
          </div>

          {/* Remove Button - Desktop */}
          <button
            onClick={handleRemove}
            disabled={removing}
            className="hidden md:flex items-center gap-2 text-sm text-text-body hover:text-red-600 transition-colors disabled:opacity-50 flex-shrink-0"
            aria-label="Remove item"
          >
            <FiTrash2 size={18} />
            <span>{removing ? 'Removing...' : 'Remove'}</span>
          </button>
        </div>

        {/* Quantity Controls & Total */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-3 sm:mt-4 gap-3 sm:gap-4">
          {/* Quantity Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm text-text-body mr-1 sm:mr-2 hidden xs:inline">Qty:</span>
            <div className="flex items-center border border-border rounded">
              <button
                onClick={() => handleUpdateQuantity(item.quantity - 1)}
                disabled={updating || item.quantity <= 1}
                className="p-1.5 sm:p-2 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Decrease quantity"
              >
                <FiMinus size={14} className="sm:hidden" />
                <FiMinus size={16} className="hidden sm:block" />
              </button>
              <span className="px-2 sm:px-4 py-1.5 sm:py-2 text-center min-w-[2rem] sm:min-w-[3rem] text-sm sm:text-base font-medium">
                {item.quantity}
              </span>
              <button
                onClick={() => handleUpdateQuantity(item.quantity + 1)}
                disabled={updating}
                className="p-1.5 sm:p-2 hover:bg-gray-100 transition-colors disabled:opacity-50"
                aria-label="Increase quantity"
              >
                <FiPlus size={14} className="sm:hidden" />
                <FiPlus size={16} className="hidden sm:block" />
              </button>
            </div>
          </div>

          {/* Item Total */}
          <div className="flex items-center justify-between sm:justify-end sm:text-right">
            <p className="text-xs sm:text-sm text-text-body sm:hidden">Subtotal:</p>
            <p className="hidden sm:block text-sm text-text-body">Subtotal</p>
            <p className="text-base sm:text-lg md:text-xl font-bold text-text-primary sm:mt-0 ml-2 sm:ml-0">
              ₹{itemTotal.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Remove Button - Mobile/Tablet */}
        <button
          onClick={handleRemove}
          disabled={removing}
          className="md:hidden flex items-center gap-1.5 text-xs sm:text-sm text-red-600 hover:text-red-700 transition-colors mt-3 disabled:opacity-50"
        >
          <FiTrash2 size={14} className="sm:hidden" />
          <FiTrash2 size={16} className="hidden sm:block" />
          <span>{removing ? 'Removing...' : 'Remove'}</span>
        </button>
      </div>
    </div>
  );
};

export default CartItem;
