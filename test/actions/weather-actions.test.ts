import { afterAll, beforeEach, describe, expect, mock, spyOn, test } from "bun:test"

import type { AppState, SavedCity } from "../../src/types/app.ts"
import {
  showAllCitiesWeather,
  showDefaultCityForecast,
  showDefaultCityWeather,
  toggleUnit,
} from "../../src/actions/weather-actions.ts"
import * as weatherService from "../../src/api/weather.service.ts"
import * as shared from "../../src/actions/shared.ts"
import * as output from "../../src/presentation/output.ts"

const getCurrentWeatherSpy = mock(async () => null)
const getDailyForecastSpy = mock(async () => null)
const resolveCitySpy = mock(async () => null)
const updateStateCityReferencesSpy = mock(() => {})
const cityMatchesSpy = mock(() => false)
const cityLabelSpy = mock((city: SavedCity) => city.name)
const warningSpy = mock(() => {})
const infoSpy = mock(() => {})
const mutedSpy = mock(() => {})
const errorSpy = mock(() => {})
const successSpy = mock(() => {})

const getCurrentWeatherModuleSpy = spyOn(weatherService, "getCurrentWeather")
const getDailyForecastModuleSpy = spyOn(weatherService, "getDailyForecast")
const resolveCityModuleSpy = spyOn(shared, "resolveCity")
const updateStateCityReferencesModuleSpy = spyOn(shared, "updateStateCityReferences")
const cityMatchesModuleSpy = spyOn(shared, "cityMatches")
const cityLabelModuleSpy = spyOn(shared, "cityLabel")
const warningModuleSpy = spyOn(output, "warning")
const infoModuleSpy = spyOn(output, "info")
const mutedModuleSpy = spyOn(output, "muted")
const errorModuleSpy = spyOn(output, "error")
const successModuleSpy = spyOn(output, "success")
const consoleLogSpy = spyOn(console, "log")

beforeEach(() => {
  getCurrentWeatherSpy.mockReset()
  getDailyForecastSpy.mockReset()
  resolveCitySpy.mockReset()
  updateStateCityReferencesSpy.mockReset()
  cityMatchesSpy.mockReset()
  cityLabelSpy.mockReset()
  warningSpy.mockReset()
  infoSpy.mockReset()
  mutedSpy.mockReset()
  errorSpy.mockReset()
  successSpy.mockReset()
  consoleLogSpy.mockReset()

  cityLabelSpy.mockImplementation((city: SavedCity) => city.name)
  cityMatchesSpy.mockReturnValue(false)

  getCurrentWeatherModuleSpy.mockImplementation(getCurrentWeatherSpy)
  getDailyForecastModuleSpy.mockImplementation(getDailyForecastSpy)
  resolveCityModuleSpy.mockImplementation(resolveCitySpy)
  updateStateCityReferencesModuleSpy.mockImplementation(updateStateCityReferencesSpy)
  cityMatchesModuleSpy.mockImplementation(cityMatchesSpy)
  cityLabelModuleSpy.mockImplementation(cityLabelSpy)
  warningModuleSpy.mockImplementation(warningSpy)
  infoModuleSpy.mockImplementation(infoSpy)
  mutedModuleSpy.mockImplementation(mutedSpy)
  errorModuleSpy.mockImplementation(errorSpy)
  successModuleSpy.mockImplementation(successSpy)
  consoleLogSpy.mockImplementation(() => {})
})

describe("actions/weather-actions", () => {
  test("showDefaultCityWeather avisa cuando no hay ciudad default", async () => {
    const state: AppState = { defaultCity: null, cities: [], unit: "C" }

    await showDefaultCityWeather(state)

    expect(warningSpy).toHaveBeenCalledWith("No hay ciudad default configurada. Usa la opción 5 para establecerla.")
    expect(getCurrentWeatherSpy).not.toHaveBeenCalled()
  })

  test("showDefaultCityWeather consulta clima y actualiza referencias", async () => {
    const legacyCity: SavedCity = { name: "Madrid", latitude: Number.NaN, longitude: Number.NaN }
    const resolvedCity: SavedCity = { name: "Madrid", latitude: 40.4, longitude: -3.7 }
    const state: AppState = { defaultCity: legacyCity, cities: [legacyCity], unit: "C" }

    resolveCitySpy.mockResolvedValueOnce(resolvedCity as never)
    getCurrentWeatherSpy.mockResolvedValueOnce({ temperature: 22, unitLabel: "°C" } as never)

    await showDefaultCityWeather(state)

    expect(updateStateCityReferencesSpy).toHaveBeenCalledWith(state, legacyCity, resolvedCity)
    expect(getCurrentWeatherSpy).toHaveBeenCalledWith(40.4, -3.7, "C")
    expect(infoSpy).toHaveBeenCalled()
    const infoCalls = infoSpy.mock.calls as unknown[][]
    expect(String(infoCalls[0]?.[0])).toContain("Madrid")
    expect(String(infoCalls[0]?.[0])).toContain("22°C")
  })

  test("showAllCitiesWeather recorre ciudades y maneja no encontrada", async () => {
    const c1: SavedCity = { name: "Missing", latitude: Number.NaN, longitude: Number.NaN }
    const c2: SavedCity = { name: "Rome", latitude: Number.NaN, longitude: Number.NaN }
    const resolvedC2: SavedCity = { name: "Rome", latitude: 41.9, longitude: 12.5 }
    const state: AppState = { defaultCity: c1, cities: [c1, c2], unit: "F" }

    resolveCitySpy.mockResolvedValueOnce(null).mockResolvedValueOnce(resolvedC2 as never)
    cityMatchesSpy.mockReturnValue(false)
    getCurrentWeatherSpy.mockResolvedValueOnce({ temperature: 77, unitLabel: "°F" } as never)

    await showAllCitiesWeather(state)

    expect(warningSpy).toHaveBeenCalledWith("Missing: no encontrada")
    expect(state.cities[1]).toEqual(resolvedC2)
    expect(getCurrentWeatherSpy).toHaveBeenCalledWith(41.9, 12.5, "F")
    expect(infoSpy).toHaveBeenCalled()
    const infoCalls = infoSpy.mock.calls as unknown[][]
    expect(String(infoCalls[0]?.[0])).toContain("77°F")
  })

  test("showDefaultCityForecast muestra pronostico cuando hay datos", async () => {
    const city: SavedCity = { name: "Santiago", latitude: -33.4, longitude: -70.6 }
    const state: AppState = { defaultCity: city, cities: [city], unit: "C" }

    resolveCitySpy.mockResolvedValueOnce(city as never)
    getDailyForecastSpy.mockResolvedValueOnce({
      items: [
        { date: "2026-07-15", min: 8, max: 18 },
        { date: "2026-07-16", min: 9, max: 19 },
      ],
      unitLabel: "°C",
    } as never)

    await showDefaultCityForecast(state)

    expect(getDailyForecastSpy).toHaveBeenCalledWith(-33.4, -70.6, "C")
    expect(infoSpy).toHaveBeenCalledWith("Pronóstico 7 días: Santiago")
    expect(consoleLogSpy).toHaveBeenCalledTimes(2)
  })

  test("toggleUnit alterna entre C y F", () => {
    const state: AppState = { defaultCity: null, cities: [], unit: "C" }

    toggleUnit(state)
    expect(state.unit).toBe("F")
    expect(successSpy).toHaveBeenCalledWith("Unidad cambiada a °F.")

    toggleUnit(state)
    expect(state.unit).toBe("C")
    expect(successSpy).toHaveBeenCalledWith("Unidad cambiada a °C.")
  })
})

afterAll(() => {
  mock.restore()
})
