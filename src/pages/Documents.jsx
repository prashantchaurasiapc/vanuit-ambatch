import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Image as ImageIcon, FileArchive, File,
  Upload, Search, Download, Trash2, Plus, Filter, CheckCircle, X, Eye, Loader2
} from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import Badge from '../components/Badge';
import { useLanguage } from '../context/LanguageContext';
import api from '../api/apiClient';

export default function Documents({ role }) {
  const { language } = useLanguage();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [dragActive, setDragActive] = useState(false);
  const [notification, setNotification] = useState('');
  const fileInputRef = useRef(null);

  // Load documents from backend
  const loadDocuments = async () => {
    try {
      setLoading(true);
      const res = await api.get('/documents');
      if (res.success && Array.isArray(res.data)) {
        setDocuments(res.data);
      }
    } catch (err) {
      console.error('Failed to load documents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  // Helper to format file size
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

  // Helper to determine file icon
  const getFileIcon = (fileName, mimeType) => {
    const ext = (fileName || '').split('.').pop().toLowerCase();
    if (ext === 'pdf' || mimeType?.includes('pdf')) {
      return <FileText className="w-8 h-8 text-red-500" />;
    }
    if (['png', 'jpg', 'jpeg', 'svg', 'webp'].includes(ext) || mimeType?.startsWith('image/')) {
      return <ImageIcon className="w-8 h-8 text-blue-500" />;
    }
    if (['xlsx', 'xls', 'csv'].includes(ext) || mimeType?.includes('spreadsheet') || mimeType?.includes('excel')) {
      return <FileText className="w-8 h-8 text-green-600" />;
    }
    if (['docx', 'doc'].includes(ext) || mimeType?.includes('word')) {
      return <FileText className="w-8 h-8 text-blue-600" />;
    }
    if (['zip', 'rar', 'tar', 'gz'].includes(ext)) {
      return <FileArchive className="w-8 h-8 text-amber-500" />;
    }
    return <File className="w-8 h-8 text-dark/40" />;
  };

  const showToast = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 3500);
  };

  // Handle uploading files to backend vault (POST /api/documents)
  const handleUpload = async (files) => {
    if (!files || files.length === 0) return;
    setUploading(true);

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
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
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

  // Direct backend download (GET /api/documents/:id/download)
  const handleDownload = (doc) => {
    const downloadUrl = `/api/documents/${doc.id}/download`;
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.setAttribute('download', doc.fileName || 'document.pdf');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`${language === 'NL' ? 'Download gestart' : 'Download started'}: ${doc.fileName}`);
  };

  // Delete document (DELETE /api/documents/:id)
  const handleDelete = async (id, name) => {
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

  // Filtering
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

  const categories = [
    { key: 'All', label: language === 'NL' ? 'Alles' : 'All' },
    { key: 'Blueprints', label: language === 'NL' ? 'Bouwtekeningen' : 'Blueprints' },
    { key: 'Designs', label: language === 'NL' ? 'Ontwerpen' : 'Designs' },
    { key: 'Contracts', label: language === 'NL' ? 'Contracten' : 'Contracts' },
    { key: 'Finance', label: language === 'NL' ? 'Financieel' : 'Finance' },
    { key: 'Materials', label: language === 'NL' ? 'Materialen' : 'Materials' },
    { key: 'General', label: language === 'NL' ? 'Algemeen' : 'General' }
  ];

  return (
    <div className="space-y-6 font-body text-[#4A4A43] relative">
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

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-heading font-bold text-primary">
            {language === 'NL' ? 'Documenten' : 'Documents'}
          </h2>
          <p className="text-dark/50 text-sm font-body mt-1">
            {language === 'NL' ? 'Projectdocumenten uploaden, beheren en veilig delen.' : 'Upload, manage, and share project documents.'}
          </p>
        </div>
        <Button icon={Plus} onClick={triggerFileInput} disabled={uploading}>
          {uploading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" /> {language === 'NL' ? 'Uploaden...' : 'Uploading...'}
            </span>
          ) : (
            language === 'NL' ? 'Document Uploaden' : 'Upload Document'
          )}
        </Button>
      </div>

      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        multiple
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
            placeholder={language === 'NL' ? 'Zoek documenten op naam of code...' : 'Search documents by name or code...'}
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-[#D6CFC2] rounded-xl text-xs font-body focus:outline-none focus:ring-2 focus:ring-primary/15 text-dark"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          <Filter className="w-3.5 h-3.5 text-dark/40 ml-1 mr-1 flex-shrink-0" />
          <span className="text-xs font-bold text-dark/40 uppercase mr-1 hidden sm:inline">
            {language === 'NL' ? 'Filter:' : 'Filter:'}
          </span>
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
      {loading ? (
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
                          onClick={() => handleDownload(doc)}
                          className="p-1.5 text-dark/60 hover:text-primary hover:bg-[#EDE8DF] rounded-lg transition-colors"
                          title={language === 'NL' ? 'Download Bestand' : 'Download File'}
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(doc.id, doc.fileName)}
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

      {/* DOCUMENT PREVIEW MODAL */}
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
                    handleDownload(selectedDoc);
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
    </div>
  );
}
