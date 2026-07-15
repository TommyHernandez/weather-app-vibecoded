export type WeatherUnit = "C" | "F"

export interface SavedCity {
  name: string
  latitude: number
  longitude: number
  admin1?: string
  country?: string
  country_code?: string
}

export interface AppState {
  defaultCity: SavedCity | null
  cities: SavedCity[]
  unit: WeatherUnit
}

export type MenuOption = "1" | "2" | "3" | "4" | "5" | "8" | "9"
