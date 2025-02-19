// middleware/errorHandler.js

/**
 * Middleware centralizado para manejo de errores
 * @param {Error} err - Error capturado
 * @param {Request} req - Objeto de solicitud Express
 * @param {Response} res - Objeto de respuesta Express
 * @param {NextFunction} next - Función next de Express
 */
export const errorHandler = (err, req, res, next) => {
    console.error('Error:', {
        message: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });

    // Errores de MongoDB
    if (err.name === 'CastError') {
        return res.status(400).json({
            success: false,
            error: 'Recurso no encontrado o ID inválido'
        });
    }

    if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map(val => val.message);
        return res.status(400).json({
            success: false,
            error: messages
        });
    }

    if (err.code === 11000) {
        return res.status(400).json({
            success: false,
            error: 'Ya existe un registro con ese valor único'
        });
    }

    // Errores de JWT
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            success: false,
            error: 'Token inválido'
        });
    }

    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
            success: false,
            error: 'Token expirado'
        });
    }

    // Error personalizado con código de estado
    if (err.statusCode) {
        return res.status(err.statusCode).json({
            success: false,
            error: err.message
        });
    }

    // Error por defecto del servidor
    return res.status(500).json({
        success: false,
        error: process.env.NODE_ENV === 'development' 
            ? err.message 
            : 'Error interno del servidor'
    });
};