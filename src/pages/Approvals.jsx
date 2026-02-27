import { useState, useEffect } from 'react';
import api from '../api/axios';
import { CheckCircle } from 'lucide-react';

export default function Approvals() {
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);

  const fetchApprovals = () => {
    api.get('/approvals').then((res) => setApprovals(res.data)).catch(() => setApprovals([])).finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchApprovals();
  }, []);

  const handleApprove = async (id) => {
    setProcessing(id);
    try {
      await api.post(`/approvals/${id}/approve`);
      fetchApprovals();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to approve');
    } finally {
      setProcessing(null);
    }
  };

  const handleDeny = async (id) => {
    setProcessing(id);
    try {
      await api.post(`/approvals/${id}/deny`);
      fetchApprovals();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to deny');
    } finally {
      setProcessing(null);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-800 mb-6 flex items-center gap-2">
        <CheckCircle className="w-7 h-7 text-primary-600" />
        Pending Approvals
      </h1>
      <p className="text-slate-600 mb-6">Review and approve or deny changes submitted by Operations.</p>

      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-x-auto">
        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading...</div>
        ) : approvals.length === 0 ? (
          <div className="p-8 text-center text-slate-500">No pending approvals.</div>
        ) : (
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">ID</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">Type</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">Action</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">Created By</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">Payload</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {approvals.map((a) => (
                <tr key={a.id} className="hover:bg-slate-50">
                  <td className="px-4 sm:px-6 py-4 text-sm text-slate-600">{a.id}</td>
                  <td className="px-4 sm:px-6 py-4 text-sm font-medium">{a.entityType}</td>
                  <td className="px-4 sm:px-6 py-4 text-sm">{a.action}</td>
                  <td className="px-4 sm:px-6 py-4 text-sm">{a.createdBy}</td>
                  <td className="px-4 sm:px-6 py-4 text-sm">
                    <pre className="text-xs bg-slate-100 p-2 rounded max-w-xs overflow-auto">{a.payload}</pre>
                  </td>
                  <td className="px-4 sm:px-6 py-4">
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => handleApprove(a.id)}
                        disabled={processing === a.id}
                        className="px-3 py-1.5 bg-emerald-600 text-white text-sm rounded hover:bg-emerald-700 disabled:opacity-50"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleDeny(a.id)}
                        disabled={processing === a.id}
                        className="px-3 py-1.5 bg-red-600 text-white text-sm rounded hover:bg-red-700 disabled:opacity-50"
                      >
                        Deny
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
