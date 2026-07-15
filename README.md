## Weather CLI APP

CLI de clima en Bun + TypeScript con Open-Meteo.

La app permite:

- Consultar el clima de la ciudad default.
- Consultar el clima de todas las ciudades guardadas.
- Buscar y agregar ciudades.
- Eliminar ciudades.
- Establecer ciudad default.
- Ver pronóstico de 7 días para la ciudad default.
- Cambiar unidades entre `°C` y `°F`.

Convención visual actual:

- Menú e información en cyan.
- Temperaturas destacadas en amarillo.
- Mensajes de éxito en verde.
- Mensajes de error en rojo.

## Stack

- Bun.js
- TypeScript
- Open-Meteo (Geocoding + Forecast)

## Instalar y ejecutar

```bash
bun install
bun run dev
```

Scripts disponibles:

- `bun run dev` - ejecuta la app en modo normal
- `bun run dev:hot` - ejecuta con hot reload
- `bun run build` - genera build en `dist/` (target Bun)
- `bun run start` - ejecuta `index.ts`

## Flujo de API

1. Geocoding para resolver ciudad a coordenadas (`count=5`).
2. Si hay ambigüedad, selección interactiva por número.
3. Forecast para consultar clima actual (`current=temperature_2m`).
4. Forecast diario para 7 días (`daily=temperature_2m_max,temperature_2m_min&forecast_days=7`).

Ejemplos:

```text
https://geocoding-api.open-meteo.com/v1/search?name=Ottawa&count=5&language=es&format=json
https://api.open-meteo.com/v1/forecast?latitude=45.41117&longitude=-75.69812&current=temperature_2m
https://api.open-meteo.com/v1/forecast?latitude=45.41117&longitude=-75.69812&daily=temperature_2m_max,temperature_2m_min&forecast_days=7
```

## Mejora implementada: ciudades ambiguas

Si el geocoding devuelve varias coincidencias (por ejemplo, nombres ambiguos), la app ahora:

1. Muestra una lista numerada con opciones (`ciudad, región, país`).
2. Permite elegir una opción por número.
3. Guarda la ciudad seleccionada con coordenadas para evitar consultas ambiguas posteriores.

## Estado persistido

Los datos se guardan en `weather-data.json` con estructura de ciudad enriquecida:

- `name`
- `latitude`
- `longitude`
- `admin1` (opcional)
- `country` (opcional)
- `country_code` (opcional)

La carga de estado mantiene compatibilidad con formatos anteriores.

## Pronóstico 7 días

La opción `6` del menú muestra el pronóstico de 7 días para la ciudad default.

- Usa temperaturas mínimas y máximas diarias.
- Respeta la unidad configurada (`°C` / `°F`).
- Si faltan coordenadas en una ciudad legacy, primero resuelve geocoding y actualiza el estado en memoria.

## Ejemplo de menú

```bash
════════════════════════════════════════
 __        __        _   _
 \ \      / /__  __ _| |_| |__   ___ _ __
  \ \ /\ / / _ \/ _` | __| '_ \ / _ \ '__|
   \ V  V /  __/ (_| | |_| | | |  __/ |
    \_/\_/ \___|\__,_|\__|_| |_|\___|_|
             CLI
════════════════════════════════════════
  1. Clima de ciudad default
  2. Clima de todas las ciudades (N)
  3. Buscar y agregar ciudad
  4. Eliminar ciudad
  5. Establecer ciudad default
  6. Pronóstico 7 días (default)
  8. Ajustes (°C)
  9. Salir
════════════════════════════════════════
```
