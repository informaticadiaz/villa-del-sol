# Cambios Necesarios para Migrar a PostgreSQL en Railway

## 🗂 Estructura Actual vs Nueva

### 📁 Modelos (Cambios Mayores)

#### `src/models/Owner.js`

**Cambios necesarios:**

- Reemplazar `mongoose.Schema` por `Sequelize.Model`
- Actualizar tipos de datos para PostgreSQL
- Modificar la definición de relaciones
- Actualizar validadores

#### `src/models/Apartment.js`

**Cambios necesarios:**

- Convertir referencias ObjectId a llaves foráneas
- Adaptar enums para PostgreSQL
- Actualizar índices y constraints
- Modificar timestamps

#### `src/models/Visitor.js`

**Cambios necesarios:**

- Adaptar tipos de datos temporales
- Convertir referencias a llaves foráneas
- Actualizar definición de índices
- Modificar manejo de timestamps

#### `src/models/Payment.js`

**Cambios necesarios:**

- Adaptar tipos monetarios para PostgreSQL
- Convertir referencias a llaves foráneas
- Actualizar enums de estado y método de pago
- Modificar índices para búsquedas frecuentes

#### `src/models/User.js`

**Cambios necesarios:**

- Adaptar manejo de contraseñas y hooks
- Convertir métodos de modelo
- Actualizar validaciones
- Modificar manejo de tokens

### 📁 Configuración (Cambios Críticos)

#### `src/config/database.js`

```javascript
// Reemplazar configuración de MongoDB por:
- Configuración de Sequelize
- Opciones de conexión PostgreSQL
- Parámetros de pool de conexiones
- Configuración SSL
```

#### `.env`

```env
// Actualizar variables:
- MONGODB_URI → DATABASE_URL
- Agregar variables específicas de Railway
- Configurar variables de conexión PostgreSQL
```

### 📁 Controladores (Cambios Moderados)

#### `src/controllers/authController.js`

**Actualizaciones necesarias:**

- Modificar queries de autenticación
- Adaptar manejo de sesiones
- Actualizar manejo de tokens
- Modificar validaciones de usuario

#### `src/controllers/ownerController.js`

**Actualizaciones necesarias:**

- Convertir queries de Mongoose a Sequelize
- Adaptar population a includes
- Modificar agregaciones
- Actualizar transacciones

#### `src/controllers/apartmentController.js`

**Actualizaciones necesarias:**

- Actualizar búsquedas y filtros
- Adaptar relaciones y joins
- Modificar actualizaciones en masa
- Convertir queries complejas

#### `src/controllers/visitorController.js`

**Actualizaciones necesarias:**

- Adaptar queries temporales
- Modificar búsquedas por rango
- Actualizar estadísticas
- Convertir agregaciones

#### `src/controllers/paymentController.js`

**Actualizaciones necesarias:**

- Adaptar queries monetarias
- Modificar cálculos y sumatorias
- Actualizar reportes
- Convertir agregaciones complejas

#### `src/controllers/reportController.js`

**Actualizaciones necesarias:**

- Reescribir queries de agregación
- Adaptar generación de reportes
- Modificar cálculos estadísticos
- Optimizar consultas complejas

### 📁 Middleware (Cambios Menores)

#### `src/middleware/auth.js`

**Actualizaciones necesarias:**

- Adaptar verificación de tokens
- Modificar validación de roles
- Actualizar manejo de sesiones

#### `src/middleware/validate.js`

**Actualizaciones necesarias:**

- Adaptar validadores para PostgreSQL
- Modificar verificación de relaciones
- Actualizar validaciones de datos

### 📁 Utilidades (Cambios Menores)

#### `src/utils/database.js`

**Actualizaciones necesarias:**

- Implementar conexión Sequelize
- Configurar pooling
- Agregar manejo de errores
- Implementar logging

### 📝 Documentación

#### `README.md`

**Actualizaciones necesarias:**

- Actualizar requisitos
- Modificar instrucciones de instalación
- Actualizar variables de entorno
- Agregar configuración de Railway

## 🔄 Orden Sugerido de Migración

1. Configuración de base de datos
2. Modelos
3. Utilidades
4. Middleware
5. Controladores
6. Documentación

## ⚠️ Puntos de Atención

1. **Backup de Datos**
   - Realizar respaldo completo antes de migrar
   - Verificar integridad de datos
   - Mantener versión de MongoDB funcionando

2. **Testing**
   - Actualizar pruebas unitarias
   - Verificar integridad referencial
   - Probar queries complejas
   - Validar performance

3. **Deployment**
   - Configurar Railway
   - Verificar variables de entorno
   - Probar en staging
   - Planificar ventana de mantenimiento

## 📋 Checklist de Verificación

- [ ] Backup realizado
- [ ] Modelos actualizados
- [ ] Controladores adaptados
- [ ] Middleware modificado
- [ ] Tests actualizados
- [ ] Documentación al día
- [ ] Railway configurado
- [ ] Pruebas completadas
