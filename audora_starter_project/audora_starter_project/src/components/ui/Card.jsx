import React from 'react';
import { motion } from 'framer-motion';

const Card = ({
  children,
  variant = 'default',
  hover = true,
  className = '',
  onClick,
  ...props
}) => {
  const variants = {
    default: 'bg-dark-200 border border-dark-100',
    glass: 'bg-white/10 backdrop-blur-md border border-white/10',
    elevated: 'bg-dark-200 shadow-lg shadow-black/30 border border-dark-100/50',
    gradient: 'bg-gradient-to-br from-primary-900/80 to-primary-700/50 border border-primary-700/30',
    dark: 'bg-black/60 backdrop-blur-sm border border-gray-800/50',
  };

  return (
    <motion.div
      whileHover={hover ? { y: -5, transition: { duration: 0.2 } } : {}}
      whileTap={onClick ? { scale: 0.98 } : {}}
      onClick={onClick}
      className={`rounded-xl overflow-hidden ${variants[variant]} transition-all duration-300 ${className} ${onClick ? 'cursor-pointer' : ''}`}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export const CardHeader = ({ children, className = '', ...props }) => (
  <div className={`p-4 ${className}`} {...props}>
    {children}
  </div>
);

export const CardMedia = ({ 
  src, 
  alt = '',
  className = '',
  aspectRatio = 'aspect-video',
  overlay = false,
  overlayColor = 'from-transparent to-black/70',
  ...props 
}) => (
  <div className={`relative ${aspectRatio} overflow-hidden ${className}`}>
    <img 
      src={src} 
      alt={alt} 
      className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
      {...props}
    />
    {overlay && (
      <div className={`absolute inset-0 bg-gradient-to-t ${overlayColor}`}></div>
    )}
  </div>
);

export const CardContent = ({ children, className = '', ...props }) => (
  <div className={`p-4 ${className}`} {...props}>
    {children}
  </div>
);

export const CardFooter = ({ children, className = '', ...props }) => (
  <div className={`p-4 border-t border-gray-800/50 ${className}`} {...props}>
    {children}
  </div>
);

export const CardHoverOverlay = ({ children, className = '' }) => (
  <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-center justify-center bg-dark-300/80 backdrop-blur-sm z-10 p-4">
    <div className={className}>
      {children}
    </div>
  </div>
);

export const CardBadge = ({ children, color = 'primary', className = '' }) => {
  const colorVariants = {
    primary: 'bg-primary-500 text-white',
    secondary: 'bg-gray-500 text-white',
    success: 'bg-green-500 text-white',
    danger: 'bg-red-500 text-white',
    warning: 'bg-yellow-500 text-black',
    info: 'bg-blue-500 text-white',
    dark: 'bg-gray-800 text-white',
    light: 'bg-gray-200 text-gray-800',
  };

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${colorVariants[color]} ${className}`}>
      {children}
    </span>
  );
};

Card.Header = CardHeader;
Card.Media = CardMedia;
Card.Content = CardContent;
Card.Footer = CardFooter;
Card.HoverOverlay = CardHoverOverlay;
Card.Badge = CardBadge;

export default Card; 