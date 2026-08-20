import { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../context/LanguageContext';
import { isGardenRoomFamily } from '../utils/projectType';
import {
  LayoutDashboard, Users, FileText, Briefcase, UserSquare,
  Folder, PieChart, Settings, Calendar, LogOut, X, Menu, ChevronRight, ChevronLeft, ChevronDown,
  Camera, Phone, Receipt, CreditCard, ShieldCheck, Smartphone
} from 'lucide-react';

export default function Sidebar({ role }) {
  const { user, logout } = useAuth();
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const [activeCustomerProject, setActiveCustomerProject] = useState(null);

  useEffect(() => {
    if (role !== 'customer') return;

    const loadActiveProject = () => {
      try {
        const savedProjects = localStorage.getItem('app_projects');
        if (savedProjects) {
          const parsed = JSON.parse(savedProjects);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const currentCustName = user?.name || '';
            const match = parsed.find(p => 
              currentCustName && (
                (p.customer || '').toLowerCase().includes(currentCustName.toLowerCase()) ||
                currentCustName.toLowerCase().includes((p.customer || '').toLowerCase())
              )
            ) || parsed[0];
            setActiveCustomerProject(match);
            return;
          }
        }
      } catch (e) {}
      setActiveCustomerProject(null);
    };

    loadActiveProject();
    window.addEventListener('storage', loadActiveProject);
    window.addEventListener('app_data_changed', loadActiveProject);
    return () => {
      window.removeEventListener('storage', loadActiveProject);
      window.removeEventListener('app_data_changed', loadActiveProject);
    };
  }, [role, user]);

  const isGardenRoom = isGardenRoomFamily(activeCustomerProject);

  const currentPathWithSearch = location.pathname + location.search;
  const isLinkActive = (linkPath) => {
    if (linkPath.includes('?')) {
      return currentPathWithSearch === linkPath;
    }
    if (linkPath === '/customer/project') {
      return location.pathname === '/customer/project' && (!location.search || location.search === '?tab=overview');
    }
    return location.pathname === linkPath;
  };
  
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem('app_sidebar_collapsed') === 'true';
  });

  const [openDropdowns, setOpenDropdowns] = useState({});

  const toggleCollapse = () => {
    setIsCollapsed(prev => {
      const next = !prev;
      localStorage.setItem('app_sidebar_collapsed', String(next));
      return next;
    });
  };

  useEffect(() => {
    const handleToggleMobile = () => setMobileOpen(true);
    window.addEventListener('app_toggle_mobile_sidebar', handleToggleMobile);
    return () => window.removeEventListener('app_toggle_mobile_sidebar', handleToggleMobile);
  }, []);

  const toggleDropdown = (name) => {
    setOpenDropdowns(prev => ({ ...prev, [name]: !prev[name] }));
  };

  const ADMIN_LINKS = [
    { name: t('common.dashboard'), path: '/admin/dashboard', icon: LayoutDashboard },
    { name: t('common.leads'), path: '/admin/leads', icon: Users },
    { 
      name: t('common.projects'), 
      icon: Briefcase,
      isDropdown: true,
      children: [
        { name: language === 'EN' ? 'Inbox messages' : 'Inbox berichten', path: '/admin/projects/inbox', badge: '4' },
        { name: language === 'EN' ? 'Outdoor Kitchen Project' : 'Project buitenkeuken', path: '/admin/projects/outdoor-kitchens' },
        { name: language === 'EN' ? 'Garden Room Project' : 'Project buitenverblijf', path: '/admin/projects/garden-rooms' },
        { name: language === 'EN' ? 'Field Mapping' : 'Veldenkoppeling', path: '/admin/projects/field-mapping' },
      ]
    },
    { 
      name: t('common.bookkeeping'), 
      icon: PieChart, 
      isDropdown: true,
      children: [
        { name: t('common.quotes'), path: '/admin/quotes' },
        { name: t('common.invoices'), path: '/admin/invoices' },
        { name: language === 'EN' ? 'Customers' : 'Klanten', path: '/admin/customers' },
        { name: t('common.bank'), path: '/admin/bank' },
        { name: t('common.taxes'), path: '/admin/taxes' },
        { name: t('common.profitLoss'), path: '/admin/profit-loss' },
      ]
    },
    { name: t('common.partners'), path: '/admin/partners', icon: UserSquare },
    { name: t('common.planning'), path: '/admin/planning', icon: Calendar },
    { name: language === 'EN' ? 'Photos & Media' : 'Foto\'s & Media', path: '/admin/photos', icon: Camera },
    { name: t('common.tasks'), path: '/admin/tasks', icon: FileText },
    { name: t('common.documents'), path: '/admin/documents', icon: Folder },
    { name: t('common.settings'), path: '/admin/settings', icon: Settings },
  ];

  const PARTNER_LINKS = [
    { name: t('common.dashboard'), path: '/partner/dashboard', icon: LayoutDashboard },
    { name: t('common.myProjects'), path: '/partner/projects', icon: Briefcase },
    { name: t('common.priceRequests'), path: '/partner/price-requests', icon: FileText },
    { name: t('common.planning'), path: '/partner/planning', icon: Calendar },
    { name: t('common.documents'), path: '/partner/documents', icon: Folder },
    { name: t('common.myDetails'), path: '/partner/profile', icon: UserSquare },
  ];

  const CUSTOMER_LINKS = [
    { name: 'Overview', path: '/customer/project', icon: LayoutDashboard },
    { name: 'My Quote', path: '/customer/quotes', icon: Receipt },
    { name: 'Design & Renders', path: '/customer/project?tab=design', icon: FileText },
    { name: 'Planning & Build', path: '/customer/project?tab=planning', icon: Calendar },
    { name: 'Photos & Updates', path: '/customer/photos', icon: Camera },
    { name: 'Documents', path: '/customer/documents', icon: Folder },
    { name: 'Payments', path: '/customer/project?tab=payments', icon: CreditCard },
    { name: 'Messages & Contact', path: '/customer/contact', icon: Phone },
    { name: 'Handover & Aftercare', path: '/customer/project?tab=handover', icon: ShieldCheck },
    { name: 'Mobile View', path: '/customer/project?tab=mobile-view', icon: Smartphone },
  ];


  const links = role === 'admin' ? ADMIN_LINKS : role === 'customer' ? CUSTOMER_LINKS : PARTNER_LINKS;




  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleNavLinkClick = (path) => {
    setMobileOpen(false);
    if (path === '/admin/leads') {
      window.dispatchEvent(new Event('app_reset_leads_view'));
    }
    if (path === '/admin/projects' || path === '/admin/projects/inbox') {
      window.dispatchEvent(new Event('app_reset_projects_view'));
    }
  };

  const SidebarContent = ({ collapsed = false, isMobile = false }) => (
    <div className="flex flex-col h-full relative font-body">
      <div className={`px-3 py-3 border-b border-white/10 flex items-center ${collapsed ? 'justify-center' : 'justify-between'} transition-all`}>
        {collapsed ? (
          <div className="flex flex-col items-center justify-center gap-1.5 w-full py-0.5 cursor-pointer group" onClick={toggleCollapse} title="Expand Sidebar">
            <img
              src="/mini logo2.png"
              alt="VA"
              className="w-6 h-6 object-contain rounded-md border border-white/20 shadow-xs"
            />
            <div className="bg-cream text-primary p-1 rounded-full shadow-sm border border-primary/20 transition-all group-hover:scale-110">
              <ChevronRight className="w-3 h-3" />
            </div>
          </div>
        ) : (
          <>
            <div className="flex flex-col items-center justify-center flex-1 min-w-0 text-center pl-1">
              <img
                src="/logo_green_cropped.png"
                alt="Vanuit Ambacht Logo"
                className="h-8 w-auto max-w-[110px] object-contain mx-auto"
              />
              <p className="text-white/40 text-[8.5px] tracking-[0.2em] uppercase font-body leading-none mt-1 text-center w-full">
                {role} portal
              </p>
            </div>
            {!isMobile && (
              <button 
                onClick={toggleCollapse}
                className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-all border border-white/10 flex-shrink-0"
                title="Collapse Sidebar"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
            )}
          </>
        )}
      </div>

      {/* Nav Links */}
      <nav className={`flex-1 overflow-y-auto py-3 ${collapsed ? 'px-1.5' : 'px-2'} space-y-0.5`}>
        {links.map((link) => {
          const Icon = link.icon;
          
          if (link.isDropdown) {
            const isOpen = openDropdowns[link.name];
            if (collapsed) {
              return (
                <div key={link.name} className="relative group flex justify-center my-0.5">
                  <NavLink
                    to={link.children[0].path}
                    className={({ isActive }) =>
                      `w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
                        isActive
                          ? 'bg-cream text-primary shadow-md font-bold'
                          : 'text-white/70 hover:bg-white/15 hover:text-white'
                      }`
                    }
                    title={link.name}
                  >
                    <Icon className="w-4 h-4" strokeWidth={1.75} />
                  </NavLink>
                </div>
              );
            }

            return (
              <div key={link.name} className="flex flex-col">
                <button
                  onClick={() => toggleDropdown(link.name)}
                  className="flex items-center gap-2.5 w-full px-2.5 py-2 rounded-lg transition-all duration-150 text-white/70 hover:bg-white/10 hover:text-white text-left"
                >
                  <Icon className="w-4 h-4 flex-shrink-0" strokeWidth={1.5} />
                  <span className="text-xs font-body font-normal flex-1 truncate">{link.name}</span>
                  <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isOpen ? 'rotate-180 opacity-90' : 'opacity-50'}`} />
                </button>

                {isOpen && (
                  <div className="mt-0.5 ml-5 pl-2 border-l border-white/10 space-y-0.5 flex flex-col">
                    {link.children.map(child => (
                      <NavLink
                        key={child.name}
                        to={child.path}
                        onClick={() => setMobileOpen(false)}
                        title={child.name}
                        className={({ isActive }) =>
                          `px-2 py-1.5 rounded-lg transition-all duration-150 text-[11px] font-body flex items-center justify-between ${
                            isActive
                              ? 'bg-cream/20 text-cream font-medium'
                              : 'text-white/50 hover:bg-white/5 hover:text-white/80'
                          }`
                        }
                      >
                        <span className="truncate">{child.name}</span>
                        {child.badge && (
                          <span className="ml-1 px-1.5 py-0.2 bg-[#D97706] text-white font-mono text-[9px] font-bold rounded-full">
                            {child.badge}
                          </span>
                        )}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          const active = isLinkActive(link.path);

          if (collapsed) {
            return (
              <div key={link.name} className="flex justify-center my-0.5">
                <NavLink
                  to={link.path}
                  onClick={() => handleNavLinkClick(link.path)}
                  className={
                    `w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
                      active
                        ? 'bg-cream text-primary shadow-md font-bold'
                        : 'text-white/70 hover:bg-white/15 hover:text-white'
                    }`
                  }
                  title={link.name}
                >
                  <Icon className="w-4 h-4" strokeWidth={active ? 2.2 : 1.75} />
                </NavLink>
              </div>
            );
          }

          return (
            <NavLink
              key={link.name}
              to={link.path}
              onClick={() => handleNavLinkClick(link.path)}
              className={
                `flex items-center gap-2.5 px-2.5 py-2 rounded-lg transition-all duration-150 ${
                  active
                    ? 'bg-white/15 text-white font-medium shadow-xs'
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              <Icon className="w-4 h-4 flex-shrink-0" strokeWidth={active ? 2 : 1.5} />
              <span className={`text-xs font-body truncate ${active ? 'font-medium' : 'font-normal'}`}>{link.name}</span>
              {active && <ChevronRight className="w-3 h-3 ml-auto opacity-50 flex-shrink-0" />}
            </NavLink>
          );
        })}

      </nav>

      {/* Logout */}
      <div className={`p-2.5 border-t border-white/10 ${collapsed ? 'flex justify-center' : ''}`}>
        <button
          onClick={handleLogout}
          className={`flex items-center gap-2.5 ${collapsed ? 'w-9 h-9 justify-center rounded-lg' : 'w-full px-2.5 py-2 rounded-lg'} text-white/60 hover:bg-red-500/20 hover:text-red-200 transition-colors text-xs font-body`}
          title={t('common.logout') || (language === 'NL' ? 'Uitloggen' : 'Logout')}
        >
          <LogOut className="w-4 h-4 flex-shrink-0" strokeWidth={1.5} />
          {!collapsed && <span>{t('common.logout') || (language === 'NL' ? 'Uitloggen' : 'Logout')}</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop & Tablet Collapsible Sidebar Rail System */}
      <aside className={`hidden sm:flex transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-52'} bg-primary flex-col flex-shrink-0 shadow-lg relative z-30`}>
        <SidebarContent collapsed={isCollapsed} />
      </aside>

      {/* Mobile toggle button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="sm:hidden fixed top-2.5 left-3 z-[100] h-9 px-2.5 bg-primary rounded-lg flex items-center justify-center gap-1.5 text-white shadow-card border border-white/10 cursor-pointer"
        title="Open Navigation"
      >
        <img src="/mini logo2.png" alt="VA" className="w-5 h-5 object-contain rounded-sm" />
        <Menu className="w-4 h-4" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="sm:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-xs" onClick={() => setMobileOpen(false)} />
      )}

      {/* Mobile drawer */}
      <aside className={`sm:hidden fixed inset-y-0 left-0 w-64 bg-primary z-50 flex flex-col shadow-2xl transition-transform duration-300 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <button onClick={() => setMobileOpen(false)} className="absolute top-4 right-4 text-white/50 hover:text-white z-10">
          <X className="w-5 h-5" />
        </button>
        <SidebarContent collapsed={false} isMobile={true} />
      </aside>
    </>
  );
}
