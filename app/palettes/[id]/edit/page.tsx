'use client'

import {
  memo,
  useCallback,
  useDeferredValue,
  useMemo,
  useState,
  type ReactElement,
} from 'react'
import { useParams, useRouter } from 'next/navigation'
import Color from 'colorjs.io'
import {
  AlertTriangle,
  Anchor,
  Copy,
  Key,
  Lock,
  Plus,
  Trash2,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  ColorArea,
  ColorPicker,
  ColorSlider,
  ColorSwatch,
  ColorThumb,
  Dialog,
  DialogTrigger,
  Popover,
  SliderTrack,
  Button as AriaButton,
} from 'react-aria-components'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { PageHeader } from '@/components/page-header'
import { buildScale, colorToHex, optimizations } from '@/src/engine'
import type { PaletteSeed, Swatch } from '@/src/engine'
import {
  seedPalette,
  upsertPalette,
  type PaletteRecord,
} from '@/src/lib/palettes'
import { usePaletteEditorStore } from '@/src/store/palette-editor-store'
import { parseColor } from '@react-stately/color'
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

const isValidColor = (value: string) => {
  if (!value.trim()) return false
  try {
    // Throws if invalid color string
    new Color(value)
    return true
  } catch {
    return false
  }
}

const normalizeKeys = (keys: string[]) =>
  keys
    .map((key) => key.trim())
    .filter((key) => key.length > 0 && isValidColor(key))

const toPickerColor = (value: string) => {
  const fallback = parseColor('#ffffff')
  if (!value.trim()) return fallback
  try {
    return parseColor(value)
  } catch {
    try {
      const color = new Color(value)
      const hex = colorToHex(color)
      return parseColor(hex)
    } catch {
      return fallback
    }
  }
}

type KeyRowProps = {
  scaleId: number
  index: number
  value: string
  onChange: (scaleId: number, keyIndex: number, value: string) => void
  onRemove: (scaleId: number, keyIndex: number) => void
}

const KeyRow = memo(
  ({ scaleId, index, value, onChange, onRemove }: KeyRowProps) => {
    const valid = isValidColor(value)
    const pickerColor = useMemo(() => toPickerColor(value), [value])

    return (
      <div className="space-y-2 rounded-md border border-muted/50 bg-muted/30 p-2">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <DialogTrigger>
              <AriaButton
                aria-label="Open color picker"
                className="absolute left-2 top-1/2 z-10 flex size-5 -translate-y-1/2 items-center justify-center rounded-full "
              >
                <ColorSwatch
                  color={pickerColor}
                  className="size-4 rounded-full"
                />
              </AriaButton>
              <Popover className="z-50">
                <Dialog className="w-72 space-y-3 rounded-lg border bg-background p-3 shadow-lg">
                  <ColorPicker
                    value={pickerColor}
                    onChange={(color) =>
                      onChange(scaleId, index, color.toString('hex'))
                    }
                  >
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <ColorSwatch
                          color={pickerColor}
                          className="size-6 rounded-sm border"
                        />
                        <span>Drag to update the key color.</span>
                      </div>
                      <ColorArea
                        colorSpace="hsb"
                        xChannel="saturation"
                        yChannel="brightness"
                        className="relative h-28 w-full overflow-hidden rounded-md border"
                      >
                        <ColorThumb className="size-3 rounded-full border border-background bg-white shadow" />
                      </ColorArea>
                      <ColorSlider colorSpace="hsb" channel="hue">
                        <SliderTrack className="relative h-3 w-full rounded-full border">
                          <ColorThumb className="size-3 rounded-full border border-background bg-white shadow" />
                        </SliderTrack>
                      </ColorSlider>
                    </div>
                  </ColorPicker>
                </Dialog>
              </Popover>
            </DialogTrigger>
            <Input
              value={value}
              onChange={(event) => onChange(scaleId, index, event.target.value)}
              className={cn('pl-8', { 'border-destructive': !valid })}
              placeholder="#ffffff or oklch(...)"
            />
          </div>
          <AlertDialog>
            <AlertDialogTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-xs"
                  aria-label="Remove key"
                />
              }
            >
              <Trash2 className="size-3" />
            </AlertDialogTrigger>
            <AlertDialogContent size="sm">
              <AlertDialogHeader>
                <AlertDialogTitle>Remove this key?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will delete the key color from the scale.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  variant="destructive"
                  onClick={() => onRemove(scaleId, index)}
                >
                  Remove key
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    )
  },
)
KeyRow.displayName = 'KeyRow'

type ScaleEditorCardProps = {
  scaleId: number
}

const ScaleEditorCard = memo(({ scaleId }: ScaleEditorCardProps) => {
  const scale = usePaletteEditorStore((state) => state.scales[scaleId])
  const updateScaleName = usePaletteEditorStore(
    (state) => state.updateScaleName,
  )
  const updateKey = usePaletteEditorStore((state) => state.updateKey)
  const addKey = usePaletteEditorStore((state) => state.addKey)
  const removeKey = usePaletteEditorStore((state) => state.removeKey)
  const duplicateScale = usePaletteEditorStore((state) => state.duplicateScale)
  const deleteScale = usePaletteEditorStore((state) => state.deleteScale)

  if (!scale) return null

  return (
    <div className="space-y-2 rounded-lg border p-3">
      <div className="flex items-center gap-2">
        <Input
          value={scale.name}
          onChange={(event) => updateScaleName(scale.id, event.target.value)}
          placeholder="Scale name"
        />
        <Badge variant="secondary">{scale.keys.length} keys</Badge>
      </div>
      <div className="flex flex-col gap-2">
        <p className="text-xs font-medium text-muted-foreground">Keys</p>
        <div className="flex flex-col gap-2">
          {scale.keys.map((key, index) => (
            <KeyRow
              key={`${scale.id}-${index}`}
              scaleId={scale.id}
              index={index}
              value={key}
              onChange={updateKey}
              onRemove={removeKey}
            />
          ))}
        </div>
        <Button
          variant="ghost"
          size="xs"
          className="w-full justify-start"
          onClick={() => addKey(scale.id)}
        >
          <Plus className="size-4" />
          Add key
        </Button>
      </div>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon-xs"
          aria-label="Duplicate scale"
          onClick={() => duplicateScale(scale.id)}
        >
          <Copy className="size-3" />
        </Button>
        <AlertDialog>
          <AlertDialogTrigger
            render={
              <Button
                variant="ghost"
                size="icon-xs"
                aria-label="Delete scale"
              />
            }
          >
            <Trash2 className="size-3" />
          </AlertDialogTrigger>
          <AlertDialogContent size="sm">
            <AlertDialogHeader>
              <AlertDialogTitle>Delete this scale?</AlertDialogTitle>
              <AlertDialogDescription>
                This removes the scale and its keys from the palette.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                variant="destructive"
                onClick={() => deleteScale(scale.id)}
              >
                Delete scale
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
})
ScaleEditorCard.displayName = 'ScaleEditorCard'

type ScalePreviewCardProps = {
  scaleId: number
  contrast: string
  optimizationWeights: Map<number, string | undefined>
}

const ScalePreviewCard = memo(
  ({ scaleId, contrast, optimizationWeights }: ScalePreviewCardProps) => {
    const scale = usePaletteEditorStore((state) => state.scales[scaleId])
    const deferredScale = useDeferredValue(scale)

    const scaleModel = useMemo(() => {
      if (!deferredScale) return null
      const keys = normalizeKeys(deferredScale.keys)
      return buildScale({
        id: deferredScale.id,
        semantic: deferredScale.name,
        keys,
      })
    }, [deferredScale])

    if (!scaleModel) return null

    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="capitalize">{scaleModel.semantic}</CardTitle>
            <CardDescription>
              {scaleModel.destinationSpace.toUpperCase()} output
            </CardDescription>
          </div>
          <Badge variant="outline">{scaleModel.swatches.length} swatches</Badge>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-swatch gap-3">
            {scaleModel.swatches.map((swatch, idx) => {
              const weightLabel = optimizationWeights.get(Number(swatch.weight))
              const isDisabled = !weightLabel
              return (
                <div
                  key={`${scaleModel.id}-${idx}`}
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
    )
  },
)
ScalePreviewCard.displayName = 'ScalePreviewCard'

export default function CreatePage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const paletteId = Number(params?.id ?? seedPalette.id)
  const paletteName = usePaletteEditorStore((state) => state.paletteName)
  const setPaletteName = usePaletteEditorStore((state) => state.setPaletteName)
  const scaleOrder = usePaletteEditorStore((state) => state.scaleOrder)
  const addScale = usePaletteEditorStore((state) => state.addScale)
  const [lastSavedAt, setLastSavedAt] = useState<{
    paletteId: number
    timestamp: number
  } | null>(null)
  const [optimization, setOptimization] = useState(
    optimizations[0]?.name ?? 'Universal',
  )
  const [contrast, setContrast] = useState(contrastOptions[0])

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

  const hasInvalidKeys = usePaletteEditorStore(
    useCallback(
      (state) =>
        state.scaleOrder.some((scaleId) => {
          const scale = state.scales[scaleId]
          if (!scale) return false
          return scale.keys.some(
            (key) => key.trim().length > 0 && !isValidColor(key),
          )
        }),
      [],
    ),
  )

  const handleSavePalette = () => {
    if (hasInvalidKeys) return
    const state = usePaletteEditorStore.getState()
    const seed: PaletteSeed[] = state.scaleOrder.map((scaleId, index) => {
      const scale = state.scales[scaleId]
      if (!scale) {
        return {
          index: index + 1,
          semantic: `Scale ${index + 1}`,
          keys: null,
        }
      }
      const keys = normalizeKeys(scale.keys)
      return {
        index: scale.id ?? index + 1,
        semantic: scale.name.trim() || `Scale ${index + 1}`,
        keys: keys.length ? keys : null,
      }
    })

    const nextRecord: PaletteRecord = {
      id: state.paletteId || paletteId,
      name: state.paletteName.trim() || `Palette ${paletteId}`,
      seed,
    }

    upsertPalette(nextRecord)
    setLastSavedAt({ paletteId, timestamp: Date.now() })
  }

  const handleCancel = () => {
    router.push('/dashboard')
  }

  return (
    <div className="min-h-dvh bg-muted/40">
      <div className="mx-auto w-full max-w-[1400px] space-y-6 p-6">
        <PageHeader
          breadcrumbs={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: paletteName.trim() || `Palette ${paletteId}` },
          ]}
          title="Edit palette"
          actions={
            <>
              <Button variant="outline" size="sm" onClick={handleCancel}>
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSavePalette}
                disabled={hasInvalidKeys}
              >
                Save palette
              </Button>
            </>
          }
        />
        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          <aside className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Edit palette</CardTitle>
                <CardDescription>
                  Name this palette and shape the scale output.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium">Palette name</p>
                  <Input
                    value={paletteName}
                    onChange={(event) => setPaletteName(event.target.value)}
                    placeholder="Palette name"
                  />
                </div>
                {lastSavedAt?.paletteId === paletteId ? (
                  <p className="text-xs text-muted-foreground">
                    Saved just now.
                  </p>
                ) : null}
                {hasInvalidKeys ? (
                  <p className="text-xs text-destructive">
                    Fix invalid keys before saving.
                  </p>
                ) : null}
                <div className="space-y-2">
                  <p className="text-sm font-medium">Optimization</p>
                  <Select
                    value={optimization}
                    onValueChange={(value) =>
                      setOptimization(
                        value ?? optimizations[0]?.name ?? 'Universal',
                      )
                    }
                  >
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
                  <Select
                    value={contrast}
                    onValueChange={(value) =>
                      setContrast(value ?? contrastOptions[0])
                    }
                  >
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
                  Update naming and manage scale groupings.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {scaleOrder.map((scaleId) => (
                  <ScaleEditorCard key={scaleId} scaleId={scaleId} />
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={addScale}
                >
                  <Plus className="size-4" />
                  Add scale
                </Button>
              </CardContent>
            </Card>
          </aside>

          <main className="space-y-6">
            {scaleOrder.map((scaleId) => (
              <ScalePreviewCard
                key={scaleId}
                scaleId={scaleId}
                contrast={contrast}
                optimizationWeights={optimizationWeights}
              />
            ))}
          </main>
        </div>
      </div>
    </div>
  )
}
