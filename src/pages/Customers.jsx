import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Users as UsersIcon } from 'lucide-react';

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCustomers = () => {
    api.get('/customers').then((res) => setCustomers(res.data)).catch(() => setCustomers([])).finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-semibold text-slate-800 flex items-center gap-2">
          <UsersIcon className="w-7 h-7 text-primary-600" />
          Customers
        </h1>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-x-auto">
        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading...</div>
        ) : customers.length === 0 ? (
          <div className="p-8 text-center text-slate-500">No customers yet.</div>
        ) : (
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">ID</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">Name</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">Email</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">Bank</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">Card</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">Tier</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {customers.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 sm:px-6 py-4 text-sm text-slate-600">{c.id}</td>
                  <td className="px-4 sm:px-6 py-4 text-sm font-medium">{c.name}</td>
                  <td className="px-4 sm:px-6 py-4 text-sm">{c.email}</td>
                  <td className="px-4 sm:px-6 py-4 text-sm">{c.bankName || '—'}</td>
                  <td className="px-4 sm:px-6 py-4 text-sm">{c.cardName || '—'}</td>
                  <td className="px-4 sm:px-6 py-4 text-sm">{c.cardTierName || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
