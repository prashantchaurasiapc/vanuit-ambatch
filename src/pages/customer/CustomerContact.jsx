import React, { useState, useEffect } from 'react';
import { Sparkles, MessageSquare } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import GardenRoomContactView from '../../components/customer/GardenRoomContactView';
import OutdoorKitchenContactView from '../../components/customer/OutdoorKitchenContactView';
import api from '../../api/apiClient';

export default function CustomerContact() {
  const { user } = useAuth();
  const [activeProject, setActiveProject] = useState(null);
  const [activeType, setActiveType] = useState('outdoor_kitchen');

  useEffect(() => {
    const loadProject = async () => {
      try {
        const res = await api.get('/customer/projects');
        const list = res?.data || [];
        if (Array.isArray(list) && list.length > 0) {
          setActiveProject(list[0]);
          return;
        }
      } catch (e) {}

      try {
        const res2 = await api.get('/projects');
        if (res2?.data && Array.isArray(res2.data) && res2.data.length > 0) {
          setActiveProject(res2.data[0]);
        }
      } catch (err) {}
    };

    loadProject();
    window.addEventListener('app_data_changed', loadProject);
    return () => {
      window.removeEventListener('app_data_changed', loadProject);
    };
  }, []);

  const handleSwitchTypeDirectly = (newType) => {
    setActiveType(newType);
    if (activeProject) {
      const updated = {
        ...activeProject,
        type: newType,
        projectType: newType,
        division: newType === 'outdoor_kitchen' ? 'Buitenkeukens op maat' : 'Buitenverblijven op maat',
      };
      setActiveProject(updated);
    }
    window.dispatchEvent(new Event('app_data_changed'));
  };

  const isGardenRoom = activeType === 'garden_room';

  const projectForChild = activeProject 
    ? { 
        ...activeProject, 
        id: activeProject.id, 
        type: activeType, 
        projectType: activeType 
      }
    : { 
        id: null, 
        type: activeType, 
        projectType: activeType 
      };

  return (
    <div className="space-y-4 max-w-5xl w-full font-body text-[#4A4A43]">

      {/* Quick Demo View Switcher Bar (100% Clickable & Instant Toggle) */}
      <div className="bg-[#FAF7F2] border border-[#E4DED4] p-1.5 sm:p-2 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[11px] shadow-xs">
        <span className="font-bold text-primary font-heading px-1 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-accent" />
          <span>Testing Contact View Switcher:</span>
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
            Outdoor Kitchen (Messages & Contact)
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
            Garden Room / Poolhouse (Messages & Contact)
          </button>
        </div>
      </div>

      {/* Render 1-to-1 Views */}
      {isGardenRoom ? (
        <GardenRoomContactView project={projectForChild} />
      ) : (
        <OutdoorKitchenContactView project={projectForChild} />
      )}
    </div>
  );
}
