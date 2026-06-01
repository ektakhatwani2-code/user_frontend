import { Outlet } from 'react-router-dom';
import { useEffect } from 'react';
import Header from './Header';
import Footer from './Footer';
import MobileNav from './MobileNav';
import SearchModal from './SearchModal';
import AuthModal from '../auth/AuthModal';
import { useUI } from '../../context/UIContext';

const Layout = () => {
  const { openAuthModal, showToast } = useUI();

  // When a session expires mid-use (api.js → AuthContext broadcasts this),
  // tell the user and open the login modal so they can sign back in. Only
  // fires for users who had a session, so guests are never interrupted.
  useEffect(() => {
    const handleExpired = () => {
      showToast('Your session has expired. Please log in again.', 'error');
      openAuthModal('login');
    };
    window.addEventListener('auth:session-expired', handleExpired);
    return () => window.removeEventListener('auth:session-expired', handleExpired);
  }, [openAuthModal, showToast]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />

      {/* Modals and Drawers */}
      <MobileNav />
      <SearchModal />
      <AuthModal />
    </div>
  );
};

export default Layout;
