'use client';

import { Suspense, useState, useEffect } from 'react';
import { Stats } from '@react-three/drei';
import { GameSceneProps } from './types/game-types';
import { PlayerController } from './entities/player-controller';
import { PlayerCamera } from './entities/player-camera';
import { PlayerModel } from './entities/player-model';
import { MapModel } from './environment/map-model';
import { DebugOverlay } from './ui/debug-overlay';

// Loading fallback component with animation
function LoadingFallback() {
  const [rotation, setRotation] = useState(0);
  
  useEffect(() => {
    let animationId: number;
    
    const animate = () => {
      setRotation(prev => prev + 0.02);
      animationId = requestAnimationFrame(animate);
    };
    
    animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, []);
  
  return (
    <group rotation={[0, rotation, 0]}>
      <mesh position={[0, 1, 0]}>
        <octahedronGeometry args={[0.5, 1]} />
        <meshStandardMaterial color="#4080ff" wireframe />
      </mesh>
      <mesh position={[0, 1, 0]} rotation={[Math.PI/2, 0, 0]}>
        <torusGeometry args={[1, 0.1, 8, 16]} />
        <meshStandardMaterial color="yellow" emissive="#ffcc00" emissiveIntensity={0.5} />
      </mesh>
    </group>
  );
}

export function GameScene({ mapId, gameMode, debug = false }: GameSceneProps) {
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapLoadError, setMapLoadError] = useState<string | null>(null);
  
  // Debug logs
  useEffect(() => {
    console.log(`GameScene initialized with map: ${mapId}, gameMode: ${gameMode}, debug: ${debug}`);
    
    // Enable debugging for WebGL context loss
    if (debug) {
      const canvas = document.querySelector('canvas');
      if (canvas) {
        canvas.addEventListener('webglcontextlost', (e) => {
          console.error('WebGL context lost:', e);
        });
        
        canvas.addEventListener('webglcontextrestored', () => {
          console.log('WebGL context restored');
        });
      }
      
      // Add event listeners for toggle debug mode
      const handleKeyPress = (e: KeyboardEvent) => {
        if (e.key === 'F3') {
          console.log('Debug mode toggled');
        }
      };
      
      window.addEventListener('keydown', handleKeyPress);
      
      return () => {
        window.removeEventListener('keydown', handleKeyPress);
        console.log('GameScene unmounting');
      };
    }
    
    return () => {
      console.log('GameScene unmounting');
    };
  }, [mapId, gameMode, debug]);
  
  // Handle map loading completion
  const handleMapLoaded = (success: boolean) => {
    console.log(`Map ${mapId} loaded: ${success ? 'success' : 'failed'}`);
    setMapLoaded(success);
    if (!success) {
      setMapLoadError(`Failed to load map: ${mapId}`);
    }
  };
  
  // Different lighting setups based on map and game mode
  const getLightSetup = () => {
    console.log(`Setting up lights for map: ${mapId}`);
    
    switch (mapId) {
      case 'gm_flatgrass':
        return (
          <>
            <ambientLight intensity={0.6} />
            <directionalLight 
              position={[50, 50, 25]} 
              intensity={0.8} 
              castShadow 
              shadow-mapSize={[2048, 2048]}
              shadow-camera-left={-100}
              shadow-camera-right={100}
              shadow-camera-top={100}
              shadow-camera-bottom={-100}
              shadow-camera-near={0.5}
              shadow-camera-far={500}
            />
            <hemisphereLight 
              args={['#87CEEB', '#254234', 0.3]} 
              position={[0, 50, 0]} 
            />
          </>
        );
      case 'gm_construct':
        return (
          <>
            <ambientLight intensity={0.5} />
            <directionalLight 
              position={[50, 50, 25]} 
              intensity={1.0} 
              castShadow 
              shadow-mapSize={[2048, 2048]}
              shadow-camera-left={-100}
              shadow-camera-right={100}
              shadow-camera-top={100}
              shadow-camera-bottom={-100}
            />
          </>
        );
      default:
        return (
          <>
            <ambientLight intensity={0.7} />
            <hemisphereLight intensity={0.4} />
            <directionalLight 
              position={[50, 50, 25]} 
              intensity={0.6} 
              castShadow 
              shadow-mapSize={[2048, 2048]}
            />
          </>
        );
    }
  };
  
  return (
    <>
      {/* Performance Stats (only in debug mode) */}
      {debug && <Stats />}
      
      {/* Debug Overlay */}
      <DebugOverlay visible={debug} mapId={mapId} />
      
      {/* Lighting */}
      {getLightSetup()}
      
      {/* Player */}
      <PlayerController initialPosition={[0, 2, 0]}>
        <PlayerCamera headBobbing={true} />
        <PlayerModel visible={debug} wireframe={true} />
      </PlayerController>
      
      {/* Map model with Suspense for loading */}
      <Suspense fallback={<LoadingFallback />}>
        <MapModel mapId={mapId} onMapLoaded={handleMapLoaded} />
      </Suspense>
      
      {/* Map loading error display */}
      {mapLoadError && debug && (
        <group position={[0, 4, 0]}>
          <mesh>
            <boxGeometry args={[0.5, 0.5, 0.5]} />
            <meshStandardMaterial color="red" />
          </mesh>
        </group>
      )}
      
      {/* Minimal debug helpers */}
      {debug && (
        <axesHelper args={[5]} />
      )}
    </>
  );
} 