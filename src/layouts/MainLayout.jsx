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
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-3 sm:p-4 lg:p-6 relative z-0">
          <div className="max-w-7xl mx-auto w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

