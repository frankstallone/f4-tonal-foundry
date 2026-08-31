import { describe, expect, it } from 'vitest'
import {
  resolveSwatchDisplay,
  type SwatchDisplayMetrics,
} from './swatch-display'

const metrics = (
  overrides: Partial<SwatchDisplayMetrics> = {},
): SwatchDisplayMetrics => ({
  wcag_white: 7,
  wcag_black: 3,
  apca_white: -80,
  apca_black: 30,
  lab_d65_l: 50,
  oklab_l: 0.5,
  cam16_j: 49,
  hct_t: 52,
  ...overrides,
})

describe('resolveSwatchDisplay', () => {
  it('pairs white Swatch text with its black WCAG ratio', () => {
    expect(
      resolveSwatchDisplay(
        metrics({ wcag_white: 1, wcag_black: 21 }),
        'WCAG21',
      ),
    ).toEqual({ foreground: '#000000', label: '21.00:1' })
  })

  it('pairs black Swatch text with its white WCAG ratio', () => {
    expect(
      resolveSwatchDisplay(
        metrics({ wcag_white: 21, wcag_black: 1 }),
        'WCAG21',
      ),
    ).toEqual({ foreground: '#ffffff', label: '21.00:1' })
  })

  it('chooses the larger WCAG pair and breaks a tie toward black', () => {
    expect(resolveSwatchDisplay(metrics(), 'WCAG21')).toEqual({
      foreground: '#ffffff',
      label: '7.00:1',
    })
    expect(
      resolveSwatchDisplay(
        metrics({ wcag_white: 4.5, wcag_black: 4.5 }),
        'WCAG21',
      ),
    ).toEqual({ foreground: '#000000', label: '4.50:1' })
  })

  it('keeps APCA selection paired with its exact foreground', () => {
    expect(resolveSwatchDisplay(metrics(), 'APCA')).toEqual({
      foreground: '#ffffff',
      label: 'Lc -80.00',
    })
    expect(
      resolveSwatchDisplay(
        metrics({ apca_white: -25, apca_black: 70 }),
        'APCA',
      ),
    ).toEqual({ foreground: '#000000', label: 'Lc 70.00' })
  })

  it('formats each lightness metric with its correct unit', () => {
    const swatch = metrics()

    expect(resolveSwatchDisplay(swatch, 'CIE L* (d65)').label).toBe('L* 50.00')
    expect(resolveSwatchDisplay(swatch, 'Ok L*').label).toBe('L* 50.00')
    expect(resolveSwatchDisplay(swatch, 'CAM16').label).toBe('J 49.00')
    expect(resolveSwatchDisplay(swatch, 'HCT T%').label).toBe('T% 52.00')
  })
})
