# Phase 0 Architecture Audit

## Scope and evidence

This is a review artifact only. No application code, scaffold, dependency installation, or commit is part of this phase. The three reference URLs were fetched and inspected live on 2026-10-20, and the local reference repository was inspected for motion implementation evidence.

The audit is based on the repository baseline, the complete `AGENTS.md` brief, direct inspection of local design assets, live DOM/text extraction for `jlptcards.com/hiragana-words`, `alicias.page/art`, and `gimiaw.web.id`, and source inspection of the local shallow clone at `D:/HERMES/hermes/cache/gimiaw-porto`. Live DOM inspection establishes page structure and visible text; it does not by itself prove every animation frame.

## 1. Baseline facts

- Repository: `D:/Personal Project/FlashCardJP`.
- Branch: `main`.
- Baseline commit: `5d7fa35` (`chore: add product brief and design references`).
- The baseline working tree was clean before this artifact was created.
- Remote: `origin` → `https://github.com/shennatsu/flashcard-jp.git` (`shennatsu/flashcard-jp`).
- The commit contains the product brief (`AGENTS.md`), `.gitignore`, seven reference screenshots under `design/reference/`, and source PNG assets under `design/source/`.
- There is no app scaffold: no `package.json`, `src/`, `public/`, `scripts/`, `docs/`, Next config, TypeScript config, Tailwind config, test config, or deployment config exists in the baseline tree.
- There is no `graphify-out/graph.json`; graphify is absent for this target. No graph-based repository exploration is required for this audit.
- Reference screenshot inventory: `Desktop - 1.png` through `Desktop - 7.png`; the first five are 1440×2497 and the last two are 1440×1893.
- Source inventory: eight 1920×1080 PNGs named `Desain tanpa judul*.png`, plus `Group 1.png` at 1670×949. The source files are not production-ready output.
- Product direction: a Japanese hiragana/katakana flashcard app with Characters and Words modes, local progress, a decorative draggable-folder home, motion, speech input, dictionary behavior, and a static Cloudflare deployment.
- The v1 architecture is explicitly client-only: static JSON, browser session logic, browser answer matching, and local persistence. There is no backend, account system, API route, or database in v1.

### Baseline implications

The first implementation phase is a real foundation phase, not an incremental feature change. It must establish the Next.js App Router project, strict TypeScript, styling/token conventions, tests, static-export configuration, asset processing, and shared contracts before feature work can be safely parallelized. The baseline design path differs from the path names written in `AGENTS.md`: the actual committed layout is `design/reference` and `design/source`, not `/design/folders`. Treat the committed tree as the source for asset discovery and record any future mapping in `docs/DECISIONS.md`.

## 2. Architecture decisions to lock

1. **Static browser application:** Next.js App Router with TypeScript strict, Tailwind plus CSS-variable design tokens, `motion`, Zustand with persistence, and `wanakana`.
2. **Static data pipeline:** generate deterministic kana tables and word JSON at build time. Load word data lazily by script/set rather than bundling one large payload.
3. **Pure domain core:** session selection, tier progression, answer normalization, set membership, and matching remain UI-independent TypeScript modules with deterministic tests.
4. **Repository boundary for progress:** UI and state code depend on a `ProgressRepository` contract. The v1 implementation is local storage (or IndexedDB where the payload requires it); a future sync/database implementation is not scaffolded now.
5. **No backend in v1:** do not add Express, Nest, API routes, Server Actions, authentication, database clients, or a server deployment. The app must remain fully usable without an account and without a network connection after static assets are available.
6. **Stable identifiers:** generated word IDs must be based on stable JMdict identity and must survive word-list rebuilds. UI labels, array indexes, and kana display strings are not persistence identifiers.
7. **Schema gate first:** before more than one UI consumer is implemented in parallel, freeze the shared contracts and canonical fixtures described below. Consumers may not invent local variants of those types or fixtures.

## 3. Dependency-ordered delivery phases

The delivery plan is dependency-ordered: each row is a stop point. A phase is not complete because files exist; its gate must pass and its written summary must be reviewed before the next phase starts.

| Order | Phase | Depends on | Required output | Stop gate |
|---|---|---|---|---|
| 0 | Review and architecture audit | Baseline only | This artifact, decisions and unresolved questions | No implementation starts. Obtain approval of the architecture and schema plan. |
| 0.5 | **Schema and fixture gate** | Phase 0 approval | Shared domain types, route/data contracts, persistence contract, speech contract, event semantics, canonical fixtures, and ownership map agreed in writing | Contract names, IDs, set semantics, tier rules, fixture expectations, and ownership boundaries are frozen before parallel UI consumers. |
| 1 | Foundation, assets, tokens, and shell | 0.5 | Next.js scaffold, strict TS, Tailwind/CSS tokens, fonts, static-export baseline, asset trim pipeline, shared nav/footer shell | Install succeeds; typecheck, lint, unit-test command, and static build are wired; the shell is responsive; no loader/folders/flashcards are started. |
| 2 | Home, loader, title scramble, and decorative folders | 1 | Build-time ASCII frames, real asset/font progress, reduced-motion loader, kana title scramble, draggable decorative folders, persistence and tidy reset | Desktop and 390px checks pass; touch page scrolling remains usable; drag/click threshold works; no folder navigates. |
| 3 | Kana data and Characters page | 1 and schema gate | Hiragana/katakana tables, Basic/Dakuten/Combination grids, accepted romaji variants, column-toggle persistence, character UI | Counts and exclusivity tests pass for all six script×set combinations; grids render without horizontal overflow. |
| 4 | Word data, session engine, and matching (no UI) | 3 and schema gate | Deterministic JMdict build script, generated JSON, pure session engine, normalization/matching modules, repository interface | Exhaustive domain tests pass; generated data is reproducible; word counts per script×set are reported; no Words UI is added. |
| 4.5 | **Domain consumer gate** | 4 | Validate generated JSON and fixtures against the frozen contracts; verify the session event semantics used by UI, speech, dictionary, and tests | No parallel Words, speech, or dictionary consumer starts until this gate is green. |
| 5 | Words flashcard UI and typing flow | 4.5 | Flashcard route, tier selection, keyboard flow, answer/reveal feedback, stats, summary, local progress adapter | Keyboard-only flow works; first-attempt pass/fail and repeat behavior match the engine; mobile input stays above the keyboard; accessibility feedback exists. |
| 6 | Voice answers | 5 and speech contract | Web Speech adapter, microphone states, alternative matching, unsupported/error handling, manual test checklist | Chrome desktop/Android, Safari iOS, and Firefox behavior is documented; unsupported or denied speech never crashes the page. |
| 7 | Dictionary | 5 and progress contract | First an approved UX proposal; then drawer/bottom sheet, search/filter/detail/TTS, attribution | Proposal is approved before implementation. Dictionary membership and display use stable word IDs and persisted local state. |
| 7.5 | Cloudflare static deployment | All product behavior needed for v1 | `output: "export"`, static route generation, unoptimized image setting, Cloudflare config, deploy command, deployment guide | Production build produces the static artifact; hard refreshes work for every route; no server-only feature is present. |
| 8 | Polish and QA | 5–7.5 | Lighthouse, axe/accessibility, reduced-motion, responsive, slow-3G, Playwright smoke coverage, final docs | Required viewports and flows pass; defects are fixed in the phase rather than carried forward; final report is reviewed. |

The schema gate is intentionally earlier than the original feature prompts' UI work. It is the control that permits parallel ownership without incompatible `Word`, `Session`, `Progress`, or route shapes. Parallel work before that gate is prohibited.

## 4. Shared contracts and canonical fixtures

The following are architecture requirements for the schema gate. They are not implementation work in this review.

### 4.1 Canonical vocabulary and domain types

Use these exact persisted values:

- `Script = "hiragana" | "katakana"`.
- `KanaSet = "basic" | "combination" | "dakuten"`.
- Tiers are exactly `10 | 20 | 50 | 100`.
- The UI label is **Combination**, never `Component`.
- Route params accept only `hiragana` and `katakana`; invalid values must not silently select a default script.

Recommended shared contracts, owned by one domain owner (for example under `src/lib/contracts/`):

- `KanaEntry`: stable `id`, `char`, `romaji: string[]`, `group`, and exclusive `set`.
- `WordEntry`: stable `id`, `kana`, `kanji[]`, `romaji`, `meaningEn`, optional `meaningId`, `sets`, `length`, and `freqRank`.
- `SessionConfig`: script, set, tier, candidate pool, and seedable RNG input.
- `SessionCard`/`SessionEvent`: stable item ID, first appearance versus repeat/reinforcement, answer outcome, reveal status, and position. The UI must not reconstruct pass/fail from display state.
- `RoundSummary`: first-appearance results, repeat practice results, accuracy, incorrect count, passed/unlocked tier, and missed stable IDs.
- `ProgressRepository`: versioned read/write methods for unlocked tiers, dictionary membership, column selections, and any durable progress; storage implementation is replaceable.
- `SpeechInput`: `isSupported`, `start`, `stop`, and result alternatives, with explicit permission, no-speech, network, and unsupported states.
- Static data manifest: script/set, schema version, source/build version, stable IDs, and asset/data URL. Consumers must lazy-load through this manifest rather than hard-code file naming in multiple places.

Keep transient current-round state separate from durable progress. Zustand may coordinate UI state, but it must not become the domain contract or the only place where migration/versioning rules exist.

### 4.2 Canonical set semantics

A kana entry belongs to exactly one declared set. Pool eligibility is cumulative: Basic entries are eligible for a Basic pool; Dakuten pools may include Basic plus Dakuten; Combination pools may include the lower eligible groups according to the written product rule. This resolves the apparent conflict between “every kana appears in exactly one set” and “Basic ⊂ Dakuten ⊂ Combination for pool-building”: the entries are exclusive, while pools are cumulative.

A word belongs to a pool only when every kana is allowed by that pool's set rule. `っ` and `ー` follow the explicit all-pools allowance. The generated data must make this decision testable rather than leaving it to a page component.

### 4.3 Canonical fixture set

Create one shared fixture set at the schema gate, consumed by unit tests and UI smoke tests rather than duplicated per feature:

- One representative entry for each script and each set, including a combination such as `きゃ`, a dakuten entry, and a basic entry.
- Romaji variants: `shi/si`, `chi/ti`, `tsu/tu`, `fu/hu`, and `ji/zi`.
- Katakana input that normalizes to hiragana for matching.
- A word containing `っ` and one containing `ー`.
- A voice fixture whose accepted alternatives include kana, romaji, and a kanji form such as `今日` for `きょう`.
- A deterministic session fixture with a fixed seed, unique initial picks, a wrong answer re-queued three-to-five cards later, a reveal, a repeat answer, and a reinforcement candidate. It must exercise “first appearance affects pass/fail; repeat practice does not.”
- Tier fixtures for a flawless 10-card pass, a first-appearance mistake that blocks unlock, a reveal that blocks unlock, and a repeat mistake that does not block unlock or regress the tier.
- A static-data fixture with both scripts and all three sets, plus a malformed/unknown script and set for validation tests.

Fixtures must use stable IDs and explicit expected outputs. Screenshots are visual references, not data fixtures. Generated JMdict counts and attribution metadata must be tested separately from the small deterministic fixtures.

## 5. Parallel file ownership

Parallel work is allowed only after the schema gate and only within these disjoint ownership areas. Shared contract files, package/config files, global CSS, and decision logs have a single owner; other agents submit changes rather than editing them concurrently.

| Workstream | Exclusive ownership | May consume | Must not edit |
|---|---|---|---|
| Foundation/integration | `package.json`, lockfile, `tsconfig`, Next/Tailwind/PostCSS config, `src/app/layout`, global CSS/token entry, static-export config, shared app shell, `public` asset pipeline, integration scripts | Frozen contracts and asset manifest | Feature page internals, domain rules, speech implementation |
| Asset pipeline | `scripts/trim-assets.ts`, `scripts/build-ascii.ts`, generated optimized assets and their manifest | Committed source PNGs, frozen asset contract | Raw design files, feature components, domain logic |
| Domain data | `src/lib/kana`, data-build scripts, generated data schema and validation | Kana/word fixtures, frozen vocabulary | Pages, Zustand stores, visual tokens |
| Session/matching | `src/lib/session`, `src/lib/match`, their tests | Domain types, deterministic fixtures | UI components, generated data files by hand |
| Home interaction | `src/app/page`, `src/components/home`, home-specific hooks/tests | Motion presets, asset manifest, persistence contract | Global layout/tokens, domain contracts |
| Characters | `src/app/[script]/characters`, `src/components/characters` | Kana contracts and fixtures | Kana tables, global CSS, Words components |
| Words UI | `src/app/[script]/words`, `src/components/words`, words-specific tests | Session/match APIs, progress contract, generated data | Session engine, matching normalization, speech adapter |
| Speech | `src/lib/speech`, microphone adapter tests, voice checklist | Speech contract, matching API | Words session semantics, global button styles |
| Dictionary | Dictionary-specific components/tests and approved UX proposal | Word/progress contracts, TTS adapter | Word IDs/data generator, session engine |
| Deploy/QA | `wrangler`/Cloudflare files, deployment docs, Playwright and audit configuration | Static build output and route contract | Product feature code unless fixing a separately approved defect |

One integrator owns cross-cutting edits to `package.json`, `src/lib/contracts`, global tokens, route layout, generated manifests, and `docs/DECISIONS.md`. A workstream may not “temporarily” edit a shared file to unblock itself. Integration happens in dependency order and is followed by the full gate suite.

## 6. Test, build, and review gates

The exact npm scripts will be created in Phase 1, but the acceptance contract is fixed now:

- Every phase: strict typecheck, lint, relevant unit tests, and a production build. The phase summary must name the commands and actual result.
- Every phase: update `docs/DECISIONS.md` with assumptions, unresolved items, and any deviation from the written brief. Do not silently resolve visual or product ambiguity.
- Phase 1: verify static export wiring, font loading, token usage, asset processing, and responsive shell before feature work.
- Phase 2: verify loader progress is real, minimum display time is honored, reduced motion skips expensive choreography, and folder drag does not steal page scroll.
- Phase 3: assert Basic 46, Dakuten 25, Combination 33 for each script; assert accepted romaji variants; assert declared kana membership is exclusive; render all six grids.
- Phase 4: assert no duplicate initial items, deterministic seeded selection, re-queue gap, reinforcement constraints (once per item, minimum gap, never adjacent, capped at roughly 20% of `N`), first-appearance pass rules, no tier regression, set membership, kanji-form acceptance, and kana normalization.
- Phase 4: run the generator and verify reproducible output, per-script/per-set counts, stable IDs, filtering, and JMdict attribution. If any required pool has fewer than 100 words, stop and report it rather than masking the shortage.
- Phase 5: keyboard-only flashcard flow, `aria-live` feedback, reveal via button and Space, tier unlock/retry behavior, missed-item summary, and 360/390px keyboard-safe layout.
- Phase 6: manual browser matrix from the brief plus error-path checks for unsupported speech, denied permission, no speech, network error, HTTPS requirements, and iOS behavior.
- Phase 7: approved UX proposal before implementation; search/filter/detail/TTS and persisted dictionary behavior are tested with stable IDs.
- Phase 7.5: run the static build, inspect the output, serve it as static files, hard-refresh every route including `/hiragana/words` and `/katakana/words`, and verify font/image/data URLs.
- Phase 8: Playwright smoke test for the Words flow, axe/accessibility checks, reduced motion, keyboard-only walkthrough, Lighthouse mobile/desktop, slow-3G loader behavior, and 360×800, 390×844, 768×1024, and 1440×900 layouts. There must be no horizontal scroll.

A failing gate keeps work in the current phase. Do not start the next phase to work around a failure.

## 7. Static-export constraints

- Set `output: "export"` in the Next configuration.
- Dynamic script routes must provide `generateStaticParams` for exactly `hiragana` and `katakana`.
- Set `images.unoptimized = true`; pre-optimize committed source PNGs to WebP/AVIF through the asset script. Do not ship the large padded source files as production assets.
- Do not add route handlers, Server Actions, middleware, `cookies()`, `headers()`, or other server-only runtime dependencies in v1.
- Treat word JSON as static assets. Lazy-load by script/set and keep each file bounded; never make a single giant client bundle the data store.
- Browser-only APIs (`localStorage`, IndexedDB, Web Speech, `speechSynthesis`, `visualViewport`, `document.fonts`) must be feature-detected and accessed only on the client after hydration. They must not be required to render the static build.
- Provide Cloudflare static-assets/Pages configuration, a non-interactive `npm run deploy` path where possible, and exact deployment steps in `docs/DEPLOY.md` during Phase 7.5.
- The Cloudflare v1 artifact is a static site. Any future account/DB work is a separate architecture migration to a Worker/API and must not leak into this build.

## 8. State and data concerns

### Durable versus transient state

Durable local state should include unlocked tiers, dictionary membership, per-script/set column selections, and folder positions. Current card, input text, mic status, animation state, and in-progress round details are transient unless a later product decision explicitly requires resume-after-reload. Define the reload behavior before persisting a current session.

Use a versioned persistence namespace and migration path. Handle unavailable storage, quota errors, private browsing restrictions, stale schema versions, and multiple tabs without crashing the study flow. Persisting Zustand state is an implementation detail behind the repository boundary, not permission to expose a raw store shape to every component.

### Generated data

JMdict generation must be deterministic and record source/version information. Filters must exclude the specified proper, vulgar, archaic, obscure, and length-invalid entries. Indonesian meaning is optional; leave `meaningId` blank when no source exists rather than fabricating it. JMdict CC BY-SA 4.0 attribution must appear in the footer or Resources page.

Stable word IDs are required for dictionary entries, future sync, fixtures, and migrations. A regenerated word order must not erase a user's local progress. Validate that every generated `sets` value is canonical and that every word's membership follows the kana pool rule.

### Browser and accessibility state

Speech recognition is optional enhancement: Firefox and other unsupported browsers must hide or disable the mic with a useful hint, not throw. Input focus, answer feedback, reduced motion, and on-screen keyboard behavior must remain correct when speech is unavailable. The visual folder toys are decorative and must be `aria-hidden`/not focusable so they do not create an inaccessible navigation surface.

## 9. Risks and mitigations

| Risk | Consequence | Mitigation / gate |
|---|---|---|
| Web Speech support, permissions, HTTPS, iOS and network errors vary | Voice answers fail or hang in some browsers | Adapter contract, explicit state machine, feature detection, alternatives handling, manual browser matrix, typing flow always complete |
| Source PNGs contain large transparent padding and may be heavy | Slow first load and inflated static hosting cost | Trim to bounding box, generate WebP/AVIF at 1x/2x, lazy-load, measure before/after, never ship raw sources |
| Touch drag competes with page scrolling | Mobile home becomes difficult to use | Folder-only `touch-action: none`, movement threshold, scroll testing at required widths, drag as enhancement |
| JMdict filtering produces thin or surprising pools | A tier cannot provide its requested number of cards or learning quality is poor | Deterministic generator, per-pool counts, minimum-count report, explicit stop if under 100, no invented meanings |
| Static export and dynamic routes diverge | Deep links 404 on Cloudflare | `generateStaticParams`, static output inspection, hard-refresh deployment test |
| Zustand/localStorage hydration mismatch or quota failure | Flicker, lost progress, runtime crash | Client-only storage adapter, versioned migrations, safe fallback, repository tests |
| Parallel agents invent incompatible schemas | Integration churn and wrong session semantics | Schema gate, canonical fixtures, exclusive file ownership, single integrator for shared contracts |
| Design has no mobile mockups and dictionary is not designed | Silent visual/product invention | Short decision note and approval before implementation; preserve the stated desktop language and explicit mobile constraints |
| Motion, loader, and image work harms performance or accessibility | Slow page, motion sickness, layout shift | Reduced-motion path, real progress, minimum loader only when useful, Lighthouse/axe and slow-3G gate |
| Reference behavior can be over-read from static extraction | DOM/text output does not prove every animation frame or hidden state | Record live observations separately from proposals; use the local gimiaw source for implementation evidence, and do not copy code/assets/layout |

## 10. Contradictions and unresolved decisions

| Finding | Resolution for v1 |
|---|---|
| `AGENTS.md` calls the tab “Component” in a known mock inconsistency, while the product term is Combination | Use **Combination** everywhere and record the discrepancy; do not propagate the mock label. |
| The Words mock shows `きょう` under Basic even though `きょ` is a yoon | Treat the mock as placeholder content. Basic word pools contain only words allowed by the Basic rule; verify with generated-data tests. |
| The brief says each kana appears in exactly one set but describes cumulative Basic/Dakuten/Combination pools | Keep entry membership exclusive and pool eligibility cumulative, as specified in the contract section. |
| `design/folders/*.png` is described in the brief, but the baseline has `design/reference` and `design/source` and no `design/folders` directory | Do not assume a missing folder. Inventory actual assets, map the intended seven folder icons during the asset phase, and document the mapping before processing. |
| The brief names localStorage/IndexedDB behind `ProgressRepository`, while the stack names Zustand `persist` | Keep `ProgressRepository` as the stable boundary; use Zustand as a UI/state adapter and a versioned browser-storage implementation underneath it. |
| The technology table mentions future Postgres (Neon/Supabase), while the future roadmap names D1/Drizzle | This is future-only and not a v1 decision. Do not add either dependency now; choose the future backend only in an explicitly approved post-v1 migration. |
| The original Phase 0 prompt asks for `docs/ARCHITECTURE.md` plus a short review | `docs/ARCHITECTURE.md` is the canonical summary; the three `review/*.md` files preserve detailed evidence, uncertainty, and asset/reference notes. No implementation starts in this phase. |
| The original prompt requests reference-site observations | This review performed live web extraction and browser DOM/text inspection on 2026-10-20. The reference audit records the observed page structure and the limits of that evidence; no animation claim is presented as proven from text alone. |

## 11. Explicit stop-after-phase workflow

1. **Before a phase:** read `AGENTS.md`, this audit, the previous phase summary, and the current decision log. Confirm that the phase's ownership area and acceptance criteria are clear.
2. **During a phase:** modify only the phase scope and owned files. Do not begin the next phase's UI, data generation, backend, or deployment work early. Do not add a dependency without recording the reason.
3. **At the phase boundary:** run the required typecheck, lint, unit tests, build, and phase-specific checks. Review the actual output, not just the command exit status. Check the diff for scope violations and generated-file drift.
4. **Document:** update the decision log as part of the phase, then provide a short summary of changed files, verified gates, known issues, and any decisions requiring product approval.
5. **Stop:** wait for explicit approval before starting the next phase. If a gate fails, remain in the current phase and fix or escalate it. Never hide a failure by advancing the plan.
6. **Parallel work rule:** no parallel UI consumers before the schema gate and domain consumer gate. After those gates, use the ownership matrix; shared-file changes go through the integrator.
7. **Special approval points:** dictionary implementation waits for its UX proposal approval; future backend work waits for explicit post-v1 authorization; no Phase C work is part of Phases 0–8.

The current task ends at this artifact. No scaffold, app code, dependency installation, asset conversion, generated data, backend, or commit was started.