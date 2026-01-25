import { Link, useNavigate } from 'react-router-dom';
import { FiShoppingBag, FiArrowRight } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';
import CartItem from '../components/cart/CartItem';
import Button from '../components/common/Button';
import Loader from '../components/common/Loader';

const Cart = () => {
  const navigate = useNavigate();
  const { items, subtotal, itemCount, clearCart, isLoading } = useCart();
  const { isAuthenticated } = useAuth();
  const { openAuthModal } = useUI();

  const TAX_RATE = 0; // 0% tax for now
  const SHIPPING_FEE = 0; // Free shipping for now
  const tax = subtotal * TAX_RATE;
  const total = subtotal + tax + SHIPPING_FEE;

  const handleCheckout = () => {
    if (!isAuthenticated) {
      openAuthModal('login');
      return;
    }
    navigate('/checkout');
  };

  const handleClearCart = async () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      await clearCart();
    }
  };

  if (isLoading) {
    return <Loader fullScreen />;
  }

  // Empty Cart State
  if (!items || items.length === 0) {
    return (
      <div className="container-custom py-16">
        <div className="max-w-md mx-auto text-center">
          <div className="mb-8">
            <FiShoppingBag size={80} className="mx-auto text-gray-300" />
          </div>
          <h2 className="text-2xl font-bold text-text-primary mb-4">
            Your cart is empty
          </h2>
          <p className="text-text-body mb-8">
            Looks like you haven't added any items to your cart yet.
            Start shopping to fill it up!
          </p>
          <Link to="/collections/all">
            <Button className="inline-flex items-center gap-2">
              Continue Shopping
              <FiArrowRight />
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-custom py-4 sm:py-6 md:py-8 px-4 sm:px-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs sm:text-sm text-text-body mb-4 sm:mb-6 md:mb-8">
        <Link to="/" className="hover:text-primary">Home</Link>
        <span>/</span>
        <span className="text-text-primary">Shopping Cart</span>
      </nav>

      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 mb-4 sm:mb-6 md:mb-8">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-text-primary">
          Shopping Cart ({itemCount} {itemCount === 1 ? 'item' : 'items'})
        </h1>
        <button
          onClick={handleClearCart}
          className="text-xs sm:text-sm text-text-body hover:text-red-600 transition-colors self-start sm:self-auto"
        >
          Clear Cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-border rounded-lg p-3 sm:p-4 md:p-6">
            {items.map((item) => (
              <CartItem key={item._id} item={item} />
            ))}
          </div>

          {/* Continue Shopping Link */}
          <Link
            to="/collections/all"
            className="inline-flex items-center gap-2 text-sm sm:text-base text-primary hover:underline mt-4 sm:mt-6"
          >
            <FiArrowRight className="rotate-180" />
            Continue Shopping
          </Link>
        </div>

        {/* Cart Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-border rounded-lg p-4 sm:p-6 sticky top-24">
            <h2 className="text-lg sm:text-xl font-semibold text-text-primary mb-4 sm:mb-6">
              Order Summary
            </h2>

            {/* Pricing Breakdown */}
            <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
              <div className="flex justify-between text-sm sm:text-base text-text-body">
                <span>Subtotal ({itemCount} items)</span>
                <span className="font-medium">₹{subtotal.toLocaleString()}</span>
              </div>

              {tax > 0 && (
                <div className="flex justify-between text-sm sm:text-base text-text-body">
                  <span>Tax</span>
                  <span className="font-medium">₹{tax.toLocaleString()}</span>
                </div>
              )}

              <div className="flex justify-between text-sm sm:text-base text-text-body">
                <span>Shipping</span>
                <span className="font-medium text-green-600">
                  {SHIPPING_FEE === 0 ? 'FREE' : `₹${SHIPPING_FEE.toLocaleString()}`}
                </span>
              </div>

              <div className="border-t border-border pt-3 sm:pt-4">
                <div className="flex justify-between text-base sm:text-lg font-bold text-text-primary">
                  <span>Total</span>
                  <span className="text-primary">₹{total.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Checkout Button */}
            <Button
              onClick={handleCheckout}
              className="w-full mb-3 sm:mb-4 flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              Proceed to Checkout
              <FiArrowRight />
            </Button>

            {!isAuthenticated && (
              <p className="text-xs text-center text-text-body">
                You'll need to sign in to complete your purchase
              </p>
            )}

            {/* Additional Info */}
            <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-border space-y-2 sm:space-y-3 text-xs sm:text-sm text-text-body">
              <div className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">✓</span>
                <span>Free shipping on all orders</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">✓</span>
                <span>Easy returns within 7 days</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">✓</span>
                <span>Secure payment with Razorpay</span>
              </div>
            </div>

            {/* Promo Code (Coming Soon) */}
            <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-border">
              <label className="block text-xs sm:text-sm font-medium text-text-primary mb-2">
                Promo Code
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter code"
                  className="flex-1 px-3 py-2 border border-form-border rounded focus:outline-none focus:border-primary text-xs sm:text-sm"
                  disabled
                />
                <Button variant="secondary" size="sm" disabled className="text-xs sm:text-sm">
                  Apply
                </Button>
              </div>
              <p className="text-xs text-text-body mt-2">
                Promo codes coming soon!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* You May Also Like Section */}
      <div className="mt-8 sm:mt-12 md:mt-16">
        <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-text-primary mb-4 sm:mb-6">
          You May Also Like
        </h2>
        <div className="bg-gray-50 rounded-lg p-4 sm:p-6 md:p-8 text-center">
          <p className="text-sm sm:text-base text-text-body">
            Product recommendations coming soon!
          </p>
        </div>
      </div>
    </div>
  );
};

export default Cart;
