import { Sequelize } from 'sequelize';
import 'dotenv/config';

// Configuración de entorno
const isProduction = process.env.NODE_ENV === 'production';

// Configuración base de Sequelize
const config = {
  dialect: 'postgres',
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  
  // Configuración del pool de conexiones
  pool: {
    max: 5, // máximo de conexiones en el pool
    min: 0, // mínimo de conexiones en el pool
    acquire: 30000, // tiempo máximo, en milisegundos, para obtener una conexión antes de lanzar un error
    idle: 10000 // tiempo máximo, en milisegundos, que una conexión puede estar inactiva antes de ser liberada
  },

  // Configuración SSL para producción
  dialectOptions: isProduction ? {
    ssl: {
      require: true,
      rejectUnauthorized: false // Necesario para Railway
    }
  } : {},

  // Opciones adicionales
  logging: isProduction ? false : console.log, // Desactivar logging en producción
  timezone: '-05:00', // Zona horaria para Colombia
  define: {
    timestamps: true, // Habilitar timestamps automáticos (createdAt, updatedAt)
    underscored: true, // Usar snake_case en lugar de camelCase para nombres de columnas
    freezeTableName: true // Evitar que Sequelize modifique los nombres de las tablas
  }
};

// Crear instancia de Sequelize
let sequelize;

if (isProduction && process.env.DATABASE_URL) {
  // Usar URL de conexión en producción (Railway proporciona DATABASE_URL)
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    ...config,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  });
} else {
  // Usar configuración local en desarrollo
  sequelize = new Sequelize(config);
}

// Función para probar la conexión
export const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('Conexión a la base de datos establecida correctamente.');
    return true;
  } catch (error) {
    console.error('Error al conectar a la base de datos:', error);
    return false;
  }
};

// Exportar la instancia de Sequelize
export default sequelize;