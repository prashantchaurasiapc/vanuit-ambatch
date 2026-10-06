import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, AlertTriangle, CheckCircle2, RefreshCw, Info, Clock, ChevronDown, PanelRight, Calendar, User, MapPin, Phone, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api/apiClient';

const typeColors = {
  'Site Visit': { text: '#46607C', fill: '#EAF0F6', border: '#C3D2E2', short: 'SITE VISIT' },
  'Canopy Build': { text: '#3E6468', fill: '#E3EEEE', border: '#B3CCCB', short: 'BUILD' },
  'Kitchen Delivery': { text: '#9A5530', fill: '#F8E9DE', border: '#E3C1A8', short: 'DELIVERY' },
  'Handover': { text: '#4F6A45', fill: '#E8F0E2', border: '#C3D5B8', short: 'HANDOVER' },
  'Service': { text: '#6E5580', fill: '#F0EAF4', border: '#D5C8E0', short: 'SERVICE' }
};

function mapBackendEventType(eventType) {
  switch (eventType) {
    case 'single_day_delivery': return 'Kitchen Delivery';
    case 'multi_day_bouw': return 'Canopy Build';
    case 'site_survey': return 'Site Visit';
    case 'service_aftercare': return 'Service';
    case 'workshop_production': return 'Handover';
    default: return 'Site Visit';
  }
}

function mapFrontendToBackend(type) {
  switch (type) {
    case 'Kitchen Delivery': return { eventType: 'single_day_delivery', calendarLane: 'delivery_lane' };
    case 'Canopy Build': return { eventType: 'multi_day_bouw', calendarLane: 'bouw_lane' };
    case 'Site Visit': return { eventType: 'site_survey', calendarLane: 'bouw_lane' };
    case 'Service': return { eventType: 'service_aftercare', calendarLane: 'bouw_lane' };
    case 'Handover': return { eventType: 'workshop_production', calendarLane: 'workshop_lane' };
    default: return { eventType: 'site_survey', calendarLane: 'bouw_lane' };
  }
}

export default function Planning() {
  const [activeTab, setActiveTab] = useState('Project Planning');
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [activeFilter, setActiveFilter] = useState('All');
  const [partnerFilter, setPartnerFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeView, setActiveView] = useState('Week');

  // Backend state
  const [rawEvents, setRawEvents] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // New appointment form state
  const [newApptData, setNewApptData] = useState({
    title: '',
    projectId: '',
    partnerId: '',
    type: 'Kitchen Delivery',
    date: '2026-09-30',
    startTime: '09:00',
    endTime: '12:00',
    location: ''
  });

  // Load planning events, tasks, projects, partners
  const loadData = async () => {
    try {
      setLoading(true);
      const [eventsRes, tasksRes, projectsRes, partnersRes] = await Promise.all([
        api.get('/planning/events'),
        api.get('/tasks?limit=50'),
        api.get('/projects?limit=50'),
        api.get('/partners?limit=50')
      ]);

      if (eventsRes.success && Array.isArray(eventsRes.data)) {
        setRawEvents(eventsRes.data);
      }
      if (tasksRes.success && Array.isArray(tasksRes.data)) {
        setTasks(tasksRes.data);
      }
      if (projectsRes.success && Array.isArray(projectsRes.data)) {
        setProjects(projectsRes.data);
      }
      if (partnersRes.success && Array.isArray(partnersRes.data)) {
        setPartners(partnersRes.data);
      }
    } catch (err) {
      console.error('Error loading planning data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Format backend planning events for calendar rendering
  const formattedEvents = rawEvents.map((item) => {
    const evt = item.event;
    const prj = item.project;
    const ptn = item.partner;

    const startDate = new Date(evt.startTime);
    const endDate = new Date(evt.endTime);

    const startUTC = {
      year: startDate.getUTCFullYear(),
      month: startDate.getUTCMonth(),
      date: startDate.getUTCDate(),
      day: startDate.getUTCDay(),
      hours: startDate.getUTCHours(),
      minutes: startDate.getUTCMinutes()
    };

    const endUTC = {
      hours: endDate.getUTCHours(),
      minutes: endDate.getUTCMinutes()
    };

    // Calculate dayIndex for week 40 (Sep 28 – Oct 4, 2026)
    // Mon Sep 28 = 0, Tue Sep 29 = 1, Wed Sep 30 = 2, Thu Oct 1 = 3, Fri Oct 2 = 4, Sat Oct 3 = 5, Sun Oct 4 = 6
    let dayIndex = startUTC.day === 0 ? 6 : startUTC.day - 1;

    // Time calculations
    const startHourDec = startUTC.hours + startUTC.minutes / 60;
    const endHourDec = endUTC.hours + endUTC.minutes / 60;
    const duration = Math.max(endHourDec - startHourDec, 1);

    const topPx = (startHourDec - 7) * 54;
    const heightPx = duration * 54;

    const mappedType = mapBackendEventType(evt.eventType);

    // Customer display name
    let customerName = 'Klant Afspraak';
    if (prj) {
      customerName = `Fam. Valk (${prj.projectNumber})`;
    } else if (evt.location?.includes('Amsterdam') || evt.title?.includes('Tuinkamer')) {
      customerName = 'Sanne Visser';
    } else if (evt.location) {
      customerName = evt.title;
    }

    return {
      id: evt.id,
      eventNumber: evt.eventNumber,
      type: mappedType,
      rawEventType: evt.eventType,
      calendarLane: evt.calendarLane,
      title: evt.title,
      customer: customerName,
      product: prj ? prj.title : evt.title,
      partner: ptn ? (ptn.contactName || ptn.companyName) : 'Bram & Tim',
      partnerCompany: ptn?.companyName,
      partnerId: evt.partnerId,
      date: startDate.toLocaleDateString('nl-NL', { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'UTC' }),
      startTime: `${String(startUTC.hours).padStart(2, '0')}:${String(startUTC.minutes).padStart(2, '0')}`,
      endTime: `${String(endUTC.hours).padStart(2, '0')}:${String(endUTC.minutes).padStart(2, '0')}`,
      left: `calc(${dayIndex} * (100% / 7) + 4px)`,
      width: `calc(100% / 7 - 8px)`,
      top: `${Math.max(0, topPx)}px`,
      height: `${heightPx}px`,
      location: evt.location || 'Nederland',
      address: evt.location || '–',
      contact: prj ? 'Bjorn Valk' : 'Sanne Visser',
      phone: prj ? '+31 6 11223344' : '+31 6 98765432',
      projectRef: prj ? prj.projectNumber : evt.eventNumber,
      status: evt.status === 'confirmed' ? 'Confirmed' : evt.status === 'completed' ? 'Completed' : 'Scheduled',
      progress: prj ? ['site_visit', 'design', 'build'] : ['site_survey'],
      isMultiDay: evt.eventType === 'multi_day_bouw' || evt.calendarLane === 'bouw_lane' && duration > 8,
      raw: item
    };
  });

  // Filter events
  const filteredEvents = formattedEvents.filter((appt) => {
    if (activeFilter !== 'All' && appt.type !== activeFilter) return false;
    if (partnerFilter !== 'All' && appt.partnerId !== partnerFilter) return false;
    if (statusFilter !== 'All' && appt.status.toLowerCase() !== statusFilter.toLowerCase()) return false;
    return true;
  });

  // Single-day grid appointments vs ongoing builds
  const gridAppointments = filteredEvents.filter((e) => !e.isMultiDay);
  const ongoingBuilds = filteredEvents.filter((e) => e.isMultiDay);

  // Type counts
  const countKitchen = formattedEvents.filter((e) => e.type === 'Kitchen Delivery').length;
  const countCanopy = formattedEvents.filter((e) => e.type === 'Canopy Build').length;
  const countSiteVisit = formattedEvents.filter((e) => e.type === 'Site Visit').length;
  const countHandover = formattedEvents.filter((e) => e.type === 'Handover').length;
  const countService = formattedEvents.filter((e) => e.type === 'Service').length;

  // Handle saving new appointment to backend
  const handleSave = async () => {
    if (!newApptData.date || !newApptData.startTime) {
      alert('Vul a.u.b. een datum en begintijd in.');
      return;
    }

    try {
      setSaving(true);
      const { eventType, calendarLane } = mapFrontendToBackend(newApptData.type);

      const startDateTime = `${newApptData.date}T${newApptData.startTime}:00.000Z`;
      const endDateTime = `${newApptData.date}T${newApptData.endTime || '12:00'}:00.000Z`;

      const payload = {
        projectId: newApptData.projectId ? newApptData.projectId : null,
        partnerId: newApptData.partnerId ? newApptData.partnerId : null,
        eventType,
        calendarLane,
        title: newApptData.title.trim() || `${newApptData.type} - Afspraak`,
        startTime: startDateTime,
        endTime: endDateTime,
        location: newApptData.location || 'Nederland',
        status: 'scheduled'
      };

      const res = await api.post('/planning/events', payload);
      if (res.success) {
        await loadData();
        setIsModalOpen(false);
        setNewApptData({
          title: '',
          projectId: '',
          partnerId: '',
          type: 'Kitchen Delivery',
          date: '2026-09-30',
          startTime: '09:00',
          endTime: '12:00',
          location: ''
        });
      } else {
        alert(res.error?.message || 'Er is een fout opgetreden bij het opslaan.');
      }
    } catch (err) {
      console.error('Failed to create planning event:', err);
      alert('Opslaan mislukt. Controleer de velden.');
    } finally {
      setSaving(false);
    }
  };

  // Toggle task completion
  const handleToggleTask = async (taskId, currentStatus) => {
    try {
      const isCompleted = currentStatus === 'completed';
      const res = await api.patch(`/tasks/${taskId}/status`, {
        completed: !isCompleted
      });
      if (res.success) {
        setTasks((prev) =>
          prev.map((t) =>
            t.id === taskId
              ? { ...t, status: !isCompleted ? 'completed' : 'pending' }
              : t
          )
        );
      }
    } catch (err) {
      console.error('Failed to update task status:', err);
    }
  };

  // Grid layout parameters
  const hours = Array.from({ length: 12 }, (_, i) => i + 7); // 07:00 to 18:00
  const daysData = [
    { name: 'MON', num: '28', month: 'sep' },
    { name: 'TUE', num: '29', month: 'sep' },
    { name: 'WED', num: '30', month: 'sep' },
    { name: 'THU', num: '1', month: 'oct' },
    { name: 'FRI', num: '2', month: 'oct' },
    { name: 'SAT', num: '3', month: 'oct' },
    { name: 'SUN', num: '4', month: 'oct' },
  ];

  return (
    <div className="flex h-full w-full bg-[#F7F4EE] font-body text-[#2A2925] overflow-hidden">
      {/* Main Content Area */}
      <div className="flex-1 min-w-0 overflow-y-auto transition-all duration-300 pl-8 pr-4 pt-1 pb-4">
        {/* Title, Tabs & New Planning Button */}
        <div className="flex justify-between items-end border-b border-[#E6E0D4] pb-0">
          <div className="flex flex-col justify-end">
            <h1 className="text-[52px] leading-[1.1] font-heading font-normal text-[#2A2925] tracking-tight">Planning</h1>
            <div className="flex items-center gap-6 mt-1">
              <button
                onClick={() => setActiveTab('Project Planning')}
                className={`pb-2.5 text-[14px] font-bold border-b-[3px] transition-colors ${
                  activeTab === 'Project Planning'
                    ? 'border-[#3E4A3D] text-[#2A2925]'
                    : 'border-transparent text-[#736E64] hover:text-[#2A2925]'
                }`}
              >
                Project Planning
              </button>
              <button
                onClick={() => setActiveTab('Task Agenda')}
                className={`pb-2.5 text-[14px] font-bold border-b-[3px] transition-colors flex items-center gap-2 ${
                  activeTab === 'Task Agenda'
                    ? 'border-[#3E4A3D] text-[#2A2925]'
                    : 'border-transparent text-[#736E64] hover:text-[#2A2925]'
                }`}
              >
                Task Agenda Bram & Tim{' '}
                <span className="bg-[#E6E0D4] text-[#58534A] text-[10px] px-2 py-0.5 rounded-full ml-1">
                  {tasks.filter((t) => t.status !== 'completed').length} open
                </span>
              </button>
            </div>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-[#3E4A3D] text-white px-5 py-2.5 rounded-xl text-[14px] font-bold hover:bg-[#2A3329] active:scale-95 transition-all flex items-center gap-1.5 mb-2 shadow-sm"
          >
            <span className="text-xl leading-none font-normal">+</span> {activeTab === 'Project Planning' ? 'New planning' : 'New task'}
          </button>
        </div>

        {/* Tab 1: Project Planning */}
        {activeTab === 'Project Planning' ? (
          <div className="w-full">
            {/* Toolbar */}
            <div className="flex justify-between items-center mb-4 mt-2 pt-1">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <button className="px-3 py-1.5 bg-transparent border border-[#E6E0D4] rounded-xl hover:bg-white text-[#2A2925] transition-colors">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button className="px-4 py-1.5 bg-transparent border border-[#E6E0D4] rounded-xl text-[13px] font-bold hover:bg-white text-[#2A2925] transition-colors">
                    Today
                  </button>
                  <button className="px-3 py-1.5 bg-transparent border border-[#E6E0D4] rounded-xl hover:bg-white text-[#2A2925] transition-colors">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
                <div className="text-[22px] font-heading font-medium text-[#2A2925] flex items-center gap-3 whitespace-nowrap">
                  Sep 28 – Oct 4
                  <span className="text-[10px] font-body bg-transparent border border-[#E6E0D4] text-[#736E64] px-1.5 py-0.5 rounded uppercase font-bold">
                    WEEK 40
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <select
                    value={partnerFilter}
                    onChange={(e) => setPartnerFilter(e.target.value)}
                    className="appearance-none text-[13px] bg-transparent border border-[#E6E0D4] rounded-xl pl-4 pr-8 py-2 font-bold text-[#2A2925] outline-none cursor-pointer hover:bg-white transition-colors"
                  >
                    <option value="All">Partner All</option>
                    {partners.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.companyName || p.contactName}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-[#736E64] pointer-events-none" />
                </div>
                <div className="relative">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="appearance-none text-[13px] bg-transparent border border-[#E6E0D4] rounded-xl pl-4 pr-8 py-2 font-bold text-[#2A2925] outline-none cursor-pointer hover:bg-white transition-colors"
                  >
                    <option value="All">Status All</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="completed">Completed</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-[#736E64] pointer-events-none" />
                </div>
                <div className="flex bg-[#EBE7DF] border border-[#E6E0D4] rounded-xl p-1 text-[13px] font-bold">
                  <button onClick={() => setActiveView('Day')} className={`px-4 py-1 rounded-lg transition-colors ${activeView === 'Day' ? 'bg-white text-[#2A2925] shadow-sm border border-[#E6E0D4]' : 'text-[#736E64] hover:text-[#2A2925]'}`}>Day</button>
                  <button onClick={() => setActiveView('Week')} className={`px-4 py-1 rounded-lg transition-colors ${activeView === 'Week' ? 'bg-white text-[#2A2925] shadow-sm border border-[#E6E0D4]' : 'text-[#736E64] hover:text-[#2A2925]'}`}>Week</button>
                  <button onClick={() => setActiveView('Month')} className={`px-4 py-1 rounded-lg transition-colors ${activeView === 'Month' ? 'bg-white text-[#2A2925] shadow-sm border border-[#E6E0D4]' : 'text-[#736E64] hover:text-[#2A2925]'}`}>Month</button>
                  <button onClick={() => setActiveView('Timeline')} className={`px-4 py-1 rounded-lg transition-colors ${activeView === 'Timeline' ? 'bg-white text-[#2A2925] shadow-sm border border-[#E6E0D4]' : 'text-[#736E64] hover:text-[#2A2925]'}`}>Timeline</button>
                </div>
              </div>
            </div>

            {/* Type Chips */}
            <div className="flex justify-between items-center mb-5 w-full">
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setActiveFilter(activeFilter === 'Kitchen Delivery' ? 'All' : 'Kitchen Delivery')}
                  className={`flex items-center gap-2 border rounded-full px-3 py-1.5 text-[11px] font-bold transition-colors whitespace-nowrap ${
                    activeFilter === 'Kitchen Delivery' ? 'bg-white border-[#2A2925] shadow-sm' : 'bg-transparent border-[#E6E0D4] hover:bg-white'
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-[3px]" style={{ backgroundColor: '#9A5530' }}></span>
                  Kitchen delivery <span className="text-[#736E64] font-normal ml-0.5">{countKitchen}</span>
                </button>
                <button
                  onClick={() => setActiveFilter(activeFilter === 'Canopy Build' ? 'All' : 'Canopy Build')}
                  className={`flex items-center gap-2 border rounded-full px-3 py-1.5 text-[11px] font-bold transition-colors whitespace-nowrap ${
                    activeFilter === 'Canopy Build' ? 'bg-white border-[#2A2925] shadow-sm' : 'bg-transparent border-[#E6E0D4] hover:bg-white'
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-[3px]" style={{ backgroundColor: '#3E6468' }}></span>
                  Canopy build <span className="text-[#736E64] font-normal ml-0.5">{countCanopy}</span>
                </button>
                <button
                  onClick={() => setActiveFilter(activeFilter === 'Site Visit' ? 'All' : 'Site Visit')}
                  className={`flex items-center gap-2 border rounded-full px-3 py-1.5 text-[11px] font-bold transition-colors whitespace-nowrap ${
                    activeFilter === 'Site Visit' ? 'bg-white border-[#2A2925] shadow-sm' : 'bg-transparent border-[#E6E0D4] hover:bg-white'
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-[3px]" style={{ backgroundColor: '#46607C' }}></span>
                  Site visit <span className="text-[#736E64] font-normal ml-0.5">{countSiteVisit}</span>
                </button>
                <button
                  onClick={() => setActiveFilter(activeFilter === 'Handover' ? 'All' : 'Handover')}
                  className={`flex items-center gap-2 border rounded-full px-3 py-1.5 text-[11px] font-bold transition-colors whitespace-nowrap ${
                    activeFilter === 'Handover' ? 'bg-white border-[#2A2925] shadow-sm' : 'bg-transparent border-[#E6E0D4] hover:bg-white'
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-[3px]" style={{ backgroundColor: '#4F6A45' }}></span>
                  Handover <span className="text-[#736E64] font-normal ml-0.5">{countHandover}</span>
                </button>
                <button
                  onClick={() => setActiveFilter(activeFilter === 'Service' ? 'All' : 'Service')}
                  className={`flex items-center gap-2 border rounded-full px-3 py-1.5 text-[11px] font-bold transition-colors whitespace-nowrap ${
                    activeFilter === 'Service' ? 'bg-white border-[#2A2925] shadow-sm' : 'bg-transparent border-[#E6E0D4] hover:bg-white'
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-[3px]" style={{ backgroundColor: '#6E5580' }}></span>
                  Service <span className="text-[#736E64] font-normal ml-0.5">{countService}</span>
                </button>
              </div>
              <div className="flex gap-2 pl-4 shrink-0">
                <button className="flex items-center gap-1.5 bg-[#F6F4EB] border border-[#DFD8C4] text-[#7A6B48] rounded-full px-3 py-1.5 text-[11px] font-bold whitespace-nowrap">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-[#4B7355]" /> {formattedEvents.length} active events
                </button>
              </div>
            </div>

            {/* Calendar Card & Sidebar Wrapper */}
            <div className="flex gap-4 w-full mb-8 relative items-stretch">
              {/* Calendar Card */}
              <div className="flex-1 min-w-0 bg-[#F9F8F6] border border-[#E6E0D4] rounded-xl overflow-hidden shadow-sm flex flex-col">
                {/* Header row with Days */}
                <div className="flex border-b border-[#E6E0D4] bg-[#F9F8F6] shrink-0">
                  <div className="w-16 shrink-0 border-r border-[#E6E0D4]"></div>
                  {daysData.map((d, i) => (
                    <div
                      key={i}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 border-r border-[#E6E0D4] last:border-0 relative ${
                        i === 1 ? 'bg-white' : ''
                      }`}
                    >
                      {i === 1 && <div className="absolute top-0 left-0 right-0 h-[3px] bg-[#3E4A3D]"></div>}
                      <span className={`text-[10px] font-bold ${i === 1 ? 'text-[#2A2925]' : 'text-[#736E64]'}`}>{d.name}</span>
                      <span className="text-[24px] font-heading leading-none text-[#2A2925]">{d.num}</span>
                      <span className="text-[11px] font-heading font-medium text-[#736E64]">{d.month}</span>
                    </div>
                  ))}
                </div>

                {/* Multi-day Builds Lane */}
                <div className="flex border-b border-[#E6E0D4] bg-[#F9F8F6] shrink-0">
                  <div className="w-16 shrink-0 flex items-center justify-center leading-none z-10">
                    <span className="text-[9px] uppercase font-bold text-[#736E64] text-center">
                      BUILD<br />
                      <span className="text-[8px] font-normal normal-case">ongoing</span>
                    </span>
                  </div>

                  <div className="flex-1 relative p-1.5 min-h-[50px] flex items-center">
                    {ongoingBuilds.length === 0 ? (
                      <span className="text-[11px] text-[#8C877D] italic pl-3">Geen meerdaagse bouw deze week ingepland</span>
                    ) : (
                      ongoingBuilds.map((b) => (
                        <div
                          key={b.id}
                          onClick={() => setSelectedAppointment(b)}
                          className={`absolute left-[0%] right-[30%] top-1.5 h-[26px] rounded bg-[#E3EEEE] border border-[#B3CCCB] flex justify-between items-center px-2 cursor-pointer shadow-sm hover:brightness-95 transition-all ${
                            selectedAppointment?.id === b.id ? 'ring-2 ring-[#3E4A3D] ring-offset-[1.5px] z-30' : 'z-10'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-[9.5px] font-bold text-[#3E6468]">BUILD</span>
                            <span className="text-[11px] font-bold text-[#2A2925]">{b.customer}</span>
                            <span className="text-[11px] text-[#58534A] truncate">{b.product}</span>
                          </div>
                          <span className="text-[10px] text-[#58534A]">{b.partner}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Time Grid with relative height */}
                <div className="w-full relative min-h-[648px] flex-1">
                  {/* Background Grid Lines */}
                  <div className="flex w-full h-full absolute inset-0 pointer-events-none">
                    <div className="w-16 shrink-0 border-r border-[#E6E0D4] bg-[#FFFEFB] z-10">
                      {hours.map((h) => (
                        <div key={h} className="h-[54px] flex items-start justify-center pt-1.5 relative border-b border-transparent">
                          <span className="text-[10px] font-body text-[#736E64]">{h.toString().padStart(2, '0')}:00</span>
                        </div>
                      ))}
                    </div>
                    {/* Vertical & Horizontal lines for days */}
                    <div className="flex-1 flex">
                      {daysData.map((d, i) => (
                        <div key={i} className={`flex-1 border-r border-[#E6E0D4] last:border-0 relative ${i === 1 ? 'bg-white' : ''}`}>
                          {hours.map((h) => (
                            <div key={h} className="h-[54px] border-b border-[#E6E0D4] opacity-50"></div>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Appointments Overlay */}
                  <div className="absolute inset-0 z-20 flex">
                    <div className="w-16 shrink-0 pointer-events-none"></div>
                    <div className="flex-1 flex relative">
                      {gridAppointments.map((appt) => {
                        const styleConfig = typeColors[appt.type] || typeColors['Site Visit'];
                        const isSelected = selectedAppointment?.id === appt.id;

                        return (
                          <div
                            key={appt.id}
                            onClick={() => setSelectedAppointment(appt)}
                            className={`absolute rounded-lg p-2.5 cursor-pointer shadow-sm flex flex-col overflow-hidden hover:brightness-95 transition-all ${
                              isSelected ? 'ring-2 ring-[#3E4A3D] ring-offset-[1.5px] ring-offset-[#FFFEFB] z-30' : 'z-10'
                            }`}
                            style={{
                              left: appt.left,
                              width: appt.width,
                              top: appt.top,
                              height: appt.height,
                              backgroundColor: styleConfig.fill,
                              border: `1px solid ${styleConfig.border}`
                            }}
                          >
                            <div className="flex justify-between items-start mb-1">
                              <span
                                className="text-[9.5px] font-bold uppercase tracking-wider"
                                style={{ color: styleConfig.text }}
                              >
                                {styleConfig.short}
                              </span>
                              <CheckCircle2 className="w-3.5 h-3.5 text-[#4B7355] shrink-0" />
                            </div>
                            <span className="text-[12px] font-bold text-[#2A2925] leading-snug mb-0.5 truncate">
                              {appt.customer}
                            </span>
                            <span className="text-[10px] text-[#736E64] leading-tight truncate mb-0.5">
                              {appt.product}
                            </span>
                            <span className="text-[9.5px] text-[#736E64] font-medium mt-auto">
                              {appt.startTime}–{appt.endTime} · {appt.partner}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Card Footer Legend */}
                <div className="border-t border-[#E6E0D4] bg-[#FFFEFB] py-2.5 px-4 flex justify-between items-center text-[10.5px] text-[#736E64] shrink-0">
                  <div className="flex items-center gap-5">
                    <span className="font-normal text-[#58534A]">Status:</span>
                    <div className="flex items-center gap-1.5 text-[#4B7355] font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Confirmed</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[#6E5580] font-bold">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Scheduled</span>
                    </div>
                  </div>
                  <div>
                    Klik op een afspraak voor gedetailleerde project- en partnerinformatie
                  </div>
                </div>
              </div>

              {/* Right Sidebar: Details Panel */}
              {!selectedAppointment ? (
                <div className="shrink-0 self-stretch flex flex-col w-10">
                  <div className="w-full flex-1 rounded-full border border-[#E6E0D4] bg-[#FFFEFB] shadow-sm flex flex-col items-center py-4 overflow-hidden">
                    <button className="w-8 h-8 shrink-0 rounded-full border border-[#E6E0D4] bg-[#F7F4EE] flex items-center justify-center hover:bg-white transition-colors">
                      <PanelRight className="w-4 h-4 text-[#736E64]" />
                    </button>
                    <span
                      className="text-[#736E64] text-[11.5px] whitespace-nowrap tracking-wide mt-6"
                      style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
                    >
                      Project details · selecteer een afspraak
                    </span>
                  </div>
                </div>
              ) : (
                <AnimatePresence>
                  <motion.div
                    key={selectedAppointment.id}
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 380, opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    className="shrink-0 w-[380px] flex flex-col bg-[#FFFEFB] border border-[#E6E0D4] rounded-2xl shadow-sm overflow-hidden"
                  >
                    {/* Header */}
                    <div className="p-5 border-b border-[#E6E0D4] flex justify-between items-start shrink-0">
                      <div>
                        <div className="flex items-center gap-2.5 mb-2.5">
                          <span
                            className="text-[10px] font-bold px-2.5 py-0.5 rounded-md uppercase tracking-wide"
                            style={{
                              backgroundColor: typeColors[selectedAppointment.type]?.fill || '#F0EAF4',
                              color: typeColors[selectedAppointment.type]?.text || '#6E5580',
                              border: `1px solid ${typeColors[selectedAppointment.type]?.border || '#D5C8E0'}`
                            }}
                          >
                            {typeColors[selectedAppointment.type]?.short || selectedAppointment.type}
                          </span>
                          <span className="text-[11px] font-mono text-[#736E64] font-bold">
                            {selectedAppointment.projectRef}
                          </span>
                        </div>
                        <h2 className="text-[22px] font-heading font-bold text-[#2A2925] mb-1 leading-tight">
                          {selectedAppointment.customer}
                        </h2>
                        {selectedAppointment.product && (
                          <p className="text-[13px] text-[#58534A] leading-snug">{selectedAppointment.product}</p>
                        )}
                        {selectedAppointment.location && (
                          <p className="text-[13px] text-[#736E64] mt-0.5 flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-[#8C877D]" /> {selectedAppointment.location}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => setSelectedAppointment(null)}
                        className="p-1.5 hover:bg-[#F7F4EE] rounded-md border border-[#E6E0D4] mt-1 transition-colors"
                      >
                        <ChevronRight className="w-4 h-4 text-[#58534A]" />
                      </button>
                    </div>

                    {/* Scrollable Body */}
                    <div className="p-5 overflow-y-auto flex-1 min-h-0 space-y-4">
                      {/* Details Table */}
                      <div className="space-y-2.5 text-[13px] border-b border-[#E6E0D4] pb-4">
                        <div className="flex items-start justify-between">
                          <span className="w-28 text-[#736E64] shrink-0">Event code</span>
                          <span className="font-mono font-medium text-[#2A2925]">{selectedAppointment.eventNumber}</span>
                        </div>
                        <div className="flex items-start justify-between">
                          <span className="w-28 text-[#736E64] shrink-0">Datum</span>
                          <span className="font-medium text-[#2A2925]">{selectedAppointment.date}</span>
                        </div>
                        <div className="flex items-start justify-between">
                          <span className="w-28 text-[#736E64] shrink-0">Tijd</span>
                          <span className="font-mono font-medium text-[#2A2925]">
                            {selectedAppointment.startTime}–{selectedAppointment.endTime}
                          </span>
                        </div>
                        <div className="flex items-start justify-between">
                          <span className="w-28 text-[#736E64] shrink-0">Partner</span>
                          <span className="font-medium text-[#2A2925] text-right">
                            {selectedAppointment.partnerCompany || selectedAppointment.partner}
                          </span>
                        </div>
                        <div className="flex items-start justify-between">
                          <span className="w-28 text-[#736E64] shrink-0">Status</span>
                          <span className="font-bold text-[#4B7355]">{selectedAppointment.status}</span>
                        </div>
                      </div>

                      {/* Project Progress */}
                      {selectedAppointment.progress && (() => {
                        const steps = [
                          { key: 'site_survey', label: 'Inmeten & Survey' },
                          { key: 'design', label: 'Offerte & Ontwerp' },
                          { key: 'build', label: 'Montage & Bouw' },
                          { key: 'handover', label: 'Oplevering' },
                        ];
                        const progress = selectedAppointment.progress;
                        return (
                          <div>
                            <h4 className="text-[10px] font-bold text-[#736E64] uppercase tracking-widest mb-3">
                              PROJECT STATUS
                            </h4>
                            <div className="space-y-0">
                              {steps.map((step, idx) => {
                                const isDone = progress.includes(step.key);
                                return (
                                  <div key={step.key} className="flex items-stretch gap-3">
                                    <div className="flex flex-col items-center w-3">
                                      <div
                                        className={`w-3 h-3 rounded-full shrink-0 mt-0.5 ${
                                          isDone ? 'bg-[#4B7355]' : 'border border-[#D6CFC2] bg-white'
                                        }`}
                                      ></div>
                                      {idx < steps.length - 1 && (
                                        <div
                                          className={`w-px flex-1 my-1 ${
                                            isDone ? 'bg-[#4B7355]' : 'bg-[#E6E0D4]'
                                          }`}
                                        ></div>
                                      )}
                                    </div>
                                    <div className="flex-1 flex justify-between items-start pb-2.5 text-[12.5px]">
                                      <span className={isDone ? 'font-bold text-[#2A2925]' : 'text-[#736E64]'}>
                                        {step.label}
                                      </span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })()}

                      {/* Contact & Address */}
                      <div className="border-t border-[#E6E0D4] pt-3.5 space-y-2 text-[12.5px]">
                        <div className="flex items-start justify-between">
                          <span className="w-24 text-[#736E64] shrink-0">Klant</span>
                          <span className="font-medium text-[#2A2925] text-right">
                            {selectedAppointment.contact} · {selectedAppointment.phone}
                          </span>
                        </div>
                        <div className="flex items-start justify-between">
                          <span className="w-24 text-[#736E64] shrink-0">Adres</span>
                          <span className="font-medium text-[#2A2925] text-right">
                            {selectedAppointment.address}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Footer Buttons */}
                    <div className="p-4 border-t border-[#E6E0D4] flex gap-2 shrink-0 bg-[#FFFEFB] mt-auto">
                      <button
                        onClick={() => setSelectedAppointment(null)}
                        className="flex-1 py-2 border border-[#D6CFC2] rounded-xl text-[13px] font-bold bg-white hover:bg-[#F7F4EE] text-[#2A2925] transition-colors"
                      >
                        Sluiten
                      </button>
                    </div>
                  </motion.div>
                </AnimatePresence>
              )}
            </div>
          </div>
        ) : (
          /* Tab 2: Task Agenda */
          <div className="flex-1 flex flex-col pr-4">
            <div className="flex justify-between items-center mb-5 mt-2 pt-1">
              <div className="flex items-center gap-4">
                <div className="text-[22px] font-heading font-medium text-[#2A2925] flex items-center gap-3 whitespace-nowrap">
                  Overzicht Taken
                  <span className="text-[10px] font-body bg-transparent border border-[#E6E0D4] text-[#736E64] px-1.5 py-0.5 rounded uppercase font-bold">
                    {tasks.length} TOTAL
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 min-h-0">
              {/* Active Tasks Column */}
              <div className="bg-[#FFFEFB] border border-[#E6E0D4] rounded-[14px] flex flex-col overflow-hidden shadow-sm">
                <div className="p-5 border-b border-[#E6E0D4] flex justify-between items-center shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#3E4A3D] text-white flex items-center justify-center text-[11px] font-bold tracking-wider">
                      OP
                    </div>
                    <span className="font-heading text-[20px] font-medium text-[#2A2925]">Openstaande Taken</span>
                  </div>
                  <span className="text-[13px] text-[#736E64] font-medium">
                    {tasks.filter((t) => t.status !== 'completed').length} open
                  </span>
                </div>
                <div className="p-5 overflow-y-auto space-y-4">
                  {tasks.filter((t) => t.status !== 'completed').length === 0 ? (
                    <p className="text-sm text-[#736E64] italic">Geen openstaande taken.</p>
                  ) : (
                    tasks
                      .filter((t) => t.status !== 'completed')
                      .map((task) => (
                        <div
                          key={task.id}
                          className="flex items-start justify-between p-3 rounded-xl border border-[#E6E0D4] hover:bg-[#FAF8F5] transition-colors"
                        >
                          <div className="flex items-start gap-3">
                            <input
                              type="checkbox"
                              checked={false}
                              onChange={() => handleToggleTask(task.id, task.status)}
                              className="mt-1 w-4 h-4 rounded border-[#D6CFC2] cursor-pointer"
                            />
                            <div>
                              <p className="text-[13.5px] font-medium text-[#2A2925]">{task.title}</p>
                              <div className="flex items-center gap-2 mt-1 text-[11px] text-[#736E64]">
                                <span className="font-mono font-bold">{task.taskNumber}</span>
                                {task.dueDate && <span>· Vervaldatum: {task.dueDate}</span>}
                              </div>
                            </div>
                          </div>
                          <span
                            className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                              task.priority === 'high'
                                ? 'bg-[#FBF0EC] text-[#A13C28]'
                                : 'bg-[#EAF0F6] text-[#46607C]'
                            }`}
                          >
                            {task.priority || 'medium'}
                          </span>
                        </div>
                      ))
                  )}
                </div>
              </div>

              {/* Completed Tasks Column */}
              <div className="bg-[#FFFEFB] border border-[#E6E0D4] rounded-[14px] flex flex-col overflow-hidden shadow-sm">
                <div className="p-5 border-b border-[#E6E0D4] flex justify-between items-center shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#8A7961] text-white flex items-center justify-center text-[11px] font-bold tracking-wider">
                      OK
                    </div>
                    <span className="font-heading text-[20px] font-medium text-[#2A2925]">Afgerond</span>
                  </div>
                  <span className="text-[13px] text-[#736E64] font-medium">
                    {tasks.filter((t) => t.status === 'completed').length} afgerond
                  </span>
                </div>
                <div className="p-5 overflow-y-auto space-y-4">
                  {tasks.filter((t) => t.status === 'completed').length === 0 ? (
                    <p className="text-sm text-[#736E64] italic">Nog geen taken afgerond.</p>
                  ) : (
                    tasks
                      .filter((t) => t.status === 'completed')
                      .map((task) => (
                        <div
                          key={task.id}
                          className="flex items-start justify-between p-3 rounded-xl border border-[#E6E0D4] bg-[#FAF8F5] opacity-75"
                        >
                          <div className="flex items-start gap-3">
                            <input
                              type="checkbox"
                              checked={true}
                              onChange={() => handleToggleTask(task.id, task.status)}
                              className="mt-1 w-4 h-4 rounded border-[#D6CFC2] cursor-pointer"
                            />
                            <div>
                              <p className="text-[13.5px] font-medium text-[#736E64] line-through">{task.title}</p>
                              <div className="flex items-center gap-2 mt-1 text-[11px] text-[#8C877D]">
                                <span className="font-mono">{task.taskNumber}</span>
                              </div>
                            </div>
                          </div>
                          <CheckCircle2 className="w-4 h-4 text-[#4B7355]" />
                        </div>
                      ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal for "New planning" */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-[#F7F4EE] rounded-2xl border border-[#E6E0D4] shadow-xl w-[520px] overflow-hidden"
            >
              <div className="p-5 border-b border-[#E6E0D4] flex justify-between items-center bg-[#FFFEFB]">
                <h2 className="text-xl font-heading font-bold text-[#2A2925]">Nieuwe Afspraak Inplannen</h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#F7F4EE] border border-transparent hover:border-[#E6E0D4] transition-colors"
                >
                  <span className="text-[#58534A] font-bold">✕</span>
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#58534A] mb-1">Titel / Omschrijving</label>
                  <input
                    type="text"
                    value={newApptData.title}
                    onChange={(e) => setNewApptData({ ...newApptData, title: e.target.value })}
                    placeholder="bijv. Keuken Levering Den Haag"
                    className="w-full bg-white border border-[#E6E0D4] rounded-lg px-3 py-2 text-sm text-[#2A2925] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#58534A] mb-1">Koppel Project (optioneel)</label>
                  <select
                    value={newApptData.projectId}
                    onChange={(e) => setNewApptData({ ...newApptData, projectId: e.target.value })}
                    className="w-full bg-white border border-[#E6E0D4] rounded-lg px-3 py-2 text-sm text-[#2A2925] outline-none"
                  >
                    <option value="">Geen gekoppeld project</option>
                    {projects.map((prj) => (
                      <option key={prj.id} value={prj.id}>
                        {prj.projectNumber} · {prj.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#58534A] mb-1">Uitvoerende Partner</label>
                  <select
                    value={newApptData.partnerId}
                    onChange={(e) => setNewApptData({ ...newApptData, partnerId: e.target.value })}
                    className="w-full bg-white border border-[#E6E0D4] rounded-lg px-3 py-2 text-sm text-[#2A2925] outline-none"
                  >
                    <option value="">Geen partner (Interne regie)</option>
                    {partners.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.companyName || p.contactName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#58534A] mb-1">Type Afspraak</label>
                    <select
                      value={newApptData.type}
                      onChange={(e) => setNewApptData({ ...newApptData, type: e.target.value })}
                      className="w-full bg-white border border-[#E6E0D4] rounded-lg px-3 py-2 text-sm text-[#2A2925] outline-none"
                    >
                      <option value="Kitchen Delivery">Kitchen Delivery</option>
                      <option value="Site Visit">Site Visit</option>
                      <option value="Canopy Build">Canopy Build</option>
                      <option value="Handover">Handover</option>
                      <option value="Service">Service</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#58534A] mb-1">Locatie</label>
                    <input
                      type="text"
                      value={newApptData.location}
                      onChange={(e) => setNewApptData({ ...newApptData, location: e.target.value })}
                      placeholder="bijv. Den Haag of Utrecht"
                      className="w-full bg-white border border-[#E6E0D4] rounded-lg px-3 py-2 text-sm text-[#2A2925] outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#58534A] mb-1">Datum</label>
                    <input
                      type="date"
                      value={newApptData.date}
                      onChange={(e) => setNewApptData({ ...newApptData, date: e.target.value })}
                      className="w-full bg-white border border-[#E6E0D4] rounded-lg px-3 py-2 text-sm text-[#2A2925] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#58534A] mb-1">Starttijd</label>
                    <input
                      type="time"
                      value={newApptData.startTime}
                      onChange={(e) => setNewApptData({ ...newApptData, startTime: e.target.value })}
                      className="w-full bg-white border border-[#E6E0D4] rounded-lg px-3 py-2 text-sm text-[#2A2925] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#58534A] mb-1">Eindtijd</label>
                    <input
                      type="time"
                      value={newApptData.endTime}
                      onChange={(e) => setNewApptData({ ...newApptData, endTime: e.target.value })}
                      className="w-full bg-white border border-[#E6E0D4] rounded-lg px-3 py-2 text-sm text-[#2A2925] outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-[#E6E0D4] bg-[#FFFEFB] flex justify-end gap-3">
                <button
                  onClick={() => setIsModalOpen(false)}
                  disabled={saving}
                  className="px-4 py-2 rounded-lg text-sm font-bold text-[#58534A] hover:bg-[#F7F4EE] transition-colors"
                >
                  Annuleren
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-5 py-2 bg-[#3E4A3D] text-white rounded-lg text-sm font-bold hover:bg-[#2A3329] transition-colors disabled:opacity-50"
                >
                  {saving ? 'Opslaan...' : 'Opslaan'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
