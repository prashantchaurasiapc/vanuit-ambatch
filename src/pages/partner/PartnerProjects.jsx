import React, { useState, useEffect, useRef } from 'react';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import { Calendar, Briefcase, Clock, Upload, FileText, CheckCircle, Eye, Edit3, X, Filter, MapPin, DollarSign, Download, Compass, ShieldCheck, FileCheck, Layers, Camera, Image as ImageIcon, Sparkles, Bell, MessageSquare, Send, Paperclip, Check } from 'lucide-react';
import { downloadBlueprintPdf } from '../../utils/pdfGenerator';

import { mockProjects } from '../../utils/mockData';
import { safeSetItem, compressImage } from '../../utils/storageHelper';
import { useNavigate } from 'react-router-dom';
import projectImg from '../../assets/outdoor_project_card.png';
import heroImg from '/dasbordes images.png';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../../context/LanguageContext';

export default function PartnerProjects() {
  const { t, language } = useLanguage();
  const label = (english, dutch) => language === 'EN' ? english : dutch;
  const fileInputRef = useRef(null);
  const [projects, setProjects] = useState([]);
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedProject, setSelectedProject] = useState(null);
  const [editProject, setEditProject] = useState(null);
  const [uploadPhotoProject, setUploadPhotoProject] = useState(null);
  const [photoForm, setPhotoForm] = useState({ title: '', desc: '', img: projectImg });
  const [toastMsg, setToastMsg] = useState('');
  
  // Default active logged-in partner name
  const currentPartnerName = 'Sven Hoek';

  // Load and Filter Only Assigned Projects for Current Partner
  useEffect(() => {
    const savedProjects = localStorage.getItem('app_projects');
    let allProjects = [];
    if (savedProjects) {
      try {
        const parsed = JSON.parse(savedProjects);
        if (Array.isArray(parsed) && parsed.length > 0) allProjects = parsed;
        else allProjects = mockProjects;
      } catch (e) { allProjects = mockProjects; }
    } else {
      allProjects = mockProjects;
    }

    // Enrich projects with Partner Portal specific specs
    const enriched = allProjects.map((p, idx) => ({
      ...p,
      deliveryAddress: p.deliveryAddress || (idx % 2 === 0 ? 'Keizersgracht 420, 1016 GC Amsterdam' : 'Parklaan 88, 2011 KM Haarlem'),
      agreedBuildPrice: p.agreedBuildPrice || (idx % 2 === 0 ? '€ 4,850.00' : '€ 3,400.00'),
      dimensions: p.dimensions || '350cm x 90cm x 95cm',
      frameMaterial: p.frameMaterial || 'Massief Teak Hout (FSC Certificaat)',
      topMaterial: p.topMaterial || 'Polijst Beton (Dark Grey)',
      blueprintFile: p.blueprintFile || `BLU-${p.id || '2001'}-SPEC.pdf`,
      partner: p.partner || (idx % 2 === 0 ? 'Sven Hoek' : 'Lars Jansen')
    }));

    const assignedAndConfirmedOnly = enriched.filter(p => {
      const isAssigned = (p.partner || '').toLowerCase().includes(currentPartnerName.toLowerCase()) || (p.partner || '').includes('Sven Hoek');
      const isConfirmed = p.isPartnerConfirmed === true || p.partnerStatus === 'Final / Locked' || true;
      return isAssigned && isConfirmed;
    });
    
    setProjects(assignedAndConfirmedOnly);
  }, []);

  // Default Partner Messages
  const defaultPartnerMsgs = [
    {
      id: 1,
      sender: 'Sven Hoek',
      initials: 'SH',
      role: 'partner',
      text: 'Slab is ready for cutting. Any changes before I begin?',
      time: 'today 09:52'
    },
    {
      id: 2,
      sender: 'Tim (Admin)',
      initials: 'T',
      role: 'admin',
      text: 'Yes — sink 15 cm to the left compared to drawing v2 (customer request). Work order updated. Will you send a photo of the marking before cutting?',
      time: 'Tim · 09:55 · ✓ read'
    },
    {
      id: 3,
      sender: 'Sven Hoek',
      initials: 'SH',
      role: 'partner',
      text: 'Great, on it. 📷 follows around 14:00.',
      time: 'today 09:57'
    }
  ];

  // Real-time Partner Messages synced with Admin Portal
  const [partnerMessages, setPartnerMessages] = useState(() => {
    try {
      const raw = localStorage.getItem('app_project_messages_2026_014');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.partner && Array.isArray(parsed.partner)) return parsed.partner;
      }
    } catch (e) {}
    return defaultPartnerMsgs;
  });

  const [partnerChatOpen, setPartnerChatOpen] = useState(false);
  const [inputPartnerReply, setInputPartnerReply] = useState('');

  // Sync listener for real-time messages sent by Admin
  useEffect(() => {
    const handleSync = () => {
      try {
        const raw = localStorage.getItem('app_project_messages_2026_014');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed.partner && Array.isArray(parsed.partner)) {
            setPartnerMessages(parsed.partner);
          }
        }
      } catch (e) {}
    };

    window.addEventListener('app_messages_updated', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('app_messages_updated', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  const handleSendPartnerReply = (e) => {
    if (e) e.preventDefault();
    if (!inputPartnerReply.trim()) return;

    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newMsg = {
      id: Date.now(),
      sender: 'Sven Hoek (Partner)',
      initials: 'SH',
      role: 'partner',
      text: inputPartnerReply.trim(),
      time: `today ${timeNow}`
    };

    try {
      const raw = localStorage.getItem('app_project_messages_2026_014');
      const parsed = raw ? JSON.parse(raw) : { customer: [], partner: defaultPartnerMsgs };
      const nextPartner = [...(parsed.partner || []), newMsg];
      localStorage.setItem('app_project_messages_2026_014', JSON.stringify({ ...parsed, partner: nextPartner }));
      setPartnerMessages(nextPartner);
      window.dispatchEvent(new Event('app_messages_updated'));
    } catch (e) {}

    setInputPartnerReply('');
    showToast(label('✓ Message sent to Vanuit Ambacht (Tim & Bram)!', '✓ Bericht verzonden naar Vanuit Ambacht (Tim & Bram)!'));
  };

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const handleUpdateProgress = (e) => {
    e.preventDefault();
    if (!editProject) return;

    // Update state and localStorage
    const savedProjects = localStorage.getItem('app_projects');
    let allProjects = savedProjects ? JSON.parse(savedProjects) : mockProjects;

    const updatedAll = allProjects.map(p => p.id === editProject.id ? { ...p, status: editProject.status, progress: editProject.progress } : p);
    localStorage.setItem('app_projects', JSON.stringify(updatedAll));

    setProjects(prev => prev.map(p => p.id === editProject.id ? editProject : p));
    showToast(`Project "${editProject.name}" voortgang bijgewerkt!`);
    setEditProject(null);
  };

  // Device File Upload Handler for Partner
  const handleDeviceFileSelect = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    try {
      const compressedSrc = await compressImage(file, 1200, 0.82);
      setPhotoForm(prev => ({ ...prev, img: compressedSrc }));
      showToast(language === 'EN' ? '✓ Image file selected & compressed successfully!' : '✓ Foto geselecteerd en gecomprimeerd!');
    } catch (err) {
      console.warn('Compress image error:', err);
    }
  };

  // REVERSE FLOW: Partner uploads photo -> Notifies Admin & Updates Customer Portal Photos
  const handleUploadPartnerPhoto = (e) => {
    e.preventDefault();
    if (!uploadPhotoProject) return;

    const newPhoto = {
      id: `P-${Date.now().toString().slice(-4)}`,
      projectId: uploadPhotoProject.id,
      projectName: uploadPhotoProject.name,
      customer: uploadPhotoProject.customer || 'Customer',
      title: photoForm.title.trim() || 'Voortgangsfoto Uit Werkplaats',
      phase: `Fasedatum: ${new Date().toLocaleDateString(language === 'NL' ? 'nl-NL' : 'en-US', { day: '2-digit', month: 'short', year: 'numeric' })}`,
      description: photoForm.desc.trim() || 'Foto geüpload door vakman.',
      img: photoForm.img || projectImg,
      craftsman: currentPartnerName,
      uploaderRole: 'partner',
      isShared: true,
      createdAt: new Date().toISOString()
    };

    // 1. Save to app_project_photos safely
    const existingPhotosStr = localStorage.getItem('app_project_photos');
    const existingPhotos = existingPhotosStr ? JSON.parse(existingPhotosStr) : [];
    const updatedPhotos = [newPhoto, ...existingPhotos];
    safeSetItem('app_project_photos', updatedPhotos);

    // 2. Save Notification for Admin in app_admin_notifications
    const newAdminNotif = {
      id: `NOTIF-${Date.now()}`,
      type: 'partner_photo_upload',
      title: `📸 Nieuwe Foto Geüpload voor Project ${uploadPhotoProject.id}!`,
      message: `Vakman ${currentPartnerName} heeft een nieuwe voortgangsfoto geüpload voor project "${uploadPhotoProject.name}" (${uploadPhotoProject.id}).`,
      projectName: uploadPhotoProject.name,
      projectId: uploadPhotoProject.id,
      partnerName: currentPartnerName,
      photoTitle: newPhoto.title,
      time: new Date().toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' }),
      date: new Date().toISOString().split('T')[0],
      unread: true
    };
    const savedNotifs = JSON.parse(localStorage.getItem('app_admin_notifications') || '[]');
    safeSetItem('app_admin_notifications', [newAdminNotif, ...savedNotifs]);

    window.dispatchEvent(new Event('app_data_changed'));
    showToast(language === 'EN' 
      ? `📸 Photo uploaded for Project ${uploadPhotoProject.id}! Admin notified of progress update!` 
      : `📸 Foto geüpload voor Project ${uploadPhotoProject.id}! Beheerder is per melding op de hoogte gebracht!`);

    setUploadPhotoProject(null);
    setPhotoForm({ title: '', desc: '', img: projectImg });
  };

  // Real PDF Blueprint download via jsPDF — direct file, no popup
  const handleDownloadBlueprint = (fileName) => {
    const projectObj = {
      id: fileName || 'BLU-2001',
      name: selectedProject?.name || 'Buitenkeuken Project',
      customer: selectedProject?.customer || 'Klant',
      partner: selectedProject?.partnerName || 'Tim & Bram',
      deadline: selectedProject?.deadline || '—',
      progress: selectedProject?.progress || 0,
      dimensions: selectedProject?.dimensions || '350cm × 90cm × 95cm',
      frameMaterial: selectedProject?.frameMaterial || 'Massief Teak Hout',
      topMaterial: selectedProject?.topMaterial || 'Polijst Beton',
      deliveryAddress: selectedProject?.deliveryAddress || '—',
    };
    const realFileName = downloadBlueprintPdf(projectObj);
    showToast(`Blueprint PDF gedownload: ${realFileName}`);
  };

  const filteredProjects = statusFilter === 'All' 
    ? projects 
    : projects.filter(p => p.status === statusFilter);

  return (
    <div className="space-y-6 font-body text-[#4A4A43] relative">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div initial={{ opacity: 0, x: 80 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 80 }} className="fixed top-20 right-4 z-[9999] flex items-center gap-2 bg-primary text-cream px-4 py-3 rounded-xl shadow-lg text-xs font-body">
            <CheckCircle className="w-4 h-4 text-green-400" />
            {toastMsg}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-heading font-bold text-primary">{label('My Assigned Projects', 'Mijn toegewezen projecten')}</h2>
            <Badge variant="primary" className="text-xs">Partner: {currentPartnerName}</Badge>
          </div>
          <p className="text-dark/60 text-sm mt-0.5">{label('Overview of your assigned delivery projects, specifications, delivery locations and agreed build price.', 'Overzicht van uw toegewezen opleverprojecten, specificaties, opleverlocaties en overeengekomen bouwsom.')}</p>
        </div>
      </div>

      {/* Status Summary Filter Cards — Ultra-Compact Mini Cards (32px height) */}
      <div className="grid grid-cols-3 gap-1.5 sm:gap-3">
        {[
          { key: 'All', label: label('Assigned', 'Toegewezen'), count: projects.length, color: 'border-l-primary' },
          { key: 'In Progress', label: label('In Progress', 'In uitvoering'), count: projects.filter(p => p.status === 'In Progress').length, color: 'border-l-accent' },
          { key: 'Completed', label: label('Completed', 'Afgerond'), count: projects.filter(p => p.status === 'Completed').length, color: 'border-l-green-600' },
        ].map((s) => (
          <button
            key={s.key}
            onClick={() => setStatusFilter(s.key)}
            className={`text-left transition-all min-w-0 ${statusFilter === s.key ? 'scale-[1.01]' : 'opacity-85 hover:opacity-100'}`}
          >
            <Card noPadding className={`border-l-3 ${s.color} cursor-pointer px-2.5 py-1.5 sm:px-3 sm:py-2 ${statusFilter === s.key ? 'bg-white shadow-xs ring-1 ring-primary/30' : 'bg-[#EDE8DF]/60'}`}>
              <div className="flex items-center justify-between gap-1">
                <span className="text-[9px] sm:text-[11px] text-dark/60 font-body font-bold uppercase tracking-wider truncate">
                  {s.label}
                </span>
                <span className="text-xs sm:text-base font-heading font-bold text-primary flex-shrink-0">
                  {s.count}
                </span>
              </div>
            </Card>
          </button>
        ))}
      </div>

      {/* Assigned Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
        {filteredProjects.map(project => (
          <Card key={project.id} noPadding className="overflow-hidden hover:shadow-card-hover transition-shadow flex flex-col justify-between">
            <div>
              {/* Image & Division Header */}
              <div className="relative h-36 sm:h-44 overflow-hidden bg-cream-dark/20">
                <img src={projectImg} alt={project.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/95 via-primary/50 to-transparent"></div>
                
                <div className="absolute top-2.5 right-2.5 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-lg border border-[#D6CFC2] shadow-xs flex items-center gap-1.5">
                  <img
                    src={
                      project.name.toLowerCase().includes('snijplanken') || project.name.toLowerCase().includes('utrecht')
                        ? '/logo_snijplanken.png'
                        : '/logo_buitenkeukens.png'
                    }
                    alt="Division Logo"
                    className="h-4 max-w-[60px] object-contain mix-blend-multiply"
                  />
                  <span className="text-[10px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded-md whitespace-nowrap">
                    {project.name.toLowerCase().includes('snijplanken') || project.name.toLowerCase().includes('utrecht')
                      ? 'Snijplanken'
                      : 'Buitenkeukens'}
                  </span>
                </div>

                <div className="absolute bottom-2.5 left-3 right-3 flex items-end justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-mono text-cream/80 font-bold block">{project.id}</span>
                    <h3 className="font-heading font-bold text-white text-sm sm:text-base leading-snug truncate">{project.name}</h3>
                  </div>
                  <Badge variant={project.status === 'Completed' ? 'success' : project.status === 'In Progress' ? 'primary' : 'warning'} className="flex-shrink-0 text-[10px]">
                    {project.status}
                  </Badge>
                </div>
              </div>

              {/* Specs & Pricing Details */}
              <div className="p-3 sm:p-4 space-y-2.5 text-xs">
                {/* Agreed Build Price & Deadline */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-2.5 bg-[#F8F7F4] rounded-xl border border-[#D6CFC2]/60">
                  <div>
                    <span className="text-[10px] text-dark/50 font-bold uppercase block">{label('Agreed Build Price', 'Overeengekomen bouwsom')}</span>
                    <span className="font-bold text-primary text-xs sm:text-sm">{project.agreedBuildPrice}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-dark/50 font-bold uppercase block">{label('Delivery Deadline', 'Opleverdeadline')}</span>
                    <span className="font-bold text-dark text-xs sm:text-sm flex items-center gap-1 mt-0.5"><Calendar className="w-3.5 h-3.5 text-accent" /> {project.deadline}</span>
                  </div>
                </div>

                {/* Delivery Address */}
                <div className="flex items-start gap-2 text-dark/80 bg-white p-2.5 rounded-xl border border-[#D6CFC2]/50">
                  <MapPin className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <span className="text-[10px] text-dark/50 font-bold uppercase block">{label('Delivery Location / Address', 'Opleverlocatie / bezorgadres')}</span>
                    <span className="font-semibold text-dark text-xs truncate block">{project.deliveryAddress}</span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-dark/60 font-semibold">{label('Progress', 'Voortgang')}</span>
                    <span className="font-bold text-primary font-mono">{project.progress || 0}%</span>
                  </div>
                  <div className="w-full bg-[#EDE8DF] rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full transition-all duration-500" style={{ width: `${project.progress || 0}%` }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="px-3 sm:px-4 pb-3.5 pt-1 flex flex-wrap gap-1.5">
              <Button size="sm" variant="outline" icon={Edit3} className="flex-1 text-xs justify-center whitespace-nowrap" onClick={() => setEditProject({ ...project })}>
                <span className="sm:hidden">{label('Voortgang', 'Voortgang')}</span>
                <span className="hidden sm:inline">{label('Update Progress', 'Voortgang bijwerken')}</span>
              </Button>
              <Button size="sm" variant="custom" icon={Camera} className="bg-[#555046] text-cream hover:bg-[#3E3A33] text-xs justify-center whitespace-nowrap px-2.5" onClick={() => { setUploadPhotoProject(project); setPhotoForm({ title: `${project.name} - Werkplaatsvoortgang`, desc: 'Kwaliteitscontrole en montage in werkplaats voltooid.', img: projectImg }); }}>
                <span>📸 {label('Photo', 'Foto')}</span>
              </Button>
              <Button size="sm" variant="custom" icon={MessageSquare} className="bg-[#283523] text-white hover:bg-[#1E291B] text-xs justify-center whitespace-nowrap px-2.5 font-bold shadow-xs cursor-pointer" onClick={() => setPartnerChatOpen(true)}>
                <span>💬 Chat ({partnerMessages.length})</span>
              </Button>
              <Button size="sm" icon={Eye} className="flex-1 text-xs justify-center whitespace-nowrap" onClick={() => setSelectedProject(project)}>
                <span className="sm:hidden">{label('Details', 'Details')}</span>
                <span className="hidden sm:inline">{label('Specs', 'Specificaties')}</span>
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* UPDATE PROGRESS MODAL */}
      <AnimatePresence>
        {editProject && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-[#EDE8DF] border border-[#C4BEB3] rounded-2xl p-6 w-full max-w-md space-y-4 shadow-2xl">
              <div className="flex justify-between items-center pb-2 border-b border-[#D6CFC2]">
                <h3 className="text-lg font-heading font-bold text-primary">Voortgang & Status Bijwerken</h3>
                <button onClick={() => setEditProject(null)} className="text-dark/40 hover:text-dark"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleUpdateProgress} className="space-y-4 text-xs">
                <div>
                  <label className="block text-dark/70 font-semibold mb-1 uppercase">Projectnaam</label>
                  <input type="text" disabled value={editProject.name} className="w-full p-2.5 bg-white/70 border border-[#D6CFC2] rounded-lg text-dark/60 font-bold" />
                </div>
                <div>
                  <label className="block text-dark/70 font-semibold mb-1 uppercase">Status</label>
                  <select
                    value={editProject.status}
                    onChange={e => setEditProject({ ...editProject, status: e.target.value })}
                    className="w-full p-2.5 bg-white border border-[#D6CFC2] rounded-lg text-dark font-bold focus:outline-none"
                  >
                    <option value="In Progress">In Progress (In Uitvoering)</option>
                    <option value="Review Required">Review Required (Ter Controle)</option>
                    <option value="Completed">Completed (Afgerond)</option>
                  </select>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <label className="text-dark/70 font-semibold uppercase">Voortgang Percentage</label>
                    <span className="font-bold text-primary font-mono">{editProject.progress}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={editProject.progress}
                    onChange={e => setEditProject({ ...editProject, progress: Number(e.target.value) })}
                    className="w-full accent-primary cursor-pointer h-2 bg-white rounded-lg"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2 border-t border-[#D6CFC2]">
                  <Button type="button" variant="outline" onClick={() => setEditProject(null)}>Annuleren</Button>
                  <Button type="submit">Opslaan</Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* VIEW DETAILED BLUEPRINT & SPECS MODAL */}
      <AnimatePresence>
        {selectedProject && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-[#EDE8DF] border border-[#C4BEB3] rounded-2xl p-6 w-full max-w-lg space-y-4 shadow-2xl text-xs max-h-[90vh] overflow-y-auto">
              
              <div className="flex justify-between items-start pb-3 border-b border-[#D6CFC2]">
                <div>
                  <span className="font-mono font-bold text-accent text-[10px] uppercase">Technical Specs & Blueprint Files</span>
                  <h3 className="text-xl font-heading font-bold text-primary mt-0.5">{selectedProject.name}</h3>
                </div>
                <button onClick={() => setSelectedProject(null)} className="text-dark/40 hover:text-dark p-1"><X className="w-5 h-5" /></button>
              </div>

              {/* Financial & Delivery Header */}
              <div className="grid grid-cols-2 gap-3 p-3 bg-white rounded-xl border border-[#D6CFC2]/60">
                <div>
                  <span className="text-dark/50 font-bold uppercase text-[10px] block">Overeengekomen Bouwsom</span>
                  <span className="text-base font-bold text-primary">{selectedProject.agreedBuildPrice}</span>
                </div>
                <div>
                  <span className="text-dark/50 font-bold uppercase text-[10px] block">Target Deadline</span>
                  <span className="font-bold text-dark">{selectedProject.deadline}</span>
                </div>
              </div>

              {/* Delivery Address */}
              <div className="p-3 bg-white rounded-xl border border-[#D6CFC2]/60 flex items-start gap-2">
                <MapPin className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <span className="text-dark/50 font-bold uppercase text-[10px] block">Opleverlocatie / Delivery Address</span>
                  <span className="font-bold text-dark">{selectedProject.deliveryAddress}</span>
                </div>
              </div>

              {/* Specs & Materials Breakdown */}
              <div className="space-y-2">
                <span className="text-dark/70 font-bold uppercase block text-[10px]">Technische Specificaties & Materialen</span>
                <div className="p-3 bg-white rounded-xl border border-[#D6CFC2]/60 space-y-1.5">
                  <p><span className="font-bold text-dark">Afmetingen:</span> {selectedProject.dimensions}</p>
                  <p><span className="font-bold text-dark">Frame Constructie:</span> {selectedProject.frameMaterial}</p>
                  <p><span className="font-bold text-dark">Aanrechtblad Afwerking:</span> {selectedProject.topMaterial}</p>
                  <p className="text-dark/70 pt-1 text-[11px] border-t border-[#D6CFC2]/40">
                    Geïntegreerde uitsparing voor Kamado grill, kabeldoorvoer voor verlichting, en roestvrijstalen stelpootjes.
                  </p>
                </div>
              </div>

              {/* AutoCAD Schematic Diagram & Blueprint Download Box */}
              <div className="p-4 bg-slate-900 text-cyan-400 rounded-xl border border-cyan-800 space-y-2 font-mono text-[11px]">
                <div className="flex justify-between items-center border-b border-cyan-800 pb-1 text-[9px] text-cyan-300">
                  <span>📐 TECHNICAL BLUEPRINT DIAGRAM</span>
                  <span>AUTOCAD 1:20 SPEC</span>
                </div>
                <div className="py-4 text-center border border-dashed border-cyan-700 rounded bg-slate-950/70">
                  <p className="text-cyan-200 font-bold">┌──────────────────────────────────────────────┐</p>
                  <p className="text-cyan-300">[ 3.5m TEAK FRAME ] ═══ [ CONCRETE SLAB ]</p>
                  <p className="text-cyan-200 font-bold">└──────────────────────────────────────────────┘</p>
                </div>
                
                <div className="pt-2 flex justify-between items-center">
                  <span className="text-cyan-300 text-[10px]">{selectedProject.blueprintFile}</span>
                  <button
                    onClick={() => handleDownloadBlueprint(selectedProject.blueprintFile)}
                    className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold rounded-lg text-[10px] flex items-center gap-1"
                  >
                    <Download className="w-3 h-3" /> Download PDF Blueprint
                  </button>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button onClick={() => setSelectedProject(null)}>Sluiten</Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* UPLOAD PARTNER PHOTO MODAL (NOTIFIES ADMIN & UPDATES CUSTOMER PORTAL) */}
      <AnimatePresence>
        {uploadPhotoProject && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-[#EDE8DF] border border-[#C4BEB3] rounded-2xl p-6 w-full max-w-md space-y-4 shadow-2xl text-xs font-body">
              <div className="flex justify-between items-center pb-2 border-b border-[#D6CFC2]">
                <div className="flex items-center gap-2">
                  <Camera className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-heading font-bold text-primary">
                    {language === 'EN' ? 'Upload Build Photo & Notify Admin' : 'Voortgangsfoto Uploaden & Beheerder Melden'}
                  </h3>
                </div>
                <button onClick={() => setUploadPhotoProject(null)} className="text-dark/40 hover:text-dark"><X className="w-5 h-5" /></button>
              </div>

              <form onSubmit={handleUploadPartnerPhoto} className="space-y-3">
                <div className="p-3 bg-white/80 rounded-xl border border-[#D6CFC2]/60 space-y-1">
                  <span className="text-[10px] text-dark/50 uppercase font-bold block">Gekoppeld Project</span>
                  <span className="font-bold text-primary text-sm block">{uploadPhotoProject.name} ({uploadPhotoProject.id})</span>
                  <span className="text-[11px] text-dark/60 font-mono block">Opleverlocatie: {uploadPhotoProject.deliveryAddress}</span>
                </div>

                <div>
                  <label className="block text-dark/70 font-semibold mb-1 uppercase tracking-wider">Foto Titel / Onderwerp *</label>
                  <input
                    type="text"
                    required
                    value={photoForm.title}
                    onChange={e => setPhotoForm(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full p-2.5 bg-white border border-[#D6CFC2] rounded-lg font-bold text-dark"
                    placeholder="e.g. Massief Teakhout Frame Gezaagd"
                  />
                </div>

                <div>
                  <label className="block text-dark/70 font-semibold mb-1 uppercase tracking-wider">Werkplaats Toelichting *</label>
                  <textarea
                    required
                    rows={3}
                    value={photoForm.desc}
                    onChange={e => setPhotoForm(prev => ({ ...prev, desc: e.target.value }))}
                    className="w-full p-2.5 bg-white border border-[#D6CFC2] rounded-lg text-dark"
                    placeholder="Korte toelichting over de voortgang..."
                  />
                </div>

                <div>
                  <label className="block text-dark/70 font-semibold mb-1 uppercase tracking-wider">{language === 'EN' ? 'Select Photo File (Device / Camera)' : 'Selecteer Foto (Bestand / Camera)'}</label>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-[#D6CFC2] p-4 rounded-xl text-center bg-white hover:bg-[#F8F7F4] transition-colors cursor-pointer space-y-1.5"
                  >
                    <ImageIcon className="w-6 h-6 text-primary mx-auto" />
                    <p className="text-xs font-bold text-primary">
                      {language === 'EN' ? 'Click to browse photo from phone / computer' : 'Klik om foto te kiezen vanaf computer / telefoon'}
                    </p>
                    <p className="text-[10px] text-dark/50">PNG, JPG, WEBP</p>
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      onChange={handleDeviceFileSelect}
                      className="hidden"
                    />
                  </div>

                  {/* Selected image preview */}
                  {photoForm.img && (
                    <div className="mt-2 relative rounded-xl overflow-hidden border border-[#D6CFC2] h-24 bg-black/10">
                      <img src={photoForm.img} alt="Selected Preview" className="w-full h-full object-cover" />
                      <span className="absolute bottom-1 right-1 bg-white/90 px-2 py-0.5 rounded text-[9px] font-bold text-primary">
                        ✓ Photo Ready
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-[11px] flex items-center gap-2">
                  <Bell className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <span>Beheerder (Tim & Bram) ontvangt direct een automatische melding bij het opslaan!</span>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-[#D6CFC2]">
                  <Button type="button" variant="outline" onClick={() => setUploadPhotoProject(null)}>Annuleren</Button>
                  <Button type="submit" icon={Upload} className="bg-primary text-cream font-bold">Foto Uploaden & Melden →</Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* PARTNER DIRECT CHAT MODAL (VANUIT AMBACHT ADMIN & WHATSAPP MIRROR) */}
      <AnimatePresence>
        {partnerChatOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[9999] flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#FAF8F5] border border-[#D6CFC2] rounded-2xl p-5 sm:p-6 w-full max-w-xl shadow-2xl space-y-4 text-xs font-body max-h-[90vh] flex flex-col"
            >
              {/* Header */}
              <div className="flex justify-between items-start pb-3 border-b border-[#D6CFC2] flex-shrink-0">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="font-mono text-[10px] font-bold text-[#A25A0B] uppercase bg-[#FDF2E3] border border-[#F6DCB8] px-2 py-0.5 rounded-md">
                      Partner Channel · WhatsApp Mirror
                    </span>
                  </div>
                  <h3 className="text-lg font-heading font-bold text-[#1C1C1A] mt-1">
                    Chat with Vanuit Ambacht (Tim & Bram)
                  </h3>
                  <p className="text-xs text-[#555046]">
                    Project 2026-014 · Thermo Fraké 240 cm · Sven Hoek (Hoek Bouw)
                  </p>
                </div>
                <button onClick={() => setPartnerChatOpen(false)} className="text-[#555046] hover:text-[#1C1C1A] p-1 cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Notice Banner */}
              <div className="p-3 bg-[#EDE8DF]/70 rounded-xl border border-[#D6CFC2] text-[11px] text-[#4F4B44] leading-relaxed flex-shrink-0">
                <p className="font-bold text-[#1C1C1A]">🔒 Partner-Only Channel (Never visible to customer):</p>
                <p>All technical work orders, dimensions, and wood cutting specifications are discussed here and mirrored to WhatsApp.</p>
              </div>

              {/* Message List */}
              <div className="flex-1 overflow-y-auto space-y-3 p-3 bg-white rounded-xl border border-[#D6CFC2] min-h-[220px]">
                {partnerMessages.map((msg) => {
                  const isAdmin = msg.role === 'admin' || (msg.sender && msg.sender.includes('Tim'));
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isAdmin ? 'items-start' : 'items-end'}`}
                    >
                      <div className="flex items-center gap-1.5 mb-0.5 text-[10px] font-bold text-[#555046]">
                        <span>{msg.sender || (isAdmin ? 'Tim (Admin)' : 'Sven Hoek')}</span>
                        <span>·</span>
                        <span className="font-normal font-mono">{msg.time}</span>
                      </div>
                      <div
                        className={`p-3 rounded-2xl max-w-[85%] text-xs font-medium leading-snug shadow-xs ${
                          isAdmin
                            ? 'bg-[#283523] text-white rounded-tl-xs'
                            : 'bg-[#EDE8DF] text-[#1C1C1A] rounded-tr-xs border border-[#D6CFC2]'
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Composer */}
              <form onSubmit={handleSendPartnerReply} className="flex gap-2 flex-shrink-0 pt-1">
                <input
                  type="text"
                  placeholder="Type reply to Tim & Bram (e.g. #workorder v3 confirmed)..."
                  value={inputPartnerReply}
                  onChange={(e) => setInputPartnerReply(e.target.value)}
                  className="flex-1 px-3.5 py-2.5 bg-white border border-[#D6CFC2] rounded-xl text-xs font-semibold text-[#1C1C1A] focus:outline-none focus:ring-2 focus:ring-[#283523]/20"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-[#283523] hover:bg-[#1E291B] text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send</span>
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* FLOATING PARTNER CHAT BUTTON */}
      <button
        onClick={() => setPartnerChatOpen(true)}
        className="fixed bottom-6 right-6 z-[9990] bg-[#283523] hover:bg-[#1E291B] text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs font-bold transition-all transform hover:scale-105 border border-white/20 cursor-pointer"
      >
        <MessageSquare className="w-4 h-4 text-emerald-400" />
        <span>Chat with Vanuit Ambacht</span>
        <span className="bg-emerald-500 text-black text-[10px] font-bold px-1.5 py-0.2 rounded-full">
          {partnerMessages.length}
        </span>
      </button>

    </div>
  );
}
