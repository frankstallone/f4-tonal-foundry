# Plan 004: Keep editor route and Palette identity aligned

> **Executor instructions**: Follow every step and verification. Touch only the
> two route files in scope. Stop on any STOP condition and report. The reviewer
> owns the plan index.
>
> **Drift check (run first)**:
> `git diff --stat d160a40..HEAD -- src/lib/palettes.ts src/lib/palettes.test.ts src/store/palette-editor-store.ts app/dashboard/dashboard-client.tsx app/palettes/[id]/edit/page.tsx`
> Quote the editor path if needed. Compare the live Share intake, Edit handler,
> editor initialization effect, and Save handler with this plan.

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: MED
- **Depends on**: none
- **Category**: bug
- **Planned at**: commit `d160a40`, 2026-08-30

## Why this matters

A shared Palette exists only in dashboard component state. Edit navigation does
not stage it in the editor store, so the editor falls back to the unrelated seed
Palette. Save then prefers that fallback ID and can overwrite Palette 1. Route,
store, and saved record identity must agree at every write boundary.

## Current state

- `app/dashboard/dashboard-client.tsx:254-273` creates a shared Palette only in
  dashboard state.
- `app/dashboard/dashboard-client.tsx:295-299` stages a new Palette before Create
  navigation; `:301-304` does not stage the selected Palette before Edit.
- `app/palettes/[id]/edit/page.tsx:711-722` loads a stored Palette, accepts a
  matching staged ID, or substitutes `seedPalette` with ID 1.
- `app/palettes/[id]/edit/page.tsx:632-646` saves with
  `state.paletteId || paletteId`, allowing the store identity to override the
  route.
- Zustand mutations are called imperatively with
  `usePaletteEditorStore.getState()` in the existing Create handler. Reuse that
  established pattern.

## Commands you will need

| Purpose   | Command                                 | Expected on success                           |
| --------- | --------------------------------------- | --------------------------------------------- |
| Tests     | `npm run test`                          | all tests pass                                |
| Typecheck | `npx tsc --noEmit --incremental false`  | exit 0                                        |
| Lint      | `npm run lint`                          | exit 0; existing unrelated warning may remain |
| Build     | `npm run build`                         | production build succeeds                     |
| Browser   | `npm run dev` plus browser verification | scenarios below pass                          |

## Scope

**In scope**:

- `src/lib/palettes.ts`
- `src/lib/palettes.test.ts` (create)
- `src/store/palette-editor-store.ts`
- `app/dashboard/dashboard-client.tsx`
- `app/palettes/[id]/edit/page.tsx`

**Out of scope**:

- Persisting a shared Palette before the user saves it.
- Adding schema migrations or compatibility fallbacks.
- Changing generated Palette IDs.
- Adding Playwright infrastructure; browser verification is run by the outer
  shipping workflow because this repository has no DOM/browser test harness.
- Replacing the global Zustand store with a provider.

## Git workflow

- Stay on `codex/improve-top-five`.
- Commit only the in-scope paths with message `Keep palette editor identity aligned`.
- Do not push or open a PR.

## Steps

### Step 1: Define route identity and readiness as pure rules

Add helpers beside Palette persistence that accept only canonical positive safe
decimal route IDs, resolve stored Palette first, same-ID staged draft second,
and a fresh route-scoped seed draft last, and report readiness only when route,
initialized, and store IDs match. Add table-driven Node tests. Parse before any
`loadPalettes` call so invalid IDs cannot trigger storage migration.

**Verify**: `npm run test -- src/lib/palettes.test.ts` → all tests pass.

### Step 2: Separate staging from editor initialization

Remove `window.location` and localStorage reads from store module initialization.
Start from static seed state with `initializedPaletteId: null`. Add
`stagePalette`, which applies a dashboard draft and clears readiness, and
`initializePalette`, which atomically accepts only a matching route/Palette ID
and marks that route ready. Remove the ambiguous `setPalette` handoff.

**Verify**: typecheck passes and store initialization contains no browser read.

### Step 3: Stage every selected Palette before Edit navigation

In `handleEditPalette`, call `stagePalette(selectedPalette)` before pushing the
editor route. Update Create to use the same staging transition. This applies to
stored and ephemeral shared Palettes without prematurely writing localStorage.

**Verify**: inspect the handlers and confirm `stagePalette` occurs before
`router.push` for both Create and Edit.

### Step 4: Initialize by explicit precedence

Keep the initialization precedence:

1. a stored Palette whose ID equals the route ID;
2. an already staged editor Palette whose ID equals the route ID;
3. otherwise, create a fresh unsaved seed draft with the exact route ID and the
   name `Palette <id>`.

Invalid or unsafe route syntax returns to the dashboard before any store or
storage read. Delete the `setPalette(seedPalette)` mismatch path and initialize
the resolved record atomically.

**Verify**: `rg "setPalette\(seedPalette\)" 'app/palettes/[id]/edit/page.tsx'`
→ no matches.

### Step 5: Guard the write boundary

Compute one readiness value requiring route ID, `initializedPaletteId`, and
store `paletteId` to match. Disable Save while false and repeat the same guard
inside `handleSavePalette`. Once guarded, set the saved record ID from the route
ID explicitly; do not use fallback truthiness.

This guard is defense in depth: navigation/effect timing must never turn a
stale store record into a write against another Palette.

**Verify**: `rg "state.paletteId \|\| paletteId" 'app/palettes/[id]/edit/page.tsx'`
→ no matches.

### Step 6: Run browser scenarios

Use a deterministic browser profile/localStorage state and verify:

1. Existing Palette 1 → Edit → Save updates Palette 1.
2. Create → Edit shows the staged new Palette and saves its generated ID.
3. Share link → Edit preserves shared name, Scale order, Keys, and Output Space;
   Save creates/updates the shared generated ID and leaves Palette 1 unchanged.
4. Unknown valid `/42/edit` initializes an unsaved route-scoped draft and saves
   only ID 42.
5. Invalid, non-canonical, or unsafe IDs return to dashboard without store or
   storage mutation.

Capture observed IDs before and after each Save. Then run all repository checks.

## Test plan

- Automated engine tests remain green.
- Deliberate test exception: no committed component/E2E test is added because
  browser infrastructure is a separate audited finding and is outside this
  selected plan. The four browser scenarios above are mandatory verification,
  not optional manual judgment.

## Done criteria

- [ ] Edit stages `selectedPalette` before navigation.
- [ ] Staging clears readiness; only same-ID editor initialization sets it.
- [ ] No unresolved route substitutes a Palette with another ID.
- [ ] Save rejects route/initialized/store mismatch before localStorage mutation.
- [ ] All four browser scenarios pass with recorded identities.
- [ ] Tests, typecheck, lint, and build pass.
- [ ] Only the two in-scope route files changed.

## STOP conditions

- A shared Palette cannot be staged without persisting it.
- Route parsing or resolution cannot remain a pure function.
- A browser scenario changes Palette 1 unexpectedly.
- The fix requires a Zustand-store schema change.

## Maintenance notes

The invariant is simple: route ID, initialized ID, store ID, and saved record ID
must be equal. Browser-test infrastructure should later encode these scenarios
as the first persistence journey.
