export interface GeocodingResult {
  name: string
  latitude: number
  longitude: number
  country?: string
  country_code?: string
}

export interface GeocodingResponse {
  results?: GeocodingResult[]
}

export interface CurrentWeather {
  temperature_2m: number
}

export interface CurrentUnits {
  temperature_2m?: string
}

export interface ForecastResponse {
  current?: CurrentWeather
  current_units?: CurrentUnits
}

export interface WeatherSnapshot {
  temperature: number
  unitLabel: string
}
