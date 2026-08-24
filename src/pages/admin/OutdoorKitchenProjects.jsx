import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle, MessageCircle, ExternalLink, Calendar, 
  Send, FileText, Camera, Shield, Check, Clock, ChevronRight,
  X, Phone, MessageSquare, Download, AlertCircle, Info, User, Wrench, 
  FileSpreadsheet, Building, Plus, Bell, Eye, Edit2, UploadCloud, Image as ImageIcon,
  Paperclip, Share2, CornerDownRight, ChevronDown
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ProjectChatDrawer from '../../components/common/ProjectChatDrawer';

export default function OutdoorKitchenProjects({ onBackToOverview }) {
  const navigate = useNavigate();

  // State matching Outdoor Kitchen Project
  const [activeStep, setActiveStep] = useState('In the workshop');
  const [activeTab, setActiveTab] = useState('Customer Actions');
  const [toastMsg, setToastMsg] = useState('');

  // Editable fields with English text (Status & Texts / Messages)
  const [watErNuGebeurt, setWatErNuGebeurt] = useState(
    'The Thermo Fraké frame is assembled and the cabinets are installed. This week, the countertop will be finished and the cutout for your Big Green Egg will be sawed.'
  );

  const [watErHiernaKomt, setWatErHiernaKomt] = useState(
    'Final inspection by Tim & Bram (around September 10). After that, we will call you to schedule a delivery window.'
  );

  const [leverweek, setLeverweek] = useState('Week 38 - Sept 14 to Sept 18');
  const [leverStatus, setLeverStatus] = useState('On schedule');
  const [interneNotities, setInterneNotities] = useState(
    'Customer was uncertain about sink position — moved 15 cm to the left (see messages Aug 17). Wood batch is clean and uniform.'
  );

  const [lastUpdated, setLastUpdated] = useState('today 09:05 by Bram');

  // Customer Actions State (Synced with Customer Portal)
  const defaultActions = [
    {
      id: 1,
      status: 'Open',
      title: 'Approve delivery proposal',
      subtitle: 'Tue Sep 15 13:00–16:00 · created Aug 16 · reminder scheduled Aug 20',
      actionType: 'proposal'
    },
    {
      id: 2,
      status: 'Completed',
      title: 'Completion checklist "How you can help us"',
      subtitle: '2 of 4 items checked off by customer · passageway ✓ · subfloor ✓',
      actionType: 'checklist'
    }
  ];

  const [customerActions, setCustomerActions] = useState(() => {
    const saved = localStorage.getItem('app_customer_actions');
    return saved ? JSON.parse(saved) : defaultActions;
  });

  const saveActions = (newActions) => {
    setCustomerActions(newActions);
    localStorage.setItem('app_customer_actions', JSON.stringify(newActions));
    window.dispatchEvent(new Event('app_data_changed'));
  };

  // Automatic follow-up toggles (Screenshot 2)
  const [followUpWhatsApp, setFollowUpWhatsApp] = useState(true);
  const [followUpCall, setFollowUpCall] = useState(true);
  const [followUpBanner, setFollowUpBanner] = useState(false);

  // Delivery Tab State (Exact match to Client Delivery Screenshot)
  const [deliveryProposalDay, setDeliveryProposalDay] = useState('Tuesday, September 15');
  const [deliveryProposalTime, setDeliveryProposalTime] = useState('13:00 - 16:00');
  const [deliveryProposalStatus, setDeliveryProposalStatus] = useState('Awaiting customer agreement');
  const [timelineStepNote, setTimelineStepNote] = useState(
    'Frame and cabinets assembled; this week countertop...'
  );
  const [editNoteModal, setEditNoteModal] = useState(false);
  const [tempTimelineNote, setTempTimelineNote] = useState('');

  // Media & Documents Tab State (Exact match to Client Media & Documents Screenshot)
  const [photosList, setPhotosList] = useState([
    {
      id: 1,
      title: 'Frame assembled',
      date: 'Aug 17',
      published: true,
      source: 'partner (Hoek Bouw)',
      note: ''
    },
    {
      id: 2,
      title: 'Fitting countertop',
      date: 'today',
      published: false,
      source: 'draft',
      note: ''
    }
  ]);
  const [draftPhotoNote, setDraftPhotoNote] = useState('');

  const [documentsList, setDocumentsList] = useState([
    {
      id: 1,
      type: 'DRAWING',
      title: 'Working drawing version 2',
      subtitle: 'Visible to customer (for review) and partner (dimensions)',
      customerVisible: true,
      partnerVisible: true
    },
    {
      id: 2,
      type: 'INVOICE',
      title: 'Invoice 1st installment',
      subtitle: 'Automatically visible to customer · never for partner',
      isLive: true
    },
    {
      id: 3,
      type: 'WORK ORDER',
      title: 'Work order partner (specification + partner amount)',
      subtitle: 'Partner only — technically cannot appear on customer side',
      partnerOnly: true
    }
  ]);

  const [uploadDocModal, setUploadDocModal] = useState(false);
  const [newDocTitle, setNewDocTitle] = useState('');
  const [newDocType, setNewDocType] = useState('DRAWING');

  // Default messages structure
  const defaultCustMsgs = [
    {
      id: 1,
      sender: 'Sander de Vries',
      initials: 'SV',
      role: 'customer',
      text: 'Great look. Question: can the sink be moved a bit more to the left?',
      time: 'today 09:40',
      isRead: true
    },
    {
      id: 2,
      sender: 'Tim (Admin)',
      initials: 'T',
      role: 'admin',
      text: "Still possible, the slab has not been cut out yet. I'll have it shifted 15 cm to the left and send you a photo of the marking this afternoon. Cost: zero.",
      time: 'Tim · 09:48 · ✓ read',
      isRead: true
    }
  ];

  const defaultPartMsgs = [
    {
      id: 1,
      sender: 'Sven Hoek',
      initials: 'SH',
      role: 'partner',
      text: 'Slab is ready for cutting. Any changes before I begin?',
      time: 'today 09:52',
      isRead: true
    },
    {
      id: 2,
      sender: 'Tim (Admin)',
      initials: 'T',
      role: 'admin',
      text: 'Yes — sink 15 cm to the left compared to drawing v2 (customer request). Work order updated. Will you send a photo of the marking before cutting?',
      time: 'Tim · 09:55 · ✓ read',
      isRead: true
    },
    {
      id: 3,
      sender: 'Sven Hoek',
      initials: 'SH',
      role: 'partner',
      text: 'Great, on it. 📷 follows around 14:00.',
      time: 'today 09:57',
      isRead: true
    }
  ];

  const [customerMessagesList, setCustomerMessagesList] = useState(() => {
    try {
      const saved = localStorage.getItem('app_project_messages_2026_014');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.customer) return parsed.customer;
      }
    } catch(e) {}
    return defaultCustMsgs;
  });

  const [partnerMessagesList, setPartnerMessagesList] = useState(() => {
    try {
      const saved = localStorage.getItem('app_project_messages_2026_014');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.partner) return parsed.partner;
      }
    } catch(e) {}
    return defaultPartMsgs;
  });

  const saveMessagesStore = (cust, part) => {
    setCustomerMessagesList(cust);
    setPartnerMessagesList(part);
    localStorage.setItem('app_project_messages_2026_014', JSON.stringify({ customer: cust, partner: part }));
    window.dispatchEvent(new Event('app_messages_updated'));
  };

  // Sync listener across components
  useEffect(() => {
    const handleSync = () => {
      try {
        const raw = localStorage.getItem('app_project_messages_2026_014');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed.customer) setCustomerMessagesList(parsed.customer);
          if (parsed.partner) setPartnerMessagesList(parsed.partner);
        }
      } catch(e) {}
    };
    window.addEventListener('app_messages_updated', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('app_messages_updated', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  const [inputCustomerMsg, setInputCustomerMsg] = useState('');
  const [inputPartnerMsg, setInputPartnerMsg] = useState('');
  const [quickReplyOpen, setQuickReplyOpen] = useState(false);

  // Partner Tab State (Exact match to Client Partner Screenshot)
  const [partnerSelected, setPartnerSelected] = useState('Sven Hoek · Hoek Bouw');
  const [partnerAmount, setPartnerAmount] = useState('€ 2,150.00');
  const [partnerAssignmentStatus, setPartnerAssignmentStatus] = useState('In production');
  const [partnerWorkDescription, setPartnerWorkDescription] = useState(
    'Outdoor kitchen Thermo Fraké 240×80. Top with ceramic slabs, cutout BGE Large right of the center (see drawing v2). Faucet & sink — sink 15 cm to left compared to v1. Oil: natural, 2 coats. Delivery Tue Sep 15 13:00–16:00, address...'
  );

  // Modals & Chat Drawer State
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { id: 1, sender: 'Sander de Vries', role: 'klant', text: 'Hi Tim, has the cutout for the Big Green Egg been sawed out yet?', time: '09:30' },
    { id: 2, sender: 'Tim (Admin)', role: 'admin', text: 'Yes, absolutely Sander! The countertop was cleanly cut and polished yesterday.', time: '09:45' },
    { id: 3, sender: 'Sander de Vries', role: 'klant', text: 'Awesome, thank you! When exactly do you expect delivery?', time: '10:05' }
  ]);
  const [inputChatMsg, setInputChatMsg] = useState('');
  const [customerPortalModal, setCustomerPortalModal] = useState(false);
  const [actionModal, setActionModal] = useState(false);
  const [newActionTitle, setNewActionTitle] = useState('');
  const [newActionSub, setNewActionSub] = useState('');
  const [newProjectModal, setNewProjectModal] = useState(false);
  const [newProjectClient, setNewProjectClient] = useState('');
  const [newProjectType, setNewProjectType] = useState('Outdoor Kitchen');
  const [phaseModal, setPhaseModal] = useState(false);
  const [selectedNewPhase, setSelectedNewPhase] = useState('In the workshop');

  // Payments Tab State (Sent & Paid tracking + Direct Invoice Sending)
  const [finalInvoiceSent, setFinalInvoiceSent] = useState(false);
  const [finalInvoiceSentDate, setFinalInvoiceSentDate] = useState('');

  const handleSendFinalInvoice = () => {
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const todayFormatted = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    setFinalInvoiceSent(true);
    setFinalInvoiceSentDate(`Today (${todayFormatted})`);

    // Add invoice to global invoices localStorage
    const currentInvoices = JSON.parse(localStorage.getItem('app_invoices') || '[]');
    const newInvoiceObj = {
      id: 'INV-2026-042',
      invoiceNumber: 'INV-2026-042',
      customerName: 'Sander de Vries',
      customer: 'Sander de Vries',
      projectId: '2026-014',
      projectName: 'Sander de Vries — Thermo Fraké 240 cm',
      amount: '€ 1,960.00',
      numericAmount: 1960.00,
      vatAmount: '€ 340.17',
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'Sent',
      paymentStatus: 'Open',
      milestone: '50% Final Invoice (Upon Delivery)',
      items: [
        { description: 'Final installment (50%) — Thermo Fraké Outdoor Kitchen 240 cm', qty: 1, rate: 1619.83, amount: 1619.83 }
      ]
    };
    localStorage.setItem('app_invoices', JSON.stringify([newInvoiceObj, ...currentInvoices]));
    window.dispatchEvent(new Event('app_data_changed'));

    const newLog = {
      id: Date.now(),
      date: `Today ${timeNow}`,
      text: 'Final invoice #INV-2026-042 sent directly to customer Sander de Vries — Admin'
    };
    setLogbook(prev => [newLog, ...prev]);
    showToast('✓ Invoice #INV-2026-042 sent directly to customer (Email & Customer Portal)!');
  };

  // Logbook entries matching Project history
  const [logbook, setLogbook] = useState([
    { id: 1, date: 'Today 10:05', text: 'Message to customer answered (sink 15 cm to left) — Tim' },
    { id: 2, date: 'Today 09:05', text: 'Status text updated — Bram' },
    { id: 3, date: 'Aug 17', text: '2 photos published (source: partner) — Bram' },
    { id: 4, date: 'Aug 16', text: 'Delivery proposal Tue Sep 15 sent — Tim' },
    { id: 5, date: 'Aug 14', text: 'Phase → In the workshop · customer notified — system' }
  ]);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3500);
  };

  const handleOpslaanEnPubliceren = (e) => {
    e.preventDefault();
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setLastUpdated(`today ${timeNow} by Admin`);
    
    const newLog = {
      id: Date.now(),
      date: `Today ${timeNow}`,
      text: 'Status text updated & published to customer portal — Admin'
    };
    setLogbook([newLog, ...logbook]);
    showToast('✓ Status texts saved and published immediately to customer overview!');
  };

  const handleSendCustomerMessage = (e) => {
    e.preventDefault();
    if (!inputCustomerMsg.trim()) return;

    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newMsg = {
      id: Date.now(),
      sender: 'Tim (Admin)',
      initials: 'T',
      role: 'admin',
      text: inputCustomerMsg.trim(),
      time: `Tim · ${timeNow} · sent`,
      isRead: false
    };

    const nextCust = [...customerMessagesList, newMsg];
    saveMessagesStore(nextCust, partnerMessagesList);
    setInputCustomerMsg('');
    showToast('✓ Message sent to customer (via Portal + WhatsApp)!');
  };

  const handleSendPartnerMessage = (e) => {
    e.preventDefault();
    if (!inputPartnerMsg.trim()) return;

    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newMsg = {
      id: Date.now(),
      sender: 'Tim (Admin)',
      initials: 'T',
      role: 'admin',
      text: inputPartnerMsg.trim(),
      time: `Tim · ${timeNow} · sent`,
      isRead: false
    };

    const nextPart = [...partnerMessagesList, newMsg];
    saveMessagesStore(customerMessagesList, nextPart);
    setInputPartnerMsg('');
    showToast('✓ Message sent to partner (via Portal + WhatsApp mirror)!');
  };

  const handleShareWithPartner = () => {
    const forwardedText = "Forwarded customer request: Sander requested moving sink 15 cm to the left.";
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newPartnerMsg = {
      id: Date.now(),
      sender: 'Tim (Admin)',
      initials: 'T',
      role: 'admin',
      text: forwardedText,
      time: `Tim · ${timeNow} · shared from customer`,
      isRead: false
    };
    const nextPart = [...partnerMessagesList, newPartnerMsg];
    saveMessagesStore(customerMessagesList, nextPart);
    
    const newLog = {
      id: Date.now(),
      date: `Today ${timeNow}`,
      text: 'Customer message shared with partner (sink 15 cm to left) — Tim'
    };
    setLogbook([newLog, ...logbook]);
    showToast('✓ Customer message shared with partner & recorded in logbook!');
  };

  const handleUpdateWorkOrder = (e) => {
    e.preventDefault();
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newLog = {
      id: Date.now(),
      date: `Today ${timeNow}`,
      text: 'Work order updated & synced with partner — Admin'
    };
    setLogbook([newLog, ...logbook]);
    showToast('✓ Work order updated & sent to partner!');
  };

  const handleSendChat = (e) => {
    e.preventDefault();
    if (!inputChatMsg.trim()) return;

    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newMsg = {
      id: Date.now(),
      sender: 'Tim (Admin)',
      role: 'admin',
      text: inputChatMsg.trim(),
      time: timeNow
    };

    setChatMessages([...chatMessages, newMsg]);
    setInputChatMsg('');
    showToast('Message sent to customer!');
  };

  const handleRemindAction = (actionTitle) => {
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newLog = {
      id: Date.now(),
      date: `Today ${timeNow}`,
      text: `WhatsApp reminder sent to customer for "${actionTitle}" — Tim`
    };
    setLogbook([newLog, ...logbook]);
    showToast(`✓ WhatsApp reminder sent to customer for: "${actionTitle}"`);
  };

  const handleCancelAction = (actionId) => {
    setCustomerActions(customerActions.filter(a => a.id !== actionId));
    showToast('Customer action cancelled');
  };

  const handleAddAction = (e) => {
    e.preventDefault();
    if (!newActionTitle.trim()) return;
    const newAct = {
      id: Date.now(),
      status: 'Open',
      title: newActionTitle.trim(),
      subtitle: newActionSub.trim() || 'Created today · pending customer review',
      actionType: 'custom'
    };
    setCustomerActions([...customerActions, newAct]);
    setNewActionTitle('');
    setNewActionSub('');
    setActionModal(false);
    showToast('New customer action created & sent!');
  };

  const handleSendDeliveryProposal = (e) => {
    e.preventDefault();
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newLog = {
      id: Date.now(),
      date: `Today ${timeNow}`,
      text: `Delivery proposal sent (${deliveryProposalDay} ${deliveryProposalTime}) — Admin`
    };
    setLogbook([newLog, ...logbook]);
    showToast(`✓ Delivery proposal sent (${deliveryProposalDay} ${deliveryProposalTime})!`);
  };

  const handleSaveTimelineNote = (e) => {
    e.preventDefault();
    if (tempTimelineNote.trim()) {
      setTimelineStepNote(tempTimelineNote.trim());
    }
    setEditNoteModal(false);
    showToast('✓ Customer portal timeline explanation updated!');
  };

  const handlePublishPhoto = (photoId) => {
    if (!draftPhotoNote.trim()) {
      showToast('Please type a note in the box before publishing (mandatory)');
      return;
    }
    const publishedNote = draftPhotoNote.trim();
    const updated = photosList.map(p => {
      if (p.id === photoId) {
        return { ...p, published: true, note: publishedNote };
      }
      return p;
    });
    setPhotosList(updated);
    setDraftPhotoNote('');

    // Sync with global photos storage for Customer Portal
    const existing = JSON.parse(localStorage.getItem('app_project_photos') || '[]');
    const newPublished = {
      id: `P-${Date.now()}`,
      projectId: '2026-014',
      projectName: 'Sander de Vries — Thermo Fraké 240 cm',
      customer: 'Sander de Vries',
      title: 'Fitting countertop',
      description: publishedNote,
      phase: 'In the workshop',
      craftsman: 'Sven Hoek · Hoek Bouw',
      uploaderRole: 'admin',
      isShared: true,
      date: new Date().toISOString().split('T')[0]
    };
    localStorage.setItem('app_project_photos', JSON.stringify([newPublished, ...existing]));
    window.dispatchEvent(new Event('app_data_changed'));

    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newLog = {
      id: Date.now(),
      date: `Today ${timeNow}`,
      text: `Photo published (Fitting countertop: "${publishedNote}") — Admin`
    };
    setLogbook([newLog, ...logbook]);
    showToast('✓ Photo published & 1 notification sent to customer!');
  };

  const handleToggleDocCustomer = (docId) => {
    setDocumentsList(documentsList.map(doc => {
      if (doc.id === docId) {
        const nextState = !doc.customerVisible;
        showToast(`Document customer visibility: ${nextState ? 'Enabled' : 'Disabled'}`);
        return { ...doc, customerVisible: nextState };
      }
      return doc;
    }));
  };

  const handleToggleDocPartner = (docId) => {
    setDocumentsList(documentsList.map(doc => {
      if (doc.id === docId) {
        const nextState = !doc.partnerVisible;
        showToast(`Document partner visibility: ${nextState ? 'Enabled' : 'Disabled'}`);
        return { ...doc, partnerVisible: nextState };
      }
      return doc;
    }));
  };

  const handleUploadDoc = (e) => {
    e.preventDefault();
    if (!newDocTitle.trim()) return;
    const newDoc = {
      id: Date.now(),
      type: newDocType,
      title: newDocTitle.trim(),
      subtitle: 'Uploaded today · active document',
      isLive: true
    };
    setDocumentsList([...documentsList, newDoc]);
    setNewDocTitle('');
    setUploadDocModal(false);
    showToast(`✓ Document "${newDoc.title}" uploaded successfully!`);
  };

  const stepsList = [
    { name: 'Agreement & Design', key: 'Agreement & Design' },
    { name: 'In the workshop', key: 'In the workshop' },
    { name: 'Ready for delivery', key: 'Ready for delivery' },
    { name: 'Delivered', key: 'Delivered' },
    { name: 'Aftercare', key: 'Aftercare' }
  ];

  const allTabsList = [
    'Status & Texts',
    'Customer Actions',
    'Delivery',
    'Media & Documents',
    'Payments',
    'Messages',
    'Partner'
  ];

  // Common Right Rail Component matching Screenshots (with High Contrast, Crisp Typography)
  const renderRightRail = () => (
    <div className="lg:col-span-5 space-y-5">
      
      {/* CARD 1: LIVE — WHAT THE CUSTOMER SEES NOW */}
      <div className="bg-[#FAF8F5] border border-[#E6E1D7] rounded-2xl p-4 sm:p-5 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono font-bold text-[#555046] uppercase tracking-wider block">
            LIVE — WHAT THE CUSTOMER SEES NOW
          </span>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Live Synced" />
        </div>

        <div className="bg-white border border-[#D6CFC2] rounded-xl p-4 space-y-3 shadow-2xs">
          <div>
            <h4 className="font-bold text-sm text-[#1C1C1A]">
              Hi Sander
            </h4>
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#2E2B25] mt-0.5">
              <span>{activeStep}</span>
              <span>·</span>
              <span className="text-[#555046] font-normal">delivery week 38</span>
            </div>
          </div>

          <div className="w-full bg-[#EDE8DF] h-2 rounded-full overflow-hidden">
            <div 
              className="bg-[#5A5038] h-full rounded-full transition-all duration-500" 
              style={{
                width: activeStep === 'Agreement & Design' ? '25%' 
                  : activeStep === 'In the workshop' ? '55%' 
                  : activeStep === 'Ready for delivery' ? '75%' 
                  : activeStep === 'Delivered' ? '90%' : '100%'
              }} 
            />
          </div>

          {(() => {
            const openActs = customerActions.filter(a => a.status === 'Open');
            if (openActs.length > 0) {
              return (
                <div className="px-2.5 py-1 bg-[#FDF2E3] border border-[#F6DCB8] text-[#9E5507] rounded-lg text-[11px] font-bold inline-block">
                  • {openActs.length} {openActs.length === 1 ? 'action open' : 'actions open'}: {openActs[0].title}
                </div>
              );
            }
            return (
              <div className="px-2.5 py-1 bg-[#E3EFE3] border border-[#C5E1C5] text-[#1E561E] rounded-lg text-[11px] font-bold inline-block">
                ✓ All customer actions completed
              </div>
            );
          })()}

          {/* Latest customer chat sync */}
          {customerMessagesList.length > 0 && (
            <div className="pt-1 text-[11px] text-[#555046] border-t border-[#E6E1D7]/60 flex items-center gap-1.5">
              <span className="font-bold text-[#1C1C1A]">Latest msg:</span>
              <span className="truncate italic">"{customerMessagesList[customerMessagesList.length - 1].text}"</span>
            </div>
          )}
        </div>

        <p className="text-[11px] text-[#555046] leading-relaxed">
          Refreshes automatically with every change here. Click "View Customer Portal" to open the actual portal.
        </p>
      </div>

      {/* CARD 2: PARTNER — HOEK BOUW */}
      <div className="bg-[#FAF8F5] border border-[#E6E1D7] rounded-2xl p-4 sm:p-5 shadow-2xs space-y-3">
        <span className="text-[11px] font-mono font-bold text-[#555046] uppercase tracking-wider block">
          PARTNER — HOEK BOUW
        </span>

        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-sm text-[#1C1C1A]">
              Sven Hoek
            </h4>
            <span className="px-2 py-0.5 bg-[#E3EFE3] text-[#1E561E] rounded-md text-[11px] font-bold">
              ✔ In production
            </span>
          </div>
          <p className="text-xs text-[#4F4B44] mt-1 font-medium">
            Work order v3 · last photo Aug 17 · delivery Tue Sep 15
          </p>
        </div>

        <div className="flex items-center gap-2 pt-1">
          <a
            href="https://wa.me/31612345678"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-1.5 bg-white hover:bg-[#FAF8F5] text-[#1C1C1A] border border-[#D6CFC2] rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer"
          >
            WhatsApp partner
          </a>
          <button
            onClick={() => {
              setActiveTab('Partner');
              showToast('Opening Trello board for Hoek Bouw...');
            }}
            className="px-3.5 py-1.5 bg-white hover:bg-[#FAF8F5] text-[#1C1C1A] border border-[#D6CFC2] rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer"
          >
            Trello
          </button>
        </div>
      </div>

      {/* CARD 3: LOGBOOK */}
      <div className="bg-[#FAF8F5] border border-[#E6E1D7] rounded-2xl p-4 sm:p-5 shadow-2xs space-y-3">
        <span className="text-[11px] font-mono font-bold text-[#555046] uppercase tracking-wider block">
          LOGBOOK (ALL WITH WHO/WHEN)
        </span>

        <div className="space-y-2 text-xs">
          {logbook.map((log) => (
            <div key={log.id} className="flex items-start gap-3 border-b border-[#E6E1D7]/60 pb-2 last:border-none">
              <span className="font-mono text-[10px] font-bold text-[#615C52] whitespace-nowrap min-w-[82px] pt-0.5">
                {log.date}
              </span>
              <span className="text-[#2E2B25] font-medium leading-snug">
                {log.text}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );

  return (
    <div className="-m-3 sm:-m-4 lg:-m-6 p-4 sm:p-6 lg:p-8 min-h-full bg-[#F4F1EA] text-[#4A4A43] font-body space-y-6 relative w-auto">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 right-6 z-[99999] bg-[#283523] text-white px-5 py-3.5 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs font-bold border border-white/10"
          >
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            {toastMsg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* TOP PORTAL BREADCRUMB BAR (Matching Image 2 Seamlessly) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs border-b border-[#D6CFC2]/60 pb-3">
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
          <span className="font-bold text-[#33422C] font-serif text-sm">Project Management</span>
          <span className="text-dark/40">·</span>
          <span className="text-[#555046] font-mono text-[11px]">admin portal</span>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => {
              navigate('/admin/projects/inbox-messages');
              showToast('Opening project inbox messages...');
            }}
            className="px-3 py-1.5 bg-white border border-[#D6CFC2] text-[#1C1C1A] rounded-xl font-bold text-xs shadow-2xs hover:bg-[#FAF8F5] cursor-pointer flex items-center gap-1.5 transition-all"
          >
            <span>Inbox</span>
            <strong className="text-[#283523] bg-[#E3EFE3] px-1.5 py-0.2 rounded font-mono text-[11px]">4</strong>
          </button>

          <button 
            onClick={() => {
              setActiveTab('Customer Actions');
              showToast('Filtered: 3 tasks waiting for review');
            }}
            className="px-3 py-1.5 bg-[#FDF2E3] text-[#9E5507] border border-[#F6DCB8] rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-2xs cursor-pointer hover:bg-[#FCEAD0] transition-all"
          >
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span>3 tasks waiting for us</span>
          </button>

          <button 
            onClick={() => setNewProjectModal(true)}
            className="px-4 py-1.5 bg-[#283523] hover:bg-[#1E291B] text-white rounded-xl font-bold text-xs cursor-pointer shadow-xs transition-all flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New project</span>
          </button>
        </div>
      </div>

      {/* TOP HEADER SECTION */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-1">
        <div>
          <span className="text-[11px] font-mono font-bold text-dark/50 uppercase tracking-widest block">
            PROJECT 2026-014 — OUTDOOR KITCHEN
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#33422C] mt-0.5">
            Sander de Vries — Thermo Fraké 240 cm
          </h1>
          <p className="text-xs text-dark/70 font-body mt-1">
            Oisterwijk · Quote OF-2026325 · Approved Aug 11 · € 3,920.00 incl. VAT
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => {
              const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              const newLog = {
                id: Date.now(),
                date: `Today ${timeNow}`,
                text: 'Customer Portal session opened (Bekijk als klant) — Admin'
              };
              setLogbook([newLog, ...logbook]);
              showToast('✓ Opening Customer Portal in read-only preview mode (Session Logged)...');
              window.open('/customer/project', '_blank');
            }}
            className="px-3.5 py-2 bg-white hover:bg-[#FAF8F5] text-[#1C1C1A] border border-[#D6CFC2] rounded-xl text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
            title="Bekijk als klant (Live Read-Only Customer Portal)"
          >
            <span>👁️ View Customer Portal</span>
          </button>

          <button
            onClick={() => {
              setSelectedNewPhase(activeStep);
              setPhaseModal(true);
            }}
            className="px-4 py-2 bg-[#283523] hover:bg-[#1E291B] text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer"
          >
            Update Phase
          </button>
        </div>
      </div>

      {/* STEPPER BAR CARD matching Screenshot 2 */}
      <div className="bg-[#FAF8F5] border border-[#E6E1D7] rounded-2xl p-4 sm:p-5 shadow-2xs">
        <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar">
          {stepsList.map((step) => {
            const isActive = activeStep === step.key;
            return (
              <button
                key={step.key}
                onClick={() => setActiveStep(step.key)}
                className={`px-4 sm:px-5 py-2 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  isActive 
                    ? 'bg-[#5C5138] text-white shadow-xs' 
                    : 'bg-[#EDE8DF]/80 text-[#555046] hover:bg-[#EDE8DF]'
                }`}
              >
                {step.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* PRIMARY TABS BAR matching Screenshot 2 */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center gap-8 border-b border-[#D6CFC2]/70 pb-0.5 overflow-x-auto no-scrollbar">
          {allTabsList.map((tabName) => {
            const isActive = activeTab === tabName;
            return (
              <button
                key={tabName}
                onClick={() => setActiveTab(tabName)}
                className={`pb-2.5 text-xs sm:text-sm transition-all whitespace-nowrap cursor-pointer focus:outline-none relative ${
                  isActive 
                    ? 'text-[#33422C] font-extrabold font-body' 
                    : 'text-[#736B5E] hover:text-[#33422C] font-medium font-body'
                }`}
              >
                {tabName}
                {isActive && (
                  <motion.div 
                    layoutId="activeTabIndicator" 
                    className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#9B7C47]" 
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: STATUS & TEXTS */}
      {activeTab === 'Status & Texts' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          
          {/* LEFT COLUMN: 7 COLUMNS */}
          <div className="lg:col-span-7 space-y-5">
            
            {/* CARD 1: Status texts on customer overview */}
            <div className="bg-[#FAF8F5] border border-[#E6E1D7] rounded-2xl p-4 sm:p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-[#1C1C1A]">
                  Status texts on customer overview
                </h3>
                <span className="px-2.5 py-0.5 bg-[#E3EFE3] text-[#1E561E] rounded-md font-mono text-[10px] font-bold">
                  → CUSTOMER
                </span>
              </div>

              <p className="text-xs text-[#4F4B44] leading-relaxed">
                These two fields populate the customer's status card. Short and concise, as if texting them directly. Required at each phase transition; interim updates are always allowed.
              </p>

              <form onSubmit={handleOpslaanEnPubliceren} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-mono font-bold text-[#555046] uppercase tracking-wider mb-1.5">
                    WHAT IS HAPPENING NOW
                  </label>
                  <textarea
                    rows={3}
                    value={watErNuGebeurt}
                    onChange={(e) => setWatErNuGebeurt(e.target.value)}
                    className="w-full p-3 bg-white border border-[#D6CFC2] rounded-xl text-xs font-semibold text-[#1C1C1A] focus:outline-none focus:ring-2 focus:ring-[#283523]/20 leading-relaxed"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono font-bold text-[#555046] uppercase tracking-wider mb-1.5">
                    WHAT COMES NEXT
                  </label>
                  <textarea
                    rows={2}
                    value={watErHiernaKomt}
                    onChange={(e) => setWatErHiernaKomt(e.target.value)}
                    className="w-full p-3 bg-white border border-[#D6CFC2] rounded-xl text-xs font-semibold text-[#1C1C1A] focus:outline-none focus:ring-2 focus:ring-[#283523]/20 leading-relaxed"
                  />
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#283523] hover:bg-[#1E291B] text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer self-start"
                  >
                    Save & Publish
                  </button>

                  <span className="text-xs text-[#615C52] font-medium">
                    Last updated: {lastUpdated}
                  </span>
                </div>
              </form>
            </div>

            {/* CARD 2: Expected delivery */}
            <div className="bg-[#FAF8F5] border border-[#E6E1D7] rounded-2xl p-4 sm:p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-[#1C1C1A]">
                  Expected Delivery
                </h3>
                <span className="px-2.5 py-0.5 bg-[#E3EFE3] text-[#1E561E] rounded-md font-mono text-[10px] font-bold">
                  → CUSTOMER
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-mono font-bold text-[#555046] uppercase tracking-wider mb-1.5">
                    DELIVERY WEEK
                  </label>
                  <select
                    value={leverweek}
                    onChange={(e) => setLeverweek(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#D6CFC2] rounded-xl text-xs font-semibold text-[#1C1C1A] focus:outline-none focus:ring-2 focus:ring-[#283523]/20 cursor-pointer"
                  >
                    <option value="Week 38 - Sept 14 to Sept 18">Week 38 - Sept 14 to Sept 18</option>
                    <option value="Week 39 - Sept 21 to Sept 25">Week 39 - Sept 21 to Sept 25</option>
                    <option value="Week 40 - Sept 28 to Oct 2">Week 40 - Sept 28 to Oct 2</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-mono font-bold text-[#555046] uppercase tracking-wider mb-1.5">
                    STATUS
                  </label>
                  <select
                    value={leverStatus}
                    onChange={(e) => setLeverStatus(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#D6CFC2] rounded-xl text-xs font-semibold text-[#1C1C1A] focus:outline-none focus:ring-2 focus:ring-[#283523]/20 cursor-pointer"
                  >
                    <option value="On schedule">On schedule</option>
                    <option value="Delayed">Delayed</option>
                    <option value="Ready for delivery">Ready for delivery</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2 pt-1 border-t border-[#E6E1D7]/80">
                <p className="text-xs text-[#4F4B44] leading-relaxed">
                  If "Delayed", a reason + new week are required; the customer automatically receives the delay notice. Delivery week also updates partner scheduling.
                </p>
                <span className="px-2 py-0.5 bg-[#FDF2E3] text-[#A25A0B] rounded-md font-mono text-[10px] font-bold inline-block">
                  → PARTNER
                </span>
              </div>
            </div>

            {/* CARD 3: Internal notes */}
            <div className="bg-[#FAF8F5] border border-[#E6E1D7] rounded-2xl p-4 sm:p-5 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-[#1C1C1A]">
                  Internal Notes
                </h3>
                <span className="px-2.5 py-0.5 bg-[#EAE7DF] text-[#3E3A33] rounded-md font-mono text-[10px] font-bold">
                  INTERNAL
                </span>
              </div>

              <textarea
                rows={2}
                value={interneNotities}
                onChange={(e) => setInterneNotities(e.target.value)}
                className="w-full p-3 bg-white border border-[#D6CFC2] rounded-xl text-xs font-semibold text-[#1C1C1A] focus:outline-none focus:ring-2 focus:ring-[#283523]/20 leading-relaxed"
              />

              <p className="text-xs text-[#615C52] italic">
                Never visible to customer or partner.
              </p>
            </div>

          </div>

          {/* RIGHT COLUMN */}
          {renderRightRail()}

        </div>
      )}

      {/* TAB 2: CUSTOMER ACTIONS (EXACT MATCH TO SCREENSHOT 2) */}
      {activeTab === 'Customer Actions' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          
          {/* LEFT COLUMN: 7 COLUMNS */}
          <div className="lg:col-span-7 space-y-5">
            
            {/* CARD 1: Open customer actions */}
            <div className="bg-[#FAF8F5] border border-[#E6E1D7] rounded-2xl p-4 sm:p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-[#1C1C1A]">
                  Open customer actions
                </h3>
                <span className="px-2.5 py-0.5 bg-[#E3EFE3] text-[#1E561E] rounded-md font-mono text-[10px] font-bold">
                  → CUSTOMER
                </span>
              </div>

              <p className="text-xs text-[#4F4B44] leading-relaxed">
                Every action here appears in the customer's action block, with a single button and notification. Completed actions write back to this overview.
              </p>

              {/* ACTION LIST CARDS */}
              <div className="space-y-3">
                {customerActions.map((action) => {
                  const isOpen = action.status === 'Open';
                  return (
                    <div 
                      key={action.id} 
                      className="p-4 bg-white border border-[#D6CFC2] rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
                    >
                      <div className="flex items-start gap-3">
                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold font-mono whitespace-nowrap mt-0.5 ${
                          isOpen 
                            ? 'bg-[#FDF2E3] text-[#9E5507] border border-[#F6DCB8]' 
                            : 'bg-[#F4F1EA] text-[#555046] border border-[#D6CFC2]'
                        }`}>
                          {isOpen ? '● Open' : '✓ Completed'}
                        </span>
                        
                        <div>
                          <h4 className="font-bold text-sm text-[#1C1C1A]">
                            {action.title}
                          </h4>
                          <p className="text-xs text-[#4F4B44] font-medium mt-0.5">
                            {action.subtitle}
                          </p>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2 self-start sm:self-center">
                        {isOpen ? (
                          <>
                            <button
                              onClick={() => handleRemindAction(action.title)}
                              className="px-3.5 py-1.5 bg-white hover:bg-[#FAF8F5] text-[#1C1C1A] border border-[#D6CFC2] rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer"
                            >
                              Remind now
                            </button>
                            <button
                              onClick={() => handleCancelAction(action.id)}
                              className="px-2.5 py-1.5 text-[#615C52] hover:text-[#1C1C1A] text-xs font-bold transition-all cursor-pointer"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => showToast('Viewing completion checklist details...')}
                            className="px-3.5 py-1.5 bg-white hover:bg-[#FAF8F5] text-[#1C1C1A] border border-[#D6CFC2] rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer"
                          >
                            View
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* + NEW CUSTOMER ACTION BUTTON */}
              <div className="pt-1">
                <button
                  onClick={() => setActionModal(true)}
                  className="px-4 py-2 bg-[#283523] hover:bg-[#1E291B] text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New customer action</span>
                </button>
              </div>

              <p className="text-xs text-[#555046] pt-1">
                Fixed types: approve proposal · payment · confirm completion · custom field (with button text)
              </p>
            </div>

            {/* CARD 2: Automatic follow-up */}
            <div className="bg-[#FAF8F5] border border-[#E6E1D7] rounded-2xl p-4 sm:p-5 shadow-2xs space-y-4">
              <h3 className="font-bold text-sm text-[#1C1C1A]">
                Automatic follow-up
              </h3>

              <div className="space-y-3.5">
                {/* Switch 1 */}
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div 
                    onClick={() => setFollowUpWhatsApp(!followUpWhatsApp)}
                    className={`w-10 h-5 flex items-center rounded-full p-0.5 transition-colors duration-200 ease-in-out cursor-pointer ${
                      followUpWhatsApp ? 'bg-[#283523]' : 'bg-[#D6CFC2]'
                    }`}
                  >
                    <div 
                      className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
                        followUpWhatsApp ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </div>
                  <span className="text-xs font-medium text-[#1C1C1A] select-none">
                    Reminder after 3 days without response (WhatsApp, in our tone)
                  </span>
                </label>

                {/* Switch 2 */}
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div 
                    onClick={() => setFollowUpCall(!followUpCall)}
                    className={`w-10 h-5 flex items-center rounded-full p-0.5 transition-colors duration-200 ease-in-out cursor-pointer ${
                      followUpCall ? 'bg-[#283523]' : 'bg-[#D6CFC2]'
                    }`}
                  >
                    <div 
                      className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
                        followUpCall ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </div>
                  <span className="text-xs font-medium text-[#1C1C1A] select-none">
                    Task for us after 6 days without response ("give a call")
                  </span>
                </label>

                {/* Switch 3 */}
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div 
                    onClick={() => setFollowUpBanner(!followUpBanner)}
                    className={`w-10 h-5 flex items-center rounded-full p-0.5 transition-colors duration-200 ease-in-out cursor-pointer ${
                      followUpBanner ? 'bg-[#283523]' : 'bg-[#D6CFC2]'
                    }`}
                  >
                    <div 
                      className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
                        followUpBanner ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </div>
                  <span className="text-xs font-medium text-[#1C1C1A] select-none">
                    Escalation: show action as banner at top of customer portal
                  </span>
                </label>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN */}
          {renderRightRail()}

        </div>
      )}

      {/* TAB 3: DELIVERY (EXACT MATCH TO CLIENT LEVERING SCREENSHOT) */}
      {activeTab === 'Delivery' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          
          {/* LEFT COLUMN: 7 COLUMNS */}
          <div className="lg:col-span-7 space-y-5">
            
            {/* CARD 1: Delivery proposal (Leveringsvoorstel) */}
            <div className="bg-[#FAF8F5] border border-[#E6E1D7] rounded-2xl p-4 sm:p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-[#1C1C1A]">
                  Delivery proposal
                </h3>
                <div className="flex items-center gap-1.5 font-mono text-[10px] font-bold">
                  <span className="px-2.5 py-0.5 bg-[#E3EFE3] text-[#1E561E] rounded-md border border-[#C5E1C5]">
                    → CUSTOMER
                  </span>
                  <span className="px-2.5 py-0.5 bg-[#FDF2E3] text-[#A25A0B] rounded-md border border-[#F6DCB8]">
                    → PARTNER
                  </span>
                </div>
              </div>

              <p className="text-xs text-[#4F4B44] leading-relaxed">
                You prepare one proposal; the customer approves or requests a different day. Upon agreement: appointment fixed in planning + .ics to customer and work order update to partner.
              </p>

              <form onSubmit={handleSendDeliveryProposal} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-mono font-bold text-[#555046] uppercase tracking-wider mb-1.5">
                      DAY
                    </label>
                    <input
                      type="text"
                      value={deliveryProposalDay}
                      onChange={(e) => setDeliveryProposalDay(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-[#D6CFC2] rounded-xl text-xs font-semibold text-[#1C1C1A] focus:outline-none focus:ring-2 focus:ring-[#283523]/20"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono font-bold text-[#555046] uppercase tracking-wider mb-1.5">
                      TIME WINDOW
                    </label>
                    <input
                      type="text"
                      value={deliveryProposalTime}
                      onChange={(e) => setDeliveryProposalTime(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-[#D6CFC2] rounded-xl text-xs font-semibold text-[#1C1C1A] focus:outline-none focus:ring-2 focus:ring-[#283523]/20"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono font-bold text-[#555046] uppercase tracking-wider mb-1.5">
                      STATUS
                    </label>
                    <select
                      value={deliveryProposalStatus}
                      onChange={(e) => setDeliveryProposalStatus(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-[#D6CFC2] rounded-xl text-xs font-semibold text-[#1C1C1A] focus:outline-none focus:ring-2 focus:ring-[#283523]/20 cursor-pointer"
                    >
                      <option value="Awaiting customer agreement">Awaiting customer agreement</option>
                      <option value="Approved by customer">Approved by customer</option>
                      <option value="Alternative date requested">Alternative date requested</option>
                      <option value="Scheduled">Scheduled</option>
                    </select>
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#283523] hover:bg-[#1E291B] text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
                  >
                    Send proposal
                  </button>
                </div>

                <p className="text-xs text-[#555046]">
                  Customer request for another day appears here as a task with their explanation.
                </p>
              </form>
            </div>

            {/* CARD 2: Customer portal timeline steps (Tijdlijnstappen klantportaal) */}
            <div className="bg-[#FAF8F5] border border-[#E6E1D7] rounded-2xl p-4 sm:p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-[#1C1C1A]">
                  Customer portal timeline steps
                </h3>
                <span className="px-2.5 py-0.5 bg-[#E3EFE3] text-[#1E561E] rounded-md font-mono text-[10px] font-bold">
                  → CUSTOMER
                </span>
              </div>

              <p className="text-xs text-[#4F4B44] leading-relaxed">
                Standard steps per product type: dates are automatically populated from phase transitions. Only the explanation for the current step is a free text field.
              </p>

              {/* TIMELINE LIST */}
              <div className="space-y-2.5">
                {/* Step 1 */}
                <div className="p-3 bg-white border border-[#D6CFC2] rounded-xl flex items-center gap-3">
                  <span className="w-5 h-5 rounded-full bg-[#E3EFE3] text-[#1E561E] flex items-center justify-center text-xs font-bold">
                    ✓
                  </span>
                  <span className="text-xs font-bold text-[#1C1C1A]">
                    Materials received <span className="font-medium text-[#4F4B44]">— August 14</span>
                  </span>
                </div>

                {/* Step 2 (Current) */}
                <div className="p-3 bg-white border border-[#D6CFC2] rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="flex items-start sm:items-center gap-3">
                    <span className="px-2 py-0.5 rounded-md bg-[#FDF2E3] text-[#9E5507] border border-[#F6DCB8] text-[10px] font-bold font-mono whitespace-nowrap">
                      ● now
                    </span>
                    <p className="text-xs font-medium text-[#1C1C1A]">
                      <span className="font-bold text-[#1C1C1A]">In the workshop</span> — note: <span className="italic font-semibold text-[#1C1C1A]">"{timelineStepNote}"</span>
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setTempTimelineNote(timelineStepNote);
                      setEditNoteModal(true);
                    }}
                    className="px-3 py-1.5 bg-white hover:bg-[#FAF8F5] text-[#1C1C1A] border border-[#D6CFC2] rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer self-start sm:self-auto"
                  >
                    Edit
                  </button>
                </div>

                {/* Step 3 */}
                <div className="p-3 bg-white border border-[#D6CFC2] rounded-xl flex items-center gap-3">
                  <span className="w-5 h-5 rounded-full bg-[#EDE8DF] text-[#555046] flex items-center justify-center text-xs font-bold">
                    -
                  </span>
                  <span className="text-xs font-bold text-[#1C1C1A]">
                    Final inspection <span className="font-medium text-[#4F4B44]">— expected around September 10</span>
                  </span>
                </div>
              </div>

            </div>

          </div>

          {/* RIGHT COLUMN */}
          {renderRightRail()}

        </div>
      )}

      {/* TAB 4: MEDIA & DOCUMENTS (EXACT MATCH TO CLIENT SCREENSHOT) */}
      {activeTab === 'Media & Documents' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          
          {/* LEFT COLUMN: 7 COLUMNS */}
          <div className="lg:col-span-7 space-y-5">
            
            {/* CARD 1: Photos from the workshop (Foto's uit de werkplaats) */}
            <div className="bg-[#FAF8F5] border border-[#E6E1D7] rounded-2xl p-4 sm:p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-[#1C1C1A]">
                  Photos from the workshop
                </h3>
                <span className="px-2.5 py-0.5 bg-[#E3EFE3] text-[#1E561E] rounded-md font-mono text-[10px] font-bold">
                  → CUSTOMER
                </span>
              </div>

              <p className="text-xs text-[#4F4B44] leading-relaxed">
                Upload with mandatory title + 1-2 lines of text in customer language. Publishing = visible in customer portal + notification. Photos from partners arrive here first for review.
              </p>

              {/* PHOTO ITEMS LIST */}
              <div className="space-y-4">
                {photosList.map((photo) => (
                  <div 
                    key={photo.id}
                    className="p-3.5 bg-white border border-[#D6CFC2] rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
                  >
                    <div className="flex items-start sm:items-center gap-3.5 flex-1">
                      {/* Realistic wood texture thumbnail */}
                      <div className="w-16 h-14 rounded-lg bg-gradient-to-r from-[#8B5A2B] via-[#A0522D] to-[#8B4513] border border-[#6d3c19] flex-shrink-0 flex items-center justify-evenly p-1 shadow-inner relative overflow-hidden">
                        <div className="w-[1px] h-full bg-[#5c2e0b]/40" />
                        <div className="w-[1px] h-full bg-[#5c2e0b]/40" />
                        <div className="w-[1px] h-full bg-[#5c2e0b]/40" />
                        <div className="w-[1px] h-full bg-[#5c2e0b]/40" />
                        <div className="absolute inset-0 bg-black/10 hover:bg-transparent transition-all" />
                      </div>

                      <div className="space-y-1 flex-1">
                        <h4 className="font-bold text-sm text-[#1C1C1A]">
                          {photo.title}
                        </h4>
                        <p className="text-xs text-[#4F4B44] font-medium">
                          {photo.date} · {photo.published ? 'published' : 'draft — not yet visible to customer'} · source: {photo.source}
                        </p>

                        {!photo.published && (
                          <div className="pt-1.5 flex flex-col sm:flex-row sm:items-center gap-2">
                            <input
                              type="text"
                              placeholder="Short note for the customer (mandatory)"
                              value={draftPhotoNote}
                              onChange={(e) => setDraftPhotoNote(e.target.value)}
                              className="flex-1 px-3 py-1.5 bg-[#FAF8F5] border border-[#D6CFC2] rounded-lg text-xs font-semibold text-[#1C1C1A] focus:outline-none focus:ring-2 focus:ring-[#283523]/20"
                            />
                            <button
                              onClick={() => handlePublishPhoto(photo.id)}
                              className="px-4 py-1.5 bg-[#283523] hover:bg-[#1E291B] text-white text-xs font-bold rounded-lg shadow-xs transition-all cursor-pointer whitespace-nowrap self-start sm:self-auto"
                            >
                              Publish
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {photo.published && (
                      <span className="px-2.5 py-1 bg-[#E3EFE3] text-[#1E561E] rounded-md font-mono text-[10px] font-bold whitespace-nowrap self-start sm:self-center border border-[#C5E1C5]">
                        ✓ Live
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* CARD 2: Documents & drawings (Documenten & tekening) */}
            <div className="bg-[#FAF8F5] border border-[#E6E1D7] rounded-2xl p-4 sm:p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-[#1C1C1A]">
                  Documents & drawings
                </h3>
                <div className="flex items-center gap-1.5 font-mono text-[10px] font-bold">
                  <span className="px-2.5 py-0.5 bg-[#E3EFE3] text-[#1E561E] rounded-md border border-[#C5E1C5]">
                    → CUSTOMER
                  </span>
                  <span className="px-2.5 py-0.5 bg-[#FDF2E3] text-[#A25A0B] rounded-md border border-[#F6DCB8]">
                    → PARTNER
                  </span>
                </div>
              </div>

              {/* DOCUMENT ITEMS LIST */}
              <div className="space-y-3">
                {documentsList.map((doc) => (
                  <div 
                    key={doc.id}
                    className="p-3.5 bg-white border border-[#D6CFC2] rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
                  >
                    <div className="flex items-start gap-3">
                      <span className="px-2 py-1 bg-[#F4F1EA] text-[#3E3A33] rounded-md font-mono text-[9px] font-bold uppercase tracking-wider border border-[#D6CFC2] whitespace-nowrap mt-0.5">
                        {doc.type}
                      </span>
                      <div>
                        <h4 className="font-bold text-sm text-[#1C1C1A]">
                          {doc.title}
                        </h4>
                        <p className="text-xs text-[#4F4B44] font-medium mt-0.5">
                          {doc.subtitle}
                        </p>
                      </div>
                    </div>

                    {/* Right side toggles / status badges */}
                    <div className="flex items-center gap-3.5 self-start sm:self-center">
                      {doc.customerVisible !== undefined && doc.partnerVisible !== undefined && (
                        <div className="flex items-center gap-3 text-xs font-semibold text-[#1C1C1A]">
                          {/* Customer Toggle */}
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-medium text-[#4F4B44]">customer</span>
                            <div 
                              onClick={() => handleToggleDocCustomer(doc.id)}
                              className={`w-8 h-4 flex items-center rounded-full p-0.5 transition-colors duration-200 cursor-pointer ${
                                doc.customerVisible ? 'bg-[#283523]' : 'bg-[#D6CFC2]'
                              }`}
                            >
                              <div 
                                className={`bg-white w-3 h-3 rounded-full shadow-md transform transition-transform duration-200 ${
                                  doc.customerVisible ? 'translate-x-4' : 'translate-x-0'
                                }`}
                              />
                            </div>
                          </div>

                          {/* Partner Toggle */}
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-medium text-[#4F4B44]">partner</span>
                            <div 
                              onClick={() => handleToggleDocPartner(doc.id)}
                              className={`w-8 h-4 flex items-center rounded-full p-0.5 transition-colors duration-200 cursor-pointer ${
                                doc.partnerVisible ? 'bg-[#283523]' : 'bg-[#D6CFC2]'
                              }`}
                            >
                              <div 
                                className={`bg-white w-3 h-3 rounded-full shadow-md transform transition-transform duration-200 ${
                                  doc.partnerVisible ? 'translate-x-4' : 'translate-x-0'
                                }`}
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {doc.isLive && (
                        <span className="px-2.5 py-1 bg-[#E3EFE3] text-[#1E561E] rounded-md font-mono text-[10px] font-bold border border-[#C5E1C5]">
                          ✓ Live
                        </span>
                      )}

                      {doc.partnerOnly && (
                        <span className="px-2.5 py-1 bg-[#FDF2E3] text-[#A25A0B] rounded-md font-mono text-[10px] font-bold border border-[#F6DCB8]">
                          → PARTNER
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* + Upload document button */}
              <div className="pt-1 border-t border-[#E6E1D7]/80">
                <button
                  onClick={() => setUploadDocModal(true)}
                  className="px-4 py-2 bg-white hover:bg-[#FAF8F5] text-[#1C1C1A] border border-[#D6CFC2] rounded-xl text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Upload document</span>
                </button>
              </div>

            </div>

          </div>

          {/* RIGHT COLUMN */}
          {renderRightRail()}

        </div>
      )}

      {/* TAB 5: PAYMENTS (Exact Match to Client Requirements: Sent Date, Paid Date, Direct Send Action) */}
      {activeTab === 'Payments' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          <div className="lg:col-span-7 space-y-5">
            {/* Header Box with Routing Scope */}
            <div className="bg-[#FAF8F5] border border-[#E6E1D7] rounded-2xl p-5 shadow-2xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E6E1D7] pb-3">
                <div>
                  <h3 className="font-bold text-base text-[#1C1C1A]">
                    Payment Schedule & Invoices (50% / 50% Scheme)
                  </h3>
                  <p className="text-xs text-[#555046] mt-0.5">
                    Total project sum: <strong className="text-[#1C1C1A]">€ 3,920.00 incl. VAT</strong> · Source: Bookkeeping & Invoices
                  </p>
                </div>
                <span className="px-2.5 py-1 bg-[#E3EFE3] text-[#1E561E] rounded-md font-mono text-[10px] font-bold border border-[#C5E1C5] self-start sm:self-center">
                  → CUSTOMER & BOEKHOUDING
                </span>
              </div>

              {/* Installment Invoices List */}
              <div className="space-y-4">
                
                {/* 1. DEPOSIT INVOICE (PAID) */}
                <div className="p-4 bg-white border border-[#D6CFC2] rounded-xl space-y-3 shadow-2xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-[#EDE8DF] text-[#3E3A33] rounded font-mono text-[11px] font-bold">
                        #INV-2026-041
                      </span>
                      <h4 className="font-bold text-sm text-[#1C1C1A]">
                        50% Deposit (Aanbetaling bij akkoord)
                      </h4>
                    </div>
                    <span className="font-bold text-[#1C1C1A] text-sm">
                      € 1,960.00 <span className="text-[10px] font-normal text-[#555046]">incl. VAT</span>
                    </span>
                  </div>

                  {/* Lifecycle Tracking Dates */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs py-2 px-3 bg-[#FAF8F5] rounded-lg border border-[#E6E1D7]">
                    <div className="flex items-center gap-1.5 text-[#33422C]">
                      <span>📅</span>
                      <span><strong>Invoice Sent:</strong> Aug 11, 2026</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-emerald-800 font-semibold">
                      <span>🟢</span>
                      <span><strong>Paid:</strong> Aug 12, 2026 (via iDEAL)</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 text-xs">
                    <span className="text-emerald-700 font-bold flex items-center gap-1">
                      <span>✔</span> Fully settled & verified in bank
                    </span>
                    <button
                      onClick={() => showToast('Downloading PDF for Invoice #INV-2026-041...')}
                      className="px-3 py-1 bg-white hover:bg-[#FAF8F5] text-[#1C1C1A] border border-[#D6CFC2] rounded-lg text-xs font-semibold shadow-2xs cursor-pointer flex items-center gap-1"
                    >
                      <span>📄 Download Invoice PDF</span>
                    </button>
                  </div>
                </div>

                {/* 2. FINAL INVOICE (UPON DELIVERY - CAN BE SENT DIRECTLY) */}
                <div className="p-4 bg-white border border-[#D6CFC2] rounded-xl space-y-3 shadow-2xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-[#EDE8DF] text-[#3E3A33] rounded font-mono text-[11px] font-bold">
                        #INV-2026-042
                      </span>
                      <h4 className="font-bold text-sm text-[#1C1C1A]">
                        50% Final Invoice (Slottermijn bij oplevering)
                      </h4>
                    </div>
                    <span className="font-bold text-[#1C1C1A] text-sm">
                      € 1,960.00 <span className="text-[10px] font-normal text-[#555046]">incl. VAT</span>
                    </span>
                  </div>

                  {/* Lifecycle Tracking Dates */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs py-2 px-3 bg-[#FAF8F5] rounded-lg border border-[#E6E1D7]">
                    <div className="flex items-center gap-1.5">
                      {finalInvoiceSent ? (
                        <span className="text-[#33422C] font-semibold">
                          📅 <strong>Invoice Sent:</strong> {finalInvoiceSentDate}
                        </span>
                      ) : (
                        <span className="text-amber-800 font-semibold">
                          ⚠️ <strong>Invoice:</strong> Not yet sent to customer
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5">
                      {finalInvoiceSent ? (
                        <span className="text-amber-800 font-semibold">
                          🟡 <strong>Status:</strong> Open · Awaiting payment (Due in 14 days)
                        </span>
                      ) : (
                        <span className="text-[#555046]">
                          ⏳ <strong>Due:</strong> Upon completion / delivery
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action Row */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 text-xs">
                    <p className="text-[#555046] text-[11px]">
                      {finalInvoiceSent 
                        ? 'Invoice is published in Customer Portal with online payment link.' 
                        : 'Can be dispatched directly to customer from this project environment.'}
                    </p>

                    {finalInvoiceSent ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => showToast('Payment reminder sent to customer Sander de Vries!')}
                          className="px-3 py-1.5 bg-white hover:bg-[#FAF8F5] text-[#1C1C1A] border border-[#D6CFC2] rounded-xl text-xs font-semibold shadow-2xs cursor-pointer"
                        >
                          🔔 Send Reminder
                        </button>
                        <button
                          onClick={() => showToast('Payment link copied to clipboard!')}
                          className="px-3 py-1.5 bg-[#283523] text-white hover:bg-[#1E291B] rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                        >
                          📋 Copy Payment Link
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={handleSendFinalInvoice}
                        className="px-4 py-2 bg-[#283523] hover:bg-[#1E291B] text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
                      >
                        <span>🚀 Send Invoice Directly</span>
                      </button>
                    )}
                  </div>
                </div>

              </div>
            </div>
          </div>
          {renderRightRail()}
        </div>
      )}

      {/* TAB 6: MESSAGES (TWO STRICTLY SEPARATED CHANNELS - EXACT MATCH TO CLIENT SCREENSHOT) */}
      {activeTab === 'Messages' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          
          {/* LEFT 7 COLUMNS: TWO CHAT CHANNELS SIDE BY SIDE */}
          <div className="lg:col-span-7 space-y-4">
            
            {/* TOP NOTICE BANNER */}
            <div className="bg-[#FAF8F5] border border-[#E6E1D7] rounded-2xl p-4 shadow-2xs text-xs font-medium leading-relaxed text-[#2E2B25]">
              <p>
                <strong className="text-[#1C1C1A] font-bold">Two strictly separated channels.</strong> The customer chat is the same thread as "Messages & contact" in the customer portal; the partner chat goes to the partner (portal notification + WhatsApp mirror). A message can never end up in the wrong channel: one composer per column, with fixed color and label. Forwarding can only be done intentionally via "Share with partner" — and that is logged in the logbook.
              </p>
            </div>

            {/* TWO COLUMNS CHAT BOXES */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* CHAT COLUMN 1: Chat with customer */}
              <div className="bg-[#FAF8F5] border border-[#E6E1D7] rounded-2xl p-4 shadow-2xs flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-[#E6E1D7]/80 pb-2">
                    <h3 className="font-bold text-xs text-[#1C1C1A]">
                      Chat with customer
                    </h3>
                    <span className="px-2 py-0.5 bg-[#E3EFE3] text-[#1E561E] rounded-md font-mono text-[9px] font-bold border border-[#C5E1C5]">
                      → CUSTOMER · SANDER DE VRIES
                    </span>
                  </div>

                  {/* Message Thread */}
                  <div className="space-y-3 min-h-[220px]">
                    {customerMessagesList.map((msg) => (
                      <div key={msg.id} className="space-y-1">
                        <div className={`flex items-start gap-2 ${msg.role === 'admin' ? 'justify-end' : 'justify-start'}`}>
                          {msg.role !== 'admin' && (
                            <div className="w-6 h-6 rounded-full bg-[#5A5038] text-white flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">
                              {msg.initials}
                            </div>
                          )}

                          <div className={`p-3 rounded-xl text-xs font-medium leading-relaxed max-w-[85%] ${
                            msg.role === 'admin' 
                              ? 'bg-[#283523] text-white rounded-tr-xs' 
                              : 'bg-[#EDE8DF] text-[#1C1C1A] rounded-tl-xs'
                          }`}>
                            {msg.text}
                          </div>

                          {msg.role === 'admin' && (
                            <div className="w-6 h-6 rounded-full bg-[#5A5038] text-white flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">
                              {msg.initials}
                            </div>
                          )}
                        </div>

                        <div className={`text-[9px] font-mono font-semibold text-[#555046] ${msg.role === 'admin' ? 'text-right pr-8' : 'pl-8'}`}>
                          {msg.time}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Actions under customer messages */}
                  <div className="flex items-center justify-between pt-1 border-t border-[#E6E1D7]/80 text-xs">
                    <button
                      onClick={handleShareWithPartner}
                      className="text-[#1C1C1A] hover:underline font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <CornerDownRight className="w-3.5 h-3.5 text-[#9A7B44]" />
                      <span>Share with partner</span>
                    </button>

                    <div className="relative">
                      <button
                        onClick={() => setQuickReplyOpen(!quickReplyOpen)}
                        className="text-[#4F4B44] hover:text-[#1C1C1A] font-bold flex items-center gap-1 cursor-pointer text-xs"
                      >
                        <span>Quick reply</span>
                        <ChevronDown className="w-3 h-3" />
                      </button>

                      {quickReplyOpen && (
                        <div className="absolute right-0 bottom-6 bg-white border border-[#D6CFC2] rounded-xl shadow-lg p-1.5 z-20 w-48 space-y-1 text-xs">
                          <div 
                            onClick={() => {
                              setInputCustomerMsg("We are on schedule! We'll send you an update soon.");
                              setQuickReplyOpen(false);
                            }}
                            className="p-1.5 hover:bg-[#FAF8F5] rounded-lg cursor-pointer text-[#1C1C1A] font-medium"
                          >
                            "We are on schedule..."
                          </div>
                          <div 
                            onClick={() => {
                              setInputCustomerMsg("Checking with the workshop now.");
                              setQuickReplyOpen(false);
                            }}
                            className="p-1.5 hover:bg-[#FAF8F5] rounded-lg cursor-pointer text-[#1C1C1A] font-medium"
                          >
                            "Checking with workshop..."
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Input composer for Customer */}
                <div className="space-y-2 pt-2 border-t border-[#E6E1D7]">
                  <form onSubmit={handleSendCustomerMessage} className="flex items-center gap-1.5">
                    <input
                      type="text"
                      placeholder="Message to the customer..."
                      value={inputCustomerMsg}
                      onChange={(e) => setInputCustomerMsg(e.target.value)}
                      className="flex-1 px-3 py-2 bg-white border border-[#D6CFC2] rounded-xl text-xs font-semibold text-[#1C1C1A] focus:outline-none focus:ring-2 focus:ring-[#283523]/20"
                    />
                    <button
                      type="button"
                      onClick={() => showToast('Attachment options opened')}
                      className="p-2 bg-white hover:bg-[#FAF8F5] border border-[#D6CFC2] rounded-xl text-[#4F4B44] cursor-pointer"
                    >
                      <Paperclip className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="submit"
                      className="px-3.5 py-2 bg-[#283523] hover:bg-[#1E291B] text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
                    >
                      Send
                    </button>
                  </form>

                  <p className="text-[10px] text-[#555046] leading-tight font-medium">
                    Customer automatically receives a WhatsApp/email notification with deeplink. If the customer replies via WhatsApp, the message also arrives here (one thread, two entry points).
                  </p>
                </div>
              </div>

              {/* CHAT COLUMN 2: Chat with partner */}
              <div className="bg-[#FAF8F5] border border-[#E6E1D7] rounded-2xl p-4 shadow-2xs flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-[#E6E1D7]/80 pb-2">
                    <h3 className="font-bold text-xs text-[#1C1C1A]">
                      Chat with partner
                    </h3>
                    <span className="px-2 py-0.5 bg-[#FDF2E3] text-[#A25A0B] rounded-md font-mono text-[9px] font-bold border border-[#F6DCB8]">
                      → PARTNER · SVEN (HOEK BOUW)
                    </span>
                  </div>

                  {/* Message Thread */}
                  <div className="space-y-3 min-h-[220px]">
                    {partnerMessagesList.map((msg) => (
                      <div key={msg.id} className="space-y-1">
                        <div className={`flex items-start gap-2 ${msg.role === 'admin' ? 'justify-end' : 'justify-start'}`}>
                          {msg.role !== 'admin' && (
                            <div className="w-6 h-6 rounded-full bg-[#5A5038] text-white flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">
                              {msg.initials}
                            </div>
                          )}

                          <div className={`p-3 rounded-xl text-xs font-medium leading-relaxed max-w-[85%] ${
                            msg.role === 'admin' 
                              ? 'bg-[#283523] text-white rounded-tr-xs' 
                              : 'bg-[#EDE8DF] text-[#1C1C1A] rounded-tl-xs'
                          }`}>
                            {msg.text}
                          </div>

                          {msg.role === 'admin' && (
                            <div className="w-6 h-6 rounded-full bg-[#5A5038] text-white flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">
                              {msg.initials}
                            </div>
                          )}
                        </div>

                        <div className={`text-[9px] font-mono font-semibold text-[#555046] ${msg.role === 'admin' ? 'text-right pr-8' : 'pl-8'}`}>
                          {msg.time}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Input composer for Partner */}
                <div className="space-y-2 pt-2 border-t border-[#E6E1D7]">
                  <form onSubmit={handleSendPartnerMessage} className="flex items-center gap-1.5">
                    <input
                      type="text"
                      placeholder="Message to the partner..."
                      value={inputPartnerMsg}
                      onChange={(e) => setInputPartnerMsg(e.target.value)}
                      className="flex-1 px-3 py-2 bg-white border border-[#D6CFC2] rounded-xl text-xs font-semibold text-[#1C1C1A] focus:outline-none focus:ring-2 focus:ring-[#9A7B44]/20"
                    />
                    <button
                      type="button"
                      onClick={() => showToast('Partner attachment options opened')}
                      className="p-2 bg-white hover:bg-[#FAF8F5] border border-[#D6CFC2] rounded-xl text-[#4F4B44] cursor-pointer"
                    >
                      <Paperclip className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="submit"
                      className="px-3.5 py-2 bg-[#9A7B44] hover:bg-[#856835] text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
                    >
                      Send
                    </button>
                  </form>

                  <p className="text-[10px] text-[#555046] leading-tight font-medium">
                    Partner receives a WhatsApp mirror: photos sent by the partner here appear in Media as draft (never directly to the customer). Reference to the work order can be done with #workorder.
                  </p>
                </div>
              </div>

            </div>

          </div>

          {/* RIGHT COLUMN */}
          {renderRightRail()}

        </div>
      )}

      {/* TAB 7: PARTNER (EXACT MATCH TO CLIENT PARTNER SCREENSHOT) */}
      {activeTab === 'Partner' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          
          {/* LEFT 7 COLUMNS */}
          <div className="lg:col-span-7 space-y-5">
            
            {/* CARD 1: Assignment to partner (Opdracht aan partner) */}
            <div className="bg-[#FAF8F5] border border-[#E6E1D7] rounded-2xl p-4 sm:p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-[#1C1C1A]">
                  Assignment to partner
                </h3>
                <span className="px-2.5 py-0.5 bg-[#FDF2E3] text-[#A25A0B] rounded-md font-mono text-[10px] font-bold border border-[#F6DCB8]">
                  → PARTNER
                </span>
              </div>

              <form onSubmit={handleUpdateWorkOrder} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Select Partner */}
                  <div>
                    <label className="block text-[11px] font-mono font-bold text-[#555046] uppercase tracking-wider mb-1.5">
                      PARTNER
                    </label>
                    <select
                      value={partnerSelected}
                      onChange={(e) => setPartnerSelected(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-[#D6CFC2] rounded-xl text-xs font-semibold text-[#1C1C1A] focus:outline-none focus:ring-2 focus:ring-[#283523]/20 cursor-pointer"
                    >
                      <option value="Sven Hoek · Hoek Bouw">Sven Hoek · Hoek Bouw</option>
                      <option value="Jan Bakker · Bakker Houtbouw">Jan Bakker · Bakker Houtbouw</option>
                    </select>
                  </div>

                  {/* Partner Amount */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-[11px] font-mono font-bold text-[#555046] uppercase tracking-wider">
                        PARTNER AMOUNT (EXCL. VAT)
                      </label>
                      <span className="px-1.5 py-0.2 bg-[#EAE7DF] text-[#3E3A33] rounded text-[9px] font-bold font-mono">
                        INTERNAL
                      </span>
                    </div>
                    <input
                      type="text"
                      value={partnerAmount}
                      onChange={(e) => setPartnerAmount(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-[#D6CFC2] rounded-xl text-xs font-semibold text-[#1C1C1A] focus:outline-none focus:ring-2 focus:ring-[#283523]/20"
                    />
                  </div>

                  {/* Status Assignment */}
                  <div>
                    <label className="block text-[11px] font-mono font-bold text-[#555046] uppercase tracking-wider mb-1.5">
                      ASSIGNMENT STATUS
                    </label>
                    <select
                      value={partnerAssignmentStatus}
                      onChange={(e) => setPartnerAssignmentStatus(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-[#D6CFC2] rounded-xl text-xs font-semibold text-[#1C1C1A] focus:outline-none focus:ring-2 focus:ring-[#283523]/20 cursor-pointer"
                    >
                      <option value="In production">In production</option>
                      <option value="Preparation">Preparation</option>
                      <option value="Completed">Completed</option>
                      <option value="On hold">On hold</option>
                    </select>
                  </div>
                </div>

                {/* Work description (Work order) */}
                <div>
                  <label className="block text-[11px] font-mono font-bold text-[#555046] uppercase tracking-wider mb-1.5">
                    WORK DESCRIPTION (WORK ORDER)
                  </label>
                  <textarea
                    rows={3}
                    value={partnerWorkDescription}
                    onChange={(e) => setPartnerWorkDescription(e.target.value)}
                    className="w-full p-3 bg-white border border-[#D6CFC2] rounded-xl text-xs font-semibold text-[#1C1C1A] focus:outline-none focus:ring-2 focus:ring-[#283523]/20 leading-relaxed"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#283523] hover:bg-[#1E291B] text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
                  >
                    Update work order
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      showToast('Opening Trello board for Hoek Bouw...');
                    }}
                    className="px-3.5 py-2 bg-white hover:bg-[#FAF8F5] text-[#1C1C1A] border border-[#D6CFC2] rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer"
                  >
                    Open Trello card
                  </button>
                </div>
              </form>
            </div>

            {/* CARD 2: What the partner sees — and what not (Dit ziet de partner — en dit niet) */}
            <div className="bg-[#FAF8F5] border border-[#E6E1D7] rounded-2xl p-4 sm:p-5 shadow-2xs space-y-4">
              <h3 className="font-bold text-sm text-[#1C1C1A]">
                What the partner sees — and what not
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                
                {/* Box 1: Included in the work order */}
                <div className="p-4 bg-white border border-[#D6CFC2] rounded-xl space-y-2.5 text-xs shadow-2xs">
                  <h4 className="font-bold text-[#1C1C1A]">
                    Included in the work order
                  </h4>
                  <ul className="space-y-2 text-[#2E2B25] font-medium">
                    <li className="flex items-start gap-2">
                      <span className="text-[#1E561E] font-bold">✓</span>
                      <span>Specification, drawing v2, dimensions and options</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#1E561E] font-bold">✓</span>
                      <span>Partner amount and payment agreement VA→partner</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#1E561E] font-bold">✓</span>
                      <span>Delivery date/time window + address and accessibility</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#1E561E] font-bold">✓</span>
                      <span>Photo requests ("send 1 photo per phase")</span>
                    </li>
                  </ul>
                </div>

                {/* Box 2: Never to the partner */}
                <div className="p-4 bg-white border border-[#E6E1D7] border-dashed rounded-xl space-y-2.5 text-xs shadow-2xs">
                  <h4 className="font-bold text-[#A25A0B]">
                    Never to the partner
                  </h4>
                  <ul className="space-y-2 text-[#4F4B44] font-medium">
                    <li className="flex items-start gap-2">
                      <span className="text-[#A25A0B] font-bold">✕</span>
                      <span>Customer price and margin</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#A25A0B] font-bold">✕</span>
                      <span>Direct contact details of the customer*</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#A25A0B] font-bold">✕</span>
                      <span>Internal notes and lead history</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#A25A0B] font-bold">✕</span>
                      <span>Payment status of the customer</span>
                    </li>
                  </ul>
                </div>

              </div>

              {/* Footnote note */}
              <p className="text-xs text-[#4F4B44] font-medium leading-relaxed pt-1 border-t border-[#E6E1D7]/80">
                * Address yes (required for delivery); phone number only visible on delivery day itself. All customer communication goes through Tim & Bram — this protects the position as primary point of contact and the revenue model.
              </p>
            </div>

          </div>

          {/* RIGHT COLUMN */}
          {renderRightRail()}

        </div>
      )}

      {/* FLOATING PROJECTCHAT WIDGET BUTTON */}
      <button
        onClick={() => setChatOpen(true)}
        className="fixed bottom-6 right-6 z-50 bg-[#283523] hover:bg-[#1E291B] text-white px-4 py-2.5 rounded-full shadow-2xl flex items-center gap-2 cursor-pointer font-semibold text-xs border border-white/20 transition-all transform hover:scale-105"
      >
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span>💬 Project Chat</span>
        <span className="px-1.5 py-0.2 bg-amber-500 text-white font-mono text-[10px] font-bold rounded-full">
          3
        </span>
      </button>

      {/* UPLOAD DOCUMENT MODAL */}
      <AnimatePresence>
        {uploadDocModal && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-[#D6CFC2]"
            >
              <div className="flex items-center justify-between border-b border-[#D6CFC2] pb-3">
                <h3 className="font-bold text-base text-[#1C1C1A]">
                  Upload Document or Drawing
                </h3>
                <button onClick={() => setUploadDocModal(false)} className="text-[#615C52] hover:text-[#1C1C1A] cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleUploadDoc} className="space-y-4 text-xs">
                <div>
                  <label className="block text-[11px] font-mono font-bold text-[#555046] uppercase tracking-wider mb-1.5">
                    Document Type
                  </label>
                  <select
                    value={newDocType}
                    onChange={(e) => setNewDocType(e.target.value)}
                    className="w-full p-2.5 bg-[#FAF8F5] border border-[#D6CFC2] rounded-xl text-xs font-semibold text-[#1C1C1A] focus:outline-none focus:ring-2 focus:ring-[#283523]/20 cursor-pointer"
                  >
                    <option value="DRAWING">DRAWING (TEKENING)</option>
                    <option value="INVOICE">INVOICE (FACTUUR)</option>
                    <option value="WORK ORDER">WORK ORDER (WERKBON)</option>
                    <option value="SPECIFICATION">SPECIFICATION (SPECIFICATIE)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-mono font-bold text-[#555046] uppercase tracking-wider mb-1.5">
                    Document Title
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Working drawing version 3 (revised)"
                    value={newDocTitle}
                    onChange={(e) => setNewDocTitle(e.target.value)}
                    className="w-full p-2.5 bg-[#FAF8F5] border border-[#D6CFC2] rounded-xl text-xs font-semibold text-[#1C1C1A] focus:outline-none focus:ring-2 focus:ring-[#283523]/20"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setUploadDocModal(false)}
                    className="px-4 py-2 bg-white border border-[#D6CFC2] text-[#4F4B44] rounded-xl text-xs font-bold hover:bg-[#FAF8F5] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#283523] text-white font-bold rounded-xl text-xs hover:bg-[#1E291B] cursor-pointer"
                  >
                    Upload Document
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* EDIT TIMELINE NOTE MODAL */}
      <AnimatePresence>
        {editNoteModal && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-[#D6CFC2]"
            >
              <div className="flex items-center justify-between border-b border-[#D6CFC2] pb-3">
                <h3 className="font-bold text-base text-[#1C1C1A]">
                  Edit Timeline Step Note
                </h3>
                <button onClick={() => setEditNoteModal(false)} className="text-[#615C52] hover:text-[#1C1C1A] cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveTimelineNote} className="space-y-4 text-xs">
                <div>
                  <label className="block text-[11px] font-mono font-bold text-[#555046] uppercase tracking-wider mb-1.5">
                    Step Explanation (In the workshop)
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={tempTimelineNote}
                    onChange={(e) => setTempTimelineNote(e.target.value)}
                    className="w-full p-3 bg-[#FAF8F5] border border-[#D6CFC2] rounded-xl text-xs font-semibold text-[#1C1C1A] focus:outline-none focus:ring-2 focus:ring-[#283523]/20"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditNoteModal(false)}
                    className="px-4 py-2 bg-white border border-[#D6CFC2] text-[#4F4B44] rounded-xl text-xs font-bold hover:bg-[#FAF8F5] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#283523] text-white font-bold rounded-xl text-xs hover:bg-[#1E291B] cursor-pointer"
                  >
                    Save Note
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* PROJECT CHAT DRAWER MODAL */}
      <ProjectChatDrawer
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
        projectCode="2026-014"
        clientName="Sander"
        partnerName="Sven"
        onShowToast={showToast}
      />

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
                <h3 className="font-bold text-base text-[#1C1C1A]">
                  Create New Outdoor Kitchen Project
                </h3>
                <button onClick={() => setNewProjectModal(false)} className="text-[#615C52] hover:text-[#1C1C1A] cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!newProjectClient.trim()) return;
                  setNewProjectModal(false);
                  showToast(`✓ New project for "${newProjectClient}" created successfully!`);
                }} 
                className="space-y-4 text-xs"
              >
                <div>
                  <label className="block text-[11px] font-mono font-bold text-[#555046] uppercase tracking-wider mb-1.5">
                    Customer Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Martijn van Dam"
                    value={newProjectClient}
                    onChange={(e) => setNewProjectClient(e.target.value)}
                    className="w-full p-2.5 bg-[#FAF8F5] border border-[#D6CFC2] rounded-xl text-xs font-semibold text-[#1C1C1A] focus:outline-none focus:ring-2 focus:ring-[#283523]/20"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-mono font-bold text-[#555046] uppercase tracking-wider mb-1.5">
                      Project Type
                    </label>
                    <select
                      value={newProjectType}
                      onChange={(e) => setNewProjectType(e.target.value)}
                      className="w-full p-2.5 bg-[#FAF8F5] border border-[#D6CFC2] rounded-xl text-xs font-semibold text-[#1C1C1A] focus:outline-none focus:ring-2 focus:ring-[#283523]/20 cursor-pointer"
                    >
                      <option value="Outdoor Kitchen">Outdoor Kitchen</option>
                      <option value="Garden Room">Garden Room</option>
                      <option value="Custom Carpentry">Custom Carpentry</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono font-bold text-[#555046] uppercase tracking-wider mb-1.5">
                      Budget / Agreed Price
                    </label>
                    <input
                      type="text"
                      value={newProjectBudget}
                      onChange={(e) => setNewProjectBudget(e.target.value)}
                      className="w-full p-2.5 bg-[#FAF8F5] border border-[#D6CFC2] rounded-xl text-xs font-semibold text-[#1C1C1A] focus:outline-none focus:ring-2 focus:ring-[#283523]/20"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setNewProjectModal(false)}
                    className="px-4 py-2 bg-white border border-[#D6CFC2] text-[#4F4B44] rounded-xl text-xs font-bold hover:bg-[#FAF8F5] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#283523] text-white font-bold rounded-xl text-xs hover:bg-[#1E291B] cursor-pointer"
                  >
                    Create Project
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* PHASE UPDATE MODAL */}
      <AnimatePresence>
        {phaseModal && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-[#D6CFC2]"
            >
              <div className="flex items-center justify-between border-b border-[#D6CFC2] pb-3">
                <h3 className="font-bold text-base text-[#1C1C1A]">
                  Update Project Phase
                </h3>
                <button onClick={() => setPhaseModal(false)} className="text-[#615C52] hover:text-[#1C1C1A] cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  setActiveStep(selectedNewPhase);
                  setPhaseModal(false);
                  const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  const newLog = {
                    id: Date.now(),
                    date: `Today ${timeNow}`,
                    text: `Phase updated to "${selectedNewPhase}" — Admin`
                  };
                  setLogbook([newLog, ...logbook]);
                  showToast(`✓ Project phase updated to: "${selectedNewPhase}"`);
                }} 
                className="space-y-4 text-xs"
              >
                <div>
                  <label className="block text-[11px] font-mono font-bold text-[#555046] uppercase tracking-wider mb-1.5">
                    Current Phase
                  </label>
                  <div className="px-3 py-2 bg-[#F4F1EA] rounded-xl text-xs font-bold text-[#1C1C1A]">
                    {activeStep}
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-mono font-bold text-[#555046] uppercase tracking-wider mb-1.5">
                    Select New Phase *
                  </label>
                  <select
                    value={selectedNewPhase}
                    onChange={(e) => setSelectedNewPhase(e.target.value)}
                    className="w-full p-2.5 bg-[#FAF8F5] border border-[#D6CFC2] rounded-xl text-xs font-semibold text-[#1C1C1A] focus:outline-none focus:ring-2 focus:ring-[#283523]/20 cursor-pointer"
                  >
                    {stepsList.map((st) => (
                      <option key={st.key} value={st.key}>
                        {st.name} {st.key === activeStep ? '(Current)' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#E6E1D7] text-xs text-[#4F4B44] space-y-1">
                  <p className="font-bold text-[#1C1C1A]">Automatic actions on phase transition:</p>
                  <p>• Notification sent immediately to customer and partner.</p>
                  <p>• Progress bar is synchronized in both portals.</p>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-[#D6CFC2]">
                  <button
                    type="button"
                    onClick={() => setPhaseModal(false)}
                    className="px-4 py-2 bg-white border border-[#D6CFC2] text-[#4F4B44] rounded-xl text-xs font-bold hover:bg-[#FAF8F5] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#283523] text-white font-bold rounded-xl text-xs hover:bg-[#1E291B] cursor-pointer"
                  >
                    Confirm Phase
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* NEW CUSTOMER ACTION MODAL */}
      <AnimatePresence>
        {actionModal && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-[#D6CFC2]"
            >
              <div className="flex items-center justify-between border-b border-[#D6CFC2] pb-3">
                <h3 className="font-bold text-base text-[#1C1C1A]">
                  New Customer Action
                </h3>
                <button onClick={() => setActionModal(false)} className="text-[#615C52] hover:text-[#1C1C1A] cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!newActionTitle.trim()) return;
                  const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  const newAct = {
                    id: Date.now(),
                    status: 'Open',
                    title: newActionTitle.trim(),
                    subtitle: newActionSub.trim() || 'Created today · reminder scheduled Day 3',
                    actionType: 'custom'
                  };
                  setCustomerActions([newAct, ...customerActions]);
                  setNewActionTitle('');
                  setNewActionSub('');
                  setActionModal(false);
                  
                  const newLog = {
                    id: Date.now(),
                    date: `Today ${timeNow}`,
                    text: `Customer action created: "${newAct.title}" — Admin`
                  };
                  setLogbook([newLog, ...logbook]);
                  showToast(`✓ New customer action created & sent to Customer Portal!`);
                }} 
                className="space-y-4 text-xs"
              >
                <div>
                  <label className="block text-[11px] font-mono font-bold text-[#555046] uppercase tracking-wider mb-1.5">
                    Action Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder='e.g. Check garden gate dimensions & confirm'
                    value={newActionTitle}
                    onChange={(e) => setNewActionTitle(e.target.value)}
                    className="w-full p-2.5 bg-[#FAF8F5] border border-[#D6CFC2] rounded-xl text-xs font-semibold text-[#1C1C1A] focus:outline-none focus:ring-2 focus:ring-[#283523]/20"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono font-bold text-[#555046] uppercase tracking-wider mb-1.5">
                    Subtitle / Instructions
                  </label>
                  <input
                    type="text"
                    placeholder='e.g. Minimum 90 cm width needed for delivery passage'
                    value={newActionSub}
                    onChange={(e) => setNewActionSub(e.target.value)}
                    className="w-full p-2.5 bg-[#FAF8F5] border border-[#D6CFC2] rounded-xl text-xs font-semibold text-[#1C1C1A] focus:outline-none focus:ring-2 focus:ring-[#283523]/20"
                  />
                </div>

                <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#E6E1D7] text-xs text-[#4F4B44] space-y-1">
                  <p className="font-bold text-[#1C1C1A]">Automated Follow-up Lifecycle:</p>
                  <p>• Day 0: Action button appears on customer portal.</p>
                  <p>• Day 3: Automated WhatsApp reminder sent if unconfirmed.</p>
                  <p>• Day 6: Call task created for project manager.</p>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-[#D6CFC2]">
                  <button
                    type="button"
                    onClick={() => setActionModal(false)}
                    className="px-4 py-2 bg-white border border-[#D6CFC2] text-[#4F4B44] rounded-xl text-xs font-bold hover:bg-[#FAF8F5] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#283523] text-white font-bold rounded-xl text-xs hover:bg-[#1E291B] cursor-pointer"
                  >
                    Publish Action
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
