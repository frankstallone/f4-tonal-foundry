# Plan 003: Report the rendered foreground metric

> **Executor instructions**: Execute each step and verification exactly. Touch
> only the files in scope. Stop on a STOP condition. The reviewer updates the
> plan index.
>
> **Drift check (run first)**:
> `git diff --stat d160a40..HEAD -- app/dashboard/dashboard-client.tsx app/palettes/[id]/edit/page.tsx src/lib/swatch-display.ts src/lib/swatch-display.test.ts`
> Quote the bracketed editor path if the shell expands it.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: bug
- **Planned at**: commit `d160a40`, 2026-08-30

## Why this matters

The Swatch preview can render dark foreground text while displaying the WCAG
ratio against white. On a white Swatch this reports `1:1` beside black text that
actually has `21:1`, so the primary accessibility readout is false. Dashboard
and editor duplicate this logic, and both label CAM16 J as `L*`.

## Current state

- `app/dashboard/dashboard-client.tsx:71-104` owns one copy of
  `getContrastLabel` and `swatchTextColor`.
- `app/palettes/[id]/edit/page.tsx:121-154` contains the same copy.
- `src/engine/swatch.ts:53-60` already exposes `wcag_white`, `wcag_black`,
  APCA values, `lab_d65_l`, `oklab_l`, `cam16_j`, and `hct_t`.
- Shared pure client utilities live in `src/lib/`; keep presentation rules out
  of the engine.

Current mismatch:

```ts
if (contrast === 'WCAG21') {
  return `${swatch.wcag_white.toFixed(2)}:1`
}

if (contrast === 'WCAG21') {
  return swatch.lab_d65_l < 50 ? '#ffffff' : '#111111'
}
```

## Commands you will need

| Purpose      | Command                                          | Expected on success                           |
| ------------ | ------------------------------------------------ | --------------------------------------------- |
| Focused test | `npm run test -- src/lib/swatch-display.test.ts` | all tests pass                                |
| Full tests   | `npm run test`                                   | all tests pass                                |
| Typecheck    | `npx tsc --noEmit --incremental false`           | exit 0                                        |
| Lint         | `npm run lint`                                   | exit 0; existing unrelated warning may remain |
| Build        | `npm run build`                                  | production build succeeds                     |

## Scope

**In scope**:

- `src/lib/swatch-display.ts` (create)
- `src/lib/swatch-display.test.ts` (create)
- `app/dashboard/dashboard-client.tsx`
- `app/palettes/[id]/edit/page.tsx`

**Out of scope**:

- Changing metric computation or the larger-contrast selection rule.
- Changing any engine metric or contrast algorithm.
- Extracting the broader Palette preview component.
- Restyling Swatches or changing metric option names other than CAM16's unit.

## Git workflow

- Stay on `codex/improve-top-five`.
- Commit only in-scope paths with message `Fix swatch contrast labels`.
- Do not push or open a PR.

## Steps

### Step 1: Add a shared presentation helper

Create a pure helper that resolves both `foreground` and `label` from one Swatch
and selected metric. For WCAG, choose the larger stored white or black ratio and
render its exact engine reference color: `#ffffff` or `#000000`. Preserve the
current APCA larger-absolute-ratio selection while also rendering its exact
reference color. Preserve all other formatting. Return CAM16 as `J <value>`,
not `L* <value>`.

One function returning both fields is preferred because it makes mismatch
unrepresentable. Keep the accepted metric values explicit with a local union or
readonly tuple instead of accepting arbitrary hidden modes.

**Verify**: `npx tsc --noEmit --incremental false` → exit 0.

### Step 2: Prove the paired behavior

Add focused tests for a white Swatch, black Swatch, and mid-tone Swatch. Assert
that each WCAG label uses the metric for the returned foreground. Assert CAM16
uses the `J` label. Also retain one APCA and one CIE L\* formatting assertion so
the extraction does not change those modes.

Use a small complete `Swatch` fixture or a narrow builder in the test; do not
call the display helper to compute its own expected values.

**Verify**: `npm run test -- src/lib/swatch-display.test.ts` → all
tests pass.

### Step 3: Replace both route-local copies

Import and use the shared helper in dashboard and editor. Delete both local
label/text-color implementations. The Swatch DOM structure and styling should
remain unchanged.

**Verify**:
`rg "const getContrastLabel|const swatchTextColor" app/dashboard app/palettes`
→ no matches, then run the full test, typecheck, lint, and build commands.

## Test plan

- White Swatch returns dark text and `wcag_black`.
- Black Swatch returns white text and `wcag_white`.
- Mid-tone chooses the larger ratio and reports the matching foreground pair.
- A WCAG tie chooses black deterministically.
- CAM16 label starts with `J`, while CIE and OK Lab retain `L*`.
- APCA retains the larger absolute-contrast foreground behavior.

## Done criteria

- [ ] Dashboard and editor use one shared presentation helper.
- [ ] WCAG label and rendered foreground always refer to the same pair.
- [ ] CAM16 is labeled J.
- [ ] Focused and full tests, typecheck, lint, and build pass.
- [ ] No unrelated markup or styling changed.

## STOP conditions

- The existing foreground selection rule must change to satisfy the tests.
- Dashboard and editor require different product behavior.
- Extraction requires moving React component state or markup.

## Maintenance notes

Future metrics belong in the shared helper and its table-driven tests. A later
Palette-preview consolidation may move this helper, but should not duplicate it.
