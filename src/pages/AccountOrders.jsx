import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiPackage } from 'react-icons/fi';
import api from '../services/api';
import Loader from '../components/common/Loader';

const statusColor = (s) =>
  ({
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    processing: 'bg-blue-100 text-blue-800',
    shipped: 'bg-purple-100 text-purple-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    refunded: 'bg-gray-100 text-gray-800',
  }[s] || 'bg-gray-100 text-gray-800');

const AccountOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/orders');
        if (res.data.success) setOrders(res.data.orders);
      } catch (err) {
        console.error('Fetch orders error:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <Loader />;

  if (orders.length === 0) {
    return (
      <div className="bg-white border border-border rounded-lg p-8 text-center">
        <FiPackage className="mx-auto text-gray-400 mb-3" size={48} />
        <p className="text-text-primary font-medium mb-1">No orders yet</p>
        <p className="text-sm text-text-body mb-4">
          When you place your first order, it'll show up here.
        </p>
        <Link to="/collections/all" className="text-primary hover:underline">
          Start shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-text-primary">Order History</h2>
      {orders.map((o) => (
        <Link
          key={o._id}
          to={`/account/orders/${o._id}`}
          className="block bg-white border border-border rounded-lg p-4 hover:border-primary transition-colors"
        >
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <div>
              <p className="font-medium text-text-primary">{o.orderNumber}</p>
              <p className="text-xs text-text-body">
                {new Date(o.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            </div>
            <span className={`text-xs px-2 py-1 rounded-full capitalize ${statusColor(o.status)}`}>
              {o.status}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-text-body">
              {o.items.length} {o.items.length === 1 ? 'item' : 'items'}
            </span>
            <span className="font-medium text-text-primary">
              ₹{o.pricing?.total?.toLocaleString() || 0}
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default AccountOrders;
