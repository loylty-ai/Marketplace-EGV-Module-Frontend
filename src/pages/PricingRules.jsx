import React, { useEffect, useState, useCallback, useMemo } from "react";
import { MoreVertical, Pencil, X, Receipt, ChevronDown, ChevronUp, Trash2, CircleX, CircleCheck } from "lucide-react";
import api from "../api/axios";
import toast from "react-hot-toast";
import { Pagination } from "../utils/Pagination";
import AddButton from "../utils/AddButton";
import { useAuth } from "../auth/AuthContext";
import { useBank } from "../auth/BankContext";
import { SelectBox } from "../utils/Select";
import MultiSelect from "../utils/MultiSelect";
import { v7 as uuidv7 } from 'uuid';

/**
 * Util for logging production-save.
 */
const logError = (err) => {
  if (process.env.NODE_ENV !== "production") {
    // eslint-disable-next-line no-console
    console.error(err);
  }
};

/**
 * Initial empty form for PricingRule modal.
 */
const INITIAL_FORM = {
  name: "",
  voucherIds: [],
  bankId: "",
  cardId: "",
  cardTierId: "",
  discountType: "PERCENT",
  discountValue: "",
  priority: 1,
  isActive: true,
};

const BankSkeletonRow = React.memo(function BankSkeletonRow() {
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
    </tr>
  );
});

export default function PricingRules() {
  const { selectedBank: globalSelectedBank } = useBank();
  const { isAdmin } = useAuth();

  // List and form state
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

  // Lookup state for ids/uuids - useful for context and for handling changes.
  const [selectedBankId, setSelectedBankId] = useState("");
  const [selectedBankUUID, setSelectedBankUUID] = useState("");
  const [selectedCardUUID, setSelectedCardUUID] = useState("");

  // State for open/close accordion by pricing rule ID
  const [openAccordion, setOpenAccordion] = useState(null);

  // ----------------------------------------
  // Data Fetchers (useCallback for ref safety)
  // ----------------------------------------

  const fetchBanks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/banks", { params: { page, size } });
      const data = res.data?.data || {};
      const content = Array.isArray(data.content)
        ? data.content
        : data.content || [];
      setBanks(content);
      setTotal(data.totalElements ?? content.length ?? 0);
    } catch (err) {
      setBanks([]);
      setTotal(0);
      logError(err);
      toast.error("Error loading banks");
    } finally {
      setLoading(false);
    }
  }, [page, size]);

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


  const handleDeletePricingRule = useCallback(async (pricingRuleId) => {
    if (!pricingRuleId) {
      toast.error("Pricing rule ID is required");
      toast.error("Error deleting pricing rule");
      return;
    }
    try {
      const res = await api.delete(`/pricing-rules/${pricingRuleId}`);
      if (res.status === 200) {
        toast.success("Pricing rule deleted successfully");
        fetchPricingRules();
      } else {
        toast.error("Failed to delete pricing rule");
      }
    } catch (err) {
      logError(err);
      toast.error("Failed to delete pricing rule");
    }}, []);

  // ----------------------------------------
  // Effects for initialization and on select
  // ----------------------------------------

  // Initial load
  useEffect(() => {
    fetchBanks();
    fetchVouchers();
    fetchPricingRules();
  }, [page, size, fetchBanks, fetchVouchers, fetchPricingRules]);

  // When the selected bank changes (for Add/Edit), fetch cards
  useEffect(() => {
    if (selectedBankUUID) {
      fetchCardsByBankUuid(selectedBankUUID);
    } else {
      setCards([]);
    }
    setTiers([]);
    setSelectedCardUUID("");
  }, [selectedBankUUID, fetchCardsByBankUuid]);

  // When the selected card changes, fetch tiers
  useEffect(() => {
    if (selectedCardUUID) {
      fetchTiersByCardId(selectedCardUUID);
    } else {
      setTiers([]);
    }
  }, [selectedCardUUID, fetchTiersByCardId]);

  // When modal is open and bank is selected, load vouchers only for that bank
  useEffect(() => {
    if (showModal && form.bankId) {
      fetchVouchersByBank(form.bankId);
    }
  }, [showModal, form.bankId, fetchVouchersByBank]);

  // ----------------------------------------
  // Handlers
  // ----------------------------------------

  const handleOpenModal = useCallback(() => {
    setShowModal(true);
    setEditId(null);
    setForm(INITIAL_FORM);
    setError("");
    setSelectedBankId("");
    setSelectedBankUUID("");
    setCards([]);
    setTiers([]);
    setSelectedCardUUID("");
  }, []);

  // --- REWRITE handleEditModal to PREFILL form after fetching dependencies ---
  // This handles opening the modal for editing and pre-filling dependent form data as needed.
  const handleEditModal = useCallback(
    async (rule, banksList) => {
      const bankId = rule.bankId ?? rule.bank_id ?? "";

      const banksArr =
        Array.isArray(banksList) && banksList.length > 0 ? banksList : banks;

      const bank = banksArr.find(
        (b) => String(b.bankId ?? b.id) === String(bankId)
      );

      // This will be the initial values - but form should only be set after all dependencies (cards/tiers) are loaded.
      const prefilledForm = {
        name: rule.name || "",
        voucherIds:
          Array.isArray(rule.voucherIds) && rule.voucherIds.length > 0
            ? rule.voucherIds
            : Array.isArray(rule.vouchers)
            ? rule.vouchers.map((v) => v.voucherId ?? v.id)
            : [],
        bankId: bankId || "",
        cardId: rule.cardId ?? rule.cardUuid ?? "",
        cardTierId: rule.cardTierId ?? rule.cardTierUuid ?? "",
        discountType: rule.discountType || "PERCENT",
        discountValue: rule.discountValue ?? "",
        priority: rule.priority ?? 1,
        isActive: typeof rule.isActive === "boolean" ? rule.isActive : true,
      };

      // Ensure correct types for number fields
      prefilledForm.bankId = prefilledForm.bankId ? String(prefilledForm.bankId) : "";
      prefilledForm.cardId = prefilledForm.cardId ? String(prefilledForm.cardId) : "";
      prefilledForm.cardTierId = prefilledForm.cardTierId
        ? String(prefilledForm.cardTierId)
        : "";
      prefilledForm.discountValue =
        typeof prefilledForm.discountValue === "number"
          ? String(prefilledForm.discountValue)
          : (prefilledForm.discountValue ?? "");
      prefilledForm.priority =
        typeof prefilledForm.priority === "number"
          ? prefilledForm.priority
          : Number(prefilledForm.priority) || 1;

      // make sure voucherIds are all string/number as expected by MultiSelect
      if (Array.isArray(prefilledForm.voucherIds)) {
        prefilledForm.voucherIds = prefilledForm.voucherIds.map((v) =>
          typeof v === "number" ? v : String(v)
        );
      }

      // console.log("prefilledForm", prefilledForm);

      // Set dependencies, then set the form after dependencies are loaded
      if (bank?.uuid) {
        setSelectedBankUUID(bank.uuid);
        setSelectedBankId(bank.bankId ?? bank.id);

        // fetch cards for bank, THEN set card/tiers, and finally set the form
        await fetchCardsByBankUuid(bank.uuid);
      }
      // After cards are loaded, lookup the selected card by ID and get its uuid if available
      if (prefilledForm.cardId && Array.isArray(cards) && cards.length > 0) {
        const selectedCard =
          cards.find(
            (card) =>
              String(card.id) === String(prefilledForm.cardId) ||
              String(card.cardId) === String(prefilledForm.cardId) 
          ) || null;
       
        const cardUuid = selectedCard?.uuid || prefilledForm.cardId;
        setSelectedCardUUID(cardUuid);
        await fetchTiersByCardId(cardUuid);
      }
      // Finally, set form with all values.
      setForm(prefilledForm);

      setEditId(rule.uuid);
      setError("");
      setShowModal(true);
    },
    [banks, fetchCardsByBankUuid, fetchTiersByCardId]
  );

  const handleCloseModal = useCallback(() => {
    setShowModal(false);
    setEditId(null);
    setForm(INITIAL_FORM);
    setError("");
    setSelectedBankId("");
    setSelectedBankUUID("");
    setCards([]);
    setTiers([]);
    setSelectedCardUUID("");
  }, []);

  const handleDeactivatePricingRule = useCallback(async (pricingRule) => {
    const idempotencyKey = uuidv7();
    try{
      await api.put(`/pricing-rules/${pricingRule.uuid}`, { name: pricingRule.name, voucherIds: pricingRule.voucherIds, bankId: pricingRule.bankId, cardId: pricingRule.cardId, cardTierId: pricingRule.cardTierId, discountType: pricingRule.discountType, discountValue: pricingRule.discountValue, priority: pricingRule.priority, isActive: false }, { headers: { "X-Idempotency-Key": idempotencyKey } });
      toast.success("Pricing rule deactivated successfully.");
      fetchPricingRules();
    } catch (err) {
      logError(err);
      toast.error("Failed to deactivate pricing rule.");
    }
  }, [fetchPricingRules]);

  const handleActivatePricingRule = useCallback(async (pricingRule) => {
    console.log("handleActivatePricingRule", pricingRule);
    const idempotencyKey = uuidv7();
    try{
      await api.put(`/pricing-rules/${pricingRule.uuid}`, { name: pricingRule.name, voucherIds: pricingRule.voucherIds, bankId: pricingRule.bankId, cardId: pricingRule.cardId, cardTierId: pricingRule.cardTierId, discountType: pricingRule.discountType, discountValue: pricingRule.discountValue, priority: pricingRule.priority, isActive: true }, { headers: { "X-Idempotency-Key": idempotencyKey } });
      toast.success("Pricing rule activated successfully.");
      fetchPricingRules();
    } catch (err) {
      logError(err);
      toast.error("Failed to activate pricing rule.");
    }
  }, [fetchPricingRules]);

  // Memoize filter according to bank context
  const applyBankFilter = useMemo(() => !isAdmin(), [isAdmin]);
  const displayedPricingRules = useMemo(() => {
    if (applyBankFilter && globalSelectedBank) {
      return pricingRules.filter(
        (r) =>
          r.bankId === globalSelectedBank.bankId ||
          r.bankUuid === globalSelectedBank.uuid ||
          r.bankName === globalSelectedBank.name
      );
    }
    return pricingRules;
  }, [applyBankFilter, globalSelectedBank, pricingRules]);

  // Form input change handler
  const handleChange = useCallback(
    (eOrValue, meta) => {
      if (meta && typeof meta.name === "string") {
        switch (meta.name) {
          case "name": {
            setForm((prev) => ({
              ...prev,
              name: eOrValue,
            }));
            break;
          }
          case "bankId": {
            const selectedBankOptionId = eOrValue;
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
            setSelectedCardUUID("");
            setForm((prev) => ({
              ...prev,
              bankId: selectedBankOptionId,
              cardId: "",
              cardTierId: "",
              voucherIds: [],
            }));
            break;
          }
          case "cardId": {
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
            break;
          }
          case "cardTierId": {
            setForm((prev) => ({
              ...prev,
              cardTierId: eOrValue,
            }));
            break;
          }
          case "voucherIds": {
            setForm((prev) => ({
              ...prev,
              voucherIds: Array.isArray(eOrValue) ? eOrValue : [],
            }));
            break;
          }
          case "discountType": {
            setForm((prev) => ({
              ...prev,
              discountType: eOrValue,
            }));
            break;
          }
          default:
            break;
        }
        return;
      }

      // For native controls
      if (eOrValue && eOrValue.target) {
        const { name, value, type, checked } = eOrValue.target;
        switch (name) {
          case "name":
            setForm((prev) => ({
              ...prev,
              name: value,
            }));
            break;
          case "bankId": {
            const selectedBankOptionId = value;
            const selectedBank = Array.isArray(banks)
              ? banks.find(
                  (b) => String(b.bankId ?? b.id) === String(selectedBankOptionId)
                )
              : null;
            setSelectedBankId(selectedBankOptionId);
            setSelectedBankUUID(selectedBank?.uuid ?? "");
            fetchVouchersByBank(selectedBankOptionId);
            setCards([]);
            setTiers([]);
            setSelectedCardUUID("");
            setForm((prev) => ({
              ...prev,
              bankId: selectedBankOptionId,
              cardId: "",
              cardTierId: "",
              voucherIds: [],
            }));
            break;
          }
          case "cardId": {
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
              cardId: cardIdValue,
              cardTierId: "",
            }));
            break;
          }
          default:
            setForm((prev) => ({
              ...prev,
              [name]: type === "checkbox" ? checked : value,
            }));
            break;
        }
        return;
      }
    },
    [banks, fetchVouchersByBank, cards]
  );

  // Handles Add and Edit create/save
  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setError("");
      const idempotencyKey =
        typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
          ? crypto.randomUUID()
          : Math.random().toString(36).slice(2);

      try {
        // #region agent log
        const effectiveFromVal = form.effectiveFrom ? new Date(form.effectiveFrom).toISOString() : null;
        const effectiveToVal = form.effectiveTo ? new Date(form.effectiveTo).toISOString() : null;
        fetch("http://127.0.0.1:7879/ingest/f4cf40af-35e0-4317-af76-4482525fb944", { method: "POST", headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "85d9d7" }, body: JSON.stringify({ sessionId: "85d9d7", location: "PricingRules.jsx:handleSubmit", message: "effective dates payload", data: { formEffectiveFrom: form.effectiveFrom, formEffectiveTo: form.effectiveTo, payloadEffectiveFrom: effectiveFromVal, payloadEffectiveTo: effectiveToVal, effectiveFromInvalid: form.effectiveFrom ? Number.isNaN(new Date(form.effectiveFrom).getTime()) : null, effectiveToInvalid: form.effectiveTo ? Number.isNaN(new Date(form.effectiveTo).getTime()) : null }, timestamp: Date.now(), hypothesisId: "A" }) }).catch(() => {});
        // #endregion
        const payload = {
          name: form.name,
          voucherIds: Array.isArray(form.voucherIds)
            ? form.voucherIds
            : [],
          bankId: form.bankId,
          cardId: form.cardId,
          cardTierId: form.cardTierId,
          discountType: form.discountType,
          discountValue: parseFloat(form.discountValue),
          priority: Number(form.priority) || 1,
          isActive: !!form.isActive,
          effectiveFrom: effectiveFromVal,
          effectiveTo: effectiveToVal,
        };

        // validation
        if (
          !payload.name ||
          !payload.bankId ||
          !payload.discountType ||
          isNaN(payload.discountValue) ||
          !payload.priority
        ) {
          setError("All fields are required.");
          toast.error("Please fill all fields.");
          return;
        }

        if (editId) {
          // Edit mode
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
        // #region agent log
        fetch("http://127.0.0.1:7879/ingest/f4cf40af-35e0-4317-af76-4482525fb944", { method: "POST", headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "85d9d7" }, body: JSON.stringify({ sessionId: "85d9d7", location: "PricingRules.jsx:handleSubmit:catch", message: "submit error", data: { status: err.response?.status, data: err.response?.data, errorMessage: err.message }, timestamp: Date.now(), hypothesisId: "B" }) }).catch(() => {});
        // #endregion
        const msg =
          err.response?.data?.error ||
          Object.values(err.response?.data || {}).join(" ") ||
          "Failed";
        setError(typeof msg === "string" ? msg : "Failed");
        toast.error(typeof msg === "string" ? msg : "Failed");
      }
    },
    [editId, form, fetchPricingRules, handleCloseModal]
  );

  // Memo voucherOptions for dialog (avoid unnecessary recalcs)
  const voucherOptions = useMemo(
    () =>
      Array.isArray(vouchers) && vouchers.length > 0
        ? vouchers.map((v) => ({
            value: v.voucherId ?? v.id,
            uuid: v.uuid,
            label: v.name || v.code || `Voucher ${v.voucherId ?? v.id}`,
          }))
        : [],
    [vouchers]
  );

  // Pagination calculations
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
                <th className="px-4 py-3">Rule Name</th>
                <th className="px-4 py-3">Scope</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 7 }).map((_, i) => (
                  <BankSkeletonRow key={i} />
                ))
              ) : displayedPricingRules.length > 0 ? (
                displayedPricingRules.map((r, index) => {
                  const isOpen = openAccordion === r.id;
                  // Show PricingRuleName/RuleName/Name, fallback as previously
                  const name =
                    r.name ||
                    r.ruleName ||
                    r.voucherTitle ||
                    r.voucherName ||
                    r.voucherId ||
                    (Array.isArray(r.voucherIds) && r.voucherIds.join(", ")) ||
                    r.id;
                  // Scope fallback: Bank name, Card, Tier
                  let scopeParts = [];
                  if (r.bankName) scopeParts.push(r.bankName);
                  else if (r.bankId) scopeParts.push(`Bank ${r.bankId}`);
                  if (r.cardName) scopeParts.push(r.cardName);
                  else if (r.cardId) scopeParts.push(`Card ${r.cardId}`);
                  if (r.cardTierName) scopeParts.push(r.cardTierName);
                  else if (r.cardTierId) scopeParts.push(`Tier ${r.cardTierId}`);
                  const scope = scopeParts.join(" / ");
                  return (
                    <React.Fragment key={r.id}>
                      <tr
                        className={
                          "border-b border-neutral-200 hover:bg-neutral-50 transition-colors" +
                          (isOpen ? " bg-emerald-50" : "")
                        }
                      >
                        <td className="px-4 py-4 w-28 font-medium text-neutral-900">
                          {index + 1}
                        </td>
                        <td className="px-4 py-4">{name}</td>
                        <td className="px-4 py-4">{scope}</td>
                        <td className="px-4 py-4">
                          <StatusBadge status={r.isActive} />
                        </td>
                        <td className="px-4 py-4 flex justify-end items-center">
                          <PricingRuleRowActions
                            pricingRule={r}
                            onEdit={handleEditModal}
                            onDelete={handleDeletePricingRule}
                            onDeactivate={handleDeactivatePricingRule}
                            onActivate={handleActivatePricingRule}
                            banks={banks}
                          />
                        </td>
                        <td className="px-4 py-4 text-right">
                          <button
                            aria-label={isOpen ? "Collapse details" : "Expand details"}
                            type="button"
                            className="p-1 hover:bg-neutral-100 rounded"
                            onClick={() =>
                              setOpenAccordion((curr) => (curr === r.id ? null : r.id))
                            }
                          >
                            {isOpen ? (
                              <ChevronUp className="w-5 h-5 text-emerald-600" />
                            ) : (
                              <ChevronDown className="w-5 h-5 text-neutral-400" />
                            )}
                          </button>
                        </td>
                      </tr>
                      {isOpen && (
                        <tr className="bg-emerald-50 border-b border-neutral-200">
                          <td colSpan={6} className="px-6 pb-6 pt-2">
                            <AccordionDetails r={r} />
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={6}
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

// Professional accordion details for banking dashboard, scalable for hundreds of vouchers

function AccordionDetails({ r }) {

  const VOUCHER_DISPLAY_LIMIT = 10;
  const vouchers = Array.isArray(r.vouchers) && r.vouchers.length > 0
    ? r.vouchers.map((v) => v.voucherName || v.name)
    : [r.voucherTitle || r.voucherName || r.voucherId];

  const filteredVouchers = vouchers.filter(Boolean);
  const [showAll, setShowAll] = useState(false);

  const displayedVouchers = showAll
    ? filteredVouchers
    : filteredVouchers.slice(0, VOUCHER_DISPLAY_LIMIT);
  const hasOverflow = filteredVouchers.length > VOUCHER_DISPLAY_LIMIT;

  return (
    <div className="bg-white border rounded-lg shadow-sm p-6 md:p-8 grid gap-6 md:grid-cols-4 text-sm md:text-base">
      {/* Vouchers */}
      <div className="flex flex-col">
        <div className="flex items-center gap-2 mb-2">
          <span className="font-semibold text-xs text-emerald-700 uppercase tracking-wide">
            Vouchers
          </span>
          {filteredVouchers.length > 0 && (
            <span className="ml-1 bg-emerald-50 border border-emerald-200 text-emerald-600 px-2 text-xs rounded-full">
              {filteredVouchers.length}
            </span>
          )}
        </div>
        <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
          {displayedVouchers.map((v, idx) => (
            <span
              key={idx}
              className="bg-gradient-to-r from-emerald-50 to-emerald-100 border border-emerald-200 text-emerald-800 px-3 py-1 rounded-full font-medium shadow-sm truncate"
              title={v}
            >
              {v}
            </span>
          ))}
          {hasOverflow && !showAll && (
            <button
              type="button"
              className="ml-2 text-emerald-700 underline text-xs font-semibold hover:text-emerald-800"
              onClick={() => setShowAll(true)}
            >
              +{filteredVouchers.length - VOUCHER_DISPLAY_LIMIT} more
            </button>
          )}
          {hasOverflow && showAll && (
            <button
              type="button"
              className="ml-2 text-emerald-700 underline text-xs font-semibold hover:text-emerald-800"
              onClick={() => setShowAll(false)}
            >
              Show less
            </button>
          )}
        </div>
      </div>
      {/* Bank / Card / Tier */}
      <div className="flex flex-col">
        <div className="flex items-center gap-2 mb-2">
          <span className="font-semibold text-xs text-emerald-700 uppercase tracking-wide">
            Bank / Card / Tier
          </span>
        </div>
        <dl className="space-y-1">
          <div className="flex items-center gap-2">
            <dt className="text-neutral-500 font-medium">Bank:</dt>
            <dd>
              {r.bankName || r.bankId || r.bankUuid ? (
                <span>{r.bankName || r.bankId || r.bankUuid}</span>
              ) : (
                <span className="text-neutral-300 italic">Not specified</span>
              )}
            </dd>
          </div>
          <div className="flex items-center gap-2">
            <dt className="text-neutral-500 font-medium">Card:</dt>
            <dd>
              {r.cardName || r.cardId || r.cardUuid ? (
                <span>{r.cardName || r.cardId || r.cardUuid}</span>
              ) : (
                <span className="text-neutral-300 italic">Not specified</span>
              )}
            </dd>
          </div>
          <div className="flex items-center gap-2">
            <dt className="text-neutral-500 font-medium">Tier:</dt>
            <dd>
              {r.cardTierName || r.cardTierId || r.cardTierUuid ? (
                <span>{r.cardTierName || r.cardTierId || r.cardTierUuid}</span>
              ) : (
                <span className="text-neutral-300 italic">Not specified</span>
              )}
            </dd>
          </div>
        </dl>
      </div>
      {/* Discount */}
      <div className="flex flex-col">
        <div className="flex items-center gap-2 mb-2">
          <span className="font-semibold text-xs text-emerald-700 uppercase tracking-wide">
            Discount
          </span>
        </div>
        <dl className="space-y-1">
          <div className="flex items-center gap-2">
            <dt className="text-neutral-500 font-medium">Value:</dt>
            <dd>
              <span className="text-neutral-700 font-semibold">{String(r.discountValue)}</span>
            </dd>
          </div>
          <div className="flex items-center gap-2">
            <dt className="text-neutral-500 font-medium">Type:</dt>
            <dd>
              <span className="text-neutral-700">{r.discountType}</span>
            </dd>
          </div>
          <div className="flex items-center gap-2">
            <dt className="text-neutral-500 font-medium">Priority:</dt>
            <dd>
              <span className="text-neutral-700">{r.priority}</span>
            </dd>
          </div>
        </dl>
      </div>
      {/* Status */}
      <div className="flex flex-col items-start justify-center gap-2">
        <div className="font-semibold text-xs text-emerald-700 uppercase tracking-wide mb-2">
          Status
        </div>
        <div>
          <StatusBadge status={r.isActive} />
        </div>
        <div className="text-xs text-neutral-400 mt-2">
          <span>
            Rule ID: <span className="font-mono">{r.id || r.ruleId || "—"}</span>
          </span>
        </div>
      </div>
    </div>
  );
}

/**
 * Dropdown menu for PricingRule row (edit action).
 */
import ReactDOM from "react-dom";

const PricingRuleRowActions = React.memo(function PricingRuleRowActions({
  pricingRule,
  onEdit,
  onDelete,
  banks,
  onDeactivate,
  onActivate,
}) {
  const [isOpen, setIsOpen] = React.useState(false);
  const buttonRef = React.useRef(null);
  const menuRef = React.useRef(null);
  const [menuPosition, setMenuPosition] = React.useState({ top: 0, left: 0, width: 0 });

  // Close menu on outside click or escape
  React.useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(e) {
      if (
        (buttonRef.current && buttonRef.current.contains(e.target)) ||
        (menuRef.current && menuRef.current.contains(e.target))
      ) {
        return;
      }
      setIsOpen(false);
    }

    function handleEsc(e) {
      if (e.key === "Escape") setIsOpen(false);
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEsc);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [isOpen]);

  // Position the portal menu under the button
  React.useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setMenuPosition({
        top: rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
  }, [isOpen]);

  // Ensure that onClick works in the portal (menu) by using a ref and checking outside clicks

  function handleEdit(e) {
    e.stopPropagation();
    setIsOpen(false);
    if (typeof onEdit === "function") {
      onEdit(pricingRule, banks);
    }
  }

  function handleDelete(e) {
    e.stopPropagation();
    setIsOpen(false);
    if (typeof onDelete === "function") {
      onDelete(pricingRule.uuid);
    }
  }

  return (
    <>
      <button
        type="button"
        ref={buttonRef}
        className="w-9 h-9 rounded-lg hover:bg-neutral-100 flex items-center justify-center text-right transition-colors text-neutral-600"
        aria-label="Open actions"
        onClick={e => {
          e.stopPropagation();
          setIsOpen((v) => !v);
        }}
      >
        <MoreVertical size={18} />
      </button>
      {isOpen &&
        ReactDOM.createPortal(
          <div
            ref={menuRef}
            style={{
              position: "absolute",
              top: menuPosition.top,
              left: menuPosition.left,
              minWidth: 140,
              zIndex: 9999,
            }}
            className="bg-white border border-neutral-200 rounded-lg shadow-lg py-1"
          >
            <button
              className="w-full px-3 py-2 flex items-center text-left text-sm gap-2 hover:bg-neutral-50"
              onClick={handleEdit}
              type="button"
            >
              <Pencil size={16} />
              Edit
            </button>
            {pricingRule.isActive ? (
              <button
                className="w-full px-3 py-2 flex items-center text-left text-sm gap-2 hover:bg-neutral-50"
                onClick={() => {
                  setIsOpen(false);
                  onDeactivate?.(pricingRule, banks);
                }}
                type="button"
              >
                <CircleX size={16} />
                Deactivate
              </button>
            ) : (
              <button
                className="w-full px-3 py-2 flex items-center text-left text-sm gap-2 hover:bg-neutral-50"
                onClick={() => {
                  setIsOpen(false);
                  onActivate?.(pricingRule, banks);
                }}
                type="button"
              >
                <CircleCheck size={16} />
                Activate
              </button> )}
            <button
              className="w-full px-3 py-2 flex items-center text-left text-sm gap-2 hover:bg-neutral-50"
              onClick={handleDelete}
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
});

const AddPricingRuleModal = React.memo(function AddPricingRuleModal({
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
  // Memoize options for better perf/modal rendering
  const bankOptions = useMemo(
    () =>
      Array.isArray(banks) && banks.length > 0
        ? banks.map((b) => ({
            value: String(b.bankId ?? b.id),
            uuid: b.uuid,
            label: b.name || b.code || `Bank ${b.bankId ?? b.id}`,
          }))
        : [],
    [banks]
  );

  const cardOptions = useMemo(
    () =>
      Array.isArray(cards) && cards.length > 0
        ? cards.map((c) => ({
            value: String(c.cardId ?? c.id ?? c.uuid),
            uuid: c.uuid,
            label: c.name || c.code || `Card ${c.cardId ?? c.id ?? c.uuid}`,
          }))
        : [],
    [cards]
  );

  const tierOptions = useMemo(
    () =>
      Array.isArray(tiers) && tiers.length > 0
        ? tiers.map((t) => ({
            value: String(t.cardTierId ?? t.id ?? t.uuid),
            uuid: t.uuid,
            label:
              t.name ||
              t.code ||
              `Card Tier ${t.cardTierId ?? t.id ?? t.uuid}`,
          }))
        : [],
    [tiers]
  );

  const discountTypeOptions = [
    { value: "PERCENT", label: "Percent" },
    { value: "FIXED_AMOUNT", label: "Fixed Amount" },
    { value: "MARGIN_PERCENT", label: "Margin Percent" },
  ];

  const voucherOptions = useMemo(
    () =>
      Array.isArray(vouchers) && vouchers.length > 0
        ? vouchers.map((v) => ({
            value: typeof v.voucherId !== "undefined" && v.voucherId !== null ? v.voucherId : v.id,
            uuid: v.uuid,
            label: v.name || v.code || `Voucher ${v.voucherId ?? v.id}`,
          }))
        : [],
    [vouchers]
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/70 transition-all"
      aria-modal="true"
      tabIndex={-1}
    >
      <div
        className="bg-white rounded-xl shadow-2xl p-0 w-full max-w-2xl border border-neutral-200"
        role="dialog"
        aria-labelledby="pricing-rule-modal-title"
      >
        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-100 bg-neutral-50 rounded-t-xl">
          <h2 id="pricing-rule-modal-title" className="text-xl font-bold text-emerald-700">
            {editId ? "Edit Pricing Rule" : "Add Pricing Rule"}
          </h2>
          <button
            type="button"
            className="ml-2 rounded transition-colors hover:bg-neutral-200 p-1"
            onClick={onClose}
            aria-label="Close"
          >
            <X className="w-6 h-6 text-neutral-500 hover:text-neutral-700" />
          </button>
        </div>
        <form
          onSubmit={onSubmit}
          className="flex flex-col gap-0 px-6 py-8"
          autoComplete="off"
        >
          <div className="mb-2">
            <p className="text-base text-neutral-600">
              Please fill the fields below to {editId ? "update" : "create"} a pricing rule. Fields marked <span className="text-red-600">*</span> are required.
            </p>
          </div>
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
            <div>
              <label
                htmlFor="name"
                className="block mb-1 text-sm font-semibold text-neutral-800"
              >
                Rule Name <span className="text-red-600">*</span>
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={form.name}
                onChange={onChange}
                className="border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 px-3 py-2 w-full bg-neutral-50"
                placeholder="Enter rule name"
                maxLength={80}
                required
                autoFocus
              />
            </div>
            <div>
              <label
                htmlFor="priority"
                className="block mb-1 text-sm font-semibold text-neutral-800"
              >
                Priority <span className="text-red-600">*</span>
              </label>
              <input
                id="priority"
                name="priority"
                type="number"
                min="1"
                value={form.priority}
                onChange={onChange}
                className="border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 px-3 py-2 w-full bg-neutral-50"
                required
              />
            </div>
          </div>

          <div className="grid gap-6 grid-cols-1 md:grid-cols-3 mt-6">
            <div>
              <label
                htmlFor="bankId"
                className="block mb-1 text-sm font-semibold text-neutral-800"
              >
                Bank <span className="text-red-600">*</span>
              </label>
              <SelectBox
                id="bankId"
                name="bankId"
                value={form.bankId}
                onChange={(val) => onChange(val, { name: "bankId" })}
                options={bankOptions}
                placeholder="Select Bank"
                disabled={false}
                required={true}
                label={null}
                error={null}
                className="rounded-lg"
              />
            </div>
            <div>
              <label
                htmlFor="cardId"
                className="block mb-1 text-sm font-semibold text-neutral-800"
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
                required={false}
                label={null}
                error={null}
                className="rounded-lg"
              />
            </div>
            <div>
              <label
                htmlFor="cardTierId"
                className="block mb-1 text-sm font-semibold text-neutral-800"
              >
                Card Tier 
              </label>
              <SelectBox
                id="cardTierId"
                name="cardTierId"
                value={form.cardTierId}
                onChange={(val) => onChange(val, { name: "cardTierId" })}
                options={tierOptions}
                placeholder="Select Card Tier"
                disabled={!form.cardId}
                required={false}
                label={null}
                error={null}
                className="rounded-lg"
              />
            </div>
          </div>

          <div className="mt-6">
            <label
              htmlFor="voucherIds"
              className="block mb-1 text-sm font-semibold text-neutral-800"
            >
              Voucher(s) 
            </label>
            <MultiSelect
              id="voucherIds"
              name="voucherIds"
              value={form.voucherIds}
              onChange={(val, meta) => onChange(val, meta)}
              options={voucherOptions}
              placeholder="Select Voucher(s)"
              disabled={false}
              required={false}
              className="rounded-lg"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
            <div>
              <label
                htmlFor="discountType"
                className="block mb-1 text-sm font-semibold text-neutral-800"
              >
                Discount Type <span className="text-red-600">*</span>
              </label>
              <SelectBox
                id="discountType"
                name="discountType"
                value={form.discountType}
                onChange={(val) => onChange(val, { name: "discountType" })}
                options={discountTypeOptions}
                placeholder="Select Discount Type"
                disabled={false}
                className="rounded-lg"
                required={true}
                label={null}
                error={null}
              />
            </div>
            <div>
              <label
                htmlFor="discountValue"
                className="block mb-1 text-sm font-semibold text-neutral-800"
              >
                Discount Value <span className="text-red-600">*</span>
              </label>
              <input
                id="discountValue"
                name="discountValue"
                type="number"
                step="0.01"
                min="0"
                value={form.discountValue}
                onChange={onChange}
                className="border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 px-3 py-2 w-full bg-neutral-50"
                required
                placeholder="E.g., 5, 10, 20"
              />
            </div>
          </div>
          <div className="flex items-center gap-3 mt-6">
            <label className="flex items-center gap-2 select-none text-sm font-semibold text-neutral-800">
              <input
                type="checkbox"
                name="isActive"
                checked={form.isActive}
                onChange={onChange}
                className="accent-emerald-600 rounded border-neutral-300"
              />
              <span>Active</span>
            </label>
          </div>

          {error && (
            <div className="text-red-500 text-sm mt-5 rounded border border-red-200 bg-red-50 px-3 py-2 animate-fade-in">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-2 mt-8">
            <button
              type="button"
              className="px-5 py-2 rounded-lg border border-neutral-200 bg-white text-neutral-700 font-semibold hover:bg-neutral-100 transition"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-lg bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition"
            >
              {editId ? "Update Rule" : "Create Rule"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
});

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
