import { motion } from 'framer-motion';

// Using explicit hex colors so Tailwind custom class issues don't affect rendering
export default function Card({ children, className = '', title, action, noPadding = false }) {
  return (
    <motion.div
      whileHover={{ y: -2, boxShadow: '0 8px 30px rgba(62,78,54,0.12)' }}
      transition={{ type: 'spring', stiffness: 350, damping: 25 }}
      className={`rounded-xl overflow-hidden border texture-wood ${className}`}
      style={{
        background: '#EDE8DF',
        borderColor: '#C4BEB3',
        boxShadow: '0 2px 16px rgba(62,78,54,0.07)'
      }}
    >
      {(title || action) && (
        <div
          className="px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center bg-[#EDE8DF]"
          style={{ borderBottom: '1px solid #C4BEB3' }}
        >
          {title && (
            <h3 className="font-heading font-semibold text-xs sm:text-sm tracking-wide leading-tight" style={{ color: 'var(--primary-color)' }}>
              {title}
            </h3>
          )}
          {action && <div className="flex-shrink-0 ml-2">{action}</div>}
        </div>
      )}
      <div className={noPadding ? '' : 'p-4 sm:p-6'}>
        {children}
      </div>
    </motion.div>
  );
}
