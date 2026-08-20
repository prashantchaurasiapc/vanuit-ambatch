import React, { useState } from 'react';
import Card from '../Card';
import ProvDefBadge from './ProvDefBadge';
import { Calendar, CheckCircle2, Clock, Send, Download, FileText } from 'lucide-react';
import { generateBurenbriefPdf } from '../../utils/pdfGenerator';

/**
 * SchouwProposalCard Component (Step 4 - Garden Room Extension)
 * 
 * Implements the Site Survey ("Schouw op locatie") proposal card:
 * 1. Displays current schedule status (Provisional vs Definitive).
 * 2. Primary Action: "Akkoord — plan de schouw in" (saves acceptance, keeps provisional until completed).
 * 3. Secondary Action: "Andere dag aanvragen" (modal interaction).
 * 4. Downloads .ics calendar invite after schouw.status = 'completed'.
 * 5. Download "Burenbrief PDF" button.
 */
export default function SchouwProposalCard({
  project = null,
  onUpdateProject = () => {}
}) {
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [requestedDate, setRequestedDate] = useState('');
  const [requestedNote, setRequestedNote] = useState('');
  const [rescheduleSubmitted, setRescheduleSubmitted] = useState(false);

  // Extract Schouw state & Schedule status
  const scheduleStatus = project?.scheduleStatus || 'provisional'; // 'provisional' | 'definitive'
  const schouw = project?.schouw || {
    status: 'proposed', // 'proposed' | 'accepted' | 'completed'
    proposedDate: 'Dinsdag 26 augustus 2026',
    proposedTime: 'tussen 10:00 en 12:00 uur'
  };

  const isCompleted = schouw.status === 'completed' || scheduleStatus === 'definitive';
  const isAccepted = schouw.status === 'accepted';

  // Handle Customer Acceptance of Schouw
  const handleAcceptSchouw = () => {
    const updated = {
      ...project,
      schouw: {
        ...schouw,
        status: 'accepted',
        acceptedAt: new Date().toISOString()
      }
    };
    onUpdateProject(updated);
  };

  // Handle Reschedule Request Submission
  const handleSubmitReschedule = (e) => {
    e.preventDefault();
    const updated = {
      ...project,
      schouw: {
        ...schouw,
        status: 'reschedule_requested',
        requestedDate,
        requestedNote,
        requestedAt: new Date().toISOString()
      }
    };
    onUpdateProject(updated);
    setRescheduleSubmitted(true);
    setTimeout(() => {
      setShowRescheduleModal(false);
      setRescheduleSubmitted(false);
    }, 1800);
  };

  // Download .ics Calendar Invite
  const handleDownloadIcs = () => {
    if (!isCompleted) return;

    const title = `Schouw op locatie — ${project?.name || 'Buitenverblijf'}`;
    const desc = `Schouw en inmeting door Vanuit Ambacht op locatie: ${project?.address || ''}`;
    const location = project?.address || 'Locatie klant';

    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Vanuit Ambacht//Schouw Invite//NL
BEGIN:VEVENT
SUMMARY:${title}
DESCRIPTION:${desc}
LOCATION:${location}
DTSTART:20260826T100000Z
DTEND:20260826T120000Z
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `Schouw_Afspraak_${project?.id || 'PRJ'}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Download Burenbrief PDF
  const handleDownloadBurenbrief = () => {
    generateBurenbriefPdf(project);
  };

  return (
    <Card title="Site Survey On Location" icon={Calendar}>
      <div className="space-y-4 font-body">
        {/* Header Status & Badge */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-3 border-b border-[#D6CFC2]/60">
          <div>
            <h4 className="font-heading font-bold text-primary text-sm sm:text-base">
              Appointment for Site Survey
            </h4>
            <p className="text-xs text-dark/70 mt-0.5">
              The proposed construction schedule is provisional. After the site survey on location, we will make the schedule definitive.
            </p>
          </div>
          <ProvDefBadge scheduleStatus={isCompleted ? 'definitive' : 'provisional'} />
        </div>

        {/* Proposed Date Display Box */}
        <div className="bg-[#EDE8DF] border border-[#D6CFC2] p-4 rounded-xl space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono text-accent font-bold">
            <Clock className="w-4 h-4 text-primary" />
            <span>Proposed Date & Time</span>
          </div>
          <div className="text-sm sm:text-base font-bold text-primary font-heading">
            {schouw.proposedDate || 'Tuesday 26 August 2026'}
          </div>
          <div className="text-xs text-dark/70 font-medium">
            {schouw.proposedTime || 'between 10:00 and 12:00'} (Craftsman will visit for site survey & garden inspection)
          </div>
        </div>

        {/* Action Buttons & State Handlers */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex flex-wrap items-center gap-2.5">
            {!isCompleted && !isAccepted && (
              <>
                <button
                  type="button"
                  onClick={handleAcceptSchouw}
                  className="px-4 py-2 bg-primary text-cream text-xs font-bold rounded-xl shadow-xs hover:bg-primary/90 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4 text-accent" />
                  <span>Approve — Schedule Site Survey</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowRescheduleModal(true)}
                  className="px-3.5 py-2 bg-white text-dark/80 border border-[#D6CFC2] text-xs font-bold rounded-xl hover:bg-gray-50 transition-all cursor-pointer"
                >
                  <span>Request Another Day</span>
                </button>
              </>
            )}

            {isAccepted && !isCompleted && (
              <div className="flex items-center gap-2 text-xs text-primary font-bold bg-primary/10 px-3.5 py-2 rounded-xl border border-primary/20">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                <span>Approval submitted — Craftsman will confirm the time definitively</span>
              </div>
            )}

            {isCompleted && (
              <button
                type="button"
                onClick={handleDownloadIcs}
                className="px-4 py-2 bg-primary text-cream text-xs font-bold rounded-xl shadow-xs hover:bg-primary/90 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-4 h-4 text-accent" />
                <span>Download Calendar Invite (.ics)</span>
              </button>
            )}
          </div>

          {/* Download Burenbrief PDF Button */}
          <button
            type="button"
            onClick={handleDownloadBurenbrief}
            className="px-3.5 py-2 bg-white text-primary border border-primary/40 hover:bg-primary/5 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ml-auto"
          >
            <FileText className="w-4 h-4 text-primary" />
            <span>Download Neighbour Letter</span>
          </button>
        </div>

        {/* Reschedule Modal */}
        {showRescheduleModal && (
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="bg-[#EDE8DF] border border-[#C4BEB3] rounded-2xl p-5 max-w-md w-full shadow-2xl space-y-4 text-xs font-body">
              <div className="border-b border-[#D6CFC2] pb-2 flex justify-between items-center">
                <h3 className="font-heading font-bold text-primary text-sm">Request Another Date</h3>
                <button
                  type="button"
                  onClick={() => setShowRescheduleModal(false)}
                  className="text-dark/50 hover:text-dark font-bold"
                >
                  ✕
                </button>
              </div>

              {rescheduleSubmitted ? (
                <div className="p-4 bg-green-100 border border-green-300 text-green-800 rounded-xl text-center space-y-1">
                  <CheckCircle2 className="w-6 h-6 mx-auto text-green-700" />
                  <h4 className="font-bold text-xs">Request Received!</h4>
                  <p className="text-[11px]">We will contact you within 24 hours to coordinate a new time.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmitReschedule} className="space-y-3">
                  <div>
                    <label className="block font-bold text-primary text-[11px] mb-1">
                      Preferred Date or Time:
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Thursday 28 August in the morning"
                      value={requestedDate}
                      onChange={(e) => setRequestedDate(e.target.value)}
                      className="w-full p-2.5 bg-white border border-[#D6CFC2] rounded-xl text-xs text-dark focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-primary text-[11px] mb-1">
                      Note (optional):
                    </label>
                    <textarea
                      rows={2}
                      placeholder="e.g. I am only available after 14:00..."
                      value={requestedNote}
                      onChange={(e) => setRequestedNote(e.target.value)}
                      className="w-full p-2.5 bg-white border border-[#D6CFC2] rounded-xl text-xs text-dark focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowRescheduleModal(false)}
                      className="px-3 py-2 bg-white text-dark/70 rounded-xl border border-[#D6CFC2] font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-primary text-cream font-bold rounded-xl flex items-center gap-1 hover:bg-primary/90"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Submit Request</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

