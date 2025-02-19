import { Model, DataTypes } from 'sequelize';
import sequelize from '../utils/database.js';
import Apartment from './Apartment.js';

class Visitor extends Model {}

Visitor.init({
  // ID se genera automáticamente como PRIMARY KEY
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  // Información básica del visitante
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'El nombre es requerido' }
    }
  },
  identification: {
    type: DataTypes.STRING(20),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'La identificación es requerida' }
    }
  },
  // Referencia al apartamento (llave foránea)
  apartmentId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Apartment,
      key: 'id'
    },
    field: 'apartment_id' // Nombre en snake_case para PostgreSQL
  },
  // Campos temporales usando TIMESTAMP de PostgreSQL
  entryTime: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'entry_time'
  },
  exitTime: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'exit_time'
  },
  reason: {
    type: DataTypes.STRING(200),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'El motivo de la visita es requerido' }
    }
  },
  vehicle: {
    type: DataTypes.STRING(50),
    allowNull: true
  }
}, {
  sequelize,
  modelName: 'Visitor',
  tableName: 'visitors', // Nombre de tabla en plural y minúsculas
  // Configuración de timestamps
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  // Índices para optimizar búsquedas frecuentes
  indexes: [
    {
      name: 'idx_visitor_apartment',
      fields: ['apartment_id']
    },
    {
      name: 'idx_visitor_entry_time',
      fields: ['entry_time']
    },
    {
      name: 'idx_visitor_identification',
      fields: ['identification']
    }
  ]
});

// Definición de relaciones
Visitor.belongsTo(Apartment, {
  foreignKey: 'apartmentId',
  as: 'apartment'
});

export default Visitor;