import type { FC } from 'react';
import { useGame } from '@/game/GameContext';
import { getDailyTasks } from '@/game/constants';
import './TasksPage.css';

export const TasksPage: FC = () => {
  const { state, claimDailyTask, canClaimTask } = useGame();
  const tasks = getDailyTasks(state.loginStreak);

  return (
    <div className="tasks-page">
      <div className="tasks-page__title">Daily Tasks</div>
      <div className="tasks-page__streak">
        🔥 Login Streak: {state.loginStreak} day{state.loginStreak !== 1 ? 's' : ''}
      </div>

      <div className="tasks-page__list">
        {tasks.map((task) => {
          const isCompleted = state.dailyTasksCompleted.includes(task.id);
          const canClaim = canClaimTask(task.id);

          return (
            <div key={task.id} className="task-card">
              <div className="task-card__icon">{task.icon}</div>
              <div className="task-card__info">
                <div className="task-card__name">{task.title}</div>
                <div className="task-card__desc">{task.description}</div>
                <div className="task-card__reward">+{task.reward.toLocaleString()} 🪙</div>
              </div>
              <button
                className={`task-card__btn ${
                  isCompleted
                    ? 'task-card__btn--done'
                    : canClaim
                      ? 'task-card__btn--claim'
                      : 'task-card__btn--locked'
                }`}
                onClick={() => canClaim && !isCompleted && claimDailyTask(task.id, task.reward)}
                disabled={isCompleted || !canClaim}
              >
                {isCompleted ? '✓ Done' : canClaim ? 'Claim' : 'In Progress'}
              </button>
            </div>
          );
        })}
      </div>

      <div className="tasks-page__section-title">Bonus</div>
      <div className="tasks-page__invite-card">
        <div className="tasks-page__invite-icon">👥</div>
        <div className="tasks-page__invite-title">Invite Friends</div>
        <div className="tasks-page__invite-desc">
          Earn 1,000 coins for each friend who joins!
        </div>
        <button
          className="tasks-page__invite-btn"
          onClick={() => {
            const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent('Join me in CoinTap and earn coins! 🪙')}`;
            window.open(shareUrl, '_blank');
          }}
        >
          Invite Friends
        </button>
      </div>
    </div>
  );
};
