import type { PaletteSeed } from '@/src/engine'

export type PaletteRecord = {
  id: number
  name: string
  seed: PaletteSeed[]
}

const storageKey = 'prismcolor:palettes'

export const seedPalette: PaletteRecord = {
  id: 1,
  name: 'Prism',
  seed: [
    { index: 1, semantic: 'primary', keys: ['oklch(52.95% 0.1609 244.63)'] },
    {
      index: 2,
      semantic: 'secondary',
      keys: ['#867356', '#3a2f1e', '#cec6b9'],
    },
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
  ],
}

const getDefaultPalettes = (): PaletteRecord[] => [seedPalette]

export const loadPalettes = (): PaletteRecord[] => {
  if (typeof window === 'undefined') return getDefaultPalettes()
  try {
    const raw = window.localStorage.getItem(storageKey)
    if (!raw) return getDefaultPalettes()
    const parsed = JSON.parse(raw) as PaletteRecord[]
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return getDefaultPalettes()
    }
    return parsed
  } catch {
    return getDefaultPalettes()
  }
}

export const savePalettes = (palettes: PaletteRecord[]) => {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(storageKey, JSON.stringify(palettes))
}

export const upsertPalette = (
  palette: PaletteRecord,
  palettes?: PaletteRecord[],
) => {
  const next = palettes ? [...palettes] : loadPalettes()
  const index = next.findIndex((item) => item.id === palette.id)
  if (index >= 0) {
    next[index] = palette
  } else {
    next.push(palette)
  }
  savePalettes(next)
  return next
}

export const deletePalette = (id: number, palettes?: PaletteRecord[]) => {
  const next = (palettes ? [...palettes] : loadPalettes()).filter(
    (palette) => palette.id !== id,
  )
  savePalettes(next.length ? next : getDefaultPalettes())
  return next
}

export const createPaletteRecord = (
  palettes: PaletteRecord[],
): PaletteRecord => {
  const nextId = palettes.length
    ? Math.max(...palettes.map((palette) => palette.id)) + 1
    : 1
  return {
    id: nextId,
    name: `New Palette ${nextId}`,
    seed: [
      {
        index: 1,
        semantic: 'Scale 1',
        keys: ['#6366f1'],
      },
    ],
  }
}
