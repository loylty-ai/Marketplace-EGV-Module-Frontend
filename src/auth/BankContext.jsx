import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from './AuthContext';

const BankContext = createContext(null);

export const useBank = () => useContext(BankContext);

export const BankProvider = ({ children, defaultToAllForOperations = false }) => {
  const [banks, setBanks] = useState([]);
  const [selectedBank, setSelectedBank] = useState(() => {
    const storedBank = localStorage.getItem('selectedBank');
    return storedBank ? JSON.parse(storedBank) : null;
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBanks = async () => {
      try {
        setLoading(true);
        const response = await api.get('/banks', { params: { page: 0, size: 500 } });
        const data = response.data?.data?.content ?? response.data?.content ?? (Array.isArray(response.data) ? response.data : []);
        const banksList = Array.isArray(data) ? data : [];
        setBanks(banksList);

        setSelectedBank((prev) => {
          if (defaultToAllForOperations) return null; // OPERATIONS: default to "All my banks"
          if (!prev) return null;
          const stillInList = banksList.some((bank) => (bank.uuid || bank.bankId) === (prev.uuid || prev.bankId));
          return stillInList ? prev : null;
        });
      } catch (err) {
        setError(err);
        console.error("Failed to fetch banks:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBanks();
  }, [defaultToAllForOperations]);

  useEffect(() => {
    // Persist selected bank to local storage (null = "All my banks")
    if (selectedBank) {
      localStorage.setItem('selectedBank', JSON.stringify(selectedBank));
    } else {
      localStorage.removeItem('selectedBank');
    }
  }, [selectedBank]);

  const value = {
    banks,
    selectedBank,
    setSelectedBank,
    loading,
    error,
  };

  return (
    <BankContext.Provider value={value}>
      {children}
    </BankContext.Provider>
  );
};

/** Use inside AuthProvider only. For OPERATIONS users, defaults to "All my banks" instead of restoring from localStorage. */
export function BankProviderWithAuth({ children }) {
  const { isOperations } = useAuth();
  return (
    <BankProvider defaultToAllForOperations={isOperations?.() ?? false}>
      {children}
    </BankProvider>
  );
}
