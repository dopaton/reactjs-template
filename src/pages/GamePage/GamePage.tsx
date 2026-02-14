import type { FC } from 'react';
import { useGame } from '@/game/GameContext';
import { LEVEL_NAMES, getLevelProgress } from '@/game/constants';
import { CoinTap } from '@/components/CoinTap/CoinTap';
import './GamePage.css';

function formatNumber(n: number): string {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + 'B';
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return Math.floor(n).toLocaleString();
}

export const GamePage: FC = () => {
  const { state } = useGame();
  const levelProgress = getLevelProgress(state.totalCoins);
  const levelName = LEVEL_NAMES[state.level] || 'Unknown';

  return (
    <div className="game-page">
      <div className="game-page__header">
        <div className="game-page__level">
          <span className="game-page__level-badge">
            Lv.{state.level} {levelName}
          </span>
        </div>
        <div className="game-page__level-bar">
          <div
            className="game-page__level-fill"
            style={{ width: `${levelProgress * 100}%` }}
          />
        </div>

        <div className="game-page__coins">
          <span className="game-page__coin-icon">🪙</span>
          <span className="game-page__coin-count">{formatNumber(state.coins)}</span>
        </div>

        <div className="game-page__stats-row">
          <span className="game-page__stat">👆 +{state.tapPower}/tap</span>
          {state.autoTapRate > 0 && (
            <span className="game-page__stat">🤖 +{state.autoTapRate}/s</span>
          )}
        </div>

        {state.autoTapRate > 0 && (
          <div className="game-page__auto-earning">
            Auto mining: +{state.autoTapRate} coins/sec
          </div>
        )}
      </div>

      <CoinTap />
    </div>
  );
};
