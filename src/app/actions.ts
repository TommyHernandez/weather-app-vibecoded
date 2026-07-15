import { ask } from "../cli/io.ts"
import type { AppState } from "../types/app.ts"
import type { GeocodingResult, WeatherSnapshot } from "../types/weather-api.ts"
import { geocodeCity, getCurrentWeather } from "../services/weather.service.ts"
import { error, info, muted, success, warning } from "../ui/messages.ts"

function normalizeCityName(cityName: string): string {
  return cityName.trim().toLowerCase()
}

function cityLabel(location: GeocodingResult): string {
  return location.country ? `${location.name} (${location.country})` : location.name
}

function weatherLine(location: GeocodingResult, weather: WeatherSnapshot): string {
  return `${cityLabel(location)}: ${weather.temperature}${weather.unitLabel}`
}

function cityExists(state: AppState, cityName: string): boolean {
  const normalizedTarget = normalizeCityName(cityName)
  return state.cities.some((savedCity) => normalizeCityName(savedCity) === normalizedTarget)
}

function isAffirmative(answer: string): boolean {
  const normalized = answer.trim().toLowerCase()
  return normalized === "s" || normalized === "si"
}

async function searchCity(cityName: string): Promise<GeocodingResult | null> {
  muted("Buscando...")
  return geocodeCity(cityName)
}

export async function showDefaultCityWeather(state: AppState): Promise<void> {
  if (!state.defaultCity) {
    warning("No hay ciudad default configurada. Usa la opción 5 para establecerla.")
    return
  }

  muted("Buscando coordenadas...")
  const location = await geocodeCity(state.defaultCity)
  if (!location) {
    error(`No se encontró la ciudad "${state.defaultCity}".`)
    return
  }

  muted("Consultando clima...")
  const weather = await getCurrentWeather(location.latitude, location.longitude, state.unit)
  if (!weather) {
    error("Error al obtener el clima.")
    return
  }

  info(weatherLine(location, weather))
}

export async function showAllCitiesWeather(state: AppState): Promise<void> {
  if (state.cities.length === 0) {
    warning("No hay ciudades guardadas. Usa la opción 3 para agregar una.")
    return
  }

  muted("Consultando clima de todas las ciudades...")

  for (const city of state.cities) {
    const location = await geocodeCity(city)
    if (!location) {
      warning(`${city}: no encontrada`)
      continue
    }

    const weather = await getCurrentWeather(location.latitude, location.longitude, state.unit)
    if (!weather) {
      warning(`${city}: error al obtener clima`)
      continue
    }

    info(weatherLine(location, weather))
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

  if (cityExists(state, cityName)) {
    warning(`"${cityName}" ya está en tu lista de ciudades.`)
    return
  }

  const location = await searchCity(cityName)
  if (!location) {
    error(`No se encontró la ciudad "${cityName}".`)
    return
  }

  info(`Se encontró: ${cityLabel(location)}`)
  const confirm = await ask("  ¿Agregar esta ciudad? (s/N): ")
  if (!isAffirmative(confirm)) {
    muted("Operación cancelada.")
    return
  }

  state.cities.push(location.name)
  success(`"${location.name}" agregada a la lista.`)

  if (!state.defaultCity) {
    state.defaultCity = location.name
    info(`"${location.name}" establecida como ciudad default.`)
    return
  }

  if (!hadSavedCitiesBeforeAdd) {
    return
  }

  const setAsDefault = await ask(`  ¿Quieres establecer "${location.name}" como ciudad default? (s/N): `)
  if (isAffirmative(setAsDefault)) {
    state.defaultCity = location.name
    success(`Ciudad default cambiada a "${location.name}".`)
  }
}

function printSavedCities(state: AppState): void {
  info("Ciudades guardadas:")
  state.cities.forEach((city, index) => {
    console.log(`  ${index + 1}. ${city}`)
  })
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
  success(`"${removed}" eliminada.`)

  if (state.defaultCity?.toLowerCase() !== removed.toLowerCase()) {
    return
  }

  state.defaultCity = state.cities[0] ?? null
  if (state.defaultCity) {
    info(`Ciudad default cambiada a "${state.defaultCity}".`)
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
          success(`Ciudad default cambiada a "${selectedCity}".`)
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

  const location = await searchCity(searchInput)
  if (!location) {
    error(`No se encontró "${searchInput}".`)
    return
  }

  state.defaultCity = location.name
  success(`Ciudad default establecida a "${location.name}".`)

  if (cityExists(state, location.name)) {
    return
  }

  state.cities.push(location.name)
  info(`"${location.name}" agregada a la lista.`)
}

export function toggleUnit(state: AppState): void {
  state.unit = state.unit === "C" ? "F" : "C"
  const symbol = state.unit === "C" ? "°C" : "°F"
  success(`Unidad cambiada a ${symbol}.`)
}
