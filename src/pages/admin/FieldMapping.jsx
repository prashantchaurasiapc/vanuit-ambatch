import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function FieldMapping({ onBackToOverview }) {
  const navigate = useNavigate();
  const [toastMsg, setToastMsg] = useState('');

  const [newProjectModal, setNewProjectModal] = useState(false);
  const [newProjectClient, setNewProjectClient] = useState('');
  const [newProjectType, setNewProjectType] = useState('Buitenverblijf');
  const [newProjectBudget, setNewProjectBudget] = useState('€ 25.000,00');

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3500);
  };

  const handleCreateNewProject = (e) => {
    e.preventDefault();
    if (!newProjectClient.trim()) return;
    setNewProjectModal(false);
    showToast(`✓ Nieuw project voor "${newProjectClient}" succesvol aangemaakt!`);
  };

  // 13 Field Mapping rows matching Screenshot 2 exactly
  const mappingRows = [
    {
      veld: 'Fase',
      klant: 'fasebalk + tijdlijn',
      partner: 'status werkbon',
      trigger: '1 notificatie bij overgang'
    },
    {
      veld: 'Statusteksten (nu / hierna)',
      klant: 'statuskaart overzicht',
      partner: '—',
      trigger: 'stil bijwerken'
    },
    {
      veld: 'Leverweek / weekplanning + voorlopig-definitief',
      klant: 'overzicht, planning, tegels',
      partner: 'werkbon (bouwweken)',
      trigger: 'bij definitief: notificatie + .ics'
    },
    {
      veld: 'Leverings-/schouwvoorstel',
      klant: 'voorstelkaart met akkoordknop',
      partner: 'afspraak in werkbon na akkoord',
      trigger: 'bij versturen + bij akkoord'
    },
    {
      veld: 'Klantacties',
      klant: 'actieblok + badge',
      partner: '—',
      trigger: 'bij aanmaken + herinnering dag 3'
    },
    {
      veld: 'Foto\'s (na publicatie)',
      klant: 'foto\'s-scherm + laatste update',
      partner: 'bron: partner-upload → concept',
      trigger: 'bij publicatie'
    },
    {
      veld: 'Werktekening / renders (+ wijzigingsregel)',
      klant: 'ter inzage, versies',
      partner: 'tekening in werkbon',
      trigger: 'bij publicatie, met wijzigingsregel'
    },
    {
      veld: 'Termijnen & betaalstatus (bron: boekhouding)',
      klant: 'betalingen + tegel',
      partner: 'nooit',
      trigger: 'factuur + vriendelijke herinnering'
    },
    {
      veld: 'Partnerbedrag & werkomschrijving',
      klant: 'nooit',
      partner: 'werkbon',
      trigger: 'bij werkbon-update'
    },
    {
      veld: 'Interne notities / logboek',
      klant: 'nooit',
      partner: 'nooit',
      trigger: '—'
    },
    {
      veld: 'Chat klant ↔ ons',
      klant: 'berichten-scherm klantportaal',
      partner: 'nooit rechtstreeks (alleen via "Delen met partner", met logregel)',
      trigger: 'beide richtingen WhatsApp/mail'
    },
    {
      veld: 'Chat partner ↔ ons',
      klant: 'nooit',
      partner: 'partnerchat + WhatsApp-spiegel',
      trigger: 'beide richtingen; partnerfoto\'s → Media als concept'
    },
    {
      veld: 'Opleverbevestiging klant',
      klant: 'oplevering & nazorg',
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
              title="Terug naar Projecten Overzicht"
            >
              ←
            </button>
          ) : (
            <button
              onClick={() => navigate('/admin/projects')}
              className="p-1.5 px-2.5 bg-[#33422C] hover:bg-[#253120] text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center justify-center cursor-pointer mr-1"
              title="Terug naar Projecten Overzicht"
            >
              ←
            </button>
          )}
          <span className="font-bold text-[#33422C] font-serif text-sm">Projectenbeheer</span>
          <span className="text-dark/40">·</span>
          <span className="text-dark/60 font-mono text-[11px]">adminportaal</span>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => {
              navigate('/admin/projects/inbox-messages');
              showToast('Projectberichten geopend...');
            }}
            className="px-3 py-1 bg-white border border-[#D6CFC2] text-dark/70 rounded-xl font-bold text-xs shadow-2xs hover:bg-[#FAF8F5] cursor-pointer flex items-center gap-1.5 transition-all"
          >
            <span>Inbox</span>
            <strong className="text-[#33422C] bg-[#E3EFE3] px-1.5 py-0.2 rounded font-mono text-[11px]">4</strong>
          </button>

          <button 
            onClick={() => {
              showToast('3 taken wachten op onze beoordeling');
            }}
            className="px-3 py-1 bg-[#FDF2E3] text-[#B86B14] border border-[#F6DCB8] rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-2xs cursor-pointer hover:bg-[#FCEAD0] transition-all"
          >
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span>3 taken wachten op ons</span>
          </button>

          <button 
            onClick={() => setNewProjectModal(true)}
            className="px-4 py-1.5 bg-[#33422C] hover:bg-[#283523] text-white rounded-xl font-bold text-xs cursor-pointer shadow-xs transition-all flex items-center gap-1"
          >
            <span>+ Nieuw project</span>
          </button>
        </div>
      </div>

      {/* MAIN TITLE & SUBTITLE matching Screenshot 2 */}
      <div className="space-y-1">
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#33422C]">
          Veldenkoppeling
        </h1>
        <p className="text-xs sm:text-sm text-dark/60 font-body">
          Waar elk veld vandaan komt en waar het landt. "Klant" = klantportaal, "Partner" = werkbon/Trello.
        </p>
      </div>

      {/* CARD 1: MAIN MAPPINGS TABLE matching Screenshot 2 */}
      <div className="bg-[#FAF8F5] border border-[#E6E1D7] rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#D6CFC2] text-[10px] font-mono uppercase text-dark/50 tracking-wider">
                <th className="pb-3 font-bold w-1/4">VELD (BRON: DIT SCHERM)</th>
                <th className="pb-3 font-bold w-1/4">KLANT</th>
                <th className="pb-3 font-bold w-1/4">PARTNER</th>
                <th className="pb-3 font-bold w-1/4">TRIGGER / NOTIFICATIE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E6E1D7]">
              {mappingRows.map((row, idx) => (
                <tr key={idx} className="text-dark/80 font-body hover:bg-white/40 transition-colors">
                  <td className="py-3 font-bold text-[#2A2925] pr-4">{row.veld}</td>
                  <td className="py-3 text-dark/80 pr-4">{row.klant}</td>
                  <td className="py-3 text-dark/80 pr-4">{row.partner}</td>
                  <td className="py-3 text-dark/70 font-body">{row.trigger}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CARD 2: TWEE HARDE REGELS matching Screenshot 2 */}
      <div className="bg-[#FAF8F5] border border-[#E6E1D7] rounded-2xl p-5 sm:p-6 shadow-2xs space-y-3">
        <span className="text-[10px] font-mono font-bold text-dark/50 uppercase tracking-wider block">
          TWEE HARDE REGELS (ZELFDE ALS KLANTPORTAAL-BRIEFING)
        </span>

        <div className="space-y-2 text-xs font-body text-dark/80 leading-relaxed">
          <p>
            <strong className="text-[#2A2925]">1. Partner ziet nooit klantprijzen, marges of klant-betaalstatus; klant ziet nooit partnerbedragen of interne notities</strong> — afgedwongen in het datamodel, niet alleen in de weergave.
          </p>
          <p>
            <strong className="text-[#2A2925]">2. Elke wijziging met klant- of partnereffect krijgt een logregel (wie, wat, wanneer).</strong>
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
                  Nieuw Project Aanmaken
                </h3>
                <button onClick={() => setNewProjectModal(false)} className="text-dark/40 hover:text-dark cursor-pointer">
                  <span className="text-lg">✕</span>
                </button>
              </div>

              <form onSubmit={handleCreateNewProject} className="space-y-4 text-xs font-body">
                <div>
                  <label className="block text-[10px] font-mono font-bold text-dark/60 uppercase mb-1">
                    Klantnaam *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="b.v. Sander de Vries"
                    value={newProjectClient}
                    onChange={(e) => setNewProjectClient(e.target.value)}
                    className="w-full p-2.5 bg-[#FAF8F5] border border-[#D6CFC2] rounded-xl text-xs text-dark focus:ring-2 focus:ring-[#33422C]/20"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-mono font-bold text-dark/60 uppercase mb-1">
                      Project Type
                    </label>
                    <select
                      value={newProjectType}
                      onChange={(e) => setNewProjectType(e.target.value)}
                      className="w-full p-2.5 bg-[#FAF8F5] border border-[#D6CFC2] rounded-xl text-xs text-dark focus:ring-2 focus:ring-[#33422C]/20 cursor-pointer"
                    >
                      <option value="Buitenverblijf">Buitenverblijf</option>
                      <option value="Overkapping met poolhouse">Overkapping met poolhouse</option>
                      <option value="Buitenkeuken">Buitenkeuken</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono font-bold text-dark/60 uppercase mb-1">
                      Budget / Offertebedrag
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
                    Annuleren
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#33422C] text-white rounded-xl text-xs font-bold hover:bg-[#283523] cursor-pointer"
                  >
                    Project Aanmaken
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
