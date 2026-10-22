# Practice

Provide one local Hindi tracing exercise before automatic checking. The original
development letter has not received human content review and must say so visibly.
No completion, scoring, persistence, or pedagogical-validity claim belongs here yet.

## Ownership

- `domain/development-lesson.ts` owns original directed reference geometry and hints.
- `domain/lesson.ts` parses unknown content into a usable, branded lesson or a
  distinct content failure. Points must be finite, in bounds, and nondegenerate.
- `browser/practice.tsx` renders the letter, shared SVG coordinate frame, live ink,
  honest status, ordered Reveal hints, and labeled Clear/Retry controls.
- `browser/use-drawing.ts` owns one captured pointer and temporary React state.
  Interrupted input is discarded; finished gestures survive layout changes.
- `browser/practice.css` owns the responsive white/cobalt drawing-frame system.

## Behavior and checks

Drawing maps browser coordinates through the SVG transform. A second pointer is
ignored. Release ends one gesture, including outside the pad. Cancellation, lost
capture, blur, hidden document, and layout changes stop unfinished input safely.
Clear and Retry reset ink and revealed hints. Reveal never accepts a stroke.
Attempts remain in memory and disappear when the page is left or refreshed.

`tests/content/lesson.test.ts` checks the content boundary and authored ordering.
`tests/browser/tracing.spec.ts` checks public ink/status/control behavior and
interruption recovery. Actual iPhone/Android and finger/stylus checks remain open.
Stroke matching and calibration follow only after the lesson-review dependency.
