import { motion } from 'framer-motion';

export default function Button({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  icon: Icon,
  ...props 
}) {
  const baseStyles = "inline-flex items-center justify-center font-medium rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed engraved-hover";
  
  const variants = {
    primary: "bg-primary text-cream hover:bg-primary/95 focus:ring-primary shadow-sm",
    secondary: "bg-secondary text-dark hover:bg-secondary/80 focus:ring-secondary shadow-sm",
    outline: "border border-secondary/60 bg-transparent text-dark hover:bg-light focus:ring-secondary",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-600 shadow-sm",
    ghost: "bg-transparent text-dark/70 hover:text-primary hover:bg-light focus:ring-secondary",
    custom: "",
  };

  const sizes = {
    sm: "px-2.5 py-1 text-xs",
    md: "px-3.5 py-1.5 text-[13px]",
    lg: "px-5 py-2.5 text-sm",
    icon: "p-1.5"
  };

  return (
    <motion.button 
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {Icon && <Icon className={`${children ? 'mr-1.5' : ''} w-4 h-4`} />}
      {children}
    </motion.button>
  );
}
