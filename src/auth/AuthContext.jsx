import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      api.get('/auth/me')
        .then((res) => {
          setUser({ ...res.data.data, assignedBanks: res.data.data.assignedBanks || [] });
        })
        .catch(() => {
          localStorage.removeItem('token');
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (username, password) => {

    const idempotencyKey = crypto.randomUUID();

    const res = await api.post(
      '/auth/login', 
      { username, password }, 
      { headers: { 'X-Idempotency-Key': idempotencyKey } }
    );
    const { token } = res?.data?.data || {};
    localStorage.setItem('token', token);
    const meRes = await api.get('/auth/me');  
    setUser({ ...meRes.data.data, assignedBanks: meRes.data.data.assignedBanks || [] });
    return meRes.data.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const hasRole = (role) => user?.roles?.includes(role);
  const isAdmin = () => hasRole('ADMIN');
  const isOperations = () => hasRole('OPERATIONS');
  const isApprover = () => hasRole('APPROVER');
  const getAssignedBankIds = () => user?.assignedBanks?.map(b => b.bankId) || [];
  const getAssignedBankUuids = () => user?.assignedBanks?.map(b => b.uuid) ?? [];

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      logout,
      hasRole,
      isAdmin,
      isOperations,
      isApprover,
      getAssignedBankIds,
      getAssignedBankUuids,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
