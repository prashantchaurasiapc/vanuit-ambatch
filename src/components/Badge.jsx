import React from 'react';
import { useLanguage } from '../context/LanguageContext';

export default function Badge({ children, variant = 'default', className = '' }) {
  const { tStatus } = useLanguage();
  
  const variants = {
    default: "bg-secondary/40 text-dark",
    success: "bg-green-100 text-green-800",
    warning: "bg-yellow-100 text-yellow-800",
    danger: "bg-red-100 text-red-800",
    info: "bg-blue-100 text-blue-800",
    primary: "bg-primary/10 text-primary",
  };

  const displayText = typeof children === 'string' ? tStatus(children) : children;

  return (
    <span className={`inline-flex items-center whitespace-nowrap flex-shrink-0 px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]} ${className}`}>
      {displayText}
    </span>
  );
}
