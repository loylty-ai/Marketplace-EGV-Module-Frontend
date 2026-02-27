import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './auth/ProtectedRoute';
import { BankScopeGuard } from './auth/BankScopeGuard';
import MainLayout from './layouts/MainLayout';
import { BankProviderWithAuth } from './auth/BankContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Banks from './pages/Banks';
import Cards from './pages/Cards';
import CardTiers from './pages/CardTiers';
import Vouchers from './pages/Vouchers';
import Merchandise from './pages/Merchandise';
import BankVendors from './pages/BankVendors';
import Vendors from './pages/Vendors';
import PricingRules from './pages/PricingRules';
import Approvals from './pages/Approvals';
import Users from './pages/Users';

import { Toaster } from 'react-hot-toast';
import VendorDetails from './pages/VendorDetails';
import AuditLogs from './pages/AuditLogs';
import SyncJobLogs from './pages/SyncJobLogs';

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <BankProviderWithAuth>
                <MainLayout />
              </BankProviderWithAuth>
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="banks" element={<ProtectedRoute allowedRoles={['ADMIN', 'OPERATIONS']}><Banks /></ProtectedRoute>}>


          </Route>
          <Route
            path="banks/:bankId/cards"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'OPERATIONS']}>
                <BankScopeGuard>
                  <Cards />
                </BankScopeGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="banks/:bankId/cards/:cardId/tiers"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'OPERATIONS']}>
                <BankScopeGuard>
                  <CardTiers />
                </BankScopeGuard>
              </ProtectedRoute>
            }
          />

          <Route
            path="vendors/:vendorId"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'OPERATIONS']}>
                <VendorDetails />
              </ProtectedRoute>
            }
          />

           <Route path="/audit-logs" element={<ProtectedRoute allowedRoles={['ADMIN']}><AuditLogs /></ProtectedRoute>} />
           <Route path="/vendor-sync-runs" element={<ProtectedRoute allowedRoles={['ADMIN']}><SyncJobLogs /></ProtectedRoute>} />


          {/* <Route path="customers" element={<ProtectedRoute allowedRoles={['ADMIN', 'OPERATIONS']}><Customers /></ProtectedRoute>} /> */}
          <Route path="vouchers" element={<ProtectedRoute allowedRoles={['ADMIN', 'OPERATIONS']}><Vouchers /></ProtectedRoute>} />
          <Route path="products/merchandise" element={<ProtectedRoute allowedRoles={['ADMIN', 'OPERATIONS']}><Merchandise /></ProtectedRoute>} />
          <Route path="bank-vendors" element={<ProtectedRoute allowedRoles={['ADMIN', 'OPERATIONS']}><BankVendors /></ProtectedRoute>} />
          <Route path="vendors" element={<ProtectedRoute allowedRoles={['ADMIN']}><Vendors /></ProtectedRoute>} />
          <Route path="pricing-rules" element={<ProtectedRoute allowedRoles={['ADMIN', 'OPERATIONS']}><PricingRules /></ProtectedRoute>} />
          <Route path="approvals" element={<ProtectedRoute allowedRoles={['ADMIN', 'APPROVER']}><Approvals /></ProtectedRoute>} />
          <Route path="users" element={<ProtectedRoute allowedRoles={['ADMIN']}><Users /></ProtectedRoute>} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
