# Tonal Category Mapping

## Mise en Mode ↔ Tonal Categories

Purpose category mapping (recommended):

- Surface (containers, overlays): Highlights in light mode (000/025/050) → Shadows in dark mode (900/950/999).
- Action (interactive buttons): Mid Tones for fills (400–600), with text in Highlights on dark fills.
- Control (form inputs/selects): Treat as surfaces (Highlights/Shadow surfaces), with borders in 1/4 Tones and focus rings in Mid Tones.
- Text & Icons: 3/4 Tones + Shadows in light mode (650–900), Highlights in dark mode (025–050).
- Borders & Dividers: 1/4 Tones only (100–350) in light mode; nearest step above base surface in dark mode (typically 800–850).

## Token Matrix (Aligned to 22‑Step Weights)

Use these weight assignments as a starting matrix; adjust per product needs while staying in-category.

### Light Mode (Highlights / Mid / 3⁄4)

Surface

- surface.page: 075
- surface.chrome (topbar/sidebar): 075
- surface.content: 050
- surface.raised: 025
- surface.overlay: 000

Controls (surface‑based)

- control.bg: 025 (or 050 if you want more weight)
- control.border: 150–200
- control.focusRing: 450–550

Actions

- action.primary.bg: 550
- action.primary.hover: 600
- action.primary.pressed: 650
- action.secondary.bg: 450
- action.secondary.hover: 500
- action.secondary.pressed: 550

Text & Icons

- text.primary: 900
- text.secondary: 650–700
- text.muted: 600

Dividers

- border.default: 150
- border.subtle: 100

### Dark Mode (Shadows / Mid / Highlights)

Surface

- surface.page: 950
- surface.chrome (topbar/sidebar): 900
- surface.content: 800
- surface.raised: 900
- surface.overlay: 999

Controls (surface‑based)

- control.bg: 900–850
- control.border: 850–800
- control.focusRing: 450–550

Actions

- action.primary.bg: 550 (in semantic scale)
- action.primary.hover: 600
- action.primary.pressed: 650
- action.secondary.bg: 450
- action.secondary.hover: 500
- action.secondary.pressed: 550

Text & Icons

- text.primary: 050
- text.secondary: 300
- text.muted: 350–400

Dividers

- border.default: 850
- border.subtle: 800
