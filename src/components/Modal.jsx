import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Universal Portal Modal Component
 * Renders directly into document.body so that the backdrop and modal dialog
 * always sit on top of the entire viewport, covering the Sidebar and Topbar cleanly.
 */
export default function Modal({
  isOpen,
  onClose,
  children,
  className = '',
  containerClassName = '',
  backdropClassName = 'bg-black/60 backdrop-blur-xs',
  zIndex = 'z-[999999]'
}) {
  useEffect(() => {
    if (!isOpen) return;

    // Close on Escape key
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && onClose) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    // Prevent background scrolling while modal is open
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, onClose]);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div
          className={`fixed inset-0 ${zIndex} flex items-center justify-center p-3 sm:p-6 overflow-y-auto ${containerClassName}`}
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
        >
          {/* Fullscreen Dimming Backdrop covering Sidebar & Topbar */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={`fixed inset-0 ${backdropClassName}`}
            onClick={onClose}
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ duration: 0.2 }}
            className={`relative z-10 my-auto ${className}`}
            onClick={(e) => e.stopPropagation()}
          >
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
