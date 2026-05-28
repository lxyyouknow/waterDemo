export type LiquidColor =
  | 'red'
  | 'blue'
  | 'yellow'
  | 'orange'
  | 'pink'
  | 'purple'
  | 'cyan'
  | 'green'

export type BottleType = 'normal' | 'frozen' | 'blocked'

export type ObjectiveIcon = 'juice' | 'smoothie' | 'order'

export interface BottleConfig {
  id: string
  layers: LiquidColor[]
  capacity?: number
  type?: BottleType
  tags?: string[]
  statusEffects?: string[]
}

export interface BottleState {
  id: string
  layers: LiquidColor[]
  capacity: number
  type: BottleType
  tags: string[]
  statusEffects: string[]
  completed: boolean
  locked: boolean
  rewardTracked: boolean
  served: boolean
}

export interface ObjectiveConfig {
  id: string
  targetColor: LiquidColor
  targetCompletedBottles: number
  targetQueue?: LiquidColor[]
  rewardIcon: ObjectiveIcon
  rewardName: string
}

export interface RewardProgressState {
  objectiveId: string
  targetColor: LiquidColor
  current: number
  target: number
  percent: number
  rewardIcon: ObjectiveIcon
  rewardName: string
  targetQueue: LiquidColor[]
  currentTargetIndex: number
  completedBottleIds: string[]
}

export interface MoveRecord {
  fromId: string
  toId: string
  amount: number
}

export interface LevelConfig {
  id: number
  name: string
  board: BottleConfig[]
  objectives: ObjectiveConfig[]
  activeRules: string[]
  introRuleId?: string
}

export type SceneId = 'main' | 'level'

export interface ProgressState {
  unlockedLevel: number
  currentLevel: number
  coins: number
  hintCharges: number
  seenRuleIntros: string[]
}

export interface RuleIntroConfig {
  id: string
  title: string
  description: string
  accent: LiquidColor
}

export interface PourAttemptContext {
  bottles: BottleState[]
  fromBottle: BottleState
  toBottle: BottleState
  level: LevelConfig
}

export interface PourResult {
  bottles: BottleState[]
  move: MoveRecord | null
  errors: string[]
  events: GameEvent[]
}

export type GameEvent =
  | {
      type: 'BottleCompleted'
      bottleId: string
      color: LiquidColor
    }
  | {
      type: 'BottleServed'
      bottleId: string
      color: LiquidColor
    }
  | {
      type: 'ObjectiveProgressChanged'
      objectiveId: string
      current: number
      target: number
      percent: number
    }
  | {
      type: 'LevelCleared'
      levelId: number
    }
  | {
      type: 'RuleUnlocked'
      ruleId: string
    }

export interface LevelRule {
  id: string
  canPour?: (context: PourAttemptContext) => string | null
  afterPour?: (params: {
    bottles: BottleState[]
    level: LevelConfig
    progress: RewardProgressState[]
    events: GameEvent[]
  }) => {
    bottles: BottleState[]
    progress: RewardProgressState[]
    events: GameEvent[]
  }
  isLevelCleared?: (params: {
    bottles: BottleState[]
    progress: RewardProgressState[]
    level: LevelConfig
  }) => boolean | null
}

export interface GameSnapshot {
  bottles: BottleState[]
  rewardProgress: RewardProgressState[]
  selectedBottleId: string | null
  events: GameEvent[]
  completed: boolean
}

export interface PourAnimationState {
  fromBottleId: string
  toBottleId: string
  color: LiquidColor
  amount: number
  phase: 'move' | 'pour'
  progress: number
  fromX: number
  fromY: number
  toX: number
  toY: number
}
