import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import { 
  Camera, Upload, Eye, Trash2, Edit2, RefreshCw, X, Plus, Search, Filter, 
  Sparkles, CheckCircle, Image as ImageIcon, Layers, User, Briefcase, ExternalLink, 
  Share2, Lock, Check, Send
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { mockProjects, mockLeads } from '../../utils/mockData';
import { safeSetItem, compressImage } from '../../utils/storageHelper';
import projectImg from '../../assets/outdoor_project_card.png';
import heroImg from '/dasbordes images.png';

export default function AdminPhotos() {
  const { t, language } = useLanguage();
  const location = useLocation();
  const fileInputRef = useRef(null);
  const replaceFileInputRef = useRef(null);

  const [photosList, setPhotosList] = useState([]);
  const [projectsList, setProjectsList] = useState([]);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState(location?.state?.projectId || 'All');
  const [toastMsg, setToastMsg] = useState('');

  // Fullscreen Preview Modal
  const [previewPhoto, setPreviewPhoto] = useState(null);

  // Upload Modal State
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadForm, setUploadForm] = useState({
    projectId: 'PRJ-101',
    projectName: 'Luxury Teak Outdoor Kitchen',
    customer: 'John Miller',
    title: '',
    phase: `${new Date().toLocaleDateString('default', { day: 'numeric', month: 'short', year: 'numeric' })}`,
    description: '',
    craftsman: 'Tim & Bram (Admin)',
    isShared: true
  });

  // Edit / Replace Photo Modal State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState(null);
  const [editForm, setEditForm] = useState({
    title: '',
    phase: '',
    description: '',
    customer: '',
    projectId: '',
    projectName: '',
    craftsman: '',
    isShared: true
  });

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3500);
  };

  const defaultPhotoUpdates = [
    {
      id: 'P-101',
      projectId: 'PRJ-101',
      projectName: 'Luxury Teak Outdoor Kitchen',
      customer: 'John Miller',
      title: language === 'EN' ? 'Teak Wood Frame Construction' : 'Teakhouten Frame Constructie',
      phase: language === 'EN' ? 'Workshop Phase Date: 12 Oct 2026' : 'Werkplaats Fasedatum: 12 Okt 2026',
      description: language === 'EN' ? 'The solid teak wood frame has been cut to size and assembled by craftsman Sven Hoek.' : 'Het massieve teak houten frame is op maat gezaagd en gemonteerd door vakman Sven Hoek.',
      img: projectImg,
      craftsman: 'Sven Hoek',
      uploaderRole: 'partner',
      isShared: true
    },
    {
      id: 'P-102',
      projectId: 'PRJ-101',
      projectName: 'Luxury Teak Outdoor Kitchen',
      customer: 'John Miller',
      title: language === 'EN' ? 'Polishing Concrete Top & Grill Cutout' : 'Polijsten Betonblad & Grill Uitsparing',
      phase: language === 'EN' ? 'Workshop Phase Date: 18 Oct 2026' : 'Werkplaats Fasedatum: 18 Okt 2026',
      description: language === 'EN' ? 'The dark grey concrete top has been polished and provided with a water-repellent protective layer.' : 'Het donkergrijze betonblad is gepolijst en voorzien van waterafstotende beschermlaag.',
      img: heroImg,
      craftsman: 'Sven Hoek',
      uploaderRole: 'partner',
      isShared: true
    },
    {
      id: 'P-103',
      projectId: 'PRJ-102',
      projectName: 'Oak Wooden Canopy 6x4m',
      customer: 'Sophia Taylor',
      title: language === 'EN' ? 'Final Inspection & Quality Control' : 'Eindkeuring & Kwaliteitscontrole',
      phase: language === 'EN' ? 'Workshop Phase Date: 24 Oct 2026' : 'Werkplaats Fasedatum: 24 Okt 2026',
      description: language === 'EN' ? 'Tim & Bram have checked the drawers, hinges and cable ducts.' : 'Tim & Bram hebben de lades, scharnieren en kabeldoorvoeren gecontroleerd.',
      img: projectImg,
      craftsman: 'Tim & Bram (Admin)',
      uploaderRole: 'admin',
      isShared: true
    }
  ];

  // Load Data from LocalStorage
  const loadData = () => {
    try {
      // Load Projects
      let activeP = mockProjects;
      const savedProjects = localStorage.getItem('app_projects');
      if (savedProjects) {
        const parsedP = JSON.parse(savedProjects);
        if (Array.isArray(parsedP) && parsedP.length > 0) activeP = parsedP;
      }
      setProjectsList(activeP);

      // Load Photos
      const savedPhotos = localStorage.getItem('app_project_photos');
      if (savedPhotos) {
        const parsedPhotos = JSON.parse(savedPhotos);
        if (Array.isArray(parsedPhotos) && parsedPhotos.length > 0) {
          setPhotosList(parsedPhotos);
          return;
        }
      }
    } catch (e) {}

    setPhotosList(defaultPhotoUpdates);
    localStorage.setItem('app_project_photos', JSON.stringify(defaultPhotoUpdates));
  };

  useEffect(() => {
    loadData();
    window.addEventListener('storage', loadData);
    window.addEventListener('app_data_changed', loadData);
    return () => {
      window.removeEventListener('storage', loadData);
      window.removeEventListener('app_data_changed', loadData);
    };
  }, []);

  // Filtered Photos by Selected Project & Search Query
  const filteredPhotos = photosList.filter(photo => {
    const matchesSearch = 
      (photo.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (photo.projectName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (photo.customer || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (photo.projectId || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (photo.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (photo.craftsman || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesProject = selectedProjectId === 'All' || photo.projectId === selectedProjectId;
    return matchesSearch && matchesProject;
  });

  // Multiple Image Selection Handler with Canvas Compression
  const handleMultipleFilesSelected = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    for (const file of files) {
      try {
        const compressedSrc = await compressImage(file, 1200, 0.82);
        setSelectedFiles(prev => [...prev, {
          name: file.name,
          src: compressedSrc
        }]);
      } catch (err) {
        console.warn('Image processing failed:', err);
      }
    }
  };

  const handleRemoveSelectedFile = (idx) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== idx));
  };

  // Open Upload Modal for Specific Selected Project
  const handleOpenUploadForProject = (targetProjId) => {
    const targetProj = projectsList.find(p => p.id === targetProjId) || projectsList[0];
    setUploadForm({
      projectId: targetProj ? targetProj.id : 'PRJ-101',
      projectName: targetProj ? targetProj.name : 'Luxury Teak Outdoor Kitchen',
      customer: targetProj ? targetProj.customer : 'John Miller',
      title: '',
      phase: `${new Date().toLocaleDateString('default', { day: 'numeric', month: 'short', year: 'numeric' })}`,
      description: '',
      craftsman: 'Tim & Bram (Admin)',
      isShared: true
    });
    setUploadModalOpen(true);
  };

  // Toggle Share Photo with Customer Handler
  const handleToggleShareWithCustomer = (photoId) => {
    const updatedList = photosList.map(p => {
      if (p.id === photoId) {
        const nextShareState = !p.isShared;
        showToast(
          nextShareState
            ? `Photo shared for project ${p.projectId}! Now visible in ${p.customer}'s portal.`
            : `Photo unshared. Hidden from customer portal.`
        );
        return { ...p, isShared: nextShareState };
      }
      return p;
    });

    setPhotosList(updatedList);
    safeSetItem('app_project_photos', updatedList);
    window.dispatchEvent(new Event('app_data_changed'));
  };

  // Submit Multiple Photos Upload & Share Linked by Project
  const handleUploadPhotosSubmit = (e) => {
    e.preventDefault();
    if (selectedFiles.length === 0) {
      return showToast(language === 'EN' ? 'Please select at least one photo file.' : 'Selecteer alstublieft minimaal één fotobestand.');
    }

    const targetProjObj = projectsList.find(p => p.id === uploadForm.projectId) || projectsList[0];
    const finalProjId = targetProjObj ? targetProjObj.id : uploadForm.projectId;
    const finalProjName = targetProjObj ? targetProjObj.name : uploadForm.projectName;
    const finalCustomer = targetProjObj ? targetProjObj.customer : uploadForm.customer;

    const newPhotoEntries = selectedFiles.map((fileObj, index) => ({
      id: `P-${Date.now().toString().slice(-4)}-${index + 1}`,
      projectId: finalProjId,
      projectName: finalProjName,
      customer: finalCustomer,
      title: uploadForm.title.trim() || fileObj.name.replace(/\.[^/.]+$/, ""),
      phase: uploadForm.phase ? `Werkplaats Fasedatum: ${uploadForm.phase}` : `Datum: ${new Date().toLocaleDateString('default', { day: 'numeric', month: 'short' })}`,
      description: uploadForm.description.trim() || (language === 'EN' ? 'Project update photo shared by Admin.' : 'Projectfoto update gedeeld door beheerder.'),
      img: fileObj.src,
      craftsman: uploadForm.craftsman || 'Tim & Bram (Admin)',
      uploaderRole: 'admin',
      isShared: uploadForm.isShared,
      date: new Date().toISOString().split('T')[0]
    }));

    const updatedPhotosList = [...newPhotoEntries, ...photosList];
    setPhotosList(updatedPhotosList);
    safeSetItem('app_project_photos', updatedPhotosList);
    window.dispatchEvent(new Event('app_data_changed'));

    showToast(
      language === 'EN'
        ? `Successfully linked ${newPhotoEntries.length} photos to Project ${finalProjId}! Live in ${finalCustomer}'s Customer Portal.`
        : `Succesvol ${newPhotoEntries.length} foto's gekoppeld aan Project ${finalProjId}! Nu zichtbaar in het Klantenportaal.`
    );

    setSelectedFiles([]);
    setUploadModalOpen(false);
  };

  // Delete Photo Handler
  const handleDeletePhoto = (photoId) => {
    const updated = photosList.filter(p => p.id !== photoId);
    setPhotosList(updated);
    safeSetItem('app_project_photos', updated);
    window.dispatchEvent(new Event('app_data_changed'));
    showToast(language === 'EN' ? 'Photo deleted from gallery and customer portal.' : 'Foto verwijderd uit de galerij en het klantenportaal.');
  };

  // Open Edit Modal
  const handleOpenEditModal = (photo) => {
    setEditingPhoto(photo);
    setEditForm({
      title: photo.title || '',
      phase: photo.phase || '',
      description: photo.description || '',
      customer: photo.customer || '',
      craftsman: photo.craftsman || 'Tim & Bram (Admin)',
      isShared: photo.isShared !== false
    });
    setEditModalOpen(true);
  };

  // Save Photo Edit
  const handleSaveEditSubmit = (e) => {
    e.preventDefault();
    if (!editingPhoto) return;

    const updatedList = photosList.map(p => {
      if (p.id === editingPhoto.id) {
        return {
          ...p,
          title: editForm.title.trim(),
          phase: editForm.phase.trim(),
          description: editForm.description.trim(),
          customer: editForm.customer.trim(),
          craftsman: editForm.craftsman.trim(),
          isShared: editForm.isShared
        };
      }
      return p;
    });

    setPhotosList(updatedList);
    safeSetItem('app_project_photos', updatedList);
    window.dispatchEvent(new Event('app_data_changed'));
    showToast(language === 'EN' ? 'Photo details updated successfully!' : 'Fotogegevens succesvol bijgewerkt!');
    setEditModalOpen(false);
    setEditingPhoto(null);
  };

  // Replace Photo File
  const handleReplacePhotoFile = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file || !editingPhoto) return;

    try {
      const newImgSrc = await compressImage(file, 1200, 0.82);
      const updatedList = photosList.map(p => p.id === editingPhoto.id ? { ...p, img: newImgSrc } : p);
      setPhotosList(updatedList);
      setEditingPhoto(prev => ({ ...prev, img: newImgSrc }));
      safeSetItem('app_project_photos', updatedList);
      window.dispatchEvent(new Event('app_data_changed'));
      showToast(language === 'EN' ? 'Photo image file replaced successfully!' : 'Fotobestand succesvol vervangen!');
    } catch (err) {
      console.warn('Replace file error:', err);
    }
  };

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

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-heading font-bold text-primary flex items-center gap-2">
            <Camera className="w-6 h-6 text-primary" />
            {language === 'EN' ? 'Customer Photos & Media Sharing' : 'Klant Foto-Beheer & Delen'}
            <span className="text-[10px] bg-primary/10 text-primary border border-primary/20 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">Customer Portal Sync</span>
          </h2>
          <p className="text-dark/60 text-sm mt-0.5">
            {language === 'EN' 
              ? 'Select customer, upload build photos, and share them directly into their portal.' 
              : 'Selecteer een klant, upload foto\'s en deel ze direct in hun persoonlijke klantenportaal.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            icon={Send}
            onClick={() => handleOpenUploadForProject(selectedProjectId !== 'All' ? selectedProjectId : (projectsList[0]?.id || 'PRJ-101'))}
            className="py-2 px-4 text-xs font-bold shadow-sm"
          >
            {language === 'EN' ? '+ Upload & Share Photo for Project' : '+ Foto Uploaden voor Project'}
          </Button>
        </div>
      </div>

      {/* PROJECT DROPDOWN & PHOTO MANAGEMENT TOOLBAR */}
      <Card p="p-4" className="border-l-4 border-l-primary">
        <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
          
          {/* PROJECT DROPDOWN SELECTOR */}
          <div className="flex items-center gap-3 bg-[#EDE8DF] border border-[#C4BEB3] p-2 rounded-xl flex-1 max-w-md">
            <Briefcase className="w-5 h-5 text-primary ml-1 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <label className="block text-[9px] font-bold text-dark/50 uppercase tracking-wider">
                {language === 'EN' ? 'Select Target Project *' : 'Selecteer Project om Foto\'s te Beheren *'}
              </label>
              <select
                value={selectedProjectId}
                onChange={e => setSelectedProjectId(e.target.value)}
                className="w-full bg-transparent text-xs font-bold text-primary cursor-pointer outline-none border-none p-0 focus:ring-0 truncate"
              >
                <option value="All">{language === 'EN' ? `All Projects (${projectsList.length})` : `Alle Projecten (${projectsList.length})`}</option>
                {projectsList.map((p) => (
                  <option key={p.id} value={p.id}>[{p.id}] {p.name} ({p.customer})</option>
                ))}
              </select>
            </div>
          </div>

          {/* Search Box */}
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark/40" />
            <input
              type="text"
              placeholder={language === 'EN' ? 'Search project ID, title, or description...' : 'Zoek op project ID, titel of omschrijving...'}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-[#D6CFC2] rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 text-[#4A4A43]"
            />
          </div>
        </div>

        {/* Selected Project Active Banner */}
        {selectedProjectId !== 'All' && (
          <div className="mt-3 pt-3 border-t border-[#D6CFC2]/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 bg-primary/5 p-3 rounded-xl">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse flex-shrink-0"></span>
              <span className="text-xs font-bold text-primary truncate">
                {language === 'EN' ? `Managing Photos for Project: ` : `Foto's beheren voor Project: `}
                <u className="text-accent">
                  [{selectedProjectId}] {projectsList.find(p => p.id === selectedProjectId)?.name || selectedProjectId}
                </u>
              </span>
              <span className="text-[10px] font-mono text-dark/60 bg-white px-2 py-0.5 rounded border border-[#D6CFC2] flex-shrink-0">
                {filteredPhotos.length} {language === 'EN' ? 'Photos Linked' : 'Foto\'s Gekoppeld'}
              </span>
            </div>

            <Button
              size="sm"
              icon={Upload}
              onClick={() => handleOpenUploadForProject(selectedProjectId)}
              className="py-1 px-3 text-[11px] font-bold flex-shrink-0"
            >
              {language === 'EN' ? `+ Share Photo for Project ${selectedProjectId}` : `+ Foto Delen voor Project ${selectedProjectId}`}
            </Button>
          </div>
        )}
      </Card>

      {/* Photo Cards Gallery Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
        {filteredPhotos.map((photo) => {
          const isShared = photo.isShared !== false;

          return (
            <Card key={photo.id} noPadding className="overflow-hidden hover:shadow-card-hover transition-all group flex flex-col justify-between border-2 border-[#D6CFC2]/80">
              <div>
                {/* Photo Image & Badge Overlay */}
                <div className="relative h-48 bg-cream-dark/20 overflow-hidden cursor-pointer" onClick={() => setPreviewPhoto(photo)}>
                  <img src={photo.img} alt={photo.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/20 to-transparent"></div>

                  {/* Project ID & Customer Badge */}
                  <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-lg border border-[#D6CFC2] text-[10px] font-bold text-primary flex items-center gap-1 shadow-xs max-w-[70%] truncate">
                    <Briefcase className="w-3 h-3 text-accent flex-shrink-0" />
                    <span className="truncate">[{photo.projectId || 'PRJ-101'}] {photo.customer || 'John Miller'}</span>
                  </div>

                  {/* Customer Sharing Status Indicator Badge */}
                  <div className="absolute top-3 right-3">
                    {isShared ? (
                      <span className="inline-flex items-center gap-1 bg-emerald-700 text-white backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-bold shadow-xs">
                        <Check className="w-3 h-3" /> Shared with Client
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 bg-amber-600 text-white backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-bold shadow-xs">
                        <Lock className="w-3 h-3" /> Internal Only
                      </span>
                    )}
                  </div>

                  <div className="absolute bottom-3 left-3 right-3">
                    <p className="text-[10px] text-cyan-300 font-mono font-bold truncate">{photo.phase}</p>
                    <h4 className="font-heading font-bold text-white text-sm leading-tight truncate">{photo.title}</h4>
                  </div>
                </div>

                {/* Photo Meta Details */}
                <div className="p-3.5 space-y-2 text-xs font-body">
                  <p className="text-dark/70 line-clamp-2">{photo.description}</p>
                  <div className="pt-2 border-t border-[#D6CFC2]/40 flex justify-between items-center text-[10px] text-dark/50 font-mono">
                    <span>{language === 'EN' ? 'Uploader:' : 'Vakman:'} <strong className="text-primary">{photo.craftsman}</strong></span>
                    <Badge variant={photo.uploaderRole === 'admin' ? 'primary' : 'success'}>
                      {photo.uploaderRole === 'admin' ? 'Admin Upload' : 'Partner Upload'}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Admin Management Action Bar with Share Toggle Button */}
              <div className="p-3 bg-[#F8F7F4] border-t border-[#D6CFC2] flex items-center justify-between gap-1">
                <button
                  type="button"
                  onClick={() => handleToggleShareWithCustomer(photo.id)}
                  className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all border ${
                    isShared
                      ? 'bg-emerald-100 text-emerald-900 border-emerald-300 hover:bg-emerald-200'
                      : 'bg-primary text-cream border-primary hover:bg-primary/90'
                  }`}
                  title={isShared ? "Click to Unshare from Customer Portal" : "Click to Share with Customer"}
                >
                  <Share2 className="w-3.5 h-3.5" />
                  {isShared ? (language === 'EN' ? '✓ Shared' : '✓ Gedeeld') : (language === 'EN' ? '📤 Share with Client' : '📤 Delen met Klant')}
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPreviewPhoto(photo)}
                    className="p-1.5 bg-white hover:bg-primary/10 border border-[#D6CFC2] rounded-lg text-primary transition-colors"
                    title="Preview Fullscreen"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleOpenEditModal(photo)}
                    className="p-1.5 bg-white hover:bg-primary/10 border border-[#D6CFC2] rounded-lg text-dark/70 hover:text-primary transition-colors"
                    title="Edit Photo Details"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeletePhoto(photo.id)}
                    className="p-1.5 bg-white hover:bg-rose-50 border border-[#D6CFC2] rounded-lg text-dark/70 hover:text-rose-600 transition-colors"
                    title="Delete Photo"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </Card>
          );
        })}

        {filteredPhotos.length === 0 && (
          <div className="col-span-full border-2 border-dashed border-[#D6CFC2] rounded-2xl p-12 text-center bg-[#F8F7F4]/60 space-y-2">
            <Camera className="w-10 h-10 text-dark/30 mx-auto" />
            <h4 className="font-heading font-bold text-dark text-base">{language === 'EN' ? 'No Photos Linked to This Project' : 'Geen Foto\'s Gekoppeld aan Dit Project'}</h4>
            <p className="text-xs text-dark/50 max-w-sm mx-auto">
              {selectedProjectId !== 'All' 
                ? (language === 'EN' ? `Upload and share build photos for Project ${selectedProjectId}.` : `Upload en deel projectfoto's voor Project ${selectedProjectId}.`)
                : (language === 'EN' ? 'Select a project to view and upload build photos.' : 'Selecteer een project om foto\'s te bekijken en te uploaden.')}
            </p>
            <Button size="sm" icon={Send} onClick={() => handleOpenUploadForProject(selectedProjectId !== 'All' ? selectedProjectId : (projectsList[0]?.id || 'PRJ-101'))} className="mt-2">
              {language === 'EN' ? '+ Upload & Share Photo' : '+ Foto Uploaden & Delen'}
            </Button>
          </div>
        )}
      </div>

      {/* MULTIPLE PHOTOS UPLOAD & SHARE MODAL */}
      <AnimatePresence>
        {uploadModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-dark/70 backdrop-blur-xs" onClick={() => setUploadModalOpen(false)} />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative w-full max-w-lg bg-[#EDE8DF] border border-[#C4BEB3] rounded-2xl p-6 shadow-2xl z-10 space-y-4 text-xs font-body max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center border-b border-[#D6CFC2] pb-3">
                <h3 className="font-heading font-bold text-primary text-base flex items-center gap-2">
                  <Send className="w-5 h-5 text-accent" />
                  {language === 'EN' ? 'Upload & Share Photo for Project' : 'Foto Uploaden & Koppelen aan Project'}
                </h3>
                <button onClick={() => setUploadModalOpen(false)} className="p-1 text-dark/40 hover:text-dark"><X className="w-5 h-5" /></button>
              </div>

              <form onSubmit={handleUploadPhotosSubmit} className="space-y-3">
                {/* SELECT TARGET PROJECT DROPDOWN */}
                <div className="p-3 bg-white rounded-xl border border-[#D6CFC2] space-y-2">
                  <label className="block font-bold text-primary uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                    <Briefcase className="w-4 h-4 text-accent" /> {language === 'EN' ? 'Select Target Project *' : 'Selecteer Target Project *'}
                  </label>
                  <select
                    value={uploadForm.projectId}
                    onChange={e => {
                      const selectedId = e.target.value;
                      const proj = projectsList.find(p => p.id === selectedId) || projectsList[0];
                      setUploadForm(prev => ({ 
                        ...prev, 
                        projectId: proj ? proj.id : selectedId,
                        projectName: proj ? proj.name : 'Luxury Teak Outdoor Kitchen',
                        customer: proj ? proj.customer : 'John Miller'
                      }));
                    }}
                    className="w-full px-3 py-2 bg-[#F8F7F4] border border-[#D6CFC2] rounded-lg text-xs font-bold text-primary truncate"
                  >
                    {projectsList.map((p) => (
                      <option key={p.id} value={p.id}>[{p.id}] {p.name} — Client: {p.customer}</option>
                    ))}
                  </select>
                  <div className="flex items-center gap-1 text-[10px] text-emerald-800 font-medium">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                    <span>Photos will be linked to project <strong>[{uploadForm.projectId}] {uploadForm.projectName}</strong> and visible in <strong>{uploadForm.customer}</strong>'s Customer Portal!</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-dark/60 mb-1 uppercase tracking-wider">{language === 'EN' ? 'Photo Title' : 'Foto Titel'}</label>
                    <input
                      type="text"
                      value={uploadForm.title}
                      onChange={e => setUploadForm(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-3 py-2 bg-white border border-[#D6CFC2] rounded-lg text-xs font-bold text-dark"
                      placeholder="e.g. Teakhouten Frame Constructie"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-dark/60 mb-1 uppercase tracking-wider">{language === 'EN' ? 'Phase Date / Status' : 'Fasedatum / Status'}</label>
                    <input
                      type="text"
                      value={uploadForm.phase}
                      onChange={e => setUploadForm(prev => ({ ...prev, phase: e.target.value }))}
                      className="w-full px-3 py-2 bg-white border border-[#D6CFC2] rounded-lg text-xs"
                      placeholder="e.g. 18 Oct 2026"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-dark/60 mb-1 uppercase tracking-wider">{language === 'EN' ? 'Description & Notes for Customer' : 'Toelichting voor Klant'}</label>
                  <textarea
                    rows={2}
                    value={uploadForm.description}
                    onChange={e => setUploadForm(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 bg-white border border-[#D6CFC2] rounded-lg text-xs resize-none"
                    placeholder={language === 'EN' ? 'e.g. Frame cut to size and concrete countertop polished in workshop...' : 'b.v. Frame gemonteerd en betonblad gepolijst...'}
                  />
                </div>

                {/* Multiple Files Upload Dropzone */}
                <div className="space-y-2">
                  <label className="block font-bold text-dark/60 uppercase tracking-wider">{language === 'EN' ? 'Select Photo Files (Multiple Allowed) *' : 'Selecteer Foto Bestanden *'}</label>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-[#D6CFC2] p-5 rounded-xl text-center bg-white hover:bg-[#F8F7F4] transition-colors cursor-pointer space-y-2"
                  >
                    <ImageIcon className="w-8 h-8 text-primary mx-auto" />
                    <p className="text-xs font-bold text-primary">
                      {language === 'EN' ? 'Click to browse image files from computer' : 'Klik om foto\'s te selecteren van uw computer'}
                    </p>
                    <p className="text-[10px] text-dark/50">PNG, JPG, WEBP (Multiple files supported)</p>
                    <input
                      type="file"
                      ref={fileInputRef}
                      multiple
                      accept="image/*"
                      onChange={handleMultipleFilesSelected}
                      className="hidden"
                    />
                  </div>

                  {/* Selected Thumbnails Grid */}
                  {selectedFiles.length > 0 && (
                    <div className="space-y-1.5 pt-2">
                      <p className="text-[10px] font-bold text-primary uppercase">
                        ✓ {selectedFiles.length} {language === 'EN' ? 'Photos Ready for Upload:' : 'Foto\'s Klaar voor Upload:'}
                      </p>
                      <div className="grid grid-cols-4 gap-2 max-h-36 overflow-y-auto p-1 bg-white rounded-xl border border-[#D6CFC2]">
                        {selectedFiles.map((file, idx) => (
                          <div key={idx} className="relative group rounded-lg overflow-hidden border border-[#D6CFC2] aspect-square">
                            <img src={file.src} alt={file.name} className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => handleRemoveSelectedFile(idx)}
                              className="absolute top-1 right-1 p-0.5 bg-red-600 text-white rounded-full opacity-80 hover:opacity-100 transition-opacity"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
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

                <div className="flex justify-end gap-2 pt-3 border-t border-[#D6CFC2]">
                  <Button type="button" variant="outline" onClick={() => setUploadModalOpen(false)}>{t('common.cancel')}</Button>
                  <Button type="submit" disabled={selectedFiles.length === 0}>
                    🚀 {language === 'EN' ? `Share ${selectedFiles.length} Photos for Project ${uploadForm.projectId}` : `${selectedFiles.length} Foto's Delen voor Project ${uploadForm.projectId}`}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* EDIT & REPLACE PHOTO DETAILS MODAL */}
      <AnimatePresence>
        {editModalOpen && editingPhoto && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-dark/70 backdrop-blur-xs" onClick={() => setEditModalOpen(false)} />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative w-full max-w-md bg-[#EDE8DF] border border-[#C4BEB3] rounded-2xl p-6 shadow-2xl z-10 space-y-4 text-xs font-body">
              <div className="flex justify-between items-center border-b border-[#D6CFC2] pb-3">
                <h3 className="font-heading font-bold text-primary text-base flex items-center gap-2">
                  <Edit2 className="w-5 h-5 text-accent" />
                  {language === 'EN' ? 'Edit or Replace Photo' : 'Foto Bewerken of Vervangen'}
                </h3>
                <button onClick={() => setEditModalOpen(false)} className="p-1 text-dark/40 hover:text-dark"><X className="w-5 h-5" /></button>
              </div>

              {/* Current Image & Replace Option */}
              <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-[#D6CFC2]">
                <img src={editingPhoto.img} alt="Current" className="w-16 h-16 object-cover rounded-lg border border-[#D6CFC2]" />
                <div className="space-y-1">
                  <p className="font-bold text-dark text-xs">{editingPhoto.title}</p>
                  <button
                    type="button"
                    onClick={() => replaceFileInputRef.current?.click()}
                    className="px-2.5 py-1 bg-primary text-white rounded-lg text-[10px] font-bold flex items-center gap-1 hover:bg-primary/90 transition-colors"
                  >
                    <RefreshCw className="w-3 h-3" />
                    {language === 'EN' ? 'Replace Image File' : 'Vervang Afbeelding'}
                  </button>
                  <input
                    type="file"
                    ref={replaceFileInputRef}
                    accept="image/*"
                    onChange={handleReplacePhotoFile}
                    className="hidden"
                  />
                </div>
              </div>

              <form onSubmit={handleSaveEditSubmit} className="space-y-3">
                <div>
                  <label className="block font-bold text-dark/60 mb-1 uppercase tracking-wider">{language === 'EN' ? 'Assigned Customer' : 'Toegewezen Klant'}</label>
                  <select
                    value={editForm.customer}
                    onChange={e => setEditForm(prev => ({ ...prev, customer: e.target.value }))}
                    className="w-full px-3 py-2 bg-white border border-[#D6CFC2] rounded-lg text-xs font-bold text-primary"
                  >
                    {customersList.map((c, idx) => (
                      <option key={idx} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-dark/60 mb-1 uppercase tracking-wider">{language === 'EN' ? 'Photo Title' : 'Foto Titel'}</label>
                  <input
                    type="text"
                    required
                    value={editForm.title}
                    onChange={e => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 bg-white border border-[#D6CFC2] rounded-lg text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-dark/60 mb-1 uppercase tracking-wider">{language === 'EN' ? 'Phase Date / Status' : 'Fasedatum'}</label>
                  <input
                    type="text"
                    value={editForm.phase}
                    onChange={e => setEditForm(prev => ({ ...prev, phase: e.target.value }))}
                    className="w-full px-3 py-2 bg-white border border-[#D6CFC2] rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-dark/60 mb-1 uppercase tracking-wider">{language === 'EN' ? 'Description' : 'Omschrijving'}</label>
                  <textarea
                    rows={3}
                    value={editForm.description}
                    onChange={e => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 bg-white border border-[#D6CFC2] rounded-lg text-xs resize-none"
                  />
                </div>

                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-900">
                    {language === 'EN' ? 'Shared in Customer Portal' : 'Gedeeld in Klantenportaal'}
                  </span>
                  <input
                    type="checkbox"
                    checked={editForm.isShared}
                    onChange={e => setEditForm(prev => ({ ...prev, isShared: e.target.checked }))}
                    className="w-4 h-4 accent-emerald-600 cursor-pointer"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-[#D6CFC2]">
                  <Button type="button" variant="outline" onClick={() => setEditModalOpen(false)}>{t('common.cancel')}</Button>
                  <Button type="submit">{language === 'EN' ? 'Save Changes' : 'Wijzigingen Opslaan'}</Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* FULLSCREEN PREVIEW MODAL */}
      <AnimatePresence>
        {previewPhoto && (
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-dark/85 backdrop-blur-md z-[99999]" onClick={() => setPreviewPhoto(null)} />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative max-w-3xl w-full bg-[#EDE8DF] border border-[#C4BEB3] rounded-2xl p-5 shadow-2xl z-[100000] font-body space-y-4 my-auto">
              <div className="flex justify-between items-start border-b border-[#D6CFC2] pb-3">
                <div>
                  <span className="text-[10px] font-mono font-bold text-accent">{previewPhoto.phase} • Client: {previewPhoto.customer}</span>
                  <h3 className="text-lg sm:text-xl font-heading font-bold text-primary leading-tight mt-0.5">{previewPhoto.title}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="primary">{previewPhoto.projectId}</Badge>
                  <button onClick={() => setPreviewPhoto(null)} className="p-1.5 text-dark/50 hover:text-dark hover:bg-dark/10 rounded-full transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Ultra-Crisp Centered Image Frame */}
              <div className="rounded-xl overflow-hidden max-h-[52vh] sm:max-h-[58vh] bg-black/90 border border-[#D6CFC2] flex items-center justify-center p-2 shadow-inner">
                <img src={previewPhoto.img} alt={previewPhoto.title} className="max-h-[50vh] sm:max-h-[55vh] w-auto max-w-full object-contain mx-auto rounded-lg" />
              </div>

              <div className="p-3 bg-white rounded-xl border border-[#D6CFC2]/70 text-xs text-dark/80 space-y-1">
                <p className="font-semibold">{previewPhoto.description}</p>
              </div>

              <div className="pt-2 border-t border-[#D6CFC2] flex justify-between items-center text-xs text-dark/60 font-mono">
                <span>{language === 'EN' ? 'Craftsman / Uploader:' : 'Vakman / Uploader:'} <strong className="text-primary">{previewPhoto.craftsman}</strong></span>
                <Button variant="primary" size="sm" onClick={() => setPreviewPhoto(null)}>{language === 'EN' ? 'Close Preview' : 'Sluiten'}</Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
