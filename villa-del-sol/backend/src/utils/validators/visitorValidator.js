import Joi from 'joi';

const visitorValidator = {
  /**
   * Esquema de validación para crear un nuevo visitante
   */
  createVisitor: Joi.object({
    // Información personal del visitante
    firstName: Joi.string()
      .trim()
      .min(2)
      .max(50)
      .required()
      .messages({
        'string.empty': 'El nombre es requerido',
        'string.min': 'El nombre debe tener al menos 2 caracteres',
        'string.max': 'El nombre no puede exceder los 50 caracteres'
      }),

    lastName: Joi.string()
      .trim()
      .min(2)
      .max(50)
      .required()
      .messages({
        'string.empty': 'El apellido es requerido',
        'string.min': 'El apellido debe tener al menos 2 caracteres',
        'string.max': 'El apellido no puede exceder los 50 caracteres'
      }),

    identification: Joi.string()
      .trim()
      .pattern(/^[0-9]{6,12}$/)
      .required()
      .messages({
        'string.pattern.base': 'El número de identificación debe contener entre 6 y 12 dígitos',
        'string.empty': 'El número de identificación es requerido'
      }),

    // Información de la visita
    apartmentId: Joi.string()
      .required()
      .messages({
        'string.empty': 'El ID del apartamento es requerido'
      }),

    purpose: Joi.string()
      .trim()
      .min(3)
      .max(200)
      .required()
      .messages({
        'string.empty': 'El motivo de la visita es requerido',
        'string.min': 'El motivo debe tener al menos 3 caracteres',
        'string.max': 'El motivo no puede exceder los 200 caracteres'
      }),

    // Información opcional
    phoneNumber: Joi.string()
      .pattern(/^[0-9]{10}$/)
      .optional()
      .messages({
        'string.pattern.base': 'El número de teléfono debe contener 10 dígitos'
      }),

    vehiclePlate: Joi.string()
      .trim()
      .pattern(/^[A-Z0-9]{6,8}$/)
      .optional()
      .messages({
        'string.pattern.base': 'La placa del vehículo debe contener entre 6 y 8 caracteres alfanuméricos'
      }),

    // Campos generados automáticamente (no requeridos en la validación de creación)
    entryTime: Joi.date().optional(),
    exitTime: Joi.date().optional()
  }),

  /**
   * Esquema de validación para actualizar información de un visitante
   */
  updateVisitor: Joi.object({
    firstName: Joi.string()
      .trim()
      .min(2)
      .max(50)
      .optional()
      .messages({
        'string.min': 'El nombre debe tener al menos 2 caracteres',
        'string.max': 'El nombre no puede exceder los 50 caracteres'
      }),

    lastName: Joi.string()
      .trim()
      .min(2)
      .max(50)
      .optional()
      .messages({
        'string.min': 'El apellido debe tener al menos 2 caracteres',
        'string.max': 'El apellido no puede exceder los 50 caracteres'
      }),

    phoneNumber: Joi.string()
      .pattern(/^[0-9]{10}$/)
      .optional()
      .messages({
        'string.pattern.base': 'El número de teléfono debe contener 10 dígitos'
      }),

    purpose: Joi.string()
      .trim()
      .min(3)
      .max(200)
      .optional()
      .messages({
        'string.min': 'El motivo debe tener al menos 3 caracteres',
        'string.max': 'El motivo no puede exceder los 200 caracteres'
      }),

    vehiclePlate: Joi.string()
      .trim()
      .pattern(/^[A-Z0-9]{6,8}$/)
      .optional()
      .messages({
        'string.pattern.base': 'La placa del vehículo debe contener entre 6 y 8 caracteres alfanuméricos'
      })
  }),

  /**
   * Esquema de validación para registrar la salida de un visitante
   */
  checkoutVisitor: Joi.object({
    exitTime: Joi.date()
      .required()
      .messages({
        'date.base': 'La hora de salida debe ser una fecha válida',
        'any.required': 'La hora de salida es requerida'
      })
  }),

  /**
   * Esquema de validación para filtrar el historial de visitas
   */
  visitHistory: Joi.object({
    startDate: Joi.date()
      .required()
      .messages({
        'date.base': 'La fecha inicial debe ser una fecha válida',
        'any.required': 'La fecha inicial es requerida'
      }),
    
    endDate: Joi.date()
      .required()
      .min(Joi.ref('startDate'))
      .messages({
        'date.base': 'La fecha final debe ser una fecha válida',
        'date.min': 'La fecha final debe ser posterior a la fecha inicial',
        'any.required': 'La fecha final es requerida'
      }),

    apartmentId: Joi.string().optional(),
    visitorId: Joi.string().optional()
  })
};

export default visitorValidator;