import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/api';
import Button from '../components/common/Button';
import Seo from '../components/Seo';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post('/auth/forgot-password', { email });
      if (res.data.success) {
        setDone(true);
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Could not send reset email');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container-custom py-12 px-4 sm:px-6">
      <Seo title="Forgot Password" path="/forgot-password" noindex />
      <div className="max-w-md mx-auto bg-white border border-border rounded-lg p-6 sm:p-8">
        <h1 className="text-2xl font-bold text-text-primary mb-2">Forgot Password</h1>
        {done ? (
          <>
            <p className="text-text-body mb-6">
              If an account with that email exists, a password reset link has been sent.
              Please check your inbox (and spam folder).
            </p>
            <Link to="/" className="text-primary hover:underline">Back to home</Link>
          </>
        ) : (
          <>
            <p className="text-text-body mb-6">
              Enter your email and we'll send you a link to reset your password.
            </p>
            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-form-border rounded-lg focus:outline-none focus:border-primary"
                  placeholder="you@example.com"
                />
              </div>
              <Button type="submit" disabled={submitting} className="w-full">
                {submitting ? 'Sending...' : 'Send reset link'}
              </Button>
              <div className="text-center text-sm">
                <Link to="/" className="text-text-body hover:text-primary">Back to home</Link>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
