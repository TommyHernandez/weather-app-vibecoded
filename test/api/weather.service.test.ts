import { afterAll, beforeEach, describe, expect, mock, test } from "bun:test"

import {
  geocodeCity,
  geocodeCityCandidates,
  getCurrentWeather,
  getDailyForecast,
} from "../../src/api/weather.service.ts"

const originalFetch = globalThis.fetch
const fetchMock = mock(async () => new Response())

beforeEach(() => {
  fetchMock.mockReset()
  globalThis.fetch = fetchMock as unknown as typeof fetch
})

afterAll(() => {
  globalThis.fetch = originalFetch
})

describe("weather.service", () => {
  test("geocodeCity devuelve el primer resultado y construye la URL esperada", async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ results: [{ name: "Madrid", latitude: 40.4, longitude: -3.7 }] }), { status: 200 }),
    )

    const result = await geocodeCity("San Jose")

    expect(result).toEqual({ name: "Madrid", latitude: 40.4, longitude: -3.7 })
    const requestUrl = String((fetchMock.mock.calls as unknown[][])[0]?.[0])
    expect(requestUrl).toContain("name=San%20Jose")
    expect(requestUrl).toContain("count=5")
    expect(requestUrl).toContain("language=es")
    expect(requestUrl).toContain("format=json")
  })

  test("geocodeCity devuelve null cuando la respuesta no es ok o no hay resultados", async () => {
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 500 }))
    expect(await geocodeCity("Bogota")).toBeNull()

    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify({ results: [] }), { status: 200 }))
    expect(await geocodeCity("Bogota")).toBeNull()
  })

  test("geocodeCityCandidates devuelve lista vacia cuando falla", async () => {
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 503 }))

    const result = await geocodeCityCandidates("Paris")
    expect(result).toEqual([])
  })

  test("geocodeCityCandidates devuelve los candidatos del payload", async () => {
    const payload = {
      results: [
        { name: "Paris", latitude: 48.8, longitude: 2.3, country: "France" },
        { name: "Paris", latitude: 33.6, longitude: -95.5, country: "United States" },
      ],
    }
    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify(payload), { status: 200 }))

    const result = await geocodeCityCandidates("Paris")
    expect(result).toEqual(payload.results)
  })

  test("getCurrentWeather aplica unidad F y usa fallback de etiqueta cuando falta current_units", async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ current: { temperature_2m: 72 } }), { status: 200 }),
    )

    const result = await getCurrentWeather(10, 20, "F")

    expect(result).toEqual({ temperature: 72, unitLabel: "°F" })
    const requestUrl = String((fetchMock.mock.calls as unknown[][])[0]?.[0])
    expect(requestUrl).toContain("temperature_unit=fahrenheit")
  })

  test("getCurrentWeather devuelve null cuando no hay current o response no ok", async () => {
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 404 }))
    expect(await getCurrentWeather(1, 2, "C")).toBeNull()

    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify({}), { status: 200 }))
    expect(await getCurrentWeather(1, 2, "C")).toBeNull()
  })

  test("getDailyForecast devuelve snapshot filtrado con etiqueta recibida", async () => {
    const payload = {
      daily: {
        time: ["2026-07-15", "2026-07-16", ""],
        temperature_2m_max: [30, 31, 99],
        temperature_2m_min: [20, 21, Number.NaN],
      },
      daily_units: {
        temperature_2m_max: "°C",
      },
    }
    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify(payload), { status: 200 }))

    const result = await getDailyForecast(40.4, -3.7, "C")

    expect(result).toEqual({
      items: [
        { date: "2026-07-15", max: 30, min: 20 },
        { date: "2026-07-16", max: 31, min: 21 },
      ],
      unitLabel: "°C",
    })
  })

  test("getDailyForecast devuelve null si faltan bloques de daily o response no ok", async () => {
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 500 }))
    expect(await getDailyForecast(1, 2, "C")).toBeNull()

    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify({ daily: { time: [] } }), { status: 200 }))
    expect(await getDailyForecast(1, 2, "C")).toBeNull()
  })
})
