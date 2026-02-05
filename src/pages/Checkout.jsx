import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiArrowLeft, FiLock, FiCheck } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import Button from '../components/common/Button';
import Loader from '../components/common/Loader';
import api from '../services/api';

const Checkout = () => {
  const navigate = useNavigate();
  const { items, subtotal, itemCount, clearCart } = useCart();
  const { user, isAuthenticated, accessToken } = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('razorpay');

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

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

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
    } else if (!/^[6-9]\d{9}$/.test(shippingAddress.phone.trim())) {
      newErrors.phone = 'Enter a valid 10-digit phone number';
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

    const response = await api.post('/orders', orderData);
    return response.data.order;
  };

  const initiateRazorpayPayment = async (order) => {
    try {
      // Create Razorpay order
      const razorpayResponse = await api.post('/payments/create-order', {
        amount: total,
        currency: 'INR',
        orderId: order._id,
      });

      if (!razorpayResponse.data.success) {
        throw new Error('Failed to create payment order');
      }

      const { orderId: razorpayOrderId, key } = razorpayResponse.data;

      // Open Razorpay checkout
      const options = {
        key: key || import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: total * 100,
        currency: 'INR',
        name: 'Ektaa Couture',
        description: `Order #${order.orderNumber}`,
        order_id: razorpayOrderId,
        handler: async function (response) {
          await verifyPayment(response, order._id);
        },
        prefill: {
          name: shippingAddress.fullName,
          email: user?.email || '',
          contact: shippingAddress.phone,
        },
        theme: {
          color: '#000000',
        },
        modal: {
          ondismiss: function () {
            setIsProcessing(false);
            toast.info('Payment cancelled');
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.on('payment.failed', function (response) {
        setIsProcessing(false);
        toast.error(`Payment failed: ${response.error.description}`);
      });
      razorpay.open();
    } catch (error) {
      console.error('Razorpay error:', error);
      setIsProcessing(false);
      toast.error('Failed to initiate payment');
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
    if (!validateForm()) {
      toast.error('Please fill all required fields');
      return;
    }

    setIsProcessing(true);

    try {
      // Create order in database
      const order = await createOrder();

      if (paymentMethod === 'razorpay') {
        // Initiate Razorpay payment
        await initiateRazorpayPayment(order);
      } else if (paymentMethod === 'cod') {
        // For COD, directly navigate to success
        toast.success('Order placed successfully!');
        await clearCart();
        navigate(`/order-success/${order._id}`);
      }
    } catch (error) {
      console.error('Order error:', error);
      toast.error(error.response?.data?.message || 'Failed to create order');
      setIsProcessing(false);
    }
  };

  if (!isAuthenticated || items.length === 0) {
    return <Loader fullScreen />;
  }

  return (
    <div className="container-custom py-4 sm:py-6 md:py-8 px-4 sm:px-6">
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
                  <span className="font-medium text-text-primary">
                    Pay Online (Razorpay)
                  </span>
                  <p className="text-xs text-text-body mt-1">
                    Credit/Debit Card, UPI, Net Banking, Wallets
                  </p>
                </div>
                <img
                  src="https://razorpay.com/assets/razorpay-glyph.svg"
                  alt="Razorpay"
                  className="h-6"
                />
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
                  <span className="font-medium text-text-primary">
                    Cash on Delivery
                  </span>
                  <p className="text-xs text-text-body mt-1">
                    Pay when your order arrives
                  </p>
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
    </div>
  );
};

export default Checkout;
