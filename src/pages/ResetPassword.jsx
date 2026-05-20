import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/api';
import Button from '../components/common/Button';
import Seo from '../components/Seo';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (password !== confirm) return toast.error('Passwords do not match');
    if (password.length < 8) return toast.error('Password must be at least 8 characters');
    setSubmitting(true);
    try {
      const res = await api.post(`/auth/reset-password/${token}`, { password });
      if (res.data.success) {
        toast.success('Password reset. Please log in.');
        navigate('/');
      } else {
        toast.error(res.data.message || 'Could not reset password');
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Reset link is invalid or expired');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container-custom py-12 px-4 sm:px-6">
      <Seo title="Reset Password" path="/reset-password" noindex />
      <div className="max-w-md mx-auto bg-white border border-border rounded-lg p-6 sm:p-8">
        <h1 className="text-2xl font-bold text-text-primary mb-2">Reset Password</h1>
        <p className="text-text-body mb-6">Choose a new password for your account.</p>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">New Password</label>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-form-border rounded-lg focus:outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Confirm Password</label>
            <input
              type="password"
              required
              minLength={8}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="w-full px-3 py-2 border border-form-border rounded-lg focus:outline-none focus:border-primary"
            />
          </div>
          <Button type="submit" disabled={submitting} className="w-full">
            {submitting ? 'Saving...' : 'Reset Password'}
          </Button>
          <div className="text-center text-sm">
            <Link to="/" className="text-text-body hover:text-primary">Back to home</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
