import React from 'react';
import { useBank } from '../auth/BankContext';
import { useAuth } from '../auth/AuthContext';
import { ChevronDown } from 'lucide-react';

/**
 * Bank dropdown for OPERATIONS users only. Shows "All my banks" (default) or a single bank.
 * When a bank is selected, bank-scoped pages filter to that bank.
 */
export default function BankSelector() {
  const { banks, selectedBank, setSelectedBank, loading, error } = useBank();
  const { isOperations, isAdmin } = useAuth();

  const handleChange = (event) => {
    const value = event.target.value;
    if (value === '' || value === '__all__') {
      setSelectedBank(null);
      return;
    }
    const bank = banks.find((b) => (b.uuid && b.uuid === value) || String(b.bankId) === value);
    setSelectedBank(bank || null);
  };

  if (!isOperations() || isAdmin()) {
    return null;
  }

  if (loading) {
    return <p className="text-sm text-slate-500">Loading banks...</p>;
  }

  if (error) {
    return <p className="text-sm text-red-500">Error loading banks.</p>;
  }

  if (!banks || banks.length === 0) {
    return <p className="text-sm text-slate-500">No banks available.</p>;
  }

  const selectValue = selectedBank ? (selectedBank.uuid ?? String(selectedBank.bankId)) : '__all__';

  return (
    <div className="relative inline-block text-left min-w-[180px]">
      <label htmlFor="bank-select" className="sr-only">Filter by bank</label>
      <select
        id="bank-select"
        value={selectValue}
        onChange={handleChange}
        className="block appearance-none w-full bg-white border border-slate-300 hover:border-primary-500 px-4 py-2 pr-8 rounded-lg shadow-sm text-sm text-slate-700 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
      >
        <option value="__all__">All my banks</option>
        {banks.map((bank) => (
          <option key={bank.bankId} value={bank.uuid ?? String(bank.bankId)}>
            {bank.name}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
        <ChevronDown className="h-4 w-4" />
      </div>
    </div>
  );
}
