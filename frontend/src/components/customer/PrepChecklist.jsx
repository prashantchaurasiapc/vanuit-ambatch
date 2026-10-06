import React, { useState, useEffect } from 'react';
import Card from '../Card';
import { ClipboardCheck, CheckSquare, Square } from 'lucide-react';

/**
 * PrepChecklist Component (Step 4 - Garden Room Extension)
 * 
 * Display project-specific customer preparation checklist:
 * 1. Toegang van minimaal 1,20 m
 * 2. Minimaal 15 m² werk-/opslagruimte
 * 3. Stroompunt beschikbaar
 * 4. Parkeerplek beschikbaar
 * 5. Buren geïnformeerd
 * 
 * Persists checked state per project to localStorage.
 */
export default function PrepChecklist({ projectId = 'P-2001', prepChecklist = [] }) {
  const defaultItems = [
    { id: 'prep-1', labelEN: 'Access to the rear garden at least 1.20 m wide', labelNL: 'Toegang naar de achtertuin minimaal 1,20 m breed', isChecked: true },
    { id: 'prep-2', labelEN: 'At least 15 m² work/storage space available', labelNL: 'Minimaal 15 m² werk-/opslagruimte beschikbaar', isChecked: false },
    { id: 'prep-3', labelEN: 'Power point available (max 25 m distance)', labelNL: 'Stroompunt beschikbaar (maximaal 25 m afstand)', isChecked: false },
    { id: 'prep-4', labelEN: 'Parking space available for bus and trailer', labelNL: 'Parkeerplek beschikbaar voor bus en aanhanger', isChecked: false },
    { id: 'prep-5', labelEN: 'Neighbours informed about the build week', labelNL: 'Buren geïnformeerd over de bouwweek', isChecked: false }
  ];

  const storageKey = `app_prep_checklist_${projectId}`;

  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return Array.isArray(prepChecklist) && prepChecklist.length > 0 ? prepChecklist : defaultItems;
  });

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(items));
    } catch (e) {}
  }, [items, storageKey]);

  const toggleCheck = (id) => {
    setItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, isChecked: !item.isChecked } : item
      )
    );
  };

  const completedCount = items.filter(i => i.isChecked).length;

  return (
    <Card title="Customer Preparation" icon={ClipboardCheck}>
      <div className="space-y-3 font-body">
        <div className="flex items-center justify-between text-xs border-b border-[#D6CFC2]/60 pb-2">
          <span className="text-dark/70 font-medium">Check off what is already arranged for the build:</span>
          <span className="font-mono font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md text-[11px]">
            {completedCount} of {items.length} ready
          </span>
        </div>

        <div className="space-y-2">
          {items.map((item) => {
            const isChecked = Boolean(item.isChecked);
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => toggleCheck(item.id)}
                className={`w-full flex items-start gap-3 p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  isChecked
                    ? 'bg-cream/40 border-primary/40 text-primary font-medium'
                    : 'bg-white border-[#D6CFC2] text-dark/80 hover:border-primary/50'
                }`}
              >
                {isChecked ? (
                  <CheckSquare className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                ) : (
                  <Square className="w-4 h-4 text-dark/40 flex-shrink-0 mt-0.5" />
                )}
                <span className={`text-xs leading-snug ${isChecked ? 'line-through opacity-80' : ''}`}>
                  {item.labelEN || item.labelNL || item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </Card>
  );
}

