// middleware/roleCheck.js

/**
 * Middleware para verificar roles de usuario
 * @param {Array} roles - Array de roles permitidos
 * @returns {Function} Middleware function
 */
export const roleCheck = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: 'No autorizado - Usuario no autenticado'
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                error: 'No autorizado - Rol no permitido'
            });
        }

        next();
    };
};