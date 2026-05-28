import { colorMap } from '../game/colors'
import type { RuleIntroConfig } from '../types'

interface RuleIntroModalProps {
  intro: RuleIntroConfig
  onClose: () => void
}

export function RuleIntroModal({ intro, onClose }: RuleIntroModalProps) {
  return (
    <div className="overlay">
      <div className="modal-card intro-card">
        <div
          className="intro-banner"
          style={{
            background: `linear-gradient(180deg, ${colorMap[intro.accent]}, #ff8a5b)`,
          }}
        >
          {intro.title}
        </div>
        <div className="intro-illustration">
          <div className="intro-bottle frozen">
            <div className="intro-fill intro-fill-left" />
          </div>
          <div className="intro-arrow">→</div>
          <div className="intro-bottle active">
            <div className="intro-fill intro-fill-right" />
          </div>
        </div>
        <p>{intro.description}</p>
        <button type="button" className="primary-modal-button" onClick={onClose}>
          我知道了
        </button>
      </div>
    </div>
  )
}
