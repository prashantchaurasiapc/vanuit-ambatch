import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Mail, ShieldAlert, X, CheckCircle, AlertTriangle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

/**
 * CommunicationConfirmModal Component
 * Enforces Strict No-Auto-Communication Policy.
 * Shows an explicit preview dialog before firing WhatsApp or Email action.
 */
export default function CommunicationConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  type = 'whatsapp', // 'whatsapp' | 'email'
  recipientName = 'Klant',
  recipientContact = '',
  messageText = '',
  subject = ''
}) {
  const { language } = useLanguage();
  if (!isOpen) return null;

  const isWhatsApp = type === 'whatsapp';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-dark/75 backdrop-blur-xs"
          onClick={onClose}
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-lg bg-[#FDFBF7] border border-[#C4BEB3] rounded-2xl p-6 shadow-2xl z-10 space-y-4 font-body"
        >
          {/* Modal Header */}
          <div className="flex justify-between items-start border-b border-[#C4BEB3]/70 pb-3">
            <div className="flex items-center gap-2.5">
              <div className={`p-2 rounded-xl text-white ${isWhatsApp ? 'bg-[#25D366]' : 'bg-[#3E4E36]'}`}>
                {isWhatsApp ? <MessageCircle className="w-5 h-5" /> : <Mail className="w-5 h-5" />}
              </div>
              <div>
                <h3 className="font-heading font-bold text-base text-primary">
                  {isWhatsApp
                    ? (language === 'EN' ? 'Confirm WhatsApp Message' : 'Bevestig WhatsApp Bericht')
                    : (language === 'EN' ? 'Confirm E-mail Message' : 'Bevestig E-mail Bericht')}
                </h3>
                <p className="text-[11px] font-mono text-dark/60">
                  {language === 'EN' ? 'User-Initiated Action Required' : 'Handmatige Actie Vereist (Geen Auto-Send)'}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1 text-dark/40 hover:text-dark hover:bg-dark/10 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Strict Policy Banner */}
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong className="font-bold block">
                {language === 'EN' ? 'Policy: No Automatic Background Communication' : 'Beleid: Geen Automatische Berichten op Achtergrond'}
              </strong>
              <span>
                {language === 'EN'
                  ? 'System will only proceed after your explicit confirmation below.'
                  : 'Het systeem stuurt nooit automatisch berichten. Dit bericht wordt pas verzonden na uw bevestiging.'}
              </span>
            </div>
          </div>

          {/* Recipient Info */}
          <div className="p-3.5 bg-[#EDE8DF] rounded-xl border border-[#C4BEB3]/70 space-y-1 text-xs">
            <div className="flex justify-between items-center text-dark/70">
              <span className="font-mono uppercase font-bold text-[10px]">
                {language === 'EN' ? 'RECIPIENT' : 'ONTVANGER'}
              </span>
              <span className="font-bold text-primary">{recipientName}</span>
            </div>
            <div className="flex justify-between items-center text-dark/70">
              <span className="font-mono uppercase font-bold text-[10px]">
                {isWhatsApp ? (language === 'EN' ? 'PHONE' : 'TELEFOON') : 'E-MAIL'}
              </span>
              <span className="font-mono font-bold text-dark">{recipientContact || '—'}</span>
            </div>
            {!isWhatsApp && subject && (
              <div className="flex justify-between items-center text-dark/70 pt-1 border-t border-[#C4BEB3]/50">
                <span className="font-mono uppercase font-bold text-[10px]">ONDERWERP</span>
                <span className="font-semibold text-dark truncate max-w-[260px]">{subject}</span>
              </div>
            )}
          </div>

          {/* Message Preview Textbox */}
          <div className="space-y-1">
            <label className="block text-[10px] font-mono font-bold uppercase text-dark/60 tracking-wider">
              {language === 'EN' ? 'MESSAGE PREVIEW:' : 'BERICHT INHOUD PREVIEW:'}
            </label>
            <div className="p-3 bg-white border border-[#C4BEB3] rounded-xl text-xs font-body text-dark/90 max-h-36 overflow-y-auto leading-relaxed shadow-inner whitespace-pre-wrap">
              {messageText || (language === 'EN' ? '(No message text entered)' : '(Geen berichttekst in te voeren)')}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end items-center gap-2.5 pt-3 border-t border-[#C4BEB3]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-dark/10 hover:bg-dark/20 text-dark text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              {language === 'EN' ? 'Cancel' : 'Annuleren'}
            </button>
            <button
              type="button"
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={`px-5 py-2.5 text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer ${
                isWhatsApp ? 'bg-[#25D366] hover:bg-[#20bd5a]' : 'bg-[#3E4E36] hover:bg-[#2F3C29]'
              }`}
            >
              <CheckCircle className="w-4 h-4" />
              <span>
                {isWhatsApp
                  ? (language === 'EN' ? 'Confirm & Open WhatsApp' : 'Bevestigen & WhatsApp Openen')
                  : (language === 'EN' ? 'Confirm & Send E-mail' : 'Bevestigen & E-mail Versturen')}
              </span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
