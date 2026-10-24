# Project conventions

TypeScript web app using Effect. Follow the installed Effect version and existing project conventions.

## Feature ownership

- Build self-contained vertical slices. Keep feature-specific domain code, use cases, services, controllers, UI, tests, and supporting code together.
- Removing functionality should mean deleting its feature module and removing minimal, explicit registration. Document unavoidable external dependencies or cleanup in the feature README.
- Expose a small public API; do not import another feature's internals. Extract shared code only when it is genuinely shared.
- Preserve applied database migrations; deleting code must not implicitly delete persisted data or external resources.
- Colocate tests in a `__tests__/` folder inside each feature, such as `src/features/installation/__tests__/`. Keep feature-specific fixtures and test helpers there too.
- When a feature starts as a single file, give it a feature folder when adding tests so its implementation and tests stay together.
- Verify changed behavior with appropriate checks.

## Structure and responsibilities

Keep named features under `src/features/`. Start small: a whole feature can begin as one file, such as `src/features/installation.ts`. As responsibilities grow, use this structure:

```text
src/features/installation/
  index.ts          # Public API and feature wiring
  domain/           # Business types, schemas, rules, and business errors
  use-cases/        # Business actions; coordinate domain rules and services
  services/         # Effect service contracts, implementations, and Layers
  controller.ts     # HTTP input, use-case calls, response/error mapping
src/main.ts         # Compose Layers and start the app
```

- Domain code must not depend on HTTP, databases, controllers, use cases, or service implementations.
- Controllers call use cases; use cases depend on service contracts and domain rules. Keep SQL and external API details in services.
- Keep each service's contract, implementation, and Layer together by default. Acquire external resources through Effect, never as import-time side effects.
- Use these names: `use-cases/`, `services/`, and `controller.ts`.

## Grow files incrementally

- Aim for roughly 200 lines per file; this is a soft limit.
- Any module—feature, use case, service, controller, or utility—may start as one file.
- As it grows, replace the file with a same-named folder containing `index.ts`. Extract the most semantically isolated concept into a descriptively named sibling file; repeat as needed.
- Example: `utils.ts` → `utils/index.ts` + `utils/formatCurrency.ts`.
- The index may retain cohesive implementation; it need not be only re-exports. Avoid redundant nested folders and arbitrary splits.
- Preserve public exports and update imports according to the project's module-resolution rules.
- Use cases and services may each own `helpers/` for named supporting operations and `lib/` for files such as `errors.ts`, `utils.ts`, and `constants.ts`. These files follow the owning module's dependency boundaries.
- Create only needed files and folders. Keep supporting code local; do not scaffold empty directories or speculative abstractions.

Verify changed behavior with appropriate checks and keep tests near their owner.