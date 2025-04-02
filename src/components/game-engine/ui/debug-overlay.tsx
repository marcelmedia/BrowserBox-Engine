'use client';

import { useState, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { Vector3 } from 'three';
import { Html } from '@react-three/drei';

interface DebugOverlayProps {
  visible: boolean;
  mapId: string;
}

interface ModelAdjustments {
  scale: number;
  heightOffset: number;
  positionX: number;
  positionZ: number;
}

export function DebugOverlay({ visible, mapId }: DebugOverlayProps) {
  const [playerPosition, setPlayerPosition] = useState<Vector3>(new Vector3());
  const [cameraPosition, setCameraPosition] = useState<Vector3>(new Vector3());
  const [modelAdjustments, setModelAdjustments] = useState<ModelAdjustments>({
    scale: 1,
    heightOffset: 0,
    positionX: 0,
    positionZ: 0
  });
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  // Get Three.js scene information
  const { scene, camera } = useThree();
  
  // Update position values each frame
  useFrame(() => {
    // Find player object in scene
    const player = scene.getObjectByName('player');
    if (player) {
      setPlayerPosition(player.position.clone());
    }
    
    // Get camera position
    if (camera) {
      setCameraPosition(camera.position.clone());
    }
  });
  
  // Apply model adjustments when they change
  useEffect(() => {
    const model = scene.getObjectByName('map-model');
    if (model) {
      model.scale.setScalar(modelAdjustments.scale);
      model.position.y = modelAdjustments.heightOffset;
      model.position.x = modelAdjustments.positionX;
      model.position.z = modelAdjustments.positionZ;
    }
  }, [modelAdjustments, scene]);
  
  // Store adjustments in localStorage
  useEffect(() => {
    try {
      localStorage.setItem(`model-adjustments-${mapId}`, JSON.stringify(modelAdjustments));
    } catch (e) {
      console.error('Could not save model adjustments to localStorage', e);
    }
  }, [modelAdjustments, mapId]);
  
  // Load adjustments from localStorage on mount
  useEffect(() => {
    try {
      const savedAdjustments = localStorage.getItem(`model-adjustments-${mapId}`);
      if (savedAdjustments) {
        setModelAdjustments(JSON.parse(savedAdjustments));
      }
    } catch (e) {
      console.error('Could not load model adjustments from localStorage', e);
    }
  }, [mapId]);
  
  // Reset adjustments to default
  const resetAdjustments = () => {
    setModelAdjustments({
      scale: 1,
      heightOffset: 0,
      positionX: 0,
      positionZ: 0
    });
  };
  
  // Apply adjustments to model
  const applyChanges = (newValues: Partial<ModelAdjustments>) => {
    setModelAdjustments(prev => ({
      ...prev,
      ...newValues
    }));
  };
  
  if (!visible) return null;
  
  // Create a position value to push the debug panel away from the scene
  // so it won't intersect with 3D objects
  const panelPosition: [number, number, number] = [0, 0, -10];
  
  return (
    <group position={[0, 0, 0]}>
      <Html
        position={panelPosition}
        distanceFactor={10}
        zIndexRange={[100, 0]}
        transform
        sprite
      >
        <div className="debug-panel max-w-xs" style={{ pointerEvents: 'auto' }}>
          <div className="pointer-events-auto">
            {/* Publish current position data for external debug panel to consume */}
            {(() => {
              // Post message to window for external debugging
              window.postMessage({
                type: 'position-update',
                player: {
                  x: playerPosition.x,
                  y: playerPosition.y,
                  z: playerPosition.z
                },
                camera: {
                  x: cameraPosition.x,
                  y: cameraPosition.y,
                  z: cameraPosition.z
                }
              }, '*');
              return null;
            })()}
          </div>
        </div>
      </Html>
    </group>
  );
} 