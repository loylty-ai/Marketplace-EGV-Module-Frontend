
import React, { useEffect, useState } from "react";
import {

  Pencil,
  UsersIcon,
} from "lucide-react";
import api from "../api/axios";
import AddButton from "../utils/AddButton";

// Strict error and logging policy for production
const logError = (err) => {
  if (process.env.NODE_ENV !== "production") {
    // eslint-disable-next-line no-console
    console.error(err);
  }
};

const INITIAL_FORM = { name: "", code: "", isActive: true };

// Skeleton row for loading animation
function SkeletonRow() {
  // 5 table cells: ID, Name, Code, Status, Actions
  return (
    <tr>
      <td className="px-4 py-4 w-28">
        <div className="h-4 w-16 bg-neutral-200 rounded animate-pulse" />
      </td>
      <td className="px-4 py-4">
        <div className="h-4 w-32 bg-neutral-200 rounded animate-pulse" />
      </td>
      <td className="px-4 py-4">
        <div className="h-4 w-20 bg-neutral-200 rounded animate-pulse" />
      </td>
      <td className="px-4 py-4">
        <div className="h-4 w-16 bg-neutral-200 rounded animate-pulse" />
      </td>
      <td className="px-4 py-4 flex justify-end items-center">
        <div className="h-8 w-8 bg-neutral-200 rounded-full animate-pulse" />
      </td>
    </tr>
  );
}

// Main page
export default function Users() {
    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ username: '', password: '', email: '', roleIds: [] });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [assignRoles, setAssignRoles] = useState(null);
    const [editUser, setEditUser] = useState(null);
    const [banks, setBanks] = useState([]);
    const [assignBanksForUser, setAssignBanksForUser] = useState(null);
  
    const fetchUsers = () => api.get('/users').then((res) => setUsers(res.data)).catch(() => setUsers([]));
    const fetchRoles = () => api.get('/roles').then((res) => setRoles(res.data?.data)).catch(() => setRoles([]));
    const fetchBanks = () =>
      api.get('/banks', { params: { page: 0, size: 500 } })
        .then((res) => {
          const data = res.data?.data?.content ?? res.data?.content ?? (Array.isArray(res.data) ? res.data : []);
          setBanks(Array.isArray(data) ? data : []);
        })
        .catch(() => setBanks([]));
  
    useEffect(() => {
      setLoading(true);
      Promise.all([fetchUsers(), fetchRoles(), fetchBanks()]).finally(() => setLoading(false));
    }, []);
  
    console.log(users);
  
    const handleSubmit = async (e) => {
      const idempotencyKey = crypto.randomUUID();
      e.preventDefault();
      setError('');
      setSuccess('');
      try {
        await api.post('/users', {
          ...form,
          roleIds: form.roleIds.length ? form.roleIds : roles.map((r) => r.id),
        }, { headers: { 'X-Idempotency-Key': idempotencyKey } });
        setSuccess('User created successfully.');
        setForm({ username: '', password: '', email: '', roleIds: [] });
        setShowForm(false);
        fetchUsers();
      } catch (err) {
        setError(err.response?.data?.error || Object.values(err.response?.data || {}).join(' ') || 'Failed');
      }
    };
  
    const handleAssignRoles = async (e) => {
      const idempotencyKey = crypto.randomUUID();
      e.preventDefault();
      if (!assignRoles) return;
      setError('');
      try {
        await api.put(`/users/${assignRoles.id}/roles`, { roleIds: assignRoles.roleIds }, { headers: { 'X-Idempotency-Key': idempotencyKey } });
        setSuccess('Roles updated successfully.');
        setAssignRoles(null);
        fetchUsers();
      } catch (err) {
        setError(err.response?.data?.error || Object.values(err.response?.data || {}).join(' ') || 'Failed');
      }
    };
  
    const handleUpdateUser = async (e) => {
      e.preventDefault();
      if (!editUser) return;
      setError('');
      try {
        await api.put(`/users/${editUser.id}`, { username: editUser.username, email: editUser.email, enabled: editUser.enabled });
        setSuccess('User updated successfully.');
        setEditUser(null);
        fetchUsers();
      } catch (err) {
        setError(err.response?.data?.error || Object.values(err.response?.data || {}).join(' ') || 'Failed');
      }
    };
  
    const handleAssignBanks = async (e) => {
      const idempotencyKey = crypto.randomUUID();
      e.preventDefault();
      if (!assignBanksForUser) return;
      setError('');
      try {
        await api.put(`/users/${assignBanksForUser.id}/banks`, { bankIds: assignBanksForUser.bankIds }, { headers: { 'X-Idempotency-Key': idempotencyKey } });
        setSuccess('Banks assigned successfully.');
        setAssignBanksForUser(null);
        fetchUsers();
      } catch (err) {
        setError(err.response?.data?.error || Object.values(err.response?.data || {}).join(' ') || 'Failed');
      }
    };
  

  return (
    <div className="w-full p-6 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
            <UsersIcon className="text-emerald-700" size={20} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">Users</h1>
            <p className="text-sm text-neutral-600">Manage platform users and their roles</p>
          </div>
        </div>
        <AddButton onClick={() => setShowForm(!showForm)} title="Add User" />
      </div>

      {showForm && (
        <div className="bg-white rounded-lg border border-slate-200 p-6 mb-6 shadow-sm">
          <h2 className="text-lg font-medium mb-4">Create New User</h2>
          {error && <div className="mb-4 text-red-600 text-sm">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
              <input
                type="text"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                required
                minLength={6}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Roles</label>
              <div className="space-y-2">
                {roles.map((r) => (
                  <label key={r.id} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={form.roleIds.includes(r.id)}
                      onChange={(e) => {
                        if (e.target.checked) setForm({ ...form, roleIds: [...form.roleIds, r.id] });
                        else setForm({ ...form, roleIds: form.roleIds.filter((id) => id !== r.id) });
                      }}
                    />
                    <span>{r.name}</span>
                  </label>
                ))}
              </div>
            </div>
            <button type="submit" className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">
              Create User
            </button>
          </form>
        </div>
      )}

      {editUser && (
        <div className="bg-white rounded-lg border border-slate-200 p-6 mb-6 shadow-sm">
          <h2 className="text-lg font-medium mb-4">Edit User: {editUser.username}</h2>
          {error && <div className="mb-4 text-red-600 text-sm">{error}</div>}
          <form onSubmit={handleUpdateUser} className="space-y-4 max-w-md">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
              <input
                type="text"
                value={editUser.username}
                onChange={(e) => setEditUser({ ...editUser, username: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input
                type="email"
                value={editUser.email || ''}
                onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={editUser.enabled}
                  onChange={(e) => setEditUser({ ...editUser, enabled: e.target.checked })}
                />
                <span className="text-sm text-slate-700">Enabled</span>
              </label>
            </div>
            <div className="flex gap-2">
              <button type="submit" className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors">
                Save
              </button>
              <button type="button" onClick={() => setEditUser(null)} className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {assignRoles && (
        <div className="bg-white rounded-lg border border-slate-200 p-6 mb-6 shadow-sm">
          <h2 className="text-lg font-medium mb-4">Assign Roles: {assignRoles.username}</h2>
          {error && <div className="mb-4 text-red-600 text-sm">{error}</div>}
          <form onSubmit={handleAssignRoles} className="space-y-4 max-w-md">
            <div className="space-y-2">
              {roles.map((r) => (
                <label key={r.id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={assignRoles.roleIds.includes(r.id)}
                    onChange={(e) => {
                      if (e.target.checked) setAssignRoles({ ...assignRoles, roleIds: [...assignRoles.roleIds, r.id] });
                      else setAssignRoles({ ...assignRoles, roleIds: assignRoles.roleIds.filter((id) => id !== r.id) });
                    }}
                  />
                  <span>{r.name}</span>
                </label>
              ))}
            </div>
            <div className="flex gap-2">
              <button type="submit" className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">
                Save
              </button>
              <button type="button" onClick={() => setAssignRoles(null)} className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {assignBanksForUser && (
        <div className="bg-white rounded-lg border border-slate-200 p-6 mb-6 shadow-sm">
          <h2 className="text-lg font-medium mb-4">Assign Banks: {assignBanksForUser.username}</h2>
          {error && <div className="mb-4 text-red-600 text-sm">{error}</div>}
          <form onSubmit={handleAssignBanks} className="space-y-4 max-w-md">
            <div className="space-y-2">
              {banks.map((bank) => (
                <label key={bank.bankId} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={assignBanksForUser.bankIds.includes(bank.bankId)}
                    onChange={(e) => {
                      if (e.target.checked) setAssignBanksForUser({ ...assignBanksForUser, bankIds: [...assignBanksForUser.bankIds, bank.bankId] });
                      else setAssignBanksForUser({ ...assignBanksForUser, bankIds: assignBanksForUser.bankIds.filter((id) => id !== bank.bankId) });
                    }}
                  />
                  <span>{bank.name}</span>
                </label>
              ))}
            </div>
            <div className="flex gap-2">
              <button type="submit" className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">
                Save
              </button>
              <button type="button" onClick={() => setAssignBanksForUser(null)} className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {success && <div className="mb-4 text-emerald-600 bg-emerald-50 px-4 py-2 rounded-lg">{success}</div>}

      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading...</div>
        ) : (
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">Username</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">Roles</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">Assigned Banks</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-sm text-slate-600">{u.id}</td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-900">{u.username}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{u.email || '—'}</td>
                  <td className="px-6 py-4 text-sm">{u.roles?.join(', ')}</td>
                  <td className="px-6 py-4 text-sm">{u.assignedBanks?.map((b) => b.bankName).join(', ') || '—'}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2 flex-wrap">
                      <button
                        onClick={() => setEditUser({ id: u.id, username: u.username, email: u.email || '', enabled: u.enabled ?? true })}
                        className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setAssignRoles({ id: u.id, username: u.username, roleIds: (u.roles || []).map((r) => roles.find((x) => x.name === r)?.id).filter(Boolean) })}
                        className="text-emerald-600 hover:text-emerald-700 text-sm font-medium px-2 py-1 hover:bg-emerald-50 rounded transition-colors"
                      >
                        Assign Roles
                      </button>
                      <button
                        onClick={() => setAssignBanksForUser({ id: u.id, username: u.username, bankIds: (u.assignedBanks || []).map((b) => b.bankId) })}
                        className="text-emerald-600 hover:text-emerald-700 text-sm font-medium px-2 py-1 hover:bg-emerald-50 rounded transition-colors"
                      >
                        Assign Banks
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


