import type { ComponentType } from 'react';

import { GamePage } from '@/pages/GamePage/GamePage';
import { ShopPage } from '@/pages/ShopPage/ShopPage';
import { TasksPage } from '@/pages/TasksPage/TasksPage';
import { FriendsPage } from '@/pages/FriendsPage/FriendsPage';
import { WalletPage } from '@/pages/WalletPage/WalletPage';

interface Route {
  path: string;
  Component: ComponentType;
  title?: string;
}

export const routes: Route[] = [
  { path: '/', Component: GamePage, title: 'Game' },
  { path: '/shop', Component: ShopPage, title: 'Shop' },
  { path: '/tasks', Component: TasksPage, title: 'Tasks' },
  { path: '/friends', Component: FriendsPage, title: 'Friends' },
  { path: '/wallet', Component: WalletPage, title: 'Wallet' },
];
