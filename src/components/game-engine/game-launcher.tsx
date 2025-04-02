'use client';

import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { LoadingScreen } from '../loading-screen/loading-screen';
import { GameEngine } from './game-engine';

interface GameLauncherProps {
  mapId: string;
  mapTitle: string;
  gameMode: string;
  gameType: string;
  onExit: () => void;
}

export function GameLauncher({ mapId, mapTitle, gameMode, gameType, onExit }: GameLauncherProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [loadingExiting, setLoadingExiting] = useState(false);
  const [showGame, setShowGame] = useState(false);

  const handleLoadingComplete = () => {
    console.log("Loading complete, transitioning to game");
    
    // First make the game visible underneath the loading screen
    setShowGame(true);
    
    // Then wait a moment and start the exit animation of the loading screen
    setTimeout(() => {
      setLoadingExiting(true);
      
      // After the loading screen has faded out, remove it
      setTimeout(() => {
        setIsLoading(false);
      }, 800);
    }, 300);
  };

  const handleGameExit = () => {
    setShowGame(false);
    onExit();
  };

  return (
    <>
      <AnimatePresence>
        {isLoading && (
          <LoadingScreen 
            mapId={mapId}
            mapTitle={mapTitle}
            gameMode={gameMode}
            gameType={gameType}
            isExiting={loadingExiting}
            onLoadComplete={handleLoadingComplete}
            onCancel={onExit}
          />
        )}
      </AnimatePresence>

      {showGame && (
        <GameEngine 
          mapId={mapId}
          gameMode={gameMode}
          gameType={gameType}
          onExit={handleGameExit}
        />
      )}
    </>
  );
} 