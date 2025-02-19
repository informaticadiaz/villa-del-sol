// validate.js
export const validate = (schema) => {
    return (req, res, next) => {
        try {
            const { error } = schema.validate(req.body, {
                abortEarly: false,
                stripUnknown: true
            });

            if (error) {
                const errors = error.details.map(detail => ({
                    field: detail.path[0],
                    message: detail.message
                }));

                return next(createError(400, 'Error de validación', errors));
            }

            next();
        } catch (error) {
            next(error);
        }
    };
};
