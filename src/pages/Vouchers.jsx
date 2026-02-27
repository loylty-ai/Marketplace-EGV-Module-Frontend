// import { useState, useEffect } from 'react';
// import api from '../api/axios';
// import { Plus, Pencil, Ticket } from 'lucide-react';

// export default function Vouchers() {
//   const [vouchers, setVouchers] = useState([]);
//   const [vendors, setVendors] = useState([]);
//   const [currencies, setCurrencies] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [showForm, setShowForm] = useState(false);
//   const [editId, setEditId] = useState(null);
//   const [form, setForm] = useState({ title: '', description: '', faceValue: '', maxPrice: '', vendorId: '', currencyId: '', currency: 'USD', category: '', terms: '', isActive: true });
//   const [error, setError] = useState('');
//   const [success, setSuccess] = useState('');

//   const fetchVouchers = () => {
//     api.get('/vouchers').then((res) => setVouchers(res.data.content)).catch(() => setVouchers([])).finally(() => setLoading(false));
//   };

//   console.log(vouchers)

//   useEffect(() => {
//     fetchVouchers();
//     api.get('/vendors').then((res) => setVendors(res.data.filter((v) => v.type === 'VOUCHER'))).catch(() => setVendors([]));
//     api.get('/currencies').then((res) => setCurrencies(res.data)).catch(() => setCurrencies([]));
//   }, []);

//   const openEdit = (v) => {
//     setEditId(v.voucherId);
//     setForm({ title: v.title, description: v.description || '', faceValue: v.faceValue ?? '', maxPrice: v.maxPrice ?? '', vendorId: v.vendorId ?? '', currencyId: v.currencyId ?? '', currency: v.currency || 'USD', category: v.category || '', terms: v.terms || '', isActive: v.isActive ?? true });
//     setShowForm(true);
//     setError('');
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError('');
//     setSuccess('');
//     try {
//       const payload = { ...form, faceValue: form.faceValue ? parseFloat(form.faceValue) : null, maxPrice: form.maxPrice ? parseFloat(form.maxPrice) : null, vendorId: form.vendorId ? Number(form.vendorId) : null, currencyId: form.currencyId ? Number(form.currencyId) : null };
//       if (editId) {
//         await api.put(`/vouchers/${editId}`, payload);
//         setSuccess('Voucher updated successfully.');
//       } else {
//         await api.post('/vouchers', payload);
//         setSuccess('Voucher submitted successfully.');
//       }
//       setForm({ title: '', description: '', faceValue: '', maxPrice: '', vendorId: '', currencyId: '', currency: 'USD', category: '', terms: '', isActive: true });
//       setShowForm(false);
//       setEditId(null);
//       fetchVouchers();
//     } catch (err) {
//       setError(err.response?.data?.error || Object.values(err.response?.data || {}).join(' ') || 'Failed');
//     }
//   };

//   return (
//     <div>
//       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
//         <h1 className="text-2xl font-semibold text-slate-800 flex items-center gap-2">
//           <Ticket className="w-7 h-7 text-primary-600" />
//           Vouchers
//         </h1>
//         <button
//           onClick={() => (showForm && !editId) ? setShowForm(false) : (setEditId(null), setForm({ title: '', description: '', faceValue: '', maxPrice: '', vendorId: '', currencyId: '', currency: 'USD', category: '', terms: '', isActive: true }), setShowForm(true))}
//           className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium w-full sm:w-auto flex items-center justify-center gap-2 transition-colors"
//         >
//           <Plus className="w-4 h-4" />
//           {showForm && !editId ? 'Cancel' : 'Add Voucher'}
//         </button>
//       </div>

//       {showForm && (
//         <div className="bg-white rounded-lg border border-slate-200 p-6 mb-6 shadow-sm">
//           <h2 className="text-lg font-medium mb-4">{editId ? 'Edit Voucher' : 'Add New Voucher'}</h2>
//           {error && <div className="mb-4 text-red-600 text-sm">{error}</div>}
//           <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
//             <div>
//               <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
//               <input
//                 type="text"
//                 value={form.title}
//                 onChange={(e) => setForm({ ...form, title: e.target.value })}
//                 className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500"
//                 required
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-slate-700 mb-1">Vendor</label>
//               <select
//                 value={form.vendorId}
//                 onChange={(e) => setForm({ ...form, vendorId: e.target.value })}
//                 className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500"
//               >
//                 <option value="">Select vendor</option>
//                 {vendors.map((v) => (
//                   <option key={v.vendorId} value={v.vendorId}>{v.name}</option>
//                 ))}
//               </select>
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
//               <textarea
//                 value={form.description}
//                 onChange={(e) => setForm({ ...form, description: e.target.value })}
//                 className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500"
//                 rows={3}
//               />
//             </div>
//             <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
//               <div>
//                 <label className="block text-sm font-medium text-slate-700 mb-1">Face Value</label>
//                 <input
//                   type="number"
//                   step="0.01"
//                   value={form.faceValue}
//                   onChange={(e) => setForm({ ...form, faceValue: e.target.value })}
//                   className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500"
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-slate-700 mb-1">Max Price</label>
//                 <input
//                   type="number"
//                   step="0.01"
//                   value={form.maxPrice}
//                   onChange={(e) => setForm({ ...form, maxPrice: e.target.value })}
//                   className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500"
//                   placeholder="Base for discount calc"
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-slate-700 mb-1">Currency</label>
//                 <select
//                   value={form.currencyId || ''}
//                   onChange={(e) => {
//                     const idx = e.target.selectedIndex;
//                     const opt = e.target.options[idx];
//                     setForm({ ...form, currencyId: e.target.value ? Number(e.target.value) : '', currency: opt?.dataset?.code || 'USD' });
//                   }}
//                   className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500"
//                 >
//                   <option value="">Select currency</option>
//                   {currencies.map((c) => (
//                     <option key={c.id} value={c.id} data-code={c.code}>{c.code} - {c.name}</option>
//                   ))}
//                 </select>
//               </div>
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
//               <input
//                 type="text"
//                 value={form.category}
//                 onChange={(e) => setForm({ ...form, category: e.target.value })}
//                 className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500"
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-slate-700 mb-1">Terms</label>
//               <textarea
//                 value={form.terms}
//                 onChange={(e) => setForm({ ...form, terms: e.target.value })}
//                 className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500"
//                 rows={2}
//               />
//             </div>
//             <div>
//               <label className="flex items-center gap-2">
//                 <input
//                   type="checkbox"
//                   checked={form.isActive}
//                   onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
//                 />
//                 <span className="text-sm text-slate-700">Active</span>
//               </label>
//             </div>
//             <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
//               {editId ? 'Update' : 'Submit'}
//             </button>
//           </form>
//         </div>
//       )}

//       {success && <div className="mb-4 text-emerald-600 bg-emerald-50 px-4 py-2 rounded-lg">{success}</div>}

//       <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-x-auto">
//         {loading ? (
//           <div className="p-8 text-center text-slate-500">Loading...</div>
//         ) : (
//           <table className="min-w-full divide-y divide-slate-200">
//             <thead className="bg-slate-50">
//               <tr>
//                 <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">ID</th>
//                 <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">Title</th>
//                 <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">Vendor</th>
//                 <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">Face Value</th>
//                 <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">Max Price</th>
//                 <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">Category</th>
//                 <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">Status</th>
//                 <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">Actions</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-slate-200">
//               {vouchers.map((v) => (
//                 <tr key={v.voucherId} className="hover:bg-slate-50 transition-colors">
//                   <td className="px-4 sm:px-6 py-4 text-sm text-slate-600">{v.voucherId}</td>
//                   <td className="px-4 sm:px-6 py-4 text-sm font-medium text-slate-800">{v.title}</td>
//                   <td className="px-4 sm:px-6 py-4 text-sm text-slate-600">{v.vendorName || '—'}</td>
//                   <td className="px-4 sm:px-6 py-4 text-sm text-slate-600">{v.faceValue != null ? `${v.currency || ''} ${v.faceValue}` : '—'}</td>
//                   <td className="px-4 sm:px-6 py-4 text-sm text-slate-600">{v.maxPrice != null ? `${v.currency || ''} ${v.maxPrice}` : '—'}</td>
//                   <td className="px-4 sm:px-6 py-4 text-sm text-slate-600">{v.category || '—'}</td>
//                   <td className="px-4 sm:px-6 py-4 text-sm"><span className={`px-2 py-1 rounded text-xs ${v.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>{v.isActive ? 'Active' : 'Inactive'}</span></td>
//                   <td className="px-4 sm:px-6 py-4">
//                     <button onClick={() => openEdit(v)} className="p-1.5 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors" title="Edit">
//                       <Pencil className="w-4 h-4" />
//                     </button>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         )}
//       </div>
//     </div>
//   );
// }



import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  SquareArrowOutUpRight,
  MoreVertical,
  Pencil,
  CircleX,
  CircleCheck,
  Trash2,
  X,
  Ticket,
} from "lucide-react";
import api from "../api/axios";
import toast from 'react-hot-toast';
import { createPortal } from 'react-dom';
import { NavLink } from "react-router-dom";
import { Pagination } from "../utils/Pagination";
import AddButton from "../utils/AddButton";
import SkeletonTable from "../utils/SkeletonTable";
import { useBank } from "../auth/BankContext";
import { useAuth } from "../auth/AuthContext";

// Strict error and logging policy for production
const logError = (err) => {
  if (process.env.NODE_ENV !== "production") {
    // eslint-disable-next-line no-console
    console.error(err);
  }
};

const INITIAL_FORM = { name: "", code: "", isActive: true };

// Main page
export default function VouchersPage() {
  const { selectedBank } = useBank();
  const { isAdmin } = useAuth();
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(INITIAL_FORM);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);

  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [total, setTotal] = useState(0);

  const applyBankFilter = !isAdmin();
  const bankIdForFilter = applyBankFilter && selectedBank != null ? (selectedBank.bankId ?? selectedBank.id) : null;

  const fetchVouchers = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, size };
      if (bankIdForFilter != null) {
        params.bankId = bankIdForFilter;
      }
      const res = await api.get("/vouchers", { params });
      const data = res?.data?.data ?? res?.data ?? {};
      const content = Array.isArray(data.content) ? data.content : (data.content ?? []);
      setVouchers(Array.isArray(content) ? content : []);
      setTotal(data.totalElements ?? (Array.isArray(content) ? content.length : 0));
    } catch (err) {
      setVouchers([]);
      setTotal(0);
      logError(err);
      toast.error('Error loading vouchers');
    } finally {
      setLoading(false);
    }
  }, [page, size, bankIdForFilter]);

  useEffect(() => {
    fetchVouchers();
  }, [fetchVouchers]);

  // Modal handlers
  const handleOpenModal = useCallback(() => {
    setShowModal(true);
    setEditId(null);
    setForm(INITIAL_FORM);
    setError('');
  }, []);

  const handleEditModal = useCallback((bank) => {
    setShowModal(true);
    setEditId(bank.uuid);
    setForm({ name: bank.name, code: bank.code, isActive: bank.isActive });
    setError('');
  }, []);

  const handleCloseModal = useCallback(() => {
    setShowModal(false);
    setEditId(null);
    setForm(INITIAL_FORM);
    setError('');
  }, []);

  // Form change
  const handleChange = useCallback((e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }, []);

  // CRUD Actions
  const handleDeactivate = useCallback(async (bank) => {
    try {
      await api.put(`/banks/${bank.uuid}`, { isActive: false, code: bank.code, name: bank.name });
      toast.success('Bank deactivated successfully.');
      fetchVouchers();
    } catch (err) {
      logError(err);
      toast.error('Failed to deactivate bank.');
    }
  }, [fetchVouchers]);

  const handleActivate = useCallback(async (bank) => {
    try {
      await api.put(`/banks/${bank.uuid}`, { isActive: true, code: bank.code, name: bank.name });
      toast.success('Bank activated successfully.');
      fetchVouchers();
    } catch (err) {
      logError(err);
      toast.error('Failed to activate bank.');
    }
  }, [fetchVouchers]);

  const handleDeleteBank = useCallback(async (bank) => {
    if (!window.confirm("Are you sure you want to delete this bank? This cannot be undone.")) return;
    try {
      await api.delete(`/banks/${bank.uuid}`);
      toast.success('Bank deleted successfully.');
      fetchVouchers();
    } catch (err) {
      logError(err);
      toast.error('Failed to delete bank.');
    }
  }, [fetchVouchers]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const idempotencyKey = crypto.randomUUID();
    try {
      if (editId) {
        await api.put(`/banks/${editId}`, form, { headers: { 'X-Idempotency-Key': idempotencyKey } });
        toast.success('Bank updated successfully.');
      } else {
        await api.post('/banks', form, { headers: { 'X-Idempotency-Key': idempotencyKey } });
        toast.success('Bank added successfully.');
        // After add, move to first page so new record appears
        setPage(0);
      }
      handleCloseModal();
      fetchVouchers();
    } catch (err) {
      logError(err);
      const msg =
        err.response?.data?.error ||
        Object.values(err.response?.data || {}).join(' ') ||
        'Failed';
      setError(typeof msg === 'string' ? msg : 'Failed');
      toast.error(typeof msg === 'string' ? msg : 'Failed');
    }
  };

  // Total pages for pagination
  const totalPages = Math.max(1, Math.ceil(total / size));

  return (
    <div className="w-full p-6 flex flex-col gap-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
            <Ticket className="text-emerald-700" size={20} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">Vouchers</h1>
            <p className="text-sm text-neutral-600">Manage Vouchers and their configurations</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {applyBankFilter && selectedBank && (
            <p className="text-sm text-slate-600 bg-slate-50 px-3 py-2 rounded">
              Showing vouchers for <strong>{selectedBank.name ?? selectedBank.code ?? 'selected bank'}</strong>. Change bank via the header dropdown.
            </p>
          )}
          <AddButton onClick={handleOpenModal} title="Add Voucher" />
        </div>
      </div>

      {showModal && (
        <AddBankModal
          onClose={handleCloseModal}
          form={form}
          onChange={handleChange}
          onSubmit={handleSubmit}
          error={error}
          open={showModal}
          editId={editId}
        />
      )}

      <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm ">
            <thead className="bg-white border-b border-neutral-200">
              <tr className="text-neutral-900 font-medium text-left">
                <th className="px-4 py-3 w-32">ID</th>
                <th className="px-4 py-3 ">Name</th>
                <th className="px-4 py-3 ">Vendor Name</th>
                <th className="px-4 py-3 ">Buy Value</th>
                <th className="px-4 py-3 ">Sell Value</th>
                <th className="px-4 py-3 ">Category</th>
                <th className="px-4 py-3 ">Synced At</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                // Show multiple skeleton rows (e.g., 7)
                <>
                  {Array.from({ length: 7 }).map((_, i) => (
                    <SkeletonTable key={i} />
                  ))}
                </>
              ) : vouchers.length > 0 ? (
                vouchers.map((voucher, index) => (
                  <tr
                    key={voucher.uuid}
                    className="border-b border-neutral-200 hover:bg-neutral-50 transition-colors"
                  >
                    <td className="px-4 py-4 w-28 font-medium text-neutral-900">{index + 1}</td>
                    <td className="px-4 py-4">
                     
                        {voucher.name}
                      
                    </td>
                    <td className="px-4 py-4 text-neutral-700">{voucher.vendorName}</td>
                    <td className="px-4 py-4 text-neutral-700">{voucher.buyValue != null ? `${voucher.currency || ''} ${voucher.buyValue}` : '—'}</td>
                    <td className="px-4 py-4 text-neutral-700">{voucher.sellValue != null ? `${voucher.currency || ''} ${voucher.sellValue}` : '—'}</td>
                    <td className="px-4 py-4 text-neutral-700">{voucher.category}</td>
                    <td className="px-4 py-4 text-neutral-700">{voucher.syncedAt ? new Date(voucher.syncedAt).toLocaleString() : '—'}</td>
                    <td className="px-4 py-4">
                      <StatusBadge status={voucher.isActive} />
                    </td>
                    <td className="px-4 py-4 flex justify-end items-center">
                      <BankRowActions
                        bank={voucher}
                        onEdit={handleEditModal}
                        onDeactivate={handleDeactivate}
                        onDelete={handleDeleteBank}
                        onActivate={handleActivate}
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-4 h-24 text-center text-sm text-neutral-500">
                    No Vouchers found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination
          page={page}
          setPage={setPage}
          total={total}
          totalPages={totalPages}
          size={size}
          setSize={setSize}
          itemLabel="Vouchers"
          pageSizeOptions={[5, 10, 20, 50, 100]}
          className="p-3"
        />
      </div>
    </div>
  );
}

// Dropdown for row actions (Edit, Activate/Deactivate, Delete, etc.)
function BankRowActions({ bank, onEdit, onDeactivate, onActivate, onDelete }) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState(null);
  const buttonRef = useRef(null);

  const toggleMenu = useCallback(() => {
    if (!buttonRef.current) return;

    const rect = buttonRef.current.getBoundingClientRect();

    setPosition({
      top: rect.bottom + window.scrollY,
      left: rect.right + window.scrollX - 160,
    });

    setIsOpen((prev) => !prev);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e) => {
      if (buttonRef.current && !buttonRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [isOpen]);

  const close = () => setIsOpen(false);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={toggleMenu}
        className="w-9 h-9 rounded-lg hover:bg-neutral-100 flex items-center justify-center text-right transition-colors text-neutral-600"
        aria-label="Open actions"
      >
        <MoreVertical size={18} />
      </button>

      {isOpen && position &&
        createPortal(
          <div
            style={{
              position: "absolute",
              top: position.top,
              left: position.left,
              width: 160,
            }}
            className="bg-white border border-neutral-200 rounded-lg shadow-lg z-[9999] py-1"
            role="menu"
          >
            <NavLink
              to={`/banks/${bank.uuid}/cards`}
              onClick={close}
              className="w-full px-3 py-2 flex items-center text-left text-sm hover:bg-neutral-50 gap-2"
            >
              <SquareArrowOutUpRight size={16} /> View detail
            </NavLink>
            <button
              onClick={() => { close(); onEdit?.(bank); }}
              className="w-full px-3 py-2 flex items-center text-left text-sm hover:bg-neutral-50 gap-2"
              type="button"
            >
              <Pencil size={16} />
              Edit
            </button>
            {bank.isActive ? (
              <button
                onClick={() => { close(); onDeactivate?.(bank); }}
                className="w-full px-3 py-2 flex items-center gap-2 text-left text-sm border-t hover:bg-neutral-50"
                type="button"
              >
                <CircleX size={16} />
                Deactivate
              </button>
            ) : (
              <button
                onClick={() => { close(); onActivate?.(bank); }}
                className="w-full px-3 py-2 flex items-center gap-2 text-left text-sm border-t hover:bg-neutral-50"
                type="button"
              >
                <CircleCheck size={16} />
                Activate
              </button>
            )}
            <button
              onClick={() => { close(); onDelete?.(bank); }}
              className="w-full px-3 py-2 flex items-center gap-2 text-left text-sm text-red-600 border-t hover:bg-red-50"
              type="button"
            >
              <Trash2 size={16} />
              Delete
            </button>
          </div>,
          document.body
        )}
    </>
  );
}

// Modal for adding/updating a bank
function AddBankModal({ open, onClose, form, onChange, onSubmit, error, editId }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">{editId ? 'Edit Bank' : 'Add Bank'}</h2>
          <button
            type="button"
            className="ml-2"
            onClick={onClose}
            aria-label="Close"
          >
            <X className="w-5 h-5 text-neutral-400 hover:text-neutral-700" />
          </button>
        </div>
        <form onSubmit={onSubmit} className="flex flex-col gap-4" autoComplete="off">
          <div>
            <label htmlFor="name" className="block mb-1 text-sm font-medium">Bank Name</label>
            <input
              id="name"
              name="name"
              value={form.name}
              onChange={onChange}
              placeholder="e.g. ICICI Bank"
              autoComplete="off"
              maxLength={100}
              className="border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-600 px-3 py-2 w-full"
              required
            />
          </div>
          <div>
            <label htmlFor="code" className="block mb-1 text-sm font-medium">Bank Code</label>
            <input
              id="code"
              name="code"
              value={form.code}
              onChange={onChange}
              placeholder="e.g. ICICI-01"
              maxLength={30}
              className="border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-600 px-3 py-2 w-full"
              required
            />
          </div>
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              className="px-4 py-2 rounded-md bg-neutral-100 text-neutral-700"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-md bg-emerald-600 text-white font-bold hover:bg-emerald-700"
            >
              {editId ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Status badge for active/inactive
function StatusBadge({ status }) {
  return (
    <span
      className={`px-3 py-1 rounded-md text-xs font-medium ${status
        ? "bg-emerald-100 text-emerald-700"
        : "bg-red-100 text-red-700"
      }`}
    >
      {status ? 'Active' : 'Inactive'}
    </span>
  );
}

