import Color from 'colorjs.io'
import type { ColorDTO, ColorInput } from './types'
import { percentToEightBit, rgbObject, rgbToHex, toCoords } from './utils'

export const toColor = (input: ColorInput): Color => {
  if (typeof input === 'string') {
    return new Color(input)
  }

  return new Color(input.spaceId, input.coords, input.alpha)
}

export const toColorDTO = (color: Color): ColorDTO => {
  const coords = color.coords.slice(0, 3) as [number, number, number]
  return {
    spaceId: color.space.id,
    coords,
    alpha: typeof color.alpha === 'number' ? color.alpha : 1,
  }
}

export const gamutMap = (color: Color, space: string) => {
  return color.clone().to(space).toString()
}

export const colorToHex = (color: Color) => {
  return rgbToHex(percentToEightBit(toCoords(gamutMap(color, 'srgb'))))
}

export const colorToRgbObject = (color: Color) => {
  return rgbObject(percentToEightBit(toCoords(gamutMap(color, 'srgb'))))
}
