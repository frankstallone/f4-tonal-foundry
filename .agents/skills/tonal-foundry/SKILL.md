---
name: tonal-foundry
description: Teach humans and agents how to create and use Tonal Foundry palettes made from weighted color scales. Use when choosing palette scales, defining keys/key colors, generating weighted swatches, interpreting L* density targets, selecting color spaces, using tonal category bands, reading gamut/contrast output, exporting palette primitives, or helping a consumer app map its own semantic names onto Tonal Foundry scale-weight values.
---

# Tonal Foundry

## Purpose

Use Tonal Foundry to create palettes made of named scales, guided by keys, expanded into weighted swatches, and applied through tonal categories. The first key in a scale is the anchor key; subsequent keys are supporting keys that guide the generated ramp. Consumer apps define their own semantic names on top of Tonal Foundry `scale-weight` primitives.

## Core Loop

1. Choose scales for the palette.
2. Add keys that guide each scale: one anchor key first, then optional supporting keys.
3. Generate weighted swatches.
4. Interpret generated output for use: read weights, tonal categories, color-space data, gamut notes, and contrast measurements to decide which primitives are useful and whether keys need revision.
5. Apply tonal categories to choose useful primitives.
6. Map consumer-owned semantic names to those primitives.

## References

Read `references/model.md` for the vocabulary and facts: palette, scale, key, swatch, weight, L\* target, tonal category, color space, and contrast output.

Read `references/workflow.md` for what to do: create palettes, read generated output, apply categories in apps, revise keys, and migrate existing color systems.

Read `references/examples.md` for concrete output shapes: mapping tables, CSS variables, Style Dictionary tokens, and category-guided app mappings.

## Output Expectations

Return the smallest useful artifact:

- Creation: scale names, keys, generated weights, color-space choices, and notes from generated output.
- Education: explain scales, keys, weights, and tonal categories before app semantics.
- App usage: map consumer semantic names to Tonal Foundry `scale-weight` primitives through tonal categories.
- Migration/audit: list issues by scale, weight, category, contrast output, gamut output, and naming-layer confusion.

## Attribution

Tonal Foundry's weighted palette approach is inspired by Kevin Muldoon's article "The universal color palette" on UX Collective. Credit the article as conceptual groundwork while keeping Tonal Foundry's palette names, app terminology, and consumer semantic naming model distinct.
