# ShenNatsu Flash Card (JP) — Agent Brief

> **Cara pakai file ini**
> - **PART A** → simpan sebagai `AGENTS.md` di root repo (dibaca Codex / Hermes tiap sesi, jadi mereka nggak "lupa" arah).
> - **PART B** → prompt per fase. Paste **satu fase per sesi**, jangan semuanya sekaligus.
> - Taruh semua gambar desain di `/design` dalam repo sebelum mulai (`Desktop - 1..7.png` + folder icon PNG).
> - Isinya bahasa Inggris karena agent lebih konsisten di situ. Penjelasan buat lu ada di chat.

---

# PART A — AGENTS.md

## 1. Product

A Japanese flashcard web app (hiragana + katakana) by ShenNatsu. Personal, cozy, scrapbook/desktop-folder aesthetic. Inspired functionally by https://jlptcards.com/hiragana-words, visually by https://www.alicias.page/art/ (ASCII loading) and https://www.gimiaw.web.id/ (Framer-style motion). See §2 for exactly what to take from each. Built to learn frontend craft: **visual and motion quality is a first-class requirement, not polish at the end.**

Current scope (v1):
- Scripts: **Hiragana** and **Katakana**
- Sets per script: **Basic**, **Combination** (yoon: きゃ, しゃ, ぎゃ…), **Dakuten** (゛ and ゜: が, ぱ…)
- Modes per script: **Characters** (grid + study) and **Words** (flashcards)
- Answer by **typing romaji** OR **speaking** (Japanese speech recognition)
- Session tiers: **10 → 20 → 50 → 100** cards
- A **Dictionary** of words the user has met
- Interactive draggable folder icons on the home page (**purely decorative toys**, no navigation)
- ASCII-style loading screen + random-kana scramble on the title
- Desktop and mobile layouts, both first-class

Out of scope for v1 (do not build, but do not block; backend plans live in Part C and must not be started early): accounts, kanji, JLPT levels, spaced-repetition scheduling UI, leaderboards, "Resources" page (show "Coming soon <3").

## 2. Source of truth for visuals

- `/design/Desktop - 1.png` Home (default)
- `/design/Desktop - 2.png` Home, Hiragana dropdown open (Hiragana Characters / Hiragana Words)
- `/design/Desktop - 3.png` Home, Katakana dropdown open
- `/design/Desktop - 4.png` Home, Resources → "Coming soon <3"
- `/design/Desktop - 5.png` Characters grid with per-column toggles, tabs: Characters | Words and Basic | Component | Dakuten
- `/design/Desktop - 6.png` Words flashcard (empty state): big kana, stats row, romaji input, mic, hidden answer
- `/design/Desktop - 7.png` Words flashcard with Dictionary button, EN toggle, "Reveal Answer", "Space Bar for answer"
- `/design/folders/*.png` Folder icons (7) and two torn-paper footer pieces

Rules:
1. Match the designs for layout, spacing, type scale, colors and component shapes. Sample colors from the images; put them in design tokens (CSS variables), never hard-code in components.
2. If the design is ambiguous or missing (mobile, dictionary, error states), **propose first in a short written note, then implement**. Do not silently invent.
3. Keep a `docs/DECISIONS.md` log of every assumption made.

### Reference websites (open and study each; inspiration only)

| Link | Take this from it | Do NOT |
|---|---|---|
| https://jlptcards.com/hiragana-words | Words flashcard flow: one big kana/word per card, romaji answer, progress/accuracy feedback, how words are grouped by set. It is a premium product, so only use the publicly visible behavior as reference for our own simpler version. | Copy its code, copy, assets, or word lists. Do not try to access gated content. |
| https://www.alicias.page/art/ | The ASCII-art loading screen and the random-character effect on load/refresh (our title scramble for にほん). Study how the characters resolve over time and how it feels on reload. | Copy its code or artwork. Our ASCII frames come from our own assets. |
| https://www.gimiaw.web.id/ | The motion language: entrance choreography, page/section transitions, hover and press springs, overall pacing (built with Framer). Translate the feel into `motion` presets in `src/lib/motion.ts`. | Copy its layout, assets, or text. Match the *feel*, not the design. |

If a reference cannot be opened, say so in `docs/DECISIONS.md` and continue from the written description above. Never guess at what a page does.

## 3. Known design notes (resolve, do not ignore)

- Tab label says **"Component"**; the product term is **Combination**. Use "Combination" everywhere; flag it to the user.
- The words mock shows きょう under **Basic**, but きょ is a yoon (Combination). The Basic word pool must contain only basic kana; the mock text is placeholder.
- Folder PNGs are 1920×1080 with large transparent padding → **trim to bounding box**, convert to WebP/AVIF, export 1x/2x. Never ship the raw files.
- Torn-paper footer art ("Group 1.png" and the grass piece) should be a full-width section that stretches/crops responsively; do not let it distort.
- No mobile mockups exist. Design mobile from the desktop language (see §8).
- The three reference sites in §2 are inspiration only. Do not copy their code, assets, or word lists.

## 4. Tech stack (decided)

| Concern | Choice |
|---|---|
| Framework | Next.js (App Router) + TypeScript (strict) |
| Styling | Tailwind CSS + CSS variables for tokens |
| Motion / drag | `motion` (Framer Motion) — page transitions, layout animations, drag, springs |
| State | Zustand (+ `persist` middleware) |
| Kana ⇄ romaji | `wanakana` |
| Speech in | Web Speech API (`SpeechRecognition`, `lang="ja-JP"`) behind an adapter interface |
| Speech out | `speechSynthesis` ja-JP (dictionary pronunciation) |
| Fonts | `next/font` — Josefin Sans (UI), a Japanese font subset to kana only (e.g. Zen Maru Gothic / Noto Sans JP), pixel font for the logo |
| Data | Static JSON generated at build time by scripts (see §6) |
| DB (later) | Postgres (Neon/Supabase) + Drizzle. **Not in v1**; progress lives in localStorage/IndexedDB behind a `ProgressRepository` interface so a DB can be swapped in |
| Tests | Vitest for pure logic (session engine, answer matching, filters); Playwright smoke test for the flashcard flow |
| Backend (v1) | **None.** No separate server and no API routes needed: word/kana data is static JSON, session logic and answer matching run in the browser, progress is in localStorage. Do not add Express/Nest/etc. |
| Deploy | **Cloudflare (free plan)** — static hosting of a Next.js static export (see §4b) |

### 4b. Cloudflare deployment constraints (v1)

- Use `output: "export"` in `next.config` (fully static site). Dynamic segments like `[script]` must use `generateStaticParams` for `hiragana` and `katakana`.
- Because a static export has no image optimizer, set `images.unoptimized = true` and rely on our own pre-optimized WebP/AVIF output from `scripts/trim-assets.ts`.
- No server-only features in v1: no route handlers, no Server Actions, no middleware, no `cookies()`/`headers()`.
- Word JSON ships as static assets and is lazy-loaded per script/set (never bundled into one giant JS file). Keep each file small; gzip/brotli is handled by Cloudflare.
- Provide `wrangler.jsonc` (static assets) or Cloudflare Pages config, a `npm run deploy` script, and a short `docs/DEPLOY.md` with exact steps. Free `*.workers.dev` / `*.pages.dev` URL first; custom domain optional.
- **Later (accounts/DB):** switch to the OpenNext Cloudflare adapter (`@opennextjs/cloudflare`) on Workers with D1 or an external Postgres. Note the Workers Free plan has a small worker-size limit, so keep large data out of the server bundle. Do not do this migration until accounts are actually in scope.

Do not add libraries outside this list without writing the reason in `docs/DECISIONS.md`.

## 5. Folder structure

```
/design                      reference images (read-only)
/public/folders              optimized folder icons
/public/paper                torn-paper footer pieces
/src/app
  page.tsx                   home
  [script]/characters/page.tsx
  [script]/words/page.tsx    script = hiragana | katakana
  resources/page.tsx         coming soon
/src/components
  home/ (FolderField, DraggableFolder, TitleScramble, Footer)
  nav/ (PillNav, Dropdown)
  loader/ (AsciiLoader, useAssetProgress)
  characters/ (KanaGrid, ColumnToggle)
  words/ (FlashCard, StatsRow, AnswerInput, MicButton, DictionaryDrawer)
  ui/ (Pill, Segmented, Button)
/src/lib
  kana/ (tables, sets, romaji helpers)
  session/ (engine, tiers)          ← pure TS, fully unit-tested
  speech/ (adapter, webSpeech)
  match/ (answer normalization + matching)
/src/data                    generated JSON (committed)
/scripts                     build-words.ts, build-ascii.ts, trim-assets.ts
/docs                        DECISIONS.md, ARCHITECTURE.md
```

## 6. Data

**Kana tables** (`src/lib/kana`): for each script, three sets.
- Basic: 46 (a–n, wa, wo, n)
- Dakuten: が行 ざ行 だ行 ば行 + ぱ行 (25)
- Combination: all 33 yoon (きゃ…りょ plus ぎゃ, じゃ, びゃ, ぴゃ rows)
Each entry: `{ char, romaji: string[], group, set }` (romaji array holds accepted spellings: shi/si, chi/ti, tsu/tu, fu/hu, ji/zi…).

**Word list** (`scripts/build-words.ts`): generated from JMdict (via `jmdict-simplified`), output `src/data/words.{hiragana,katakana}.json`.
- Hiragana: entries whose written form is hiragana-only OR tagged usually-kana (`uk`), with a common-priority tag (`ichi1`, `news1`, `spec1`).
- Katakana: loanwords (`gai1` / katakana-only written form).
- Exclude: proper nouns, vulgar/archaic/obscure tags, entries with fewer than 2 or more than 6 kana.
- Each word precomputes `{ id, kana, kanji[], romaji, meaningEn, meaningId?, sets: ('basic'|'combination'|'dakuten')[], length, freqRank }`.
- A word belongs to a set **only if all its kana belong to that set or lower** (Basic ⊂ Dakuten ⊂ Combination for pool-building). Allow っ and ー in all pools.
- Indonesian meanings: JMdict has none. Generate `meaningId` as an optional field; leave blank rather than fabricate. The EN toggle in the design implies EN/ID switching.
- **Attribution required**: JMdict is CC BY-SA 4.0 (EDRDG). Add credit in footer or Resources page.

## 7. Core logic (must be pure, tested, UI-independent)

**Session engine** (`lib/session`)
- Input: script, set, tier size N ∈ {10, 20, 50, 100}, word pool.
- A round has **N unique items** chosen by a shuffle-bag (Fisher–Yates over the pool, seedable RNG). Each new round re-draws a fresh random selection.
- **Controlled repetition** (helps memorization, but must stay rare):
  - A wrong or revealed answer is re-queued **3–5 cards later**.
  - Optionally, a correctly answered item may reappear as a *reinforcement* card with low probability (~10–15% per slot), at most **once per item**, minimum gap of 4 cards, never twice in a row, and total extras capped at ~20% of N. Skip reinforcement at tier 10 if it makes the round feel repetitive.
  - Repeats are extras: they do **not** count toward N.
- Stats: accuracy, remaining, incorrect/total.
- **Tier unlock rule (flawless run):**
  - Tiers are sequential: 10 → 20 → 50 → 100. Only tier 10 is open at the start.
  - A round **passes only if every one of the N items was answered correctly on its first appearance** (no wrong answer, no Reveal). Repeat/reinforcement appearances are practice and never affect pass/fail.
  - If the round has even one mistake, the user **stays on the same tier** and can retry with a new random selection. Never regress to a lower tier.
  - On pass, the next tier unlocks permanently (persisted).
  - The end-of-round summary must show which items were missed, so the retry feels useful rather than punishing.
- Fully unit-tested, seedable RNG so tests are deterministic.

**Answer matching** (`lib/match`)
- Normalize: trim, lowercase, NFKC, katakana→hiragana, strip spaces/punctuation, `wanakana.toKana` for romaji input.
- Compare normalized user kana to the word's kana (this accepts shi/si, tsu/tu, nn/n automatically).
- Typing: check on Enter (optionally live-check for exact match).
- Voice: request `maxAlternatives = 5`, accept if **any** alternative matches kana, any kanji form, or the romaji. Recognizers often return kanji (今日 for きょう), so kanji forms must be in the accepted list.
- Space bar = Reveal Answer (counts as incorrect). Make this keyboard-only friendly.

**Speech adapter**
- Interface `SpeechInput { isSupported; start(); stop(); onResult(alternatives[]) }`.
- Web Speech implementation first. Feature-detect; Firefox has no support → hide mic and show tooltip, never crash.
- Handle: permission denied, no speech, network error, HTTPS requirement, iOS Safari quirks.
- The adapter must make it possible to swap in server-side STT later.

## 8. UX / Motion / Mobile

**Loading** — ASCII-style (alicias.page vibe). On first load and on reload:
1. Full-screen loader shows ASCII-art rendering of the floral background/folders, built from characters.
2. A real progress value from `useAssetProgress` (fonts via `document.fonts.ready`, images via `img.decode()`) drives the loader: characters "resolve" from sparse to dense as progress rises.
3. Then it dissolves into the page. Minimum display ~800ms so it never flashes. Respect `prefers-reduced-motion` (skip to simple fade).
4. ASCII frames are **pre-generated at build time** (`scripts/build-ascii.ts`), not computed at runtime.

**Title scramble** — "Flash Card! にほん": on every load/refresh, the Japanese characters cycle through random kana and settle into にほん left to right (text-scramble effect). Use real kana from the tables as the random pool.

**Interactive folders (home)** — 7 folder icons scattered on the desktop:
- Drag with inertia and slight rotation while dragging; spring on release; bring to front on grab.
- Distinguish a **drag** from a **tap** with a movement threshold so a tap gives the bounce reaction without accidentally moving the folder.
- Folders are **decorative only**: they do NOT link anywhere and have no destination. A click/tap is just a playful reaction (small bounce/wiggle, bring to front). Navigation lives only in the PillNav.
- Positions persist across reloads (localStorage), with a "tidy up" reset.
- Folders are decorative: mark them `aria-hidden` / not focusable so screen-reader and keyboard users are not burdened; dragging is pure enhancement.
- On touch: `touch-action: none` only on the folder itself so page scroll still works elsewhere.

**Motion language** (Framer-style, reference gimiaw.web.id): staggered entrance on first paint, spring-based hover/press, shared-layout transitions between Characters and Words, nav dropdown with soft scale+fade, card flip/slide between words. Keep durations short (150–400ms), use a small set of shared spring/ease presets in one file.

**Characters page** — grid per design. Column toggles select which consonant groups are active; persisted per script+set; these selections feed Words mode when "Characters" practice is started.

**Words page** — layout per Desktop-6/7: big kana, stats row (Accuracy / Remaining / Incorrect x/N), romaji input, mic button, Reveal Answer, EN toggle, Dictionary button. Correct answer: subtle success animation then next card. Wrong: shake + answer reveal.

**Dictionary** (not designed — proposed): right-side drawer on desktop, bottom sheet on mobile. Words the user answered correctly are "filed" in; list as small paper-scrap cards (kana, romaji, meaning). Search (kana/romaji/meaning), filter (New / Learning / Mastered), tap a card for detail with TTS playback. Fits the folder metaphor.

**Mobile** — design deliberately, not by shrinking:
- Nav: same pill nav, condensed; dropdown becomes a full-width sheet.
- Home: folders scattered in a narrower field, still draggable; footer art cropped via `object-fit: cover`.
- Words: input pinned above the on-screen keyboard (use `visualViewport` + `100dvh`, never `100vh`); mic button ≥ 48px; tap targets ≥ 44px; Space-bar hint hidden on touch.
- Test at 360×800, 390×844, 768×1024, 1440×900. No horizontal scroll at any width.

## 9. Non-negotiables

- TypeScript strict, no `any` without a comment.
- Logic in `lib/` is pure and unit-tested; components stay thin.
- Accessibility: focus states, labels for icon-only buttons, `aria-live` for answer feedback, reduced-motion support, sufficient contrast.
- Performance: optimized images (WebP/AVIF + `next/image`), font subsetting, lazy-load dictionary and speech code, Lighthouse mobile performance ≥ 85 on home.
- Each phase ends with: it builds, tests pass, lints clean, a short summary of what changed, and an update to `docs/DECISIONS.md`.
- **Do not start the next phase.** Stop and wait for review.

---

# PART B — Phase prompts (paste one at a time)

## Phase 0 — Review & plan (no code)

```
Read AGENTS.md fully, open every image in /design, and open the three reference websites listed in AGENTS.md §2 (jlptcards.com/hiragana-words, alicias.page/art, gimiaw.web.id).
Do NOT write app code yet. Produce docs/ARCHITECTURE.md and a short written review that contains:
1. Your understanding of each screen (one paragraph each) so I can verify you read the designs correctly.
2. A list of ambiguities, inconsistencies, and missing pieces (mobile, dictionary, error/empty states, tier-unlock rule) with your recommended resolution for each.
3. The design tokens you extracted (colors, type scale, radii, spacing) as a table.
4. A risk list (speech support across browsers, asset weight, touch drag vs scroll, word-list quality).
5. For each reference site: what you observed (flow, loading behavior, motion pacing) and how you will adapt it, without copying anything.
6. Confirmation of the folder structure and anything in the tech stack you would change, with reasons.
Then stop and wait for my approval.
```

## Phase 1 — Foundation, assets, tokens

```
Phase 1 of AGENTS.md. Scaffold the Next.js + TS + Tailwind project per the stack and folder structure.
- Implement design tokens as CSS variables and Tailwind theme.
- Load fonts with next/font (Josefin Sans, Japanese kana-subset font, pixel font for the logo if available; otherwise a clearly marked placeholder).
- Write scripts/trim-assets.ts: trim transparent padding on every folder/paper PNG, output WebP at 1x/2x into /public. Report before/after file sizes.
- Build the shared layout: PillNav (Hiragana / Katakana / Resources with dropdowns exactly as Desktop-2/3/4), footer with torn-paper grass art and the ShenNatsu logo. Responsive from 360px up.
- No loader, no folders, no flashcards yet.
Acceptance: pixel-compare Desktop-1 layout at 1440px visually; nav works by mouse and keyboard; build + lint pass.
Stop when done.
```

## Phase 2 — Home: folders, title scramble, ASCII loader

```
Phase 2 of AGENTS.md (§8 Loading, Title scramble, Interactive folders).
- scripts/build-ascii.ts generates ASCII frames from the floral background and folders at build time.
- AsciiLoader driven by real asset/font progress (useAssetProgress), min 800ms, reduced-motion fallback.
- TitleScramble for "にほん" using random kana, runs on every load.
- FolderField with 7 draggable folders: inertia, rotation on drag, bring-to-front, drag-vs-click threshold, persisted positions, "tidy up" reset, keyboard accessible, touch-safe.
- Use shared motion presets in src/lib/motion.ts.
Acceptance: works on desktop and a 390px viewport; page can still scroll on touch; no layout shift after loader; 60fps drag on a mid-range phone profile.
Stop when done.
```

## Phase 3 — Kana data + Characters page

```
Phase 3 of AGENTS.md. Implement src/lib/kana tables for hiragana and katakana (Basic 46, Dakuten 25, Combination 33) with accepted romaji variants, plus the Characters page per Desktop-5 including Segmented tabs and per-column toggles persisted per script+set.
Write Vitest tests verifying counts, romaji variants (shi/si, chi/ti, tsu/tu, fu/hu, ji/zi), and that every kana appears in exactly one set.
Acceptance: all six script×set grids render correctly on desktop and mobile; tests pass.
Stop when done.
```

## Phase 4 — Word data + session engine (no UI)

```
Phase 4 of AGENTS.md (§6 and §7). Implement scripts/build-words.ts from JMdict (jmdict-simplified) with the filters in §6 and generate the JSON files. Implement lib/session (shuffle-bag, re-queue on wrong, rare capped reinforcement repeats, flawless-run tier unlock with stay-on-tier retry, tiers 10/20/50/100, seedable RNG) and lib/match (normalization + matching) as pure TypeScript.
Write thorough Vitest tests: no duplicate items among the N unique picks, correct re-queue positions, reinforcement caps (once per item, min gap, never back-to-back, ≤20% extras), a mistake or Reveal on first appearance blocks unlock while a mistake on a repeat does not, tier never regresses, set-membership rule (Basic pool contains only basic kana), shi/si and kanji-form acceptance, katakana→hiragana normalization.
Report: word counts per script×set. If any pool has fewer than 100 words, tell me and propose how to handle it.
No UI in this phase.
Stop when done.
```

## Phase 5 — Words flashcard UI (typing)

```
Phase 5 of AGENTS.md. Build the Words page per Desktop-6/7 using the session engine: big kana, stats row, romaji input, Reveal Answer (button + Space), EN toggle, success/wrong animations, tier selection and flawless-run unlock (retry same tier on any mistake), end-of-round summary listing missed items. Persist unlocked tiers via ProgressRepository (localStorage implementation).
Acceptance: full session playable by keyboard only; accessible feedback via aria-live; mobile layout keeps the input visible above the keyboard.
Stop when done.
```

## Phase 6 — Voice answers

```
Phase 6 of AGENTS.md (§7 Speech adapter). Implement the SpeechInput adapter + Web Speech implementation, MicButton states (idle / listening / processing / error / unsupported), and integrate with lib/match using alternatives.
Handle permission denied, no-speech, network error, unsupported browser (hide mic, show a friendly hint). Never crash.
Add a manual test checklist in docs/VOICE_TESTING.md (Chrome desktop, Chrome Android, Safari iOS, Firefox).
Stop when done.
```

## Phase 7 — Dictionary

```
Phase 7 of AGENTS.md. First write a one-page UX proposal for the Dictionary (drawer on desktop, bottom sheet on mobile, search/filter, detail with TTS) and wait for my approval. After approval, implement it with the motion language in AGENTS.md §8 and JMdict attribution on the Resources/footer.
```

## Phase 7.5 — Cloudflare deploy

```
Follow AGENTS.md §4b. Configure the static export, make sure `next build` succeeds with zero server-only features, add the Cloudflare config and `npm run deploy`, and write docs/DEPLOY.md with exact step-by-step instructions (account setup, wrangler login, first deploy, connecting the GitHub repo for auto-deploys, custom domain). Verify the deployed URL: all routes load on hard refresh (no 404 on /hiragana/words), assets are cached, fonts and images load.
Stop when done.
```

## Phase 8 — Polish & QA

```
Phase 8. Audit: Lighthouse (mobile + desktop), accessibility (axe), reduced-motion, keyboard-only walkthrough, 360/390/768/1440 widths, slow-3G loader behavior. Fix issues, add Playwright smoke test for the Words flow, update docs. Give me a final report with before/after numbers.
```

---

# PART C — Backend roadmap (FUTURE — DO NOT START until v1 is finished and the user explicitly says so)

> Agents: do not build, scaffold, or add dependencies for anything in Part C during Phases 0–8. Part A's "no backend in v1" rule stays in force. The only allowed preparation is keeping progress behind the `ProgressRepository` interface and using stable word IDs.

## C1. Target architecture

```
Browser (static Next.js export, Zustand, IndexedDB, Web Speech)
   ├── GET static assets + word JSON ──► Cloudflare static hosting (CDN)
   └── sync progress (only when logged in) ──► API Worker (Hono)
                                                   └──► D1 (SQLite) via Drizzle
```

Principles:
1. **Local-first.** The app must keep working fully without login and offline. The server is a sync target, never a requirement to study.
2. **Frontend stays static.** The API is a separate Worker so the frontend keeps its static-export benefits and the Workers Free size limit is not an issue.
3. **Words stay static JSON.** The database stores only `word_id` references per user, no dictionary table. `word_id` must be the stable JMdict entry id and never change across word-list rebuilds.
4. **Thin backend.** Validation, auth, and storage only. No business logic that the client already owns (session engine stays in the browser).

## C2. Stack

| Concern | Choice |
|---|---|
| API | Hono on Cloudflare Workers |
| DB | Cloudflare D1 + Drizzle ORM (migrations committed). Postgres (Neon) only if D1 becomes limiting |
| Auth | An established library (Better Auth or Auth.js). Cookie sessions, HttpOnly + Secure + SameSite. Do not hand-roll auth or password hashing |
| Validation | Zod on every endpoint (shared schemas in `packages/shared` or `src/shared`) |
| Rate limiting | Cloudflare rate-limiting rules or a KV-based limiter on auth endpoints |
| Secrets | `wrangler secret`, never committed |

## C3. Data model

- `users` (id, email, created_at, …auth-library tables)
- `word_progress` (user_id, word_id, correct_count, wrong_count, box, last_seen, updated_at) — PK (user_id, word_id)
- `tier_unlocks` (user_id, script, set, tier, unlocked_at) — PK (user_id, script, set, tier)
- `round_results` (id, user_id, script, set, tier, passed, accuracy, missed_word_ids JSON, created_at)
- `settings` (user_id, meaning_lang, column_selections JSON, updated_at)

## C4. API

- Auth endpoints from the chosen library
- `GET /me/progress` — everything above in one payload (small data, one round trip)
- `PUT /me/progress` — batch upsert of changed rows since last sync
- `POST /rounds` — store a finished round result
- `GET /me/dictionary` — only if the Dictionary needs server-side filtering (otherwise computed client-side)
- All input validated with Zod; all queries scoped to the authenticated `user_id`.

## C5. Sync rules (keep simple)

- Each progress row has `updated_at`; conflict resolution is **last-write-wins per row**.
- `tier_unlocks` is monotonic: the union of unlocks wins; a tier is never re-locked.
- Counters (`correct_count`, `wrong_count`) take the max on conflict.
- On first login with existing local data: merge local into the account, show a short "we merged your progress" confirmation. Never silently discard local data.
- Offline: queue changes locally and retry; never block the UI on the network.
- No CRDTs, no websockets.

## C6. Security checklist

- **CORS:** the API only allows the exact frontend origin(s) (e.g. `https://yourdomain.com`), never `*` when cookies are used. Prefer serving the API under the same domain (e.g. `/api/*` via Worker route) so CORS is not needed at all. CORS protects browsers only; it is not a substitute for auth, so every endpoint still checks the session.
- CSRF protection for cookie-authenticated mutating requests (SameSite + origin check or token).
- Rate-limit login and signup.
- Never trust client-sent `user_id`; derive it from the session.
- Privacy: store the minimum (email only). Provide account deletion that removes all rows.

## C7. Phases

### Phase C1 — API skeleton and data layer

```
Read AGENTS.md Part C. Only proceed because the user confirmed v1 is complete.
Create the API Worker (Hono) in /api, D1 schema and migrations with Drizzle, shared Zod schemas, and the endpoints GET/PUT /me/progress and POST /rounds, all behind a stub auth middleware for now. Include tests (Vitest) for validation and for scoping queries to the user. Do not touch the frontend yet.
Stop when done.
```

### Phase C2 — Auth

```
Integrate the chosen auth library with cookie sessions, wire it to the API, and implement the CORS/CSRF/rate-limit rules in Part C §C6. Login must be optional in the UI: the app works fully logged out. Write docs/AUTH.md describing the flow and threat considerations.
Stop when done.
```

### Phase C3 — Client sync

```
Implement the SyncRepository behind the existing ProgressRepository interface: local-first with a retry queue, the merge rules in §C5, and the first-login merge flow. UI: small, unobtrusive sync status indicator. Test: offline study → reconnect → data appears on a second device; conflict cases per §C5.
Stop when done.
```

### Phase C4 — Spaced repetition (optional, only if requested)

```
Use the `box` field to schedule review (Leitner boxes first). Add a "Review due" entry point. Keep the flawless-run tier rule untouched. Write unit tests for scheduling.
Stop when done.
```