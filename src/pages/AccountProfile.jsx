import { useState } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Button from '../components/common/Button';

const AccountProfile = () => {
  const { user, checkAuth } = useAuth();
  const [form, setForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || '',
  });
  const [pwd, setPwd] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPwd, setSavingPwd] = useState(false);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await api.put('/users/profile', form);
      if (res.data.success) {
        toast.success('Profile updated');
        await checkAuth();
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (pwd.newPassword !== pwd.confirm) {
      toast.error('Passwords do not match');
      return;
    }
    if (pwd.newPassword.length < 8) {
      toast.error('New password must be at least 8 characters');
      return;
    }
    setSavingPwd(true);
    try {
      const res = await api.put('/users/password', {
        currentPassword: pwd.currentPassword,
        newPassword: pwd.newPassword,
      });
      if (res.data.success) {
        toast.success('Password updated');
        setPwd({ currentPassword: '', newPassword: '', confirm: '' });
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update password');
    } finally {
      setSavingPwd(false);
    }
  };

  const inputCls =
    'w-full px-3 py-2 border border-form-border rounded-lg focus:outline-none focus:border-primary';

  return (
    <div className="space-y-6">
      <section className="bg-white border border-border rounded-lg p-4 sm:p-6">
        <h2 className="text-lg font-semibold text-text-primary mb-4">Profile</h2>
        <form onSubmit={handleProfileSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">First Name</label>
            <input
              className={inputCls}
              value={form.firstName}
              onChange={(e) => setForm({ ...form, firstName: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Last Name</label>
            <input
              className={inputCls}
              value={form.lastName}
              onChange={(e) => setForm({ ...form, lastName: e.target.value })}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-text-primary mb-1">Email</label>
            <input className={inputCls} value={user?.email || ''} disabled />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-text-primary mb-1">Phone</label>
            <input
              className={inputCls}
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="Mobile number"
            />
          </div>
          <div className="sm:col-span-2">
            <Button type="submit" disabled={savingProfile}>
              {savingProfile ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </section>

      <section className="bg-white border border-border rounded-lg p-4 sm:p-6">
        <h2 className="text-lg font-semibold text-text-primary mb-4">Change Password</h2>
        <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Current Password</label>
            <input
              type="password"
              className={inputCls}
              value={pwd.currentPassword}
              onChange={(e) => setPwd({ ...pwd, currentPassword: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">New Password</label>
            <input
              type="password"
              className={inputCls}
              value={pwd.newPassword}
              onChange={(e) => setPwd({ ...pwd, newPassword: e.target.value })}
              required
              minLength={8}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Confirm New Password</label>
            <input
              type="password"
              className={inputCls}
              value={pwd.confirm}
              onChange={(e) => setPwd({ ...pwd, confirm: e.target.value })}
              required
              minLength={8}
            />
          </div>
          <Button type="submit" disabled={savingPwd}>
            {savingPwd ? 'Updating...' : 'Update Password'}
          </Button>
        </form>
      </section>
    </div>
  );
};

export default AccountProfile;
