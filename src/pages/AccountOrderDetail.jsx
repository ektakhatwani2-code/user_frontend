import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FiArrowLeft, FiTruck } from 'react-icons/fi';
import { toast } from 'react-toastify';
import api from '../services/api';
import Loader from '../components/common/Loader';
import Button from '../components/common/Button';

const AccountOrderDetail = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  const load = async () => {
    try {
      const res = await api.get(`/orders/${orderId}`);
      if (res.data.success) setOrder(res.data.order);
    } catch (err) {
      console.error('Fetch order error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  const handleCancel = async () => {
    if (!confirm('Cancel this order? This cannot be undone.')) return;
    setCancelling(true);
    try {
      const res = await api.patch(`/orders/${orderId}/cancel`);
      if (res.data.success) {
        toast.success('Order cancelled');
        await load();
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Could not cancel order');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) return <Loader />;
  if (!order) return <p className="text-text-body">Order not found.</p>;

  const canCancel = !['shipped', 'delivered', 'cancelled'].includes(order.status);

  return (
    <div className="space-y-4">
      <Link to="/account/orders" className="inline-flex items-center gap-2 text-sm text-text-body hover:text-primary">
        <FiArrowLeft />
        Back to orders
      </Link>

      <div className="bg-white border border-border rounded-lg p-4 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-4 mb-4 border-b border-border">
          <div>
            <p className="text-sm text-text-body">Order Number</p>
            <p className="font-bold text-text-primary">{order.orderNumber}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-text-body">Date</p>
            <p className="font-medium text-text-primary">
              {new Date(order.createdAt).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800 capitalize">
            {order.status}
          </span>
          <span
            className={`text-xs px-2 py-1 rounded-full ${
              order.payment?.status === 'completed'
                ? 'bg-green-100 text-green-800'
                : 'bg-yellow-100 text-yellow-800'
            }`}
          >
            {order.payment?.status === 'completed' ? 'Paid' : `Payment ${order.payment?.status}`}
          </span>
        </div>

        <h3 className="font-semibold text-text-primary mb-3">Items</h3>
        <div className="space-y-3 mb-4">
          {order.items.map((it, i) => (
            <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-16 h-16 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                {it.image ? (
                  <img src={it.image} alt={it.title} className="w-full h-full object-cover" />
                ) : null}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-text-primary truncate">{it.title}</p>
                {it.variant && <p className="text-xs text-text-body">Size: {it.variant}</p>}
                <p className="text-xs text-text-body">Qty: {it.quantity}</p>
              </div>
              <p className="font-medium text-text-primary">
                ₹{(it.price * it.quantity).toLocaleString()}
              </p>
            </div>
          ))}
        </div>

        <div className="border-t border-border pt-4 space-y-1 text-sm">
          <div className="flex justify-between text-text-body">
            <span>Subtotal</span>
            <span>₹{order.pricing?.subtotal?.toLocaleString() || 0}</span>
          </div>
          {order.pricing?.discount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Discount</span>
              <span>-₹{order.pricing?.discount?.toLocaleString()}</span>
            </div>
          )}
          <div className="flex justify-between text-text-body">
            <span>Shipping</span>
            <span>
              {order.pricing?.shipping === 0 ? 'FREE' : `₹${order.pricing?.shipping?.toLocaleString()}`}
            </span>
          </div>
          <div className="flex justify-between font-bold text-text-primary pt-2 border-t border-border">
            <span>Total</span>
            <span className="text-primary">₹{order.pricing?.total?.toLocaleString() || 0}</span>
          </div>
        </div>

        <div className="border-t border-border mt-4 pt-4">
          <h3 className="font-semibold text-text-primary mb-2 flex items-center gap-2">
            <FiTruck />
            Shipping Address
          </h3>
          <div className="text-sm text-text-body">
            <p className="font-medium text-text-primary">{order.shippingAddress?.fullName}</p>
            <p>{order.shippingAddress?.addressLine1}</p>
            {order.shippingAddress?.addressLine2 && <p>{order.shippingAddress?.addressLine2}</p>}
            <p>
              {order.shippingAddress?.city}, {order.shippingAddress?.state}{' '}
              {order.shippingAddress?.pincode}
            </p>
            <p>Phone: {order.shippingAddress?.phone}</p>
          </div>
        </div>

        {order.tracking?.trackingNumber && (
          <div className="border-t border-border mt-4 pt-4 text-sm">
            <h3 className="font-semibold text-text-primary mb-2">Tracking</h3>
            {order.tracking.carrier && <p className="text-text-body">Carrier: {order.tracking.carrier}</p>}
            <p className="text-text-body">Tracking #: {order.tracking.trackingNumber}</p>
            {order.tracking.trackingUrl && (
              <a
                href={order.tracking.trackingUrl}
                target="_blank"
                rel="noreferrer"
                className="text-primary hover:underline"
              >
                Track shipment
              </a>
            )}
          </div>
        )}

        {canCancel && (
          <div className="border-t border-border mt-4 pt-4">
            <Button onClick={handleCancel} variant="secondary" disabled={cancelling}>
              {cancelling ? 'Cancelling...' : 'Cancel Order'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AccountOrderDetail;
