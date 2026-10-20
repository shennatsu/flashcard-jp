# Phase 0 — Reference and Asset Audit

**Scope:** reference/asset review only. No application code, asset conversion, or commit was performed. The three reference URLs were fetched with live web extraction and inspected with a live browser DOM/text pass on 2026-10-20; the local PNGs were decoded and measured directly.

**Evidence used:** `AGENTS.md`, live web extraction/browser DOM output for the three reference URLs, the local `gimiaw/porto` clone, and direct PNG decoding for filenames, dimensions, RGBA mode, alpha bounds, and non-transparent area. Any semantic interpretation that could not be established from those sources is marked **Inferred**.

## 1. Reference-site review and adaptation boundary

### jlptcards — functional reference

**Observed in live web extraction and browser DOM/text inspection on 2026-10-20:** the public flow exposes a `Hiragana Words ひらがな` page with `Characters` and `Words` controls, `Fundamentals · N5 · 10 words`, `Reset`, `Dictionary`, the prompt `きょう`, a `Reading` label, `Accuracy 0%`, `Remaining 10`, `Incorrect 0 / 10`, `Reveal Answer`, and the `“Space Bar” for answer` hint. The extracted page also exposes a navigation split between Hiragana Characters and Hiragana Words.

**Adaptation:** retain the information hierarchy that makes practice understandable at a glance: one primary kana/word, compact session stats, an explicit answer/reveal affordance, and a keyboard hint where it is useful. Implement our own session engine, tier rules, word data, styling, labels, and content. Do not copy code, assets, word lists, text, or the visual composition.

**Not established:** the supplied observation does not verify gated behavior, exact timing, detailed error treatment, or the complete word taxonomy. Those details must come from our written product rules and local designs, not guesses about the reference.

### alicias.page/art — loading/effect reference

**Observed in live browser DOM/text inspection on 2026-10-20:** the page title is `Art · Alicia Zhou`; the page exposes `projects`, `art`, `now`, and `about` navigation, the heading `Art by Alicia Zhou`, a visible ASCII-like glyph line, `More on my art page`, typography credits (`Uncut Sans` and `Departure Mono`), and a Hojicha/Astro footer. The live DOM does not prove a loader implementation or motion timing, so the ASCII-loader adaptation remains a product proposal from `AGENTS.md`, not a claim about a specific animation.

**Adaptation:** the written product brief independently calls for an ASCII-style loader and a kana title-scramble effect. Build those from our own folder/paper assets and pre-generated frames. The loader should communicate real local asset/font progress, then dissolve into the home page. Do not reproduce the site’s artwork, code, copy, or any unverified implementation detail.

**Inferred:** the desired feeling is a character-based, playful reveal rather than a literal recreation of the reference site. This is a design direction, not a verified observation of the page.

### gimiaw.web.id — motion-language reference

**Observed in live browser DOM/text inspection on 2026-10-20:** the page exposes a portfolio with Home, Project Archive, Curriculum Vitae, `SPACE to SKIP`, About, Experience, Projects, and a footer. The page rendered at a tall document (`ph` 3490 in the inspection viewport), with duplicated responsive/intro content visible in the extracted text. **Observed in the local clone** `D:/HERMES/hermes/cache/gimiaw-porto`: Framer Motion is a dependency; `LoadingScreen.tsx` uses a 400ms ease-out fade with a 1000ms safety fallback; `usePreloader.ts` waits for fonts and an image; and `Navbar.tsx` defines 0.2–0.3s item transitions with 0.05s stagger. These are reference observations only, not code to copy.

**Adaptation:** use the reference only to calibrate pacing and choreography: short staggered entrances, restrained spring feedback, soft dropdown transitions, and coherent page/card transitions. Keep all layout, assets, copy, and interaction semantics specific to FlashCardJP. Centralize the resulting values in a small motion-preset module; do not copy Framer code or animation definitions.

**Inferred:** motion should support the cozy desktop-folder metaphor without competing with study feedback. The proposed presets below are starting values to validate against the screenshots and reduced-motion behavior.

## 2. Screen inventory

The seven reference screenshots were enumerated from `design/reference`. Dimensions are exact file metadata, not a claim about the browser viewport or page height.

| File | Dimensions | Screen role from `AGENTS.md` / brief |
|---|---:|---|
| `Desktop - 1.png` | 1440 × 2497 | Home, default state. **Inferred:** primary folder-field landing composition. |
| `Desktop - 2.png` | 1440 × 2497 | Home with the Hiragana dropdown open; choices are Hiragana Characters and Hiragana Words. |
| `Desktop - 3.png` | 1440 × 2497 | Home with the Katakana dropdown open. |
| `Desktop - 4.png` | 1440 × 2497 | Home with Resources selected/open and the `Coming soon <3` state. |
| `Desktop - 5.png` | 1440 × 2497 | Characters grid with per-column toggles; tabs for Characters/Words and Basic/Combination/Dakuten. The mock label says `Component`, but the product term is **Combination**. |
| `Desktop - 6.png` | 1440 × 1893 | Words flashcard empty state: large kana, stats row, romaji input, microphone, hidden answer, and reveal path. |
| `Desktop - 7.png` | 1440 × 1893 | Words flashcard state with Dictionary button, EN toggle, Reveal Answer, and `Space Bar for answer` hint. |

### Screen-level implementation implications

- Home must preserve the pill-navigation hierarchy across the default, Hiragana, Katakana, and Resources states; dropdowns are navigation, not decoration.
- Characters must expose the script/set tabs and column selection without silently treating `Component` as a product term. Use **Combination** in the application and document the screenshot mismatch.
- Words must make the primary kana and session feedback dominant. Reveal/Space behavior is functional feedback, not only a visual control.
- Dictionary is represented in `Desktop - 7` but its full interaction is not specified by the screenshots. Treat the drawer/sheet proposal as **Inferred** until approved.
- No mobile reference exists. Mobile behavior must be designed from the desktop language, not obtained by shrinking the screenshots.

## 3. Source asset inventory

The nine files below are all PNGs. Terminal inspection reported RGBA, 8-bit color, 1920 × 1080 for the eight `Desain tanpa judul` files and 1670 × 949 for `Group 1.png`. The alpha bounds are measured as `(left, top, right, bottom)` with the right/bottom edges exclusive. The non-transparent percentage is calculated against the full source canvas.

| Source file | Canvas / format | Alpha bounds | Non-transparent area | Role / confidence | Proposed output stem |
|---|---|---:|---:|---|---|
| `Desain tanpa judul.png` | 1920 × 1080 RGBA | `(83, 148, 1796, 983)` — 1713 × 835 | 61.831% | **Inferred:** pale torn-paper/footer base or paper section piece. The role follows the two-footer-piece inventory in `AGENTS.md`; the filename itself does not identify it. | `footer-paper` |
| `Desain tanpa judul (1).png` | 1920 × 1080 RGBA | `(384, 85, 1487, 995)` — 1103 × 910 | 44.700% | **Inferred:** decorative folder icon 1. Exact semantic label is intentionally not assigned from the filename. | `folder-01` |
| `Desain tanpa judul (2).png` | 1920 × 1080 RGBA | `(502, 116, 1568, 975)` — 1066 × 859 | 40.981% | **Inferred:** decorative folder icon 2. | `folder-02` |
| `Desain tanpa judul (3).png` | 1920 × 1080 RGBA | `(471, 172, 1508, 1035)` — 1037 × 863 | 40.281% | **Inferred:** decorative folder icon 3. | `folder-03` |
| `Desain tanpa judul (4).png` | 1920 × 1080 RGBA | `(560, 295, 1352, 946)` — 792 × 651 | 23.240% | **Inferred:** decorative folder icon 4. | `folder-04` |
| `Desain tanpa judul (5).png` | 1920 × 1080 RGBA | `(625, 258, 1348, 856)` — 723 × 598 | 19.250% | **Inferred:** decorative folder icon 5. | `folder-05` |
| `Desain tanpa judul (6).png` | 1920 × 1080 RGBA | `(513, 200, 1361, 884)` — 848 × 684 | 24.992% | **Inferred:** decorative folder icon 6. | `folder-06` |
| `Desain tanpa judul (7).png` | 1920 × 1080 RGBA | `(632, 316, 1288, 788)` — 656 × 472 | 14.307% | **Inferred:** decorative folder icon 7. | `folder-07` |
| `Group 1.png` | 1670 × 949 RGBA | `(68, 123, 1493, 848)` — 1425 × 725 | 58.631% | **Inferred:** green/grass torn-paper/footer overlay. The color/shape role is inferred from metadata plus the `AGENTS.md` footer-piece note; verify visually before production export. | `footer-grass` |

### Asset role decisions

- The seven numbered `Desain tanpa judul (1)` through `(7)` files are assigned to the seven purely decorative home folders by stable ordinal order. This is a filename-to-role map, not a claim that the source artwork has meaningful numbered identities.
- The two unnumbered/alternate files are assigned to the two footer pieces: `Desain tanpa judul.png` to the paper base and `Group 1.png` to the grass/green overlay. **Inferred; visual confirmation is still required before publishing.**
- Folder art is decorative only. It must not become a navigation target, a semantic label, or a keyboard burden; the product navigation remains in the pill nav.

## 4. Naming map

Use source names only in the audit and conversion input. The application-facing names should be stable, ASCII-safe, and independent of the original design-export names.

| Source | Semantic ID | Proposed generated files | Usage |
|---|---|---|---|
| `Desain tanpa judul (1).png` | `folder-01` | `public/folders/folder-01.webp`, `folder-01@2x.webp` (optional AVIF equivalents) | Decorative home folder 1; draggable and non-navigational. |
| `Desain tanpa judul (2).png` | `folder-02` | `public/folders/folder-02.webp`, `folder-02@2x.webp` | Decorative home folder 2. |
| `Desain tanpa judul (3).png` | `folder-03` | `public/folders/folder-03.webp`, `folder-03@2x.webp` | Decorative home folder 3. |
| `Desain tanpa judul (4).png` | `folder-04` | `public/folders/folder-04.webp`, `folder-04@2x.webp` | Decorative home folder 4. |
| `Desain tanpa judul (5).png` | `folder-05` | `public/folders/folder-05.webp`, `folder-05@2x.webp` | Decorative home folder 5. |
| `Desain tanpa judul (6).png` | `folder-06` | `public/folders/folder-06.webp`, `folder-06@2x.webp` | Decorative home folder 6. |
| `Desain tanpa judul (7).png` | `folder-07` | `public/folders/folder-07.webp`, `folder-07@2x.webp` | Decorative home folder 7. |
| `Desain tanpa judul.png` | `footer-paper` | `public/paper/footer-paper.webp`, `footer-paper@2x.webp` | Full-width paper/footer base. |
| `Group 1.png` | `footer-grass` | `public/paper/footer-grass.webp`, `footer-grass@2x.webp` | Full-width green/grass/footer overlay. |

**Naming rule:** retain a machine-readable manifest during the future conversion step with source filename, semantic ID, source dimensions, alpha bounds, output dimensions, encoder, quality, and byte sizes. Do not use the numeric suffix as a user-facing folder meaning.

## 5. Transparency and bounding-box optimization plan

The source canvases contain substantial transparent padding. The measured non-transparent bounds show why shipping the raw 1920 × 1080 folder canvases would waste layout and transfer space: several folder files use less than 25% of the source canvas by non-transparent area.

1. **Keep inputs immutable.** Read from `design/source`; write optimized derivatives under `public/folders` and `public/paper`. Never overwrite or relocate the design sources.
2. **Trim by alpha bounds.** Find the bounding rectangle of every pixel with alpha greater than zero. Preserve partially transparent anti-aliased edge pixels; do not use an aggressive alpha threshold that cuts shadows, paper fibers, or soft edges. Add a small encoder-safe transparent margin only if an edge comparison shows that the trim clips a halo.
3. **Generate from the trimmed canonical image.** Produce a 1× derivative and a 2× derivative from the trimmed RGBA source, rather than upscaling a 1× result. Preserve alpha and color profile behavior. Encode WebP and evaluate AVIF where browser support, quality, and decode cost are acceptable.
4. **Use explicit intrinsic dimensions.** Record the trimmed width/height and reserve the rendered box so loading does not shift the home layout. Use `object-fit: contain` for folder art. Do not scale a folder by its old transparent canvas dimensions.
5. **Handle footer art as a composition.** Render paper and grass as separate full-width layers so they can stretch/crop responsively without distorting the artwork. Prefer a cover/crop strategy or responsive background positioning; never force the original aspect ratio into a fixed-height box.
6. **Select responsive sources.** Use `srcset`/equivalent 1×/2× selection and lazy-load below-the-fold footer art. Folder art is small in the viewport after trimming, so avoid downloading 2× assets where the displayed size does not justify them.
7. **Verify every derivative.** Compare the source and derivative at 100% and at the intended desktop/mobile display sizes: transparent edge retained, no unexpected matte background, no color shift, no visible WebP/AVIF ringing, and no overflow from the cropped footer.
8. **Report the conversion.** The future asset script should output a before/after table for dimensions, alpha bounds, byte size, format, and quality. Raw source PNGs remain design references, not public runtime assets.

## 6. Proposed motion preset language

These are **Inferred/proposed starting values**, derived from the supplied description of gimiaw’s motion-heavy portfolio, the brief’s 150–400 ms guidance, and the existing product requirements. They are not copied from any reference implementation.

| Preset | Initial proposal | Intended use | Guardrail |
|---|---|---|---|
| `easeOut` | cubic-bezier `(0.22, 1, 0.36, 1)`, 180–260 ms | Small reveals, dropdown entry, button feedback | Keep content readable during the transition. |
| `easeInOut` | cubic-bezier `(0.65, 0, 0.35, 1)`, 240–360 ms | Page/section state changes and card transitions | Avoid stacking multiple long transitions. |
| `softSpring` | stiffness ~260, damping ~24, mass ~0.7 | Nav/dropdown scale and press recovery | No bounce that moves text or changes layout. |
| `folderSpring` | stiffness ~180, damping ~18, mass 1 | Folder release after drag; small decorative settle | Limit rotation and displacement; decoration must not block scrolling. |
| `pageStagger` | opacity 0→1, y 12→0; 40–60 ms child stagger | First-paint home sections and nav groups | Run once; do not replay on every minor state update. |
| `dropdown` | opacity 0→1, scale 0.96→1, y −4→0; 180–220 ms | Hiragana/Katakana/Resources menus | Preserve keyboard focus and close behavior. |
| `cardSwap` | short horizontal/opacity transition, 220–320 ms | Advancing between word cards | Answer feedback must complete or remain perceivable before the next item. |
| `press` | scale ~0.97 with spring recovery | Buttons and segmented controls | Never rely on motion as the only pressed/selected state. |
| `loaderExit` | opacity 1→0, 280–400 ms | ASCII loader handoff | Minimum loader display is about 800 ms; use a simple fade under reduced motion. |

Implementation policy for the future phase:

- Put the values in one shared `src/lib/motion.ts` preset layer rather than scattering ad hoc transitions through components.
- Animate transform and opacity where possible; do not animate layout-heavy properties for folder dragging or card feedback.
- Support `prefers-reduced-motion`: remove stagger, springs, rotation, and card movement; retain immediate state changes or a short opacity fade.
- The decorative folder tap reaction is a bounce/wiggle only. It does not navigate and it must not be focusable for screen readers.
- Validate motion at 360 × 800, 390 × 844, 768 × 1024, and 1440 × 900; the reference screenshots are tall composites and should not be treated as a single fixed viewport height.

## 7. Adaptation rules: take the behavior, not the source

- **Take:** jlptcards’ clear separation of Characters and Words and its compact practice feedback.
- **Take:** the supplied alicias direction of an ASCII-style load/reveal feeling, implemented from our own pre-generated frames and assets.
- **Take:** gimiaw’s described pacing, stagger, and spring vocabulary as a motion-quality target.
- **Do not take:** source code, DOM structure, CSS, assets, artwork, copy, word lists, exact animation constants, or distinctive layout from any reference.
- **Own product rules remain authoritative:** Basic/Combination/Dakuten set definitions, the flawless first-appearance tier unlock, local-first progress, and the folder-as-decoration rule.

## 8. Risks and mitigations

| Risk | Why it matters | Mitigation / decision |
|---|---|---|
| Asset-role ambiguity | Generic export names do not prove which visual is which folder or footer piece. | Keep the ordinal naming map, mark the two footer assignments **Inferred**, and perform a visual/source review before conversion is accepted. |
| Transparent padding and soft edges | Raw canvases waste bytes and create misleading intrinsic sizes; an aggressive trim can clip shadows. | Alpha-bounds trim at alpha > 0, retain antialiasing, compare edge pixels, and record before/after bounds. |
| WebP/AVIF quality or alpha behavior | Compression can introduce halos or color shifts in pale paper/grass edges. | Compare both formats at 1×/2×; retain the format that passes edge and byte-size checks per asset. |
| Responsive footer distortion | The footer pieces are not the same aspect ratio as every target viewport. | Use separate layers with responsive cover/crop positioning; never stretch non-uniformly. |
| Folder drag versus page scroll | Touch dragging can steal normal scrolling and make decorative objects frustrating. | Apply `touch-action: none` only to the folder, use a movement threshold, keep page scrolling elsewhere, and test on narrow widths. |
| Motion fatigue or accessibility | A motion-heavy treatment can obscure answer feedback or harm reduced-motion users. | Central presets, short durations, transform-only animation, reduced-motion fallback, and keyboard/focus checks. |
| Speech/browser support | Web Speech support and permissions vary, especially on Firefox and iOS. | Keep voice behind an adapter, feature-detect, hide/disable the mic with a useful explanation, and never make typing depend on speech. |
| Word-list quality and set membership | Incorrect pool membership would undermine the Basic/Combination/Dakuten learning model. | Generate and test static data separately; enforce the documented set rule and report pool counts before UI work. |
| Reference evidence is incomplete | Live DOM/text inspection does not prove every Alicia animation frame, and no mobile screenshots exist. | Label runtime-motion proposals separately, use the written brief as the product source of truth, and document mobile decisions before implementation. |
| Screenshot dimensions are tall composites | Matching a full 2497 px image as a viewport can lead to wrong breakpoints and spacing assumptions. | Treat dimensions as artifact metadata; validate layout at the explicit target viewports in `AGENTS.md`. |

## 9. Acceptance checks for this review artifact and the next asset step

### This artifact

- [x] Exact inventory of all 9 source PNG filenames, with measured canvas dimensions and RGBA status.
- [x] Exact inventory of all 7 reference screenshot filenames and dimensions.
- [x] A role is assigned to every source asset; uncertain roles are explicitly marked **Inferred**.
- [x] Source-to-semantic naming map covers all nine files without duplicate IDs.
- [x] Transparency/bounding-box, format, 1×/2×, responsive footer, and verification plans are specified.
- [x] Reference observations are grounded in live web extraction/browser DOM inspection plus the local gimiaw source clone; adaptation rules prohibit copying.
- [x] Motion preset proposal includes timing, spring/easing intent, reduced-motion behavior, and validation guardrails.
- [x] Risks and concrete mitigations are listed.

### Future asset-conversion acceptance checks

- [ ] A conversion report confirms every source file was processed exactly once and matches the inventory above.
- [ ] Every folder derivative uses a trimmed alpha bounds box, preserves soft edges, has correct intrinsic dimensions, and has 1×/2× outputs where used.
- [ ] Footer derivatives preserve transparency and pass responsive crop/stretch checks without non-uniform distortion.
- [ ] No raw source PNG is referenced by runtime code or shipped as the runtime asset when an optimized derivative exists.
- [ ] Desktop checks cover the seven named reference states at the supplied screenshot widths; terminology uses **Combination**, not `Component`.
- [ ] Mobile checks cover 360 × 800, 390 × 844, and 768 × 1024 with no horizontal scroll; desktop motion is also checked at 1440 × 900.
- [ ] Reduced-motion, keyboard focus, decorative-folder semantics, and touch drag/scroll behavior pass before Phase 1 implementation is accepted.

**Phase boundary:** this review does not create `docs/ARCHITECTURE.md`, convert assets, or implement components. Those remain subsequent work after review approval.
