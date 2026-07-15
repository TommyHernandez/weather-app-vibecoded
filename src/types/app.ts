export type WeatherUnit = "C" | "F"

export interface AppState {
  defaultCity: string | null
  cities: string[]
  unit: WeatherUnit
}

export type MenuOption = "1" | "2" | "3" | "4" | "5" | "8" | "9"
