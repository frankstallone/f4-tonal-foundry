import { describe, expect, it } from 'vitest'
import {
  isEditorReady,
  parsePaletteRouteId,
  resolveEditorPalette,
  seedPalette,
  upsertPalette,
  type PaletteRecord,
} from './palettes'

const palette = (
  id: number,
  overrides: Partial<PaletteRecord> = {},
): PaletteRecord => ({
  id,
  name: `Palette ${id}`,
  seed: [
    {
      index: 1,
      semantic: 'primary',
      keys: ['#3366ff'],
    },
  ],
  outputSpace: 'auto',
  ...overrides,
})

describe('parsePaletteRouteId', () => {
  it.each([
    ['1', 1],
    ['42', 42],
    ['9007199254740991', Number.MAX_SAFE_INTEGER],
  ])('accepts canonical route ID %s', (value, expected) => {
    expect(parsePaletteRouteId(value)).toBe(expected)
  })

  it.each([
    undefined,
    null,
    '',
    '0',
    '-1',
    '1.0',
    '1e2',
    '0x10',
    ' 1',
    '1 ',
    '01',
    '9007199254740992',
    ['1'],
  ])('rejects non-canonical route ID %j', (value) => {
    expect(parsePaletteRouteId(value)).toBeNull()
  })
})

describe('resolveEditorPalette', () => {
  it('prefers the stored record for the route ID', () => {
    const stored = palette(2, { name: 'Stored' })
    const staged = palette(2, { name: 'Staged' })

    expect(resolveEditorPalette(2, [palette(1), stored], staged)).toBe(stored)
  })

  it('preserves a same-ID staged Share draft', () => {
    const staged = palette(3, {
      name: 'Shared',
      outputSpace: 'p3',
      seed: [
        { index: 2, semantic: 'secondary', keys: ['#867356', '#3a2f1e'] },
        { index: 1, semantic: 'primary', keys: ['#3366ff'] },
      ],
    })
    const original = JSON.stringify(palette(1))
    const resolved = resolveEditorPalette(3, [palette(1)], staged)
    const saved = upsertPalette(resolved, [palette(1)])

    expect(resolved).toBe(staged)
    expect(saved.find((item) => item.id === 3)).toEqual(staged)
    expect(JSON.stringify(saved.find((item) => item.id === 1))).toBe(original)
  })

  it('ignores a stale draft and creates a route-scoped fallback', () => {
    const resolved = resolveEditorPalette(42, [palette(1)], palette(2))

    expect(resolved.id).toBe(42)
    expect(resolved.name).toBe('Palette 42')
    expect(resolved.seed).toEqual(seedPalette.seed)
    expect(resolved.seed).not.toBe(seedPalette.seed)
  })
})

describe('isEditorReady', () => {
  it.each([
    [1, 1, 1, true],
    [2, 2, 2, true],
    [null, 1, 1, false],
    [1, null, 1, false],
    [1, 1, 2, false],
    [2, 1, 1, false],
    [2, 2, 1, false],
  ] as const)(
    'checks route %s, initialized %s, and store %s',
    (routeId, initializedId, storeId, expected) => {
      expect(isEditorReady(routeId, initializedId, storeId)).toBe(expected)
    },
  )
})
