import api from '../api/axios';
import { ArrowLeft, CreditCard, Pencil, Plus, Trash2, X } from "lucide-react";
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from "react-router-dom";
import toast from 'react-hot-toast';
import StatCard from '../utils/StatsCard';
import AddButton from '../utils/AddButton';

export default function CardTiers() {

  const { bankId, cardId } = useParams();

  const [showModal, setShowModal] = useState(false);

  const [loading, setLoading] = useState(false);
  const [editId, setEditId] = useState(null);
  const [cardDetails, setCardDetails] = useState({});
  const [form, setForm] = useState({ tierName: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [cardTiers, setCardTiers] = useState([]);

  const fetchCardDetails = () => api.get(`/cards/${cardId}`).then((res) => {setCardDetails(res.data.data)}).catch(() => setCardDetails({})).finally(() => setLoading(false));

  useEffect(() => {
    fetchCardDetails();
    fetchCardTiers();
  }, []);

  const navigate = useNavigate();

  const handleOpenModal = () => {
    setShowModal(true);
    setEditId(null);
    setForm({ tierName: '' });
    setError('');
  };

  const handleEditModal = (tier) => {
    setShowModal(true);
    setEditId(tier.uuid);
    console.log(tier);
    console.log(tier.tierName);
    setForm({ tierName: tier.tierName, isActive: tier.isActive });
    setError('');
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setForm({ tierName: '' });
    setError('');
    setSuccess('');
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {

    const idempotencyKey = crypto.randomUUID();

    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      if(editId) {
        await api.put(`/card-tiers/${editId}`, { ...form, cardId: cardDetails.cardId, bankId: cardDetails.bankId }, { headers: { 'X-Idempotency-Key': idempotencyKey } });
        toast.success('Card tier updated successfully.');
      } else {
        const payload = { ...form, cardId: cardDetails.cardId, bankId: cardDetails.bankId };
        await api.post('/card-tiers', payload, { headers: { 'X-Idempotency-Key': idempotencyKey } });
        toast.success('Card tier added successfully.');
      }
      setShowModal(false);
      handleCloseModal();
      fetchCardTiers();
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        Object.values(err.response?.data || {}).join(' ') ||
        'Failed';
      setError(msg);
      toast.error(msg);
    }
  };

  const handleDeleteCard = async (tier) => {
    try {
      await api.delete(`/card-tiers/${tier.uuid}`);
      toast.success('Card tier deleted successfully.');
      fetchCardTiers();
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed';
    }
  };

  const fetchCardTiers = () => api.get(`/card-tiers`, { params: { cardId: cardId } }).then((res) => { setCardTiers(res.data.data)});

  return (
    <div className="w-full p-6 flex flex-col gap-6">

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
          cardName={cardDetails.name}
          editId={editId}
        />
      )}


      <div className="flex items-center justify-between">

        <div className="flex items-center gap-4">
          <button className="w-9 h-9 rounded-lg hover:bg-neutral-100 flex items-center justify-center" onClick={() => navigate(`/banks/${bankId}/cards`)}>
            <ArrowLeft size={18} />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
              <CreditCard className="text-emerald-700" size={24} />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-neutral-900">
                {cardDetails.name}
              </h1>
              <p className="text-sm text-neutral-600">
                {cardDetails.bankName} • {cardDetails.currency} • {cardDetails.countryCode}
              </p>
            </div>
          </div>
        </div>

        <span className="px-3 py-1 rounded-md bg-emerald-100 text-emerald-700 text-xs font-medium capitalize">
          {cardDetails.isActive ? 'Active' : 'Inactive'}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        <StatCard title="Total Tiers" value={cardTiers ? cardTiers.length : 0} />
        <StatCard title="Active Tiers" value={cardTiers ? cardTiers.filter((card) => card.isActive).length : 0} />
        <StatCard title="Currency" value={cardDetails.currency} />

      </div>

      <div className="flex flex-col gap-4">

        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-neutral-900">
              Card Tiers
            </h2>
            <p className="text-sm text-neutral-600">
              Manage tier segments for {cardDetails.name}
            </p>
          </div>

          <AddButton title="Add Tier" onClick={handleOpenModal} />
        </div>

        <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-neutral-200 bg-white">
                <tr className="text-left font-medium text-neutral-900">
                  <th className="px-4 py-3">Tier Id</th>
                  <th className="px-4 py-3">Tier Name</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>

              <tbody>

                { cardTiers.length > 0 ? cardTiers.map((tier, index) => (
                  <tr key={tier.id} className="border-b border-neutral-200 hover:bg-neutral-50 transition-colors">
                    <td className="px-4 py-4">
                      <span className="px-2 py-1 text-sm font-medium text-neutral-700 rounded-lg">
                        {index + 1}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="px-2 py-1 text-sm font-medium text-neutral-700 rounded-lg">
                        {tier.tierName}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="px-2 py-1 text-sm font-medium bg-emerald-100 text-emerald-700 rounded-lg">
                        {tier.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <ActionIcon icon={<Pencil size={20} className="text-emerald-500" onClick={() => handleEditModal(tier)} />} />
                        <ActionIcon icon={<Trash2 size={20}  onClick={() => handleDeleteCard(tier)} className="text-red-500" />} danger />
                      </div>
                    </td>
                  </tr>
                )) : <> <tr>
                  <td colSpan={6} className="px-4 py-4 h-24 text-center text-sm text-neutral-500">
                    No cards found. Add your first card to get started.
                  </td>
                </tr> </>}

              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  )
}

function AddCardModal({ open, onClose, onCreated, form, onChange, onSubmit, error, cardName, editId }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">{editId ? 'Edit Card Tier' : 'Add Card Tier'}</h2>
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
            <label htmlFor="card" className="block mb-1 text-sm font-medium">Card Name</label>
            <input type="text" value={cardName} className="rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-600 px-3 py-2 w-full" disabled />
          </div>
          <div>
            <label htmlFor="tierName" className="block mb-1 text-sm font-medium">Card Tier Name</label>
            <input
              id="tierName"
              name="tierName"
              value={form.tierName}
              onChange={onChange}
              placeholder="e.g. Platinum Tier 1"
              autoComplete="off"
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

const ActionIcon = ({ icon }) => (
  <button
    className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors hover:bg-emerald-50 }`}
  >
    {icon}
  </button>
);