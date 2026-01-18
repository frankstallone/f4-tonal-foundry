import Color from 'colorjs.io'
import { weights } from './constants'
import type { Swatch } from './types'
import { colorToHex, toColorDTO } from './color'
import { luminanceToWeight } from './utils'

export interface BuildSwatchOptions {
  color: Color
  destinationSpace: string
  priority?: number
  isKey?: boolean
  isAnchor?: boolean
  isLock?: boolean
}

const normalizeColorToDestinationGamut = (
  color: Color,
  destinationSpace: string,
) => {
  if (destinationSpace === 'srgb' && !color.inGamut(destinationSpace)) {
    return color.toGamut({ space: 'srgb' })
  }
  return color
}

export const buildSwatch = ({
  color,
  destinationSpace,
  priority,
  isKey,
  isAnchor,
  isLock,
}: BuildSwatchOptions): Swatch => {
  const normalized = normalizeColorToDestinationGamut(color, destinationSpace)
  const weight = luminanceToWeight(normalized.lab.l)
  const index = weights.findIndex((item) => item === weight)

  return {
    color: toColorDTO(normalized),
    value: {
      origin: normalized.to(normalized.space.id).toString(),
      destination: normalized.to(destinationSpace).toString(),
      hex: colorToHex(normalized),
    },
    weight,
    index,
    priority: priority ?? 0,
    isKey,
    isAnchor,
    isLock,
    wcag_white: normalized.contrast(new Color('White'), 'WCAG21'),
    wcag_black: normalized.contrast(new Color('Black'), 'WCAG21'),
    apca_white: normalized.contrast(new Color('White'), 'APCA'),
    apca_black: normalized.contrast(new Color('Black'), 'APCA'),
    lab_d65_l: normalized.lab_d65.l,
    oklab_l: normalized.oklab.l,
    cam16_j: normalized.cam16_jmh.j,
    hct_t: normalized.hct.t,
    hex: colorToHex(normalized),
  }
}
