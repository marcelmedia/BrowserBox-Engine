'use client';

import { useState } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { GameLauncher } from '@/components/game-engine';

export default function GamePage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const [showGame, setShowGame] = useState(true);
  
  // Extract values from params and searchParams hooks
  const mapId = params.id as string;
  const gameMode = searchParams.get('gameMode') || 'sandbox';
  const gameType = searchParams.get('gameType') || 'singleplayer';
  const mapTitle = searchParams.get('title') || 'Untitled Map';

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