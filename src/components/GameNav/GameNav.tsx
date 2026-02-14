import { type FC } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './GameNav.css';

interface NavItem {
  path: string;
  icon: string;
  label: string;
}

const navItems: NavItem[] = [
  { path: '/', icon: '🎮', label: 'Game' },
  { path: '/shop', icon: '🛒', label: 'Shop' },
  { path: '/tasks', icon: '📋', label: 'Tasks' },
  { path: '/wallet', icon: '💎', label: 'Wallet' },
  { path: '/stats', icon: '📊', label: 'Stats' },
];

export const GameNav: FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="game-nav">
      {navItems.map((item) => (
        <button
          key={item.path}
          className={`game-nav__item ${location.pathname === item.path ? 'game-nav__item--active' : ''}`}
          onClick={() => navigate(item.path)}
        >
          <span className="game-nav__icon">{item.icon}</span>
          <span className="game-nav__label">{item.label}</span>
        </button>
      ))}
    </nav>
  );
};
