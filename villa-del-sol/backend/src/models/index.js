import { Sequelize } from 'sequelize';
import { Owner } from './Owner.js';
import { Apartment } from './Apartment.js';
import { Visitor } from './Visitor.js';
import { Payment } from './Payment.js';
import { User } from './User.js';

// Configuración de la conexión a PostgreSQL
const sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    protocol: 'postgres',
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false
        }
    },
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    },
    logging: false
});

// Inicializar modelos
const models = {
    Owner: Owner(sequelize),
    Apartment: Apartment(sequelize),
    Visitor: Visitor(sequelize),
    Payment: Payment(sequelize),
    User: User(sequelize)
};

// Configurar asociaciones entre modelos
Object.keys(models).forEach(modelName => {
    if (models[modelName].associate) {
        models[modelName].associate(models);
    }
});

// Definir relaciones
models.Owner.hasMany(models.Apartment, {
    foreignKey: 'ownerId',
    as: 'apartments'
});

models.Apartment.belongsTo(models.Owner, {
    foreignKey: 'ownerId',
    as: 'owner'
});

models.Apartment.hasMany(models.Visitor, {
    foreignKey: 'apartmentId',
    as: 'visitors'
});

models.Visitor.belongsTo(models.Apartment, {
    foreignKey: 'apartmentId',
    as: 'apartment'
});

models.Owner.hasMany(models.Payment, {
    foreignKey: 'ownerId',
    as: 'payments'
});

models.Payment.belongsTo(models.Owner, {
    foreignKey: 'ownerId',
    as: 'owner'
});

models.Apartment.hasMany(models.Payment, {
    foreignKey: 'apartmentId',
    as: 'payments'
});

models.Payment.belongsTo(models.Apartment, {
    foreignKey: 'apartmentId',
    as: 'apartment'
});

models.Owner.hasOne(models.User, {
    foreignKey: 'ownerId',
    as: 'user'
});

models.User.belongsTo(models.Owner, {
    foreignKey: 'ownerId',
    as: 'owner'
});

// Función para sincronizar todos los modelos con la base de datos
const syncDatabase = async (force = false) => {
    try {
        await sequelize.sync({ force });
        console.log('Base de datos sincronizada correctamente');
    } catch (error) {
        console.error('Error al sincronizar la base de datos:', error);
        throw error;
    }
};

// Función para probar la conexión a la base de datos
const testConnection = async () => {
    try {
        await sequelize.authenticate();
        console.log('Conexión a la base de datos establecida correctamente');
        return true;
    } catch (error) {
        console.error('Error al conectar con la base de datos:', error);
        return false;
    }
};

export {
    sequelize,
    models,
    syncDatabase,
    testConnection
};