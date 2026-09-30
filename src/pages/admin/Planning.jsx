import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, AlertTriangle, CheckCircle2, RefreshCw, Info, Clock, ChevronDown, PanelRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const typeColors = {
  'Site Visit': { text: '#46607C', fill: '#EAF0F6', border: '#C3D2E2', short: 'SITE VISIT' },
  'Canopy Build': { text: '#3E6468', fill: '#E3EEEE', border: '#B3CCCB', short: 'BUILD' },
  'Kitchen Delivery': { text: '#9A5530', fill: '#F8E9DE', border: '#E3C1A8', short: 'DELIVERY' },
  'Handover': { text: '#4F6A45', fill: '#E8F0E2', border: '#C3D5B8', short: 'HANDOVER' },
  'Service': { text: '#6E5580', fill: '#F0EAF4', border: '#D5C8E0', short: 'SERVICE' }
};

export default function Planning() {
  const [activeTab, setActiveTab] = useState('Project Planning');
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [activeFilter, setActiveFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeView, setActiveView] = useState('Week');
  
  const [extraAppointments, setExtraAppointments] = useState([]);
  const [newApptData, setNewApptData] = useState({ customer: 'Fam. Janssen', type: 'Site Visit', date: '2026-09-30', time: '09:00' });

  const handleSave = () => {
    if (!newApptData.date || !newApptData.time) {
      setIsModalOpen(false);
      return;
    }
    const d = new Date(newApptData.date);
    let dayIndex = d.getDay() - 1; 
    if (dayIndex < 0) dayIndex = 6; 
    
    const timeParts = newApptData.time.split(':');
    const startHour = parseInt(timeParts[0], 10);
    const topPx = (startHour - 7) * 54;
    
    const newAppt = {
       type: newApptData.type,
       customer: newApptData.customer,
       date: newApptData.date,
       startTime: newApptData.time,
       endTime: `${(startHour + 1).toString().padStart(2, '0')}:00`,
       left: `calc(${dayIndex} * (100% / 7) + 4px)`,
       width: `calc(100% / 7 - 8px)`,
       top: `${topPx}px`,
       height: `54px`,
       partner: 'Bram',
       isExtra: true
    };
    
    setExtraAppointments([...extraAppointments, newAppt]);
    setIsModalOpen(false);
  };
  
  // Helper for setting appointment
  const SA = (data) => setSelectedAppointment(data);

  // Grid layout parameters
  const hours = Array.from({ length: 12 }, (_, i) => i + 7); // 07:00 to 18:00
  const daysData = [
    { name: 'MON', num: '28', month: 'sep' },
    { name: 'TUE', num: '29', month: 'sep' },
    { name: 'WED', num: '30', month: 'sep', alert: true },
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
                className={`pb-2.5 text-[14px] font-bold border-b-[3px] transition-colors ${activeTab === 'Project Planning' ? 'border-[#3E4A3D] text-[#2A2925]' : 'border-transparent text-[#736E64] hover:text-[#2A2925]'}`}
              >
                Project Planning
              </button>
              <button 
                onClick={() => setActiveTab('Task Agenda')}
                className={`pb-2.5 text-[14px] font-bold border-b-[3px] transition-colors flex items-center gap-2 ${activeTab === 'Task Agenda' ? 'border-[#3E4A3D] text-[#2A2925]' : 'border-transparent text-[#736E64] hover:text-[#2A2925]'}`}
              >
                Task Agenda Bram & Tim <span className="bg-[#E6E0D4] text-[#58534A] text-[10px] px-2 py-0.5 rounded-full ml-1">18 open</span>
              </button>
            </div>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-[#3E4A3D] text-white px-5 py-2.5 rounded-xl text-[14px] font-bold hover:bg-[#2A3329] active:scale-95 transition-all flex items-center gap-1.5 mb-2 shadow-sm">
            <span className="text-xl leading-none font-normal">+</span> {activeTab === 'Project Planning' ? 'New planning' : 'New task'}
          </button>
        </div>

        {/* Conditional Rendering based on Tab */}
        {activeTab === 'Project Planning' ? (
          <div className="w-full">
            {/* Toolbar */}
            <div className="flex justify-between items-center mb-4 mt-2 pt-1">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <button className="px-3 py-1.5 bg-transparent border border-[#E6E0D4] rounded-xl hover:bg-white text-[#2A2925] transition-colors"><ChevronLeft className="w-4 h-4" /></button>
                  <button className="px-4 py-1.5 bg-transparent border border-[#E6E0D4] rounded-xl text-[13px] font-bold hover:bg-white text-[#2A2925] transition-colors">Today</button>
                  <button className="px-3 py-1.5 bg-transparent border border-[#E6E0D4] rounded-xl hover:bg-white text-[#2A2925] transition-colors"><ChevronRight className="w-4 h-4" /></button>
                </div>
                <div className="text-[22px] font-heading font-medium text-[#2A2925] flex items-center gap-3 whitespace-nowrap">
                  Sep 28 – Oct 4
                  <span className="text-[10px] font-body bg-transparent border border-[#E6E0D4] text-[#736E64] px-1.5 py-0.5 rounded uppercase font-bold">WEEK 40</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <select className="appearance-none text-[13px] bg-transparent border border-[#E6E0D4] rounded-xl pl-4 pr-8 py-2 font-bold text-[#2A2925] outline-none cursor-pointer hover:bg-white transition-colors">
                    <option>Partner All</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-[#736E64] pointer-events-none" />
                </div>
                <div className="relative">
                  <select className="appearance-none text-[13px] bg-transparent border border-[#E6E0D4] rounded-xl pl-4 pr-8 py-2 font-bold text-[#2A2925] outline-none cursor-pointer hover:bg-white transition-colors">
                    <option>Status All</option>
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
                  className={`flex items-center gap-2 border rounded-full px-3 py-1.5 text-[11px] font-bold transition-colors whitespace-nowrap ${activeFilter === 'Kitchen Delivery' ? 'bg-white border-[#2A2925] shadow-sm' : 'bg-transparent border-[#E6E0D4] hover:bg-white'}`}>
                  <span className="w-2.5 h-2.5 rounded-[3px]" style={{ backgroundColor: '#9A5530' }}></span>
                  Kitchen delivery <span className="text-[#736E64] font-normal ml-0.5">8</span>
                </button>
                <button 
                  onClick={() => setActiveFilter(activeFilter === 'Canopy Build' ? 'All' : 'Canopy Build')}
                  className={`flex items-center gap-2 border rounded-full px-3 py-1.5 text-[11px] font-bold transition-colors whitespace-nowrap ${activeFilter === 'Canopy Build' ? 'bg-white border-[#2A2925] shadow-sm' : 'bg-transparent border-[#E6E0D4] hover:bg-white'}`}>
                  <span className="w-2.5 h-2.5 rounded-[3px]" style={{ backgroundColor: '#3E6468' }}></span>
                  Canopy build <span className="text-[#736E64] font-normal ml-0.5">2</span>
                </button>
                <button 
                  onClick={() => setActiveFilter(activeFilter === 'Site Visit' ? 'All' : 'Site Visit')}
                  className={`flex items-center gap-2 border rounded-full px-3 py-1.5 text-[11px] font-bold transition-colors whitespace-nowrap ${activeFilter === 'Site Visit' ? 'bg-white border-[#2A2925] shadow-sm' : 'bg-transparent border-[#E6E0D4] hover:bg-white'}`}>
                  <span className="w-2.5 h-2.5 rounded-[3px]" style={{ backgroundColor: '#46607C' }}></span>
                  Site visit <span className="text-[#736E64] font-normal ml-0.5">3</span>
                </button>
                <button 
                  onClick={() => setActiveFilter(activeFilter === 'Handover' ? 'All' : 'Handover')}
                  className={`flex items-center gap-2 border rounded-full px-3 py-1.5 text-[11px] font-bold transition-colors whitespace-nowrap ${activeFilter === 'Handover' ? 'bg-white border-[#2A2925] shadow-sm' : 'bg-transparent border-[#E6E0D4] hover:bg-white'}`}>
                  <span className="w-2.5 h-2.5 rounded-[3px]" style={{ backgroundColor: '#4F6A45' }}></span>
                  Handover <span className="text-[#736E64] font-normal ml-0.5">2</span>
                </button>
                <button 
                  onClick={() => setActiveFilter(activeFilter === 'Service' ? 'All' : 'Service')}
                  className={`flex items-center gap-2 border rounded-full px-3 py-1.5 text-[11px] font-bold transition-colors whitespace-nowrap ${activeFilter === 'Service' ? 'bg-white border-[#2A2925] shadow-sm' : 'bg-transparent border-[#E6E0D4] hover:bg-white'}`}>
                  <span className="w-2.5 h-2.5 rounded-[3px]" style={{ backgroundColor: '#6E5580' }}></span>
                  Service <span className="text-[#736E64] font-normal ml-0.5">2</span>
                </button>
              </div>
              <div className="flex gap-2 pl-4 shrink-0">
                <button className="flex items-center gap-1.5 bg-[#FBF0EC] border border-[#EBC9C0] text-[#A13C28] rounded-full px-3 py-1.5 text-[11px] font-bold whitespace-nowrap">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" /> 1 conflict
                </button>
                <button className="flex items-center gap-1.5 bg-[#FBF5E8] border border-[#E8D5AE] text-[#8A5D0B] rounded-full px-3 py-1.5 text-[11px] font-bold whitespace-nowrap">
                  <RefreshCw className="w-3.5 h-3.5 shrink-0" /> 1 change
                </button>
                <button className="flex items-center gap-1.5 bg-[#F6F4EB] border border-[#DFD8C4] text-[#7A6B48] rounded-full px-3 py-1.5 text-[11px] font-bold whitespace-nowrap">
                  <Clock className="w-3.5 h-3.5 shrink-0" /> 1 action
                </button>
              </div>
            </div>

            {/* Calendar Card & Sidebar Wrapper — items-stretch ensures IDENTICAL HEIGHT */}
            <div className="flex gap-4 w-full mb-8 relative items-stretch">
              {/* Calendar Card */}
              <div className="flex-1 min-w-0 bg-[#F9F8F6] border border-[#E6E0D4] rounded-xl overflow-hidden shadow-sm flex flex-col">
                {/* Header row with Days */}
                <div className="flex border-b border-[#E6E0D4] bg-[#F9F8F6] shrink-0">
                  <div className="w-16 shrink-0 border-r border-[#E6E0D4]"></div>
                  {daysData.map((d, i) => (
                    <div key={i} className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 border-r border-[#E6E0D4] last:border-0 relative ${i === 1 ? 'bg-white' : ''}`}>
                      {i === 1 && <div className="absolute top-0 left-0 right-0 h-[3px] bg-[#3E4A3D]"></div>}
                      <span className={`text-[10px] font-bold ${i === 1 ? 'text-[#2A2925]' : 'text-[#736E64]'}`}>{d.name}</span>
                      <span className="text-[24px] font-heading leading-none text-[#2A2925]">{d.num}</span>
                      <span className="text-[11px] font-heading font-medium text-[#736E64]">{d.month}</span>
                      {d.alert && <AlertTriangle className="w-3 h-3 text-[#A13C28] ml-1" />}
                    </div>
                  ))}
                </div>

                {/* Multi-day Builds Lane */}
                <div className="flex border-b border-[#E6E0D4] bg-[#F9F8F6] shrink-0">
                  <div className="w-16 shrink-0 flex items-center justify-center leading-none z-10">
                    <span className="text-[9px] uppercase font-bold text-[#736E64] text-center">BUILD<br/><span className="text-[8px] font-normal normal-case">ongoing</span></span>
                  </div>

                  <div className="flex-1 relative p-1.5 min-h-[72px]">
                    {/* Row 1: Fam. Van Dijk */}
                    {(activeFilter === 'All' || activeFilter === 'Canopy Build') && (
                      <div 
                        onClick={() => SA({ type: 'Canopy Build', customer: 'Fam. Van Dijk', product: 'Poolhouse 6 x 4 m met veranda', partner: 'Hout & Steen Utrecht', date: 'Mon Sep 28 – Fri Oct 2', location: 'Utrecht', contact: 'Kees van Dijk', phone: '06 3333 4444', address: 'Parkweg 22, Utrecht', projectRef: 'PRJ-098', progress: ['site_visit', 'design', 'build'] })}
                        className={`absolute left-[0%] right-[28.57%] top-1.5 h-[26px] rounded bg-[#E3EEEE] border border-[#B3CCCB] flex justify-between items-center px-2 cursor-pointer shadow-sm hover:brightness-95 transition-all ${selectedAppointment?.customer === 'Fam. Van Dijk' ? 'ring-2 ring-[#3E4A3D] ring-offset-[1.5px] ring-offset-[#F9F8F6] z-30' : 'z-10'}`}>
                        <div className="flex items-center gap-2">
                          <span className="text-[9.5px] font-bold text-[#3E6468]">BUILD</span>
                          <span className="text-[11px] font-bold text-[#2A2925]">Fam. Van Dijk</span>
                          <span className="text-[11px] text-[#58534A] truncate">Poolhouse 6 x 4 m met veranda</span>
                        </div>
                        <span className="text-[10px] text-[#58534A]">Hout & Steen Utrecht</span>
                      </div>
                    )}
                    
                    {/* Row 2: Fam. Van Leeuwen */}
                    {(activeFilter === 'All' || activeFilter === 'Canopy Build') && (
                      <div 
                        onClick={() => SA({ type: 'Canopy Build', customer: 'Fam. Van Leeuwen', product: 'Overkapping 5 x 4 m met zijwand', partner: 'Timmerbedrijf De Eik', date: 'Tue Sep 29 – Fri Oct 2', location: 'Amsterdam', contact: 'Riet van Leeuwen', phone: '06 7777 8888', address: 'Tulpstraat 9, Amsterdam', projectRef: 'PRJ-101', progress: ['site_visit', 'design', 'build'] })}
                        className={`absolute left-[28.57%] right-[0%] top-[38px] h-[26px] rounded bg-[#E3EEEE] border border-[#B3CCCB] flex justify-between items-center px-2 cursor-pointer shadow-sm hover:brightness-95 transition-all ${selectedAppointment?.customer === 'Fam. Van Leeuwen' ? 'ring-2 ring-[#3E4A3D] ring-offset-[1.5px] ring-offset-[#F9F8F6] z-30' : 'z-10'}`}>
                        <div className="flex items-center gap-2">
                          <span className="text-[9.5px] font-bold text-[#3E6468]">BUILD</span>
                          <span className="text-[11px] font-bold text-[#2A2925]">Fam. Van Leeuwen</span>
                          <span className="text-[11px] text-[#58534A] truncate">Overkapping 5 x 4 m met zijwand</span>
                        </div>
                        <span className="text-[10px] text-[#58534A]">Timmerbedrijf De Eik</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Time Grid with relative height */}
                <div className="w-full relative min-h-[648px] flex-1">
                  {/* Background Grid Lines */}
                  <div className="flex w-full h-full absolute inset-0 pointer-events-none">
                    <div className="w-16 shrink-0 border-r border-[#E6E0D4] bg-[#FFFEFB] z-10">
                      {hours.map(h => (
                        <div key={h} className="h-[54px] flex items-start justify-center pt-1.5 relative border-b border-transparent">
                          <span className="text-[10px] font-body text-[#736E64]">{h.toString().padStart(2, '0')}:00</span>
                        </div>
                      ))}
                    </div>
                    {/* Vertical & Horizontal lines for days */}
                    <div className="flex-1 flex">
                      {daysData.map((d, i) => (
                        <div key={i} className={`flex-1 border-r border-[#E6E0D4] last:border-0 relative ${i === 1 ? 'bg-white' : ''}`}>
                          {hours.map(h => (
                            <div key={h} className="h-[54px] border-b border-[#E6E0D4] opacity-50"></div>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Current Time Line (11:20 on Tuesday) */}
                  <div className="absolute left-0 right-0 top-[234px] flex items-center z-20 pointer-events-none">
                    <div className="w-16 flex justify-center">
                      <span className="bg-[#B96A38] text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm">11:20</span>
                    </div>
                    <div className="flex-1 h-[1px] bg-[#B96A38] flex items-center relative">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#B96A38] absolute -left-0.5"></div>
                    </div>
                  </div>

                  {/* Appointments Overlay */}
                  <div className="absolute inset-0 z-20 flex">
                    <div className="w-16 shrink-0 pointer-events-none"></div>
                    <div className="flex-1 flex relative">

                      {/* MON (Mon Sep 28) */}
                      {/* Fam. De Graaf: 08:00 - 12:00 */}
                      {(activeFilter === 'All' || activeFilter === 'Kitchen Delivery') && (
                        <div 
                          onClick={() => SA({ type: 'Kitchen Delivery', customer: 'Fam. De Graaf', product: 'Buitenkeuken Padouk 1.80 m', partner: 'CraftWood Veluwe', date: 'Mon Sep 28', startTime: '08:00', endTime: '12:00', location: 'Baarn', contact: 'Leo de Graaf', phone: '06 2222 3333', address: 'Meentweg 3, Baarn', projectRef: 'PRJ-104', progress: ['site_visit', 'design', 'build', 'handover'] })}
                          className={`absolute top-[54px] h-[216px] bg-[#F8E9DE] border border-[#E3C1A8] rounded-lg p-2 cursor-pointer shadow-sm flex flex-col overflow-hidden hover:brightness-95 transition-all ${selectedAppointment?.customer === 'Fam. De Graaf' ? 'ring-2 ring-[#3E4A3D] ring-offset-[1.5px] ring-offset-[#FFFEFB] z-30' : 'z-10'}`}
                          style={{ left: 'calc(0 * (100% / 7) + 4px)', width: 'calc(100% / 7 - 8px)' }}>
                          <div className="flex justify-between items-start mb-0.5">
                            <span className="text-[9px] font-bold text-[#9A5530] uppercase tracking-wide">DELIVERY</span>
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#A5C0A5] shrink-0" />
                          </div>
                          <span className="text-[11px] font-bold text-[#2A2925] leading-snug mb-1">Fam. De Graaf</span>
                          <span className="text-[10px] text-[#736E64] leading-tight mb-0.5 truncate">Buitenkeuken Pad...</span>
                          <span className="text-[9px] text-[#736E64] leading-tight">08:00-12:00 · Craft...</span>
                        </div>
                      )}

                      {/* Fam. Bakker-Vermeer: 13:30 - 14:30 */}
                      {(activeFilter === 'All' || activeFilter === 'Site Visit') && (
                        <div 
                          onClick={() => SA({ type: 'Site Visit', customer: 'Fam. Bakker-Vermeer', date: 'Mon Sep 28', startTime: '13:30', endTime: '14:30', partner: 'Bram', location: 'Soest', contact: 'Anke Bakker', phone: '06 5555 6666', address: 'Laanweg 11, Soest', projectRef: 'PRJ-118', progress: ['site_visit'] })}
                          className={`absolute top-[351px] h-[54px] bg-[#EAF0F6] border border-[#C3D2E2] rounded-lg p-2 cursor-pointer shadow-sm flex flex-col overflow-hidden hover:brightness-95 transition-all ${selectedAppointment?.customer === 'Fam. Bakker-Vermeer' ? 'ring-2 ring-[#3E4A3D] ring-offset-[1.5px] ring-offset-[#FFFEFB] z-30' : 'z-10'}`}
                          style={{ left: 'calc(0 * (100% / 7) + 4px)', width: 'calc(100% / 7 - 8px)' }}>
                          <div className="flex justify-between items-start mb-0.5">
                            <span className="text-[9px] font-bold text-[#46607C] uppercase tracking-wide">SITE VISIT</span>
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#A5C0A5] shrink-0" />
                          </div>
                          <span className="text-[11px] font-bold text-[#2A2925] leading-snug mb-1 truncate">Fam. Bakker-...</span>
                        </div>
                      )}

                      {/* TUE (Tue Sep 29) */}
                      {/* Fam. Peters: 10:00 - 11:00 */}
                      {(activeFilter === 'All' || activeFilter === 'Site Visit') && (
                        <div 
                          onClick={() => SA({ type: 'Site Visit', customer: 'Fam. Peters', date: 'Tue Sep 29', startTime: '10:00', endTime: '11:00', partner: 'Bram', location: 'Amersfoort', contact: 'Jan Peters', phone: '06 1234 5678', address: 'Hoofdstraat 12, Amersfoort', projectRef: 'PRJ-102', progress: ['site_visit', 'design'] })}
                          className={`absolute top-[162px] h-[54px] bg-[#EAF0F6] border border-[#C3D2E2] rounded-lg p-2 cursor-pointer shadow-sm flex flex-col overflow-hidden hover:brightness-95 transition-all ${selectedAppointment?.customer === 'Fam. Peters' ? 'ring-2 ring-[#3E4A3D] ring-offset-[1.5px] ring-offset-[#FFFEFB] z-30' : 'z-10'}`}
                          style={{ left: 'calc(1 * (100% / 7) + 4px)', width: 'calc(100% / 7 - 8px)' }}>
                          <div className="flex justify-between items-start mb-0.5">
                            <span className="text-[9px] font-bold text-[#46607C] uppercase tracking-wide">SITE VISIT</span>
                          </div>
                          <span className="text-[11px] font-bold text-[#2A2925] leading-snug">Fam. Peters</span>
                        </div>
                      )}

                      {/* Dhr. Hendriks: 13:30 - 15:00 */}
                      {(activeFilter === 'All' || activeFilter === 'Service') && (
                        <div 
                          onClick={() => SA({ type: 'Service', customer: 'Dhr. Hendriks', date: 'Tue Sep 29', startTime: '13:30', endTime: '15:00', partner: 'Bram', location: 'Amersfoort', contact: 'Dhr. Hendriks', phone: '06 8888 9999', address: 'Bergstraat 7, Amersfoort', projectRef: 'PRJ-092', progress: ['site_visit', 'design', 'build', 'handover', 'service'] })}
                          className={`absolute top-[351px] h-[81px] bg-[#F0EAF4] border border-[#D5C8E0] rounded-lg p-2 cursor-pointer shadow-sm flex flex-col overflow-hidden hover:brightness-95 transition-all ${selectedAppointment?.customer === 'Dhr. Hendriks' ? 'ring-2 ring-[#3E4A3D] ring-offset-[1.5px] ring-offset-[#FFFEFB] z-30' : 'z-10'}`}
                          style={{ left: 'calc(1 * (100% / 7) + 4px)', width: 'calc(100% / 7 - 8px)' }}>
                          <div className="flex justify-between items-start mb-0.5">
                            <span className="text-[9px] font-bold text-[#6E5580] uppercase tracking-wide">SERVICE</span>
                          </div>
                          <span className="text-[11px] font-bold text-[#2A2925] leading-snug">Dhr. Hendriks</span>
                        </div>
                      )}

                      {/* Fam. Brouwer: 15:00 - 17:00 */}
                      {(activeFilter === 'All' || activeFilter === 'Kitchen Delivery') && (
                        <div 
                          onClick={() => SA({ type: 'Kitchen Delivery', customer: 'Fam. Brouwer', product: 'Buitenkeuken Thermo Fraké 1.80 m', partner: 'CraftWood Veluwe', date: 'Tue Sep 29', startTime: '15:00', endTime: '17:00', location: 'Harderwijk', contact: 'Piet Brouwer', phone: '06 8888 9999', address: 'Vissersdijk 7, Harderwijk', projectRef: 'PRJ-116', progress: ['site_visit', 'design', 'build'] })}
                          className={`absolute top-[432px] h-[108px] bg-[#F8E9DE] border border-[#E3C1A8] rounded-lg p-2 cursor-pointer shadow-sm flex flex-col overflow-hidden hover:brightness-95 transition-all ${selectedAppointment?.customer === 'Fam. Brouwer' ? 'ring-2 ring-[#3E4A3D] ring-offset-[1.5px] ring-offset-[#FFFEFB] z-30' : 'z-10'}`}
                          style={{ left: 'calc(1 * (100% / 7) + 4px)', width: 'calc(100% / 7 - 8px)' }}>
                          <div className="flex justify-between items-start mb-0.5">
                            <span className="text-[9px] font-bold text-[#9A5530] uppercase tracking-wide">DELIVERY</span>
                          </div>
                          <span className="text-[11px] font-bold text-[#2A2925] leading-snug mb-1">Fam. Brouwer</span>
                          <span className="text-[10px] text-[#736E64] leading-tight mb-0.5 truncate">Buitenkeuken T...</span>
                          <span className="text-[9px] text-[#736E64] leading-tight">15:00-17:00 · C...</span>
                        </div>
                      )}

                      {/* WED (Wed Sep 30) */}
                      {/* Fam. Janssen: 08:00 - 11:00 (Conflict) */}
                      {(activeFilter === 'All' || activeFilter === 'Kitchen Delivery') && (
                        <div 
                          onClick={() => SA({ type: 'Kitchen Delivery', customer: 'Fam. Janssen', product: 'Buitenkeuken Thermo Fraké 2.40 m · spoelbak', partner: 'CraftWood Veluwe', date: 'Wed Sep 30', startTime: '08:00', endTime: '11:00', location: 'Nijkerk', contact: 'Mark Janssen', phone: '06 5678 9012', address: 'Kerkstraat 14, Nijkerk', projectRef: 'PRJ-109', status: 'Conflict', conflictWith: 'Fam. Visser in Leusden (09:30–12:30)', progress: ['site_visit', 'design', 'build'] })}
                          className={`absolute top-[54px] h-[162px] bg-[#F8E9DE] border border-dashed border-[#C0634F] rounded-lg p-2 cursor-pointer shadow-sm flex flex-col overflow-hidden hover:brightness-95 transition-all ${selectedAppointment?.customer === 'Fam. Janssen' ? 'ring-2 ring-[#3E4A3D] ring-offset-[1.5px] ring-offset-[#FFFEFB] z-30' : 'z-10'}`}
                          style={{ left: 'calc(2 * (100% / 7) + 4px)', width: 'calc(100% / 7 - 22px)' }}>
                          <div className="flex justify-between items-start mb-0.5">
                            <span className="text-[9px] font-bold text-[#9A5530] uppercase tracking-wide">DELIVERY</span>
                            <AlertTriangle className="w-3.5 h-3.5 text-[#A13C28] shrink-0" />
                          </div>
                          <span className="text-[11px] font-bold text-[#2A2925] leading-snug mb-1">Fam. Janssen</span>
                          <span className="text-[10px] text-[#736E64] leading-tight mb-0.5 truncate">Buitenkeuken Ther...</span>
                          <span className="text-[9px] text-[#736E64] leading-tight">08:00-11:00 · Craft...</span>
                        </div>
                      )}

                      {/* Fam. Visser: 09:30 - 12:30 (Conflict - shifted) */}
                      {(activeFilter === 'All' || activeFilter === 'Kitchen Delivery') && (
                        <div 
                          onClick={() => SA({ type: 'Kitchen Delivery', customer: 'Fam. Visser', product: 'Buitenkeuken Douglas 2.10 m', partner: 'CraftWood Veluwe', date: 'Wed Sep 30', startTime: '09:30', endTime: '12:30', location: 'Leusden', contact: 'Petra Visser', phone: '06 9876 5432', address: 'Dorpsweg 5, Leusden', projectRef: 'PRJ-113', status: 'Conflict', conflictWith: 'Fam. Janssen in Nijkerk (08:00–11:00)', progress: ['site_visit', 'design', 'build'] })}
                          className={`absolute top-[135px] h-[162px] bg-[#F8E9DE] border border-dashed border-[#C0634F] rounded-lg p-2 cursor-pointer shadow-md flex flex-col overflow-hidden hover:brightness-95 transition-all ${selectedAppointment?.customer === 'Fam. Visser' ? 'ring-2 ring-[#3E4A3D] ring-offset-[1.5px] ring-offset-[#FFFEFB] z-30' : 'z-20'}`}
                          style={{ left: 'calc(2 * (100% / 7) + 18px)', width: 'calc(100% / 7 - 22px)' }}>
                          <div className="flex justify-between items-start mb-0.5">
                            <span className="text-[9px] font-bold text-[#9A5530] uppercase tracking-wide">DEL...</span>
                            <AlertTriangle className="w-3.5 h-3.5 text-[#A13C28] shrink-0" />
                          </div>
                          <span className="text-[11px] font-bold text-[#2A2925] leading-snug mb-1">Fam. Visser</span>
                          <span className="text-[10px] text-[#736E64] leading-tight mb-0.5 truncate">Buitenkeuken...</span>
                          <span className="text-[9px] text-[#736E64] leading-tight">09:30-12:30 · C...</span>
                        </div>
                      )}

                      {/* Fam. Smit: 14:00 - 16:00 (Handover) */}
                      {(activeFilter === 'All' || activeFilter === 'Handover') && (
                        <div 
                          onClick={() => SA({ type: 'Handover', customer: 'Fam. Smit', product: 'Overkapping 5 x 4 m met berging', partner: 'Hout & Steen Utrecht', date: 'Wed Sep 30', startTime: '14:00', endTime: '16:00', location: 'Utrecht', contact: 'Jan Smit', phone: '06 1212 3434', address: 'Kerkpad 9, Utrecht', projectRef: 'PRJ-108', progress: ['site_visit', 'design', 'build', 'handover'] })}
                          className={`absolute top-[378px] h-[108px] bg-[#E8F0E2] border border-[#C3D5B8] rounded-lg p-2 cursor-pointer shadow-sm flex flex-col overflow-hidden hover:brightness-95 transition-all ${selectedAppointment?.customer === 'Fam. Smit' ? 'ring-2 ring-[#3E4A3D] ring-offset-[1.5px] ring-offset-[#FFFEFB] z-30' : 'z-10'}`}
                          style={{ left: 'calc(2 * (100% / 7) + 4px)', width: 'calc(100% / 7 - 8px)' }}>
                          <div className="flex justify-between items-start mb-0.5">
                            <span className="text-[9px] font-bold text-[#4F6A45] uppercase tracking-wide">HANDOVER</span>
                          </div>
                          <span className="text-[11px] font-bold text-[#2A2925] leading-snug mb-1">Fam. Smit</span>
                          <span className="text-[10px] text-[#736E64] leading-tight truncate">Overkapping 5...</span>
                        </div>
                      )}

                      {/* THU (Thu Oct 1) */}
                      {/* Fam. Kramer: 09:30 - 10:30 (Service) */}
                      {(activeFilter === 'All' || activeFilter === 'Service') && (
                        <div 
                          onClick={() => SA({ type: 'Service', customer: 'Fam. Kramer', date: 'Thu Oct 1', startTime: '09:30', endTime: '10:30', partner: 'Bram', location: 'Utrecht', contact: 'Hans Kramer', phone: '06 1111 2222', address: 'Nieuweweg 8, Utrecht', projectRef: 'PRJ-087', progress: ['site_visit', 'design', 'build', 'handover'] })}
                          className={`absolute top-[135px] h-[54px] bg-[#F0EAF4] border border-[#D5C8E0] rounded-lg p-2 cursor-pointer shadow-sm flex flex-col overflow-hidden hover:brightness-95 transition-all ${selectedAppointment?.customer === 'Fam. Kramer' ? 'ring-2 ring-[#3E4A3D] ring-offset-[1.5px] ring-offset-[#FFFEFB] z-30' : 'z-10'}`}
                          style={{ left: 'calc(3 * (100% / 7) + 4px)', width: 'calc(100% / 7 - 8px)' }}>
                          <div className="flex justify-between items-start mb-0.5">
                            <span className="text-[9px] font-bold text-[#6E5580] uppercase tracking-wide">SERVICE</span>
                            <RefreshCw className="w-3 h-3 text-[#6E5580] shrink-0" />
                          </div>
                          <span className="text-[11px] font-bold text-[#2A2925] leading-snug">Fam. Kramer</span>
                        </div>
                      )}

                      {/* Fam. Willems: 14:00 - 15:30 (Bezichtiging) */}
                      {(activeFilter === 'All' || activeFilter === 'Site Visit') && (
                        <div 
                          onClick={() => SA({ type: 'Site Visit', customer: 'Fam. Willems', date: 'Thu Oct 1', startTime: '14:00', endTime: '15:30', partner: 'Bram', location: 'Zeist', contact: 'Willem Willems', phone: '06 9988 7766', address: 'Slotlaan 21, Zeist', projectRef: 'PRJ-115', progress: ['site_visit'] })}
                          className={`absolute top-[378px] h-[81px] bg-[#EAF0F6] border border-[#C3D2E2] rounded-lg p-2 cursor-pointer shadow-sm flex flex-col overflow-hidden hover:brightness-95 transition-all ${selectedAppointment?.customer === 'Fam. Willems' ? 'ring-2 ring-[#3E4A3D] ring-offset-[1.5px] ring-offset-[#FFFEFB] z-30' : 'z-10'}`}
                          style={{ left: 'calc(3 * (100% / 7) + 4px)', width: 'calc(100% / 7 - 8px)' }}>
                          <div className="flex justify-between items-start mb-0.5">
                            <span className="text-[9px] font-bold text-[#46607C] uppercase tracking-wide">SITE VISIT</span>
                          </div>
                          <span className="text-[11px] font-bold text-[#2A2925] leading-snug">Fam. Willems</span>
                        </div>
                      )}

                      {/* FRI (Fri Oct 2) */}
                      {/* Fam. Mulder: 09:00 - 11:30 (Aflevering) */}
                      {(activeFilter === 'All' || activeFilter === 'Kitchen Delivery') && (
                        <div 
                          onClick={() => SA({ type: 'Kitchen Delivery', customer: 'Fam. Mulder', product: 'Buitenkeuken Douglas 1.60 m', partner: 'CraftWood Veluwe', date: 'Fri Oct 2', startTime: '09:00', endTime: '11:30', location: 'Hilversum', contact: 'Ed Mulder', phone: '06 6666 7777', address: 'Koninginneweg 45, Hilversum', projectRef: 'PRJ-121', progress: ['site_visit', 'design', 'build'] })}
                          className={`absolute top-[108px] h-[135px] bg-[#F8E9DE] border border-[#E3C1A8] rounded-lg p-2 cursor-pointer shadow-sm flex flex-col overflow-hidden hover:brightness-95 transition-all ${selectedAppointment?.customer === 'Fam. Mulder' ? 'ring-2 ring-[#3E4A3D] ring-offset-[1.5px] ring-offset-[#FFFEFB] z-30' : 'z-10'}`}
                          style={{ left: 'calc(4 * (100% / 7) + 4px)', width: 'calc(100% / 7 - 8px)' }}>
                          <div className="flex justify-between items-start mb-0.5">
                            <span className="text-[9px] font-bold text-[#9A5530] uppercase tracking-wide">DELIVERY</span>
                          </div>
                          <span className="text-[11px] font-bold text-[#2A2925] leading-snug mb-1">Fam. Mulder</span>
                          <span className="text-[10px] text-[#736E64] leading-tight mb-0.5 truncate">Buitenkeuken D...</span>
                          <span className="text-[9px] text-[#736E64] leading-tight">09:00-11:30 · C...</span>
                        </div>
                      )}

                      {/* Fam. De Graaf: 14:00 - 15:30 (Handover) */}
                      {(activeFilter === 'All' || activeFilter === 'Handover') && (
                        <div 
                          onClick={() => SA({ type: 'Handover', customer: 'Fam. De Graaf', product: 'Buitenkeuken Padouk 1.80 m', partner: 'CraftWood Veluwe', date: 'Fri Oct 2', startTime: '14:00', endTime: '15:30', location: 'Baarn', contact: 'Leo de Graaf', phone: '06 2222 3333', address: 'Meentweg 3, Baarn', projectRef: 'PRJ-104', progress: ['site_visit', 'design', 'build', 'handover'] })}
                          className={`absolute top-[378px] h-[81px] bg-[#E8F0E2] border border-[#C3D5B8] rounded-lg p-2 cursor-pointer shadow-sm flex flex-col overflow-hidden hover:brightness-95 transition-all ${selectedAppointment?.customer === 'Fam. De Graaf' && selectedAppointment?.type === 'Handover' ? 'ring-2 ring-[#3E4A3D] ring-offset-[1.5px] ring-offset-[#FFFEFB] z-30' : 'z-10'}`}
                          style={{ left: 'calc(4 * (100% / 7) + 4px)', width: 'calc(100% / 7 - 8px)' }}>
                          <div className="flex justify-between items-start mb-0.5">
                            <span className="text-[9px] font-bold text-[#4F6A45] uppercase tracking-wide">HANDOVER</span>
                            <Info className="w-3.5 h-3.5 text-[#6E8E6E] shrink-0" />
                          </div>
                          <span className="text-[11px] font-bold text-[#2A2925] leading-snug">Fam. De Graaf</span>
                        </div>
                      )}

                      {/* SAT (Sat Oct 3) */}
                      {/* Fam. Dekker: 08:00 - 11:00 (Aflevering) */}
                      {(activeFilter === 'All' || activeFilter === 'Kitchen Delivery') && (
                        <div 
                          onClick={() => SA({ type: 'Kitchen Delivery', customer: 'Fam. Dekker', product: 'Buitenkeuken Thermo Fraké 2.00 m', partner: 'CraftWood Veluwe', date: 'Sat Oct 3', startTime: '08:00', endTime: '11:00', location: 'Apeldoorn', contact: 'Sjaak Dekker', phone: '06 0000 1111', address: 'Veldweg 2, Apeldoorn', projectRef: 'PRJ-125', progress: ['site_visit', 'design', 'build'] })}
                          className={`absolute top-[54px] h-[162px] bg-[#F8E9DE] border border-[#E3C1A8] rounded-lg p-2 cursor-pointer shadow-sm flex flex-col overflow-hidden hover:brightness-95 transition-all ${selectedAppointment?.customer === 'Fam. Dekker' ? 'ring-2 ring-[#3E4A3D] ring-offset-[1.5px] ring-offset-[#FFFEFB] z-30' : 'z-10'}`}
                          style={{ left: 'calc(5 * (100% / 7) + 4px)', width: 'calc(100% / 7 - 8px)' }}>
                          <div className="flex justify-between items-start mb-0.5">
                            <span className="text-[9px] font-bold text-[#9A5530] uppercase tracking-wide">DELIVERY</span>
                          </div>
                          <span className="text-[11px] font-bold text-[#2A2925] leading-snug mb-1">Fam. Dekker</span>
                          <span className="text-[10px] text-[#736E64] leading-tight mb-0.5 truncate">Buitenkeuken T...</span>
                          <span className="text-[9px] text-[#736E64] leading-tight">08:00-11:00 · C...</span>
                        </div>
                      )}

                      {/* Fam. Bos: 13:00 - 15:30 (Aflevering) */}
                      {(activeFilter === 'All' || activeFilter === 'Kitchen Delivery') && (
                        <div 
                          onClick={() => SA({ type: 'Kitchen Delivery', customer: 'Fam. Bos', product: 'Buitenkeuken Padouk 2.20 m', partner: 'CraftWood Veluwe', date: 'Sat Oct 3', startTime: '13:00', endTime: '15:30', location: 'Deventer', contact: 'Joke Bos', phone: '06 8765 4321', address: 'Singel 18, Deventer', projectRef: 'PRJ-128', progress: ['site_visit', 'design'] })}
                          className={`absolute top-[324px] h-[135px] bg-[#F8E9DE] border border-[#E3C1A8] rounded-lg p-2 cursor-pointer shadow-sm flex flex-col overflow-hidden hover:brightness-95 transition-all ${selectedAppointment?.customer === 'Fam. Bos' ? 'ring-2 ring-[#3E4A3D] ring-offset-[1.5px] ring-offset-[#FFFEFB] z-30' : 'z-10'}`}
                          style={{ left: 'calc(5 * (100% / 7) + 4px)', width: 'calc(100% / 7 - 8px)' }}>
                          <div className="flex justify-between items-start mb-0.5">
                            <span className="text-[9px] font-bold text-[#9A5530] uppercase tracking-wide">DELIVERY</span>
                          </div>
                          <span className="text-[11px] font-bold text-[#2A2925] leading-snug mb-1">Fam. Bos</span>
                          <span className="text-[10px] text-[#736E64] leading-tight mb-0.5 truncate">Buitenkeuken P...</span>
                          <span className="text-[9px] text-[#736E64] leading-tight">13:00-15:30 · C...</span>
                        </div>
                      )}

                      {/* SUN (Sun Oct 4) */}
                      {/* Fam. Kuipers: 10:00 - 13:00 (Aflevering) */}
                      {(activeFilter === 'All' || activeFilter === 'Kitchen Delivery') && (
                        <div 
                          onClick={() => SA({ type: 'Kitchen Delivery', customer: 'Fam. Kuipers', product: 'Buitenkeuken Douglas 1.80 m', partner: 'CraftWood Veluwe', date: 'Sun Oct 4', startTime: '10:00', endTime: '13:00', location: 'Enschede', contact: 'Tom Kuipers', phone: '06 1357 2468', address: 'Havenstraat 31, Enschede', projectRef: 'PRJ-131', progress: ['site_visit', 'design', 'build'] })}
                          className={`absolute top-[162px] h-[162px] bg-[#F8E9DE] border border-[#E3C1A8] rounded-lg p-2 cursor-pointer shadow-sm flex flex-col overflow-hidden hover:brightness-95 transition-all ${selectedAppointment?.customer === 'Fam. Kuipers' ? 'ring-2 ring-[#3E4A3D] ring-offset-[1.5px] ring-offset-[#FFFEFB] z-30' : 'z-10'}`}
                          style={{ left: 'calc(6 * (100% / 7) + 4px)', width: 'calc(100% / 7 - 8px)' }}>
                          <div className="flex justify-between items-start mb-0.5">
                            <span className="text-[9px] font-bold text-[#9A5530] uppercase tracking-wide">DELIVERY</span>
                          </div>
                          <span className="text-[11px] font-bold text-[#2A2925] leading-snug mb-1">Fam. Kuipers</span>
                          <span className="text-[10px] text-[#736E64] leading-tight mb-0.5 truncate">Buitenkeuken D...</span>
                          <span className="text-[9px] text-[#736E64] leading-tight">10:00-13:00 · C...</span>
                        </div>
                      )}

                      {/* EXTRA APPOINTMENTS DYNAMICALLY ADDED */}
                      {extraAppointments.map((appt, i) => (
                        (activeFilter === 'All' || activeFilter === appt.type) && (
                          <div 
                            key={i}
                            onClick={() => SA(appt)}
                            className={`absolute bg-[#F0EAF4] border border-[#D5C8E0] rounded-lg p-2 cursor-pointer shadow-sm flex flex-col overflow-hidden hover:brightness-95 transition-all ${selectedAppointment?.customer === appt.customer && selectedAppointment?.isExtra ? 'ring-2 ring-[#3E4A3D] ring-offset-[1.5px] ring-offset-[#FFFEFB] z-30' : 'z-10'}`}
                            style={{ left: appt.left, width: appt.width, top: appt.top, height: appt.height, backgroundColor: typeColors[appt.type]?.fill || '#F0EAF4', borderColor: typeColors[appt.type]?.border || '#D5C8E0' }}>
                            <div className="flex justify-between items-start mb-0.5">
                              <span className="text-[9px] font-bold uppercase tracking-wide" style={{ color: typeColors[appt.type]?.text || '#6E5580' }}>
                                {typeColors[appt.type]?.short || appt.type}
                              </span>
                            </div>
                            <span className="text-[11px] font-bold text-[#2A2925] leading-snug">{appt.customer}</span>
                            <span className="text-[9px] text-[#736E64] leading-tight">{appt.startTime}-{appt.endTime}</span>
                          </div>
                        )
                      ))}

                    </div>
                  </div>
                </div>

                {/* Card Footer Legend */}
                <div className="border-t border-[#E6E0D4] bg-[#FFFEFB] py-2.5 px-4 flex justify-between items-center text-[10.5px] text-[#736E64] shrink-0">
                  <div className="flex items-center gap-5">
                    <span className="font-normal text-[#58534A]">Status:</span>
                    <div className="flex items-center gap-1.5 text-[#4B7355] font-bold"><CheckCircle2 className="w-3.5 h-3.5" /><span>Completed</span></div>
                    <div className="flex items-center gap-1.5 text-[#9A5530] font-bold"><RefreshCw className="w-3.5 h-3.5" /><span>Changed</span></div>
                    <div className="flex items-center gap-1.5 text-[#867540] font-bold"><Info className="w-3.5 h-3.5" /><span>Action required</span></div>
                    <div className="flex items-center gap-1.5 text-[#A13C28] font-bold"><AlertTriangle className="w-3.5 h-3.5" /><span>Conflict</span></div>
                  </div>
                  <div>
                    Hover over an appointment for details · click for project panel
                  </div>
                </div>
              </div>

              {/* Right Sidebar: Pill when collapsed, Detail Panel when appointment selected */}
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
                      Project details · select an appointment
                    </span>
                  </div>
                </div>
              ) : (
                <AnimatePresence>
                  <motion.div 
                    key={selectedAppointment.customer}
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
                          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-md uppercase tracking-wide" style={{ backgroundColor: typeColors[selectedAppointment.type]?.fill || '#F0EAF4', color: typeColors[selectedAppointment.type]?.text || '#6E5580', border: `1px solid ${typeColors[selectedAppointment.type]?.border || '#D5C8E0'}` }}>
                            {typeColors[selectedAppointment.type]?.short || selectedAppointment.type}
                          </span>
                          <span className="text-[11px] font-mono text-[#736E64] font-bold">{selectedAppointment.projectRef || 'PRJ-109'}</span>
                        </div>
                        <h2 className="text-[22px] font-heading font-bold text-[#2A2925] mb-1 leading-tight">{selectedAppointment.customer}</h2>
                        {selectedAppointment.product && <p className="text-[13px] text-[#58534A] leading-snug">{selectedAppointment.product}</p>}
                        {selectedAppointment.location && <p className="text-[13px] text-[#736E64] mt-0.5">{selectedAppointment.location}</p>}
                      </div>
                      <button onClick={() => setSelectedAppointment(null)} className="p-1.5 hover:bg-[#F7F4EE] rounded-md border border-[#E6E0D4] mt-1 transition-colors">
                        <ChevronRight className="w-4 h-4 text-[#58534A]" />
                      </button>
                    </div>

                    {/* Scrollable Body */}
                    <div className="p-5 overflow-y-auto flex-1 min-h-0 space-y-4">
                      {/* Conflict Alert Box */}
                      {selectedAppointment.status === 'Conflict' && (
                        <div className="bg-[#FBF0EC] border border-[#EBC9C0] rounded-xl p-3.5">
                          <div className="flex items-center gap-1.5 text-[#A13C28] font-bold text-xs mb-1.5">
                            <AlertTriangle className="w-4 h-4 shrink-0" /> Planning conflict
                          </div>
                          <p className="text-[12px] text-[#2A2925] leading-relaxed mb-3">
                            {selectedAppointment.partner || 'CraftWood Veluwe'} is simultaneously scheduled for delivery at {selectedAppointment.conflictWith || 'Fam. Visser in Leusden (09:30–12:30)'}.
                          </p>
                          <div className="flex gap-2">
                            <button className="bg-[#3E4A3D] text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-[#2A3329] transition-colors">Choose another partner</button>
                            <button className="bg-white border border-[#D6CFC2] text-[#2A2925] px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-[#F7F4EE] transition-colors">Shift time</button>
                          </div>
                        </div>
                      )}

                      {/* Details Table */}
                      <div className="space-y-2.5 text-[13px] border-b border-[#E6E0D4] pb-4">
                        <div className="flex items-start justify-between">
                          <span className="w-28 text-[#736E64] shrink-0">Date</span>
                          <span className="font-medium text-[#2A2925]">{selectedAppointment.date || '–'}</span>
                        </div>
                        <div className="flex items-start justify-between">
                          <span className="w-28 text-[#736E64] shrink-0">Time</span>
                          <span className="font-mono font-medium text-[#2A2925]">
                            {selectedAppointment.startTime && selectedAppointment.endTime ? `${selectedAppointment.startTime}–${selectedAppointment.endTime}` : '–'}
                          </span>
                        </div>
                        <div className="flex items-start justify-between">
                          <span className="w-28 text-[#736E64] shrink-0">Executed by</span>
                          <span className="font-medium text-[#2A2925]">{selectedAppointment.partner || '–'}</span>
                        </div>
                        <div className="flex items-start justify-between">
                          <span className="w-28 text-[#736E64] shrink-0">Status</span>
                          <span className={`font-bold ${selectedAppointment.status === 'Conflict' ? 'text-[#A13C28]' : 'text-[#4B7355]'}`}>
                            {selectedAppointment.status || 'Confirmed'}
                          </span>
                        </div>
                      </div>

                      {/* Voortgang Project */}
                      {selectedAppointment.progress && (() => {
                        const steps = [
                          { key: 'site_visit', label: 'Site visit', date: 'Aug 28' },
                          { key: 'design', label: 'Design & quote', date: 'Sep 5' },
                          { key: 'build', label: 'Build or delivery', date: selectedAppointment.date || 'Wed Sep 30' },
                          { key: 'handover', label: 'Handover', date: 'Mon Oct 5' },
                          { key: 'service', label: 'Service', date: '–' },
                        ];
                        const progress = selectedAppointment.progress;
                        const currentIdx = steps.findLastIndex(s => progress.includes(s.key));
                        return (
                          <div>
                            <h4 className="text-[10px] font-bold text-[#736E64] uppercase tracking-widest mb-3">PROJECT PROGRESS</h4>
                            <div className="space-y-0">
                              {steps.map((step, idx) => {
                                const isDone = progress.includes(step.key) && idx < currentIdx;
                                const isCurrent = idx === currentIdx;
                                const isPending = idx > currentIdx;
                                return (
                                  <div key={step.key} className="flex items-stretch gap-3">
                                    <div className="flex flex-col items-center w-3">
                                      <div className={`w-3 h-3 rounded-full shrink-0 mt-0.5 ${
                                        isDone ? 'bg-[#4B7355]' :
                                        isCurrent ? 'border-2 border-[#9A5530] bg-white' :
                                        'border border-[#D6CFC2] bg-white'
                                      }`}></div>
                                      {idx < steps.length - 1 && (
                                        <div className={`w-px flex-1 my-1 ${isDone ? 'bg-[#4B7355]' : 'bg-[#E6E0D4]'}`}></div>
                                      )}
                                    </div>
                                    <div className="flex-1 flex justify-between items-start pb-2.5 text-[12.5px]">
                                      <span className={isCurrent ? 'font-bold text-[#9A5530]' : isPending ? 'text-[#736E64]' : 'text-[#2A2925]'}>
                                        {step.label}
                                      </span>
                                      <span className="text-[#736E64] font-mono text-[11px]">{step.date}</span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })()}

                      {/* Contact & Adres */}
                      {selectedAppointment.contact && (
                        <div className="border-t border-[#E6E0D4] pt-3.5 space-y-2 text-[12.5px]">
                          <div className="flex items-start justify-between">
                            <span className="w-24 text-[#736E64] shrink-0">Contact</span>
                            <span className="font-medium text-[#2A2925] text-right">{selectedAppointment.contact} · {selectedAppointment.phone}</span>
                          </div>
                          <div className="flex items-start justify-between">
                            <span className="w-24 text-[#736E64] shrink-0">Address</span>
                            <span className="font-medium text-[#2A2925] text-right">{selectedAppointment.address}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Footer Buttons */}
                    <div className="p-4 border-t border-[#E6E0D4] flex gap-2 shrink-0 bg-[#FFFEFB] mt-auto">
                      <button className="flex-1 py-2 border border-[#D6CFC2] rounded-xl text-[13px] font-bold bg-white hover:bg-[#F7F4EE] text-[#2A2925] transition-colors">
                        Open project
                      </button>
                      <button className="flex-1 py-2 bg-[#3E4A3D] rounded-xl text-[13px] font-bold text-white hover:bg-[#2A3329] transition-colors">
                        Edit appointment
                      </button>
                    </div>
                  </motion.div>
                </AnimatePresence>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col pr-4">
            {/* Task Agenda View */}
            <div className="flex justify-between items-center mb-5 mt-2 pt-1">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <button className="px-3 py-1.5 bg-transparent border border-[#E6E0D4] rounded-xl hover:bg-white text-[#2A2925] transition-colors"><ChevronLeft className="w-4 h-4" /></button>
                  <button className="px-4 py-1.5 bg-transparent border border-[#E6E0D4] rounded-xl text-[13px] font-bold hover:bg-white text-[#2A2925] transition-colors">Today</button>
                  <button className="px-3 py-1.5 bg-transparent border border-[#E6E0D4] rounded-xl hover:bg-white text-[#2A2925] transition-colors"><ChevronRight className="w-4 h-4" /></button>
                </div>
                <div className="text-[22px] font-heading font-medium text-[#2A2925] flex items-center gap-3 whitespace-nowrap">
                  28 sep – 4 okt
                  <span className="text-[10px] font-body bg-transparent border border-[#E6E0D4] text-[#736E64] px-1.5 py-0.5 rounded uppercase font-bold">WEEK 40</span>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-3 text-[13px] font-medium text-[#58534A] cursor-pointer">
                  <div className="relative">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-9 h-5 bg-[#E6E0D4] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#A5C0A5]"></div>
                  </div>
                  Completede tonen
                </label>
                <div className="flex bg-[#FFFEFB] border border-[#E6E0D4] rounded-xl p-1 text-[13px] font-bold shadow-sm">
                  <button className="px-4 py-1 bg-white border border-[#E6E0D4] text-[#2A2925] rounded-lg shadow-sm">Bram & Tim</button>
                  <button className="px-4 py-1 text-[#736E64] hover:text-[#2A2925] rounded-lg transition-colors">Bram</button>
                  <button className="px-4 py-1 text-[#736E64] hover:text-[#2A2925] rounded-lg transition-colors">Tim</button>
                </div>
              </div>
            </div>

            <div className="flex gap-6 flex-1 min-h-0">
              {/* Bram Column */}
              <div className="flex-1 bg-[#FFFEFB] border border-[#E6E0D4] rounded-[14px] flex flex-col overflow-hidden shadow-sm">
                <div className="p-5 border-b border-[#E6E0D4] flex justify-between items-center shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#3E4A3D] text-white flex items-center justify-center text-[11px] font-bold tracking-wider">BR</div>
                    <span className="font-heading text-[22px] font-medium text-[#2A2925]">Bram</span>
                  </div>
                  <span className="text-[13px] text-[#736E64] font-medium">9 open</span>
                </div>
                <div className="p-5 overflow-y-auto space-y-6">
                  {/* OVERDUE */}
                  <div>
                    <h4 className="text-[10px] font-bold text-[#A13C28] mb-3 uppercase tracking-widest">OVERDUE</h4>
                    <div className="flex items-center justify-between py-2.5 border-b border-[#E6E0D4]">
                      <div className="flex items-center gap-3.5">
                        <div className="w-4 h-4 rounded-[3px] border border-[#D6CFC2] flex-shrink-0"></div>
                        <span className="text-[13px] text-[#2A2925]">Send quote <span className="text-[#736E64]">· Fam. Mulder</span></span>
                      </div>
                      <span className="font-mono text-[11px] font-bold text-[#A13C28]">vr 2Sep 5</span>
                    </div>
                  </div>
                  
                  {/* MONDAY */}
                  <div>
                    <h4 className="text-[10px] font-bold text-[#736E64] uppercase tracking-widest">MONDAY SEP 28 <span className="text-[#A5C0A5] ml-1">2 afgerond</span></h4>
                  </div>
                  
                  {/* VANDAAG */}
                  <div>
                    <h4 className="text-[10px] font-bold text-[#4B7355] mb-3 uppercase tracking-widest">VANDAAG · TUESDAY SEP 29</h4>
                    <div className="flex items-center justify-between py-2.5 border-b border-[#E6E0D4]">
                      <div className="flex items-center gap-3.5">
                        <div className="w-4 h-4 rounded-[3px] border border-[#D6CFC2] flex-shrink-0"></div>
                        <span className="text-[13px] text-[#2A2925]">Site visit <span className="text-[#736E64]">· Fam. Peters</span></span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] border border-[#D6CFC2] text-[#58534A] px-2 py-0.5 rounded-full font-bold">Afspraak</span>
                        <span className="font-mono text-[11px] font-bold text-[#2A2925]">10:00</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between py-2.5 border-b border-[#E6E0D4]">
                      <div className="flex items-center gap-3.5">
                        <div className="w-4 h-4 rounded-[3px] border border-[#D6CFC2] flex-shrink-0"></div>
                        <span className="text-[13px] text-[#2A2925]">Resolve delivery conflict Janssen / Visser</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[10.5px] text-[#B96A38] font-bold">Important</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between py-2.5 border-b border-[#E6E0D4]">
                      <div className="flex items-center gap-3.5">
                        <div className="w-4 h-4 rounded-[3px] border border-[#D6CFC2] flex-shrink-0"></div>
                        <span className="text-[13px] text-[#2A2925]">Extend poolhouse ad</span>
                      </div>
                    </div>
                  </div>

                  {/* WEDNESDAY */}
                  <div>
                    <h4 className="text-[10px] font-bold text-[#736E64] mb-3 uppercase tracking-widest">WEDNESDAY SEP 30</h4>
                    <div className="flex items-center justify-between py-2.5 border-b border-[#E6E0D4]">
                      <div className="flex items-center gap-3.5">
                        <div className="w-4 h-4 rounded-[3px] border border-[#D6CFC2] flex-shrink-0"></div>
                        <span className="text-[13px] text-[#2A2925]">Call for remaining payment <span className="text-[#736E64]">· Fam. De Graaf</span></span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[10.5px] text-[#B96A38] font-bold">Important</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between py-2.5 border-b border-[#E6E0D4]">
                      <div className="flex items-center gap-3.5">
                        <div className="w-4 h-4 rounded-[3px] border border-[#D6CFC2] flex-shrink-0"></div>
                        <span className="text-[13px] text-[#2A2925]">Prepare price indication <span className="text-[#736E64]">· Fam. Peters</span></span>
                      </div>
                    </div>
                  </div>

                  {/* FRIDAY */}
                  <div>
                    <h4 className="text-[10px] font-bold text-[#736E64] mb-3 uppercase tracking-widest">FRIDAY OCT 2</h4>
                    <div className="flex items-center justify-between py-2.5 border-b border-[#E6E0D4]">
                      <div className="flex items-center gap-3.5">
                        <div className="w-4 h-4 rounded-[3px] border border-[#D6CFC2] flex-shrink-0"></div>
                        <span className="text-[13px] text-[#2A2925]">Handover <span className="text-[#736E64]">· Fam. De Graaf</span></span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] border border-[#D6CFC2] text-[#58534A] px-2 py-0.5 rounded-full font-bold">Afspraak</span>
                        <span className="font-mono text-[11px] font-bold text-[#2A2925]">14:00</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between py-2.5 border-b border-[#E6E0D4]">
                      <div className="flex items-center gap-3.5">
                        <div className="w-4 h-4 rounded-[3px] border border-[#D6CFC2] flex-shrink-0"></div>
                        <span className="text-[13px] text-[#2A2925]">Send review request <span className="text-[#736E64]">· Fam. De Graaf</span></span>
                      </div>
                    </div>
                  </div>

                  {/* SATURDAY */}
                  <div>
                    <h4 className="text-[10px] font-bold text-[#736E64] mb-3 uppercase tracking-widest">SATURDAY OCT 3</h4>
                    <div className="flex items-center justify-between py-2.5 border-b border-[#E6E0D4] border-transparent">
                      <div className="flex items-center gap-3.5">
                        <div className="w-4 h-4 rounded-[3px] border border-[#D6CFC2] flex-shrink-0"></div>
                        <span className="text-[13px] text-[#2A2925]">Available during deliveryen Dekker en Bos</span>
                      </div>
                      <span className="font-mono text-[11px] font-bold text-[#736E64]">08:00–15:30</span>
                    </div>
                  </div>

                </div>
              </div>

              {/* Tim Column */}
              <div className="flex-1 bg-[#FFFEFB] border border-[#E6E0D4] rounded-[14px] flex flex-col overflow-hidden shadow-sm">
                <div className="p-5 border-b border-[#E6E0D4] flex justify-between items-center shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#8A7961] text-white flex items-center justify-center text-[11px] font-bold tracking-wider">TI</div>
                    <span className="font-heading text-[22px] font-medium text-[#2A2925]">Tim</span>
                  </div>
                  <span className="text-[13px] text-[#736E64] font-medium">9 open</span>
                </div>
                <div className="p-5 overflow-y-auto space-y-6">
                  {/* OVERDUE */}
                  <div>
                    <h4 className="text-[10px] font-bold text-[#A13C28] mb-3 uppercase tracking-widest">OVERDUE</h4>
                    <div className="flex items-center justify-between py-2.5 border-b border-[#E6E0D4]">
                      <div className="flex items-center gap-3.5">
                        <div className="w-4 h-4 rounded-[3px] border border-[#D6CFC2] flex-shrink-0"></div>
                        <span className="text-[13px] text-[#2A2925]">Send invoice term 2 <span className="text-[#736E64]">· Fam. Smit</span></span>
                      </div>
                      <span className="font-mono text-[11px] font-bold text-[#A13C28]">sat sep 26</span>
                    </div>
                  </div>
                  
                  {/* MONDAY */}
                  <div>
                    <h4 className="text-[10px] font-bold text-[#736E64] uppercase tracking-widest">MONDAY SEP 28 <span className="text-[#A5C0A5] ml-1">1 afgerond</span></h4>
                  </div>
                  
                  {/* VANDAAG */}
                  <div>
                    <h4 className="text-[10px] font-bold text-[#4B7355] mb-3 uppercase tracking-widest">VANDAAG · TUESDAY SEP 29</h4>
                    <div className="flex items-center justify-between py-2.5 border-b border-[#E6E0D4]">
                      <div className="flex items-center gap-3.5">
                        <div className="w-4 h-4 rounded-[3px] border border-[#D6CFC2] flex-shrink-0"></div>
                        <span className="text-[13px] text-[#2A2925]">Discuss drawing <span className="text-[#736E64]">· Fam. Kok</span></span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[10.5px] text-[#B96A38] font-bold">Important</span>
                        <span className="text-[10px] border border-[#D6CFC2] text-[#58534A] px-2 py-0.5 rounded-full font-bold">Afspraak</span>
                        <span className="font-mono text-[11px] font-bold text-[#2A2925]">13:00</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between py-2.5 border-b border-[#E6E0D4]">
                      <div className="flex items-center gap-3.5">
                        <div className="w-4 h-4 rounded-[3px] border border-[#D6CFC2] flex-shrink-0"></div>
                        <span className="text-[13px] text-[#2A2925]">Share visit report with partner <span className="text-[#736E64]">· Fam. Bakker-Verhoe...</span></span>
                      </div>
                    </div>
                  </div>

                  {/* WEDNESDAY */}
                  <div>
                    <h4 className="text-[10px] font-bold text-[#736E64] mb-3 uppercase tracking-widest">WEDNESDAY SEP 30</h4>
                    <div className="flex items-center justify-between py-2.5 border-b border-[#E6E0D4]">
                      <div className="flex items-center gap-3.5">
                        <div className="w-4 h-4 rounded-[3px] border border-[#D6CFC2] flex-shrink-0"></div>
                        <span className="text-[13px] text-[#2A2925]">Check deposit <span className="text-[#736E64]">· Fam. Visser</span></span>
                      </div>
                    </div>
                  </div>

                  {/* THURSDAY */}
                  <div>
                    <h4 className="text-[10px] font-bold text-[#736E64] mb-3 uppercase tracking-widest">THURSDAY OCT 1</h4>
                    <div className="flex items-center justify-between py-2.5 border-b border-[#E6E0D4]">
                      <div className="flex items-center gap-3.5">
                        <div className="w-4 h-4 rounded-[3px] border border-[#D6CFC2] flex-shrink-0"></div>
                        <span className="text-[13px] text-[#2A2925]">Site visit <span className="text-[#736E64]">· Fam. Willems</span></span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] border border-[#D6CFC2] text-[#58534A] px-2 py-0.5 rounded-full font-bold">Afspraak</span>
                        <span className="font-mono text-[11px] font-bold text-[#2A2925]">15:30</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between py-2.5 border-b border-[#E6E0D4]">
                      <div className="flex items-center gap-3.5">
                        <div className="w-4 h-4 rounded-[3px] border border-[#D6CFC2] flex-shrink-0"></div>
                        <span className="text-[13px] text-[#2A2925]">Discuss build progress with Hout & Steen <span className="text-[#736E64]">· Fam. Van Dijk</span></span>
                      </div>
                    </div>
                  </div>

                  {/* FRIDAY */}
                  <div>
                    <h4 className="text-[10px] font-bold text-[#736E64] mb-3 uppercase tracking-widest">FRIDAY OCT 2</h4>
                    <div className="flex items-center justify-between py-2.5 border-b border-[#E6E0D4]">
                      <div className="flex items-center gap-3.5">
                        <div className="w-4 h-4 rounded-[3px] border border-[#D6CFC2] flex-shrink-0"></div>
                        <span className="text-[13px] text-[#2A2925]">Weekly accounting closing</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between py-2.5 border-b border-[#E6E0D4]">
                      <div className="flex items-center gap-3.5">
                        <div className="w-4 h-4 rounded-[3px] border border-[#D6CFC2] flex-shrink-0"></div>
                        <span className="text-[13px] text-[#2A2925]">Post project photos <span className="text-[#736E64]">· Fam. De Graaf</span></span>
                      </div>
                    </div>
                  </div>

                  {/* SUNDAY */}
                  <div>
                    <h4 className="text-[10px] font-bold text-[#736E64] mb-3 uppercase tracking-widest">SUNDAY OCT 4</h4>
                    <div className="flex items-center justify-between py-2.5 border-b border-[#E6E0D4] border-transparent">
                      <div className="flex items-center gap-3.5">
                        <div className="w-4 h-4 rounded-[3px] border border-[#D6CFC2] flex-shrink-0"></div>
                        <span className="text-[13px] text-[#2A2925]">Available during delivery <span className="text-[#736E64]">· Fam. Kuipers</span></span>
                      </div>
                      <span className="font-mono text-[11px] font-bold text-[#736E64]">10:00–13:00</span>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Dummy Modal for "New planning" */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-[#F7F4EE] rounded-2xl border border-[#E6E0D4] shadow-xl w-[500px] overflow-hidden"
            >
              <div className="p-5 border-b border-[#E6E0D4] flex justify-between items-center bg-[#FFFEFB]">
                <h2 className="text-xl font-heading font-bold text-[#2A2925]">{activeTab === 'Project Planning' ? 'Add new planning' : 'Add new task'}</h2>
                <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#F7F4EE] border border-transparent hover:border-[#E6E0D4] transition-colors">
                  <span className="text-[#58534A] font-bold">✕</span>
                </button>
              </div>
              <div className="p-6 space-y-4">
                <p className="text-sm text-[#736E64] italic mb-4">This is a mock-up screen. In the next phase this form will be linked to the database.</p>
                <div>
                  <label className="block text-xs font-bold text-[#58534A] mb-1">Customer / Project</label>
                  <select 
                    value={newApptData.customer}
                    onChange={(e) => setNewApptData({...newApptData, customer: e.target.value})}
                    className="w-full bg-white border border-[#E6E0D4] rounded-lg px-3 py-2 text-sm text-[#2A2925] outline-none">
                    <option value="Fam. Janssen">Fam. Janssen (PRJ-109)</option>
                    <option value="Fam. Visser">Fam. Visser (PRJ-113)</option>
                    <option value="Fam. De Graaf">Fam. De Graaf (PRJ-104)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#58534A] mb-1">Type</label>
                  <select 
                    value={newApptData.type}
                    onChange={(e) => setNewApptData({...newApptData, type: e.target.value})}
                    className="w-full bg-white border border-[#E6E0D4] rounded-lg px-3 py-2 text-sm text-[#2A2925] outline-none">
                    <option value="Site Visit">Site Visit</option>
                    <option value="Canopy Build">Canopy Build</option>
                    <option value="Kitchen Delivery">Kitchen Delivery</option>
                    <option value="Handover">Handover</option>
                    <option value="Service">Service</option>
                  </select>
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-[#58534A] mb-1">Date</label>
                    <input 
                      type="date" 
                      value={newApptData.date}
                      onChange={(e) => setNewApptData({...newApptData, date: e.target.value})}
                      className="w-full bg-white border border-[#E6E0D4] rounded-lg px-3 py-2 text-sm text-[#2A2925] outline-none" />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-[#58534A] mb-1">Time</label>
                    <input 
                      type="time" 
                      value={newApptData.time}
                      onChange={(e) => setNewApptData({...newApptData, time: e.target.value})}
                      className="w-full bg-white border border-[#E6E0D4] rounded-lg px-3 py-2 text-sm text-[#2A2925] outline-none" />
                  </div>
                </div>
              </div>
              <div className="p-4 border-t border-[#E6E0D4] bg-[#FFFEFB] flex justify-end gap-3">
                <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-lg text-sm font-bold text-[#58534A] hover:bg-[#F7F4EE] transition-colors">Cancel</button>
                <button onClick={handleSave} className="px-5 py-2 bg-[#3E4A3D] text-white rounded-lg text-sm font-bold hover:bg-[#2A3329] transition-colors">Save</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
