import type { LevelConfig, RewardProgressState } from '../types'

interface VictoryOverlayProps {
  level: LevelConfig
  rewardProgress: RewardProgressState[]
  onContinue: () => void
}

export function VictoryOverlay({
  level,
  rewardProgress,
  onContinue,
}: VictoryOverlayProps) {
  const reward = rewardProgress[0]

  return (
    <div className="overlay">
      <div className="victory-card">
        <div className="victory-rays" />
        <div className="victory-ribbon">恭喜获得</div>
        <div className="confetti confetti-a" />
        <div className="confetti confetti-b" />
        <div className="confetti confetti-c" />
        <div className="victory-cup">
          <span className="cup-straw" />
        </div>
        <div className="victory-copy">
          <strong>{reward?.rewardName ?? '新奖励'}</strong>
          <span>{level.name} 完成，点击继续前往下一关</span>
        </div>
        <button type="button" className="primary-modal-button" onClick={onContinue}>
          点击任意处继续
        </button>
      </div>
    </div>
  )
}
