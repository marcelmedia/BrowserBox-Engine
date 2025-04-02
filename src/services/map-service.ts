'use client';

import { useState, useEffect } from 'react';

// Types for map data
export interface PlayerSettings {
  walkSpeed: number;
  sprintSpeed: number;
  crouchSpeed: number;
  jumpForce: number;
  headbobIntensity: number;
  headbobSpeed: number;
}

export interface ModelAdjustments {
  scale: number;
  heightOffset: number;
  positionX: number;
  positionZ: number;
}

export interface MapData {
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
  playerSettings?: PlayerSettings;
  modelAdjustments?: ModelAdjustments;
}

// Default settings if not specified in map JSON
export const DEFAULT_PLAYER_SETTINGS: PlayerSettings = {
  walkSpeed: 5,
  sprintSpeed: 10,
  crouchSpeed: 2,
  jumpForce: 10,
  headbobIntensity: 0.15,
  headbobSpeed: 8
};

export const DEFAULT_MODEL_ADJUSTMENTS: ModelAdjustments = {
  scale: 1.0,
  heightOffset: 0,
  positionX: 0,
  positionZ: 0
};

// Cache the map data to avoid redundant API calls
const mapCache = new Map<string, MapData>();

/**
 * Fetches map data for a specific map ID
 */
export async function fetchMapData(mapId: string): Promise<MapData | null> {
  // Check cache first
  if (mapCache.has(mapId)) {
    return mapCache.get(mapId)!;
  }
  
  try {
    // Fetch all maps and find the one we need
    const response = await fetch('/api/maps');
    if (!response.ok) {
      throw new Error(`Failed to fetch maps: ${response.status}`);
    }
    
    const maps: MapData[] = await response.json();
    const mapData = maps.find(map => map.id === mapId);
    
    if (!mapData) {
      throw new Error(`Map not found: ${mapId}`);
    }
    
    // Ensure player settings and model adjustments exist
    if (!mapData.playerSettings) {
      mapData.playerSettings = { ...DEFAULT_PLAYER_SETTINGS };
    }
    
    if (!mapData.modelAdjustments) {
      mapData.modelAdjustments = { ...DEFAULT_MODEL_ADJUSTMENTS };
    }
    
    // Cache the map data
    mapCache.set(mapId, mapData);
    
    return mapData;
  } catch (error) {
    console.error('Error fetching map data:', error);
    return null;
  }
}

/**
 * React hook to load map data
 */
export function useMapData(mapId: string) {
  const [mapData, setMapData] = useState<MapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const loadMapData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchMapData(mapId);
        setMapData(data);
      } catch (err) {
        console.error('Error in useMapData:', err);
        setError(err instanceof Error ? err.message : 'Unknown error loading map data');
      } finally {
        setLoading(false);
      }
    };
    
    loadMapData();
  }, [mapId]);
  
  return { mapData, loading, error };
}

/**
 * Applies player settings from map data
 */
export function applyPlayerSettings(settings: PlayerSettings) {
  window.postMessage({
    type: 'player-settings-update',
    settings
  }, '*');
}

/**
 * Applies model adjustments from map data
 */
export function applyModelAdjustments(adjustments: ModelAdjustments) {
  window.postMessage({
    type: 'model-adjustments',
    adjustments
  }, '*');
} 