import { describe, expect, it } from 'vitest'
import { levels } from '../data/levels'
import {
  canPourBottle,
  createLevelState,
  performPour,
} from './engine'
import {
  evaluateLevelCleared,
  getRulesForLevel,
  standardPourRule,
  targetColorRewardRule,
} from './rules'
import type { BottleState, RewardProgressState } from '../types'

describe('pouring engine', () => {
  it('allows pouring into empty bottle', () => {
    const level = levels[0]
    const state = createLevelState(level)
    const fromBottle = state.bottles[0]
    const toBottle = state.bottles[3]
    const error = canPourBottle(
      fromBottle,
      toBottle,
      { bottles: state.bottles, fromBottle, toBottle, level },
      getRulesForLevel(level),
    )
    expect(error).toBeNull()
  })

  it('moves only contiguous top layers', () => {
    const level = levels[0]
    const state = createLevelState(level)
    const result = performPour(state.bottles, 'b1', 'b4')
    expect(result.move?.amount).toBe(1)
    expect(result.bottles.find((bottle) => bottle.id === 'b4')?.layers).toEqual(['red'])
  })

  it('prevents pouring into a different top color', () => {
    const level = levels[0]
    const state = createLevelState(level)
    const customBottles = state.bottles.map((bottle) => ({ ...bottle }))
    customBottles[0].layers = ['red']
    customBottles[1].layers = ['blue']
    const fromBottle = customBottles[0]
    const toBottle = customBottles[1]
    const error = canPourBottle(
      fromBottle,
      toBottle,
      { bottles: customBottles, fromBottle, toBottle, level },
      getRulesForLevel(level),
    )
    expect(error).toBe('只能倒进同色或空杯')
  })

  it('recognizes solved state when all colored cups have been served', () => {
    const level = levels[0]
    const state = createLevelState(level)
    const bottles: BottleState[] = state.bottles.map((bottle) => ({
      ...bottle,
      layers: [],
      completed: false,
      served: ['b1', 'b2', 'b3', 'b4', 'b5', 'b6'].includes(bottle.id),
    }))
    const rewardProgress: RewardProgressState[] = [
      {
        ...state.rewardProgress[0],
        current: 6,
        target: 6,
        percent: 100,
        currentTargetIndex: 6,
        completedBottleIds: ['b1', 'b2', 'b3', 'b4', 'b5', 'b6'],
      },
    ]
    const events: Array<{ type: string }> = []
    const cleared = evaluateLevelCleared({
      level,
      bottles,
      progress: rewardProgress,
      events: events as never[],
    })
    expect(cleared).toBe(true)
  })

  it('increments progress by one when a single cup is served', () => {
    const level = levels[0]
    const state = createLevelState(level)
    const servedBottle: BottleState = {
      ...state.bottles[0],
      layers: ['red', 'red', 'red', 'red'],
      completed: false,
      served: false,
    }

    const events: Array<{ type: string; current?: number; percent?: number }> = []
    const afterCompletion = standardPourRule.afterPour?.({
      bottles: [servedBottle, ...state.bottles.slice(1)],
      progress: state.rewardProgress,
      level,
      events: events as never[],
    })

    const afterProgress = targetColorRewardRule.afterPour?.({
      bottles: afterCompletion?.bottles ?? state.bottles,
      progress: afterCompletion?.progress ?? state.rewardProgress,
      level,
      events: events as never[],
    })

    expect(afterProgress?.progress[0].current).toBe(1)
    expect(afterProgress?.progress[0].target).toBe(6)
    expect(afterProgress?.progress[0].percent).toBe(Math.round((1 / 6) * 100))
  })
})
