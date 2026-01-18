import Color from 'colorjs.io'
import { targets } from './constants'
import type { BuildScaleOptions, ColorInput, Scale, Swatch } from './types'
import { toColor } from './color'
import { buildSwatch } from './swatch'

export interface BuildScaleInput {
  id: number
  semantic: string
  keys: ColorInput[]
}

const fillWithTweenedSwatches = (
  swatches: Array<Swatch | null>,
  destinationSpace: string,
  tweenSpace: string,
  stepsDeltaE: number,
) => {
  const candidateSwatches: Color[] = []
  const tween = swatches.filter(Boolean) as Swatch[]

  for (let i = 0; i + 1 < tween.length; i += 1) {
    const start = toColor(tween[i].color)
    const stop = toColor(tween[i + 1].color)
    const range = Color.range(start, stop, {
      space: tweenSpace,
      outputSpace: tweenSpace,
    })
    const steps = Color.steps(range, { maxDeltaE: stepsDeltaE })
    steps.forEach((item) => {
      candidateSwatches.push(new Color(tweenSpace, item.coords))
    })
  }

  return swatches.map((swatch, idx) => {
    if (swatch) return swatch
    let target = targets[idx]
    if (target === 50) {
      target = target - 0.25
    }
    const color = candidateSwatches.reduce((prev, curr) => {
      return Math.abs(curr.lab_d65.l - target) <
        Math.abs(prev.lab_d65.l - target)
        ? curr
        : prev
    })

    return buildSwatch({ color, destinationSpace, isKey: false })
  })
}

export const buildScale = (
  { id, semantic, keys }: BuildScaleInput,
  options: BuildScaleOptions = {},
): Scale => {
  const stepsDeltaE = options.stepsDeltaE ?? 0.5
  const tweenSpace = options.tweenSpace ?? 'oklch'

  const initialSwatches: Array<Swatch | null> = Array.from(
    { length: targets.length },
    () => null,
  )
  const colors = keys.map((value) =>
    typeof value === 'string' ? toColor(value) : toColor(value),
  )
  let destinationSpace = options.destinationSpace ?? 'srgb'

  if (colors.length) {
    destinationSpace = colors[0].space.id
  }

  colors.forEach((color, index) => {
    const swatch = buildSwatch({
      color,
      destinationSpace,
      priority: colors.length - index,
      isKey: index === 0 ? false : true,
      isAnchor: index === 0 ? true : false,
    })
    initialSwatches[swatch.index] = swatch
  })

  if (!initialSwatches[0]) {
    const color = new Color('White')
    initialSwatches[0] = buildSwatch({ color, destinationSpace, isLock: true })
  }

  const lastIndex = targets.length - 1
  if (!initialSwatches[lastIndex]) {
    const color = new Color('Black')
    initialSwatches[lastIndex] = buildSwatch({
      color,
      destinationSpace,
      isLock: true,
    })
  }

  const swatches = fillWithTweenedSwatches(
    initialSwatches,
    destinationSpace,
    tweenSpace,
    stepsDeltaE,
  )

  return {
    id,
    semantic,
    swatches,
    stepsDeltaE,
    tweenSpace,
    destinationSpace,
  }
}
