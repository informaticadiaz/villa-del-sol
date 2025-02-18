# Backend

```
villa-del-sol/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── ownerController.js       # Gestión de propietarios
│   │   │   ├── apartmentController.js   # Gestión de apartamentos
│   │   │   ├── visitorController.js     # Control de acceso de visitantes
│   │   │   ├── paymentController.js     # Gestión de pagos
│   │   │   └── reportController.js      # Generación de reportes
│   │   │
│   │   ├── models/
│   │   │   ├── Owner.js                 # Modelo de propietarios
│   │   │   ├── Apartment.js             # Modelo de apartamentos
│   │   │   ├── Visitor.js               # Modelo de visitantes
│   │   │   ├── Payment.js               # Modelo de pagos
│   │   │   └── User.js                  # Modelo de usuarios del sistema
│   │   │
│   │   ├── routes/
│   │   │   ├── ownerRoutes.js          # Rutas para gestión de propietarios
│   │   │   ├── apartmentRoutes.js      # Rutas para gestión de apartamentos
│   │   │   ├── visitorRoutes.js        # Rutas para control de acceso
│   │   │   ├── paymentRoutes.js        # Rutas para gestión de pagos
│   │   │   ├── reportRoutes.js         # Rutas para reportes
│   │   │   └── authRoutes.js           # Rutas de autenticación
│   │   │
│   │   ├── middleware/
│   │   │   ├── auth.js                 # Middleware de autenticación
│   │   │   ├── roleCheck.js            # Verificación de roles
│   │   │   ├── errorHandler.js         # Manejo global de errores
│   │   │   └── validate.js             # Validación de datos
│   │   │
│   │   ├── utils/
│   │   │   ├── database.js             # Configuración de la base de datos
│   │   │   ├── logger.js               # Utilidad para logging
│   │   │   ├── email.js                # Servicios de correo electrónico
│   │   │   └── validators/             # Validadores personalizados
│   │   │       ├── ownerValidator.js
│   │   │       ├── apartmentValidator.js 
│   │   │       └── paymentValidator.js
│   │   │
│   │   └── config/
│   │       ├── database.js             # Configuración de la base de datos
│   │       ├── email.js                # Configuración de correo
│   │       └── auth.js                 # Configuración de autenticación
│   │
│   ├── tests/
│   │   ├── unit/
│   │   │   ├── owners.test.js
│   │   │   ├── apartments.test.js
│   │   │   └── payments.test.js
│   │   │
│   │   └── integration/
│   │       ├── auth.test.js
│   │       └── api.test.js
│   │
│   ├── package.json
│   ├── .env
│   ├── .env.example
│   └── README.md
``
