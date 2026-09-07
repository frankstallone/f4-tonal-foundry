# Repository Guidelines

- Prefer shared UI primitives in `components/ui/`.
- Keep local storage access in `src/lib/palettes.ts` safe for SSR (`typeof window`).
- Add tests for engine logic changes. Verify affected behavior with the relevant lint, build, and test checks before review.
- PRs should include a clear summary, a linked issue when applicable, and screenshots for UI changes. Use short, imperative, sentence-case commit messages.

## Task references

- For palette or UI token mapping, read [tonal categories and the token matrix](docs/agents/tonal-mappings.md). Adjust weights for product needs within the tonal categories.
- For palette creation, output interpretation, export, or consumer semantic mapping, use the canonical [Tonal Foundry skill](.agents/skills/tonal-foundry/SKILL.md). For installation or distribution, read [skill installation](docs/agents/tonal-foundry-skill.md).
- When working with issues or PRDs, read [issue tracking](docs/agents/issue-tracker.md); for triage, read [triage labels](docs/agents/triage-labels.md).
- When exploring domain concepts or making architectural decisions, read [domain docs](docs/agents/domain.md).

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
