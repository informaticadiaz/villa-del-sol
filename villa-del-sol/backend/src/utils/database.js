import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

// Obtener variables de entorno
const {
    DB_HOST,
    DB_PORT,
    DB_NAME,
    DB_USER,
    DB_PASSWORD,
    NODE_ENV
} = process.env;

// Crear instancia de Sequelize
const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
    host: DB_HOST,
    port: DB_PORT,
    dialect: 'postgres',
    logging: NODE_ENV === 'development' ? 
        (msg) => console.log(`[DATABASE] ${msg}`) : 
        false,
    ssl: NODE_ENV === 'production',
    dialectOptions: {
        ssl: NODE_ENV === 'production' ? {
            require: true,
            rejectUnauthorized: false
        } : false,
        connectTimeout: 10000 // 10 segundos para timeout de conexión
    },
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    },
    retry: {
        max: 3, // Número máximo de intentos de reconexión
        match: [
            /SequelizeConnectionError/,
            /SequelizeConnectionRefusedError/,
            /SequelizeHostNotFoundError/,
            /SequelizeHostNotReachableError/,
            /SequelizeInvalidConnectionError/,
            /SequelizeConnectionTimedOutError/
        ],
        backoffBase: 1000, // Delay inicial entre intentos (1 segundo)
        backoffExponent: 1.5 // Factor de incremento para el delay entre intentos
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
        console.log(`[DATABASE] Database: ${DB_NAME}`);
        console.log(`[DATABASE] Host: ${DB_HOST}`);
        console.log(`[DATABASE] Port: ${DB_PORT}`);
        
        await sequelize.connectionManager.releaseConnection(poolInfo);
    } catch (error) {
        console.error('[DATABASE] Error de conexión:', error.message);
        if (error.original) {
            console.error('[DATABASE] Error original:', error.original);
        }
        // Si estamos en desarrollo, mostramos más detalles del error
        if (NODE_ENV === 'development') {
            console.error('[DATABASE] Stack trace:', error.stack);
        }
    }
};

// Ejecutar prueba de conexión
testConnection();

export default sequelize;