import type { LevelConfig, RuleIntroConfig } from '../types'

export const ruleIntros: Record<string, RuleIntroConfig> = {
  'target-color-reward': {
    id: 'target-color-reward',
    title: '订单目标',
    description: '把 6 个有颜色的酒杯调成单色满杯。满杯后会被端走，场上只剩空杯就算完成。',
    accent: 'red',
  },
}

export const levels: LevelConfig[] = [
  {
    id: 1,
    name: 'LEVEL 1',
    activeRules: ['standard-pour', 'target-color-reward'],
    introRuleId: 'target-color-reward',
    objectives: [
      {
        id: 'served-count',
        targetColor: 'red',
        targetCompletedBottles: 6,
        rewardIcon: 'juice',
        rewardName: '已端走',
      },
    ],
    board: [
      { id: 'b1', layers: ['red', 'yellow', 'blue', 'red'] },
      { id: 'b2', layers: ['blue', 'red', 'yellow', 'blue'] },
      { id: 'b3', layers: ['yellow', 'blue', 'red', 'yellow'] },
      { id: 'b4', layers: [] },
      { id: 'b5', layers: ['red', 'yellow', 'blue', 'red'] },
      { id: 'b6', layers: ['blue', 'red', 'yellow', 'blue'] },
      { id: 'b7', layers: ['yellow', 'blue', 'red', 'yellow'] },
      { id: 'b8', layers: [] },
    ],
  },
]
