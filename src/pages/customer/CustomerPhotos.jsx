import React, { useState, useEffect } from 'react';
import { Sparkles, Camera } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import GardenRoomPhotosView from '../../components/customer/GardenRoomPhotosView';
import OutdoorKitchenPhotosView from '../../components/customer/OutdoorKitchenPhotosView';

export default function CustomerPhotos() {
  const { user } = useAuth();
  const [activeProject, setActiveProject] = useState(null);
  
  // Directly manage active view type in state, initialized from localStorage
  const [activeType, setActiveType] = useState(() => {
    return localStorage.getItem('demo_active_project_type') || 'outdoor_kitchen';
  });

  useEffect(() => {
    const loadProject = () => {
      try {
        const saved = localStorage.getItem('app_customer_projects');
        if (saved) {
          const projects = JSON.parse(saved);
          if (Array.isArray(projects) && projects.length > 0) {
            setActiveProject(projects[0]);
          }
        }
      } catch (e) {}
    };

    loadProject();
    window.addEventListener('storage', loadProject);
    window.addEventListener('app_data_changed', loadProject);
    return () => {
      window.removeEventListener('storage', loadProject);
      window.removeEventListener('app_data_changed', loadProject);
    };
  }, []);

  const handleSwitchTypeDirectly = (newType) => {
    setActiveType(newType);
    localStorage.setItem('demo_active_project_type', newType);
    
    // Also sync app_customer_projects & app_projects if present
    try {
      if (activeProject) {
        const updated = {
          ...activeProject,
          type: newType,
          projectType: newType,
          division: newType === 'outdoor_kitchen' ? 'Buitenkeukens op maat' : 'Buitenverblijven op maat',
        };
        setActiveProject(updated);
      }
    } catch (e) {}

    window.dispatchEvent(new Event('app_data_changed'));
  };

  const isGardenRoom = activeType === 'garden_room';

  const projectForChild = activeProject 
    ? { 
        ...activeProject, 
        id: activeProject.id || (isGardenRoom ? '2026-021' : '2026-014'),
        type: activeType, 
        projectType: activeType 
      }
    : { 
        id: isGardenRoom ? '2026-021' : '2026-014', 
        type: activeType, 
        projectType: activeType 
      };

  return (
    <div className="space-y-4 max-w-5xl w-full font-body text-[#4A4A43]">


      {/* Quick Demo View Switcher Bar (100% Clickable & Instant Toggle) */}
      <div className="bg-[#FAF7F2] border border-[#E4DED4] p-2.5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs shadow-xs">
        <span className="font-bold text-primary font-heading px-1 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-accent" />
          <span>Testing Photos View Switcher:</span>
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
            Outdoor Kitchen (Photos from Workshop)
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
            Garden Room / Poolhouse (Photos & Updates)
          </button>
        </div>
      </div>

      {/* Render 1-to-1 Views */}
      {isGardenRoom ? (
        <GardenRoomPhotosView project={projectForChild} />
      ) : (
        <OutdoorKitchenPhotosView project={projectForChild} />
      )}
    </div>
  );
}
