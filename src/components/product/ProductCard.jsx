import { Link } from 'react-router-dom';
import { FiHeart, FiShoppingCart } from 'react-icons/fi';
import Badge from '../common/Badge';
import Button from '../common/Button';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { toast } from 'react-toastify';

const ProductCard = ({ product, showQuickAdd = true }) => {
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();

  const calculateDiscount = () => {
    if (product.compareAtPrice && product.price) {
      return Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100);
    }
    return 0;
  };

  const handleQuickAdd = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (isOutOfStock) {
      toast.error('Product is out of stock');
      return;
    }

    const result = await addToCart(product._id, product.price, 1, null);

    if (result.success) {
      toast.success('Added to cart!');
    } else {
      toast.error(result.message || 'Failed to add to cart');
    }
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.info('Please login to add to wishlist');
      return;
    }

    // TODO: Implement wishlist functionality
    toast.info('Wishlist feature coming soon!');
  };

  const discount = calculateDiscount();
  const isOutOfStock = product.inventory?.trackQuantity && product.inventory?.quantity === 0 && !product.inventory?.allowBackorder;
  const isLowStock = product.inventory?.trackQuantity && product.inventory?.quantity > 0 && product.inventory?.quantity < 5;

  return (
    <Link to={`/product/${product.slug}`} className="group block">
      <div className="bg-white rounded-lg border border-border overflow-hidden hover:shadow-lg transition-all duration-300">
        {/* Product Image */}
        <div className="relative overflow-hidden aspect-square bg-gray-100">
          {product.images && product.images.length > 0 ? (
            <img
              src={product.images[0].url}
              alt={product.images[0].alt || product.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-200">
              <span className="text-gray-400 text-xs sm:text-sm">No Image</span>
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-1.5 sm:top-2 left-1.5 sm:left-2 flex flex-col gap-1 sm:gap-2">
            {discount > 0 && (
              <Badge variant="sale" size="sm" className="text-xs px-2 py-1">
                {discount}% OFF
              </Badge>
            )}
            {isOutOfStock && (
              <Badge variant="danger" size="sm" className="text-xs px-2 py-1">
                Out of Stock
              </Badge>
            )}
            {isLowStock && (
              <Badge variant="warning" size="sm" className="text-xs px-2 py-1">
                Low Stock
              </Badge>
            )}
            {product.featured && (
              <Badge variant="primary" size="sm" className="text-xs px-2 py-1">
                Featured
              </Badge>
            )}
          </div>

          {/* Wishlist Button */}
          <button
            onClick={handleWishlist}
            className="absolute top-1.5 sm:top-2 right-1.5 sm:right-2 p-1.5 sm:p-2 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-100"
            aria-label="Add to wishlist"
          >
            <FiHeart size={16} className="sm:hidden text-text-primary" />
            <FiHeart size={18} className="hidden sm:block text-text-primary" />
          </button>

          {/* Quick Add Button */}
          {showQuickAdd && !isOutOfStock && (
            <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                onClick={handleQuickAdd}
                className="w-full flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm"
                size="sm"
              >
                <FiShoppingCart size={14} className="sm:hidden" />
                <FiShoppingCart size={16} className="hidden sm:block" />
                <span className="hidden sm:inline">Quick Add</span>
                <span className="sm:hidden">Add</span>
              </Button>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="p-3 sm:p-4">
          {/* Title */}
          <h3 className="font-medium text-text-primary mb-1 sm:mb-2 line-clamp-2 min-h-[36px] sm:min-h-[42px]" style={{ fontSize: '12px' }}>
            {product.title}
          </h3>

          {/* Collections */}
          {product.collections && product.collections.length > 0 && (
            <p className="text-text-body mb-1 sm:mb-2" style={{ fontSize: '12px' }}>
              {product.collections[0].name}
            </p>
          )}

          {/* Price */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            <span className="font-semibold text-primary" style={{ fontSize: '14px' }}>
              ₹{product.price.toLocaleString()}
            </span>
            {product.compareAtPrice && (
              <span className="text-gray-500 line-through" style={{ fontSize: '12px' }}>
                ₹{product.compareAtPrice.toLocaleString()}
              </span>
            )}
          </div>

          {/* Stock Info */}
          {isLowStock && (
            <p className="text-xs text-yellow-600 mt-1 sm:mt-2">
              Only {product.inventory.quantity} left!
            </p>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
