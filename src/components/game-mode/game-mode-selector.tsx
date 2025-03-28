'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Users, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MenuButton3D } from '@/components/main-menu/menu-button';

// Define game mode types
type GameMode = 'sandbox';
type GameType = 'singleplayer' | 'multiplayer';

// Props for the GameModeSelector component
interface GameModeSelectorProps {
  onClose: () => void;
}

export function GameModeSelector({ onClose }: GameModeSelectorProps) {
  const [selectedMode, setSelectedMode] = useState<GameMode | null>(null);
  const [selectedType, setSelectedType] = useState<GameType>('singleplayer');
  const [showMultiplayerOptions, setShowMultiplayerOptions] = useState(false);
  const [serverSettings, setServerSettings] = useState({
    name: "Server #1",
    maxPlayers: 8,
    visibility: "Public",
    password: ""
  });

  // Modal animation variants
  const modalVariants = {
    hidden: { 
      opacity: 0,
      scale: 0.98,
      y: 10
    },
    visible: { 
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { 
        type: "spring",
        duration: 0.5,
        bounce: 0.2
      }
    },
    exit: { 
      opacity: 0,
      scale: 0.98,
      y: 5,
      transition: { 
        duration: 0.2,
        ease: "easeOut"
      }
    }
  };

  // Backdrop animation variants
  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { duration: 0.3 }
    },
    exit: { 
      opacity: 0,
      transition: { duration: 0.2 }
    }
  };

  // Item animation variants
  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        type: "spring",
        stiffness: 350,
        damping: 25
      }
    }
  };

  // Update server setting
  const handleServerSettingChange = (key: string, value: any) => {
    setServerSettings({ ...serverSettings, [key]: value });
  };

  return (
    <>
      {/* Modal Backdrop */}
      <motion.div 
        className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
        variants={backdropVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        onClick={onClose}
      />

      {/* Modal Content */}
      <motion.div 
        className="fixed inset-0 z-50 m-8 rounded-xl bg-black/40 backdrop-blur-xl border border-white/10 shadow-2xl flex flex-col overflow-hidden"
        variants={modalVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 flex items-center justify-between bg-gradient-to-r from-blue-600/80 to-purple-600/80 border-b border-white/10">
          <h2 className="text-2xl font-bold text-white">Select Game Mode</h2>
          <Button 
            variant="outline" 
            size="icon"
            onClick={onClose}
            className="rounded-full bg-black/20 border-white/10 text-white hover:bg-white/20 hover:border-white/20"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Modal Content */}
        <div className="flex flex-grow overflow-auto">
          {/* Main Content */}
          <div className="flex-grow p-6 overflow-y-auto">
            {/* Game Modes - Only Sandbox */}
            <div className="flex justify-center mb-8">
              <motion.div
                className={`game-mode-item p-6 rounded-lg border cursor-pointer transition-all max-w-xl ${
                  selectedMode === 'sandbox' 
                    ? 'bg-blue-500/20 border-blue-500/50 selected' 
                    : 'bg-black/30 border-white/10 hover:bg-black/40 hover:border-white/20'
                }`}
                onClick={() => setSelectedMode('sandbox')}
                whileHover={{ scale: 1.02, y: -5 }}
                whileTap={{ scale: 0.98 }}
                variants={itemVariants}
              >
                <div className="flex flex-col items-center text-center">
                  <div className="game-mode-icon w-24 h-24 rounded-full bg-black/50 flex items-center justify-center mb-5">
                    <Home className="w-12 h-12 text-white" />
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-3">Sandbox</h3>
                  <p className="text-white/70 text-lg max-w-md">
                    Your classic BrowserMod sandbox experience! Spawn, build and experiment freely with your friends or alone.
                  </p>
                </div>
              </motion.div>
            </div>

            {/* Map Selection */}
            <motion.div 
              className="border border-white/10 rounded-lg overflow-hidden max-w-4xl mx-auto"
              variants={itemVariants}
            >
              <h3 className="text-xl font-bold text-white p-4 bg-black/30">Select Map</h3>
              <div className="p-12 flex items-center justify-center">
                <p className="text-white/50 italic text-lg">No maps available yet</p>
              </div>
            </motion.div>
          </div>

          {/* Side Panel - Adjusted width */}
          <div className="w-80 bg-black/50 border-l border-white/10 p-5 overflow-y-auto">
            <h3 className="text-xl font-bold text-white mb-4">Game Type</h3>
            
            <div className="space-y-3 mb-6 px-0.5">
              <div className={`menu-button-3d h-12 ${selectedType === 'singleplayer' ? 'bg-blue-600/80 border-blue-500/70' : ''}`}>
                <div 
                  className="button-content justify-start"
                  onClick={() => {
                    setSelectedType('singleplayer');
                    setShowMultiplayerOptions(false);
                  }}
                >
                  <User size={18} className="mr-2" />
                  Singleplayer
                </div>
              </div>
              
              <div className={`menu-button-3d h-12 ${selectedType === 'multiplayer' ? 'bg-blue-600/80 border-blue-500/70' : ''}`}>
                <div 
                  className="button-content justify-start"
                  onClick={() => {
                    setSelectedType('multiplayer');
                    setShowMultiplayerOptions(true);
                  }}
                >
                  <Users size={18} className="mr-2" />
                  Multiplayer
                </div>
              </div>
            </div>

            {/* Multiplayer Options */}
            <AnimatePresence>
              {showMultiplayerOptions && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <h3 className="text-xl font-bold text-white mb-4">Multiplayer Options</h3>
                  
                  <div className="space-y-5 px-0.5 pb-2">
                    <div>
                      <label className="text-white text-sm block mb-2">Server Name</label>
                      <input
                        type="text"
                        value={serverSettings.name}
                        onChange={(e) => handleServerSettingChange('name', e.target.value)}
                        className="w-full bg-black/30 border border-white/10 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        placeholder="Server #1"
                      />
                    </div>
                    
                    <div>
                      <label className="text-white text-sm block mb-2">Max Players</label>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 flex items-center">
                          <input
                            type="range"
                            min="1"
                            max="16"
                            value={serverSettings.maxPlayers}
                            onChange={(e) => {
                              const newValue = parseInt(e.target.value);
                              handleServerSettingChange('maxPlayers', newValue);
                              // Update the CSS variable for the filled portion
                              const percentage = ((newValue - 1) / 15) * 100;
                              e.target.style.setProperty('--range-progress', `${percentage}%`);
                            }}
                            className="w-full game-slider"
                            style={{ 
                              // Initialize the filled portion based on current value
                              '--range-progress': `${((serverSettings.maxPlayers - 1) / 15) * 100}%` 
                            } as React.CSSProperties}
                          />
                        </div>
                        <span className="text-white bg-black border border-white/10 rounded-md px-3 py-1 min-w-[32px] text-center">
                          {serverSettings.maxPlayers}
                        </span>
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-white text-sm block mb-2">Server Visibility</label>
                      <div className="relative">
                        <select
                          value={serverSettings.visibility}
                          onChange={(e) => handleServerSettingChange('visibility', e.target.value)}
                          className="w-full bg-black border border-white/10 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none server-dropdown"
                        >
                          <option value="Public">Public</option>
                          <option value="Friends">Friends Only</option>
                          <option value="Private">Private</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                          </svg>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-white text-sm block mb-2">Password (Optional)</label>
                      <input
                        type="password"
                        value={serverSettings.password}
                        onChange={(e) => handleServerSettingChange('password', e.target.value)}
                        className="w-full bg-black/30 border border-white/10 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        placeholder="Leave empty for no password"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-black/40 backdrop-blur-md p-4 border-t border-white/10 flex justify-end items-center">
          <div className="flex gap-3">
            <div className="w-28">
              <div className="menu-button-3d h-12">
                <div 
                  className="button-content-centered"
                  onClick={onClose}
                >
                  Back
                </div>
              </div>
            </div>
            <div className="w-28">
              <div className={`menu-button-3d h-12 ${!selectedMode ? 'opacity-50 cursor-not-allowed' : ''}`}>
                <div 
                  className="button-content-centered"
                  onClick={() => selectedMode && console.log('Play clicked')}
                >
                  Play
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
} 