import { useState, useRef, useEffect } from 'react';
import { Bell, Search, ChevronDown, ChevronLeft, User, LogOut, Settings, Check, Clock, FileText, Briefcase, UserPlus, Globe, Camera, Menu, X, MessageSquare, Plus, CalendarPlus, CheckSquare } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../context/LanguageContext';
import { useAdminCounters } from '../hooks/useAdminCounters';
import { useLocation, useNavigate } from 'react-router-dom';
import LanguageSwitcher from '../components/LanguageSwitcher';
import api from '../api/apiClient';

function getBreadcrumb(pathname, search, t, language) {
  const isNl = language === 'NL' || !language;
  const segments = pathname.split('/').filter(Boolean);

  if (segments[0] === 'admin') {
    const section = segments[1] || 'dashboard';
    const sub = segments[2];

    const salesPaths = ['leads', 'quotes', 'customers'];
    const opsPaths = ['projects', 'planning'];
    const finPaths = ['invoices', 'bank', 'taxes', 'profit-loss', 'finance'];

    let group = null;
    let page = null;

    if (section === 'dashboard') {
      return [isNl ? 'Vandaag' : 'Today'];
    } else if (salesPaths.includes(section)) {
      group = isNl ? 'Verkoop' : 'Sales';
      page = section === 'leads' ? 'Leads' : section === 'quotes' ? (isNl ? 'Offertes' : 'Quotes') : (isNl ? 'Klanten' : 'Customers');
    } else if (opsPaths.includes(section)) {
      group = isNl ? 'Uitvoering' : 'Operations';
      page = section === 'projects' ? (isNl ? 'Projecten' : 'Projects') : (isNl ? 'Planning' : 'Planning');
    } else if (section === 'inbox') {
      return [isNl ? 'Berichten' : 'Messages'];
    } else if (section === 'partners') {
      return ['Partners'];
    } else if (finPaths.includes(section)) {
      group = isNl ? 'Financiën' : 'Finance';
      page = section === 'invoices' ? (isNl ? 'Facturen' : 'Invoices')
        : section === 'bank' ? 'Bank'
        : section === 'taxes' ? (isNl ? 'Btw-aangifte' : 'Taxes')
        : (isNl ? 'Winst & Verlies' : 'Profit & Loss');
    } else if (section === 'settings') {
      return [isNl ? 'Instellingen' : 'Settings'];
    } else {
      page = section.charAt(0).toUpperCase() + section.slice(1);
    }

    const crumbs = group ? [group, page] : [page];
    if (sub && sub !== 'all' && sub !== 'inbox') {
      crumbs.push(sub);
    }
    return crumbs;
  }

  const parts = segments.map(p => {
    const key = `breadcrumbs.${p.toLowerCase()}`;
    const trans = t(key);
    return trans !== key ? trans : p.charAt(0).toUpperCase() + p.slice(1);
  });

  if (search) {
    const params = new URLSearchParams(search);
    const tab = params.get('tab');
    if (tab) {
      const tabTitles = {
        'payments': 'Payments',
        'planning': 'Planning & Build',
        'design': 'Design & Renders',
        'handover': 'Handover & Aftercare',
        'mobile-view': 'Mobile View',
      };
      const title = tabTitles[tab] || (tab.charAt(0).toUpperCase() + tab.slice(1));
      if (parts.length > 0 && parts[parts.length - 1] === 'Project') {
        parts[parts.length - 1] = title;
      } else {
        parts.push(title);
      }
    }
  }

  return parts;
}

const DEFAULT_NOTIFS = [];

const ICON_MAP = {
  Camera,
  UserPlus,
  Briefcase,
  Check,
  FileText,
  Clock,
  Bell,
  MessageSquare,
};

const renderNotifIcon = (notif) => {
  let IconComp = Bell;
  const iconVal = notif?.icon;

  if (typeof iconVal === 'string' && ICON_MAP[iconVal]) {
    IconComp = ICON_MAP[iconVal];
  } else if (typeof iconVal === 'function') {
    IconComp = iconVal;
  } else if (typeof iconVal === 'object' && iconVal !== null) {
    if (iconVal.$$typeof === Symbol.for('react.forward_ref') || typeof iconVal.render === 'function') {
      IconComp = iconVal;
    } else if (iconVal.$$typeof === Symbol.for('react.element')) {
      return iconVal;
    }
  }

  if (IconComp === Bell) {
    const link = (notif?.link || '').toLowerCase();
    const title = (notif?.titleKey || '').toLowerCase();
    const desc = (notif?.descKey || '').toLowerCase();

    if (title.includes('photo') || desc.includes('photo') || desc.includes('foto')) IconComp = Camera;
    else if (link.includes('lead') || title.includes('lead')) IconComp = UserPlus;
    else if (link.includes('project') || title.includes('project') || desc.includes('project')) IconComp = Briefcase;
    else if (link.includes('quote') || title.includes('quote')) IconComp = Check;
    else if (link.includes('invoice') || link.includes('finance') || link.includes('document')) IconComp = FileText;
    else if (link.includes('planning') || title.includes('delivery') || desc.includes('bezorg')) IconComp = Clock;
  }

  if (typeof IconComp === 'function' || (typeof IconComp === 'object' && IconComp !== null && (IconComp.$$typeof || typeof IconComp.render === 'function'))) {
    const Component = IconComp;
    return <Component className="w-3.5 h-3.5" />;
  }
  return <Bell className="w-3.5 h-3.5" />;
};

const sanitizeForStorage = (list) => {
  if (!Array.isArray(list)) return [];
  return list.map(item => {
    let iconName = 'Bell';
    if (typeof item.icon === 'string') {
      iconName = item.icon;
    } else {
      for (const [k, v] of Object.entries(ICON_MAP)) {
        if (v === item.icon) {
          iconName = k;
          break;
        }
      }
    }
    return { ...item, icon: iconName };
  });
};

export default function TopNav() {
  const { user, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const crumbs = getBreadcrumb(location.pathname, location.search, t, language);
  const cleanDisplayName = (name) => {
    if (!name) return 'Admin User';
    return name.replace(/\s*\([^)]*\)/g, '').trim() || 'Admin User';
  };

  const displayName = cleanDisplayName(user?.name);
  const initials = displayName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || (user?.role === 'admin' ? 'A' : 'P');

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const getInitialNotifications = () => {
    try {
      const stored = JSON.parse(localStorage.getItem('va_admin_notifications') || '[]');
      if (Array.isArray(stored) && stored.length > 0) {
        const dummyTerms = ['sanne visser', 'jan de vries', 'luxury teak', 'sven hoek', 'partner-photo-sample'];
        const clean = stored.filter(s => {
          if ([1, 2, 3, 4, '1', '2', '3', '4', 'partner-photo-sample'].includes(s.id)) return false;
          const str = (JSON.stringify(s) || '').toLowerCase();
          return !dummyTerms.some(term => str.includes(term));
        }).map(s => ({
          ...s,
          icon: (typeof s.icon === 'string' && ICON_MAP[s.icon]) ? s.icon : 'Bell'
        }));
        return clean;
      }
    } catch (e) {}
    return DEFAULT_NOTIFS;
  };

  const [notifications, setNotifications] = useState(getInitialNotifications);
  const [activePopup, setActivePopup] = useState(null);

  // Auto-dismiss floating popup banner after 6.5s
  useEffect(() => {
    if (!activePopup) return;
    const timer = setTimeout(() => {
      setActivePopup(null);
    }, 6500);
    return () => clearTimeout(timer);
  }, [activePopup]);

  // Listen to live notifications from customer & partner actions
  useEffect(() => {
    const handleNewNotif = (e) => {
      if (e.detail) {
        let cleanIcon = 'Bell';
        if (typeof e.detail.icon === 'string' && ICON_MAP[e.detail.icon]) {
          cleanIcon = e.detail.icon;
        }
        const withIcon = {
          ...e.detail,
          icon: cleanIcon,
        };
        setNotifications(prev => [withIcon, ...prev.filter(n => n.id !== withIcon.id)]);
        if (withIcon.popup !== false) {
          setActivePopup(withIcon);
        }
      }
    };

    const syncNotifs = () => {
      setNotifications(getInitialNotifications());
    };

    window.addEventListener('app_new_notification', handleNewNotif);
    window.addEventListener('app_data_changed', syncNotifs);
    window.addEventListener('storage', syncNotifs);

    return () => {
      window.removeEventListener('app_new_notification', handleNewNotif);
      window.removeEventListener('app_data_changed', syncNotifs);
      window.removeEventListener('storage', syncNotifs);
    };
  }, [user]);

  // Live polling for backend activity feed (for real-time bell updates)
  useEffect(() => {
    let isMounted = true;
    const fetchLiveActivities = async () => {
      try {
        const [actRes, leadsRes, quotesRes, projRes] = await Promise.allSettled([
          api.get('/dashboard/activity'),
          api.get('/leads?limit=3'),
          api.get('/quotes?limit=3'),
          api.get('/projects?limit=3')
        ]);

        if (!isMounted) return;
        const newNotifs = [];

        // 1. Real Leads
        if (leadsRes.status === 'fulfilled' && leadsRes.value?.success) {
          const leads = leadsRes.value.data?.items || leadsRes.value.data || [];
          leads.slice(0, 2).forEach(lead => {
            const custName = lead.fullName || lead.customerName || `${lead.firstName || ''} ${lead.lastName || ''}`.trim() || 'Nieuwe klant';
            const cat = lead.productType === 'garden_room' ? 'Buitenverblijf' : 'Buitenkeuken';
            newNotifs.push({
              id: `notif-lead-${lead.id}`,
              titleKey: language === 'NL' ? `Nieuwe aanvraag: ${lead.leadNumber || 'Lead'}` : `New Lead: ${lead.leadNumber || 'Lead'}`,
              descKey: `${custName} — ${cat}`,
              isCustomText: true,
              timeKey: language === 'NL' ? 'Recent' : 'Recent',
              unread: true,
              link: `/admin/leads`,
              icon: 'UserPlus',
              createdAt: lead.createdAt || new Date().toISOString()
            });
          });
        }

        // 2. Real Quotes
        if (quotesRes.status === 'fulfilled' && quotesRes.value?.success) {
          const quotes = quotesRes.value.data?.items || quotesRes.value.data || [];
          quotes.slice(0, 2).forEach(q => {
            const statusLabel = q.status === 'sent' ? (language === 'NL' ? 'Verstuurd' : 'Sent') : q.status === 'approved' ? (language === 'NL' ? 'Akkoord' : 'Approved') : (language === 'NL' ? 'In concept' : 'Draft');
            newNotifs.push({
              id: `notif-quote-${q.id}`,
              titleKey: language === 'NL' ? `Offerte ${q.quoteNumber || ''}` : `Quotation ${q.quoteNumber || ''}`,
              descKey: `${q.customerName || 'Klant'} — ${statusLabel}`,
              isCustomText: true,
              timeKey: language === 'NL' ? 'Recent' : 'Recent',
              unread: false,
              link: `/admin/quotes`,
              icon: 'Check',
              createdAt: q.createdAt || new Date().toISOString()
            });
          });
        }

        // 3. Real Projects
        if (projRes.status === 'fulfilled' && projRes.value?.success) {
          const projs = projRes.value.data?.items || projRes.value.data || [];
          projs.slice(0, 2).forEach(p => {
            const orderStatus = p.orderStatus === 'klaar_voor_levering' ? (language === 'NL' ? 'Gereed voor levering' : 'Ready for delivery') : (language === 'NL' ? 'In voorbereiding' : 'In preparation');
            newNotifs.push({
              id: `notif-proj-${p.id}`,
              titleKey: language === 'NL' ? `Project ${p.projectNumber || ''}` : `Project ${p.projectNumber || ''}`,
              descKey: `${p.name || p.customerName || 'Project'} — ${orderStatus}`,
              isCustomText: true,
              timeKey: language === 'NL' ? 'Recent' : 'Recent',
              unread: true,
              link: user?.role === 'admin' ? `/admin/projects` : `/partner/projects`,
              icon: 'Briefcase',
              createdAt: p.createdAt || new Date().toISOString()
            });
          });
        }

        // 4. Live Activity Feed
        if (actRes.status === 'fulfilled' && actRes.value?.success && Array.isArray(actRes.value.data)) {
          actRes.value.data.slice(0, 3).forEach(act => {
            const actId = `act-${act.id || act.referenceId || act.timestamp}`;
            newNotifs.push({
              id: actId,
              titleKey: act.title || (language === 'NL' ? 'Systeem update' : 'System update'),
              descKey: act.description || act.detail || '',
              isCustomText: true,
              timeKey: language === 'NL' ? 'Zojuist' : 'Just now',
              unread: true,
              link: act.link || (user?.role === 'admin' ? '/admin/projects' : '/partner/projects'),
              icon: 'Briefcase',
              createdAt: act.timestamp || new Date().toISOString()
            });
          });
        }

        if (newNotifs.length > 0) {
          setNotifications(prev => {
            const existingIds = new Set(prev.map(p => p.id));
            const merged = [...prev];
            newNotifs.forEach(n => {
              if (!existingIds.has(n.id)) {
                merged.unshift(n);
                existingIds.add(n.id);
              }
            });
            try {
              localStorage.setItem('va_admin_notifications', JSON.stringify(sanitizeForStorage(merged)));
            } catch (e) {}
            return merged;
          });
        }
      } catch (err) {}
    };

    if (user?.role === 'admin') {
      fetchLiveActivities();
      const interval = setInterval(fetchLiveActivities, 25000);
      return () => {
        isMounted = false;
        clearInterval(interval);
      };
    }
  }, [user, language]);

  const counters = useAdminCounters();
  const dropdownRef = useRef(null);
  const notifRef = useRef(null);
  const newActionRef = useRef(null);
  const langDropdownRef = useRef(null);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [newActionOpen, setNewActionOpen] = useState(false);

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
      if (newActionRef.current && !newActionRef.current.contains(e.target)) {
        setNewActionOpen(false);
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
    setNotifications(prev => {
      const updated = prev.map(n => ({ ...n, unread: false }));
      try {
        localStorage.setItem('va_admin_notifications', JSON.stringify(sanitizeForStorage(updated)));
      } catch (e) {}
      return updated;
    });
  };

  const handleNotifClick = (notif) => {
    setNotifications(prev => {
      const updated = prev.map(n => n.id === notif.id ? { ...n, unread: false } : n);
      try {
        localStorage.setItem('va_admin_notifications', JSON.stringify(sanitizeForStorage(updated)));
      } catch (e) {}
      return updated;
    });
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

        {location.pathname !== '/admin/dashboard' && location.pathname !== '/customer/project' && location.pathname !== '/partner/dashboard' && (
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="p-1.5 rounded-lg hover:bg-[#D6CFC2]/50 text-dark/60 hover:text-dark transition-all flex items-center justify-center cursor-pointer mr-0.5"
            title="Terug"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}

        <img 
          src="/mini logo2.png" 
          alt="VA Monogram" 
          className="h-6 w-6 object-contain rounded-md hidden sm:block lg:hidden flex-shrink-0" 
        />
        {crumbs.map((crumb, i) => (
          <span key={i} className={`flex items-center gap-1.5 min-w-0 ${i < crumbs.length - 1 ? 'hidden sm:flex' : 'flex'}`}>
            {i > 0 && <span className="text-dark/30 font-bold text-xs flex-shrink-0">›</span>}
            <span className={`${i === crumbs.length - 1 ? 'font-bold text-dark text-[11px] sm:text-xs' : 'text-dark/50'} truncate`}>
              {crumb}
            </span>
          </span>
        ))}
      </div>


      {/* Right Controls */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 flex-shrink-0">
        {/* Language Switcher (Google Translate Controlled Component) */}
        <LanguageSwitcher />

        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-dark/30" />
          <input
            type="text"
            placeholder={t('common.search')}
            className="pl-8 pr-4 py-1.5 bg-[#F8F7F4] border border-[#D6CFC2] rounded-full text-xs font-body focus:outline-none focus:ring-2 focus:ring-primary/15 transition-all w-36 lg:w-44 text-dark"
          />
        </div>

        {/* + Nieuw Quick Action Dropdown (Top bar: + Nieuw (lead, task, appointment)) */}
        {user?.role === 'admin' && (
          <div className="relative" ref={newActionRef}>
            <button
              onClick={() => setNewActionOpen(!newActionOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-primary hover:bg-[#2F3C29] text-white rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer"
              title="Nieuw aanmaken"
            >
              <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />
              <span className="hidden sm:inline">Nieuw</span>
              <ChevronDown className={`w-3 h-3 text-white/70 transition-transform ${newActionOpen ? 'rotate-180' : ''}`} />
            </button>

            {newActionOpen && (
              <div className="absolute right-0 top-full mt-2 w-52 bg-[#F2EDE4] border border-[#D6CFC2] rounded-xl shadow-xl z-50 overflow-hidden font-body text-xs divide-y divide-[#D6CFC2]/50">
                <button
                  onClick={() => {
                    navigate('/admin/leads?new=true');
                    window.dispatchEvent(new Event('app_open_lead_wizard'));
                    setNewActionOpen(false);
                  }}
                  className="flex items-center gap-2.5 w-full px-3.5 py-2.5 text-left text-dark hover:bg-white/70 transition-colors font-medium cursor-pointer"
                >
                  <UserPlus className="w-4 h-4 text-primary" />
                  <span>Nieuwe Lead</span>
                </button>
                <button
                  onClick={() => {
                    navigate('/admin/dashboard?view=tasks&new=true');
                    window.dispatchEvent(new Event('app_open_task_modal'));
                    setNewActionOpen(false);
                  }}
                  className="flex items-center gap-2.5 w-full px-3.5 py-2.5 text-left text-dark hover:bg-white/70 transition-colors font-medium cursor-pointer"
                >
                  <CheckSquare className="w-4 h-4 text-accent" />
                  <span>Nieuwe Taak</span>
                </button>
                <button
                  onClick={() => {
                    navigate('/admin/planning?new=true');
                    setNewActionOpen(false);
                  }}
                  className="flex items-center gap-2.5 w-full px-3.5 py-2.5 text-left text-dark hover:bg-white/70 transition-colors font-medium cursor-pointer"
                >
                  <CalendarPlus className="w-4 h-4 text-primary" />
                  <span>Nieuwe Afspraak / Inmeting</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Synchronized Berichten Pill in Top Bar */}
        {user?.role === 'admin' && (
          <button
            onClick={() => navigate('/admin/inbox')}
            className="relative text-dark/60 hover:text-primary transition-colors p-2 rounded-xl hover:bg-[#D6CFC2]/40 cursor-pointer"
            title="Berichten"
          >
            <MessageSquare className="w-4 h-4" />
            {counters.unreadMessages > 0 && (
              <span className="absolute top-1 right-1 px-1.5 py-0.2 bg-[#D97706] text-white font-mono text-[9px] font-bold rounded-full">
                {counters.unreadMessages}
              </span>
            )}
          </button>
        )}

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
                {notifications.map((notif, idx) => {
                  const rawTitle = notif.isCustomText ? notif.titleKey : t(notif.titleKey);
                  const displayTitle = typeof rawTitle === 'string' ? rawTitle : (notif.titleKey || 'Melding');
                  const rawDesc = notif.isCustomText ? notif.descKey : t(notif.descKey, notif.descParams);
                  const displayDesc = typeof rawDesc === 'string' ? rawDesc : (notif.descKey || '');
                  const rawTime = notif.isCustomText ? notif.timeKey : t(notif.timeKey);
                  const displayTime = typeof rawTime === 'string' ? rawTime : (notif.timeKey || '');

                  return (
                    <div 
                      key={notif.id || `notif-${idx}`} 
                      onClick={() => handleNotifClick(notif)}
                      className={`p-3 flex gap-3 cursor-pointer transition-colors ${
                        notif.unread ? 'bg-white/80 hover:bg-white' : 'hover:bg-white/40 opacity-75'
                      }`}
                    >
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        notif.unread ? 'bg-primary/10 text-primary' : 'bg-dark/10 text-dark/50'
                      }`}>
                        {renderNotifIcon(notif)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline">
                          <p className={`font-semibold truncate ${notif.unread ? 'text-dark font-bold' : 'text-dark/70'}`}>
                            {displayTitle}
                          </p>
                          <span className="text-[10px] text-dark/40 ml-2 flex-shrink-0">{displayTime}</span>
                        </div>
                        <p className="text-[11px] text-dark/60 line-clamp-2 mt-0.5">{displayDesc}</p>
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
              <p className="text-xs font-semibold text-dark font-body leading-none">{displayName}</p>
              <p className="text-[10px] text-dark/40 capitalize font-body mt-0.5">{user?.role === 'admin' ? t('common.adminPortal') : user?.role === 'customer' ? t('common.customerPortal') : t('common.partnerPortal')}</p>
            </div>
            <ChevronDown className={`w-3 h-3 text-dark/30 hidden sm:block transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* User Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-[#F2EDE4] border border-[#D6CFC2] rounded-xl shadow-card z-50 overflow-hidden">
              {/* User info header */}
              <div className="px-4 py-3 border-b border-[#D6CFC2]">
                <p className="text-sm font-semibold text-dark font-body">{displayName}</p>
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

      {/* FLOATING REAL-TIME NOTIFICATION POPUP BANNER */}
      {activePopup && (
        <div className="fixed top-16 right-4 z-[999999] max-w-sm w-[calc(100vw-32px)] bg-white border-2 border-primary/20 rounded-2xl shadow-2xl p-4 flex gap-3.5 items-start font-body transition-all duration-300">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 mt-0.5">
            {renderNotifIcon(activePopup)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-primary font-mono bg-primary/10 px-2 py-0.5 rounded-full">
                {activePopup.badge || (language === 'NL' ? 'Nieuwe Melding' : 'New Notification')}
              </span>
              <button
                onClick={() => setActivePopup(null)}
                className="text-dark/40 hover:text-dark p-0.5 rounded-md hover:bg-dark/5 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs font-bold text-dark mt-1 line-clamp-1">
              {activePopup.isCustomText ? activePopup.titleKey : t(activePopup.titleKey)}
            </p>
            <p className="text-[11px] text-dark/70 mt-0.5 line-clamp-2">
              {activePopup.isCustomText ? activePopup.descKey : t(activePopup.descKey, activePopup.descParams)}
            </p>
            <div className="mt-2.5 flex items-center gap-3">
              {activePopup.link && (
                <button
                  onClick={() => {
                    navigate(activePopup.link);
                    handleNotifClick(activePopup);
                    setActivePopup(null);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary text-cream hover:bg-[#2A3824] rounded-lg text-xs font-bold transition-colors shadow-2xs cursor-pointer"
                >
                  <span>{language === 'NL' ? 'Bekijken' : 'View'}</span>
                  <span>→</span>
                </button>
              )}
              <button
                onClick={() => {
                  handleNotifClick(activePopup);
                  setActivePopup(null);
                }}
                className="text-[11px] font-medium text-dark/50 hover:text-dark hover:underline cursor-pointer"
              >
                {language === 'NL' ? 'Als gelezen markeren' : 'Mark as read'}
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
