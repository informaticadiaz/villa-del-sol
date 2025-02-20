import { Sequelize } from 'sequelize';
import 'dotenv/config';

// Configuración de entorno
const isProduction = process.env.NODE_ENV === 'production';

// Configuración base de Sequelize
const config = {
  dialect: 'postgres',
  host: process.env.PGHOST,
  port: process.env.PGPORT,
  database: process.env.PGDATABASE,
  username: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  
  // Configuración del pool de conexiones
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },

  // Railway siempre requiere SSL
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  },

  // Opciones adicionales
  logging: isProduction ? false : console.log,
  timezone: '-05:00',
  define: {
    timestamps: true,
    underscored: true,
    freezeTableName: true
  }
};

// Crear instancia de Sequelize
let sequelize;

// Siempre usar DATABASE_URL si está disponible
if (process.env.DATABASE_URL) {
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
  // Configuración fallback usando parámetros individuales
  sequelize = new Sequelize(config);
}

// Función mejorada para probar la conexión
export const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida correctamente.');
    console.log(`📊 Base de datos: ${process.env.PGDATABASE}`);
    console.log(`🌐 Host: ${process.env.PGHOST}`);
    console.log(`🔌 Puerto: ${process.env.PGPORT}`);
    return true;
  } catch (error) {
    console.error('❌ Error al conectar a la base de datos:', error);
    if (error.original) {
      console.error('Error original:', error.original);
    }
    return false;
  }
};

// Exportar la instancia de Sequelize
export default sequelize;