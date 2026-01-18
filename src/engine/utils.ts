import { targets } from './constants'
import type { ColorCoords } from './types'

export const hexToDecimal = (value: string) => {
  return eightBitToDecimal(hexToRgb(value))
}

export const eightBitToDecimal = (value: number[] | null) => {
  if (!value) return null
  return value.map((item) => item / 255)
}

export const decimalToEightBit = (value: number[]) => {
  return value.map((item) => item * 255)
}

export const percentToEightBit = (value: number[]) => {
  return value.map((item) => Math.round((item / 100) * 255))
}

export const rgbObject = (rgb: number[]) => {
  return { r: rgb[0], g: rgb[1], b: rgb[2] }
}

export const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16),
      ]
    : null
}

export const rgbToHex = (rgb: number[]) => {
  return `#${((1 << 24) + (rgb[0] << 16) + (rgb[1] << 8) + rgb[2])
    .toString(16)
    .slice(1)}`
}

export const toCoords = (value: string): ColorCoords => {
  const result = value.replace(/[|&;$%@"<>()+,a-z]/g, '')
  return result
    .split(' ')
    .map((item) => parseFloat(item))
    .slice(0, 3) as ColorCoords
}

export const luminanceToTarget = (luminance: number) => {
  return targets.reduce((prev, curr) => {
    return Math.abs(curr - luminance) < Math.abs(prev - luminance) ? curr : prev
  })
}

export const luminanceToWeight = (luminance: number) => {
  const value = luminanceToTarget(luminance)
  const result = String((100 - value) * 10).padStart(3, '0')
  return result === '1000' ? '999' : result
}

export const dpsContrast = (a: number, b: number) => {
  return (Math.abs(a ** 1.618 - b ** 1.618) ** 0.618 * 1.414 - 40).toFixed(2)
}
