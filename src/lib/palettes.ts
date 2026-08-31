import type { PaletteSeed } from '@/src/engine'

export type OutputSpace = 'auto' | 'srgb' | 'oklch' | 'p3'

export type PaletteRecord = {
  id: number
  name: string
  seed: PaletteSeed[]
  outputSpace?: OutputSpace
}

const storageKey = 'tonalfoundry:palettes'
const legacyStorageKey = 'prismcolor:palettes'

const defaultOutputSpace: OutputSpace = 'auto'

const normalizePalette = (palette: PaletteRecord): PaletteRecord => ({
  ...palette,
  outputSpace: palette.outputSpace ?? defaultOutputSpace,
})

export const seedPalette: PaletteRecord = normalizePalette({
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
})

export const parsePaletteRouteId = (value: unknown): number | null => {
  if (typeof value !== 'string' || !/^[1-9]\d*$/.test(value)) return null
  const id = Number(value)
  return Number.isSafeInteger(id) ? id : null
}

export const resolveEditorPalette = (
  routeId: number,
  stored: PaletteRecord[],
  staged: PaletteRecord | null,
): PaletteRecord => {
  const storedPalette = stored.find((palette) => palette.id === routeId)
  if (storedPalette) return storedPalette
  if (staged?.id === routeId) return staged

  return {
    ...seedPalette,
    id: routeId,
    name: `Palette ${routeId}`,
    seed: seedPalette.seed.map((scale) => ({
      ...scale,
      keys: scale.keys ? [...scale.keys] : null,
    })),
  }
}

export const isEditorReady = (
  routeId: number | null,
  initializedPaletteId: number | null,
  paletteId: number,
) =>
  routeId !== null && routeId === initializedPaletteId && routeId === paletteId

const getDefaultPalettes = (): PaletteRecord[] => [seedPalette]

export const loadPalettes = (): PaletteRecord[] => {
  if (typeof window === 'undefined') return getDefaultPalettes()
  try {
    const raw = window.localStorage.getItem(storageKey)
    const fallback = raw ?? window.localStorage.getItem(legacyStorageKey)
    if (!fallback) return getDefaultPalettes()
    const parsed = JSON.parse(fallback) as PaletteRecord[]
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return getDefaultPalettes()
    }
    const normalized = parsed.map(normalizePalette)
    if (!raw) {
      savePalettes(normalized)
    }
    return normalized
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
  const normalized = normalizePalette(palette)
  const next = palettes ? [...palettes] : loadPalettes()
  const index = next.findIndex((item) => item.id === normalized.id)
  if (index >= 0) {
    next[index] = normalized
  } else {
    next.push(normalized)
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
  return normalizePalette({
    id: nextId,
    name: `New Palette ${nextId}`,
    seed: [
      {
        index: 1,
        semantic: 'Scale 1',
        keys: ['#6366f1'],
      },
    ],
  })
}
