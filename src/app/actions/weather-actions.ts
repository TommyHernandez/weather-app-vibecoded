import { getCurrentWeather, getDailyForecast } from "../../services/weather.service.ts"
import type { AppState, SavedCity } from "../../types/app.ts"
import type { DailyForecastSnapshot, WeatherSnapshot } from "../../types/weather-api.ts"
import { colors } from "../../ui/colors.ts"
import { error, info, muted, success, warning } from "../../ui/messages.ts"
import { cityLabel, cityMatches, resolveCity, updateStateCityReferences } from "./shared.ts"

function weatherLine(city: SavedCity, weather: WeatherSnapshot): string {
  return `${cityLabel(city)}: ${colors.yellow(`${weather.temperature}${weather.unitLabel}`)}`
}

function dayLabel(isoDate: string): string {
  const parsed = new Date(`${isoDate}T00:00:00`)
  if (Number.isNaN(parsed.getTime())) {
    return isoDate
  }

  return parsed.toLocaleDateString("es-ES", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
  })
}

function printForecast(city: SavedCity, forecast: DailyForecastSnapshot): void {
  info(`Pronóstico 7 días: ${cityLabel(city)}`)
  forecast.items.forEach((item) => {
    const label = dayLabel(item.date).padEnd(12, " ")
    const minValue = colors.yellow(`${item.min}${forecast.unitLabel}`)
    const maxValue = colors.yellow(`${item.max}${forecast.unitLabel}`)
    console.log(`  ${label} min ${minValue} | max ${maxValue}`)
  })
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

export async function showDefaultCityForecast(state: AppState): Promise<void> {
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

  muted("Consultando pronóstico de 7 días...")
  const forecast = await getDailyForecast(resolvedCity.latitude, resolvedCity.longitude, state.unit)
  if (!forecast) {
    error("Error al obtener el pronóstico de 7 días.")
    return
  }

  printForecast(resolvedCity, forecast)
}

export function toggleUnit(state: AppState): void {
  state.unit = state.unit === "C" ? "F" : "C"
  const symbol = state.unit === "C" ? "°C" : "°F"
  success(`Unidad cambiada a ${symbol}.`)
}
