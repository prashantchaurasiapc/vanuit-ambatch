import { useState, useRef, useEffect } from 'react';
import { Bell, Search, ChevronDown, User, LogOut, Settings, Check, Clock, FileText, Briefcase, UserPlus, Globe, Camera, Menu } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../context/LanguageContext';
import { useLocation, useNavigate } from 'react-router-dom';

function getBreadcrumb(pathname, t) {
  return pathname.split('/').filter(Boolean).map(p => {
    const key = `breadcrumbs.${p.toLowerCase()}`;
    const trans = t(key);
    return trans !== key ? trans : p.charAt(0).toUpperCase() + p.slice(1);
  });
}

const ADMIN_NOTIFS = [
  { 
    id: 'partner-photo-sample', 
    titleKey: '📸 New Partner Photo Uploaded', 
    descKey: 'Craftsman Sven Hoek uploaded a new workshop progress photo for Luxury Teak Outdoor Kitchen (PRJ-101).', 
    isCustomText: true, 
    timeKey: '5m ago', 
    unread: true, 
    link: '/admin/photos', 
    icon: Camera 
  },
  { id: 1, titleKey: 'notifications.newLead', descKey: 'notifications.newLeadDesc', descParams: { name: 'Sanne Visser', category: 'Bespoke Outdoor Kitchen' }, timeKey: 'notifications.10m', unread: true, link: '/admin/leads', icon: UserPlus },
  { id: 2, titleKey: 'notifications.projectProgress', descKey: 'notifications.projectProgressDesc', descParams: { partner: 'Sven Hoek', project: 'Luxury Kitchen Amsterdam', progress: '70' }, timeKey: 'notifications.1h', unread: true, link: '/admin/projects', icon: Briefcase },
  { id: 3, titleKey: 'notifications.quoteApproved', descKey: 'notifications.quoteApprovedDesc', descParams: { client: 'Jan de Vries', quote: 'Q-2004' }, timeKey: 'notifications.3h', unread: true, link: '/admin/quotes', icon: Check },
  { id: 4, titleKey: 'notifications.invoicePaid', descKey: 'notifications.invoicePaidDesc', descParams: { invoice: 'INV-902', amount: '12.500', city: 'Rotterdam' }, timeKey: 'notifications.1d', unread: false, link: '/admin/finance', icon: FileText },
];

const PARTNER_NOTIFS = [
  { id: 1, titleKey: 'notifications.partnerNewProject', descKey: 'notifications.partnerNewProjectDesc', descParams: { project: 'Luxury Outdoor Kitchen Amsterdam' }, timeKey: 'notifications.20m', unread: true, link: '/partner/projects', icon: Briefcase },
  { id: 2, titleKey: 'notifications.materialDelivery', descKey: 'notifications.materialDeliveryDesc', descParams: { date: '25 Nov', time: '13:00' }, timeKey: 'notifications.2h', unread: true, link: '/partner/planning', icon: Clock },
  { id: 3, titleKey: 'notifications.siteVisit', descKey: 'notifications.siteVisitDesc', descParams: { time: '09:00' }, timeKey: 'notifications.4h', unread: true, link: '/partner/planning', icon: Clock },
  { id: 4, titleKey: 'notifications.newBlueprint', descKey: 'notifications.newBlueprintDesc', descParams: { version: '2', city: 'Utrecht Villa' }, timeKey: 'notifications.1d', unread: false, link: '/partner/documents', icon: FileText },
];

export default function TopNav() {
  const { user, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const crumbs = getBreadcrumb(location.pathname, t);
  const initials = user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U';

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const [notifications, setNotifications] = useState(() => {
    if (user?.role === 'admin') {
      try {
        const savedNotifs = JSON.parse(localStorage.getItem('app_admin_notifications') || '[]');
        if (savedNotifs.length > 0) {
          const dynamicNotifs = savedNotifs.map(n => ({
            id: n.id,
            titleKey: n.title || '📸 Partner Photo Uploaded',
            descKey: n.message || `Partner ${n.partnerName} uploaded a photo for project ${n.projectName}`,
            isCustomText: true,
            timeKey: n.time || 'Just now',
            unread: n.unread !== false,
            link: '/admin/photos',
            icon: Camera
          }));
          return [...dynamicNotifs, ...ADMIN_NOTIFS];
        }
      } catch (e) {}
      return ADMIN_NOTIFS;
    }
    return PARTNER_NOTIFS;
  });

  // Listen to live partner photo upload notifications
  useEffect(() => {
    const syncNotifs = () => {
      if (user?.role === 'admin') {
        try {
          const savedNotifs = JSON.parse(localStorage.getItem('app_admin_notifications') || '[]');
          if (savedNotifs.length > 0) {
            const dynamicNotifs = savedNotifs.map(n => ({
              id: n.id,
              titleKey: n.title || '📸 Partner Photo Uploaded',
              descKey: n.message || `Partner ${n.partnerName} uploaded a photo for project ${n.projectName}`,
              isCustomText: true,
              timeKey: n.time || 'Just now',
              unread: n.unread !== false,
              link: '/admin/photos',
              icon: Camera
            }));
            setNotifications([...dynamicNotifs, ...ADMIN_NOTIFS]);
          }
        } catch (e) {}
      }
    };

    window.addEventListener('app_data_changed', syncNotifs);
    window.addEventListener('storage', syncNotifs);
    return () => {
      window.removeEventListener('app_data_changed', syncNotifs);
      window.removeEventListener('storage', syncNotifs);
    };
  }, [user]);

  const dropdownRef = useRef(null);
  const notifRef = useRef(null);
  const langDropdownRef = useRef(null);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);

  const unreadCount = notifications.filter(n => n.unread).length;

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
      if (langDropdownRef.current && !langDropdownRef.current.contains(e.target)) {
        setLangDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleProfile = () => {
    navigate(`/${user?.role}/profile`);
    setDropdownOpen(false);
  };

  const handleSettings = () => {
    if (user?.role === 'admin') navigate('/admin/settings');
    setDropdownOpen(false);
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  const handleNotifClick = (notif) => {
    setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, unread: false } : n));
    setNotifOpen(false);
    if (notif.link) navigate(notif.link);
  };

  return (
    <header className="h-14 bg-[#FAF7F2] border-b border-[#E6E0D4] flex items-center justify-between px-3 sm:px-4 lg:px-6 z-[99999] flex-shrink-0 relative">

      {/* Mobile Hamburger Button + Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-dark/50 font-body min-w-0 truncate flex-1 mr-2">
        <button
          type="button"
          onClick={() => window.dispatchEvent(new Event('app_toggle_mobile_sidebar'))}
          className="sm:hidden flex items-center justify-center p-2 bg-[#3E4E36] hover:bg-[#2F3C29] text-white rounded-xl shadow-xs cursor-pointer flex-shrink-0"
          title="Open Menu"
        >
          <Menu className="w-4 h-4" />
        </button>

        <img 
          src="/mini logo2.png" 
          alt="VA Monogram" 
          className="h-6 w-6 object-contain rounded-md hidden sm:block lg:hidden flex-shrink-0" 
        />
        {crumbs.map((crumb, i) => (
          <span key={i} className={`flex items-center gap-1.5 min-w-0 ${i < crumbs.length - 1 ? 'hidden sm:flex' : 'flex'}`}>
            {i > 0 && <span className="text-dark/25 flex-shrink-0">/</span>}
            <span className={`${i === crumbs.length - 1 ? 'font-bold text-dark text-[11px] sm:text-xs' : 'text-dark/40'} truncate`}>
              {crumb}
            </span>
          </span>
        ))}
      </div>


      {/* Right Controls */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 flex-shrink-0">
        {/* Language Switcher — compact globe icon with dropdown */}
        <div className="relative z-50" ref={langDropdownRef}>
          <button
            onClick={() => setLangDropdownOpen(!langDropdownOpen)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-[#D6CFC2] bg-[#F8F7F4] hover:bg-[#EDE8DF] text-dark/80 text-xs font-semibold font-body transition-all"
            title={language === 'NL' ? 'Taal wijzigen' : 'Change language'}
          >
            <Globe className="w-3.5 h-3.5 text-primary flex-shrink-0" />
            <span className="font-mono text-xs font-bold text-primary">{language}</span>
            <ChevronDown className={`w-3 h-3 text-dark/40 transition-transform ${langDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Language dropdown */}
          {langDropdownOpen && (
            <div className="absolute left-0 sm:left-auto sm:right-0 top-full mt-1.5 w-36 bg-[#F8F7F4] border border-[#C4BEB3] rounded-xl shadow-2xl z-[9999] overflow-hidden font-body text-xs">
              <div className="px-3 py-2 border-b border-[#D6CFC2] text-[10px] font-bold text-dark/40 uppercase tracking-wider">
                Taal / Language
              </div>
              <button
                onClick={() => { setLanguage('NL'); setLangDropdownOpen(false); }}
                className={`flex items-center gap-2.5 w-full px-3 py-2.5 text-left transition-colors ${
                  language === 'NL'
                    ? 'bg-primary/10 text-primary font-bold'
                    : 'text-dark/70 hover:bg-[#D6CFC2]/40'
                }`}
              >
                <span className="text-base">🇳🇱</span>
                <span>Nederlands</span>
                {language === 'NL' && <Check className="w-3 h-3 ml-auto text-primary" />}
              </button>
              <button
                onClick={() => { setLanguage('EN'); setLangDropdownOpen(false); }}
                className={`flex items-center gap-2.5 w-full px-3 py-2.5 text-left transition-colors ${
                  language === 'EN'
                    ? 'bg-primary/10 text-primary font-bold'
                    : 'text-dark/70 hover:bg-[#D6CFC2]/40'
                }`}
              >
                <span className="text-base">🇬🇧</span>
                <span>English</span>
                {language === 'EN' && <Check className="w-3 h-3 ml-auto text-primary" />}
              </button>
            </div>
          )}
        </div>

        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-dark/30" />
          <input
            type="text"
            placeholder={t('common.search')}
            className="pl-8 pr-4 py-1.5 bg-[#F8F7F4] border border-[#D6CFC2] rounded-full text-xs font-body focus:outline-none focus:ring-2 focus:ring-primary/15 transition-all w-36 lg:w-44 text-dark"
          />
        </div>

        {/* Notifications Dropdown Container */}
        <div className="relative" ref={notifRef}>
          <button 
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative text-dark/60 hover:text-primary transition-colors p-2 rounded-xl hover:bg-[#D6CFC2]/40"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-[#EDE8DF]"></span>
            )}
          </button>

          {/* Notifications Dropdown Menu */}
          {notifOpen && (
            <div className="fixed sm:absolute right-2 sm:right-0 top-[57px] sm:top-full mt-0 sm:mt-2 w-[calc(100vw-16px)] max-w-xs sm:w-80 bg-[#F2EDE4] border border-[#D6CFC2] rounded-2xl shadow-2xl z-[9999] overflow-hidden font-body text-xs">
              <div className="px-4 py-3 border-b border-[#D6CFC2] flex items-center justify-between bg-[#EDE8DF]">
                <div className="flex items-center gap-2">
                  <span className="font-heading font-bold text-dark text-sm">{language === 'NL' ? 'Meldingen' : 'Notifications'}</span>
                  {unreadCount > 0 && (
                    <span className="bg-primary text-cream text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {unreadCount} {language === 'NL' ? 'nieuw' : 'new'}
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button 
                    onClick={markAllAsRead}
                    className="text-[11px] text-accent hover:underline font-medium"
                  >
                    {language === 'NL' ? 'Alles als gelezen markeren' : 'Mark all read'}
                  </button>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-[#D6CFC2]/50">
                {notifications.map(notif => {
                  const NotifIcon = notif.icon || Bell;
                  return (
                    <div 
                      key={notif.id} 
                      onClick={() => handleNotifClick(notif)}
                      className={`p-3 flex gap-3 cursor-pointer transition-colors ${
                        notif.unread ? 'bg-white/80 hover:bg-white' : 'hover:bg-white/40 opacity-75'
                      }`}
                    >
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        notif.unread ? 'bg-primary/10 text-primary' : 'bg-dark/10 text-dark/50'
                      }`}>
                        <NotifIcon className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline">
                          <p className={`font-semibold truncate ${notif.unread ? 'text-dark font-bold' : 'text-dark/70'}`}>
                            {notif.isCustomText ? notif.titleKey : t(notif.titleKey)}
                          </p>
                          <span className="text-[10px] text-dark/40 ml-2 flex-shrink-0">{notif.isCustomText ? notif.timeKey : t(notif.timeKey)}</span>
                        </div>
                        <p className="text-[11px] text-dark/60 line-clamp-2 mt-0.5">{notif.isCustomText ? notif.descKey : t(notif.descKey, notif.descParams)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="p-2 border-t border-[#D6CFC2] text-center bg-[#EDE8DF]">
                <span className="text-[10px] text-dark/40">{language === 'NL' ? `Laatste updates voor het ${user?.role === 'admin' ? 'beheerders' : 'partner'}portaal` : `Showing latest updates for ${user?.role} portal`}</span>
              </div>
            </div>
          )}
        </div>

        {/* User Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 cursor-pointer hover:bg-[#D6CFC2]/40 rounded-lg px-2 py-1.5 transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-accent text-[#F2EDE4] flex items-center justify-center text-xs font-bold font-body flex-shrink-0">
              {initials}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-semibold text-dark font-body leading-none">{user?.name}</p>
              <p className="text-[10px] text-dark/40 capitalize font-body mt-0.5">{user?.role === 'admin' ? t('common.adminPortal') : user?.role === 'customer' ? t('common.customerPortal') : t('common.partnerPortal')}</p>
            </div>
            <ChevronDown className={`w-3 h-3 text-dark/30 hidden sm:block transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* User Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-[#F2EDE4] border border-[#D6CFC2] rounded-xl shadow-card z-50 overflow-hidden">
              {/* User info header */}
              <div className="px-4 py-3 border-b border-[#D6CFC2]">
                <p className="text-sm font-semibold text-dark font-body">{user?.name}</p>
                <p className="text-xs text-dark/40 capitalize font-body">{user?.role === 'admin' ? t('common.adminPortal') : user?.role === 'customer' ? t('common.customerPortal') : t('common.partnerPortal')}</p>
              </div>

              {/* Menu Items */}
              <div className="py-1">
                <button
                  onClick={handleProfile}
                  className="flex items-center gap-3 w-full px-4 py-2.5 text-sm font-body text-dark/70 hover:bg-[#D6CFC2]/40 hover:text-primary transition-colors"
                >
                  <User className="w-4 h-4" />
                  {t('common.myDetails')}
                </button>

                {user?.role === 'admin' && (
                  <button
                    onClick={handleSettings}
                    className="flex items-center gap-3 w-full px-4 py-2.5 text-sm font-body text-dark/70 hover:bg-[#D6CFC2]/40 hover:text-primary transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                    {t('common.settings')}
                  </button>
                )}

                <div className="h-px bg-[#D6CFC2] mx-3 my-1"></div>

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 w-full px-4 py-2.5 text-sm font-body text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  {t('common.logout')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
