import Joi from 'joi';

const paymentValidator = {
  /**
   * Validación para la creación de un nuevo pago
   */
  createPayment: Joi.object({
    ownerId: Joi.string()
      .required()
      .regex(/^[0-9a-fA-F]{24}$/)
      .messages({
        'string.pattern.base': 'El ID del propietario no es válido',
        'any.required': 'El ID del propietario es requerido'
      }),

    apartmentId: Joi.string()
      .required()
      .regex(/^[0-9a-fA-F]{24}$/)
      .messages({
        'string.pattern.base': 'El ID del apartamento no es válido',
        'any.required': 'El ID del apartamento es requerido'
      }),

    amount: Joi.number()
      .required()
      .positive()
      .messages({
        'number.base': 'El monto debe ser un número',
        'number.positive': 'El monto debe ser mayor a 0',
        'any.required': 'El monto es requerido'
      }),

    paymentDate: Joi.date()
      .required()
      .max('now')
      .messages({
        'date.base': 'La fecha de pago debe ser una fecha válida',
        'date.max': 'La fecha de pago no puede ser futura',
        'any.required': 'La fecha de pago es requerida'
      }),

    paymentMethod: Joi.string()
      .required()
      .valid('efectivo', 'transferencia', 'tarjeta', 'cheque')
      .messages({
        'any.only': 'El método de pago debe ser: efectivo, transferencia, tarjeta o cheque',
        'any.required': 'El método de pago es requerido'
      }),

    paymentStatus: Joi.string()
      .required()
      .valid('pendiente', 'completado', 'rechazado')
      .messages({
        'any.only': 'El estado del pago debe ser: pendiente, completado o rechazado',
        'any.required': 'El estado del pago es requerido'
      }),

    description: Joi.string()
      .max(200)
      .optional()
      .messages({
        'string.max': 'La descripción no puede exceder los 200 caracteres'
      }),

    referenceNumber: Joi.string()
      .optional()
      .max(50)
      .messages({
        'string.max': 'El número de referencia no puede exceder los 50 caracteres'
      }),

    period: Joi.object({
      month: Joi.number()
        .required()
        .min(1)
        .max(12)
        .messages({
          'number.min': 'El mes debe estar entre 1 y 12',
          'number.max': 'El mes debe estar entre 1 y 12',
          'any.required': 'El mes del período es requerido'
        }),
      year: Joi.number()
        .required()
        .min(2020)
        .max(new Date().getFullYear() + 1)
        .messages({
          'number.min': 'El año no puede ser anterior a 2020',
          'number.max': 'El año no puede ser posterior al próximo año',
          'any.required': 'El año del período es requerido'
        })
    })
      .required()
      .messages({
        'any.required': 'El período de pago es requerido'
      })
  }),

  /**
   * Validación para la actualización de un pago existente
   */
  updatePayment: Joi.object({
    amount: Joi.number()
      .positive()
      .messages({
        'number.base': 'El monto debe ser un número',
        'number.positive': 'El monto debe ser mayor a 0'
      }),

    paymentDate: Joi.date()
      .max('now')
      .messages({
        'date.base': 'La fecha de pago debe ser una fecha válida',
        'date.max': 'La fecha de pago no puede ser futura'
      }),

    paymentMethod: Joi.string()
      .valid('efectivo', 'transferencia', 'tarjeta', 'cheque')
      .messages({
        'any.only': 'El método de pago debe ser: efectivo, transferencia, tarjeta o cheque'
      }),

    paymentStatus: Joi.string()
      .valid('pendiente', 'completado', 'rechazado')
      .messages({
        'any.only': 'El estado del pago debe ser: pendiente, completado o rechazado'
      }),

    description: Joi.string()
      .max(200)
      .messages({
        'string.max': 'La descripción no puede exceder los 200 caracteres'
      }),

    referenceNumber: Joi.string()
      .max(50)
      .messages({
        'string.max': 'El número de referencia no puede exceder los 50 caracteres'
      })
  }),

  /**
   * Validación para filtros en la búsqueda de pagos
   */
  paymentFilters: Joi.object({
    startDate: Joi.date()
      .messages({
        'date.base': 'La fecha de inicio debe ser una fecha válida'
      }),

    endDate: Joi.date()
      .min(Joi.ref('startDate'))
      .messages({
        'date.base': 'La fecha final debe ser una fecha válida',
        'date.min': 'La fecha final debe ser posterior a la fecha de inicio'
      }),

    paymentStatus: Joi.string()
      .valid('pendiente', 'completado', 'rechazado')
      .messages({
        'any.only': 'El estado del pago debe ser: pendiente, completado o rechazado'
      }),

    paymentMethod: Joi.string()
      .valid('efectivo', 'transferencia', 'tarjeta', 'cheque')
      .messages({
        'any.only': 'El método de pago debe ser: efectivo, transferencia, tarjeta o cheque'
      }),

    minAmount: Joi.number()
      .positive()
      .messages({
        'number.base': 'El monto mínimo debe ser un número',
        'number.positive': 'El monto mínimo debe ser mayor a 0'
      }),

    maxAmount: Joi.number()
      .positive()
      .min(Joi.ref('minAmount'))
      .messages({
        'number.base': 'El monto máximo debe ser un número',
        'number.positive': 'El monto máximo debe ser mayor a 0',
        'number.min': 'El monto máximo debe ser mayor al monto mínimo'
      })
  })
};

export default paymentValidator;