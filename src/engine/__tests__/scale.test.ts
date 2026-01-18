import { describe, expect, it } from 'vitest'
import { buildScale } from '../scale'
import { targets } from '../constants'

const primarySeed = ['#3366ff']

describe('buildScale', () => {
  it('builds a full scale with locks and anchor', () => {
    const scale = buildScale({ id: 0, semantic: 'primary', keys: primarySeed })

    expect(scale.swatches).toHaveLength(targets.length)
    expect(scale.swatches[0].isLock).toBe(true)
    expect(scale.swatches[scale.swatches.length - 1].isLock).toBe(true)
    expect(scale.swatches.some((swatch) => swatch.isAnchor)).toBe(true)
  })
})
