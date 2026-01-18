'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlertTriangle, Anchor, Key, Lock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
import type { Swatch } from '@/src/engine'
import {
  createPaletteRecord,
  loadPalettes,
  savePalettes,
  seedPalette,
} from '@/src/lib/palettes'

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

const getSwatchIcons = (swatch: Swatch) => {
  const icons: Array<{ key: string; node: JSX.Element }> = []

  if (swatch.isAnchor) {
    icons.push({
      key: 'anchor',
      node: <Anchor size={12} strokeWidth={1.8} title="Anchor color" />,
    })
  }

  if (swatch.isKey) {
    icons.push({
      key: 'key',
      node: <Key size={12} strokeWidth={1.8} title="Key color" />,
    })
  }

  if (swatch.isLock) {
    icons.push({
      key: 'lock',
      node: <Lock size={12} strokeWidth={1.8} title="Locked endpoint" />,
    })
  }

  if (swatch.isOutOfGamut) {
    icons.push({
      key: 'gamut',
      node: (
        <AlertTriangle size={12} strokeWidth={1.8} title="Out of sRGB gamut" />
      ),
    })
  }

  return icons
}

export default function DashboardPage() {
  const router = useRouter()
  const [optimization, setOptimization] = useState(
    optimizations[0]?.name ?? 'Universal',
  )
  const [contrast, setContrast] = useState(contrastOptions[0])

  const [paletteState, setPaletteState] = useState(() => {
    const stored = loadPalettes()
    return {
      palettes: stored,
      selectedId: stored[0]?.id ?? seedPalette.id,
    }
  })

  const { palettes, selectedId } = paletteState
  const selectedPalette =
    palettes.find((palette) => palette.id === selectedId) ?? palettes[0]

  const palette = useMemo(
    () => buildPalette(selectedPalette?.seed ?? []),
    [selectedPalette],
  )

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

  const handleCreatePalette = () => {
    setPaletteState((prev) => {
      const nextPalette = createPaletteRecord(prev.palettes)
      const next = [...prev.palettes, nextPalette]
      savePalettes(next)
      router.push(`/palettes/${nextPalette.id}/edit`)
      return {
        palettes: next,
        selectedId: nextPalette.id,
      }
    })
  }

  const handleEditPalette = () => {
    if (!selectedPalette) return
    router.push(`/palettes/${selectedPalette.id}/edit`)
  }

  return (
    <div className="min-h-screen bg-muted/40">
      <div className="mx-auto grid w-full max-w-[1400px] gap-6 p-6 lg:grid-cols-[320px_1fr]">
        <aside className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Palette dashboard</CardTitle>
              <CardDescription>
                Review palette output and jump into edit mode.
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
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={handleEditPalette}
              >
                Edit palette
              </Button>
              <Button
                size="sm"
                className="w-full"
                onClick={handleCreatePalette}
              >
                Create palette
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Palettes</CardTitle>
              <CardDescription>Select a palette to preview.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {palettes.map((paletteItem) => (
                <Button
                  key={paletteItem.id}
                  variant={
                    paletteItem.id === selectedId ? 'secondary' : 'ghost'
                  }
                  className="w-full justify-between"
                  onClick={() =>
                    setPaletteState((prev) => ({
                      ...prev,
                      selectedId: paletteItem.id,
                    }))
                  }
                >
                  <span className="text-left">{paletteItem.name}</span>
                  <Badge variant="secondary">
                    {paletteItem.seed.length} scales
                  </Badge>
                </Button>
              ))}
            </CardContent>
          </Card>
        </aside>

        <main className="space-y-6">
          {palette.values.map((scale) => (
            <Card key={scale.id}>
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
                        key={`${scale.id}-${idx}`}
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
                            <div className="flex items-center gap-1">
                              {getSwatchIcons(swatch).map((item) => (
                                <span key={item.key}>{item.node}</span>
                              ))}
                            </div>
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
