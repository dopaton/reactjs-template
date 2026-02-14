import type { FC } from 'react';
import { TonConnectButton, useTonWallet } from '@tonconnect/ui-react';
import { useGame } from '@/game/GameContext';
import './WalletPage.css';

const WITHDRAW_THRESHOLD = 100_000;
const COIN_TO_TON_RATE = 0.000001; // 1M coins = 1 TON

function formatNumber(n: number): string {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + 'B';
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return Math.floor(n).toLocaleString();
}

export const WalletPage: FC = () => {
  const { state } = useGame();
  const wallet = useTonWallet();
  const tonValue = (state.coins * COIN_TO_TON_RATE).toFixed(6);
  const canWithdraw = state.coins >= WITHDRAW_THRESHOLD && !!wallet;

  return (
    <div className="wallet-page">
      <div className="wallet-page__title">Wallet</div>

      <div className="wallet-page__balance-card">
        <div className="wallet-page__balance-label">Your Balance</div>
        <div className="wallet-page__balance-amount">
          🪙 {formatNumber(state.coins)}
        </div>
        <div className="wallet-page__balance-usd">
          ≈ {tonValue} TON
        </div>
      </div>

      {!wallet ? (
        <div className="wallet-page__connect-section">
          <div className="wallet-page__connect-title">Connect Wallet</div>
          <div className="wallet-page__connect-desc">
            Connect your TON wallet to withdraw your earned coins as tokens.
          </div>
          <div className="wallet-page__connect-btn-wrapper">
            <TonConnectButton />
          </div>
        </div>
      ) : (
        <>
          <div className="wallet-page__withdraw-section">
            <div className="wallet-page__withdraw-title">Withdraw</div>
            <div className="wallet-page__withdraw-desc">
              Convert your coins to TON tokens and withdraw to your wallet.
            </div>
            <div className="wallet-page__withdraw-info">
              <div className="wallet-page__withdraw-row">
                <span className="wallet-page__withdraw-label">Min. withdrawal</span>
                <span className="wallet-page__withdraw-value">
                  {formatNumber(WITHDRAW_THRESHOLD)} coins
                </span>
              </div>
              <div className="wallet-page__withdraw-row">
                <span className="wallet-page__withdraw-label">Exchange rate</span>
                <span className="wallet-page__withdraw-value">
                  1M coins = 1 TON
                </span>
              </div>
              <div className="wallet-page__withdraw-row">
                <span className="wallet-page__withdraw-label">You receive</span>
                <span className="wallet-page__withdraw-value">
                  {tonValue} TON
                </span>
              </div>
            </div>
            <button
              className={`wallet-page__withdraw-btn ${
                canWithdraw ? 'wallet-page__withdraw-btn--active' : 'wallet-page__withdraw-btn--disabled'
              }`}
              disabled={!canWithdraw}
              onClick={() => {
                if (canWithdraw) {
                  alert(`Withdrawal of ${tonValue} TON requested! This feature will be enabled when the token launches.`);
                }
              }}
            >
              {state.coins < WITHDRAW_THRESHOLD
                ? `Need ${formatNumber(WITHDRAW_THRESHOLD - state.coins)} more coins`
                : 'Withdraw to Wallet'}
            </button>
          </div>

          <div className="wallet-page__wallet-info">
            <div className="wallet-page__wallet-info-title">Connected Wallet</div>
            <div className="wallet-page__wallet-address">
              {wallet.account.address}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
