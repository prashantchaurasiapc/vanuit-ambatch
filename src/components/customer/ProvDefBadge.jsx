import React from 'react';
import { Clock, CheckCircle2 } from 'lucide-react';

/**
 * ProvDefBadge Component (Step 4 - Garden Room Extension)
 * 
 * Displays schedule status:
 * - State A (Provisional): "◌ Voorlopig — definitief na de schouw" (Orange/dashed style)
 * - State B (Definitive): "✓ Definitief" (Green success style)
 */
export default function ProvDefBadge({ scheduleStatus = 'provisional' }) {
  const isDefinitive = scheduleStatus === 'definitive';

  if (isDefinitive) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800 border border-green-300 shadow-2xs">
        <CheckCircle2 className="w-3.5 h-3.5 text-green-700 flex-shrink-0" />
        <span>Definitive</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-900 border border-dashed border-amber-400 shadow-2xs">
      <Clock className="w-3.5 h-3.5 text-amber-700 flex-shrink-0 animate-pulse" />
      <span>Provisional — Final after Site Survey</span>
    </span>
  );
}

