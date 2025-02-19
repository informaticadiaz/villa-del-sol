import Joi from 'joi';

/**
 * Auth validation schemas
 */
export const authValidator = {
    /**
     * Validation schema for user registration
     */
    register: Joi.object({
        username: Joi.string()
            .min(3)
            .max(30)
            .required()
            .messages({
                'string.min': 'El nombre de usuario debe tener al menos 3 caracteres',
                'string.max': 'El nombre de usuario no puede exceder 30 caracteres',
                'any.required': 'El nombre de usuario es requerido'
            }),
        email: Joi.string()
            .email()
            .required()
            .messages({
                'string.email': 'Debe proporcionar un email válido',
                'any.required': 'El email es requerido'
            }),
        password: Joi.string()
            .min(8)
            .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])'))
            .required()
            .messages({
                'string.min': 'La contraseña debe tener al menos 8 caracteres',
                'string.pattern.base': 'La contraseña debe contener al menos una letra mayúscula, una minúscula y un número',
                'any.required': 'La contraseña es requerida'
            }),
        role: Joi.string()
            .valid('admin', 'owner', 'security')
            .required()
            .messages({
                'any.only': 'El rol debe ser admin, owner o security',
                'any.required': 'El rol es requerido'
            })
    }),

    /**
     * Validation schema for user login
     */
    login: Joi.object({
        email: Joi.string()
            .email()
            .required()
            .messages({
                'string.email': 'Debe proporcionar un email válido',
                'any.required': 'El email es requerido'
            }),
        password: Joi.string()
            .required()
            .messages({
                'any.required': 'La contraseña es requerida'
            })
    }),

    /**
     * Validation schema for password change
     */
    changePassword: Joi.object({
        currentPassword: Joi.string()
            .required()
            .messages({
                'any.required': 'La contraseña actual es requerida'
            }),
        newPassword: Joi.string()
            .min(8)
            .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])'))
            .required()
            .messages({
                'string.min': 'La nueva contraseña debe tener al menos 8 caracteres',
                'string.pattern.base': 'La nueva contraseña debe contener al menos una letra mayúscula, una minúscula y un número',
                'any.required': 'La nueva contraseña es requerida'
            }),
        confirmPassword: Joi.string()
            .valid(Joi.ref('newPassword'))
            .required()
            .messages({
                'any.only': 'Las contraseñas no coinciden',
                'any.required': 'La confirmación de contraseña es requerida'
            })
    }),

    /**
     * Validation schema for forgot password
     */
    forgotPassword: Joi.object({
        email: Joi.string()
            .email()
            .required()
            .messages({
                'string.email': 'Debe proporcionar un email válido',
                'any.required': 'El email es requerido'
            })
    }),

    /**
     * Validation schema for reset password
     */
    resetPassword: Joi.object({
        token: Joi.string()
            .required()
            .messages({
                'any.required': 'El token de reseteo es requerido'
            }),
        password: Joi.string()
            .min(8)
            .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])'))
            .required()
            .messages({
                'string.min': 'La contraseña debe tener al menos 8 caracteres',
                'string.pattern.base': 'La contraseña debe contener al menos una letra mayúscula, una minúscula y un número',
                'any.required': 'La contraseña es requerida'
            }),
        confirmPassword: Joi.string()
            .valid(Joi.ref('password'))
            .required()
            .messages({
                'any.only': 'Las contraseñas no coinciden',
                'any.required': 'La confirmación de contraseña es requerida'
            })
    }),

    /**
     * Validation schema for profile update
     */
    updateProfile: Joi.object({
        username: Joi.string()
            .min(3)
            .max(30)
            .messages({
                'string.min': 'El nombre de usuario debe tener al menos 3 caracteres',
                'string.max': 'El nombre de usuario no puede exceder 30 caracteres'
            }),
        email: Joi.string()
            .email()
            .messages({
                'string.email': 'Debe proporcionar un email válido'
            })
    }).min(1).messages({
        'object.min': 'Debe proporcionar al menos un campo para actualizar'
    }),

    /**
     * Validation schema for refresh token
     */
    refreshToken: Joi.object({
        refreshToken: Joi.string()
            .required()
            .messages({
                'any.required': 'El token de refresco es requerido'
            })
    })
};