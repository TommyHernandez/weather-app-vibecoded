import { FORECAST_URL, GEOCODING_URL } from "../config/constants.ts"
import type { WeatherUnit } from "../types/app.ts"
import type { ForecastResponse, GeocodingResponse, GeocodingResult, WeatherSnapshot } from "../types/weather-api.ts"

function buildGeocodingUrl(cityName: string): string {
  const encodedName = encodeURIComponent(cityName)
  return `${GEOCODING_URL}?name=${encodedName}&count=1&language=es&format=json`
}

function buildForecastUrl(latitude: number, longitude: number, unit: WeatherUnit): string {
  const fahrenheitQuery = unit === "F" ? "&temperature_unit=fahrenheit" : ""
  return `${FORECAST_URL}?latitude=${latitude}&longitude=${longitude}&current=temperature_2m${fahrenheitQuery}`
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
