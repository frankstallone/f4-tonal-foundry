import { describe, expect, it } from 'vitest'
import { toColor } from '../color'
import { buildScale } from '../scale'
import { targets } from '../constants'
import {
  blueMixedWhitePointWeights,
  p3Golden,
  primaryHexGolden,
  secondaryGolden,
  weightContract,
} from './fixtures/scale-goldens'

const primarySeed = ['#3366ff']

describe('buildScale', () => {
  it('builds a full scale with locks and anchor', () => {
    const scale = buildScale({ id: 0, semantic: 'primary', keys: primarySeed })

    expect(scale.swatches).toHaveLength(targets.length)
    expect(scale.swatches.map((swatch) => swatch.weight)).toEqual(
      weightContract,
    )
    expect(scale.swatches[0].isLock).toBe(true)
    expect(scale.swatches[scale.swatches.length - 1].isLock).toBe(true)
    expect(scale.swatches.some((swatch) => swatch.isAnchor)).toBe(true)

    primaryHexGolden.representative.forEach((expected) => {
      const swatch = scale.swatches[expected.index]
      expect(swatch.weight).toBe(expected.weight)
      expect(swatch.value.destination).toBe(expected.destination)
      expect(swatch.hex).toBe(expected.hex)
      expect(swatch.isAnchor ?? false).toBe(expected.isAnchor)
      expect(swatch.isLock ?? false).toBe(expected.isLock)
      expect(swatch.wcag_white).toBeCloseTo(expected.wcagWhite, 10)
      expect(swatch.wcag_black).toBeCloseTo(expected.wcagBlack, 10)
      expect(swatch.lab_d65_l).toBeCloseTo(expected.labD65L, 10)
    })
  })

  it('characterizes the mixed-white-point gap for CSS blue', () => {
    const scale = buildScale({ id: 3, semantic: 'blue', keys: ['blue'] })

    expect(scale.swatches.map((swatch) => swatch.weight)).toEqual(
      blueMixedWhitePointWeights,
    )
  })

  it('respects an explicit destination space even for sRGB keys', () => {
    const scale = buildScale(
      { id: 1, semantic: 'primary', keys: primarySeed },
      { destinationSpace: 'oklch' },
    )

    expect(scale.destinationSpace).toBe('oklch')
    expect(
      scale.swatches.some((swatch) =>
        swatch.value.destination.startsWith('oklch('),
      ),
    ).toBe(true)
  })

  it('can produce out-of-srgb swatches when output space is p3', () => {
    const [wideKey] = p3Golden.keys
    expect(toColor(wideKey).inGamut('srgb')).toBe(false)

    const scale = buildScale(
      { id: 2, semantic: 'wide', keys: [wideKey] },
      { destinationSpace: 'p3' },
    )

    expect(scale.destinationSpace).toBe('p3')
    expect(scale.swatches.some((swatch) => swatch.isOutOfGamut)).toBe(true)
    expect(
      scale.swatches.some((swatch) =>
        swatch.value.destination.includes('display-p3'),
      ),
    ).toBe(true)

    p3Golden.representative.forEach((expected) => {
      const swatch = scale.swatches[expected.index]
      expect(swatch.weight).toBe(expected.weight)
      expect(swatch.value.destination).toBe(expected.destination)
      expect(swatch.hex).toBe(expected.hex)
      expect(swatch.isAnchor ?? false).toBe(expected.isAnchor)
      expect(swatch.isOutOfGamut ?? false).toBe(expected.isOutOfSrgb)
    })
  })

  it('preserves every authored secondary key position', () => {
    const scale = buildScale({
      id: 4,
      semantic: secondaryGolden.semantic,
      keys: secondaryGolden.keys,
    })

    secondaryGolden.representative.forEach((expected) => {
      const swatch = scale.swatches[expected.index]
      expect(swatch.weight).toBe(expected.weight)
      expect(swatch.value.destination).toBe(expected.destination)
      expect(swatch.hex).toBe(expected.hex)
      expect(swatch.isAnchor ?? false).toBe(expected.isAnchor)
      expect(swatch.isKey ?? false).toBe(expected.isKey)
    })
  })
})
