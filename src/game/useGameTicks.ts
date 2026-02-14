import { useEffect } from 'react';
import { useGameStore } from './store';

/**
 * Hook that runs game ticks (energy regen, auto-tap, floating text cleanup).
 * Must be mounted once in the app root.
 */
export function useGameTicks() {
  const state = useGameStore(s => s.state);
  const regenEnergy = useGameStore(s => s.regenEnergy);
  const autoTapTick = useGameStore(s => s.autoTapTick);
  const clearOldFloatingTexts = useGameStore(s => s.clearOldFloatingTexts);
  const floatingTexts = useGameStore(s => s.floatingTexts);

  // Energy regen every second
  useEffect(() => {
    if (!state) return;
    const interval = setInterval(regenEnergy, 1000);
    return () => clearInterval(interval);
  }, [!!state, regenEnergy]);

  // Auto-tap every second
  useEffect(() => {
    if (!state || state.autoTapRate <= 0) return;
    const interval = setInterval(autoTapTick, 1000);
    return () => clearInterval(interval);
  }, [state?.autoTapRate, autoTapTick]);

  // Clean up floating texts
  useEffect(() => {
    if (floatingTexts.length === 0) return;
    const timeout = setTimeout(clearOldFloatingTexts, 800);
    return () => clearTimeout(timeout);
  }, [floatingTexts, clearOldFloatingTexts]);
}
