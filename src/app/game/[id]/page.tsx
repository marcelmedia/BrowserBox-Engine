'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { GameLauncher } from '@/components/game-engine';

interface GamePageProps {
  params: {
    id: string;
  };
  searchParams: {
    gameMode?: string;
    gameType?: string;
    title?: string;
  };
}

export default function GamePage({ params, searchParams }: GamePageProps) {
  const router = useRouter();
  const [showGame, setShowGame] = useState(true);
  
  const mapId = params.id;
  const gameMode = searchParams.gameMode || 'sandbox';
  const gameType = searchParams.gameType || 'singleplayer';
  const mapTitle = searchParams.title || 'Untitled Map';

  const handleGameExit = () => {
    setShowGame(false);
    router.push('/'); // Navigate back to home page
  };

  if (!showGame) {
    return null; // No need to render anything when exiting
  }

  return (
    <main className="fixed inset-0">
      <GameLauncher
        mapId={mapId}
        mapTitle={mapTitle}
        gameMode={gameMode}
        gameType={gameType}
        onExit={handleGameExit}
      />
    </main>
  );
} 