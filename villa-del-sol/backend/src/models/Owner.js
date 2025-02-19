import { Model, DataTypes } from 'sequelize';
import sequelize from '../utils/database.js';

class Owner extends Model {}

Owner.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notNull: {
        msg: 'El nombre es requerido'
      },
      notEmpty: {
        msg: 'El nombre es requerido'
      }
    }
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      notNull: {
        msg: 'El email es requerido'
      },
      isEmail: {
        msg: 'Email inválido'
      },
      notEmpty: {
        msg: 'El email es requerido'
      }
    },
    set(value) {
      this.setDataValue('email', value.toLowerCase());
    }
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notNull: {
        msg: 'El teléfono es requerido'
      },
      notEmpty: {
        msg: 'El teléfono es requerido'
      }
    }
  },
  identification: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      notNull: {
        msg: 'La identificación es requerida'
      },
      notEmpty: {
        msg: 'La identificación es requerida'
      }
    }
  },
  active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  sequelize,
  modelName: 'Owner',
  tableName: 'owners',
  timestamps: true,
  // Configura los nombres de las columnas de timestamps
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  // Hooks para procesar datos antes de guardar
  hooks: {
    beforeCreate: (owner) => {
      owner.email = owner.email.toLowerCase().trim();
      owner.name = owner.name.trim();
      owner.phone = owner.phone.trim();
      owner.identification = owner.identification.trim();
    },
    beforeUpdate: (owner) => {
      if (owner.changed('email')) {
        owner.email = owner.email.toLowerCase().trim();
      }
      if (owner.changed('name')) {
        owner.name = owner.name.trim();
      }
      if (owner.changed('phone')) {
        owner.phone = owner.phone.trim();
      }
      if (owner.changed('identification')) {
        owner.identification = owner.identification.trim();
      }
    }
  }
});

// Definir las asociaciones
Owner.associate = (models) => {
  Owner.hasMany(models.Apartment, {
    foreignKey: 'owner_id',
    as: 'apartments'
  });
  
  Owner.hasMany(models.Payment, {
    foreignKey: 'owner_id',
    as: 'payments'
  });
};

export default Owner;