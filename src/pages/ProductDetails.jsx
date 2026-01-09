import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FiHeart, FiShare2, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import axios from 'axios';
import { toast } from 'react-toastify';
import Button from '../components/common/Button';
import Loader from '../components/common/Loader';
import Badge from '../components/common/Badge';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const ProductDetails = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    fetchProduct();
  }, [slug]);

  const fetchProduct = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/products/${slug}`);

      if (response.data.success) {
        setProduct(response.data.product);
        // Set first variant as selected if variants exist
        if (response.data.product.variants && response.data.product.variants.length > 0) {
          setSelectedVariant(response.data.product.variants[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error('Product not found');
      navigate('/collections/all');
    } finally {
      setLoading(false);
    }
  };

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

      if (result.success) {
        toast.success('Added to cart!');
      } else {
        toast.error(result.message || 'Failed to add to cart');
      }
    } catch (error) {
      toast.error('Failed to add to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleImageChange = (index) => {
    setSelectedImage(index);
  };

  const nextImage = () => {
    if (product && product.images.length > 0) {
      setSelectedImage((prev) => (prev + 1) % product.images.length);
    }
  };

  const prevImage = () => {
    if (product && product.images.length > 0) {
      setSelectedImage((prev) => (prev - 1 + product.images.length) % product.images.length);
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
    if (product.compareAtPrice && product.price) {
      return Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100);
    }
    return 0;
  };

  if (loading) {
    return <Loader fullScreen />;
  }

  if (!product) {
    return (
      <div className="container-custom py-16 text-center">
        <h2 className="text-2xl font-semibold text-text-primary mb-4">Product not found</h2>
        <Link to="/collections/all">
          <Button>Browse All Products</Button>
        </Link>
      </div>
    );
  }

  const discount = calculateDiscount();
  const currentPrice = selectedVariant?.price || product.price;
  const isOutOfStock = product.inventory.trackQuantity && product.inventory.quantity === 0 && !product.inventory.allowBackorder;

  return (
    <div className="container-custom py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-text-body mb-8">
        <Link to="/" className="hover:text-primary">Home</Link>
        <span>/</span>
        {product.collections && product.collections[0] && (
          <>
            <Link to={`/collections/${product.collections[0].slug}`} className="hover:text-primary">
              {product.collections[0].name}
            </Link>
            <span>/</span>
          </>
        )}
        <span className="text-text-primary">{product.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Image Gallery */}
        <div>
          {/* Main Image */}
          <div className="relative mb-4 border border-border rounded-lg overflow-hidden aspect-square">
            {product.images && product.images.length > 0 ? (
              <>
                <img
                  src={product.images[selectedImage]?.url}
                  alt={product.images[selectedImage]?.alt || product.title}
                  className="w-full h-full object-cover"
                />
                {product.images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 p-2 rounded-full transition-all"
                      aria-label="Previous image"
                    >
                      <FiChevronLeft size={24} />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 p-2 rounded-full transition-all"
                      aria-label="Next image"
                    >
                      <FiChevronRight size={24} />
                    </button>
                  </>
                )}
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-200">
                <span className="text-gray-400">No Image Available</span>
              </div>
            )}

            {/* Badges */}
            {discount > 0 && (
              <Badge variant="sale" className="absolute top-4 left-4">
                {discount}% OFF
              </Badge>
            )}
            {isOutOfStock && (
              <Badge variant="danger" className="absolute top-4 right-4">
                Out of Stock
              </Badge>
            )}
          </div>

          {/* Thumbnail Images */}
          {product.images && product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => handleImageChange(index)}
                  className={`border-2 rounded-lg overflow-hidden aspect-square ${
                    selectedImage === index ? 'border-primary' : 'border-border'
                  }`}
                >
                  <img
                    src={image.url}
                    alt={image.alt || `${product.title} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          <h1 className="text-3xl font-bold text-text-primary mb-4">{product.title}</h1>

          {/* Price */}
          <div className="flex items-baseline gap-3 mb-6">
            <span className="text-3xl font-bold text-primary">
              ₹{currentPrice.toLocaleString()}
            </span>
            {product.compareAtPrice && (
              <>
                <span className="text-xl text-gray-500 line-through">
                  ₹{product.compareAtPrice.toLocaleString()}
                </span>
                <Badge variant="sale" size="sm">Save {discount}%</Badge>
              </>
            )}
          </div>

          {/* Stock Status */}
          <div className="mb-6">
            {isOutOfStock ? (
              <p className="text-red-600 font-medium">Out of Stock</p>
            ) : product.inventory.trackQuantity && product.inventory.quantity < 5 ? (
              <p className="text-yellow-600 font-medium">
                Only {product.inventory.quantity} left in stock!
              </p>
            ) : (
              <p className="text-green-600 font-medium">In Stock</p>
            )}
          </div>

          {/* Variant Selection */}
          {product.variants && product.variants.length > 0 && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-text-primary mb-2">
                Select Size
              </label>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((variant, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedVariant(variant)}
                    disabled={!variant.isAvailable || (variant.stock === 0)}
                    className={`px-4 py-2 border rounded transition-colors ${
                      selectedVariant === variant
                        ? 'border-primary bg-primary text-white'
                        : 'border-border hover:border-primary'
                    } ${
                      !variant.isAvailable || variant.stock === 0
                        ? 'opacity-50 cursor-not-allowed'
                        : ''
                    }`}
                  >
                    {variant.size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity Selector */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-text-primary mb-2">
              Quantity
            </label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-10 border border-border rounded hover:border-primary transition-colors"
              >
                -
              </button>
              <span className="text-lg font-medium w-12 text-center">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                disabled={product.inventory.trackQuantity && quantity >= product.inventory.quantity}
                className="w-10 h-10 border border-border rounded hover:border-primary transition-colors disabled:opacity-50"
              >
                +
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 mb-8">
            <Button
              onClick={handleAddToCart}
              disabled={isOutOfStock || addingToCart}
              className="flex-1"
            >
              {addingToCart ? 'Adding...' : 'Add to Cart'}
            </Button>
            <Button
              variant="secondary"
              className="px-4"
              onClick={handleShare}
            >
              <FiShare2 size={20} />
            </Button>
            {isAuthenticated && (
              <Button
                variant="secondary"
                className="px-4"
              >
                <FiHeart size={20} />
              </Button>
            )}
          </div>

          {/* Description */}
          <div className="border-t border-border pt-6 mb-6">
            <h3 className="text-lg font-semibold text-text-primary mb-3">Description</h3>
            <p className="text-text-body leading-relaxed whitespace-pre-line">
              {product.description}
            </p>
          </div>

          {/* Product Details */}
          {product.measurements && (
            <div className="border-t border-border pt-6">
              <h3 className="text-lg font-semibold text-text-primary mb-3">Product Details</h3>
              <dl className="space-y-2">
                {product.measurements.length && (
                  <div className="flex">
                    <dt className="text-text-body font-medium w-32">Length:</dt>
                    <dd className="text-text-body">{product.measurements.length}</dd>
                  </div>
                )}
                {product.measurements.fabric && (
                  <div className="flex">
                    <dt className="text-text-body font-medium w-32">Fabric:</dt>
                    <dd className="text-text-body">{product.measurements.fabric}</dd>
                  </div>
                )}
                {product.measurements.care && (
                  <div className="flex">
                    <dt className="text-text-body font-medium w-32">Care:</dt>
                    <dd className="text-text-body">{product.measurements.care}</dd>
                  </div>
                )}
                {product.measurements.additionalInfo && (
                  <div className="flex">
                    <dt className="text-text-body font-medium w-32">Note:</dt>
                    <dd className="text-text-body">{product.measurements.additionalInfo}</dd>
                  </div>
                )}
                {product.sku && (
                  <div className="flex">
                    <dt className="text-text-body font-medium w-32">SKU:</dt>
                    <dd className="text-text-body">{product.sku}</dd>
                  </div>
                )}
              </dl>
            </div>
          )}

          {/* Collections */}
          {product.collections && product.collections.length > 0 && (
            <div className="border-t border-border pt-6 mt-6">
              <h3 className="text-lg font-semibold text-text-primary mb-3">Collections</h3>
              <div className="flex flex-wrap gap-2">
                {product.collections.map((collection) => (
                  <Link
                    key={collection._id}
                    to={`/collections/${collection.slug}`}
                    className="px-3 py-1 bg-gray-100 rounded-full text-sm text-text-body hover:bg-primary hover:text-white transition-colors"
                  >
                    {collection.name}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
