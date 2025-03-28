'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface MenuButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  disabled?: boolean;
  centered?: boolean;
}

export const MenuButton3D: React.FC<MenuButtonProps> = ({ 
  onClick, 
  children, 
  disabled = false,
  centered = false
}) => {
  return (
    <motion.div
      className={`menu-button-3d ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      onClick={disabled ? undefined : onClick}
      whileHover={!disabled ? { 
        y: -5, 
        scale: 1.02,
        boxShadow: '0 8px 25px rgba(58, 134, 255, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.2)',
        borderColor: 'rgba(255, 255, 255, 0.2)'
      } : undefined}
      whileTap={!disabled ? { 
        y: 0, 
        scale: 0.98,
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.1)'
      } : undefined}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
    >
      <div className={centered ? "button-content-centered" : "button-content justify-start"}>
        {children}
      </div>
      <motion.div 
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
        initial={{ x: '-100%' }}
        whileHover={{ x: '100%' }}
        transition={{ duration: 0.6, ease: 'easeInOut' }}
      />
    </motion.div>
  );
}; 