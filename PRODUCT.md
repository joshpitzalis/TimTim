# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

A Hindi learner practicing isolated letters in a mobile browser, using a finger or stylus. Mouse input supports the same exercise on desktop. The approved specification also identifies the learner as a TypeScript developer who wants an understandable starting point. Age and whether an adult guides practice remain undecided.

## Product Purpose

Strokes makes one Hindi letter available for tracing, revealing, retrying, and eventually checking one directed stroke at a time. Success means reliable local interaction and honest feedback against original, reviewed lesson content.

## Operating Context

The writing surface must work on a phone, allow page scrolling outside the pad, recover from interrupted gestures, and preserve alignment across display sizes. Actual iPhone Safari and Android Chrome checks are required separately from browser emulation.

## Capabilities and Constraints

- Void and React own the app; deterministic geometry stays independent. Effect owns parsing boundaries, external work, and typed failures when needed.
- The checked-in lesson owns the teaching sequence. React owns the temporary attempt. There are no accounts, uploads, durable progress, analytics, or database.
- One original letter comes first. The specific letter and reviewed sequence are open; any development fixture must carry an explicit unreviewed label.
- Clear and Retry reset the exercise. Reveal shows ordered reference strokes without accepting input or completing practice.
- Stroke direction, position, and scale matter. Tolerances remain provisional until original finger and stylus recordings support calibration.

## Brand Commitments

The learner-facing product name is Strokes. TimTim names the repository. The owner delegated the visual direction on 2026-10-22; DESIGN.md records the selected drawing-frame system.

## Evidence on Hand

The owner approved the product and test seams in SPEC.md and GitHub issue #1 on 2026-10-22. The Skritter research informs a next-stroke approach but provides no reusable implementation or lesson data. Reviewed Hindi content, calibrated matcher fixtures, and physical-device evidence are not yet available.

## Product Principles

- Keep practice local and understandable.
- Make the expected action and current step clear.
- Separate learner retries from application failures.
- Claim completion only after the required evidence exists.

## Accessibility & Inclusion

Use labeled semantic controls, visible keyboard focus, readable feedback beyond color, and adjacent pad instructions. Handwriting itself requires a pointing device in this version. A pronunciation label is text; audio is outside scope.
