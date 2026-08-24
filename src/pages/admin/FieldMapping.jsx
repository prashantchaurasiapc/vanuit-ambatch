import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';

export default function FieldMapping({ onBackToOverview }) {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const isEn = language !== 'NL';
  const [toastMsg, setToastMsg] = useState('');

  const [newProjectModal, setNewProjectModal] = useState(false);
  const [newProjectClient, setNewProjectClient] = useState('');
  const [newProjectType, setNewProjectType] = useState(isEn ? 'Garden Room' : 'Buitenverblijf');
  const [newProjectBudget, setNewProjectBudget] = useState('€ 25,000.00');

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3500);
  };

  const handleCreateNewProject = (e) => {
    e.preventDefault();
    if (!newProjectClient.trim()) return;
    setNewProjectModal(false);
    showToast(isEn ? `✓ New project for "${newProjectClient}" successfully created!` : `✓ Nieuw project voor "${newProjectClient}" succesvol aangemaakt!`);
  };

  // 13 Field Mapping rows matching Client Specification Matrix
  const mappingRows = isEn ? [
    {
      field: 'Phase (Fase)',
      customer: 'Phase progress bar + Customer timeline',
      partner: 'Work order status badge',
      trigger: '1 single notification on phase transition'
    },
    {
      field: 'Status Texts (Current / Next step)',
      customer: 'Status overview card',
      partner: '— (Hidden from partner)',
      trigger: 'Silent background update (No notification)'
    },
    {
      field: 'Delivery Week / Planning (Provisional vs Final)',
      customer: 'Overview, planning, & milestone tiles',
      partner: 'Work order (Construction weeks)',
      trigger: 'When finalized: Notification + .ics calendar event'
    },
    {
      field: 'Delivery / Site Inspection Proposal',
      customer: 'Proposal card with 1-click agreement button',
      partner: 'Scheduled appointment in work order after approval',
      trigger: 'When proposal sent + when customer agrees'
    },
    {
      field: 'Customer Actions',
      customer: 'Action block + status badge',
      partner: '— (Hidden from partner)',
      trigger: 'On creation + automatic reminder on Day 3'
    },
    {
      field: 'Workshop Photos (After publication)',
      customer: 'Photos feed + latest project update card',
      partner: 'Source: Partner upload → Arrives as Draft',
      trigger: 'When Admin publishes (with mandatory customer note)'
    },
    {
      field: 'Technical Drawings / 3D Renders (+ revision note)',
      customer: 'Available for inspection, version history',
      partner: 'Blueprint drawing inside work order',
      trigger: 'On publication, with mandatory revision text'
    },
    {
      field: 'Payment Terms & Status (Source: Bookkeeping)',
      customer: 'Payments tab + installment tile',
      partner: 'Never (Strictly Forbidden)',
      trigger: 'Invoice dispatch + friendly reminder'
    },
    {
      field: 'Partner Payout & Work Description',
      customer: 'Never (Strictly Forbidden)',
      partner: 'Work order specification & contractor amount',
      trigger: 'On work order dispatch / update'
    },
    {
      field: 'Internal Notes / Logbook',
      customer: 'Never (Strictly Forbidden)',
      partner: 'Never (Strictly Forbidden)',
      trigger: '— (Internal Admin audit trail only)'
    },
    {
      field: 'Chat: Customer ↔ Admin',
      customer: 'Messages screen in Customer Portal',
      partner: 'Never directly (Only via "Share with partner", with audit log)',
      trigger: 'Both directions via WhatsApp / Email'
    },
    {
      field: 'Chat: Partner ↔ Admin',
      customer: 'Never (Strictly Forbidden)',
      partner: 'Partner chat + WhatsApp mirror',
      trigger: 'Both directions; Partner photos → Draft Media'
    },
    {
      field: 'Customer Handover Confirmation',
      customer: 'Handover & Aftercare tab',
      partner: 'Work completed signal',
      trigger: 'Creates final task + releases 20% final invoice'
    }
  ] : [
    {
      field: 'Fase',
      customer: 'fasebalk + tijdlijn',
      partner: 'status werkbon',
      trigger: '1 notificatie bij overgang'
    },
    {
      field: 'Statusteksten (nu / hierna)',
      customer: 'statuskaart overzicht',
      partner: '—',
      trigger: 'stil bijwerken'
    },
    {
      field: 'Leverweek / weekplanning + voorlopig-definitief',
      customer: 'overzicht, planning, tegels',
      partner: 'werkbon (bouwweken)',
      trigger: 'bij definitief: notificatie + .ics'
    },
    {
      field: 'Leverings-/schouwvoorstel',
      customer: 'voorstelkaart met akkoordknop',
      partner: 'afspraak in werkbon na akkoord',
      trigger: 'bij versturen + bij akkoord'
    },
    {
      field: 'Klantacties',
      customer: 'actieblok + badge',
      partner: '—',
      trigger: 'bij aanmaken + herinnering dag 3'
    },
    {
      field: 'Foto\'s (na publicatie)',
      customer: 'foto\'s-scherm + laatste update',
      partner: 'bron: partner-upload → concept',
      trigger: 'bij publicatie'
    },
    {
      field: 'Werktekening / renders (+ wijzigingsregel)',
      customer: 'ter inzage, versies',
      partner: 'tekening in werkbon',
      trigger: 'bij publicatie, met wijzigingsregel'
    },
    {
      field: 'Termijnen & betaalstatus (bron: boekhouding)',
      customer: 'betalingen + tegel',
      partner: 'nooit',
      trigger: 'factuur + vriendelijke herinnering'
    },
    {
      field: 'Partnerbedrag & werkomschrijving',
      customer: 'nooit',
      partner: 'werkbon',
      trigger: 'bij werkbon-update'
    },
    {
      field: 'Interne notities / logboek',
      customer: 'nooit',
      partner: 'nooit',
      trigger: '—'
    },
    {
      field: 'Chat klant ↔ ons',
      customer: 'berichten-scherm klantportaal',
      partner: 'nooit rechtstreeks (alleen via "Delen met partner", met logregel)',
      trigger: 'beide richtingen WhatsApp/mail'
    },
    {
      field: 'Chat partner ↔ ons',
      customer: 'nooit',
      partner: 'partnerchat + WhatsApp-spiegel',
      trigger: 'beide richtingen; partnerfoto\'s → Media als concept'
    },
    {
      field: 'Opleverbevestiging klant',
      customer: 'oplevering & nazorg',
      partner: 'gereed-melding',
      trigger: 'maakt taak + (bv) factuur 20% vrij'
    }
  ];

  return (
    <div className="-m-3 sm:-m-4 lg:-m-6 p-4 sm:p-6 lg:p-8 min-h-full bg-[#F4F1EA] text-[#4A4A43] font-body space-y-6 relative w-auto">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 right-6 z-[99999] bg-[#33422C] text-white px-5 py-3.5 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs font-bold border border-white/10"
          >
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            {toastMsg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* TOP PORTAL BREADCRUMB BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs pb-1">
        <div className="flex items-center gap-2">
          {onBackToOverview ? (
            <button
              onClick={onBackToOverview}
              className="p-1.5 px-2.5 bg-[#33422C] hover:bg-[#253120] text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center justify-center cursor-pointer mr-1"
              title={isEn ? "Back to Projects Overview" : "Terug naar Projecten Overzicht"}
            >
              ←
            </button>
          ) : (
            <button
              onClick={() => navigate('/admin/projects')}
              className="p-1.5 px-2.5 bg-[#33422C] hover:bg-[#253120] text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center justify-center cursor-pointer mr-1"
              title={isEn ? "Back to Projects Overview" : "Terug naar Projecten Overzicht"}
            >
              ←
            </button>
          )}
          <span className="font-bold text-[#33422C] font-serif text-sm">
            {isEn ? 'Project Management' : 'Projectenbeheer'}
          </span>
          <span className="text-dark/40">·</span>
          <span className="text-dark/60 font-mono text-[11px]">
            {isEn ? 'admin portal' : 'adminportaal'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => {
              navigate('/admin/projects/inbox-messages');
              showToast(isEn ? 'Project messages opened...' : 'Projectberichten geopend...');
            }}
            className="px-3 py-1 bg-white border border-[#D6CFC2] text-dark/70 rounded-xl font-bold text-xs shadow-2xs hover:bg-[#FAF8F5] cursor-pointer flex items-center gap-1.5 transition-all"
          >
            <span>Inbox</span>
            <strong className="text-[#33422C] bg-[#E3EFE3] px-1.5 py-0.2 rounded font-mono text-[11px]">4</strong>
          </button>

          <button 
            onClick={() => {
              showToast(isEn ? '3 tasks waiting for our review' : '3 taken wachten op onze beoordeling');
            }}
            className="px-3 py-1 bg-[#FDF2E3] text-[#B86B14] border border-[#F6DCB8] rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-2xs cursor-pointer hover:bg-[#FCEAD0] transition-all"
          >
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span>{isEn ? '3 tasks waiting for us' : '3 taken wachten op ons'}</span>
          </button>

          <button 
            onClick={() => setNewProjectModal(true)}
            className="px-4 py-1.5 bg-[#33422C] hover:bg-[#283523] text-white rounded-xl font-bold text-xs cursor-pointer shadow-xs transition-all flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isEn ? 'New Project' : 'Nieuw project'}</span>
          </button>
        </div>
      </div>

      {/* MAIN TITLE & SUBTITLE */}
      <div className="space-y-1">
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#33422C]">
          {isEn ? 'Field Mapping Matrix' : 'Veldenkoppeling'}
        </h1>
        <p className="text-xs sm:text-sm text-dark/60 font-body">
          {isEn 
            ? 'Where each field originates and where it routes. "Customer" = Customer Portal, "Partner" = Work Order / Trello.' 
            : 'Waar elk veld vandaan komt en waar het landt. "Klant" = klantportaal, "Partner" = werkbon/Trello.'}
        </p>
      </div>

      {/* CARD 1: MAIN MAPPINGS TABLE */}
      <div className="bg-[#FAF8F5] border border-[#E6E1D7] rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#D6CFC2] text-[10px] font-mono uppercase text-dark/50 tracking-wider">
                <th className="pb-3 font-bold w-1/4">
                  {isEn ? 'FIELD (SOURCE: ADMIN SCREEN)' : 'VELD (BRON: DIT SCHERM)'}
                </th>
                <th className="pb-3 font-bold w-1/4">
                  {isEn ? 'CUSTOMER PORTAL' : 'KLANT'}
                </th>
                <th className="pb-3 font-bold w-1/4">
                  {isEn ? 'PARTNER PORTAL / WORK ORDER' : 'PARTNER'}
                </th>
                <th className="pb-3 font-bold w-1/4">
                  {isEn ? 'TRIGGER / NOTIFICATION RULE' : 'TRIGGER / NOTIFICATIE'}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E6E1D7]">
              {mappingRows.map((row, idx) => (
                <tr key={idx} className="text-dark/80 font-body hover:bg-white/40 transition-colors">
                  <td className="py-3 font-bold text-[#2A2925] pr-4">{row.field}</td>
                  <td className="py-3 text-dark/80 pr-4">{row.customer}</td>
                  <td className="py-3 text-dark/80 pr-4">{row.partner}</td>
                  <td className="py-3 text-dark/70 font-body">{row.trigger}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CARD 2: TWO STRICT CORE RULES */}
      <div className="bg-[#FAF8F5] border border-[#E6E1D7] rounded-2xl p-5 sm:p-6 shadow-2xs space-y-3">
        <span className="text-[10px] font-mono font-bold text-dark/50 uppercase tracking-wider block">
          {isEn ? 'TWO STRICT HARD RULES (ACCEPTANCE CRITERIA BRIEFING)' : 'TWEE HARDE REGELS (ZELFDE ALS KLANTPORTAAL-BRIEFING)'}
        </span>

        <div className="space-y-2 text-xs font-body text-dark/80 leading-relaxed">
          <p>
            <strong className="text-[#2A2925]">
              {isEn 
                ? '1. Partner NEVER sees customer prices, profit margins, or customer payment status; Customer NEVER sees partner payouts or internal workshop notes' 
                : '1. Partner ziet nooit klantprijzen, marges of klant-betaalstatus; klant ziet nooit partnerbedragen of interne notities'}
            </strong> {isEn ? '— strictly enforced at the data model level, not just hidden in UI views.' : '— afgedwongen in het datamodel, niet alleen in de weergave.'}
          </p>
          <p>
            <strong className="text-[#2A2925]">
              {isEn 
                ? '2. Every single modification with a customer or partner impact generates an unalterable audit log entry (who, what, when).' 
                : '2. Elke wijziging met klant- of partnereffect krijgt een logregel (wie, wat, wanneer).'}
            </strong>
          </p>
        </div>
      </div>

      {/* NEW PROJECT MODAL */}
      <AnimatePresence>
        {newProjectModal && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-[#D6CFC2]"
            >
              <div className="flex items-center justify-between border-b border-[#D6CFC2] pb-3">
                <h3 className="font-serif font-bold text-base text-[#33422C]">
                  {isEn ? 'Create New Project' : 'Nieuw Project Aanmaken'}
                </h3>
                <button onClick={() => setNewProjectModal(false)} className="text-dark/40 hover:text-dark cursor-pointer">
                  <span className="text-lg">✕</span>
                </button>
              </div>

              <form onSubmit={handleCreateNewProject} className="space-y-4 text-xs font-body">
                <div>
                  <label className="block text-[10px] font-mono font-bold text-dark/60 uppercase mb-1">
                    {isEn ? 'Customer Name *' : 'Klantnaam *'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={isEn ? "e.g. Sander de Vries" : "b.v. Sander de Vries"}
                    value={newProjectClient}
                    onChange={(e) => setNewProjectClient(e.target.value)}
                    className="w-full p-2.5 bg-[#FAF8F5] border border-[#D6CFC2] rounded-xl text-xs text-dark focus:ring-2 focus:ring-[#33422C]/20"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-mono font-bold text-dark/60 uppercase mb-1">
                      {isEn ? 'Project Type' : 'Project Type'}
                    </label>
                    <select
                      value={newProjectType}
                      onChange={(e) => setNewProjectType(e.target.value)}
                      className="w-full p-2.5 bg-[#FAF8F5] border border-[#D6CFC2] rounded-xl text-xs text-dark focus:ring-2 focus:ring-[#33422C]/20 cursor-pointer"
                    >
                      <option value="Garden Room">{isEn ? 'Garden Room' : 'Buitenverblijf'}</option>
                      <option value="Canopy with Poolhouse">{isEn ? 'Canopy with Poolhouse' : 'Overkapping met poolhouse'}</option>
                      <option value="Outdoor Kitchen">{isEn ? 'Outdoor Kitchen' : 'Buitenkeuken'}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono font-bold text-dark/60 uppercase mb-1">
                      {isEn ? 'Budget / Quote Amount' : 'Budget / Offertebedrag'}
                    </label>
                    <input
                      type="text"
                      value={newProjectBudget}
                      onChange={(e) => setNewProjectBudget(e.target.value)}
                      className="w-full p-2.5 bg-[#FAF8F5] border border-[#D6CFC2] rounded-xl text-xs text-dark focus:ring-2 focus:ring-[#33422C]/20"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-[#D6CFC2]">
                  <button
                    type="button"
                    onClick={() => setNewProjectModal(false)}
                    className="px-4 py-2 bg-white border border-[#D6CFC2] text-dark/70 rounded-xl text-xs font-bold hover:bg-[#FAF8F5] cursor-pointer"
                  >
                    {isEn ? 'Cancel' : 'Annuleren'}
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#33422C] text-white rounded-xl text-xs font-bold hover:bg-[#283523] cursor-pointer"
                  >
                    {isEn ? 'Create Project' : 'Project Aanmaken'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
