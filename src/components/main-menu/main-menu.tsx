'use client';

import { useState, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ServerBrowser } from '@/components/server-browser/server-browser';
import { LoaderMessage } from '@/components/main-menu/loader-message';
import { MenuButton3D } from '@/components/main-menu/menu-button';
import { GameModeSelector } from '@/components/game-mode/game-mode-selector';
import dynamic from 'next/dynamic';

// Dynamic import of Three.js component to avoid SSR issues
const BackgroundScene = dynamic(
  () => import('@/components/three-background/background-scene').then(mod => mod.BackgroundScene),
  { ssr: false, loading: () => <LoaderMessage /> }
);

// Version number in the GMod format
const VERSION = '0.0.1_prealpha_dev_280325_0230 - Made with ❤️ by MarcelMedia';

export function MainMenu() {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showServerBrowser, setShowServerBrowser] = useState(false);
  const [showGameModeSelector, setShowGameModeSelector] = useState(false);
  const [backgroundPosition, setBackgroundPosition] = useState({ x: 0, y: 0 });

  // Background parallax effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 15;
      const y = (e.clientY / window.innerHeight) * 15;
      setBackgroundPosition({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleOptionClick = (option: string) => {
    setSelectedOption(option);
    
    if (option === 'browser') {
      setShowServerBrowser(true);
    } else if (option === 'play') {
      setShowGameModeSelector(true);
    }
  };

  const handleCloseServerBrowser = () => {
    setShowServerBrowser(false);
    setSelectedOption(null);
  };

  const handleCloseGameModeSelector = () => {
    setShowGameModeSelector(false);
    setSelectedOption(null);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        when: "beforeChildren",
        staggerChildren: 0.15,
        delayChildren: 0.3,
        ease: "easeOut",
        duration: 0.6
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -50, scale: 0.9 },
    visible: { 
      opacity: 1, 
      x: 0,
      scale: 1,
      transition: { 
        type: 'spring',
        stiffness: 400,
        damping: 20
      }
    }
  };

  const logoVariants = {
    hidden: { opacity: 0, x: -70, scale: 0.9 },
    visible: { 
      opacity: 1, 
      x: 0,
      scale: 1,
      transition: { 
        type: 'spring',
        stiffness: 300,
        damping: 15,
        delay: 0.1
      }
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-background overflow-hidden">
      {/* Three.js Background Scene */}
      <Suspense fallback={<div className="fixed inset-0 bg-background"></div>}>
        <BackgroundScene />
      </Suspense>
      
      {/* Overlay for better text readability */}
      <div className="absolute inset-0 z-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
      
      {/* Main content container - positioned on the left */}
      <motion.div 
        className="relative z-20 w-full h-screen flex flex-col justify-center p-6 pl-12 md:pl-20 lg:pl-32"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Game logo */}
        <motion.div 
          className="mb-10 max-w-md"
          variants={logoVariants}
        >
          <h1 className="text-6xl font-extrabold text-primary tracking-tighter mb-2 drop-shadow-lg">
            BROWSER<span className="text-white">MOD</span>
          </h1>
          <div className="h-3 w-full rounded-full bg-gradient-to-r from-primary to-orange-400 shadow-lg shadow-primary/30" />
        </motion.div>

        {/* Menu options */}
        <div className="flex flex-col gap-3 w-full max-w-sm">
          <motion.div variants={itemVariants}>
            <MenuButton3D onClick={() => handleOptionClick('play')}>
              Play
            </MenuButton3D>
          </motion.div>

          <motion.div variants={itemVariants}>
            <MenuButton3D onClick={() => handleOptionClick('browser')}>
              Server Browser
            </MenuButton3D>
          </motion.div>
        </div>

        {/* Version number */}
        <motion.div 
          className="absolute bottom-4 left-4 version-number"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { delay: 1.5 } }}
        >
          {VERSION}
        </motion.div>
      </motion.div>
      
      {/* Server Browser Modal */}
      <AnimatePresence>
        {showServerBrowser && (
          <ServerBrowser onClose={handleCloseServerBrowser} />
        )}
      </AnimatePresence>

      {/* Game Mode Selector Modal */}
      <AnimatePresence>
        {showGameModeSelector && (
          <GameModeSelector onClose={handleCloseGameModeSelector} />
        )}
      </AnimatePresence>
    </div>
  );
} 