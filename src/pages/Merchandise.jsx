import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Plus, Pencil, Trash2, ShoppingBag } from 'lucide-react';

export default function Merchandise() {
  const [items, setItems] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ vendorId: '', title: '', description: '', price: '', maxPrice: '', currencyId: '', category: '', sku: '', isActive: true });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchItems = () => {
    api.get('/merchandise').then((res) => setItems(res.data)).catch(() => setItems([])).finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchItems();
    api.get('/vendors').then((res) => setVendors(res.data.filter((v) => v.type === 'MERCHANDISE'))).catch(() => setVendors([]));
    api.get('/currencies').then((res) => setCurrencies(res.data)).catch(() => setCurrencies([]));
  }, []);

  const openEdit = (m) => {
    setEditId(m.merchandiseId);
    setForm({
      vendorId: m.vendorId,
      title: m.title,
      description: m.description || '',
      price: m.price ?? '',
      maxPrice: m.maxPrice ?? '',
      currencyId: m.currencyId ?? '',
      category: m.category || '',
      sku: m.sku || '',
      isActive: m.isActive ?? true,
    });
    setShowForm(true);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const payload = {
        vendorId: Number(form.vendorId),
        title: form.title,
        description: form.description || null,
        price: form.price ? parseFloat(form.price) : null,
        maxPrice: form.maxPrice ? parseFloat(form.maxPrice) : null,
        currencyId: form.currencyId ? Number(form.currencyId) : null,
        category: form.category || null,
        sku: form.sku || null,
        isActive: form.isActive,
      };
      if (editId) {
        await api.put(`/merchandise/${editId}`, payload);
        setSuccess('Merchandise updated.');
      } else {
        await api.post('/merchandise', payload);
        setSuccess('Merchandise created.');
      }
      setForm({ vendorId: '', title: '', description: '', price: '', maxPrice: '', currencyId: '', category: '', sku: '', isActive: true });
      setShowForm(false);
      setEditId(null);
      fetchItems();
    } catch (err) {
      setError(err.response?.data?.error || Object.values(err.response?.data || {}).join(' ') || 'Failed');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this item?')) return;
    try {
      await api.delete(`/merchandise/${id}`);
      fetchItems();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete');
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-semibold text-slate-800 flex items-center gap-2">
          <ShoppingBag className="w-7 h-7 text-primary-600" />
          Merchandise
        </h1>
        <button
          onClick={() => (showForm && !editId) ? setShowForm(false) : (setEditId(null), setForm({ vendorId: '', title: '', description: '', price: '', maxPrice: '', currencyId: '', category: '', sku: '', isActive: true }), setShowForm(true))}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          {showForm && !editId ? 'Cancel' : 'Add Merchandise'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg border border-slate-200 p-6 mb-6 shadow-sm">
          <h2 className="text-lg font-medium mb-4">{editId ? 'Edit Merchandise' : 'Add Merchandise'}</h2>
          {error && <div className="mb-4 text-red-600 text-sm">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Vendor *</label>
              <select
                value={form.vendorId}
                onChange={(e) => setForm({ ...form, vendorId: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                required
              >
                <option value="">Select vendor</option>
                {vendors.map((v) => (
                  <option key={v.vendorId} value={v.vendorId}>{v.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Title *</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full px-4 py-2 border border-slate-300 rounded-lg" rows={3} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Price</label>
                <input type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="w-full px-4 py-2 border border-slate-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Max Price</label>
                <input type="number" step="0.01" value={form.maxPrice} onChange={(e) => setForm({ ...form, maxPrice: e.target.value })} className="w-full px-4 py-2 border border-slate-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Currency</label>
                <select value={form.currencyId} onChange={(e) => setForm({ ...form, currencyId: e.target.value })} className="w-full px-4 py-2 border border-slate-300 rounded-lg">
                  <option value="">—</option>
                  {currencies.map((c) => (
                    <option key={c.id} value={c.id}>{c.code} - {c.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                <input type="text" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full px-4 py-2 border border-slate-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">SKU</label>
                <input type="text" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} className="w-full px-4 py-2 border border-slate-300 rounded-lg" />
              </div>
            </div>
            <div>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
                <span className="text-sm text-slate-700">Active</span>
              </label>
            </div>
            <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
              {editId ? 'Update' : 'Submit'}
            </button>
          </form>
        </div>
      )}

      {success && <div className="mb-4 text-emerald-600 bg-emerald-50 px-4 py-2 rounded-lg">{success}</div>}

      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-x-auto">
        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading...</div>
        ) : items.length === 0 ? (
          <div className="p-8 text-center text-slate-500">No merchandise. Add vendors with type MERCHANDISE first.</div>
        ) : (
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">ID</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">Title</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">Vendor</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">Price</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">Category</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">Status</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {items.map((m) => (
                <tr key={m.merchandiseId} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 sm:px-6 py-4 text-sm text-slate-600">{m.merchandiseId}</td>
                  <td className="px-4 sm:px-6 py-4 text-sm font-medium text-slate-800">{m.title}</td>
                  <td className="px-4 sm:px-6 py-4 text-sm text-slate-600">{m.vendorName || '—'}</td>
                  <td className="px-4 sm:px-6 py-4 text-sm text-slate-600">{m.price != null ? `${m.currency || ''} ${m.price}` : '—'}</td>
                  <td className="px-4 sm:px-6 py-4 text-sm text-slate-600">{m.category || '—'}</td>
                  <td className="px-4 sm:px-6 py-4 text-sm"><span className={`px-2 py-1 rounded text-xs ${m.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>{m.isActive ? 'Active' : 'Inactive'}</span></td>
                  <td className="px-4 sm:px-6 py-4">
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(m)} className="p-1.5 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors" title="Edit">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(m.merchandiseId)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
