'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

interface LoadingScreenProps {
  mapId: string;
  mapTitle: string;
  gameMode: string;
  gameType: string;
  isExiting?: boolean;
  onLoadComplete?: () => void;
  onCancel?: () => void;
}

// Loading stages and their corresponding messages
const loadingStages = {
  MAP_GEOMETRY: 'Loading map geometry...',
  TEXTURES: 'Loading textures...',
  PHYSICS: 'Initializing physics...',
  ENTITIES: 'Loading world entities...',
  PROPS: 'Spawning props...',
  TOOLS: 'Preparing tools...',
  LIGHTING: 'Setting up lighting...',
  PLAYER: 'Configuring player...',
  GAME_RULES: 'Initializing game rules...',
  SERVER: 'Connecting to game server...',
  COMPLETE: 'Loading complete!'
};

const loadingTips = [
  'Press "E" to use objects and interact with the world.',
  'Access tools and props through the menu by pressing "Q".',
  'You can spawn items and build structures in sandbox mode.',
  'Invite friends to join your multiplayer game.',
  'Using physics objects requires careful placement and handling.',
  'You can save your creations to share them with others.',
  'Try experimenting with different tools to see what they do.',
  'Vehicles can be driven by pressing "E" while looking at them.',
  'Use the gravity gun to pick up and manipulate objects.',
  'Spawning too many objects might impact performance.'
];

export function LoadingScreen({ mapId, mapTitle, gameMode, gameType, isExiting: externalIsExiting, onLoadComplete, onCancel }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [currentStage, setCurrentStage] = useState<keyof typeof loadingStages>('MAP_GEOMETRY');
  const [currentMessage, setCurrentMessage] = useState(loadingStages.MAP_GEOMETRY);
  const [showLoadingScreen, setShowLoadingScreen] = useState(true);
  const [currentTip] = useState(loadingTips[Math.floor(Math.random() * loadingTips.length)]);
  const [isExiting, setIsExiting] = useState(false);
  const [loadingManager] = useState(() => new THREE.LoadingManager());
  const [mapLoaded, setMapLoaded] = useState(false);
  const [allResourcesLoaded, setAllResourcesLoaded] = useState(false);

  // Handle external isExiting prop
  useEffect(() => {
    if (externalIsExiting) {
      setIsExiting(true);
      
      // Add a delay to ensure animation completes before callback
      setTimeout(() => {
        setShowLoadingScreen(false);
      }, 800); // Match this with exit animation duration
    }
  }, [externalIsExiting]);

  const updateLoadingProgress = useCallback((url: string, itemsLoaded: number, itemsTotal: number) => {
    // Calculate effective progress based on current stage
    const baseProgress = mapLoaded ? 40 : 0;
    const stageProgress = (itemsLoaded / itemsTotal) * (mapLoaded ? 60 : 40);
    const totalProgress = baseProgress + stageProgress;
    
    setProgress(totalProgress);

    // Update loading message based on the type of resource being loaded
    if (url.includes('.glb')) {
      setCurrentMessage(loadingStages.MAP_GEOMETRY);
      setCurrentStage('MAP_GEOMETRY');
    } else if (url.includes('physics')) {
      setCurrentMessage(loadingStages.PHYSICS);
      setCurrentStage('PHYSICS');
    } else if (url.includes('entities')) {
      setCurrentMessage(loadingStages.ENTITIES);
      setCurrentStage('ENTITIES');
    } else if (url.includes('props')) {
      setCurrentMessage(loadingStages.PROPS);
      setCurrentStage('PROPS');
    }
  }, [mapLoaded]);

  // Configure loading manager
  useEffect(() => {
    if (!mapId) return;

    loadingManager.onProgress = updateLoadingProgress;
    
    loadingManager.onLoad = () => {
      console.log("LoadingManager onLoad triggered");
      // This gets triggered when all resources loaded through this manager are complete
      // We don't want to complete here as we have more stages to go through
      
      if (!mapLoaded) {
        setMapLoaded(true);
        // Now proceed with the rest of the loading sequence
      }
    };

    loadingManager.onError = (url) => {
      console.error(`Error loading ${url}`);
    };
  }, [loadingManager, mapId, updateLoadingProgress, mapLoaded]);

  // Handle the completion of loading
  useEffect(() => {
    if (allResourcesLoaded && !isExiting) {
      setProgress(100);
      setCurrentMessage(loadingStages.COMPLETE);
      setCurrentStage('COMPLETE');
      
      // Small delay before completing to show 100%
      setTimeout(() => {
        setIsExiting(true);
        setTimeout(() => {
          setShowLoadingScreen(false);
          if (onLoadComplete) onLoadComplete();
        }, 800);
      }, 1000);
    }
  }, [allResourcesLoaded, isExiting, onLoadComplete]);

  // Load map resources
  useEffect(() => {
    if (!mapId) return;
    
    // Start the staged loading process
    const loadResources = async () => {
      try {
        // Stage 1: Load the map model
        setCurrentMessage(loadingStages.MAP_GEOMETRY);
        setCurrentStage('MAP_GEOMETRY');
        const mapUrl = `/maps/${mapId}/model.glb`;
        
        // Create a GLTF loader with our loading manager
        const gltfLoader = new GLTFLoader(loadingManager);
        
        // Load the map model and wait for it to complete
        await new Promise<void>((resolve, reject) => {
          gltfLoader.load(
            mapUrl, 
            (gltf) => {
              console.log('Map model loaded successfully', gltf);
              setMapLoaded(true);
              resolve();
            },
            (progress) => {
              // Update progress as the model loads
              if (progress.total > 0) {
                const percent = (progress.loaded / progress.total) * 40;
                setProgress(percent);
              }
            },
            (error) => {
              console.error('Error loading map model:', error);
              reject(error);
            }
          );
        });
        
        // Only proceed once the map is loaded
        if (mapLoaded) {
          setProgress(40);
          
          // Stage 2: Initialize physics - textures are already in the model.glb
          setCurrentMessage(loadingStages.PHYSICS);
          setCurrentStage('PHYSICS');
          await new Promise(resolve => setTimeout(resolve, 1000));
          setProgress(50);
          
          // Stage 3: Load entities
          setCurrentMessage(loadingStages.ENTITIES);
          setCurrentStage('ENTITIES');
          await new Promise(resolve => setTimeout(resolve, 1000));
          setProgress(60);
          
          // Stage 4: Load props
          setCurrentMessage(loadingStages.PROPS);
          setCurrentStage('PROPS');
          await new Promise(resolve => setTimeout(resolve, 1000));
          setProgress(70);

          // Simulate loading other components
          const stages: Array<keyof typeof loadingStages> = [
            'TOOLS',
            'LIGHTING',
            'PLAYER',
            'GAME_RULES',
            'SERVER'
          ];
          
          for (let i = 0; i < stages.length; i++) {
            const stage = stages[i];
            setCurrentMessage(loadingStages[stage]);
            setCurrentStage(stage);
            // More realistic loading time
            await new Promise(resolve => setTimeout(resolve, 800));
            setProgress(70 + ((i + 1) / stages.length) * 30);
          }
          
          // All resources loaded
          setAllResourcesLoaded(true);
        }
      } catch (error) {
        console.error("Error loading resources:", error);
      }
    };

    loadResources();
  }, [loadingManager, mapId, mapLoaded]);

  // Handle ESC key press to cancel loading
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isExiting) {
        e.preventDefault(); // Prevent default behavior
        handleCancel();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isExiting]);

  // Handle cancel action with animation
  const handleCancel = () => {
    // Start exit animation
    setIsExiting(true);
    
    // Add a delay to ensure animation completes before callback
    setTimeout(() => {
      setShowLoadingScreen(false);
      if (onCancel) {
        onCancel();
      }
    }, 800); // Match this with exit animation duration
  };

  return (
    <AnimatePresence>
      {showLoadingScreen && (
        <motion.div 
          className="fixed inset-0 z-[1001] flex flex-col"
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ 
            opacity: isExiting ? 0 : 1, 
            scale: isExiting ? 1.05 : 1,
            transition: {
              duration: isExiting ? 0.6 : 0.8,
              ease: isExiting ? [0.43, 0.13, 0.23, 0.96] : [0.22, 1, 0.36, 1]
            }
          }}
          exit={{ 
            opacity: 0,
            scale: 1.05,
            transition: { 
              duration: 0.5,
              ease: "easeInOut"
            }
          }}
        >
          {/* Map background with blur overlay */}
          <motion.div 
            className="absolute inset-0 z-0"
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ 
              opacity: isExiting ? 0 : 1, 
              scale: isExiting ? 1.15 : 1,
              transition: { 
                duration: isExiting ? 0.7 : 1.2,
                ease: "easeOut"
              }
            }}
          >
            <div 
              className="absolute inset-0 bg-center bg-cover" 
              style={{ backgroundImage: `url('/maps/${mapId}/thumbnail.webp')` }}
            />
            <motion.div 
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ 
                opacity: isExiting ? 0 : 1,
                transition: { duration: isExiting ? 0.7 : 1.5 }
              }}
            />
          </motion.div>

          {/* Top left info */}
          <motion.div 
            className="relative z-10 p-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ 
              opacity: isExiting ? 0 : 1, 
              y: isExiting ? -30 : 0,
              transition: { 
                duration: 0.8,
                delay: isExiting ? 0 : 0.3,
                ease: "easeOut" 
              }
            }}
          >
            <div className="flex items-start">
              <motion.div 
                className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-lg shadow-lg mr-4"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <h1 className="text-xl font-bold text-white">MBE</h1>
              </motion.div>
              <div className="pt-1">
                <h1 className="text-3xl font-bold text-white">Madbox Engine</h1>
                <div className="flex space-x-2 mt-2">
                  <span className="px-2 py-1 rounded bg-blue-600/30 text-white text-sm font-medium border border-blue-500/30">
                    {gameMode.charAt(0).toUpperCase() + gameMode.slice(1)}
                  </span>
                  <span className="px-2 py-1 rounded bg-purple-600/30 text-white text-sm font-medium border border-purple-500/30">
                    {gameType.charAt(0).toUpperCase() + gameType.slice(1)}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Map info */}
          <div className="relative z-10 flex-1 flex items-center justify-center">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ 
                opacity: isExiting ? 0 : 1, 
                y: isExiting ? 40 : 0,
                transition: { 
                  duration: 0.8,
                  delay: isExiting ? 0 : 0.6,
                  ease: "easeOut" 
                }
              }}
              className="text-center"
            >
              <h2 className="text-5xl font-bold text-white mb-6">{mapTitle}</h2>
              <motion.div 
                className="bg-black/30 backdrop-blur-sm px-6 py-4 rounded-lg max-w-xl mx-auto border border-white/10"
                initial={{ opacity: 0, y: 10 }}
                animate={{ 
                  opacity: isExiting ? 0 : 1, 
                  y: isExiting ? 20 : 0,
                  transition: { 
                    duration: 0.5,
                    delay: isExiting ? 0 : 0.9
                  }
                }}
              >
                <p className="text-white/70 text-lg">
                  <span className="text-blue-400 font-medium">TIP:</span> {currentTip}
                </p>
              </motion.div>
            </motion.div>
          </div>

          {/* Loading bar and status */}
          <motion.div 
            className="relative z-10 p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ 
              opacity: isExiting ? 0 : 1, 
              y: isExiting ? 30 : 0,
              transition: { 
                duration: 0.8,
                delay: isExiting ? 0 : 0.5,
                ease: "easeOut" 
              }
            }}
          >
            <div className="flex items-end justify-between">
              <div></div> {/* Spacer to push content to the right */}
              <div className="w-[500px] max-w-full">
                <div className="flex justify-between mb-2">
                  <span className="text-white/70 text-sm">{currentMessage}</span>
                  <span className="text-white font-medium">{Math.floor(progress)}%</span>
                </div>
                <div className="h-2 bg-black/50 rounded-full overflow-hidden backdrop-blur-sm border border-white/5">
                  <motion.div 
                    className="h-full bg-gradient-to-r from-blue-600 to-purple-600 relative"
                    style={{ width: `${progress}%` }}
                    initial={{ width: "0%" }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* Shimmer effect */}
                    <motion.div 
                      className="absolute inset-0 w-20 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                      animate={{ 
                        x: ['-100%', '400%'],
                      }}
                      transition={{ 
                        repeat: Infinity, 
                        duration: 1.5, 
                        ease: "linear",
                      }}
                    />
                  </motion.div>
                </div>
                <div className="mt-2 text-white/50 text-xs flex items-center justify-between">
                  <span className="text-white/30">{currentStage === 'MAP_GEOMETRY' ? 'Loading map...' : 'Map loaded'}</span>
                  <span className="text-white/30">Press ESC to cancel</span>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 