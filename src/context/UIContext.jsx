import { createContext, useState, useContext } from 'react';
import { toast } from 'react-toastify';

const UIContext = createContext();

export const useUI = () => {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error('useUI must be used within UIProvider');
  }
  return context;
};

export const UIProvider = ({ children }) => {
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login'); // 'login' or 'register'

  const openCartDrawer = () => setIsCartDrawerOpen(true);
  const closeCartDrawer = () => setIsCartDrawerOpen(false);
  const toggleCartDrawer = () => setIsCartDrawerOpen((prev) => !prev);

  const openSearchModal = () => setIsSearchModalOpen(true);
  const closeSearchModal = () => setIsSearchModalOpen(false);
  const toggleSearchModal = () => setIsSearchModalOpen((prev) => !prev);

  const openAuthModal = (mode = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };
  const closeAuthModal = () => setIsAuthModalOpen(false);
  const toggleAuthModal = () => setIsAuthModalOpen((prev) => !prev);
  const switchAuthMode = (mode) => setAuthModalMode(mode);

  const openMobileNav = () => setIsMobileNavOpen(true);
  const closeMobileNav = () => setIsMobileNavOpen(false);
  const toggleMobileNav = () => setIsMobileNavOpen((prev) => !prev);

  // Toast notifications
  const showToast = (message, type = 'info') => {
    switch (type) {
      case 'success':
        toast.success(message);
        break;
      case 'error':
        toast.error(message);
        break;
      case 'warning':
        toast.warning(message);
        break;
      default:
        toast.info(message);
    }
  };

  const value = {
    // Cart Drawer
    isCartDrawerOpen,
    openCartDrawer,
    closeCartDrawer,
    toggleCartDrawer,

    // Search Modal
    isSearchModalOpen,
    openSearchModal,
    closeSearchModal,
    toggleSearchModal,

    // Auth Modal
    isAuthModalOpen,
    authModalMode,
    openAuthModal,
    closeAuthModal,
    toggleAuthModal,
    switchAuthMode,

    // Mobile Navigation
    isMobileNavOpen,
    openMobileNav,
    closeMobileNav,
    toggleMobileNav,

    // Toast
    showToast,
  };

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
};

export default UIContext;
