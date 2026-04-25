import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiHeart, FiTrash2 } from 'react-icons/fi';
import { toast } from 'react-toastify';
import api from '../services/api';
import Loader from '../components/common/Loader';
import { useWishlist } from '../context/WishlistContext';

const AccountWishlist = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { remove: removeFromWishlist, refresh: refreshWishlist } = useWishlist();

  const load = async () => {
    try {
      const res = await api.get('/users/wishlist');
      if (res.data.success) setItems(res.data.wishlist || []);
    } catch (err) {
      console.error('Fetch wishlist error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const remove = async (productId) => {
    const result = await removeFromWishlist(productId);
    if (result?.success) {
      toast.success('Removed from wishlist');
      setItems((prev) => prev.filter((p) => p._id !== productId));
      refreshWishlist();
    } else {
      toast.error(result?.message || 'Failed to remove');
    }
  };

  if (loading) return <Loader />;

  if (items.length === 0) {
    return (
      <div className="bg-white border border-border rounded-lg p-8 text-center">
        <FiHeart className="mx-auto text-gray-400 mb-3" size={48} />
        <p className="text-text-primary font-medium mb-1">Your wishlist is empty</p>
        <p className="text-sm text-text-body mb-4">
          Save your favourites to come back to them later.
        </p>
        <Link to="/collections/all" className="text-primary hover:underline">
          Browse products
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-text-primary">Wishlist</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((p) => (
          <div key={p._id} className="bg-white border border-border rounded-lg overflow-hidden">
            <Link to={`/product/${p.slug}`}>
              <div className="aspect-square bg-gray-100">
                {p.images?.[0]?.url && (
                  <img
                    src={p.images[0].url}
                    alt={p.title}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
            </Link>
            <div className="p-3">
              <Link to={`/product/${p.slug}`} className="font-medium text-text-primary line-clamp-1">
                {p.title}
              </Link>
              <p className="text-sm text-primary font-medium">
                ₹{p.price?.toLocaleString()}
              </p>
              <button
                onClick={() => remove(p._id)}
                className="mt-2 inline-flex items-center gap-1 text-xs text-text-body hover:text-red-600"
              >
                <FiTrash2 size={12} /> Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AccountWishlist;
