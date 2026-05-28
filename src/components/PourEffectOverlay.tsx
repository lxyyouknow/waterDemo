import { colorMap } from '../game/colors'
import { getPourGeometry } from '../game/pourGeometry'
import type { PourAnimationState } from '../types'

interface PourEffectOverlayProps {
  animation: PourAnimationState | null
  stageSize: {
    width: number
    height: number
  }
}

export function PourEffectOverlay({ animation, stageSize }: PourEffectOverlayProps) {
  if (!animation || animation.phase !== 'pour' || stageSize.width <= 1 || stageSize.height <= 1) {
    return null
  }

  const { startX, startY, endX, endY, controlX, controlY } = getPourGeometry(animation)
  const streamColor = colorMap[animation.color]
  const streamPath = `M ${startX} ${startY} Q ${controlX} ${controlY} ${endX} ${endY}`
  const startDropRx = 2 + animation.amount * 0.35
  const startDropRy = 3.2 + animation.amount * 0.45
  const endDropRx = 3.5 + animation.amount * 0.7
  const endDropRy = 5.6 + animation.amount * 1.05

  return (
    <svg
      className="pour-overlay"
      viewBox={`0 0 ${stageSize.width} ${stageSize.height}`}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path
        className="pour-stream pour-stream-glow"
        d={streamPath}
        stroke={streamColor}
      />
      <path
        className="pour-stream"
        d={streamPath}
        stroke={streamColor}
      />
      <path
        className="pour-stream pour-stream-highlight"
        d={streamPath}
        stroke="rgba(255,255,255,0.42)"
      />
      <path
        className="pour-stream pour-stream-tail"
        d={streamPath}
        stroke={streamColor}
      />
      <ellipse
        className="pour-start-drop"
        cx={startX}
        cy={startY}
        rx={startDropRx}
        ry={startDropRy}
        fill={streamColor}
      />
      <ellipse
        className="pour-end-drop"
        cx={endX}
        cy={endY}
        rx={endDropRx}
        ry={endDropRy}
        fill={streamColor}
      />
      <ellipse
        className="pour-splash"
        cx={endX}
        cy={endY + 6}
        rx={8 + animation.amount * 2}
        ry={4 + animation.amount}
        fill={streamColor}
      />
    </svg>
  )
}
