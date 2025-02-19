import Joi from 'joi';

// Esquema base para propietarios
const ownerSchema = {
    firstName: Joi.string()
        .min(2)
        .max(50)
        .required()
        .messages({
            'string.min': 'El nombre debe tener al menos 2 caracteres',
            'string.max': 'El nombre no puede exceder los 50 caracteres',
            'string.empty': 'El nombre es requerido'
        }),
    
    lastName: Joi.string()
        .min(2)
        .max(50)
        .required()
        .messages({
            'string.min': 'El apellido debe tener al menos 2 caracteres',
            'string.max': 'El apellido no puede exceder los 50 caracteres',
            'string.empty': 'El apellido es requerido'
        }),
    
    identification: Joi.string()
        .pattern(/^[0-9]{6,12}$/)
        .required()
        .messages({
            'string.pattern.base': 'La identificación debe contener entre 6 y 12 números',
            'string.empty': 'La identificación es requerida'
        }),
    
    email: Joi.string()
        .email()
        .required()
        .messages({
            'string.email': 'Debe proporcionar un email válido',
            'string.empty': 'El email es requerido'
        }),
    
    phone: Joi.string()
        .pattern(/^[0-9]{10}$/)
        .required()
        .messages({
            'string.pattern.base': 'El teléfono debe contener 10 números',
            'string.empty': 'El teléfono es requerido'
        }),
    
    emergencyContact: Joi.object({
        name: Joi.string()
            .min(2)
            .max(100)
            .required()
            .messages({
                'string.min': 'El nombre del contacto debe tener al menos 2 caracteres',
                'string.max': 'El nombre del contacto no puede exceder los 100 caracteres',
                'string.empty': 'El nombre del contacto es requerido'
            }),
        
        phone: Joi.string()
            .pattern(/^[0-9]{10}$/)
            .required()
            .messages({
                'string.pattern.base': 'El teléfono de emergencia debe contener 10 números',
                'string.empty': 'El teléfono de emergencia es requerido'
            }),
        
        relationship: Joi.string()
            .min(2)
            .max(50)
            .required()
            .messages({
                'string.min': 'La relación debe tener al menos 2 caracteres',
                'string.max': 'La relación no puede exceder los 50 caracteres',
                'string.empty': 'La relación es requerida'
            })
    }),
    
    address: Joi.string()
        .max(200)
        .optional()
        .messages({
            'string.max': 'La dirección no puede exceder los 200 caracteres'
        }),
    
    // Campo opcional para notas o comentarios
    notes: Joi.string()
        .max(500)
        .optional()
        .messages({
            'string.max': 'Las notas no pueden exceder los 500 caracteres'
        })
};

// Esquema para crear un nuevo propietario
const createOwnerSchema = Joi.object({
    ...ownerSchema,
    // Campos adicionales específicos para la creación
    password: Joi.string()
        .min(8)
        .max(30)
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
        .required()
        .messages({
            'string.min': 'La contraseña debe tener al menos 8 caracteres',
            'string.max': 'La contraseña no puede exceder los 30 caracteres',
            'string.pattern.base': 'La contraseña debe contener al menos una mayúscula, una minúscula, un número y un carácter especial',
            'string.empty': 'La contraseña es requerida'
        })
});

// Esquema para actualizar un propietario existente
const updateOwnerSchema = Joi.object({
    ...ownerSchema,
    // Hacemos todos los campos opcionales para actualización parcial
}).min(1).messages({
    'object.min': 'Debe proporcionar al menos un campo para actualizar'
});

export const ownerValidator = {
    // Validación para crear un nuevo propietario
    createOwner: (data) => createOwnerSchema.validate(data, { abortEarly: false }),
    
    // Validación para actualizar un propietario existente
    updateOwner: (data) => updateOwnerSchema.validate(data, { abortEarly: false })
};

// Exportar también los esquemas individuales por si se necesitan en otras partes
export const schemas = {
    ownerSchema,
    createOwnerSchema,
    updateOwnerSchema
};