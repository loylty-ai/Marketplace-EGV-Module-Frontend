import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  Building2,
  SquareArrowOutUpRight,
  MoreVertical,
  Pencil,
  CircleX,
  CircleCheck,
  Trash2,
  X,
} from "lucide-react";
import api from "../api/axios";
import toast from 'react-hot-toast';
import { createPortal } from 'react-dom';
import { NavLink } from "react-router-dom";
import { Pagination } from "../utils/Pagination";
import AddButton from "../utils/AddButton";
import { useAuth } from "../auth/AuthContext";
import { useBank } from "../auth/BankContext";

// Strict error and logging policy for production
const logError = (err) => {
  if (process.env.NODE_ENV !== "production") {
    // eslint-disable-next-line no-console
    console.error(err);
  }
};

const INITIAL_FORM = { name: "", code: "", isActive: true };

// Skeleton row for loading animation
function BankSkeletonRow() {
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
export default function Banks() {
  const [banks, setBanks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(INITIAL_FORM);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);

  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [total, setTotal] = useState(0);

  // Fetch Banks
  const fetchBanks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/banks", { params: { page, size } });
      const data = res.data?.data || {};
      const content = Array.isArray(data.content)
        ? data.content
        : data.content || [];
      setBanks(content);
      setTotal(data.totalElements ?? (content.length || 0));
    } catch (err) {
      setBanks([]);
      setTotal(0);
      logError(err);
      toast.error('Error loading banks');
    } finally {
      setLoading(false);
    }
  }, [page, size]);

  useEffect(() => {
    fetchBanks();
  }, [page, size, fetchBanks]);

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

  const { isAdmin } = useAuth();
  const { selectedBank } = useBank();

  // For OPERATIONS (non-admin), respect header bank filter; admins see all banks
  const applyBankFilter = !isAdmin();
  const displayedBanks =
    applyBankFilter && selectedBank
      ? banks.filter(
          (b) =>
            (b.uuid && b.uuid === selectedBank.uuid) ||
            (b.bankId != null && b.bankId === selectedBank.bankId)
        )
      : banks;
  const displayedTotal =
    applyBankFilter && selectedBank ? displayedBanks.length : total;

  // Form change
  const handleChange = useCallback((e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }, []);

  // CRUD Actions
  const handleDeactivate = useCallback(async (bank) => {
    const idempotencyKey = crypto.randomUUID();
    try {
      await api.put(`/banks/${bank.uuid}`, { isActive: false, code: bank.code, name: bank.name }, { headers: { 'X-Idempotency-Key': idempotencyKey } });
      toast.success('Bank deactivated successfully.');
      fetchBanks();
    } catch (err) {
      logError(err);
      toast.error('Failed to deactivate bank.');
    }
  }, [fetchBanks]);

  const handleActivate = useCallback(async (bank) => {
    const idempotencyKey = crypto.randomUUID();
    try {
      await api.put(`/banks/${bank.uuid}`, { isActive: true, code: bank.code, name: bank.name }, { headers: { 'X-Idempotency-Key': idempotencyKey } });
      toast.success('Bank activated successfully.');
      fetchBanks();
    } catch (err) {
      logError(err);
      toast.error('Failed to activate bank.');
    }
  }, [fetchBanks]);

  const handleDeleteBank = useCallback(async (bank) => {
    // if (!window.confirm("Are you sure you want to delete this bank? This cannot be undone.")) return;
    const idempotencyKey = crypto.randomUUID();
    try {
      await api.delete(`/banks/${bank.uuid}`, { headers: { 'X-Idempotency-Key': idempotencyKey } });
      toast.success('Bank deleted successfully.');
      fetchBanks();
    } catch (err) {
      logError(err);
      toast.error('Failed to delete bank.');
    }
  }, [fetchBanks]);

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
      fetchBanks();
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

  // Total pages for pagination (use displayed total when filtering)
  const totalPages = Math.max(1, Math.ceil(displayedTotal / size));

  return (
    <div className="w-full p-6 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
            <Building2 className="text-emerald-700" size={20} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">Banks</h1>
            <p className="text-sm text-neutral-600">Manage bank partners and their configurations</p>
          </div>
        </div>
        {applyBankFilter && selectedBank && (
          <p className="text-sm text-neutral-600 bg-neutral-100 px-3 py-2 rounded-lg">
            Showing banks for <strong>{selectedBank.name}</strong>. Change via the header dropdown.
          </p>
        )}
        {isAdmin() && <AddButton onClick={handleOpenModal} title="Add Bank" />}
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
                <th className="px-4 py-3 ">Code</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                // Show multiple skeleton rows (e.g., 7)
                <>
                  {Array.from({ length: 7 }).map((_, i) => (
                    <BankSkeletonRow key={i} />
                  ))}
                </>
              ) : displayedBanks.length > 0 ? (
                displayedBanks.map((bank, index) => (
                  <tr
                    key={bank.uuid}
                    className="border-b border-neutral-200 hover:bg-neutral-50 transition-colors"
                  >
                    <td className="px-4 py-4 w-28 font-medium text-neutral-900">{index + 1}</td>
                    <td className="px-4 py-4">
                      <NavLink
                        to={`/banks/${bank.uuid}/cards`}
                        className="flex items-center gap-2 text-emerald-600 font-medium hover:cursor-pointer"
                      >
                        {bank.name}
                        <SquareArrowOutUpRight size={14} />
                      </NavLink>
                    </td>
                    <td className="px-4 py-4 text-neutral-700">{bank.code}</td>
                    <td className="px-4 py-4">
                      <StatusBadge status={bank.isActive} />
                    </td>
                    <td className="px-4 py-4 flex justify-end items-center">
                      <BankRowActions
                        bank={bank}
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
                    {applyBankFilter && selectedBank
                      ? `No bank matches "${selectedBank.name}". Try "All my banks" in the header.`
                      : 'No banks found. Add your first bank to get started.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination
          page={page}
          setPage={setPage}
          total={displayedTotal}
          totalPages={totalPages}
          size={size}
          setSize={setSize}
          itemLabel="Banks"
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

