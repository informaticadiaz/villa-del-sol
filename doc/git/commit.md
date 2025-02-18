# Conventional Commit

## Estructura Base

```git
<tipo>(<alcance>): <descripción corta>

[descripción larga, opcional]

[notas al pie, opcionales]
```

## Tipos de Commit

- `feat`: Nueva característica
- `fix`: Corrección de errores
- `docs`: Cambios en documentación
- `style`: Cambios que no afectan el código (espacios, formato, etc.)
- `refactor`: Restructuración del código sin cambios en funcionalidad
- `test`: Añadir o modificar pruebas
- `chore`: Tareas de mantenimiento, cambios en build, etc.
- `perf`: Mejoras de rendimiento
- `ci`: Cambios en integración continua
- `build`: Cambios que afectan el sistema de build o dependencias
- `revert`: Revierte un commit anterior

## Alcance

El alcance es opcional y representa la sección del proyecto afectada:

- `auth`
- `api`
- `core`
- `ui`
- `db`
- etc.

## Reglas para la Descripción Corta

1. No más de 50 caracteres
2. Usar verbos en imperativo ("añade", "actualiza", "corrige")
3. No capitalizar la primera letra
4. No punto final
5. Describir "qué" y "por qué" en lugar de "cómo"

## Ejemplos Prácticos

```git
feat(auth): añade autenticación con Google

- Implementa OAuth 2.0 para login con Google
- Añade middleware de autenticación
- Crea endpoints necesarios

Closes #123
```

```git
fix(api): corrige error en validación de fechas

El formato de fecha no consideraba la zona horaria del usuario,
causando inconsistencias en los registros.

Breaking change: el formato de fecha ahora requiere zona horaria
```

```git
refactor(core): simplifica lógica de procesamiento de pagos

- Elimina código duplicado
- Mejora el manejo de errores
- Añade logging para mejor debugging

Related to #456
```

## Notas Importantes

1. Si el commit resuelve un issue, incluir "Closes #XXX" o "Fixes #XXX"
2. Si es un breaking change, mencionarlo explícitamente
3. Usar viñetas para listar cambios múltiples
4. Mantener consistencia en el estilo a través del equipo
5. Si el cambio es complejo, usar la descripción larga para explicar el contexto

## Casos Especiales

### Revertir Commits

```git
revert: feat(auth): añade autenticación con Google

This reverts commit abc123def456...
```

### Breaking Changes

```git
feat(api)!: cambia formato de respuesta API

BREAKING CHANGE: El formato JSON ahora usa camelCase
en lugar de snake_case
```

### Múltiples Tipos

Si un commit abarca múltiples tipos, usar el más significativo:

```git
feat(core): implementa nuevo sistema de cache

- Añade nuevo sistema de cache
- Corrige bugs relacionados con el almacenamiento
- Actualiza documentación
```
