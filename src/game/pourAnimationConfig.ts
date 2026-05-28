export const POUR_ANIMATION_CONFIG = {
  // 源杯移动到倒水位置的时长
  moveDurationMs: 240,
  // 倒水基础时长
  pourBaseDurationMs: 360,
  // 每多倒一层，额外增加的倒水时长
  pourPerLayerDurationMs: 110,

  // 向右倒水时，源杯停在目标杯左上方的水平偏移
  parkOffsetRightX: 110,
  // 向左倒水时，源杯停在目标杯右上方的水平偏移
  parkOffsetLeftX: 110,
  // 源杯停靠时，相对目标杯顶部的垂直偏移
  // 数值越小，源杯停得越高
  parkOffsetY: -68,

  // 杯子倾斜角度
  tiltRightDeg: 28,
  tiltLeftDeg: -28,

  // 杯子旋转中心，需和 `.bottle` 的 transform-origin 对齐
  bottlePivotX: 46,
  bottlePivotY: 144,

  // 杯子未旋转时，左右杯口的局部坐标
  mouthLocalRightX: 79,
  mouthLocalRightY: 18,
  mouthLocalLeftX: 13,
  mouthLocalLeftY: 18,

  // 起点微调：水从杯口出来的位置
  // X：正数往右，负数往左
  // Y：正数往下，负数往上
  mouthNudgeRightX: 100,
  mouthNudgeRightY: 20,
  mouthNudgeLeftX: -100,
  mouthNudgeLeftY: 20,

  // 终点微调：水落进目标杯内的位置
  // Right / Left 表示当前倒水方向
  targetLocalRightX: 18,
  targetLocalLeftX: 38,
  // 数值越大，落点越靠下
  targetLocalY: 75,

  // 贝塞尔控制点微调，影响水流弧线
  controlPullRightX: 10,
  controlPullLeftX: 10,
  controlLiftY: -30,
} as const
