import type { ProgressState } from '../types'

const STORAGE_KEY = 'water-pouring-puzzle-progress'

const defaultProgress: ProgressState = {
  unlockedLevel: 1,
  currentLevel: 1,
  coins: 10,
  hintCharges: 5,
  seenRuleIntros: [],
}

export function loadProgress(): ProgressState {
  const rawValue = localStorage.getItem(STORAGE_KEY)
  if (!rawValue) {
    return defaultProgress
  }

  try {
    const parsed = JSON.parse(rawValue) as Partial<ProgressState>
    return {
      ...defaultProgress,
      ...parsed,
      seenRuleIntros: parsed.seenRuleIntros ?? [],
    }
  } catch {
    return defaultProgress
  }
}

export function saveProgress(progress: ProgressState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
}
