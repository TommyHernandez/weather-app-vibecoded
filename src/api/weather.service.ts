import { FORECAST_URL, GEOCODING_URL } from "../utils/constants.ts"
import type { WeatherUnit } from "../types/app.ts"
import type {
  DailyForecastResponse,
  DailyForecastSnapshot,
  ForecastResponse,
  GeocodingResponse,
  GeocodingResult,
  WeatherSnapshot,
} from "../types/weather-api.ts"

function buildGeocodingUrl(cityName: string): string {
  const encodedName = encodeURIComponent(cityName)
  return `${GEOCODING_URL}?name=${encodedName}&count=5&language=es&format=json`
}

function buildForecastUrl(latitude: number, longitude: number, unit: WeatherUnit): string {
  const fahrenheitQuery = unit === "F" ? "&temperature_unit=fahrenheit" : ""
  return `${FORECAST_URL}?latitude=${latitude}&longitude=${longitude}&current=temperature_2m${fahrenheitQuery}`
}

function buildDailyForecastUrl(latitude: number, longitude: number, unit: WeatherUnit): string {
  const fahrenheitQuery = unit === "F" ? "&temperature_unit=fahrenheit" : ""
  return `${FORECAST_URL}?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max,temperature_2m_min&forecast_days=7${fahrenheitQuery}`
}

export async function geocodeCity(cityName: string): Promise<GeocodingResult | null> {
  const response = await fetch(buildGeocodingUrl(cityName))
  if (!response.ok) {
    return null
  }

  const payload = (await response.json()) as GeocodingResponse
  const firstResult = payload.results?.[0]
  if (!firstResult) {
    return null
  }

  return firstResult
}

export async function geocodeCityCandidates(cityName: string): Promise<GeocodingResult[]> {
  const response = await fetch(buildGeocodingUrl(cityName))
  if (!response.ok) {
    return []
  }

  const payload = (await response.json()) as GeocodingResponse
  return payload.results ?? []
}

export async function getCurrentWeather(
  latitude: number,
  longitude: number,
  unit: WeatherUnit,
): Promise<WeatherSnapshot | null> {
  const response = await fetch(buildForecastUrl(latitude, longitude, unit))
  if (!response.ok) {
    return null
  }

  const payload = (await response.json()) as ForecastResponse
  if (!payload.current) {
    return null
  }

  const fallbackUnitLabel = unit === "C" ? "°C" : "°F"
  const unitLabel = payload.current_units?.temperature_2m ?? fallbackUnitLabel

  return {
    temperature: payload.current.temperature_2m,
    unitLabel,
  }
}

export async function getDailyForecast(
  latitude: number,
  longitude: number,
  unit: WeatherUnit,
): Promise<DailyForecastSnapshot | null> {
  const response = await fetch(buildDailyForecastUrl(latitude, longitude, unit))
  if (!response.ok) {
    return null
  }

  const payload = (await response.json()) as DailyForecastResponse
  const days = payload.daily?.time
  const maxValues = payload.daily?.temperature_2m_max
  const minValues = payload.daily?.temperature_2m_min

  if (!days || !maxValues || !minValues) {
    return null
  }

  const count = Math.min(days.length, maxValues.length, minValues.length)
  if (count === 0) {
    return null
  }

  const items = Array.from({ length: count }, (_, index) => ({
    date: days[index] ?? "",
    max: maxValues[index] ?? Number.NaN,
    min: minValues[index] ?? Number.NaN,
  })).filter((item) => item.date && Number.isFinite(item.max) && Number.isFinite(item.min))

  if (items.length === 0) {
    return null
  }

  const fallbackUnitLabel = unit === "C" ? "°C" : "°F"
  const unitLabel = payload.daily_units?.temperature_2m_max ?? payload.daily_units?.temperature_2m_min ?? fallbackUnitLabel

  return {
    items,
    unitLabel,
  }
}
