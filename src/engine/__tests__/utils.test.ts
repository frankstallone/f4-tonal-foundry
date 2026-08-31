import { describe, expect, it } from 'vitest'
import { labD65LightnessToTarget, labD65LightnessToWeight } from '../utils'

describe('Lab D65 lightness mapping', () => {
  it.each([
    { lightness: 100, target: 100, weight: '000' },
    { lightness: 98.75, target: 100, weight: '000' },
    { lightness: 98.749, target: 97.5, weight: '025' },
    { lightness: 52.5, target: 55, weight: '450' },
    { lightness: 52.499, target: 50, weight: '500' },
    { lightness: 2.5, target: 5, weight: '950' },
    { lightness: 2.499, target: 0, weight: '999' },
    { lightness: 0, target: 0, weight: '999' },
  ])(
    'maps L* $lightness to target $target and weight $weight',
    ({ lightness, target, weight }) => {
      expect(labD65LightnessToTarget(lightness)).toBe(target)
      expect(labD65LightnessToWeight(lightness)).toBe(weight)
    },
  )
})
