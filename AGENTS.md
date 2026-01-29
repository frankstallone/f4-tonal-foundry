# Repository Guidelines

## Project Structure & Module Organization

- `app/`: Next.js App Router routes (`page.tsx`, `layout.tsx`, route folders like `palettes/[id]/edit`).
- `components/`: Shared UI components, including `components/ui/` primitives (Base UI-based).
- `src/engine/`: Palette/scale generation logic and algorithms.
- `src/lib/`: Client utilities (e.g., palette persistence).
- `src/store/`: Zustand state stores.
- `public/`: Static assets.
- `app/globals.css`: Tailwind v4 styles and global utilities.

## Build, Test, and Development Commands

- `npm run dev`: Start the Next.js dev server.
- `npm run build`: Production build (type-check + bundle).
- `npm run start`: Run the production server after build.
- `npm run lint`: Run ESLint.
- `npm run test`: Run Vitest test suite once.
- `npm run test:watch`: Watch mode for Vitest.
- `npm run format`: Prettier format all files.

## Coding Style & Naming Conventions

- TypeScript + React 19 + Next.js 16. Use modern React patterns and hooks.
- Formatting is enforced by Prettier and ESLint; follow existing style (2‑space indent, single quotes, no semicolons).
- Component names use `PascalCase`; hooks use `useSomething`.
- App Router files follow Next.js conventions (`page.tsx`, `layout.tsx`).
- Prefer shared UI primitives in `components/ui/` before adding new patterns.

## Testing Guidelines

- Tests use Vitest; current tests live in `src/engine/__tests__/`.
- Naming: `*.test.ts` (e.g., `palette.test.ts`).
- Add tests for engine logic changes and ensure `npm run test` is green.

## Commit & Pull Request Guidelines

- Commit messages are short, imperative, sentence case (examples: “Optimize palette editor updates”, “Fix lint warnings”).
- PRs should include a clear summary, linked issue (if any), and screenshots for UI changes.
- Ensure `npm run lint`, `npm run build`, and `npm run test` pass before requesting review.

## Configuration Notes

- Tailwind v4 is configured via `app/globals.css` and `postcss.config.mjs`.
- Local storage persistence lives in `src/lib/palettes.ts`; be careful with SSR-safe access (`typeof window`).

## Mise en Mode ↔ Tonal Categories Mapping

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
