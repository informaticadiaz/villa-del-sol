import { Model, DataTypes } from 'sequelize';
import bcrypt from 'bcryptjs';
import sequelize from '../config/database.js';

class User extends Model {
  // Método de instancia para comparar contraseñas
  async comparePassword(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
  }
}

User.init({
  // Campos básicos
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      len: {
        args: [3, 50],
        msg: 'El nombre de usuario debe tener entre 3 y 50 caracteres'
      }
    }
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: {
        msg: 'Email inválido'
      },
      notNull: {
        msg: 'El email es requerido'
      }
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: {
        args: [6, 100],
        msg: 'La contraseña debe tener al menos 6 caracteres'
      }
    }
  },
  role: {
    type: DataTypes.ENUM('admin', 'security', 'owner'),
    defaultValue: 'owner',
    allowNull: false
  },
  active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  lastLogin: {
    type: DataTypes.DATE
  },
  refreshToken: {
    type: DataTypes.STRING
  },
  resetPasswordToken: {
    type: DataTypes.STRING
  },
  resetPasswordExpire: {
    type: DataTypes.DATE
  }
}, {
  sequelize,
  modelName: 'User',
  tableName: 'users',
  // Habilitar timestamps (createdAt, updatedAt)
  timestamps: true,
  // Configurar hooks (equivalente a middleware en Mongoose)
  hooks: {
    // Hash de contraseña antes de crear/actualizar
    beforeSave: async (user) => {
      if (user.changed('password')) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    }
  },
  // Excluir campos sensibles por defecto
  defaultScope: {
    attributes: {
      exclude: ['password', 'refreshToken']
    }
  },
  // Scope para cuando necesitamos la contraseña (login)
  scopes: {
    withPassword: {
      attributes: {
        include: ['password']
      }
    }
  }
});

// Método estático para buscar usuario por email (incluyendo password)
User.findByEmail = async function(email) {
  return await this.scope('withPassword').findOne({
    where: { email }
  });
};

// Método para actualizar último login
User.prototype.updateLastLogin = async function() {
  this.lastLogin = new Date();
  await this.save();
};

// Método para generar token de reseteo de contraseña
User.prototype.generateResetPasswordToken = async function() {
  // Generar token
  const resetToken = crypto.randomBytes(20).toString('hex');

  // Hash token y establecer campos de reseteo
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Establecer expiración (1 hora)
  this.resetPasswordExpire = new Date(Date.now() + 3600000);

  await this.save();

  return resetToken;
};

// Método para limpiar token de reseteo
User.prototype.clearResetPasswordToken = async function() {
  this.resetPasswordToken = null;
  this.resetPasswordExpire = null;
  await this.save();
};

// Configurar índices
User.addHook('afterSync', async () => {
  await sequelize.query(`
    CREATE INDEX IF NOT EXISTS users_email_idx ON users (email);
    CREATE INDEX IF NOT EXISTS users_username_idx ON users (username);
  `);
});

export default User;