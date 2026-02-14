import type { Upgrade, DailyTask, CoinPackage } from './types';

/** Bot configuration */
export const BOT_USERNAME = 'pudgyworldbot';
export const BOT_APP_URL = `https://t.me/${BOT_USERNAME}/app`;

/** TON wallet address for receiving payments */
export const OWNER_TON_ADDRESS = 'UQAWUTnnEdrJYp-lbjxte_vnaxmWsMpEB-Emp6DKW3FEKtnj';

/** Referral rewards */
export const REFERRAL_REWARD = 2500;           // Coins for referrer when friend joins
export const REFERRAL_FRIEND_BONUS = 1000;     // Bonus coins for the referred friend
export const REFERRAL_EARN_PERCENT = 0.10;     // 10% of referral's earnings

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
    {
      id: 'invite-friend',
      title: 'Invite a Friend',
      description: 'Invite a friend via your referral link',
      reward: baseReward * 5,
      icon: '👥',
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

/** In-app coin packages purchasable with TON */
export const COIN_PACKAGES: CoinPackage[] = [
  {
    id: 'starter',
    name: 'Starter Pack',
    description: '5,000 coins to get started',
    icon: '💰',
    coins: 5_000,
    priceTON: 0.1,
  },
  {
    id: 'popular',
    name: 'Popular Pack',
    description: '25,000 coins + 20% bonus',
    icon: '🎁',
    coins: 30_000,
    priceTON: 0.5,
    bonus: '+20%',
  },
  {
    id: 'pro',
    name: 'Pro Pack',
    description: '60,000 coins + 30% bonus',
    icon: '⭐',
    coins: 78_000,
    priceTON: 1.0,
    bonus: '+30%',
  },
  {
    id: 'whale',
    name: 'Whale Pack',
    description: '200,000 coins + 50% bonus',
    icon: '🐋',
    coins: 300_000,
    priceTON: 3.0,
    bonus: '+50%',
  },
  {
    id: 'ultimate',
    name: 'Ultimate Pack',
    description: '500,000 coins + 75% bonus',
    icon: '👑',
    coins: 875_000,
    priceTON: 5.0,
    bonus: '+75%',
  },
];
