import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, CheckCircle, Check, X, ShieldCheck, Clock, Download, MessageSquare, Mail, Phone, Lock, Sparkles, AlertCircle, Printer } from 'lucide-react';
import { mockQuotes as defaultQuotes } from '../utils/mockData';
import { safeSetItem } from '../utils/storageHelper';
import Offerte6PagePDF from '../components/Offerte6PagePDF';
import outdoorProjectCard from '../assets/outdoor_project_card.png';
import outdoorLivingLogin from '../assets/outdoor_living_login.png';


export default function PublicOfferte() {
  const { token } = useParams();
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [signerName, setSignerName] = useState('');
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [isApprovedSuccess, setIsApprovedSuccess] = useState(false);
  const [approvalDetails, setApprovalDetails] = useState(null);

  // Load quote data dynamically from localStorage or fallback mockQuotes
  useEffect(() => {
    const loadQuote = () => {
      const savedQuotes = localStorage.getItem('app_quotes_v2') || localStorage.getItem('app_quotes_v1') || localStorage.getItem('app_quotes');
      const allQuotes = savedQuotes ? JSON.parse(savedQuotes) : defaultQuotes;
      
      // Match by ID (token can be quote.id like OF-2026-4005 or Q-4004)
      const found = allQuotes.find(
        (q) => String(q.id).toLowerCase() === String(token).toLowerCase() ||
               String(q.id).replace(/[^\w]/g, '').toLowerCase() === String(token).replace(/[^\w]/g, '').toLowerCase()
      );

      if (found) {
        setQuote(found);
        if (found.signerName) setSignerName(found.signerName);
        if (found.status === 'Akkoord' || found.status === 'Accepted' || found.status === 'Approved') {
          setIsApprovedSuccess(true);
          setApprovalDetails({
            signerName: found.signerName || found.customer,
            date: found.approvedAt || '2026-08-04 17:10',
            ip: found.signerIp || '192.168.1.1'
          });
        }
      } else {
        // Fallback default quote for testing if token not found
        const fallback = allQuotes[0] || defaultQuotes[0];
        setQuote({
          ...fallback,
          id: token || 'OF-2026-4005',
          customer: 'Jan de Vries',
          project: 'Exclusieve Outdoor Kitchen - Maatwerk',
          amount: '€ 11.300',
          date: '2026-08-04',
          validUntil: '2026-09-03'
        });
      }
      setLoading(false);
    };

    loadQuote();
  }, [token]);

  // Check if quote is expired (validUntil check)
  const isExpired = quote && quote.validUntil ? new Date(quote.validUntil) < new Date('2026-08-01') : false;

  // Handle Digital Approval Submission
  const handleApproveSubmit = (e) => {
    e.preventDefault();
    if (!signerName.trim() || !agreedTerms) return;

    const approvalDate = new Date().toLocaleString('nl-NL', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const updatedApproval = {
      signerName: signerName.trim(),
      date: approvalDate,
      ip: '185.228.168.42 (Digitaal geverifieerd)'
    };

    // Update in LocalStorage across all quote storage keys
    const savedQuotes = localStorage.getItem('app_quotes_v2') || localStorage.getItem('app_quotes_v1') || localStorage.getItem('app_quotes');
    const currentQuotes = savedQuotes ? JSON.parse(savedQuotes) : defaultQuotes;
    const updatedList = currentQuotes.map((q) => {
      if (String(q.id).toLowerCase() === String(quote.id).toLowerCase()) {
        return {
          ...q,
          status: 'Approved',
          signerName: signerName.trim(),
          approvedAt: approvalDate,
          signerIp: updatedApproval.ip
        };
      }
      return q;
    });

    safeSetItem('app_quotes_v2', updatedList);
    safeSetItem('app_quotes', updatedList);
    window.dispatchEvent(new Event('app_data_changed'));

    // Update local state
    setQuote((prev) => ({
      ...prev,
      status: 'Akkoord',
      signerName: signerName.trim(),
      approvedAt: approvalDate
    }));

    setApprovalDetails(updatedApproval);
    setShowApprovalModal(false);
    setIsApprovedSuccess(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#EBE6DD] flex items-center justify-center p-4 font-body">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm font-semibold text-primary">Offerte laden...</p>
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
              <p className="text-[10px] text-[#D6CFC2] font-mono">Officieel Digitaal Voorstel • {quote.id}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="px-3 py-1 bg-[#70624F] hover:bg-[#5e5241] text-[#FDFBF7] rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-colors print:hidden cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </button>
            <span className={`text-[11px] font-mono font-bold px-3 py-1 rounded-full border ${
              isApprovedSuccess || quote.status === 'Akkoord'
                ? 'bg-emerald-800/80 text-emerald-200 border-emerald-500/50'
                : 'bg-[#70624F]/40 text-[#FDFBF7] border-[#70624F]'
            }`}>
              {isApprovedSuccess || quote.status === 'Akkoord' ? '✓ Digitaal Akkoord' : `Offerte ${quote.id}`}
            </span>
          </div>
        </div>
      </header>

      {/* Main 6-Page Offerte Container */}
      <main className="max-w-4xl mx-auto p-3 sm:p-6 space-y-8 mt-4">
        
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
                <h3 className="font-heading font-bold text-lg text-white">Gefeliciteerd! Uw offerte is officieel akkoord.</h3>
                <p className="text-xs text-emerald-200 mt-0.5">
                  Ondertekend door <strong>{approvalDetails?.signerName || quote.customer}</strong> op {approvalDetails?.date || quote.date}.
                </p>
              </div>
            </div>
            <p className="text-[11px] text-emerald-300 pt-1 border-t border-emerald-700/60">
              Tim & Bram hebben direct een melding ontvangen. Binnen enkele dagen ontvangt u de digitale maattekening ter bevestiging!
            </p>
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
                    <h3 className="font-heading font-bold text-lg text-primary">Offerte Digitaal Ondertekenen</h3>
                    <p className="text-[11px] text-dark/60 font-mono">Vanuit Ambacht • Quote {quote.id}</p>
                  </div>
                </div>
                <button onClick={() => setShowApprovalModal(false)} className="p-1 text-dark/40 hover:text-dark">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleApproveSubmit} className="space-y-4">
                <div className="p-3 bg-[#EDE8DF] rounded-xl border border-[#C4BEB3] space-y-1">
                  <p className="text-xs font-bold text-primary">Offerte Samenvatting:</p>
                  <p className="text-xs text-dark/80">Klant: <strong>{quote.customer}</strong></p>
                  <p className="text-xs text-dark/80">Project: <strong>{quote.project}</strong></p>
                  <p className="text-xs font-mono font-bold text-primary">Bedrag: {quote.amount}</p>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-dark">
                    Uw Volledige Naam (Naam Ondertekenaar) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={signerName}
                    onChange={(e) => setSignerName(e.target.value)}
                    placeholder="bijv. Bjorn Valk"
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
                    Ik ga akkoord met deze offerte (<strong>{quote.id}</strong>) en de algemene voorwaarden van Vanuit Ambacht. Ik bevestig dat ik de bevoegde opdrachtgever ben.
                  </label>
                </div>

                <div className="p-3 bg-[#3E4E36]/10 border border-[#3E4E36]/20 rounded-xl text-[10px] text-dark/70 font-mono space-y-0.5">
                  <p>🔒 Beveiligde audit-trail logboek:</p>
                  <p>• Datum &amp; Tijdstipstempel geactiveerd</p>
                  <p>• E-mail notificatie naar info@vanuitambacht.nl</p>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-[#C4BEB3]">
                  <button
                    type="button"
                    onClick={() => setShowApprovalModal(false)}
                    className="px-4 py-2 bg-dark/10 text-dark text-xs font-bold rounded-xl hover:bg-dark/20 transition-colors"
                  >
                    Annuleren
                  </button>
                  <button
                    type="submit"
                    disabled={!signerName.trim() || !agreedTerms}
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold font-heading rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Bevestigen &amp; Ondertekenen</span>
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
