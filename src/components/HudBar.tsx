import type { LevelConfig, RewardProgressState } from '../types'

interface HudBarProps {
  level: LevelConfig
  rewardProgress: RewardProgressState[]
}

export function HudBar({ level, rewardProgress }: HudBarProps) {
  const primaryGoal = rewardProgress[0]
  const percent = primaryGoal?.percent ?? 0
  const targetTotal = primaryGoal?.target ?? 0

  return (
    <header className="hud-shell">
      <h1 className="neon-title">NEON MIXOLOGY: COCKTAIL SORT</h1>
      <div className="level-name">{level.name}</div>
      <div className="target-copy">TARGET: SERVE {targetTotal} GLASSES</div>

      <div className="score-panel">
        <div className="score-cell">
          <span className="score-label">COMPLETED</span>
          <strong className="score-value">
            {primaryGoal?.current ?? 0}/{targetTotal}
          </strong>
        </div>
        <div className="score-cell">
          <span className="score-label">PROGRESS</span>
          <div className="level-progress wide">
            <span className="level-progress-fill" style={{ width: `${percent}%` }} />
          </div>
        </div>
        <div className="score-cell">
          <span className="score-label">PERCENT</span>
          <strong className="score-value">{percent}%</strong>
        </div>
      </div>
    </header>
  )
}
