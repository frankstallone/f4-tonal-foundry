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
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
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
import { AppShell } from '@/components/app-shell'
import { ThemeToggle } from '@/components/theme-toggle'
import { TonalGuide } from '@/components/tonal-guide'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
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
  const swatchCount = palette.values[0]?.swatches.length ?? 0
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
    <AppShell
      title="Palette dashboard"
      actions={
        <>
          <ThemeToggle />
          <Button variant="outline" size="sm" onClick={handleEditPalette}>
            Edit palette
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={<Button variant="outline" size="sm" />}
            >
              Export
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuGroup>
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
      sidebar={
        <Sidebar>
          <SidebarHeader>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Workspace</p>
              <p className="text-sm font-semibold">Prism Color</p>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>View options</SidebarGroupLabel>
              <SidebarGroupContent>
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
                      size="sm"
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
                      size="sm"
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
              </SidebarGroupContent>
            </SidebarGroup>
            <SidebarGroup>
              <SidebarGroupLabel>Palettes</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {palettes.map((paletteItem) => (
                    <SidebarMenuItem key={paletteItem.id}>
                      <SidebarMenuButton
                        type="button"
                        isActive={paletteItem.id === selectedId}
                        onClick={() =>
                          setPaletteState((prev) => ({
                            ...prev,
                            selectedId: paletteItem.id,
                          }))
                        }
                      >
                        <span className="text-left">{paletteItem.name}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
      }
    >
      <div className="flex h-full flex-col">
        <section className="border-b border-border bg-card px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Reference</p>
              <h2 className="text-balance text-sm font-semibold">
                Tonal categories
              </h2>
            </div>
            <p className="text-xs text-muted-foreground tabular-nums">
              {swatchCount} swatches
            </p>
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
          </div>
          <div className="mt-4">
            <TonalGuide />
          </div>
        </section>
        <div className="divide-y divide-border">
          {palette.values.map((scale) => (
            <section key={scale.id} className="bg-card px-6 py-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">
                    {scale.destinationSpace.toUpperCase()} output
                  </p>
                  <h3 className="text-balance text-sm font-semibold capitalize">
                    {scale.semantic}
                  </h3>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-swatch gap-2">
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
                          'flex h-16 w-full flex-col justify-between border px-2 py-1 text-2xs',
                          isDisabled &&
                            'border-dashed bg-muted text-muted-foreground opacity-80',
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
            </section>
          ))}
        </div>
      </div>
    </AppShell>
  )
}
