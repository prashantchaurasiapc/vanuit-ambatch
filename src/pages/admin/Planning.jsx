import React, { useState, useEffect } from 'react';
import Card from '../../components/Card';
import Table from '../../components/Table';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import { 
  Calendar as CalendarIcon, Clock, AlertTriangle, UserX, CheckCircle, ChevronLeft, ChevronRight, 
  ChevronDown, Compass, MapPin, User, ArrowRight, ShieldAlert, Plus, Filter, Wrench, RefreshCw, 
  Check, Edit2, Trash2, Layers, Grid, List, Sparkles, ExternalLink, CalendarDays, X
} from 'lucide-react';
import { mockProjects, mockPartners } from '../../utils/mockData';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../../context/LanguageContext';

export default function Planning() {
  const { t, language } = useLanguage();
  const label = (english, dutch) => language === 'EN' ? english : dutch;

  const translateProjectName = (name) => {
    if (language !== 'EN' || !name) return name;
    return name
      .replace(/Exclusieve Buitenkeuken - Maatwerk/gi, 'Bespoke Custom Outdoor Kitchen')
      .replace(/Exclusieve Buitenkeuken/gi, 'Exclusive Outdoor Kitchen')
      .replace(/Eiken Houten Overkapping/gi, 'Oak Wooden Canopy')
      .replace(/Luxe Teak Buitenkeuken/gi, 'Luxury Teak Outdoor Kitchen')
      .replace(/Kliko Ombouw Triple Antraciet/gi, 'Triple Bin Storage Anthracite')
      .replace(/Luxury Buitenkeukens/gi, 'Luxury Outdoor Kitchens')
      .replace(/Kliko Ombouw/gi, 'Bin Storage')
      .replace(/Buitenkeuken/gi, 'Outdoor Kitchen')
      .replace(/Overkapping/gi, 'Canopy');
  };

  const translatePartnerName = (name) => {
    if (language !== 'EN' || !name) return name;
    return name
      .replace(/CraftWood Veluwe/gi, 'CraftWood Timber (Veluwe)')
      .replace(/StaalWerk Brabant/gi, 'Steel Works (Brabant)')
      .replace(/Hout & Steen Utrecht/gi, 'Wood & Stone (Utrecht)')
      .replace(/De Gelderse Ambacht/gi, 'Gelderland Craftsmen')
      .replace(/Noord-Zeeland Houtbouw/gi, 'Zeeland Timber Construction');
  };

  // View Mode State: 'week' | 'day' | 'month'
  const [viewMode, setViewMode] = useState('week');
  const [selectedWeekIndex, setSelectedWeekIndex] = useState(0);

  const [projects, setProjects] = useState([]);
  const [partners, setPartners] = useState([]);
  const [selectedPartnerFilter, setSelectedPartnerFilter] = useState('All');
  const [selectedProjectModal, setSelectedProjectModal] = useState(null);
  const [assignPartnerModalProject, setAssignPartnerModalProject] = useState(null);
  const [toastMsg, setToastMsg] = useState('');

  // Daily Tasks State for Day-Level Planning
  const [dailyTasks, setDailyTasks] = useState([]);

  // Modals for Task Creation & Google Calendar Sync
  const [addTaskModalOpen, setAddTaskModalOpen] = useState(false);
  const [googleCalendarModalOpen, setGoogleCalendarModalOpen] = useState(false);
  const [isSyncingCalendar, setIsSyncingCalendar] = useState(false);

  // New Daily Task Form State
  const [taskForm, setTaskForm] = useState({
    projectId: '',
    taskTitle: 'Montage & Plaatsing',
    date: new Date().toISOString().split('T')[0],
    time: '08:30 - 14:00',
    partner: '',
    type: 'Installation',
    notes: ''
  });

  // 6 Weeks definition generator starting from current week
  const generate6Weeks = () => {
    const weeks = [];
    const now = new Date();
    const dayOfWeek = now.getDay();
    const distanceToMonday = (dayOfWeek + 6) % 7;
    const monday = new Date(now);
    monday.setDate(now.getDate() - distanceToMonday);

    for (let i = 0; i < 6; i++) {
      const weekStart = new Date(monday);
      weekStart.setDate(monday.getDate() + (i * 7));
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      
      const firstJan = new Date(weekStart.getFullYear(), 0, 1);
      const weekNum = Math.ceil((((weekStart - firstJan) / 86400000) + firstJan.getDay() + 1) / 7);

      // Generate 7 Days for this week (Monday to Sunday)
      const days = [];
      const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      const dayNamesNL = ['Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag', 'Zondag'];

      for (let d = 0; d < 7; d++) {
        const dayDate = new Date(weekStart);
        dayDate.setDate(weekStart.getDate() + d);
        const isoDate = dayDate.toISOString().split('T')[0];
        days.push({
          dayName: dayNames[d],
          dayNameNL: dayNamesNL[d],
          dateFormatted: `${dayDate.getDate()} ${dayDate.toLocaleString('default', { month: 'short' })}`,
          isoDate: isoDate,
          isToday: isoDate === now.toISOString().split('T')[0]
        });
      }

      weeks.push({
        index: i + 1,
        weekNum: weekNum || (31 + i),
        title: `Week ${weekNum || (31 + i)}`,
        dateRange: `${weekStart.getDate()} ${weekStart.toLocaleString('default', { month: 'short' })} - ${weekEnd.getDate()} ${weekEnd.toLocaleString('default', { month: 'short' })}`,
        startDate: weekStart,
        endDate: weekEnd,
        days: days
      });
    }
    return weeks;
  };

  const [weeksList] = useState(generate6Weeks());

  // Helper to place project into specific week cell cleanly across the 6 weeks
  const getProjectWeekIndex = (proj, index) => {
    if (proj.weekIndex) return proj.weekIndex;
    if (proj.deadline) {
      const pDate = new Date(proj.deadline);
      for (let i = 0; i < weeksList.length; i++) {
        if (pDate >= weeksList[i].startDate && pDate <= weeksList[i].endDate) {
          return weeksList[i].index;
        }
      }
    }
    const distribution = [1, 2, 4, 1, 5, 1];
    return distribution[index % distribution.length];
  };

  // Default Daily Tasks Generator
  const generateDefaultDailyTasks = (projs) => {
    const currentWeek = weeksList[0];
    const todayIso = new Date().toISOString().split('T')[0];

    return [
      {
        id: 'TSK-101',
        projectId: projs[0]?.id || 'PRJ-101',
        projectName: projs[0]?.name || 'Luxury Teak Outdoor Kitchen 4m',
        customer: projs[0]?.customer || 'John Miller',
        taskTitle: language === 'EN' ? 'Installation & Assembly' : 'Montage & Plaatsing op Locatie',
        date: currentWeek.days[0].isoDate, // Monday
        dayName: 'Monday',
        time: '08:30 - 14:00',
        partner: projs[0]?.partner || 'CraftWood Veluwe',
        status: 'Scheduled',
        type: 'Installation'
      },
      {
        id: 'TSK-102',
        projectId: projs[1]?.id || 'PRJ-102',
        projectName: projs[1]?.name || 'Triple Bin Storage Anthracite',
        customer: projs[1]?.customer || 'Sophia Taylor',
        taskTitle: language === 'EN' ? 'Site Measurement & Foundation Check' : 'Inmeting & Fundering Inspectie',
        date: currentWeek.days[1].isoDate, // Tuesday
        dayName: 'Tuesday',
        time: '10:00 - 12:30',
        partner: projs[1]?.partner || 'StaalWerk Brabant',
        status: 'In Progress',
        type: 'Measurement'
      },
        {
        id: 'TSK-103',
        projectId: projs[2]?.id || 'PRJ-103',
        projectName: projs[2]?.name || 'Oak Wooden Canopy 6x4m',
        customer: projs[2]?.customer || 'Mark Davis',
        taskTitle: language === 'EN' ? 'Timber Transport & Crane Delivery' : 'Hout Hijswerk & Transport',
        date: currentWeek.days[2].isoDate, // Wednesday
        dayName: 'Wednesday',
        time: '07:30 - 13:00',
        partner: projs[2]?.partner || 'Hout & Steen Utrecht',
        status: 'Scheduled',
        type: 'Delivery'
      },
      {
        id: 'TSK-104',
        projectId: projs[3]?.id || 'PRJ-104',
        projectName: projs[3]?.name || 'Luxury Terrace Decking',
        customer: projs[3]?.customer || 'Emma Wilson',
        taskTitle: language === 'EN' ? 'Final Inspection & Client Handover' : 'Eindinspectie & Klant Sleuteloverdracht',
        date: currentWeek.days[4].isoDate, // Friday
        dayName: 'Friday',
        time: '14:00 - 16:30',
        partner: projs[3]?.partner || 'De Gelderse Ambacht',
        status: 'Scheduled',
        type: 'Inspection'
      }
    ];
  };

  // Load Data from LocalStorage with mock fallbacks
  useEffect(() => {
    let activeProjs = mockProjects;
    const savedProjects = localStorage.getItem('app_projects');
    if (savedProjects) {
      try {
        const parsed = JSON.parse(savedProjects);
        if (Array.isArray(parsed) && parsed.length > 0) activeProjs = parsed;
      } catch (e) {}
    }
    setProjects(activeProjs);

    const savedPartners = localStorage.getItem('app_partners_v3') || localStorage.getItem('app_partners_v2');
    if (savedPartners) {
      try {
        const parsed = JSON.parse(savedPartners);
        if (Array.isArray(parsed) && parsed.length > 0) setPartners(parsed);
        else setPartners(mockPartners);
      } catch (e) { setPartners(mockPartners); }
    } else {
      setPartners(mockPartners);
    }

    // Load Daily Tasks
    const savedDailyTasks = localStorage.getItem('app_daily_tasks_v2') || localStorage.getItem('app_daily_tasks');
    if (savedDailyTasks) {
      try {
        const parsed = JSON.parse(savedDailyTasks);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setDailyTasks(parsed);
          return;
        }
      } catch (e) {}
    }

    const defaultTasks = generateDefaultDailyTasks(activeProjs);
    setDailyTasks(defaultTasks);
    localStorage.setItem('app_daily_tasks_v2', JSON.stringify(defaultTasks));
  }, []);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3500);
  };

  const handleAssignPartnerToProject = (projectId, partnerName) => {
    const updatedProjects = projects.map(p => p.id === projectId ? { ...p, partner: partnerName } : p);
    setProjects(updatedProjects);
    localStorage.setItem('app_projects', JSON.stringify(updatedProjects));
    showToast(`Partner "${partnerName}" toegewezen aan project ${projectId}!`);
    setAssignPartnerModalProject(null);
  };

  // Create New Daily Task Assignment
  const handleCreateDailyTaskSubmit = (e) => {
    e.preventDefault();
    if (!taskForm.taskTitle.trim() || !taskForm.date) {
      return showToast(language === 'EN' ? 'Please fill in all required task fields.' : 'Vul alstublieft alle verplichte taakvelden in.');
    }

    const selectedProj = projects.find(p => p.id === taskForm.projectId) || projects[0];
    const taskDateObj = new Date(taskForm.date);
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const calculatedDayName = dayNames[taskDateObj.getDay()];

    const newTask = {
      id: `TSK-${Date.now().toString().slice(-4)}`,
      projectId: selectedProj ? selectedProj.id : 'PRJ-101',
      projectName: selectedProj ? selectedProj.name : form.taskTitle,
      customer: selectedProj ? selectedProj.customer : 'Cliënt',
      taskTitle: taskForm.taskTitle.trim(),
      date: taskForm.date,
      dayName: calculatedDayName,
      time: taskForm.time || '09:00 - 13:00',
      partner: taskForm.partner || selectedProj?.partner || 'CraftWood Veluwe',
      status: 'Scheduled',
      type: taskForm.type || 'Installation',
      notes: taskForm.notes || ''
    };

    const updatedTasks = [newTask, ...dailyTasks];
    setDailyTasks(updatedTasks);
    localStorage.setItem('app_daily_tasks_v2', JSON.stringify(updatedTasks));
    localStorage.setItem('app_daily_tasks', JSON.stringify(updatedTasks));
    window.dispatchEvent(new Event('app_data_changed'));

    showToast(
      language === 'EN'
        ? `Task "${newTask.taskTitle}" assigned to ${newTask.date} (${calculatedDayName})!`
        : `Taak "${newTask.taskTitle}" ingepland op ${newTask.date} (${calculatedDayName})!`
    );
    setAddTaskModalOpen(false);
  };

  // Handle Google Calendar Sync Trigger
  const handleTriggerGoogleCalendarSync = () => {
    setIsSyncingCalendar(true);
    setTimeout(() => {
      setIsSyncingCalendar(false);
      showToast(
        language === 'EN'
          ? `Google Calendar synchronized! ${dailyTasks.length + activeProjects.length} events synced to Google Agenda.`
          : `Google Calendar gesynchroniseerd! ${dailyTasks.length + activeProjects.length} evenementen bijgewerkt in Google Agenda.`
      );
      setGoogleCalendarModalOpen(false);
    }, 1200);
  };

  // Filter projects by partner filter
  const activeProjects = projects.filter(p => {
    if (selectedPartnerFilter === 'All') return true;
    return (p.partner || '').toLowerCase() === selectedPartnerFilter.toLowerCase();
  });

  // Calculate Capacity Overloads & Unassigned Warnings
  const partnerCapacityOverloads = [];
  const unassignedProjects = projects.filter(p => !p.partner || p.partner === 'Unassigned' || p.partner === 'Niet toegewezen');

  weeksList.forEach(w => {
    const weekIndex = w.index;
    const weekProjects = projects.filter((p, idx) => getProjectWeekIndex(p, idx) === weekIndex);
    
    const partnerCounts = {};
    weekProjects.forEach(p => {
      if (p.partner && p.partner !== 'Unassigned' && p.partner !== 'Niet toegewezen') {
        partnerCounts[p.partner] = (partnerCounts[p.partner] || 0) + 1;
      }
    });

    Object.keys(partnerCounts).forEach(partnerName => {
      if (partnerCounts[partnerName] > 2) {
        partnerCapacityOverloads.push({
          week: w.title,
          weekNum: w.weekNum,
          partner: partnerName,
          count: partnerCounts[partnerName]
        });
      }
    });
  });

  const activeWeekObj = weeksList[selectedWeekIndex] || weeksList[0];

  return (
    <div className="space-y-6 font-body text-[#4A4A43] max-w-full">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div initial={{ opacity: 0, x: 80 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 80 }} className="fixed top-20 right-4 z-[9999] flex items-center gap-2 bg-primary text-cream px-4 py-3 rounded-xl shadow-lg text-xs font-body">
            <CheckCircle className="w-4 h-4 text-green-400" />
            {toastMsg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Header Section with View Switcher & Action Buttons */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-heading font-bold text-primary flex items-center gap-2">
            {label('Planning & Schedule Management', 'Planning en Agenda Beheer')}
            <span className="text-[10px] bg-primary/10 text-primary border border-primary/20 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
              {viewMode === 'week' ? label('6-Week View', '6-Weken Weergave') : viewMode === 'day' ? label('Day-Level View', 'Dag-Niveau Weergave') : label('Month View', 'Maand Weergave')}
            </span>
          </h2>
          <p className="text-dark/60 text-sm">
            {label('Schedule deliveries and daily craftsman tasks by week, specific day, or calendar dates.', 'Plan opleveringen en dagelijkse montage-opdrachten per week of specifieke datum.')}
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
          {/* GOOGLE CALENDAR SYNC BUTTON (STUNNING GOOGLE INTEGRATION UI) */}
          <button
            type="button"
            onClick={() => setGoogleCalendarModalOpen(true)}
            className="px-3.5 py-2 bg-white hover:bg-[#F8F7F4] text-primary border border-[#C4BEB3] rounded-xl text-xs font-bold font-body transition-all shadow-xs flex items-center gap-2 cursor-pointer"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <CalendarDays className="w-4 h-4 text-blue-600 flex-shrink-0" />
            <span>{label('Google Calendar Sync', 'Google Agenda Sync')}</span>
          </button>

          {/* MANUAL TASK ASSIGNMENT BUTTON */}
          <Button
            size="sm"
            icon={Plus}
            onClick={() => setAddTaskModalOpen(true)}
            className="py-2 px-3.5 text-xs font-bold shadow-sm"
          >
            {label('Schedule Daily Task', 'Dagtaak Inplannen')}
          </Button>
        </div>
      </div>

      {/* VIEW MODE TOGGLE SWITCHER BAR */}
      <div className="bg-[#EDE8DF] p-1.5 rounded-2xl border border-[#C4BEB3] flex items-center justify-between gap-2 overflow-x-auto no-scrollbar shadow-xs">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setViewMode('week')}
            className={`px-4 py-2 rounded-xl text-xs font-bold font-body transition-all flex items-center gap-2 whitespace-nowrap ${
              viewMode === 'week' ? 'bg-primary text-cream shadow-sm' : 'text-dark/70 hover:bg-white/60'
            }`}
          >
            <Grid className="w-4 h-4" />
            <span>{label('6-Week Delivery Grid', '6-Weken Opleverkalender')}</span>
          </button>

          <button
            onClick={() => setViewMode('day')}
            className={`px-4 py-2 rounded-xl text-xs font-bold font-body transition-all flex items-center gap-2 whitespace-nowrap ${
              viewMode === 'day' ? 'bg-primary text-cream shadow-sm' : 'text-dark/70 hover:bg-white/60'
            }`}
          >
            <CalendarIcon className="w-4 h-4" />
            <span>{label('Day-Level Schedule (Mon - Sun)', 'Dagelijkse Planning (Ma - Zo)')}</span>
          </button>

          <button
            onClick={() => setViewMode('month')}
            className={`px-4 py-2 rounded-xl text-xs font-bold font-body transition-all flex items-center gap-2 whitespace-nowrap ${
              viewMode === 'month' ? 'bg-primary text-cream shadow-sm' : 'text-dark/70 hover:bg-white/60'
            }`}
          >
            <CalendarDays className="w-4 h-4" />
            <span>{label('Month View', 'Maand Overzicht')}</span>
          </button>
        </div>

        {/* Selected Week Picker for Day & Month View */}
        {(viewMode === 'day' || viewMode === 'month') && (
          <div className="flex items-center gap-2 pr-2">
            <span className="text-xs font-bold text-dark/60 font-mono hidden sm:inline">{label('Active Week:', 'Actieve Week:')}</span>
            <select
              value={selectedWeekIndex}
              onChange={e => setSelectedWeekIndex(parseInt(e.target.value))}
              className="bg-white border border-[#D6CFC2] px-3 py-1.5 rounded-xl text-xs font-bold text-primary shadow-xs outline-none cursor-pointer"
            >
              {weeksList.map((w, idx) => (
                <option key={idx} value={idx}>{w.title} ({w.dateRange})</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* CAPACITY & UNASSIGNED WARNINGS BANNER PANEL */}
      {(partnerCapacityOverloads.length > 0 || unassignedProjects.length > 0) && (
        <div className="space-y-3">
          {/* Overload Warnings Banner */}
          {partnerCapacityOverloads.length > 0 && (
            <Card noPadding className="p-4 bg-red-50/90 border-2 border-red-200">
              <div className="flex items-center gap-2 text-red-800 font-bold text-xs mb-2">
                <ShieldAlert className="w-5 h-5 text-red-600 animate-pulse" />
                <span>{label('Capacity conflict! Partner overloaded', 'Capaciteitsconflict! Partner overbelast')}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-red-700">
                {partnerCapacityOverloads.map((ov, i) => (
                  <div key={i} className="flex justify-between items-center bg-white/90 p-2.5 rounded-lg border border-red-200">
                    <div>
                      <span className="font-bold text-dark">{ov.partner}</span> {label('has', 'heeft')} <span className="font-bold text-red-600">{ov.count} {label('deliveries', 'opleveringen')}</span> in {ov.week}
                    </div>
                    <Badge variant="danger">⚠️ {label('Overloaded', 'Overbelast')}</Badge>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Unassigned Projects Warnings Banner */}
          {unassignedProjects.length > 0 && (
            <Card noPadding className="p-4 bg-amber-50/90 border-2 border-amber-300 rounded-2xl">
              <div className="flex items-center justify-between pb-2 border-b border-amber-200 mb-3">
                <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                  <UserX className="w-5 h-5 text-amber-700 flex-shrink-0" />
                  <span>{label(`No Partner Assigned Yet (${unassignedProjects.length} Projects)`, `Nog geen partner toegewezen (${unassignedProjects.length} projecten)`)}</span>
                </div>
                <span className="text-[10px] font-bold bg-amber-200/80 text-amber-900 px-2 py-0.5 rounded-full">{label('Action Required', 'Actie Vereist')}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {unassignedProjects.map((un, i) => (
                  <div key={i} className="flex justify-between items-center bg-white/90 p-3 rounded-xl border border-amber-200 gap-2 shadow-xs">
                    <div className="min-w-0 flex-1 space-y-0.5">
                      <p className="font-bold text-dark text-xs truncate">{translateProjectName(un.name)}</p>
                      <p className="text-[10px] text-amber-900/80 truncate">{label('Client:', 'Klant:')} <span className="font-semibold">{un.customer}</span></p>
                      <p className="text-[10px] text-dark/50 font-mono truncate">📅 {un.deadline}</p>
                    </div>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setAssignPartnerModalProject(un)}
                      className="text-[10px] py-1 px-3 flex-shrink-0 shadow-xs"
                    >
                      {label('Assign →', 'Wijs Toe →')}
                    </Button>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* VIEW MODE 1: 6-WEEK DELIVERY PLANNING GRID                */}
      {/* ========================================================= */}
      {viewMode === 'week' && (
        <Card noPadding className="p-5 sm:p-6 overflow-hidden">
          {/* Toolbar Header with Partner Filter */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-[#D6CFC2] mb-5">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-primary flex-shrink-0" />
              <div>
                <h3 className="font-heading font-bold text-primary text-base sm:text-lg leading-tight">{label('6-Week Delivery Planning Grid', '6-wekenopleverplanning')}</h3>
                <p className="text-[11px] text-dark/60">{label('Overview of scheduled installation deliveries per week', 'Overzicht ingeplande opleveringen per week')}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-xs font-bold text-accent bg-accent/10 border border-accent/20 px-3 py-1 rounded-full flex-shrink-0">
                {label(`Total Scheduled: ${activeProjects.length}`, `Totaal ingepland: ${activeProjects.length}`)}
              </span>

              {/* Sleek Partner Filter Dropdown */}
              <div className="relative flex items-center bg-[#EDE8DF] border border-[#C4BEB3] px-3 py-1.5 rounded-xl shadow-xs gap-2 hover:border-primary/50 transition-colors">
                <Filter className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                <select
                  value={selectedPartnerFilter}
                  onChange={(e) => setSelectedPartnerFilter(e.target.value)}
                  className="bg-transparent text-xs font-bold text-primary cursor-pointer appearance-none outline-none border-none pr-6 focus:outline-none focus:ring-0"
                >
                  <option value="All">{label(`All Partners (${partners.length})`, `Alle partners (${partners.length})`)}</option>
                  {partners.map((pt, idx) => (
                    <option key={idx} value={pt.name}>
                      {translatePartnerName(pt.name)}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-primary flex-shrink-0 pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>
          </div>

          {/* Comfortable 6-Week Horizontal Grid Container with Overflow Scroll */}
          <div className="overflow-x-auto pb-3">
            <div className="grid grid-cols-6 gap-3.5 min-w-[1080px]">
              {weeksList.map((week) => {
                const weekProjects = activeProjects.filter((p, idx) => getProjectWeekIndex(p, idx) === week.index);
                const hasUnassigned = weekProjects.some(p => !p.partner || p.partner === 'Unassigned' || p.partner === 'Niet toegewezen');
                const isOverloaded = partnerCapacityOverloads.some(o => o.week === week.title);

                return (
                  <div key={week.index} className="space-y-2.5 flex flex-col justify-between min-w-[170px]">
                    {/* Column Week Header */}
                    <div className={`p-2.5 rounded-xl border text-center font-body transition-all ${
                      isOverloaded
                        ? 'bg-red-100 border-red-300 text-red-900'
                        : hasUnassigned
                        ? 'bg-amber-100/90 border-amber-300 text-amber-900'
                        : 'bg-[#EDE8DF] border-[#D6CFC2] text-primary'
                    }`}>
                      <p className="font-heading font-bold text-xs sm:text-sm">{week.title}</p>
                      <p className="text-[10px] text-dark/60 font-mono mt-0.5">{week.dateRange}</p>
                      <div className="mt-1 flex justify-center">
                        <span className="text-[9px] font-bold bg-white/90 text-primary px-2 py-0.5 rounded-full border border-[#D6CFC2]/60">
                          {label(`${weekProjects.length} deliveries`, `${weekProjects.length} opleveringen`)}
                        </span>
                      </div>
                    </div>

                    {/* Scheduled Cards Container */}
                    <div className="space-y-2 flex-1 bg-[#F8F7F4]/80 p-2.5 rounded-xl border border-[#D6CFC2]/60 flex flex-col">
                      {weekProjects.map((proj) => {
                        const isProjUnassigned = !proj.partner || proj.partner === 'Unassigned' || proj.partner === 'Niet toegewezen';
                        return (
                          <motion.div
                            key={proj.id}
                            whileHover={{ scale: 1.02 }}
                            onClick={() => setSelectedProjectModal(proj)}
                            className={`p-2.5 rounded-xl border transition-all cursor-pointer shadow-xs space-y-1.5 overflow-hidden ${
                              isProjUnassigned
                                ? 'bg-amber-50/90 border-amber-300 hover:border-amber-500'
                                : 'bg-white border-[#D6CFC2] hover:border-primary'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-1">
                              <span className="font-mono font-bold text-accent text-[10px] shrink-0">{proj.id}</span>
                              <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-md shrink-0 uppercase tracking-tight ${
                                proj.status === 'Completed' || proj.status === 'Voltooid' 
                                  ? 'bg-emerald-100 text-emerald-800' 
                                  : proj.status === 'In Progress' || proj.status === 'Lopend'
                                  ? 'bg-primary/10 text-primary' 
                                  : 'bg-amber-100 text-amber-900'
                              }`}>
                                {proj.status === 'In Progress' ? label('ONGOING', 'LOPEND') : proj.status === 'Completed' ? label('COMPLETED', 'VOLTOOID') : label('PENDING', 'WACHTEND')}
                              </span>
                            </div>

                            <h4 className="font-heading font-bold text-xs text-primary leading-tight line-clamp-2">
                              {translateProjectName(proj.name)}
                            </h4>

                            <p className="text-[10px] text-dark/60 truncate">
                              {label('Client:', 'Klant:')} <span className="font-semibold text-dark">{proj.customer}</span>
                            </p>

                            <div className="pt-1.5 border-t border-[#D6CFC2]/40 text-[9px] space-y-0.5">
                              <p className={`font-bold truncate ${isProjUnassigned ? 'text-amber-800' : 'text-primary'}`}>
                                {isProjUnassigned ? label('⚠️ No Partner', '⚠️ Geen Partner') : `👷 ${translatePartnerName(proj.partner)}`}
                              </p>
                              <p className="text-dark/50 font-mono truncate">
                                📅 {proj.deadline}
                              </p>
                            </div>
                          </motion.div>
                        );
                      })}

                      {weekProjects.length === 0 && (
                        <div className="flex-1 flex items-center justify-center text-center py-6 text-[10px] text-dark/40 italic">
                          {label('No delivery planned in this week', 'Geen oplevering gepland in deze week')}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>
      )}

      {/* ========================================================= */}
      {/* VIEW MODE 2: DAY-LEVEL SCHEDULE GRID (MON - SUN)          */}
      {/* ========================================================= */}
      {viewMode === 'day' && (
        <Card noPadding className="p-5 sm:p-6 overflow-hidden">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-[#D6CFC2] mb-5">
            <div>
              <h3 className="font-heading font-bold text-primary text-base sm:text-lg flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-primary" />
                {label(`Daily Schedule Grid — ${activeWeekObj.title}`, `Dagelijkse Planning Grid — ${activeWeekObj.title}`)}
              </h3>
              <p className="text-[11px] text-dark/60 font-mono mt-0.5">
                {activeWeekObj.dateRange} • {label('7-Day Detailed Activity Timeline', '7-Dagen Gedetailleerde Activiteiten Timeline')}
              </p>
            </div>

            <Button
              size="sm"
              icon={Plus}
              onClick={() => setAddTaskModalOpen(true)}
              className="py-1.5 px-3 text-xs font-bold"
            >
              {label('+ Add Task to Specific Date/Day', '+ Taak toewijzen aan Datum/Dag')}
            </Button>
          </div>

          {/* 7-Day Columns (Monday to Sunday) */}
          <div className="overflow-x-auto pb-3">
            <div className="grid grid-cols-7 gap-3 min-w-[1100px]">
              {activeWeekObj.days.map((dayItem, dIdx) => {
                const dayTasksList = dailyTasks.filter(t => t.date === dayItem.isoDate || t.dayName === dayItem.dayName);

                return (
                  <div key={dIdx} className="space-y-2 flex flex-col min-w-[150px]">
                    {/* Day Column Header */}
                    <div className={`p-2.5 rounded-xl border text-center font-body transition-all ${
                      dayItem.isToday ? 'bg-primary text-cream border-primary shadow-xs' : 'bg-[#EDE8DF] border-[#D6CFC2] text-primary'
                    }`}>
                      <p className="font-heading font-bold text-xs sm:text-sm">
                        {language === 'EN' ? dayItem.dayName : dayItem.dayNameNL}
                      </p>
                      <p className={`text-[10px] font-mono mt-0.5 ${dayItem.isToday ? 'text-cream/80 font-bold' : 'text-dark/60'}`}>
                        {dayItem.dateFormatted}
                      </p>
                      {dayItem.isToday && (
                        <span className="text-[8px] font-bold bg-amber-400 text-dark px-2 py-0.2 rounded-full uppercase mt-1 inline-block">
                          {label('TODAY', 'VANDAAG')}
                        </span>
                      )}
                    </div>

                    {/* Task Cards Container for this Day */}
                    <div className="space-y-2 flex-1 bg-[#F8F7F4] p-2 rounded-xl border border-[#D6CFC2] flex flex-col min-h-[220px]">
                      {dayTasksList.map((dt) => (
                        <div key={dt.id} className="bg-white p-2.5 rounded-xl border border-[#D6CFC2] shadow-xs space-y-1 hover:border-primary transition-all">
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-[9px] font-bold text-accent">{dt.time}</span>
                            <span className="text-[8px] font-bold bg-primary/10 text-primary px-1.5 py-0.5 rounded-md uppercase">
                              {dt.type}
                            </span>
                          </div>

                          <h5 className="font-bold text-xs text-primary leading-tight">{dt.taskTitle}</h5>
                          <p className="text-[10px] text-dark/70 font-medium truncate">📍 {translateProjectName(dt.projectName)}</p>
                          <p className="text-[9px] text-dark/50 truncate">👤 {dt.customer}</p>

                          <div className="pt-1 border-t border-[#D6CFC2]/40 flex items-center justify-between text-[9px]">
                            <span className="font-bold text-primary truncate">👷 {dt.partner}</span>
                          </div>
                        </div>
                      ))}

                      {dayTasksList.length === 0 && (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-3 text-[10px] text-dark/40 italic">
                          <span>{label('No tasks scheduled for this day', 'Geen taken gepland op deze dag')}</span>
                        </div>
                      )}

                      <button
                        onClick={() => {
                          setTaskForm(prev => ({ ...prev, date: dayItem.isoDate }));
                          setAddTaskModalOpen(true);
                        }}
                        className="w-full py-1.5 bg-[#EDE8DF]/60 hover:bg-[#EDE8DF] border border-dashed border-[#D6CFC2] rounded-lg text-[10px] font-bold text-primary flex items-center justify-center gap-1 transition-colors mt-auto"
                      >
                        <Plus className="w-3 h-3" />
                        {label('Add Task', 'Taak Toevoegen')}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>
      )}

      {/* ========================================================= */}
      {/* VIEW MODE 3: MONTHLY OVERVIEW GRID                       */}
      {/* ========================================================= */}
      {viewMode === 'month' && (
        <Card noPadding className="p-5 sm:p-6 overflow-hidden">
          <div className="flex justify-between items-center pb-4 border-b border-[#D6CFC2] mb-5">
            <div>
              <h3 className="font-heading font-bold text-primary text-base sm:text-lg flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-primary" />
                {label('Monthly Project & Delivery Calendar', 'Maandelijks Project & Opleveroverzicht')}
              </h3>
              <p className="text-[11px] text-dark/60">{label('30-Day high level timeline view for executive scheduling', '30-dagen totaaloverzicht voor directieplanning')}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {activeProjects.map((p, idx) => (
              <div key={idx} className="p-3.5 bg-white border border-[#D6CFC2] rounded-xl shadow-xs space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-mono text-xs font-bold text-accent">{p.id}</span>
                  <Badge variant={p.status === 'Completed' ? 'success' : 'primary'}>{p.status}</Badge>
                </div>
                <h4 className="font-bold text-xs text-primary">{translateProjectName(p.name)}</h4>
                <p className="text-[11px] text-dark/70">Client: <strong>{p.customer}</strong></p>
                <div className="pt-2 border-t border-[#D6CFC2]/50 text-[10px] flex justify-between font-mono">
                  <span>📅 Target: <strong>{p.deadline}</strong></span>
                  <span className="text-primary font-bold">👷 {translatePartnerName(p.partner)}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* MANUAL TASK & DAY SELECTION MODAL */}
      <AnimatePresence>
        {addTaskModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-dark/70 backdrop-blur-xs" onClick={() => setAddTaskModalOpen(false)} />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative w-full max-w-lg bg-[#EDE8DF] border border-[#C4BEB3] rounded-2xl p-6 shadow-2xl z-10 space-y-4 text-xs font-body max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center border-b border-[#D6CFC2] pb-3">
                <h3 className="font-heading font-bold text-primary text-base flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5 text-accent" />
                  {label('Schedule Daily Task / Activity', 'Dagtaak / Activiteit Inplannen')}
                </h3>
                <button onClick={() => setAddTaskModalOpen(false)} className="p-1 text-dark/40 hover:text-dark"><X className="w-5 h-5" /></button>
              </div>

              <form onSubmit={handleCreateDailyTaskSubmit} className="space-y-3">
                <div>
                  <label className="block font-bold text-dark/60 mb-1 uppercase tracking-wider">{label('Select Project *', 'Selecteer Project *')}</label>
                  <select
                    value={taskForm.projectId}
                    onChange={e => {
                      const sel = projects.find(p => p.id === e.target.value);
                      setTaskForm(prev => ({ 
                        ...prev, 
                        projectId: e.target.value,
                        partner: sel?.partner || prev.partner
                      }));
                    }}
                    className="w-full px-3 py-2 bg-white border border-[#D6CFC2] rounded-lg text-xs font-bold text-primary"
                  >
                    <option value="">— {label('Select Active Project', 'Selecteer Actief Project')} —</option>
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.id} — {translateProjectName(p.name)} ({p.customer})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-dark/60 mb-1 uppercase tracking-wider">{label('Task / Activity Title *', 'Taak / Opleveractiviteit *')}</label>
                  <input
                    type="text"
                    required
                    value={taskForm.taskTitle}
                    onChange={e => setTaskForm(prev => ({ ...prev, taskTitle: e.target.value }))}
                    className="w-full px-3 py-2 bg-white border border-[#D6CFC2] rounded-lg font-bold text-dark text-xs"
                    placeholder="e.g. Montage & Plaatsing op Locatie"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-dark/60 mb-1 uppercase tracking-wider">{label('Specific Date *', 'Specifieke Datum *')}</label>
                    <input
                      type="date"
                      required
                      value={taskForm.date}
                      onChange={e => setTaskForm(prev => ({ ...prev, date: e.target.value }))}
                      className="w-full px-3 py-2 bg-white border border-[#D6CFC2] rounded-lg font-mono font-bold text-primary text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-dark/60 mb-1 uppercase tracking-wider">{label('Time Duration', 'Tijdstip / Duur')}</label>
                    <input
                      type="text"
                      value={taskForm.time}
                      onChange={e => setTaskForm(prev => ({ ...prev, time: e.target.value }))}
                      className="w-full px-3 py-2 bg-white border border-[#D6CFC2] rounded-lg text-xs"
                      placeholder="08:30 - 14:00"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-dark/60 mb-1 uppercase tracking-wider">{label('Assigned Craftsman', 'Toegewezen Vakman')}</label>
                    <select
                      value={taskForm.partner}
                      onChange={e => setTaskForm(prev => ({ ...prev, partner: e.target.value }))}
                      className="w-full px-3 py-2 bg-white border border-[#D6CFC2] rounded-lg text-xs font-semibold"
                    >
                      {partners.map((pt, idx) => (
                        <option key={idx} value={pt.name}>{translatePartnerName(pt.name)}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-dark/60 mb-1 uppercase tracking-wider">{label('Activity Type', 'Type Activiteit')}</label>
                    <select
                      value={taskForm.type}
                      onChange={e => setTaskForm(prev => ({ ...prev, type: e.target.value }))}
                      className="w-full px-3 py-2 bg-white border border-[#D6CFC2] rounded-lg text-xs"
                    >
                      <option value="Installation">Montage (Installation)</option>
                      <option value="Measurement">Inmeting (Measurement)</option>
                      <option value="Delivery">Transport & Levering</option>
                      <option value="Inspection">Eindinspectie (Inspection)</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-[#D6CFC2]">
                  <Button type="button" variant="outline" onClick={() => setAddTaskModalOpen(false)}>{t('common.cancel')}</Button>
                  <Button type="submit">{label('Save & Assign Task', 'Taak Opslaan & Inplannen')}</Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* GOOGLE CALENDAR INTEGRATION MODAL (UI INTEGRATION POINT) */}
      <AnimatePresence>
        {googleCalendarModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-dark/70 backdrop-blur-xs" onClick={() => setGoogleCalendarModalOpen(false)} />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative w-full max-w-md bg-[#EDE8DF] border border-[#C4BEB3] rounded-2xl p-6 shadow-2xl z-10 space-y-4 text-xs font-body">
              <div className="flex justify-between items-start border-b border-[#D6CFC2] pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-white rounded-xl shadow-xs border border-[#D6CFC2]">
                    <CalendarDays className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-primary text-base leading-tight">Google Calendar Integration</h3>
                    <span className="text-[9px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full uppercase">UI Integration Ready</span>
                  </div>
                </div>
                <button onClick={() => setGoogleCalendarModalOpen(false)} className="p-1 text-dark/40 hover:text-dark"><X className="w-5 h-5" /></button>
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1">
                <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs">
                  <CheckCircle className="w-4 h-4 text-emerald-700" />
                  <span>Google Workspace Account Connected</span>
                </div>
                <p className="text-[10px] text-emerald-800/80 font-mono">Sync Account: planning@vanuitambacht.nl</p>
              </div>

              <div className="space-y-2 bg-white p-3.5 rounded-xl border border-[#D6CFC2]">
                <h4 className="font-bold text-primary uppercase text-[10px] tracking-wider mb-2">Sync Configurations</h4>
                
                <label className="flex items-center justify-between text-xs cursor-pointer py-1 border-b border-[#EDE8DF]">
                  <span className="text-dark/80 font-medium">Sync 6-Week Delivery Deadlines</span>
                  <input type="checkbox" defaultChecked className="accent-primary rounded" />
                </label>

                <label className="flex items-center justify-between text-xs cursor-pointer py-1 border-b border-[#EDE8DF]">
                  <span className="text-dark/80 font-medium">Sync Daily Craftsman Tasks & Install Times</span>
                  <input type="checkbox" defaultChecked className="accent-primary rounded" />
                </label>

                <label className="flex items-center justify-between text-xs cursor-pointer py-1">
                  <span className="text-dark/80 font-medium">Send Email Invites to Clients on Delivery Day</span>
                  <input type="checkbox" defaultChecked className="accent-primary rounded" />
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#D6CFC2]">
                <Button variant="outline" size="sm" onClick={() => setGoogleCalendarModalOpen(false)}>{t('common.cancel')}</Button>
                <Button size="sm" onClick={handleTriggerGoogleCalendarSync} disabled={isSyncingCalendar} className="bg-blue-600 hover:bg-blue-700 text-white font-bold">
                  {isSyncingCalendar ? (
                    <span className="flex items-center gap-1.5">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Syncing...
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5">
                      <RefreshCw className="w-3.5 h-3.5" />
                      Sync Now with Google Agenda
                    </span>
                  )}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ASSIGN PARTNER MODAL */}
      <AnimatePresence>
        {assignPartnerModalProject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-dark/70 backdrop-blur-xs" onClick={() => setAssignPartnerModalProject(null)} />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative w-full max-w-md bg-[#EDE8DF] border border-[#C4BEB3] rounded-2xl p-6 shadow-2xl z-10 space-y-4 text-xs font-body">
              <div className="flex justify-between items-center border-b border-[#D6CFC2] pb-3">
                <h3 className="font-heading font-bold text-primary text-base">Wijs Partner Toe aan Project</h3>
                <button onClick={() => setAssignPartnerModalProject(null)} className="p-1 text-dark/40 hover:text-dark">✕</button>
              </div>

              <div className="space-y-1 bg-white p-3 rounded-xl border border-[#D6CFC2]">
                <p className="font-bold text-dark text-xs">{assignPartnerModalProject.name}</p>
                <p className="text-[10px] text-dark/60">Klant: {assignPartnerModalProject.customer} • Deadline: {assignPartnerModalProject.deadline}</p>
              </div>

              <div className="space-y-2">
                <label className="block font-bold text-dark text-xs">Kies Vakman / Partner:</label>
                <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                  {partners.map(pt => (
                    <div
                      key={pt.id}
                      onClick={() => handleAssignPartnerToProject(assignPartnerModalProject.id, pt.name)}
                      className="p-3 bg-white hover:bg-primary/10 border border-[#D6CFC2] hover:border-primary rounded-xl cursor-pointer transition-all flex justify-between items-center"
                    >
                      <div>
                        <p className="font-bold text-primary">{pt.name}</p>
                        <p className="text-[10px] text-dark/50">{pt.company} ({pt.region})</p>
                      </div>
                      <Badge variant={pt.workload === 'Beschikbaar' ? 'success' : pt.workload === 'Druk' ? 'warning' : 'danger'}>
                        {pt.workload}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* PROJECT DETAILS MODAL */}
      <AnimatePresence>
        {selectedProjectModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-dark/70 backdrop-blur-xs" onClick={() => setSelectedProjectModal(null)} />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative w-full max-w-lg bg-[#EDE8DF] border border-[#C4BEB3] rounded-2xl p-6 shadow-2xl z-10 space-y-4 text-xs font-body">
              <div className="flex justify-between items-center border-b border-[#D6CFC2] pb-3">
                <div>
                  <h3 className="font-heading font-bold text-primary text-base">{selectedProjectModal.name}</h3>
                  <p className="text-[10px] font-mono text-accent">ID: {selectedProjectModal.id}</p>
                </div>
                <button onClick={() => setSelectedProjectModal(null)} className="p-1 text-dark/40 hover:text-dark">✕</button>
              </div>

              <div className="grid grid-cols-2 gap-3 bg-white p-3 rounded-xl border border-[#D6CFC2]">
                <div>
                  <p className="text-[10px] text-dark/50 uppercase font-bold">Klant</p>
                  <p className="font-bold text-dark">{selectedProjectModal.customer}</p>
                </div>
                <div>
                  <p className="text-[10px] text-dark/50 uppercase font-bold">Status</p>
                  <Badge variant={selectedProjectModal.status === 'Completed' ? 'success' : selectedProjectModal.status === 'In Progress' ? 'primary' : 'warning'}>
                    {selectedProjectModal.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-[10px] text-dark/50 uppercase font-bold">Toegewezen Vakman</p>
                  <p className="font-bold text-primary">{selectedProjectModal.partner || '⚠️ Niet toegewezen'}</p>
                </div>
                <div>
                  <p className="text-[10px] text-dark/50 uppercase font-bold">Opleverdeadline</p>
                  <p className="font-mono font-bold text-dark">{selectedProjectModal.deadline}</p>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="secondary" size="sm" onClick={() => setSelectedProjectModal(null)}>Sluiten</Button>
                {(!selectedProjectModal.partner || selectedProjectModal.partner === 'Unassigned') && (
                  <Button variant="primary" size="sm" onClick={() => { setAssignPartnerModalProject(selectedProjectModal); setSelectedProjectModal(null); }}>
                    Wijs Partner Toe →
                  </Button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
