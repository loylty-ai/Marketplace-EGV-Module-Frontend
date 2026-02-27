import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import { ChevronDown, Link2, Settings, X } from 'lucide-react';
import AddButton from '../utils/AddButton';
import toast from 'react-hot-toast';

const logError = (err) => {
  if (process.env.NODE_ENV !== 'production') {
    console.error(err);
  }
};

export default function BankVendors() {
  const [banks, setBanks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [vendors, setVendors] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [configuringBank, setConfiguringBank] = useState(null);
  const [assignedVendorIds, setAssignedVendorIds] = useState([]);
  const [loadingVendorsForBank, setLoadingVendorsForBank] = useState(false);
  const [error, setError] = useState('');

  const fetchBanks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/banks", { params: { page, size } });
      const data = res.data?.data ?? res.data ?? {};
      const content = Array.isArray(data.content) ? data.content : (data.content ?? []);
      setBanks(Array.isArray(content) ? content : []);
      setTotal(data.totalElements ?? (Array.isArray(content) ? content.length : 0));
    } catch (err) {
      setBanks([]);
      setTotal(0);
      toast.error('Error loading banks');
      logError(err);
    } finally {
      setLoading(false);
    }
  }, [page, size]);

  const fetchVendorsForModal = useCallback(async () => {
    try {
      const res = await api.get("/vendors", { params: { page: 0, size: 500 } });
      const data = res.data?.data ?? res.data ?? {};
      const content = Array.isArray(data.content) ? data.content : (data.content ?? []);
      setVendors(Array.isArray(content) ? content : []);
    } catch (err) {
      setVendors([]);
      toast.error('Error loading vendors');
      logError(err);
    }
  }, []);

  const fetchAssignedVendorsForBank = useCallback(async (bankUuid) => {
    if (!bankUuid) return;
    setLoadingVendorsForBank(true);
    try {
      const res = await api.get(`/banks/${bankUuid}/vendors`);
      const list = res.data?.data ?? [];
      setAssignedVendorIds(Array.isArray(list) ? list.map((a) => a.vendorId) : []);
    } catch (err) {
      setAssignedVendorIds([]);
      toast.error('Error loading assigned vendors');
      logError(err);
    } finally {
      setLoadingVendorsForBank(false);
    }
  }, []);

  useEffect(() => {
    fetchBanks();
  }, [fetchBanks]);

  const handleOpenModal = useCallback(() => {
    setConfiguringBank(null);
    setAssignedVendorIds([]);
    setError('');
    setShowModal(true);
    fetchVendorsForModal();
  }, [fetchVendorsForModal]);

  const handleConfigureBank = useCallback((bank) => {
    setConfiguringBank(bank);
    setError('');
    setShowModal(true);
    fetchVendorsForModal();
    fetchAssignedVendorsForBank(bank.uuid);
  }, [fetchVendorsForModal, fetchAssignedVendorsForBank]);

  const handleSubmitFromModal = useCallback(async (e, payload) => {
    e?.preventDefault?.();
    if (!payload?.bankUuid) return;
    setError('');
    const idempotencyKey = crypto.randomUUID();
    try {
      await api.put(`/banks/${payload.bankUuid}/vendors`, { vendorIds: payload.vendorIds ?? [] }, {
        headers: { 'X-Idempotency-Key': idempotencyKey },
      });
      toast.success('Bank vendors updated successfully.');
      handleCloseModal();
      fetchBanks();
    } catch (err) {
      logError(err);
      const msg =
        err.response?.data?.errors?.[0]?.message ||
        err.response?.data?.error ||
        (typeof err.response?.data === 'object' ? Object.values(err.response?.data || {}).flat().filter(Boolean)[0] : null) ||
        err.message ||
        'Failed to update bank vendors';
      setError(typeof msg === 'string' ? msg : 'Failed to update bank vendors');
      toast.error(typeof msg === 'string' ? msg : 'Failed to update bank vendors');
    }
  }, [fetchBanks]);

  const handleCloseModal = useCallback(() => {
    setShowModal(false);
    setConfiguringBank(null);
    setAssignedVendorIds([]);
    setLoadingVendorsForBank(false);
    setError('');
  }, []);

  return (
    <div className="w-full h-full p-6 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
            <Link2 className="w-5 h-5 text-emerald-700" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold text-neutral-900">
              Bank Vendor Configuration
            </h1>
            <p className="text-sm text-neutral-600">
              Configure which vendors are integrated with each bank
            </p>
          </div>
        </div>
        <AddButton onClick={handleOpenModal} title="Add Bank Vendor" />
      </div>

      {showModal && (
        <AddBankVendorConfiguration
          open={showModal}
          onClose={handleCloseModal}
          onSubmit={handleSubmitFromModal}
          error={error}
          configuringBank={configuringBank}
          banks={banks}
          vendors={vendors}
          initialAssignedVendorIds={assignedVendorIds}
          loadingAssignedVendors={loadingVendorsForBank}
        />
      )}

      <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="border-b border-neutral-200">
            <tr className="text-left text-sm font-medium text-neutral-900">
              <th className="px-3 py-3">Bank</th>
              <th className="px-3 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-neutral-200">
                  <td className="px-3 py-4">
                    <div className="h-4 w-40 bg-neutral-200 rounded animate-pulse" />
                  </td>
                  <td className="px-3 py-4 text-right">
                    <div className="h-8 w-24 bg-neutral-200 rounded animate-pulse ml-auto" />
                  </td>
                </tr>
              ))
            ) : banks.length === 0 ? (
              <tr>
                <td colSpan={2} className="px-3 py-12 text-center text-sm text-neutral-500">
                  No banks found. Add a bank first, then configure vendors for it.
                </td>
              </tr>
            ) : (
              banks.map((bank) => (
                <tr key={bank.uuid ?? bank.bankId ?? bank.id} className="border-b border-neutral-200 hover:bg-neutral-50 transition-colors">
                  <td className="px-3 py-4 font-medium text-neutral-900">
                    {bank.name ?? bank.code ?? `Bank ${bank.bankId ?? bank.id}`}
                  </td>
                  <td className="px-3 py-4 text-right">
                    <button
                      type="button"
                      onClick={() => handleConfigureBank(bank)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-neutral-200 text-sm font-medium text-neutral-700 hover:bg-neutral-100 transition"
                    >
                      <Settings size={14} />
                      Configure vendors
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AddBankVendorConfiguration({
  open,
  onClose,
  onSubmit,
  error,
  configuringBank,
  banks,
  vendors,
  initialAssignedVendorIds,
  loadingAssignedVendors,
}) {
  const [selectedBankUuid, setSelectedBankUuid] = useState('');
  const [selectedVendorIds, setSelectedVendorIds] = useState([]);

  const isEditMode = !!configuringBank;

  useEffect(() => {
    if (configuringBank) {
      setSelectedBankUuid(configuringBank.uuid ?? '');
    } else {
      setSelectedBankUuid('');
    }
  }, [configuringBank]);

  useEffect(() => {
    setSelectedVendorIds(Array.isArray(initialAssignedVendorIds) ? [...initialAssignedVendorIds] : []);
  }, [initialAssignedVendorIds]);

  const toggleVendor = (vendorId) => {
    setSelectedVendorIds((prev) =>
      prev.includes(vendorId) ? prev.filter((v) => v !== vendorId) : [...prev, vendorId]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const bankUuid = isEditMode ? (configuringBank?.uuid ?? selectedBankUuid) : selectedBankUuid;
    if (!bankUuid) return;
    onSubmit(e, { bankUuid, vendorIds: selectedVendorIds });
  };

  const isSubmitDisabled = !(isEditMode ? configuringBank?.uuid : selectedBankUuid) || selectedVendorIds.length === 0;

  if (!open) return null;

  const bankOptions = Array.isArray(banks) ? banks : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="relative w-full max-w-[520px] bg-white rounded-[10px] shadow-[0px_4px_6px_-4px_rgba(0,0,0,0.10),0px_10px_15px_-3px_rgba(0,0,0,0.10)] border border-neutral-200">
        <div className="flex items-center justify-between px-6 pt-6">
          <h2 className="text-[18px] font-semibold text-neutral-950">
            {isEditMode ? 'Configure' : 'Add'} Bank-Vendor Configuration
          </h2>
          <button
            onClick={onClose}
            className="opacity-70 hover:opacity-100 transition"
            aria-label="Close"
            type="button"
          >
            <X size={16} className="text-neutral-950" />
          </button>
        </div>
        <form className="flex flex-col gap-4 px-6 pt-4 pb-6" onSubmit={handleSubmit} autoComplete="off">
          <div className="flex flex-col gap-2">
            <label className="text-[14px] font-medium text-neutral-950">Bank</label>
            <div className="relative">
              <select
                value={selectedBankUuid}
                onChange={(e) => setSelectedBankUuid(e.target.value)}
                disabled={isEditMode}
                className="w-full h-9 px-3 pr-8 bg-neutral-50 border border-transparent rounded-lg text-[14px] font-medium text-neutral-700 focus:outline-none focus:ring-2 focus:ring-emerald-600 appearance-none disabled:opacity-70 disabled:cursor-not-allowed"
                required
              >
                <option value="">Select a bank</option>
                {bankOptions.map((bank) => (
                  <option key={bank.uuid ?? bank.bankId ?? bank.id} value={bank.uuid ?? ''}>
                    {bank.name ?? bank.code ?? `Bank ${bank.bankId ?? bank.id}`}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={16}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[14px] font-medium text-neutral-950">
              Select Vendors to Integrate
            </label>
            {loadingAssignedVendors ? (
              <div className="border border-neutral-200 rounded-[10px] px-4 py-8 flex items-center justify-center text-sm text-neutral-500">
                Loading assigned vendors…
              </div>
            ) : (
              <div className="flex flex-col gap-2 border border-neutral-200 rounded-[10px] px-4 py-4 max-h-[200px] overflow-y-auto">
                {(Array.isArray(vendors) ? vendors : []).map((vendor) => {
                  const checked = selectedVendorIds.includes(vendor.id ?? vendor.vendorId);
                  return (
                    <label
                      key={vendor.id ?? vendor.vendorId}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleVendor(vendor.id ?? vendor.vendorId)}
                        className="w-4 h-4 rounded border-emerald-500 text-emerald-600 focus:ring-emerald-600 accent-emerald-600"
                      />
                      <span className="text-[14px] font-medium text-neutral-950">
                        {vendor.name}
                      </span>
                      {vendor.type && (
                        <span className="text-[12px] font-medium text-neutral-500">
                          ({vendor.type})
                        </span>
                      )}
                    </label>
                  );
                })}
              </div>
            )}
            {selectedVendorIds.length > 0 && !loadingAssignedVendors && (
              <div className="text-emerald-600 text-sm">
                {selectedVendorIds.length} vendor{selectedVendorIds.length !== 1 ? 's' : ''} selected
              </div>
            )}
          </div>

          {error && <div className="text-red-500 text-sm">{error}</div>}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-neutral-200 text-[14px] font-medium text-neutral-950 hover:bg-neutral-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitDisabled}
              className={`px-4 py-2 rounded-lg text-[14px] font-medium text-white transition ${
                isSubmitDisabled
                  ? 'bg-emerald-600 opacity-50 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-700'
              }`}
            >
              {isEditMode ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
