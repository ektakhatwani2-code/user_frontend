import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiFacebook, FiInstagram } from 'react-icons/fi';
import { toast } from 'react-toastify';
import axios from 'axios';
import Button from '../common/Button';
import Input from '../common/Input';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      toast.error('Please enter your email');
      return;
    }

    setLoading(true);

    try {
      // TODO: Implement newsletter subscription API
      // const response = await axios.post(`${import.meta.env.VITE_API_URL}/newsletter/subscribe`, { email });

      toast.success('Thank you for subscribing!');
      setEmail('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Subscription failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="bg-gray-50 border-t border-border mt-16">
      {/* Newsletter Section */}
      <div className="border-b border-border py-12">
        <div className="container-custom">
          <div className="max-w-md mx-auto text-center">
            <h3 className="text-xl font-semibold text-text-primary mb-2">
              Stay Updated
            </h3>
            <p className="text-text-body mb-6">
              Sign up for our newsletter to receive exclusive offers and updates
            </p>
            <form onSubmit={handleNewsletterSubmit} className="flex gap-2">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" disabled={loading}>
                Subscribe
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h4 className="text-lg font-semibold text-text-primary mb-4">
              Ektaa Couture
            </h4>
            <p className="text-sm text-text-body mb-4">
              Handwoven fashion celebrating traditional craftsmanship and modern design.
            </p>
            <div className="flex gap-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-text-body hover:text-primary transition-colors"
                aria-label="Facebook"
              >
                <FiFacebook size={20} />
              </a>
              <a
                href="https://instagram.com/ektaacouture"
                target="_blank"
                rel="noopener noreferrer"
                className="text-text-body hover:text-primary transition-colors"
                aria-label="Instagram"
              >
                <FiInstagram size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold text-text-primary mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/collections/all"
                  className="text-sm text-text-body hover:text-primary transition-colors"
                >
                  Shop All
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="text-sm text-text-body hover:text-primary transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-sm text-text-body hover:text-primary transition-colors"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  to="/account"
                  className="text-sm text-text-body hover:text-primary transition-colors"
                >
                  My Account
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="text-lg font-semibold text-text-primary mb-4">
              Customer Service
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/shipping"
                  className="text-sm text-text-body hover:text-primary transition-colors"
                >
                  Shipping & Returns
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy"
                  className="text-sm text-text-body hover:text-primary transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/terms"
                  className="text-sm text-text-body hover:text-primary transition-colors"
                >
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link
                  to="/faq"
                  className="text-sm text-text-body hover:text-primary transition-colors"
                >
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold text-text-primary mb-4">
              Contact Us
            </h4>
            <ul className="space-y-2 text-sm text-text-body">
              <li>
                <p className="font-medium">Email:</p>
                <a
                  href="mailto:Ektacouture04@gmail.com"
                  className="hover:text-primary transition-colors"
                >
                  Ektacouture04@gmail.com
                </a>
              </li>
              <li>
                <p className="font-medium">Phone:</p>
                <a
                  href="tel:+918462000416"
                  className="hover:text-primary transition-colors"
                >
                  +91 84620 00416
                </a>
              </li>
              <li>
                <p className="font-medium">Address:</p>
                <p>M-11 Sec-1, Avanti Vihar, ATM Chowk, Raipur, Chhattisgarh</p>
              </li>
              <li>
                <p className="font-medium">By Appointment Only</p>
                <p className="text-xs">Please call and confirm before visiting</p>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-border py-6">
        <div className="container-custom">
          <p className="text-sm text-center text-text-body">
            © {new Date().getFullYear()} Ektaa Couture. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
