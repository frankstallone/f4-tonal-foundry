# Model

## Vocabulary

- Palette: a collection of related scales for a product, brand, theme, or design system.
- Scale: a generated color ramp with stable weight positions.
- Key: a color used to guide scale generation. The first key is the anchor key; subsequent keys are supporting keys.
- Swatch: one generated color at one weight.
- Weight: a three-digit density label.
- Tonal category: a broad density band over the weight scale.
- Primitive: a `scale-weight` value, such as `neutral-050` or `ocean-550`.
- Consumer semantic name: an app-owned alias that points to a primitive.

Keep the layers separate. Scales identify color families, weights identify density positions, tonal categories group densities, and consumer semantic names identify product intent.

## Weights And Targets

When working in this repo, use the exported constants as source of truth.

```text
Weights:
000 025 050 075 100 150 200 250 300 350 400 450
500 550 600 650 700 750 800 850 900 950 999

L* targets:
100 97.5 95 92.5 90 85 80 75 70 65 60 55
50 45 40 35 30 25 20 15 10 5 0
```

Lower weights are lighter, higher weights are darker, `500` is the middle density, `250` is the quarter-tone anchor, `750` is the three-quarter-tone anchor, and `000`/`999` are endpoints.

## Tonal Categories

```text
Highlights: 000-075
1/4 Tones: 100-350
Mid Tones: 400-600
3/4 Tones: 650-900
Shadows: 950-999
```

Use categories as density bands for choosing and discussing swatches. They are not semantic token names.

## Color And Contrast

- CIE L\* is the density anchor used for weight assignment in this app.
- OKLCH is useful for modern CSS output and interpolation workflows.
- sRGB and P3 are output gamut choices, not the whole palette model.
- Do not assume CIE L\*, OKLCH L, HCT tone, and CAM16 J are interchangeable.
- Weights help predict density, but actual contrast depends on the pair.
- Read emitted WCAG/APCA values for text, icons, visible borders, and controls.
- Surface gamut clipping or mapping decisions when exporting colors.
