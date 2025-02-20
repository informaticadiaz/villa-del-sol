import { errorHandler } from './middleware/errorHandler.js';
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { sequelize } from './utils/database.js';

// Importar rutas
import ownerRoutes from './routes/ownerRoutes.js';
import apartmentRoutes from './routes/apartmentRoutes.js';
import visitorRoutes from './routes/visitorRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import authRoutes from './routes/authRoutes.js';

// Importar modelos para asegurar que se registren
import './models/index.js';

dotenv.config();

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

// Función para inicializar la base de datos
const initializeDatabase = async () => {
  try {
    // Verificar la conexión
    await sequelize.authenticate();
    console.log('Conexión a PostgreSQL establecida correctamente.');

    // Sincronizar modelos con la base de datos
    // En producción, usar { force: false }
    await sequelize.sync({ alter: true });
    console.log('Modelos sincronizados con la base de datos.');
    
  } catch (error) {
    console.error('Error al inicializar la base de datos:', error);
    process.exit(1);
  }
};

const startServer = async () => {
  try {
    // Inicializar la base de datos
    await initializeDatabase();

    const PORT = process.env.PORT || 3000;
    
    app.listen(PORT, () => {
      console.log(`Servidor corriendo en el puerto ${PORT}`);
    });
  } catch (error) {
    console.error('Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

// Manejo de errores no capturados
process.on('unhandledRejection', (err) => {
  console.error('Error no manejado:', err);
  // Cerrar el servidor y salir
  process.exit(1);
});

startServer();