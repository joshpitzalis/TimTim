# Strokes

Read [README.md](README.md) for the product, investigation evidence, data ownership, and first implementation slice.

Project repository and issue tracker: [joshpitzalis/TimTim](https://github.com/joshpitzalis/TimTim). Publish implementation specifications to GitHub Issues with the `ready-for-agent` label after required test-seam confirmation. Create that label if absent.

## Build reference

Use [rat-stack](https://ratstack.sh/llms.txt) as the engineering reference. Search its rules and skills before code changes. Read the owning rule and matching skill, then inspect the installed package instructions and pinned source for Effect, XState, and infrastructure work.

Owner decisions: React for the UI; no Foldkit. Void owns the framework and deployment; use it instead of Alchemy. Effect owns external work and typed failures. Retain rat-stack's boundary and fence patterns while following these explicit framework choices.

## Product boundaries

Start with mobile tracing of one reviewed Hindi letter. Keep the input loop local and geometry pure. Author original lesson templates; Skritter's code and data are research references only.

The checked-in lesson is authoritative for the teaching sequence. React state owns the temporary attempt. Add durable progress only after naming its writer and authoritative store.

## Enforcement

The Void/React scaffold uses exact dependency pins, strict type checking with Effect diagnostics, Oxlint import boundaries, browser tests, commit hooks, and CI. Run `pnpm check`, `pnpm test`, and `pnpm build`; derive commands from the package scripts and preserve the fence. Read installed Void guidance at `node_modules/void/skills/void/SKILL.md` and matching `node_modules/void/docs/` before framework changes. Read `node_modules/effect/AGENTS.md` and pinned source before Effect changes.

Keep provider implementations outside domain code. Framework routes adapt shared contracts when server actions are introduced. Keep browser APIs in browser modules. Report violations of these patterns explicitly and fix their cause; preserve checks rather than bypassing them.

## Verification

Use geometry properties for the matcher and browser interaction checks for drawing, clearing, resizing, and cancellation. Validate mobile behavior on real devices. Report local checks, deployment, and device verification separately.
