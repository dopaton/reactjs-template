import type { FC } from 'react';
import { useGameStore } from '@/game/store';
import { LEVEL_NAMES, getLevelProgress } from '@/game/constants';
import { PixiCoin } from '@/components/PixiCoin/PixiCoin';
import { Badge, Progress } from '@telegram-apps/telegram-ui';
import { Caption, Headline, LargeTitle, Subheadline } from '@telegram-apps/telegram-ui';

function formatNumber(n: number): string {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + 'B';
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return Math.floor(n).toLocaleString();
}

export const GamePage: FC = () => {
  const state = useGameStore(s => s.state);

  if (!state) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen pb-20">
        <Headline weight="1">Loading...</Headline>
      </div>
    );
  }

  const levelProgress = getLevelProgress(state.totalCoins);
  const levelName = LEVEL_NAMES[state.level] || 'Unknown';
  const energyPercent = (state.energy / state.maxEnergy) * 100;

  return (
    <div className="flex flex-col items-center min-h-screen pb-20">
      {/* Header */}
      <div className="w-full text-center pt-4 px-5 pb-2">
        <Badge type="number" className="mx-auto mb-2">
          Lv.{state.level} {levelName}
        </Badge>

        <div className="w-3/5 max-w-[200px] mx-auto mb-2">
          <Progress value={levelProgress * 100} />
        </div>

        <div className="flex items-center justify-center gap-2 my-3">
          <span className="text-3xl">🪙</span>
          <LargeTitle weight="1" className="tabular-nums">
            {formatNumber(state.coins)}
          </LargeTitle>
        </div>

        <div className="flex gap-3 justify-center mb-2">
          <Caption className="bg-white/5 px-2.5 py-1 rounded-xl">
            👆 +{state.tapPower}/tap
          </Caption>
          {state.autoTapRate > 0 && (
            <Caption className="bg-white/5 px-2.5 py-1 rounded-xl">
              🤖 +{state.autoTapRate}/s
            </Caption>
          )}
        </div>

        {state.autoTapRate > 0 && (
          <Subheadline className="text-game-accent text-center" level="2" weight="2">
            Auto mining: +{state.autoTapRate} coins/sec
          </Subheadline>
        )}
      </div>

      {/* PixiJS Coin */}
      <PixiCoin />

      {/* Energy Bar */}
      <div className="w-[200px] flex flex-col items-center gap-1 mt-4">
        <Progress value={energyPercent} />
        <Caption className="text-center">
          ⚡ {Math.floor(state.energy)} / {state.maxEnergy}
        </Caption>
      </div>
    </div>
  );
};
