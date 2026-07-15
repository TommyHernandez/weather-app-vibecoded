# Bun Testing Best Practices (Weather CLI)

Esta guia resume practicas adoptadas para mantener una suite de tests rapida, estable y facil de extender.

## Configuracion base

- Definir un `bunfig.toml` con `[test]` y `root = "test"` para centralizar discovery.
- Usar `preload = ["./test/preload.ts"]` para inicializacion y limpieza global de mocks.
- Activar `rerunEach = 3` para detectar flaky tests tempranamente.
- Activar cobertura nativa (`coverage = true`, `coverageReporter = ["text", "lcov"]`) sin dependencias externas.
- Excluir archivos de test de cobertura con `coverageSkipTestFiles = true`.

## Mocks y aislamiento

- Preferir `mock.module()` para dependencias externas o efectos laterales (API, almacenamiento, I/O).
- Cuando se mockea por modulo, importar el SUT dinamicamente despues de registrar mocks.
- Limpiar estado entre tests con `mock.restore()` y `mock.clearAllMocks()` en `afterEach` global.
- Evitar estado global mutable compartido entre archivos; Bun ejecuta tests en paralelo por defecto.

## Estructura recomendada

- `test/api/` para contratos de servicios y parsing de respuestas.
- `test/actions/` para flujos de negocio (paths de exito + errores).
- `test/storage/` para persistencia, saneamiento y compatibilidad legacy.
- Nombrar archivos como `*.test.ts` y agrupar casos con `describe` por modulo.

## Estilo de casos

- Cubrir casos felices y errores de red/payload en cada unidad critica.
- Incluir validaciones de borde (indices invalidos, arrays vacios, nulls/NaN).
- Verificar llamadas importantes (argumentos de API, actualizaciones de estado, mensajes clave).
- Mantener tests deterministas, sin reloj real ni dependencia de servicios externos.

## Comandos utiles

- `bun test` - ejecucion normal.
- `bun test --watch` - feedback rapido durante desarrollo.
- `bun test --coverage` - reporte de cobertura nativo.
