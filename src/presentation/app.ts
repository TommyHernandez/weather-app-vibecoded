import { closeInput, ask } from "./input.ts"
import { loadState, saveState } from "../storage/state.repository.ts"
import type { MenuOption } from "../types/app.ts"
import { printMenu } from "./menu.ts"
import { error, success } from "./output.ts"
import {
  removeCity,
  searchAndAddCity,
  setDefaultWeatherCity,
  showAllCitiesWeather,
  showDefaultCityForecast,
  showDefaultCityWeather,
  toggleUnit,
} from "../actions/index.ts"

function isMenuOption(option: string): option is MenuOption {
  return option === "1" || option === "2" || option === "3" || option === "4" || option === "5" || option === "6" || option === "8" || option === "9"
}

export async function runApp(): Promise<void> {
  const state = await loadState()

  process.on("SIGINT", () => {
    console.log()
    closeInput()
    process.exit(0)
  })

  try {
    while (true) {
      printMenu(state)
      const option = (await ask("  Selecciona una opción: ")).trim()

      if (!isMenuOption(option)) {
        error("Opción inválida. Intenta de nuevo.")
        await ask("  Presiona Enter para continuar...")
        continue
      }

      if (option === "9") {
        success("¡Hasta luego!")
        return
      }

      switch (option) {
        case "1":
          await showDefaultCityWeather(state)
          break
        case "2":
          await showAllCitiesWeather(state)
          break
        case "3":
          await searchAndAddCity(state)
          break
        case "4":
          await removeCity(state)
          break
        case "5":
          await setDefaultWeatherCity(state)
          break
        case "6":
          await showDefaultCityForecast(state)
          break
        case "8":
          toggleUnit(state)
          break
      }

      await saveState(state)
      await ask("  Presiona Enter para continuar...")
    }
  } catch {
    error("Error inesperado.")
  } finally {
    closeInput()
  }
}
