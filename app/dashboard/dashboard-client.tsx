'use client'

import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactElement,
} from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { AlertTriangle, Anchor, ExternalLink, Key, Lock } from 'lucide-react'
import { toast } from 'sonner'
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PageHeader } from '@/components/page-header'
import { TonalGuide } from '@/components/tonal-guide'
import { buildPalette, optimizations } from '@/src/engine'
import type { Swatch } from '@/src/engine'
import {
  createPaletteRecord,
  loadPalettes,
  seedPalette,
  type OutputSpace,
} from '@/src/lib/palettes'
import { usePaletteEditorStore } from '@/src/store/palette-editor-store'
import {
  buildDtcgTokens,
  buildExportPayload,
  buildTailwindThemeExport,
  decodeSharePayload,
  encodeSharePayload,
} from '@/src/lib/share'
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

const resolveOutputSpace = (value?: OutputSpace) =>
  value && value !== 'auto' ? value : undefined

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

export default function DashboardClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [optimization, setOptimization] = useState(
    optimizations[0]?.name ?? 'Universal',
  )
  const [contrast, setContrast] = useState(contrastOptions[0])
  const optimizationLabelId = useId()
  const contrastLabelId = useId()
  const shareHandledRef = useRef(false)

  const [paletteState, setPaletteState] = useState(() => ({
    palettes: [seedPalette],
    selectedId: seedPalette.id,
  }))

  const { palettes, selectedId } = paletteState
  const selectedPalette =
    palettes.find((palette) => palette.id === selectedId) ?? palettes[0]

  const palette = useMemo(() => {
    const outputSpace = resolveOutputSpace(selectedPalette?.outputSpace)
    return buildPalette(selectedPalette?.seed ?? [], {
      destinationSpace: outputSpace,
    })
  }, [selectedPalette])
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

  const handleCopyShareLink = async () => {
    if (!selectedPalette) return
    const payload = {
      name: selectedPalette.name,
      seed: selectedPalette.seed,
      outputSpace: selectedPalette.outputSpace,
    }
    const shareUrl = `${window.location.origin}/dashboard?share=${encodeSharePayload(payload)}`
    try {
      await navigator.clipboard.writeText(shareUrl)
      toast.success('Share link copied.')
    } catch {
      window.prompt('Copy this share link:', shareUrl)
    }
  }

  const handleCopyJson = async () => {
    if (!selectedPalette) return
    const exportPayload = buildExportPayload(
      selectedPalette.name,
      palette.values,
    )
    const json = JSON.stringify(exportPayload, null, 2)
    try {
      await navigator.clipboard.writeText(json)
      toast.success('Palette JSON copied.')
    } catch {
      window.prompt('Copy this palette JSON:', json)
    }
  }

  const handleCopyDtcg = async () => {
    if (!selectedPalette) return
    const tokens = buildDtcgTokens(selectedPalette.name, palette.values)
    const json = JSON.stringify(tokens, null, 2)
    try {
      await navigator.clipboard.writeText(json)
      toast.success('DTCG tokens copied.')
    } catch {
      window.prompt('Copy these DTCG tokens:', json)
    }
  }

  const handleCopyTailwind = async () => {
    if (!selectedPalette) return
    const themeExport = buildTailwindThemeExport(
      selectedPalette.name,
      palette.values,
    )
    try {
      await navigator.clipboard.writeText(themeExport.css)
      toast.success('Tailwind theme copied.')
    } catch {
      window.prompt('Copy this Tailwind theme:', themeExport.css)
    }
  }

  useEffect(() => {
    const stored = loadPalettes()
    const shareValue = searchParams.get('share')
    if (shareValue) {
      const payload = decodeSharePayload(shareValue)
      if (payload && !shareHandledRef.current) {
        shareHandledRef.current = true
        const nextPalette = createPaletteRecord(stored)
        const sharedPalette = {
          ...nextPalette,
          name: payload.name?.trim() || `Shared Palette ${nextPalette.id}`,
          seed: payload.seed,
          outputSpace: payload.outputSpace ?? nextPalette.outputSpace,
        }
        queueMicrotask(() => {
          setPaletteState({
            palettes: [sharedPalette, ...stored],
            selectedId: sharedPalette.id,
          })
        })
        return
      }
    }
    const selectedParam = searchParams.get('selected')
    const selectedId = selectedParam ? Number(selectedParam) : null
    queueMicrotask(() => {
      setPaletteState((prev) => {
        const resolvedSelectedId =
          (selectedId &&
            stored.find((palette) => palette.id === selectedId)?.id) ??
          stored.find((palette) => palette.id === prev.selectedId)?.id ??
          stored[0]?.id ??
          seedPalette.id
        return {
          palettes: stored,
          selectedId: resolvedSelectedId,
        }
      })
    })
  }, [searchParams])

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
    <div className="min-h-dvh bg-background">
      <div className="mx-auto w-full max-w-[1400px] space-y-6 p-6">
        <PageHeader
          breadcrumbs={[{ label: 'Dashboard' }]}
          title="Palette dashboard"
          actions={
            <>
              <Button variant="outline" size="sm" onClick={handleEditPalette}>
                Edit palette
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={<Button variant="outline" size="sm" />}
                >
                  Share
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuGroup>
                    <DropdownMenuLabel>Share</DropdownMenuLabel>
                    <DropdownMenuItem onClick={handleCopyShareLink}>
                      Copy share link
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleCopyJson}>
                      Copy JSON
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleCopyDtcg}>
                      Copy DTCG tokens
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleCopyTailwind}>
                      Copy Tailwind theme
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button size="sm" onClick={handleCreatePalette}>
                Create palette
              </Button>
            </>
          }
        />
        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          <Tabs
            orientation="vertical"
            value={String(selectedId)}
            onValueChange={(value) => {
              const nextId = Number(value)
              if (Number.isNaN(nextId)) return
              setPaletteState((prev) => ({
                ...prev,
                selectedId: nextId,
              }))
            }}
            className="lg:contents"
          >
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
                  <CardDescription>
                    Select a palette to preview.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <TabsList
                    variant="line"
                    className="w-full flex-col items-stretch gap-1 bg-transparent p-0"
                  >
                    {palettes.map((paletteItem) => (
                      <TabsTrigger
                        key={paletteItem.id}
                        value={String(paletteItem.id)}
                        className="w-full justify-between rounded-md border border-transparent px-3 py-2 text-left data-active:bg-muted data-active:text-foreground data-active:shadow-none"
                      >
                        <span className="text-left">{paletteItem.name}</span>
                        <Badge
                          variant="outline"
                          className="border-muted/60 text-muted-foreground/70"
                        >
                          {paletteItem.seed.length} scales
                        </Badge>
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </CardContent>
              </Card>
            </aside>

            <main className="space-y-6">
              <Card className="bg-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle>Tonal categories</CardTitle>
                  <a
                    href="https://medium.com/user-experience-design-1/the-universal-color-palette-9826deb94f7"
                    target="_blank"
                    rel="noreferrer"
                    title="Open Kevin Muldoon’s Universal Color Palette article"
                    aria-label="Open Kevin Muldoon’s Universal Color Palette article"
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <ExternalLink className="size-4" />
                  </a>
                </CardHeader>
                <CardContent className="pt-0">
                  <TonalGuide />
                </CardContent>
              </Card>
              {palettes.map((paletteItem) => (
                <TabsContent
                  key={paletteItem.id}
                  value={String(paletteItem.id)}
                  className="space-y-6"
                >
                  {buildPalette(paletteItem.seed, {
                    destinationSpace: resolveOutputSpace(
                      paletteItem.outputSpace,
                    ),
                  }).values.map((scale) => (
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
                                    <span>
                                      {getContrastLabel(swatch, contrast)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>
              ))}
            </main>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
