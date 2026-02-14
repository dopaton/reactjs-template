import type { Upgrade, DailyTask } from './types';

export const INITIAL_ENERGY = 1000;
export const INITIAL_TAP_POWER = 1;
export const ENERGY_REGEN_RATE = 1; // per second
export const LEVEL_THRESHOLDS = [
  0, 1000, 5000, 20000, 100000, 500000, 2000000, 10000000, 50000000, 200000000,
];

export const LEVEL_NAMES = [
  'Beginner', 'Apprentice', 'Miner', 'Trader', 'Merchant',
  'Tycoon', 'Mogul', 'Whale', 'Legend', 'Satoshi',
];

export const UPGRADES: Upgrade[] = [
  {
    id: 'tap-power',
    name: 'Tap Power',
    description: 'Increase coins per tap',
    icon: '👆',
    baseCost: 100,
    costMultiplier: 1.8,
    maxLevel: 50,
    effect: (level: number) => level + 1,
  },
  {
    id: 'energy-capacity',
    name: 'Energy Tank',
    description: 'Increase max energy',
    icon: '🔋',
    baseCost: 200,
    costMultiplier: 1.6,
    maxLevel: 30,
    effect: (level: number) => 1000 + level * 500,
  },
  {
    id: 'energy-regen',
    name: 'Energy Regen',
    description: 'Faster energy recovery',
    icon: '⚡',
    baseCost: 500,
    costMultiplier: 2.0,
    maxLevel: 20,
    effect: (level: number) => 1 + level * 0.5,
  },
  {
    id: 'auto-tap',
    name: 'Auto Miner',
    description: 'Earn coins automatically',
    icon: '🤖',
    baseCost: 2000,
    costMultiplier: 2.2,
    maxLevel: 25,
    effect: (level: number) => level * 2,
  },
  {
    id: 'lucky-tap',
    name: 'Lucky Tap',
    description: 'Chance of 5x coins per tap',
    icon: '🍀',
    baseCost: 5000,
    costMultiplier: 2.5,
    maxLevel: 10,
    effect: (level: number) => level * 5,
  },
  {
    id: 'coin-magnet',
    name: 'Coin Magnet',
    description: 'Bonus coins every minute',
    icon: '🧲',
    baseCost: 10000,
    costMultiplier: 2.0,
    maxLevel: 15,
    effect: (level: number) => level * 10,
  },
];

export function getUpgradeCost(upgrade: Upgrade, currentLevel: number): number {
  return Math.floor(upgrade.baseCost * Math.pow(upgrade.costMultiplier, currentLevel));
}

export function getDailyTasks(streak: number): DailyTask[] {
  const baseReward = 100 * (1 + Math.floor(streak / 3));
  return [
    {
      id: 'daily-login',
      title: 'Daily Login',
      description: 'Log in today',
      reward: baseReward,
      icon: '📅',
      completed: false,
    },
    {
      id: 'tap-100',
      title: 'Tap 100 Times',
      description: 'Tap the coin 100 times',
      reward: baseReward * 2,
      icon: '👆',
      completed: false,
    },
    {
      id: 'earn-1000',
      title: 'Earn 1,000 Coins',
      description: 'Earn 1,000 coins today',
      reward: baseReward * 3,
      icon: '💰',
      completed: false,
    },
    {
      id: 'upgrade-once',
      title: 'Buy an Upgrade',
      description: 'Purchase any upgrade',
      reward: baseReward * 2,
      icon: '⬆️',
      completed: false,
    },
  ];
}

export function getLevel(totalCoins: number): number {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (totalCoins >= LEVEL_THRESHOLDS[i]) return i;
  }
  return 0;
}

export function getLevelProgress(totalCoins: number): number {
  const level = getLevel(totalCoins);
  if (level >= LEVEL_THRESHOLDS.length - 1) return 1;
  const current = totalCoins - LEVEL_THRESHOLDS[level];
  const needed = LEVEL_THRESHOLDS[level + 1] - LEVEL_THRESHOLDS[level];
  return current / needed;
}
