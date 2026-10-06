import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { Receipt, FileText, Users, LandPlot, Building2, PieChart } from 'lucide-react';

export default function BookkeepingHeader({ activeTab = 'quotes' }) {
  const { language } = useLanguage();
  const location = useLocation();

  const tabs = [
    {
      id: 'quotes',
      name: language === 'EN' ? 'Quotes & Proposals' : 'Offertes (Quotes)',
      path: '/admin/quotes',
      icon: Receipt
    },
    {
      id: 'invoices',
      name: language === 'EN' ? 'Invoices' : 'Facturen (Invoices)',
      path: '/admin/invoices',
      icon: FileText
    },
    {
      id: 'customers',
      name: language === 'EN' ? 'Customers' : 'Klanten (Customers)',
      path: '/admin/customers',
      icon: Users
    },
    {
      id: 'bank',
      name: language === 'EN' ? 'Bank & Transactions' : 'Bank & Transacties',
      path: '/admin/bank',
      icon: LandPlot
    },
    {
      id: 'taxes',
      name: language === 'EN' ? 'Taxes (VAT)' : 'BTW Aangifte (Taxes)',
      path: '/admin/taxes',
      icon: Building2
    },
    {
      id: 'profit-loss',
      name: language === 'EN' ? 'Profit & Loss' : 'Winst & Verlies',
      path: '/admin/profit-loss',
      icon: PieChart
    }
  ];

  return (
    <div className="bg-[#FAF8F5] border border-[#E6E1D7] rounded-2xl p-4 sm:p-5 shadow-2xs space-y-4 font-body">
      {/* Top Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E6E1D7] pb-3">
        <div>
          <span className="text-[11px] font-mono font-bold text-[#736B5E] uppercase tracking-wider block">
            ADMIN PORTAL · BOOKKEEPING & FINANCE
          </span>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#33422C] mt-0.5">
            {language === 'EN' ? 'Bookkeeping Overview' : 'Boekhouding & Financieel Overzicht'}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-[#E3EFE3] text-[#1E561E] border border-[#C6E1C4] rounded-full text-xs font-bold font-mono">
            ✓ Real-time Sync Active
          </span>
        </div>
      </div>

      {/* Tabs Navigation Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = location.pathname === tab.path || activeTab === tab.id;

          return (
            <NavLink
              key={tab.id}
              to={tab.path}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-[#283523] text-white shadow-xs'
                  : 'bg-white text-[#615C52] border border-[#D6CFC2] hover:bg-[#FAF8F5] hover:text-[#1C1C1A]'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#D97706]' : 'text-[#736B5E]'}`} />
              <span>{tab.name}</span>
            </NavLink>
          );
        })}
      </div>
    </div>
  );
}
