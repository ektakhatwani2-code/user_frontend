import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiSearch, FiUser, FiShoppingCart, FiMenu, FiChevronDown } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useUI } from '../../context/UIContext';
import Badge from '../common/Badge';

const Header = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();
  const { itemCount } = useCart();
  const { openCartDrawer, openAuthModal, openSearchModal, toggleMobileNav } = useUI();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showShopMenu, setShowShopMenu] = useState(false);
  const [shopMenuTimeout, setShopMenuTimeout] = useState(null);

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

  const handleShowShopMenu = () => {
    if (shopMenuTimeout) {
      clearTimeout(shopMenuTimeout);
      setShopMenuTimeout(null);
    }
    setShowShopMenu(true);
  };

  const handleHideShopMenu = () => {
    const timeout = setTimeout(() => {
      setShowShopMenu(false);
    }, 150); // 150ms delay before closing
    setShopMenuTimeout(timeout);
  };

  const handleLogout = async () => {
    await logout();
    setShowUserMenu(false);
    navigate('/');
  };

  return (
    <header className="bg-white border-b border-border sticky top-0 z-40">
      <div className="container-custom px-4 sm:px-6">
        {/* Single Row: Logo + Navigation + Icons */}
        <div className="flex items-center justify-between py-3 sm:py-4">
          {/* Mobile Menu Button */}
          <button
            onClick={toggleMobileNav}
            className="lg:hidden text-text-primary hover:text-primary transition-colors"
            aria-label="Menu"
          >
            <FiMenu size={22} className="sm:hidden" />
            <FiMenu size={24} className="hidden sm:block" />
          </button>

          {/* Logo */}
          <Link to="/" className="flex-shrink-0">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-text-primary tracking-wide">
              Sonam Luthria
            </h1>
            <p className="hidden sm:block text-xs text-text-body text-center tracking-widest font-light">HANDWOVEN WITH LOVE</p>
          </Link>

          {/* Desktop Navigation - Center */}
          <nav className="hidden lg:flex items-center gap-10">
            <Link
              to="/"
              className="text-xs font-semibold text-text-body hover:text-primary transition-colors uppercase tracking-widest"
            >
              HOME
            </Link>

            {/* SHOP Dropdown */}
            <div
              className="relative"
              onMouseEnter={handleShowShopMenu}
              onMouseLeave={handleHideShopMenu}
            >
              <button className="flex items-center gap-1 text-xs font-semibold text-text-body hover:text-primary transition-colors uppercase tracking-widest">
                SHOP - ALL PRODUCTS
                <FiChevronDown size={16} />
              </button>

              {/* Dropdown Menu */}
              {showShopMenu && (
                <div
                  className="absolute top-full left-0 mt-1 w-56 bg-white border border-border rounded-lg shadow-lg py-2 z-50"
                  onMouseEnter={handleShowShopMenu}
                  onMouseLeave={handleHideShopMenu}
                >
                  <Link
                    to="/collections/all"
                    className="block px-4 py-2 text-sm text-text-body hover:bg-gray-50 hover:text-primary transition-colors"
                    onClick={() => setShowShopMenu(false)}
                  >
                    All Products
                  </Link>
                  <div className="border-t border-border my-2"></div>
                  {collections.map((collection) => (
                    <Link
                      key={collection.slug}
                      to={`/collections/${collection.slug}`}
                      className="block px-4 py-2 text-sm text-text-body hover:bg-gray-50 hover:text-primary transition-colors"
                      onClick={() => setShowShopMenu(false)}
                    >
                      {collection.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link
              to="/about"
              className="text-xs font-semibold text-text-body hover:text-primary transition-colors uppercase tracking-widest"
            >
              ABOUT US
            </Link>
          </nav>

          {/* Right Actions - Icons */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Search Icon */}
            <button
              onClick={openSearchModal}
              className="text-text-primary hover:text-primary transition-colors"
              aria-label="Search"
            >
              <FiSearch size={20} className="hidden sm:block" />
              <FiSearch size={18} className="sm:hidden" />
            </button>

            {/* User Account */}
            <div className="relative">
              <button
                onClick={() => {
                  if (isAuthenticated) {
                    setShowUserMenu(!showUserMenu);
                  } else {
                    openAuthModal('login');
                  }
                }}
                className="text-text-primary hover:text-primary transition-colors"
                aria-label="Account"
              >
                <FiUser size={20} className="hidden sm:block" />
                <FiUser size={18} className="sm:hidden" />
              </button>

              {/* User Menu Dropdown */}
              {isAuthenticated && showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-border rounded-lg shadow-lg py-2 z-50">
                  <div className="px-4 py-2 border-b border-border">
                    <p className="text-sm font-medium text-text-primary">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-xs text-text-body">{user?.email}</p>
                  </div>
                  <Link
                    to="/account"
                    className="block px-4 py-2 text-sm text-text-body hover:bg-gray-50"
                    onClick={() => setShowUserMenu(false)}
                  >
                    My Account
                  </Link>
                  <Link
                    to="/account/orders"
                    className="block px-4 py-2 text-sm text-text-body hover:bg-gray-50"
                    onClick={() => setShowUserMenu(false)}
                  >
                    Orders
                  </Link>
                  <Link
                    to="/account/wishlist"
                    className="block px-4 py-2 text-sm text-text-body hover:bg-gray-50"
                    onClick={() => setShowUserMenu(false)}
                  >
                    Wishlist
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-text-body hover:bg-gray-50"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>

            {/* Cart */}
            <Link
              to="/cart"
              className="relative text-text-primary hover:text-primary transition-colors"
              aria-label="Shopping Cart"
            >
              <FiShoppingCart size={20} className="hidden sm:block" />
              <FiShoppingCart size={18} className="sm:hidden" />
              {itemCount > 0 && (
                <Badge
                  variant="primary"
                  size="sm"
                  className="absolute -top-2 -right-2 rounded-full min-w-[18px] sm:min-w-[20px] h-4 sm:h-5 flex items-center justify-center text-xs"
                >
                  {itemCount}
                </Badge>
              )}
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
