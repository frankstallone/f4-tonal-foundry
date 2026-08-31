import { describe, expect, it } from 'vitest'
import { buildScale } from '@/src/engine/scale'
import { buildDtcgTokens } from './share'

const inheritedNames = [
  '__proto__',
  'constructor',
  'prototype',
  'toString',
  'hasOwnProperty',
]

const ambientTargets = [
  Object,
  Object.prototype,
  Object.prototype.toString,
  Object.prototype.hasOwnProperty,
]

type AmbientSnapshot = Array<{
  target: object
  descriptors: PropertyDescriptorMap
}>

const captureAmbient = (): AmbientSnapshot =>
  ambientTargets.map((target) => ({
    target,
    descriptors: Object.getOwnPropertyDescriptors(target),
  }))

const restoreAmbient = (snapshot: AmbientSnapshot) => {
  snapshot.forEach(({ target, descriptors }) => {
    Reflect.ownKeys(target).forEach((key) => {
      if (!Object.hasOwn(descriptors, key)) {
        Reflect.deleteProperty(target, key)
      }
    })
    Object.defineProperties(target, descriptors)
  })
}

const makeScale = (semantic: string) => {
  const scale = buildScale({ id: 1, semantic, keys: ['#3366ff'] })
  const anchor = scale.swatches.find((swatch) => swatch.isAnchor)
  if (!anchor) throw new Error('Missing fixture anchor')
  return { ...scale, swatches: [anchor] }
}

const exportWithAmbientGuard = (paletteName: string, scaleName: string) => {
  const before = captureAmbient()
  let after: AmbientSnapshot | undefined
  let tokens: ReturnType<typeof buildDtcgTokens> | undefined

  try {
    tokens = buildDtcgTokens(paletteName, [makeScale(scaleName)])
    after = captureAmbient()
  } finally {
    restoreAmbient(before)
  }

  if (!tokens || !after) throw new Error('DTCG export did not complete')
  expect(after).toEqual(before)
  return tokens
}

describe('buildDtcgTokens', () => {
  it.each(inheritedNames)('treats %s as an inert Palette name', (name) => {
    const tokens = exportWithAmbientGuard(name, 'primary')

    expect(Object.getPrototypeOf(tokens.color)).toBeNull()
    expect(Object.hasOwn(tokens.color, name)).toBe(true)
    expect(Object.getPrototypeOf(tokens.color[name])).toBeNull()
    expect(Object.hasOwn(tokens.color[name], 'primary')).toBe(true)
    expect(Object.getPrototypeOf(tokens.color[name].primary)).toBeNull()
    expect(Object.keys(JSON.parse(JSON.stringify(tokens)).color)).toContain(
      name,
    )
  })

  it.each(inheritedNames)('treats %s as an inert Scale name', (name) => {
    const tokens = exportWithAmbientGuard('Prism', name)
    const palette = tokens.color.Prism

    expect(Object.getPrototypeOf(tokens.color)).toBeNull()
    expect(Object.getPrototypeOf(palette)).toBeNull()
    expect(Object.hasOwn(palette, name)).toBe(true)
    expect(Object.getPrototypeOf(palette[name])).toBeNull()
    expect(Object.hasOwn(palette[name], '550')).toBe(true)
    expect(
      Object.keys(JSON.parse(JSON.stringify(tokens)).color.Prism),
    ).toContain(name)
  })

  it('keeps the ordinary JSON contract and distinct Scale groups', () => {
    const tokens = buildDtcgTokens('Prism', [
      makeScale('primary'),
      makeScale('secondary'),
    ])

    expect(JSON.parse(JSON.stringify(tokens))).toEqual({
      color: {
        Prism: {
          primary: {
            '550': {
              $type: 'color',
              $value: {
                colorSpace: 'oklch',
                components: [
                  0.5725937358706883, 0.2337523292587603, 265.2835592281915,
                ],
                alpha: 1,
              },
              $extensions: {
                hex: '#3366ff',
                css: 'oklch(57.259% 0.23375 265.28)',
              },
            },
          },
          secondary: {
            '550': {
              $type: 'color',
              $value: {
                colorSpace: 'oklch',
                components: [
                  0.5725937358706883, 0.2337523292587603, 265.2835592281915,
                ],
                alpha: 1,
              },
              $extensions: {
                hex: '#3366ff',
                css: 'oklch(57.259% 0.23375 265.28)',
              },
            },
          },
        },
      },
    })
  })
})
