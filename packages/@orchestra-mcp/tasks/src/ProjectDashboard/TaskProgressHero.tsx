import './TaskProgressHero.css';

export interface TaskProgressHeroProps {
  completionPercent: number;
  totalTasks: number;
  doneTasks: number;
}

export const TaskProgressHero = ({
  completionPercent,
  totalTasks,
  doneTasks,
}: TaskProgressHeroProps) => {
  const pct = Math.min(100, Math.max(0, Math.round(completionPercent)));

  return (
    <div className="progress-hero" data-testid="task-progress-hero">
      <div className="progress-hero__info">
        <span className="progress-hero__label">Task Progress</span>
        <span className="progress-hero__stats">
          {doneTasks} of {totalTasks} tasks complete
        </span>
      </div>
      <span className="progress-hero__percent">{pct}%</span>
      <div className="progress-hero__bar">
        <div
          className="progress-hero__bar-fill"
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  );
};
