import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiX, FiChevronDown, FiChevronUp, FiUser, FiLogOut } from 'react-icons/fi';
import { useUI } from '../../context/UIContext';
import { useAuth } from '../../context/AuthContext';

const MobileNav = () => {
  const navigate = useNavigate();
  const { isMobileNavOpen, closeMobileNav, openAuthModal } = useUI();
  const { isAuthenticated, user, logout } = useAuth();
  const [showCollections, setShowCollections] = useState(false);

  const collections = [
    { name: 'EK TAAR', slug: 'ek-taar' },
    { name: 'Cutwork', slug: 'cutwork' },
    { name: 'Kahaani', slug: 'kahaani' },
    { name: 'DRIFT COLLECTION', slug: 'drift' },
    { name: 'Festive Solids', slug: 'festive-solids' },
    { name: 'DHAAGA', slug: 'dhaaga' },
    { name: 'Florals and Frills', slug: 'florals-and-frills' },
    { name: 'CITY ESCAPE', slug: 'city-escape' },
    { name: 'Avsar', slug: 'avsar' },
    { name: 'Handloom', slug: 'handloom' },
  ];

  const handleLinkClick = () => {
    closeMobileNav();
    setShowCollections(false);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black transition-opacity duration-300 z-50 ${
          isMobileNavOpen ? 'opacity-50' : 'opacity-0 pointer-events-none'
        }`}
        onClick={closeMobileNav}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 left-0 h-full w-80 max-w-[85vw] bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${
          isMobileNavOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-text-primary">Menu</h2>
          <button
            onClick={closeMobileNav}
            className="p-2 text-text-primary hover:text-primary transition-colors"
            aria-label="Close menu"
          >
            <FiX size={24} />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="py-4 overflow-y-auto max-h-[calc(100vh-80px)]">
          <Link
            to="/"
            onClick={handleLinkClick}
            className="block px-6 py-3 text-sm font-semibold text-text-body hover:bg-gray-50 hover:text-primary transition-colors uppercase tracking-widest"
          >
            HOME
          </Link>

          {/* Shop Accordion */}
          <div>
            <button
              onClick={() => setShowCollections(!showCollections)}
              className="w-full flex items-center justify-between px-6 py-3 text-sm font-semibold text-text-body hover:bg-gray-50 hover:text-primary transition-colors uppercase tracking-widest"
            >
              <span>SHOP</span>
              {showCollections ? <FiChevronUp size={18} /> : <FiChevronDown size={18} />}
            </button>

            {/* Collections submenu */}
            <div
              className={`overflow-hidden transition-all duration-300 ${
                showCollections ? 'max-h-[500px]' : 'max-h-0'
              }`}
            >
              <Link
                to="/collections/all"
                onClick={handleLinkClick}
                className="block px-10 py-2 text-sm text-text-body hover:bg-gray-50 hover:text-primary transition-colors"
              >
                All Products
              </Link>
              {collections.map((collection) => (
                <Link
                  key={collection.slug}
                  to={`/collections/${collection.slug}`}
                  onClick={handleLinkClick}
                  className="block px-10 py-2 text-sm text-text-body hover:bg-gray-50 hover:text-primary transition-colors"
                >
                  {collection.name}
                </Link>
              ))}
            </div>
          </div>

          <Link
            to="/about"
            onClick={handleLinkClick}
            className="block px-6 py-3 text-sm font-semibold text-text-body hover:bg-gray-50 hover:text-primary transition-colors uppercase tracking-widest"
          >
            ABOUT US
          </Link>

          <div className="border-t border-border mt-4 pt-4">
            <Link
              to="/cart"
              onClick={handleLinkClick}
              className="block px-6 py-3 text-sm font-semibold text-text-body hover:bg-gray-50 hover:text-primary transition-colors uppercase tracking-widest"
            >
              SHOPPING CART
            </Link>

            {isAuthenticated ? (
              <>
                {/* User Info */}
                <div className="px-6 py-3 bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-semibold">
                      {user?.firstName?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-text-primary">
                        {user?.firstName} {user?.lastName}
                      </p>
                      <p className="text-xs text-text-body">{user?.email}</p>
                    </div>
                  </div>
                </div>

                <Link
                  to="/account"
                  onClick={handleLinkClick}
                  className="block px-6 py-3 text-sm font-semibold text-text-body hover:bg-gray-50 hover:text-primary transition-colors uppercase tracking-widest"
                >
                  MY ACCOUNT
                </Link>
                <Link
                  to="/account/orders"
                  onClick={handleLinkClick}
                  className="block px-6 py-3 text-sm text-text-body hover:bg-gray-50 hover:text-primary transition-colors"
                >
                  My Orders
                </Link>
                <Link
                  to="/account/wishlist"
                  onClick={handleLinkClick}
                  className="block px-6 py-3 text-sm text-text-body hover:bg-gray-50 hover:text-primary transition-colors"
                >
                  Wishlist
                </Link>
                <button
                  onClick={async () => {
                    await logout();
                    closeMobileNav();
                    navigate('/');
                  }}
                  className="w-full text-left px-6 py-3 text-sm text-red-600 hover:bg-gray-50 transition-colors flex items-center gap-2"
                >
                  <FiLogOut size={16} />
                  Logout
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    closeMobileNav();
                    openAuthModal('login');
                  }}
                  className="w-full text-left px-6 py-3 text-sm font-semibold text-text-body hover:bg-gray-50 hover:text-primary transition-colors uppercase tracking-widest flex items-center gap-2"
                >
                  <FiUser size={16} />
                  SIGN IN
                </button>
                <button
                  onClick={() => {
                    closeMobileNav();
                    openAuthModal('register');
                  }}
                  className="w-full text-left px-6 py-3 text-sm text-text-body hover:bg-gray-50 hover:text-primary transition-colors"
                >
                  Create Account
                </button>
              </>
            )}
          </div>
        </nav>
      </div>
    </>
  );
};

export default MobileNav;
