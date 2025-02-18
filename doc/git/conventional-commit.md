# Introducción a Conventional Commits

Los Conventional Commits son una especificación para dar significado a los mensajes de los commits mediante la adición de un conjunto simple de reglas. Esta convención se integra con SemVer (Versionado Semántico), describiendo las características, correcciones y cambios importantes realizados en los mensajes de los commits.

## ¿Por qué usar Conventional Commits?

La adopción de Conventional Commits proporciona varios beneficios significativos:

### Para Desarrolladores

- Comunica claramente la naturaleza de los cambios
- Simplifica la navegación a través del historial de git
- Ayuda a mantener un historial de cambios limpio y significativo
- Facilita la contribución a proyectos al proporcionar una estructura estándar

### Para Equipos

- Generación automática de CHANGELOGs
- Determinación automática de cambios de versión semántica
- Comunicación clara de la naturaleza de los cambios al resto del equipo
- Facilita el proceso de revisión de código
- Mejora la trazabilidad de las características y correcciones

### Para Proyectos

- Historial de proyecto más organizado y comprensible
- Mejor documentación automática
- Facilita la adopción de versionado semántico
- Mejora la mantenibilidad a largo plazo

## Estructura Básica

Un mensaje de commit convencional tiene la siguiente estructura:

```git
<tipo>[alcance opcional]: <descripción>

[cuerpo opcional]

[notas de pie opcionales]
```

### Ejemplo Simple

```git
feat: permite que el objeto de configuración acepte un valor de tiempo de espera
```

### Ejemplo Completo

```git
feat(api)!: envía un email al administrador cuando un nuevo usuario se registra

- Implementa el servicio de envío de emails
- Configura las plantillas de email
- Añade variables de entorno necesarias

BREAKING CHANGE: La función registerUser ahora devuelve una promesa
```

## Tipos Principales

Los tipos más comunes son:

- `feat`: Nueva característica
- `fix`: Corrección de un error
- `docs`: Cambios en documentación
- `style`: Cambios que no afectan el significado del código
- `refactor`: Cambio de código que no corrige un error ni añade una característica
- `test`: Añadir o corregir pruebas
- `chore`: Cambios en el proceso de build o herramientas auxiliares

## Comenzando con Conventional Commits

### Paso 1: Comprende la Estructura

Familiarízate con la estructura básica y los tipos principales de commits.

### Paso 2: Instala Herramientas de Ayuda

Considera usar herramientas como:

- commitlint: Para validar tus mensajes de commit
- commitizen: Para crear commits interactivamente
- husky: Para configurar git hooks

### Paso 3: Configura tu Proyecto

Añade un archivo de configuración para commitlint:

```json
{
  "extends": ["@commitlint/config-conventional"]
}
```

### Paso 4: Práctica

Comienza con commits simples y gradualmente incorpora más elementos de la especificación.

## Mejores Prácticas

1. **Sé Descriptivo pero Conciso**
   - La descripción debe ser clara y concisa
   - Usa verbos en imperativo
   - Mantén la primera línea en menos de 50 caracteres

2. **Usa el Alcance Apropiadamente**
   - El alcance debe ser un sustantivo que describe la sección del código afectada
   - Mantén los alcances consistentes en todo el proyecto

3. **Breaking Changes**
   - Marca los cambios importantes con `!` después del tipo/alcance
   - Incluye `BREAKING CHANGE:` en el pie del commit
   - Proporciona una explicación clara del cambio y la migración necesaria

4. **Referencias a Issues**
   - Incluye referencias a issues cuando sea relevante
   - Usa palabras clave como "Fixes", "Closes", o "Relates to"

## Recursos Adicionales

- [Especificación Oficial](https://www.conventionalcommits.org/)
- [Angular Commit Guidelines](https://github.com/angular/angular/blob/master/CONTRIBUTING.md#commit)
- [Semantic Versioning](https://semver.org/)

## Conclusión

Los Conventional Commits proporcionan una manera estructurada y estandarizada de documentar los cambios en tu código. Al adoptar esta convención, mejoras la mantenibilidad de tu proyecto y facilitas la colaboración entre desarrolladores. Comienza con los conceptos básicos y gradualmente incorpora más aspectos de la especificación a medida que te sientas más cómodo con ella.
