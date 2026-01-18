import type { SemanticValue } from './constants'

export type ColorCoords = [number, number, number]

export interface ColorDTO {
  spaceId: string
  coords: ColorCoords
  alpha: number
}

export interface ColorValue {
  origin: string
  destination: string
  hex: string
}

export interface Swatch {
  color: ColorDTO
  value: ColorValue
  weight: string
  index: number
  priority: number
  isLock?: boolean
  isKey?: boolean
  isAnchor?: boolean
  wcag_white: number
  wcag_black: number
  apca_white: number
  apca_black: number
  lab_d65_l: number
  oklab_l: number
  cam16_j: number
  hct_t: number
  hex: string
}

export interface Scale {
  id: number
  semantic: string
  swatches: Swatch[]
  stepsDeltaE: number
  tweenSpace: string
  destinationSpace: string
}

export interface Palette {
  values: Scale[]
}

export interface PaletteSeed {
  index: number
  semantic: SemanticValue | string
  keys: string[] | null
}

export interface BuildScaleOptions {
  stepsDeltaE?: number
  tweenSpace?: string
  destinationSpace?: string
}

export type ColorInput = string | ColorDTO
