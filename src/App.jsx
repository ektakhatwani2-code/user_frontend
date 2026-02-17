import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Context Providers
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { UIProvider } from './context/UIContext';
import { CollectionProvider } from './context/CollectionContext';

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

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <UIProvider>
            <CollectionProvider>
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<Home />} />
                <Route path="collections/:slug" element={<Collections />} />
                <Route path="product/:slug" element={<ProductDetails />} />
                <Route path="cart" element={<Cart />} />
                <Route path="checkout" element={<Checkout />} />
                <Route path="order-success/:orderId" element={<OrderSuccess />} />
                <Route path="account" element={<div className="container-custom py-8">Account Page</div>} />
                <Route path="about" element={<About />} />
                <Route path="privacy" element={<div className="container-custom py-8">Privacy Policy</div>} />
                <Route path="shipping" element={<div className="container-custom py-8">Shipping & Returns</div>} />
                <Route path="terms" element={<div className="container-custom py-8">Terms & Conditions</div>} />
                <Route path="*" element={<div className="container-custom py-8 text-center">404 - Page Not Found</div>} />
              </Route>
            </Routes>

            <ToastContainer position="top-right" autoClose={3000} />
            </CollectionProvider>
          </UIProvider>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
