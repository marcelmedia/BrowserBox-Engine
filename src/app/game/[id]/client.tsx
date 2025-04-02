'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { GameLauncher } from '@/components/game-engine';

// Props for the client component
interface GamePageClientProps {
  mapId: string;
  mapTitle: string;
  gameMode: string;
  gameType: string;
}

// Client component for game rendering and interaction
export function GamePageClient({
  mapId,
  mapTitle,
  gameMode,
  gameType
}: GamePageClientProps) {
  const router = useRouter();
  const [showGame, setShowGame] = useState(true);

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