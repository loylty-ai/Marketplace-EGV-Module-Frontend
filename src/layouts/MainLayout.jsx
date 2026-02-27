import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import { useAuth } from '../auth/AuthContext';
import { useBank } from '../auth/BankContext';

export default function MainLayout() {
  const { isAdmin, isOperations } = useAuth();
  const { banks, loading } = useBank();

  const showNoBanksAssigned = !loading && !isAdmin() && isOperations() && (!banks || banks.length === 0);

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <TopBar />
        <main className="flex-1 overflow-y-auto no-scrollbar">
          {showNoBanksAssigned ? (
            <div className="flex items-center justify-center min-h-[50vh] p-8">
              <div className="text-center max-w-md">
                <p className="text-slate-600 text-lg">You have no banks assigned.</p>
                <p className="text-slate-500 mt-2">Contact an administrator to get access to banks.</p>
              </div>
            </div>
          ) : (
            <Outlet />
          )}
        </main>
      </div>
    </div>
  );
}
