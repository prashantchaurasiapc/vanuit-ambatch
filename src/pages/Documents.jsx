import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Image as ImageIcon, FileArchive, File,
  Upload, Search, Download, Trash2, Plus, Filter, CheckCircle, X, Eye
} from 'lucide-react';
import { downloadDocumentPdf } from '../utils/pdfGenerator';
import Card from '../components/Card';
import Button from '../components/Button';
import Badge from '../components/Badge';
import { useLanguage } from '../context/LanguageContext';

// Initial Mock Documents
const INITIAL_DOCUMENTS = [
  {
    id: 'doc-1',
    name: 'BLU-P2001-AUTOCAD-SPEC-V2.pdf',
    nameNL: 'BLU-P2001-AUTOCAD-SPEC-V2.pdf',
    nameEN: 'BLU-P2001-AUTOCAD-SPEC-V2.pdf',
    size: '4.2 MB',
    type: 'pdf',
    category: 'Designs',
    categoryNL: 'Ontwerpen',
    categoryEN: 'Designs',
    date: '2026-07-29',
    uploader: 'Bram (Head Designer)',
    descriptionNL: 'AutoCAD 1:20 schematische bouwtekening massief teakhout frame & beton cire werkblad.',
    descriptionEN: 'AutoCAD 1:20 schematic blueprint for solid teak frame & concrete worktop.'
  },
  {
    id: 'doc-2',
    name: 'Overeenkomst_Vanuit_Ambacht_Q4001.pdf',
    nameNL: 'Overeenkomst_Vanuit_Ambacht_Q4001.pdf',
    nameEN: 'Contract_Vanuit_Ambacht_Q4001.pdf',
    size: '2.4 MB',
    type: 'pdf',
    category: 'Contracts',
    categoryNL: 'Contracten',
    categoryEN: 'Contracts',
    date: '2026-07-28',
    uploader: 'Admin User',
    descriptionNL: 'Ondertekend contract voor maatwerk buitenkeuken 3.5m.',
    descriptionEN: 'Signed contract for custom outdoor kitchen 3.5m.'
  },
  {
    id: 'doc-3',
    name: 'Materiaal_Specificatie_Thermo_Frake.xlsx',
    nameNL: 'Materiaal_Specificatie_Thermo_Frake.xlsx',
    nameEN: 'Material_Specs_Thermo_Frake.xlsx',
    size: '1.8 MB',
    type: 'excel',
    category: 'Materials',
    categoryNL: 'Materialen',
    categoryEN: 'Materials',
    date: '2026-08-01',
    uploader: 'Sven Hoek',
    descriptionNL: 'Inkooplijst verduurzaamd hout & RVS schroeven.',
    descriptionEN: 'Purchase list for preserved timber & stainless steel hardware.'
  },
  {
    id: 'doc-4',
    name: 'Onderhoudsgids_Buitenkeuken_2026.pdf',
    nameNL: 'Onderhoudsgids_Buitenkeuken_2026.pdf',
    nameEN: 'Maintenance_Guide_Outdoor_Kitchen_2026.pdf',
    size: '3.8 MB',
    type: 'pdf',
    category: 'General',
    categoryNL: 'Algemeen',
    categoryEN: 'General',
    date: '2026-08-02',
    uploader: 'Admin User',
    descriptionNL: 'Behandelingsgids voor beton cire & teakhout olie.',
    descriptionEN: 'Care manual for polished concrete & teak oil treatment.'
  }
];

export default function Documents({ role }) {
  const { language } = useLanguage();
  const [documents, setDocuments] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [dragActive, setDragActive] = useState(false);
  const [notification, setNotification] = useState('');
  const fileInputRef = useRef(null);

  // Load documents from localStorage on mount
  useEffect(() => {
    const savedDocs = localStorage.getItem('app_documents');
    if (savedDocs) {
      try {
        setDocuments(JSON.parse(savedDocs));
      } catch (e) {
        setDocuments(INITIAL_DOCUMENTS);
      }
    } else {
      setDocuments(INITIAL_DOCUMENTS);
      localStorage.setItem('app_documents', JSON.stringify(INITIAL_DOCUMENTS));
    }
  }, []);

  // File type icons mapping
  const getFileIcon = (type) => {
    switch (type) {
      case 'pdf':
        return <FileText className="w-8 h-8 text-red-500" />;
      case 'image':
        return <ImageIcon className="w-8 h-8 text-blue-500" />;
      case 'excel':
        return <FileText className="w-8 h-8 text-green-600" />;
      case 'word':
        return <FileText className="w-8 h-8 text-blue-600" />;
      case 'zip':
        return <FileArchive className="w-8 h-8 text-amber-500" />;
      case 'text':
        return <FileText className="w-8 h-8 text-dark/70" />;
      default:
        return <File className="w-8 h-8 text-dark/40" />;
    }
  };

  // Helper to format file size
  const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  // Upload handler
  const handleUpload = async (files) => {
    if (!files || files.length === 0) return;
    
    const uploadPromises = Array.from(files).map(file => {
      return new Promise((resolve) => {
        const nameParts = file.name.split('.');
        const ext = nameParts.length > 1 ? nameParts.pop().toLowerCase() : '';
        let fileType = 'other';
        if (['pdf'].includes(ext)) fileType = 'pdf';
        else if (['png', 'jpg', 'jpeg', 'svg', 'webp'].includes(ext)) fileType = 'image';
        else if (['xlsx', 'xls', 'csv'].includes(ext)) fileType = 'excel';
        else if (['docx', 'doc'].includes(ext)) fileType = 'word';
        else if (['zip', 'rar'].includes(ext)) fileType = 'zip';
        else if (['txt', 'json', 'md', 'html', 'css', 'js'].includes(ext)) fileType = 'text';

        const reader = new FileReader();
        reader.onload = (e) => {
          resolve({
            id: `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: file.name,
            size: formatBytes(file.size),
            type: fileType,
            url: e.target.result,
            category: fileType === 'image' || fileType === 'pdf' ? 'Designs' : fileType === 'excel' || fileType === 'word' ? 'Contracts' : 'General',
            date: new Date().toISOString().split('T')[0],
            uploader: role === 'admin' ? 'Admin User' : 'Sven Hoek'
          });
        };
        
        if (fileType === 'text') {
          reader.readAsText(file);
        } else {
          reader.readAsDataURL(file);
        }
      });
    });

    const newDocs = await Promise.all(uploadPromises);
    const updated = [...newDocs, ...documents];
    setDocuments(updated);
    localStorage.setItem('app_documents', JSON.stringify(updated));

    const count = newDocs.length;
    showToast(count === 1 ? `"${newDocs[0].name}" ${language === 'NL' ? 'geüpload' : 'uploaded'}` : `${count} ${language === 'NL' ? 'documenten geüpload' : 'documents uploaded'}`);
  };

  const showToast = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 3000);
  };

  const handleFileChange = (e) => {
    handleUpload(e.target.files);
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUpload(e.dataTransfer.files);
    }
  };

  // Direct PDF download via jsPDF — no print dialog, no popup
  const handleDownload = (doc) => {
    const fileName = downloadDocumentPdf(doc);
    showToast(`${language === 'NL' ? 'PDF gedownload' : 'PDF downloaded'}: ${fileName}`);
  };

  const handleDelete = (id, name) => {
    const updated = documents.filter(doc => doc.id !== id);
    setDocuments(updated);
    localStorage.setItem('app_documents', JSON.stringify(updated));
    showToast(`${language === 'NL' ? 'Verwijderd' : 'Deleted'} ${name}`);
  };

  // Filtering
  const filteredDocs = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(search.toLowerCase()) || 
                          doc.uploader.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || doc.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = [
    { key: 'All', label: language === 'NL' ? 'Alles' : 'All' },
    { key: 'Designs', label: language === 'NL' ? 'Ontwerpen' : 'Designs' },
    { key: 'Finance', label: language === 'NL' ? 'Financieel' : 'Finance' },
    { key: 'Materials', label: language === 'NL' ? 'Materialen' : 'Materials' },
    { key: 'Contracts', label: language === 'NL' ? 'Contracten' : 'Contracts' },
    { key: 'General', label: language === 'NL' ? 'Algemeen' : 'General' }
  ];

  return (
    <div className="space-y-6 font-body text-[#4A4A43] relative">
      {/* Toast Notification (Positioned nicely below header) */}
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

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-heading font-bold text-primary">
            {language === 'NL' ? 'Documenten' : 'Documents'}
          </h2>
          <p className="text-dark/50 text-sm font-body mt-1">
            {language === 'NL' ? 'Projectdocumenten uploaden, beheren en delen.' : 'Upload, manage, and share project documents.'}
          </p>
        </div>
        <Button icon={Plus} onClick={triggerFileInput}>
          {language === 'NL' ? 'Document Uploaden' : 'Upload Document'}
        </Button>
      </div>

      {/* Hidden File Input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        className="hidden" 
      />

      {/* Drag and Drop Zone */}
      <motion.div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={triggerFileInput}
        whileHover={{ scale: 1.005 }}
        className={`rounded-2xl p-8 text-center cursor-pointer border-2 border-dashed transition-all duration-300 ${
          dragActive 
            ? 'border-primary bg-primary/5' 
            : 'border-[#D6CFC2] bg-[#EDE8DF] hover:border-primary'
        }`}
      >
        <Upload className={`w-10 h-10 mx-auto mb-3 transition-colors ${dragActive ? 'text-primary' : 'text-dark/25'}`} />
        <p className="text-sm text-dark/70 font-semibold font-body">
          {language === 'NL' ? 'Sleep uw bestand hierheen, of klik om te bladeren' : 'Drag and drop file here, or click to browse'}
        </p>
        <p className="text-xs text-dark/40 mt-1 font-body">
          {language === 'NL' ? 'PDF, Word, Excel, ZIP of Afbeeldingen tot 10 MB' : 'PDF, Word, Excel, ZIP or Images up to 10MB'}
        </p>
      </motion.div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-dark/40" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={language === 'NL' ? 'Zoek documenten op naam...' : 'Search documents by name...'}
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-[#D6CFC2] rounded-xl text-xs font-body focus:outline-none focus:ring-2 focus:ring-primary/15 text-dark"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          <Filter className="w-3.5 h-3.5 text-dark/40 ml-1 mr-1 flex-shrink-0" />
          <span className="text-xs font-bold text-dark/40 uppercase mr-1 hidden sm:inline">{language === 'NL' ? 'Filter:' : 'Filter:'}</span>
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setSelectedCategory(cat.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat.key
                  ? 'bg-primary text-white shadow-xs'
                  : 'bg-white/80 text-dark/70 hover:bg-white border border-[#D6CFC2]/60'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Document Grid List */}
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
                  {getFileIcon(doc.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <Badge variant="primary" className="text-[9px]">
                      {doc.category}
                    </Badge>
                    <span className="text-[10px] text-dark/40 font-mono">{doc.date}</span>
                  </div>

                  <h3 className="font-bold text-sm text-primary truncate font-heading">{doc.name}</h3>
                  <p className="text-xs text-dark/60 line-clamp-1 mt-0.5 font-body">
                    {language === 'EN' ? (doc.descriptionEN || doc.descriptionNL || 'Uploaded document') : (doc.descriptionNL || doc.descriptionEN || 'Geüpload document')}
                  </p>

                  <div className="flex items-center justify-between pt-3 mt-2 border-t border-[#D6CFC2]/40 text-xs">
                    <span className="text-[10px] text-dark/50 font-mono">
                      {doc.size} • {doc.uploader}
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
                        onClick={() => handleDownload(doc)}
                        className="p-1.5 text-dark/60 hover:text-primary hover:bg-[#EDE8DF] rounded-lg transition-colors"
                        title={language === 'NL' ? 'Download PDF' : 'Download PDF'}
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(doc.id, doc.name)}
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

      {/* DOCUMENT PREVIEW MODAL */}
      <AnimatePresence>
        {selectedDoc && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-dark/70 backdrop-blur-xs" onClick={() => setSelectedDoc(null)} />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative w-full max-w-lg bg-[#EDE8DF] border border-[#C4BEB3] rounded-2xl p-6 shadow-2xl z-10 space-y-4 text-xs font-body">
              <div className="flex justify-between items-start border-b border-[#D6CFC2] pb-3">
                <div>
                  <Badge variant="primary">{selectedDoc.category}</Badge>
                  <h3 className="text-lg font-heading font-bold text-primary mt-1">{selectedDoc.name}</h3>
                </div>
                <button onClick={() => setSelectedDoc(null)} className="p-1 text-dark/40 hover:text-dark">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 bg-white rounded-xl border border-[#D6CFC2]/60 space-y-2">
                <p><span className="font-bold text-dark">{language === 'NL' ? 'Grootte:' : 'Size:'}</span> {selectedDoc.size}</p>
                <p><span className="font-bold text-dark">{language === 'NL' ? 'Type:' : 'Type:'}</span> {selectedDoc.type.toUpperCase()}</p>
                <p><span className="font-bold text-dark">{language === 'NL' ? 'Geüpload door:' : 'Uploaded By:'}</span> {selectedDoc.uploader}</p>
                <p><span className="font-bold text-dark">{language === 'NL' ? 'Datum:' : 'Date:'}</span> {selectedDoc.date}</p>
                <p className="text-dark/70 pt-2 border-t border-[#D6CFC2]/40 leading-relaxed">
                  {language === 'EN' ? (selectedDoc.descriptionEN || selectedDoc.descriptionNL || 'Official project document.') : (selectedDoc.descriptionNL || selectedDoc.descriptionEN || 'Officieel projectdocument.')}
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setSelectedDoc(null)}>
                  {language === 'NL' ? 'Sluiten' : 'Close'}
                </Button>
                <Button onClick={() => { handleDownload(selectedDoc); setSelectedDoc(null); }}>
                  <Download className="w-3.5 h-3.5 mr-1" />
                  {language === 'NL' ? 'Download PDF' : 'Download PDF'}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
