'use client';

import { useState, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { motion } from 'framer-motion';
import * as THREE from 'three';
import { GameEngineProps } from './types/game-types';
import { GameScene } from './game-scene';
import { ToolUI } from './ui/tool-ui';
import { DebugPanel } from './ui/debug-panel';
import { useAppState } from './app-state';

export function GameEngine({ mapId, gameMode, gameType, onExit }: GameEngineProps) {
  // State
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [showDebugInfo, setShowDebugInfo] = useState(true);
  const [fps, setFps] = useState(0);
  const [showHelpOverlay, setShowHelpOverlay] = useState(false);
  
  // Global app state
  const { isGameRunning } = useAppState();
  
  // Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());
  
  // State for model adjustments
  const [modelAdjustments, setModelAdjustments] = useState({
    scale: 1,
    heightOffset: 0,
    positionX: 0,
    positionZ: 0
  });
  
  // Initialize the game with a fade-in animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialized(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Setup key handlers
  useEffect(() => {
    // Lock pointer for FPS controls
    const canvas = document.querySelector('canvas');
    if (canvas) {
      canvas.onclick = () => {
        canvas.requestPointerLock();
      };
    }
    
    // Handle key presses
    const handleKeyDown = (e: KeyboardEvent) => {
      // Exit game on Escape when not in menu
      if (e.key === 'Escape') {
        if (document.pointerLockElement) {
          document.exitPointerLock();
        } else {
          onExit();
        }
      }
      
      // Toggle fullscreen on F11
      if (e.key === 'F11') {
        e.preventDefault();
        toggleFullScreen();
      }
      
      // Toggle debug info on F3
      if (e.key === 'F3') {
        setShowDebugInfo(prev => !prev);
      }

      // Show help overlay on F1
      if (e.key === 'F1') {
        setShowHelpOverlay(prev => !prev);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onExit]);
  
  // Calculate FPS
  useEffect(() => {
    let animationFrameId: number;
    
    const calculateFps = () => {
      frameCountRef.current += 1;
      const now = performance.now();
      const elapsed = now - lastTimeRef.current;
      
      if (elapsed >= 1000) {
        setFps(Math.round((frameCountRef.current * 1000) / elapsed));
        frameCountRef.current = 0;
        lastTimeRef.current = now;
      }
      
      animationFrameId = requestAnimationFrame(calculateFps);
    };
    
    animationFrameId = requestAnimationFrame(calculateFps);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);
  
  // Toggle fullscreen function
  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.log(`Error attempting to enable fullscreen: ${err.message}`);
      });
      setIsFullScreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullScreen(false);
      }
    }
  };
  
  // Apply model adjustments
  const handleApplyAdjustments = (adjustments: Partial<typeof modelAdjustments>) => {
    setModelAdjustments(prev => ({
      ...prev,
      ...adjustments
    }));
    
    // Here we could post a message to the Canvas if needed
    window.postMessage({
      type: 'model-adjustments',
      adjustments
    }, '*');
  };
  
  // Load saved model adjustments from localStorage on mount
  useEffect(() => {
    try {
      const savedAdjustments = localStorage.getItem(`model-adjustments-${mapId}`);
      if (savedAdjustments) {
        const parsed = JSON.parse(savedAdjustments);
        setModelAdjustments(parsed);
        
        // Share adjustments with the 3D scene by posting a message
        window.postMessage({
          type: 'model-adjustments',
          adjustments: parsed
        }, '*');
      }
    } catch (e) {
      console.error('Could not load model adjustments from localStorage', e);
    }
  }, [mapId]);
  
  // Listen for position updates from the 3D scene
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'position-update') {
        // Position data from the 3D scene can be used here if needed
        // console.log('Position update received:', event.data);
      }
    };
    
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);
  
  // Add cursor styles for pointer lock
  useEffect(() => {
    // Add CSS for cursor styles
    const style = document.createElement('style');
    style.innerHTML = `
      canvas:hover {
        cursor: pointer;
      }
      
      .pointerlock {
        cursor: none !important;
      }
    `;
    document.head.appendChild(style);
    
    // Add event listeners for pointer lock changes
    const handlePointerLockChange = () => {
      const canvas = document.querySelector('canvas');
      if (document.pointerLockElement === canvas) {
        canvas?.classList.add('pointerlock');
      } else {
        canvas?.classList.remove('pointerlock');
      }
    };
    
    document.addEventListener('pointerlockchange', handlePointerLockChange);
    
    return () => {
      document.removeEventListener('pointerlockchange', handlePointerLockChange);
      document.head.removeChild(style);
    };
  }, []);
  
  return (
    <div 
      className={`fixed inset-0 z-[1000] transition-opacity duration-700 ${
        isInitialized ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <Canvas
        ref={canvasRef}
        shadows
        camera={{ fov: 75, near: 0.1, far: 1000, position: [0, 2, 5] }}
        className="w-full h-full"
        gl={{ 
          antialias: true, 
          alpha: false, 
          stencil: false,
          depth: true,
          powerPreference: 'high-performance',
          precision: 'highp',
          pixelRatio: Math.min(2, window.devicePixelRatio)
        }}
        performance={{ min: 0.5 }}
        dpr={[1, 2]} // Limit pixel ratio to improve performance
        onCreated={({ gl, scene }) => {
          // WebGL renderer configurations
          gl.setClearColor('#87CEEB'); // Sky blue background
          
          // Set up for better shadows
          gl.shadowMap.enabled = true;
          gl.shadowMap.type = THREE.PCFSoftShadowMap;
          
          // Optimization hints
          gl.info.autoReset = false; // Manual memory stats reset
          console.log('Canvas created with renderer:', gl);
          
          // Log scene details
          console.log('Initial scene polygon count:', gl.info.render.triangles);
        }}
      >
        <GameScene 
          mapId={mapId}
          gameMode={gameMode}
          debug={showDebugInfo} 
        />
      </Canvas>
      
      {/* HUD Elements */}
      <div className="absolute bottom-4 right-4 bg-black/30 backdrop-blur-sm text-white px-3 py-1 rounded text-sm flex items-center space-x-2">
        <span>{gameMode}</span>
        <span className="w-1 h-1 rounded-full bg-white/50"></span>
        <span>{mapId}</span>
        {showDebugInfo && (
          <>
            <span className="w-1 h-1 rounded-full bg-white/50"></span>
            <span>{fps} FPS</span>
          </>
        )}
      </div>
      
      {/* Crosshair */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
        <div className="w-1 h-1 bg-white rounded-full opacity-50" />
      </div>
      
      {/* Tool UI */}
      <ToolUI />
      
      {/* Debug Panel */}
      <DebugPanel 
        visible={showDebugInfo}
        mapId={mapId}
        onApplyAdjustments={handleApplyAdjustments}
      />
      
      {/* Help overlay */}
      {showHelpOverlay && (
        <motion.div 
          className="absolute inset-0 bg-black/80 text-white flex flex-col items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="bg-black/60 backdrop-blur-sm p-6 rounded-lg max-w-lg border border-white/10">
            <h2 className="text-2xl font-bold mb-4">Controls</h2>
            <div className="grid grid-cols-2 gap-2 mb-4">
              <div className="text-sm">WASD</div>
              <div className="text-sm text-gray-400">Movement</div>
              
              <div className="text-sm">Space</div>
              <div className="text-sm text-gray-400">Jump</div>
              
              <div className="text-sm">Shift</div>
              <div className="text-sm text-gray-400">Sprint</div>
              
              <div className="text-sm">Ctrl</div>
              <div className="text-sm text-gray-400">Crouch</div>
              
              <div className="text-sm">E</div>
              <div className="text-sm text-gray-400">Use/Interact</div>
              
              <div className="text-sm">Q</div>
              <div className="text-sm text-gray-400">Open Tool Menu</div>
              
              <div className="text-sm">F1</div>
              <div className="text-sm text-gray-400">Toggle Help</div>
              
              <div className="text-sm">F3</div>
              <div className="text-sm text-gray-400">Toggle Debug Info</div>
              
              <div className="text-sm">F11</div>
              <div className="text-sm text-gray-400">Toggle Fullscreen</div>
              
              <div className="text-sm">Esc</div>
              <div className="text-sm text-gray-400">Exit Game</div>
            </div>
            <p className="text-center text-sm text-gray-400">Press F1 to close this overlay</p>
          </div>
        </motion.div>
      )}
    </div>
  );
} 