'use client';

import { useState, useEffect } from 'react';
import { ModelAdjustments, PlayerSettings, useMapData } from '../../../services/map-service';

interface DebugPanelProps {
  visible: boolean;
  mapId: string;
  onApplyAdjustments: (adjustments: Partial<ModelAdjustments>) => void;
}

export function DebugPanel({ visible, mapId, onApplyAdjustments }: DebugPanelProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [playerPosition, setPlayerPosition] = useState({ x: 0, y: 0, z: 0 });
  const [cameraPosition, setCameraPosition] = useState({ x: 0, y: 0, z: 0 });
  const [modelAdjustments, setModelAdjustments] = useState<ModelAdjustments>({
    scale: 1,
    heightOffset: 0,
    positionX: 0,
    positionZ: 0
  });
  
  // Load map data to display in debug panel
  const { mapData, loading, error } = useMapData(mapId);
  
  // Initialize adjustments from map data when available
  useEffect(() => {
    if (mapData?.modelAdjustments) {
      setModelAdjustments(mapData.modelAdjustments);
    }
  }, [mapData]);
  
  // Listen for messages from the Canvas with position updates
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'position-update') {
        if (event.data.player) setPlayerPosition(event.data.player);
        if (event.data.camera) setCameraPosition(event.data.camera);
      }
    };
    
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);
  
  // Apply model adjustments and update local storage
  const applyChanges = (newValues: Partial<ModelAdjustments>) => {
    const updatedAdjustments = {
      ...modelAdjustments,
      ...newValues
    };
    
    setModelAdjustments(updatedAdjustments);
    onApplyAdjustments(newValues);
    
    // Store in localStorage
    try {
      localStorage.setItem(`model-adjustments-${mapId}`, JSON.stringify(updatedAdjustments));
    } catch (e) {
      console.error('Could not save model adjustments to localStorage', e);
    }
  };
  
  // Reset adjustments to default or to map-defined values
  const resetAdjustments = () => {
    // Use map-defined values if available, otherwise use defaults
    const defaultAdjustments = mapData?.modelAdjustments || {
      scale: 1,
      heightOffset: 0,
      positionX: 0,
      positionZ: 0
    };
    
    setModelAdjustments(defaultAdjustments);
    onApplyAdjustments(defaultAdjustments);
    
    try {
      localStorage.setItem(`model-adjustments-${mapId}`, JSON.stringify(defaultAdjustments));
    } catch (e) {
      console.error('Could not save model adjustments to localStorage', e);
    }
  };
  
  if (!visible) return null;
  
  return (
    <div className="fixed top-4 left-4 z-[1100] bg-black/70 backdrop-blur-md text-white p-3 rounded-lg border border-white/20 w-80 text-sm font-mono">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold">Debug Panel</h3>
        <button 
          onClick={() => setIsCollapsed(prev => !prev)}
          className="text-white/70 hover:text-white"
        >
          {isCollapsed ? '▼' : '▲'}
        </button>
      </div>
      
      {!isCollapsed && (
        <>
          <div className="mb-4">
            <h4 className="text-green-400 mb-1">Player Position</h4>
            <div className="grid grid-cols-3 gap-1">
              <div>X: {playerPosition.x.toFixed(2)}</div>
              <div>Y: {playerPosition.y.toFixed(2)}</div>
              <div>Z: {playerPosition.z.toFixed(2)}</div>
            </div>
            
            <h4 className="text-blue-400 mt-3 mb-1">Camera Position</h4>
            <div className="grid grid-cols-3 gap-1">
              <div>X: {cameraPosition.x.toFixed(2)}</div>
              <div>Y: {cameraPosition.y.toFixed(2)}</div>
              <div>Z: {cameraPosition.z.toFixed(2)}</div>
            </div>
          </div>
          
          <div className="mb-3">
            <h4 className="text-purple-400 mb-2">Model Adjustments for {mapId}</h4>
            
            <div className="grid grid-cols-2 gap-x-2 gap-y-3">
              <div>
                <label className="block text-xs text-white/70 mb-1">Scale</label>
                <input 
                  type="number" 
                  value={modelAdjustments.scale}
                  onChange={(e) => applyChanges({ scale: parseFloat(e.target.value) || 0 })}
                  step="0.1"
                  min="0.1"
                  max="10"
                  className="w-full px-2 py-1 bg-black/50 border border-white/30 rounded text-white"
                />
              </div>
              
              <div>
                <label className="block text-xs text-white/70 mb-1">Height Offset</label>
                <input 
                  type="number" 
                  value={modelAdjustments.heightOffset}
                  onChange={(e) => applyChanges({ heightOffset: parseFloat(e.target.value) || 0 })}
                  step="1"
                  className="w-full px-2 py-1 bg-black/50 border border-white/30 rounded text-white"
                />
              </div>
              
              <div>
                <label className="block text-xs text-white/70 mb-1">Position X</label>
                <input 
                  type="number" 
                  value={modelAdjustments.positionX}
                  onChange={(e) => applyChanges({ positionX: parseFloat(e.target.value) || 0 })}
                  step="1"
                  className="w-full px-2 py-1 bg-black/50 border border-white/30 rounded text-white"
                />
              </div>
              
              <div>
                <label className="block text-xs text-white/70 mb-1">Position Z</label>
                <input 
                  type="number" 
                  value={modelAdjustments.positionZ}
                  onChange={(e) => applyChanges({ positionZ: parseFloat(e.target.value) || 0 })}
                  step="1"
                  className="w-full px-2 py-1 bg-black/50 border border-white/30 rounded text-white"
                />
              </div>
            </div>
          </div>
          
          {/* Display Map Player Settings */}
          {mapData?.playerSettings && (
            <div className="mb-3 pt-3 border-t border-white/20">
              <h4 className="text-yellow-400 mb-2">Map Player Settings</h4>
              <div className="grid grid-cols-2 gap-1 text-xs">
                <div>Walk Speed: {mapData.playerSettings.walkSpeed}</div>
                <div>Sprint Speed: {mapData.playerSettings.sprintSpeed}</div>
                <div>Crouch Speed: {mapData.playerSettings.crouchSpeed}</div>
                <div>Jump Force: {mapData.playerSettings.jumpForce}</div>
                <div>Headbob Int: {mapData.playerSettings.headbobIntensity}</div>
                <div>Headbob Speed: {mapData.playerSettings.headbobSpeed}</div>
              </div>
            </div>
          )}
          
          <div className="flex justify-between">
            <button 
              onClick={resetAdjustments}
              className="px-3 py-1 bg-red-600/70 hover:bg-red-600 rounded text-white text-xs"
            >
              Reset
            </button>
            
            <div className="text-xs text-white/50 pt-1">
              Press F3 to toggle debug view
            </div>
          </div>
          
          <div className="mt-3 pt-3 border-t border-white/20">
            <h4 className="text-orange-400 mb-2">Scene Information</h4>
            <div className="text-xs">
              <div>Map ID: {mapId}</div>
              <div className="mt-1">Map Data: {loading ? 'Loading...' : error ? 'Error loading' : 'Loaded'}</div>
              <div>Scale: {modelAdjustments.scale}</div>
              <div>Y Position: {modelAdjustments.heightOffset}</div>
            </div>
          </div>
        </>
      )}
    </div>
  );
} 