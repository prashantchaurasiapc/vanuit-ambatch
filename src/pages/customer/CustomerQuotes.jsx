import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import OutdoorKitchenQuote from '../../components/customer/OutdoorKitchenQuote';
import GardenRoomQuote from '../../components/customer/GardenRoomQuote';
import { isGardenRoomFamily, detectProjectType } from '../../utils/projectType';
import { useLanguage } from '../../context/LanguageContext';
import { Sparkles } from 'lucide-react';

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

  const [activeProject, setActiveProject] = useState(() => {
    try {
      const savedProjects = localStorage.getItem('app_projects');
      if (savedProjects) {
        const parsed = JSON.parse(savedProjects);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed[0];
        }
      }
    } catch (e) {}

    return {
      id: 'PRJ-2026-014',
      name: 'Outdoor Kitchen Thermo Fraké · 240 × 80 cm',
      customer: 'Sander de Vries',
      city: 'Oisterwijk',
      projectType: 'outdoor_kitchen'
    };
  });

  const [activeQuote, setActiveQuote] = useState(null);

  const loadData = () => {
    try {
      // Load active project
      const savedProjects = localStorage.getItem('app_projects');
      if (savedProjects) {
        const parsedP = JSON.parse(savedProjects);
        if (Array.isArray(parsedP) && parsedP.length > 0) {
          setActiveProject(parsedP[0]);
        }
      }

      // Load active quote
      const savedQuotes = localStorage.getItem('app_quotes');
      if (savedQuotes) {
        const parsedQ = JSON.parse(savedQuotes);
        if (Array.isArray(parsedQ) && parsedQ.length > 0) {
          setActiveQuote(parsedQ[0]);
        }
      }
    } catch (e) {}
  };

  useEffect(() => {
    loadData();
    const handleSync = () => loadData();
    window.addEventListener('storage', handleSync);
    window.addEventListener('app_data_changed', handleSync);
    return () => {
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('app_data_changed', handleSync);
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
    try {
      const saved = localStorage.getItem('app_projects');
      if (saved) {
        const parsed = JSON.parse(saved);
        const updatedList = parsed.map(p => p.id === updatedProject.id ? updatedProject : p);
        localStorage.setItem('app_projects', JSON.stringify(updatedList));
      } else {
        localStorage.setItem('app_projects', JSON.stringify([updatedProject]));
      }
      window.dispatchEvent(new Event('app_data_changed'));
    } catch (e) {}
  };

  return (
    <div className="space-y-4 max-w-5xl w-full font-body text-[#4A4A43]">

      {/* Testing View Switcher Bar (Development Phase) */}
      <div className="bg-[#EDE8DF] border border-[#C4BEB3] p-2.5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs shadow-xs">
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
