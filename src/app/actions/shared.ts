import { geocodeCity } from "../../services/weather.service.ts"
import type { AppState, SavedCity } from "../../types/app.ts"
import type { GeocodingResult } from "../../types/weather-api.ts"
import { info } from "../../ui/messages.ts"

function normalize(value: string): string {
  return value.trim().toLowerCase()
}

function isFiniteCoordinate(value: number): boolean {
  return Number.isFinite(value)
}

export function hasCoordinates(city: SavedCity): boolean {
  return isFiniteCoordinate(city.latitude) && isFiniteCoordinate(city.longitude)
}

export function toSavedCity(location: GeocodingResult): SavedCity {
  return {
    name: location.name,
    latitude: location.latitude,
    longitude: location.longitude,
    admin1: location.admin1,
    country: location.country,
    country_code: location.country_code,
  }
}

export function cityLabel(city: SavedCity): string {
  const parts = [city.name]
  if (city.admin1) parts.push(city.admin1)
  if (city.country) parts.push(city.country)
  return parts.join(", ")
}

function cityIdentity(city: SavedCity): string {
  return [normalize(city.name), normalize(city.admin1 ?? ""), normalize(city.country ?? "")].join("|")
}

export function cityMatches(a: SavedCity, b: SavedCity): boolean {
  if (hasCoordinates(a) && hasCoordinates(b)) {
    return a.latitude === b.latitude && a.longitude === b.longitude
  }

  return cityIdentity(a) === cityIdentity(b)
}

export function cityExists(state: AppState, city: SavedCity): boolean {
  return state.cities.some((savedCity) => cityMatches(savedCity, city))
}

export function isAffirmative(answer: string): boolean {
  const normalized = answer.trim().toLowerCase()
  return normalized === "s" || normalized === "si"
}

export function parseCityIndex(input: string, citiesCount: number): number | null {
  const parsed = Number.parseInt(input, 10)
  if (Number.isNaN(parsed)) {
    return null
  }

  const index = parsed - 1
  if (index < 0 || index >= citiesCount) {
    return null
  }

  return index
}

export function printSavedCities(state: AppState): void {
  info("Ciudades guardadas:")
  state.cities.forEach((city, index) => {
    console.log(`  ${index + 1}. ${cityLabel(city)}`)
  })
}

export async function resolveCity(city: SavedCity): Promise<SavedCity | null> {
  if (hasCoordinates(city)) {
    return city
  }

  const hydrated = await geocodeCity(city.name)
  if (!hydrated) {
    return null
  }

  return toSavedCity(hydrated)
}

export function updateStateCityReferences(state: AppState, previous: SavedCity, resolved: SavedCity): void {
  if (state.defaultCity && cityMatches(state.defaultCity, previous)) {
    state.defaultCity = resolved
  }

  const index = state.cities.findIndex((city) => cityMatches(city, previous))
  if (index !== -1) {
    state.cities[index] = resolved
  }
}
