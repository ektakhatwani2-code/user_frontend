import { useEffect } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { FiUser, FiPackage, FiMapPin, FiHeart, FiLogOut } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/common/Loader';
import Seo from '../components/Seo';

const Account = () => {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/');
    }
  }, [isLoading, isAuthenticated, navigate]);

  if (isLoading || !isAuthenticated) return <Loader fullScreen />;

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const navItems = [
    { to: '/account', label: 'Profile', icon: FiUser, end: true },
    { to: '/account/orders', label: 'Orders', icon: FiPackage },
    { to: '/account/addresses', label: 'Addresses', icon: FiMapPin },
    { to: '/account/wishlist', label: 'Wishlist', icon: FiHeart },
  ];

  return (
    <div className="container-custom py-6 sm:py-8 px-4 sm:px-6">
      <Seo title="My Account" path="/account" noindex />
      <h1 className="text-2xl sm:text-3xl font-bold text-text-primary mb-2">
        My Account
      </h1>
      <p className="text-text-body mb-6 sm:mb-8">
        Welcome, {user?.firstName} {user?.lastName}
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Nav */}
        <aside className="lg:col-span-1">
          <nav className="bg-white border border-border rounded-lg p-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                    isActive
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'text-text-body hover:bg-gray-50'
                  }`
                }
              >
                <item.icon size={16} />
                {item.label}
              </NavLink>
            ))}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm text-text-body hover:bg-gray-50 transition-colors"
            >
              <FiLogOut size={16} />
              Logout
            </button>
          </nav>
        </aside>

        {/* Content */}
        <main className="lg:col-span-3">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Account;
