# Phase 0 Design Audit

## Evidence boundary

This review is based on `AGENTS.md`, direct inspection of all seven local reference PNGs, pixel sampling of their raster geometry, and live DOM/text inspection of the three reference URLs on 2026-10-20. The supplied desktop captures are 1440×2497 for Desktop 1–5 and 1440×1893 for Desktop 6–7. No mobile captures exist. Statements below are deliberately split between **Visible facts** and **Recommendations**; recommendations are not claims about pixels or runtime behavior that were not measured.

## Seven screens

### 1. Desktop 1 — Home, default

**Visible facts:** The page uses a warm off-white background, a dotted map motif, three rounded navigation buttons, a centered `Flash Card!` / `にほん` title, decorative folder illustrations, and introductory copy. The palette includes taupe controls, dark-brown active treatment, pale-gray utility pills, and black text.

**Recommendation:** Keep the title and navigation as the primary visual anchor. Treat the folders and map as atmosphere and playful decoration, not as navigation. Preserve enough quiet space around the title and copy so the scrapbook composition does not compete with the study actions.

### 2. Desktop 2 — Home, Hiragana menu open

**Visible facts:** This is the home state with the Hiragana navigation control open. The dropdown contains two items: `Hiragana Characters` and `Hiragana Words`.

**Recommendation:** Make the control a real disclosure/menu button with an explicit open state. Keep both destinations grouped under Hiragana, support keyboard navigation and Escape-to-close, and ensure opening the menu does not move the title or decorative field unexpectedly.

### 3. Desktop 3 — Home, Katakana menu open

**Visible facts:** This is the home state with the Katakana navigation control open. The dropdown contains two items: `Katakana Characters` and `Katakana Words`.

**Recommendation:** Reuse the Hiragana menu behavior and geometry rather than creating a second interaction pattern. The script name should be announced in each menu item so the two sets remain distinguishable to screen-reader and keyboard users.

### 4. Desktop 4 — Resources

**Visible facts:** The Resources destination displays `Coming soon <3` rather than a developed resource catalog.

**Recommendation:** Keep this intentionally small in v1. It should be a stable, accessible page with a heading and the coming-soon message, not a disabled-looking control or a false promise of unavailable functionality. JMdict attribution can be placed here later if the page is expanded.

### 5. Desktop 5 — Characters grid

**Visible facts:** The screen has `Characters` and `Words` mode tabs, a set selector described as `Basic`, `Combination`, and `Dakuten`, a 9-column kana grid, and per-group toggles. The supplied AGENTS notes also report that the design label reads `Component` in one place.

**Recommendation:** Use `Combination` as the product term everywhere, including the visible label, URL/state names, accessible names, and documentation. Keep the 9-column desktop rhythm, but make group selection state obvious without relying only on color. The selected groups should be the source for the Words pool as specified by the product brief.

### 6. Desktop 6 — Words flashcard, unanswered

**Visible facts:** The Words state shows a large kana prompt, a stats row, a romaji answer input, a microphone control, and an answer that is still hidden. The brief associates this flow with session statistics and reveal behavior. Some controls and state transitions are not fully specified by the screenshot evidence.

**Recommendation:** Establish one stable reading order: prompt, progress/statistics, answer input, voice action, reveal action, and secondary actions. Keep the unanswered card visually calm; validation, speech status, and errors should appear inline or in an announced status region rather than shifting the main card.

### 7. Desktop 7 — Words flashcard, reveal/dictionary state

**Visible facts:** The Words state includes a `Dictionary` button, an EN toggle, `Reveal Answer`, and the hint `Space Bar for answer`, in addition to the large kana, stats, input, and microphone affordances described for the Words flow.

**Recommendation:** Treat this as a state of the same Words screen rather than a separate destination. Make the revealed answer and the consequence for progress explicit, keep the Dictionary action secondary, and ensure the Space shortcut does not steal a literal space while the answer field is focused.

## Token table

The values below are grounded in the local PNGs. Colors are dominant exact opaque RGB values; geometry is measured from exact-color connected components and raster ink bounds at the supplied 1440px design width. CSS font sizes are the initial implementation scale because the original font files are not embedded in the screenshots; the measured ink bounds are the pixel-compare acceptance target.

| Token group | Token | Measured evidence | Phase 1 baseline |
|---|---|---|---|
| Color | `color.canvas` | Dominant RGB `(234,233,229)` | `--color-canvas: #eae9e5` |
| Color | `color.control` | Dominant control RGB `(103,88,85)` | `--color-control: #675855` |
| Color | `color.active` | Dominant active RGB `(51,42,40)` | `--color-active: #332a28` |
| Color | `color.utility` | Dominant utility RGB `(217,217,217)` | `--color-utility: #d9d9d9` |
| Color | `color.text` | Main ink RGB `(0,0,0)` | `--color-text: #000000` |
| Color | `color.label` | Common light UI RGB `(237,235,236)` | `--color-label: #edebec` |
| Color | `color.map-dot` | Common map-dot RGB `(150,150,150)` | `--color-map-dot: #969696` |
| Typography | `type.nav` | Navigation controls are 66px high; visual label scale is approximately 36px | `36px / 1.1` |
| Typography | `type.display` | Home title raster ink box `(398,365)–(1262,465)`, 100px ink height | `132px / 0.95` |
| Typography | `type.kana-display` | Home `にほん` raster ink begins around y=494 and ends around y=596 | `128px / 1` |
| Typography | `type.body` | Intro ink rows are approximately 28–36px high | `36px / 1.1` |
| Typography | `font.ui` | Brief specifies Josefin Sans | Load via `next/font`; compare ink boxes against the captures |
| Typography | `font.kana` | Brief specifies a kana-capable rounded font | Use a kana subset where practical and set Japanese text `lang="ja"` |
| Spacing | `nav.top` | Navigation starts at y=44 | `44px` at the 1440px reference width |
| Spacing | `nav.width/height` | Hiragana `(247,44)–(485,110)`, Katakana `(601,44)–(839,110)`, Resources `(920,44)–(1158,110)` | `238px × 66px` |
| Spacing | `nav.gap` | Measured gaps are 116px then 81px | Preserve the asymmetric reference positions at desktop; use a centered responsive layout below desktop |
| Spacing | `selector.bounds` | Characters/Words and set selectors occupy y=373–439 | `66px` high; desktop x-ranges are `(183,610)` and `(650,1256)` |
| Spacing | `utility.bounds` | Dictionary pill is `(1139,502)–(1325,578)`; reveal pill is approximately 314×76 in Desktop 7 | `186×76px` Dictionary; `314×76px` reveal |
| Shape | `radius.nav/segment` | Rounded rectangle edge run indicates approximately 18px corner radius | `18px` |
| Shape | `radius.utility` | 186×76 utility pill has capsule geometry | `38px` |
| Interaction | `target.minimum` | Screenshot controls exceed the minimum touch size | `44px` minimum; microphone `48px` minimum on touch |
| Contrast | `reference ratios` | Canvas/black ≈17.29:1; control/label ≈6.00:1; active/label ≈12.40:1; utility/black ≈14.88:1 | Keep these sampled pairs; add a separate visible focus ring |
| Motion | `motion.preference` | Runtime motion is not encoded in static PNGs | Honor `prefers-reduced-motion`; keep loader, scramble, dropdown, drag, and card transitions interruptible |

## Ambiguities / resolutions

| Ambiguity | What is visible or specified | Resolution for implementation |
|---|---|---|
| `Component` vs `Combination` | The Characters design is described with `Basic / Combination / Dakuten`, while the AGENTS source-of-truth note says the screenshot label is `Component`; the product model calls the set `Combination`. | Use `Combination` everywhere. Treat `Component` as a design-copy inconsistency to correct, not as a fourth set. Flag any remaining source image mismatch in the decision log when implementation begins. |
| `きょう` under Basic | The mock places `きょう` under Basic, but `きょ` is a yoon combination. | Keep the Basic pool limited to basic kana. Classify `きょう` as Combination for pool membership; treat its Basic placement as placeholder content, not a data rule. |
| Words controls and state transitions | Desktop 6/7 identify the main controls, but the screenshots under-specify validation, success, wrong-answer, loading, tier selection, and round completion. | Use the AGENTS Words brief as the behavioral baseline: typing, mic, reveal, EN toggle, Dictionary, stats, Space-to-reveal, feedback, and a summary of missed items. Introduce only the missing states needed to make that flow usable, and record any visual invention before implementation. |
| Dictionary presentation | The Dictionary is referenced by the Words brief but has no complete design. | Recommend a right-side drawer on desktop and a bottom sheet on mobile, with search, New/Learning/Mastered filters, word detail, and Japanese TTS. This remains a proposal requiring approval before Phase 7 implementation. |
| Mobile layout | No mobile mockups are supplied. | Design from the desktop language rather than shrinking the canvas; see the responsive/mobile section below. Validate at 360×800, 390×844, 768×1024, and 1440×900. |
| Error and empty states | The unanswered card is shown, but no complete error, unsupported-mic, empty-dictionary, empty-pool, or no-results treatments are shown. | Use concise inline status text with preserved layout, an `aria-live` announcement for answer feedback, and a retry/help action where needed. Hide or explain unsupported voice input instead of showing a dead control. |
| Tier unlocking | The screenshots do not expose the tier selector or unlock journey. AGENTS defines tiers 10 → 20 → 50 → 100 and a flawless first-appearance pass rule. | Implement the written rule, not a visual guess: a mistake or reveal on a first appearance blocks the next unlock and keeps the user on the current tier; repeats do not affect pass/fail. Surface the rule before a round starts and in the end summary. |
| Folder affordance | Folders are prominent and draggable in the brief, which could be mistaken for navigation. | Keep them decorative only, with nav confined to the pill controls. Mark folders `aria-hidden`/not focusable and preserve drag as visual enhancement. |
| EN toggle meaning | Desktop 7 shows an EN toggle; AGENTS says the design implies EN/ID switching, while Indonesian meanings may be absent from JMdict. | Make the meaning language explicit in UI copy and allow an empty/unavailable Indonesian meaning without fabricating translations. Add attribution for JMdict-derived data. |
| Capture dimensions | The supplied PNGs are tall design captures, not necessarily the runtime viewport height. | Match the 1440px composition and vertical flow, but do not derive fixed viewport-height behavior from the image height alone. |

## Responsive / mobile

**Visible facts:** No mobile design is supplied. The desktop language depends on pill navigation, a decorative home field, a 9-column Characters grid, and a focused Words card.

**Recommendations:**

- Keep the same information architecture. Condense the pill nav without reducing its hit area; turn an open dropdown into a full-width or near-full-width sheet that is easy to dismiss.
- Recompose the home field for a narrow canvas. Keep folders inside safe bounds, preserve page scrolling, and crop/stretch the torn-paper footer with `object-fit: cover` rather than distorting the art.
- Do not force nine kana columns on a phone. Use a responsive grid with cells large enough to scan and tap, and verify the resulting grouping and reading order at 360px and 390px widths.
- Keep the Words prompt and stats visible above the answer controls. Use `100dvh` and `visualViewport` behavior so the answer input remains above the on-screen keyboard; never depend on a fixed `100vh` panel.
- Give the microphone at least a 48px touch target and all interactive targets at least 44px. Hide the Space Bar hint on touch-capable layouts while retaining an equivalent visible Reveal action.
- Prevent horizontal scrolling at every target width. Test both portrait phone widths and the 768px tablet layout before treating the desktop composition as responsive.
- Preserve reduced-motion behavior on mobile. Dragging folders must not disable page scrolling outside the folder itself; scope `touch-action: none` to the draggable object.

## Accessibility

**Visible facts:** The supplied evidence shows text, pill controls, dropdown states, segmented controls, group toggles, a text input, a microphone affordance, and a reveal action. It does not establish their semantics, focus states, or contrast ratios.

**Recommendations:**

- Use landmarks and headings that match the screen structure. Give the home navigation a labelled `nav`; implement dropdown triggers with `aria-expanded` and `aria-controls`.
- Implement Characters/Words and Basic/Combination/Dakuten as keyboard-operable tabs or segmented controls with a programmatically exposed selected state. Give group toggles an explicit checked/pressed state and an accessible group label.
- Provide a visible, high-contrast focus indicator for every keyboard control. Verify the taupe, dark-brown, pale-gray, and sampled off-white combinations rather than assuming the palette passes contrast requirements.
- Label the answer input, microphone button, reveal button, language toggle, Dictionary button, and any icon-only action. Announce listening, unsupported, permission-denied, wrong, correct, and revealed states through a concise `aria-live` region.
- Preserve a logical keyboard order. Space-to-reveal should not intercept a space typed into the answer field; provide a button-equivalent Reveal action for all users.
- Set the language of Japanese strings appropriately and ensure kana remains legible at zoom. Do not convey selected group or correctness by color alone.
- Mark decorative map and folder art as hidden from assistive technology. Folders should not add keyboard stops because they have no destination.
- Respect `prefers-reduced-motion` for the ASCII loader, title scramble, dropdown transitions, folder motion, and card feedback. The loader must have a non-animated path.
- Ensure the mobile bottom sheet/drawer traps focus while open, has a labelled close action, and returns focus to its trigger when dismissed.

## Risks

| Risk | Impact | Mitigation / review gate |
|---|---|---|
| Screenshot ambiguity and token drift | Medium–high visual mismatch if guessed sizes, canvas color, or font metrics become permanent | Sample the PNGs before freezing tokens; keep provisional values clearly marked and compare the 1440px layout before proceeding. |
| Mobile is under-designed | High usability risk at phone widths, especially for nav, grid, footer, and keyboard interaction | Review the four target widths, forbid horizontal overflow, and approve the responsive composition before implementation is considered complete. |
| Speech recognition support | High: Web Speech behavior differs across Chrome, Safari/iOS, and Firefox; permissions, HTTPS, and network errors are possible | Use a feature-detected adapter, hide or explain unsupported mic states, request alternatives, and provide typing as the complete fallback. |
| Touch drag versus page scroll | Medium: decorative folder dragging can trap or interrupt scrolling | Apply touch handling only to the folder, use a movement threshold, and test ordinary page scroll on touch devices. |
| Raw asset weight | Medium: folder PNGs include large transparent padding and can harm load performance | Trim to the alpha bounding box, export WebP/AVIF at 1x/2x, and avoid shipping raw source PNGs. |
| Word-list quality and pool size | High learning-quality risk from obscure entries, wrong set membership, missing Indonesian meanings, or pools smaller than a tier | Apply the stated JMdict filters and set-membership rule, report counts per script/set, leave missing meanings blank, and check whether each pool supports the requested tiers. |
| Tier/repetition state complexity | Medium–high: re-queues, reinforcement limits, first-appearance pass/fail, and persistence can disagree if modeled in UI | Keep session and matching logic pure and tested; make the written flawless-run rule authoritative and show missed items in the summary. |
| Contrast and focus regressions | High accessibility risk because some utility surfaces are pale and controls are muted | Add dedicated focus tokens, test contrast with the final sampled canvas, and run keyboard-only and reduced-motion checks. |
| Dictionary scope expansion | Medium: an unapproved drawer/sheet can turn a small v1 into a second product | Treat the proposed Dictionary UX as a separate approval gate; lazy-load it and keep its data behavior bounded. |

## Confidence notes

- **High confidence:** the seven-state inventory, the major desktop composition, the three navigation destinations, the two-item Hiragana/Katakana dropdowns, the Resources message, the Characters grid/group-toggle concept, the Words prompt/input/mic/reveal concept, sampled palette anchors, desktop bounds, and rounded-control geometry.
- **Medium confidence:** CSS font-size tokens because the source font files are not embedded; the measured raster ink boxes remain the pixel-compare target. The exact interaction transition represented by Desktop 6 versus Desktop 7 is also behavioral rather than fully visible. Mobile composition, Dictionary layout, error/empty states, and tier-selection presentation require product approval.
- **Low confidence:** runtime motion details that cannot be established from static screenshots, plus exact behavior of unsupported speech and future Dictionary details. These are explicitly governed by the written brief and later approval gates rather than silently invented.
- The three reference websites were opened and inspected through live web extraction and browser DOM/text inspection on 2026-10-20. The separate reference audit records exactly what was observed and distinguishes live facts from proposals; no claim is made that static DOM inspection proves every animation frame.
- This artifact is review-only. No application code, configuration, or other project file is changed by this review.
