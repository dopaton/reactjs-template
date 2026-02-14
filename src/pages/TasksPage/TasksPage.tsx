import type { FC } from 'react';
import { useGameStore } from '@/game/store';
import { getReferralLink } from '@/game/store';
import { getDailyTasks } from '@/game/constants';
import {
  Section,
  Cell,
  Button,
  Banner,
  Headline,
  Caption,
} from '@telegram-apps/telegram-ui';

export const TasksPage: FC = () => {
  const state = useGameStore(s => s.state);
  const claimDailyTask = useGameStore(s => s.claimDailyTask);
  const canClaimTask = useGameStore(s => s.canClaimTask);

  if (!state) return null;

  const tasks = getDailyTasks(state.loginStreak);

  const handleInvite = () => {
    const link = getReferralLink(state.userId);
    const text = '🎮 Join me in CoinTap and earn coins together! Use my invite link to get a bonus:';
    const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(text)}`;
    window.open(shareUrl, '_blank');
  };

  return (
    <div className="pb-20">
      <Section header={`Daily Tasks • 🔥 ${state.loginStreak} day streak`}>
        {tasks.map((task) => {
          const isCompleted = state.dailyTasksCompleted.includes(task.id);
          const canClaim = canClaimTask(task.id);

          return (
            <Cell
              key={task.id}
              before={<span className="text-3xl">{task.icon}</span>}
              subtitle={
                <span>
                  {task.description}
                  <Caption className="text-coin font-semibold">
                    {' '}+{task.reward.toLocaleString()} 🪙
                  </Caption>
                </span>
              }
              after={
                isCompleted ? (
                  <Button size="s" mode="gray" disabled>✓ Done</Button>
                ) : canClaim ? (
                  <Button
                    size="s"
                    mode="filled"
                    onClick={() => claimDailyTask(task.id, task.reward)}
                  >
                    Claim
                  </Button>
                ) : (
                  <Button size="s" mode="gray" disabled>In Progress</Button>
                )
              }
            >
              <Headline weight="2" className="text-[15px]">{task.title}</Headline>
            </Cell>
          );
        })}
      </Section>

      <Section header="Bonus">
        <Banner
          header="Invite Friends"
          subheader="Earn 2,500 coins for each friend who joins via your link! Your friend also gets 1,000 bonus coins."
          type="section"
          className="m-2"
        >
          <Button size="m" onClick={handleInvite}>
            👥 Invite Friends
          </Button>
        </Banner>
      </Section>
    </div>
  );
};
