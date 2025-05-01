import React from 'react';
import { motion } from 'framer-motion';

// Fade in animation
export const FadeIn = ({ children, delay = 0, duration = 0.5, ...props }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration, delay }}
    {...props}
  >
    {children}
  </motion.div>
);

// Scale animation
export const ScaleIn = ({ children, delay = 0, duration = 0.5, ...props }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.9 }}
    transition={{ duration, delay }}
    {...props}
  >
    {children}
  </motion.div>
);

// Slide up animation
export const SlideUp = ({ children, delay = 0, duration = 0.5, ...props }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 20 }}
    transition={{ duration, delay }}
    {...props}
  >
    {children}
  </motion.div>
);

// Slide in from left
export const SlideInLeft = ({ children, delay = 0, duration = 0.5, ...props }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    transition={{ duration, delay }}
    {...props}
  >
    {children}
  </motion.div>
);

// Slide in from right
export const SlideInRight = ({ children, delay = 0, duration = 0.5, ...props }) => (
  <motion.div
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: 20 }}
    transition={{ duration, delay }}
    {...props}
  >
    {children}
  </motion.div>
);

// Hover animation for cards
export const HoverCard = ({ children, scale = 1.03, ...props }) => (
  <motion.div
    whileHover={{ scale, transition: { duration: 0.2 } }}
    whileTap={{ scale: 0.98 }}
    {...props}
  >
    {children}
  </motion.div>
);

// Staggered children animation
export const StaggerContainer = ({ children, delayChildren = 0.1, staggerChildren = 0.1, ...props }) => (
  <motion.div
    variants={{
      show: {
        transition: {
          staggerChildren,
          delayChildren,
        },
      },
    }}
    initial="hidden"
    animate="show"
    {...props}
  >
    {children}
  </motion.div>
);

// Child item for stagger container
export const StaggerItem = ({ children, ...props }) => (
  <motion.div
    variants={{
      hidden: { opacity: 0, y: 20 },
      show: { opacity: 1, y: 0 },
    }}
    {...props}
  >
    {children}
  </motion.div>
);

// Pulse animation
export const Pulse = ({ children, ...props }) => (
  <motion.div
    animate={{ 
      scale: [1, 1.03, 1],
    }}
    transition={{ 
      duration: 2,
      ease: "easeInOut", 
      repeat: Infinity,
    }}
    {...props}
  >
    {children}
  </motion.div>
);

// Animation for page transitions
export const PageTransition = ({ children }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.3 }}
    className="w-full h-full"
  >
    {children}
  </motion.div>
);

export default {
  FadeIn,
  ScaleIn,
  SlideUp,
  SlideInLeft,
  SlideInRight,
  HoverCard,
  StaggerContainer,
  StaggerItem,
  Pulse,
  PageTransition,
}; 