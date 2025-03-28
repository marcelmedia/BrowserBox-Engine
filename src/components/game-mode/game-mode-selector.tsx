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
        <div className="p-4 flex items-center justify-between bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-b border-white/10">
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
                    <svg 
                      className="w-12 h-12 text-white" 
                      width="512" 
                      height="512" 
                      viewBox="0 0 512 512" 
                      xmlns="http://www.w3.org/2000/svg"
                      fill="currentColor"
                    >
                      <path d="m0 357.7227783 247 140v-120l-247-110zm512-89.981781-247 109.981781v120l247-139.4848328zm-56.8358154 10.1654663 38.7610168-17.1413269-85.0889282-32.2471313-7.8757324 21.2828522c15.5272522 6.8700408 34.0503235 16.6861724 54.2036438 28.105606zm-97.818573-263.6292543-16.092926 45.1839714c-3.5722656 12.4966965 2.8353271 31.6537094 23.4079895 35.6736603l-26.8122559 74.8105469c-21.792511-9.1030426-41.2434082-2.8312988-52.9347229 9.8306732l-29.3911591-11.2871399-237.4623966 92.2401437 38.6854248 16.8948059c63.5622597-37.8819122 138.7563324-64.0265045 210.7644806-59.8922424l-10.43573 28.0362244c-27.3458252.8110809-50.7308655 7.6781158-71.2333374 18.9524841 71.5344849-11.513092 146.0503845 7.610199 201.1564026 35.9378357-1.3308411-6.491394-4.9849548-12.3795471-11.0791931-18.2104187l19.4934082-55.2486572c5.8800964-15.7834625 1.237915-45.6482239-35.2806091-51.0641327l26.9246826-74.5845566c25.2302856 6.3505249 40.2459106-10.0839539 43.7929382-20.9614563l14.6986694-41.8628845zm50.25531 60.6137132c-.7280273 3.0333557-6.0735474 5.5181885-10.3134766 3.6400299l-26.3297119-7.4014206c-5.1257629-2.0163651-7.1122131-5.1521301-5.4601135-9.5854416l6.1880798-17.4722404 42.9526062 12.0121307z" />
                    </svg>
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-3">Sandbox</h3>
                  <p className="text-white/70 text-lg max-w-md">
                    Your classic sandbox experience! Spawn, build, and experiment freely with friends or on your own.
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