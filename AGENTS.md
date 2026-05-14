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

## Tonal Foundry Skill

The canonical agent skill for creating and using Tonal Foundry palettes lives in `.agents/skills/tonal-foundry/`.

Use this repo copy as the versioned source of truth. Consumer apps can install it in either location:

- Repo-local shared skill: copy `.agents/skills/tonal-foundry` into the consumer repo's `.agents/skills/` directory and commit it.
- Codex user-global skill: copy `.agents/skills/tonal-foundry` into `${CODEX_HOME:-$HOME/.codex}/skills/` to make it available across repos on one machine.

After installation, invoke it as `$tonal-foundry` when teaching humans or agents how to create palettes of named scales, define keys, generate weighted swatches, understand color-space and tonal-category behavior, or map Tonal Foundry primitives into consumer-owned semantic names.

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

<!-- NEXT-AGENTS-MD-START -->[Next.js Docs Index]|root: ./.next-docs|STOP. What you remember about Next.js is WRONG for this project. Always search docs and read before any task.|If docs missing, run this command first: npx @next/codemod agents-md --output AGENTS.md|01-app/01-getting-started:{01-installation.mdx,02-project-structure.mdx,03-layouts-and-pages.mdx,04-linking-and-navigating.mdx,05-server-and-client-components.mdx,06-cache-components.mdx,07-fetching-data.mdx,08-updating-data.mdx,09-caching-and-revalidating.mdx,10-error-handling.mdx,11-css.mdx,12-images.mdx,13-fonts.mdx,14-metadata-and-og-images.mdx,15-route-handlers.mdx,16-proxy.mdx,17-deploying.mdx,18-upgrading.mdx}|01-app/02-guides:{analytics.mdx,authentication.mdx,backend-for-frontend.mdx,caching.mdx,ci-build-caching.mdx,content-security-policy.mdx,css-in-js.mdx,custom-server.mdx,data-security.mdx,debugging.mdx,draft-mode.mdx,environment-variables.mdx,forms.mdx,incremental-static-regeneration.mdx,instrumentation.mdx,internationalization.mdx,json-ld.mdx,lazy-loading.mdx,local-development.mdx,mcp.mdx,mdx.mdx,memory-usage.mdx,multi-tenant.mdx,multi-zones.mdx,open-telemetry.mdx,package-bundling.mdx,prefetching.mdx,production-checklist.mdx,progressive-web-apps.mdx,redirecting.mdx,sass.mdx,scripts.mdx,self-hosting.mdx,single-page-applications.mdx,static-exports.mdx,tailwind-v3-css.mdx,third-party-libraries.mdx,videos.mdx}|01-app/02-guides/migrating:{app-router-migration.mdx,from-create-react-app.mdx,from-vite.mdx}|01-app/02-guides/testing:{cypress.mdx,jest.mdx,playwright.mdx,vitest.mdx}|01-app/02-guides/upgrading:{codemods.mdx,version-14.mdx,version-15.mdx,version-16.mdx}|01-app/03-api-reference:{07-edge.mdx,08-turbopack.mdx}|01-app/03-api-reference/01-directives:{use-cache-private.mdx,use-cache-remote.mdx,use-cache.mdx,use-client.mdx,use-server.mdx}|01-app/03-api-reference/02-components:{font.mdx,form.mdx,image.mdx,link.mdx,script.mdx}|01-app/03-api-reference/03-file-conventions/01-metadata:{app-icons.mdx,manifest.mdx,opengraph-image.mdx,robots.mdx,sitemap.mdx}|01-app/03-api-reference/03-file-conventions:{default.mdx,dynamic-routes.mdx,error.mdx,forbidden.mdx,instrumentation-client.mdx,instrumentation.mdx,intercepting-routes.mdx,layout.mdx,loading.mdx,mdx-components.mdx,not-found.mdx,page.mdx,parallel-routes.mdx,proxy.mdx,public-folder.mdx,route-groups.mdx,route-segment-config.mdx,route.mdx,src-folder.mdx,template.mdx,unauthorized.mdx}|01-app/03-api-reference/04-functions:{after.mdx,cacheLife.mdx,cacheTag.mdx,connection.mdx,cookies.mdx,draft-mode.mdx,fetch.mdx,forbidden.mdx,generate-image-metadata.mdx,generate-metadata.mdx,generate-sitemaps.mdx,generate-static-params.mdx,generate-viewport.mdx,headers.mdx,image-response.mdx,next-request.mdx,next-response.mdx,not-found.mdx,permanentRedirect.mdx,redirect.mdx,refresh.mdx,revalidatePath.mdx,revalidateTag.mdx,unauthorized.mdx,unstable_cache.mdx,unstable_noStore.mdx,unstable_rethrow.mdx,updateTag.mdx,use-link-status.mdx,use-params.mdx,use-pathname.mdx,use-report-web-vitals.mdx,use-router.mdx,use-search-params.mdx,use-selected-layout-segment.mdx,use-selected-layout-segments.mdx,userAgent.mdx}|01-app/03-api-reference/05-config/01-next-config-js:{adapterPath.mdx,allowedDevOrigins.mdx,appDir.mdx,assetPrefix.mdx,authInterrupts.mdx,basePath.mdx,browserDebugInfoInTerminal.mdx,cacheComponents.mdx,cacheHandlers.mdx,cacheLife.mdx,compress.mdx,crossOrigin.mdx,cssChunking.mdx,devIndicators.mdx,distDir.mdx,env.mdx,expireTime.mdx,exportPathMap.mdx,generateBuildId.mdx,generateEtags.mdx,headers.mdx,htmlLimitedBots.mdx,httpAgentOptions.mdx,images.mdx,incrementalCacheHandlerPath.mdx,inlineCss.mdx,isolatedDevBuild.mdx,logging.mdx,mdxRs.mdx,onDemandEntries.mdx,optimizePackageImports.mdx,output.mdx,pageExtensions.mdx,poweredByHeader.mdx,productionBrowserSourceMaps.mdx,proxyClientMaxBodySize.mdx,reactCompiler.mdx,reactMaxHeadersLength.mdx,reactStrictMode.mdx,redirects.mdx,rewrites.mdx,sassOptions.mdx,serverActions.mdx,serverComponentsHmrCache.mdx,serverExternalPackages.mdx,staleTimes.mdx,staticGeneration.mdx,taint.mdx,trailingSlash.mdx,transpilePackages.mdx,turbopack.mdx,turbopackFileSystemCache.mdx,typedRoutes.mdx,typescript.mdx,urlImports.mdx,useLightningcss.mdx,viewTransition.mdx,webVitalsAttribution.mdx,webpack.mdx}|01-app/03-api-reference/05-config:{02-typescript.mdx,03-eslint.mdx}|01-app/03-api-reference/06-cli:{create-next-app.mdx,next.mdx}|02-pages/01-getting-started:{01-installation.mdx,02-project-structure.mdx,04-images.mdx,05-fonts.mdx,06-css.mdx,11-deploying.mdx}|02-pages/02-guides:{analytics.mdx,authentication.mdx,babel.mdx,ci-build-caching.mdx,content-security-policy.mdx,css-in-js.mdx,custom-server.mdx,debugging.mdx,draft-mode.mdx,environment-variables.mdx,forms.mdx,incremental-static-regeneration.mdx,instrumentation.mdx,internationalization.mdx,lazy-loading.mdx,mdx.mdx,multi-zones.mdx,open-telemetry.mdx,package-bundling.mdx,post-css.mdx,preview-mode.mdx,production-checklist.mdx,redirecting.mdx,sass.mdx,scripts.mdx,self-hosting.mdx,static-exports.mdx,tailwind-v3-css.mdx,third-party-libraries.mdx}|02-pages/02-guides/migrating:{app-router-migration.mdx,from-create-react-app.mdx,from-vite.mdx}|02-pages/02-guides/testing:{cypress.mdx,jest.mdx,playwright.mdx,vitest.mdx}|02-pages/02-guides/upgrading:{codemods.mdx,version-10.mdx,version-11.mdx,version-12.mdx,version-13.mdx,version-14.mdx,version-9.mdx}|02-pages/03-building-your-application/01-routing:{01-pages-and-layouts.mdx,02-dynamic-routes.mdx,03-linking-and-navigating.mdx,05-custom-app.mdx,06-custom-document.mdx,07-api-routes.mdx,08-custom-error.mdx}|02-pages/03-building-your-application/02-rendering:{01-server-side-rendering.mdx,02-static-site-generation.mdx,04-automatic-static-optimization.mdx,05-client-side-rendering.mdx}|02-pages/03-building-your-application/03-data-fetching:{01-get-static-props.mdx,02-get-static-paths.mdx,03-forms-and-mutations.mdx,03-get-server-side-props.mdx,05-client-side.mdx}|02-pages/03-building-your-application/06-configuring:{12-error-handling.mdx}|02-pages/04-api-reference:{06-edge.mdx,08-turbopack.mdx}|02-pages/04-api-reference/01-components:{font.mdx,form.mdx,head.mdx,image-legacy.mdx,image.mdx,link.mdx,script.mdx}|02-pages/04-api-reference/02-file-conventions:{instrumentation.mdx,proxy.mdx,public-folder.mdx,src-folder.mdx}|02-pages/04-api-reference/03-functions:{get-initial-props.mdx,get-server-side-props.mdx,get-static-paths.mdx,get-static-props.mdx,next-request.mdx,next-response.mdx,use-report-web-vitals.mdx,use-router.mdx,userAgent.mdx}|02-pages/04-api-reference/04-config/01-next-config-js:{adapterPath.mdx,allowedDevOrigins.mdx,assetPrefix.mdx,basePath.mdx,bundlePagesRouterDependencies.mdx,compress.mdx,crossOrigin.mdx,devIndicators.mdx,distDir.mdx,env.mdx,exportPathMap.mdx,generateBuildId.mdx,generateEtags.mdx,headers.mdx,httpAgentOptions.mdx,images.mdx,isolatedDevBuild.mdx,onDemandEntries.mdx,optimizePackageImports.mdx,output.mdx,pageExtensions.mdx,poweredByHeader.mdx,productionBrowserSourceMaps.mdx,proxyClientMaxBodySize.mdx,reactStrictMode.mdx,redirects.mdx,rewrites.mdx,serverExternalPackages.mdx,trailingSlash.mdx,transpilePackages.mdx,turbopack.mdx,typescript.mdx,urlImports.mdx,useLightningcss.mdx,webVitalsAttribution.mdx,webpack.mdx}|02-pages/04-api-reference/04-config:{01-typescript.mdx,02-eslint.mdx}|02-pages/04-api-reference/05-cli:{create-next-app.mdx,next.mdx}|03-architecture:{accessibility.mdx,fast-refresh.mdx,nextjs-compiler.mdx,supported-browsers.mdx}|04-community:{01-contribution-guide.mdx,02-rspack.mdx}<!-- NEXT-AGENTS-MD-END -->
