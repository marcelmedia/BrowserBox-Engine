'use client';

import { create } from 'zustand';

interface AppState {
  // UI State
  isMainMenuVisible: boolean;
  isLoadingScreenVisible: boolean;
  isGameRunning: boolean;
  
  // Game State
  currentMapId: string | null;
  currentGameMode: string | null;
  currentGameType: string | null;
  
  // Actions
  showMainMenu: () => void;
  hideMainMenu: () => void;
  showLoadingScreen: () => void;
  hideLoadingScreen: () => void;
  startGame: (mapId: string, gameMode: string, gameType: string) => void;
  endGame: () => void;
}

export const useAppState = create<AppState>((set) => ({
  // Initial UI State
  isMainMenuVisible: true,
  isLoadingScreenVisible: false,
  isGameRunning: false,
  
  // Initial Game State
  currentMapId: null,
  currentGameMode: null,
  currentGameType: null,
  
  // Actions
  showMainMenu: () => set({ isMainMenuVisible: true }),
  hideMainMenu: () => set({ isMainMenuVisible: false }),
  showLoadingScreen: () => set({ isLoadingScreenVisible: true }),
  hideLoadingScreen: () => set({ isLoadingScreenVisible: false }),
  
  startGame: (mapId, gameMode, gameType) => set({
    isGameRunning: true,
    currentMapId: mapId,
    currentGameMode: gameMode,
    currentGameType: gameType,
  }),
  
  endGame: () => set({
    isGameRunning: false,
    currentMapId: null,
    currentGameMode: null,
    currentGameType: null,
    isMainMenuVisible: true,
  }),
})); 