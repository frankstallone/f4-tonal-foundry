# Examples

## Mapping Table

```text
app name              primitive      category     value       notes
canvas.default        neutral-050    Highlights   oklch(...)  Large passive area
ink.default           neutral-900    3/4 Tones    oklch(...)  Read contrast output on canvas
checkout.cta.bg       ocean-550      Mid Tones    oklch(...)  Primary action
checkout.cta.hover    ocean-600      Mid Tones    oklch(...)  Nearby darker state
```

The app names are examples only. Consumer apps own their semantic naming layer.

## CSS Variables

Export primitives with scale and weight visible:

```css
:root {
  --palette-neutral-050: oklch(...);
  --palette-neutral-900: oklch(...);
  --palette-ocean-550: oklch(...);
  --palette-ocean-600: oklch(...);
}
```

Then alias primitives into app-owned names:

```css
:root {
  --canvas-default: var(--palette-neutral-050);
  --ink-default: var(--palette-neutral-900);
  --checkout-cta-bg: var(--palette-ocean-550);
  --checkout-cta-bg-hover: var(--palette-ocean-600);
}
```

## Style Dictionary

```json
{
  "palette": {
    "neutral": {
      "050": { "$value": "oklch(...)" },
      "900": { "$value": "oklch(...)" }
    },
    "ocean": {
      "550": { "$value": "oklch(...)" },
      "600": { "$value": "oklch(...)" }
    }
  },
  "canvas": {
    "default": { "$value": "{palette.neutral.050}" }
  },
  "ink": {
    "default": { "$value": "{palette.neutral.900}" }
  },
  "checkout": {
    "cta": {
      "bg": { "$value": "{palette.ocean.550}" },
      "bgHover": { "$value": "{palette.ocean.600}" }
    }
  }
}
```

## Teaching Summary

When explaining Tonal Foundry to a consumer:

1. Teach `scale-weight` primitives first.
2. Explain tonal categories as density bands.
3. Show how categories guide primitive choice.
4. Show how the app's own names point to primitives.
5. Read contrast output before finalizing text/icon pairings.
