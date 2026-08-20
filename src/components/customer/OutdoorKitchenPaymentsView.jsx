import React, { useState } from 'react';
import { MessageSquare, Sparkles, Check, CreditCard, ShieldCheck, Download, FileText, Lock } from 'lucide-react';
import { downloadDirectPdfFile } from '../../utils/pdfGenerator';

/**
 * OutdoorKitchenPaymentsView Component (1-to-1 implementation of Client Mockup PDF Outdoor Kitchen Screen 7 & Screenshot 1)
 * 
 * Compact Proportions (Width & Button Sizing matching Screenshot 1 1-to-1):
 * - Main container width max-w-4xl (clean & non-stretched)
 * - Compact auto-width action buttons (View invoice / WhatsApp us) matching Screenshot 1 1-to-1
 * - Card padding p-4 sm:p-4.5
 */
export default function OutdoorKitchenPaymentsView({ project = null }) {
  const [feedbackToast, setFeedbackToast] = useState('');
  const [activePdfPreview, setActivePdfPreview] = useState(null);

  const projectCode = project?.id || '2026-014';

  const handleViewInvoice = (invoiceName) => {
    setActivePdfPreview(invoiceName);
  };

  const handleDownloadInvoice = (invoiceName) => {
    downloadDirectPdfFile(invoiceName);
    setFeedbackToast(`Downloaded ${invoiceName} successfully!`);
    setTimeout(() => setFeedbackToast(''), 3500);
  };

  return (
    <div className="space-y-4 font-body text-[#4A4A43] max-w-4xl w-full mx-auto">
      {/* Toast Notification */}
      {feedbackToast && (
        <div className="fixed top-20 right-4 z-[9999] flex items-center gap-2 bg-primary text-cream px-4 py-3 rounded-xl shadow-xl border border-primary/20 text-xs font-medium">
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>{feedbackToast}</span>
        </div>
      )}

      {/* 1. TOP HEADER TAG BAR (1-to-1 Client Mockup Screenshot 1) */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-dark/60">
        <span className="bg-primary/10 text-primary px-2.5 py-0.5 rounded-md font-bold">
          Custom Outdoor Kitchen — project {projectCode}
        </span>
        <div className="flex items-center gap-2">
          <span className="bg-cream border border-[#D6CFC2] px-2 py-0.5 rounded-md font-bold text-[11px]">
            Updates 3
          </span>
          <a
            href="https://wa.me/31682008025"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-primary text-cream px-3 py-1 rounded-xl text-xs font-bold hover:bg-primary/90 transition-all flex items-center gap-1 shadow-xs"
          >
            <MessageSquare className="w-3.5 h-3.5 text-accent" />
            <span>WhatsApp us</span>
          </a>
        </div>
      </div>

      {/* 2. PAGE TITLE & SUBTITLE */}
      <div className="space-y-0.5">
        <h1 className="text-xl sm:text-2xl font-heading font-bold text-primary">
          Payments
        </h1>
        <p className="text-xs text-dark/70 font-medium">
          Two instalments, no surprises. You never pay in advance for work that has not started yet.
        </p>
      </div>

      {/* 3. CARD 1: PAYMENT SUMMARY HEADER BOX (50% Paid, 50% Remaining - Compact Padding p-4 sm:p-4.5) */}
      <div className="bg-[#FAF8F5] border border-[#D8D2C5] p-4 sm:p-4.5 rounded-2xl shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          
          {/* Total */}
          <div className="space-y-0.5">
            <span className="text-[10px] sm:text-[11px] uppercase font-mono font-bold tracking-wider text-accent block">
              TOTAL
            </span>
            <div className="text-lg sm:text-xl font-heading font-bold text-primary">
              € 3.920,00
            </div>
            <span className="text-[11px] text-dark/60 font-medium">incl. VAT</span>
          </div>

          {/* Paid */}
          <div className="space-y-0.5">
            <span className="text-[10px] sm:text-[11px] uppercase font-mono font-bold tracking-wider text-accent block">
              PAID
            </span>
            <div className="text-lg sm:text-xl font-heading font-bold text-[#2D5A27]">
              € 1.960,00
            </div>
            <span className="text-[11px] text-dark/60 font-medium">on 12 August 2026</span>
          </div>

          {/* Remaining */}
          <div className="space-y-0.5">
            <span className="text-[10px] sm:text-[11px] uppercase font-mono font-bold tracking-wider text-accent block">
              REMAINING TO PAY
            </span>
            <div className="text-lg sm:text-xl font-heading font-bold text-primary">
              € 1.960,00
            </div>
            <span className="text-[11px] text-dark/60 font-medium">upon delivery</span>
          </div>

        </div>

        {/* 50% Progress Bar (Matching Screenshot 1 1-to-1) */}
        <div className="space-y-1 pt-0.5">
          <div className="w-full bg-[#EAE6DD] h-2 rounded-full overflow-hidden border border-[#D6CFC2]/60">
            <div className="bg-[#2B3827] h-full rounded-full transition-all duration-700" style={{ width: '50%' }} />
          </div>
        </div>
      </div>

      {/* 4. INSTALMENT CARDS GRID (2 Cards for 50% / 50% - Compact Width Buttons 1-to-1 Screenshot 1) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        
        {/* Term 1: 50% upon agreement (PAID) */}
        <div className="bg-[#FAF8F5] border border-[#D8D2C5] p-4 sm:p-4.5 rounded-2xl shadow-xs space-y-2.5 flex flex-col justify-between items-start">
          <div className="space-y-1.5 w-full">
            <div className="flex justify-between items-center gap-2">
              <span className="text-xs sm:text-xs font-heading font-bold text-primary">
                1st term · 50% upon agreement
              </span>
              <span className="bg-[#E5F0E3] text-[#2D5A27] text-[10px] font-mono font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                <Check className="w-3 h-3 text-[#2D5A27]" />
                <span>Paid</span>
              </span>
            </div>

            <div className="text-lg sm:text-xl font-heading font-bold text-primary">
              € 1.960,00
            </div>

            <p className="text-xs text-dark/70 leading-relaxed font-medium">
              Received on 12 August 2026. Order dispatched to craftsman.
            </p>
          </div>

          <div className="pt-1">
            <button
              type="button"
              onClick={() => handleViewInvoice('Factuur 1e termijn (50%) - € 1.960,00')}
              className="px-4 py-1.5 bg-white text-dark/80 border border-[#D6CFC2] text-xs font-bold rounded-xl hover:bg-gray-50 transition-all cursor-pointer shadow-2xs inline-block"
            >
              View invoice
            </button>
          </div>
        </div>

        {/* Term 2: 50% upon delivery */}
        <div className="bg-[#FAF8F5] border border-[#D8D2C5] p-4 sm:p-4.5 rounded-2xl shadow-xs space-y-2.5 flex flex-col justify-between items-start">
          <div className="space-y-1.5 w-full">
            <div className="flex justify-between items-center gap-2">
              <span className="text-xs sm:text-xs font-heading font-bold text-primary">
                2nd term · 50% upon delivery
              </span>
              <span className="bg-gray-100 text-gray-500 text-[10px] font-mono font-bold px-2 py-0.5 rounded-md">
                Upcoming upon delivery
              </span>
            </div>

            <div className="text-lg sm:text-xl font-heading font-bold text-primary">
              € 1.960,00
            </div>

            <p className="text-xs text-dark/70 leading-relaxed font-medium">
              You will receive the invoice on delivery day. Payment via iDEAL or bank transfer within 14 days.
            </p>
          </div>

          <div className="pt-1">
            <button
              type="button"
              disabled
              className="px-4 py-1.5 bg-gray-100 text-gray-400 border border-gray-200 text-xs font-bold rounded-xl cursor-not-allowed inline-block"
            >
              Pay now (iDEAL)
            </button>
          </div>
        </div>

      </div>

      {/* 5. BOTTOM ROW CARDS (Bank Transfer & Contact - Compact Width 1-to-1 Screenshot 1) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Bank Transfer Card (2 Columns wide) */}
        <div className="md:col-span-2 bg-[#FAF8F5] border border-[#D8D2C5] p-4 sm:p-4.5 rounded-2xl shadow-xs space-y-2.5">
          <h4 className="font-heading font-bold text-primary text-xs sm:text-sm">
            Prefer bank transfer?
          </h4>
          <p className="text-xs text-dark/70 leading-relaxed font-medium">
            Sure. Use the invoice number as reference, then we can process it properly.
          </p>

          <div className="bg-[#EAE6DD] border border-[#C8C2B4] rounded-xl p-3 font-mono text-xs text-dark space-y-0.5 shadow-2xs font-medium max-w-md">
            <div>IBAN NL27 ABNA 0132 2698 56</div>
            <div>t.n.v. Vanuit Ambacht · Vleuten</div>
          </div>
        </div>

        {/* Invoice Question Contact Card (1 Column wide) */}
        <div className="bg-[#EBF1E9] border border-[#BACBB7] p-4 sm:p-4.5 rounded-2xl shadow-xs space-y-2.5 flex flex-col justify-between items-start">
          <div className="space-y-1.5">
            <div className="flex items-center gap-1 text-primary font-heading font-bold text-xs sm:text-sm">
              <Check className="w-3.5 h-3.5 text-primary" />
              <span>Question about an invoice?</span>
            </div>
            <p className="text-xs text-dark/70 leading-relaxed font-medium">
              Text or call us — we look it up right away. No forms to fill out.
            </p>
          </div>

          <a
            href="https://wa.me/31682008025"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-1.5 bg-white text-dark/80 border border-[#D6CFC2] text-xs font-bold rounded-xl hover:bg-gray-50 transition-all cursor-pointer shadow-2xs inline-flex items-center gap-1.5"
          >
            <MessageSquare className="w-3.5 h-3.5 text-primary" />
            <span>WhatsApp us</span>
          </a>
        </div>

      </div>

      {/* PDF INVOICE PREVIEW MODAL */}
      {activePdfPreview && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-dark/80 backdrop-blur-xs">
          <div className="bg-[#FAF8F5] border border-[#D8D2C5] p-5 rounded-2xl max-w-lg w-full space-y-3 shadow-2xl">
            <div className="flex justify-between items-center border-b border-[#D6CFC2] pb-2">
              <h3 className="font-heading font-bold text-primary text-base">
                {activePdfPreview}
              </h3>
              <button
                type="button"
                onClick={() => setActivePdfPreview(null)}
                className="text-dark/40 hover:text-dark text-xs font-bold font-mono px-2 py-0.5 bg-white border border-[#D6CFC2] rounded-lg cursor-pointer"
              >
                Close ✕
              </button>
            </div>

            <div className="bg-white border border-[#D6CFC2] p-4 rounded-xl space-y-1.5 text-center">
              <FileText className="w-9 h-9 text-primary mx-auto" />
              <div className="text-xs font-bold text-primary">{activePdfPreview}</div>
              <p className="text-xs text-dark/70">
                Official paid term invoice for project {projectCode}.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  handleDownloadInvoice(activePdfPreview);
                  setActivePdfPreview(null);
                }}
                className="px-4 py-2 bg-[#2B3827] text-white text-xs font-bold rounded-xl shadow-xs hover:bg-[#1F291C]"
              >
                Download Invoice (PDF)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
