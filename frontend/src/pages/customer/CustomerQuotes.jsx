import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import OutdoorKitchenQuote from '../../components/customer/OutdoorKitchenQuote';
import GardenRoomQuote from '../../components/customer/GardenRoomQuote';
import { isGardenRoomFamily, detectProjectType } from '../../utils/projectType';
import { useLanguage } from '../../context/LanguageContext';
import { Sparkles } from 'lucide-react';
import api from '../../api/apiClient';

/**
 * CustomerQuotes Page (My Quote — Project-Type Based Customer Portal Implementation)
 * 
 * Single route: /customer/quotes (or /customer/quote)
 * Single sidebar menu item: My Quote
 * 
 * Features:
 * - Outdoor Kitchen (50/50 payment structure, quote line items, totals, actions, previous versions)
 * - Garden Room / Poolhouse / Canopy (40/40/20 payment structure, provisional sum explanation *, totals, actions)
 * - Testing View Switcher bar at top for rapid developer/tester verification during dev phase.
 */
export default function CustomerQuotes() {
  const { language } = useLanguage();
  const navigate = useNavigate();

  const [activeProject, setActiveProject] = useState({
    id: 'PRJ-2026-014',
    name: 'Outdoor Kitchen Thermo Fraké · 240 × 80 cm',
    customer: 'Sander de Vries',
    city: 'Oisterwijk',
    projectType: 'outdoor_kitchen'
  });

  const [activeQuote, setActiveQuote] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      try {
        const [projRes, quoteRes] = await Promise.all([
          api.get('/projects'),
          api.get('/quotes')
        ]);

        if (isMounted) {
          if (projRes.success && Array.isArray(projRes.data) && projRes.data.length > 0) {
            setActiveProject(projRes.data[0]);
          }
          if (quoteRes.success && Array.isArray(quoteRes.data) && quoteRes.data.length > 0) {
            setActiveQuote(quoteRes.data[0]);
          }
        }
      } catch (e) {
        console.error('Error fetching customer quote/project data:', e);
      }
    };

    loadData();
    window.addEventListener('app_data_changed', loadData);
    return () => {
      isMounted = false;
      window.removeEventListener('app_data_changed', loadData);
    };
  }, []);

  const isGardenRoom = isGardenRoomFamily(activeProject);

  const handleSwitchTypeDirectly = (newType) => {
    const updatedProject = {
      ...activeProject,
      projectType: newType,
      division: newType === 'outdoor_kitchen' ? 'Buitenkeukens op maat' : 'Buitenverblijven op maat'
    };
    setActiveProject(updatedProject);
  };

  return (
    <div className="space-y-4 max-w-5xl w-full font-body text-[#4A4A43]">

      {/* Testing View Switcher Bar (Development Phase) */}
      <div className="bg-[#EDE8DF] border border-[#C4BEB3] p-1.5 sm:p-2 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[11px] shadow-xs">
        <span className="font-bold text-primary font-heading px-1 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-accent" />
          <span>Testing Quote Switcher:</span>
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
            Outdoor Kitchen (50/50 Payment)
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
            Garden Room / Poolhouse (40/40/20 Payment)
          </button>
        </div>
      </div>

      {/* Render Quote Variant Based on projectType */}
      {isGardenRoom ? (
        <GardenRoomQuote quote={activeQuote} project={activeProject} />
      ) : (
        <OutdoorKitchenQuote quote={activeQuote} project={activeProject} />
      )}
    </div>
  );
}
