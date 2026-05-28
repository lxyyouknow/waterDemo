import type {
  BottleConfig,
  BottleState,
  LevelConfig,
  LevelRule,
  MoveRecord,
  ObjectiveConfig,
  PourAttemptContext,
  RewardProgressState,
} from '../types'

const DEFAULT_CAPACITY = 4

export function createBottleState(config: BottleConfig): BottleState {
  const capacity = config.capacity ?? DEFAULT_CAPACITY
  return {
    id: config.id,
    layers: [...config.layers],
    capacity,
    type: config.type ?? 'normal',
    tags: [...(config.tags ?? [])],
    statusEffects: [...(config.statusEffects ?? [])],
    completed: isBottleCompleted(config.layers, capacity),
    locked: config.type === 'frozen' || (config.statusEffects ?? []).includes('locked'),
    rewardTracked: false,
    served: false,
  }
}

export function cloneBottleState(bottle: BottleState): BottleState {
  return {
    ...bottle,
    layers: [...bottle.layers],
    tags: [...bottle.tags],
    statusEffects: [...bottle.statusEffects],
  }
}

export function createRewardProgress(objective: ObjectiveConfig): RewardProgressState {
  const targetQueue =
    objective.targetQueue && objective.targetQueue.length > 0
      ? [...objective.targetQueue]
      : Array.from({ length: objective.targetCompletedBottles }, () => objective.targetColor)

  return {
    objectiveId: objective.id,
    targetColor: objective.targetColor,
    current: 0,
    target: objective.targetCompletedBottles,
    percent: 0,
    rewardIcon: objective.rewardIcon,
    rewardName: objective.rewardName,
    targetQueue,
    currentTargetIndex: 0,
    completedBottleIds: [],
  }
}

export function isBottleCompleted(layers: string[], capacity: number): boolean {
  if (layers.length !== capacity || layers.length === 0) {
    return false
  }
  return layers.every((layer) => layer === layers[0])
}

export function getTopColor(bottle: BottleState): string | null {
  if (bottle.layers.length === 0) {
    return null
  }
  return bottle.layers[bottle.layers.length - 1]
}

export function countContiguousTopLayers(bottle: BottleState): number {
  const topColor = getTopColor(bottle)
  if (!topColor) {
    return 0
  }

  let amount = 0
  for (let index = bottle.layers.length - 1; index >= 0; index -= 1) {
    if (bottle.layers[index] !== topColor) {
      break
    }
    amount += 1
  }
  return amount
}

export function getRemainingCapacity(bottle: BottleState): number {
  return bottle.capacity - bottle.layers.length
}

export function canPourBottle(
  fromBottle: BottleState,
  toBottle: BottleState,
  context: PourAttemptContext,
  rules: LevelRule[],
): string | null {
  if (fromBottle.id === toBottle.id) {
    return '同一个杯子不能互相倒酒'
  }
  if (fromBottle.layers.length === 0) {
    return '空杯里没有酒液'
  }
  if (fromBottle.served || toBottle.served) {
    return '已端走的酒杯不能再操作'
  }
  if (toBottle.layers.length >= toBottle.capacity) {
    return '目标杯已经装满'
  }

  const fromTopColor = getTopColor(fromBottle)
  const toTopColor = getTopColor(toBottle)
  if (toTopColor && fromTopColor !== toTopColor) {
    return '只能倒进同色或空杯'
  }

  for (const rule of rules) {
    const error = rule.canPour?.(context)
    if (error) {
      return error
    }
  }

  return null
}

export function performPour(
  bottles: BottleState[],
  fromId: string,
  toId: string,
): { bottles: BottleState[]; move: MoveRecord | null } {
  const nextBottles = bottles.map(cloneBottleState)
  const fromBottle = nextBottles.find((item) => item.id === fromId)
  const toBottle = nextBottles.find((item) => item.id === toId)

  if (!fromBottle || !toBottle) {
    return { bottles: nextBottles, move: null }
  }

  const amount = Math.min(
    countContiguousTopLayers(fromBottle),
    getRemainingCapacity(toBottle),
  )

  if (amount <= 0) {
    return { bottles: nextBottles, move: null }
  }

  const movedLayers = fromBottle.layers.splice(fromBottle.layers.length - amount, amount)
  toBottle.layers.push(...movedLayers)

  return {
    bottles: nextBottles,
    move: { fromId, toId, amount },
  }
}

export function createLevelState(level: LevelConfig): {
  bottles: BottleState[]
  rewardProgress: RewardProgressState[]
} {
  return {
    bottles: level.board.map(createBottleState),
    rewardProgress: level.objectives.map(createRewardProgress),
  }
}
