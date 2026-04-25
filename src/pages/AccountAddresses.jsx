import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { FiPlus, FiTrash2, FiEdit2, FiX } from 'react-icons/fi';
import api from '../services/api';
import Loader from '../components/common/Loader';
import Button from '../components/common/Button';

const emptyForm = {
  fullName: '',
  phone: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  pincode: '',
  addressType: 'home',
  isDefault: false,
};

const AccountAddresses = () => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const res = await api.get('/users/addresses');
      if (res.data.success) setAddresses(res.data.addresses || []);
    } catch (err) {
      console.error('Fetch addresses error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const startNew = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
  };

  const startEdit = (a) => {
    setForm({
      fullName: a.fullName || '',
      phone: a.phone || '',
      addressLine1: a.addressLine1 || '',
      addressLine2: a.addressLine2 || '',
      city: a.city || '',
      state: a.state || '',
      pincode: a.pincode || '',
      addressType: a.addressType || 'home',
      isDefault: !!a.isDefault,
    });
    setEditingId(a._id);
    setShowForm(true);
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = editingId
        ? await api.put(`/users/addresses/${editingId}`, form)
        : await api.post('/users/addresses', form);
      if (res.data.success) {
        toast.success(editingId ? 'Address updated' : 'Address added');
        setShowForm(false);
        setEditingId(null);
        await load();
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to save address');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (!confirm('Delete this address?')) return;
    try {
      const res = await api.delete(`/users/addresses/${id}`);
      if (res.data.success) {
        toast.success('Address deleted');
        await load();
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to delete');
    }
  };

  if (loading) return <Loader />;

  const inputCls =
    'w-full px-3 py-2 border border-form-border rounded-lg focus:outline-none focus:border-primary';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-text-primary">Addresses</h2>
        {!showForm && (
          <Button onClick={startNew} className="flex items-center gap-2">
            <FiPlus /> Add Address
          </Button>
        )}
      </div>

      {showForm && (
        <div className="bg-white border border-border rounded-lg p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-text-primary">
              {editingId ? 'Edit Address' : 'New Address'}
            </h3>
            <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
              <FiX />
            </button>
          </div>
          <form onSubmit={submit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-text-primary mb-1">Full Name</label>
              <input
                className={inputCls}
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                required
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-text-primary mb-1">Phone</label>
              <input
                className={inputCls}
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                required
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-text-primary mb-1">Address Line 1</label>
              <input
                className={inputCls}
                value={form.addressLine1}
                onChange={(e) => setForm({ ...form, addressLine1: e.target.value })}
                required
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-text-primary mb-1">Address Line 2</label>
              <input
                className={inputCls}
                value={form.addressLine2}
                onChange={(e) => setForm({ ...form, addressLine2: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">City</label>
              <input
                className={inputCls}
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">State</label>
              <input
                className={inputCls}
                value={form.state}
                onChange={(e) => setForm({ ...form, state: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Pincode</label>
              <input
                className={inputCls}
                value={form.pincode}
                onChange={(e) => setForm({ ...form, pincode: e.target.value })}
                required
                maxLength={6}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Type</label>
              <select
                className={inputCls}
                value={form.addressType}
                onChange={(e) => setForm({ ...form, addressType: e.target.value })}
              >
                <option value="home">Home</option>
                <option value="work">Work</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="sm:col-span-2 flex items-center gap-2">
              <input
                id="isDefault"
                type="checkbox"
                checked={form.isDefault}
                onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
              />
              <label htmlFor="isDefault" className="text-sm text-text-body">
                Set as default address
              </label>
            </div>
            <div className="sm:col-span-2 flex gap-2">
              <Button type="submit" disabled={saving}>
                {saving ? 'Saving...' : editingId ? 'Update' : 'Add'}
              </Button>
              <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {addresses.length === 0 && !showForm && (
        <div className="bg-white border border-border rounded-lg p-8 text-center text-text-body">
          No addresses saved yet.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {addresses.map((a) => (
          <div key={a._id} className="bg-white border border-border rounded-lg p-4">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="font-medium text-text-primary">{a.fullName}</p>
                <p className="text-xs text-text-body capitalize">
                  {a.addressType}
                  {a.isDefault && (
                    <span className="ml-2 px-2 py-0.5 bg-primary/10 text-primary rounded">
                      Default
                    </span>
                  )}
                </p>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => startEdit(a)}
                  className="p-2 text-text-body hover:text-primary"
                  aria-label="Edit"
                >
                  <FiEdit2 size={14} />
                </button>
                <button
                  onClick={() => remove(a._id)}
                  className="p-2 text-text-body hover:text-red-600"
                  aria-label="Delete"
                >
                  <FiTrash2 size={14} />
                </button>
              </div>
            </div>
            <div className="text-sm text-text-body">
              <p>{a.addressLine1}</p>
              {a.addressLine2 && <p>{a.addressLine2}</p>}
              <p>
                {a.city}, {a.state} {a.pincode}
              </p>
              <p>Phone: {a.phone}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AccountAddresses;
