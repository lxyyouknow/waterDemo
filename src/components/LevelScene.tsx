import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { BottleView } from './BottleView'
import { HudBar } from './HudBar'
import { PourEffectOverlay } from './PourEffectOverlay'
import { POUR_ANIMATION_CONFIG } from '../game/pourAnimationConfig'
import { getPourGeometry } from '../game/pourGeometry'
import type { GameSnapshot, LevelConfig, PourAnimationState } from '../types'

interface LevelSceneProps {
  level: LevelConfig
  snapshot: GameSnapshot
  servingBottleIds: string[]
  pourAnimation: PourAnimationState | null
  toast: string | null
  onBottleClick: (bottleId: string, position?: { x: number; y: number }) => void
  onUndo: () => void
  onReset: () => void
  onAddGlass: () => void
}

export function LevelScene({
  level,
  snapshot,
  servingBottleIds,
  pourAnimation,
  toast,
  onBottleClick,
  onUndo,
  onReset,
  onAddGlass,
}: LevelSceneProps) {
  const stageRef = useRef<HTMLDivElement | null>(null)
  const bottleRefs = useRef<Record<string, HTMLButtonElement | null>>({})
  const [stageSize, setStageSize] = useState({ width: 1, height: 1 })

  const visibleBottles = useMemo(
    () =>
      level.board
        .map((config) => snapshot.bottles.find((bottle) => bottle.id === config.id))
        .filter((bottle): bottle is NonNullable<typeof bottle> => Boolean(bottle)),
    [level.board, snapshot.bottles],
  )

  const pourGeometry = useMemo(
    () => (pourAnimation ? getPourGeometry(pourAnimation) : null),
    [pourAnimation],
  )

  useLayoutEffect(() => {
    const stage = stageRef.current
    if (!stage) {
      return
    }

    const updateStageSize = () => {
      const rect = stage.getBoundingClientRect()
      setStageSize((current) =>
        current.width === rect.width && current.height === rect.height
          ? current
          : { width: rect.width, height: rect.height },
      )
    }

    updateStageSize()

    const observer = new ResizeObserver(updateStageSize)
    observer.observe(stage)

    return () => {
      observer.disconnect()
    }
  }, [])

  function getBottlePosition(bottleId: string) {
    const stageRect = stageRef.current?.getBoundingClientRect()
    const element = bottleRefs.current[bottleId]
    if (!stageRect || !element) {
      return undefined
    }
    const rect = element.getBoundingClientRect()
    return {
      x: rect.left - stageRect.left,
      y: rect.top - stageRect.top,
    }
  }

  return (
    <section className="scene-level">
      <div
        className="scene-level-photo"
        style={{ backgroundImage: 'url(/assets/images/nightclub-bartender-bg-1.png)' }}
      />
      <div className="scene-level-photo-overlay" />
      <div className="club-lights club-a" />
      <div className="club-lights club-b" />
      <div className="club-lights club-c" />

      <HudBar level={level} rewardProgress={snapshot.rewardProgress} />

      <div className="bar-stage" ref={stageRef}>
        <PourEffectOverlay animation={pourAnimation} stageSize={stageSize} />
        <div className="bottle-grid">
          {visibleBottles.map((bottle) => (
            <BottleView
              key={bottle.id}
              bottle={bottle}
              selected={snapshot.selectedBottleId === bottle.id}
              serving={servingBottleIds.includes(bottle.id)}
              pouringFrom={pourAnimation?.fromBottleId === bottle.id}
              pouringTo={pourAnimation?.toBottleId === bottle.id}
              pourPreview={
                pourAnimation?.phase === 'pour' && pourAnimation.toBottleId === bottle.id
                  ? {
                      color: pourAnimation.color,
                      progress: pourAnimation.progress,
                      amount: pourAnimation.amount,
                      mode: 'fill',
                    }
                  : pourAnimation?.phase === 'pour' && pourAnimation.fromBottleId === bottle.id
                    ? {
                        color: pourAnimation.color,
                        progress: pourAnimation.progress,
                        amount: pourAnimation.amount,
                        mode: 'drain',
                      }
                    : null
              }
              style={
                pourAnimation?.fromBottleId === bottle.id
                  ? ({
                      ['--pour-target-x' as string]: `${pourGeometry?.translateX ?? 0}px`,
                      ['--pour-target-y' as string]: `${pourGeometry?.translateY ?? 0}px`,
                      ['--pour-rotation' as string]:
                        (pourGeometry?.towardRight ?? true)
                          ? `${POUR_ANIMATION_CONFIG.tiltRightDeg}deg`
                          : `${POUR_ANIMATION_CONFIG.tiltLeftDeg}deg`,
                      ['--pour-phase' as string]: pourAnimation.phase,
                    } as CSSProperties)
                  : undefined
              }
              ref={(node) => {
                bottleRefs.current[bottle.id] = node
              }}
              onClick={() => onBottleClick(bottle.id, getBottlePosition(bottle.id))}
            />
          ))}
        </div>
      </div>

      <div className="bottom-actions">
        <button type="button" className="bottom-action-button" onClick={onUndo}>
          <img
            className="bottom-action-art"
            src="/assets/images/ui/button-icon-undo-test.png"
            alt="Undo"
          />
        </button>
        <button type="button" className="bottom-action-button is-disabled" onClick={onAddGlass}>
          <img
            className="bottom-action-art"
            src="/assets/images/ui/button-icon-add-glass.png"
            alt="Add glass"
          />
        </button>
        <button type="button" className="bottom-action-button" onClick={onReset}>
          <img
            className="bottom-action-art"
            src="/assets/images/ui/button-icon-reset-minimal.png"
            alt="Reset"
          />
        </button>
      </div>

      {toast ? <div className="toast">{toast}</div> : null}
    </section>
  )
}
