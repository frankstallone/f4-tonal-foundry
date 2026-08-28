# Teaching Tonal Categories Without Owning Consumer Semantics

Research date: 2026-08-27
Writing-for-agents review: 2026-08-28

## Repository problem statement

The current repository has 23 weights, but the engine has no tonal-category constant or type. Category bands are duplicated in the UI and the existing skill. The `AGENTS.md` heading calls the scale “22-step,” and its broad category prose conflicts with its exact matrix: it calls `900` a Shadow although the canonical Shadows band is `950–999`; dark surfaces at `800–900` fall in 3/4 Tones; and action pressed at `650` falls outside Mid Tones.

The output contract also omits category, contrast, gamut, and L\* target data, even though existing skill guidance tells consumers to inspect emitted metrics. A scale field named `semantic` further risks confusing a palette’s authored meaning with consumer-owned semantic tokens.

Therefore the skill cannot present categories as engine-enforced facts or promise metrics that exports do not contain. Its first version must present the five bands as documented model facts, treat role-to-band mapping as a heuristic, use the exact 23-weight vocabulary, and distinguish the existing scale metadata field from consumer semantic aliases. Engine/export changes are outside this research note.

## Decision

Tonal Foundry should teach a three-stage choice:

1. Identify the **consumer role** from the thing being styled: surface, control, action, text/icon, or border/divider.
2. Use that role, theme, and surrounding colors to choose a **tonal category**: Highlights, 1/4 Tones, Mid Tones, 3/4 Tones, or Shadows.
3. Choose an exact **weight within that tonal category** from prominence, interaction state, and contrast needs.

Tonal Foundry stops at that candidate primitive. The consumer maps it to its own semantic token, such as `surface.raised`, `text.muted`, or `action.primary.hover`. Consumer ubiquitous language remains the semantic-token vocabulary.

This matches the clearest distinction in established systems: palette entries are reusable values; aliases record product decisions. The W3C Design Tokens Community Group (DTCG) says aliases can express design choices and semantic relationships, while groups are arbitrary organization and must not be treated as meaning by tools ([DTCG Format, aliases and groups](https://www.designtokens.org/tr/2025.10/format/)). Its color guidance recommends alias names led by category and property, such as `color.background.error`, and recommends readable words rather than abbreviations ([DTCG Color Module, alias tokens](https://www.designtokens.org/tr/2025.10/color/#alias-tokens)).

## Evidence

| Source and authority                                                                                                                                                                                                                                         | Observed pattern                                                                                                                                                                                                                                                                                              | Direct use for Tonal Foundry                                                                                                                                                                                  |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [DTCG Format Module 2025.10](https://www.designtokens.org/tr/2025.10/format/) — community final specification                                                                                                                                                | Tokens have human-readable names, values, types, and optional descriptions. Aliases express design choices and semantic relationships. Groups organize but do not carry inferable purpose.                                                                                                                    | Keep “category” as authored guidance, not a machine claim that a folder or scale name guarantees usage. Describe each recommendation. Show consumer aliases as references to primitives.                      |
| [DTCG Color Module 2025.10](https://www.designtokens.org/tr/2025.10/color/#alias-tokens) — community final specification                                                                                                                                     | Alias-token names should prioritize category + property, e.g. `color.background.error`; avoid abbreviations. Component-specific tokens can improve separation of concerns.                                                                                                                                    | Examples should use full consumer-owned names such as `color.background.canvas`, not Tonal Foundry-branded semantic names. Add component aliases only when a consumer actually needs them.                    |
| [Material 3 in Compose](https://developer.android.com/develop/ui/compose/designsystems/material3#color_scheme) — official Android documentation                                                                                                              | Five key colors produce tonal palettes; components consume named roles through `ColorScheme`. Role choice depends on component state, prominence, and emphasis. Primary, secondary, and tertiary describe different prominence and accent functions.                                                          | Teach that a scale is a source and a role is a decision. Ask about state and prominence before selecting a weight. Do not tell consumers to use raw weights throughout components.                            |
| [Radix Colors: Understanding the scale](https://www.radix-ui.com/colors/docs/palette-composition/understanding-the-scale) — official product documentation                                                                                                   | Each scale step has a bounded use: backgrounds 1–2, component backgrounds 3–5, borders 6–8, solid fills 9–10, text 11–12. State progressions are adjacent and explicit. The guide also documents exceptions and contrast guarantees.                                                                          | Tonal categories should be a compact routing table with normal/hover/pressed examples. Keep state weights nearby and make any category-boundary crossing explicit. Treat the matrix as a starting point.      |
| [Radix Colors: Aliasing](https://www.radix-ui.com/colors/docs/overview/aliasing) — official product documentation                                                                                                                                            | Raw scale names can work, but semantic aliases such as accent, neutral, success, warning, and danger help theming. One physical scale may serve several meanings, so scale-to-semantics is not necessarily one-to-one.                                                                                        | Never equate a palette name with one product meaning. Permit several consumer aliases to reference the same Tonal Foundry primitive.                                                                          |
| [Radix Colors: Composing a palette](https://www.radix-ui.com/colors/docs/palette-composition/composing-a-palette) — official product documentation                                                                                                           | Brand, gray, and semantic scales are chosen separately. Foreground polarity differs for some hues. Meaning-color pairings are presented as common Western conventions, not universal truth.                                                                                                                   | Separate tonal role from hue semantics. Warn that success/warning/error mappings are cultural and consumer-owned. Require foreground validation for action fills.                                             |
| [Spectrum: Design tokens](https://spectrum.adobe.com/page/design-tokens/) — official design-system documentation                                                                                                                                             | Spectrum distinguishes global color tokens, written as entries in the color system, from alias color tokens, written as a particular usage.                                                                                                                                                                   | Use the terms **primitive** and **consumer semantic alias** consistently. Include one mapping example that makes the boundary visible.                                                                        |
| [Spectrum: Color system](https://spectrum.adobe.com/page/color-system/) and [Using color](https://spectrum.adobe.com/page/using-color/) — official design-system documentation                                                                               | Spectrum selects ranges by object role: layers, borders, text, icons, semantic communication, and solid backgrounds. Theme-specific colors suit contrast-sensitive foreground uses; static colors suit fills with an explicitly paired foreground. Semantic color must have text or an icon, not color alone. | Route by rendered object and relationship, not only by lightness. Add paired-foreground and non-color-cue checks. Distinguish theme-relative primitives from invariant fills if Tonal Foundry exposes both.   |
| [Carbon: Color overview](https://carbondesignsystem.com/elements/color/overview/), [tokens](https://carbondesignsystem.com/elements/color/tokens/), and [usage](https://carbondesignsystem.com/elements/color/usage/) — official design-system documentation | Carbon defines a role as systematic usage assigned to a token. Themes organize those relationships. Layer tokens model surfaces, and contextual layer tokens can change value based on nesting.                                                                                                               | Teach relationships such as page → content → raised surface. Do not imply one absolute primitive is correct regardless of surrounding surface or theme. Keep contextual behavior in the consumer token layer. |

## Reusable teaching patterns

### 1. Start with the object, not the number

Ask: “What are you coloring?” A background, interactive fill, control surface, foreground, or boundary gives the first branch. Radix and Spectrum both teach scales through concrete UI uses rather than through color-theory labels alone ([Radix scale uses](https://www.radix-ui.com/colors/docs/palette-composition/understanding-the-scale), [Spectrum color system](https://spectrum.adobe.com/page/color-system/)).

### 2. Treat state as a sequence

Choose normal, hover, and pressed weights as one deliberate progression within the same role. Radix documents adjacent component-background and solid-background state steps; Spectrum requires consistent index progression for interactive states ([Radix scale uses](https://www.radix-ui.com/colors/docs/palette-composition/understanding-the-scale), [Spectrum color system](https://spectrum.adobe.com/page/color-system/)).

### 3. Separate role from semantic meaning

“Action fill” describes visual function. “Danger” describes product meaning. A danger button still needs fill, hover, pressed, foreground, border, and focus choices. Radix explicitly separates brand, gray, and semantic scale selection, and notes that cultural pairings are contextual ([Radix palette composition](https://www.radix-ui.com/colors/docs/palette-composition/composing-a-palette)).

### 4. Make theme a relationship, not a reversal formula

Light and dark choices depend on surrounding surfaces and target contrast. Spectrum’s token values change by theme, Carbon’s layer tokens depend on context, and Material roles resolve through a scheme ([Spectrum color fundamentals](https://spectrum.adobe.com/page/color-fundamentals/), [Carbon color usage](https://carbondesignsystem.com/elements/color/usage/), [Material 3 color scheme](https://developer.android.com/develop/ui/compose/designsystems/material3#color_scheme)). “Use the opposite end of the scale” is a useful starting heuristic, not a complete rule.

### 5. End with a consumer alias

Show the handoff explicitly:

```text
Need: raised card background, dark theme
Role: Surface
Tonal category: 3/4 Tones
Starting primitive: neutral.900
Consumer decision: color.surface.raised -> {neutral.900}
Validation: compare against page surface, card text, border, and focus content
```

The alias expresses the product decision; the primitive remains reusable. This follows DTCG alias semantics and Spectrum’s global-versus-alias distinction ([DTCG Format](https://www.designtokens.org/tr/2025.10/format/#aliases-references), [Spectrum design tokens](https://spectrum.adobe.com/page/design-tokens/)).

## Writing-for-agents design

### Invocation

Keep one model-invoked `tonal-foundry` skill. Consumers may ask for themes, component tokens, or palette application without naming the skill, so autonomous discovery earns the description's permanent context load. A second consumer skill would add another pointer and an overlapping invocation choice without an independent leading word.

Use one trigger per real branch:

```yaml
description: Create or consume Tonal Foundry weighted palettes. Use when generating scales from keys, interpreting tonal categories or palette output, or mapping primitives into consumer-owned design tokens and themes.
```

This replaces the current synonym-heavy capability list with three branches: **generate**, **interpret**, and **map**.

### Information hierarchy

Keep only the shared decision invariants in `SKILL.md`:

```text
Category is density. Alias is intent.
Role-first: identify the rendered object's job before choosing a weight.
Pairwise: surrounding colors and measured contrast decide the final primitive.
```

Then route each branch through a front-loaded context pointer:

| Pointer                                                              | Disclosed reference                           | Completion criterion                                                                                                                                                                                |
| -------------------------------------------------------------------- | --------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Generate** or revise scales                                        | `references/generate.md`                      | Every requested scale has a purpose, ordered anchor/supporting keys, and generated output; every output issue is reported.                                                                          |
| **Interpret** weights, categories, color spaces, gamut, or contrast  | `references/model.md`                         | Every requested field is explained from the artifact; fields absent from the export are named as absent.                                                                                            |
| **Map** palette primitives into app roles, states, themes, or tokens | `references/model.md` and `references/map.md` | Every requested role/state/mode resolves to an existing primitive and consumer alias; each weight matches its category; every contrast-sensitive pair has evidence or an explicit unresolved check. |

The mapping criterion supplies the demand. “Return a mapping” is too easy to finish early; accounting for every requested role, state, mode, primitive, category, and pair forces the needed legwork.

### Co-location and pruning

Use this shape:

```text
tonal-foundry/
├── SKILL.md
├── agents/openai.yaml
└── references/
    ├── model.md
    ├── generate.md
    └── map.md
```

- `model.md` owns the exact 23 weights, five category bounds, vocabulary, and current export contract.
- `generate.md` owns palette creation and revision.
- `map.md` owns the five-role decision table, theme relationships, state sequences, mapping examples, guardrails, and mapping self-check.
- Remove `examples.md`; co-locate each example with the branch it teaches. Leave no forwarding file.
- Move the conceptual attribution out of the execution path. It does not change an agent's palette or mapping decision.
- Keep the role/category matrix in `map.md`. Replace the duplicated `AGENTS.md` matrix with this sharp pointer:

  ```text
  Palette mapping: read `.agents/skills/tonal-foundry/references/map.md` when assigning Tonal Foundry primitives to UI roles, states, or light/dark tokens.
  ```

Express the target behavior positively:

- Choose light and dark values from each mode's surrounding surfaces and required pairs.
- Use consumer ubiquitous language for aliases.
- Treat category ranges as candidate bounds and pairwise evidence as the final gate.
- Build hover and pressed values as one nearby state sequence.

The first version needs no semantic-token generator, universal naming taxonomy, framework adapter, component catalog, or second ontology. Observed consumer failures should earn later rules.

### Behavioral verification

Forward-test the skill with independent prompts. Assert artifacts, not wording:

1. A light/dark dashboard mapping accounts for every requested surface, foreground, border, and state; all primitives exist and categories match.
2. A palette-generation request loads creation guidance without consumer-token material.
3. A raw export review reports that contrast, gamut, category, and L\* metadata are absent instead of inventing them.
4. A migration replaces callers directly and removes obsolete aliases.
5. A proposed text/background pair includes measured evidence or remains explicitly unresolved.

## Mapping artifact contract

The mapping branch may use any format. Each decision carries these observable fields:

```text
Role: Action
Tonal category: Mid Tones
Candidate: brand.500 (hover brand.550, pressed brand.600)
Consumer alias: action.primary.background
Check: foreground contrast in both themes; focus indicator; disabled state
```

This format teaches the reasoning without presenting the alias as Tonal Foundry output.

## Risks and controls

| Risk                      | Why it matters                                                                                                            | Control in the skill                                                                                                                                                      |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Primitive leakage         | Consumers hard-code weights, making redesign and theming expensive.                                                       | Every worked example ends in a consumer alias.                                                                                                                            |
| Semantic capture          | Tonal Foundry starts owning product vocabulary it cannot know.                                                            | Label semantic names as examples; require consumers to adopt their existing ubiquitous language.                                                                          |
| False precision           | A weight matrix appears to guarantee contrast or suitability.                                                             | Call ranges starting points and require pairwise validation in context.                                                                                                   |
| Dark-mode inversion       | Mechanical reversal ignores nesting, hue, and foreground relationships.                                                   | Ask for theme plus surrounding surface; validate resolved pairs.                                                                                                          |
| State drift               | Independently selected hover/pressed values weaken hierarchy.                                                             | Teach state sequences as a nearby progression; crossing a category boundary requires an intentional density or contrast reason.                                           |
| Hue-role confusion        | “Red” becomes equivalent to “danger,” or “mid tone” becomes equivalent to “primary.”                                      | Teach tonal role and semantic meaning as separate axes.                                                                                                                   |
| Accessibility overclaim   | Tonal category alone cannot prove WCAG contrast; color-only meaning excludes users.                                       | Require contrast checks and a text/icon/shape cue for semantic states.                                                                                                    |
| Vocabulary overload       | Too many layers make the skill harder than direct scale use.                                                              | Main path uses six terms and four questions; deeper matrices remain optional.                                                                                             |
| Documentation drift       | UI, skill, and `AGENTS.md` can define different bands and step counts because the engine has no category source of truth. | In the skill, cite one exact 23-weight table and call it guidance. Do not restate loose ranges elsewhere. Track engine-owned categories as a separate product decision.   |
| Unsupported metric advice | The skill may instruct agents to read contrast, gamut, or L\* data that exports omit.                                     | Describe only fields present in the current output. Phrase contrast and gamut as checks the consumer must perform with its own tooling until the export contract changes. |
| `semantic` name collision | The scale field can be mistaken for a consumer semantic token layer.                                                      | Explicitly call it scale metadata in teaching material. Reserve “semantic alias/token” for consumer-owned usage names.                                                    |

## Bottom line

The successful systems do not erase numeric palettes. They constrain them with use-oriented ranges, then place product meaning in aliases or roles. Tonal Foundry should do the same: teach **where on the scale to start and why**, require contextual validation, and leave **what the token means in the product** to the consumer.
