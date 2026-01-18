'use client'

import { useMemo, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { buildPalette, optimizations } from '@/src/engine'
import type { PaletteSeed, Swatch } from '@/src/engine'

const paletteSeed: PaletteSeed[] = [
  { index: 1, semantic: 'primary', keys: ['oklch(52.95% 0.1609 244.63)'] },
  { index: 2, semantic: 'secondary', keys: ['#867356', '#3a2f1e', '#cec6b9'] },
  { index: 3, semantic: 'positive', keys: ['#007c00'] },
  { index: 4, semantic: 'negative', keys: ['#d80000'] },
  { index: 5, semantic: 'highlight', keys: ['#ffc107'] },
  {
    index: 6,
    semantic: 'info',
    keys: ['#035ef9', '#d2e3ff', '#013391', '#0248c3', '#91b9ff'],
  },
  { index: 7, semantic: 'system', keys: ['#0A66D8'] },
  { index: 8, semantic: 'neutral', keys: null },
]

const contrastOptions = [
  'CIE L* (d65)',
  'WCAG21',
  'APCA',
  'Ok L*',
  'CAM16',
  'HCT T%',
]

const getContrastLabel = (swatch: Swatch, contrast: string) => {
  if (contrast === 'WCAG21') {
    return `${swatch.wcag_white.toFixed(2)}:1`
  }
  if (contrast === 'CIE L* (d65)') {
    return `L* ${swatch.lab_d65_l.toFixed(2)}`
  }
  if (contrast === 'APCA') {
    const white = Math.abs(swatch.apca_white)
    const black = Math.abs(swatch.apca_black)
    return white > black
      ? `Lc ${swatch.apca_white.toFixed(2)}`
      : `Lc ${swatch.apca_black.toFixed(2)}`
  }
  if (contrast === 'Ok L*') {
    return `L* ${(swatch.oklab_l * 100).toFixed(2)}`
  }
  if (contrast === 'CAM16') {
    return `L* ${swatch.cam16_j.toFixed(2)}`
  }
  if (contrast === 'HCT T%') {
    return `T% ${swatch.hct_t.toFixed(2)}`
  }
  return ''
}

const swatchTextColor = (swatch: Swatch, contrast: string) => {
  if (contrast === 'WCAG21') {
    return swatch.lab_d65_l < 50 ? '#ffffff' : '#111111'
  }
  const white = Math.abs(swatch.apca_white)
  const black = Math.abs(swatch.apca_black)
  return white > black ? '#ffffff' : '#111111'
}

export default function CreatePage() {
  const [optimization, setOptimization] = useState(
    optimizations[0]?.name ?? 'Universal',
  )
  const [contrast, setContrast] = useState(contrastOptions[0])

  const palette = useMemo(() => buildPalette(paletteSeed), [])

  const optimizationWeights = useMemo(() => {
    const selected =
      optimizations.find((item) => item.name === optimization) ??
      optimizations[0]
    const map = new Map<number, string | undefined>()
    selected?.values.forEach((value) => {
      map.set(value.universalWeight, value.weight)
    })
    return map
  }, [optimization])

  return (
    <div className="min-h-screen bg-muted/40">
      <div className="mx-auto grid w-full max-w-[1400px] gap-6 p-6 lg:grid-cols-[320px_1fr]">
        <aside className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Create palette</CardTitle>
              <CardDescription>
                Preview your scale output with different systems.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm font-medium">Optimization</p>
                <Select value={optimization} onValueChange={setOptimization}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select optimization" />
                  </SelectTrigger>
                  <SelectContent>
                    {optimizations.map((item) => (
                      <SelectItem key={item.name} value={item.name}>
                        {item.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Contrast</p>
                <Select value={contrast} onValueChange={setContrast}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select contrast" />
                  </SelectTrigger>
                  <SelectContent>
                    {contrastOptions.map((item) => (
                      <SelectItem key={item} value={item}>
                        {item}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Scales</CardTitle>
              <CardDescription>
                Seeds used to generate the palette.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {paletteSeed.map((scale) => (
                <div
                  key={scale.semantic}
                  className="flex items-center justify-between"
                >
                  <span className="text-sm font-medium capitalize">
                    {scale.semantic}
                  </span>
                  <Badge variant="secondary">
                    {scale.keys?.length ?? 0} keys
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </aside>

        <main className="space-y-6">
          {palette.values.map((scale) => (
            <Card key={scale.semantic}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle className="capitalize">{scale.semantic}</CardTitle>
                  <CardDescription>
                    {scale.destinationSpace.toUpperCase()} output
                  </CardDescription>
                </div>
                <Badge variant="outline">
                  {scale.swatches.length} swatches
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-[repeat(auto-fit,minmax(64px,1fr))] gap-3">
                  {scale.swatches.map((swatch, idx) => {
                    const weightLabel = optimizationWeights.get(
                      Number(swatch.weight),
                    )
                    const isDisabled = !weightLabel
                    return (
                      <div
                        key={`${scale.semantic}-${idx}`}
                        className="flex flex-col items-center gap-2 text-[11px] font-medium"
                      >
                        <span className="text-muted-foreground">
                          {weightLabel ?? '—'}
                        </span>
                        <div
                          className="flex h-16 w-full flex-col justify-between rounded-lg border px-2 py-1 text-[10px] shadow-sm"
                          style={{
                            background: isDisabled
                              ? 'repeating-linear-gradient(-45deg, #f1f1f1, #f1f1f1 9px, #e3e3e3 9px, #e3e3e3 18px)'
                              : swatch.value.destination,
                            color: isDisabled
                              ? '#6b7280'
                              : swatchTextColor(swatch, contrast),
                            opacity: isDisabled ? 0.6 : 1,
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <span>
                              {swatch.isAnchor
                                ? 'A'
                                : swatch.isKey
                                  ? 'K'
                                  : swatch.isLock
                                    ? 'L'
                                    : ''}
                            </span>
                            <span>{swatch.weight}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>{getContrastLabel(swatch, contrast)}</span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </main>
      </div>
    </div>
  )
}
