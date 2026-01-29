# Prism Color

Prism Color is a palette lab for building multi-scale color systems, comparing
contrast metrics, and previewing optimized swatches in real time. It is a
modern take on Kevin Muldoon's original Prism Color work, inspired by
[prismcolor.io](https://github.com/caoimghgin/prismcolor.io).

## Highlights

- Create and manage multiple palettes with local persistence.
- Edit scales with multiple color keys and immediate swatch previews.
- Switch optimization presets to balance universal weights and accessibility.
- Compare contrast readouts across WCAG 2.1, APCA, CIE L*, Ok L*, CAM16, and HCT.
- Visual flags for anchors, key colors, locked endpoints, and out-of-gamut
  swatches.

## How it works

1. Start on the dashboard (`/dashboard`) to view all saved palettes.
2. Create or select a palette to open the editor (`/palettes/[id]/edit`).
3. Adjust key colors, locks, and scale settings to regenerate swatches live.
4. Review contrast metrics and optimization presets to validate the system.
5. Changes persist locally in the browser (no backend required).

## Tech stack

- Next.js 16 App Router + React 19
- Tailwind CSS v4 + Base UI + React Aria Components
- Zustand state + Color.js for color parsing
- Vitest for engine coverage

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000 to reach the dashboard.

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run test
npm run test:watch
npm run format
```

## Project structure

```
.
├── app/                 # App Router routes and layouts
│   ├── dashboard/       # Palette dashboard
│   ├── palettes/        # Palette editor routes
│   ├── create/          # Redirects to dashboard
│   ├── layout.tsx       # Root layout
│   └── page.tsx         # Redirects to dashboard
├── components/          # Shared UI building blocks
├── public/              # Static assets
└── src/
    ├── engine/          # Palette and scale generation logic
    ├── lib/             # Client utilities and local storage helpers
    └── store/           # Zustand state containers
```

## Notes

Palette data is stored in the browser using localStorage under the
`prismcolor:palettes` key.
