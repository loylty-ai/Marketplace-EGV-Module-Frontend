import { ArrowLeft, Building2, CreditCard, Pencil, Plus, SquareArrowOutUpRightIcon, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { NavLink, useNavigate, useParams } from "react-router-dom";
import api from "../api/axios";
import toast from 'react-hot-toast';
import { Pagination } from "../utils/Pagination";
import StatCard from "../utils/StatsCard";
import AddButton from "../utils/AddButton";
import { SelectBox } from "../utils/Select";

const BankCardsPage = () => {

  const { bankId } = useParams();

  const [editId, setEditId] = useState(null);

  const [form, setForm] = useState({
    name: '',
    currency: '',
    countryISOCode: '',
    cardType: '',
    cardNetwork: '',
    annualFees: '',
    issuanceFees: '',
    description: ''
  });

  const [bankDetails, setBankDetails] = useState(null);
  const fetchBankDetails = () => api.get(`/banks/${bankId}`).then((res) => setBankDetails(res.data.data));

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currencies, setCurrencies] = useState([]);
  const [countries, setCountries] = useState([]);
  const [cards, setCards] = useState([]);
  const [cardTiers, setCardTiers] = useState([]);

  const fetchCurrencies = () => api.get(`/currencies`).then((res) => setCurrencies(res.data.data));

  // PAGINATION state
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalCards, setTotalCards] = useState(0);

  useEffect(() => {
    fetchBankDetails();
    fetchCards(page, size);
    fetchCurrencies();
    fetchCountries();
    fetchCardTiers();
    // eslint-disable-next-line
  }, [bankId, page, size]);

  const cardTypes = [
    { id: 1, name: 'Debit Card' },
    { id: 2, name: 'Credit Card' }
  ];

  const cardNetworks = [
    { id: 1, name: 'Visa' },
    { id: 2, name: 'Mastercard' },
    { id: 3, name: 'American Express' },
    { id: 4, name: 'Discover' },
    { id: 5, name: 'JCB' },
    { id: 6, name: 'Diners Club' },
  ];

  const [showModal, setShowModal] = useState(false);

  const fetchCountries = () => api.get(`/countries`).then((res) => setCountries(res.data.data));

  const handleOpenModal = () => {
    setShowModal(true);
    setEditId(null);
    setForm({
      name: '',
      currency: '',
      countryISOCode: '',
      cardType: '',
      cardNetwork: '',
      annualFees: '',
      issuanceFees: '',
      description: ''
    });
    setError('');
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setForm({
      name: '',
      currency: '',
      countryISOCode: '',
      cardType: '',
      cardNetwork: '',
      annualFees: '',
      issuanceFees: '',
      description: ''
    });
    setError('');
    setSuccess('');
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const fetchCards = (page = 0, size = 10) => {
    api
      .get(`/cards`, {
        params: {
          bankId: bankId,
          page: page,
          size: size,
        },
      })
      .then((res) => {
        let data = res.data;
        if (Array.isArray(data.data.content)) {
          setCards(data.data.content);
          setTotal(data.data.totalElements);

          setTotalCards(data.data.totalElements);
        } else {
          // API returns paged: { data: [...], total: x }
          setCards(data.data.content || []);
          setTotal(data.data.totalElements);
          setTotalCards(data.data.totalElements || 0);
        }
      });
  };

  const totalPages = Math.max(1, Math.ceil(total / size));

  const fetchCardTiers = (cardId) => api.get(`/card-tiers`, { params: { bankId: bankId } }).then((res) => setCardTiers(res.data.data));


  const handleSubmit = async (e) => {
    const idempotencyKey = crypto.randomUUID();
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      if (editId) {
        console.log(bankDetails.id);
        await api.put(`/cards/${editId}`, { ...form, bankId: bankDetails.bankId }, { headers: { 'X-Idempotency-Key': idempotencyKey } });
        toast.success('Card updated successfully.');
      } else {
        const payload = { ...form, bankId: bankDetails.bankId };
        await api.post('/cards', payload, { headers: { 'X-Idempotency-Key': idempotencyKey } });
        toast.success('Card added successfully.');
      }
      setShowModal(false);
      handleCloseModal();
      fetchCards(page, size);
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        'Failed';

      setError(msg);
      toast.error(msg);
    }
  };

  const handleDeleteCard = async (card) => {
    try {
      await api.delete(`/cards/${card.cardId}`);
      toast.success('Card deleted successfully.');
      fetchCards(page, size);
    } catch (err) {
      toast.error('Failed to delete card.');
    }
  };

  const handleEditCard = (card) => {
    setShowModal(true);
    setEditId(card.uuid);
    setForm({
      name: card.name || '',
      currency: card.currency || '',
      countryISOCode: card.countryCode || '',
      cardType: card.cardType || '',
      cardNetwork: card.cardNetwork || '',
      annualFees: card.annualFees || '',
      issuanceFees: card.issuanceFees || '',
      description: card.description || ''
    });
    setError('');
  };

  const navigate = useNavigate();

  return (
    <div className="w-full h-full p-6 flex flex-col gap-6">

      {showModal && (
        <AddCardModal
          onClose={handleCloseModal}
          onCreate={() => {
            handleCloseModal();
          }}
          form={form}
          onChange={handleChange}
          onSubmit={handleSubmit}
          error={error}
          open={showModal}
          bankName={bankDetails?.name || ''}
          currencies={currencies.length > 0 ? currencies : []}
          countries={countries.length > 0 ? countries : []}
          cardTypes={cardTypes.length > 0 ? cardTypes : []}
          cardNetworks={cardNetworks.length > 0 ? cardNetworks : []}
          editId={editId}
        />
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-neutral-100" onClick={() => navigate(`/banks`)}>
            <ArrowLeft size={18} />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
              <Building2 className="text-emerald-700" size={22} />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-neutral-900">
                {bankDetails?.name}
              </h1>
              <p className="text-sm text-neutral-600">
                Code: {bankDetails?.code}
              </p>
            </div>
          </div>
        </div>

        {
          bankDetails?.isActive ? (
            <span className="px-3 py-1 text-xs font-medium bg-emerald-100 text-emerald-700 rounded-lg">
              Active
            </span>
          ) : (
            <span className="px-3 py-1 text-xs font-medium bg-red-100 text-red-700 rounded-lg">
              Inactive
            </span>
          )
        }
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Total Cards" value={totalCards} />
        <StatCard title="Active Cards" value={cards ? cards.filter((card) => card.isActive).length : 0} />
        <StatCard title="Total Tiers" value={cardTiers ? cardTiers.length : 0} />
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-neutral-900">
              Cards
            </h2>
            <p className="text-sm text-neutral-600">
              Manage card products for {bankDetails?.name} Bank
            </p>
          </div>

          <AddButton title="Add Card" onClick={handleOpenModal} />
        </div>

        <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-neutral-200 bg-white">
                <tr className="text-left font-medium text-neutral-900">
                  <th className="px-4 py-3">Card Name</th>
                  <th className="px-4 py-3">Currency</th>
                  <th className="px-4 py-3">Country</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>

              <tbody>
                {cards.length > 0 ? cards.map((card) => (
                  <tr key={card.uuid} className="border-b border-neutral-200 hover:bg-neutral-50 transition-colors">
                    <td className="px-4 py-4 text-emerald-600 font-medium">
                      <NavLink
                        to={`/banks/${bankId}/cards/${card.uuid}/tiers`}
                        className="flex items-center gap-2 text-emerald-600 font-medium hover:cursor-pointer"
                      >
                        {card.name} <SquareArrowOutUpRightIcon size={16} />
                      </NavLink>
                    </td>
                    <td className="px-4 py-4">{card.currency}</td>
                    <td className="px-4 py-4">{card.countryCode}</td>
                    <td className="px-4 py-4">
                      <span className="px-2 py-1 text-xs font-medium bg-emerald-100 text-emerald-700 rounded-lg">
                        {card.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <ActionIcon icon={<CreditCard size={20} className="text-blue-500" onClick={() => navigate(`/banks/${bankId}/cards/${card.uuid}/tiers`)} />} />
                        <ActionIcon icon={<Pencil size={20} className="text-emerald-500" onClick={() => handleEditCard(card)} />} />
                        <ActionIcon icon={<Trash2 size={20} onClick={() => handleDeleteCard(card)} className="text-red-500" />} danger />
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={6} className="px-4 py-4 h-24 text-center text-sm text-neutral-500">
                      No cards found. Add your first card to get started.
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
            itemLabel="Cards"
            pageSizeOptions={[5, 10, 20, 50, 100]}
          />
        </div>
      </div>
    </div>
  );
};

const ActionIcon = ({ icon }) => (
  <button
    className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors hover:bg-emerald-50 }`}
  >
    {icon}
  </button>
);

// Updated AddCardModal: set value prop on select/inputs so values are controlled by form (including for edit mode)
function AddCardModal({ open, onClose, onCreated, form, onChange, onSubmit, error, bankName, currencies, countries, cardTypes, cardNetworks, editId }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">{editId ? 'Edit Card' : 'Add Card'}</h2>
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
            <label htmlFor="bank" className="block mb-1 text-sm font-medium">Bank</label>
            <input type="text" value={bankName} className="rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-600 px-3 py-2 w-full" disabled />
          </div>
          <div>
            <label htmlFor="name" className="block mb-1 text-sm font-medium">Card Name</label>
            <input
              id="name"
              name="name"
              value={form.name}
              onChange={onChange}
              placeholder="e.g. ICICI Bank"
              autoComplete="off"
              className="border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-600 px-3 py-2 w-full"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="currency" className="block mb-1 text-sm font-medium">Currency</label>
              <SelectBox
                name="currency"
                id="currency"
                value={form.currency ?? ""}
                onChange={val =>
                  onChange({
                    target: {
                      name: "currency",
                      value: val,
                    },
                  })
                }
                options={
                  currencies?.length
                    ? currencies.map(currency => ({
                        value: String(currency.code),
                        label: `${currency.code} - ${currency.name}`,
                      }))
                    : []
                }
                placeholder="Select Currency"
                disabled={false}
                className=""
                required={true}
                label={null}
                error={null}
              />
            </div>
            <div>
              <label htmlFor="countryISOCode" className="block mb-1 text-sm font-medium">Country</label>
              <SelectBox
                name="countryISOCode"
                id="countryISOCode"
                value={form.countryISOCode || ''}
                onChange={val =>
                  onChange({
                    target: {
                      name: "countryISOCode",
                      value: val,
                    },
                  })
                }
                options={countries.length > 0 ? countries.map((country) => ({
                  value: country.isoCode,
                  label: `${country.isoCode} - ${country.name}`,
                })) : []}
                placeholder="Select Country"
                disabled={false}
                className=""
                required={true}
                label={null}
                error={null}
              />

            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="cardType" className="block mb-1 text-sm font-medium">Card Type</label>
              <SelectBox
                name="cardType"
                id="cardType"
                value={form.cardType ?? ""}
                onChange={val =>
                  onChange({
                    target: {
                      name: "cardType",
                      value: val,
                    },
                  })
                }
                options={cardTypes.length > 0 ? cardTypes.map((card) => ({
                  value: card.name,
                  label: card.name,
                })) : []}
                placeholder="Select Card Type"
                disabled={false}
                className=""
                required={true}
                label={null}
                error={null}
              />
            </div>
            <div>
              <label htmlFor="cardNetwork" className="block mb-1 text-sm font-medium">Card Network</label>
              <SelectBox
                name="cardNetwork"
                id="cardNetwork"
                value={form.cardNetwork ?? ""}
                onChange={val =>
                  onChange({
                    target: {
                      name: "cardNetwork",
                      value: val,
                    },
                  })
                }
                options={cardNetworks.length > 0 ? cardNetworks.map((card) => ({
                  value: card.name,
                  label: card.name,
                })) : []}
                placeholder="Select Card Network"
                disabled={false}
                className=""
                required={true}
                label={null}
                error={null}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="annualFees" className="block mb-1 text-sm font-medium">Annual Fee</label>
              <input
                type="text"
                name="annualFees"
                id="annualFees"
                placeholder="e.g. 500"
                className="rounded-md bg-white border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 px-3 py-2 w-full"
                value={form.annualFees || ''}
                onChange={onChange}
                required
              />
            </div>
            <div>
              <label htmlFor="insuranceFees" className="block mb-1 text-sm font-medium">Issuance Fee</label>
              <input
                type="text"
                name="issuanceFees"
                id="insuranceFees"
                placeholder="e.g. 1000"
                className="rounded-md bg-white border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 px-3 py-2 w-full"
                value={form.issuanceFees || ''}
                onChange={onChange}
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="description" className="block mb-1 text-sm font-medium">Description</label>
            <textarea
              name="description"
              id="description"
              placeholder="e.g. A premium credit card with rewards and benefits"
              className="rounded-md bg-white border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 px-3 py-2 w-full"
              value={form.description || ''}
              onChange={onChange}
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

export default BankCardsPage;
