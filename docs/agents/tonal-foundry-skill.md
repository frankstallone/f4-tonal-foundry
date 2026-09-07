# Tonal Foundry Skill

The canonical agent skill for creating and using Tonal Foundry palettes lives in `.agents/skills/tonal-foundry/`.

Use this repo copy as the versioned source of truth. Consumer apps can install it in either location:

- Repo-local shared skill: copy `.agents/skills/tonal-foundry` into the consumer repo's `.agents/skills/` directory and commit it.
- Codex user-global skill: copy `.agents/skills/tonal-foundry` into `${CODEX_HOME:-$HOME/.codex}/skills/` to make it available across repos on one machine.

After installation, invoke it as `$tonal-foundry` when teaching humans or agents how to create palettes of named scales, define keys, generate weighted swatches, understand color-space and tonal-category behavior, or map Tonal Foundry primitives into consumer-owned semantic names.
