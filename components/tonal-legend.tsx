import { cn } from '@/lib/utils'

const tonalCategories = [
  { label: 'Highlights', range: '000–075' },
  { label: '1/4 Tones', range: '100–350' },
  { label: 'Mid Tones', range: '400–600' },
  { label: '3/4 Tones', range: '650–900' },
  { label: 'Shadows', range: '950–999' },
]

type TonalLegendProps = {
  className?: string
  variant?: 'default' | 'inline'
}

export function TonalLegend({
  className,
  variant = 'default',
}: TonalLegendProps) {
  const isInline = variant === 'inline'
  return (
    <div
      className={cn(
        isInline
          ? 'flex flex-wrap items-center gap-2 text-2xs text-muted-foreground'
          : 'flex flex-wrap items-center gap-2 rounded-lg border bg-card px-3 py-2 text-2xs text-muted-foreground',
        className,
      )}
    >
      <span
        className={cn(
          'font-medium',
          isInline
            ? 'text-2xs text-muted-foreground'
            : 'text-xs text-foreground/80',
        )}
      >
        Tonal ranges
      </span>
      {tonalCategories.map((category) => (
        <span
          key={category.label}
          className={cn(
            'rounded-full border px-2 py-0.5 font-medium',
            isInline
              ? 'border-muted/50 text-muted-foreground/80'
              : 'border-muted/60 text-muted-foreground',
          )}
        >
          {category.label} {category.range}
        </span>
      ))}
    </div>
  )
}
