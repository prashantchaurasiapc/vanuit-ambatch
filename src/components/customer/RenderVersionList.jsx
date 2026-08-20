import React from 'react';
import Card from '../Card';
import { History, CheckCircle2 } from 'lucide-react';

/**
 * RenderVersionList Component (Step 3 - Garden Room Extension)
 * 
 * Displays version history list (V1, V2, etc.) with:
 * - Version tag
 * - Date
 * - Thumbnail (if available)
 * - Mandatory "Wat is gewijzigd:" text line from data
 */
export default function RenderVersionList({ versionHistory = [] }) {
  if (!Array.isArray(versionHistory) || versionHistory.length === 0) {
    return (
      <Card title="Render Version History" icon={History}>
        <div className="p-4 sm:p-6 text-center bg-[#F7F4EE] border border-dashed border-[#C4BEB3] rounded-xl text-xs text-dark/60 italic font-body">
          There are no previous render versions for this project yet.
        </div>
      </Card>
    );
  }

  return (
    <Card title="Render Version History" icon={History}>
      <div className="space-y-3 font-body">
        {versionHistory.map((item, idx) => (
          <div
            key={idx}
            className={`p-3.5 sm:p-4 rounded-xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
              item.isCurrent
                ? 'bg-cream/40 border-primary/40 shadow-xs'
                : 'bg-white border-[#D6CFC2]'
            }`}
          >
            {/* Version & Date */}
            <div className="flex items-start gap-3 min-w-0 flex-1">
              <div className={`px-2.5 py-1 rounded-lg font-mono font-bold text-xs flex-shrink-0 ${
                item.isCurrent ? 'bg-primary text-cream' : 'bg-dark/10 text-dark/70'
              }`}>
                V{item.version}
              </div>

              {item.thumbnail ? (
                <img
                  src={item.thumbnail}
                  alt={`Render Version ${item.version}`}
                  className="w-16 h-10 object-cover rounded-lg border border-[#D6CFC2] flex-shrink-0"
                />
              ) : null}

              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-primary font-heading">
                    Render Version {item.version}
                  </span>
                  {item.isCurrent && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3 h-3" /> Current Version
                    </span>
                  )}
                  <span className="text-[11px] text-dark/50 font-mono">
                    {item.date}
                  </span>
                </div>

                {item.changeLine ? (
                  <p className="text-xs text-dark/80 leading-relaxed">
                    <span className="font-bold text-dark/60">What changed: </span>
                    {item.changeLine}
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

