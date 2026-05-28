import type { LevelConfig, ProgressState } from '../types'

interface MainSceneProps {
  progress: ProgressState
  levels: LevelConfig[]
  onStart: (levelId: number) => void
}

export function MainScene({ progress, levels, onStart }: MainSceneProps) {
  const currentLevel = levels.find((level) => level.id === progress.currentLevel) ?? levels[0]

  return (
    <section className="scene-main">
      <div className="main-topbar">
        <button type="button" className="icon-badge">
          ⚙
        </button>
        <div className="top-resource">
          <span>提示</span>
          <strong>{progress.hintCharges}</strong>
        </div>
        <div className="top-resource">
          <span>金币</span>
          <strong>{progress.coins}</strong>
        </div>
      </div>

      <div className="hero-stage">
        <div className="hero-bg-glow" />
        <div className="hero-character">
          <div className="hero-helmet" />
          <div className="hero-face">
            <span className="hero-eye" />
            <span className="hero-eye" />
            <span className="hero-snout" />
          </div>
          <div className="hero-body" />
        </div>
        <div className="counter-board">
          <span>累计解锁</span>
          <strong>{progress.unlockedLevel} 关</strong>
        </div>
        <div className="preview-bottles">
          <div className="preview-crate yellow">
            <span className="preview-bottle amber" />
          </div>
          <div className="preview-crate blue">
            <span className="preview-bottle ocean" />
          </div>
        </div>
      </div>

      <div className="main-side-actions">
        <button type="button" className="mini-nav">商店</button>
        <button type="button" className="mini-nav">排名</button>
        <button type="button" className="mini-nav">图鉴</button>
      </div>

      <div className="main-cta-panel">
        <div className="mode-pill">
          <strong>无尽挑战</strong>
          <span>敬请期待</span>
        </div>
        <button type="button" className="start-button" onClick={() => onStart(currentLevel.id)}>
          <span className="start-title">开始游戏</span>
          <span className="start-subtitle">{currentLevel.name}</span>
        </button>
      </div>
    </section>
  )
}
