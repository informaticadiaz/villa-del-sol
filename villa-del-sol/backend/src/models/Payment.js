import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

class Payment extends Model {}

Payment.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  // Referencia al propietario (llave foránea)
  ownerId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'owners',
      key: 'id'
    },
    field: 'owner_id'
  },
  // Referencia al apartamento (llave foránea)
  apartmentId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'apartments',
      key: 'id'
    },
    field: 'apartment_id'
  },
  // Monto usando tipo DECIMAL para precisión monetaria
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0,
      isDecimal: true
    }
  },
  // Concepto del pago
  concept: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  // Fecha del pago
  date: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  // Estado del pago usando ENUM
  status: {
    type: DataTypes.ENUM('pending', 'paid', 'cancelled'),
    defaultValue: 'pending',
    allowNull: false
  },
  // Método de pago usando ENUM
  paymentMethod: {
    type: DataTypes.ENUM('cash', 'transfer', 'check', 'card'),
    allowNull: false,
    field: 'payment_method'
  },
  // Referencia de pago
  reference: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  sequelize,
  modelName: 'Payment',
  tableName: 'payments',
  underscored: true, // Usa snake_case para nombres de columnas
  indexes: [
    // Índice para búsquedas por propietario
    {
      name: 'idx_payments_owner',
      fields: ['owner_id']
    },
    // Índice para búsquedas por apartamento
    {
      name: 'idx_payments_apartment',
      fields: ['apartment_id']
    },
    // Índice compuesto para búsquedas por fecha y estado
    {
      name: 'idx_payments_date_status',
      fields: ['date', 'status']
    }
  ]
});

// Definición de asociaciones
export const associatePayment = (models) => {
  Payment.belongsTo(models.Owner, {
    foreignKey: 'ownerId',
    as: 'owner'
  });
  
  Payment.belongsTo(models.Apartment, {
    foreignKey: 'apartmentId',
    as: 'apartment'
  });
};

export default Payment;