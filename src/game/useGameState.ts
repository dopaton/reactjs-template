import { useState, useEffect, useCallback, useRef } from 'react';
import type { GameState, FloatingText } from './types';
import {
  INITIAL_ENERGY,
  INITIAL_TAP_POWER,
  ENERGY_REGEN_RATE,
  UPGRADES,
  getUpgradeCost,
  getLevel,
} from './constants';

const STORAGE_KEY = 'cointap_game_state';

function getDefaultState(): GameState {
  return {
    coins: 0,
    totalCoins: 0,
    tapPower: INITIAL_TAP_POWER,
    energy: INITIAL_ENERGY,
    maxEnergy: INITIAL_ENERGY,
    energyRegenRate: ENERGY_REGEN_RATE,
    autoTapRate: 0,
    upgrades: [],
    lastEnergyUpdate: Date.now(),
    lastDailyReset: 0,
    dailyTasksCompleted: [],
    loginStreak: 0,
    lastLoginDate: '',
    level: 0,
  };
}

function loadState(): GameState {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved) as GameState;
      // Regenerate energy based on time elapsed
      const now = Date.now();
      const elapsed = (now - parsed.lastEnergyUpdate) / 1000;
      const regenAmount = Math.floor(elapsed * parsed.energyRegenRate);
      parsed.energy = Math.min(parsed.maxEnergy, parsed.energy + regenAmount);
      parsed.lastEnergyUpdate = now;

      // Calculate offline auto-tap earnings
      if (parsed.autoTapRate > 0) {
        const offlineCoins = Math.floor(elapsed * parsed.autoTapRate * 0.5); // 50% efficiency offline
        parsed.coins += offlineCoins;
        parsed.totalCoins += offlineCoins;
      }

      return parsed;
    }
  } catch {
    // ignore
  }
  return getDefaultState();
}

function saveState(state: GameState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

export function useGameState() {
  const [state, setState] = useState<GameState>(loadState);
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
  const [tapCount, setTapCount] = useState(0);
  const [sessionEarnings, setSessionEarnings] = useState(0);
  const floatingIdRef = useRef(0);

  // Save to localStorage on state change
  useEffect(() => {
    saveState(state);
  }, [state]);

  // Energy regeneration tick
  useEffect(() => {
    const interval = setInterval(() => {
      setState(prev => {
        if (prev.energy >= prev.maxEnergy) return prev;
        const regen = Math.ceil(prev.energyRegenRate);
        return {
          ...prev,
          energy: Math.min(prev.maxEnergy, prev.energy + regen),
          lastEnergyUpdate: Date.now(),
        };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Auto-tap tick
  useEffect(() => {
    if (state.autoTapRate <= 0) return;
    const interval = setInterval(() => {
      setState(prev => {
        if (prev.autoTapRate <= 0) return prev;
        const earned = prev.autoTapRate;
        return {
          ...prev,
          coins: prev.coins + earned,
          totalCoins: prev.totalCoins + earned,
          level: getLevel(prev.totalCoins + earned),
        };
      });
      setSessionEarnings(prev => prev + state.autoTapRate);
    }, 1000);
    return () => clearInterval(interval);
  }, [state.autoTapRate]);

  // Clean up floating texts
  useEffect(() => {
    if (floatingTexts.length === 0) return;
    const timeout = setTimeout(() => {
      setFloatingTexts(prev => prev.slice(1));
    }, 800);
    return () => clearTimeout(timeout);
  }, [floatingTexts]);

  // Check daily login
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    if (state.lastLoginDate !== today) {
      setState(prev => {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        const isConsecutive = prev.lastLoginDate === yesterdayStr;

        return {
          ...prev,
          lastLoginDate: today,
          loginStreak: isConsecutive ? prev.loginStreak + 1 : 1,
          dailyTasksCompleted: [],
          lastDailyReset: Date.now(),
        };
      });
    }
  }, []);

  const tap = useCallback((x: number, y: number) => {
    setState(prev => {
      if (prev.energy < prev.tapPower) return prev;

      // Lucky tap check
      const luckyUpgrade = prev.upgrades.find(u => u.id === 'lucky-tap');
      const luckyChance = luckyUpgrade ? luckyUpgrade.level * 0.05 : 0;
      const isLucky = Math.random() < luckyChance;
      const multiplier = isLucky ? 5 : 1;
      const earned = prev.tapPower * multiplier;

      const newTotalCoins = prev.totalCoins + earned;

      floatingIdRef.current += 1;
      setFloatingTexts(ft => [
        ...ft,
        {
          id: floatingIdRef.current,
          x,
          y,
          value: earned,
        },
      ]);

      return {
        ...prev,
        coins: prev.coins + earned,
        totalCoins: newTotalCoins,
        energy: prev.energy - prev.tapPower,
        lastEnergyUpdate: Date.now(),
        level: getLevel(newTotalCoins),
      };
    });
    setTapCount(prev => prev + 1);
    setSessionEarnings(prev => prev + state.tapPower);
  }, [state.tapPower]);

  const buyUpgrade = useCallback((upgradeId: string) => {
    const upgrade = UPGRADES.find(u => u.id === upgradeId);
    if (!upgrade) return false;

    let success = false;
    setState(prev => {
      const owned = prev.upgrades.find(u => u.id === upgradeId);
      const currentLevel = owned?.level ?? 0;
      if (currentLevel >= upgrade.maxLevel) return prev;

      const cost = getUpgradeCost(upgrade, currentLevel);
      if (prev.coins < cost) return prev;

      const newLevel = currentLevel + 1;
      const newUpgrades = owned
        ? prev.upgrades.map(u => u.id === upgradeId ? { ...u, level: newLevel } : u)
        : [...prev.upgrades, { id: upgradeId, level: 1 }];

      // Apply effects
      let tapPower = prev.tapPower;
      let maxEnergy = prev.maxEnergy;
      let energyRegenRate = prev.energyRegenRate;
      let autoTapRate = prev.autoTapRate;

      for (const ownedUpgrade of newUpgrades) {
        const def = UPGRADES.find(u => u.id === ownedUpgrade.id);
        if (!def) continue;
        const val = def.effect(ownedUpgrade.level);
        switch (def.id) {
          case 'tap-power': tapPower = val; break;
          case 'energy-capacity': maxEnergy = val; break;
          case 'energy-regen': energyRegenRate = val; break;
          case 'auto-tap': autoTapRate = val; break;
        }
      }

      success = true;
      return {
        ...prev,
        coins: prev.coins - cost,
        upgrades: newUpgrades,
        tapPower,
        maxEnergy,
        energy: Math.min(prev.energy, maxEnergy),
        energyRegenRate,
        autoTapRate,
      };
    });

    return success;
  }, []);

  const claimDailyTask = useCallback((taskId: string, reward: number) => {
    setState(prev => {
      if (prev.dailyTasksCompleted.includes(taskId)) return prev;
      const newTotalCoins = prev.totalCoins + reward;
      return {
        ...prev,
        coins: prev.coins + reward,
        totalCoins: newTotalCoins,
        dailyTasksCompleted: [...prev.dailyTasksCompleted, taskId],
        level: getLevel(newTotalCoins),
      };
    });
  }, []);

  const canClaimTask = useCallback((taskId: string): boolean => {
    if (state.dailyTasksCompleted.includes(taskId)) return false;
    switch (taskId) {
      case 'daily-login': return true;
      case 'tap-100': return tapCount >= 100;
      case 'earn-1000': return sessionEarnings >= 1000;
      case 'upgrade-once': return state.upgrades.length > 0;
      default: return false;
    }
  }, [state.dailyTasksCompleted, tapCount, sessionEarnings, state.upgrades.length]);

  return {
    state,
    floatingTexts,
    tapCount,
    sessionEarnings,
    tap,
    buyUpgrade,
    claimDailyTask,
    canClaimTask,
  };
}
