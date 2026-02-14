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

export interface Referral {
  userId: number;
  username?: string;
  firstName: string;
  joinedAt: number;
  earned: number;
}

/** In-app purchase package (paid with TON) */
export interface CoinPackage {
  id: string;
  name: string;
  description: string;
  icon: string;
  coins: number;
  priceTON: number;
  bonus?: string;
}

/** Record of a TON purchase */
export interface PurchaseRecord {
  packageId: string;
  coins: number;
  priceTON: number;
  timestamp: number;
  txHash?: string;
}

export interface GameState {
  /** Telegram user ID - unique per player */
  userId: number;
  username?: string;
  firstName: string;
  lastName?: string;
  photoUrl?: string;
  isPremium?: boolean;

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

  /** Referral system */
  referralCode: string;
  referredBy?: number;
  referrals: Referral[];
  totalReferralEarnings: number;

  /** TON wallet address if connected */
  walletAddress?: string;

  /** Purchase history */
  purchases: PurchaseRecord[];
  totalSpentTON: number;

  /** First open timestamp */
  createdAt: number;
}

export interface FloatingText {
  id: number;
  x: number;
  y: number;
  value: number;
}

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  is_premium?: boolean;
  language_code?: string;
}
