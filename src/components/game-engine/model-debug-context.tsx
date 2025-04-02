'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Vector3 } from 'three';

// Types for model adjustments
export interface ModelAdjustments {
  scale: number;
  heightOffset: number;
  positionX: number;
  positionZ: number;
}

// Types for position data
export interface PositionData {
  player: Vector3 | null;
  camera: Vector3 | null;
}

// Context interface
interface ModelDebugContextType {
  modelAdjustments: ModelAdjustments;
  positionData: PositionData;
  updateModelAdjustments: (newAdjustments: Partial<ModelAdjustments>) => void;
  updatePositionData: (newPositionData: Partial<PositionData>) => void;
}

// Create context with default values
const ModelDebugContext = createContext<ModelDebugContextType>({
  modelAdjustments: {
    scale: 1,
    heightOffset: 0,
    positionX: 0,
    positionZ: 0
  },
  positionData: {
    player: null,
    camera: null
  },
  updateModelAdjustments: () => {},
  updatePositionData: () => {}
});

// Context provider component
export function ModelDebugProvider({
  children,
  mapId
}: {
  children: React.ReactNode;
  mapId: string;
}) {
  // State for model adjustments
  const [modelAdjustments, setModelAdjustments] = useState<ModelAdjustments>({
    scale: 1,
    heightOffset: 0,
    positionX: 0,
    positionZ: 0
  });
  
  // State for position data
  const [positionData, setPositionData] = useState<PositionData>({
    player: null,
    camera: null
  });
  
  // Load saved adjustments from localStorage on mount
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
  
  // Update model adjustments
  const updateModelAdjustments = (newAdjustments: Partial<ModelAdjustments>) => {
    const updatedAdjustments = {
      ...modelAdjustments,
      ...newAdjustments
    };
    
    setModelAdjustments(updatedAdjustments);
    
    // Save to localStorage
    try {
      localStorage.setItem(`model-adjustments-${mapId}`, JSON.stringify(updatedAdjustments));
    } catch (e) {
      console.error('Could not save model adjustments to localStorage', e);
    }
  };
  
  // Update position data
  const updatePositionData = (newPositionData: Partial<PositionData>) => {
    setPositionData(prev => ({
      ...prev,
      ...newPositionData
    }));
  };
  
  // Create context value
  const contextValue: ModelDebugContextType = {
    modelAdjustments,
    positionData,
    updateModelAdjustments,
    updatePositionData
  };
  
  return (
    <ModelDebugContext.Provider value={contextValue}>
      {children}
    </ModelDebugContext.Provider>
  );
}

// Custom hook for using the context
export function useModelDebug() {
  return useContext(ModelDebugContext);
} 