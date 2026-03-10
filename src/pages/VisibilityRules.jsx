import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
    MoreVertical,
    Pencil,
    X,
    ChevronDown,
    ChevronUp,
    SearchCheckIcon,
    Trash2,
} from "lucide-react";
import api from "../api/axios";
import toast from "react-hot-toast";
import { Pagination } from "../utils/Pagination";
import AddButton from "../utils/AddButton";
import { useAuth } from "../auth/AuthContext";
import { useBank } from "../auth/BankContext";
import { SelectBox } from "../utils/Select";
import MultiSelect from "../utils/MultiSelect";
// You must install shadcn/ui or provide your own ToggleSwitch component
import { ToggleSwitch } from "../utils/ToggleSwitch";
import { v7 as uuidv7 } from 'uuid';
import ReactDOM from "react-dom";
import { StatusBadge } from "../utils/StatusBadge";
import { CircleX, CircleCheck } from "lucide-react";

/**
 * Util for logging production-save.
 */
const logError = (err) => {
    if (process.env.NODE_ENV !== "production") {
    console.error(err);
    }
};

/**
 * Initial empty form for Visibility Rule modal.
 */
const INITIAL_FORM = {
    name: "",
    bankId: "",
    cardId: "",
    cardTierId: "",
    voucherIds: [],
    isVisible: true,
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

export default function VisibilityRules() {
    const { selectedBank: globalSelectedBank } = useBank();
    const { isAdmin } = useAuth();

    // State
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
    const [visibilityRules, setVisibilityRules] = useState([]);
    const [totalVisibilityRules, setTotalVisibilityRules] = useState(0);

    // Lookup state
    const [selectedBankId, setSelectedBankId] = useState("");
    const [selectedBankUUID, setSelectedBankUUID] = useState("");
    const [selectedCardUUID, setSelectedCardUUID] = useState("");
    const [openAccordion, setOpenAccordion] = useState(null);

    // Data Fetchers
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

    const fetchVisibilityRules = useCallback(async () => {
    setLoading(true);
    try {
        const res = await api.get("/voucher-visibility", { params: { page, size } });
        const data = res.data?.data || {};
        const content = Array.isArray(data.content)
        ? data.content
        : data.content || [];
        setVisibilityRules(content);
        setTotalVisibilityRules(data.totalElements ?? (content.length || 0));
    } catch (err) {
        setVisibilityRules([]);
        setTotalVisibilityRules(0);
        logError(err);
        toast.error("Error loading visibility rules");
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
        return content;
    } catch (err) {
        setCards([]);
        logError(err);
        toast.error("Error loading cards");
        return [];
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
        return content;
    } catch (err) {
        setTiers([]);
        logError(err);
        toast.error("Error loading tiers");
        return [];
    } finally {
        setLoading(false);
    }
    }, []);

    // Effects
    useEffect(() => {
    fetchBanks();
    fetchVouchers();
    fetchVisibilityRules();
    }, [page, size, fetchBanks, fetchVouchers, fetchVisibilityRules]);

    useEffect(() => {
    if (selectedBankUUID) {
        fetchCardsByBankUuid(selectedBankUUID);
    } else {
        setCards([]);
    }
    setTiers([]);
    setSelectedCardUUID("");
    }, [selectedBankUUID, fetchCardsByBankUuid]);

    useEffect(() => {
    if (selectedCardUUID) {
        fetchTiersByCardId(selectedCardUUID);
    } else {
        setTiers([]);
    }
    }, [selectedCardUUID, fetchTiersByCardId]);

    useEffect(() => {
    if (showModal && form.bankId) {
        fetchVouchersByBank(form.bankId);
    }
    }, [showModal, form.bankId, fetchVouchersByBank]);

    // Modal + Form handlers
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

    const handleDeleteVisibilityRule = useCallback(async (visibilityRuleId) => {
    if (!visibilityRuleId) {
        toast.error("Visibility rule ID is required");
        toast.error("Error deleting visibility rule");
        return;
    }
    try {
        await api.delete(`/voucher-visibility/${visibilityRuleId}`);
        toast.success("Visibility rule deleted successfully");
        fetchVisibilityRules();
    } catch (err) {
        logError(err);
        toast.error("Failed to delete visibility rule");
    }
    }, []);

    // Editing an existing visibility rule (prefills form)
    const handleEditModal = useCallback(
    async (rule, banksList) => {
        const bankId = rule.bankId ?? rule.bank_id ?? "";

        const banksArr =
        Array.isArray(banksList) && banksList.length > 0 ? banksList : banks;

        const bank = banksArr.find(
        (b) => String(b.bankId ?? b.id) === String(bankId)
        );

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
        isVisible: typeof rule.isVisible === "boolean" ? rule.isVisible : true,
        };

        prefilledForm.bankId = prefilledForm.bankId ? String(prefilledForm.bankId) : "";
        prefilledForm.cardId = prefilledForm.cardId ? String(prefilledForm.cardId) : "";
        prefilledForm.cardTierId = prefilledForm.cardTierId
        ? String(prefilledForm.cardTierId)
        : "";

        if (Array.isArray(prefilledForm.voucherIds)) {
        prefilledForm.voucherIds = prefilledForm.voucherIds.map((v) =>
            typeof v === "number" ? v : String(v)
        );
        }
        let fetchedCards = [];
        if (bank?.uuid) {
        setSelectedBankUUID(bank.uuid);
        setSelectedBankId(bank.bankId ?? bank.id);
        fetchedCards = await fetchCardsByBankUuid(bank.uuid);
        }
        if (prefilledForm.cardId && Array.isArray(fetchedCards) && fetchedCards.length > 0) {
        
        const selectedCard =
            fetchedCards.find(
            (card) =>
                String(card.cardId) === String(prefilledForm.cardId)
            ) || null;

        const cardUuid = selectedCard?.uuid || prefilledForm.cardId;
        
        setSelectedCardUUID(cardUuid);
        const fetchedTiers = await fetchTiersByCardId(cardUuid);
        setTiers(fetchedTiers);
        
    }
        setForm(prefilledForm);
        setEditId(rule.uuid || rule.id);
        setError("");
        setShowModal(true);
    },
    [banks, fetchCardsByBankUuid, fetchTiersByCardId, cards, tiers]
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

    // Filter: restrict to current bank if not admin
    const applyBankFilter = useMemo(() => !isAdmin(), [isAdmin]);
    const displayedVisibilityRules = useMemo(() => {
    if (applyBankFilter && globalSelectedBank) {
        return visibilityRules.filter(
        (r) =>
            r.bankId === globalSelectedBank.bankId ||
            r.bankUuid === globalSelectedBank.uuid ||
            r.bankName === globalSelectedBank.name
        );
    }
    return visibilityRules;
    }, [applyBankFilter, globalSelectedBank, visibilityRules]);

    // --- FORM CHANGE HANDLER
    const handleChange = useCallback(
    (eOrValue, meta) => {
        if (meta && typeof meta.name === "string") {
        switch (meta.name) {
            case "name":
            setForm((prev) => ({ ...prev, name: eOrValue }));
            break;
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
            case "voucherIds":
            setForm((prev) => ({
                ...prev,
                voucherIds: Array.isArray(eOrValue) ? eOrValue : [],
            }));
            break;
            case "isVisible":
            setForm((prev) => ({ ...prev, isVisible: !!eOrValue }));
            break;
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
            setForm((prev) => ({ ...prev, name: value }));
            break;
            case "bankId": {
            const selectedBankOptionId = value;
            const selectedBank = Array.isArray(banks)
                ? banks.find((b) =>
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
            case "isVisible":
            setForm((prev) => ({
                ...prev,
                isVisible: checked,
            }));
            break;
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

    // Handles Add and Edit create/save for visibility rule
    const handleSubmit = useCallback(
    async (e) => {
        e.preventDefault();
        setError("");
        try {
        const payload = {
            name: form.name,
            voucherIds: Array.isArray(form.voucherIds) ? form.voucherIds : [],
            bankId: form.bankId,
            cardId: form.cardId,
            cardTierId: form.cardTierId,
            isVisible: !!form.isVisible,
        };

        console.log("payload", payload)

        if (
            !payload.name ||
            !payload.bankId ||
            !payload.voucherIds.length
        ) {
            setError("Please fill all required fields.");
            toast.error("Please fill all required fields.");
            return;
        }

        const idempotencyKey = uuidv7();
        if (editId) {
            await api.put(`/voucher-visibility/${editId}`, payload, {
            headers: { "X-Idempotency-Key": idempotencyKey },
            });
            toast.success("Visibility rule updated successfully.");
        } else {
            await api.post(`/voucher-visibility`, payload, {
            headers: { "X-Idempotency-Key": idempotencyKey },
            });
            toast.success("Visibility rule created successfully.");
        }
        handleCloseModal();
        fetchVisibilityRules();
        } catch (err) {
        logError(err);
        const msg =
            err.response?.data?.error ||
            Object.values(err.response?.data || {}).join(" ") ||
            "Failed";
        setError(typeof msg === "string" ? msg : "Failed");
        toast.error(typeof msg === "string" ? msg : "Failed");
        }
    },
    [editId, form, fetchVisibilityRules, handleCloseModal]
    );

    const handleDeactivateVisibilityRule = useCallback(async (visibilityRule) => {
        const idempotencyKey = uuidv7();
        try{
            await api.put(`/voucher-visibility/${visibilityRule.uuid}`, { name: visibilityRule.name, voucherIds: visibilityRule.voucherIds, bankId: visibilityRule.bankId, cardId: visibilityRule.cardId, cardTierId: visibilityRule.cardTierId, isVisible: visibilityRule.isVisible, isActive: false }, { headers: { "X-Idempotency-Key": idempotencyKey } });
            toast.success("Visibility rule deactivated successfully.");
            fetchVisibilityRules();
        } catch (err) {
            logError(err);
            toast.error("Failed to deactivate visibility rule.");
        }
    }, [fetchVisibilityRules]);

    const handleActivateVisibilityRule = useCallback(async (visibilityRule) => {
        const idempotencyKey = uuidv7();
        try{
            await api.put(`/voucher-visibility/${visibilityRule.uuid}`, { name: visibilityRule.name, voucherIds: visibilityRule.voucherIds, bankId: visibilityRule.bankId, cardId: visibilityRule.cardId, cardTierId: visibilityRule.cardTierId, isVisible: visibilityRule.isVisible, isActive: true }, { headers: { "X-Idempotency-Key": idempotencyKey } });
            toast.success("Visibility rule activated successfully.");
            fetchVisibilityRules();
        } catch (err) {
            logError(err);
            toast.error("Failed to activate visibility rule.");
        }
    }, [fetchVisibilityRules]);

    // Option lists
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

    const totalPages = Math.max(1, Math.ceil(total / size));

    return (
    <div className="w-full p-6 flex flex-col gap-6">
        <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
            <SearchCheckIcon className="text-emerald-700" size={20} />
            </div>
            <div>
            <h1 className="text-2xl font-black text-neutral-900">
                Visibility Rules
            </h1>
            <p className="text-sm text-neutral-600">
                Define visibility rules for vouchers
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
            <AddButton onClick={handleOpenModal} title="Add Visibility Rule" />
        )}
        </div>

        {showModal && (
        <AddVisibilityRuleModal
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
                <th className="px-4 py-3">Visibility</th>
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
                ) : displayedVisibilityRules.length > 0 ? (
                displayedVisibilityRules.map((r, index) => {
                    const isOpen = openAccordion === r.id;
                    const name =
                    r.name ||
                    r.ruleName ||
                    r.voucherTitle ||
                    r.voucherName ||
                    r.voucherId ||
                    (Array.isArray(r.voucherIds) && r.voucherIds.join(", ")) ||
                    r.id;
                    let scopeParts = [];
                    if (r.bankName) scopeParts.push(r.bankName);
                    else if (r.bankId) scopeParts.push(`Bank ${r.bankId}`);
                    if (r.cardName) scopeParts.push(r.cardName);
                    else if (r.cardId) scopeParts.push(`Card ${r.cardId}`);
                    if (r.cardTierName) scopeParts.push(r.cardTierName);
                    else if (r.cardTierId) scopeParts.push(`Tier ${r.cardTierId}`);
                    const scope = scopeParts.join(" / ");
                    return (
                    <React.Fragment key={r.uuid}>
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
                            <VisibilityStatusBadge status={r.isVisible} />
                        </td>
                        <td className="px-4 py-4">
                            <StatusBadge status={r.isActive} />
                        </td>
                        <td className="px-4 py-4 flex justify-end items-center">
                            <VisibilityRuleRowActions
                            visibilityRule={r}
                            onEdit={handleEditModal}
                            banks={banks}
                            onDeactivate={handleDeactivateVisibilityRule}
                            onActivate={handleActivateVisibilityRule}
                            onDelete={handleDeleteVisibilityRule}
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
                    No visibility rules found. Add your first rule to get started.
                    </td>
                </tr>
                )}
            </tbody>
            </table>
        </div>
        <Pagination
            page={page}
            setPage={setPage}
            total={totalVisibilityRules}
            totalPages={totalPages}
            size={size}
            setSize={setSize}
            itemLabel="Visibility Rules"
            pageSizeOptions={[5, 10, 20, 50, 100]}
            className="p-3"
        />
        </div>
    </div>
    );
}

// Accordion showing details for rule
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
        {/* Visibility */}
        <div className="flex flex-col">
        <div className="flex items-center gap-2 mb-2">
            <span className="font-semibold text-xs text-emerald-700 uppercase tracking-wide">
            Visibility
            </span>
        </div>
        <dl className="space-y-1">
            <div className="flex items-center gap-2">
            <dt className="text-neutral-500 font-medium">Visible:</dt>
            <dd>
                <VisibilityStatusBadge status={r.isVisible} />
            </dd>
            </div>
        </dl>
        </div>
    </div>
    );
}

/**
 * Dropdown menu for VisibilityRule row (edit action).
 */

const VisibilityRuleRowActions = React.memo(function VisibilityRuleRowActions({
    visibilityRule,
    onEdit,
    onDeactivate,
    onActivate,
    onDelete,
    banks,
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);

    useEffect(() => {
    return () => setIsOpen(false);
    }, []);

    useEffect(() => {
    function handleClickOutside(event) {
        if (
        anchorEl &&
        !anchorEl.contains(event.target) &&
        !document.getElementById("portal-dropdown-actions")?.contains(event.target)
        ) {
        setIsOpen(false);
        }
    }
    if (isOpen) {
        document.addEventListener("mousedown", handleClickOutside);
    } else {
        document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
        document.removeEventListener("mousedown", handleClickOutside);
    };
    }, [isOpen, anchorEl]);

    // Compute the absolute position of anchorEl to position the portal dropdown
    const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 });
    useEffect(() => {
    if (isOpen && anchorEl) {
        const rect = anchorEl.getBoundingClientRect();
        setDropdownPos({
        top: rect.bottom + window.scrollY + 4, // 4px margin
        left: rect.right + window.scrollX - 140, // align right, assuming min-width is 140px
        width: rect.width,
        });
    }
    }, [isOpen, anchorEl]);

    return (
    <div className="relative" ref={setAnchorEl}>
        <button
        type="button"
        className="w-9 h-9 rounded-lg hover:bg-neutral-100 flex items-center justify-center text-right transition-colors text-neutral-600"
        aria-label="Open actions"
        onClick={() => setIsOpen((v) => !v)}
        >
        <MoreVertical size={18} />
        </button>
        {isOpen &&
        ReactDOM.createPortal(
            <div
            id="portal-dropdown-actions"
            style={{
                position: "absolute",
                top: dropdownPos.top,
                left: dropdownPos.left,
                minWidth: 140,
                zIndex: 9999,
                background: "white",
                border: "1px solid #e5e7eb",
                borderRadius: 8,
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                paddingTop: 4,
                paddingBottom: 4,
            }}
            className="py-1 min-w-[140px]"
            >
            <button
                className="w-full px-3 py-2 flex items-center text-left text-sm gap-2 hover:bg-neutral-50"
                onClick={() => {
                setIsOpen(false);
                onEdit?.(visibilityRule, banks);
                }}
                type="button"
            >
                <Pencil size={16} />
                Edit
            </button>
            {visibilityRule.isActive ? (
            <button
                className="w-full px-3 py-2 flex items-center text-left text-sm gap-2 hover:bg-neutral-50"
                onClick={() => {
                setIsOpen(false);
                onDeactivate?.(visibilityRule, banks);
                }}
                type="button"
            >
                <CircleX size={16} />
                Deactivate
            </button>):(<button
                className="w-full px-3 py-2 flex items-center text-left text-sm gap-2 hover:bg-neutral-50"
                onClick={() => {
                setIsOpen(false);
                onActivate?.(visibilityRule, banks);
                }}
                type="button"
            >
                <CircleCheck size={16} />
                Activate
            </button>)}
            <button
                className="w-full px-3 py-2 flex items-center text-left text-sm gap-2 hover:bg-neutral-50"
                onClick={() => {
                setIsOpen(false);
                onDelete?.(visibilityRule.uuid);
                }}
                type="button"
            >
                <Trash2 size={16} />
                Delete
            </button>
            </div>,
            document.body
        )}
    </div>
    );
});

// Visibility status badge
function VisibilityStatusBadge({ status }) {
    return (
    <span
        className={`px-3 py-1 rounded-md text-xs font-medium ${
        status
            ? "bg-emerald-100 text-emerald-700"
            : "bg-gray-100 text-gray-400"
        }`}
    >
        {status ? "Visible" : "Hidden"}
    </span>
    );
}

// Modal for adding/updating visibility rule
const AddVisibilityRuleModal = React.memo(function AddVisibilityRuleModal({
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
                t.tierName ||
                t.code ||
                `Card Tier ${t.cardTierId ?? t.id ?? t.uuid}`,
            }))
        : [],
    [tiers]
    );

    const voucherOptions = useMemo(
    () =>
        Array.isArray(vouchers) && vouchers.length > 0
        ? vouchers.map((v) => ({
            value:
                typeof v.voucherId !== "undefined" && v.voucherId !== null
                ? v.voucherId
                : v.id,
            uuid: v.uuid,
            label: v.name || v.code || `Voucher ${v.voucherId ?? v.id}`,
            }))
        : [],
    [vouchers]
    );

    // Shadcn Switch implemented by @headlessui/react for 'isVisible' toggle
    return (
    <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/70 transition-all"
        aria-modal="true"
        tabIndex={-1}
    >
        <div
        className="bg-white rounded-xl shadow-2xl p-0 w-full max-w-2xl border border-neutral-200"
        role="dialog"
        aria-labelledby="visibility-rule-modal-title"
        >
        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-100 bg-neutral-50 rounded-t-xl">
            <h2
            id="visibility-rule-modal-title"
            className="text-xl font-bold text-emerald-700"
            >
            {editId ? "Edit Visibility Rule" : "Add Visibility Rule"}
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
                Please fill the fields below to {editId ? "update" : "create"} a visibility rule. Fields marked <span className="text-red-600">*</span> are required.
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
            </div>

            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 mt-6">
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
                placeholder={!form.bankId ? "Select a bank first" : "Select Card"}
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
                Voucher(s) <span className="text-red-600">*</span>
            </label>
            <MultiSelect
                id="voucherIds"
                name="voucherIds"
                value={form.voucherIds}
                onChange={(val, meta) => onChange(val, meta)}
                options={voucherOptions}
                placeholder="Select Voucher(s)"
                disabled={false}
                required={true}
                className="rounded-lg"
            />
            </div>
            <div className="flex items-center gap-4 mt-8">
            <ToggleSwitch
                checked={!!form.isVisible}
                onChange={(checked) => onChange(checked, { name: "isVisible" })}
                className={`${form.isVisible ? "bg-emerald-500" : "bg-neutral-300"} relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
                data-testid="shadcn-visibility-toggle"
            >
                <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${form.isVisible ? "translate-x-6" : "translate-x-1"}`}
                />
            </ToggleSwitch>
            <span className="font-medium text-sm text-neutral-700">
                Visible to users
            </span>
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