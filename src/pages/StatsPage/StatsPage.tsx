import type { FC } from 'react';
import { useGame } from '@/game/GameContext';
import { UPGRADES, LEVEL_NAMES } from '@/game/constants';
import './StatsPage.css';

function formatNumber(n: number): string {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + 'B';
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return Math.floor(n).toLocaleString();
}

// Mock leaderboard data
const LEADERBOARD = [
  { name: 'CryptoKing', coins: 50_000_000, avatar: '👑' },
  { name: 'TapMaster', coins: 32_000_000, avatar: '🎯' },
  { name: 'MoonWalker', coins: 18_500_000, avatar: '🌙' },
  { name: 'DiamondH', coins: 12_000_000, avatar: '💎' },
  { name: 'GoldRush', coins: 8_900_000, avatar: '⭐' },
];

export const StatsPage: FC = () => {
  const { state, tapCount, sessionEarnings } = useGame();

  return (
    <div className="stats-page">
      <div className="stats-page__title">Statistics</div>

      <div className="stats-page__cards">
        <div className="stats-card">
          <div className="stats-card__icon">🪙</div>
          <div className="stats-card__value">{formatNumber(state.totalCoins)}</div>
          <div className="stats-card__label">Total Earned</div>
        </div>
        <div className="stats-card">
          <div className="stats-card__icon">👆</div>
          <div className="stats-card__value">{formatNumber(tapCount)}</div>
          <div className="stats-card__label">Session Taps</div>
        </div>
        <div className="stats-card">
          <div className="stats-card__icon">⚡</div>
          <div className="stats-card__value">{formatNumber(sessionEarnings)}</div>
          <div className="stats-card__label">Session Earned</div>
        </div>
        <div className="stats-card">
          <div className="stats-card__icon">🏆</div>
          <div className="stats-card__value">Lv.{state.level}</div>
          <div className="stats-card__label">{LEVEL_NAMES[state.level]}</div>
        </div>
        <div className="stats-card">
          <div className="stats-card__icon">🔥</div>
          <div className="stats-card__value">{state.loginStreak}</div>
          <div className="stats-card__label">Day Streak</div>
        </div>
        <div className="stats-card">
          <div className="stats-card__icon">💪</div>
          <div className="stats-card__value">+{state.tapPower}</div>
          <div className="stats-card__label">Tap Power</div>
        </div>
      </div>

      <div className="stats-page__upgrades-title">Upgrades</div>
      <div className="stats-page__upgrades">
        {UPGRADES.map((upgrade) => {
          const owned = state.upgrades.find((u) => u.id === upgrade.id);
          const level = owned?.level ?? 0;
          const progress = (level / upgrade.maxLevel) * 100;

          return (
            <div key={upgrade.id} className="stats-upgrade">
              <span className="stats-upgrade__icon">{upgrade.icon}</span>
              <div className="stats-upgrade__info">
                <div className="stats-upgrade__name">{upgrade.name}</div>
                <div className="stats-upgrade__level-bar">
                  <div
                    className="stats-upgrade__level-fill"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
              <span className="stats-upgrade__level-text">
                {level}/{upgrade.maxLevel}
              </span>
            </div>
          );
        })}
      </div>

      <div className="stats-page__leaderboard">
        <div className="stats-page__leaderboard-title">🏅 Leaderboard</div>
        {LEADERBOARD.map((entry, index) => (
          <div key={entry.name} className="leaderboard-item">
            <span className={`leaderboard-item__rank ${
              index === 0 ? 'leaderboard-item__rank--gold'
              : index === 1 ? 'leaderboard-item__rank--silver'
              : index === 2 ? 'leaderboard-item__rank--bronze'
              : ''
            }`}>
              {index + 1}
            </span>
            <div className="leaderboard-item__avatar">{entry.avatar}</div>
            <div className="leaderboard-item__info">
              <div className="leaderboard-item__name">{entry.name}</div>
              <div className="leaderboard-item__coins">
                🪙 {formatNumber(entry.coins)}
              </div>
            </div>
          </div>
        ))}
        <div className="leaderboard-item leaderboard-item--you">
          <span className="leaderboard-item__rank">—</span>
          <div className="leaderboard-item__avatar">🙋</div>
          <div className="leaderboard-item__info">
            <div className="leaderboard-item__name">You</div>
            <div className="leaderboard-item__coins">
              🪙 {formatNumber(state.totalCoins)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
