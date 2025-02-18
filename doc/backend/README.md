# Guía de Estructura del Backend - Villa del Sol

## Introducción

Este documento proporciona una visión general de la estructura del backend del sistema de administración Villa del Sol. La arquitectura está diseñada siguiendo principios de modularidad y separación de responsabilidades.

## Estructura General

El proyecto sigue una arquitectura modular organizada en los siguientes directorios principales:

### Directorio `src/`

Este es el corazón del backend, donde reside toda la lógica de la aplicación.

#### 📁 Controllers

Contiene la lógica de negocio principal:

- `ownerController.js`: Gestiona las operaciones relacionadas con propietarios
- `apartmentController.js`: Maneja la lógica de gestión de apartamentos
- `visitorController.js`: Controla el registro y gestión de visitantes
- `paymentController.js`: Administra las operaciones de pagos
- `reportController.js`: Genera los diferentes tipos de reportes

#### 📁 Models

Define la estructura de datos y las relaciones:

- `Owner.js`: Modelo para propietarios
- `Apartment.js`: Modelo para apartamentos
- `Visitor.js`: Modelo para visitantes
- `Payment.js`: Modelo para pagos
- `User.js`: Modelo para usuarios del sistema

#### 📁 Routes

Define los endpoints de la API:

- `ownerRoutes.js`: Rutas para gestión de propietarios
- `apartmentRoutes.js`: Rutas para gestión de apartamentos
- `visitorRoutes.js`: Rutas para control de acceso
- `paymentRoutes.js`: Rutas para gestión de pagos
- `reportRoutes.js`: Rutas para generación de reportes
- `authRoutes.js`: Rutas para autenticación

#### 📁 Middleware

Componentes intermedios para el procesamiento de solicitudes:

- `auth.js`: Verifica la autenticación
- `roleCheck.js`: Valida los roles y permisos
- `errorHandler.js`: Maneja errores de forma centralizada
- `validate.js`: Valida datos de entrada

#### 📁 Utils

Herramientas y utilidades:

- `database.js`: Configuración de la base de datos
- `logger.js`: Sistema de registro de eventos
- `email.js`: Servicios de correo electrónico
- `validators/`: Validadores personalizados por entidad

#### 📁 Config

Archivos de configuración:

- `database.js`: Configuración de la base de datos
- `email.js`: Configuración del servicio de correo
- `auth.js`: Configuración de autenticación

### Directorio `tests/`

Organización de pruebas:

- `unit/`: Pruebas unitarias por módulo
- `integration/`: Pruebas de integración

## Archivos de Configuración

### En la raíz del proyecto

- `package.json`: Dependencias y scripts del proyecto
- `.env`: Variables de entorno (no versionado)
- `.env.example`: Ejemplo de variables de entorno
- `README.md`: Documentación principal del proyecto

## Guía de Desarrollo

1. **Nuevas Funcionalidades**
   - Crear el modelo correspondiente en `/models`
   - Implementar el controlador en `/controllers`
   - Definir las rutas en `/routes`
   - Agregar validaciones necesarias en `/validators`

2. **Pruebas**
   - Implementar pruebas unitarias en `/tests/unit`
   - Agregar pruebas de integración en `/tests/integration`

3. **Manejo de Errores**
   - Utilizar el errorHandler global
   - Implementar try-catch en los controladores
   - Usar el sistema de logging para debug

## Mejores Prácticas

1. Mantener la separación de responsabilidades
2. Documentar nuevos endpoints y funcionalidades
3. Seguir el patrón de manejo de errores establecido
4. Implementar pruebas para nuevas características
5. Utilizar las utilidades compartidas del directorio `utils`

## Notas de Seguridad

- Todas las rutas sensibles deben usar el middleware de autenticación
- Implementar validación de datos en todas las entradas
- Usar el sistema de roles para controlar el acceso
- Mantener las variables sensibles en el archivo .env
