'use client';

import { useState, useEffect } from 'react';
import { usePlayer } from '../entities/player-controller';

interface PlayerDebugPanelProps {
  visible: boolean;
}

interface PlayerSettings {
  walkSpeed: number;
  sprintSpeed: number;
  crouchSpeed: number;
  jumpForce: number;
  headbobIntensity: number;
  headbobSpeed: number;
}

export function PlayerDebugPanel({ visible }: PlayerDebugPanelProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [settings, setSettings] = useState<PlayerSettings>({
    walkSpeed: 5,
    sprintSpeed: 10,
    crouchSpeed: 2,
    jumpForce: 10,
    headbobIntensity: 0.15,
    headbobSpeed: 8
  });
  
  // Global event to share player settings
  useEffect(() => {
    // Send settings to anyone who's listening
    window.postMessage({
      type: 'player-settings-update',
      settings
    }, '*');
  }, [settings]);
  
  const updateSetting = (key: keyof PlayerSettings, value: number) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };
  
  if (!visible) return null;
  
  return (
    <div className="fixed top-4 right-4 z-[1100] bg-black/70 backdrop-blur-md text-white p-3 rounded-lg border border-white/20 w-72 text-sm font-mono">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold">Player Settings</h3>
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
            <h4 className="text-green-400 mb-2">Movement Speeds</h4>
            <div className="grid grid-cols-2 gap-x-2 gap-y-3">
              <div>
                <label className="block text-xs text-white/70 mb-1">Walk Speed</label>
                <input 
                  type="number" 
                  value={settings.walkSpeed}
                  onChange={(e) => updateSetting('walkSpeed', parseFloat(e.target.value) || 0)}
                  step="0.5"
                  min="0.1"
                  className="w-full px-2 py-1 bg-black/50 border border-white/30 rounded text-white"
                />
              </div>
              
              <div>
                <label className="block text-xs text-white/70 mb-1">Sprint Speed</label>
                <input 
                  type="number" 
                  value={settings.sprintSpeed}
                  onChange={(e) => updateSetting('sprintSpeed', parseFloat(e.target.value) || 0)}
                  step="0.5"
                  min="0.1"
                  className="w-full px-2 py-1 bg-black/50 border border-white/30 rounded text-white"
                />
              </div>
              
              <div>
                <label className="block text-xs text-white/70 mb-1">Crouch Speed</label>
                <input 
                  type="number" 
                  value={settings.crouchSpeed}
                  onChange={(e) => updateSetting('crouchSpeed', parseFloat(e.target.value) || 0)}
                  step="0.5"
                  min="0.1"
                  className="w-full px-2 py-1 bg-black/50 border border-white/30 rounded text-white"
                />
              </div>
              
              <div>
                <label className="block text-xs text-white/70 mb-1">Jump Force</label>
                <input 
                  type="number" 
                  value={settings.jumpForce}
                  onChange={(e) => updateSetting('jumpForce', parseFloat(e.target.value) || 0)}
                  step="0.5"
                  min="0.1"
                  className="w-full px-2 py-1 bg-black/50 border border-white/30 rounded text-white"
                />
              </div>
            </div>
          </div>
          
          <div className="mb-3">
            <h4 className="text-blue-400 mb-2">Head Bobbing</h4>
            <div className="grid grid-cols-2 gap-x-2 gap-y-3">
              <div>
                <label className="block text-xs text-white/70 mb-1">Intensity</label>
                <input 
                  type="number" 
                  value={settings.headbobIntensity}
                  onChange={(e) => updateSetting('headbobIntensity', parseFloat(e.target.value) || 0)}
                  step="0.05"
                  min="0"
                  max="1"
                  className="w-full px-2 py-1 bg-black/50 border border-white/30 rounded text-white"
                />
              </div>
              
              <div>
                <label className="block text-xs text-white/70 mb-1">Speed</label>
                <input 
                  type="number" 
                  value={settings.headbobSpeed}
                  onChange={(e) => updateSetting('headbobSpeed', parseFloat(e.target.value) || 0)}
                  step="0.5"
                  min="0"
                  className="w-full px-2 py-1 bg-black/50 border border-white/30 rounded text-white"
                />
              </div>
            </div>
          </div>
          
          <div className="mt-4 pt-3 border-t border-white/20 flex justify-between">
            <div className="text-xs text-white/60">Current: {settings.walkSpeed} / {settings.sprintSpeed} / {settings.headbobIntensity}</div>
            <button 
              onClick={() => setSettings({
                walkSpeed: 5,
                sprintSpeed: 10,
                crouchSpeed: 2,
                jumpForce: 10,
                headbobIntensity: 0.15,
                headbobSpeed: 8
              })}
              className="px-3 py-1 bg-red-600/70 hover:bg-red-600 rounded text-white text-xs"
            >
              Reset
            </button>
          </div>
        </>
      )}
    </div>
  );
} 