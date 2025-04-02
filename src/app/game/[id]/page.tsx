import { GamePageClient } from './client';

// Server component - receives params and searchParams from Next.js
export default function GamePage({ 
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const mapId = params.id;
  const gameMode = searchParams.gameMode || 'sandbox';
  const gameType = searchParams.gameType || 'singleplayer';
  const mapTitle = searchParams.title || 'Untitled Map';

  // Pass the data to the client component
  return (
    <GamePageClient 
      mapId={mapId}
      mapTitle={mapTitle as string}
      gameMode={gameMode as string}
      gameType={gameType as string}
    />
  );
} 