# Decisions Log

This log records Phase 0 decisions and explicit assumptions. New phases must append decisions rather than silently changing them.

## Phase 0 — Review and planning

### Reference-site verification provenance
The three reference URLs were fetched with live web extraction and inspected with a live browser DOM/text pass on 2026-10-20. `jlptcards.com/hiragana-words` exposed the practice controls, stats, reveal, and Space Bar hint; `alicias.page/art` exposed its current ASCII-like text/typography credits but did not prove loader timing from DOM alone; `gimiaw.web.id` exposed the portfolio sections and `SPACE to SKIP`. Motion implementation evidence was additionally checked in the local `gimigkk/porto` clone. The review documents distinguish these observations from proposals and do not copy reference code, assets, layout, copy, or animation constants.

### Pixel-sampled desktop tokens
The local reference PNGs were decoded directly. The dominant design colors are canvas `#eae9e5`, control `#675855`, active `#332a28`, utility `#d9d9d9`, label `#edebec`, map dot `#969696`, and black text `#000000`. At the 1440px design width, nav controls measure 238×66px at y=44, selectors measure 66px high at y=373, the Dictionary pill measures 186×76px, and the reveal pill is approximately 314×76px. The round-control radius is approximately 18px and the utility-pill radius approximately 38px. These values are the Phase 1 pixel-compare baseline; CSS font sizes remain an initial scale whose raster ink boxes must match the screenshots.

### Use `Combination`, not `Component`
The mock/design notes contain a `Component` label, but the product model and brief define the yoon set as `Combination`. The application, route state, persisted values, tests, and documentation use `Combination`. `Component` is treated as a design-copy inconsistency.

### Keep set membership exclusive; make pool eligibility cumulative
Every kana entry is declared in exactly one of Basic, Dakuten, or Combination. Word pools are cumulative according to the brief's eligibility rule. This resolves the apparent conflict between exclusive table membership and cumulative pool-building.

### Treat `きょう` under Basic as placeholder content
`きょ` is a yoon/Combination sequence. The mock placement does not override the data rule; the Basic pool must exclude words containing combination kana.

### No backend in v1
No accounts, API routes, server actions, auth, database, Express, Nest, or sync work is allowed in Phases 0–8. Progress is local-first behind `ProgressRepository`. Future backend roadmap text remains future-only.

### Static export is a hard constraint
The app targets a fully static Next.js export for Cloudflare. Dynamic script routes use `generateStaticParams`; browser APIs are client-only; word data remains static and lazy-loaded.

### Preserve a schema gate before parallel UI work
Shared domain contracts, stable IDs, session-event semantics, speech states, persistence methods, and canonical fixtures must be frozen before parallel consumers are implemented. A UI worker may not invent a local variant to unblock itself.

### Use committed source paths and stable generated names
The repository stores design inputs in `design/source` and screenshots in `design/reference`. The source PNGs keep their original names as immutable inputs. Runtime derivatives use ASCII-safe names (`folder-01` … `folder-07`, `footer-paper`, `footer-grass`) and are written to `public/folders` or `public/paper` in the asset phase.

### Treat folder art as decorative
Folders are draggable/tappable toys only; they do not navigate. Navigation lives in the pill nav. Decorative folder elements are hidden from assistive technology and are not keyboard stops.

### Infer footer mapping, then verify visually before shipping
The unnumbered `Desain tanpa judul.png` and `Group 1.png` are provisionally mapped to paper and grass footer pieces based on the brief and asset metadata. The mapping must be visually checked during the trim/export phase before runtime use.

### Design mobile deliberately
No mobile mockups are supplied. Mobile uses the desktop visual language but gets deliberate composition changes: condensed/full-width nav sheet, responsive kana grid, keyboard-safe Words layout using `100dvh`/`visualViewport`, 44px targets, 48px microphone target, and no horizontal overflow.

### Dictionary requires a proposal gate
The proposed desktop drawer/mobile bottom sheet, search/filter/detail/TTS behavior is not considered approved UI. Phase 7 must write the proposal and stop for approval before implementation.

### Do not fabricate Indonesian meanings
JMdict provides English data but no guaranteed Indonesian meanings. `meaningId` is optional and may remain blank. The EN/ID control must represent unavailable Indonesian data honestly.

### Reference adaptation boundary
The reference sites inform information hierarchy and motion feel only. No reference code, assets, copy, word lists, DOM structure, layout, or exact motion constants are copied.

### Screenshot dimensions are design artifacts, not viewport contracts
The supplied screenshots are tall PNG captures (1440×2497 for Desktop 1–5 and 1440×1893 for Desktop 6–7). They inform composition and visual comparison but do not mandate a fixed runtime height.

## Pending approvals

- Approve the Phase 0 architecture and schema/fixture contract before Phase 1 implementation.
- Approve the final visual token samples after direct pixel sampling in Phase 1.
- Approve the Dictionary UX proposal before Phase 7 implementation.

## Phase 1 — Foundation, assets, tokens, and shell

### Static foundation
The app is a Next.js App Router static export (`output: "export"`) with strict TypeScript, no route handlers, Server Actions, middleware, cookies, headers, or other server-only runtime features. The shell includes explicit static routes for the four Phase 1 navigation destinations and the Resources placeholder; feature routes intentionally remain placeholders until their phases.

### Runtime dependency boundary
The runtime dependency set is limited to the brief: Next, React, `motion`, Zustand, and `wanakana`. Tailwind/PostCSS, TypeScript, ESLint, and type packages are development tooling. `sharp` is a development-only dependency because `scripts/trim-assets.ts` must decode RGBA PNGs, calculate alpha bounds, crop transparent padding, resize 1x/2x derivatives, and encode optimized WebP output; doing this reliably without an image library would require reimplementing a PNG/WebP codec and would not be a reversible foundation choice.

### Font loading
Josefin Sans, Noto Sans JP, and Silkscreen are loaded through `next/font/google`. Next's generated metadata does not expose a selectable regional subset for Noto Sans JP, so the font call intentionally omits `subsets` to keep Japanese glyphs available. This is not a placeholder font; the CSS fallback stack remains available if the remote font fetch is unavailable during local development.

### Phase 1 visual tokens
The sampled Phase 0 values are exposed as CSS custom properties (`--fc-*`) in `src/app/globals.css` and mapped into the Tailwind v4 theme. Components consume these variables rather than embedding sampled palette values. The home placeholder uses a CSS radial-dot texture as a reversible approximation of the reference map because no map source asset is present; loader, title scramble, and folder-field behavior are explicitly deferred to Phase 2.

### Navigation and responsive behavior
`PillNav` owns the Hiragana and Katakana disclosure menus and the Resources link. Menus use real buttons/links, `aria-expanded`, `aria-controls`, menu roles, arrow-key movement, Escape-to-close, outside-pointer dismissal, and visible focus styles. Desktop uses the measured three-pill rhythm; below 44rem the pills stack and an open menu becomes an in-flow full-width panel so the shell does not overflow horizontally.

### Asset mapping and conversion
The source PNGs under `design/source` remain immutable. The Phase 0 inferred mapping was visually checked: `Desain tanpa judul.png` is torn paper, `Group 1.png` is the landscape/grass panel, and the seven numbered exports are decorative folders. The script maps them to ASCII-safe `folder-01` … `folder-07`, `footer-paper`, and `footer-grass`, and writes 1x/2x WebP outputs under `public/folders` and `public/paper`. `docs/asset-report.json` records dimensions, alpha bounds, and before/after byte sizes. Runtime Phase 1 uses only the two footer derivatives; folder derivatives are prepared for the later home phase and are not rendered yet.

### Static preview command
Because `output: "export"` intentionally cannot be served by `next start`, the `npm start` script runs `scripts/serve-static.ts` and serves the generated `out/` directory. This keeps local preview behavior aligned with the Cloudflare static-hosting target without adding a runtime dependency. `npm run build` must run first. The package declares Node `>=22.6.0` because the preview and asset scripts use Node's stable-enough `--experimental-strip-types` execution path.

### Phase 1 scope boundary
No loader, title scramble, draggable folders, kana tables, word data, flashcards, session logic, speech adapter, dictionary, Zustand store, or `wanakana` behavior is implemented in this phase. The landing page body is intentionally placeholder content around the measured hero/copy composition.

## Phase 2 — Home behavior

### Build-time ASCII frames
The loader uses eight deterministic 80×32 text frames generated by `scripts/build-ascii.ts` from the optimized local paper, grass, and folder assets. Frames and their progress manifest are committed under `public/ascii`; `npm run build` regenerates the optimized images and ASCII frames before `next build`, so the browser does not perform image-to-ASCII conversion.

### Loader readiness and fallback
`AsciiLoader` waits for the real optimized image/font readiness counters from `useAssetProgress`, the generated frame manifest, and a minimum 800ms display time. Image, font, manifest, and frame readiness each have a bounded 3-second timeout; a timeout is treated as a failed optional asset so the loader cannot block the static page indefinitely. It exposes a polite status announcement, hides decorative ASCII from assistive technology, and uses a short fade under reduced motion. Missing optional ASCII files fall back to a small text frame rather than blocking the static page.

### Title scramble
The home title resolves `にほん` left-to-right from a local hiragana/katakana pool on each client mount. The resolved text remains available to assistive technology through an aria label, while the visual scramble is decorative.

### Decorative folder field
The seven folder assets are rendered as decorative, non-focusable toys only. Positions are stored as normalized coordinates under a versioned localStorage key so they survive viewport changes; drag coordinates are clamped to the field, taps produce a small reaction without navigation, and `Tidy up` restores the supplied layout. Only folder surfaces use `touch-action: none`; the field itself remains compatible with page scrolling. Reduced-motion mode disables momentum and reaction animation.

### Phase 2 scope boundary
Phase 2 integrates only the home loader, title scramble, ASCII asset generation, shared motion presets, and decorative folder field. Kana data, word data, flashcards, speech, dictionary, session logic, and later phases remain intentionally untouched.
