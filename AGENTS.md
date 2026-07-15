# AGENTS

## Project Status

Bun + TypeScript Weather CLI implemented. Entrypoint `index.ts` delegates to `src/presentation/app.ts`.

Latest implemented iteration: **Iteration 4 (color consistency)** + directory restructuring.

Current behavior highlights:

- Cities are persisted as structured objects (`SavedCity`) with coordinates.
- Geocoding now requests multiple candidates (`count=5`).
- If a search is ambiguous, user selects one option from a numbered list.
- Selected city is stored with coordinates to avoid future ambiguity.
- New menu option to show 7-day forecast for default city.
- Forecast output prints daily min/max temperatures for 7 days.
- Color convention is now consistent: cyan menu/info, yellow temperatures, green success, red errors.

Current architecture is split by responsibility:

- `src/actions/` — action modules (user workflows)
  - `geocoding-actions.ts` — city search/add/remove/default workflows
  - `weather-actions.ts` — current weather and 7-day forecast workflows
  - `shared.ts` — shared city helpers (label, resolve, matches, indexing)
  - `index.ts` — action barrel exports
- `src/presentation/` — CLI interaction layer
  - `app.ts` — main app loop and menu dispatch
  - `menu.ts` — menu rendering
  - `output.ts` — user-facing messages (info/success/warning/error/muted)
  - `input.ts` — readline input helpers
  - `colors.ts` — ANSI color utilities
- `src/api/` — Open-Meteo API integration (geocoding + weather + forecast)
- `src/storage/` — load/save persisted state (`weather-data.json`)
- `src/types/` — shared TypeScript types/interfaces
- `src/utils/` — constants

## Spec Target (from README)

Menu-driven CLI with options:

- default city weather
- weather for all saved cities
- search/add city
- remove city
- set default city
- 7-day forecast for default city
- settings (units)

Current delivered scope matches these menu options for current weather workflows.

## API Flow

1. Geocode city name → candidates via `https://geocoding-api.open-meteo.com/v1/search?name=...&count=5`
2. If multiple matches: ask user to pick one result.
3. Fetch current weather via `https://api.open-meteo.com/v1/forecast?latitude=..&longitude=..&current=temperature_2m`
4. Fetch 7-day forecast via `https://api.open-meteo.com/v1/forecast?latitude=..&longitude=..&daily=temperature_2m_max,temperature_2m_min&forecast_days=7`

Example geocoding fields currently used in app state:

- `name`
- `latitude`
- `longitude`
- `admin1` (optional)
- `country` (optional)
- `country_code` (optional)

## Commands

- `bun install` — install deps
- `bun index.ts` — run CLI
- `bun dev` — run CLI via script (`bun index.ts`)
- `bun run dev:hot` — dev loop with hot reload
- `bun run build` — compile standalone x64 binaries to `dist/`:
  - `dist/weather-app-vibecoded-linux-x64`
  - `dist/weather-app-vibecoded-windows-x64.exe`
  - `dist/weather-app-vibecoded-darwin-x64`
- `bun run test` — run test suite
- `bun run test:watch` — run tests in watch mode
- `bun run test:coverage` — run tests with coverage report
- `bun run test:ci` — run tests with coverage thresholds for CI

Validation commands used during implementation:

- `bun run build`
- `bunx tsc --noEmit`

## TypeScript Constraints

- `noUncheckedIndexedAccess: true` — always account for possible `undefined` on index access
- `noImplicitOverride: true` — require `override` keyword
- `verbatimModuleSyntax: true` — use `import type` for type-only imports
- `moduleResolution: bundler`, `allowImportingTsExtensions: true`
- `types: ["bun"]` — Bun types available globally
- `noEmit: true` — Bun runs directly; no tsc emit step

## CI / Release Pipeline

- Workflow file: `.github/workflows/release.yml`
- Trigger: every push to `main`
- Workflow env sets `FORCE_JAVASCRIPT_ACTIONS_TO_NODE24: true` to test JS-based GitHub Actions on Node24
- Release tag format: `v_<version>` from `package.json`
- If remote tag already exists, workflow fails intentionally (version bump required)
- Pipeline order: install deps -> run tests (`bun run test:ci`) -> build binaries (`bun run build`) -> create GitHub Release
- Release notes are automatic (`generate_release_notes: true`)

### How to Cut a Release

1. Update `version` in `package.json` (example: `1.0.0` -> `1.0.1`).
2. Commit the version bump and push to `main`.
3. GitHub Actions runs `.github/workflows/release.yml` automatically.
4. Workflow creates release tag `v_<version>` and uploads binaries from `dist/`.

## Repo Gotchas

- Use `bun-instructions.md` for Bun-specific API guidance (Bun.serve, Bun.file, Bun.sql, etc.)
- Testing best practices and Bun test conventions: `references/testing-best-practices-bun.md`

## Next Iterations (Roadmap)

1. Optional polish: improve warning/muted tone balance for long sessions.
