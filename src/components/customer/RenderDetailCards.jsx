import React from 'react';
import Card from '../Card';
import { Layers } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

/**
 * RenderDetailCards Component (Step 3 - Garden Room Extension)
 * 
 * Displays 3 detail render cards:
 * 1. Hout / Wood
 * 2. Dak / Roof
 * 3. Vloer / Floor
 */
export default function RenderDetailCards({ detailRenders = [] }) {
  const { language } = useLanguage();
  const isNl = language === 'NL';

  // Ensure default 3 slots if empty
  const defaultItems = [
    { id: 'det-wood', titleEN: 'Wood', titleNL: 'Hout', descEN: 'Thermo Fraké / Douglas timber quality', descNL: 'Thermo Fraké / Douglas houtkwaliteit', url: '/wood_texture.png' },
    { id: 'det-roof', titleEN: 'Roof', titleNL: 'Dak', descEN: 'EPDM roofing system with zinc trim', descNL: 'EPDM daksysteem met zinken kraal', url: '/outdoor_project_card.png' },
    { id: 'det-floor', titleEN: 'Floor', titleNL: 'Vloer', descEN: 'Finishing & foundation profile', descNL: 'Afwerking & funderingsprofiel', url: '/dasbordes images.png' }
  ];

  const itemsToRender = Array.isArray(detailRenders) && detailRenders.length > 0
    ? detailRenders
    : defaultItems;

  return (
    <Card title={isNl ? 'Materialen & Details' : 'Materials & Details'} icon={Layers}>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 font-body">
        {itemsToRender.map((item, idx) => (
          <div
            key={item.id || idx}
            className="bg-white border border-[#D6CFC2] rounded-xl overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col"
          >
            {/* Image Container */}
            <div className="h-28 sm:h-32 bg-[#EDE8DF] relative overflow-hidden flex items-center justify-center border-b border-[#D6CFC2]/60">
              {item.url ? (
                <img
                  src={item.url}
                  alt={isNl ? (item.titleNL || item.titleEN || 'Detail Render') : (item.titleEN || item.titleNL || 'Detail Render')}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div
                className="w-full h-full flex flex-col items-center justify-center p-3 text-center bg-[#EDE8DF] text-dark/50"
                style={{ display: item.url ? 'none' : 'flex' }}
              >
                <Layers className="w-6 h-6 mb-1 opacity-40 text-primary" />
                <span className="text-[10px] italic">
                  {isNl ? 'Geen detailrender beschikbaar' : 'No detail render available'}
                </span>
              </div>
            </div>

            {/* Meta Content */}
            <div className="p-3 space-y-1 flex-1 flex flex-col justify-between">
              <h5 className="font-heading font-bold text-primary text-xs sm:text-sm">
                {isNl 
                  ? (item.titleNL || item.title || (idx === 0 ? 'Hout' : idx === 1 ? 'Dak' : 'Vloer'))
                  : (item.titleEN || item.title || (idx === 0 ? 'Wood' : idx === 1 ? 'Roof' : 'Floor'))}
              </h5>
              {(item.descEN || item.descNL || item.description) ? (
                <p className="text-[11px] text-dark/70 leading-snug">
                  {isNl ? (item.descNL || item.description || item.descEN) : (item.descEN || item.description || item.descNL)}
                </p>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

