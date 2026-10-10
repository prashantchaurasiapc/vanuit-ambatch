import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../hooks/useAuth';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import { CheckCircle2, Circle, Clock, Calendar, MapPin, Wrench, ShieldCheck, Compass, Sparkles, Camera, Eye, X, ArrowRight, FileText, CreditCard } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { normalizeProjectData } from '../../utils/gardenRoomDataModel';
import { isGardenRoomFamily } from '../../utils/projectType';
import api from '../../api/apiClient';

import RenderViewer from '../../components/customer/RenderViewer';
import RenderDetailCards from '../../components/customer/RenderDetailCards';
import RenderVersionList from '../../components/customer/RenderVersionList';
import WeekBar from '../../components/customer/WeekBar';
import PrepChecklist from '../../components/customer/PrepChecklist';
import SchouwProposalCard from '../../components/customer/SchouwProposalCard';
import OutdoorKitchenOverview from '../../components/customer/OutdoorKitchenOverview';
import GardenRoomOverview from '../../components/customer/GardenRoomOverview';
import GardenRoomDesignView from '../../components/customer/GardenRoomDesignView';
import OutdoorKitchenDesignView from '../../components/customer/OutdoorKitchenDesignView';
import GardenRoomPlanningView from '../../components/customer/GardenRoomPlanningView';
import OutdoorKitchenPlanningView from '../../components/customer/OutdoorKitchenPlanningView';
import GardenRoomPaymentsView from '../../components/customer/GardenRoomPaymentsView';
import OutdoorKitchenPaymentsView from '../../components/customer/OutdoorKitchenPaymentsView';
import GardenRoomHandoverView from '../../components/customer/GardenRoomHandoverView';
import OutdoorKitchenHandoverView from '../../components/customer/OutdoorKitchenHandoverView';
import GardenRoomMobileView from '../../components/customer/GardenRoomMobileView';
import OutdoorKitchenMobileView from '../../components/customer/OutdoorKitchenMobileView';









export default function CustomerProject() {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get('tab');


  const [activeProject, setActiveProject] = useState(() => {
    const rawDefault = {
      id: '',
      name: user?.name ? `${user.name} - Project` : '',
      division: '',
      customer: user?.name || '',
      address: '',
      expectedDelivery: '',
      craftsman: '',
      progress: 0,
      status: 'In Progress'
    };
    return normalizeProjectData(rawDefault);
  });

  const handleUpdateProject = (updatedProject) => {
    // Keep in-memory only; admin controls project data via their API
    setActiveProject(updatedProject);
  };

  const handleSwitchTypeDirectly = (newType) => {
    const updated = {
      ...activeProject,
      projectType: newType,
      division: newType === 'outdoor_kitchen' ? 'Buitenkeukens op maat' : 'Buitenverblijven op maat',
    };
    setActiveProject(updated);
  };




  const [sharedPhotos, setSharedPhotos] = useState([]);
  const [selectedPhotoModal, setSelectedPhotoModal] = useState(null);

  const loadCustomerProjectData = async () => {
    try {
      // Load the customer's own project from the backend
      const projRes = await api.get('/customer/projects');
      if (projRes.success && projRes.data) {
        const proj = Array.isArray(projRes.data) ? projRes.data[0] : projRes.data;
        if (proj) {
          const normalized = normalizeProjectData({
            ...proj,
            address: proj.deliveryAddress || proj.address || 'Address not set',
            expectedDelivery: proj.deliveryDate || proj.deadline || '15 November 2026',
            craftsman: proj.partnerName || proj.partner || 'Workshop team',
            progress: Number(proj.progressPercentage) || 45,
          });
          setActiveProject(normalized);

          // Load photos shared with this customer
          if (proj.id) {
            const photosRes = await api.get(`/projects/${proj.id}/photos?visibleToCustomer=true`);
            if (photosRes.success && Array.isArray(photosRes.data)) {
              setSharedPhotos(photosRes.data.map(p => ({ ...p, img: p.photoUrl || p.img })));
            }
          }
        }
      }
    } catch (e) {
      console.warn('Failed to load customer project data:', e);
    }
  };


  useEffect(() => {
    loadCustomerProjectData();
  }, [user]);


  const progressVal = activeProject.progress;

  const timelineSteps = [
    { 
      title: language === 'EN' ? '1. Quote Accepted & Design Approval' : '1. Offerte Akkoord & Ontwerp', 
      date: '01 Oct 2026', 
      status: 'completed', 
      desc: language === 'EN' ? 'Quote approved and workshop production queued.' : 'Offerte goedgekeurd en productie ingepland.' 
    },
    { 
      title: language === 'EN' ? '2. Premium Materials Sourced' : '2. Materialen Besteld & Gecontroleerd', 
      date: '05 Oct 2026', 
      status: progressVal >= 25 ? 'completed' : 'active', 
      desc: language === 'EN' ? 'Solid teak wood and concrete top components delivered to workshop.' : 'Massief teakhout en betonblad onderdelen ontvangen in werkplaats.' 
    },
    { 
      title: language === 'EN' ? '3. Workshop Build & Crafting' : '3. Werkplaats Constructie & Bouw', 
      date: '15 Oct 2026', 
      status: progressVal >= 100 ? 'completed' : progressVal >= 25 ? 'active' : 'pending', 
      desc: language === 'EN' ? `Craftsman ${activeProject.craftsman} is currently fabricating frame, drawers & finish.` : `Vakman ${activeProject.craftsman} bouwt het frame, de lades en afwerking.` 
    },
    { 
      title: language === 'EN' ? '4. On-Site Assembly & Final Delivery' : '4. Oplevering & Locatie Montage', 
      date: activeProject.expectedDelivery, 
      status: progressVal >= 100 ? 'completed' : 'pending', 
    },
  ];

  const isGardenRoom = isGardenRoomFamily(activeProject);

  // 1. DESIGN & RENDERS TAB
  if (activeTab === 'design' || activeTab === 'renders') {
    return (
      <div className="space-y-4 max-w-5xl w-full font-body text-[#4A4A43]">
        {/* Quick Demo View Switcher for Design Tab */}
        <div className="bg-[#FAF7F2] border border-[#E4DED4] p-1.5 sm:p-2 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[11px] shadow-xs">
          <span className="font-bold text-primary font-heading px-1 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-accent" />
            <span>Testing Design View Switcher:</span>
          </span>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => handleSwitchTypeDirectly('outdoor_kitchen')}
              className={`flex-1 sm:flex-initial px-2.5 py-1 rounded-lg text-[10px] sm:text-[11px] font-bold transition-all cursor-pointer ${
                !isGardenRoom
                  ? 'bg-primary text-cream shadow-xs'
                  : 'bg-white text-dark/70 hover:bg-gray-50 border border-[#D6CFC2]'
              }`}
            >
              Outdoor Kitchen (Design & Options)
            </button>

            <button
              type="button"
              onClick={() => handleSwitchTypeDirectly('garden_room')}
              className={`flex-1 sm:flex-initial px-2.5 py-1 rounded-lg text-[10px] sm:text-[11px] font-bold transition-all cursor-pointer ${
                isGardenRoom
                  ? 'bg-primary text-cream shadow-xs'
                  : 'bg-white text-dark/70 hover:bg-gray-50 border border-[#D6CFC2]'
              }`}
            >
              Garden Room / Poolhouse (Design & Renders)
            </button>
          </div>
        </div>

        {isGardenRoom ? (
          <GardenRoomDesignView project={activeProject} />
        ) : (
          <OutdoorKitchenDesignView project={activeProject} />
        )}
      </div>
    );
  }




  // 2. PLANNING & BUILD TAB
  if (activeTab === 'planning' || activeTab === 'build') {
    return (
      <div className="space-y-4 max-w-5xl w-full font-body text-[#4A4A43]">

        {/* Quick Demo View Switcher for Planning Tab */}
        <div className="bg-[#FAF7F2] border border-[#E4DED4] p-1.5 sm:p-2 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[11px] shadow-xs">
          <span className="font-bold text-primary font-heading px-1 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-accent" />
            <span>Testing Planning View Switcher:</span>
          </span>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => handleSwitchTypeDirectly('outdoor_kitchen')}
              className={`flex-1 sm:flex-initial px-2.5 py-1 rounded-lg text-[10px] sm:text-[11px] font-bold transition-all cursor-pointer ${
                !isGardenRoom
                  ? 'bg-primary text-cream shadow-xs'
                  : 'bg-white text-dark/70 hover:bg-gray-50 border border-[#D6CFC2]'
              }`}
            >
              Outdoor Kitchen (Planning & Delivery)
            </button>

            <button
              type="button"
              onClick={() => handleSwitchTypeDirectly('garden_room')}
              className={`flex-1 sm:flex-initial px-2.5 py-1 rounded-lg text-[10px] sm:text-[11px] font-bold transition-all cursor-pointer ${
                isGardenRoom
                  ? 'bg-primary text-cream shadow-xs'
                  : 'bg-white text-dark/70 hover:bg-gray-50 border border-[#D6CFC2]'
              }`}
            >
              Garden Room / Poolhouse (Planning & Build)
            </button>
          </div>
        </div>

        {isGardenRoom ? (
          <GardenRoomPlanningView project={activeProject} />
        ) : (
          <OutdoorKitchenPlanningView project={activeProject} />
        )}

      </div>
    );
  }


  // 3. PAYMENTS TAB
  if (activeTab === 'payments') {
    return (
      <div className="space-y-4 max-w-5xl w-full font-body text-[#4A4A43]">


        {/* Quick Demo View Switcher for Payments Tab */}
        <div className="bg-[#FAF7F2] border border-[#E4DED4] p-1.5 sm:p-2 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[11px] shadow-xs">
          <span className="font-bold text-primary font-heading px-1 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-accent" />
            <span>Testing Payments View Switcher:</span>
          </span>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => handleSwitchTypeDirectly('outdoor_kitchen')}
              className={`flex-1 sm:flex-initial px-2.5 py-1 rounded-lg text-[10px] sm:text-[11px] font-bold transition-all cursor-pointer ${
                !isGardenRoom
                  ? 'bg-primary text-cream shadow-xs'
                  : 'bg-white text-dark/70 hover:bg-gray-50 border border-[#D6CFC2]'
              }`}
            >
              Outdoor Kitchen (Payments)
            </button>

            <button
              type="button"
              onClick={() => handleSwitchTypeDirectly('garden_room')}
              className={`flex-1 sm:flex-initial px-2.5 py-1 rounded-lg text-[10px] sm:text-[11px] font-bold transition-all cursor-pointer ${
                isGardenRoom
                  ? 'bg-primary text-cream shadow-xs'
                  : 'bg-white text-dark/70 hover:bg-gray-50 border border-[#D6CFC2]'
              }`}
            >
              Garden Room / Poolhouse (Payments)
            </button>
          </div>
        </div>

        {isGardenRoom ? (
          <GardenRoomPaymentsView project={activeProject} />
        ) : (
          <OutdoorKitchenPaymentsView project={activeProject} />
        )}
      </div>
    );
  }


  // 4. HANDOVER & AFTERCARE TAB
  if (activeTab === 'handover') {
    return (
      <div className="space-y-3.5 max-w-4xl w-full font-body text-[#4A4A43]">

        {/* Quick Demo View Switcher for Handover Tab */}
        <div className="bg-[#FAF7F2] border border-[#E4DED4] p-1.5 sm:p-2 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[11px] shadow-xs">
          <span className="font-bold text-primary font-heading px-1 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-accent" />
            <span>Testing Handover View Switcher:</span>
          </span>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => handleSwitchTypeDirectly('outdoor_kitchen')}
              className={`flex-1 sm:flex-initial px-2.5 py-1 rounded-lg text-[10px] sm:text-[11px] font-bold transition-all cursor-pointer ${
                !isGardenRoom
                  ? 'bg-primary text-cream shadow-xs'
                  : 'bg-white text-dark/70 hover:bg-gray-50 border border-[#D6CFC2]'
              }`}
            >
              Outdoor Kitchen (Handover & Aftercare)
            </button>

            <button
              type="button"
              onClick={() => handleSwitchTypeDirectly('garden_room')}
              className={`flex-1 sm:flex-initial px-2.5 py-1 rounded-lg text-[10px] sm:text-[11px] font-bold transition-all cursor-pointer ${
                isGardenRoom
                  ? 'bg-primary text-cream shadow-xs'
                  : 'bg-white text-dark/70 hover:bg-gray-50 border border-[#D6CFC2]'
              }`}
            >
              Garden Room / Poolhouse (Handover & Aftercare)
            </button>
          </div>
        </div>

        {isGardenRoom ? (
          <GardenRoomHandoverView project={activeProject} />
        ) : (
          <OutdoorKitchenHandoverView project={activeProject} />
        )}
      </div>
    );
  }




  // 5. MOBILE VIEW TAB (1-to-1 Client PDF Page 15 & Page 21)
  if (activeTab === 'mobile-view') {
    return (
      <div className="space-y-3.5 max-w-4xl w-full font-body text-[#4A4A43]">
        {/* Quick Demo View Switcher for Mobile View Tab */}
        <div className="bg-[#FAF7F2] border border-[#E4DED4] p-1.5 sm:p-2 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[11px] shadow-xs">
          <span className="font-bold text-primary font-heading px-1 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-accent" />
            <span>Testing Mobile View Switcher:</span>
          </span>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => handleSwitchTypeDirectly('outdoor_kitchen')}
              className={`flex-1 sm:flex-initial px-2.5 py-1 rounded-lg text-[10px] sm:text-[11px] font-bold transition-all cursor-pointer ${
                !isGardenRoom
                  ? 'bg-primary text-cream shadow-xs'
                  : 'bg-white text-dark/70 hover:bg-gray-50 border border-[#D6CFC2]'
              }`}
            >
              Outdoor Kitchen (Mobile View)
            </button>

            <button
              type="button"
              onClick={() => handleSwitchTypeDirectly('garden_room')}
              className={`flex-1 sm:flex-initial px-2.5 py-1 rounded-lg text-[10px] sm:text-[11px] font-bold transition-all cursor-pointer ${
                isGardenRoom
                  ? 'bg-primary text-cream shadow-xs'
                  : 'bg-white text-dark/70 hover:bg-gray-50 border border-[#D6CFC2]'
              }`}
            >
              Garden Room / Poolhouse (Mobile View)
            </button>
          </div>
        </div>

        {isGardenRoom ? (
          <GardenRoomMobileView project={activeProject} />
        ) : (
          <OutdoorKitchenMobileView project={activeProject} />
        )}
      </div>
    );
  }

  // 6. OVERVIEW TAB (Default when no tab selected)

  return (
    <div className="space-y-4 max-w-4xl w-full font-body text-[#4A4A43]">


      {/* Quick Demo View Switcher */}
      <div className="bg-[#EDE8DF] border border-[#C4BEB3] p-1.5 sm:p-2 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[11px] shadow-xs">
        <span className="font-bold text-primary font-heading px-1 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-accent" />
          <span>Testing View Switcher:</span>
        </span>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => handleSwitchTypeDirectly('outdoor_kitchen')}
            className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              !isGardenRoom
                ? 'bg-primary text-cream shadow-xs'
                : 'bg-white text-dark/70 hover:bg-gray-50 border border-[#D6CFC2]'
            }`}
          >
            Outdoor Kitchen (6-Stage)
          </button>

          <button
            type="button"
            onClick={() => handleSwitchTypeDirectly('garden_room')}
            className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              isGardenRoom
                ? 'bg-primary text-cream shadow-xs'
                : 'bg-white text-dark/70 hover:bg-gray-50 border border-[#D6CFC2]'
            }`}
          >
            Garden Room / Poolhouse (7-Stage)
          </button>
        </div>
      </div>

      {isGardenRoom ? (
        <GardenRoomOverview project={activeProject} />
      ) : (
        <OutdoorKitchenOverview project={activeProject} />
      )}
    </div>
  );
}



