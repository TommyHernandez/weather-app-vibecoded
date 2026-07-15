import { ask } from "../cli/io.ts"
import { geocodeCity, geocodeCityCandidates, getCurrentWeather } from "../services/weather.service.ts"
import type { AppState, SavedCity } from "../types/app.ts"
import type { GeocodingResult, WeatherSnapshot } from "../types/weather-api.ts"
import { error, info, muted, success, warning } from "../ui/messages.ts"

function normalize(value: string): string {
  return value.trim().toLowerCase()
}

function isFiniteCoordinate(value: number): boolean {
  return Number.isFinite(value)
}

function hasCoordinates(city: SavedCity): boolean {
  return isFiniteCoordinate(city.latitude) && isFiniteCoordinate(city.longitude)
}

function toSavedCity(location: GeocodingResult): SavedCity {
  return {
    name: location.name,
    latitude: location.latitude,
    longitude: location.longitude,
    admin1: location.admin1,
    country: location.country,
    country_code: location.country_code,
  }
}

function cityLabel(city: SavedCity): string {
  const parts = [city.name]
  if (city.admin1) parts.push(city.admin1)
  if (city.country) parts.push(city.country)
  return parts.join(", ")
}

function weatherLine(city: SavedCity, weather: WeatherSnapshot): string {
  return `${cityLabel(city)}: ${weather.temperature}${weather.unitLabel}`
}

function cityIdentity(city: SavedCity): string {
  return [normalize(city.name), normalize(city.admin1 ?? ""), normalize(city.country ?? "")].join("|")
}

function cityMatches(a: SavedCity, b: SavedCity): boolean {
  if (hasCoordinates(a) && hasCoordinates(b)) {
    return a.latitude === b.latitude && a.longitude === b.longitude
  }

  return cityIdentity(a) === cityIdentity(b)
}

function cityExists(state: AppState, city: SavedCity): boolean {
  return state.cities.some((savedCity) => cityMatches(savedCity, city))
}

function isAffirmative(answer: string): boolean {
  const normalized = answer.trim().toLowerCase()
  return normalized === "s" || normalized === "si"
}

function parseCityIndex(input: string, citiesCount: number): number | null {
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

function printSavedCities(state: AppState): void {
  info("Ciudades guardadas:")
  state.cities.forEach((city, index) => {
    console.log(`  ${index + 1}. ${cityLabel(city)}`)
  })
}

async function resolveCity(city: SavedCity): Promise<SavedCity | null> {
  if (hasCoordinates(city)) {
    return city
  }

  const hydrated = await geocodeCity(city.name)
  if (!hydrated) {
    return null
  }

  return toSavedCity(hydrated)
}

function updateStateCityReferences(state: AppState, previous: SavedCity, resolved: SavedCity): void {
  if (state.defaultCity && cityMatches(state.defaultCity, previous)) {
    state.defaultCity = resolved
  }

  const index = state.cities.findIndex((city) => cityMatches(city, previous))
  if (index !== -1) {
    state.cities[index] = resolved
  }
}

function printCandidates(candidates: GeocodingResult[]): void {
  info("Se encontraron varias ciudades:")
  candidates.forEach((candidate, index) => {
    const city = toSavedCity(candidate)
    console.log(`  ${index + 1}. ${cityLabel(city)}`)
  })
}

async function pickCityCandidate(cityName: string): Promise<SavedCity | "cancelled" | null> {
  muted("Buscando...")
  const candidates = await geocodeCityCandidates(cityName)

  if (candidates.length === 0) {
    return null
  }

  if (candidates.length === 1) {
    return toSavedCity(candidates[0]!)
  }

  printCandidates(candidates)
  const input = (await ask("  Número de ciudad (Enter para cancelar): ")).trim()
  if (!input) {
    muted("Operación cancelada.")
    return "cancelled"
  }

  const index = parseCityIndex(input, candidates.length)
  if (index === null) {
    error("Opción inválida.")
    return null
  }

  const selected = candidates[index]
  if (!selected) {
    error("Error: ciudad no encontrada.")
    return null
  }

  return toSavedCity(selected)
}

export async function showDefaultCityWeather(state: AppState): Promise<void> {
  if (!state.defaultCity) {
    warning("No hay ciudad default configurada. Usa la opción 5 para establecerla.")
    return
  }

  muted("Buscando coordenadas...")
  const defaultCity = state.defaultCity
  const resolvedCity = await resolveCity(defaultCity)
  if (!resolvedCity) {
    error(`No se encontró la ciudad "${defaultCity.name}".`)
    return
  }

  updateStateCityReferences(state, defaultCity, resolvedCity)

  muted("Consultando clima...")
  const weather = await getCurrentWeather(resolvedCity.latitude, resolvedCity.longitude, state.unit)
  if (!weather) {
    error("Error al obtener el clima.")
    return
  }

  info(weatherLine(resolvedCity, weather))
}

export async function showAllCitiesWeather(state: AppState): Promise<void> {
  if (state.cities.length === 0) {
    warning("No hay ciudades guardadas. Usa la opción 3 para agregar una.")
    return
  }

  muted("Consultando clima de todas las ciudades...")

  for (let index = 0; index < state.cities.length; index += 1) {
    const city = state.cities[index]
    if (!city) {
      continue
    }

    const resolvedCity = await resolveCity(city)
    if (!resolvedCity) {
      warning(`${city.name}: no encontrada`)
      continue
    }

    state.cities[index] = resolvedCity
    if (state.defaultCity && cityMatches(state.defaultCity, city)) {
      state.defaultCity = resolvedCity
    }

    const weather = await getCurrentWeather(resolvedCity.latitude, resolvedCity.longitude, state.unit)
    if (!weather) {
      warning(`${resolvedCity.name}: error al obtener clima`)
      continue
    }

    info(weatherLine(resolvedCity, weather))
  }
}

export async function searchAndAddCity(state: AppState): Promise<void> {
  const hadSavedCitiesBeforeAdd = state.cities.length > 0

  const input = await ask("  Ingresa el nombre de la ciudad a buscar: ")
  const cityName = input.trim()
  if (!cityName) {
    warning("Nombre de ciudad inválido.")
    return
  }

  const selectedCity = await pickCityCandidate(cityName)
  if (selectedCity === "cancelled") {
    return
  }

  if (!selectedCity) {
    error(`No se encontró la ciudad "${cityName}".`)
    return
  }

  if (cityExists(state, selectedCity)) {
    warning(`"${cityLabel(selectedCity)}" ya está en tu lista de ciudades.`)
    return
  }

  info(`Se encontró: ${cityLabel(selectedCity)}`)
  const confirm = await ask("  ¿Agregar esta ciudad? (s/N): ")
  if (!isAffirmative(confirm)) {
    muted("Operación cancelada.")
    return
  }

  state.cities.push(selectedCity)
  success(`"${cityLabel(selectedCity)}" agregada a la lista.`)

  if (!state.defaultCity) {
    state.defaultCity = selectedCity
    info(`"${cityLabel(selectedCity)}" establecida como ciudad default.`)
    return
  }

  if (!hadSavedCitiesBeforeAdd) {
    return
  }

  const setAsDefault = await ask(`  ¿Quieres establecer "${cityLabel(selectedCity)}" como ciudad default? (s/N): `)
  if (isAffirmative(setAsDefault)) {
    state.defaultCity = selectedCity
    success(`Ciudad default cambiada a "${cityLabel(selectedCity)}".`)
  }
}

export async function removeCity(state: AppState): Promise<void> {
  if (state.cities.length === 0) {
    warning("No hay ciudades guardadas.")
    return
  }

  printSavedCities(state)
  const input = (await ask("  Número de ciudad a eliminar (Enter para cancelar): ")).trim()
  if (!input) {
    return
  }

  const index = parseCityIndex(input, state.cities.length)
  if (index === null) {
    error("Opción inválida.")
    return
  }

  const removed = state.cities[index]
  if (!removed) {
    error("Error: ciudad no encontrada.")
    return
  }

  state.cities.splice(index, 1)
  success(`"${cityLabel(removed)}" eliminada.`)

  if (state.defaultCity && !cityMatches(state.defaultCity, removed)) {
    return
  }

  state.defaultCity = state.cities[0] ?? null
  if (state.defaultCity) {
    info(`Ciudad default cambiada a "${cityLabel(state.defaultCity)}".`)
    return
  }

  warning("No hay ciudad default configurada.")
}

export async function setDefaultWeatherCity(state: AppState): Promise<void> {
  if (state.cities.length > 0) {
    printSavedCities(state)
    const input = (await ask("  Número de ciudad o Enter para buscar nueva: ")).trim()

    if (input) {
      const index = parseCityIndex(input, state.cities.length)
      if (index !== null) {
        const selectedCity = state.cities[index]
        if (selectedCity) {
          state.defaultCity = selectedCity
          success(`Ciudad default cambiada a "${cityLabel(selectedCity)}".`)
        }
        return
      }
    }
  }

  const searchInput = (await ask("  Nombre de la ciudad a buscar: ")).trim()
  if (!searchInput) {
    warning("Nombre inválido.")
    return
  }

  const selectedCity = await pickCityCandidate(searchInput)
  if (selectedCity === "cancelled") {
    return
  }

  if (!selectedCity) {
    error(`No se encontró "${searchInput}".`)
    return
  }

  state.defaultCity = selectedCity
  success(`Ciudad default establecida a "${cityLabel(selectedCity)}".`)

  if (cityExists(state, selectedCity)) {
    return
  }

  state.cities.push(selectedCity)
  info(`"${cityLabel(selectedCity)}" agregada a la lista.`)
}

export function toggleUnit(state: AppState): void {
  state.unit = state.unit === "C" ? "F" : "C"
  const symbol = state.unit === "C" ? "°C" : "°F"
  success(`Unidad cambiada a ${symbol}.`)
}
