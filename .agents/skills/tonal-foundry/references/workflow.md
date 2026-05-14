# Workflow

## Create A Palette

1. Define the palette's purpose: one app, product family, brand system, theme, or exploration.
2. Choose scale names that belong to the product or brand.
3. Add keys for each scale. The first key is the anchor key and establishes the main identity of the scale. Subsequent keys are supporting keys that guide the ramp through important colors, desired midpoints, preserved brand colors, or UI-critical colors.
4. Generate weighted swatches across the current weight set.
5. Interpret generated output for use by reading weight, tonal category, color space, gamut, and contrast data.
6. Revise keys only when output shows the scale does not support the intended use.
7. Export primitives before creating app semantic aliases.

Choose scales the team can remember. Separate neutral scales from chromatic scales when the UI needs stable surfaces and text. Include feedback-like or status-like scales only if the product needs them. Avoid naming every scale after a UI component or treating any preset semantic name set as required.

## Read Generated Output

Use the CLI or app output as the source of color facts. The human/agent job is to interpret the output:

- Does each scale have a clear reason to exist?
- Are important keys represented acceptably?
- Does the scale behave well across needed tonal categories?
- Are gamut issues surfaced and understood?
- Do common foreground/background pairings have contrast notes?
- Does exact anchor or supporting-key preservation create neighboring swatch tradeoffs?

## Apply In An App

Use tonal categories to narrow the choice before selecting an exact primitive:

- Highlights: light surfaces, bright foregrounds in dark contexts, subtle fills.
- 1/4 Tones: light-mode borders, quiet separators, low-emphasis fills.
- Mid Tones: brand expression, active states, focus treatment, strong controls, accents.
- 3/4 Tones: readable foregrounds in light contexts, strong outlines, dense supporting UI.
- Shadows: dark surfaces, darkest foregrounds in light contexts, high-density anchors.

Then choose the exact scale and weight based on app intent, emitted contrast output, and mode. Tune light and dark modes separately; do not mechanically invert weights.

## Migrate Or Audit

When mapping an existing color system:

1. Inventory existing colors, names, and usages.
2. Assign each color to the closest Tonal Foundry weight by perceptual lightness.
3. Preserve old token names as consumer semantic aliases when useful.
4. Create scale-weight primitives beneath those aliases.
5. Document mismatches, missing weights, contrast changes, gamut changes, and naming-layer confusion.

Common findings include hidden primitives, inserted weights, weak category coverage, brand scales used as neutral surfaces, dark mode produced by inversion, and text/icon pairings that ignore emitted contrast data.
