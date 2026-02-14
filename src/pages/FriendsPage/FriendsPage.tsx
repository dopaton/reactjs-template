import type { FC } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { useGameStore } from '@/game/store';
import { getReferralLink } from '@/game/store';
import { REFERRAL_REWARD, REFERRAL_FRIEND_BONUS } from '@/game/constants';
import {
  Section,
  Cell,
  Button,
  Banner,
  Avatar,
  Headline,
  Caption,
  Subheadline,
  Placeholder,
} from '@telegram-apps/telegram-ui';

function formatNumber(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return n.toLocaleString();
}

export const FriendsPage: FC = () => {
  const state = useGameStore(s => s.state);

  if (!state) return null;

  const referralLink = getReferralLink(state.userId);

  const handleInvite = () => {
    const text = `🎮 Join me in CoinTap and earn coins together!\n\n💰 You'll get ${REFERRAL_FRIEND_BONUS.toLocaleString()} bonus coins!\n\nTap the link to start:`;
    const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(text)}`;
    window.open(shareUrl, '_blank');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink).catch(() => {
      // Fallback
    });
  };

  return (
    <div className="pb-20">
      <Banner
        header="Invite Friends & Earn"
        subheader={`Get ${REFERRAL_REWARD.toLocaleString()} 🪙 for each friend who joins. Your friend gets ${REFERRAL_FRIEND_BONUS.toLocaleString()} 🪙 bonus!`}
        type="section"
        className="m-2"
      >
        <div className="flex gap-2 mt-3">
          <Button size="m" stretched onClick={handleInvite}>
            👥 Share Invite Link
          </Button>
          <Button size="m" mode="outline" stretched onClick={handleCopyLink}>
            📋 Copy Link
          </Button>
        </div>
      </Banner>

      <Section header="Your Stats">
        <Cell
          before={<span className="text-2xl">👥</span>}
          after={<Headline weight="1">{state.referrals.length}</Headline>}
        >
          Friends Invited
        </Cell>
        <Cell
          before={<span className="text-2xl">💰</span>}
          after={<Headline weight="1">{formatNumber(state.totalReferralEarnings)} 🪙</Headline>}
        >
          Total Referral Earnings
        </Cell>
      </Section>

      <Section header={`Friends (${state.referrals.length})`}>
        {state.referrals.length === 0 ? (
          <Placeholder
            header="No friends yet"
            description="Invite your friends to earn bonus coins together!"
          >
            <span className="text-6xl">👥</span>
          </Placeholder>
        ) : (
          state.referrals.map((ref, index) => (
            <Cell
              key={ref.userId}
              before={
                <Avatar
                  size={40}
                  acronym={ref.firstName.charAt(0)}
                />
              }
              subtitle={
                <Caption>
                  {ref.username
                    ? `@${ref.username}`
                    : `Joined ${formatDistanceToNow(new Date(ref.joinedAt), { addSuffix: true })}`
                  }
                </Caption>
              }
              after={
                <Subheadline weight="2" className="text-game-accent">
                  +{formatNumber(ref.earned)} 🪙
                </Subheadline>
              }
            >
              #{index + 1} {ref.firstName}
            </Cell>
          ))
        )}
      </Section>

      <Section header="Your Referral Link">
        <Cell
          multiline
          subtitle={
            <Caption className="break-all text-game-link">
              {referralLink}
            </Caption>
          }
        >
          <Subheadline weight="2">
            Referral Code: {state.referralCode}
          </Subheadline>
        </Cell>
      </Section>
    </div>
  );
};
