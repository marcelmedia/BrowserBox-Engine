'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { MenuButton3D } from '@/components/main-menu/menu-button';
import { LoadingScreen } from '@/components/loading-screen/loading-screen';

// Map types
interface MapData {
  id: string;
  title: string;
  description: string;
  author: string;
  version: string;
  releaseDate: string;
  thumbnail: string;
  model: string;
  supports: string[];
  tags: string[];
  size: string;
}

// Define game mode types
type GameMode = 'sandbox' | null;
type GameType = 'singleplayer' | 'multiplayer';

// Props for the GameModeSelector component
interface GameModeSelectorProps {
  onClose: () => void;
  onLaunchGame?: (mapId: string, mapTitle: string, gameMode: string, gameType: string) => void;
}

export function GameModeSelector({ onClose, onLaunchGame }: GameModeSelectorProps) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [backgroundPosition, setBackgroundPosition] = useState({ x: 0, y: 0 });
  const [selectedMode, setSelectedMode] = useState<GameMode | null>(null);
  const [selectedType, setSelectedType] = useState<GameType>('singleplayer');
  const [selectedMap, setSelectedMap] = useState<string | null>(null);
  const [showMultiplayerOptions, setShowMultiplayerOptions] = useState(false);
  const [maps, setMaps] = useState<MapData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGameLoading, setIsGameLoading] = useState(false);
  const [selectedMapData, setSelectedMapData] = useState<MapData | null>(null);
  const [serverSettings, setServerSettings] = useState({
    name: "Server #1",
    maxPlayers: 8,
    visibility: "Public",
    password: ""
  });

  // Fetch maps data
  useEffect(() => {
    const fetchMaps = async () => {
      try {
        setIsLoading(true);
        
        // Use the API route to get all available maps
        const response = await fetch('/api/maps');
        
        if (!response.ok) {
          throw new Error('Failed to fetch maps');
        }
        
        const mapsData = await response.json();
        setMaps(mapsData);
      } catch (error) {
        console.error('Error loading maps:', error);
        setMaps([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMaps();
  }, []);

  // Set selected map data when map is selected
  useEffect(() => {
    if (selectedMap && maps.length > 0) {
      const mapData = maps.find(map => map.id === selectedMap) || null;
      setSelectedMapData(mapData);
    } else {
      setSelectedMapData(null);
    }
  }, [selectedMap, maps]);

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

  // Fix any type
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleServerSettingChange = (key: string, value: any) => {
    setServerSettings({ ...serverSettings, [key]: value });
  };

  // Handle play button click
  const handlePlay = () => {
    if (selectedMode && selectedMap && selectedType && selectedMapData) {
      if (onLaunchGame) {
        // If onLaunchGame prop is provided, use it to launch the game
        onLaunchGame(selectedMapData.id, selectedMapData.title, selectedMode, selectedType);
      } else {
        // Otherwise fallback to the old behavior
        setIsGameLoading(true);
        // The loading screen will handle the loading simulation
      }
    }
  };

  // Handle when loading is cancelled
  const handleCancel = () => {
    // Just set loading state back to false, which keeps the modal open
    setIsGameLoading(false);
  };

  // Handle when loading is complete
  const handleLoadComplete = () => {
    console.log('Game loaded! Redirecting to game page...');
    // Here you would navigate to the actual game page
    // For now, we'll just close the modal after a delay
    setTimeout(() => {
      onClose();
    }, 1000);
  };

  return (
    <>
      {/* Loading Screen */}
      {isGameLoading && selectedMapData && (
        <LoadingScreen
          mapId={selectedMapData.id}
          mapTitle={selectedMapData.title}
          gameMode={selectedMode || ''}
          gameType={selectedType}
          onLoadComplete={handleLoadComplete}
          onCancel={handleCancel}
        />
      )}

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
        <div className="flex flex-1 min-h-0 overflow-hidden">
          {/* Main Content */}
          <div className="flex-1 flex flex-col min-h-0 p-6 overflow-hidden">
            {/* Game Modes Container - Using flex and justify-center/items-center for initial centering */}
            <div className={`flex-1 flex flex-col ${!selectedMode ? 'justify-center' : ''} transition-all duration-500 overflow-hidden`}>
              {/* Game Modes */}
              <motion.div 
                className="flex justify-center gap-6 mb-8"
                layout
                transition={{
                  layout: { duration: 0.5, ease: "easeInOut" }
                }}
              >
                <motion.div
                  className={`game-mode-item p-6 rounded-lg border cursor-pointer transition-all w-[340px] ${
                    selectedMode === 'sandbox' 
                      ? 'bg-blue-500/20 border-blue-500/50 selected' 
                      : 'bg-black/30 border-white/10 hover:bg-black/40 hover:border-white/20'
                  }`}
                  onClick={() => setSelectedMode('sandbox')}
                  whileHover={{ scale: 1.02, y: -5 }}
                  whileTap={{ scale: 0.98 }}
                  variants={itemVariants}
                  layout
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

                <motion.div
                  className="game-mode-item p-6 rounded-lg border cursor-not-allowed opacity-40 transition-all w-[340px] bg-black/50 border-white/5 grayscale"
                  variants={itemVariants}
                  layout
                >
                  <div className="relative">
                    <div className="absolute -top-2 -right-2 bg-red-500/80 text-white text-xs font-semibold px-2 py-1 rounded-full">
                      Coming Soon
                    </div>
                    <div className="flex flex-col items-center text-center">
                      <div className="game-mode-icon w-24 h-24 rounded-full bg-black/70 flex items-center justify-center mb-5">
                        <svg 
                          className="w-12 h-12 text-white/70" 
                          viewBox="0 0 32 32"
                          fill="currentColor"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path d="M13,2c-5,0-9,4-9,9v18c0,0.6,0.4,1,1,1h16c0.6,0,1-0.4,1-1V11C22,6,18,2,13,2z M17,14h-3v11c0,0.6-0.4,1-1,1s-1-0.4-1-1V14
                            H9c-0.6,0-1-0.4-1-1s0.4-1,1-1h3V7c0-0.6,0.4-1,1-1s1,0.4,1,1v5h3c0.6,0,1,0.4,1,1S17.6,14,17,14z"/>
                          <path d="M19.3,2c2.8,2,4.7,5.3,4.7,9v18c0,0.4-0.1,0.7-0.2,1H27c0.6,0,1-0.4,1-1V11C28,6.1,24.1,2.2,19.3,2z"/>
                        </svg>
                      </div>
                      <h3 className="text-3xl font-bold text-white/80 mb-3">Survival</h3>
                      <p className="text-white/50 text-lg max-w-md">
                        Fight endless waves of enemies with friends. Upgrade your weapons and defend your position!
                      </p>
                    </div>
                  </div>
                </motion.div>
              </motion.div>

              {/* Map Selection - AnimatePresence for smooth enter/exit animations */}
              <AnimatePresence>
                {selectedMode && (
                  <motion.div 
                    className="flex-1 border border-white/10 rounded-lg overflow-hidden flex flex-col min-h-0"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    <h3 className="text-xl font-bold text-white p-4 bg-black/30">Select Map</h3>
                    
                    {/* Map selection content area with fixed height to ensure scrollbar appears */}
                    <div className="flex-1 overflow-hidden p-4 min-h-[200px]">
                      {isLoading ? (
                        <div className="flex items-center justify-center h-full">
                          <div className="text-white">Loading maps...</div>
                        </div>
                      ) : maps.length === 0 ? (
                        <div className="flex items-center justify-center h-full">
                          <div className="text-white">No maps found.</div>
                        </div>
                      ) : (
                        <div className="h-full relative">
                          {/* Scroll indicators - only show if there are enough maps to scroll */}
                          {maps.filter(map => !selectedMode || map.supports.includes(selectedMode)).length > 3 && (
                            <>
                              <div className="absolute top-1/2 right-0 -translate-y-1/2 w-12 h-full bg-gradient-to-l from-black/20 to-transparent z-10 pointer-events-none"></div>
                              <div className="absolute top-1/2 left-0 -translate-y-1/2 w-12 h-full bg-gradient-to-r from-black/20 to-transparent z-10 pointer-events-none"></div>
                            </>
                          )}
                          
                          {/* Horizontal scrolling map container - force overflow-x-auto for scrollbar */}
                          <div 
                            className="flex overflow-x-auto pb-4 space-x-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent px-2 snap-x" 
                            style={{ 
                              WebkitOverflowScrolling: 'touch',
                              msOverflowStyle: 'none',
                              scrollbarWidth: 'thin' 
                            }}
                          >
                            {maps
                              .filter(map => !selectedMode || map.supports.includes(selectedMode))
                              .map(map => (
                                <div 
                                  key={map.id}
                                  className={`flex-shrink-0 bg-black/30 border rounded-lg overflow-hidden cursor-pointer transition-all w-72 snap-start ${
                                    selectedMap === map.id 
                                      ? 'bg-blue-500/20 border-blue-500/50 transform scale-[1.02]' 
                                      : 'border-white/10 hover:bg-black/40 hover:border-white/20 hover:transform hover:scale-[1.02]'
                                  }`}
                                  onClick={() => setSelectedMap(map.id)}
                                >
                                  <div className="relative aspect-[16/9]">
                                    <img 
                                      src={`/maps/${map.id}/${map.thumbnail}`} 
                                      alt={map.title} 
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                  <div className="p-3">
                                    <h4 className="text-base font-semibold text-white">{map.title}</h4>
                                    <p className="text-white/70 text-xs mt-0.5">{map.description}</p>
                                    
                                    {/* Author information only */}
                                    <div className="flex items-center mt-2">
                                      <span className="text-white/50 text-xs">By {map.author}</span>
                                    </div>
                                  </div>
                                </div>
                              ))}
                          </div>
                          
                          {/* No compatible maps message */}
                          {maps.filter(map => !selectedMode || map.supports.includes(selectedMode)).length === 0 && (
                            <div className="text-center py-10">
                              <p className="text-white/70">No compatible maps found for {selectedMode} mode.</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Side Panel - Force full height with flex-none instead of flex-shrink-0 */}
          <div className="w-80 flex-none bg-black/50 border-l border-white/10 p-5 overflow-y-auto">
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
              <div className={`menu-button-3d h-12 ${(!selectedMode || !selectedMap || !selectedType) ? 'opacity-50 cursor-not-allowed' : ''}`}>
                <div 
                  className="button-content-centered"
                  onClick={() => {
                    if (selectedMode && selectedMap && selectedType) {
                      handlePlay();
                    }
                  }}
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