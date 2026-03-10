import { CircleX, MoreVertical, Pencil, Plus, SquareArrowOutUpRight, Store, Trash2 } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import api from "../api/axios";
import toast from 'react-hot-toast';
import { createPortal } from 'react-dom';
import { X } from "lucide-react";
import { NavLink } from "react-router-dom";
import { Pagination } from "../utils/Pagination";
import AddButton from "../utils/AddButton";
import { v4 as uuidv4 } from 'uuid';

export default function VendorsTable() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ name: '', type: 'VOUCHER', apiBaseUrl: '', isActive: true });
  const [error, setError] = useState('');

  const [page, setPage] = useState(0);       // 0-based
  const [size, setSize] = useState(10);
  const [total, setTotal] = useState(0);

  const fetchVendors = () => {
    setLoading(true);
    api.get('/vendors', {
      params: {
        page: page,
        size: size,
      }
    })
      .then((res) => {
        console.log(res.data)
        if (Array.isArray(res.data.data.content) && res.data.data.content.length > 0) {
          // fallback legacy
          console.log(res.data.data.content)
          setVendors(res.data.data.content);
          setTotal(res.data.data.totalElements);
        } else if (typeof res.data.data === "object" && "data" in res.data.data) {
          setVendors(res.data.data.content);
          setTotal(res.data.data.totalElements || 0);
        } else {
          setVendors([]);
          setTotal(0);
        }
      })
      .catch(() => {
        setVendors([]);
        setTotal(0);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // Refetch when page/size changes
  useEffect(() => {
    fetchVendors();
    // eslint-disable-next-line
  }, [page, size]);

  // Modal open/close and editing logic
  const handleOpenModal = () => {
    setShowModal(true);
    setEditId(null);
    setForm({ name: '', apiBaseUrl: '', isActive: true, type: 'VOUCHER' });
    setError('');
  };

  const handleEditModal = (vendor) => {
    setShowModal(true);
    setEditId(vendor.vendorId);
    setForm({ name: vendor.name, apiBaseUrl: vendor.apiBaseUrl, isActive: vendor.isActive, type: 'VOUCHER' });
    setError('');
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setForm({ name: '', apiBaseUrl: '', isActive: true, type: 'VOUCHER' });
    setError('');
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleDeactivate = async (vendor) => {
    try {   
      const idempotencyKey = uuidv4();
      await api.put(`/vendors/${vendor.uuid}`, { name: vendor.name, type: vendor.type, apiBaseUrl: vendor.apiBaseUrl, isActive: false }, { headers: { 'X-Idempotency-Key': idempotencyKey } });
      toast.success('Vendor deactivated successfully.');
      fetchVendors();
    } catch (err) {
      toast.error('Failed to deactivate Vendor.');
    }
  };

  const handleActivate = async (vendor) => {
    try {
      const idempotencyKey = uuidv4();
      await api.put(`/vendors/${vendor.uuid}`, { name: vendor.name, type: vendor.type, apiBaseUrl: vendor.apiBaseUrl, isActive: true }, { headers: { 'X-Idempotency-Key': idempotencyKey } });
      toast.success('Vendor activated successfully.');
      fetchVendors();
    } catch (err) {
      toast.error('Failed to activate Vendor.');
    }
  };

  console.log(vendors)

  const handleDeleteVendor = async (vendor) => {
    try {
      await api.delete(`/vendors/${vendor.uuid}`);
      toast.success('Vendor deleted successfully.');
      fetchVendors();
    } catch (err) {
      toast.error('Failed to delete Vendor.');
    }
  };

  console.log(vendors)

  const handleSubmit = async (e) => {
    const idempotencyKey = crypto.randomUUID();
    e.preventDefault();

    setError('');
    try {
      if (editId) {
        await api.put(`/vendors/${editId}`, form, { headers: { 'X-Idempotency-Key': idempotencyKey } });
        toast.success('Vendor updated successfully.');
      } else {
        await api.post('/vendors', form, { headers: { 'X-Idempotency-Key': idempotencyKey } });
        toast.success('Vendor added successfully.');
      }
      setShowModal(false);
      handleCloseModal();
      fetchVendors();
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        Object.values(err.response?.data || {}).join(' ') ||
        'Failed';
      setError(msg);
      toast.error(msg);
    }
  };

  // Pagination UI (Banks style)
  const totalPages = Math.max(1, Math.ceil(total / size));

  return (
    <div className="p-6 w-full">
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-3 items-center">
          <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
            <Store className="w-5 h-5 text-emerald-700" />
          </div>

          <div>
            <h1 className="text-2xl font-bold">Vendors</h1>
            <p className="text-sm text-neutral-600">
              Manage Vendors, partners, and merchant vendors
            </p>
          </div>
        </div>

        {showModal && (
          <AddVendorModal
            onClose={handleCloseModal}
            form={form}
            onChange={handleChange}
            onSubmit={handleSubmit}
            error={error}
            open={showModal}
            editId={editId}
          />
        )}

       <AddButton onClick={handleOpenModal} title="Add Vendor" />
      </div>

      <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm ">
            <thead className="bg-white border-b border-neutral-200">
              <tr className="text-neutral-900 font-medium text-left">
                <th className="px-4 py-3 w-32">ID</th>
                <th className="px-4 py-3 ">Name</th>
                <th className="px-4 py-3 ">API Base URL</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading
                ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-slate-400">Loading...</td>
                  </tr>
                )
                : vendors.length > 0
                  ? vendors.map((vendor, index) => (
                    <tr
                      key={vendor.id ?? vendor.id}
                      className="border-b border-neutral-200 hover:bg-neutral-50 transition-colors"
                    >
                      <td className="px-4 py-4 w-28 font-medium text-neutral-900">
                        {index + 1}
                      </td>
                      <td className="px-4 py-4">
                        <NavLink to={`/vendors/${vendor.uuid}`} className="flex items-center gap-2 text-emerald-600 font-medium hover:cursor-pointer">
                          {vendor.name}
                          <SquareArrowOutUpRight size={14} />
                        </NavLink>
                      </td>
                      <td className="px-4 py-4 text-neutral-700">{vendor.apiBaseUrl}</td>
                      <td className="px-4 py-4"><StatusBadge status={vendor.isActive} /></td>
                      <td className="px-4 py-4 flex justify-end items-center">
                        <VendorRowActions
                          vendor={vendor}
                          onEdit={handleEditModal}
                          onDeactivate={handleDeactivate}
                          onDelete={handleDeleteVendor}
                          onActivate={handleActivate}
                        />
                      </td>
                    </tr>
                  ))
                  : (
                    <tr>
                      <td colSpan={6} className="px-4 py-4 h-24 text-center text-sm text-neutral-500">
                        No Vendor found. Add your first Vendor to get started.
                      </td>
                    </tr>
                  )
              }
            </tbody>
          </table>
        </div>
        {/* Pagination controls */}
       
        <Pagination
          page={page}
          setPage={setPage}
          total={total}
          totalPages={totalPages}
          size={size}
          setSize={setSize}
          itemLabel="Vendors" 
          pageSizeOptions={[5, 10, 20, 50, 100]}
          className="p-3"
        />
      </div>
    </div>
  );
}

function VendorRowActions({ vendor, onEdit, onDeactivate, onActivate, onDelete }) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState(null);
  const buttonRef = useRef(null);

  const toggleMenu = () => {
    if (!buttonRef.current) return;

    const rect = buttonRef.current.getBoundingClientRect();

    setPosition({
      top: rect.bottom + window.scrollY,
      left: rect.right + window.scrollX - 160,
    });

    setIsOpen((prev) => !prev);
  };

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
          >
            <NavLink to={`/vendors/${vendor.vendorId}`}
              onClick={() => { close(); }}
              className="w-full px-3 py-2 flex items-center text-left text-sm hover:bg-neutral-50 flex gap-2"
            >
             <SquareArrowOutUpRight size={16} /> View detail
            </NavLink>

            <button
              onClick={() => { close(); onEdit?.(vendor); }}
              className="w-full px-3 py-2 flex items-center text-left text-sm hover:bg-neutral-50 flex gap-2"
            >
              <Pencil size={16} />
              Edit
            </button>

            {
              vendor.isActive ? ( <button
                onClick={() => { close(); onDeactivate?.(vendor); }}
                className="w-full px-3 py-2 flex items-center gap-2 text-left text-sm border-t hover:bg-neutral-50"
              >
                <CircleX size={16} />
                Deactivate
              </button> ) : (
                 <button
                 onClick={() => { close(); onActivate?.(vendor); }}
                 className="w-full px-3 py-2 flex items-center gap-2 text-left text-sm border-t hover:bg-neutral-50"
               >
                 {/* No CircleCheck in import, fallback to default icon */}
                 <span className="w-4 h-4 bg-emerald-300 rounded-full inline-block" /> 
                 Activate
               </button>
              )
            }

            <button
              onClick={() => { close(); onDelete?.(vendor); }}
              className="w-full px-3 py-2 flex items-center gap-2 text-left text-sm text-red-600 border-t hover:bg-red-50"
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

function StatusBadge({ status }) {
  const isActive = status;
  return (
    <span
      className={`px-3 py-1 rounded-md text-xs font-medium ${isActive
        ? "bg-emerald-100 text-emerald-700"
        : "bg-red-100 text-red-700"
        }`}
    >
      {status ? 'Active' : 'Inactive'}
    </span>
  );
}

function AddVendorModal({ open, onClose, form, onChange, onSubmit, error, editId }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">{editId ? 'Edit Vendor' : 'Add Vendor'}</h2>
          <button
            type="button"
            className="ml-2"
            onClick={onClose}
            aria-label="Close"
          >
            <X className="w-5 h-5 text-neutral-400 hover:text-neutral-700" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <div>
            <label htmlFor="name" className="block mb-1 text-sm font-medium">Vendor Name</label>
            <input
              id="name"
              name="name"
              value={form.name}
              onChange={onChange}
              placeholder="e.g. Vendor-A"
              autoComplete="off"
              className="border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-600 px-3 py-2 w-full"
              required
            />
          </div>
          <div>
            <label htmlFor="apiBaseUrl" className="block mb-1 text-sm font-medium">Vendor Base API URL</label>
            <input
              id="apiBaseUrl"
              name="apiBaseUrl"
              type="url"
              pattern="https?://.+"
              value={form.apiBaseUrl}
              onChange={onChange}
              placeholder="e.g. http://api.com/v1"
              className="border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-600 px-3 py-2 w-full"
              required
              title="Please enter a valid URL starting with http:// or https://"
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
