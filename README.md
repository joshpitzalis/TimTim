# Strokes

A small Hindi handwriting practice app for mobile browsers.

Status: local Void/React practice shell and automated fence implemented. Tracing, stroke checking, calibration, content review, and device verification are still pending; no deployment exists.

Use React and Void. Use rat-stack as the engineering reference: Effect for external work and typed failures, and compiler, lint, tests, and hooks for enforcement. The owner's explicit choices replace Foldkit with React and Alchemy with Void deployment.

The implementation specification is [SPEC.md](SPEC.md), published as [GitHub issue #1](https://github.com/joshpitzalis/TimTim/issues/1). The owner confirmed the test seams and four-ticket breakdown on 2026-10-22. Implementation tickets [#2](https://github.com/joshpitzalis/TimTim/issues/2), [#3](https://github.com/joshpitzalis/TimTim/issues/3), [#4](https://github.com/joshpitzalis/TimTim/issues/4), and [#5](https://github.com/joshpitzalis/TimTim/issues/5) are labeled `ready-for-agent` and linked in dependency order; #2 can start immediately.

## What the Skritter investigation found

The open Chrome tab was readable through native accessibility. Chrome did not expose a debugging endpoint, so REA could not attach to the authenticated page. The study session was left unchanged.

I downloaded the public scripts linked by `https://skritter.com/study` and ran REA 6.7.0 static analysis on `application.js`. REA parsed the selected bundle successfully: 401,723 AST nodes, zero parse failures. Its graph did not recover the bundle's internal modules. The following details come from focused manual inspection of the named `require.register` blocks in those same downloaded bytes, alongside REA's artifact evidence.

| Question | Finding | Source in the bundle |
| --- | --- | --- |
| How does drawing work? | The widget collects points between pointer-down and pointer-up equivalents, smooths the visible line, and uses CreateJS canvas layers. | `components/prompt/canvas/StudyPromptCanvasComponent.js`, `enableInput`, `onInputMove` |
| Does it recognize any handwritten character? | This code checks input against candidates at the current position in the known character's stroke sequence. | `utils/recognizer.js`, `getResults`; `collections/PromptStrokeCollection.js` |
| What does it compare? | Initial direction, corner count, and distance between bounding-box centers. Parameters can skip individual checks. | `utils/recognizer.js`, `runChecks`, `checkAngle`, `checkCorners`, `checkDistance` |
| How are corners found? | A ShortStraw routine derives corners from the input points. | `models/PromptStrokeModel.js`, `updateCorners`; `utils/shortstraw.js` |
| Why does accepted writing look clean? | A successful attempt can animate a transformed reference shape into its target shape. A raw-input preference has a separate display branch. | `components/prompt/part-rune/StudyPromptPartRuneComponent.js`, `handlePromptCanvasInputUp` |
| Is only one reference sequence possible? | The stroke collection tracks several targets and keeps those most compatible with accepted strokes. | `collections/PromptStrokeCollection.js`, `getExpectedTargets` |

These are static code findings from the legacy web bundle. They do not prove which branches ran in your session or describe Skritter's native apps. No trained recognizer was needed to explain this particular code path.

REA evidence: `ev_ac4cc745a3f06625034762dfdcc80b0b49437d7c2367df61f361a94018d9353b`.
The source hashes, selection, and limitations are in [research/rea-summary.json](research/rea-summary.json). Full temporary evidence is at `/private/tmp/skritter-rea-evidence.json`.

## The smallest useful implementation

Build a trace-and-retry exercise before automatic grading. The first screen has one letter, a faint guide, a square writing area, Clear, Reveal, and Retry. Add Next when there is a second reviewed letter.

Use SVG for this version. Store each pen-down-to-pen-up gesture as an ordered list of points, then render it as a polyline or path. A shared `viewBox` keeps the guide, input, and reference geometry aligned as the screen changes size. Canvas is also viable; SVG makes this small exercise easy to inspect.

The flow is:

```text
finger / mouse / pen
        |
        v
points in the writing area's coordinate system
        |
        v
visible ink -> release -> optional stroke check
                               |
                       accept or retry
```

Pointer Events support mouse, pen, and touch through one event family. Use pointer capture during a gesture. Apply `touch-action: none` only to the writing area. Handle cancellation and capture loss, accept only the active pointer, and keep page scrolling available outside the pad. Map client coordinates into SVG coordinates rather than assuming CSS pixels equal drawing coordinates. See [Pointer Events](https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events).

## Data ownership

- A checked-in lesson file owns the glyph label, pronunciation label, coordinate bounds, and ordered reference strokes. The content author is its writer.
- A reference stroke is a directed centerline: ordered points from its start to its end. The same points can drive tracing, hints, and checking.
- The React exercise state owns the current attempt, active pointer, and accepted-stroke position. Pointer handlers write it. Rendered paths are derived from that state.
- Reference and learner coordinates share fixed bounds. Preserve position and scale relative to the letter; independently centering each stroke would accept strokes in the wrong place.
- Attempts are temporary in the first slice. There is no database, localStorage history, or progress claim to maintain.

An ordinary font can supply a visual glyph, but its filled outlines do not provide a teaching sequence or directed pen paths. Author a few original templates, preferably by recording a Hindi teacher drawing each letter. Review pen lifts, direction, the headline, and acceptable variations before calling the app a writing teacher.

Start with isolated letters. Devanagari vowel signs and conjuncts require more than treating a word as unrelated Unicode code points. See [W3C Devanagari requirements](https://www.w3.org/International/ilreq/devanagari/).

## Add checking after tracing works

Check one expected stroke locally after release. Keep the geometry function pure and independent from React, Void, and storage.

1. Reject empty, non-finite, and degenerate input before scoring.
2. Resample input and reference by distance along each path, so sampling speed has less influence.
3. Compare corresponding positions, start and end locations, and path length. Direction matters; a reversed stroke should produce a retry.
4. Derive tolerances from recorded finger and stylus attempts. Do not copy Skritter's pixel thresholds into a different coordinate system.
5. On acceptance, show the reference stroke and advance. On rejection, retain the same expected stroke and show a useful hint.

This is a proposed simple matcher, not a claim that Skritter uses this exact algorithm. It is sufficient to experiment with known letters. It does not recognize arbitrary handwriting or grade penmanship.

Useful checks include equivalent resampling of the same path, resize invariance, reversed paths, misplaced strokes, scribbles, dots, and cancelled gestures. A browser check must prove that drawing does not scroll the page, clearing works, and a cancelled gesture does not advance. Try a real iPhone Safari and Android Chrome before claiming mobile validation.

## Build order

1. Scaffold Void with React and pnpm, retaining its generated version pins. Read installed Void and Effect instructions. Install and prove the rat-stack compiler, lint, and hook fence before feature code.
2. Implement the tracing screen with one reviewed letter. Completion means a real phone can draw, clear, reveal, and retry without stuck gestures.
3. Add the pure matcher with meaningful geometry tests. Completion means recorded good and bad attempts have useful outcomes.
4. Expand to a handful of reviewed letters. Completion means each template has an agreed teaching sequence.
5. Add saved progress only when needed. Define its authoritative store and writer first, then follow rat-stack's store and capability patterns.

The Void [quickstart](https://void.cloud/guide/quickstart) documents `pnpm add -D void` followed by `pnpm void init`. Choose React and skip deployment setup initially. Exact package pins must be established from the actual scaffold and rat-stack reference at implementation time.

## How rat-stack changes this design

React owns rendering and temporary interaction state. Keep browser drawing APIs in the browser. Pure geometry stays ordinary deterministic TypeScript. Effect owns external operations, resource lifetimes, schema parsing, and typed failures as those needs arise. Avoid creating an Effect runtime per pointer movement.

Before adding a meaningful lifecycle with asynchronous work, follow [add-a-lifecycle-machine](https://ratstack.sh/skills/add-a-lifecycle-machine). Before adding server actions, follow [add-a-capability](https://ratstack.sh/skills/add-a-capability): shared Schema contracts and one handler, with thin framework adapters. A retry from the learner is a product outcome; a missing lesson or storage failure is a distinct failure.

Keep the [fence](https://ratstack.sh/systems/fence): strict type checking with Effect diagnostics, import boundaries, lint, pre-commit checks, and CI. Run the scaffold's equivalent of `pnpm turbo run check test build`; the script does not exist in this folder yet. Use [keep-or-cut](https://ratstack.sh/skills/keep-or-cut) to omit unrelated auth, analytics, MCP, code-mode, and database features.

### Deployment ownership

The owner selected Void instead of Alchemy. Void owns resource provisioning and deployment. Follow its [deployment guide](https://void.cloud/guide/deployment) and keep one owner for each cloud resource.

Start with local development and no cloud data resources. Keep rat-stack's checks and boundary patterns, adapted to the Void project. No deployment has been performed.

## Intentionally deferred

Accounts, email, cloud persistence, spaced repetition, whole-word recognition, OCR, model training, and polished stroke morphing. No Skritter code or character dataset is part of the proposed app.

## Local development and verification

Use Node 24.21.0 or newer and the package-manager version pinned in the manifest.

```sh
pnpm install --frozen-lockfile
pnpm exec playwright install chromium
pnpm dev
```

The app is the actual Void 1.2.0 React Static Pages starter, without database or deployment setup. Void's page entry renders the browser practice module. Lesson content and pure geometry belong under the practice domain; browser drawing belongs under its browser folder. Provider adapters and server routes cannot be imported into either domain or browser code. There is no server mutation or cloud state.

The generated `dev`, `build`, `preview`, and `postinstall` commands are retained. The enforcement scripts are:

- `pnpm check`: Void type generation, strict TypeScript with patched Effect diagnostics, and Oxlint including import boundaries.
- `pnpm test`: intentional compiler/import failure probes followed by the complete-page Playwright checks.
- `pnpm build`: Void's client and Worker build, without publishing.

`prepare` patches the pinned TypeScript 7.0.2 compiler using compatible `@effect/tsgo` 0.56.0 and installs Lefthook. Every commit runs check and test; CI installs from the frozen lockfile, installs Chromium, then runs check, test, and build. Do not bypass hooks. The fence regression test temporarily introduces invalid types, a floating Effect, and forbidden imports, requires each to fail, and removes the probes afterward.

Oxlint's `jsx-a11y/prefer-tag-over-role` has one line-specific exception because it incorrectly demands that the accessible SVG writing pad become an HTML image; the pad needs SVG geometry and an explicit image role. Other accessibility correctness rules remain enabled. The initial shell is deliberately unstyled and provides no tracing or grading yet.

A browser smoke check at phone and desktop viewport sizes proves that the local shell loads and the pad stays square. This is emulation, not physical-device validation. No deployment or real-phone verification has been performed.
