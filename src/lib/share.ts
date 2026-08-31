import type { PaletteSeed, Scale } from '@/src/engine'
import type { OutputSpace } from '@/src/lib/palettes'
import { toColor } from '@/src/engine/color'
import type Color from 'colorjs.io'

export type SharePayload = {
  name?: string
  seed: PaletteSeed[]
  scales?: Scale[]
  outputSpace?: OutputSpace
}

export type ExportSwatch = {
  weight: string
  hex: string
  oklch: string
}

export type ExportScale = {
  name: string
  swatches: ExportSwatch[]
}

export type ExportPayload = {
  name: string
  scales: ExportScale[]
}

export type DtcgColorToken = {
  $type: 'color'
  $value: {
    colorSpace: 'oklch'
    components: [number, number, number]
    alpha?: number
  }
  $extensions?: {
    hex?: string
    css?: string
  }
}

export type DtcgTokens = {
  color: Record<string, Record<string, Record<string, DtcgColorToken>>>
}

export type TailwindThemeExport = {
  name: string
  css: string
}

const createDictionary = <T>(): Record<string, T> => Object.create(null)

const isPaletteSeed = (value: unknown): value is PaletteSeed => {
  if (!value || typeof value !== 'object') return false
  const candidate = value as PaletteSeed
  if (typeof candidate.index !== 'number') return false
  if (typeof candidate.semantic !== 'string') return false
  if (candidate.keys === null) return true
  if (!Array.isArray(candidate.keys)) return false
  return candidate.keys.every((item) => typeof item === 'string')
}

export const isSharePayload = (value: unknown): value is SharePayload => {
  if (!value || typeof value !== 'object') return false
  const candidate = value as SharePayload
  if (!Array.isArray(candidate.seed)) return false
  if (candidate.name !== undefined && typeof candidate.name !== 'string') {
    return false
  }
  if (candidate.scales !== undefined && !Array.isArray(candidate.scales)) {
    return false
  }
  if (
    candidate.outputSpace !== undefined &&
    !['auto', 'srgb', 'oklch', 'p3'].includes(candidate.outputSpace)
  ) {
    return false
  }
  return candidate.seed.every(isPaletteSeed)
}

const encodeBase64 = (value: string) =>
  btoa(unescape(encodeURIComponent(value)))
const decodeBase64 = (value: string) => decodeURIComponent(escape(atob(value)))

export const encodeSharePayload = (payload: SharePayload) => {
  const json = JSON.stringify(payload)
  return encodeURIComponent(encodeBase64(json))
}

export const decodeSharePayload = (value: string) => {
  try {
    const base64 = decodeURIComponent(value)
    const json = decodeBase64(base64)
    const parsed = JSON.parse(json) as unknown
    return isSharePayload(parsed) ? parsed : null
  } catch {
    return null
  }
}

export const buildExportPayload = (
  name: string,
  scales: Scale[],
): ExportPayload => {
  return {
    name,
    scales: scales.map((scale) => ({
      name: scale.semantic,
      swatches: scale.swatches.map((swatch) => ({
        weight: swatch.weight,
        hex: swatch.hex ?? swatch.value.hex,
        oklch: toColor(swatch.color).to('oklch').toString(),
      })),
    })),
  }
}

export const buildDtcgTokens = (name: string, scales: Scale[]): DtcgTokens => {
  const paletteKey = name.trim() || 'palette'
  const color =
    createDictionary<Record<string, Record<string, DtcgColorToken>>>()
  const palette = createDictionary<Record<string, DtcgColorToken>>()
  color[paletteKey] = palette

  scales.forEach((scale) => {
    const scaleKey = scale.semantic
    if (!Object.hasOwn(palette, scaleKey)) {
      palette[scaleKey] = createDictionary<DtcgColorToken>()
    }
    const scaleTokens = palette[scaleKey]
    scale.swatches.forEach((swatch) => {
      const colorValue = toColor(swatch.color)
      const oklch = colorValue.to('oklch')
      const [l, c, h] = oklch.coords as [number, number, number]
      scaleTokens[swatch.weight] = {
        $type: 'color',
        $value: {
          colorSpace: 'oklch',
          components: [l, c, h],
          alpha: typeof oklch.alpha === 'number' ? oklch.alpha : 1,
        },
        $extensions: {
          hex: swatch.hex ?? swatch.value.hex,
          css: oklch.toString(),
        },
      }
    })
  })

  return { color }
}

const slugifyToken = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

const formatOklch = (value: Color) => value.to('oklch').toString()

export const buildTailwindThemeExport = (
  name: string,
  scales: Scale[],
): TailwindThemeExport => {
  const lines: string[] = []
  scales.forEach((scale) => {
    const scaleKey = slugifyToken(scale.semantic || 'scale')
    scale.swatches.forEach((swatch) => {
      const tokenName = `--color-${scaleKey}-${swatch.weight}`
      const oklch = formatOklch(toColor(swatch.color))
      lines.push(`  ${tokenName}: ${oklch};`)
    })
  })

  return {
    name: name.trim() || 'palette',
    css: `@theme {\n${lines.join('\n')}\n}`,
  }
}
