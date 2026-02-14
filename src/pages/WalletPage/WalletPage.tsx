import type { FC } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { TonConnectButton, useTonWallet, useTonAddress } from '@tonconnect/ui-react';
import { useGameStore } from '@/game/store';
import {
  Section,
  Cell,
  Button,
  Banner,
  Headline,
  Caption,
  Subheadline,
  Placeholder,
} from '@telegram-apps/telegram-ui';

const WITHDRAW_THRESHOLD = 100_000;
const COIN_TO_TON_RATE = 0.000001; // 1M coins = 1 TON

function formatNumber(n: number): string {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + 'B';
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return Math.floor(n).toLocaleString();
}

function truncateAddress(address: string): string {
  if (address.length <= 16) return address;
  return `${address.slice(0, 8)}...${address.slice(-8)}`;
}

export const WalletPage: FC = () => {
  const state = useGameStore(s => s.state);
  const wallet = useTonWallet();
  const address = useTonAddress(false);
  const friendlyAddress = useTonAddress(true);

  if (!state) return null;

  const tonValue = (state.coins * COIN_TO_TON_RATE).toFixed(6);
  const canWithdraw = state.coins >= WITHDRAW_THRESHOLD && !!wallet;

  return (
    <div className="pb-20">
      {/* Balance Card */}
      <Banner
        header={`🪙 ${formatNumber(state.coins)}`}
        subheader={`≈ ${tonValue} TON`}
        type="section"
        className="m-2 text-center"
      />

      {/* Wallet Connection */}
      <Section header="TON Wallet">
        {!wallet ? (
          <>
            <Placeholder
              header="Connect Your Wallet"
              description="Link your TON wallet to withdraw earned coins as tokens."
            >
              <span className="text-6xl">💎</span>
            </Placeholder>
            <div className="flex justify-center p-4">
              <TonConnectButton />
            </div>
          </>
        ) : (
          <>
            <Cell
              before={<span className="text-2xl">✅</span>}
              subtitle={
                <Caption className="font-mono break-all">
                  {friendlyAddress ? truncateAddress(friendlyAddress) : truncateAddress(address)}
                </Caption>
              }
            >
              <Subheadline weight="1">Wallet Connected</Subheadline>
            </Cell>
            <div className="flex justify-center p-4">
              <TonConnectButton />
            </div>
          </>
        )}
      </Section>

      {/* Withdraw Section */}
      <Section header="Withdraw">
        <Cell
          before={<span className="text-xl">📊</span>}
          after={<Caption>{formatNumber(WITHDRAW_THRESHOLD)} coins</Caption>}
        >
          Min. withdrawal
        </Cell>
        <Cell
          before={<span className="text-xl">💱</span>}
          after={<Caption>1M coins = 1 TON</Caption>}
        >
          Exchange rate
        </Cell>
        <Cell
          before={<span className="text-xl">💎</span>}
          after={<Headline weight="1">{tonValue} TON</Headline>}
        >
          You receive
        </Cell>

        <div className="p-4">
          <Button
            size="l"
            mode={canWithdraw ? 'filled' : 'gray'}
            stretched
            disabled={!canWithdraw}
            onClick={() => {
              if (canWithdraw) {
                alert(`Withdrawal of ${tonValue} TON requested! This feature will be enabled when the token launches.`);
              }
            }}
          >
            {!wallet
              ? '🔗 Connect wallet first'
              : state.coins < WITHDRAW_THRESHOLD
                ? `Need ${formatNumber(WITHDRAW_THRESHOLD - state.coins)} more coins`
                : '💎 Withdraw to Wallet'
            }
          </Button>
        </div>
      </Section>

      {/* Purchase History */}
      {state.purchases.length > 0 && (
        <Section header={`Purchase History (${state.purchases.length})`}>
          {state.purchases.map((purchase, i) => (
            <Cell
              key={i}
              before={<span className="text-xl">💎</span>}
              subtitle={
                <Caption>
                  {formatDistanceToNow(new Date(purchase.timestamp), { addSuffix: true })}
                </Caption>
              }
              after={
                <Subheadline weight="2" className="text-game-accent">
                  +{formatNumber(purchase.coins)} 🪙
                </Subheadline>
              }
            >
              {purchase.priceTON} TON
            </Cell>
          ))}
          <Cell
            before={<span className="text-xl">📊</span>}
            after={<Headline weight="1">{state.totalSpentTON.toFixed(2)} TON</Headline>}
          >
            Total Spent
          </Cell>
        </Section>
      )}
    </div>
  );
};
