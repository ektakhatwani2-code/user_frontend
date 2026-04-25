import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Context Providers
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { UIProvider } from './context/UIContext';
import { CollectionProvider } from './context/CollectionContext';
import { WishlistProvider } from './context/WishlistContext';

// Layout
import Layout from './components/layout/Layout';

// Pages
import Home from './pages/Home';
import ProductDetails from './pages/ProductDetails';
import Collections from './pages/Collections';
import Cart from './pages/Cart';
import About from './pages/About';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import Account from './pages/Account';
import AccountProfile from './pages/AccountProfile';
import AccountOrders from './pages/AccountOrders';
import AccountOrderDetail from './pages/AccountOrderDetail';
import AccountAddresses from './pages/AccountAddresses';
import AccountWishlist from './pages/AccountWishlist';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <UIProvider>
            <CollectionProvider>
            <WishlistProvider>
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<Home />} />
                <Route path="collections/:slug" element={<Collections />} />
                <Route path="product/:slug" element={<ProductDetails />} />
                <Route path="cart" element={<Cart />} />
                <Route path="checkout" element={<Checkout />} />
                <Route path="order-success/:orderId" element={<OrderSuccess />} />

                <Route path="account" element={<Account />}>
                  <Route index element={<AccountProfile />} />
                  <Route path="orders" element={<AccountOrders />} />
                  <Route path="orders/:orderId" element={<AccountOrderDetail />} />
                  <Route path="addresses" element={<AccountAddresses />} />
                  <Route path="wishlist" element={<AccountWishlist />} />
                </Route>

                <Route path="forgot-password" element={<ForgotPassword />} />
                <Route path="reset-password/:token" element={<ResetPassword />} />

                <Route path="about" element={<About />} />
                <Route path="privacy" element={<div className="container-custom py-8">Privacy Policy</div>} />
                <Route path="shipping" element={<div className="container-custom py-8">Shipping & Returns</div>} />
                <Route path="terms" element={<div className="container-custom py-8">Terms & Conditions</div>} />
                <Route path="*" element={<div className="container-custom py-8 text-center">404 - Page Not Found</div>} />
              </Route>
            </Routes>

            <ToastContainer position="top-right" autoClose={3000} />
            </WishlistProvider>
            </CollectionProvider>
          </UIProvider>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
