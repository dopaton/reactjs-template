import { useEffect } from 'react';
import { Navigate, Route, Routes, HashRouter } from 'react-router-dom';
import { useLaunchParams, useSignal, miniApp, initData } from '@tma.js/sdk-react';
import { AppRoot } from '@telegram-apps/telegram-ui';

import { routes } from '@/navigation/routes.tsx';
import { useGameStore } from '@/game/store';
import { useGameTicks } from '@/game/useGameTicks';
import { GameNav } from '@/components/GameNav/GameNav';
import type { TelegramUser } from '@/game/types';

function GameTicksRunner() {
  useGameTicks();
  return null;
}

export function App() {
  const lp = useLaunchParams();
  const isDark = useSignal(miniApp.isDark);
  const initGame = useGameStore(s => s.init);

  // Extract user from initData
  const tgUser = useSignal(initData.user);
  const startParam = useSignal(initData.startParam);

  // Initialize Zustand store with Telegram user
  useEffect(() => {
    if (!tgUser) return;
    const user: TelegramUser = {
      id: tgUser.id,
      first_name: tgUser.first_name,
      last_name: tgUser.last_name,
      username: tgUser.username,
      photo_url: tgUser.photo_url,
      is_premium: tgUser.is_premium,
      language_code: tgUser.language_code,
    };
    initGame(user, startParam);
  }, [tgUser, startParam, initGame]);

  return (
    <AppRoot
      appearance={isDark ? 'dark' : 'light'}
      platform={['macos', 'ios'].includes(lp.tgWebAppPlatform) ? 'ios' : 'base'}
    >
      <GameTicksRunner />
      <HashRouter>
        <Routes>
          {routes.map((route) => <Route key={route.path} {...route} />)}
          <Route path="*" element={<Navigate to="/"/>}/>
        </Routes>
        <GameNav />
      </HashRouter>
    </AppRoot>
  );
}
