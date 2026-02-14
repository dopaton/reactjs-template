import type { FC } from 'react';
import { useGame } from '@/game/GameContext';
import { UPGRADES, getUpgradeCost } from '@/game/constants';
import './ShopPage.css';

function formatNumber(n: number): string {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + 'B';
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return Math.floor(n).toLocaleString();
}

export const ShopPage: FC = () => {
  const { state, buyUpgrade } = useGame();

  return (
    <div className="shop-page">
      <div className="shop-page__title">Upgrades</div>
      <div className="shop-page__balance">
        🪙 {formatNumber(state.coins)} coins available
      </div>

      <div className="shop-page__grid">
        {UPGRADES.map((upgrade) => {
          const owned = state.upgrades.find((u) => u.id === upgrade.id);
          const currentLevel = owned?.level ?? 0;
          const isMaxed = currentLevel >= upgrade.maxLevel;
          const cost = isMaxed ? 0 : getUpgradeCost(upgrade, currentLevel);
          const canAfford = state.coins >= cost && !isMaxed;
          const nextEffect = upgrade.effect(currentLevel + 1);

          return (
            <div key={upgrade.id} className="shop-card">
              <div className="shop-card__icon">{upgrade.icon}</div>
              <div className="shop-card__info">
                <div className="shop-card__name">
                  {upgrade.name}
                  {currentLevel > 0 && (
                    <span className="shop-card__level">Lv.{currentLevel}</span>
                  )}
                </div>
                <div className="shop-card__desc">{upgrade.description}</div>
                {!isMaxed && (
                  <div className="shop-card__effect">
                    Next: {nextEffect.toFixed(1)}
                  </div>
                )}
              </div>
              <button
                className={`shop-card__buy ${
                  isMaxed
                    ? 'shop-card__buy--maxed'
                    : canAfford
                      ? 'shop-card__buy--can-afford'
                      : 'shop-card__buy--cannot-afford'
                }`}
                onClick={() => !isMaxed && canAfford && buyUpgrade(upgrade.id)}
                disabled={isMaxed || !canAfford}
              >
                {isMaxed ? 'MAX' : `🪙 ${formatNumber(cost)}`}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
