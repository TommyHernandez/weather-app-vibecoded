import { SEPARATOR } from "../config/constants.ts"
import type { AppState } from "../types/app.ts"
import { colors } from "./colors.ts"

const APP_TITLE_ART = [
  " __        __        _   _                 ",
  " \\ \\      / /__  __ _| |_| |__   ___ _ __  ",
  "  \\ \\ /\\ / / _ \\/ _` | __| '_ \\ / _ \\ '__| ",
  "   \\ V  V /  __/ (_| | |_| | | |  __/ |    ",
  "    \\_/\\_/ \\___|\\__,_|\\__|_| |_|\\___|_|    ",
  "             CLI                               ",
]

export function printMenu(state: AppState): void {
  const cityCount = state.cities.length
  const unitSymbol = state.unit === "C" ? "°C" : "°F"
  const menuLine = (text: string): void => {
    console.log(colors.cyan(text))
  }

  console.log()
  console.log(colors.cyan(SEPARATOR))
  APP_TITLE_ART.forEach((line) => {
    console.log(colors.bold(colors.cyan(line)))
  })
  console.log(colors.cyan(SEPARATOR))
  menuLine("  1. Clima de ciudad default")
  menuLine(`  2. Clima de todas las ciudades (${cityCount})`)
  menuLine("  3. Buscar y agregar ciudad")
  menuLine("  4. Eliminar ciudad")
  menuLine("  5. Establecer ciudad default")
  menuLine("  6. Pronóstico 7 días (default)")
  menuLine(`  8. Ajustes (${unitSymbol})`)
  menuLine("  9. Salir")
  console.log(colors.cyan(SEPARATOR))
}
