# Plan 002: Make DTCG dictionaries prototype-safe

> **Executor instructions**: Follow this plan step by step. Run every
> verification command. Touch only the in-scope files. Stop instead of
> improvising when a STOP condition occurs. The reviewer maintains the index.
>
> **Drift check (run first)**:
> `git diff --stat d160a40..HEAD -- src/lib/share.ts src/lib/share.test.ts vitest.config.ts`
> Stop if live exporter structure no longer matches this plan.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: security
- **Planned at**: commit `d160a40`, 2026-08-30

## Why this matters

`buildDtcgTokens` indexes ordinary JavaScript objects with user-controlled
Palette and Scale names. An inherited-property name can pass the current
truthiness check and make weight assignments land on an inherited shared
object. DTCG output must treat every accepted name as inert data and must not
change any ambient object prototype.

## Current state

- `src/lib/share.ts:117-147` builds nested dictionaries with ordinary objects.
- `src/lib/share.ts:123-132` checks `if (!color[paletteKey][scaleKey])` before
  assigning through the user-controlled Scale key.
- `src/lib/share.ts:51-58` correctly permits arbitrary display names; this plan
  does not restrict product naming.
- Vitest discovers `src/**/*.test.ts`, so add `src/lib/share.test.ts` using the
  existing `describe`/`it`/`expect` style.

Current vulnerable shape:

```ts
// src/lib/share.ts:119
const color: DtcgTokens['color'] = {
  [paletteKey]: {},
}

if (!color[paletteKey][scaleKey]) {
  color[paletteKey][scaleKey] = {}
}
```

## Commands you will need

| Purpose      | Command                                 | Expected on success                           |
| ------------ | --------------------------------------- | --------------------------------------------- |
| Focused test | `npm run test -- src/lib/share.test.ts` | all tests pass                                |
| Full tests   | `npm run test`                          | all tests pass                                |
| Typecheck    | `npx tsc --noEmit --incremental false`  | exit 0                                        |
| Lint         | `npm run lint`                          | exit 0; existing unrelated warning may remain |

## Scope

**In scope**:

- `src/lib/share.ts`
- `src/lib/share.test.ts` (create)
- `vitest.config.ts` when an explicit root alias is required for the existing
  runtime `@/` imports; add no package or plugin.

**Out of scope**:

- DTCG missing-hue representation.
- DTCG naming normalization or duplicate Scale-name behavior.
- Tailwind export.
- Share-payload validation.

## Git workflow

- Stay on `codex/improve-top-five`.
- Commit only in-scope paths with message `Harden DTCG token dictionaries`.
- Do not push or open a PR.

## Steps

### Step 1: Add the regression test

Create a normal generated Scale and defensive cases selected from JavaScript's
inherited object-property names. Capture complete property descriptors for
every ambient target before export and restore them in `finally` before making
postconditions, so the expected red run cannot contaminate later tests. Assert
that:

- `buildDtcgTokens` returns the Scale as an own group;
- JSON serialization preserves that group;
- no own property was added to the ambient prototype;
- ordinary Palette and Scale names retain their current output shape.

Do not include a runnable misuse payload in comments or documentation. Keep the
test framed as defensive handling of reserved inherited names.

**Verify before the fix**: the reserved-name test fails against commit
`d160a40` because the group is not safely isolated or the prototype changes.

### Step 2: Replace dynamic dictionaries

Construct every dictionary keyed by Palette name, Scale name, or weight with a
null prototype. Use an own-property check when deciding whether a Scale group
exists. Keep the exported JSON shape and `DtcgTokens` public type unchanged for
ordinary names. Prefer one small typed dictionary factory only if it removes
repetition; do not introduce a general token-builder abstraction.

**Verify**: `npm run test -- src/lib/share.test.ts` → all tests pass.

### Step 3: Run repository checks

Run the full tests, typecheck, and lint. Inspect `git diff` to confirm no DTCG
contract change beyond safe dictionary ownership.

## Test plan

- Ordinary Palette and Scale names serialize exactly as before.
- A representative inherited-property name becomes an own Scale group.
- The relevant ambient prototype is byte-for-byte unchanged after export.
- Multiple ordinary Scales remain separate.

## Done criteria

- [ ] Dynamic DTCG dictionaries have null prototypes.
- [ ] Existence checks use own-property semantics.
- [ ] The defensive regression test passes and proves no ambient mutation.
- [ ] `npm run test`, typecheck, and lint pass.
- [ ] Only the two in-scope files changed.

## STOP conditions

- The fix appears to require restricting user-visible Palette or Scale names.
- JSON serialization of null-prototype dictionaries differs for ordinary data.
- The regression cannot demonstrate a failure on `d160a40`.

## Maintenance notes

Any future exporter that constructs dictionaries from Palette data must use the
same own-property rule. This plan intentionally does not solve DTCG conformance
or identifier collision findings that were not selected.
