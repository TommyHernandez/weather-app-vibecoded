# AGENTS

## Project Status

Bun + TypeScript Weather CLI implemented. Entrypoint `index.ts` delegates to `src/app/app.ts`.

Current architecture is split by responsibility:

- `src/app/` — app loop and menu actions
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
- settings (units)

## API Flow

1. Geocode city name → lat/lon via `https://geocoding-api.open-meteo.com/v1/search?name=...`
2. Fetch weather via `https://api.open-meteo.com/v1/forecast?latitude=..&longitude=..&current=temperature_2m`

## Commands

- `bun install` — install deps
- `bun index.ts` — run CLI
- `bun dev` — run CLI via script (`bun index.ts`)
- `bun run dev:hot` — dev loop with hot reload
- `bun run build` — build to `dist/`
- `bun test` — run tests (once they exist)

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
