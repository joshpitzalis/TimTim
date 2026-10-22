# Strokes: basic Hindi handwriting practice in a mobile browser

Status: approved specification published as [GitHub issue #1](https://github.com/joshpitzalis/TimTim/issues/1) with `ready-for-agent`. The owner confirmed the four-ticket breakdown and test seams on 2026-10-22: complete-exercise browser checks, pure matcher geometry properties, and lesson-content boundary checks. Implementation and device verification remain outstanding.

## Problem Statement

The learner wants to practice writing Hindi characters using a phone browser. Skritter demonstrates the desired interaction: write a character directly on screen, receive guidance, and try again.

The learner is a TypeScript developer who wants a small, understandable starting point. The first version must make handwriting practice useful without requiring native apps, trained handwriting models, accounts, or a complete language-learning platform.

## Solution

Build Strokes as a mobile-friendly web app using Void, React, and TypeScript. The learner opens a lesson, sees a Hindi letter and pronunciation label, and draws in a square writing area with a finger, stylus, or mouse.

Provide a faint tracing guide, a way to reveal the expected writing, and simple controls to clear and retry. Add forgiving checks of one expected stroke at a time. An accepted stroke advances the exercise; an unsuccessful stroke leaves the learner on the same step with a useful hint. Completing every expected stroke produces a clear completion state and an option to practice again.

Start with one original, reviewed letter template. Prove drawing and retrying before introducing automatic checking. The full scope of this specification includes that first letter's checked exercise. Further letters can use the same lesson format after content review.

## User Stories

1. As a Hindi learner, I want to open practice in my mobile browser, so that I can practice without installing a native app.
2. As a Hindi learner, I want to begin without creating an account, so that I can try the exercise immediately.
3. As a Hindi learner, I want to see which letter I am practicing, so that I understand the exercise.
4. As a Hindi learner, I want a pronunciation label beside the letter, so that I can connect its written form with its sound.
5. As a beginning learner, I want a faint reference in the writing area, so that I know where to place my strokes.
6. As a beginning learner, I want to see the expected stroke sequence, so that I can learn how to construct the letter.
7. As a learner, I want a hint for the next stroke, so that I can continue when I am unsure.
8. As a phone user, I want to draw with my finger, so that I can practice using the device I already have.
9. As a stylus user, I want to draw with my pen, so that I can practice with more precise input.
10. As a desktop user, I want to draw with a mouse, so that I can use the same exercise on my computer.
11. As a learner, I want ink to appear as I move, so that drawing feels responsive.
12. As a learner, I want each pen lift to finish one stroke, so that separate gestures remain separate.
13. As a phone user, I want drawing inside the pad to avoid scrolling the page, so that I can finish a stroke reliably.
14. As a phone user, I want to scroll outside the pad, so that the rest of the page remains usable.
15. As a phone user, I want an accidental second finger to leave my current stroke intact, so that it does not corrupt my attempt.
16. As a learner, I want interrupted input to stop cleanly, so that returning to the exercise does not leave it drawing indefinitely.
17. As a learner, I want the letter and my input to remain aligned when the pad changes size, so that resizing does not change the exercise.
18. As a learner, I want a Clear control, so that I can discard my current attempt and start from the first stroke.
19. As a learner, I want to reveal the expected letter and sequence, so that I can compare it with my attempt.
20. As a learner, I want revealing the answer to remain distinct from completing the exercise, so that I receive honest feedback.
21. As a learner, I want each completed gesture checked against the next expected stroke, so that feedback relates to the step I am practicing.
22. As a learner, I want reasonable variation in finger drawing to be accepted, so that small inaccuracies do not prevent practice.
23. As a learner, I want stroke direction and placement to matter, so that a reversed or misplaced gesture does not teach me the wrong movement.
24. As a learner, I want unsuccessful strokes to leave the exercise on the same step, so that I can retry without restarting the whole letter.
25. As a learner, I want a useful next-stroke hint after an unsuccessful attempt, so that I know what to try next.
26. As a learner, I want accepted strokes to remain visible, so that I can see the letter taking shape.
27. As a learner, I want a clear completion message after the final accepted stroke, so that I know when I have finished.
28. As a learner, I want Retry to reset the exercise, so that I can repeat the same letter.
29. As a learner, I want readable feedback and labeled controls, so that color or unfamiliar icons are not my only instructions.
30. As a keyboard user, I want to operate the surrounding controls with visible focus, so that navigation and retry remain accessible.
31. As a learner, I want a clear message if lesson content cannot be used, so that an app failure is not presented as a mistake in my writing.
32. As a learner, I want my handwriting to stay in the current browser session, so that this basic exercise does not upload or retain my attempts.
33. As a lesson author, I want to define original reference strokes in their teaching order, so that guidance and checking use the same reviewed content.
34. As a lesson author, I want invalid lesson geometry detected before it becomes a usable exercise, so that learners do not encounter broken templates.
35. As the developer, I want geometry separated from rendering and external work, so that I can understand and test the matcher independently.
36. As the developer, I want compiler, lint, and automated checks to enforce the project boundaries, so that future changes follow the chosen architecture.

## Implementation Decisions

- **Framework and deployment:** Use Void with React and TypeScript. Void owns deployment and any eventual cloud provisioning. Alchemy and Foldkit are excluded by explicit owner decisions. Follow Void's pnpm quickstart and begin locally without configuring a production deployment.
- **Engineering reference:** Retain rat-stack's source-first workflow, exact dependency pins, strict types, explicit ownership, typed boundaries, and enforceable fence. Adapt these patterns to Void and React rather than copying unrelated reference-app features.
- **Delivery sequence:** Establish the scaffold and fence, prove the single-letter tracing interaction, then add stroke checking. These are implementation milestones within this specification. A tracing-only milestone must not be reported as a completed checked exercise.
- **Lesson content:** A lesson has an identity, glyph label, pronunciation label, fixed coordinate bounds, and a nonempty ordered sequence of reference strokes. Each stroke contains a directed centerline represented by finite ordered points.
- **Content authority:** Checked-in original lesson data is the authoritative teaching sequence. The content author is its writer. The same reference points produce guides, hints, and matcher inputs. Ordinary font outlines are not a substitute for stroke-order data.
- **Content readiness:** Begin with one Hindi letter whose shape, pen lifts, direction, headline treatment, and teaching sequence have been reviewed by a competent Hindi writer or teacher. The specific letter and accepted sequence are not selected in this conversation. Content review is a dependency for claiming pedagogical validity; an unreviewed development fixture must be identified as such.
- **Drawing surface:** Use SVG with one shared coordinate system for reference and learner strokes. Convert browser input coordinates into that system. Keep the visible pad responsive and square.
- **Input ownership:** Track one active pointer. Capture it during a gesture, collect its points, and finish on release. Ignore other pointers during that gesture. Cancellation or lost capture discards the unfinished stroke without advancing or generating a handwriting failure. Releasing outside the pad must terminate the gesture safely; a path leaving the exercise bounds must not be accepted through coordinate clamping.
- **Mobile interaction:** Disable browser touch gestures only inside the drawing surface. Preserve normal page behavior elsewhere. Clear active input safely if layout changes during a stroke, while retaining completed strokes in lesson coordinates.
- **Transient state:** React owns the active pointer, unfinished stroke, accepted-stroke position, visible feedback, reveal state, and completion state. Rendered geometry is derived from that state. Clearing or retrying resets the attempt, feedback, and completion state to the first expected stroke.
- **Presentation:** Show the letter, pronunciation label, faint guide, writing pad, and labeled Clear, Reveal, and Retry controls. Revealing exposes the reference and ordered stroke hints without accepting strokes or marking completion. Hint presentation can be static; animation is not required.
- **Matching boundary:** A pure local geometry operation receives the completed input stroke and the next reference stroke. It returns an explicit accepted-or-retry outcome. It has no dependency on React, Void, storage, or network access.
- **Matching method:** Resample both paths by distance along each path. Compare corresponding positions, start and end locations, and path length. Preserve placement and scale relative to the whole letter. Do not independently recenter or resize individual strokes. Reject invalid and degenerate input before scoring; the first lesson must not require dot-like strokes.
- **Calibration:** Establish tolerances using recorded finger and stylus attempts. Thresholds are hypotheses until calibrated. Do not reuse Skritter's numeric thresholds or invent a recognition-accuracy claim. Preserve representative good and bad attempts as original fixtures.
- **Feedback:** Acceptance commits the reference stroke and advances exactly once. A retry does not advance or erase previously accepted strokes; remove the rejected transient ink and show a next-stroke hint. A clear textual completion state appears only after all reference strokes have been accepted.
- **Failure semantics:** An ordinary mismatch is a learner retry outcome. An unusable lesson or application failure is a separate failure state and cannot count as either successful writing or a handwriting mistake.
- **Effect boundary:** Keep interactive input and deterministic geometry local. Use Effect for external work, schema parsing at trust boundaries, typed failures, and resource lifetimes where required. Avoid a runtime invocation for each movement event. Follow the installed Effect version's instructions before implementation.
- **Server boundaries:** The first exercise needs no server mutation, database, or grading endpoint. If external lesson loading becomes necessary, keep transport in an adapter and expose failures explicitly. Any future server action follows rat-stack's shared-contract and handler pattern rather than duplicating domain behavior in Void routes.
- **Persistence and privacy:** Attempts exist only in memory for the current exercise. Refreshing or leaving may discard them. There is no attempt upload, durable progress, analytics stream, or hidden second store.
- **Accessibility:** Use semantic buttons, visible keyboard focus, readable labels, and text feedback in addition to color. The drawing interaction requires a pointing device in this version; keyboard handwriting input is outside scope. Label the pad and provide adjacent instructions for assistive technology.
- **Fence:** Establish exact pins, strict TypeScript checks, Effect diagnostics where applicable, import-boundary lint, meaningful tests, commit hooks, and CI before feature work. Enforce browser/server separation and keep provider adapters out of domain geometry. Preserve failing checks and report architectural violations explicitly.

## Testing Decisions

- **Seam confirmation:** Owner confirmed browser tests at the complete exercise boundary, focused geometry properties at the pure matcher boundary, and lesson-content boundary checks on 2026-10-22. No existing application test seam exists in this documentation-only project.
- **Primary seam:** Exercise the visible React page through browser pointer input and controls. Assert rendered strokes, feedback, progression, and completion. Avoid assertions about component internals, hook calls, event-handler names, or SVG implementation structure.
- **End-to-end behavior:** Prove a valid stroke advances once, a retry preserves the current step, revealing does not complete the exercise, and the final accepted stroke produces completion. Clear and Retry must return the exercise to its initial usable state.
- **Input robustness:** Cover interrupted input, capture loss, release outside the pad, a second pointer, resize during drawing, and repeated controls. After cancellation, the next valid gesture must work without refreshing.
- **Geometry seam:** Test matcher behavior using generated paths and original recorded examples. Check sampling-density invariance, consistent coordinate mapping across display sizes, wrong direction, misplaced strokes, excessive path length, degenerate input, and non-finite coordinates. Do not assert the implementation's chosen intermediate values or duplicate its scoring formula in tests.
- **Content boundary:** Check that unusable lesson content is rejected before interaction and that the learner sees a content failure rather than handwriting feedback. Validate the actual initial lesson, including its stroke order and coordinate bounds.
- **Meaningful properties:** Use rat-stack's preference for property and model tests where they fit. Demonstrate that a relevant intentional defect makes a new property fail before trusting it. Add example tests at browser and content seams where a concrete case communicates the behavior better.
- **Prior art:** There are no existing Strokes application tests to extend. Rat-stack's fence, Effect test conventions, and behavior-testing guidance are references, not evidence that Strokes already conforms. Select exact tooling from the scaffold and retain its version compatibility.
- **Physical devices:** Verify finger drawing, scroll behavior, pad sizing, control usability, and interruption recovery on an actual iPhone with Safari and Android phone with Chrome. Browser emulation supports development but does not establish real-device success.
- **Completion evidence:** Report automated checks, device checks, and any deployed smoke test separately. A successful build does not prove calibrated matching or sound Hindi instruction. Production publication is not required to finish the local exercise implementation.

## Out of Scope

- Accounts, authentication, email, subscriptions, and payment.
- Saved progress, cross-device sync, databases, and attempt history.
- Spaced repetition, due-item scheduling, streaks, leaderboards, and analytics.
- Full Hindi alphabet coverage, a curriculum, and a required fixed-size lesson catalog.
- Whole words, conjuncts, vowel-sign composition exercises, and arbitrary handwriting recognition.
- OCR, machine-learning training, AI grading, and penmanship scores.
- Multiple acceptable stroke sequences for each letter in the initial lesson.
- Dot-like reference strokes in the first lesson; these need a separate matching policy.
- Audio playback, speech synthesis, pronunciation assessment, and example sentences.
- Native mobile apps, offline installation, and service-worker caching.
- Polished stroke morphing, elaborate animations, and reproduction of Skritter's branding or layout.
- Reusing Skritter's implementation or proprietary character data in the product.
- Foldkit, Alchemy, MCP interfaces, code-mode interfaces, and unrelated rat-stack sample features.
- Creating a production cloud account or deploying the app as part of this specification-writing task.

## Further Notes

The Skritter investigation supports the known-character, next-stroke approach. REA statically parsed its public legacy web bundle, and focused manual inspection identified point collection, candidate checks, and reference-shape rendering. The live authenticated recognition path was not exercised. These observations inform this design; they do not validate the proposed matcher.

The original investigation's REA evidence ID is `ev_ac4cc745a3f06625034762dfdcc80b0b49437d7c2367df61f361a94018d9353b`. The project retains its source hashes and coverage limitations in the research summary.

Implementation references:

- [Void quickstart](https://void.cloud/guide/quickstart)
- [Void deployment](https://void.cloud/guide/deployment)
- [Rat-stack agent guide](https://ratstack.sh/llms.txt)
- [Rat-stack fence](https://ratstack.sh/systems/fence)
- [Rat-stack keep-or-cut guidance](https://ratstack.sh/skills/keep-or-cut)
- [Pointer Events](https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events)
- [Devanagari layout requirements](https://www.w3.org/International/ilreq/devanagari/)

Delivery is the approved sequence: local practice shell and fence; tracing one reviewed letter; checked strokes and completion; calibration and real-phone verification. Apply `ready-for-agent` to the specification and implementation tickets. Work only on tickets whose blockers are complete. Lesson review, calibration, and device verification remain explicit completion gates.

## Published implementation tickets

All four tickets carry `ready-for-agent` and are sub-issues of the specification. Native GitHub blocking relationships enforce this sequence:

1. [#2: Run the local practice shell with enforced boundaries](https://github.com/joshpitzalis/TimTim/issues/2) — no blockers; can start immediately.
2. [#3: Trace, reveal, and retry one reviewed Hindi letter](https://github.com/joshpitzalis/TimTim/issues/3) — blocked by #2.
3. [#4: Check each stroke and complete the letter](https://github.com/joshpitzalis/TimTim/issues/4) — blocked by #3.
4. [#5: Calibrate checking and verify practice on real phones](https://github.com/joshpitzalis/TimTim/issues/5) — blocked by #4.
