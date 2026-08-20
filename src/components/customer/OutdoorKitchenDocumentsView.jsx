import React, { useState } from 'react';
import { MessageSquare, Sparkles, Download, Eye, FileText, CheckCircle2, Lock } from 'lucide-react';
import { downloadDirectPdfFile } from '../../utils/pdfGenerator';

/**
 * OutdoorKitchenDocumentsView Component (1-to-1 implementation of Client Mockup PDF Outdoor Kitchen Screen 6 & Screenshot 2)
 * 
 * Features:
 * - Top Header Tag Bar (Custom Outdoor Kitchen — project 2026-014, Updates 3, WhatsApp us)
 * - Page Title & Subtitle (Documents)
 * - 9 Document Items (Offerte OF-2026325, Opdrachtbevestiging, Werktekening v2, Factuur 1e 50% [Nieuw], Algemene voorwaarden, Onderhoudsgids hout & bovenblad, Factuur 2e 50%, Garantiebewijs, Opleverbevestiging)
 * - Interactive View PDF Modal & Download PDF Actions
 */
export default function OutdoorKitchenDocumentsView({ project = null }) {
  const [feedbackToast, setFeedbackToast] = useState('');
  const [activePdfPreview, setActivePdfPreview] = useState(null);

  const projectCode = project?.id || '2026-014';

  const handleDownload = (docName) => {
    downloadDirectPdfFile(docName);
    setFeedbackToast(`Downloaded ${docName} successfully!`);
    setTimeout(() => setFeedbackToast(''), 3500);
  };

  const handleView = (docTitle) => {
    setActivePdfPreview(docTitle);
  };

  const documentsList = [
    {
      id: 1,
      tag: 'OFFERTE',
      title: 'Quote OF-2026325',
      desc: '21 July 2026 · including your digital approval',
      status: 'available',
      fileKey: 'quote-outdoor-kitchen'
    },
    {
      id: 2,
      tag: 'CONTRACT',
      title: 'Order confirmation',
      desc: '11 August 2026 · approved by Sander de Vries at 20:14',
      status: 'available',
      fileKey: 'contract-outdoor-kitchen'
    },
    {
      id: 3,
      tag: 'DRAWING',
      title: 'Working drawing version 2',
      desc: '12 August 2026 · for review — this is how your kitchen will be built',
      status: 'available',
      fileKey: 'working-drawing-outdoor-kitchen'
    },
    {
      id: 4,
      tag: 'INVOICE',
      title: 'Invoice 1st term (50%)',
      desc: '11 August 2026 · € 1,960.00 · paid on 12 August 2026',
      isNew: true,
      status: 'available',
      fileKey: 'invoice-outdoor-kitchen-term-1'
    },
    {
      id: 5,
      tag: 'TERMS',
      title: 'General terms & conditions',
      desc: 'Version 2026 · part of your signed order agreement',
      status: 'available',
      fileKey: 'terms-and-conditions'
    },
    {
      id: 6,
      tag: 'MANUAL',
      title: 'Timber & worktop maintenance guide',
      desc: 'How to keep your outdoor kitchen beautiful for 20 years · 4 pages',
      status: 'available',
      fileKey: 'maintenance-guide-timber-worktop'
    },
    {
      id: 7,
      tag: 'INVOICE',
      title: 'Invoice 2nd term (50%)',
      desc: 'Available upon delivery',
      status: 'disabled'
    },
    {
      id: 8,
      tag: 'WARRANTY',
      title: 'Warranty certificate',
      desc: 'Available once your kitchen is delivered',
      status: 'disabled'
    },
    {
      id: 9,
      tag: 'HANDOVER',
      title: 'Delivery confirmation',
      desc: 'We complete this together upon delivery',
      status: 'disabled'
    }
  ];

  return (
    <div className="space-y-6 font-body text-[#4A4A43] max-w-5xl w-full mx-auto">
      {/* Toast Notification */}
      {feedbackToast && (
        <div className="fixed top-20 right-4 z-[9999] flex items-center gap-2 bg-primary text-cream px-4 py-3 rounded-xl shadow-xl border border-primary/20 text-xs font-medium">
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>{feedbackToast}</span>
        </div>
      )}

      {/* 1. TOP HEADER TAG BAR (1-to-1 Client Mockup Screenshot 2) */}
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
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-heading font-bold text-primary">
          Documents
        </h1>
        <p className="text-xs sm:text-sm text-dark/70 font-medium">
          Everything belonging to your project, in one place. Downloads are always permitted — it also stays here.
        </p>
      </div>

      {/* 3. DOCUMENTS LIST CONTAINER CARD (1-to-1 Screenshot 2) */}
      <div className="bg-[#FAF8F5] border border-[#D8D2C5] p-4 sm:p-6 rounded-2xl shadow-xs space-y-3">
        <div className="divide-y divide-[#D6CFC2]/50">
          {documentsList.map((doc) => {
            const isAvailable = doc.status === 'available';

            return (
              <div key={doc.id} className="py-3.5 first:pt-0 last:pb-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                {/* Left Side: Tag + Title + Description */}
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  {/* Category Tag Pill */}
                  <span className="bg-[#EDE9E3] text-[#70624F] font-mono text-[10px] font-bold uppercase px-2.5 py-1 rounded-md flex-shrink-0 tracking-wider">
                    {doc.tag}
                  </span>

                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className={`font-heading font-bold text-sm sm:text-base ${
                        isAvailable ? 'text-primary' : 'text-dark/50'
                      }`}>
                        {doc.title}
                      </h4>

                      {doc.isNew && (
                        <span className="bg-[#D7E3EC] text-[#2B4B68] text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border border-[#B8D0E0]">
                          • New
                        </span>
                      )}
                    </div>

                    <p className={`text-xs sm:text-[13px] leading-relaxed font-medium ${
                      isAvailable ? 'text-dark/70' : 'text-dark/40 italic'
                    }`}>
                      {doc.desc}
                    </p>
                  </div>
                </div>

                {/* Right Side: Action Buttons */}
                <div className="flex items-center gap-2 flex-shrink-0 w-full sm:w-auto justify-end pt-1 sm:pt-0">
                  {isAvailable ? (
                    <>
                      <button
                        type="button"
                        onClick={() => handleView(doc.title)}
                        className="px-3.5 py-1.5 bg-white text-dark/80 border border-[#D6CFC2] text-xs font-bold rounded-xl hover:bg-gray-50 transition-all cursor-pointer shadow-2xs flex items-center gap-1.5"
                      >
                        <Eye className="w-3.5 h-3.5 text-accent" />
                        <span>View</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDownload(doc.fileKey || doc.title)}
                        className="px-3.5 py-1.5 bg-[#2B3827] text-white text-xs font-bold rounded-xl hover:bg-[#1F291C] transition-all cursor-pointer shadow-xs flex items-center gap-1.5"
                      >
                        <Download className="w-3.5 h-3.5 text-cream" />
                        <span>Download</span>
                      </button>
                    </>
                  ) : (
                    <span className="bg-gray-100 text-gray-400 font-mono text-[11px] font-bold px-3 py-1.5 rounded-xl border border-gray-200 flex items-center gap-1">
                      <Lock className="w-3 h-3 text-gray-400" />
                      <span>Not yet available</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* PDF PREVIEW MODAL */}
      {activePdfPreview && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-dark/80 backdrop-blur-xs">
          <div className="bg-[#FAF8F5] border border-[#D8D2C5] p-6 rounded-2xl max-w-xl w-full space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-[#D6CFC2] pb-3">
              <h3 className="font-heading font-bold text-primary text-lg">
                {activePdfPreview}
              </h3>
              <button
                type="button"
                onClick={() => setActivePdfPreview(null)}
                className="text-dark/40 hover:text-dark text-xs font-bold font-mono px-2 py-1 bg-white border border-[#D6CFC2] rounded-lg cursor-pointer"
              >
                Close ✕
              </button>
            </div>

            <div className="bg-white border border-[#D6CFC2] p-6 rounded-xl space-y-3 text-center">
              <FileText className="w-12 h-12 text-primary mx-auto" />
              <div className="text-sm font-bold text-primary">{activePdfPreview}</div>
              <p className="text-xs text-dark/70">
                Official document preview. All specifications and terms are verified.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  handleDownload(activePdfPreview);
                  setActivePdfPreview(null);
                }}
                className="px-4 py-2 bg-[#2B3827] text-white text-xs font-bold rounded-xl shadow-xs hover:bg-[#1F291C]"
              >
                Download PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
