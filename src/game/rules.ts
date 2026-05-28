import { cloneBottleState, isBottleCompleted } from './engine'
import type { BottleState, GameEvent, LevelConfig, LevelRule, RewardProgressState } from '../types'

function updateBottleCompletion(
  bottles: BottleState[],
  events: GameEvent[],
): BottleState[] {
  return bottles.map((bottle) => {
    const nextBottle = cloneBottleState(bottle)

    if (nextBottle.served) {
      return nextBottle
    }

    const nowCompleted = isBottleCompleted(nextBottle.layers, nextBottle.capacity)
    if (nowCompleted && !nextBottle.completed) {
      nextBottle.completed = true
      events.push({
        type: 'BottleCompleted',
        bottleId: nextBottle.id,
        color: nextBottle.layers[0],
      })
      events.push({
        type: 'BottleServed',
        bottleId: nextBottle.id,
        color: nextBottle.layers[0],
      })
      nextBottle.served = true
    } else if (!nowCompleted) {
      nextBottle.completed = false
    }

    return nextBottle
  })
}

function updateRewardProgress(
  bottles: BottleState[],
  progress: RewardProgressState[],
  events: GameEvent[],
): RewardProgressState[] {
  return progress.map((objective) => {
    const matchedBottleIds = bottles
      .filter((bottle) => bottle.served)
      .map((bottle) => bottle.id)

    const current = Math.min(matchedBottleIds.length, objective.target)
    const percent = Math.round((current / objective.target) * 100)
    if (current !== objective.current) {
      events.push({
        type: 'ObjectiveProgressChanged',
        objectiveId: objective.objectiveId,
        current,
        target: objective.target,
        percent,
      })
    }

    return {
      ...objective,
      current,
      percent,
      currentTargetIndex: current,
      completedBottleIds: matchedBottleIds,
    }
  })
}

export const standardPourRule: LevelRule = {
  id: 'standard-pour',
  afterPour: ({ bottles, progress, events }) => ({
    bottles: updateBottleCompletion(bottles, events),
    progress,
    events,
  }),
  isLevelCleared: ({ bottles }) => bottles.every((bottle) => bottle.served || bottle.layers.length === 0),
}

export const targetColorRewardRule: LevelRule = {
  id: 'target-color-reward',
  afterPour: ({ bottles, progress, events }) => ({
    bottles,
    progress: updateRewardProgress(bottles, progress, events),
    events,
  }),
  isLevelCleared: ({ progress, bottles }) => {
    const objectivesMet = progress.every((item) => item.current >= item.target)
    return objectivesMet && bottles.every((bottle) => bottle.served || bottle.layers.length === 0)
  },
}

export const ruleRegistry: Record<string, LevelRule> = {
  'standard-pour': standardPourRule,
  'target-color-reward': targetColorRewardRule,
}

export function getRulesForLevel(level: LevelConfig): LevelRule[] {
  return level.activeRules.map((ruleId) => ruleRegistry[ruleId]).filter(Boolean)
}

export function evaluateLevelCleared(params: {
  level: LevelConfig
  bottles: BottleState[]
  progress: RewardProgressState[]
  events: GameEvent[]
}): boolean {
  const rules = getRulesForLevel(params.level)
  const decisions = rules
    .map((rule) =>
      rule.isLevelCleared?.({
        bottles: params.bottles,
        progress: params.progress,
        level: params.level,
      }) ?? null,
    )
    .filter((value): value is boolean => value !== null)

  const cleared = decisions.length > 0 ? decisions.every(Boolean) : false
  if (cleared) {
    params.events.push({
      type: 'LevelCleared',
      levelId: params.level.id,
    })
  }
  return cleared
}
