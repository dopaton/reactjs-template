import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { format, isYesterday } from 'date-fns';
import type { GameState, FloatingText, TelegramUser, Referral, PurchaseRecord } from './types';
import {
  INITIAL_ENERGY,
  INITIAL_TAP_POWER,
  ENERGY_REGEN_RATE,
  UPGRADES,
  getUpgradeCost,
  getLevel,
  BOT_USERNAME,
  REFERRAL_REWARD,
  REFERRAL_FRIEND_BONUS,
} from './constants';

// ── Storage helpers ──────────────────────────────────────────────────

function storageKey(userId: number): string {
  return `cointap_user_${userId}`;
}

function generateReferralCode(userId: number): string {
  return `ref_${userId}`;
}

export function parseReferralCode(code: string): number | null {
  const match = code.match(/^ref_(\d+)$/);
  return match ? parseInt(match[1], 10) : null;
}

export function getReferralLink(userId: number): string {
  return `https://t.me/${BOT_USERNAME}/app?startapp=ref_${userId}`;
}

function getDefaultState(user: TelegramUser): GameState {
  return {
    userId: user.id,
    username: user.username,
    firstName: user.first_name,
    lastName: user.last_name,
    photoUrl: user.photo_url,
    isPremium: user.is_premium,
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
    referralCode: generateReferralCode(user.id),
    referrals: [],
    totalReferralEarnings: 0,
    purchases: [],
    totalSpentTON: 0,
    createdAt: Date.now(),
  };
}

function loadState(user: TelegramUser): GameState {
  try {
    const saved = localStorage.getItem(storageKey(user.id));
    if (saved) {
      const parsed = JSON.parse(saved) as GameState;

      // Always update profile from Telegram
      parsed.username = user.username;
      parsed.firstName = user.first_name;
      parsed.lastName = user.last_name;
      parsed.photoUrl = user.photo_url;
      parsed.isPremium = user.is_premium;

      // Ensure new fields exist (migration)
      if (!parsed.purchases) parsed.purchases = [];
      if (parsed.totalSpentTON === undefined) parsed.totalSpentTON = 0;

      // Regenerate energy based on elapsed time
      const now = Date.now();
      const elapsed = (now - parsed.lastEnergyUpdate) / 1000;
      const regenAmount = Math.floor(elapsed * parsed.energyRegenRate);
      parsed.energy = Math.min(parsed.maxEnergy, parsed.energy + regenAmount);
      parsed.lastEnergyUpdate = now;

      // Offline auto-tap earnings (50% efficiency, 3hr cap)
      if (parsed.autoTapRate > 0) {
        const maxOffline = 3 * 60 * 60;
        const offlineSeconds = Math.min(elapsed, maxOffline);
        const offlineCoins = Math.floor(offlineSeconds * parsed.autoTapRate * 0.5);
        parsed.coins += offlineCoins;
        parsed.totalCoins += offlineCoins;
      }

      return parsed;
    }
  } catch {
    // ignore
  }
  return getDefaultState(user);
}

function saveState(state: GameState) {
  try {
    localStorage.setItem(storageKey(state.userId), JSON.stringify(state));
  } catch {
    // ignore
  }
}

function processReferral(
  state: GameState,
  startParam: string | undefined,
  user: TelegramUser,
): GameState {
  if (!startParam) return state;
  if (state.referredBy) return state;
  const referrerId = parseReferralCode(startParam);
  if (!referrerId || referrerId === user.id) return state;

  state.referredBy = referrerId;
  state.coins += REFERRAL_FRIEND_BONUS;
  state.totalCoins += REFERRAL_FRIEND_BONUS;

  try {
    const referrerKey = storageKey(referrerId);
    const referrerData = localStorage.getItem(referrerKey);
    if (referrerData) {
      const referrer = JSON.parse(referrerData) as GameState;
      const alreadyReferred = referrer.referrals.some(r => r.userId === user.id);
      if (!alreadyReferred) {
        const newReferral: Referral = {
          userId: user.id,
          username: user.username,
          firstName: user.first_name,
          joinedAt: Date.now(),
          earned: 0,
        };
        referrer.referrals.push(newReferral);
        referrer.coins += REFERRAL_REWARD;
        referrer.totalCoins += REFERRAL_REWARD;
        referrer.totalReferralEarnings += REFERRAL_REWARD;
        saveState(referrer);
      }
    }
  } catch {
    // Referrer data might not exist on this device
  }

  return state;
}

// ── Zustand store ────────────────────────────────────────────────────

interface GameStore {
  // Core state
  state: GameState | null;
  floatingTexts: FloatingText[];
  tapCount: number;
  sessionEarnings: number;
  _floatingId: number;
  _initialized: boolean;

  // Actions
  init: (user: TelegramUser, startParam?: string) => void;
  tap: (x: number, y: number) => void;
  buyUpgrade: (upgradeId: string) => boolean;
  claimDailyTask: (taskId: string, reward: number) => void;
  canClaimTask: (taskId: string) => boolean;
  addPurchase: (record: PurchaseRecord) => void;
  regenEnergy: () => void;
  autoTapTick: () => void;
  checkDailyLogin: () => void;
  clearOldFloatingTexts: () => void;
}

export const useGameStore = create<GameStore>()(
  subscribeWithSelector((set, get) => ({
    state: null,
    floatingTexts: [],
    tapCount: 0,
    sessionEarnings: 0,
    _floatingId: 0,
    _initialized: false,

    init: (user, startParam) => {
      if (get()._initialized) return;
      let loaded = loadState(user);
      loaded = processReferral(loaded, startParam, user);

      // Daily login check with date-fns
      const today = new Date();
      const todayStr = format(today, 'yyyy-MM-dd');
      if (loaded.lastLoginDate !== todayStr) {
        const lastDate = loaded.lastLoginDate
          ? new Date(loaded.lastLoginDate)
          : null;
        const isConsecutive = lastDate ? isYesterday(lastDate) : false;
        loaded.lastLoginDate = todayStr;
        loaded.loginStreak = isConsecutive ? loaded.loginStreak + 1 : 1;
        loaded.dailyTasksCompleted = [];
        loaded.lastDailyReset = Date.now();
      }

      saveState(loaded);
      set({ state: loaded, _initialized: true });
    },

    tap: (x, y) => {
      const { state: s, _floatingId } = get();
      if (!s || s.energy < s.tapPower) return;

      const luckyUpgrade = s.upgrades.find(u => u.id === 'lucky-tap');
      const luckyChance = luckyUpgrade ? luckyUpgrade.level * 0.05 : 0;
      const isLucky = Math.random() < luckyChance;
      const multiplier = isLucky ? 5 : 1;
      const earned = s.tapPower * multiplier;
      const newTotalCoins = s.totalCoins + earned;
      const newId = _floatingId + 1;

      set(prev => ({
        _floatingId: newId,
        tapCount: prev.tapCount + 1,
        sessionEarnings: prev.sessionEarnings + earned,
        floatingTexts: [
          ...prev.floatingTexts,
          { id: newId, x, y, value: earned },
        ],
        state: prev.state ? {
          ...prev.state,
          coins: prev.state.coins + earned,
          totalCoins: newTotalCoins,
          energy: prev.state.energy - prev.state.tapPower,
          lastEnergyUpdate: Date.now(),
          level: getLevel(newTotalCoins),
        } : null,
      }));

      // Save
      const updated = get().state;
      if (updated) saveState(updated);
    },

    buyUpgrade: (upgradeId) => {
      const upgrade = UPGRADES.find(u => u.id === upgradeId);
      if (!upgrade) return false;

      const s = get().state;
      if (!s) return false;

      const owned = s.upgrades.find(u => u.id === upgradeId);
      const currentLevel = owned?.level ?? 0;
      if (currentLevel >= upgrade.maxLevel) return false;

      const cost = getUpgradeCost(upgrade, currentLevel);
      if (s.coins < cost) return false;

      const newLevel = currentLevel + 1;
      const newUpgrades = owned
        ? s.upgrades.map(u => u.id === upgradeId ? { ...u, level: newLevel } : u)
        : [...s.upgrades, { id: upgradeId, level: 1 }];

      let tapPower = s.tapPower;
      let maxEnergy = s.maxEnergy;
      let energyRegenRate = s.energyRegenRate;
      let autoTapRate = s.autoTapRate;

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

      set(prev => ({
        state: prev.state ? {
          ...prev.state,
          coins: prev.state.coins - cost,
          upgrades: newUpgrades,
          tapPower,
          maxEnergy,
          energy: Math.min(prev.state.energy, maxEnergy),
          energyRegenRate,
          autoTapRate,
        } : null,
      }));

      const updated = get().state;
      if (updated) saveState(updated);
      return true;
    },

    claimDailyTask: (taskId, reward) => {
      set(prev => {
        if (!prev.state || prev.state.dailyTasksCompleted.includes(taskId)) return prev;
        const newTotalCoins = prev.state.totalCoins + reward;
        const newState = {
          ...prev.state,
          coins: prev.state.coins + reward,
          totalCoins: newTotalCoins,
          dailyTasksCompleted: [...prev.state.dailyTasksCompleted, taskId],
          level: getLevel(newTotalCoins),
        };
        saveState(newState);
        return { state: newState };
      });
    },

    canClaimTask: (taskId) => {
      const { state: s, tapCount, sessionEarnings } = get();
      if (!s) return false;
      if (s.dailyTasksCompleted.includes(taskId)) return false;
      switch (taskId) {
        case 'daily-login': return true;
        case 'tap-100': return tapCount >= 100;
        case 'earn-1000': return sessionEarnings >= 1000;
        case 'upgrade-once': return s.upgrades.length > 0;
        case 'invite-friend': return s.referrals.length > 0;
        default: return false;
      }
    },

    addPurchase: (record) => {
      set(prev => {
        if (!prev.state) return prev;
        const newState = {
          ...prev.state,
          coins: prev.state.coins + record.coins,
          totalCoins: prev.state.totalCoins + record.coins,
          level: getLevel(prev.state.totalCoins + record.coins),
          purchases: [...prev.state.purchases, record],
          totalSpentTON: prev.state.totalSpentTON + record.priceTON,
        };
        saveState(newState);
        return { state: newState };
      });
    },

    regenEnergy: () => {
      set(prev => {
        if (!prev.state || prev.state.energy >= prev.state.maxEnergy) return prev;
        const regen = Math.ceil(prev.state.energyRegenRate);
        const newState = {
          ...prev.state,
          energy: Math.min(prev.state.maxEnergy, prev.state.energy + regen),
          lastEnergyUpdate: Date.now(),
        };
        return { state: newState };
      });
    },

    autoTapTick: () => {
      set(prev => {
        if (!prev.state || prev.state.autoTapRate <= 0) return prev;
        const earned = prev.state.autoTapRate;
        const newState = {
          ...prev.state,
          coins: prev.state.coins + earned,
          totalCoins: prev.state.totalCoins + earned,
          level: getLevel(prev.state.totalCoins + earned),
        };
        saveState(newState);
        return {
          state: newState,
          sessionEarnings: prev.sessionEarnings + earned,
        };
      });
    },

    checkDailyLogin: () => {
      const s = get().state;
      if (!s) return;
      const todayStr = format(new Date(), 'yyyy-MM-dd');
      if (s.lastLoginDate === todayStr) return;

      const lastDate = s.lastLoginDate ? new Date(s.lastLoginDate) : null;
      const isConsecutive = lastDate ? isYesterday(lastDate) : false;

      set(prev => {
        if (!prev.state) return prev;
        const newState = {
          ...prev.state,
          lastLoginDate: todayStr,
          loginStreak: isConsecutive ? prev.state.loginStreak + 1 : 1,
          dailyTasksCompleted: [],
          lastDailyReset: Date.now(),
        };
        saveState(newState);
        return { state: newState };
      });
    },

    clearOldFloatingTexts: () => {
      set(prev => ({
        floatingTexts: prev.floatingTexts.slice(1),
      }));
    },
  })),
);
