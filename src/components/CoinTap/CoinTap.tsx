import { type FC, type TouchEvent, type MouseEvent, useCallback, useRef } from 'react';
import { useGame } from '@/game/GameContext';
import './CoinTap.css';

export const CoinTap: FC = () => {
  const { state, floatingTexts, tap } = useGame();
  const coinRef = useRef<HTMLDivElement>(null);

  const handleInteraction = useCallback((clientX: number, clientY: number) => {
    if (!coinRef.current) return;
    const rect = coinRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    tap(x, y);
  }, [tap]);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    e.preventDefault();
    for (let i = 0; i < e.touches.length; i++) {
      const touch = e.touches[i];
      handleInteraction(touch.clientX, touch.clientY);
    }
  }, [handleInteraction]);

  const handleClick = useCallback((e: MouseEvent) => {
    handleInteraction(e.clientX, e.clientY);
  }, [handleInteraction]);

  const energyPercent = (state.energy / state.maxEnergy) * 100;
  const hasEnergy = state.energy >= state.tapPower;

  return (
    <div className="coin-tap">
      <div className="coin-tap__coin-wrapper">
        <div
          ref={coinRef}
          className={`coin-tap__coin ${!hasEnergy ? 'coin-tap__coin--disabled' : ''}`}
          onTouchStart={hasEnergy ? handleTouchStart : undefined}
          onClick={hasEnergy ? handleClick : undefined}
        >
          💰
        </div>
        {floatingTexts.map((ft) => (
          <span
            key={ft.id}
            className="coin-tap__floating"
            style={{ left: ft.x, top: ft.y }}
          >
            +{ft.value}
          </span>
        ))}
      </div>

      <div className="coin-tap__energy-bar">
        <div
          className="coin-tap__energy-fill"
          style={{ width: `${energyPercent}%` }}
        />
      </div>
      <span className="coin-tap__energy-text">
        ⚡ {Math.floor(state.energy)} / {state.maxEnergy}
      </span>
    </div>
  );
};
