import React from 'react';
import { Plus, Trash2, ArrowUp, ArrowDown, AlertTriangle, Layout } from 'lucide-react';
import Button from './Button';

const SEGMENT_TYPES = [
  { id: 'CABINET', label: 'Cabinet', isDark: false },
  { id: 'CUTOUT', label: 'Cutout', isDark: true },
  { id: 'FRIDGE', label: 'Fridge', isDark: true },
  { id: 'SINK', label: 'Sink', isDark: true },
  { id: 'OPEN_BAY', label: 'Open Bay', isDark: false }
];

export default function DiagramBuilder({ diagram, onChange }) {
  const { show = true, totalWidth = 240, segments = [] } = diagram || {};

  const handleToggleShow = (e) => {
    onChange({ ...diagram, show: e.target.checked });
  };

  const handleTotalWidthChange = (val) => {
    const num = Math.max(10, Number(val) || 0);
    onChange({ ...diagram, totalWidth: num });
  };

  const handleAddSegment = () => {
    if (segments.length >= 8) return;
    const newSeg = {
      id: `seg-${Date.now()}`,
      type: 'CABINET',
      label: 'kastje',
      width: 50
    };
    onChange({ ...diagram, segments: [...segments, newSeg] });
  };

  const handleRemoveSegment = (index) => {
    if (segments.length <= 1) return;
    const updated = segments.filter((_, i) => i !== index);
    onChange({ ...diagram, segments: updated });
  };

  const handleSegmentChange = (index, field, val) => {
    const updated = [...segments];
    updated[index] = { ...updated[index], [field]: val };
    onChange({ ...diagram, segments: updated });
  };

  const handleMoveSegment = (index, direction) => {
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= segments.length) return;
    const updated = [...segments];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;
    onChange({ ...diagram, segments: updated });
  };

  const currentSum = segments.reduce((acc, s) => acc + (Number(s.width) || 0), 0);
  const isWidthMismatch = currentSum !== Number(totalWidth);

  return (
    <div className="space-y-4 text-xs font-body">
      {show && (
        <div className="space-y-4">
          {/* Total Width Control */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-2">
              <span className="font-bold text-dark/70 text-xs">Total width</span>
              <input
                type="number"
                value={totalWidth}
                onChange={(e) => handleTotalWidthChange(e.target.value)}
                className="w-20 px-3 py-1.5 bg-white border border-[#D6CFC2] rounded-xl text-xs font-bold text-center font-mono focus:outline-none"
              />
              <span className="font-bold text-dark text-xs">cm</span>
            </div>

            <div className={`flex items-center gap-1.5 text-xs font-mono font-bold px-3 py-1 rounded-lg ${
              isWidthMismatch ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-emerald-100 text-emerald-900'
            }`}>
              <span>Segment sum: {currentSum} / {totalWidth} cm {isWidthMismatch ? '⚠️' : '✓'}</span>
            </div>
          </div>

          {/* Segments Repeater Controls */}
          <div className="space-y-2.5">
            {segments.map((seg, idx) => (
              <div key={seg.id || idx} className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 p-2 bg-[#F8F7F4] border border-[#D6CFC2]/70 rounded-xl">
                <span className="text-dark/40 font-mono cursor-grab px-1">::</span>

                {/* Segment Type Selector */}
                <select
                  value={seg.type || 'CABINET'}
                  onChange={(e) => handleSegmentChange(idx, 'type', e.target.value)}
                  className="px-2.5 py-1.5 bg-white border border-[#D6CFC2] rounded-lg text-xs font-bold text-dark focus:outline-none"
                >
                  <option value="CABINET">cabinet</option>
                  <option value="CUTOUT">cutout</option>
                  <option value="FRIDGE">fridge</option>
                  <option value="SINK">sink</option>
                  <option value="OPEN_BAY">open bay</option>
                </select>

                {/* Segment Label */}
                <input
                  type="text"
                  value={seg.label || ''}
                  onChange={(e) => handleSegmentChange(idx, 'label', e.target.value)}
                  placeholder="Label e.g. kastje"
                  className="px-3 py-1.5 bg-white border border-[#D6CFC2] rounded-lg text-xs text-dark flex-1 min-w-[120px] focus:outline-none font-body"
                />

                {/* Width input */}
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    value={seg.width || ''}
                    onChange={(e) => handleSegmentChange(idx, 'width', Math.max(5, Number(e.target.value) || 0))}
                    className="w-16 px-2.5 py-1.5 bg-white border border-[#D6CFC2] rounded-lg text-xs font-bold text-center font-mono focus:outline-none"
                  />
                  <span className="text-xs font-bold text-dark/60">cm</span>
                </div>

                {/* Delete button */}
                <button
                  type="button"
                  disabled={segments.length <= 1}
                  onClick={() => handleRemoveSegment(idx)}
                  className="p-1.5 text-dark/40 hover:text-red-600 disabled:opacity-20 ml-auto border border-[#D6CFC2] rounded-lg bg-white"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleAddSegment}
              disabled={segments.length >= 8}
              className="px-3 py-1 bg-white border border-[#D6CFC2] text-dark font-mono text-xs font-bold rounded-lg hover:bg-[#EDE8DF] cursor-pointer"
            >
              + segment
            </button>
            <span className="text-[11px] font-mono text-dark/50">
              segment sum: {currentSum} / {totalWidth} cm {isWidthMismatch ? '⚠️' : '✓'}
            </span>
          </div>

          {/* Dynamic Interactive Visual Schematic Box matching Screenshot 2 */}
          <div className="p-4 bg-[#F8F7F4] rounded-xl border border-[#D6CFC2]/80 space-y-2">
            <div className="flex items-stretch gap-1.5 h-16 w-full bg-white p-2 rounded-lg border border-[#D6CFC2]">
              {segments.map((seg, idx) => {
                const isCutout = seg.type === 'CUTOUT';
                const flexVal = Math.max(1, Number(seg.width) || 50);
                return (
                  <div
                    key={seg.id || idx}
                    style={{ flex: flexVal }}
                    className={`h-full rounded-lg flex flex-col items-center justify-center p-1 text-center border transition-all ${
                      isCutout
                        ? 'bg-[#33422C] border-[#283523] text-[#FDFBF7] font-bold shadow-xs'
                        : 'bg-[#F8F7F4] border-[#D6CFC2] text-dark font-medium'
                    }`}
                  >
                    <span className="text-[11px] truncate max-w-full leading-tight font-body">
                      {seg.label || (isCutout ? 'Big Green Egg' : 'kastje')}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-between text-[10px] font-mono text-dark/50 px-1 pt-1">
              <span>0</span>
              <span>{totalWidth} cm</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
