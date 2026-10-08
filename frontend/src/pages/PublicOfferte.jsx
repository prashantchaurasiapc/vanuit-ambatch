import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, CheckCircle, Check, X, ShieldCheck, Clock, Download, MessageSquare, Mail, Phone, Lock, Sparkles, AlertCircle, AlertTriangle, Printer, ThumbsDown } from 'lucide-react';
import api from '../api/apiClient';
import Offerte6PagePDF from '../components/Offerte6PagePDF';
import { downloadDirectPdfFile } from '../utils/pdfGenerator';
import { useLanguage } from '../context/LanguageContext';


export default function PublicOfferte() {
  const { token } = useParams();
  const { language = 'NL' } = useLanguage() || {};
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [signerName, setSignerName] = useState('');
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [isApprovedSuccess, setIsApprovedSuccess] = useState(false);
  const [isDeclined, setIsDeclined] = useState(false);
  const [approvalDetails, setApprovalDetails] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectChanges, setRejectChanges] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load quote proposal data from backend API
  useEffect(() => {
    const fetchProposal = async () => {
      setLoading(true);
      setLoadError(null);
      try {
        const res = await api.get(`/offerte/${token}`);
        if (res.success && res.data) {
          const data = res.data;
          const mappedQuote = {
            id: data.quoteNumber,
            quoteNumber: data.quoteNumber,
            publicToken: data.publicToken,
            customer: {
              name: data.customerName,
              city: data.customerCity,
              address: data.customerAddress
            },
            productType: data.productType,
            cover: data.cover,
            configuration: data.configuration,
            investment: data.investment,
            letterAndProcess: data.letterAndProcess,
            company: data.company,
            date: data.issueDate,
            validUntil: data.validUntil,
            isExpired: Boolean(data.isExpired),
            status: data.status === 'approved' ? 'Akkoord' : data.status === 'declined' ? 'Afgewezen' : (data.status === 'sent' ? 'Verzonden' : data.status),
            amount: data.investment?.totalInclVat ? `€ ${Math.round(data.investment.totalInclVat).toLocaleString('nl-NL')}` : '€ 0',
            numericAmount: data.investment?.totalInclVat || 0,
            digitalSignature: data.digitalSignature
          };

          setQuote(mappedQuote);
          if (data.status === 'approved' || data.digitalSignature) {
            setIsApprovedSuccess(true);
            setApprovalDetails({
              signerName: data.digitalSignature?.signerName || data.customerName,
              date: data.digitalSignature?.approvedAt || data.issueDate,
              ip: 'Digitally Verified'
            });
            if (data.digitalSignature?.signerName) setSignerName(data.digitalSignature.signerName);
          } else if (data.status === 'declined') {
            setIsDeclined(true);
          }
        } else {
          // Robust fallback: check local cache for draft or direct lead quotes
          let localFound = null;
          try {
            const rawExact = localStorage.getItem(`active_quote_${token}`);
            if (rawExact) localFound = JSON.parse(rawExact);
            if (!localFound) {
              const list = JSON.parse(localStorage.getItem('app_quotes_v2') || '[]');
              localFound = list.find(q => q.id === token || q.publicToken === token || q.quoteNumber === token || q.backendId === token);
            }
          } catch (e) {
            console.warn('Fallback cache read error:', e);
          }

          if (localFound) {
            const mappedQuote = {
              id: localFound.quoteNumber || localFound.id || token,
              quoteNumber: localFound.quoteNumber || localFound.id || token,
              publicToken: localFound.publicToken || token,
              customer: {
                name: typeof localFound.customer === 'object' ? (localFound.customer?.name || 'Klant') : (localFound.customer || 'Klant'),
                city: typeof localFound.customer === 'object' ? (localFound.customer?.city || 'Amsterdam') : 'Amsterdam',
                address: typeof localFound.customer === 'object' ? (localFound.customer?.address || '') : ''
              },
              productType: localFound.productType || 'outdoor_kitchen',
              cover: localFound.cover || {},
              configuration: localFound.configuration || {},
              investment: localFound.investment || {},
              letterAndProcess: localFound.letterAndProcess || {},
              company: localFound.company || {},
              date: localFound.issueDate || localFound.date || new Date().toISOString().split('T')[0],
              validUntil: localFound.validUntil || '',
              isExpired: false,
              status: localFound.status || 'Concept',
              amount: localFound.investment?.totalInclVat ? `€ ${Math.round(localFound.investment.totalInclVat).toLocaleString('nl-NL')}` : (localFound.amount || '€ 0'),
              numericAmount: localFound.investment?.totalInclVat || localFound.totalInclVat || 0,
              digitalSignature: localFound.digitalSignature
            };
            setQuote(mappedQuote);
            setLoadError(null);
          } else {
            setLoadError(res.error?.message || 'Quotation proposal not found or link has expired');
          }
        }
      } catch (err) {
        console.error('Error fetching proposal:', err);
        // Robust fallback on fetch exception
        let localFound = null;
        try {
          const rawExact = localStorage.getItem(`active_quote_${token}`);
          if (rawExact) localFound = JSON.parse(rawExact);
          if (!localFound) {
            const list = JSON.parse(localStorage.getItem('app_quotes_v2') || '[]');
            localFound = list.find(q => q.id === token || q.publicToken === token || q.quoteNumber === token || q.backendId === token);
          }
        } catch (e) {}

        if (localFound) {
          const mappedQuote = {
            id: localFound.quoteNumber || localFound.id || token,
            quoteNumber: localFound.quoteNumber || localFound.id || token,
            publicToken: localFound.publicToken || token,
            customer: {
              name: typeof localFound.customer === 'object' ? (localFound.customer?.name || 'Klant') : (localFound.customer || 'Klant'),
              city: typeof localFound.customer === 'object' ? (localFound.customer?.city || 'Amsterdam') : 'Amsterdam',
              address: typeof localFound.customer === 'object' ? (localFound.customer?.address || '') : ''
            },
            productType: localFound.productType || 'outdoor_kitchen',
            cover: localFound.cover || {},
            configuration: localFound.configuration || {},
            investment: localFound.investment || {},
            letterAndProcess: localFound.letterAndProcess || {},
            company: localFound.company || {},
            date: localFound.issueDate || localFound.date || new Date().toISOString().split('T')[0],
            validUntil: localFound.validUntil || '',
            isExpired: false,
            status: localFound.status || 'Concept',
            amount: localFound.investment?.totalInclVat ? `€ ${Math.round(localFound.investment.totalInclVat).toLocaleString('nl-NL')}` : (localFound.amount || '€ 0'),
            numericAmount: localFound.investment?.totalInclVat || localFound.totalInclVat || 0,
            digitalSignature: localFound.digitalSignature
          };
          setQuote(mappedQuote);
          setLoadError(null);
        } else {
          setLoadError(err.message || 'Error loading proposal');
        }
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchProposal();
    }
  }, [token]);

  // Check if quote is expired (validUntil check vs real-time current date)
  const isExpired = quote && quote.validUntil ? new Date(quote.validUntil) < new Date() : false;

  // Handle PDF download via backend or client fallback
  const handleDownloadPdf = () => {
    try {
      window.open(`/api/offerte/${token}/pdf`, '_blank');
    } catch {
      if (quote) {
        downloadDirectPdfFile(quote);
      }
    }
  };

  // Handle Digital Approval Submission via backend API
  const handleApproveSubmit = async (e) => {
    e.preventDefault();
    if (!signerName.trim() || !agreedTerms) return;

    setIsSubmitting(true);
    try {
      const res = await api.post(`/offerte/${token}/approve`, {
        signerName: signerName.trim(),
        agreedTerms: true,
      });

      if (res.success) {
        const approvedAt = res.data?.approvedAt || new Date().toISOString();
        const updatedApproval = {
          signerName: signerName.trim(),
          date: new Date(approvedAt).toLocaleString('nl-NL', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          }),
          ip: 'Digitally Verified'
        };

        setApprovalDetails(updatedApproval);
        setQuote(prev => ({
          ...prev,
          status: 'Akkoord',
          signerName: signerName.trim(),
          approvedAt
        }));
        setIsApprovedSuccess(true);
        setShowApprovalModal(false);
      } else {
        alert(res.error?.message || 'Approval submission failed');
      }
    } catch (err) {
      alert(err.message || 'Error processing approval');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Customer Rejection via backend API
  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!rejectReason.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await api.post(`/offerte/${token}/reject`, {
        reason: rejectReason.trim(),
        requestedChanges: rejectChanges.trim() || undefined
      });

      if (res.success) {
        setIsDeclined(true);
        setQuote(prev => ({ ...prev, status: 'Afgewezen' }));
        setShowRejectModal(false);
      } else {
        alert(res.error?.message || 'Failed to submit decline response');
      }
    } catch (err) {
      alert(err.message || 'Error declining proposal');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#EBE6DD] flex items-center justify-center p-4 font-body">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm font-semibold text-primary">
            {language === 'EN' ? 'Loading proposal...' : 'Offerte laden...'}
          </p>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-screen bg-[#EBE6DD] flex items-center justify-center p-4 font-body">
        <div className="bg-[#FDFBF7] border border-[#C4BEB3] rounded-2xl p-8 max-w-md w-full text-center space-y-4 shadow-xl">
          <div className="w-12 h-12 bg-amber-100 text-amber-800 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-heading font-bold text-primary">
            {language === 'EN' ? 'Quotation Not Found' : 'Offerte Niet Gevonden'}
          </h2>
          <p className="text-xs text-dark/70">
            {loadError}
          </p>
          <p className="text-[11px] text-dark/50">
            {language === 'EN'
              ? 'Please verify your proposal link or contact Vanuit Ambacht support.'
              : 'Controleer de offerte link of neem contact op met Vanuit Ambacht.'}
          </p>
          <a
            href="/"
            className="inline-block px-4 py-2 bg-primary text-cream rounded-xl text-xs font-bold hover:bg-primary-dark transition-colors cursor-pointer"
          >
            {language === 'EN' ? 'Back to Website' : 'Naar Website'}
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#EBE6DD] text-dark font-body pb-12">
      {/* Top Fixed Header Bar */}
      <header className="sticky top-0 z-40 bg-[#3E4E36] text-[#FDFBF7] border-b border-[#2D3528] px-4 py-3 shadow-md">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#D6CFC2]" />
            <div>
              <h1 className="font-heading font-bold text-sm sm:text-base text-[#FDFBF7]">VANUIT AMBACHT</h1>
              <p className="text-[10px] text-[#D6CFC2] font-mono">Official Digital Proposal • {quote.id}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPdf}
              className="px-3 py-1 bg-[#70624F] hover:bg-[#5e5241] text-[#FDFBF7] rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-colors print:hidden cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Download PDF</span>
            </button>

            {!(isApprovedSuccess || quote.status === 'Akkoord' || isDeclined || isExpired) && (
              <>
                <button
                  onClick={() => setShowRejectModal(true)}
                  className="px-3 py-1.5 bg-red-800/80 hover:bg-red-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer border border-red-700/50"
                  title="Decline or request changes"
                >
                  <ThumbsDown className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{language === 'EN' ? 'Decline' : 'Afwijzen'}</span>
                </button>

                <button
                  onClick={() => setShowApprovalModal(true)}
                  className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg text-sm font-bold flex items-center gap-1.5 transition-colors shadow-lg cursor-pointer tracking-wide border border-emerald-600/50"
                >
                  <CheckCircle className="w-4 h-4 stroke-[2.5]" />
                  <span>{language === 'EN' ? 'Approve Quote' : 'Akkoord Geven'}</span>
                </button>
              </>
            )}

            <span className={`text-[11px] font-mono font-bold px-3 py-1 rounded-full border ${
              isApprovedSuccess || quote.status === 'Akkoord'
                ? 'bg-emerald-800/80 text-emerald-200 border-emerald-500/50'
                : isDeclined || quote.status === 'Afgewezen'
                ? 'bg-red-800/80 text-red-200 border-red-500/50'
                : isExpired
                ? 'bg-amber-800/80 text-amber-200 border-amber-500/50'
                : 'bg-[#70624F]/40 text-[#FDFBF7] border-[#70624F] hidden sm:inline-block'
            }`}>
              {isApprovedSuccess || quote.status === 'Akkoord'
                ? '✓ Digitally Approved'
                : isDeclined || quote.status === 'Afgewezen'
                ? '✗ Declined'
                : isExpired
                ? '⚠️ Expired Quote'
                : `Quote ${quote.id}`}
            </span>
          </div>
        </div>
      </header>

      {/* Main 6-Page Offerte Container */}
      <main className="max-w-4xl mx-auto p-3 sm:p-6 space-y-8 mt-4">
        
        {/* Expired Warning Banner */}
        {isExpired && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="p-5 bg-amber-950/90 text-amber-100 rounded-2xl border-2 border-amber-500 shadow-xl space-y-1.5 print:hidden font-body"
          >
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-amber-400 flex-shrink-0" />
              <div>
                <h3 className="font-heading font-bold text-base text-amber-200">
                  {language === 'EN' ? 'This proposal has expired' : 'Deze offerte is verlopen'}
                </h3>
                <p className="text-xs text-amber-200/80 mt-0.5">
                  {language === 'EN' 
                    ? `The validity period for this quote expired on ${quote.validUntil}. Please contact Vanuit Ambacht for an updated quote.`
                    : `De geldigheidstermijn voor deze prijsopgave is verstreken op ${quote.validUntil}. Neem contact op met Vanuit Ambacht voor een herziene offerte.`}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Success Banner if Approved */}
        {isApprovedSuccess && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, x: 0 }} 
            className="p-5 bg-emerald-900 text-emerald-100 rounded-2xl border-2 border-emerald-500 shadow-xl space-y-2 print:hidden"
          >
            <div className="flex items-center gap-3">
              <CheckCircle className="w-7 h-7 text-emerald-400 flex-shrink-0" />
              <div>
                <h3 className="font-heading font-bold text-lg text-white">
                  {language === 'EN' ? 'Congratulations! Your quote is officially approved.' : 'Gefeliciteerd! Uw offerte is officieel goedgekeurd.'}
                </h3>
                <p className="text-xs text-emerald-200 mt-0.5">
                  Signed by <strong>{approvalDetails?.signerName || quote.customer?.name}</strong> on {approvalDetails?.date || quote.date}.
                </p>
              </div>
            </div>
            <p className="text-[11px] text-emerald-300 pt-1 border-t border-emerald-700/60">
              Tim & Bram have received a notification directly. Within a few days you will receive the digital technical drawing for confirmation!
            </p>
          </motion.div>
        )}

        {/* Declined Banner if Rejected */}
        {isDeclined && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, x: 0 }} 
            className="p-5 bg-red-950/90 text-red-100 rounded-2xl border-2 border-red-500 shadow-xl space-y-2 print:hidden"
          >
            <div className="flex items-center gap-3">
              <X className="w-7 h-7 text-red-400 flex-shrink-0" />
              <div>
                <h3 className="font-heading font-bold text-lg text-white">
                  {language === 'EN' ? 'This proposal has been declined' : 'Deze offerte is afgewezen'}
                </h3>
                <p className="text-xs text-red-200 mt-0.5">
                  {language === 'EN'
                    ? 'Thank you for your feedback. We have recorded your preferences and will get in touch with revisions.'
                    : 'Hartelijk dank voor uw terugkoppeling. We hebben uw opmerkingen ontvangen en nemen contact met u op.'}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* 6-PAGE DOCUMENT CONTAINER MATCHING PDF EXACTLY */}
        <Offerte6PagePDF quote={quote} />

      </main>

      {/* ========================================================= */}
      {/* DIGITAL APPROVAL CONFIRMATION MODAL                      */}
      {/* ========================================================= */}
      <AnimatePresence>
        {showApprovalModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/75 backdrop-blur-xs"
              onClick={() => setShowApprovalModal(false)}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-lg bg-[#FDFBF7] border border-[#C4BEB3] rounded-2xl p-6 shadow-2xl z-10 space-y-5"
            >
              <div className="flex justify-between items-start border-b border-[#C4BEB3] pb-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-6 h-6 text-primary" />
                  <div>
                    <h3 className="font-heading font-bold text-lg text-primary">Sign Quote Digitally</h3>
                    <p className="text-[11px] text-dark/60 font-mono">Vanuit Ambacht • Quote {quote.id}</p>
                  </div>
                </div>
                <button onClick={() => setShowApprovalModal(false)} className="p-1 text-dark/40 hover:text-dark">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleApproveSubmit} className="space-y-4">
                <div className="p-3 bg-[#EDE8DF] rounded-xl border border-[#C4BEB3] space-y-1">
                  <p className="text-xs font-bold text-primary">Quote Summary:</p>
                  <p className="text-xs text-dark/80">Customer: <strong>{quote.customer?.name}</strong></p>
                  <p className="text-xs text-dark/80">Project: <strong>{quote.project || quote.cover?.titleLine1}</strong></p>
                  <p className="text-xs font-mono font-bold text-primary">Amount: {quote.amount}</p>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-dark">
                    Your Full Name (Signatory) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={signerName}
                    onChange={(e) => setSignerName(e.target.value)}
                    placeholder="e.g. Bjorn Valk"
                    className="w-full px-3.5 py-2.5 bg-white border border-[#C4BEB3] rounded-xl text-sm text-dark font-body focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="flex items-start gap-2.5 pt-1">
                  <input
                    type="checkbox"
                    id="terms"
                    required
                    checked={agreedTerms}
                    onChange={(e) => setAgreedTerms(e.target.checked)}
                    className="mt-1 w-4 h-4 text-primary rounded border-[#C4BEB3] focus:ring-primary cursor-pointer"
                  />
                  <label htmlFor="terms" className="text-xs text-dark/80 cursor-pointer leading-relaxed">
                    I agree with this quote (<strong>{quote.id}</strong>) and the general terms and conditions of Vanuit Ambacht. I confirm that I am the authorized client.
                  </label>
                </div>

                <div className="p-3 bg-[#3E4E36]/10 border border-[#3E4E36]/20 rounded-xl text-[10px] text-dark/70 font-mono space-y-0.5">
                  <p>🔒 Secure audit-trail log:</p>
                  <p>• Date &amp; Timestamp activated</p>
                  <p>• E-mail notification to info@vanuitambacht.nl</p>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-[#C4BEB3]">
                  <button
                    type="button"
                    onClick={() => setShowApprovalModal(false)}
                    className="px-4 py-2 bg-dark/10 text-dark text-xs font-bold rounded-xl hover:bg-dark/20 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!signerName.trim() || !agreedTerms || isSubmitting}
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold font-heading rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>{isSubmitting ? 'Signing...' : 'Confirm & Sign'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================= */}
      {/* DIGITAL DECLINE / REJECT MODAL                            */}
      {/* ========================================================= */}
      <AnimatePresence>
        {showRejectModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/75 backdrop-blur-xs"
              onClick={() => setShowRejectModal(false)}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-lg bg-[#FDFBF7] border border-[#C4BEB3] rounded-2xl p-6 shadow-2xl z-10 space-y-5"
            >
              <div className="flex justify-between items-start border-b border-[#C4BEB3] pb-3">
                <div className="flex items-center gap-2">
                  <ThumbsDown className="w-5 h-5 text-red-600" />
                  <div>
                    <h3 className="font-heading font-bold text-lg text-primary">
                      {language === 'EN' ? 'Decline Proposal' : 'Offerte Afwijzen'}
                    </h3>
                    <p className="text-[11px] text-dark/60 font-mono">Quote {quote.id}</p>
                  </div>
                </div>
                <button onClick={() => setShowRejectModal(false)} className="p-1 text-dark/40 hover:text-dark">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleRejectSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-dark">
                    {language === 'EN' ? 'Reason for decline' : 'Reden van afwijzing'} <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder={language === 'EN' ? 'e.g. Budget constraints, chose alternative layout...' : 'bijv. Budget past niet, andere maatvoering gewenst...'}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#C4BEB3] rounded-xl text-xs text-dark font-body focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-dark">
                    {language === 'EN' ? 'Requested modifications (optional)' : 'Gewenste aanpassingen (optioneel)'}
                  </label>
                  <textarea
                    rows={2}
                    value={rejectChanges}
                    onChange={(e) => setRejectChanges(e.target.value)}
                    placeholder={language === 'EN' ? 'What can we adjust for you?' : 'Wat kunnen we eventueel aanpassen?'}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#C4BEB3] rounded-xl text-xs text-dark font-body focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-[#C4BEB3]">
                  <button
                    type="button"
                    onClick={() => setShowRejectModal(false)}
                    className="px-4 py-2 bg-dark/10 text-dark text-xs font-bold rounded-xl hover:bg-dark/20 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!rejectReason.trim() || isSubmitting}
                    className="px-6 py-2.5 bg-red-700 hover:bg-red-600 disabled:opacity-50 text-white text-xs font-bold font-heading rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                    <span>{isSubmitting ? 'Sending...' : (language === 'EN' ? 'Confirm Decline' : 'Afwijzing Bevestigen')}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 100% CLEAN PDF PRINT PORTAL ATTACHED DIRECTLY TO DOCUMENT BODY */}
      {quote && createPortal(
        <div id="printable-offerte-portal">
          <Offerte6PagePDF quote={quote} />
        </div>,
        document.body
      )}
    </div>
  );
}
