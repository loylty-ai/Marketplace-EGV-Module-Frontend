import { Navigate, useParams } from 'react-router-dom';
import { useAuth } from './AuthContext';

/**
 * Wraps bank-scoped routes (e.g. /banks/:bankId/cards). For OPERATIONS users,
 * redirects to dashboard if the route's bankId is not in their assigned banks.
 * ADMIN always passes through.
 */
export function BankScopeGuard({ children }) {
  const { bankId } = useParams();
  const { isAdmin, getAssignedBankUuids } = useAuth();

  if (isAdmin()) {
    return children;
  }

  const allowedUuids = getAssignedBankUuids();
  const hasAccess = bankId && allowedUuids.length > 0 && allowedUuids.includes(bankId);

  if (!hasAccess) {
    return <Navigate to="/" replace />;
  }

  return children;
}
