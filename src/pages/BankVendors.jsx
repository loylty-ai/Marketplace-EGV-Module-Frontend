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
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
            <Link2 className="w-5 h-5 text-primary" />
          </div>
          <div className="min-w-0">
            <h1 className="text-2xl font-bold text-foreground tracking-tight">
              Bank Vendor Configuration
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
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

      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[320px]">
            <thead className="sticky top-0 z-10 bg-muted/80 backdrop-blur-sm border-b border-border">
              <tr className="text-left text-sm font-semibold text-foreground">
                <th className="px-4 py-3.5">Bank</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-border">
                    <td className="px-4 py-4">
                      <div className="h-4 w-40 bg-muted rounded animate-pulse" />
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="h-9 w-28 bg-muted rounded-lg animate-pulse ml-auto" />
                    </td>
                  </tr>
                ))
              ) : banks.length === 0 ? (
                <tr>
                  <td colSpan={2} className="px-4 py-14 text-center text-sm text-muted-foreground">
                    No banks found. Add a bank first, then configure vendors for it.
                  </td>
                </tr>
              ) : (
                banks.map((bank) => (
                  <tr
                    key={bank.uuid ?? bank.bankId ?? bank.id}
                    className="border-b border-border hover:bg-muted/50 transition-colors duration-fast"
                  >
                    <td className="px-4 py-4 font-medium text-foreground">
                      {bank.name ?? bank.code ?? `Bank ${bank.bankId ?? bank.id}`}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleConfigureBank(bank)}
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-border text-sm font-medium text-foreground bg-background hover:bg-muted transition-colors duration-fast"
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-in-fade">
      <div className="relative w-full max-w-[520px] bg-card rounded-xl shadow-modal border border-border animate-in-slide-up">
        <div className="flex items-center justify-between px-6 pt-6">
          <h2 className="text-lg font-semibold text-foreground">
            {isEditMode ? 'Configure' : 'Add'} Bank-Vendor Configuration
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors duration-fast"
            aria-label="Close"
            type="button"
          >
            <X size={18} />
          </button>
        </div>
        <form className="flex flex-col gap-4 px-6 pt-4 pb-6" onSubmit={handleSubmit} autoComplete="off">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-foreground">Bank</label>
            <div className="relative">
              <select
                value={selectedBankUuid}
                onChange={(e) => setSelectedBankUuid(e.target.value)}
                disabled={isEditMode}
                className="w-full h-10 px-3 pr-9 bg-muted/50 border border-input rounded-lg text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary appearance-none disabled:opacity-60 disabled:cursor-not-allowed transition-colors duration-fast"
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
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-foreground">
              Select Vendors to Integrate
            </label>
            {loadingAssignedVendors ? (
              <div className="border border-border rounded-lg px-4 py-8 flex items-center justify-center text-sm text-muted-foreground bg-muted/30">
                Loading assigned vendors…
              </div>
            ) : (
              <div className="flex flex-col gap-2.5 border border-border rounded-lg px-4 py-4 max-h-[200px] overflow-y-auto no-scrollbar bg-muted/20">
                {(Array.isArray(vendors) ? vendors : []).map((vendor) => {
                  const checked = selectedVendorIds.includes(vendor.id ?? vendor.vendorId);
                  return (
                    <label
                      key={vendor.id ?? vendor.vendorId}
                      className="flex items-center gap-3 cursor-pointer py-1 rounded-md hover:bg-muted/50 transition-colors duration-fast"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleVendor(vendor.id ?? vendor.vendorId)}
                        className="w-4 h-4 rounded border-primary text-primary focus:ring-ring accent-primary"
                      />
                      <span className="text-sm font-medium text-foreground">{vendor.name}</span>
                      {vendor.type && (
                        <span className="text-xs font-medium text-muted-foreground">({vendor.type})</span>
                      )}
                    </label>
                  );
                })}
              </div>
            )}
            {selectedVendorIds.length > 0 && !loadingAssignedVendors && (
              <p className="text-primary text-sm font-medium">
                {selectedVendorIds.length} vendor{selectedVendorIds.length !== 1 ? 's' : ''} selected
              </p>
            )}
          </div>

          {error && (
            <div className="text-destructive text-sm font-medium rounded-lg bg-destructive/10 px-3 py-2">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-lg border border-border text-sm font-medium text-foreground bg-background hover:bg-muted transition-colors duration-fast"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitDisabled}
              className="px-4 py-2.5 rounded-lg text-sm font-medium text-primary-foreground bg-primary hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity duration-fast"
            >
              {isEditMode ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
