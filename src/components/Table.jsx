import React, { useRef, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';

export default function Table({ columns, data, keyField = 'id', getRowClassName, getRowStyle, onRowClick }) {
  const { t, tStatus, language } = useLanguage();
  const scrollRef = useRef(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const handleWheel = (e) => {
      if (e.shiftKey) {
        e.preventDefault();
        el.scrollLeft += e.deltaY;
      }
    };
    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, []);

  return (
    <>
      {/* Mobile Card List View (< md screens) */}
      <div className="md:hidden space-y-3 w-full max-w-full overflow-hidden">
        {data.length > 0 ? (
          data.map((row, rIdx) => (
            <div 
              key={row[keyField] || rIdx}
              onClick={(e) => {
                if (e.target.closest('button, input, select, a, option')) return;
                if (onRowClick) onRowClick(row);
              }}
              className={`p-3.5 sm:p-4 bg-[#F8F7F4] border border-[#C4BEB3]/60 rounded-2xl space-y-3 text-xs font-body shadow-xs hover:border-primary/40 transition-colors w-full max-w-full overflow-hidden ${onRowClick ? 'cursor-pointer' : ''}`}
            >
              {columns.map((col, cIdx) => {
                const headerRaw = typeof col.header === 'string' ? col.header : '';
                const isActions = headerRaw.toLowerCase().includes('action') || headerRaw.toLowerCase().includes('actie');
                const cellContent = col.render ? col.render(row) : row[col.accessor];
                const headerText = typeof col.header === 'string' ? tStatus(col.header) : col.header;

                // 1. Actions Column: Render at bottom as clean action bar
                if (isActions) {
                  return (
                    <div key={cIdx} className="pt-2.5 mt-2.5 border-t border-[#C4BEB3]/40 flex flex-wrap items-center justify-end gap-1.5 w-full min-w-0">
                      {cellContent}
                    </div>
                  );
                }

                // 2. Primary Item Column (Column 0): Render as top title header block
                if (cIdx === 0) {
                  return (
                    <div key={cIdx} className="pb-2 mb-1 border-b border-[#C4BEB3]/40 flex items-center justify-between gap-3 min-w-0 w-full">
                      <div className="min-w-0 flex-1 text-left font-semibold text-dark text-xs sm:text-sm">
                        {cellContent}
                      </div>
                    </div>
                  );
                }

                // 3. Regular Data Columns: Stack label on top, value on bottom (100% full width, zero overflow)
                return (
                  <div key={cIdx} className="flex flex-col justify-start items-start gap-1 min-w-0 w-full overflow-hidden">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-dark/50 flex-shrink-0">
                      {headerText}
                    </span>
                    <div className="text-left font-medium text-dark/90 min-w-0 w-full max-w-full overflow-hidden">
                      {cellContent}
                    </div>
                  </div>
                );
              })}
            </div>
          ))
        ) : (
          <div className="p-8 text-center text-xs font-body text-dark/40 rounded-2xl border border-[#C4BEB3]/35 bg-[#F8F7F4]">
            {language === 'NL' ? 'Geen gegevens beschikbaar' : 'No data available'}
          </div>
        )}
      </div>

      {/* Desktop Table View (>= md screens) */}
      <div ref={scrollRef} className="hidden md:block overflow-x-auto rounded-xl p-1" style={{ scrollbarWidth: 'thin', scrollbarColor: '#C4BEB3 #F8F7F4' }}>
        <table className="w-full border-separate" style={{ borderSpacing: '0 8px', minWidth: '800px' }}>
          <thead>
            <tr>
              {columns.map((col, index) => {
                const headerText = typeof col.header === 'string' ? tStatus(col.header) : col.header;
                return (
                  <th
                    key={index}
                    scope="col"
                    className={`px-6 py-2 text-left text-[10px] font-bold font-body uppercase tracking-wider text-dark/50 ${col.className || ''}`}
                    style={col.style}
                  >
                    {headerText}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {data.length > 0 ? (
              data.map((row, rIdx) => {
                const rowClass = getRowClassName ? getRowClassName(row, rIdx) : '';
                const rowStyle = getRowStyle ? getRowStyle(row, rIdx) : {};
                return (
                  <tr
                    key={row[keyField] || rIdx}
                    onClick={(e) => {
                      if (e.target.closest('button, input, select, a, option')) return;
                      if (onRowClick) onRowClick(row);
                    }}
                    className={`transition-colors duration-200 group cursor-pointer ${rowClass}`}
                    style={{ position: 'relative', ...rowStyle }}
                  >
                  {columns.map((col, index) => (
                    <td 
                      key={index} 
                      className={`px-6 py-3.5 text-xs font-body text-dark/80 first:rounded-l-xl last:rounded-r-xl border-t border-b border-[#C4BEB3]/30 first:border-l last:border-r transition-colors duration-300 group-hover:bg-[#EDE8DF]/50 ${col.className || ''}`}
                      style={{ background: '#F8F7F4', whiteSpace: 'nowrap', ...col.style }}
                    >
                      {col.render ? col.render(row) : row[col.accessor]}
                    </td>
                  ))}
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan={columns.length} className="px-6 py-12 text-center text-xs font-body text-dark/40 bg-[#F8F7F4] rounded-xl border border-[#C4BEB3]/30">
                {language === 'NL' ? 'Geen gegevens gevonden.' : 'No records found.'}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
    </>
  );
}
