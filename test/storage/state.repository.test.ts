import { afterAll, beforeEach, describe, expect, mock, test } from "bun:test"

import { loadState, saveState } from "../../src/storage/state.repository.ts"

const originalBunFile = Bun.file
const originalBunWrite = Bun.write
const bunFileMock = mock(() => ({ text: async () => "" }))
const bunWriteMock = mock(async () => 0)

beforeEach(() => {
  bunFileMock.mockReset()
  bunWriteMock.mockReset()
  Bun.file = bunFileMock as unknown as typeof Bun.file
  Bun.write = bunWriteMock as unknown as typeof Bun.write
})

afterAll(() => {
  Bun.file = originalBunFile
  Bun.write = originalBunWrite
})

describe("storage/state.repository", () => {
  test("loadState devuelve estado default si no existe archivo o JSON invalido", async () => {
    bunFileMock.mockReturnValueOnce({
      text: async () => {
        throw new Error("missing")
      },
    } as unknown as ReturnType<typeof Bun.file>)

    expect(await loadState()).toEqual({ defaultCity: null, cities: [], unit: "C" })

    bunFileMock.mockReturnValueOnce({
      text: async () => "{not-json}",
    } as unknown as ReturnType<typeof Bun.file>)

    expect(await loadState()).toEqual({ defaultCity: null, cities: [], unit: "C" })
  })

  test("loadState sanea formato legacy y valores invalidos", async () => {
    const rawState = {
      defaultCity: "  Madrid  ",
      cities: [
        "Bogota",
        { name: "  ", latitude: 1, longitude: 2 },
        { name: "Lima", latitude: -12.04, longitude: -77.03, admin1: "Lima", country: "Peru", country_code: "PE" },
        { name: "Quito", latitude: "bad", longitude: null },
      ],
      unit: "BAD",
    }

    bunFileMock.mockReturnValueOnce({
      text: async () => JSON.stringify(rawState),
    } as unknown as ReturnType<typeof Bun.file>)

    const state = await loadState()

    expect(state.defaultCity?.name).toBe("Madrid")
    expect(state.defaultCity?.latitude).toBeNaN()
    expect(state.defaultCity?.longitude).toBeNaN()
    expect(state.cities).toHaveLength(3)
    expect(state.cities[0]?.name).toBe("Bogota")
    expect(state.cities[0]?.latitude).toBeNaN()
    expect(state.cities[0]?.longitude).toBeNaN()
    expect(state.cities[1]).toEqual({
      name: "Lima",
      latitude: -12.04,
      longitude: -77.03,
      admin1: "Lima",
      country: "Peru",
      country_code: "PE",
    })
    expect(state.cities[2]?.name).toBe("Quito")
    expect(state.cities[2]?.latitude).toBeNaN()
    expect(state.cities[2]?.longitude).toBeNaN()
    expect(state.unit).toBe("C")
  })

  test("loadState acepta unidad F", async () => {
    bunFileMock.mockReturnValueOnce({
      text: async () => JSON.stringify({ defaultCity: null, cities: [], unit: "F" }),
    } as unknown as ReturnType<typeof Bun.file>)

    const state = await loadState()
    expect(state.unit).toBe("F")
  })

  test("saveState escribe JSON pretty en disco", async () => {
    bunWriteMock.mockResolvedValueOnce(42)

    await saveState({
      defaultCity: { name: "Rome", latitude: 41.9, longitude: 12.5 },
      cities: [{ name: "Rome", latitude: 41.9, longitude: 12.5 }],
      unit: "C",
    })

    expect(bunWriteMock).toHaveBeenCalledTimes(1)
    const calls = bunWriteMock.mock.calls as unknown[][]
    expect(calls[0]?.[0]).toBe("./weather-data.json")
    const written = String(calls[0]?.[1])
    expect(written).toContain("\n  \"cities\": [")
  })
})
