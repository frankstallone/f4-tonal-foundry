import type { BuildScaleOptions, Palette, PaletteSeed } from './types'
import { buildScale } from './scale'

export const buildPalette = (
  seed: PaletteSeed[],
  options: BuildScaleOptions = {},
): Palette => {
  if (!Array.isArray(seed)) {
    return { values: [] }
  }

  const values = seed.map((entry, index) => {
    const keys = Array.isArray(entry.keys) ? entry.keys : []
    return buildScale(
      {
        id: entry.index ?? index,
        semantic: entry.semantic,
        keys,
      },
      options,
    )
  })

  return { values }
}
