'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { GameLauncher } from '@/components/game-engine';

export default function GamePage({ 
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const router = useRouter();
  const [showGame, setShowGame] = useState(true);
  
  const mapId = params.id;
  const gameMode = (searchParams.gameMode as string) || 'sandbox';
  const gameType = (searchParams.gameType as string) || 'singleplayer';
  const mapTitle = (searchParams.title as string) || 'Untitled Map';

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