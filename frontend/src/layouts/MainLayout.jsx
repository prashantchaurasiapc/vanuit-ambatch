import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopNav from './TopNav';

export default function MainLayout({ role }) {
  return (
    <div className="flex h-screen bg-light overflow-hidden">
      <Sidebar role={role} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <div className="relative z-[100] flex-shrink-0">
          <TopNav />
        </div>

        <main className="flex-1 overflow-x-hidden overflow-y-auto p-3 sm:p-4 lg:p-5 relative z-0 flex flex-col">
          <div className="w-full flex-1 flex flex-col">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

