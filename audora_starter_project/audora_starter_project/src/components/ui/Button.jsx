import React from 'react';
import { motion } from 'framer-motion';

const buttonVariants = {
  primary: 'bg-primary-600 hover:bg-primary-700 text-white',
  secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800',
  ghost: 'bg-transparent hover:bg-white/10 text-white',
  danger: 'bg-red-600 hover:bg-red-700 text-white',
  success: 'bg-green-600 hover:bg-green-700 text-white',
  outlined: 'bg-transparent border border-primary-600 text-primary-600 hover:bg-primary-600/10',
  glass: 'bg-white/10 backdrop-blur-md hover:bg-white/20 text-white border border-white/20',
  dark: 'bg-dark-300 hover:bg-dark-200 text-white border border-dark-100',
};

const sizeVariants = {
  xs: 'py-1 px-2 text-xs',
  sm: 'py-1.5 px-3 text-sm',
  md: 'py-2 px-4 text-base',
  lg: 'py-2.5 px-6 text-lg',
  xl: 'py-3 px-8 text-xl',
};

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  disabled = false,
  fullWidth = false,
  rounded = 'md',
  className = '',
  onClick,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center transition duration-200 font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500';
  const roundedClasses = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    full: 'rounded-full',
  };

  const disabledClasses = disabled 
    ? 'opacity-50 cursor-not-allowed' 
    : 'transform active:scale-95';

  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <motion.button
      whileTap={{ scale: disabled ? 1 : 0.97 }}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      transition={{ duration: 0.1 }}
      disabled={disabled}
      onClick={onClick}
      className={`
        ${baseClasses}
        ${buttonVariants[variant]}
        ${sizeVariants[size]}
        ${roundedClasses[rounded]}
        ${disabledClasses}
        ${widthClass}
        ${className}
      `}
      {...props}
    >
      {icon && iconPosition === 'left' && (
        <span className={`mr-2 ${size === 'xs' || size === 'sm' ? 'text-base' : 'text-xl'}`}>
          {icon}
        </span>
      )}
      {children}
      {icon && iconPosition === 'right' && (
        <span className={`ml-2 ${size === 'xs' || size === 'sm' ? 'text-base' : 'text-xl'}`}>
          {icon}
        </span>
      )}
    </motion.button>
  );
};

export default Button; 