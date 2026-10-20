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
