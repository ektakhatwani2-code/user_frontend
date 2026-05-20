import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiArrowLeft, FiLock, FiX } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import Button from '../components/common/Button';
import Loader from '../components/common/Loader';
import Seo from '../components/Seo';
import api from '../services/api';

const Checkout = () => {
  const navigate = useNavigate();
  const { items, subtotal, itemCount, clearCart } = useCart();
  const { user, isAuthenticated, accessToken } = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('razorpay');
  // Mock-payment dialog state (used when backend is in PAYMENT_MODE=mock).
  const [mockPayment, setMockPayment] = useState(null); // { orderId, providerOrderId, simulated, amount }

  // Synchronous re-entry guard. `setIsProcessing(true)` is async — a
  // double-click within one frame fires `handlePlaceOrder` twice before the
  // disabled prop applies. A ref blocks the second call synchronously.
  const inFlight = useRef(false);

  // One idempotency key per checkout session (NOT per click). Every click
  // sends the SAME key so the server collapses duplicates to a single Order.
  // crypto.randomUUID is supported in all modern browsers; the fallback
  // covers older Safaris and JSDOM-based tests.
  const idempotencyKeyRef = useRef(null);
  if (!idempotencyKeyRef.current) {
    idempotencyKeyRef.current =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `ck-${Date.now()}-${Math.random().toString(36).slice(2, 14)}`;
  }

  const [shippingAddress, setShippingAddress] = useState({
    fullName: user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : '',
    phone: user?.phone || '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
  });

  const [errors, setErrors] = useState({});

  // Pricing
  const TAX_RATE = 0;
  const SHIPPING_FEE = 0;
  const tax = subtotal * TAX_RATE;
  const total = subtotal + tax + SHIPPING_FEE;

  // Redirect if not authenticated or cart is empty
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/cart');
      return;
    }
    if (items.length === 0) {
      navigate('/cart');
    }
  }, [isAuthenticated, items, navigate]);

  // Load Razorpay script lazily — only when needed (skipped in mock mode)
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) return resolve(true);
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShippingAddress((prev) => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!shippingAddress.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }
    if (!shippingAddress.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else {
      const cleaned = shippingAddress.phone.replace(/[\s()-]/g, '');
      if (!/^\+?\d{7,15}$/.test(cleaned)) {
        newErrors.phone = 'Enter a valid phone number';
      }
    }
    if (!shippingAddress.addressLine1.trim()) {
      newErrors.addressLine1 = 'Address is required';
    }
    if (!shippingAddress.city.trim()) {
      newErrors.city = 'City is required';
    }
    if (!shippingAddress.state.trim()) {
      newErrors.state = 'State is required';
    }
    if (!shippingAddress.pincode.trim()) {
      newErrors.pincode = 'Pincode is required';
    } else if (!/^\d{6}$/.test(shippingAddress.pincode.trim())) {
      newErrors.pincode = 'Enter a valid 6-digit pincode';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const createOrder = async () => {
    // Prepare order items
    const orderItems = items.map((item) => ({
      product: item.product?._id || item.product,
      title: item.product?.title || item.title || 'Product',
      variant: item.variant || null,
      quantity: item.quantity,
      price: item.price || item.product?.price,
      image: item.product?.images?.[0]?.url || '',
    }));

    const orderData = {
      items: orderItems,
      shippingAddress,
      pricing: {
        subtotal,
        tax,
        shipping: SHIPPING_FEE,
        discount: 0,
        total,
      },
      payment: {
        method: paymentMethod,
      },
    };

    const response = await api.post('/orders', orderData, {
      headers: { 'Idempotency-Key': idempotencyKeyRef.current },
    });
    return response.data.order;
  };

  const initiateRazorpayPayment = async (order) => {
    try {
      const createRes = await api.post('/payments/create-order', {
        amount: total,
        currency: 'INR',
        orderId: order._id,
      });

      if (!createRes.data.success) {
        throw new Error('Failed to create payment order');
      }

      const {
        provider,
        orderId: providerOrderId,
        key,
        simulated,
      } = createRes.data;

      // Mock provider: show our own confirm dialog so the flow visually
      // completes instead of silently auto-finishing. Razorpay's full checkout
      // (UPI / Card / Net Banking / Wallet picker) shows up automatically when
      // PAYMENT_MODE=razorpay is configured with real keys.
      if (provider === 'mock' && simulated) {
        setMockPayment({
          orderId: order._id,
          orderNumber: order.orderNumber,
          providerOrderId,
          simulated,
          amount: total,
        });
        return;
      }

      // Real Razorpay: open the hosted checkout modal. It already shows UPI,
      // cards, net banking, wallets etc. as tabs — we don't restrict here.
      const loaded = await loadRazorpayScript();
      if (!loaded || !window.Razorpay) {
        throw new Error('Could not load Razorpay checkout');
      }

      const options = {
        key: key || import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: total * 100,
        currency: 'INR',
        name: 'Ektaa Couture',
        description: `Order #${order.orderNumber}`,
        order_id: providerOrderId,
        handler: async function (response) {
          await verifyPayment(response, order._id);
        },
        prefill: {
          name: shippingAddress.fullName,
          email: user?.email || '',
          contact: shippingAddress.phone,
        },
        theme: { color: '#000000' },
        modal: {
          ondismiss: function () {
            setIsProcessing(false);
            inFlight.current = false;
            toast.info('Payment cancelled');
          },
        },
      };

      const rz = new window.Razorpay(options);
      rz.on('payment.failed', function (response) {
        setIsProcessing(false);
        inFlight.current = false;
        toast.error(`Payment failed: ${response.error.description}`);
      });
      rz.open();
    } catch (error) {
      console.error('Payment init error:', error);
      setIsProcessing(false);
      inFlight.current = false;
      toast.error(error?.response?.data?.message || 'Failed to initiate payment');
    }
  };

  const verifyPayment = async (razorpayResponse, orderId) => {
    try {
      const response = await api.post('/payments/verify', {
        razorpay_order_id: razorpayResponse.razorpay_order_id,
        razorpay_payment_id: razorpayResponse.razorpay_payment_id,
        razorpay_signature: razorpayResponse.razorpay_signature,
        orderId,
      });

      if (response.data.success) {
        toast.success('Payment successful!');
        // Clear cart and navigate to success page
        await clearCart();
        navigate(`/order-success/${orderId}`);
      } else {
        toast.error('Payment verification failed');
      }
    } catch (error) {
      console.error('Verification error:', error);
      toast.error('Payment verification failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePlaceOrder = async () => {
    // Synchronous double-click / double-tap guard. React's `disabled` prop
    // is async (setIsProcessing schedules a render), so two clicks within
    // one frame can both pass the disabled check. The ref blocks the
    // second call immediately.
    if (inFlight.current) return;

    if (!validateForm()) {
      toast.error('Please fill all required fields');
      return;
    }

    inFlight.current = true;
    setIsProcessing(true);

    try {
      // Create order in database
      const order = await createOrder();

      if (!order || !order._id) {
        throw new Error('Order was created but no order ID was returned');
      }

      if (paymentMethod === 'razorpay') {
        // Initiate online payment flow (mock or real Razorpay)
        await initiateRazorpayPayment(order);
      } else if (paymentMethod === 'cod') {
        toast.success('Order placed successfully!');
        // clearCart is best-effort — even if it fails the order is real.
        try {
          await clearCart();
        } catch (e) {
          console.warn('clearCart failed (non-fatal):', e);
        }
        navigate(`/order-success/${order._id}`);
      }
    } catch (error) {
      console.error('Order error:', error);
      const msg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Failed to place order';
      toast.error(msg);
      setIsProcessing(false);
      inFlight.current = false;
    }
  };

  // Confirm the mock payment flow — verifies on the server with the simulated
  // signature and then finishes exactly like a real Razorpay completion.
  const confirmMockPayment = async () => {
    if (!mockPayment) return;
    try {
      await verifyPayment(
        {
          razorpay_order_id: mockPayment.providerOrderId,
          razorpay_payment_id: mockPayment.simulated.paymentId,
          razorpay_signature: mockPayment.simulated.signature,
        },
        mockPayment.orderId
      );
      setMockPayment(null);
    } catch (e) {
      console.error('Mock payment verify failed', e);
      toast.error('Payment failed. Please try again.');
      setMockPayment(null);
      setIsProcessing(false);
      inFlight.current = false;
    }
  };

  const cancelMockPayment = () => {
    setMockPayment(null);
    setIsProcessing(false);
    inFlight.current = false;
    toast.info('Payment cancelled');
  };

  if (!isAuthenticated || items.length === 0) {
    return <Loader fullScreen />;
  }

  return (
    <div className="container-custom py-4 sm:py-6 md:py-8 px-4 sm:px-6">
      <Seo title="Checkout" path="/checkout" noindex />
      {/* Back to Cart */}
      <Link
        to="/cart"
        className="inline-flex items-center gap-2 text-sm text-text-body hover:text-primary mb-6"
      >
        <FiArrowLeft />
        Back to Cart
      </Link>

      <h1 className="text-2xl sm:text-3xl font-bold text-text-primary mb-6 sm:mb-8">
        Checkout
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Left Column - Forms */}
        <div className="lg:col-span-2 space-y-6">
          {/* Shipping Address */}
          <div className="bg-white border border-border rounded-lg p-4 sm:p-6">
            <h2 className="text-lg font-semibold text-text-primary mb-4">
              Shipping Address
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={shippingAddress.fullName}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-primary ${
                    errors.fullName ? 'border-red-500' : 'border-form-border'
                  }`}
                  placeholder="Enter your full name"
                />
                {errors.fullName && (
                  <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>
                )}
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={shippingAddress.phone}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-primary ${
                    errors.phone ? 'border-red-500' : 'border-form-border'
                  }`}
                  placeholder="10-digit mobile number"
                />
                {errors.phone && (
                  <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                )}
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Address Line 1 *
                </label>
                <input
                  type="text"
                  name="addressLine1"
                  value={shippingAddress.addressLine1}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-primary ${
                    errors.addressLine1 ? 'border-red-500' : 'border-form-border'
                  }`}
                  placeholder="House no., Building, Street"
                />
                {errors.addressLine1 && (
                  <p className="text-red-500 text-xs mt-1">{errors.addressLine1}</p>
                )}
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Address Line 2
                </label>
                <input
                  type="text"
                  name="addressLine2"
                  value={shippingAddress.addressLine2}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-form-border rounded-lg focus:outline-none focus:border-primary"
                  placeholder="Landmark, Area (Optional)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  City *
                </label>
                <input
                  type="text"
                  name="city"
                  value={shippingAddress.city}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-primary ${
                    errors.city ? 'border-red-500' : 'border-form-border'
                  }`}
                  placeholder="City"
                />
                {errors.city && (
                  <p className="text-red-500 text-xs mt-1">{errors.city}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  State *
                </label>
                <input
                  type="text"
                  name="state"
                  value={shippingAddress.state}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-primary ${
                    errors.state ? 'border-red-500' : 'border-form-border'
                  }`}
                  placeholder="State"
                />
                {errors.state && (
                  <p className="text-red-500 text-xs mt-1">{errors.state}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Pincode *
                </label>
                <input
                  type="text"
                  name="pincode"
                  value={shippingAddress.pincode}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-primary ${
                    errors.pincode ? 'border-red-500' : 'border-form-border'
                  }`}
                  placeholder="6-digit pincode"
                  maxLength={6}
                />
                {errors.pincode && (
                  <p className="text-red-500 text-xs mt-1">{errors.pincode}</p>
                )}
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-white border border-border rounded-lg p-4 sm:p-6">
            <h2 className="text-lg font-semibold text-text-primary mb-4">
              Payment Method
            </h2>

            <div className="space-y-3">
              <label
                className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                  paymentMethod === 'razorpay'
                    ? 'border-primary bg-primary/5'
                    : 'border-form-border hover:border-gray-400'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="razorpay"
                  checked={paymentMethod === 'razorpay'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-4 h-4 text-primary"
                />
                <div className="flex-1">
                  <span className="font-medium text-text-primary">Pay Online</span>
                  <p className="text-xs text-text-body mt-1">
                    Credit / Debit Card, UPI, Net Banking, Wallets
                  </p>
                </div>
                <span className="text-[10px] uppercase tracking-widest text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  Secure
                </span>
              </label>

              <label
                className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                  paymentMethod === 'cod'
                    ? 'border-primary bg-primary/5'
                    : 'border-form-border hover:border-gray-400'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cod"
                  checked={paymentMethod === 'cod'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-4 h-4 text-primary"
                />
                <div className="flex-1">
                  <span className="font-medium text-text-primary">Cash on Delivery</span>
                  <p className="text-xs text-text-body mt-1">Pay when your order arrives</p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right Column - Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-border rounded-lg p-4 sm:p-6 sticky top-24">
            <h2 className="text-lg font-semibold text-text-primary mb-4">
              Order Summary
            </h2>

            {/* Items */}
            <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
              {items.map((item) => (
                <div key={item._id} className="flex gap-3">
                  <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                    {item.product?.images?.[0]?.url ? (
                      <img
                        src={item.product.images[0].url}
                        alt={item.product?.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        No Image
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary truncate">
                      {item.product?.title || item.title || 'Product'}
                    </p>
                    {item.variant && (
                      <p className="text-xs text-text-body">Size: {item.variant}</p>
                    )}
                    <p className="text-xs text-text-body">Qty: {item.quantity}</p>
                  </div>
                  <p className="text-sm font-medium text-text-primary">
                    ₹{((item.price || item.product?.price) * item.quantity).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>

            {/* Pricing */}
            <div className="border-t border-border pt-4 space-y-2">
              <div className="flex justify-between text-sm text-text-body">
                <span>Subtotal ({itemCount} items)</span>
                <span>₹{subtotal.toLocaleString()}</span>
              </div>
              {tax > 0 && (
                <div className="flex justify-between text-sm text-text-body">
                  <span>Tax</span>
                  <span>₹{tax.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-sm text-text-body">
                <span>Shipping</span>
                <span className="text-green-600">FREE</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-text-primary pt-2 border-t border-border">
                <span>Total</span>
                <span className="text-primary">₹{total.toLocaleString()}</span>
              </div>
            </div>

            {/* Place Order Button */}
            <Button
              onClick={handlePlaceOrder}
              disabled={isProcessing}
              className="w-full mt-6 flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  Processing...
                </>
              ) : (
                <>
                  <FiLock />
                  {paymentMethod === 'razorpay' ? 'Pay Now' : 'Place Order'}
                </>
              )}
            </Button>

            {/* Security Note */}
            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-text-body">
              <FiLock className="text-green-600" />
              <span>Secure checkout powered by Razorpay</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mock payment dialog — only shown when the backend is in
          PAYMENT_MODE=mock. With real Razorpay, their hosted modal opens
          instead and provides the full UPI/Card/Net Banking/Wallet picker. */}
      {mockPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <div>
                <p className="text-xs uppercase tracking-widest text-gray-500">
                  Test mode · simulated payment
                </p>
                <h3 className="text-base font-semibold text-text-primary">
                  Pay ₹{mockPayment.amount.toLocaleString()}
                </h3>
              </div>
              <button
                onClick={cancelMockPayment}
                aria-label="Cancel"
                className="text-gray-400 hover:text-gray-700"
              >
                <FiX size={20} />
              </button>
            </div>
            <div className="px-5 py-5 space-y-4">
              <div className="bg-gray-50 border border-border rounded p-3 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Order</span>
                  <span className="font-medium text-text-primary">
                    #{mockPayment.orderNumber}
                  </span>
                </div>
                <div className="flex justify-between text-gray-600 mt-1">
                  <span>Amount</span>
                  <span className="font-medium text-text-primary">
                    ₹{mockPayment.amount.toLocaleString()}
                  </span>
                </div>
              </div>
              <p className="text-sm text-text-body">
                Confirm to simulate a successful online payment. Real card / UPI /
                net banking checkout shows up automatically once Razorpay live
                keys are configured on the server.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={cancelMockPayment}
                  className="flex-1 px-4 py-2 border border-form-border rounded text-sm hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmMockPayment}
                  className="flex-1 px-4 py-2 bg-primary text-white rounded text-sm font-medium hover:bg-primary-hover"
                >
                  Pay ₹{mockPayment.amount.toLocaleString()}
                </button>
              </div>
              <p className="text-[11px] text-gray-400 text-center">
                Server is in test mode. No real money is charged.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Checkout;
