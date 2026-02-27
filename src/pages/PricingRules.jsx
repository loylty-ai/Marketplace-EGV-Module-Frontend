import React, { useEffect, useState, useCallback } from "react";
import {
  MoreVertical,
  Pencil,
  X,
  Receipt,
} from "lucide-react";
import api from "../api/axios";
import toast from "react-hot-toast";
import { Pagination } from "../utils/Pagination";
import AddButton from "../utils/AddButton";
import { useAuth } from "../auth/AuthContext";
import { useBank } from "../auth/BankContext";
import { SelectBox } from "../utils/Select";

const logError = (err) => {
  if (process.env.NODE_ENV !== "production") {
    // eslint-disable-next-line no-console
    console.error(err);
  }
};

const INITIAL_FORM = {
  voucherId: "",
  bankId: "",
  cardId: "",
  cardTierId: "",
  discountType: "PERCENT",
  discountValue: "",
  priority: 1,
  isActive: true,
};

function BankSkeletonRow() {
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

export default function PricingRules() {
  const { selectedBank: globalSelectedBank } = useBank();
  const [banks, setBanks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(INITIAL_FORM);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);

  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [total, setTotal] = useState(0);

  const [vouchers, setVouchers] = useState([]);
  const [cards, setCards] = useState([]);
  const [tiers, setTiers] = useState([]);

  const [pricingRules, setPricingRules] = useState([]);
  const [totalPricingRules, setTotalPricingRules] = useState(0);

  // Store mapping: bankId -> bankUuid for lookup on selection
  const [selectedBankId, setSelectedBankId] = useState(""); // for form.bankId
  const [selectedBankUUID, setSelectedBankUUID] = useState(""); // for fetching cards
  const [selectedCardUUID, setSelectedCardUUID] = useState("");

  // Fetch all banks paged
  const fetchBanks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/banks", { params: { page, size } });
      const data = res.data?.data || {};
      const content = Array.isArray(data.content)
        ? data.content
        : data.content || [];
      setBanks(content);
    } catch (err) {
      setBanks([]);
      setTotal(0);
      logError(err);
      toast.error("Error loading banks");
    } finally {
      setLoading(false);
    }
  }, [page, size]);

  // Fetch all vouchers paged (for list/initial)
  const fetchVouchers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/vouchers", { params: { page, size } });
      const data = res.data?.data ?? res.data ?? {};
      const content = Array.isArray(data.content)
        ? data.content
        : data.content ?? [];
      setVouchers(Array.isArray(content) ? content : []);
    } catch (err) {
      setVouchers([]);
      logError(err);
      toast.error("Error loading vouchers");
    } finally {
      setLoading(false);
    }
  }, [page, size]);

  // Fetch vouchers scoped to a bank (for modal: only vouchers from bank's selected vendors)
  const fetchVouchersByBank = useCallback(async (bankId) => {
    if (!bankId) {
      setVouchers([]);
      return;
    }
    try {
      const res = await api.get("/vouchers", {
        params: { bankId, page: 0, size: 500 },
      });
      const data = res.data?.data ?? res.data ?? {};
      const content = Array.isArray(data.content)
        ? data.content
        : data.content ?? [];
      setVouchers(Array.isArray(content) ? content : []);
    } catch (err) {
      setVouchers([]);
      logError(err);
      toast.error("Error loading vouchers for bank");
    }
  }, []);

  // Fetch all pricing rules paged
  const fetchPricingRules = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/pricing-rules", { params: { page, size } });
      const data = res.data?.data || {};
      const content = Array.isArray(data.content)
        ? data.content
        : data.content || [];
      setPricingRules(content);
      setTotalPricingRules(data.totalElements ?? (content.length || 0));
    } catch (err) {
      setPricingRules([]);
      setTotalPricingRules(0);
      logError(err);
      toast.error("Error loading pricing rules");
    } finally {
      setLoading(false);
    }
  }, [page, size]);

  // Fetch cards FOR BANK (use UUID for fetching!)
  const fetchCardsByBankUuid = useCallback(async (bankUuid) => {
    if (!bankUuid) {
      setCards([]);
      return;
    }
    setLoading(true);
    try {
      const res = await api.get("/cards", {
        params: { bankId: bankUuid, page: 0, size: 500 },
      });
      const content = Array.isArray(res.data?.data?.content)
        ? res.data.data.content
        : res.data?.content ?? [];
      setCards(content);
    } catch (err) {
      setCards([]);
      logError(err);
      toast.error("Error loading cards");
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch tiers FOR CARD (use cardId)
  const fetchTiersByCardId = useCallback(async (cardIdOrUuid) => {
    if (!cardIdOrUuid) {
      setTiers([]);
      return;
    }
    setLoading(true);
    try {
      const res = await api.get("/card-tiers", {
        params: { cardId: cardIdOrUuid, page: 0, size: 500 },
      });
      const content = Array.isArray(res.data?.data)
        ? res.data.data
        : res.data ?? [];
      setTiers(content);
    } catch (err) {
      setTiers([]);
      logError(err);
      toast.error("Error loading tiers");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBanks();
    fetchVouchers();
    fetchPricingRules();
  }, [page, size, fetchBanks, fetchVouchers, fetchPricingRules]);

  // On bank UUID change, fetch cards
  useEffect(() => {
    if (selectedBankUUID) {
      fetchCardsByBankUuid(selectedBankUUID);
    } else {
      setCards([]);
    }
    setTiers([]);
  }, [selectedBankUUID, fetchCardsByBankUuid]);

  useEffect(() => {
    if (selectedCardUUID) {
      fetchTiersByCardId(selectedCardUUID);
    } else {
      setTiers([]);
    }
  }, [selectedCardUUID, fetchTiersByCardId]);

  // When modal is open and bank is selected, load vouchers scoped to that bank
  useEffect(() => {
    if (showModal && form.bankId) {
      fetchVouchersByBank(form.bankId);
    }
  }, [showModal, form.bankId, fetchVouchersByBank]);

  // Modal handlers
  const handleOpenModal = useCallback(() => {
    setShowModal(true);
    setEditId(null);
    setForm(INITIAL_FORM);
    setError("");
    setSelectedBankId("");
    setSelectedBankUUID("");
    setCards([]);
    setTiers([]);
  }, []);

  const handleEditModal = useCallback((rule, banksList) => {
    setShowModal(true);
    setEditId(rule.id);
    const bankId = rule.bankId ?? rule.bankUuid ?? "";
    setForm({
      voucherId: rule.voucherId ?? "",
      bankId,
      cardId: rule.cardId ?? rule.cardUuid ?? "",
      cardTierId: rule.cardTierId ?? rule.cardTierUuid ?? "",
      discountType: rule.discountType || "PERCENT",
      discountValue: rule.discountValue ?? "",
      priority: rule.priority ?? 1,
      isActive: typeof rule.isActive === "boolean" ? rule.isActive : true,
    });

    // Find matching uuid for given bankId and set both state vars
    const bank = (Array.isArray(banksList) ? banksList : []).find(
      (b) => (b.bankId ?? b.id) == bankId
    );
    if (bank?.uuid) {
      setSelectedBankUUID(bank.uuid);
      setSelectedBankId(bank.bankId ?? bank.id);
    } else {
      setSelectedBankUUID("");
      setSelectedBankId("");
    }

    setError("");
  }, []);

  const handleCloseModal = useCallback(() => {
    setShowModal(false);
    setEditId(null);
    setForm(INITIAL_FORM);
    setError("");
    setSelectedBankId("");
    setSelectedBankUUID("");
    setCards([]);
    setTiers([]);
  }, []);

  const { isAdmin } = useAuth();

  const applyBankFilter = !isAdmin();

  const displayedPricingRules =
    applyBankFilter && globalSelectedBank
      ? pricingRules.filter(
          (r) =>
            r.bankId === globalSelectedBank.bankId ||
            r.bankUuid === globalSelectedBank.uuid ||
            r.bankName === globalSelectedBank.name
        )
      : pricingRules;

  // Use SelectBox for bank and card
  const handleChange = useCallback(
    (eOrValue, meta) => {
      // If SelectBox is used, eOrValue is the value, meta={ name: ... }
      if (meta && meta.name === "bankId") {
        const selectedBankOptionId = eOrValue;
        const selectedBank = Array.isArray(banks)
          ? banks.find(
              (b) =>
                String(b.bankId ?? b.id) === String(selectedBankOptionId)
            )
          : null;
        setSelectedBankId(selectedBankOptionId);
        setSelectedBankUUID(selectedBank?.uuid ?? "");
        // Also clear dependent fields and trigger card/voucher fetch by uuid/id
        fetchVouchersByBank(selectedBankOptionId);
        setCards([]);
        setTiers([]);
        setForm((prev) => ({
          ...prev,
          bankId: selectedBankOptionId,
          cardId: "",
          cardTierId: "",
          voucherId: "",
        }));
        return;
      }

      // For cardId change from SelectBox
      if (meta && meta.name === "cardId") {
        // Find card by id
        const selectedCardOptionId = eOrValue;
        const selectedCard = Array.isArray(cards)
          ? cards.find(
              (c) =>
                String(c.cardId ?? c.id ?? c.uuid) ===
                String(selectedCardOptionId)
            )
          : null;
        setSelectedCardUUID(selectedCard?.uuid ?? "");
        setForm((prev) => ({
          ...prev,
          cardId: selectedCardOptionId,
          cardTierId: "",
        }));
        return;
      }

      // If using native control fallback (e.target)
      if (eOrValue && eOrValue.target) {
        const e = eOrValue;
        const { name, value, type, checked, selectedOptions } = e.target;
        if (name === "bankId") {
          // fallback: not used, but for safety
          const selectedBankOptionId = value;
          const selectedBank = Array.isArray(banks)
            ? banks.find(
                (b) =>
                  String(b.bankId ?? b.id) === String(selectedBankOptionId)
              )
            : null;
          setSelectedBankId(selectedBankOptionId);
          setSelectedBankUUID(selectedBank?.uuid ?? "");
          fetchVouchersByBank(selectedBankOptionId);
          setCards([]);
          setTiers([]);
          setForm((prev) => ({
            ...prev,
            bankId: selectedBankOptionId,
            cardId: "",
            cardTierId: "",
            voucherId: "",
          }));
          return;
        }
        if (name === "cardId") {
          const cardIdValue = value;
          const selectedCard = Array.isArray(cards)
            ? cards.find(
                (c) =>
                  String(c.cardId ?? c.id ?? c.uuid) === String(cardIdValue)
              )
            : null;
          setSelectedCardUUID(selectedCard?.uuid ?? "");
          setForm((prev) => ({
            ...prev,
            cardId: value,
            cardTierId: "",
          }));
          return;
        }
        setForm((prev) => ({
          ...prev,
          [name]: type === "checkbox" ? checked : value,
        }));
        return;
      }

      // fallback
    },
    [banks, fetchVouchersByBank, cards]
  );

  // Save/Update action (create or update pricing rule)
  const handleSubmit = async (e) => {
    const idempotencyKey = crypto.randomUUID();

    e.preventDefault();
    setError("");
    try {
      // Compose payload with ids (NOT UUIDs)
      const payload = {
        voucherId: form.voucherId,
        bankId: form.bankId,
        cardId: form.cardId,
        cardTierId: form.cardTierId,
        discountType: form.discountType,
        discountValue: parseFloat(form.discountValue),
        priority: Number(form.priority) || 1,
        isActive: form.isActive,
      };

      if (editId) {
        await api.put(`/pricing-rules/${editId}`, payload, {
          headers: { "X-Idempotency-Key": idempotencyKey },
        });
        toast.success("Pricing rule updated successfully.");
      } else {
        await api.post("/pricing-rules", payload, {
          headers: { "X-Idempotency-Key": idempotencyKey },
        });
        toast.success("Pricing rule created successfully.");
      }
      handleCloseModal();
      fetchPricingRules();
    } catch (err) {
      logError(err);
      const msg =
        err.response?.data?.error ||
        Object.values(err.response?.data || {}).join(" ") ||
        "Failed";
      setError(typeof msg === "string" ? msg : "Failed");
      toast.error(typeof msg === "string" ? msg : "Failed");
    }
  };

  const voucherOptions =
    Array.isArray(vouchers) && vouchers.length > 0
      ? vouchers.map((v) => ({
          value: v.voucherId ?? v.id,
          uuid: v.uuid,
          label: v.name || v.code || `Voucher ${v.voucherId ?? v.id}`,
        }))
      : [];

  // Total pages for pagination
  const totalPages = Math.max(1, Math.ceil(total / size));

  return (
    <div className="w-full p-6 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
            <Receipt className="text-emerald-700" size={20} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-neutral-900">
              Pricing Rules
            </h1>
            <p className="text-sm text-neutral-600">
              Define tier-based discount rules for card holders
            </p>
          </div>
        </div>
        {applyBankFilter && globalSelectedBank && (
          <p className="text-sm text-slate-600 bg-slate-50 px-3 py-2 rounded">
            Showing rules for <strong>{globalSelectedBank.name}</strong>. Change
            bank via the header dropdown.
          </p>
        )}
        {isAdmin() && (
          <AddButton onClick={handleOpenModal} title="Add Pricing Rule" />
        )}
      </div>

      {showModal && (
        <AddPricingRuleModal
          onClose={handleCloseModal}
          form={form}
          onChange={handleChange}
          onSubmit={handleSubmit}
          error={error}
          open={showModal}
          editId={editId}
          vouchers={vouchers}
          banks={banks}
          cards={cards}
          tiers={tiers}
        />
      )}

      <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm ">
            <thead className="bg-white border-b border-neutral-200">
              <tr className="text-neutral-900 font-medium text-left">
                <th className="px-4 py-3 w-32">ID</th>
                <th className="px-4 py-3">Voucher</th>
                <th className="px-4 py-3">Bank</th>
                <th className="px-4 py-3">Card</th>
                <th className="px-4 py-3">Card Tier</th>
                <th className="px-4 py-3">Discount Value</th>
                <th className="px-4 py-3">Discount Type</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <>
                  {Array.from({ length: 7 }).map((_, i) => (
                    <BankSkeletonRow key={i} />
                  ))}
                </>
              ) : displayedPricingRules.length > 0 ? (
                displayedPricingRules.map((r, index) => (
                  <tr
                    key={r.id}
                    className="border-b border-neutral-200 hover:bg-neutral-50 transition-colors"
                  >
                    <td className="px-4 py-4 w-28 font-medium text-neutral-900">
                      {index + 1}
                    </td>
                    <td className="px-4 py-4">
                      {r.voucherTitle || r.voucherName || r.voucherId}
                    </td>
                    <td className="px-4 py-4">
                      {r.bankName || r.bankId || r.bankUuid}
                    </td>
                    <td className="px-4 py-4">
                      {r.cardName || r.cardId || r.cardUuid}
                    </td>
                    <td className="px-4 py-4">
                      {r.cardTierName || r.cardTierId || r.cardTierUuid}
                    </td>
                    <td className="px-4 py-4">{r.discountValue}</td>
                    <td className="px-4 py-4">{r.discountType}</td>
                    <td className="px-4 py-4">
                      <StatusBadge status={r.isActive} />
                    </td>
                    <td className="px-4 py-4 flex justify-end items-center">
                      <PricingRuleRowActions
                        pricingRule={r}
                        onEdit={handleEditModal}
                        banks={banks}
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-4 h-24 text-center text-sm text-neutral-500"
                  >
                    No pricing rules found. Add your first rule to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination
          page={page}
          setPage={setPage}
          total={totalPricingRules}
          totalPages={totalPages}
          size={size}
          setSize={setSize}
          itemLabel="Pricing Rules"
          pageSizeOptions={[5, 10, 20, 50, 100]}
          className="p-3"
        />
      </div>
    </div>
  );
}

// -- Row actions simplified --
function PricingRuleRowActions({ pricingRule, onEdit, banks }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="relative">
      <button
        type="button"
        className="w-9 h-9 rounded-lg hover:bg-neutral-100 flex items-center justify-center text-right transition-colors text-neutral-600"
        aria-label="Open actions"
        onClick={() => setIsOpen((v) => !v)}
      >
        <MoreVertical size={18} />
      </button>
      {isOpen && (
        <div className="absolute right-0 top-full mt-1 bg-white border border-neutral-200 rounded-lg shadow-lg z-[9999] py-1 min-w-[140px]">
          <button
            className="w-full px-3 py-2 flex items-center text-left text-sm gap-2 hover:bg-neutral-50"
            onClick={() => {
              setIsOpen(false);
              onEdit?.(pricingRule, banks);
            }}
            type="button"
          >
            <Pencil size={16} />
            Edit
          </button>
        </div>
      )}
    </div>
  );
}

// -- Add Pricing Rule Modal with dynamic fetches on select --
function AddPricingRuleModal({
  open,
  onClose,
  form,
  onChange,
  onSubmit,
  error,
  editId,
  vouchers,
  banks,
  cards,
  tiers,
}) {
  // options for SelectBox
  const bankOptions =
    Array.isArray(banks) && banks.length > 0
      ? banks.map((b) => ({
          value: b.bankId ?? b.id,
          uuid: b.uuid,
          label: b.name || b.code || `Bank ${b.bankId ?? b.id}`,
        }))
      : [];

  const cardOptions =
    Array.isArray(cards) && cards.length > 0
      ? cards.map((c) => ({
          value: c.cardId ?? c.id ?? c.uuid,
          uuid: c.uuid,
          label: c.name || c.code || `Card ${c.cardId ?? c.id ?? c.uuid}`,
        }))
      : [];

  const tierOptions =
    Array.isArray(tiers) && tiers.length > 0
      ? tiers.map((t) => ({
          value: t.cardTierId ?? t.id ?? t.uuid,
          uuid: t.uuid,
          label: t.name || t.code || `Card Tier ${t.cardTierId ?? t.id ?? t.uuid}`,
        }))
      : [];

  const discountTypeOptions = [
    { value: "PERCENT", label: "Percent" },
    { value: "FIXED_AMOUNT", label: "Fixed Amount" },
    { value: "MARGIN_PERCENT", label: "Margin Percent" },
  ];

  const voucherOptions =
    Array.isArray(vouchers) && vouchers.length > 0
      ? vouchers.map((v) => ({
          value: v.voucherId ?? v.id,
          uuid: v.uuid,
          label: v.name || v.code || `Voucher ${v.voucherId ?? v.id}`,
        }))
      : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-bold">
            {editId ? "Edit Pricing Rule" : "Add Pricing Rule"}
          </h2>
          <button
            type="button"
            className="ml-2"
            onClick={onClose}
            aria-label="Close"
          >
            <X className="w-5 h-5 text-neutral-400 hover:text-neutral-700" />
          </button>
        </div>
        <p className="text-sm text-neutral-600 mb-4">
          Select bank first, then card, tier, and voucher (vouchers are scoped to
          the selected bank).
        </p>
        <form
          onSubmit={onSubmit}
          className="flex flex-col gap-4"
          autoComplete="off"
        >
          <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
            <div>
              <label
                htmlFor="bankId"
                className="block mb-1 text-sm font-medium"
              >
                Bank
              </label>
              <SelectBox
                id="bankId"
                name="bankId"
                value={form.bankId}
                onChange={(val) => onChange(val, { name: "bankId" })}
                options={bankOptions}
                placeholder="Select Bank"
                disabled={false}
                className=""
                required={true}
                label={null}
                error={null}
              />
            </div>
            <div>
              <label
                htmlFor="cardId"
                className="block mb-1 text-sm font-medium"
              >
                Card
              </label>
              <SelectBox
                id="cardId"
                name="cardId"
                value={form.cardId}
                onChange={(val) => onChange(val, { name: "cardId" })}
                options={form.bankId ? cardOptions : []}
                placeholder={
                  !form.bankId ? "Select a bank first" : "Select Card"
                }
                disabled={!form.bankId}
                className=""
                required={true}
                label={null}
                error={null}
              />
            </div>
            <div>
              <label
                htmlFor="cardTierId"
                className="block mb-1 text-sm font-medium"
              >
                Card Tier
              </label>
              <SelectBox
                id="cardTierId"
                name="cardTierId"
                value={form.cardTierId}
                onChange={onChange}
                options={tierOptions}
                placeholder="Select Card Tier"
                disabled={!form.cardId}
                required={true}
                label={null}
                error={null}
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="voucherId"
              className="block mb-1 text-sm font-medium"
            >
              Voucher
            </label>
            <SelectBox
              id="voucherId"
              name="voucherId"
              value={form.voucherId}
              onChange={onChange}
              options={voucherOptions}
              placeholder="Select Voucher"
              disabled={false}
              required={true}
              label={null}
              error={null}
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="discountType"
                className="block mb-1 text-sm font-medium"
              >
                Discount Type
              </label>
              <SelectBox
                id="discountType"
                name="discountType"
                value={form.discountType}
                onChange={onChange}
                options={[{ value: "PERCENT", label: "Percent" }, { value: "FIXED_AMOUNT", label: "Fixed Amount" }, { value: "MARGIN_PERCENT", label: "Margin Percent" }]}
                placeholder="Select Discount Type"
                disabled={false}
                className=""
                required={true}
                label={null}
                error={null}
              />
            </div>
            <div>
              <label
                htmlFor="discountValue"
                className="block mb-1 text-sm font-medium"
              >
                Discount Value
              </label>
              <input
                id="discountValue"
                name="discountValue"
                type="number"
                step="0.01"
                min="0"
                value={form.discountValue}
                onChange={onChange}
                className="border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-600 px-3 py-2 w-full"
                required
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="priority"
              className="block mb-1 text-sm font-medium"
            >
              Priority
            </label>
            <input
              id="priority"
              name="priority"
              type="number"
              min="1"
              value={form.priority}
              onChange={onChange}
              className="border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-600 px-3 py-2 w-full"
              required
            />
          </div>
          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="isActive"
                checked={form.isActive}
                onChange={onChange}
              />
              <span className="text-sm text-slate-700">Active</span>
            </label>
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
              {editId ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  return (
    <span
      className={`px-3 py-1 rounded-md text-xs font-medium ${
        status
          ? "bg-emerald-100 text-emerald-700"
          : "bg-red-100 text-red-700"
      }`}
    >
      {status ? "Active" : "Inactive"}
    </span>
  );
}
