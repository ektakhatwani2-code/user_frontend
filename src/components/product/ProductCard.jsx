import { Link } from 'react-router-dom';
import { FiHeart, FiShoppingBag } from 'react-icons/fi';
import Badge from '../common/Badge';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { toast } from 'react-toastify';

const ProductCard = ({ product, showQuickAdd = true }) => {
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const { isInWishlist, toggle: toggleWishlist } = useWishlist();
  const wished = isInWishlist(product._id);

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
    if (result.success) toast.success('Added to cart!');
    else toast.error(result.message || 'Failed to add to cart');
  };

  const handleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.info('Please login to add to wishlist');
      return;
    }
    const wasWished = wished;
    const result = await toggleWishlist(product._id);
    if (result?.success) {
      toast.success(wasWished ? 'Removed from wishlist' : 'Added to wishlist');
    } else if (result?.message) {
      toast.error(result.message);
    }
  };

  const discount = calculateDiscount();
  const isOutOfStock =
    product.inventory?.trackQuantity &&
    product.inventory?.quantity === 0 &&
    !product.inventory?.allowBackorder;

  // Sort images by `position` so the admin's chosen banner image is index 0,
  // then pick image[1] (if any) as the hover image.
  const sortedImages = (product.images || [])
    .slice()
    .sort((a, b) => (a.position || 0) - (b.position || 0));
  const primary = sortedImages[0];
  const secondary = sortedImages[1] || sortedImages[0];

  return (
    <Link to={`/product/${product.slug}`} className="group block">
      {/* Image */}
      <div className="relative overflow-hidden bg-gray-50 aspect-[3/4]">
        {primary ? (
          <>
            <img
              src={primary.url}
              alt={primary.alt || product.title}
              className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ease-out group-hover:opacity-0"
              loading="lazy"
            />
            {secondary && secondary.url !== primary.url && (
              <img
                src={secondary.url}
                alt={secondary.alt || product.title}
                className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-500 ease-out group-hover:opacity-100"
                loading="lazy"
              />
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <span className="text-xs">No image</span>
          </div>
        )}

        {/* Top-left badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 pointer-events-none">
          {discount > 0 && (
            <Badge variant="sale" size="sm" className="text-[11px] px-2 py-0.5">
              {discount}% OFF
            </Badge>
          )}
          {isOutOfStock && (
            <span className="text-[11px] uppercase tracking-wider bg-white/90 text-gray-900 px-2 py-0.5">
              Sold out
            </span>
          )}
          {!isOutOfStock && product.featured && (
            <span className="text-[11px] uppercase tracking-wider bg-gray-900 text-white px-2 py-0.5">
              Featured
            </span>
          )}
        </div>

        {/* Wishlist (top right) — always visible when wished, fades in on hover otherwise */}
        <button
          onClick={handleWishlist}
          aria-label={wished ? 'Remove from wishlist' : 'Add to wishlist'}
          aria-pressed={wished}
          className={`absolute top-3 right-3 p-2 bg-white/90 backdrop-blur rounded-full transition-opacity hover:bg-white ${
            wished ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
          }`}
        >
          <FiHeart
            size={16}
            className={wished ? 'text-red-500' : 'text-gray-900'}
            fill={wished ? 'currentColor' : 'none'}
          />
        </button>

        {/* Quick add bar (bottom, slides up on hover) */}
        {showQuickAdd && !isOutOfStock && (
          <button
            onClick={handleQuickAdd}
            className="absolute left-0 right-0 bottom-0 bg-gray-900 text-white text-xs uppercase tracking-widest py-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex items-center justify-center gap-2"
          >
            <FiShoppingBag size={14} />
            Quick add
          </button>
        )}
      </div>

      {/* Info */}
      <div className="pt-3 pb-1 text-center">
        <h3
          className="font-medium text-gray-900 mb-1 line-clamp-1"
          style={{ fontSize: '13px', letterSpacing: '0.02em' }}
        >
          {product.title}
        </h3>
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <span className="text-gray-900" style={{ fontSize: '13px' }}>
            ₹{product.price.toLocaleString()}
          </span>
          {product.compareAtPrice && product.compareAtPrice > product.price && (
            <span className="text-gray-400 line-through" style={{ fontSize: '12px' }}>
              ₹{product.compareAtPrice.toLocaleString()}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
