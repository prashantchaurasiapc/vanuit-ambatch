import React, { useState } from 'react';
import Card from '../Card';
import { Sun, Moon, Image as ImageIcon } from 'lucide-react';

/**
 * RenderViewer Component (Step 3 - Garden Room Extension)
 * 
 * Renders:
 * 1. 16:7 Main Render view with Day/Evening toggle (when evening render exists).
 * 2. 2-6 Thumbnail navigation items.
 * 3. Graceful placeholder ("De renders van jouw ontwerp volgen hier.") if no renders exist.
 * 4. Image error boundary handling.
 */
export default function RenderViewer({ renderPackage = null }) {
  const [activeViewId, setActiveViewId] = useState(renderPackage?.activeViewId || 'view-front');
  const [dayEveningState, setDayEveningState] = useState(renderPackage?.dayEveningState || 'day'); // 'day' | 'evening'
  const [imageError, setImageError] = useState(false);

  // Extract views & options
  const views = renderPackage?.views || [];
  const hasUploadedRenders = renderPackage?.hasUploadedRenders !== false && views.length > 0;
  const hasEveningRender = Boolean(renderPackage?.hasEveningRender && renderPackage?.eveningRenderUrl);

  // Find active view image URL
  const currentView = views.find(v => v.id === activeViewId) || views[0];
  const activeImageUrl = dayEveningState === 'evening' && renderPackage?.eveningRenderUrl
    ? renderPackage.eveningRenderUrl
    : (currentView?.url || renderPackage?.mainRender?.url);

  if (!hasUploadedRenders || imageError) {
    return (
      <Card title="Design & Renders" icon={ImageIcon}>
        <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center bg-[#F7F4EE] border border-dashed border-[#C4BEB3] rounded-2xl space-y-3">
          <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center text-primary">
            <ImageIcon className="w-7 h-7" />
          </div>
          <h4 className="text-base font-bold font-heading text-primary">The renders for your design will appear here.</h4>
          <p className="text-xs text-dark/60 max-w-md">
            Our designers are currently putting the final touches on your 3D visualization. As soon as the renders are ready, they will appear here in the portal.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card title="Design & Renders" icon={ImageIcon}>
      <div className="space-y-4 font-body">
        {/* Main Render View (16:7 Ratio Container) */}
        <div className="relative w-full aspect-[16/7] bg-[#2A3425] rounded-2xl overflow-hidden shadow-sm border border-[#D6CFC2] flex items-center justify-center group">
          <img
            src={activeImageUrl}
            alt={currentView?.labelEN || currentView?.labelNL || renderPackage?.mainRender?.title || 'Render Visualization'}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover transition-all duration-300 group-hover:scale-[1.01]"
          />

          {/* Day / Evening Toggle Switch (Only if evening render exists) */}
          {hasEveningRender && (
            <div className="absolute top-3 right-3 bg-dark/80 backdrop-blur-md p-1 rounded-xl border border-white/20 flex items-center gap-1 z-10 shadow-lg">
              <button
                type="button"
                onClick={() => setDayEveningState('day')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  dayEveningState === 'day'
                    ? 'bg-cream text-primary shadow-xs'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                <Sun className="w-3.5 h-3.5" />
                <span>Day</span>
              </button>

              <button
                type="button"
                onClick={() => setDayEveningState('evening')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  dayEveningState === 'evening'
                    ? 'bg-primary text-cream shadow-xs'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                <Moon className="w-3.5 h-3.5" />
                <span>Evening</span>
              </button>
            </div>
          )}

          {/* Current View Title Overlay */}
          <div className="absolute bottom-3 left-3 bg-dark/75 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-white text-xs font-bold font-heading">
            {currentView?.labelEN || currentView?.labelNL || renderPackage?.mainRender?.title || 'Garden Room Visualization'}
          </div>
        </div>

        {/* Thumbnail Navigation Row (Supports 2 to 6 views, horizontal scroll on mobile) */}
        {views.length > 1 && (
          <div className="flex items-center gap-2.5 overflow-x-auto pb-1 pt-1 scrollbar-thin">
            {views.map((v) => {
              const isActive = v.id === activeViewId;
              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => {
                    setActiveViewId(v.id);
                    setImageError(false);
                  }}
                  className={`flex-shrink-0 relative w-24 sm:w-28 aspect-[16/9] rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                    isActive
                      ? 'border-primary ring-2 ring-primary/20 shadow-md scale-[1.02]'
                      : 'border-[#D6CFC2] opacity-70 hover:opacity-100 hover:border-primary/50'
                  }`}
                  title={v.labelEN || v.labelNL}
                >
                  <img
                    src={v.url}
                    alt={v.labelEN || v.labelNL}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-dark/70 text-white text-[9px] font-bold py-0.5 px-1 truncate text-center">
                    {v.labelEN || v.labelNL}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </Card>
  );
}

