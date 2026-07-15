# AGENTS

## Project Status

Bun + TypeScript Weather CLI implemented. Entrypoint `index.ts` delegates to `src/app/app.ts`.

Latest implemented iteration: **Iteration 4 (color consistency)**.

Current behavior highlights:

- Cities are persisted as structured objects (`SavedCity`) with coordinates.
- Geocoding now requests multiple candidates (`count=5`).
- If a search is ambiguous, user selects one option from a numbered list.
- Selected city is stored with coordinates to avoid future ambiguity.
- New menu option to show 7-day forecast for default city.
- Forecast output prints daily min/max temperatures for 7 days.
- Color convention is now consistent: cyan menu/info, yellow temperatures, green success, red errors.

Current architecture is split by responsibility:

- `src/app/` — app loop and action modules
- `src/app/actions/geocoding-actions.ts` — city search/add/remove/default workflows
- `src/app/actions/weather-actions.ts` — current weather and 7-day forecast workflows
- `src/app/actions/shared.ts` — shared city helpers (label, resolve, matches, indexing)
- `src/app/actions/index.ts` — action barrel exports used by `app.ts`
- `src/services/` — Open-Meteo API integration
- `src/state/` — load/save persisted state (`weather-data.json`)
- `src/ui/` — console colors/messages/menu rendering
- `src/types/` — shared TypeScript types/interfaces
- `src/config/` — constants
- `src/cli/` — readline input helpers

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
- `bun run build` — build to `dist/`

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

## Repo Gotchas

- **No CI, lint, formatter, or pre-commit config exists** — do not assume hidden checks
- Use `bun-instructions.md` for Bun-specific API guidance (Bun.serve, Bun.file, Bun.sql, etc.)

## Next Iterations (Roadmap)

1. Optional polish: improve warning/muted tone balance for long sessions.
