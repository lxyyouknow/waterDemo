import { forwardRef } from 'react'
import type { CSSProperties } from 'react'
import { colorMap } from '../game/colors'
import neonCocktailGlass from '../assets/neon-cocktail-glass.svg'
import type { BottleState, LiquidColor } from '../types'

const LIQUID_LAYER_HEIGHT = 25

interface BottleViewProps {
  bottle: BottleState
  selected: boolean
  serving: boolean
  pouringFrom: boolean
  pouringTo: boolean
  pourPreview?: {
    color: LiquidColor
    progress: number
    amount: number
    mode: 'fill' | 'drain'
  } | null
  style?: CSSProperties
  onClick: () => void
}

export const BottleView = forwardRef<HTMLButtonElement, BottleViewProps>(function BottleView(
  {
    bottle,
    selected,
    serving,
    pouringFrom,
    pouringTo,
    pourPreview,
    style,
    onClick,
  },
  ref,
) {
  const baseGroupedLayers = bottle.layers.reduce<Array<{ color: LiquidColor; size: number }>>(
    (groups, layer) => {
      const lastGroup = groups[groups.length - 1]
      if (lastGroup && lastGroup.color === layer) {
        lastGroup.size += 1
      } else {
        groups.push({ color: layer, size: 1 })
      }
      return groups
    },
    [],
  )

  const previewHeight =
    pourPreview && pourPreview.progress > 0
      ? Math.min(
          pourPreview.mode === 'fill'
            ? (bottle.capacity - bottle.layers.length) * LIQUID_LAYER_HEIGHT
            : pourPreview.amount * LIQUID_LAYER_HEIGHT,
          pourPreview.amount * LIQUID_LAYER_HEIGHT * pourPreview.progress,
        )
      : 0

  const groupedLayers = baseGroupedLayers.map((group) => ({
    color: group.color,
    height: group.size * LIQUID_LAYER_HEIGHT,
  }))

  if (previewHeight > 0 && pourPreview) {
    const lastGroup = groupedLayers[groupedLayers.length - 1]
    if (pourPreview.mode === 'drain') {
      if (lastGroup && lastGroup.color === pourPreview.color) {
        lastGroup.height = Math.max(0, lastGroup.height - previewHeight)
        if (lastGroup.height <= 0) {
          groupedLayers.pop()
        }
      }
    } else {
      if (lastGroup && lastGroup.color === pourPreview.color) {
        lastGroup.height += previewHeight
      } else {
        groupedLayers.push({
          color: pourPreview.color,
          height: previewHeight,
        })
      }
    }
  }

  return (
    <button
      ref={ref}
      type="button"
      className={[
        'bottle',
        selected ? 'is-selected' : '',
        bottle.completed ? 'is-completed' : '',
        bottle.locked ? 'is-locked' : '',
        bottle.served && serving ? 'is-served' : '',
        serving ? 'is-serving' : '',
        pouringFrom ? 'is-pouring-from' : '',
        pouringTo ? 'is-pouring-to' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      style={style}
      onClick={onClick}
      disabled={bottle.served && !serving}
    >
      <span className="bottle-glass">
        <span
          className={[
            'bottle-liquid',
            pourPreview?.mode === 'drain' ? 'is-draining' : '',
            pourPreview?.mode === 'fill' ? 'is-filling' : '',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          <span className="bottle-liquid-stack">
            {groupedLayers.map((group, index) => (
              <span
                key={`${bottle.id}-${group.color}-${index}`}
                className={[
                  'liquid-layer',
                  index === 0 ? 'is-bottom' : '',
                  index === groupedLayers.length - 1 ? 'is-top' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                style={{
                  background: colorMap[group.color],
                  height: `${group.height}px`,
                }}
              >
                {index === groupedLayers.length - 1 ? (
                  <span
                    className="liquid-top-surface"
                    style={{
                      background: colorMap[group.color],
                      ['--surface-wave-strength' as string]: `${
                        pourPreview ? Math.min(1, 0.35 + pourPreview.progress * 0.65) : 0
                      }`,
                    }}
                  />
                ) : null}
              </span>
            ))}
          </span>
        </span>
        <img className="bottle-frame-art" src={neonCocktailGlass} alt="" aria-hidden="true" />
      </span>
      {bottle.locked ? <span className="bottle-lock">冰封</span> : null}
    </button>
  )
})
