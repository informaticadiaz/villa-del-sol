import express from 'express';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import cors from 'cors';
import helmet from 'helmet';
import sequelize, { testConnection } from './config/database.js';

// Obtener la ruta del directorio actual
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Cargar variables de entorno de manera explícita
const result = dotenv.config({ path: join(__dirname, '../.env') });

if (result.error) {
  console.error('\n❌ Error al cargar el archivo .env:');
  console.error(result.error);
  process.exit(1);
}

// Función para verificar variables de entorno requeridas
const checkRequiredEnvVars = () => {
  const required = [
    'DATABASE_URL',
    'PGHOST',
    'PGPORT',
    'PGDATABASE',
    'PGUSER',
    'PGPASSWORD'
  ];
  
  const missing = required.filter(var_ => !process.env[var_]);
  
  if (missing.length > 0) {
    console.error('\n❌ Error: Variables de entorno faltantes:');
    missing.forEach(var_ => {
      console.error(`- ${var_} (${process.env[var_] === undefined ? 'undefined' : 'valor vacío'})`);
    });
    console.error('\nValores actuales:');
    required.forEach(var_ => {
      console.log(`${var_}: ${process.env[var_] || 'no definido'}`);
    });
    process.exit(1);
  }
};

// Diagnóstico de variables de entorno
const printEnvDiagnostics = () => {
  console.log('\n🔍 Diagnóstico de variables de entorno:');
  console.log('DATABASE_URL:', process.env.DATABASE_URL ? '✅ Definida' : '❌ No definida');
  console.log('PGHOST:', process.env.PGHOST || '❌ No definido');
  console.log('PGPORT:', process.env.PGPORT || '❌ No definido');
  console.log('PGDATABASE:', process.env.PGDATABASE || '❌ No definido');
  console.log('PGUSER:', process.env.PGUSER ? '✅ Definido' : '❌ No definido');
  console.log('NODE_ENV:', process.env.NODE_ENV || 'development');
  console.log('\n');
};

// Verificar variables de entorno antes de continuar
checkRequiredEnvVars();
printEnvDiagnostics();

const app = express();

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Inicializar base de datos
const initializeDatabase = async () => {
  try {
    console.log('🔌 Intentando conectar a la base de datos...');
    await testConnection();
    
    if (process.env.NODE_ENV === 'development') {
      console.log('🔄 Iniciando sincronización de modelos...');
      await sequelize.sync({ alter: true });
      console.log('✅ Modelos sincronizados con la base de datos');
    }
    return true;
  } catch (error) {
    console.error('\n❌ Error al inicializar la base de datos:');
    console.error('Tipo de error:', error.name);
    console.error('Mensaje:', error.message);
    if (error.original) {
      console.error('\nError original:');
      console.error('Código:', error.original.code);
      console.error('Errno:', error.original.errno);
      console.error('Syscall:', error.original.syscall);
      console.error('Host:', error.original.address);
      console.error('Puerto:', error.original.port);
    }
    return false;
  }
};

// Manejador de errores global
app.use((err, req, res, next) => {
  console.error('❌ Error:', err);
  res.status(500).json({
    success: false,
    message: 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Función para iniciar el servidor
const startServer = async () => {
  const dbInitialized = await initializeDatabase();
  
  if (!dbInitialized) {
    console.error('❌ No se pudo inicializar la base de datos. Saliendo...');
    process.exit(1);
  }

  const PORT = process.env.PORT || 3001;
  
  try {
    const server = app.listen(PORT, () => {
      console.log(`\n🚀 Servidor corriendo en el puerto ${PORT}`);
      console.log(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
    });

    // Manejar errores del servidor
    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`❌ El puerto ${PORT} está en uso. Por favor, especifica otro puerto en la variable de entorno PORT.`);
        process.exit(1);
      } else {
        console.error('❌ Error al iniciar el servidor:', error);
        process.exit(1);
      }
    });
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

// Iniciar servidor
startServer();

export default app;