'use client';

import { AppContainer } from '@/components/game-engine';
import { MainMenu } from '@/components/main-menu/main-menu';

export default function Home() {
  return (
    <main className="min-h-screen">
      <AppContainer 
        mainMenu={<MainMenu />}
      />
    </main>
  );
}
