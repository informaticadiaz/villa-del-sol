# Configuracion

## Directorios y Dependencias

### Crear la estructura base del proyecto

mkdir -p villa-del-sol/backend/src/{controllers,models,routes,middleware,utils,config}
mkdir -p villa-del-sol/backend/tests/{unit,integration}

### Moverse al directorio del backend

cd villa-del-sol/backend

### Inicializar proyecto de Node.js

npm init -y

### Instalar dependencias principales

npm install express dotenv cors helmet jsonwebtoken bcryptjs mongoose express-validator

### Instalar dependencias de desarrollo

npm install --save-dev nodemon jest supertest

### Crear archivos base

touch src/server.js
touch .env .env.example
touch README.md

### Crear archivos principales en cada directorio

touch src/controllers/{ownerController,apartmentController,visitorController,paymentController,reportController}.js
touch src/models/{Owner,Apartment,Visitor,Payment,User}.js
touch src/routes/{ownerRoutes,apartmentRoutes,visitorRoutes,paymentRoutes,reportRoutes,authRoutes}.js
touch src/middleware/{auth,roleCheck,errorHandler,validate}.js
touch src/utils/{database,logger,email}.js
touch src/config/{database,email,auth}.js

## Configurar package.json

```json
{
  "name": "villa-del-sol-backend",
  "version": "1.0.0",
  "description": "Backend para el sistema de administración del conjunto residencial Villa del Sol",
  "main": "src/server.js",
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js",
    "test": "jest",
    "test:watch": "jest --watch",
    "lint": "eslint ."
  },
  "keywords": ["villa-del-sol", "administracion", "conjunto-residencial"],
  "author": "",
  "license": "ISC"
}
```

## Configurar Servidor

```js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoose = require('mongoose');

// Importar rutas
const ownerRoutes = require('./routes/ownerRoutes');
const apartmentRoutes = require('./routes/apartmentRoutes');
const visitorRoutes = require('./routes/visitorRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const reportRoutes = require('./routes/reportRoutes');
const authRoutes = require('./routes/authRoutes');

// Importar middleware
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Middleware básico
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas
app.use('/api/owners', ownerRoutes);
app.use('/api/apartments', apartmentRoutes);
app.use('/api/visitors', visitorRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/auth', authRoutes);

// Manejo de errores
app.use(errorHandler);

// Conexión a la base de datos
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('Conectado a MongoDB'))
  .catch((err) => console.error('Error conectando a MongoDB:', err));

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
```

## Variables de entorno

### Configuración del servidor

PORT=3000
NODE_ENV=development

### Base de datos

MONGODB_URI=mongodb://localhost:27017/villa-del-sol

### JWT

JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=24h

### Email (si se implementa el servicio de correo)

SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASS=your-email-password
