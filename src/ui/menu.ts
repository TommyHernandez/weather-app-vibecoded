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

  console.log()
  console.log(colors.blue(SEPARATOR))
  APP_TITLE_ART.forEach((line) => {
    console.log(colors.bold(colors.blue(line)))
  })
  console.log(colors.blue(SEPARATOR))
  console.log("  1. Clima de ciudad default")
  console.log(`  2. Clima de todas las ciudades (${cityCount})`)
  console.log("  3. Buscar y agregar ciudad")
  console.log("  4. Eliminar ciudad")
  console.log("  5. Establecer ciudad default")
  console.log("  6. Pronóstico 7 días (default)")
  console.log(`  8. Ajustes (${unitSymbol})`)
  console.log("  9. Salir")
  console.log(colors.blue(SEPARATOR))
}
