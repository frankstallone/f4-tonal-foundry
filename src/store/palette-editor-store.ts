import { create } from 'zustand'
import type { PaletteRecord } from '@/src/lib/palettes'

export type ScaleState = {
  id: number
  name: string
  keys: string[]
}

type PaletteEditorState = {
  paletteId: number
  paletteName: string
  scaleOrder: number[]
  scales: Record<number, ScaleState>
  setPalette: (palette: PaletteRecord) => void
  setPaletteName: (name: string) => void
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

export const usePaletteEditorStore = create<PaletteEditorState>((set) => ({
  paletteId: 1,
  paletteName: 'Prism',
  scaleOrder: [],
  scales: {},
  setPalette: (palette) => {
    const { scales, scaleOrder } = buildScaleState(palette)
    set({
      paletteId: palette.id,
      paletteName: palette.name,
      scales,
      scaleOrder,
    })
  },
  setPaletteName: (paletteName) => set({ paletteName }),
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
