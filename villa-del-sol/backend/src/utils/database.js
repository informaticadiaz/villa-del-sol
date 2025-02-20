// /src/utils/database.js
import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

// Obtener variables de entorno de Railway
const {
    PGHOST,
    PGPORT,
    PGDATABASE,
    PGUSER,
    PGPASSWORD,
    DATABASE_URL,
    NODE_ENV
} = process.env;

// Crear instancia de Sequelize usando DATABASE_URL
const sequelize = new Sequelize(DATABASE_URL, {
    dialect: 'postgres',
    logging: NODE_ENV === 'development' ? 
        (msg) => console.log(`[DATABASE] ${msg}`) : 
        false,
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false
        },
        connectTimeout: 10000
    },
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    },
    retry: {
        max: 3,
        match: [
            /SequelizeConnectionError/,
            /SequelizeConnectionRefusedError/,
            /SequelizeHostNotFoundError/,
            /SequelizeHostNotReachableError/,
            /SequelizeInvalidConnectionError/,
            /SequelizeConnectionTimedOutError/
        ],
        backoffBase: 1000,
        backoffExponent: 1.5
    }
});

// Función mejorada para probar la conexión
const testConnection = async () => {
    try {
        await sequelize.authenticate();
        console.log('[DATABASE] Conexión establecida correctamente.');
        
        // Información adicional de la conexión
        const poolInfo = await sequelize.connectionManager.getConnection();
        console.log('[DATABASE] Pool de conexiones inicializado.');
        console.log(`[DATABASE] Dialect: ${sequelize.getDialect()}`);
        console.log(`[DATABASE] Database: ${PGDATABASE}`);
        console.log(`[DATABASE] Host: ${PGHOST}`);
        console.log(`[DATABASE] Port: ${PGPORT}`);
        
        await sequelize.connectionManager.releaseConnection(poolInfo);
    } catch (error) {
        console.error('[DATABASE] Error de conexión:', error.message);
        if (error.original) {
            console.error('[DATABASE] Error original:', error.original);
        }
        if (NODE_ENV === 'development') {
            console.error('[DATABASE] Stack trace:', error.stack);
        }
        // Propagar el error para manejo superior
        throw error;
    }
};

// Ejecutar prueba de conexión
testConnection();

export default sequelize;