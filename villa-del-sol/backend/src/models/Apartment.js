import { Model, DataTypes } from 'sequelize';
import sequelize from '../utils/database.js';
import { Owner } from './Owner.js';

class Apartment extends Model {}

Apartment.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  number: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true
    }
  },
  floor: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1
    }
  },
  // Llave foránea para Owner (reemplazando ObjectId)
  ownerId: {
    type: DataTypes.UUID,
    references: {
      model: Owner,
      key: 'id'
    },
    // Permitimos null para apartamentos sin propietario
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('occupied', 'unoccupied'),
    defaultValue: 'unoccupied',
    allowNull: false,
    validate: {
      isIn: [['occupied', 'unoccupied']]
    }
  },
  area: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  }
}, {
  sequelize,
  modelName: 'Apartment',
  // Configuración de timestamps (created_at, updated_at)
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  // Índices para mejorar performance
  indexes: [
    {
      unique: true,
      fields: ['number']
    },
    {
      fields: ['ownerId']
    },
    {
      fields: ['status']
    },
    {
      fields: ['floor']
    }
  ]
});

// Definir relaciones
Apartment.belongsTo(Owner, {
  foreignKey: 'ownerId',
  as: 'owner'
});

export default Apartment;