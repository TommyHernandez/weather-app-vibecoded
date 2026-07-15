import { DATA_FILE } from "../config/constants.ts"
import type { AppState } from "../types/app.ts"

function createDefaultState(): AppState {
  return {
    defaultCity: null,
    cities: [],
    unit: "C",
  }
}

function sanitizeState(rawData: unknown): AppState {
  if (typeof rawData !== "object" || rawData === null) {
    return createDefaultState()
  }

  const data = rawData as {
    defaultCity?: unknown
    cities?: unknown
    unit?: unknown
  }

  const defaultCity = typeof data.defaultCity === "string"
    ? data.defaultCity
    : null

  const cities = Array.isArray(data.cities)
    ? data.cities.filter((city: unknown): city is string => typeof city === "string")
    : []

  const unit = data.unit === "F" ? "F" : "C"

  return { defaultCity, cities, unit }
}

export async function loadState(): Promise<AppState> {
  try {
    const fileContent = await Bun.file(DATA_FILE).text()
    const parsed = JSON.parse(fileContent) as unknown
    return sanitizeState(parsed)
  } catch {
    return createDefaultState()
  }
}

export async function saveState(state: AppState): Promise<void> {
  await Bun.write(DATA_FILE, JSON.stringify(state, null, 2))
}
