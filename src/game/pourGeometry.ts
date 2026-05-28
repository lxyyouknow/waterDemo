import { POUR_ANIMATION_CONFIG } from './pourAnimationConfig'
import type { PourAnimationState } from '../types'

function getBottleNumber(bottleId: string) {
  return Number.parseInt(bottleId.replace(/\D/g, ''), 10)
}

function getBottleRow(bottleId: string) {
  const bottleNumber = getBottleNumber(bottleId)
  return bottleNumber <= 4 ? 0 : 1
}

function getBottleColumn(bottleId: string) {
  const bottleNumber = getBottleNumber(bottleId)
  return (bottleNumber - 1) % 4
}

export function isPouringTowardRight(animation: PourAnimationState) {
  const fromNumber = getBottleNumber(animation.fromBottleId)
  const toNumber = getBottleNumber(animation.toBottleId)
  const fromRow = getBottleRow(animation.fromBottleId)
  const toRow = getBottleRow(animation.toBottleId)
  const fromColumn = getBottleColumn(animation.fromBottleId)
  const toColumn = getBottleColumn(animation.toBottleId)

  if (fromRow === toRow) {
    return toNumber > fromNumber
  }

  if (fromColumn === toColumn) {
    return fromColumn >= 2
  }

  return animation.toX > animation.fromX
}

export function getPourGeometry(animation: PourAnimationState) {
  const towardRight = isPouringTowardRight(animation)
  const parkedX =
    animation.toX +
    (towardRight
      ? -POUR_ANIMATION_CONFIG.parkOffsetRightX
      : POUR_ANIMATION_CONFIG.parkOffsetLeftX)
  const parkedY = animation.toY + POUR_ANIMATION_CONFIG.parkOffsetY
  const translateX = parkedX - animation.fromX
  const translateY = parkedY - animation.fromY
  const rotationDeg = towardRight
    ? POUR_ANIMATION_CONFIG.tiltRightDeg
    : POUR_ANIMATION_CONFIG.tiltLeftDeg
  const mouthLocalX = towardRight
    ? POUR_ANIMATION_CONFIG.mouthLocalRightX
    : POUR_ANIMATION_CONFIG.mouthLocalLeftX
  const mouthLocalY = towardRight
    ? POUR_ANIMATION_CONFIG.mouthLocalRightY
    : POUR_ANIMATION_CONFIG.mouthLocalLeftY
  const rotatedMouthPoint = rotatePoint(
    {
      x: parkedX + mouthLocalX,
      y: parkedY + mouthLocalY,
    },
    {
      x: parkedX + POUR_ANIMATION_CONFIG.bottlePivotX,
      y: parkedY + POUR_ANIMATION_CONFIG.bottlePivotY,
    },
    rotationDeg,
  )
  const startX =
    rotatedMouthPoint.x +
    (towardRight
      ? POUR_ANIMATION_CONFIG.mouthNudgeRightX
      : POUR_ANIMATION_CONFIG.mouthNudgeLeftX)
  const startY =
    rotatedMouthPoint.y +
    (towardRight
      ? POUR_ANIMATION_CONFIG.mouthNudgeRightY
      : POUR_ANIMATION_CONFIG.mouthNudgeLeftY)
  const endX =
    animation.toX +
    (towardRight
      ? POUR_ANIMATION_CONFIG.targetLocalRightX
      : POUR_ANIMATION_CONFIG.targetLocalLeftX)
  const endY = animation.toY + POUR_ANIMATION_CONFIG.targetLocalY
  const controlX =
    (startX + endX) / 2 +
    (towardRight
      ? POUR_ANIMATION_CONFIG.controlPullRightX
      : -POUR_ANIMATION_CONFIG.controlPullLeftX)
  const controlY = Math.min(startY, endY) + POUR_ANIMATION_CONFIG.controlLiftY

  return {
    towardRight,
    parkedX,
    parkedY,
    translateX,
    translateY,
    startX,
    startY,
    endX,
    endY,
    controlX,
    controlY,
  }
}

function rotatePoint(
  point: { x: number; y: number },
  pivot: { x: number; y: number },
  degrees: number,
) {
  // CSS 鍦ㄥ睆骞曞潗鏍囬噷姝ｈ搴︽槸椤烘椂閽堬紝杩欓噷鍙栧弽鍚庡啀璧板父瑙勬棆杞叕寮?
  const radians = (-degrees * Math.PI) / 180
  const dx = point.x - pivot.x
  const dy = point.y - pivot.y

  return {
    x: pivot.x + dx * Math.cos(radians) - dy * Math.sin(radians),
    y: pivot.y + dx * Math.sin(radians) + dy * Math.cos(radians),
  }
}
