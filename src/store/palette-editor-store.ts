import { create } from 'zustand'
import {
  seedPalette,
  type PaletteRecord,
  type OutputSpace,
} from '@/src/lib/palettes'

export type ScaleState = {
  id: number
  name: string
  keys: string[]
}

type PaletteEditorState = {
  paletteId: number
  initializedPaletteId: number | null
  paletteName: string
  outputSpace: OutputSpace
  scaleOrder: number[]
  scales: Record<number, ScaleState>
  stagePalette: (palette: PaletteRecord) => void
  initializePalette: (routeId: number, palette: PaletteRecord) => void
  setPaletteName: (name: string) => void
  setOutputSpace: (space: OutputSpace) => void
  updateScaleName: (id: number, name: string) => void
  addScale: () => void
  duplicateScale: (id: number) => void
  deleteScale: (id: number) => void
  updateKey: (scaleId: number, keyIndex: number, value: string) => void
  addKey: (scaleId: number) => void
  removeKey: (scaleId: number, keyIndex: number) => void
}

const buildScaleState = (palette: PaletteRecord) => {
  const scales: Record<number, ScaleState> = {}
  const scaleOrder: number[] = []

  palette.seed.forEach((scale, index) => {
    const id = scale.index ?? index + 1
    scaleOrder.push(id)
    scales[id] = {
      id,
      name: scale.semantic,
      keys: scale.keys ?? [],
    }
  })

  return { scales, scaleOrder }
}

const buildPaletteState = (palette: PaletteRecord) => {
  const { scales, scaleOrder } = buildScaleState(palette)
  return {
    paletteId: palette.id,
    paletteName: palette.name,
    outputSpace: palette.outputSpace ?? 'auto',
    scales,
    scaleOrder,
  }
}

const initialPaletteState = buildPaletteState(seedPalette)

export const usePaletteEditorStore = create<PaletteEditorState>((set) => ({
  ...initialPaletteState,
  initializedPaletteId: null,
  stagePalette: (palette) => {
    set({
      ...buildPaletteState(palette),
      initializedPaletteId: null,
    })
  },
  initializePalette: (routeId, palette) => {
    if (routeId !== palette.id) return
    set({
      ...buildPaletteState(palette),
      initializedPaletteId: routeId,
    })
  },
  setPaletteName: (paletteName) => set({ paletteName }),
  setOutputSpace: (outputSpace) => set({ outputSpace }),
  updateScaleName: (id, name) =>
    set((state) => ({
      scales: {
        ...state.scales,
        [id]: {
          ...state.scales[id],
          name,
        },
      },
    })),
  addScale: () =>
    set((state) => {
      const nextId = state.scaleOrder.length
        ? Math.max(...state.scaleOrder) + 1
        : 1
      return {
        scaleOrder: [...state.scaleOrder, nextId],
        scales: {
          ...state.scales,
          [nextId]: {
            id: nextId,
            name: `New scale ${nextId}`,
            keys: ['#6366f1'],
          },
        },
      }
    }),
  duplicateScale: (id) =>
    set((state) => {
      const source = state.scales[id]
      if (!source) return state
      const nextId = state.scaleOrder.length
        ? Math.max(...state.scaleOrder) + 1
        : 1
      return {
        scaleOrder: [...state.scaleOrder, nextId],
        scales: {
          ...state.scales,
          [nextId]: {
            id: nextId,
            name: `${source.name} copy`,
            keys: [...source.keys],
          },
        },
      }
    }),
  deleteScale: (id) =>
    set((state) => {
      const rest = { ...state.scales }
      delete rest[id]
      return {
        scaleOrder: state.scaleOrder.filter((scaleId) => scaleId !== id),
        scales: rest,
      }
    }),
  updateKey: (scaleId, keyIndex, value) =>
    set((state) => {
      const scale = state.scales[scaleId]
      if (!scale) return state
      const nextKeys = [...scale.keys]
      nextKeys[keyIndex] = value
      return {
        scales: {
          ...state.scales,
          [scaleId]: {
            ...scale,
            keys: nextKeys,
          },
        },
      }
    }),
  addKey: (scaleId) =>
    set((state) => {
      const scale = state.scales[scaleId]
      if (!scale) return state
      return {
        scales: {
          ...state.scales,
          [scaleId]: {
            ...scale,
            keys: [...scale.keys, '#ffffff'],
          },
        },
      }
    }),
  removeKey: (scaleId, keyIndex) =>
    set((state) => {
      const scale = state.scales[scaleId]
      if (!scale) return state
      return {
        scales: {
          ...state.scales,
          [scaleId]: {
            ...scale,
            keys: scale.keys.filter((_, index) => index !== keyIndex),
          },
        },
      }
    }),
}))
