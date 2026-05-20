import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiCheckCircle, FiPackage, FiTruck, FiHome } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import Button from '../components/common/Button';
import Loader from '../components/common/Loader';
import Seo from '../components/Seo';
import api from '../services/api';

const OrderSuccess = () => {
  const { orderId } = useParams();
  const { isAuthenticated } = useAuth();
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) {
        setError('Order ID not found');
        setIsLoading(false);
        return;
      }

      try {
        const response = await api.get(`/orders/${orderId}`);
        if (response.data.success) {
          setOrder(response.data.order);
        } else {
          setError('Order not found');
        }
      } catch (err) {
        console.error('Error fetching order:', err);
        setError('Failed to load order details');
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchOrder();
    }
  }, [orderId, isAuthenticated]);

  if (isLoading) {
    return <Loader fullScreen />;
  }

  if (error) {
    return (
      <div className="container-custom py-16 text-center">
        <h2 className="text-xl font-bold text-text-primary mb-4">{error}</h2>
        <Link to="/">
          <Button>Go to Home</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container-custom py-8 sm:py-12 md:py-16 px-4 sm:px-6">
      <Seo title="Order Placed" path="/order-success" noindex />
      <div className="max-w-2xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
            <FiCheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-text-primary mb-2">
            Order Placed Successfully!
          </h1>
          <p className="text-text-body">
            Thank you for your order. We've received your order and will begin processing it soon.
          </p>
        </div>

        {/* Order Details Card */}
        <div className="bg-white border border-border rounded-lg p-4 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4 pb-4 border-b border-border">
            <div>
              <p className="text-sm text-text-body">Order Number</p>
              <p className="text-lg font-bold text-text-primary">
                {order?.orderNumber || 'N/A'}
              </p>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-sm text-text-body">Order Date</p>
              <p className="font-medium text-text-primary">
                {order?.createdAt
                  ? new Date(order.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })
                  : 'N/A'}
              </p>
            </div>
          </div>

          {/* Order Status */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  order?.payment?.status === 'completed'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}
              >
                {order?.payment?.status === 'completed' ? 'Paid' : 'Pending Payment'}
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 capitalize">
                {order?.status || 'Processing'}
              </span>
            </div>
          </div>

          {/* Order Items */}
          <div className="mb-6">
            <h3 className="font-semibold text-text-primary mb-3">Order Items</h3>
            <div className="space-y-3">
              {order?.items?.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                >
                  <div className="w-16 h-16 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FiPackage className="text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-text-primary truncate">
                      {item.title}
                    </p>
                    {item.variant && (
                      <p className="text-sm text-text-body">Size: {item.variant}</p>
                    )}
                    <p className="text-sm text-text-body">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-medium text-text-primary">
                    ₹{(item.price * item.quantity).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing Summary */}
          <div className="border-t border-border pt-4 mb-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-text-body">
                <span>Subtotal</span>
                <span>₹{order?.pricing?.subtotal?.toLocaleString() || 0}</span>
              </div>
              {order?.pricing?.discount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount</span>
                  <span>-₹{order?.pricing?.discount?.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-sm text-text-body">
                <span>Shipping</span>
                <span>
                  {order?.pricing?.shipping === 0
                    ? 'FREE'
                    : `₹${order?.pricing?.shipping?.toLocaleString()}`}
                </span>
              </div>
              <div className="flex justify-between text-lg font-bold text-text-primary pt-2 border-t border-border">
                <span>Total</span>
                <span className="text-primary">
                  ₹{order?.pricing?.total?.toLocaleString() || 0}
                </span>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="border-t border-border pt-4">
            <h3 className="font-semibold text-text-primary mb-2 flex items-center gap-2">
              <FiTruck />
              Shipping Address
            </h3>
            <div className="text-sm text-text-body">
              <p className="font-medium text-text-primary">
                {order?.shippingAddress?.fullName}
              </p>
              <p>{order?.shippingAddress?.addressLine1}</p>
              {order?.shippingAddress?.addressLine2 && (
                <p>{order?.shippingAddress?.addressLine2}</p>
              )}
              <p>
                {order?.shippingAddress?.city}, {order?.shippingAddress?.state}{' '}
                {order?.shippingAddress?.pincode}
              </p>
              <p>Phone: {order?.shippingAddress?.phone}</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/collections/all">
            <Button className="w-full sm:w-auto flex items-center justify-center gap-2">
              Continue Shopping
            </Button>
          </Link>
          <Link to="/">
            <Button
              variant="secondary"
              className="w-full sm:w-auto flex items-center justify-center gap-2"
            >
              <FiHome />
              Go to Home
            </Button>
          </Link>
        </div>

        {/* Help Text */}
        <div className="mt-8 text-center text-sm text-text-body">
          <p>
            Have questions about your order?{' '}
            <a href="mailto:support@ektaacouture.com" className="text-primary hover:underline">
              Contact us
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
