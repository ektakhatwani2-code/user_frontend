import { useEffect, useMemo, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FiHeart, FiShare2, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import axios from 'axios';
import { toast } from 'react-toastify';
import Button from '../components/common/Button';
import Loader from '../components/common/Loader';
import Badge from '../components/common/Badge';
import ProductCard from '../components/product/ProductCard';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';

const ProductDetails = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const { isInWishlist, toggle: toggleWishlist } = useWishlist();

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setSelectedImage(0);
    setQuantity(1);
    (async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/products/${slug}`);
        if (cancelled) return;
        if (res.data.success) {
          setProduct(res.data.product);
          if (res.data.product.variants && res.data.product.variants.length > 0) {
            setSelectedVariant(res.data.product.variants[0]);
          } else {
            setSelectedVariant(null);
          }
          // Fire-and-forget related fetch
          axios
            .get(`${import.meta.env.VITE_API_URL}/products/${slug}/related?limit=8`)
            .then((r) => {
              if (cancelled) return;
              if (r.data.success) setRelated(r.data.products || []);
            })
            .catch(() => {});
        }
      } catch (err) {
        console.error('Error fetching product:', err);
        toast.error('Product not found');
        navigate('/collections/all');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    window.scrollTo(0, 0);
    return () => {
      cancelled = true;
    };
  }, [slug, navigate]);

  // Sort images by admin-controlled position so the banner image is first.
  const images = useMemo(() => {
    return ((product && product.images) || [])
      .slice()
      .sort((a, b) => (a.position || 0) - (b.position || 0));
  }, [product]);

  const handleAddToCart = async () => {
    if (!product) return;
    setAddingToCart(true);
    try {
      const result = await addToCart(
        product._id,
        selectedVariant?.price || product.price,
        quantity,
        selectedVariant?.size || null
      );
      if (result.success) toast.success('Added to cart!');
      else toast.error(result.message || 'Failed to add to cart');
    } catch (err) {
      toast.error('Failed to add to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  const nextImage = () => {
    if (images.length > 0) setSelectedImage((p) => (p + 1) % images.length);
  };
  const prevImage = () => {
    if (images.length > 0) setSelectedImage((p) => (p - 1 + images.length) % images.length);
  };

  const handleWishlist = async () => {
    if (!isAuthenticated) {
      toast.info('Please login to add to wishlist');
      return;
    }
    const wasWished = isInWishlist(product._id);
    const result = await toggleWishlist(product._id);
    if (result?.success) {
      toast.success(wasWished ? 'Removed from wishlist' : 'Added to wishlist');
    } else if (result?.message) {
      toast.error(result.message);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.title,
        text: product.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  const calculateDiscount = () => {
    if (product?.compareAtPrice && product?.price) {
      return Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100);
    }
    return 0;
  };

  if (loading) return <Loader fullScreen />;
  if (!product) {
    return (
      <div className="container-custom py-16 text-center">
        <h2 className="text-2xl font-semibold text-text-primary mb-4">Product not found</h2>
        <Link to="/collections/all">
          <Button>Browse all products</Button>
        </Link>
      </div>
    );
  }

  const discount = calculateDiscount();
  const currentPrice = selectedVariant?.price || product.price;
  const isOutOfStock =
    product.inventory.trackQuantity &&
    product.inventory.quantity === 0 &&
    !product.inventory.allowBackorder;

  return (
    <div className="bg-white">
      <div className="container-custom py-6 md:py-10 px-4 sm:px-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 mb-6 md:mb-10">
          <Link to="/" className="hover:text-gray-900">
            Home
          </Link>
          <span>/</span>
          {product.collections && product.collections[0] && (
            <>
              <Link
                to={`/collections/${product.collections[0].slug}`}
                className="hover:text-gray-900"
              >
                {product.collections[0].name}
              </Link>
              <span>/</span>
            </>
          )}
          <span className="text-gray-900 truncate">{product.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Gallery — wallpaper (big) on top, angle thumbnails below.
              Capped at ~480px to match sonamluthria's compact PDP. */}
          <div>
            <div className="max-w-md mx-auto lg:mx-0">
              {/* Main wallpaper image */}
              <div className="relative bg-gray-50 overflow-hidden aspect-[3/4]">
                {images.length > 0 ? (
                  <>
                    <img
                      src={images[selectedImage]?.url}
                      alt={images[selectedImage]?.alt || product.title}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    {images.length > 1 && (
                      <>
                        <button
                          onClick={prevImage}
                          aria-label="Previous image"
                          className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-sm"
                        >
                          <FiChevronLeft size={18} />
                        </button>
                        <button
                          onClick={nextImage}
                          aria-label="Next image"
                          className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-sm"
                        >
                          <FiChevronRight size={18} />
                        </button>
                      </>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    No image available
                  </div>
                )}

                <div className="absolute top-3 left-3 flex flex-col gap-1.5 pointer-events-none">
                  {discount > 0 && (
                    <Badge variant="sale" className="text-[11px] px-2 py-0.5">
                      {discount}% OFF
                    </Badge>
                  )}
                  {isOutOfStock && (
                    <span className="text-[11px] uppercase tracking-widest bg-white/90 text-gray-900 px-2 py-0.5">
                      Sold out
                    </span>
                  )}
                </div>
              </div>

              {/* Angle thumbnails — small horizontal row, ~64px wide */}
              {images.length > 1 && (
                <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                  {images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedImage(i)}
                      aria-label={`View image ${i + 1}`}
                      className={`relative flex-shrink-0 w-16 aspect-[3/4] overflow-hidden bg-gray-50 transition-all ${
                        selectedImage === i
                          ? 'ring-2 ring-gray-900 ring-offset-1'
                          : 'opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={img.url}
                        alt={img.alt || `${product.title} ${i + 1}`}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right info column (sticky on desktop) */}
          <div>
            <div className="lg:sticky lg:top-24">
              <h1
                className="text-2xl md:text-3xl font-medium text-gray-900 mb-3"
                style={{ letterSpacing: '0.01em' }}
              >
                {product.title}
              </h1>

              {/* Price */}
              <div className="flex items-baseline gap-3 mb-6">
                <span className="text-xl md:text-2xl text-gray-900">
                  Rs. {currentPrice.toLocaleString()}.00
                </span>
                {product.compareAtPrice && product.compareAtPrice > currentPrice && (
                  <>
                    <span className="text-base text-gray-400 line-through">
                      Rs. {product.compareAtPrice.toLocaleString()}.00
                    </span>
                    <span className="text-[11px] uppercase tracking-widest bg-red-50 text-red-700 px-2 py-0.5">
                      Save {discount}%
                    </span>
                  </>
                )}
              </div>

              {/* Variant Selection */}
              {product.variants && product.variants.length > 0 && (
                <div className="mb-6">
                  <label className="block text-xs uppercase tracking-widest text-gray-700 mb-2">
                    Size
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {product.variants.map((variant, i) => {
                      const disabled =
                        !variant.isAvailable || (variant.stock === 0 && !product.inventory.allowBackorder);
                      const active = selectedVariant === variant;
                      return (
                        <button
                          key={i}
                          onClick={() => !disabled && setSelectedVariant(variant)}
                          disabled={disabled}
                          className={`min-w-[3rem] px-3 py-2 border text-sm transition-colors ${
                            active
                              ? 'border-gray-900 bg-gray-900 text-white'
                              : 'border-gray-300 hover:border-gray-900'
                          } ${disabled ? 'opacity-40 cursor-not-allowed line-through' : ''}`}
                        >
                          {variant.size}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div className="mb-6">
                <label className="block text-xs uppercase tracking-widest text-gray-700 mb-2">
                  Quantity
                </label>
                <div className="inline-flex items-center border border-gray-300">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 hover:bg-gray-50"
                  >
                    −
                  </button>
                  <span className="w-12 text-center text-sm">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    disabled={
                      product.inventory.trackQuantity && quantity >= product.inventory.quantity
                    }
                    className="w-10 h-10 hover:bg-gray-50 disabled:opacity-40"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 mb-8">
                <button
                  onClick={handleAddToCart}
                  disabled={isOutOfStock || addingToCart}
                  className="flex-1 bg-gray-900 text-white py-3 text-sm uppercase tracking-widest hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {addingToCart ? 'Adding…' : isOutOfStock ? 'Sold out' : 'Add to cart'}
                </button>
                <button
                  onClick={handleShare}
                  aria-label="Share"
                  className="px-4 border border-gray-300 hover:border-gray-900"
                >
                  <FiShare2 size={18} />
                </button>
                {isAuthenticated && (
                  <button
                    onClick={handleWishlist}
                    aria-label={isInWishlist(product._id) ? 'Remove from wishlist' : 'Add to wishlist'}
                    aria-pressed={isInWishlist(product._id)}
                    className={`px-4 border transition-colors ${
                      isInWishlist(product._id)
                        ? 'border-red-500 text-red-500'
                        : 'border-gray-300 hover:border-gray-900'
                    }`}
                  >
                    <FiHeart
                      size={18}
                      fill={isInWishlist(product._id) ? 'currentColor' : 'none'}
                    />
                  </button>
                )}
              </div>

              {/* Description */}
              <div className="border-t border-gray-200 pt-6 mb-6">
                <h3 className="text-xs uppercase tracking-widest text-gray-700 mb-3">
                  Description
                </h3>
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                  {product.description}
                </p>
              </div>

              {/* Measurements */}
              {product.measurements &&
                (product.measurements.length ||
                  product.measurements.fabric ||
                  product.measurements.care ||
                  product.measurements.additionalInfo ||
                  product.sku) && (
                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-xs uppercase tracking-widest text-gray-700 mb-3">
                      Details
                    </h3>
                    <dl className="space-y-1.5 text-sm text-gray-700">
                      {product.measurements.length && (
                        <div className="flex">
                          <dt className="w-24 text-gray-500">Length</dt>
                          <dd>{product.measurements.length}</dd>
                        </div>
                      )}
                      {product.measurements.fabric && (
                        <div className="flex">
                          <dt className="w-24 text-gray-500">Fabric</dt>
                          <dd>{product.measurements.fabric}</dd>
                        </div>
                      )}
                      {product.measurements.care && (
                        <div className="flex">
                          <dt className="w-24 text-gray-500">Care</dt>
                          <dd>{product.measurements.care}</dd>
                        </div>
                      )}
                      {product.measurements.additionalInfo && (
                        <div className="flex">
                          <dt className="w-24 text-gray-500">Note</dt>
                          <dd>{product.measurements.additionalInfo}</dd>
                        </div>
                      )}
                      {product.sku && (
                        <div className="flex">
                          <dt className="w-24 text-gray-500">SKU</dt>
                          <dd>{product.sku}</dd>
                        </div>
                      )}
                    </dl>
                  </div>
                )}
            </div>
          </div>
        </div>

        {/* You may also like */}
        {related.length > 0 && (
          <section className="mt-16 md:mt-24 border-t border-gray-200 pt-12 md:pt-16">
            <div className="text-center mb-8 md:mb-10">
              <h2
                className="text-xl md:text-2xl font-medium text-gray-900"
                style={{ letterSpacing: '0.05em' }}
              >
                You may also like
              </h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {related.slice(0, 4).map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default ProductDetails;
