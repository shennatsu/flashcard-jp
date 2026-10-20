# ShenNatsu Flash Card — Architecture

## Status

This document is the canonical architecture summary for Phase 0. The detailed evidence and uncertainty notes live in:

- [`review/design-audit.md`](../review/design-audit.md)
- [`review/reference-asset-audit.md`](../review/reference-asset-audit.md)
- [`review/architecture-audit.md`](../review/architecture-audit.md)

No application code or backend is part of Phase 0.

## Product boundary

FlashCardJP is a Japanese learning web app for Hiragana and Katakana. v1 includes:

- Basic, Combination, and Dakuten kana sets.
- Characters mode with a grid and persisted consonant-column selection.
- Words mode with typing and optional Japanese speech input.
- Tiers 10 → 20 → 50 → 100 with flawless first-appearance unlocks.
- A local Dictionary of words answered correctly.
- A decorative home field with draggable folder art, an ASCII-style loader, and a kana title scramble.
- Responsive desktop and mobile layouts.

v1 explicitly excludes accounts, kanji-learning scope, JLPT levels, leaderboards, spaced-repetition UI, and a backend. Resources is a stable `Coming soon <3` page.

## Runtime architecture

```text
Next.js App Router + TypeScript strict
  ├─ static routes and assets
  ├─ thin React components
  ├─ Zustand UI coordination + versioned persistence adapter
  └─ pure browser domain core
       ├─ kana tables and set membership
       ├─ word-data manifest and lazy JSON loading
       ├─ deterministic session engine
       ├─ answer normalization/matching
       ├─ speech adapter
       └─ ProgressRepository boundary
```

The application must remain usable without an account or API. `ProgressRepository` is the durable-state boundary; the first implementation is browser storage. Zustand is not the cross-feature domain contract.

## Route map

| Route | Purpose |
|---|---|
| `/` | Home, title, folder field, navigation, footer |
| `/hiragana/characters` | Hiragana character grid and study entry point |
| `/katakana/characters` | Katakana character grid and study entry point |
| `/hiragana/words` | Hiragana word practice |
| `/katakana/words` | Katakana word practice |
| `/resources` | Stable `Coming soon <3` page and attribution |

The `[script]` route parameter is restricted to `hiragana` and `katakana` through `generateStaticParams`. Invalid values must not silently fall back to a script.

## Frozen vocabulary and contracts

Persisted values are exact:

```ts
type Script = "hiragana" | "katakana";
type KanaSet = "basic" | "combination" | "dakuten";
type Tier = 10 | 20 | 50 | 100;
```

The visible product term is **Combination**, never `Component`. Stable domain contracts must cover:

- `KanaEntry`: stable ID, character, accepted romaji spellings, consonant group, exclusive declared set.
- `WordEntry`: stable JMdict ID, kana, kanji forms, romaji, English meaning, optional Indonesian meaning, sets, length, frequency rank.
- `SessionConfig`, `SessionCard`, and `SessionEvent`: script/set/tier, stable item ID, first appearance versus repeat/reinforcement, answer/reveal outcome, and position.
- `RoundSummary`: first-appearance outcomes, practice outcomes, accuracy, incorrect count, pass/unlock result, and missed IDs.
- `ProgressRepository`: versioned unlocked tiers, dictionary membership, column selections, and durable progress.
- `SpeechInput`: support detection, start/stop, alternatives, and explicit unsupported/permission/no-speech/network states.
- Static data manifest: schema/source version, script/set, stable IDs, and asset/data URLs.

### Set semantics

A kana entry is declared in exactly one set. Pool eligibility is cumulative: a Basic pool can use Basic entries, a Dakuten pool can use lower eligible entries plus Dakuten entries, and a Combination pool can use the lower eligible groups plus Combination entries according to the written product rule. `っ` and `ー` are allowed in all pools.

A word belongs to a pool only when every kana is allowed by that pool. The mock's `きょう` placement under Basic is placeholder content; `きょ` is Combination and must not enter the Basic pool.

### Canonical fixtures

The schema gate must provide shared fixtures for:

- One representative kana for each script and set.
- `shi/si`, `chi/ti`, `tsu/tu`, `fu/hu`, and `ji/zi` variants.
- Katakana-to-hiragana normalization.
- Words containing `っ` and `ー`.
- A voice alternative set containing kana, romaji, and a kanji form such as `今日` for `きょう`.
- A seeded session with unique picks, a wrong-answer requeue, reveal, repeat practice, reinforcement, and tier pass/fail cases.
- Valid and malformed script/set values.

Consumers must use these fixtures rather than inventing local payload shapes.

## Static and deployment constraints

- `output: "export"` in Next configuration.
- `images.unoptimized = true`; runtime assets are trimmed WebP/AVIF derivatives, not padded source PNGs.
- No route handlers, Server Actions, middleware, `cookies()`, `headers()`, Express, Nest, auth, or database dependencies in v1.
- Word JSON is static and lazy-loaded by script/set; it must not become one giant client bundle.
- Browser-only APIs are feature-detected after hydration.
- Cloudflare Pages/static-assets configuration, `npm run deploy`, and hard-refresh verification belong to Phase 7.5.

## Phase order and gates

1. **Phase 0 — Review and plan:** this summary plus the three review artifacts. Stop for product approval.
2. **Schema/fixture gate:** freeze contracts, IDs, session semantics, fixtures, and ownership before parallel UI consumers.
3. **Phase 1 — Foundation:** scaffold, tokens, fonts, trim pipeline, nav/footer shell, static build baseline. No loader, folders, or flashcards.
4. **Phase 2 — Home:** ASCII frames, real progress loader, title scramble, decorative drag/persistence.
5. **Phase 3 — Kana:** tables, counts, variants, grids, persisted column toggles.
6. **Phase 4 — Data/domain:** JMdict generation, session engine, matching, deterministic tests; no Words UI.
7. **Phase 5 — Words typing:** flashcard flow, tiers, stats, reveal, summary, local progress.
8. **Phase 6 — Voice:** Web Speech adapter and error/unsupported states.
9. **Phase 7 — Dictionary:** proposal first; implementation only after approval.
10. **Phase 7.5 — Cloudflare:** static export and deployment verification.
11. **Phase 8 — QA:** Playwright, axe/accessibility, reduced motion, responsive, slow-3G, Lighthouse.

Every phase ends with actual typecheck, lint, relevant tests, production build, decision-log update, scope/diff review, and a short report. Do not advance past a failed gate or start the next phase without approval.

## Parallel ownership

After the schema gate, workstreams use disjoint boundaries:

- Foundation/integration: package/config, app shell, global CSS/tokens, static config.
- Asset pipeline: `scripts/trim-assets.ts`, `scripts/build-ascii.ts`, optimized public derivatives.
- Domain data: `src/lib/kana`, data-build scripts, generated data validation.
- Session/matching: `src/lib/session`, `src/lib/match`, tests.
- Home: `src/app/page.tsx`, `src/components/home`, home hooks/tests.
- Characters: `src/app/[script]/characters`, `src/components/characters`.
- Words: `src/app/[script]/words`, `src/components/words`.
- Speech: `src/lib/speech` and voice checklist.
- Dictionary: approved proposal plus Dictionary components/tests.
- Deploy/QA: Cloudflare files, deployment docs, Playwright/audit configuration.

One integrator owns shared contracts, global tokens, route layout, generated manifests, package scripts, and `docs/DECISIONS.md`. Workers do not edit sibling boundaries or commit.

## Reference adaptation

- From jlptcards: clear Characters/Words separation, one primary practice item, compact accuracy/remaining/incorrect feedback, and explicit reveal/keyboard behavior.
- From the supplied alicias direction: an ASCII-style reveal/loading feeling and kana scramble, implemented with original assets and build-time frames.
- From gimiaw: restrained staggered entrance, short spring feedback, soft dropdowns, and coherent transitions, implemented as original shared presets.

Do not copy code, DOM, CSS, assets, artwork, copy, word lists, exact layout, or exact animation constants from references.

## Open decisions requiring explicit handling

- No mobile screenshots exist; design and validate 360×800, 390×844, and 768×1024 rather than shrinking desktop.
- Dictionary drawer/bottom-sheet behavior is a proposal and requires approval before Phase 7 implementation.
- Error, empty, unsupported speech, and no-result states must preserve layout and use announced feedback.
- Folder art is decorative only, `aria-hidden`/not focusable, and never a navigation target.
- Missing Indonesian meanings remain blank; never fabricate translations. JMdict CC BY-SA 4.0 attribution belongs in Resources/footer.
- The committed design paths are `design/reference` and `design/source`; the original brief's `/design/folders` path is a documentation mismatch.
