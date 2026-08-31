import { beforeEach, describe, expect, it } from 'vitest'
import { seedPalette, type PaletteRecord } from '@/src/lib/palettes'
import { usePaletteEditorStore } from './palette-editor-store'

const draftPalette: PaletteRecord = {
  id: 2,
  name: 'Draft Palette',
  outputSpace: 'p3',
  seed: [
    { index: 4, semantic: 'secondary', keys: ['#867356', '#3a2f1e'] },
    { index: 1, semantic: 'primary', keys: ['#3366ff'] },
  ],
}

const editorSnapshot = () => {
  const state = usePaletteEditorStore.getState()
  return {
    paletteId: state.paletteId,
    initializedPaletteId: state.initializedPaletteId,
    paletteName: state.paletteName,
    outputSpace: state.outputSpace,
    scaleOrder: state.scaleOrder,
    scales: state.scales,
  }
}

describe('palette editor transitions', () => {
  beforeEach(() => {
    usePaletteEditorStore.getState().stagePalette(seedPalette)
  })

  it('stages the draft and clears editor readiness', () => {
    usePaletteEditorStore.getState().initializePalette(1, seedPalette)

    usePaletteEditorStore.getState().stagePalette(draftPalette)

    expect(editorSnapshot()).toEqual({
      paletteId: 2,
      initializedPaletteId: null,
      paletteName: 'Draft Palette',
      outputSpace: 'p3',
      scaleOrder: [4, 1],
      scales: {
        4: {
          id: 4,
          name: 'secondary',
          keys: ['#867356', '#3a2f1e'],
        },
        1: { id: 1, name: 'primary', keys: ['#3366ff'] },
      },
    })
  })

  it('initializes a matching route and Palette atomically', () => {
    const notifications: ReturnType<typeof editorSnapshot>[] = []
    const unsubscribe = usePaletteEditorStore.subscribe(() => {
      notifications.push(editorSnapshot())
    })

    usePaletteEditorStore.getState().initializePalette(2, draftPalette)
    unsubscribe()

    expect(notifications).toHaveLength(1)
    expect(notifications[0]).toEqual({
      paletteId: 2,
      initializedPaletteId: 2,
      paletteName: 'Draft Palette',
      outputSpace: 'p3',
      scaleOrder: [4, 1],
      scales: {
        4: {
          id: 4,
          name: 'secondary',
          keys: ['#867356', '#3a2f1e'],
        },
        1: { id: 1, name: 'primary', keys: ['#3366ff'] },
      },
    })
  })

  it('ignores initialization when route and Palette IDs differ', () => {
    usePaletteEditorStore.getState().stagePalette(draftPalette)
    const before = usePaletteEditorStore.getState()

    usePaletteEditorStore.getState().initializePalette(3, draftPalette)

    expect(usePaletteEditorStore.getState()).toBe(before)
  })
})
