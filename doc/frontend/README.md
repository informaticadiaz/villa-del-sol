# Guía de Estructura del Frontend - Villa del Sol

## Introducción

Este documento proporciona una visión general de la estructura del frontend del sistema de administración Villa del Sol. La arquitectura está diseñada utilizando Next.js y sigue una organización modular pensada en la escalabilidad y mantenibilidad del código.

## Estructura General

### 📁 Componentes (`/src/components`)

La aplicación está organizada en componentes reutilizables divididos en las siguientes categorías:

#### Componentes Comunes (`/common`)

Elementos de UI reutilizables en toda la aplicación:

- Botones
- Tarjetas
- Tablas
- Campos de entrada
- Ventanas modales
- Barra lateral
- Barra de navegación

#### Componentes por Módulo

Organizados según la funcionalidad del sistema:

- **Propietarios** (`/owners`)
  - Formularios de propietarios
  - Listados
  - Detalles

- **Apartamentos** (`/apartments`)
  - Formularios de apartamentos
  - Listados
  - Estado de apartamentos

- **Visitantes** (`/visitors`)
  - Registro de visitantes
  - Listados
  - Historial de visitas

- **Pagos** (`/payments`)
  - Formularios de pago
  - Historial
  - Resúmenes

- **Reportes** (`/reports`)
  - Generador de reportes
  - Visualizador

### 📁 Páginas (`/src/pages`)

Estructura de rutas de Next.js:

- Página principal (`index.js`)
- Login (`login.js`)
- Dashboard (`/dashboard`)
- Secciones específicas:
  - Propietarios
  - Apartamentos
  - Visitantes
  - Pagos
  - Reportes

### 📁 Estilos (`/src/styles`)

- Estilos globales
- Temas (claro/oscuro)

### 📁 Utilidades (`/src/utils`)

#### API (`/api`)

Funciones para comunicación con el backend:

- Propietarios
- Apartamentos
- Visitantes
- Pagos

#### Otras Utilidades

- Autenticación
- Validación
- Formateadores

### 📁 Hooks Personalizados (`/src/hooks`)

Lógica reutilizable:

- `useAuth`: Gestión de autenticación
- `usePagination`: Control de paginación
- `useForm`: Manejo de formularios

### 📁 Contextos (`/src/context`)

Estado global:

- Contexto de autenticación
- Contexto de tema

### 📁 Configuración (`/src/config`)

Archivos de configuración:

- Constantes
- Rutas
- Configuración de API

## Guía de Desarrollo

### 1. Creación de Nuevos Componentes

Al crear nuevos componentes:

1. Ubicarlos en la carpeta correspondiente según su propósito
2. Mantener la estructura modular
3. Seguir el patrón de organización existente

### 2. Manejo de Estado

- Usar hooks de React para estado local
- Utilizar contextos para estado global
- Implementar custom hooks para lógica reutilizable

### 3. Estilos

- Utilizar Tailwind CSS para estilos
- Mantener consistencia con el sistema de diseño
- Seguir el patrón de temas claro/oscuro

### 4. Mejores Prácticas

1. Mantener los componentes pequeños y enfocados
2. Reutilizar componentes comunes
3. Documentar componentes complejos
4. Seguir las convenciones de nombres establecidas
5. Implementar manejo de errores consistente

## Notas de Seguridad

- Implementar validación en todos los formularios
- Manejar adecuadamente los tokens de autenticación
- Proteger rutas sensibles
- Validar datos antes de enviarlos al backend

## Recursos Adicionales

- Documentación de Next.js
- Guía de Tailwind CSS
- Convenciones de código del equipo
- Sistema de diseño del proyecto
