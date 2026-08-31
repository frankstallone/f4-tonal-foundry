# Plan 005: Use D65 for target selection and weight assignment

> **Executor instructions**: Execute only after Plan 001 is complete. Follow
> each verification and touch only the in-scope files. Stop on a STOP condition.
> The reviewer maintains the plan index.
>
> **Drift check (run first)**:
> `git diff --stat d160a40..HEAD -- src/engine/swatch.ts src/engine/utils.ts src/engine/__tests__/utils.test.ts src/engine/__tests__/scale.test.ts src/engine/__tests__/palette.test.ts src/engine/__tests__/cli-scale.test.ts src/engine/__tests__/fixtures/scale-goldens.ts`
> Test-file changes from completed Plan 001 are expected. Stop only if production
> `buildSwatch` or target selection changed independently.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: MED
- **Depends on**: `plans/001-freeze-engine-outputs.md`
- **Category**: bug
- **Planned at**: commit `d160a40`, 2026-08-30

## Why this matters

Generated candidates are selected against CIE Lab D65 targets, but
`buildSwatch` assigns their weight from Color.js's D50 Lab value. Chromatic
colors can therefore occupy one target position while carrying a neighboring
weight label. A `blue` single-Key Scale currently produces duplicate `700` and
omits `650`, so DTCG weight-key export can overwrite a Swatch.

## Current state

- `src/engine/scale.ts:35-46` selects each candidate by
  `curr.lab_d65.l` distance from the target.
- `src/engine/swatch.ts:34-37` assigns the selected Swatch with
  `luminanceToWeight(normalized.lab.l)`, which is D50.
- Dashboard and editor call the metric `CIE L* (d65)` and expose
  `swatch.lab_d65_l`.
- `src/engine/constants.ts` defines the exact ordered 23 weights. The returned
  Scale must contain that sequence once each.
- Plan 001 adds independent literal fixtures. Update only literals whose output
  intentionally changes under the corrected white point.

## Commands you will need

| Purpose       | Command                                                                                   | Expected on success                           |
| ------------- | ----------------------------------------------------------------------------------------- | --------------------------------------------- |
| Focused tests | `npm run test -- src/engine/__tests__/scale.test.ts src/engine/__tests__/palette.test.ts` | all pass                                      |
| Full tests    | `npm run test`                                                                            | all tests pass                                |
| Typecheck     | `npx tsc --noEmit --incremental false`                                                    | exit 0                                        |
| Lint          | `npm run lint`                                                                            | exit 0; existing unrelated warning may remain |
| Build         | `npm run build`                                                                           | production build succeeds                     |

## Scope

**In scope**:

- `src/engine/swatch.ts`
- `src/engine/utils.ts`
- `src/engine/__tests__/utils.test.ts`
- `src/engine/__tests__/scale.test.ts`
- `src/engine/__tests__/palette.test.ts`
- `src/engine/__tests__/cli-scale.test.ts`
- `src/engine/__tests__/fixtures/scale-goldens.ts`

**Out of scope**:

- Target or weight arrays.
- Interpolation spaces, Delta E steps, or gamut mapping.
- Exporter behavior.
- UI metric presentation.
- Any D50 compatibility mode or migration.

## Git workflow

- Stay on `codex/improve-top-five`.
- Commit only in-scope paths with message `Use D65 for scale weights`.
- Do not preserve the mixed-white-point behavior behind a flag or fallback.
- Do not push or open a PR.

## Steps

### Step 1: Add a failing invariant test

Add a regression using a single `blue` Key. Assert that the returned Swatch
weights equal the canonical ordered 23-weight array exactly: no duplicates, no
omissions, and array position agrees with `swatch.index`.

**Verify before the production fix**: the focused test fails because the
current output duplicates `700` and omits `650`.

### Step 2: Align names and weight assignment with target selection

Rename the target/weight helpers from generic luminance language to explicit Lab
D65 lightness language, including their focused tests. Remove the obsolete names
without aliases. In `buildSwatch`, pass `normalized.lab_d65.l` to the renamed
helper. Keep the stored D65 metric and every other Swatch field unchanged. Do
not add a white-point option or compatibility branch.

**Verify**: the focused `blue` regression passes and returns all 23 weights in
order. A source search finds no generic `.lab.l` in target or weight code and no
obsolete luminance helper name.

### Step 3: Review intentional fixture changes

Run the Plan 001 golden tests. Update only affected literal weight/color entries
to the corrected D65 output. For each changed fixture, inspect the diff and
confirm the change follows from the one-line white-point correction; stop if an
unrelated metric, endpoint, output space, or Alpha changes.

**Verify**: focused and full tests pass.

### Step 4: Run the full gate

Run typecheck, lint, and production build. Inspect the final diff to confirm the
only production change is D65 weight assignment.

## Test plan

- `blue` regression: exact ordered 23 weights, no duplicates or omissions.
- Existing single-key, multi-key, and P3 golden cases remain valid or receive
  reviewed D65-only literal updates.
- Every Scale in the seed Palette returns the canonical ordered weights.
- Existing locks, Key/anchor flags, and destination-space tests remain green.

## Done criteria

- [ ] Target selection and weight assignment both use Lab D65.
- [ ] The `blue` regression demonstrates red-before/green-after behavior.
- [ ] Every tested Scale has the exact ordered 23 weights.
- [ ] Golden fixture changes are limited to intentional D65 output.
- [ ] Tests, typecheck, lint, and build pass.
- [ ] Only in-scope files changed.

## STOP conditions

- The one-line D65 change does not restore the exact 23-weight sequence.
- Passing requires changing target values, interpolation, or gamut behavior.
- Alpha, destination space, or unrelated contrast metrics change.
- Plan 001 is not complete or its fixtures compute expectations dynamically.

## Maintenance notes

CIE Lab operations in scale generation now have one white-point invariant:
D65. Review future uses of `.lab.l` in target or weight code carefully; a new
D50 use must be an explicit, separately named product decision.
