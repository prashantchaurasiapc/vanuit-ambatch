import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Card from './Card';
import Button from './Button';
import Badge from './Badge';
import { useLanguage } from '../context/LanguageContext';
import { tValue } from '../utils/translator';
import { safeSetItem, compressImage } from '../utils/storageHelper';
import { 
  Briefcase, UserCheck, Calendar, Camera, Award, ArrowRight, Check, Clock, Phone, 
  Mail, MapPin, DollarSign, Wrench, Download, ChevronRight, X, Sparkles, Send, 
  CheckSquare, MessageCircle, Paperclip, Compass, Edit2, Plus, Trash2, Eye, Share2,
  FileText, MessageSquare
} from 'lucide-react';

export const PROJECT_WORKFLOW_STEPS = [
  { id: 1, name: 'Project Setup & Specs', icon: Briefcase, desc: 'Work order setup, specs & catalog line items', color: 'indigo' },
  { id: 2, name: 'Partner Assignment', icon: UserCheck, desc: 'Craftsman partner assignment & agreed build price', color: 'purple' },
  { id: 3, name: 'Planning & Delivery', icon: Calendar, desc: 'Delivery date, site location & logistics schedule', color: 'cyan' },
  { id: 4, name: 'Workshop Build & Photos', icon: Camera, desc: 'Build progress %, photos & Customer Portal sync', color: 'amber' },
  { id: 5, name: 'Completed', icon: Award, desc: 'Final inspection, sign-off & invoice payment', color: 'emerald' }
];

export default function ProjectTracker({ project, onClose, onUpdateProject, partnersList = [] }) {
  const { language } = useLanguage();

  const isCompletedProject = Boolean(
    project?.status === 'Completed' || 
    project?.status === 'Afgerond' || 
    project?.status === 'Completed & Archived' || 
    Number(project?.progress) === 100
  );

  // Determine initial step based on project data
  const getInitialStep = () => {
    if (!project) return 1;
    if (isCompletedProject) return 5;
    if (Number(project.progress) > 40) return 4;
    if (project.deliveryDate || project.deadline) return 3;
    if (project.partner && project.partner !== 'Unassigned' && project.partner !== 'Niet toegewezen') return 2;
    return 1;
  };

  const [currentStep, setCurrentStep] = useState(1);
  const [toastMsg, setToastMsg] = useState('');

  // Editable Project Form State
  const [partnerSelect, setPartnerSelect] = useState(project?.partner || 'Unassigned');
  const [buildPrice, setBuildPrice] = useState(project?.buildPrice || '8500');
  const [deliveryWeek, setDeliveryWeek] = useState(project?.deliveryWeek || 'Week 49 (Dec 2026)');
  const [deliveryDate, setDeliveryDate] = useState(project?.deadline || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const [deliveryAddress, setDeliveryAddress] = useState(project?.deliveryAddress || 'Keizersgracht 402, Amsterdam');
  const [progressVal, setProgressVal] = useState(isCompletedProject ? 100 : (project?.progress ?? 25));
  const [orderStatus, setOrderStatus] = useState(project?.orderStatus || (isCompletedProject ? 'Afgerond' : project?.status === 'In Progress' ? 'In uitvoering' : 'Nieuw'));
  const [projectStatus, setProjectStatus] = useState(isCompletedProject ? 'Completed' : (project?.status || 'In Progress'));

  // Commercial Actions / Follow-ups State
  const [commercialActions, setCommercialActions] = useState(() => {
    try {
      const saved = localStorage.getItem(`app_commercial_actions_${project?.id || 'PRJ'}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return [
      {
        id: 1,
        date: new Date().toLocaleString('nl-NL', { dateStyle: 'short', timeStyle: 'short' }),
        user: 'Tim (Admin)',
        note: `Project setup created & initialized for ${project?.customer || 'Jan de Vries'}. Target delivery set for ${project?.deadline || '2026-08-30'}.`,
        assignee: 'Bram'
      }
    ];
  });
  const [commercialModalOpen, setCommercialModalOpen] = useState(false);
  const [newCommercialNote, setNewCommercialNote] = useState('');
  const [commercialTaskForm, setCommercialTaskForm] = useState({
    createTask: true,
    assignee: 'Bram',
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });

  // Client Communication Auto-Templates State
  const [selectedTemplate, setSelectedTemplate] = useState(isCompletedProject ? 'completion' : 'progress');
  const [customMsgText, setCustomMsgText] = useState(
    isCompletedProject
      ? `Beste ${project?.customer || 'Klant'}, goed nieuws! Jouw project is 100% afgerond en staat klaar voor oplevering. Hartelijk dank voor de fijne samenwerking!`
      : `Beste ${project?.customer || 'Klant'}, hierbij een update over je project. De voortgang staat momenteel op ${progressVal}%. Neem gerust contact met ons op als je vragen hebt!`
  );

  // Tasks State linked to Project
  const [projectTasks, setProjectTasks] = useState([]);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [newTaskForm, setNewTaskForm] = useState({
    title: '',
    assignee: 'Bram',
    priority: 'Medium',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });

  // Photos State linked to Project
  const [projectPhotos, setProjectPhotos] = useState([]);
  const photoFileInputRef = useRef(null);

  // Rich Upload Modal & Photo Management State linked to Project
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedUploadFiles, setSelectedUploadFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [previewPhoto, setPreviewPhoto] = useState(null);
  const [uploadForm, setUploadForm] = useState({
    captionCategory: 'Initial Construction',
    title: '',
    desc: '',
    isShared: true
  });

  const customerName = project?.customer || 'Jan de Vries';
  const customerEmail = project?.customerEmail || `${customerName.toLowerCase().replace(/\s+/g, '')}@gmail.com`;
  const customerPhone = project?.customerPhone || '+31 6 12345678';
  const categoryLabel = project?.category || (project?.name?.toLowerCase().includes('kliko') ? 'Kliko-ombouw' : project?.name?.toLowerCase().includes('snijplanken') ? 'Snijplanken' : 'Buitenkeukens');

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3500);
  };

  // Update auto-template message text on selection change
  useEffect(() => {
    if (selectedTemplate === 'planning') {
      setCustomMsgText(`Beste ${customerName}, de geplande opleverdatum voor project ${project?.id || 'PRJ'} staat vast op ${deliveryDate}. Adres: ${deliveryAddress}. Klopt dit nog met jouw planning?`);
    } else if (selectedTemplate === 'progress') {
      setCustomMsgText(`Beste ${customerName}, hierbij een voortgangsupdate vanuit de werkplaats! Het project vordert gestaag en de status staat op ${progressVal}%. Bekijk de nieuwste foto's via je Customer Portal.`);
    } else if (selectedTemplate === 'completion') {
      setCustomMsgText(`Beste ${customerName}, goed nieuws! Jouw project is 100% afgerond en staat klaar voor oplevering. Hartelijk dank voor de fijne samenwerking!`);
    }
  }, [selectedTemplate, deliveryDate, deliveryAddress, progressVal, customerName, project?.id]);

  // Load project tasks & photos from localStorage
  const loadProjectData = () => {
    try {
      // Tasks
      const savedTasks = localStorage.getItem('app_tasks_v2') || localStorage.getItem('app_tasks');
      if (savedTasks) {
        const parsedTasks = JSON.parse(savedTasks);
        if (Array.isArray(parsedTasks)) {
          const matched = parsedTasks.filter(t => 
            (t.linkedId && t.linkedId.includes(customerName)) || 
            (t.customer && t.customer === customerName) ||
            (t.project && t.project === project?.name)
          );
          setProjectTasks(matched);
        }
      }

      // Photos
      const savedPhotos = localStorage.getItem('app_project_photos');
      if (savedPhotos) {
        const parsedPhotos = JSON.parse(savedPhotos);
        if (Array.isArray(parsedPhotos)) {
          const matchedPhotos = parsedPhotos.filter(p => 
            p.customer === customerName || p.projectId === project?.id
          );
          setProjectPhotos(matchedPhotos);
        }
      }
    } catch (e) {}
  };

  useEffect(() => {
    loadProjectData();
    window.addEventListener('app_data_changed', loadProjectData);
    return () => window.removeEventListener('app_data_changed', loadProjectData);
  }, [project]);

  // Save changes to localStorage app_projects
  const saveProjectChanges = (updatedFields = {}) => {
    try {
      const savedProjects = localStorage.getItem('app_projects');
      if (savedProjects) {
        const parsed = JSON.parse(savedProjects);
        const updatedList = parsed.map(p => {
          if (p.id === project.id) {
            return {
              ...p,
              partner: partnerSelect,
              buildPrice,
              deliveryWeek,
              deadline: deliveryDate,
              deliveryAddress,
              progress: progressVal,
              orderStatus,
              status: projectStatus,
              ...updatedFields
            };
          }
          return p;
        });
        localStorage.setItem('app_projects', JSON.stringify(updatedList));
        window.dispatchEvent(new Event('app_data_changed'));
      }
      if (onUpdateProject) {
        onUpdateProject({
          ...project,
          partner: partnerSelect,
          buildPrice,
          deliveryWeek,
          deadline: deliveryDate,
          deliveryAddress,
          progress: progressVal,
          orderStatus,
          status: projectStatus,
          ...updatedFields
        });
      }
    } catch (e) {}
  };

  const handlePartnerSave = (e) => {
    e.preventDefault();
    saveProjectChanges({ partner: partnerSelect, buildPrice, deliveryWeek });
    showToast(language === 'EN' ? `Partner "${partnerSelect}" assigned to project!` : `Partner "${partnerSelect}" toegewezen aan project!`);
  };

  const handlePlanningSave = (e) => {
    e.preventDefault();
    saveProjectChanges({ deadline: deliveryDate, deliveryAddress });
    showToast(language === 'EN' ? `Planning date (${deliveryDate}) updated!` : `Planning datum (${deliveryDate}) bijgewerkt!`);
  };

  const handleProgressChange = (newVal) => {
    const pVal = Math.min(100, Math.max(0, parseInt(newVal) || 0));
    const newStatus = pVal === 100 ? 'Completed' : pVal > 0 ? 'In Progress' : 'Pending';
    setProgressVal(pVal);
    setProjectStatus(newStatus);
    saveProjectChanges({ progress: pVal, status: newStatus });
    showToast(`Progress updated to ${pVal}% (${newStatus})!`);
  };

  const handleSaveCommercialAction = (e) => {
    e.preventDefault();
    if (!newCommercialNote.trim()) return;

    const newAction = {
      id: Date.now(),
      date: new Date().toLocaleString('nl-NL', { dateStyle: 'short', timeStyle: 'short' }),
      user: 'Tim (Admin)',
      note: newCommercialNote.trim(),
      assignee: commercialTaskForm.createTask ? commercialTaskForm.assignee : null,
      dueDate: commercialTaskForm.createTask ? commercialTaskForm.dueDate : null
    };

    const updatedActions = [newAction, ...commercialActions];
    setCommercialActions(updatedActions);
    localStorage.setItem(`app_commercial_actions_${project?.id || 'PRJ'}`, JSON.stringify(updatedActions));

    // Automatically create and sync related task to Task Board
    if (commercialTaskForm.createTask) {
      try {
        const savedTasks = localStorage.getItem('app_tasks_v2') || localStorage.getItem('app_tasks');
        let tasksList = [];
        if (savedTasks) {
          try { tasksList = JSON.parse(savedTasks); } catch (err) {}
        }
        const newTask = {
          id: `TSK-ACT-${Date.now().toString().slice(-4)}`,
          title: `Follow-up: ${newCommercialNote.trim().slice(0, 45)}...`,
          linkedType: 'Project',
          linkedId: `${customerName} (${project?.id || 'PRJ'})`,
          customer: customerName,
          project: project?.name,
          assignee: commercialTaskForm.assignee,
          assignedTo: commercialTaskForm.assignee,
          priority: 'Medium',
          dueDate: commercialTaskForm.dueDate,
          completed: false,
          createdDate: new Date().toISOString().split('T')[0]
        };
        const updatedTasks = [newTask, ...tasksList];
        localStorage.setItem('app_tasks_v2', JSON.stringify(updatedTasks));
        localStorage.setItem('app_tasks', JSON.stringify(updatedTasks));
        setProjectTasks(prev => [newTask, ...prev]);
        window.dispatchEvent(new Event('app_data_changed'));
      } catch (err) {}
    }

    setNewCommercialNote('');
    setCommercialModalOpen(false);
    showToast(language === 'EN' ? 'Commercial follow-up note logged successfully!' : 'Commerciële follow-up notitie opgeslagen!');
  };

  const handleSaveTask = (e) => {
    e.preventDefault();
    if (!newTaskForm.title.trim()) return;

    const newTask = {
      id: `TSK-PRJ-${Date.now().toString().slice(-4)}`,
      title: newTaskForm.title.trim(),
      linkedType: 'Project',
      linkedId: `${customerName} (${project?.id || 'PRJ'})`,
      customer: customerName,
      project: project?.name,
      assignee: newTaskForm.assignee,
      assignedTo: newTaskForm.assignee,
      priority: newTaskForm.priority,
      dueDate: newTaskForm.dueDate,
      completed: false,
      createdDate: new Date().toISOString().split('T')[0]
    };

    try {
      const savedTasks = localStorage.getItem('app_tasks_v2') || localStorage.getItem('app_tasks');
      let tasksList = [];
      if (savedTasks) {
        try { tasksList = JSON.parse(savedTasks); } catch (err) {}
      }
      const updatedList = [newTask, ...tasksList];
      localStorage.setItem('app_tasks_v2', JSON.stringify(updatedList));
      localStorage.setItem('app_tasks', JSON.stringify(updatedList));
      window.dispatchEvent(new Event('app_data_changed'));
    } catch (e) {}

    setProjectTasks(prev => [newTask, ...prev]);
    setNewTaskForm({ title: '', assignee: 'Bram', priority: 'Medium', dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] });
    setTaskModalOpen(false);
    showToast(language === 'EN' ? `Task assigned to ${newTaskForm.assignee}!` : `Taak toegewezen aan ${newTaskForm.assignee}!`);
  };

  const handleSelectMultipleFiles = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    for (const file of files) {
      try {
        const compressedSrc = await compressImage(file, 1200, 0.82);
        setSelectedUploadFiles(prev => [...prev, {
          name: file.name,
          src: compressedSrc
        }]);
      } catch (err) {
        console.warn('Compress image error:', err);
      }
    }
  };

  const handleDropFiles = async (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer?.files || []);
    if (files.length === 0) return;

    for (const file of files) {
      try {
        const compressedSrc = await compressImage(file, 1200, 0.82);
        setSelectedUploadFiles(prev => [...prev, {
          name: file.name,
          src: compressedSrc
        }]);
      } catch (err) {
        console.warn('Compress image error:', err);
      }
    }
  };

  const handleRemoveSelectedUploadFile = (idx) => {
    setSelectedUploadFiles(prev => prev.filter((_, i) => i !== idx));
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (selectedUploadFiles.length === 0) {
      return showToast(language === 'EN' ? 'Please select at least one photo.' : 'Selecteer alstublieft minimaal één foto.');
    }

    setIsUploading(true);

    const newPhotoEntries = selectedUploadFiles.map((fileObj, index) => ({
      id: `P-PRJ-${Date.now().toString().slice(-4)}-${index + 1}`,
      projectId: project?.id || 'PRJ-101',
      projectName: project?.name || 'Bespoke Project',
      customer: customerName,
      title: uploadForm.title.trim() || `${uploadForm.captionCategory}: ${fileObj.name.replace(/\.[^/.]+$/, "")}`,
      phase: `${uploadForm.captionCategory} — ${new Date().toLocaleDateString('default', { day: 'numeric', month: 'short' })}`,
      description: uploadForm.desc.trim() || `Project progress photo uploaded by Admin for ${project?.name || 'Project'}.`,
      img: fileObj.src,
      craftsman: 'Tim & Bram (Admin)',
      uploaderRole: 'admin',
      isShared: uploadForm.isShared,
      date: new Date().toISOString().split('T')[0]
    }));

    try {
      const savedPhotos = JSON.parse(localStorage.getItem('app_project_photos') || '[]');
      const updatedPhotos = [...newPhotoEntries, ...savedPhotos];
      safeSetItem('app_project_photos', updatedPhotos);
      window.dispatchEvent(new Event('app_data_changed'));
    } catch (err) {}

    setIsUploading(false);
    setSelectedUploadFiles([]);
    setUploadModalOpen(false);
    setUploadForm({ captionCategory: 'Initial Construction', title: '', desc: '', isShared: true });
    setProjectPhotos(prev => [...newPhotoEntries, ...prev]);
    showToast(language === 'EN' ? `${newPhotoEntries.length} photo(s) uploaded & synced to Customer Portal!` : `${newPhotoEntries.length} foto('s) geüpload & gesynchroniseerd!`);
  };

  const handleToggleSharePhoto = (photoId) => {
    try {
      const savedPhotos = JSON.parse(localStorage.getItem('app_project_photos') || '[]');
      const updatedList = savedPhotos.map(p => {
        if (p.id === photoId) return { ...p, isShared: !p.isShared };
        return p;
      });
      safeSetItem('app_project_photos', updatedList);
      setProjectPhotos(prev => prev.map(p => p.id === photoId ? { ...p, isShared: !p.isShared } : p));
      window.dispatchEvent(new Event('app_data_changed'));
      showToast(language === 'EN' ? 'Photo sharing status updated!' : 'Foto status bijgewerkt!');
    } catch (e) {}
  };

  const handleDeleteProjectPhoto = (photoId) => {
    try {
      const savedPhotos = JSON.parse(localStorage.getItem('app_project_photos') || '[]');
      const updatedList = savedPhotos.filter(p => p.id !== photoId);
      safeSetItem('app_project_photos', updatedList);
      setProjectPhotos(prev => prev.filter(p => p.id !== photoId));
      window.dispatchEvent(new Event('app_data_changed'));
      showToast(language === 'EN' ? 'Photo deleted successfully!' : 'Foto succesvol verwijderd!');
    } catch (e) {}
  };

  const handleDownloadBlueprintPdf = () => {
    const fileName = `BLU-${project?.id || '2001'}-SPEC.pdf`;
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      showToast(`Pop-up blocked! Blueprint file: ${fileName}`);
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${fileName}</title>
          <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; color: #4A4A43; background: #fff; max-width: 800px; margin: 0 auto; }
            .header { border-bottom: 3px solid #3E4E36; padding-bottom: 15px; margin-bottom: 25px; display: flex; justify-content: space-between; align-items: flex-end; }
            .brand { color: #3E4E36; font-size: 26px; font-weight: bold; margin: 0; font-family: 'Georgia', serif; }
            .subtitle { color: #70624F; font-size: 13px; font-weight: 600; margin-top: 4px; }
            .badge { background: #3E4E36; color: #EDE8DF; padding: 6px 12px; border-radius: 6px; font-size: 13px; font-family: monospace; font-weight: bold; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 25px; }
            .card { background: #F8F7F4; padding: 15px; border-radius: 10px; border: 1px solid #D6CFC2; }
            .label { font-size: 10px; text-transform: uppercase; color: #70624F; font-weight: bold; letter-spacing: 0.5px; }
            .value { font-size: 15px; font-weight: bold; margin-top: 4px; color: #3E4E36; }
            .spec-section { background: #F8F7F4; padding: 20px; border-radius: 10px; border: 1px solid #D6CFC2; margin-bottom: 25px; }
            .spec-title { font-size: 14px; font-weight: bold; color: #3E4E36; border-bottom: 1px solid #D6CFC2; padding-bottom: 8px; margin-bottom: 12px; text-transform: uppercase; }
            .spec-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px dashed #D6CFC2; font-size: 13px; }
            .footer { margin-top: 40px; padding-top: 15px; border-top: 1px solid #D6CFC2; font-size: 11px; color: #888; text-align: center; }
            @media print { body { padding: 0; } }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h1 class="brand">VANUIT AMBACHT</h1>
              <div class="subtitle">PROJECT CONSTRUCTION SPECIFICATION & BLUEPRINT</div>
            </div>
            <div>
              <span class="badge">${project?.id || 'PRJ-2001'}</span>
            </div>
          </div>
          <div style="margin-bottom: 20px;">
            <h2 style="font-size: 20px; color: #3E4E36; margin: 0 0 5px 0;">${project?.name || 'Bespoke Project'}</h2>
            <p style="margin: 0; color: #666; font-size: 13px;">Official Construction CAD Drawing & Specifications</p>
          </div>
          <div class="grid">
            <div class="card">
              <div class="label">Customer Name</div>
              <div class="value">${customerName}</div>
            </div>
            <div class="card">
              <div class="label">Assigned Craftsman Partner</div>
              <div class="value">${partnerSelect}</div>
            </div>
            <div class="card">
              <div class="label">Target Delivery Date</div>
              <div class="value">${deliveryDate}</div>
            </div>
            <div class="card">
              <div class="label">Completion Progress</div>
              <div class="value">${progressVal}% Completed</div>
            </div>
          </div>
          <div class="spec-section">
            <div class="spec-title">Technical Specifications & Materials</div>
            <div class="spec-row"><span style="font-weight: 600;">Dimensions:</span><span style="font-family: monospace; font-weight: bold; color: #3E4E36;">350cm x 80cm x 95cm</span></div>
            <div class="spec-row"><span style="font-weight: 600;">Wood Frame Material:</span><span>Thermo Fraké / Solid Teak Wood (FSC Certified)</span></div>
            <div class="spec-row"><span style="font-weight: 600;">Countertop Finish:</span><span>Polished Concrete Cire (Dark Grey 8cm)</span></div>
            <div class="spec-row" style="border-bottom: none;"><span style="font-weight: 600;">Installation Location:</span><span>${deliveryAddress}</span></div>
          </div>
          <div class="footer">
            Generated officially by Vanuit Ambacht Cloud Management System • ${new Date().toLocaleDateString('nl-NL')}
          </div>
          <script>
            window.onload = function() { setTimeout(function() { window.print(); }, 400); };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
    showToast(`Blueprint PDF generated: ${fileName}`);
  };

  const projectTimeline = [
    { id: 1, title: 'Lead Converted to Project', desc: `Project #${project?.id || 'PRJ-101'} created for ${customerName}`, time: 'Day 1', user: 'System' },
    { id: 2, title: 'Craftsman Partner Assigned', desc: `Assigned to ${partnerSelect}`, time: 'Day 2', user: 'Admin' },
    { id: 3, title: 'Planning & Site Delivery Scheduled', desc: `Scheduled for ${deliveryDate}`, time: 'Day 3', user: 'Admin' },
    { id: 4, title: 'Workshop Build & Quality Checks', desc: `Build progress at ${progressVal}%`, time: 'Active', user: partnerSelect },
    { id: 5, title: 'Final Assembly & Completion', desc: projectStatus === 'Completed' ? 'Installation finished & signed off' : 'Pending final assembly', time: 'Target', user: 'Admin' }
  ];

  return (
    <div className="space-y-6 text-[#4A4A43] font-body relative">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div 
            initial={{ opacity: 0, x: 80 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 80 }}
            className="fixed top-20 right-4 z-[9999] flex items-center gap-2 bg-primary text-cream px-4 py-3 rounded-xl shadow-lg text-xs font-bold font-body"
          >
            <Check className="w-4 h-4 text-green-400" />
            {toastMsg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sticky Header with Stepper Progress Bar */}
      <div className="sticky -top-3 sm:-top-4 lg:-top-6 z-40 bg-[#EDE8DF] shadow-md -mt-3 sm:-mt-4 lg:-mt-6 pt-3 sm:pt-4 lg:pt-6 pb-3 border-b border-[#D6CFC2] -mx-3 px-3 sm:-mx-4 sm:px-4 lg:-mx-6 lg:px-6">
        
        {/* Row 1: Back button, project ID, title, action buttons & Close */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1.5">
              {onClose && (
                <button
                  onClick={onClose}
                  className="text-xs font-bold text-primary hover:bg-white/80 flex items-center gap-1 bg-white/50 px-2.5 py-1 rounded-lg border border-[#D6CFC2] transition-colors cursor-pointer shadow-2xs"
                  title="Return to full Projects overview table"
                >
                  ← {language === 'EN' ? 'Back to Projects Overview' : 'Terug naar Projecten Overzicht'}
                </button>
              )}
              <span className="text-[10px] font-bold text-accent tracking-wider uppercase font-body">Project Detail</span>
              <Badge variant="info">{project?.id || 'PRJ-101'}</Badge>
              <span className="text-[10px] font-bold text-primary font-body bg-primary/10 px-2 py-0.5 rounded-md font-mono">
                {categoryLabel}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h2 className="text-lg font-heading font-bold text-primary leading-tight truncate">
                {project?.name} ({customerName})
              </h2>

              <div className="flex items-center gap-2 flex-wrap">
                <Button 
                  size="sm" 
                  variant="outline" 
                  icon={MessageSquare} 
                  onClick={() => setCommercialModalOpen(true)}
                  className="text-xs py-1 px-2.5 border-primary/40 text-primary hover:bg-primary/10 shadow-xs font-bold"
                >
                  💬 {language === 'EN' ? '+ Log Follow-up Note' : '+ Commercial Note'}
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  icon={Compass} 
                  onClick={handleDownloadBlueprintPdf}
                  className="text-xs py-1 px-2.5 border-primary/40 text-primary hover:bg-primary/10 shadow-xs font-bold"
                >
                  📐 {language === 'EN' ? 'Blueprint PDF' : 'Bouwtekening PDF'}
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  icon={Plus} 
                  onClick={() => setTaskModalOpen(true)}
                  className="text-xs py-1 px-2.5 border-primary/40 text-primary hover:bg-primary/10 shadow-xs font-bold"
                >
                  📌 {language === 'EN' ? '+ Add Task' : '+ Taak Toevoegen'}
                </Button>
                <Button 
                  size="sm" 
                  variant="primary" 
                  icon={Camera} 
                  onClick={() => setUploadModalOpen(true)}
                  className="text-xs py-1 px-2.5 shadow-xs bg-primary text-cream font-bold cursor-pointer"
                >
                  📷 {language === 'EN' ? 'Upload Photos' : 'Foto\'s Uploaden'}
                </Button>
                <input 
                  type="file" 
                  ref={photoFileInputRef} 
                  onChange={handleSelectMultipleFiles} 
                  multiple 
                  accept="image/*" 
                  className="hidden" 
                />
              </div>
            </div>
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className="flex-shrink-0 mt-0.5 text-dark/40 hover:text-dark hover:bg-[#D6CFC2]/40 rounded-lg p-1.5 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Row 2: 5-Step Project Execution Stepper */}
        <div className="overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          <div className="flex items-center min-w-[600px] justify-between relative px-2">
            <div className="absolute top-4 left-6 right-6 h-0.5 bg-[#D6CFC2] z-0" />
            <div
              className="absolute top-4 left-6 h-0.5 bg-primary transition-all duration-500 z-0"
              style={{ width: `${((currentStep - 1) / (PROJECT_WORKFLOW_STEPS.length - 1)) * 96}%` }}
            />

            {PROJECT_WORKFLOW_STEPS.map((step) => {
              const isDone = step.id < currentStep || (isCompletedProject && step.id < 5);
              const isCurrent = step.id === currentStep;
              const StepIcon = step.icon;

              return (
                <button
                  key={step.id}
                  onClick={() => setCurrentStep(step.id)}
                  title={`Step ${step.id}: ${step.name}`}
                  className="flex flex-col items-center group relative z-10 focus:outline-none cursor-pointer"
                >
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                    isCurrent
                      ? 'bg-primary text-cream ring-4 ring-primary/20 shadow-md scale-110'
                      : isDone
                      ? 'bg-green-600 text-white ring-4 ring-green-100 shadow-sm'
                      : 'bg-[#EDE8DF] text-dark/40 border border-[#D6CFC2] hover:border-primary/50'
                  }`}>
                    {isDone && !isCurrent ? <Check className="w-3.5 h-3.5" /> : <StepIcon className="w-3.5 h-3.5" />}
                  </div>
                  <span className={`text-[9px] font-semibold mt-1 max-w-[80px] text-center line-clamp-1 ${
                    isCurrent ? 'text-primary font-bold' : isDone ? 'text-green-700' : 'text-dark/40'
                  }`}>
                    {step.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Grid Content: Left Stage Details + Right Metadata & Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Column (2/3): Dynamic Project Workflow Stage Card */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-l-4 border-l-primary shadow-card">
            
            {/* Stage Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#D6CFC2]/60">
              <div>
                <span className="text-[11px] font-bold text-dark/50 uppercase tracking-widest font-body">
                  {language === 'NL' ? 'Huidige Project Fase' : 'Current Project Stage'}
                </span>
                <h3 className="text-xl font-heading font-bold text-primary flex items-center gap-2">
                  <span>Step {currentStep}: {PROJECT_WORKFLOW_STEPS[currentStep - 1].name}</span>
                </h3>
              </div>
              <Badge variant={currentStep === 5 || isCompletedProject || projectStatus === 'Completed' || projectStatus === 'Afgerond' || progressVal === 100 ? 'success' : 'primary'}>
                {currentStep === 5 || isCompletedProject || projectStatus === 'Completed' || projectStatus === 'Afgerond' || progressVal === 100 ? (language === 'EN' ? 'Completed' : 'Afgerond') : tValue(projectStatus, language)}
              </Badge>
            </div>

            {/* Stage Specific Dynamic Content */}
            <div className="py-5 space-y-5 text-xs text-dark/80">

              {/* STEP 1: PROJECT SETUP & SPECS */}
              {currentStep === 1 && (
                <div className="space-y-4 font-body">
                  <div className="p-4 bg-[#EDE8DF]/60 rounded-xl border border-[#D6CFC2]/70 space-y-3">
                    <div className="flex items-center justify-between border-b border-[#D6CFC2]/60 pb-2">
                      <span className="font-heading font-bold text-xs text-primary uppercase tracking-wider">
                        📋 {language === 'EN' ? 'Work Order & Client Details' : 'Werkorder & Klantgegevens'}
                      </span>
                      <Badge variant="info">{project?.id || 'PRJ-101'}</Badge>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      <div className="p-2.5 bg-white rounded-lg border border-[#D6CFC2]/50">
                        <p className="text-[10px] text-dark/50 font-bold uppercase">{language === 'EN' ? 'Customer Name' : 'Klantnaam'}</p>
                        <p className="font-bold text-dark text-xs mt-0.5">{customerName}</p>
                      </div>
                      <div className="p-2.5 bg-white rounded-lg border border-[#D6CFC2]/50">
                        <p className="text-[10px] text-dark/50 font-bold uppercase">{language === 'EN' ? 'Product Category' : 'Product Categorie'}</p>
                        <p className="font-bold text-primary text-xs mt-0.5">{categoryLabel}</p>
                      </div>
                      <div className="p-2.5 bg-white rounded-lg border border-[#D6CFC2]/50">
                        <p className="text-[10px] text-dark/50 font-bold uppercase">{language === 'EN' ? 'Total Project Value' : 'Totale Projectwaarde'}</p>
                        <p className="font-bold text-primary text-xs font-mono mt-0.5">{project?.value || '€ 11,300'}</p>
                      </div>
                      <div className="p-2.5 bg-white rounded-lg border border-[#D6CFC2]/50">
                        <p className="text-[10px] text-dark/50 font-bold uppercase">{language === 'EN' ? 'Target Delivery Date' : 'Leverdatum Target'}</p>
                        <p className="font-semibold text-dark text-xs mt-0.5">{deliveryDate}</p>
                      </div>
                      <div className="p-2.5 bg-white rounded-lg border border-[#D6CFC2]/50 sm:col-span-2">
                        <p className="text-[10px] text-dark/50 font-bold uppercase">{language === 'EN' ? 'Delivery Address' : 'Afleveradres'}</p>
                        <p className="font-semibold text-dark text-xs truncate mt-0.5">{deliveryAddress}</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-white rounded-xl border border-[#D6CFC2] space-y-3 shadow-2xs">
                    <div className="flex items-center justify-between border-b border-[#D6CFC2]/60 pb-2">
                      <span className="font-bold text-xs text-primary font-heading uppercase tracking-wider">
                        📐 {language === 'EN' ? 'Technical Specifications & CAD Blueprint Details' : 'Technische Specificaties & CAD Details'}
                      </span>
                      <span className="text-[10px] text-accent font-bold font-mono uppercase">Validated Specs</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs pt-1">
                      <div className="p-2 bg-[#F8F7F4] rounded-lg border border-[#D6CFC2]/40">
                        <span className="text-dark/50 block text-[10px] uppercase font-bold">Dimensions</span>
                        <span className="font-mono font-bold text-dark text-xs">350cm x 80cm x 95cm</span>
                      </div>
                      <div className="p-2 bg-[#F8F7F4] rounded-lg border border-[#D6CFC2]/40">
                        <span className="text-dark/50 block text-[10px] uppercase font-bold">Frame Wood</span>
                        <span className="font-semibold text-dark text-xs">Thermo Fraké / Teak Wood</span>
                      </div>
                      <div className="p-2 bg-[#F8F7F4] rounded-lg border border-[#D6CFC2]/40">
                        <span className="text-dark/50 block text-[10px] uppercase font-bold">Countertop</span>
                        <span className="font-semibold text-dark text-xs">Polished Concrete Cire (8cm)</span>
                      </div>
                      <div className="p-2 bg-[#F8F7F4] rounded-lg border border-[#D6CFC2]/40">
                        <span className="text-dark/50 block text-[10px] uppercase font-bold">Hardware</span>
                        <span className="font-semibold text-dark text-xs">Soft-Close Blum Hinges</span>
                      </div>
                      <div className="p-2 bg-[#F8F7F4] rounded-lg border border-[#D6CFC2]/40 sm:col-span-2">
                        <span className="text-dark/50 block text-[10px] uppercase font-bold">Client Custom Notes</span>
                        <span className="font-semibold text-dark/90 text-xs italic">Natural oil finish requested; include cutout for Big Green Egg Kamado.</span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-[#D6CFC2]/40 flex justify-end gap-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        icon={Compass} 
                        onClick={handleDownloadBlueprintPdf}
                        className="text-xs py-1.5 px-3 border-primary/40 text-primary font-bold shadow-xs"
                      >
                        📐 {language === 'EN' ? 'Download Printable CAD Blueprint' : 'Download Technische Bouwtekening (PDF)'}
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: PARTNER ASSIGNMENT */}
              {currentStep === 2 && (
                <form onSubmit={handlePartnerSave} className="space-y-4">
                  <div className="p-4 bg-[#EDE8DF]/50 rounded-xl border border-[#D6CFC2]/60 space-y-4">
                    <h4 className="font-bold text-dark flex items-center gap-2 text-sm">
                      <UserCheck className="w-4 h-4 text-primary" />
                      {language === 'EN' ? 'Craftsman Partner Assignment & Pricing' : 'Toewijzen Ambachtsman Partner & Bouwprijs'}
                    </h4>

                    <div>
                      <label className="block text-[10px] font-bold text-dark/60 uppercase mb-1">
                        {language === 'EN' ? 'Select Craftsman Partner *' : 'Selecteer Partner *'}
                      </label>
                      <select
                        value={partnerSelect}
                        onChange={(e) => setPartnerSelect(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-[#D6CFC2] rounded-lg text-xs font-bold text-dark focus:ring-2 focus:ring-primary/20"
                      >
                        <option value="Unassigned">Unassigned (Niet toegewezen)</option>
                        {partnersList.map((p, idx) => (
                          <option key={idx} value={p.name}>{p.name} ({p.company || p.region || 'Partner'})</option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-dark/60 uppercase mb-1">
                          {language === 'EN' ? 'Agreed Build Cost (€)' : 'Afgesproken Bouwprijs (€)'}
                        </label>
                        <input
                          type="text"
                          value={buildPrice}
                          onChange={(e) => setBuildPrice(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-[#D6CFC2] rounded-lg text-xs font-bold text-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-dark/60 uppercase mb-1">
                          {language === 'EN' ? 'Target Delivery Week' : 'Streef Leverweek'}
                        </label>
                        <input
                          type="text"
                          value={deliveryWeek}
                          onChange={(e) => setDeliveryWeek(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-[#D6CFC2] rounded-lg text-xs font-semibold text-dark"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button type="submit" variant="primary" icon={Check} className="text-xs font-bold">
                      {language === 'EN' ? 'Save Partner Assignment' : 'Partner Toewijzing Opslaan'}
                    </Button>
                  </div>
                </form>
              )}

              {/* STEP 3: PLANNING & DELIVERY SCHEDULE */}
              {currentStep === 3 && (
                <form onSubmit={handlePlanningSave} className="space-y-4">
                  <div className="p-4 bg-[#EDE8DF]/60 rounded-xl border border-[#D6CFC2]/60 space-y-4">
                    <h4 className="font-bold text-dark flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-primary" />
                      {language === 'EN' ? 'Planning & Assembly Schedule' : 'Planning & Levering Datum'}
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-dark/60 uppercase mb-1">
                          {language === 'EN' ? 'Target Delivery / Assembly Date' : 'Lever / Montagedatum'}
                        </label>
                        <input
                          type="date"
                          value={deliveryDate}
                          onChange={(e) => setDeliveryDate(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-[#D6CFC2] rounded-lg text-xs font-bold text-dark"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-dark/60 uppercase mb-1">
                          {language === 'EN' ? 'Delivery Address' : 'Afleveradres'}
                        </label>
                        <input
                          type="text"
                          value={deliveryAddress}
                          onChange={(e) => setDeliveryAddress(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-[#D6CFC2] rounded-lg text-xs font-semibold text-dark"
                        />
                      </div>
                    </div>

                    <div className="p-3 bg-white/80 rounded-lg border border-[#D6CFC2]/60 text-xs space-y-1">
                      <div className="flex items-center gap-2 font-bold text-emerald-800">
                        <CheckSquare className="w-4 h-4 text-emerald-600" />
                        <span>{language === 'EN' ? 'Pre-assembly quality check confirmed by craftsman' : 'Kwaliteitscontrole bevestigd door vakman'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button type="submit" variant="primary" icon={Check} className="text-xs font-bold">
                      {language === 'EN' ? 'Save Schedule & Address' : 'Planning Opslaan'}
                    </Button>
                  </div>
                </form>
              )}

              {/* STEP 4: WORKSHOP BUILD & PHOTOS */}
              {currentStep === 4 && (
                <div className="space-y-4">
                  {/* Progress Slider */}
                  <div className="p-4 bg-white rounded-xl border border-[#D6CFC2] space-y-3 shadow-2xs">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-xs text-primary uppercase tracking-wider">
                        {language === 'EN' ? 'Build Progress Tracking (%)' : 'Voortgang Percentage (%)'}
                      </span>
                      <span className="font-mono text-sm font-bold text-primary bg-primary/10 px-2.5 py-0.5 rounded-md">
                        {progressVal}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={progressVal}
                      onChange={(e) => handleProgressChange(e.target.value)}
                      className="w-full accent-primary cursor-pointer h-2 bg-[#EDE8DF] rounded-lg"
                    />
                  </div>

                  {/* Integrated Photos Section */}
                  <div className="p-4 bg-[#EDE8DF]/40 rounded-xl border border-[#D6CFC2] space-y-3">
                    <div className="flex items-center justify-between">
                      <h5 className="font-bold text-xs text-primary uppercase tracking-wider flex items-center gap-2">
                        <Camera className="w-4 h-4 text-primary" />
                        <span>{language === 'EN' ? `Project Photos (${projectPhotos.length})` : `Projectfoto's (${projectPhotos.length})`}</span>
                      </h5>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => photoFileInputRef.current?.click()}
                        className="py-1 px-2.5 text-[11px] font-bold border-primary/40 text-primary"
                      >
                        📷 {language === 'EN' ? '+ Upload Photo' : '+ Foto Uploaden'}
                      </Button>
                    </div>

                    {projectPhotos.length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {projectPhotos.map((photo) => (
                          <div key={photo.id} className="relative group bg-white border border-[#D6CFC2] rounded-lg overflow-hidden p-1 space-y-1">
                            <img src={photo.img} alt={photo.title} className="w-full h-24 object-cover rounded" />
                            <p className="text-[10px] font-bold text-dark truncate px-1">{photo.title}</p>
                            <span className="text-[9px] text-emerald-800 bg-emerald-50 px-1.5 py-0.2 rounded font-bold block w-max">
                              ✓ Shared with Portal
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-dark/50 italic text-center py-4">
                        {language === 'EN' ? 'No photos uploaded yet for this project. Click "+ Upload Photo" to add build progress photos.' : 'Nog geen foto\'s geüpload voor dit project.'}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* STEP 5: COMPLETED */}
              {currentStep === 5 && (
                <div className="space-y-4">
                  <div className="p-5 bg-emerald-900 text-cream rounded-xl space-y-4 shadow-card">
                    <div className="flex items-center gap-3 font-bold text-base border-b border-emerald-800 pb-3">
                      <Award className="w-6 h-6 text-amber-400 flex-shrink-0" />
                      <div>
                        <span className="block font-heading text-lg">Project Completed & Signed Off!</span>
                        <span className="text-xs font-normal text-emerald-200">Final inspection passed, 100% invoice settled.</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 p-3 bg-white/10 rounded-lg text-xs">
                      <div><span className="text-emerald-200/70 block text-[10px]">Customer Name</span><span className="font-bold text-white">{customerName}</span></div>
                      <div><span className="text-emerald-200/70 block text-[10px]">Craftsman Partner</span><span className="font-semibold text-emerald-100">{partnerSelect}</span></div>
                      <div><span className="text-emerald-200/70 block text-[10px]">Final Status</span><span className="font-bold text-amber-300">100% Completed</span></div>
                      <div><span className="text-emerald-200/70 block text-[10px]">Completion Date</span><span className="font-semibold text-white">{new Date().toLocaleDateString('nl-NL')}</span></div>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Bottom Action Footer */}
            <div className="pt-4 border-t border-[#D6CFC2] flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#EDE8DF]/30 -mx-5 -mb-5 p-5 rounded-b-2xl">
              <div>
                <span className="text-[10px] text-dark/50 uppercase font-bold tracking-wider block">
                  {language === 'NL' ? 'Aanbevolen Volgende Actie' : 'Recommended Next Action'}
                </span>
                <span className="text-xs font-bold text-dark">
                  {currentStep === 1 && (language === 'EN' ? 'Verify specifications & assign partner' : 'Controleer specificaties & wijs partner toe')}
                  {currentStep === 2 && (language === 'EN' ? 'Confirm agreed build price & schedule delivery' : 'Bevestig bouwprijs & plan levering')}
                  {currentStep === 3 && (language === 'EN' ? 'Start workshop build & track progress' : 'Start werkplaatsbouw & volg voortgang')}
                  {currentStep === 4 && (language === 'EN' ? 'Upload build photos & complete assembly' : 'Upload foto\'s & voltooi montage')}
                  {currentStep === 5 && (language === 'EN' ? 'Project is 100% completed & archived' : 'Project is 100% afgerond')}
                </span>
              </div>

              {currentStep < 5 && (
                <Button 
                  variant="primary" 
                  icon={ArrowRight} 
                  onClick={() => setCurrentStep(prev => Math.min(5, prev + 1))} 
                  className="w-full sm:w-auto shadow-md"
                >
                  {language === 'EN' ? 'Next Project Phase →' : 'Volgende Project Fase →'}
                </Button>
              )}
            </div>

          </Card>

          {/* PROJECT PHOTOS & PROGRESS GALLERY CARD */}
          <Card className="border-l-4 border-l-amber-500">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4 border-b border-[#D6CFC2]/60 pb-3">
              <div>
                <h3 className="font-heading font-bold text-base text-primary flex items-center gap-2">
                  <Camera className="w-5 h-5 text-amber-600" />
                  <span>{language === 'EN' ? 'Project Photos & Progress' : 'Projectfoto\'s & Voortgang'}</span>
                  <Badge variant="amber">{projectPhotos.length}</Badge>
                </h3>
                <p className="text-xs text-dark/60 mt-0.5">
                  {language === 'EN' 
                    ? `Development progress photos linked specifically to ${project?.id || 'PRJ'} (${customerName}).`
                    : `Voortgangsfoto's gekoppeld aan project ${project?.id || 'PRJ'} (${customerName}).`}
                </p>
              </div>

              <Button
                size="sm"
                variant="primary"
                icon={Camera}
                onClick={() => setUploadModalOpen(true)}
                className="py-1.5 px-3 text-xs font-bold shadow-xs bg-primary text-cream cursor-pointer"
              >
                📷 {language === 'EN' ? 'Upload Photos' : 'Foto\'s Uploaden'}
              </Button>
            </div>

            {projectPhotos.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {projectPhotos.map((photo) => {
                  const isShared = photo.isShared !== false;

                  return (
                    <div key={photo.id} className="group bg-white border border-[#D6CFC2] rounded-xl overflow-hidden shadow-2xs hover:shadow-card transition-all flex flex-col justify-between">
                      <div>
                        <div className="relative h-36 bg-black/10 overflow-hidden cursor-pointer" onClick={() => setPreviewPhoto(photo)}>
                          <img src={photo.img} alt={photo.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                          <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-transparent to-transparent"></div>
                          
                          <span className="absolute top-2 left-2 bg-white/90 backdrop-blur-md px-2 py-0.5 rounded text-[9px] font-bold text-primary border border-[#D6CFC2] max-w-[70%] truncate">
                            {photo.phase || 'Workshop Phase'}
                          </span>

                          <div className="absolute top-2 right-2">
                            {isShared ? (
                              <span className="bg-emerald-600 text-white px-2 py-0.5 rounded text-[9px] font-bold">✓ Portal Shared</span>
                            ) : (
                              <span className="bg-amber-600 text-white px-2 py-0.5 rounded text-[9px] font-bold">Internal</span>
                            )}
                          </div>

                          <div className="absolute bottom-2 left-2 right-2">
                            <p className="text-white font-bold text-xs truncate">{photo.title}</p>
                          </div>
                        </div>

                        <div className="p-2.5 space-y-1 text-xs">
                          <p className="text-dark/70 text-[11px] line-clamp-2">{photo.description}</p>
                          <div className="pt-1.5 border-t border-[#D6CFC2]/40 flex justify-between items-center text-[10px] text-dark/50 font-mono">
                            <span>{photo.craftsman || 'Tim & Bram'}</span>
                            <span>{photo.date || 'Today'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="p-2 bg-[#F8F7F4] border-t border-[#D6CFC2] flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => handleToggleSharePhoto(photo.id)}
                          className={`text-[10px] font-bold px-2 py-1 rounded border cursor-pointer ${
                            isShared ? 'bg-emerald-100 text-emerald-900 border-emerald-300' : 'bg-primary text-cream border-primary'
                          }`}
                        >
                          {isShared ? '✓ Shared' : '📤 Share'}
                        </button>
                        <div className="flex items-center gap-1">
                          <button onClick={() => setPreviewPhoto(photo)} className="p-1 bg-white border rounded text-primary hover:bg-primary/10 cursor-pointer">
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => handleDeleteProjectPhoto(photo.id)} className="p-1 bg-white border rounded text-rose-600 hover:bg-rose-50 cursor-pointer">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="border-2 border-dashed border-[#D6CFC2] rounded-xl p-8 text-center bg-[#F8F7F4]/60 space-y-2">
                <Camera className="w-8 h-8 text-dark/30 mx-auto" />
                <h4 className="font-heading font-bold text-dark text-sm">
                  {language === 'EN' ? 'No progress photos uploaded yet for this project' : 'Nog geen voortgangsfoto\'s geüpload voor dit project'}
                </h4>
                <p className="text-xs text-dark/50 max-w-md mx-auto">
                  {language === 'EN'
                    ? `Click "Upload Photos" to add initial construction, frame completion, or polishing photos specifically for ${project?.id || 'PRJ'}.`
                    : `Klik op "Foto's Uploaden" om voortgangsfoto's toe te voegen voor ${project?.id || 'PRJ'}.`}
                </p>
                <Button size="sm" icon={Camera} onClick={() => setUploadModalOpen(true)} className="mt-2 text-xs font-bold cursor-pointer">
                  📷 {language === 'EN' ? 'Upload Photos' : 'Foto\'s Uploaden'}
                </Button>
              </div>
            )}
          </Card>

          {/* COMMERCIAL ACTIONS & FOLLOW-UPS MODULE */}
          <Card>
            <div className="flex items-center justify-between mb-3 border-b border-[#D6CFC2]/60 pb-2">
              <h3 className="font-heading font-bold text-sm sm:text-base text-primary flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-primary" />
                <span>{language === 'EN' ? `Commercial Actions & Follow-ups (${commercialActions.length})` : `Commerciële Acties & Follow-ups (${commercialActions.length})`}</span>
              </h3>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => setCommercialModalOpen(true)}
                className="py-1 px-2.5 text-[10px] border-primary/40 text-primary hover:bg-primary/10 font-bold"
              >
                + {language === 'EN' ? 'Log Follow-up Note' : 'Notitie Toevoegen'}
              </Button>
            </div>

            {commercialActions.length > 0 ? (
              <div className="space-y-2.5 text-xs">
                {commercialActions.map((item) => (
                  <div key={item.id} className="p-3 bg-white border border-[#D6CFC2] rounded-xl space-y-1.5 shadow-2xs">
                    <div className="flex items-center justify-between text-[10px] text-dark/50">
                      <span className="font-bold text-primary font-mono">{item.user || 'Admin'}</span>
                      <span className="font-mono">{item.date}</span>
                    </div>
                    <p className="text-dark/90 font-medium text-xs leading-relaxed">{item.note}</p>
                    {item.assignee && (
                      <div className="pt-1 border-t border-[#D6CFC2]/40 flex items-center justify-between text-[10px]">
                        <span className="text-dark/50">Follow-up Task Assigned:</span>
                        <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded font-mono">
                          👤 {item.assignee} ({item.dueDate || 'Soon'})
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-dark/40 italic text-center py-3">
                {language === 'EN' ? 'No commercial follow-up notes logged yet.' : 'Nog geen commerciële follow-up notities.'}
              </p>
            )}
          </Card>

          {/* PROJECT TASKS MODULE */}
          <Card>
            <div className="flex items-center justify-between mb-3 border-b border-[#D6CFC2]/60 pb-2">
              <h3 className="font-heading font-bold text-sm sm:text-base text-primary flex items-center gap-1.5">
                <CheckSquare className="w-4 h-4 text-primary" />
                <span>{language === 'EN' ? `Project Tasks (${projectTasks.length})` : `Project Taken (${projectTasks.length})`}</span>
              </h3>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => setTaskModalOpen(true)}
                className="py-1 px-2 text-[10px] border-primary/40 text-primary hover:bg-primary/10 font-bold"
              >
                + {language === 'EN' ? 'Add Task' : 'Taak Toevoegen'}
              </Button>
            </div>

            {projectTasks.length > 0 ? (
              <div className="space-y-2 text-xs">
                {projectTasks.map((t) => (
                  <div key={t.id} className="p-2.5 bg-white border border-[#D6CFC2] rounded-lg flex items-center justify-between gap-2 shadow-2xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <input 
                        type="checkbox" 
                        checked={t.completed} 
                        onChange={() => {
                          const updated = projectTasks.map(item => item.id === t.id ? { ...item, completed: !item.completed } : item);
                          setProjectTasks(updated);
                        }}
                        className="w-4 h-4 text-primary rounded cursor-pointer"
                      />
                      <span className={`font-semibold truncate ${t.completed ? 'line-through text-dark/40' : 'text-dark'}`}>{t.title}</span>
                    </div>
                    <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-mono font-bold flex-shrink-0">
                      👤 {t.assignee || t.assignedTo || 'Bram'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-dark/40 italic text-center py-3">
                {language === 'EN' ? 'No open tasks for this project.' : 'Geen openstaande taken voor dit project.'}
              </p>
            )}
          </Card>

        </div>

        {/* Right Column (1/3): Client Meta, Auto-Messages & Real-time Activity Timeline */}
        <div className="space-y-6">
          
          {/* Client Metadata & Direct Communication Card */}
          <Card>
            <h3 className="font-heading font-bold text-base text-primary mb-3 flex items-center justify-between">
              <span>{language === 'NL' ? 'Klant Informatie & Contact' : 'Client Information & Contact'}</span>
              <Badge variant="info">{customerName}</Badge>
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-[#EDE8DF]/50 rounded-xl border border-[#D6CFC2]/60 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-dark/50 uppercase text-[10px] font-bold">Email</span>
                  <span className="font-semibold text-dark truncate max-w-[170px]">{customerEmail}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-dark/50 uppercase text-[10px] font-bold">Phone</span>
                  <span className="font-mono text-dark">{customerPhone}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-dark/50 uppercase text-[10px] font-bold">Address</span>
                  <span className="font-semibold text-dark truncate max-w-[170px]">{deliveryAddress}</span>
                </div>
              </div>

              {/* Quick Communication Buttons */}
              <div className="flex gap-2">
                <a
                  href={`https://wa.me/${customerPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(customMsgText)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1 shadow-xs"
                >
                  <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                </a>
                <a
                  href={`tel:${customerPhone}`}
                  className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1 shadow-xs"
                >
                  <Phone className="w-3.5 h-3.5" /> Call
                </a>
                <a
                  href={`mailto:${customerEmail}?subject=${encodeURIComponent(`Project Update #${project?.id || 'PRJ'}`)}&body=${encodeURIComponent(customMsgText)}`}
                  className="flex-1 py-2 bg-[#3E4E36] hover:bg-[#2e3a28] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1 shadow-xs"
                >
                  <Mail className="w-3.5 h-3.5" /> Email
                </a>
              </div>
            </div>
          </Card>

          {/* Auto Communication Templates Card */}
          <Card>
            <h3 className="font-heading font-bold text-sm text-primary mb-3 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>{language === 'EN' ? 'Quick Client Message Templates' : 'Bericht Templates'}</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-dark/60 uppercase mb-1">Select Template</label>
                <select
                  value={selectedTemplate}
                  onChange={(e) => setSelectedTemplate(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-[#D6CFC2] rounded-lg text-xs font-bold text-dark cursor-pointer"
                >
                  <option value="completion">🎉 Delivery & Completion Confirmation</option>
                  <option value="progress">📊 Build Progress Update ({progressVal}%)</option>
                  <option value="planning">📅 Delivery & Schedule Confirmation</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-dark/60 uppercase mb-1">Message Preview</label>
                <textarea
                  rows="3"
                  value={customMsgText}
                  onChange={(e) => setCustomMsgText(e.target.value)}
                  className="w-full p-2.5 bg-white border border-[#D6CFC2] rounded-lg text-xs text-dark font-body"
                />
              </div>

              <div className="flex gap-2">
                <a
                  href={`https://wa.me/${customerPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(customMsgText)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-1"
                >
                  <Send className="w-3 h-3" /> Send WhatsApp
                </a>
              </div>
            </div>
          </Card>

          {/* Activity Timeline */}
          <Card>
            <h3 className="font-heading font-bold text-base text-primary mb-4 flex items-center justify-between">
              <span>{language === 'NL' ? 'Project Mijlpalen' : 'Project Milestones'}</span>
              <Clock className="w-4 h-4 text-dark/40" />
            </h3>

            <div className="relative pl-6 space-y-4 text-xs before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#D6CFC2]">
              {projectTimeline.map((item) => (
                <div key={item.id} className="relative">
                  <div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-primary ring-4 ring-[#EDE8DF]" />
                  <div className="font-semibold text-dark">{item.title}</div>
                  <div className="text-dark/60 text-[11px] mt-0.5">{item.desc}</div>
                  <div className="flex justify-between items-center text-[10px] text-dark/40 mt-1 font-mono">
                    <span>{item.time}</span>
                    <span>{item.user}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

        </div>

      </div>

      {/* LOG COMMERCIAL ACTION / FOLLOW-UP NOTE MODAL */}
      <AnimatePresence>
        {commercialModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark/60 backdrop-blur-xs">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-[#EDE8DF] border border-[#D6CFC2] rounded-2xl shadow-card p-6 w-full max-w-lg space-y-4">
              <div className="flex justify-between items-center border-b border-[#D6CFC2] pb-3">
                <h3 className="font-heading font-bold text-lg text-primary flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-primary" />
                  <span>{language === 'EN' ? 'Log Commercial Action / Follow-up Note' : 'Commerciële Actie / Follow-up Notitie'}</span>
                </h3>
                <button onClick={() => setCommercialModalOpen(false)} className="text-dark/40 hover:text-dark">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveCommercialAction} className="space-y-4 text-xs font-body text-dark">
                <div>
                  <label className="block text-xs font-bold text-dark/60 uppercase tracking-wider mb-1">
                    {language === 'EN' ? 'Follow-up Note / Call Summary *' : 'Notitie / Telefoongesprek *'}
                  </label>
                  <textarea
                    required
                    rows="3"
                    value={newCommercialNote}
                    onChange={(e) => setNewCommercialNote(e.target.value)}
                    className="w-full p-3 bg-white border border-[#D6CFC2] rounded-xl text-xs font-body text-dark focus:ring-2 focus:ring-primary/20"
                    placeholder={language === 'EN' ? 'e.g. Spoke with client regarding wood stain options. Client prefers natural oil finish...' : 'b.v. Gesproken met klant over houtolie. Klant verkiest natuurlijke afwerking...'}
                  />
                </div>

                <div className="p-3 bg-white/70 rounded-xl border border-[#D6CFC2] space-y-3">
                  <label className="flex items-center gap-2 font-bold text-dark cursor-pointer">
                    <input
                      type="checkbox"
                      checked={commercialTaskForm.createTask}
                      onChange={(e) => setCommercialTaskForm({ ...commercialTaskForm, createTask: e.target.checked })}
                      className="w-4 h-4 text-primary rounded"
                    />
                    <span>{language === 'EN' ? 'Create a follow-up task on Task Board' : 'Maak ook een follow-up taak aan'}</span>
                  </label>

                  {commercialTaskForm.createTask && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div>
                        <label className="block font-bold text-dark/60 uppercase text-[10px] mb-1">Assign Task To</label>
                        <select
                          value={commercialTaskForm.assignee}
                          onChange={(e) => setCommercialTaskForm({ ...commercialTaskForm, assignee: e.target.value })}
                          className="w-full px-2.5 py-1.5 bg-white border border-[#D6CFC2] rounded-lg font-bold text-dark text-xs"
                        >
                          <option value="Bram">👤 Bram</option>
                          <option value="Tim">👤 Tim</option>
                        </select>
                      </div>
                      <div>
                        <label className="block font-bold text-dark/60 uppercase text-[10px] mb-1">Task Due Date</label>
                        <input
                          type="date"
                          value={commercialTaskForm.dueDate}
                          onChange={(e) => setCommercialTaskForm({ ...commercialTaskForm, dueDate: e.target.value })}
                          className="w-full px-2.5 py-1.5 bg-white border border-[#D6CFC2] rounded-lg font-bold text-dark text-xs"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-[#D6CFC2]">
                  <Button type="button" variant="outline" onClick={() => setCommercialModalOpen(false)}>
                    {language === 'EN' ? 'Cancel' : 'Annuleren'}
                  </Button>
                  <Button type="submit" variant="primary">
                    {language === 'EN' ? 'Save Follow-up Note' : 'Notitie Opslaan'}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ADD TASK MODAL */}
      <AnimatePresence>
        {taskModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark/60 backdrop-blur-xs">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-[#EDE8DF] border border-[#D6CFC2] rounded-2xl shadow-card p-6 w-full max-w-lg space-y-4">
              <div className="flex justify-between items-center border-b border-[#D6CFC2] pb-3">
                <h3 className="font-heading font-bold text-lg text-primary flex items-center gap-2">
                  <CheckSquare className="w-5 h-5 text-primary" />
                  <span>{language === 'EN' ? 'Add Task to Project' : 'Project Taak Toevoegen'}</span>
                </h3>
                <button onClick={() => setTaskModalOpen(false)} className="text-dark/40 hover:text-dark">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveTask} className="space-y-4 text-xs font-body text-dark">
                <div>
                  <label className="block text-xs font-bold text-dark/60 uppercase tracking-wider mb-1">
                    {language === 'EN' ? 'Task Description / Title *' : 'Taak Omschrijving *'}
                  </label>
                  <input
                    required
                    type="text"
                    value={newTaskForm.title}
                    onChange={(e) => setNewTaskForm({ ...newTaskForm, title: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#D6CFC2] rounded-xl text-xs font-body text-dark focus:ring-2 focus:ring-primary/20"
                    placeholder={language === 'EN' ? 'e.g. Confirm teak wood delivery with Erik van den Berg...' : 'b.v. Houtlevering bevestigen met leverancier...'}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-dark/60 uppercase text-[10px] mb-1">Assign To</label>
                    <select
                      value={newTaskForm.assignee}
                      onChange={(e) => setNewTaskForm({ ...newTaskForm, assignee: e.target.value })}
                      className="w-full px-2.5 py-2 bg-white border border-[#D6CFC2] rounded-lg font-bold text-dark text-xs"
                    >
                      <option value="Bram">👤 Bram</option>
                      <option value="Tim">👤 Tim</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-dark/60 uppercase text-[10px] mb-1">Due Date</label>
                    <input
                      type="date"
                      value={newTaskForm.dueDate}
                      onChange={(e) => setNewTaskForm({ ...newTaskForm, dueDate: e.target.value })}
                      className="w-full px-2.5 py-2 bg-[#F8F7F4] border border-[#D6CFC2] rounded-lg font-bold text-dark text-xs"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-[#D6CFC2]">
                  <Button type="button" variant="outline" onClick={() => setTaskModalOpen(false)}>
                    {language === 'EN' ? 'Cancel' : 'Annuleren'}
                  </Button>
                  <Button type="submit" variant="primary">
                    {language === 'EN' ? 'Create Task' : 'Taak Opslaan'}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* RICH UPLOAD PHOTOS POPUP / MODAL (FOR THIS SPECIFIC PROJECT) */}
      <AnimatePresence>
        {uploadModalOpen && (
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 overflow-y-auto">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-dark/75 backdrop-blur-xs z-[99999]" onClick={() => setUploadModalOpen(false)} />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative w-full max-w-xl bg-[#EDE8DF] border border-[#C4BEB3] rounded-2xl p-6 shadow-2xl z-[100000] space-y-4 text-xs font-body max-h-[90vh] overflow-y-auto my-auto">
              <div className="flex justify-between items-center border-b border-[#D6CFC2] pb-3">
                <div>
                  <span className="text-[10px] font-bold text-accent uppercase font-mono tracking-wider">Project Photo Management</span>
                  <h3 className="font-heading font-bold text-primary text-base flex items-center gap-2 mt-0.5">
                    <Camera className="w-5 h-5 text-accent" />
                    {language === 'EN' ? 'Upload Project Progress Photos' : 'Project Voortgangsfoto\'s Uploaden'}
                  </h3>
                </div>
                <button onClick={() => setUploadModalOpen(false)} className="p-1 text-dark/40 hover:text-dark cursor-pointer"><X className="w-5 h-5" /></button>
              </div>

              {/* Project & Customer Metadata Locked Banner */}
              <div className="p-3 bg-white rounded-xl border border-[#D6CFC2] space-y-1.5 shadow-2xs">
                <div className="flex justify-between items-center text-[10px] text-dark/50">
                  <span className="font-bold uppercase tracking-wider">Selected Project</span>
                  <Badge variant="info">{project?.id || 'PRJ-101'}</Badge>
                </div>
                <p className="font-heading font-bold text-primary text-sm truncate">{project?.name || 'Bespoke Outdoor Kitchen'}</p>
                <div className="flex justify-between items-center text-[11px] text-dark/70 font-mono">
                  <span>Customer: <strong className="text-primary">{customerName}</strong></span>
                  <span>Delivery: <strong className="text-accent">{deliveryDate}</strong></span>
                </div>
              </div>

              <form onSubmit={handleUploadSubmit} className="space-y-4">
                {/* Drag & Drop Photo Upload Area */}
                <div>
                  <label className="block font-bold text-dark/70 mb-1 uppercase tracking-wider text-[10px]">
                    {language === 'EN' ? 'Select Photo Files (Drag & Drop or Browse) *' : 'Selecteer Fotobestanden (Drag & Drop of Bladeren) *'}
                  </label>
                  <div
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDropFiles}
                    onClick={() => photoFileInputRef.current?.click()}
                    className={`border-2 border-dashed p-6 rounded-2xl text-center cursor-pointer transition-all ${
                      isDragging ? 'border-primary bg-primary/10' : 'border-[#D6CFC2] bg-white hover:bg-[#F8F7F4]'
                    }`}
                  >
                    <Camera className="w-8 h-8 text-primary mx-auto mb-2 animate-pulse" />
                    <p className="text-xs font-bold text-primary">
                      {language === 'EN' ? 'Click or drag & drop multiple photo files here' : 'Klik of sleep meerdere fotobestanden hiernaartoe'}
                    </p>
                    <p className="text-[10px] text-dark/50 mt-0.5">PNG, JPG, WEBP • Multiple files supported</p>
                    <input
                      type="file"
                      ref={photoFileInputRef}
                      multiple
                      accept="image/*"
                      onChange={handleSelectMultipleFiles}
                      className="hidden"
                    />
                  </div>
                </div>

                {/* Selected Photo Previews Grid with Remove Option */}
                {selectedUploadFiles.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-dark/60 uppercase">Selected Previews ({selectedUploadFiles.length}):</span>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-36 overflow-y-auto p-1.5 bg-white rounded-xl border border-[#D6CFC2]">
                      {selectedUploadFiles.map((fileObj, idx) => (
                        <div key={idx} className="relative group rounded-lg overflow-hidden border border-[#D6CFC2] h-20 bg-black/10">
                          <img src={fileObj.src} alt={fileObj.name} className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); handleRemoveSelectedUploadFile(idx); }}
                            className="absolute top-1 right-1 p-1 bg-rose-600 text-white rounded-full hover:bg-rose-700 transition-colors shadow-xs cursor-pointer z-10"
                            title="Remove Photo"
                          >
                            <X className="w-3 h-3" />
                          </button>
                          <span className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[8px] truncate px-1 py-0.5">
                            {fileObj.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Photo Caption / Development Phase Preset Input */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-dark/70 mb-1 uppercase tracking-wider text-[10px]">
                      {language === 'EN' ? 'Progress Category / Phase' : 'Voortgang Categorie / Fase'}
                    </label>
                    <select
                      value={uploadForm.captionCategory}
                      onChange={e => setUploadForm(prev => ({ ...prev, captionCategory: e.target.value }))}
                      className="w-full px-3 py-2 bg-white border border-[#D6CFC2] rounded-lg text-xs font-bold text-primary"
                    >
                      <option value="Initial Construction">🔨 1. Initial Construction (Houtbewerking)</option>
                      <option value="Frame Completed">📐 2. Frame Completed (Frame Gemonteerd)</option>
                      <option value="Countertop Installation">✨ 3. Countertop Installation (Betonblad Polijsten)</option>
                      <option value="Final Installation">🏆 4. Final Installation & Inspection (Eindkeuring)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-dark/70 mb-1 uppercase tracking-wider text-[10px]">
                      {language === 'EN' ? 'Photo Title / Caption' : 'Foto Titel / Bijschrift'}
                    </label>
                    <input
                      type="text"
                      value={uploadForm.title}
                      onChange={e => setUploadForm(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-3 py-2 bg-white border border-[#D6CFC2] rounded-lg text-xs font-bold text-dark"
                      placeholder="e.g. Massief Teakhout Frame Gezaagd"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-dark/70 mb-1 uppercase tracking-wider text-[10px]">
                    {language === 'EN' ? 'Description & Notes for Customer' : 'Werkplaats Toelichting voor Klant'}
                  </label>
                  <textarea
                    rows={2}
                    value={uploadForm.desc}
                    onChange={e => setUploadForm(prev => ({ ...prev, desc: e.target.value }))}
                    className="w-full px-3 py-2 bg-white border border-[#D6CFC2] rounded-lg text-xs text-dark"
                    placeholder="e.g. Solid teak frame assembled and ready for countertop polishing..."
                  />
                </div>

                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-900">
                    {language === 'EN' ? 'Share in Customer Portal Immediately' : 'Direct delen in Klantenportaal'}
                  </span>
                  <input
                    type="checkbox"
                    checked={uploadForm.isShared}
                    onChange={e => setUploadForm(prev => ({ ...prev, isShared: e.target.checked }))}
                    className="w-4 h-4 accent-emerald-600 cursor-pointer"
                  />
                </div>

                {/* Action Buttons with Loading State */}
                <div className="flex justify-end gap-2 pt-3 border-t border-[#D6CFC2]">
                  <Button type="button" variant="outline" onClick={() => setUploadModalOpen(false)}>
                    {language === 'EN' ? 'Cancel' : 'Annuleren'}
                  </Button>
                  <Button
                    type="submit"
                    disabled={selectedUploadFiles.length === 0 || isUploading}
                    className="bg-primary text-cream font-bold cursor-pointer"
                  >
                    {isUploading ? (
                      <span className="flex items-center gap-2">
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Uploading...
                      </span>
                    ) : (
                      `🚀 Save & Share ${selectedUploadFiles.length} Photos`
                    )}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* FULLSCREEN LIGHTBOX PREVIEW MODAL */}
      <AnimatePresence>
        {previewPhoto && (
          <div className="fixed inset-0 z-[100001] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-dark/85 backdrop-blur-md" onClick={() => setPreviewPhoto(null)} />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative w-full max-w-2xl bg-[#EDE8DF] border border-[#C4BEB3] rounded-2xl p-5 shadow-2xl z-[100002] space-y-3 text-xs my-auto font-body">
              <div className="flex justify-between items-start border-b border-[#D6CFC2] pb-2">
                <div>
                  <span className="text-[10px] font-mono text-accent font-bold uppercase block">{previewPhoto.phase}</span>
                  <h3 className="text-lg font-heading font-bold text-primary">{previewPhoto.title}</h3>
                </div>
                <button onClick={() => setPreviewPhoto(null)} className="p-1 text-dark/40 hover:text-dark cursor-pointer"><X className="w-5 h-5" /></button>
              </div>

              <div className="rounded-xl overflow-hidden border border-[#D6CFC2] bg-black max-h-[50vh]">
                <img src={previewPhoto.img} alt={previewPhoto.title} className="w-full h-full object-contain mx-auto" />
              </div>

              <div className="p-3 bg-white rounded-xl border border-[#D6CFC2] space-y-2 text-xs">
                <p className="text-dark/80">{previewPhoto.description}</p>
                <div className="pt-2 border-t border-[#D6CFC2]/40 flex justify-between items-center text-[10px] text-dark/50 font-mono">
                  <span>Project: <strong className="text-primary">[{project?.id || 'PRJ'}] {project?.name}</strong></span>
                  <span>Uploader: <strong className="text-accent">{previewPhoto.craftsman}</strong></span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
