// auth.js
import jwt from 'jsonwebtoken';
import { createError } from '../utils/error.js';
import User from '../models/User.js';

export const auth = async (req, res, next) => {
    try {
        // Get token from header
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return next(createError(401, 'Acceso denegado. Token no proporcionado'));
        }

        try {
            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
            
            // Get user from database
            const user = await User.findById(decoded.id).select('-password');
            
            if (!user) {
                return next(createError(401, 'Usuario no encontrado'));
            }

            // Add user to request object
            req.user = user;
            next();
        } catch (error) {
            return next(createError(401, 'Token inválido'));
        }
    } catch (error) {
        next(error);
    }
};
