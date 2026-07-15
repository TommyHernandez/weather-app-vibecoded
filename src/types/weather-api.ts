export interface GeocodingResult {
  name: string
  latitude: number
  longitude: number
  admin1?: string
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

export interface DailyWeather {
  time: string[]
  temperature_2m_max: number[]
  temperature_2m_min: number[]
}

export interface DailyUnits {
  temperature_2m_max?: string
  temperature_2m_min?: string
}

export interface DailyForecastResponse {
  daily?: DailyWeather
  daily_units?: DailyUnits
}

export interface DailyForecastItem {
  date: string
  max: number
  min: number
}

export interface DailyForecastSnapshot {
  items: DailyForecastItem[]
  unitLabel: string
}

export interface WeatherSnapshot {
  temperature: number
  unitLabel: string
}
