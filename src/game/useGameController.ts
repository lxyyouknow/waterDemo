import { useEffect, useMemo, useState } from 'react'
import { levels, ruleIntros } from '../data/levels'
import {
  canPourBottle,
  cloneBottleState,
  createLevelState,
  performPour,
} from './engine'
import { evaluateLevelCleared, getRulesForLevel } from './rules'
import { POUR_ANIMATION_CONFIG } from './pourAnimationConfig'
import { loadProgress, saveProgress } from './storage'
import type {
  GameEvent,
  GameSnapshot,
  LevelConfig,
  LiquidColor,
  PourAnimationState,
  ProgressState,
  RewardProgressState,
} from '../types'

function getLevelById(id: number): LevelConfig {
  return levels.find((level) => level.id === id) ?? levels[0]
}

function shuffleLevelBoard(level: LevelConfig): LevelConfig {
  const pool = level.board.flatMap((bottle) => bottle.layers)
  const shuffledPool = [...pool]
  for (let index = shuffledPool.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1))
    ;[shuffledPool[index], shuffledPool[swapIndex]] = [
      shuffledPool[swapIndex],
      shuffledPool[index],
    ]
  }

  return {
    ...level,
    board: level.board.map((bottle) => {
      if (bottle.id === 'b4' || bottle.id === 'b8') {
        return { ...bottle, layers: [] }
      }
      return {
        ...bottle,
        layers: shuffledPool.splice(0, 4),
      }
    }),
  }
}

function buildInitialSnapshot(level: LevelConfig): GameSnapshot {
  const initial = createLevelState(level)
  return {
    bottles: initial.bottles,
    rewardProgress: initial.rewardProgress,
    selectedBottleId: null,
    events: [],
    completed: false,
  }
}

export function useGameController() {
  const initialProgress = useMemo(() => loadProgress(), [])
  const [progress, setProgress] = useState<ProgressState>(initialProgress)
  const [activeLevelId, setActiveLevelId] = useState<number>(1)
  const activeLevel = useMemo(() => getLevelById(activeLevelId), [activeLevelId])
  const [snapshot, setSnapshot] = useState<GameSnapshot>(() =>
    buildInitialSnapshot(getLevelById(1)),
  )
  const [history, setHistory] = useState<GameSnapshot[]>([])
  const [toast, setToast] = useState<string | null>(null)
  const [showVictory, setShowVictory] = useState(false)
  const [servingBottleIds, setServingBottleIds] = useState<string[]>([])
  const [pourAnimation, setPourAnimation] = useState<PourAnimationState | null>(null)
  const [selectedBottlePosition, setSelectedBottlePosition] = useState<{ x: number; y: number } | null>(null)
  const [pendingRuleIntroId, setPendingRuleIntroId] = useState<string | null>(() => {
    const level = getLevelById(1)
    if (level.introRuleId && !initialProgress.seenRuleIntros.includes(level.introRuleId)) {
      return level.introRuleId
    }
    return null
  })

  useEffect(() => {
    saveProgress(progress)
  }, [progress])

  function pushToast(message: string) {
    setToast(message)
    window.setTimeout(() => {
      setToast((current) => (current === message ? null : current))
    }, 1200)
  }

  function persistLevelProgress(levelId: number) {
    setProgress((current) => ({
      ...current,
      currentLevel: levelId,
      unlockedLevel: 1,
    }))
  }

  function resetWithLevel(level: LevelConfig, randomize: boolean) {
    const nextLevel = randomize ? shuffleLevelBoard(level) : level
    setActiveLevelId(1)
    setSnapshot(buildInitialSnapshot(nextLevel))
    setHistory([])
    setShowVictory(false)
    setServingBottleIds([])
    setPourAnimation(null)
    setSelectedBottlePosition(null)
    setPendingRuleIntroId(null)
  }

  function openLevel() {
    persistLevelProgress(1)
    resetWithLevel(getLevelById(1), false)
  }

  function handleBottleClick(bottleId: string, position?: { x: number; y: number }) {
    if (showVictory || pendingRuleIntroId || pourAnimation) {
      return
    }

    const bottle = snapshot.bottles.find((item) => item.id === bottleId)
    if (!bottle) {
      return
    }

    if (!snapshot.selectedBottleId) {
      if (bottle.layers.length === 0) {
        pushToast('先选择一个有酒液的杯子')
        return
      }
      setSelectedBottlePosition(position ?? null)
      setSnapshot((current) => ({ ...current, selectedBottleId: bottleId }))
      return
    }

    if (snapshot.selectedBottleId === bottleId) {
      setSelectedBottlePosition(null)
      setSnapshot((current) => ({ ...current, selectedBottleId: null }))
      return
    }

    const fromBottle = snapshot.bottles.find(
      (item) => item.id === snapshot.selectedBottleId,
    )
    const toBottle = bottle
    if (!fromBottle) {
      return
    }

    const rules = getRulesForLevel(activeLevel)
    const error = canPourBottle(
      fromBottle,
      toBottle,
      {
        bottles: snapshot.bottles,
        fromBottle,
        toBottle,
        level: activeLevel,
      },
      rules,
    )

    if (error) {
      setSelectedBottlePosition(null)
      setSnapshot((current) => ({ ...current, selectedBottleId: null }))
      pushToast(error)
      return
    }

    const baseResult = performPour(snapshot.bottles, fromBottle.id, toBottle.id)
    if (!baseResult.move) {
      setSelectedBottlePosition(null)
      setSnapshot((current) => ({ ...current, selectedBottleId: null }))
      return
    }
    const pouredColor = fromBottle.layers[fromBottle.layers.length - 1] as LiquidColor

    const events: GameEvent[] = []
    let bottles = baseResult.bottles
    let rewardProgress: RewardProgressState[] = snapshot.rewardProgress.map((item) => ({
      ...item,
      completedBottleIds: [...item.completedBottleIds],
      targetQueue: [...item.targetQueue],
    }))

    for (const rule of rules) {
      if (!rule.afterPour) {
        continue
      }
      const output = rule.afterPour({
        bottles,
        level: activeLevel,
        progress: rewardProgress,
        events,
      })
      bottles = output.bottles
      rewardProgress = output.progress
    }

    const completed = evaluateLevelCleared({
      level: activeLevel,
      bottles,
      progress: rewardProgress,
      events,
    })

    const servedIds = events
      .filter((event): event is Extract<GameEvent, { type: 'BottleServed' }> => event.type === 'BottleServed')
      .map((event) => event.bottleId)

    const fromPosition = selectedBottlePosition ?? position ?? { x: 0, y: 0 }
    const toPosition = position ?? { x: 0, y: 0 }

    setHistory((current) => [...current, snapshot])
    setPourAnimation({
      fromBottleId: fromBottle.id,
      toBottleId: toBottle.id,
      color: pouredColor,
      amount: baseResult.move.amount,
      phase: 'move',
      progress: 0,
      fromX: fromPosition.x,
      fromY: fromPosition.y,
      toX: toPosition.x,
      toY: toPosition.y,
    })
    setSelectedBottlePosition(null)

    const moveDuration = POUR_ANIMATION_CONFIG.moveDurationMs
    const pourDuration =
      POUR_ANIMATION_CONFIG.pourBaseDurationMs +
      baseResult.move.amount * POUR_ANIMATION_CONFIG.pourPerLayerDurationMs
    const totalDuration = moveDuration + pourDuration
    window.setTimeout(() => {
      setPourAnimation((current) =>
        current
          ? {
              ...current,
              phase: 'pour',
              progress: 0,
            }
          : current,
      )
    }, moveDuration)

    const pourStartTime = moveDuration
    const progressStepMs = 16
    const progressTimer = window.setInterval(() => {
      setPourAnimation((current) => {
        if (!current || current.phase !== 'pour') {
          return current
        }
        const nextProgress = Math.min(
          1,
          current.progress + progressStepMs / Math.max(pourDuration, progressStepMs),
        )
        return {
          ...current,
          progress: nextProgress,
        }
      })
    }, progressStepMs)

    window.setTimeout(() => {
      window.clearInterval(progressTimer)
    }, pourStartTime + pourDuration)

    window.setTimeout(() => {
      setSnapshot({
        bottles,
        rewardProgress,
        selectedBottleId: null,
        events,
        completed,
      })
      setPourAnimation(null)

      if (completed) {
        setShowVictory(true)
        setProgress((current) => ({
          ...current,
          coins: current.coins + 5,
          currentLevel: 1,
          unlockedLevel: 1,
        }))
      }
    }, totalDuration)

    const servedRevealDelay = 420
    window.setTimeout(() => {
      if (servedIds.length > 0) {
        setServingBottleIds((current) => [...new Set([...current, ...servedIds])])
      }
    }, totalDuration + servedRevealDelay)
  }

  function undoMove() {
    const previous = history[history.length - 1]
    if (!previous) {
      pushToast('还没有可撤回的步骤')
      return
    }

    setHistory((current) => current.slice(0, current.length - 1))
    setServingBottleIds([])
    setPourAnimation(null)
    setSnapshot({
      bottles: previous.bottles.map(cloneBottleState),
      rewardProgress: previous.rewardProgress.map((item) => ({
        ...item,
        targetQueue: [...item.targetQueue],
        completedBottleIds: [...item.completedBottleIds],
      })),
      selectedBottleId: null,
      events: [],
      completed: previous.completed,
    })
  }

  function shuffleReset() {
    resetWithLevel(getLevelById(1), true)
    pushToast('已随机重置第一关')
  }

  function addBottle() {
    pushToast('加杯按钮已预留，功能稍后接入')
  }

  function continueToNextLevel() {
    resetWithLevel(getLevelById(1), true)
  }

  function dismissRuleIntro() {
    if (!pendingRuleIntroId) {
      return
    }
    const ruleId = pendingRuleIntroId
    setProgress((current) => ({
      ...current,
      seenRuleIntros: [...new Set([...current.seenRuleIntros, ruleId])],
    }))
    setPendingRuleIntroId(null)
  }

  return {
    levels,
    activeLevel,
    snapshot,
    toast,
    showVictory,
    servingBottleIds,
    pourAnimation,
    ruleIntro: pendingRuleIntroId ? ruleIntros[pendingRuleIntroId] : null,
    openLevel,
    handleBottleClick,
    undoMove,
    shuffleReset,
    addBottle,
    continueToNextLevel,
    dismissRuleIntro,
  }
}
