export interface Upgrade {
  id: string;
  name: string;
  description: string;
  icon: string;
  baseCost: number;
  costMultiplier: number;
  maxLevel: number;
  effect: (level: number) => number;
}

export interface OwnedUpgrade {
  id: string;
  level: number;
}

export interface DailyTask {
  id: string;
  title: string;
  description: string;
  reward: number;
  icon: string;
  completed: boolean;
}

export interface GameState {
  coins: number;
  totalCoins: number;
  tapPower: number;
  energy: number;
  maxEnergy: number;
  energyRegenRate: number;
  autoTapRate: number;
  upgrades: OwnedUpgrade[];
  lastEnergyUpdate: number;
  lastDailyReset: number;
  dailyTasksCompleted: string[];
  loginStreak: number;
  lastLoginDate: string;
  level: number;
}

export interface FloatingText {
  id: number;
  x: number;
  y: number;
  value: number;
}
