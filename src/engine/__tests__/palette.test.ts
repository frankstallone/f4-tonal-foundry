import { describe, expect, it } from 'vitest'
import { buildPalette } from '../palette'
import { targets } from '../constants'

const paletteSeed = [
  { index: 1, semantic: 'primary', keys: ['oklch(52.95% 0.1609 244.63)'] },
  { index: 2, semantic: 'secondary', keys: ['#867356', '#3a2f1e', '#cec6b9'] },
  { index: 3, semantic: 'positive', keys: ['#007c00'] },
  { index: 4, semantic: 'negative', keys: ['#d80000'] },
  { index: 5, semantic: 'highlight', keys: ['#ffc107'] },
  {
    index: 6,
    semantic: 'info',
    keys: ['#035ef9', '#d2e3ff', '#013391', '#0248c3', '#91b9ff'],
  },
  { index: 7, semantic: 'system', keys: ['#0A66D8'] },
  { index: 8, semantic: 'neutral', keys: null },
]

describe('buildPalette', () => {
  it('builds all scales from seed data', () => {
    const palette = buildPalette(paletteSeed)

    expect(palette.values).toHaveLength(paletteSeed.length)
    palette.values.forEach((scale) => {
      expect(scale.swatches).toHaveLength(targets.length)
    })
  })
})
