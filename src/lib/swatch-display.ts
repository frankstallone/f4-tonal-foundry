import type { Swatch } from '@/src/engine'

export const contrastOptions = [
  'CIE L* (d65)',
  'WCAG21',
  'APCA',
  'Ok L*',
  'CAM16',
  'HCT T%',
] as const

export type ContrastMetric = (typeof contrastOptions)[number]

export type SwatchDisplayMetrics = Pick<
  Swatch,
  | 'wcag_white'
  | 'wcag_black'
  | 'apca_white'
  | 'apca_black'
  | 'lab_d65_l'
  | 'oklab_l'
  | 'cam16_j'
  | 'hct_t'
>

type Foreground = '#ffffff' | '#000000'

export const isContrastMetric = (value: unknown): value is ContrastMetric =>
  contrastOptions.some((option) => option === value)

export const resolveSwatchDisplay = (
  swatch: SwatchDisplayMetrics,
  contrast: ContrastMetric,
): { foreground: Foreground; label: string } => {
  if (contrast === 'WCAG21') {
    const useWhite = swatch.wcag_white > swatch.wcag_black
    const ratio = useWhite ? swatch.wcag_white : swatch.wcag_black
    return {
      foreground: useWhite ? '#ffffff' : '#000000',
      label: `${ratio.toFixed(2)}:1`,
    }
  }

  const useWhite = Math.abs(swatch.apca_white) > Math.abs(swatch.apca_black)
  const foreground = useWhite ? '#ffffff' : '#000000'

  if (contrast === 'APCA') {
    const ratio = useWhite ? swatch.apca_white : swatch.apca_black
    return { foreground, label: `Lc ${ratio.toFixed(2)}` }
  }
  if (contrast === 'CIE L* (d65)') {
    return { foreground, label: `L* ${swatch.lab_d65_l.toFixed(2)}` }
  }
  if (contrast === 'Ok L*') {
    return { foreground, label: `L* ${(swatch.oklab_l * 100).toFixed(2)}` }
  }
  if (contrast === 'CAM16') {
    return { foreground, label: `J ${swatch.cam16_j.toFixed(2)}` }
  }
  return { foreground, label: `T% ${swatch.hct_t.toFixed(2)}` }
}
