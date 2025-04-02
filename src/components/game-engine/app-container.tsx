'use client';

import { useState, ReactNode, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { LoadingScreen } from '../loading-screen/loading-screen';
import { GameEngine } from './game-engine';
import { useAppState } from './app-state';

interface AppContainerProps {
  mainMenu: ReactNode;
  defaultMapId?: string;
  defaultMapTitle?: string;
  defaultGameMode?: string;
  defaultGameType?: string;
}

// Define the expected props for the main menu component
interface MainMenuProps {
  onLaunchGame?: (mapId: string, mapTitle: string, gameMode: string, gameType: string) => void;
}

type AppState = 'menu' | 'loading' | 'loading-complete' | 'game';

export function AppContainer({ 
  mainMenu, 
  defaultMapId, 
  defaultMapTitle, 
  defaultGameMode, 
  defaultGameType 
}: AppContainerProps) {
  // Local app state
  const [appState, setAppState] = useState<AppState>('menu');
  
  // Flag to control game rendering
  const [gameReady, setGameReady] = useState(false);
  
  // Global app state
  const { startGame, endGame, isMainMenuVisible } = useAppState();
  
  // Game settings
  const [mapId, setMapId] = useState(defaultMapId || '');
  const [mapTitle, setMapTitle] = useState(defaultMapTitle || '');
  const [gameMode, setGameMode] = useState(defaultGameMode || 'sandbox');
  const [gameType, setGameType] = useState(defaultGameType || 'singleplayer');

  // Launch game function
  const launchGame = (id: string, title: string, mode: string, type: string) => {
    // Set game settings
    setMapId(id);
    setMapTitle(title);
    setGameMode(mode);
    setGameType(type);
    
    // Start loading
    setAppState('loading');
  };

  // Handle loading completion - this now transitions to a special state
  const handleLoadingComplete = () => {
    console.log("Loading complete, preparing to transition to game");
    // First, make sure game canvas is rendered below the loading screen
    setGameReady(true);
    
    // Then, after a short delay to ensure the game is rendered, set to loading-complete state
    setTimeout(() => {
      setAppState('loading-complete');
      
      // Finally, after the exit animation completes, transition to game state
      setTimeout(() => {
        setAppState('game');
        startGame(mapId, mapTitle, gameMode); // Update global state with required params
      }, 800); // This should match the exit animation duration of the loading screen
    }, 100);
  };

  // Handle game exit
  const handleGameExit = () => {
    setAppState('menu');
    setGameReady(false);
    endGame(); // Update global state
  };

  // Render main menu with launch function
  const renderMainMenu = () => {
    // If it's a valid React element, pass the prop
    if (mainMenu && typeof mainMenu === 'object' && 'type' in mainMenu) {
      return {
        ...mainMenu,
        props: {
          ...(mainMenu as any).props,
          onLaunchGame: launchGame
        }
      };
    }
    
    // Otherwise just render it as is
    return mainMenu;
  };

  return (
    <>
      {/* Main menu with AnimatePresence for transition */}
      <AnimatePresence mode="wait">
        {appState === 'menu' && (
          <motion.div 
            className="main-menu-container"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.3 } }}
          >
            {renderMainMenu()}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading screen with AnimatePresence */}
      <AnimatePresence mode="wait">
        {(appState === 'loading' || appState === 'loading-complete') && (
          <LoadingScreen 
            mapId={mapId}
            mapTitle={mapTitle}
            gameMode={gameMode}
            gameType={gameType}
            isExiting={appState === 'loading-complete'}
            onLoadComplete={handleLoadingComplete}
            onCancel={handleGameExit}
          />
        )}
      </AnimatePresence>

      {/* Game engine - rendered below loading screen when loading is complete */}
      {(gameReady || appState === 'game') && (
        <div className={`absolute inset-0 z-[900] transition-opacity duration-500 ${appState !== 'game' ? 'opacity-80' : 'opacity-100'}`}>
          <GameEngine 
            mapId={mapId}
            gameMode={gameMode}
            gameType={gameType}
            onExit={handleGameExit}
          />
        </div>
      )}
    </>
  );
} 