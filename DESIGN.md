---
name: Strokes
description: A registered drawing frame for Hindi handwriting practice
colors:
  primary: "#2348d1"
  primary-deep: "#17349e"
  ground: "#edf1f6"
  surface: "#ffffff"
  ink: "#15223b"
  muted: "#526079"
  rule: "#c9d3e3"
  guide: "#c6d2f6"
typography:
  body:
    fontFamily: "system-ui, sans-serif"
    fontSize: "1rem"
    lineHeight: 1.5
  title:
    fontFamily: "system-ui, sans-serif"
    fontSize: "2rem"
    fontWeight: 650
    lineHeight: 1.15
rounded:
  control: "8px"
spacing:
  small: "8px"
  group: "16px"
  section: "32px"
---

# Design System: Strokes

## Overview

**Creative North Star: "Printmaker's proof"**

A cool white working field, cobalt ink, registration corners, and explicit directed-stroke proofs. The user delegated the visual choice on 2026-10-22. The reference metaphor explains aligned drawing and repeated attempts; it introduces no printing terminology into learner instructions.

## Colors

White owns the writing surface; a cool neutral ground separates the workspace from its surroundings. Cobalt marks active ink and actions. Dark ink and muted blue-gray support readable instructions. Faint blue guides are reference geometry, never status text.

## Typography

Use system sans for controls and instructions, with readable fixed rem sizes. The lesson glyph and reference paths carry the visual identity. Use the platform Devanagari fallback for the glyph label; the actual teaching paths are authored SVG geometry, never a font outline.

## Layout

The square writing surface leads. A compact lesson header precedes it; instructions and labeled controls remain adjacent. On wide screens, an instruction rail sits beside the larger drawing frame. On phones, the rail moves below the pad and controls stay reachable. Avoid a dashboard, lesson catalog, or decorative card grid.

## Elevation & Depth

Flat working surfaces with registration marks and subtle border contrast. No decorative glows, glass, or simulated paper texture. Depth must not confuse the writing boundary.

## Shapes

Keep the pad geometrically square with modest corner treatment. Controls have consistent gently rounded corners and generous touch areas. Registration marks remain outside the input bounds.

## Components

The pad is a real SVG with a shared lesson coordinate system. Reference geometry is faint; learner ink is cobalt. Reveal exposes numbered directed reference strokes without accepting input. Buttons use text labels, visible focus, hover and pressed states. Feedback uses readable text with a stable position to avoid layout movement during drawing.

## Do's and Don'ts

- Do prioritize the pad under ordinary indoor and daylight phone use.
- Do keep human review and development-fixture status honest and readable.
- Do use semantic HTML and SVG for all instructions, controls, and drawing.
- Don't add streaks, scores, mastery claims, a lesson catalog, or persistent history.
- Don't use imagery or animation where it would compete with the drawing task.
