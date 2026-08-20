import React, { useState, useEffect } from 'react';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import { Calendar as CalendarIcon, Clock, CheckCircle2, Circle, Plus, Filter, MapPin, User, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';

const DEFAULT_EVENTS = [
  {
    id: 1,
    titleNL: 'Inmeten & Locatie Inspectie Luxe Buitenkeuken',
    titleEN: 'Site Measurement & Inspection Luxury Outdoor Kitchen',
    client: 'Bjorn Valk',
    location: 'Keizersgracht 420, Amsterdam',
    date: '2026-08-10',
    time: '09:00 - 11:30',
    type: 'Site Visit',
    typeNL: 'Locatiebezoek',
    typeEN: 'Site Visit',
    status: 'Upcoming',
    statusNL: 'Aankomend',
    statusEN: 'Upcoming',
    notesNL: 'Controleer uitsparing waterleiding en Kamado BBQ elektra op locatie.',
    notesEN: 'Verify water pipe cutout and Kamado BBQ electrical supply on-site.'
  },
  {
    id: 2,
    titleNL: 'Levering Massief Teakhout & Zwart Beton Werkblad',
    titleEN: 'Delivery Solid Teak Wood & Black Concrete Worktop',
    client: 'John Miller',
    location: 'Werkplaats Hoek Bouw, Utrecht',
    date: '2026-08-12',
    time: '13:00 - 15:00',
    type: 'Delivery',
    typeNL: 'Oplevering',
    typeEN: 'Delivery',
    status: 'Upcoming',
    statusNL: 'Aankomend',
    statusEN: 'Upcoming',
    notesNL: 'Levering door houtleverancier Houtman B.V. Controleer houtvochtigheid.',
    notesEN: 'Delivery by timber supplier Houtman B.V. Check wood moisture level.'
  },
  {
    id: 3,
    titleNL: 'Montage & Plaatsing Buitenkeuken in Tuin',
    titleEN: 'Assembly & Installation Outdoor Kitchen in Garden',
    client: 'Sanne Visser',
    location: 'Kerkstraat 88, Rotterdam',
    date: '2026-08-15',
    time: '08:30 - 17:00',
    type: 'Assembly',
    typeNL: 'Montage',
    typeEN: 'Assembly',
    status: 'Upcoming',
    statusNL: 'Aankomend',
    statusEN: 'Upcoming',
    notesNL: 'Plaatsing teakhouten frame en stellen beton cire werkblad.',
    notesEN: 'Installation of teak wood frame and leveling concrete worktop.'
  },
  {
    id: 4,
    titleNL: 'Eindinspectie & Oplevering Overkapping',
    titleEN: 'Final Inspection & Handover Oak Canopy',
    client: 'Mark Davis',
    location: 'Vondelstraat 12, Amsterdam',
    date: '2026-08-04',
    time: '14:00 - 16:00',
    type: 'Site Visit',
    typeNL: 'Locatiebezoek',
    typeEN: 'Site Visit',
    status: 'Completed',
    statusNL: 'Afgerond',
    statusEN: 'Completed',
    notesNL: 'Klant akkoord getekend voor glazen schuifwand oplevering.',
    notesEN: 'Customer signed final approval for glass sliding wall delivery.'
  }
];

export default function PartnerPlanning() {
  const { language } = useLanguage();
  const [events, setEvents] = useState([]);
  const [filterType, setFilterType] = useState('All');
  const [selectedDate, setSelectedDate] = useState('2026-08-10');
  const [showAddModal, setShowAddModal] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [newEvent, setNewEvent] = useState({ title: '', client: '', location: '', time: '10:00 - 11:30', type: 'Site Visit' });

  useEffect(() => {
    const saved = localStorage.getItem('app_partner_planning');
    if (saved) {
      try { setEvents(JSON.parse(saved)); } catch (e) { setEvents(DEFAULT_EVENTS); }
    } else {
      setEvents(DEFAULT_EVENTS);
      localStorage.setItem('app_partner_planning', JSON.stringify(DEFAULT_EVENTS));
    }
  }, []);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const toggleEventStatus = (id) => {
    const updated = events.map(e => e.id === id ? { ...e, status: e.status === 'Completed' ? 'Upcoming' : 'Completed' } : e);
    setEvents(updated);
    localStorage.setItem('app_partner_planning', JSON.stringify(updated));
    showToast(language === 'EN' ? 'Task status updated!' : 'Planningstaak status bijgewerkt!');
  };

  const handleAddEvent = (e) => {
    e.preventDefault();
    if (!newEvent.title) return;
    const added = [
      ...events,
      {
        id: Date.now(),
        titleNL: newEvent.title,
        titleEN: newEvent.title,
        client: newEvent.client || 'Client',
        location: newEvent.location || 'Location',
        date: selectedDate,
        time: newEvent.time,
        type: newEvent.type,
        typeNL: newEvent.type === 'Site Visit' ? 'Locatiebezoek' : newEvent.type === 'Delivery' ? 'Oplevering' : 'Montage',
        typeEN: newEvent.type,
        status: 'Upcoming',
        statusNL: 'Aankomend',
        statusEN: 'Upcoming',
        notesNL: 'Handmatig ingeplande taak.',
        notesEN: 'Manually scheduled task.'
      }
    ];
    setEvents(added);
    localStorage.setItem('app_partner_planning', JSON.stringify(added));
    setShowAddModal(false);
    setNewEvent({ title: '', client: '', location: '', time: '10:00 - 11:30', type: 'Site Visit' });
    showToast(language === 'EN' ? 'New schedule task added!' : 'Nieuwe taak toegevoegd aan planning!');
  };

  const filteredEvents = filterType === 'All' 
    ? events 
    : events.filter(e => e.type === filterType || e.status === filterType);

  const filterTabs = [
    { key: 'All', label: language === 'NL' ? 'Alles' : 'All' },
    { key: 'Site Visit', label: language === 'NL' ? 'Locatiebezoek' : 'Site Visit' },
    { key: 'Delivery', label: language === 'NL' ? 'Oplevering' : 'Delivery' },
    { key: 'Assembly', label: language === 'NL' ? 'Montage' : 'Assembly' },
    { key: 'Upcoming', label: language === 'NL' ? 'Aankomend' : 'Upcoming' },
    { key: 'Completed', label: language === 'NL' ? 'Afgerond' : 'Completed' }
  ];

  return (
    <div className="space-y-6 font-body text-[#4A4A43] relative">
      {/* Toast */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, x: 80 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 80 }}
            className="fixed top-20 right-6 z-50 flex items-center gap-2 bg-[#3E4E36] text-white px-4 py-3 rounded-xl shadow-2xl border border-[#2D3528] text-xs"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            {toastMsg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-heading font-bold text-primary">
            {language === 'NL' ? 'Planning & Agenda' : 'Planning & Schedule'}
          </h2>
          <p className="text-dark/50 text-sm font-body">
            {language === 'NL' ? 'Beheer uw wekelijkse planning, locatiebezoeken en montages.' : 'Manage your weekly schedule, site visits, and installations.'}
          </p>
        </div>
        <Button icon={Plus} onClick={() => setShowAddModal(true)}>
          {language === 'NL' ? 'Planningstaak Toevoegen' : 'Add Schedule Task'}
        </Button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card className="border-l-4 border-l-primary" noPadding>
          <div className="flex justify-between items-center px-4 py-3">
            <div>
              <p className="text-[11px] text-dark/50 font-body uppercase font-semibold tracking-wider">
                {language === 'NL' ? 'TOTAAL INGEPLAND' : 'Total Scheduled'}
              </p>
              <p className="text-xl font-heading font-bold text-dark mt-0.5">{events.length}</p>
            </div>
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <CalendarIcon className="w-4 h-4" />
            </div>
          </div>
        </Card>
        <Card className="border-l-4 border-l-accent" noPadding>
          <div className="flex justify-between items-center px-4 py-3">
            <div>
              <p className="text-[11px] text-dark/50 font-body uppercase font-semibold tracking-wider">
                {language === 'NL' ? 'AANKOMENDE TAKEN' : 'Upcoming Tasks'}
              </p>
              <p className="text-xl font-heading font-bold text-accent mt-0.5">{events.filter(e => e.status === 'Upcoming').length}</p>
            </div>
            <div className="p-2 rounded-lg bg-accent/10 text-accent">
              <Clock className="w-4 h-4" />
            </div>
          </div>
        </Card>
        <Card className="border-l-4 border-l-green-600" noPadding>
          <div className="flex justify-between items-center px-4 py-3">
            <div>
              <p className="text-[11px] text-dark/50 font-body uppercase font-semibold tracking-wider">
                {language === 'NL' ? 'AFGEROND' : 'Completed'}
              </p>
              <p className="text-xl font-heading font-bold text-green-700 mt-0.5">{events.filter(e => e.status === 'Completed').length}</p>
            </div>
            <div className="p-2 rounded-lg bg-green-100 text-green-700">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
        </Card>
      </div>

      {/* Main Grid: Schedule List + Calendar Widget */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Schedule List */}
        <div className="lg:col-span-2 space-y-4">
          {/* Filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 no-scrollbar bg-[#EDE8DF]/60 p-1.5 rounded-xl border border-[#D6CFC2]/60">
            <Filter className="w-3.5 h-3.5 text-dark/40 ml-2 mr-1 flex-shrink-0" />
            {filterTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilterType(tab.key)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  filterType === tab.key
                    ? 'bg-primary text-white shadow-xs'
                    : 'text-dark/70 hover:bg-white/60'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Events List */}
          <div className="space-y-3">
            {filteredEvents.length === 0 ? (
              <Card className="text-center py-10 text-dark/50 text-xs">
                <CalendarIcon className="w-8 h-8 mx-auto mb-2 text-dark/20" />
                {language === 'NL' ? 'Geen taken gevonden voor dit filter.' : 'No tasks matching this filter.'}
              </Card>
            ) : (
              filteredEvents.map((evt) => {
                const isCompleted = evt.status === 'Completed';
                const title = language === 'EN' ? (evt.titleEN || evt.title) : (evt.titleNL || evt.title);
                const typeLabel = language === 'EN' ? (evt.typeEN || evt.type) : (evt.typeNL || evt.type);
                const statusLabel = language === 'EN' ? (evt.statusEN || evt.status) : (evt.statusNL || evt.status);
                const notes = language === 'EN' ? (evt.notesEN || evt.notes) : (evt.notesNL || evt.notes);

                return (
                  <Card key={evt.id} className={`transition-all hover:shadow-md border-l-4 ${isCompleted ? 'border-l-green-600 bg-white/60' : 'border-l-accent'}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0">
                        <button
                          onClick={() => toggleEventStatus(evt.id)}
                          className="mt-0.5 text-dark/40 hover:text-green-600 transition-colors flex-shrink-0"
                          title={language === 'EN' ? 'Toggle status' : 'Status wijzigen'}
                        >
                          {isCompleted ? (
                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                          ) : (
                            <Circle className="w-5 h-5 text-dark/30 hover:text-accent" />
                          )}
                        </button>

                        <div className="min-w-0 space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className={`font-bold text-sm font-heading ${isCompleted ? 'line-through text-dark/50' : 'text-primary'}`}>
                              {title}
                            </h4>
                            <Badge variant={isCompleted ? 'success' : 'primary'} className="text-[10px]">
                              {typeLabel}
                            </Badge>
                            <Badge variant={isCompleted ? 'success' : 'warning'} className="text-[10px]">
                              {statusLabel}
                            </Badge>
                          </div>

                          <div className="flex items-center gap-3 text-xs text-dark/60 flex-wrap">
                            <span className="flex items-center gap-1 font-mono text-[11px] font-bold text-accent">
                              <CalendarIcon className="w-3.5 h-3.5" />
                              {evt.date} ({evt.time})
                            </span>
                            <span className="flex items-center gap-1">
                              <User className="w-3.5 h-3.5 text-dark/40" />
                              {evt.client}
                            </span>
                            <span className="flex items-center gap-1 truncate">
                              <MapPin className="w-3.5 h-3.5 text-dark/40" />
                              {evt.location}
                            </span>
                          </div>

                          {notes && (
                            <p className="text-[11px] text-dark/70 bg-[#F8F7F4] p-2 rounded-lg border border-[#D6CFC2]/40 mt-1 leading-relaxed">
                              💡 {notes}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })
            )}
          </div>
        </div>

        {/* Right Col: Interactive Calendar Widget */}
        <div>
          <Card title={language === 'NL' ? 'Augustus 2026 Agenda' : 'August 2026 Calendar'} icon={CalendarIcon}>
            <div className="space-y-4 mt-2">
              <div className="flex justify-between items-center text-xs font-bold text-primary font-mono border-b border-[#D6CFC2] pb-2">
                <span>AUGUST 2026</span>
                <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-md">
                  {events.length} {language === 'NL' ? 'Taken' : 'Tasks'}
                </span>
              </div>

              {/* Day Headers */}
              <div className="grid grid-cols-7 text-center text-[10px] font-bold text-dark/40 uppercase">
                <span>MO</span><span>TU</span><span>WE</span><span>TH</span><span>FR</span><span>SA</span><span>SU</span>
              </div>

              {/* Days Grid */}
              <div className="grid grid-cols-7 gap-1 text-center text-xs">
                {/* Blank offsets for Aug 1 (Sat) */}
                <span className="p-2 text-dark/20"></span><span className="p-2 text-dark/20"></span><span className="p-2 text-dark/20"></span><span className="p-2 text-dark/20"></span><span className="p-2 text-dark/20"></span>
                <span className="p-1.5 rounded-lg hover:bg-white text-dark/60 font-semibold cursor-pointer">1</span>
                <span className="p-1.5 rounded-lg hover:bg-white text-dark/60 font-semibold cursor-pointer">2</span>
                <span className="p-1.5 rounded-lg hover:bg-white text-dark/60 font-semibold cursor-pointer">3</span>
                <span className="p-1.5 rounded-lg bg-green-100 text-green-800 font-bold border border-green-300 cursor-pointer" title="Handover Complete">4</span>
                <span className="p-1.5 rounded-lg hover:bg-white text-dark/60 font-semibold cursor-pointer">5</span>
                <span className="p-1.5 rounded-lg hover:bg-white text-dark/60 font-semibold cursor-pointer">6</span>
                <span className="p-1.5 rounded-lg hover:bg-white text-dark/60 font-semibold cursor-pointer">7</span>
                <span className="p-1.5 rounded-lg hover:bg-white text-dark/60 font-semibold cursor-pointer">8</span>
                <span className="p-1.5 rounded-lg hover:bg-white text-dark/60 font-semibold cursor-pointer">9</span>
                <span className="p-1.5 rounded-lg bg-primary text-white font-bold shadow-xs cursor-pointer" title="Site Measurement">10</span>
                <span className="p-1.5 rounded-lg hover:bg-white text-dark/60 font-semibold cursor-pointer">11</span>
                <span className="p-1.5 rounded-lg bg-amber-100 text-amber-900 font-bold border border-amber-300 cursor-pointer" title="Wood Delivery">12</span>
                <span className="p-1.5 rounded-lg hover:bg-white text-dark/60 font-semibold cursor-pointer">13</span>
                <span className="p-1.5 rounded-lg hover:bg-white text-dark/60 font-semibold cursor-pointer">14</span>
                <span className="p-1.5 rounded-lg bg-primary text-white font-bold shadow-xs cursor-pointer" title="Assembly Day">15</span>
                <span className="p-1.5 rounded-lg hover:bg-white text-dark/60 font-semibold cursor-pointer">16</span>
                <span className="p-1.5 rounded-lg hover:bg-white text-dark/60 font-semibold cursor-pointer">17</span>
                <span className="p-1.5 rounded-lg hover:bg-white text-dark/60 font-semibold cursor-pointer">18</span>
                <span className="p-1.5 rounded-lg hover:bg-white text-dark/60 font-semibold cursor-pointer">19</span>
                <span className="p-1.5 rounded-lg hover:bg-white text-dark/60 font-semibold cursor-pointer">20</span>
                <span className="p-1.5 rounded-lg hover:bg-white text-dark/60 font-semibold cursor-pointer">21</span>
                <span className="p-1.5 rounded-lg hover:bg-white text-dark/60 font-semibold cursor-pointer">22</span>
                <span className="p-1.5 rounded-lg hover:bg-white text-dark/60 font-semibold cursor-pointer">23</span>
                <span className="p-1.5 rounded-lg hover:bg-white text-dark/60 font-semibold cursor-pointer">24</span>
                <span className="p-1.5 rounded-lg hover:bg-white text-dark/60 font-semibold cursor-pointer">25</span>
                <span className="p-1.5 rounded-lg hover:bg-white text-dark/60 font-semibold cursor-pointer">26</span>
                <span className="p-1.5 rounded-lg hover:bg-white text-dark/60 font-semibold cursor-pointer">27</span>
                <span className="p-1.5 rounded-lg hover:bg-white text-dark/60 font-semibold cursor-pointer">28</span>
                <span className="p-1.5 rounded-lg hover:bg-white text-dark/60 font-semibold cursor-pointer">29</span>
                <span className="p-1.5 rounded-lg hover:bg-white text-dark/60 font-semibold cursor-pointer">30</span>
                <span className="p-1.5 rounded-lg hover:bg-white text-dark/60 font-semibold cursor-pointer">31</span>
              </div>

              <div className="p-3 bg-[#F8F7F4] rounded-xl border border-[#D6CFC2]/60 text-xs space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-primary flex-shrink-0"></span>
                  <span className="text-dark/70 font-semibold">{language === 'NL' ? 'Locatiebezoek & Montage' : 'Site Visit & Assembly'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 flex-shrink-0"></span>
                  <span className="text-dark/70 font-semibold">{language === 'NL' ? 'Materiaal Levering' : 'Material Delivery'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-green-600 flex-shrink-0"></span>
                  <span className="text-dark/70 font-semibold">{language === 'NL' ? 'Afgeronde Taak' : 'Completed Task'}</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* ADD TASK MODAL */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-dark/70 backdrop-blur-xs" onClick={() => setShowAddModal(false)} />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative w-full max-w-md bg-[#EDE8DF] border border-[#C4BEB3] rounded-2xl p-6 shadow-2xl z-10 space-y-4 text-xs font-body">
              <div className="flex justify-between items-center border-b border-[#D6CFC2] pb-3">
                <h3 className="text-lg font-heading font-bold text-primary">
                  {language === 'NL' ? 'Planningstaak Toevoegen' : 'Add Schedule Task'}
                </h3>
                <button onClick={() => setShowAddModal(false)} className="p-1 text-dark/40 hover:text-dark">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddEvent} className="space-y-3">
                <div>
                  <label className="block font-bold text-dark/60 uppercase text-[10px] mb-1">
                    {language === 'NL' ? 'Taak Omschrijving *' : 'Task Title *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={newEvent.title}
                    onChange={e => setNewEvent({ ...newEvent, title: e.target.value })}
                    placeholder={language === 'NL' ? 'bijv. Inmeten buitenkeuken' : 'e.g. Site measurement outdoor kitchen'}
                    className="w-full px-3 py-2 bg-white border border-[#D6CFC2] rounded-xl outline-none focus:ring-2 focus:ring-primary/20 text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-dark/60 uppercase text-[10px] mb-1">
                      {language === 'NL' ? 'Klant' : 'Client Name'}
                    </label>
                    <input
                      type="text"
                      value={newEvent.client}
                      onChange={e => setNewEvent({ ...newEvent, client: e.target.value })}
                      placeholder="e.g. Bjorn Valk"
                      className="w-full px-3 py-2 bg-white border border-[#D6CFC2] rounded-xl outline-none focus:ring-2 focus:ring-primary/20 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-dark/60 uppercase text-[10px] mb-1">
                      {language === 'NL' ? 'Type Taak' : 'Task Type'}
                    </label>
                    <select
                      value={newEvent.type}
                      onChange={e => setNewEvent({ ...newEvent, type: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-[#D6CFC2] rounded-xl outline-none focus:ring-2 focus:ring-primary/20 text-xs"
                    >
                      <option value="Site Visit">{language === 'NL' ? 'Locatiebezoek' : 'Site Visit'}</option>
                      <option value="Delivery">{language === 'NL' ? 'Oplevering' : 'Delivery'}</option>
                      <option value="Assembly">{language === 'NL' ? 'Montage' : 'Assembly'}</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-dark/60 uppercase text-[10px] mb-1">
                    {language === 'NL' ? 'Locatie / Adres' : 'Location Address'}
                  </label>
                  <input
                    type="text"
                    value={newEvent.location}
                    onChange={e => setNewEvent({ ...newEvent, location: e.target.value })}
                    placeholder="e.g. Keizersgracht 420, Amsterdam"
                    className="w-full px-3 py-2 bg-white border border-[#D6CFC2] rounded-xl outline-none focus:ring-2 focus:ring-primary/20 text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-dark/60 uppercase text-[10px] mb-1">
                      {language === 'NL' ? 'Datum' : 'Date'}
                    </label>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={e => setSelectedDate(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-[#D6CFC2] rounded-xl outline-none text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-dark/60 uppercase text-[10px] mb-1">
                      {language === 'NL' ? 'Tijdstip' : 'Time'}
                    </label>
                    <input
                      type="text"
                      value={newEvent.time}
                      onChange={e => setNewEvent({ ...newEvent, time: e.target.value })}
                      placeholder="09:00 - 11:30"
                      className="w-full px-3 py-2 bg-white border border-[#D6CFC2] rounded-xl outline-none text-xs"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-[#D6CFC2]">
                  <Button variant="outline" onClick={() => setShowAddModal(false)}>
                    {language === 'NL' ? 'Annuleren' : 'Cancel'}
                  </Button>
                  <Button type="submit">
                    {language === 'NL' ? 'Opslaan' : 'Save Task'}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
