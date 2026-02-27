import {
  ArrowLeft,
  Building2,
  RefreshCcw,
  MoreVertical,
  Pencil,
  Trash2,
  CircleX,
  CircleCheck,
  Plus,
} from "lucide-react";
import React, { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/axios";
import toast from "react-hot-toast";
import { createPortal } from "react-dom";
import AddButton from "../utils/AddButton";
import { Pagination } from "../utils/Pagination";

const logError = (err) => {
  if (process.env.NODE_ENV !== "production") {
    console.error(err);
  }
};

export default function VendorDetails() {
  const { vendorId } = useParams();
  const navigate = useNavigate();

  const [vendorDetails, setVendorDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [vouchers, setVouchers] = useState([]);
  const [totalVouchers, setTotalVouchers] = useState(0);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [syncingVouchers, setSyncingVouchers] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    buyValue: "",
    sellValue: "",
    currency: "USD",
    isActive: true,
  });
  const [error, setError] = useState("");
  const [tableUpdateKey, setTableUpdateKey] = useState(0);

  const fetchVendorDetails = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/vendors/${vendorId}`);
      const data = res.data?.data ?? res.data;
      setVendorDetails(data ?? null);
    } catch (err) {
      logError(err);
      setVendorDetails(null);
      toast.error("Error loading vendor");
    } finally {
      setLoading(false);
    }
  }, [vendorId]);

  const fetchVouchers = useCallback(async () => {
    const vendorIdNum = vendorDetails?.id;
    if (vendorIdNum == null) {
      setVouchers([]);
      setTotalVouchers(0);
      return;
    }
    setLoading(true);
    try {
      const res = await api.get("/vouchers", {
        params: { vendorId: vendorIdNum, page, size },
      });
      const data = res.data?.data ?? res.data ?? {};
      const content = Array.isArray(data.content) ? data.content : (data.content ?? []);
      setVouchers(content);
      setTotalVouchers(data.totalElements ?? (Array.isArray(content) ? content.length : 0));
    } catch (err) {
      logError(err);
      setVouchers([]);
      setTotalVouchers(0);
      toast.error("Error loading vouchers");
    } finally {
      setLoading(false);
    }
  }, [vendorDetails?.id, page, size]);

  useEffect(() => {
    fetchVendorDetails();
  }, [fetchVendorDetails]);

  useEffect(() => {
    if (vendorDetails?.id != null) {
      fetchVouchers();
    } else {
      setVouchers([]);
      setTotalVouchers(0);
    }
  }, [vendorDetails?.id, page, size, tableUpdateKey, fetchVouchers]);

  const fetchSyncVouchers = useCallback(async () => {
    const idempotencyKey = crypto.randomUUID();
    setSyncingVouchers(true);
    try {
      await api.post(`/vendors/${vendorId}/sync-products`, {}, {
        headers: { "X-Idempotency-Key": idempotencyKey },
      });
      toast.success("Vouchers synced successfully");
      setTableUpdateKey((k) => k + 1);
    } catch (err) {
      logError(err);
      toast.error(err.response?.data?.errors?.[0]?.message ?? "Sync failed");
    } finally {
      setSyncingVouchers(false);
    }
  }, [vendorId]);

  const handleOpenModal = () => {
    setShowModal(true);
    setEditId(null);
    setForm({
      name: "",
      description: "",
      buyValue: "",
      sellValue: "",
      currency: "USD",
      isActive: true,
    });
    setError("");
  };

  const handleEditModal = (voucher) => {
    setShowModal(true);
    setEditId(voucher.voucherId ?? voucher.id);
    setForm({
      name: voucher.name ?? "",
      description: voucher.description ?? "",
      buyValue: voucher.buyValue ?? "",
      sellValue: voucher.sellValue ?? "",
      currency: voucher.currency ?? "USD",
      isActive: voucher.isActive ?? true,
    });
    setError("");
  };

  const handleDeactivate = async (voucher) => {
    try {
      await api.put(`/vouchers/${voucher.voucherId ?? voucher.id}`, {
        name: voucher.name,
        description: voucher.description,
        buyValue: voucher.buyValue,
        sellValue: voucher.sellValue,
        vendorId: voucher.vendorId,
        currency: voucher.currency,
        isActive: false,
      });
      toast.success("Voucher deactivated successfully.");
      setTableUpdateKey((k) => k + 1);
    } catch (err) {
      logError(err);
      toast.error(err.response?.data?.errors?.[0]?.message ?? "Failed to deactivate voucher.");
    }
  };

  const handleActivate = async (voucher) => {
    try {
      await api.put(`/vouchers/${voucher.voucherId ?? voucher.id}`, {
        name: voucher.name,
        description: voucher.description,
        buyValue: voucher.buyValue,
        sellValue: voucher.sellValue,
        vendorId: voucher.vendorId,
        currency: voucher.currency,
        isActive: true,
      });
      toast.success("Voucher activated successfully.");
      setTableUpdateKey((k) => k + 1);
    } catch (err) {
      logError(err);
      toast.error(err.response?.data?.errors?.[0]?.message ?? "Failed to activate voucher.");
    }
  };

  const handleDeleteVoucher = async (voucher) => {
    try {
      await api.delete(`/vouchers/${voucher.voucherId ?? voucher.id}`);
      toast.success("Voucher deleted successfully.");
      setTableUpdateKey((k) => k + 1);
    } catch (err) {
      logError(err);
      toast.error(err.response?.data?.errors?.[0]?.message ?? "Failed to delete voucher.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const vendorIdNum = vendorDetails?.id;
    if (!vendorIdNum && !editId) {
      setError("Vendor not loaded.");
      return;
    }
    try {
      const payload = {
        name: form.name,
        description: form.description || null,
        buyValue: form.buyValue != null && form.buyValue !== "" ? Number(form.buyValue) : null,
        sellValue: form.sellValue != null && form.sellValue !== "" ? Number(form.sellValue) : null,
        vendorId: vendorIdNum,
        currency: form.currency || "USD",
        isActive: form.isActive,
      };
      if (editId) {
        await api.put(`/vouchers/${editId}`, payload);
        toast.success("Voucher updated successfully.");
      } else {
        await api.post("/vouchers", payload);
        toast.success("Voucher added successfully.");
      }
      setShowModal(false);
      setEditId(null);
      setForm({ name: "", description: "", buyValue: "", sellValue: "", currency: "USD", isActive: true });
      setTableUpdateKey((k) => k + 1);
    } catch (err) {
      logError(err);
      const msg =
        err.response?.data?.errors?.[0]?.message ??
        err.response?.data?.error ??
        (typeof err.response?.data === "object" ? Object.values(err.response?.data || {}).flat().filter(Boolean)[0] : null) ??
        "Failed";
      setError(typeof msg === "string" ? msg : "Failed");
      toast.error(typeof msg === "string" ? msg : "Failed");
    }
  };

  const formatPrice = (price, currency = "USD") => {
    if (price == null) return "—";
    return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(Number(price));
  };

  const totalPages = Math.max(1, Math.ceil(totalVouchers / size));

  if (loading && !vendorDetails) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[200px]">
        <p className="text-neutral-500">Loading vendor...</p>
      </div>
    );
  }

  if (!vendorDetails) {
    return (
      <div className="p-6 flex flex-col gap-4">
        <button
          className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-neutral-100"
          onClick={() => navigate("/vendors")}
        >
          <ArrowLeft size={18} />
        </button>
        <p className="text-neutral-600">Vendor not found.</p>
      </div>
    );
  }

  return (
    <div className="p-6 flex flex-col gap-6 w-full bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button
            className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-neutral-100"
            onClick={() => navigate("/vendors")}
          >
            <ArrowLeft size={18} />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
              <Building2 className="text-emerald-700" size={22} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-neutral-900">{vendorDetails.name}</h1>
              <span className="text-sm text-emerald-600 bg-emerald-100 rounded-md px-2 py-1">
                {vendorDetails.type}
              </span>
            </div>
          </div>
        </div>
        <button
          className="flex items-center gap-2 px-4 py-2 border border-emerald-200 text-emerald-700 rounded-lg hover:bg-emerald-50 text-sm font-medium"
          onClick={fetchSyncVouchers}
          disabled={syncingVouchers}
        >
          <RefreshCcw size={18} className={syncingVouchers ? "animate-spin" : ""} />
          {syncingVouchers ? "Syncing..." : "Sync Vouchers"}
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Total Vouchers" value={totalVouchers} />
        <div className="bg-white border rounded-2xl p-6 flex flex-col gap-3">
          <p className="text-gray-500 text-sm">Status</p>
          <span className="text-xs px-3 py-1 w-fit bg-emerald-100 text-emerald-700 rounded-md">
            {vendorDetails.isActive ? "Active" : "Inactive"}
          </span>
        </div>
      </div>

      <div className="bg-white border rounded-2xl p-6 flex flex-col gap-4">
        <h2 className="text-base font-semibold text-gray-900">Vendor Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-500">API URL</p>
            <p className="text-sm text-gray-900">{vendorDetails.apiBaseUrl ?? "—"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Vendor Type</p>
            <p className="text-sm text-gray-900 capitalize">{vendorDetails.type ?? "—"}</p>
          </div>
        </div>
      </div>

      <div className="bg-white border rounded-2xl flex flex-col overflow-hidden">
        <div className="flex justify-between items-center p-6 pb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Vouchers</h2>
            <p className="text-sm text-gray-500">Manage vouchers synced from this vendor</p>
          </div>
         <AddButton onClick={handleOpenModal} title="Add Voucher" />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-white border-b border-neutral-200">
              <tr className="text-neutral-900 font-medium text-left">
                <th className="px-4 py-3 w-32">ID</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Buy / Sell</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && vouchers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                    Loading vouchers...
                  </td>
                </tr>
              ) : vouchers.length > 0 ? (
                vouchers.map((voucher) => (
                  <tr
                    key={voucher.voucherId ?? voucher.id ?? voucher.uuid}
                    className="border-b border-neutral-200 hover:bg-neutral-50 transition-colors"
                  >
                    <td className="px-4 py-4 w-32 font-medium text-neutral-900">
                      {voucher.voucherId ?? voucher.id}
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-neutral-700 font-medium">{voucher.name}</span>
                    </td>
                    <td className="px-4 py-4">
                      {formatPrice(voucher.buyValue, voucher.currency)} / {formatPrice(voucher.sellValue, voucher.currency)}
                    </td>
                    <td className="px-4 py-4">
                      <StatusBadge status={voucher.isActive} />
                    </td>
                    <td className="px-4 py-4 flex justify-end items-center">
                      <VoucherRowActions
                        voucher={voucher}
                        onEdit={handleEditModal}
                        onDeactivate={handleDeactivate}
                        onDelete={handleDeleteVoucher}
                        onActivate={handleActivate}
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-4 py-8 h-24 text-center text-sm text-neutral-500">
                    No vouchers found for this vendor. Sync or add one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} size={size} setSize={setSize} />
      </div>

      {showModal &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
            <div className="bg-white rounded-2xl max-w-sm w-full shadow-lg p-6 relative">
              <h2 className="text-lg font-bold mb-3">{editId ? "Edit Voucher" : "Add Voucher"}</h2>
              <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                <div>
                  <label className="block text-sm font-medium mb-1" htmlFor="name">
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    required
                    className="border border-gray-300 rounded-md px-3 py-2 w-full"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" htmlFor="description">
                    Description
                  </label>
                  <input
                    type="text"
                    id="description"
                    className="border border-gray-300 rounded-md px-3 py-2 w-full"
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" htmlFor="buyValue">
                    Buy Value
                  </label>
                  <input
                    type="number"
                    id="buyValue"
                    step="any"
                    min="0"
                    className="border border-gray-300 rounded-md px-3 py-2 w-full"
                    value={form.buyValue}
                    onChange={(e) => setForm((f) => ({ ...f, buyValue: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" htmlFor="sellValue">
                    Sell Value
                  </label>
                  <input
                    type="number"
                    id="sellValue"
                    step="any"
                    min="0"
                    className="border border-gray-300 rounded-md px-3 py-2 w-full"
                    value={form.sellValue}
                    onChange={(e) => setForm((f) => ({ ...f, sellValue: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" htmlFor="currency">
                    Currency
                  </label>
                  <input
                    id="currency"
                    className="border border-gray-300 rounded-md px-3 py-2 w-full"
                    value={form.currency ?? "USD"}
                    onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value }))}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={form.isActive}
                    onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                  />
                  <label htmlFor="isActive" className="text-sm">
                    Active
                  </label>
                </div>
                {error && <div className="text-red-600 text-xs">{error}</div>}
                <div className="flex gap-2 mt-2">
                  <button
                    type="submit"
                    className="bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-700 font-medium"
                  >
                    {editId ? "Update" : "Add"}
                  </button>
                  <button
                    type="button"
                    className="bg-gray-100 text-gray-700 px-4 py-2 rounded hover:bg-gray-200"
                    onClick={() => {
                      setShowModal(false);
                      setEditId(null);
                      setForm({ name: "", description: "", buyValue: "", sellValue: "", currency: "USD", isActive: true });
                      setError("");
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}

function VoucherRowActions({ voucher, onEdit, onDeactivate, onActivate, onDelete }) {
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
      if (buttonRef.current && !buttonRef.current.contains(e.target)) setIsOpen(false);
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
      {isOpen &&
        position &&
        createPortal(
          <div
            style={{ position: "absolute", top: position.top, left: position.left, width: 160 }}
            className="bg-white border border-neutral-200 rounded-lg shadow-lg z-[9999] py-1"
          >
            <button
              onClick={() => {
                close();
                onEdit?.(voucher);
              }}
              className="w-full px-3 py-2 flex items-center text-left text-sm hover:bg-neutral-50 gap-2"
            >
              <Pencil size={16} />
              Edit
            </button>
            {voucher.isActive ? (
              <button
                onClick={() => {
                  close();
                  onDeactivate?.(voucher);
                }}
                className="w-full px-3 py-2 flex items-center gap-2 text-left text-sm border-t hover:bg-neutral-50"
              >
                <CircleX size={16} />
                Deactivate
              </button>
            ) : (
              <button
                onClick={() => {
                  close();
                  onActivate?.(voucher);
                }}
                className="w-full px-3 py-2 flex items-center gap-2 text-left text-sm border-t hover:bg-neutral-50"
              >
                <CircleCheck size={16} />
                Activate
              </button>
            )}
            <button
              onClick={() => {
                close();
                onDelete?.(voucher);
              }}
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

function StatCard({ title, value }) {
  return (
    <div className="bg-white border rounded-2xl p-6 flex flex-col gap-2">
      <p className="text-gray-500 text-sm">{title}</p>
      <p className="text-3xl font-medium text-gray-900">{value}</p>
    </div>
  );
}

function StatusBadge({ status }) {
  const isActive = status;
  return (
    <span
      className={`px-3 py-1 rounded-md text-xs font-medium ${
        isActive ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
      }`}
    >
      {isActive ? "Active" : "Inactive"}
    </span>
  );
}
