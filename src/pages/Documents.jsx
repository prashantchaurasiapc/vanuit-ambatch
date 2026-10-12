import React, { useState, useRef, useEffect } from 'react';
import { useSearchParams, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Image as ImageIcon, FileArchive, File,
  Upload, Search, Download, Trash2, Plus, Filter, CheckCircle, X, Eye, Loader2,
  Camera, Briefcase, Share2, Lock, Check, Send, Edit2, RefreshCw, Layers,
  ExternalLink, Calendar, User, Sparkles, Folder
} from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import Badge from '../components/Badge';
import { useLanguage } from '../context/LanguageContext';
import { compressImage } from '../utils/storageHelper';
import api, { BASE_URL } from '../api/apiClient';
import projectImg from '../assets/outdoor_project_card.png';
import heroImg from '/dasbordes images.png';

export default function Documents({ role = 'admin' }) {
  const { t, language } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Active Tab state: 'all' | 'documents' | 'photos'
  const tabFromUrl = searchParams.get('tab');
  const initialTab = tabFromUrl || (location?.state?.projectId ? 'photos' : 'all');
  const [activeTab, setActiveTab] = useState(initialTab);

  const switchTab = (tab) => {
    setActiveTab(tab);
    setSearchParams(tab === 'all' ? {} : { tab });
  };

  useEffect(() => {
    if (tabFromUrl && ['all', 'documents', 'photos'].includes(tabFromUrl)) {
      setActiveTab(tabFromUrl);
    }
  }, [tabFromUrl]);

  // Toast notification
  const [notification, setNotification] = useState('');
  const showToast = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 3500);
  };

  // Shared Search & Filters
  const [search, setSearch] = useState('');

  // -------------------------------------------------------------
  // DOCUMENTS STATE & HANDLERS
  // -------------------------------------------------------------
  const [documents, setDocuments] = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(true);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [dragActive, setDragActive] = useState(false);
  const docFileInputRef = useRef(null);

  const loadDocuments = async () => {
    try {
      setLoadingDocs(true);
      const res = await api.get('/documents');
      if (res.success && Array.isArray(res.data)) {
        setDocuments(res.data);
      }
    } catch (err) {
      console.error('Failed to load documents:', err);
    } finally {
      setLoadingDocs(false);
    }
  };

  const formatBytes = (bytes, decimals = 1) => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const num = typeof bytes === 'string' ? parseInt(bytes, 10) : bytes;
    if (isNaN(num) || num <= 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(num) / Math.log(k));
    return parseFloat((num / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileName, mimeType) => {
    const ext = (fileName || '').split('.').pop().toLowerCase();
    if (ext === 'pdf' || mimeType?.includes('pdf')) {
      return <FileText className="w-7 h-7 text-red-500" />;
    }
    if (['png', 'jpg', 'jpeg', 'svg', 'webp'].includes(ext) || mimeType?.startsWith('image/')) {
      return <ImageIcon className="w-7 h-7 text-blue-500" />;
    }
    if (['xlsx', 'xls', 'csv'].includes(ext) || mimeType?.includes('spreadsheet') || mimeType?.includes('excel')) {
      return <FileText className="w-7 h-7 text-green-600" />;
    }
    if (['docx', 'doc'].includes(ext) || mimeType?.includes('word')) {
      return <FileText className="w-7 h-7 text-blue-600" />;
    }
    if (['zip', 'rar', 'tar', 'gz'].includes(ext)) {
      return <FileArchive className="w-7 h-7 text-amber-500" />;
    }
    return <File className="w-7 h-7 text-dark/40" />;
  };

  const handleDocUpload = async (files) => {
    if (!files || files.length === 0) return;
    setUploadingDoc(true);

    try {
      let successCount = 0;
      for (const file of Array.from(files)) {
        const base64Data = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const result = reader.result;
            const base64 = typeof result === 'string' && result.includes(',')
              ? result.split(',')[1]
              : result;
            resolve(base64);
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        const ext = file.name.split('.').pop().toLowerCase();
        let docType = 'cad_blueprint';
        let category = 'Designs';

        if (['pdf'].includes(ext)) {
          docType = 'cad_blueprint';
          category = 'Blueprints';
        } else if (['xlsx', 'xls', 'csv'].includes(ext)) {
          docType = 'bank_statement';
          category = 'Finance';
        } else if (['docx', 'doc'].includes(ext)) {
          docType = 'werkorder_pdf';
          category = 'Contracts';
        }

        const payload = {
          fileName: file.name,
          fileData: base64Data,
          mimeType: file.type || 'application/pdf',
          documentType: docType,
          category: category,
          description: `Document geüpload via portaal (${file.name})`,
          isPublicForCustomer: true,
          isPublicForPartner: true
        };

        const res = await api.post('/documents', payload);
        if (res.success) {
          successCount++;
        } else {
          showToast(res.error?.message || 'Upload mislukt');
        }
      }

      if (successCount > 0) {
        await loadDocuments();
        showToast(
          successCount === 1
            ? (language === 'NL' ? 'Document succesvol geüpload' : 'Document successfully uploaded')
            : `${successCount} ${language === 'NL' ? 'documenten geüpload' : 'documents uploaded'}`
        );
      }
    } catch (err) {
      console.error('Upload error:', err);
      showToast(language === 'NL' ? 'Fout tijdens uploaden' : 'Error during upload');
    } finally {
      setUploadingDoc(false);
      if (docFileInputRef.current) docFileInputRef.current.value = '';
    }
  };

  const handleDocDownload = (doc) => {
    const downloadUrl = `${BASE_URL}/documents/${doc.id}/download`;
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.setAttribute('download', doc.fileName || 'document.pdf');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`${language === 'NL' ? 'Download gestart' : 'Download started'}: ${doc.fileName}`);
  };

  const handleDeleteDoc = async (id, name) => {
    if (!window.confirm(`Weet u zeker dat u "${name}" wilt verwijderen?`)) return;
    try {
      const res = await api.delete(`/documents/${id}`);
      if (res.success) {
        setDocuments((prev) => prev.filter((d) => d.id !== id));
        showToast(`${language === 'NL' ? 'Verwijderd' : 'Deleted'} ${name}`);
      } else {
        showToast(res.error?.message || 'Verwijderen mislukt');
      }
    } catch (err) {
      console.error('Delete document failed:', err);
      showToast('Verwijderen mislukt');
    }
  };

  const docCategories = [
    { key: 'All', label: language === 'NL' ? 'Alles' : 'All' },
    { key: 'Blueprints', label: language === 'NL' ? 'Bouwtekeningen' : 'Blueprints' },
    { key: 'Designs', label: language === 'NL' ? 'Ontwerpen' : 'Designs' },
    { key: 'Contracts', label: language === 'NL' ? 'Contracten' : 'Contracts' },
    { key: 'Finance', label: language === 'NL' ? 'Financieel' : 'Finance' },
    { key: 'Materials', label: language === 'NL' ? 'Materialen' : 'Materials' },
    { key: 'General', label: language === 'NL' ? 'Algemeen' : 'General' }
  ];

  // -------------------------------------------------------------
  // PHOTOS & MEDIA STATE & HANDLERS (From AdminPhotos)
  // -------------------------------------------------------------
  const [photosList, setPhotosList] = useState([]);
  const [projectsList, setProjectsList] = useState([]);
  const [customersList, setCustomersList] = useState([]);
  const [loadingPhotos, setLoadingPhotos] = useState(true);
  const [selectedProjectId, setSelectedProjectId] = useState(location?.state?.projectId || 'All');

  const photoFileInputRef = useRef(null);
  const replaceFileInputRef = useRef(null);

  // Fullscreen Preview Modal
  const [previewPhoto, setPreviewPhoto] = useState(null);

  // Upload Photo Modal State
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

  const resolvePhotoUrl = (photo) => {
    if (!photo) return projectImg;
    // 1. Cached in localStorage (instant, offline-first, avoids any server propagation delay)
    if (photo.id && typeof window !== 'undefined') {
      const cached = localStorage.getItem(`va_photo_${photo.id}`);
      if (cached && (cached.startsWith('data:image') || cached.startsWith('http'))) {
        return cached;
      }
    }
    // 2. Direct data URI or absolute HTTP/HTTPS URL
    const raw = photo.img || photo.photoUrl || photo.url;
    if (raw && (raw.startsWith('data:image') || raw.startsWith('http://') || raw.startsWith('https://'))) {
      return raw;
    }
    // 3. Backend streaming endpoint if photo ID exists
    if (photo.id) {
      return `${BASE_URL}/photos/${photo.id}/file`;
    }
    return projectImg;
  };

  const getProjectDisplayName = (photo) => {
    if (!photo) return 'Project';
    const proj = projectsList.find((p) => p.id === photo.projectId);
    return proj?.name || photo.projectName || (photo.projectId ? `Project #${photo.projectId.slice(0, 8)}` : 'Project');
  };

  const getCustomerDisplayName = (photo) => {
    if (!photo) return '';
    const proj = projectsList.find((p) => p.id === photo.projectId);
    return proj?.customerName || proj?.customer || photo.customer || '';
  };

  const loadPhotosAndProjects = async () => {
    try {
      setLoadingPhotos(true);
      // Load photos
      const photosRes = await api.get('/photos?limit=100');
      let backendPhotos = [];
      if (photosRes.success && Array.isArray(photosRes.data)) {
        backendPhotos = photosRes.data.map((p) => {
          const resolved = resolvePhotoUrl(p);
          return {
            ...p,
            img: resolved,
            photoUrl: resolved
          };
        });
      }

      // Also merge partner custom uploaded photos from local storage
      let customPhotos = [];
      try {
        const rawCustom = JSON.parse(localStorage.getItem('va_custom_photos') || '[]');
        if (Array.isArray(rawCustom)) {
          customPhotos = rawCustom.map((p) => ({
            ...p,
            img: resolvePhotoUrl(p),
            photoUrl: resolvePhotoUrl(p)
          }));
        }
      } catch (e) {}

      const merged = [
        ...customPhotos.filter((cp) => !backendPhotos.some((bp) => bp.id === cp.id)),
        ...backendPhotos
      ];
      setPhotosList(merged);

      // Load projects for selector
      const projRes = await api.get('/projects?limit=100');
      const pArr = projRes.success ? (Array.isArray(projRes.data) ? projRes.data : (projRes.data?.items || [])) : [];
      if (pArr.length > 0) {
        setProjectsList(pArr);
        const uniqueCust = Array.from(new Set(pArr.map((p) => p.customerName || p.customer).filter(Boolean)));
        setCustomersList(uniqueCust);
      }
    } catch (err) {
      console.error('Failed to load photos/projects:', err);
    } finally {
      setLoadingPhotos(false);
    }
  };

  // Initial Data Load
  useEffect(() => {
    loadDocuments();
    if (role === 'admin') {
      loadPhotosAndProjects();
      window.addEventListener('app_data_changed', loadPhotosAndProjects);
      return () => window.removeEventListener('app_data_changed', loadPhotosAndProjects);
    }
  }, [role]);

  // Handle Multiple Photo Selection with Canvas Compression
  const handleMultipleFilesSelected = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    for (const file of files) {
      try {
        const compressedSrc = await compressImage(file, 1200, 0.82);
        setSelectedFiles((prev) => [...prev, {
          name: file.name,
          src: compressedSrc
        }]);
      } catch (err) {
        console.warn('Image processing failed:', err);
      }
    }
  };

  const handleRemoveSelectedFile = (idx) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  // Open Upload Modal for Specific Project
  const handleOpenUploadForProject = (targetProjId) => {
    const targetProj = projectsList.find((p) => p.id === targetProjId) || projectsList[0];
    setUploadForm({
      projectId: targetProj ? targetProj.id : (projectsList[0]?.id || 'PRJ-101'),
      projectName: targetProj ? targetProj.name : (projectsList[0]?.name || 'Luxury Teak Outdoor Kitchen'),
      customer: targetProj ? (targetProj.customerName || targetProj.customer) : (projectsList[0]?.customerName || 'John Miller'),
      title: '',
      phase: `${new Date().toLocaleDateString('default', { day: 'numeric', month: 'short', year: 'numeric' })}`,
      description: '',
      craftsman: 'Tim & Bram (Admin)',
      isShared: true
    });
    setActiveTab('photos');
    setUploadModalOpen(true);
  };

  // Toggle Share Photo with Customer Handler
  const handleToggleShareWithCustomer = async (photoId) => {
    const photo = photosList.find((p) => p.id === photoId);
    const nextState = !(photo?.isShared ?? photo?.visibleToCustomer);
    const res = await api.patch(`/photos/${photoId}/visibility`, { visibleToCustomer: nextState });
    if (res.success) {
      setPhotosList((prev) => prev.map((p) => (p.id === photoId ? { ...p, isShared: nextState, visibleToCustomer: nextState } : p)));
      showToast(
        nextState
          ? (language === 'NL' ? 'Foto gedeeld! Zichtbaar in klantenportaal.' : 'Photo shared! Now visible in customer portal.')
          : (language === 'NL' ? 'Foto niet meer gedeeld. Verborgen voor klant.' : 'Photo unshared. Hidden from customer portal.')
      );
    } else {
      showToast(`⚠ ${res.error?.message || 'Fout bij wijzigen zichtbaarheid'}`);
    }
  };

  // Submit Multiple Photos Upload linked to Project
  const handleUploadPhotosSubmit = async (e) => {
    e.preventDefault();
    if (selectedFiles.length === 0) {
      return showToast(language === 'EN' ? 'Please select at least one photo file.' : 'Selecteer alstublieft minimaal één fotobestand.');
    }

    const targetProjObj = projectsList.find((p) => p.id === uploadForm.projectId) || projectsList[0];
    const finalProjId = targetProjObj ? targetProjObj.id : uploadForm.projectId;
    const finalProjName = targetProjObj ? targetProjObj.name : uploadForm.projectName;
    const finalCustName = targetProjObj ? (targetProjObj.customerName || targetProjObj.customer) : uploadForm.customer;

    let successCount = 0;
    const newlyCreated = [];

    for (const fileObj of selectedFiles) {
      const payload = {
        photoUrl: fileObj.src,
        title: uploadForm.title.trim() || fileObj.name.replace(/\.[^/.]+$/, ''),
        phase: uploadForm.phase || new Date().toLocaleDateString('default', { day: 'numeric', month: 'short', year: 'numeric' }),
        caption: uploadForm.description.trim() || (language === 'EN' ? 'Project update photo shared by Admin.' : 'Projectfoto update gedeeld door beheerder.'),
        craftsman: uploadForm.craftsman || 'Tim & Bram (Admin)',
        tag: 'admin',
        visibleToCustomer: uploadForm.isShared
      };

      const res = await api.post(`/projects/${finalProjId}/photos`, payload);
      if (res.success && res.data) {
        successCount++;
        const createdPhoto = res.data;
        if (createdPhoto.id) {
          try {
            localStorage.setItem(`va_photo_${createdPhoto.id}`, fileObj.src);
          } catch (err) {}
        }
        newlyCreated.push({
          ...createdPhoto,
          img: fileObj.src,
          photoUrl: fileObj.src,
          projectId: finalProjId,
          projectName: finalProjName,
          customer: finalCustName,
          uploaderRole: 'admin',
          tag: 'admin',
          craftsman: uploadForm.craftsman || 'Tim & Bram (Admin)',
          isShared: uploadForm.isShared,
          visibleToCustomer: uploadForm.isShared
        });
      }
    }

    if (successCount > 0) {
      showToast(
        language === 'EN'
          ? `Successfully uploaded ${successCount} photo(s) to ${finalProjName}!`
          : `Succesvol ${successCount} foto('s) geüpload naar ${finalProjName}!`
      );
      // Immediately place new photos on screen so user sees them instantly
      setPhotosList((prev) => [
        ...newlyCreated,
        ...prev.filter((p) => !newlyCreated.some((n) => n.id === p.id))
      ]);
      setActiveTab('photos');
      // Background sync
      loadPhotosAndProjects();
    } else {
      showToast(language === 'NL' ? 'Upload mislukt. Probeer opnieuw.' : 'Failed to upload photos. Please try again.');
    }

    setSelectedFiles([]);
    setUploadModalOpen(false);
  };

  // Delete Photo Handler
  const handleDeletePhoto = async (photoId) => {
    if (!window.confirm(language === 'NL' ? 'Weet u zeker dat u deze foto wilt verwijderen?' : 'Are you sure you want to delete this photo?')) return;
    const res = await api.delete(`/photos/${photoId}`);
    if (res.success) {
      try {
        localStorage.removeItem(`va_photo_${photoId}`);
      } catch (err) {}
      setPhotosList((prev) => prev.filter((p) => p.id !== photoId));
      showToast(language === 'EN' ? 'Photo deleted successfully.' : 'Foto succesvol verwijderd.');
    } else {
      showToast(`⚠ ${res.error?.message || 'Verwijderen mislukt'}`);
    }
  };

  // Open Edit Modal
  const handleOpenEditModal = (photo) => {
    setEditingPhoto(photo);
    setEditForm({
      title: photo.title || '',
      phase: photo.phase || '',
      description: photo.description || photo.caption || '',
      customer: photo.customer || '',
      craftsman: photo.craftsman || 'Tim & Bram (Admin)',
      isShared: (photo.isShared !== false && photo.visibleToCustomer !== false)
    });
    setEditModalOpen(true);
  };

  // Save Photo Edit
  const handleSaveEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingPhoto) return;

    const res = await api.patch(`/photos/${editingPhoto.id}`, {
      title: editForm.title.trim(),
      phase: editForm.phase.trim(),
      caption: editForm.description.trim(),
      craftsman: editForm.craftsman.trim(),
      visibleToCustomer: editForm.isShared
    });

    if (res.success) {
      setPhotosList((prev) => prev.map((p) => (p.id === editingPhoto.id ? { ...p, ...res.data, img: p.img } : p)));
      showToast(language === 'EN' ? 'Photo details updated successfully!' : 'Fotogegevens succesvol bijgewerkt!');
    } else {
      showToast(`⚠ ${res.error?.message || 'Bijwerken mislukt'}`);
    }
    setEditModalOpen(false);
    setEditingPhoto(null);
  };

  // Replace Photo File
  const handleReplacePhotoFile = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file || !editingPhoto) return;

    try {
      const newImgSrc = await compressImage(file, 1200, 0.82);
      if (editingPhoto.id) {
        try {
          localStorage.setItem(`va_photo_${editingPhoto.id}`, newImgSrc);
        } catch (err) {}
      }
      setPhotosList((prev) =>
        prev.map((p) => (p.id === editingPhoto.id ? { ...p, img: newImgSrc, photoUrl: newImgSrc } : p))
      );
      setEditingPhoto((prev) => ({ ...prev, img: newImgSrc, photoUrl: newImgSrc }));
      if (editingPhoto?.id) {
        await api.patch(`/photos/${editingPhoto.id}`, { photoUrl: newImgSrc });
      }
      showToast(language === 'EN' ? 'Photo image file replaced successfully!' : 'Fotobestand succesvol vervangen!');
    } catch (err) {
      console.warn('Replace file error:', err);
      showToast('Fout bij vervangen afbeelding');
    }
  };

  // -------------------------------------------------------------
  // FILTERING LOGIC
  // -------------------------------------------------------------
  const filteredDocs = documents.filter((doc) => {
    const fileName = doc.fileName || '';
    const desc = doc.description || '';
    const docNum = doc.documentNumber || '';
    const matchesSearch =
      fileName.toLowerCase().includes(search.toLowerCase()) ||
      desc.toLowerCase().includes(search.toLowerCase()) ||
      docNum.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || doc.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const filteredPhotos = photosList.filter((photo) => {
    const matchesSearch =
      (photo.title || '').toLowerCase().includes(search.toLowerCase()) ||
      (photo.projectName || '').toLowerCase().includes(search.toLowerCase()) ||
      (photo.customer || '').toLowerCase().includes(search.toLowerCase()) ||
      (photo.projectId || '').toLowerCase().includes(search.toLowerCase()) ||
      (photo.description || photo.caption || '').toLowerCase().includes(search.toLowerCase()) ||
      (photo.craftsman || '').toLowerCase().includes(search.toLowerCase());
    const matchesProject = selectedProjectId === 'All' || photo.projectId === selectedProjectId;
    return matchesSearch && matchesProject;
  });

  const totalAssetCount = documents.length + photosList.length;

  return (
    <div className="space-y-6 font-body text-[#4A4A43] relative max-w-full">
      {/* Toast Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, x: 80 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 80 }}
            className="fixed top-20 right-4 z-[9999] flex items-center gap-2 bg-[#3E4E36] text-white px-4 py-3 rounded-xl shadow-2xl border border-[#2D3528] text-xs font-body"
          >
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            {notification}
          </motion.div>
        )}
      </AnimatePresence>

      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-heading font-bold text-primary flex items-center gap-2">
            <Folder className="w-6 h-6 text-primary" />
            {language === 'NL' ? 'Documenten & Media Hub' : 'Documents & Media Hub'}
            <span className="text-[10px] bg-primary/10 text-primary border border-primary/20 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
              {totalAssetCount} {language === 'NL' ? 'Bestanden' : 'Assets'}
            </span>
          </h2>
          <p className="text-dark/60 text-sm font-body mt-0.5">
            {language === 'NL'
              ? 'Beheer alle projectdocumenten, CAD-bouwtekeningen en werkplaatsfoto’s op één centrale plek.'
              : 'Manage all project blueprints, CAD files, contracts, and workshop build photos in one unified place.'}
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          {role === 'admin' && (
            <Button
              variant="outline"
              icon={Camera}
              onClick={() => {
                const targetProj = selectedProjectId !== 'All' ? selectedProjectId : (projectsList[0]?.id || 'PRJ-101');
                handleOpenUploadForProject(targetProj);
              }}
              className="text-xs py-2 px-3.5"
            >
              {language === 'NL' ? '+ Foto Uploaden' : '+ Upload Photo'}
            </Button>
          )}

          <Button
            icon={Plus}
            onClick={() => docFileInputRef.current?.click()}
            disabled={uploadingDoc}
            className="text-xs py-2 px-3.5 shadow-sm"
          >
            {uploadingDoc ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> {language === 'NL' ? 'Uploaden...' : 'Uploading...'}
              </span>
            ) : (
              language === 'NL' ? '+ Document Uploaden' : '+ Upload Document'
            )}
          </Button>
        </div>
      </div>

      {/* Hidden File Input for Documents */}
      <input
        type="file"
        ref={docFileInputRef}
        onChange={(e) => handleDocUpload(e.target.files)}
        className="hidden"
        multiple
      />

      {/* TABS NAVIGATION BAR */}
      <div className="flex items-center gap-2 border-b border-[#D6CFC2]/70 pb-2 overflow-x-auto no-scrollbar">
        <button
          onClick={() => switchTab('all')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'all'
              ? 'bg-primary text-white shadow-sm'
              : 'bg-white/80 text-dark/70 hover:bg-white border border-[#D6CFC2]/60'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>{language === 'NL' ? 'Alle Bestanden' : 'All Files'}</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${activeTab === 'all' ? 'bg-white/20 text-white' : 'bg-primary/10 text-primary'}`}>
            {totalAssetCount}
          </span>
        </button>

        <button
          onClick={() => switchTab('documents')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'documents'
              ? 'bg-primary text-white shadow-sm'
              : 'bg-white/80 text-dark/70 hover:bg-white border border-[#D6CFC2]/60'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>{language === 'NL' ? 'Documenten & Tekeningen' : 'Documents & Blueprints'}</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${activeTab === 'documents' ? 'bg-white/20 text-white' : 'bg-primary/10 text-primary'}`}>
            {documents.length}
          </span>
        </button>

        {role === 'admin' && (
          <button
            onClick={() => switchTab('photos')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'photos'
                ? 'bg-primary text-white shadow-sm'
                : 'bg-white/80 text-dark/70 hover:bg-white border border-[#D6CFC2]/60'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>{language === 'NL' ? "Foto's & Voortgangsmedia" : 'Photos & Build Updates'}</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${activeTab === 'photos' ? 'bg-white/20 text-white' : 'bg-primary/10 text-primary'}`}>
              {photosList.length}
            </span>
          </button>
        )}
      </div>

      {/* UNIFIED SEARCH & CONTEXT FILTER BAR */}
      <Card noPadding className="p-3.5 border-l-4 border-l-primary">
        <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-dark/40" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={
                activeTab === 'photos'
                  ? (language === 'NL' ? 'Zoek op project ID, titel of vakman...' : 'Search project ID, title or craftsman...')
                  : (language === 'NL' ? 'Zoek documenten of foto’s op naam, code of klant...' : 'Search documents or photos by name, code or customer...')
              }
              className="w-full pl-9 pr-4 py-2 bg-white border border-[#D6CFC2] rounded-xl text-xs font-body focus:outline-none focus:ring-2 focus:ring-primary/20 text-dark"
            />
          </div>

          {/* Project Selector (Visible on 'photos' or 'all' tabs when projects are available) */}
          {role === 'admin' && (activeTab === 'photos' || activeTab === 'all') && (
            <div className="flex items-center gap-2 bg-[#EDE8DF] border border-[#C4BEB3] px-3 py-1.5 rounded-xl max-w-xs">
              <Briefcase className="w-4 h-4 text-primary flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <span className="block text-[8px] font-bold text-dark/50 uppercase tracking-wider">
                  {language === 'NL' ? 'Filter op Project' : 'Filter by Project'}
                </span>
                <select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="w-full bg-transparent text-xs font-bold text-primary cursor-pointer outline-none border-none p-0 focus:ring-0 truncate"
                >
                  <option value="All">{language === 'NL' ? `Alle Projecten (${projectsList.length})` : `All Projects (${projectsList.length})`}</option>
                  {projectsList.map((p) => (
                    <option key={p.id} value={p.id}>[{p.id}] {p.name}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Document Categories (Visible on 'documents' or 'all' tabs) */}
          {(activeTab === 'documents' || activeTab === 'all') && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
              <Filter className="w-3.5 h-3.5 text-dark/40 ml-1 mr-0.5 flex-shrink-0" />
              {docCategories.map((cat) => (
                <button
                  key={cat.key}
                  onClick={() => setSelectedCategory(cat.key)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all ${
                    selectedCategory === cat.key
                      ? 'bg-primary text-white shadow-xs'
                      : 'bg-white text-dark/70 hover:bg-[#F8F7F4] border border-[#D6CFC2]/60'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Active Project Banner for Photos */}
        {role === 'admin' && activeTab === 'photos' && selectedProjectId !== 'All' && (
          <div className="mt-3 pt-3 border-t border-[#D6CFC2]/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 bg-primary/5 p-2.5 rounded-xl">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse flex-shrink-0"></span>
              <span className="text-xs font-bold text-primary truncate">
                {language === 'EN' ? 'Managing Photos for Project: ' : "Foto's beheren voor Project: "}
                <u className="text-accent">
                  [{selectedProjectId}] {projectsList.find((p) => p.id === selectedProjectId)?.name || selectedProjectId}
                </u>
              </span>
              <span className="text-[10px] font-mono text-dark/60 bg-white px-2 py-0.5 rounded border border-[#D6CFC2] flex-shrink-0">
                {filteredPhotos.length} {language === 'EN' ? 'Photos Linked' : "Foto's Gekoppeld"}
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

      {/* -------------------------------------------------------------
          TAB 1: ALL FILES UNIFIED OVERVIEW (ALLES)
          ------------------------------------------------------------- */}
      {activeTab === 'all' && (
        <div className="space-y-6">
          {/* Quick Summary Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Card noPadding className="p-3.5 flex items-center gap-3 bg-white border border-[#D6CFC2]/70">
              <div className="p-2.5 bg-blue-50 text-blue-700 rounded-xl">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-dark/50 uppercase tracking-wider">{language === 'NL' ? 'Projectdocumenten' : 'Vault Documents'}</p>
                <p className="text-xl font-heading font-bold text-primary">{documents.length}</p>
              </div>
            </Card>

            <Card noPadding className="p-3.5 flex items-center gap-3 bg-white border border-[#D6CFC2]/70">
              <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-xl">
                <Camera className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-dark/50 uppercase tracking-wider">{language === 'NL' ? 'Werkplaatsfoto’s' : 'Progress Photos'}</p>
                <p className="text-xl font-heading font-bold text-primary">{photosList.length}</p>
              </div>
            </Card>

            <Card noPadding className="p-3.5 flex items-center gap-3 bg-white border border-[#D6CFC2]/70">
              <div className="p-2.5 bg-amber-50 text-amber-700 rounded-xl">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-dark/50 uppercase tracking-wider">{language === 'NL' ? 'Actieve Projecten' : 'Linked Projects'}</p>
                <p className="text-xl font-heading font-bold text-primary">{projectsList.length}</p>
              </div>
            </Card>
          </div>

          {/* Section 1: Recent Progress Photos */}
          {role === 'admin' && photosList.length > 0 && (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="font-heading font-bold text-base text-primary flex items-center gap-2">
                  <Camera className="w-4 h-4 text-accent" />
                  {language === 'NL' ? 'Recente Werkplaatsfoto’s' : 'Recent Workshop Build Photos'}
                  <span className="text-[10px] font-mono text-dark/50 bg-[#EDE8DF] px-2 py-0.5 rounded">
                    {filteredPhotos.length}
                  </span>
                </h3>
                <button
                  onClick={() => switchTab('photos')}
                  className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                >
                  {language === 'NL' ? "Alle Foto's Bekijken →" : 'View All Photos →'}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {filteredPhotos.slice(0, 4).map((photo) => (
                  <Card key={photo.id} noPadding className="overflow-hidden hover:shadow-card-hover transition-all group flex flex-col justify-between border border-[#D6CFC2]/80">
                    <div className="relative h-36 bg-cream-dark/20 overflow-hidden cursor-pointer" onClick={() => setPreviewPhoto(photo)}>
                      <img
                        src={resolvePhotoUrl(photo)}
                        alt={photo.title}
                        onError={(e) => { if (e.currentTarget.src !== projectImg) e.currentTarget.src = projectImg; }}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/20 to-transparent"></div>
                      <div className="absolute top-2 left-2 bg-white/95 px-2 py-0.5 rounded text-[9px] font-bold text-primary truncate max-w-[80%]">
                        {getProjectDisplayName(photo)}{getCustomerDisplayName(photo) ? ` • ${getCustomerDisplayName(photo)}` : ''}
                      </div>
                      <div className="absolute top-2 right-2">
                        {photo.isShared !== false && photo.visibleToCustomer !== false ? (
                          <span className="inline-flex items-center gap-0.5 bg-emerald-700 text-white px-2 py-0.5 rounded text-[9px] font-bold shadow-xs">
                            <Check className="w-2.5 h-2.5" /> Client
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-0.5 bg-amber-600 text-white px-2 py-0.5 rounded text-[9px] font-bold shadow-xs">
                            <Lock className="w-2.5 h-2.5" /> Internal
                          </span>
                        )}
                      </div>
                      <div className="absolute bottom-2 left-2 right-2">
                        <p className="text-[9px] text-cyan-300 font-mono font-bold truncate">{photo.phase}</p>
                        <h4 className="font-heading font-bold text-white text-xs leading-tight truncate">{photo.title}</h4>
                      </div>
                    </div>
                    <div className="p-2.5 bg-[#F8F7F4] flex items-center justify-between text-xs border-t border-[#D6CFC2]/60">
                      <span className="text-[10px] text-dark/60 truncate font-mono">{photo.craftsman}</span>
                      <button
                        onClick={() => setPreviewPhoto(photo)}
                        className="p-1 text-primary hover:bg-white rounded transition-colors"
                        title="Preview"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Section 2: Recent Documents & Vault Files */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="font-heading font-bold text-base text-primary flex items-center gap-2">
                <FileText className="w-4 h-4 text-accent" />
                {language === 'NL' ? 'Projectdocumenten & Bouwtekeningen' : 'Documents & Blueprints'}
                <span className="text-[10px] font-mono text-dark/50 bg-[#EDE8DF] px-2 py-0.5 rounded">
                  {filteredDocs.length}
                </span>
              </h3>
              <button
                onClick={() => switchTab('documents')}
                className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
              >
                {language === 'NL' ? 'Alle Documenten Bekijken →' : 'View All Documents →'}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredDocs.slice(0, 6).map((doc) => (
                <Card key={doc.id} className="hover:border-primary/40 transition-all">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 bg-[#EDE8DF] rounded-xl flex-shrink-0">
                      {getFileIcon(doc.fileName, doc.mimeType)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-0.5">
                        <div className="flex items-center gap-1.5">
                          <Badge variant="primary" className="text-[9px]">
                            {doc.category || 'General'}
                          </Badge>
                          <span className="text-[10px] font-mono font-bold text-dark/60">
                            {doc.documentNumber}
                          </span>
                        </div>
                        <span className="text-[10px] text-dark/40 font-mono">
                          {doc.createdAt ? new Date(doc.createdAt).toISOString().split('T')[0] : '–'}
                        </span>
                      </div>

                      <h3 className="font-bold text-xs text-primary truncate font-heading">
                        {doc.fileName}
                      </h3>
                      <p className="text-[11px] text-dark/60 line-clamp-1 mt-0.5 font-body">
                        {doc.description || (language === 'NL' ? 'Geüpload document' : 'Uploaded document')}
                      </p>

                      <div className="flex items-center justify-between pt-2 mt-2 border-t border-[#D6CFC2]/40 text-xs">
                        <span className="text-[10px] text-dark/50 font-mono">
                          {formatBytes(doc.fileSizeBytes)}
                        </span>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setSelectedDoc(doc)}
                            className="p-1 text-dark/60 hover:text-primary hover:bg-[#EDE8DF] rounded-lg transition-colors"
                            title={language === 'NL' ? 'Bekijk Details' : 'View Details'}
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDocDownload(doc)}
                            className="p-1 text-dark/60 hover:text-primary hover:bg-[#EDE8DF] rounded-lg transition-colors"
                            title={language === 'NL' ? 'Download Bestand' : 'Download File'}
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteDoc(doc.id, doc.fileName)}
                            className="p-1 text-dark/40 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title={language === 'NL' ? 'Verwijder' : 'Delete'}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          TAB 2: DOCUMENTS & BLUEPRINTS ONLY
          ------------------------------------------------------------- */}
      {activeTab === 'documents' && (
        <div className="space-y-6">
          {/* Drag and Drop Zone */}
          <motion.div
            onDragEnter={(e) => { e.preventDefault(); e.stopPropagation(); setDragActive(true); }}
            onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setDragActive(true); }}
            onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setDragActive(false); }}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setDragActive(false);
              if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                handleDocUpload(e.dataTransfer.files);
              }
            }}
            onClick={() => docFileInputRef.current?.click()}
            whileHover={{ scale: 1.003 }}
            className={`rounded-2xl p-7 text-center cursor-pointer border-2 border-dashed transition-all duration-300 ${
              dragActive
                ? 'border-primary bg-primary/5'
                : 'border-[#D6CFC2] bg-[#EDE8DF] hover:border-primary'
            }`}
          >
            <Upload className={`w-9 h-9 mx-auto mb-2 transition-colors ${dragActive ? 'text-primary' : 'text-dark/25'}`} />
            <p className="text-xs sm:text-sm text-dark/70 font-semibold font-body">
              {language === 'NL' ? 'Sleep uw bestand hierheen, of klik om te bladeren' : 'Drag and drop file here, or click to browse'}
            </p>
            <p className="text-[11px] text-dark/40 mt-1 font-body">
              {language === 'NL' ? 'PDF, Word, Excel, ZIP of Afbeeldingen tot 10 MB' : 'PDF, Word, Excel, ZIP or Images up to 10MB'}
            </p>
          </motion.div>

          {/* Document Grid List */}
          {loadingDocs ? (
            <div className="text-center py-16 text-dark/50 text-sm flex flex-col items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary mb-3" />
              {language === 'NL' ? 'Documenten laden...' : 'Loading documents...'}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredDocs.length === 0 ? (
                <div className="col-span-full text-center py-12 text-dark/40 text-xs">
                  <File className="w-10 h-10 mx-auto mb-2 text-dark/20" />
                  {language === 'NL' ? 'Geen documenten gevonden.' : 'No documents found.'}
                </div>
              ) : (
                filteredDocs.map((doc) => (
                  <Card key={doc.id} className="hover:border-primary/40 transition-all">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-[#EDE8DF] rounded-xl flex-shrink-0">
                        {getFileIcon(doc.fileName, doc.mimeType)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <div className="flex items-center gap-1.5">
                            <Badge variant="primary" className="text-[9px]">
                              {doc.category || 'Algemeen'}
                            </Badge>
                            <span className="text-[10px] font-mono font-bold text-dark/60">
                              {doc.documentNumber}
                            </span>
                          </div>
                          <span className="text-[10px] text-dark/40 font-mono">
                            {doc.createdAt ? new Date(doc.createdAt).toISOString().split('T')[0] : '–'}
                          </span>
                        </div>

                        <h3 className="font-bold text-sm text-primary truncate font-heading">
                          {doc.fileName}
                        </h3>
                        <p className="text-xs text-dark/60 line-clamp-1 mt-0.5 font-body">
                          {doc.description || (language === 'NL' ? 'Geüpload document' : 'Uploaded document')}
                        </p>

                        <div className="flex items-center justify-between pt-3 mt-2 border-t border-[#D6CFC2]/40 text-xs">
                          <span className="text-[10px] text-dark/50 font-mono">
                            {formatBytes(doc.fileSizeBytes)} • {role === 'admin' ? 'Admin Vault' : 'Partner'}
                          </span>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setSelectedDoc(doc)}
                              className="p-1.5 text-dark/60 hover:text-primary hover:bg-[#EDE8DF] rounded-lg transition-colors"
                              title={language === 'NL' ? 'Bekijk Details' : 'View Details'}
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDocDownload(doc)}
                              className="p-1.5 text-dark/60 hover:text-primary hover:bg-[#EDE8DF] rounded-lg transition-colors"
                              title={language === 'NL' ? 'Download Bestand' : 'Download File'}
                            >
                              <Download className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteDoc(doc.id, doc.fileName)}
                              className="p-1.5 text-dark/40 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title={language === 'NL' ? 'Verwijder' : 'Delete'}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          )}
        </div>
      )}

      {/* -------------------------------------------------------------
          TAB 3: PHOTOS & PROGRESS MEDIA GALLERY (From AdminPhotos)
          ------------------------------------------------------------- */}
      {activeTab === 'photos' && (
        <div className="space-y-6">
          {loadingPhotos ? (
            <div className="text-center py-16 text-dark/50 text-sm flex flex-col items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary mb-3" />
              {language === 'NL' ? "Foto's laden..." : 'Loading photos...'}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
              {filteredPhotos.map((photo) => {
                const isShared = (photo.isShared !== false && photo.visibleToCustomer !== false);

                return (
                  <Card key={photo.id} noPadding className="overflow-hidden hover:shadow-card-hover transition-all group flex flex-col justify-between border-2 border-[#D6CFC2]/80">
                    <div>
                      {/* Photo Image & Badge Overlay */}
                      <div className="relative h-48 bg-cream-dark/20 overflow-hidden cursor-pointer" onClick={() => setPreviewPhoto(photo)}>
                        <img
                          src={resolvePhotoUrl(photo)}
                          alt={photo.title}
                          onError={(e) => { if (e.currentTarget.src !== projectImg) e.currentTarget.src = projectImg; }}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/20 to-transparent"></div>

                        {/* Project ID & Customer Badge */}
                        <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-lg border border-[#D6CFC2] text-[10px] font-bold text-primary flex items-center gap-1.5 shadow-xs max-w-[70%] truncate">
                          <Briefcase className="w-3 h-3 text-accent flex-shrink-0" />
                          <span className="truncate">
                            {getProjectDisplayName(photo)}
                            {getCustomerDisplayName(photo) ? ` • ${getCustomerDisplayName(photo)}` : ''}
                          </span>
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
                        <p className="text-dark/70 line-clamp-2">{photo.description || photo.caption}</p>
                        <div className="pt-2 border-t border-[#D6CFC2]/40 flex justify-between items-center text-[10px] text-dark/50 font-mono">
                          <span>{language === 'EN' ? 'Uploader:' : 'Vakman:'} <strong className="text-primary">{photo.craftsman}</strong></span>
                          {(() => {
                            const isAdmin = photo.uploaderRole === 'admin' ||
                              photo.tag === 'admin' ||
                              (photo.craftsman && photo.craftsman.toLowerCase().includes('admin'));
                            return (
                              <Badge variant={isAdmin ? 'primary' : 'success'}>
                                {isAdmin ? (language === 'EN' ? 'Admin Upload' : 'Beheerder Upload') : (language === 'EN' ? 'Partner Upload' : 'Partner Upload')}
                              </Badge>
                            );
                          })()}
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
                        title={isShared ? 'Click to Unshare from Customer Portal' : 'Click to Share with Customer'}
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
                          title={language === 'EN' ? 'Edit Details or Replace Photo File' : 'Gegevens bewerken of foto vervangen'}
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
                  <h4 className="font-heading font-bold text-dark text-base">
                    {language === 'EN' ? 'No Photos Linked to This Project' : "Geen Foto's Gekoppeld aan Dit Project"}
                  </h4>
                  <p className="text-xs text-dark/50 max-w-sm mx-auto">
                    {selectedProjectId !== 'All'
                      ? (language === 'EN' ? `Upload and share build photos for Project ${selectedProjectId}.` : `Upload en deel projectfoto's voor Project ${selectedProjectId}.`)
                      : (language === 'EN' ? 'Select a project to view and upload build photos.' : "Selecteer een project om foto's te bekijken en te uploaden.")}
                  </p>
                  <Button
                    size="sm"
                    icon={Send}
                    onClick={() => handleOpenUploadForProject(selectedProjectId !== 'All' ? selectedProjectId : (projectsList[0]?.id || 'PRJ-101'))}
                    className="mt-2"
                  >
                    {language === 'EN' ? '+ Upload & Share Photo' : "+ Foto Uploaden & Delen"}
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* -------------------------------------------------------------
          MODAL 1: DOCUMENT PREVIEW MODAL
          ------------------------------------------------------------- */}
      <AnimatePresence>
        {selectedDoc && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-dark/70 backdrop-blur-xs"
              onClick={() => setSelectedDoc(null)}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-lg bg-[#EDE8DF] border border-[#C4BEB3] rounded-2xl p-6 shadow-2xl z-10 space-y-4 text-xs font-body"
            >
              <div className="flex justify-between items-start border-b border-[#D6CFC2] pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <Badge variant="primary">{selectedDoc.category || 'General'}</Badge>
                    <span className="font-mono text-dark/60 font-bold">{selectedDoc.documentNumber}</span>
                  </div>
                  <h3 className="text-lg font-heading font-bold text-primary mt-1">
                    {selectedDoc.fileName}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedDoc(null)}
                  className="p-1 text-dark/40 hover:text-dark"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 bg-white rounded-xl border border-[#D6CFC2]/60 space-y-2">
                <p>
                  <span className="font-bold text-dark">{language === 'NL' ? 'Grootte:' : 'Size:'}</span>{' '}
                  {formatBytes(selectedDoc.fileSizeBytes)}
                </p>
                <p>
                  <span className="font-bold text-dark">{language === 'NL' ? 'Document Type:' : 'Document Type:'}</span>{' '}
                  <span className="font-mono">{selectedDoc.documentType || 'cad_blueprint'}</span>
                </p>
                <p>
                  <span className="font-bold text-dark">{language === 'NL' ? 'Datum:' : 'Date:'}</span>{' '}
                  {selectedDoc.createdAt ? new Date(selectedDoc.createdAt).toLocaleString('nl-NL') : '–'}
                </p>
                <p className="text-dark/70 pt-2 border-t border-[#D6CFC2]/40 leading-relaxed">
                  {selectedDoc.description || (language === 'NL' ? 'Officieel projectdocument.' : 'Official project document.')}
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setSelectedDoc(null)}>
                  {language === 'NL' ? 'Sluiten' : 'Close'}
                </Button>
                <Button
                  onClick={() => {
                    handleDocDownload(selectedDoc);
                    setSelectedDoc(null);
                  }}
                >
                  <Download className="w-3.5 h-3.5 mr-1" />
                  {language === 'NL' ? 'Downloaden' : 'Download'}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* -------------------------------------------------------------
          MODAL 2: MULTIPLE PHOTOS UPLOAD & SHARE MODAL (From AdminPhotos)
          ------------------------------------------------------------- */}
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
                    onChange={(e) => {
                      const selectedId = e.target.value;
                      const proj = projectsList.find((p) => p.id === selectedId) || projectsList[0];
                      setUploadForm((prev) => ({
                        ...prev,
                        projectId: proj ? proj.id : selectedId,
                        projectName: proj ? proj.name : 'Luxury Teak Outdoor Kitchen',
                        customer: proj ? (proj.customerName || proj.customer) : 'John Miller'
                      }));
                    }}
                    className="w-full px-3 py-2 bg-[#F8F7F4] border border-[#D6CFC2] rounded-lg text-xs font-bold text-primary truncate"
                  >
                    {projectsList.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name || 'Outdoor Kitchen'} — {p.customerName || p.customer || 'Client'} (#{p.id.slice(0, 8)})
                      </option>
                    ))}
                  </select>
                  <div className="flex items-center gap-1.5 text-[10px] text-emerald-800 font-medium">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                    <span>
                      {language === 'EN' ? 'Photos will be linked to project ' : "Foto's worden gekoppeld aan project "}
                      <strong>{uploadForm.projectName}</strong>
                      {uploadForm.customer ? ` (${uploadForm.customer})` : ''}
                      {language === 'EN' ? ' and visible in Customer Portal!' : ' en direct zichtbaar in het Klantenportaal!'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-dark/60 mb-1 uppercase tracking-wider">{language === 'EN' ? 'Photo Title' : 'Foto Titel'}</label>
                    <input
                      type="text"
                      value={uploadForm.title}
                      onChange={(e) => setUploadForm((prev) => ({ ...prev, title: e.target.value }))}
                      className="w-full px-3 py-2 bg-white border border-[#D6CFC2] rounded-lg text-xs font-bold text-dark"
                      placeholder="e.g. Teakhouten Frame Constructie"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-dark/60 mb-1 uppercase tracking-wider">{language === 'EN' ? 'Phase Date / Status' : 'Fasedatum / Status'}</label>
                    <input
                      type="text"
                      value={uploadForm.phase}
                      onChange={(e) => setUploadForm((prev) => ({ ...prev, phase: e.target.value }))}
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
                    onChange={(e) => setUploadForm((prev) => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 bg-white border border-[#D6CFC2] rounded-lg text-xs resize-none"
                    placeholder={language === 'EN' ? 'e.g. Frame cut to size and concrete countertop polished in workshop...' : 'b.v. Frame gemonteerd en betonblad gepolijst...'}
                  />
                </div>

                {/* Multiple Files Upload Dropzone */}
                <div className="space-y-2">
                  <label className="block font-bold text-dark/60 uppercase tracking-wider">{language === 'EN' ? 'Select Photo Files (Multiple Allowed) *' : 'Selecteer Foto Bestanden *'}</label>
                  <div
                    onClick={() => photoFileInputRef.current?.click()}
                    className="border-2 border-dashed border-[#D6CFC2] p-5 rounded-xl text-center bg-white hover:bg-[#F8F7F4] transition-colors cursor-pointer space-y-2"
                  >
                    <ImageIcon className="w-8 h-8 text-primary mx-auto" />
                    <p className="text-xs font-bold text-primary">
                      {language === 'EN' ? 'Click to browse image files from computer' : "Klik om foto's te selecteren van uw computer"}
                    </p>
                    <p className="text-[10px] text-dark/50">PNG, JPG, WEBP (Multiple files supported with auto-compression)</p>
                    <input
                      type="file"
                      ref={photoFileInputRef}
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
                        ✓ {selectedFiles.length} {language === 'EN' ? 'Photos Ready for Upload:' : "Foto's Klaar voor Upload:"}
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
                    onChange={(e) => setUploadForm((prev) => ({ ...prev, isShared: e.target.checked }))}
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

      {/* -------------------------------------------------------------
          MODAL 3: EDIT & REPLACE PHOTO DETAILS MODAL (From AdminPhotos)
          ------------------------------------------------------------- */}
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
                <img
                  src={resolvePhotoUrl(editingPhoto)}
                  alt="Current"
                  onError={(e) => { if (e.currentTarget.src !== projectImg) e.currentTarget.src = projectImg; }}
                  className="w-16 h-16 object-cover rounded-lg border border-[#D6CFC2]"
                />
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
                    onChange={(e) => setEditForm((prev) => ({ ...prev, customer: e.target.value }))}
                    className="w-full px-3 py-2 bg-white border border-[#D6CFC2] rounded-lg text-xs font-bold text-primary"
                  >
                    {(customersList.length > 0 ? customersList : (editForm.customer ? [editForm.customer] : ['Client'])).map((c, idx) => (
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
                    onChange={(e) => setEditForm((prev) => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 bg-white border border-[#D6CFC2] rounded-lg text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-dark/60 mb-1 uppercase tracking-wider">{language === 'EN' ? 'Phase Date / Status' : 'Fasedatum'}</label>
                  <input
                    type="text"
                    value={editForm.phase}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, phase: e.target.value }))}
                    className="w-full px-3 py-2 bg-white border border-[#D6CFC2] rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-dark/60 mb-1 uppercase tracking-wider">{language === 'EN' ? 'Description' : 'Omschrijving'}</label>
                  <textarea
                    rows={3}
                    value={editForm.description}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, description: e.target.value }))}
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
                    onChange={(e) => setEditForm((prev) => ({ ...prev, isShared: e.target.checked }))}
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

      {/* -------------------------------------------------------------
          MODAL 4: FULLSCREEN PREVIEW LIGHTBOX (From AdminPhotos)
          ------------------------------------------------------------- */}
      <AnimatePresence>
        {previewPhoto && (
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-dark/85 backdrop-blur-md z-[99999]" onClick={() => setPreviewPhoto(null)} />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative max-w-3xl w-full bg-[#EDE8DF] border border-[#C4BEB3] rounded-2xl p-5 shadow-2xl z-[100000] font-body space-y-4 my-auto">
              <div className="flex justify-between items-start border-b border-[#D6CFC2] pb-3">
                <div>
                  <span className="text-[10px] font-mono font-bold text-accent">
                    {previewPhoto.phase} • Client: {getCustomerDisplayName(previewPhoto) || previewPhoto.customer || 'Client'}
                  </span>
                  <h3 className="text-lg sm:text-xl font-heading font-bold text-primary leading-tight mt-0.5">{previewPhoto.title}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="primary">{getProjectDisplayName(previewPhoto)}</Badge>
                  <button onClick={() => setPreviewPhoto(null)} className="p-1.5 text-dark/50 hover:text-dark hover:bg-dark/10 rounded-full transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Ultra-Crisp Centered Image Frame */}
              <div className="rounded-xl overflow-hidden max-h-[52vh] sm:max-h-[58vh] bg-black/90 border border-[#D6CFC2] flex items-center justify-center p-2 shadow-inner">
                <img
                  src={resolvePhotoUrl(previewPhoto)}
                  alt={previewPhoto.title}
                  onError={(e) => { if (e.currentTarget.src !== projectImg) e.currentTarget.src = projectImg; }}
                  className="max-h-[50vh] sm:max-h-[55vh] w-auto max-w-full object-contain mx-auto rounded-lg"
                />
              </div>

              <div className="p-3 bg-white rounded-xl border border-[#D6CFC2]/70 text-xs text-dark/80 space-y-1">
                <p className="font-semibold">{previewPhoto.description || previewPhoto.caption}</p>
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
