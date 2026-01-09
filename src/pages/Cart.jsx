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
    <div className="container-custom py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-text-body mb-8">
        <Link to="/" className="hover:text-primary">Home</Link>
        <span>/</span>
        <span className="text-text-primary">Shopping Cart</span>
      </nav>

      {/* Page Title */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-text-primary">
          Shopping Cart ({itemCount} {itemCount === 1 ? 'item' : 'items'})
        </h1>
        <button
          onClick={handleClearCart}
          className="text-sm text-text-body hover:text-red-600 transition-colors"
        >
          Clear Cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-border rounded-lg p-6">
            {items.map((item) => (
              <CartItem key={item._id} item={item} />
            ))}
          </div>

          {/* Continue Shopping Link */}
          <Link
            to="/collections/all"
            className="inline-flex items-center gap-2 text-primary hover:underline mt-6"
          >
            <FiArrowRight className="rotate-180" />
            Continue Shopping
          </Link>
        </div>

        {/* Cart Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-border rounded-lg p-6 sticky top-24">
            <h2 className="text-xl font-semibold text-text-primary mb-6">
              Order Summary
            </h2>

            {/* Pricing Breakdown */}
            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-text-body">
                <span>Subtotal ({itemCount} items)</span>
                <span className="font-medium">₹{subtotal.toLocaleString()}</span>
              </div>

              {tax > 0 && (
                <div className="flex justify-between text-text-body">
                  <span>Tax</span>
                  <span className="font-medium">₹{tax.toLocaleString()}</span>
                </div>
              )}

              <div className="flex justify-between text-text-body">
                <span>Shipping</span>
                <span className="font-medium text-green-600">
                  {SHIPPING_FEE === 0 ? 'FREE' : `₹${SHIPPING_FEE.toLocaleString()}`}
                </span>
              </div>

              <div className="border-t border-border pt-4">
                <div className="flex justify-between text-lg font-bold text-text-primary">
                  <span>Total</span>
                  <span className="text-primary">₹{total.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Checkout Button */}
            <Button
              onClick={handleCheckout}
              className="w-full mb-4 flex items-center justify-center gap-2"
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
            <div className="mt-6 pt-6 border-t border-border space-y-3 text-sm text-text-body">
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
            <div className="mt-6 pt-6 border-t border-border">
              <label className="block text-sm font-medium text-text-primary mb-2">
                Promo Code
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter code"
                  className="flex-1 px-3 py-2 border border-form-border rounded focus:outline-none focus:border-primary text-sm"
                  disabled
                />
                <Button variant="secondary" size="sm" disabled>
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
      <div className="mt-16">
        <h2 className="text-2xl font-bold text-text-primary mb-6">
          You May Also Like
        </h2>
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <p className="text-text-body">
            Product recommendations coming soon!
          </p>
        </div>
      </div>
    </div>
  );
};

export default Cart;
