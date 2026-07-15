import { describe, expect, test } from "bun:test"

import type { AppState, SavedCity } from "../../src/types/app.ts"
import {
  cityExists,
  cityLabel,
  cityMatches,
  hasCoordinates,
  isAffirmative,
  parseCityIndex,
  toSavedCity,
  updateStateCityReferences,
} from "../../src/actions/shared.ts"

describe("actions/shared", () => {
  test("hasCoordinates valida numeros finitos", () => {
    expect(hasCoordinates({ name: "A", latitude: 1, longitude: 2 })).toBe(true)
    expect(hasCoordinates({ name: "A", latitude: Number.NaN, longitude: 2 })).toBe(false)
  })

  test("cityLabel concatena nombre, region y pais", () => {
    const city: SavedCity = { name: "Santiago", latitude: 1, longitude: 2, admin1: "RM", country: "Chile" }
    expect(cityLabel(city)).toBe("Santiago, RM, Chile")
  })

  test("toSavedCity mapea geocoding result", () => {
    const result = toSavedCity({
      name: "Lima",
      latitude: -12.0464,
      longitude: -77.0428,
      admin1: "Lima",
      country: "Peru",
      country_code: "PE",
    })

    expect(result).toEqual({
      name: "Lima",
      latitude: -12.0464,
      longitude: -77.0428,
      admin1: "Lima",
      country: "Peru",
      country_code: "PE",
    })
  })

  test("cityMatches usa coordenadas cuando existen", () => {
    const a: SavedCity = { name: "X", latitude: 1, longitude: 2 }
    const b: SavedCity = { name: "Y", latitude: 1, longitude: 2 }
    const c: SavedCity = { name: "X", latitude: 3, longitude: 4 }

    expect(cityMatches(a, b)).toBe(true)
    expect(cityMatches(a, c)).toBe(false)
  })

  test("cityMatches cae a identidad textual normalizada si no hay coordenadas", () => {
    const a: SavedCity = { name: "  Quito ", latitude: Number.NaN, longitude: Number.NaN, admin1: "Pichincha", country: "ECUADOR" }
    const b: SavedCity = { name: "quito", latitude: Number.NaN, longitude: Number.NaN, admin1: "pichincha", country: "ecuador" }

    expect(cityMatches(a, b)).toBe(true)
  })

  test("cityExists detecta ciudad duplicada", () => {
    const existing: SavedCity = { name: "Bogota", latitude: 4.7, longitude: -74.1 }
    const state: AppState = { defaultCity: null, cities: [existing], unit: "C" }

    expect(cityExists(state, { name: "Bogota", latitude: 4.7, longitude: -74.1 })).toBe(true)
    expect(cityExists(state, { name: "Medellin", latitude: 6.2, longitude: -75.6 })).toBe(false)
  })

  test("isAffirmative reconoce s y si sin importar espacios/mayusculas", () => {
    expect(isAffirmative(" s ")).toBe(true)
    expect(isAffirmative("SI")).toBe(true)
    expect(isAffirmative("no")).toBe(false)
  })

  test("parseCityIndex valida rango y formato", () => {
    expect(parseCityIndex("1", 3)).toBe(0)
    expect(parseCityIndex("3", 3)).toBe(2)
    expect(parseCityIndex("0", 3)).toBeNull()
    expect(parseCityIndex("4", 3)).toBeNull()
    expect(parseCityIndex("abc", 3)).toBeNull()
  })

  test("updateStateCityReferences actualiza default y lista", () => {
    const previous: SavedCity = { name: "Old", latitude: Number.NaN, longitude: Number.NaN }
    const resolved: SavedCity = { name: "Old", latitude: 10, longitude: 20 }
    const state: AppState = {
      defaultCity: previous,
      cities: [previous, { name: "Other", latitude: 1, longitude: 2 }],
      unit: "C",
    }

    updateStateCityReferences(state, previous, resolved)

    expect(state.defaultCity).toEqual(resolved)
    expect(state.cities[0]).toEqual(resolved)
  })
})
