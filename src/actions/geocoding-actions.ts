import { ask } from "../presentation/input.ts"
import { geocodeCityCandidates } from "../api/weather.service.ts"
import type { AppState, SavedCity } from "../types/app.ts"
import type { GeocodingResult } from "../types/weather-api.ts"
import { error, info, muted, success, warning } from "../presentation/output.ts"
import {
  cityExists,
  cityLabel,
  cityMatches,
  isAffirmative,
  parseCityIndex,
  printSavedCities,
  toSavedCity,
} from "./shared.ts"

function printCandidates(candidates: GeocodingResult[]): void {
  info("Se encontraron varias ciudades:")
  candidates.forEach((candidate, index) => {
    const city = toSavedCity(candidate)
    console.log(`  ${index + 1}. ${cityLabel(city)}`)
  })
}

async function pickCityCandidate(cityName: string): Promise<SavedCity | "cancelled" | null> {
  muted("Buscando...")
  const candidates = await geocodeCityCandidates(cityName)

  if (candidates.length === 0) {
    return null
  }

  if (candidates.length === 1) {
    return toSavedCity(candidates[0]!)
  }

  printCandidates(candidates)
  const input = (await ask("  Número de ciudad (Enter para cancelar): ")).trim()
  if (!input) {
    muted("Operación cancelada.")
    return "cancelled"
  }

  const index = parseCityIndex(input, candidates.length)
  if (index === null) {
    error("Opción inválida.")
    return null
  }

  const selected = candidates[index]
  if (!selected) {
    error("Error: ciudad no encontrada.")
    return null
  }

  return toSavedCity(selected)
}

export async function searchAndAddCity(state: AppState): Promise<void> {
  const hadSavedCitiesBeforeAdd = state.cities.length > 0

  const input = await ask("  Ingresa el nombre de la ciudad a buscar: ")
  const cityName = input.trim()
  if (!cityName) {
    warning("Nombre de ciudad inválido.")
    return
  }

  const selectedCity = await pickCityCandidate(cityName)
  if (selectedCity === "cancelled") {
    return
  }

  if (!selectedCity) {
    error(`No se encontró la ciudad "${cityName}".`)
    return
  }

  if (cityExists(state, selectedCity)) {
    warning(`"${cityLabel(selectedCity)}" ya está en tu lista de ciudades.`)
    return
  }

  info(`Se encontró: ${cityLabel(selectedCity)}`)
  const confirm = await ask("  ¿Agregar esta ciudad? (s/N): ")
  if (!isAffirmative(confirm)) {
    muted("Operación cancelada.")
    return
  }

  state.cities.push(selectedCity)
  success(`"${cityLabel(selectedCity)}" agregada a la lista.`)

  if (!state.defaultCity) {
    state.defaultCity = selectedCity
    info(`"${cityLabel(selectedCity)}" establecida como ciudad default.`)
    return
  }

  if (!hadSavedCitiesBeforeAdd) {
    return
  }

  const setAsDefault = await ask(`  ¿Quieres establecer "${cityLabel(selectedCity)}" como ciudad default? (s/N): `)
  if (isAffirmative(setAsDefault)) {
    state.defaultCity = selectedCity
    success(`Ciudad default cambiada a "${cityLabel(selectedCity)}".`)
  }
}

export async function removeCity(state: AppState): Promise<void> {
  if (state.cities.length === 0) {
    warning("No hay ciudades guardadas.")
    return
  }

  printSavedCities(state)
  const input = (await ask("  Número de ciudad a eliminar (Enter para cancelar): ")).trim()
  if (!input) {
    return
  }

  const index = parseCityIndex(input, state.cities.length)
  if (index === null) {
    error("Opción inválida.")
    return
  }

  const removed = state.cities[index]
  if (!removed) {
    error("Error: ciudad no encontrada.")
    return
  }

  state.cities.splice(index, 1)
  success(`"${cityLabel(removed)}" eliminada.`)

  if (state.defaultCity && !cityMatches(state.defaultCity, removed)) {
    return
  }

  state.defaultCity = state.cities[0] ?? null
  if (state.defaultCity) {
    info(`Ciudad default cambiada a "${cityLabel(state.defaultCity)}".`)
    return
  }

  warning("No hay ciudad default configurada.")
}

export async function setDefaultWeatherCity(state: AppState): Promise<void> {
  if (state.cities.length > 0) {
    printSavedCities(state)
    const input = (await ask("  Número de ciudad o Enter para buscar nueva: ")).trim()

    if (input) {
      const index = parseCityIndex(input, state.cities.length)
      if (index !== null) {
        const selectedCity = state.cities[index]
        if (selectedCity) {
          state.defaultCity = selectedCity
          success(`Ciudad default cambiada a "${cityLabel(selectedCity)}".`)
        }
        return
      }
    }
  }

  const searchInput = (await ask("  Nombre de la ciudad a buscar: ")).trim()
  if (!searchInput) {
    warning("Nombre inválido.")
    return
  }

  const selectedCity = await pickCityCandidate(searchInput)
  if (selectedCity === "cancelled") {
    return
  }

  if (!selectedCity) {
    error(`No se encontró "${searchInput}".`)
    return
  }

  state.defaultCity = selectedCity
  success(`Ciudad default establecida a "${cityLabel(selectedCity)}".`)

  if (cityExists(state, selectedCity)) {
    return
  }

  state.cities.push(selectedCity)
  info(`"${cityLabel(selectedCity)}" agregada a la lista.`)
}
