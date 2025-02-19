import Joi from 'joi';

export const apartmentValidator = {
    createApartment: Joi.object({
        number: Joi.string().required(),
        floor: Joi.number().required(),
        owner: Joi.string().hex().length(24).optional(),
        status: Joi.string().valid('occupied', 'unoccupied'),
        area: Joi.number().required()
    }),

    updateApartment: Joi.object({
        number: Joi.string(),
        floor: Joi.number(),
        owner: Joi.string().hex().length(24).optional(),
        status: Joi.string().valid('occupied', 'unoccupied'),
        area: Joi.number()
    }),

    updateStatus: Joi.object({
        status: Joi.string().valid('occupied', 'unoccupied').required()
    })
};