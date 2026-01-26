'use client'

import { useId, useMemo, useState, type ReactElement } from 'react'
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
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { PageHeader } from '@/components/page-header'
import { buildPalette, optimizations } from '@/src/engine'
import type { Swatch } from '@/src/engine'
import {
  createPaletteRecord,
  loadPalettes,
  seedPalette,
} from '@/src/lib/palettes'
import { usePaletteEditorStore } from '@/src/store/palette-editor-store'
import { cn } from '@/lib/utils'

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
  const icons: Array<{ key: string; node: ReactElement }> = []

  if (swatch.isAnchor) {
    icons.push({
      key: 'anchor',
      node: (
        <span role="img" aria-label="Anchor color">
          <Anchor size={12} strokeWidth={1.8} />
        </span>
      ),
    })
  }

  if (swatch.isKey) {
    icons.push({
      key: 'key',
      node: (
        <span role="img" aria-label="Key color">
          <Key size={12} strokeWidth={1.8} />
        </span>
      ),
    })
  }

  if (swatch.isLock) {
    icons.push({
      key: 'lock',
      node: (
        <span role="img" aria-label="Locked endpoint">
          <Lock size={12} strokeWidth={1.8} />
        </span>
      ),
    })
  }

  if (swatch.isOutOfGamut) {
    icons.push({
      key: 'gamut',
      node: (
        <span role="img" aria-label="Out of sRGB gamut">
          <AlertTriangle size={12} strokeWidth={1.8} />
        </span>
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
  const optimizationLabelId = useId()
  const contrastLabelId = useId()

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
    const nextPalette = createPaletteRecord(paletteState.palettes)
    usePaletteEditorStore.getState().setPalette(nextPalette)
    router.push(`/palettes/${nextPalette.id}/edit`)
  }

  const handleEditPalette = () => {
    if (!selectedPalette) return
    router.push(`/palettes/${selectedPalette.id}/edit`)
  }

  return (
    <div className="min-h-dvh bg-muted/40">
      <div className="mx-auto w-full max-w-[1400px] space-y-6 p-6">
        <PageHeader
          breadcrumbs={[{ label: 'Dashboard' }]}
          title="Palette dashboard"
          actions={
            <>
              <Button variant="outline" size="sm" onClick={handleEditPalette}>
                Edit palette
              </Button>
              <Button size="sm" onClick={handleCreatePalette}>
                Create palette
              </Button>
            </>
          }
        />
        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
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
                  <Label id={optimizationLabelId}>Optimization</Label>
                  <Select
                    value={optimization}
                    onValueChange={(value) =>
                      setOptimization(
                        value ?? optimizations[0]?.name ?? 'Universal',
                      )
                    }
                  >
                    <SelectTrigger
                      className="w-full"
                      aria-labelledby={optimizationLabelId}
                    >
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
                  <Label id={contrastLabelId}>Contrast</Label>
                  <Select
                    value={contrast}
                    onValueChange={(value) =>
                      setContrast(value ?? contrastOptions[0])
                    }
                  >
                    <SelectTrigger
                      className="w-full"
                      aria-labelledby={contrastLabelId}
                    >
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
                    <CardTitle className="capitalize">
                      {scale.semantic}
                    </CardTitle>
                    <CardDescription>
                      {scale.destinationSpace.toUpperCase()} output
                    </CardDescription>
                  </div>
                  <Badge variant="outline">
                    {scale.swatches.length} swatches
                  </Badge>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-swatch gap-3">
                    {scale.swatches.map((swatch, idx) => {
                      const weightLabel = optimizationWeights.get(
                        Number(swatch.weight),
                      )
                      const isDisabled = !weightLabel
                      return (
                        <div
                          key={`${scale.id}-${idx}`}
                          className="flex flex-col items-center gap-2 text-xs font-medium tabular-nums"
                        >
                          <span className="text-muted-foreground">
                            {weightLabel ?? '—'}
                          </span>
                          <div
                            className={cn(
                              'flex h-16 w-full flex-col justify-between rounded-lg border px-2 py-1 text-2xs shadow-sm',
                              isDisabled &&
                                'border-dashed bg-muted/60 text-muted-foreground opacity-80',
                            )}
                            style={{
                              background: isDisabled
                                ? undefined
                                : swatch.value.destination,
                              color: isDisabled
                                ? undefined
                                : swatchTextColor(swatch, contrast),
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
    </div>
  )
}
