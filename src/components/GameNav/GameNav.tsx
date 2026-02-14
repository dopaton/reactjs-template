import { type FC } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Tabbar } from '@telegram-apps/telegram-ui';

interface NavItem {
  path: string;
  icon: string;
  label: string;
}

const navItems: NavItem[] = [
  { path: '/', icon: '🎮', label: 'Game' },
  { path: '/shop', icon: '🛒', label: 'Shop' },
  { path: '/tasks', icon: '📋', label: 'Tasks' },
  { path: '/friends', icon: '👥', label: 'Friends' },
  { path: '/wallet', icon: '💎', label: 'Wallet' },
];

export const GameNav: FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <Tabbar>
      {navItems.map((item) => (
        <Tabbar.Item
          key={item.path}
          text={item.label}
          selected={location.pathname === item.path}
          onClick={() => navigate(item.path)}
        >
          <span style={{ fontSize: 24, lineHeight: 1 }}>{item.icon}</span>
        </Tabbar.Item>
      ))}
    </Tabbar>
  );
};
