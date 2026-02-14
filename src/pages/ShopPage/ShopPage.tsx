import { type FC, useCallback } from 'react';
import { useGameStore } from '@/game/store';
import { UPGRADES, getUpgradeCost, COIN_PACKAGES, OWNER_TON_ADDRESS } from '@/game/constants';
import { useTonConnectUI, useTonWallet } from '@tonconnect/ui-react';
import {
  Section,
  Cell,
  Button,
  Badge,
  Headline,
  Subheadline,
  Caption,
  Banner,
} from '@telegram-apps/telegram-ui';
import type { CoinPackage } from '@/game/types';

function formatNumber(n: number): string {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + 'B';
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return Math.floor(n).toLocaleString();
}

export const ShopPage: FC = () => {
  const state = useGameStore(s => s.state);
  const buyUpgrade = useGameStore(s => s.buyUpgrade);
  const addPurchase = useGameStore(s => s.addPurchase);
  const [tonConnectUI] = useTonConnectUI();
  const wallet = useTonWallet();

  const handleBuyPackage = useCallback(async (pkg: CoinPackage) => {
    if (!wallet) {
      // Connect wallet first
      await tonConnectUI.openModal();
      return;
    }

    try {
      // Convert TON to nanotons (1 TON = 10^9 nanotons)
      const amountNano = Math.floor(pkg.priceTON * 1_000_000_000).toString();

      const transaction = {
        validUntil: Math.floor(Date.now() / 1000) + 600, // 10 min
        messages: [
          {
            address: OWNER_TON_ADDRESS,
            amount: amountNano,
            payload: '', // Could add comment payload for tracking
          },
        ],
      };

      const result = await tonConnectUI.sendTransaction(transaction);

      // Transaction sent — credit coins
      addPurchase({
        packageId: pkg.id,
        coins: pkg.coins,
        priceTON: pkg.priceTON,
        timestamp: Date.now(),
        txHash: result.boc,
      });

      alert(`✅ ${pkg.name} satın alındı! +${formatNumber(pkg.coins)} coin eklendi.`);
    } catch (err) {
      // User cancelled or error
      console.error('Transaction failed:', err);
    }
  }, [wallet, tonConnectUI, addPurchase]);

  if (!state) return null;

  return (
    <div className="pb-20">
      {/* Balance */}
      <Section header="Upgrades">
        <Cell
          before={<span className="text-2xl">🪙</span>}
          subtitle="Available balance"
        >
          <Headline weight="1">{formatNumber(state.coins)}</Headline>
        </Cell>
      </Section>

      {/* TON Coin Packages */}
      <Section header="💎 Coin Packages (TON)">
        <Banner
          header="Buy Coins with TON"
          subheader="Instantly receive coins. Payments are processed on-chain."
          type="section"
          className="m-2"
        />
        {COIN_PACKAGES.map((pkg) => (
          <Cell
            key={pkg.id}
            before={<span className="text-3xl">{pkg.icon}</span>}
            subtitle={
              <span>
                {pkg.description}
                {pkg.bonus && (
                  <Caption className="text-game-accent font-semibold ml-1">
                    {pkg.bonus}
                  </Caption>
                )}
              </span>
            }
            after={
              <Button
                size="s"
                mode="filled"
                onClick={() => handleBuyPackage(pkg)}
              >
                💎 {pkg.priceTON} TON
              </Button>
            }
          >
            <Subheadline weight="1">
              {pkg.name}
              <Caption className="text-coin font-bold ml-2">
                +{formatNumber(pkg.coins)} 🪙
              </Caption>
            </Subheadline>
          </Cell>
        ))}
      </Section>

      {/* Coin Upgrades */}
      <Section header="⚡ Power Ups (Coins)">
        {UPGRADES.map((upgrade) => {
          const owned = state.upgrades.find((u) => u.id === upgrade.id);
          const currentLevel = owned?.level ?? 0;
          const isMaxed = currentLevel >= upgrade.maxLevel;
          const cost = isMaxed ? 0 : getUpgradeCost(upgrade, currentLevel);
          const canAfford = state.coins >= cost && !isMaxed;

          return (
            <Cell
              key={upgrade.id}
              before={<span className="text-3xl">{upgrade.icon}</span>}
              subtitle={
                <span>
                  {upgrade.description}
                  {!isMaxed && (
                    <Caption className="text-game-accent">
                      {' → '}Next: {upgrade.effect(currentLevel + 1).toFixed(1)}
                    </Caption>
                  )}
                </span>
              }
              after={
                isMaxed ? (
                  <Badge type="dot" className="text-game-accent">MAX</Badge>
                ) : (
                  <Button
                    size="s"
                    mode={canAfford ? 'filled' : 'gray'}
                    disabled={!canAfford}
                    onClick={() => buyUpgrade(upgrade.id)}
                  >
                    🪙 {formatNumber(cost)}
                  </Button>
                )
              }
            >
              <Subheadline weight="1">
                {upgrade.name}
                {currentLevel > 0 && (
                  <Badge type="number" className="ml-1.5">
                    Lv.{currentLevel}
                  </Badge>
                )}
              </Subheadline>
            </Cell>
          );
        })}
      </Section>
    </div>
  );
};
