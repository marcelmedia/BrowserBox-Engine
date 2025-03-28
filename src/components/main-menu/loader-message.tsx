'use client';

import { motion } from 'framer-motion';

export function LoaderMessage() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
      <motion.div
        className="flex flex-col items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="w-20 h-20 mb-4 border-4 border-t-primary border-r-primary border-b-transparent border-l-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        />
        <h2 className="text-2xl font-bold text-primary mb-2">Loading World</h2>
        <p className="text-muted-foreground">Please wait...</p>
      </motion.div>
    </div>
  );
} 