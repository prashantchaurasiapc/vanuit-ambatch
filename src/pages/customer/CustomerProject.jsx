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
      id: 'P-2001',
      name: language === 'EN' ? 'Luxury Outdoor Kitchen Amsterdam' : 'Luxe Teak Buitenkeuken Amsterdam',
      division: language === 'EN' ? 'Custom Outdoor Kitchens' : 'Buitenkeukens op maat',
      customer: user?.name || (language === 'EN' ? 'John Miller' : 'Jan de Vries'),
      address: 'Keizersgracht 420, 1016 GC Amsterdam',
      expectedDelivery: '15 November 2026',
      craftsman: 'Sven Hoek (Hoek Bouw)',
      progress: 45,
      status: 'In Progress'
    };
    return normalizeProjectData(rawDefault);
  });

  const handleUpdateProject = (updatedProject) => {
    setActiveProject(updatedProject);
    try {
      const saved = localStorage.getItem('app_projects');
      if (saved) {
        const parsed = JSON.parse(saved);
        const updatedList = parsed.map(p => p.id === updatedProject.id ? updatedProject : p);
        localStorage.setItem('app_projects', JSON.stringify(updatedList));
        window.dispatchEvent(new Event('app_data_changed'));
      }
    } catch (e) {}
  };

  const handleSwitchTypeDirectly = (newType) => {
    const updated = {
      ...activeProject,
      projectType: newType,
      division: newType === 'outdoor_kitchen' ? 'Buitenkeukens op maat' : 'Buitenverblijven op maat',
    };
    setActiveProject(updated);
    try {
      const saved = localStorage.getItem('app_projects');
      if (saved) {
        const parsed = JSON.parse(saved);
        const exists = parsed.some(p => p.id === updated.id);
        const updatedList = exists 
          ? parsed.map(p => p.id === updated.id ? updated : p)
          : [...parsed, updated];
        localStorage.setItem('app_projects', JSON.stringify(updatedList));
      } else {
        localStorage.setItem('app_projects', JSON.stringify([updated]));
      }
      window.dispatchEvent(new Event('app_data_changed'));
    } catch (e) {}
  };




  const [sharedPhotos, setSharedPhotos] = useState([]);
  const [selectedPhotoModal, setSelectedPhotoModal] = useState(null);

  const loadCustomerProjectData = () => {
    try {
      const currentCustName = user?.name || (language === 'EN' ? 'John Miller' : 'Jan de Vries');

      // Load Projects
      const savedProjects = localStorage.getItem('app_projects');
      if (savedProjects) {
        const parsed = JSON.parse(savedProjects);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const match = parsed.find(p => 
            (p.customer || '').toLowerCase().includes(currentCustName.toLowerCase()) ||
            currentCustName.toLowerCase().includes((p.customer || '').toLowerCase())
          ) || parsed[0];

          if (match) {
            const detectedType = match.projectType || (
              (match.category || match.name || '').toLowerCase().includes('overkapping') || (match.category || match.name || '').toLowerCase().includes('canopy') ? 'canopy' :
              (match.category || match.name || '').toLowerCase().includes('poolhouse') ? 'poolhouse' :
              (match.category || match.name || '').toLowerCase().includes('garden') || (match.category || match.name || '').toLowerCase().includes('verblijf') ? 'garden_room' :
              'outdoor_kitchen'
            );

            const normalized = normalizeProjectData({
              ...match,
              id: match.id || 'P-2001',
              name: match.name || (language === 'EN' ? 'Luxury Outdoor Kitchen' : 'Luxe Buitenkeuken'),
              division: match.category || (language === 'EN' ? 'Custom Outdoor Kitchens' : 'Buitenkeukens op maat'),
              customer: match.customer || currentCustName,
              address: match.address || match.deliveryAddress || 'Keizersgracht 420, 1016 GC Amsterdam',
              expectedDelivery: match.expectedDelivery || match.deadline || '15 November 2026',
              craftsman: match.partner && match.partner !== 'Unassigned' ? match.partner : 'Sven Hoek (Hoek Bouw)',
              progress: Number(match.progress) || 45,
              status: match.status || 'In Progress',
              category: match.category,
              projectType: detectedType,
              renderPackage: match.renderPackage
            });
            setActiveProject(normalized);
          }
        }
      }

      // Load Shared Photos
      const savedPhotos = localStorage.getItem('app_project_photos');
      if (savedPhotos) {
        const parsedP = JSON.parse(savedPhotos);
        if (Array.isArray(parsedP) && parsedP.length > 0) {
          const visiblePhotos = parsedP.filter(p => p.isShared !== false);
          setSharedPhotos(visiblePhotos);
        }
      }
    } catch (e) {}
  };


  useEffect(() => {
    loadCustomerProjectData();
    const handleSync = () => loadCustomerProjectData();
    window.addEventListener('storage', handleSync);
    window.addEventListener('app_data_changed', handleSync);
    return () => {
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('app_data_changed', handleSync);
    };
  }, [language, user]);


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
        <div className="bg-[#FAF7F2] border border-[#E4DED4] p-2.5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs shadow-xs">
          <span className="font-bold text-primary font-heading px-1 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-accent" />
            <span>Testing Design View Switcher:</span>
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
              Outdoor Kitchen (Design & Options)
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
        <div className="bg-[#FAF7F2] border border-[#E4DED4] p-2.5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs shadow-xs">
          <span className="font-bold text-primary font-heading px-1 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-accent" />
            <span>Testing Planning View Switcher:</span>
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
              Outdoor Kitchen (Planning & Delivery)
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
        <div className="bg-[#FAF7F2] border border-[#E4DED4] p-2.5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs shadow-xs">
          <span className="font-bold text-primary font-heading px-1 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-accent" />
            <span>Testing Payments View Switcher:</span>
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
              Outdoor Kitchen (Payments)
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
        <div className="bg-[#FAF7F2] border border-[#E4DED4] p-2.5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs shadow-xs">
          <span className="font-bold text-primary font-heading px-1 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-accent" />
            <span>Testing Handover View Switcher:</span>
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
              Outdoor Kitchen (Handover & Aftercare)
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
        <div className="bg-[#FAF7F2] border border-[#E4DED4] p-2.5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs shadow-xs">
          <span className="font-bold text-primary font-heading px-1 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-accent" />
            <span>Testing Mobile View Switcher:</span>
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
              Outdoor Kitchen (Mobile View)
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
      <div className="bg-[#EDE8DF] border border-[#C4BEB3] p-2.5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs shadow-xs">
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



