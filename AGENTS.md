# Repository Guidelines (Deno / Fresh First)

- Source of truth: follow the documents under `docs/` (architecture, concepts,
  folder structure, feature specs). The current target platform is the `deno`
  branch using Fresh + React (Preact) + MUI with Clean Architecture.
- Implementation plan files under `docs/dev/**/implementation_plan/` use the
  naming rule `{issue_number}_{FE/BE}_plan.md` (e.g., `97_FE_plan.md`).

## Project Structure (Deno Monorepo)

- Fresh app: `apps/web/`
  - Routes: `routes/`
  - Islands (hydrated components): `islands/`
  - Server-rendered components: `components/`
  - Static assets: `static/`
  - Config/tasks: `deno.json`, `dev.ts`, `main.ts`, generated `fresh.gen.ts`
- Clean Architecture packages:
  - `packages/domain/`: entities (no dependencies outward).
  - `packages/usecase/`: application logic and repository interfaces; depends on
    `domain`.
  - `packages/infrastructure/`: implementations of interfaces (DB, external
    API); depends on `domain` and `usecase`.
  - `packages/core/` and `packages/db/`: shared/core utilities and DB-related
    helpers.
  - `apps/web` wires dependencies and exposes API routes.
- Legacy Nuxt/FastAPI code (`nikki_nuxt/`, `py/`) is reference only; do not
  treat it as the active target when on `deno` branch.

## Development Commands (Fresh)

- Dev server: `cd apps/web && deno task start` (watches `routes/` and
  `static/`).
- Build: `cd apps/web && deno task build`
- Preview: `cd apps/web && deno task preview`
- Lint/format check: `cd apps/web && deno task check` (runs `deno fmt --check`
  and `deno lint` with Fresh rules).
- Formatting: `deno fmt` (use repo defaults); Linting: `deno lint`.
- Testing: prefer `deno test` in the relevant package/app; mock adapters to keep
  tests hermetic.

## Architecture & Coding Style

- Islands Architecture (Fresh): keep UI-only markup in `components/` (no
  state/effects); put interactive pieces in `islands/` with state/signals/event
  handlers. Minimize client JS; favor server-rendered routes.
- Clean Architecture dependency rule: dependencies point inward (`apps/web` ->
  `infrastructure` -> `usecase` -> `domain`). `domain` is pure and has no
  outbound dependencies.
- TypeScript with Preact JSX (`jsxImportSource: preact`). Use signals
  (`@preact/signals`) where appropriate for simple state.
- Keep API routes thin: parse/validate input, call use cases, map results to
  HTTP responses.
- Shared config/imports should leverage `deno.json` imports map. Avoid
  hardcoding URLs/paths; centralize in config where needed.

## Testing Guidelines

- Unit tests in the package they cover (e.g., `packages/usecase/**/__tests__` or
  similar); integration tests for routes can live under `apps/web/routes/**`
  with `deno test`.
- Favor pure functions in `domain`/`usecase` for easy testing; mock repository
  interfaces in use case tests.
- Run `deno task check` before pushing; add `deno test` runs to validate new
  logic.

## Docs & Workflow

- Check `docs/` before implementing features; align with specs like
  `docs/dev/login/*.md`.
- Record implementation plans using the naming rule above before coding
  significant features.
- Branching: work on `deno` branch (or feature branches off it); keep PRs
  focused and reference issues.

## Security & Configuration

- Do not commit secrets. Use environment/config variables through Fresh/Deno
  mechanisms (e.g., `Deno.env`) and document required keys in `docs/` or
  app-level README.
- Validate all inbound data at route boundaries; do not log sensitive values
  (passwords, tokens).
- Keep dependency injection explicit so that swapping infra (DB/API) is
  straightforward and testable.
