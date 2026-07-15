# AGENTS

## Project Status

Bun + TypeScript CLI scaffold. Entrypoint `index.ts` (per `package.json` `"module"`). Current code is placeholder; `README.md` is the functional spec (Weather CLI with Open-Meteo).

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
- `bun --hot index.ts` — dev loop with hot reload
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
