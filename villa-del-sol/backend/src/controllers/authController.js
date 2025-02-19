import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { sendEmail } from '../utils/email.js';
import { createError } from '../utils/error.js';

/**
 * Register a new user
 * @param {Request} req 
 * @param {Response} res 
 * @param {NextFunction} next 
 */
export const register = async (req, res, next) => {
    try {
        const { username, email, password, role } = req.body;

        // Check if user already exists - Modified for Sequelize
        const existingUser = await User.findOne({
            where: {
                [Op.or]: [{ email }, { username }]
            }
        });
        
        if (existingUser) {
            return next(createError(400, 'Usuario o email ya existe'));
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user - Modified for Sequelize
        const user = await User.create({
            username,
            email,
            password: hashedPassword,
            role
        });

        // Remove password from response
        const userResponse = user.toJSON();
        delete userResponse.password;

        res.status(201).json({
            success: true,
            data: userResponse
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Login user
 * @param {Request} req 
 * @param {Response} res 
 * @param {NextFunction} next 
 */
export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Check if user exists - Modified for Sequelize
        const user = await User.findOne({
            where: { email },
            attributes: ['id', 'email', 'password', 'username', 'role']
        });

        if (!user) {
            return next(createError(401, 'Credenciales inválidas'));
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return next(createError(401, 'Credenciales inválidas'));
        }

        // Generate tokens
        const accessToken = generateAccessToken(user.id);
        const refreshToken = generateRefreshToken(user.id);

        // Update refresh token in database - Modified for Sequelize
        await user.update({ 
            refreshToken,
            lastLogin: new Date()
        });

        // Prepare response without password
        const userResponse = user.toJSON();
        delete userResponse.password;

        res.status(200).json({
            success: true,
            data: {
                user: userResponse,
                accessToken,
                refreshToken
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Logout user
 * @param {Request} req 
 * @param {Response} res 
 * @param {NextFunction} next 
 */
export const logout = async (req, res, next) => {
    try {
        // Clear refresh token - Modified for Sequelize
        await User.update(
            { refreshToken: null },
            { where: { id: req.user.id } }
        );

        res.status(200).json({
            success: true,
            message: 'Sesión cerrada exitosamente'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get current user information
 * @param {Request} req 
 * @param {Response} res 
 * @param {NextFunction} next 
 */
export const getCurrentUser = async (req, res, next) => {
    try {
        // Modified for Sequelize
        const user = await User.findByPk(req.user.id, {
            attributes: { exclude: ['password'] }
        });
        
        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Change user password
 * @param {Request} req 
 * @param {Response} res 
 * @param {NextFunction} next 
 */
export const changePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;

        // Get user - Modified for Sequelize
        const user = await User.findByPk(req.user.id);

        // Verify current password
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return next(createError(401, 'Contraseña actual incorrecta'));
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update password - Modified for Sequelize
        await user.update({ password: hashedPassword });

        res.status(200).json({
            success: true,
            message: 'Contraseña actualizada exitosamente'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Send password reset email
 * @param {Request} req 
 * @param {Response} res 
 * @param {NextFunction} next 
 */
export const forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;

        // Find user - Modified for Sequelize
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return next(createError(404, 'No existe usuario con ese email'));
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(20).toString('hex');
        const resetPasswordExpire = new Date(Date.now() + 3600000); // 1 hour

        // Update user with reset token - Modified for Sequelize
        await user.update({
            resetPasswordToken: resetToken,
            resetPasswordExpire
        });

        // Send email
        const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
        
        await sendEmail({
            email: user.email,
            subject: 'Recuperación de contraseña',
            text: `Para restablecer tu contraseña, haz clic en el siguiente enlace: ${resetUrl}`
        });

        res.status(200).json({
            success: true,
            message: 'Email de recuperación enviado'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Reset password with token
 * @param {Request} req 
 * @param {Response} res 
 * @param {NextFunction} next 
 */
export const resetPassword = async (req, res, next) => {
    try {
        const { token, password } = req.body;

        // Find user with valid reset token - Modified for Sequelize
        const user = await User.findOne({
            where: {
                resetPasswordToken: token,
                resetPasswordExpire: {
                    [Op.gt]: new Date()
                }
            }
        });

        if (!user) {
            return next(createError(400, 'Token inválido o expirado'));
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        // Update user - Modified for Sequelize
        await user.update({
            password: hashedPassword,
            resetPasswordToken: null,
            resetPasswordExpire: null
        });

        res.status(200).json({
            success: true,
            message: 'Contraseña restablecida exitosamente'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update user profile
 * @param {Request} req 
 * @param {Response} res 
 * @param {NextFunction} next 
 */
export const updateProfile = async (req, res, next) => {
    try {
        const { username, email } = req.body;

        // Check if email is already taken - Modified for Sequelize
        if (email) {
            const existingUser = await User.findOne({
                where: {
                    email,
                    id: {
                        [Op.ne]: req.user.id
                    }
                }
            });
            
            if (existingUser) {
                return next(createError(400, 'Email ya está en uso'));
            }
        }

        // Update user - Modified for Sequelize
        const user = await User.findByPk(req.user.id);
        await user.update({ username, email });

        // Get updated user without password
        const updatedUser = await User.findByPk(req.user.id, {
            attributes: { exclude: ['password'] }
        });

        res.status(200).json({
            success: true,
            data: updatedUser
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Refresh access token
 * @param {Request} req 
 * @param {Response} res 
 * @param {NextFunction} next 
 */
export const refreshToken = async (req, res, next) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return next(createError(401, 'Token de refresco requerido'));
        }

        // Verify refresh token
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

        // Check if user exists and token matches - Modified for Sequelize
        const user = await User.findOne({
            where: {
                id: decoded.id,
                refreshToken
            }
        });

        if (!user) {
            return next(createError(401, 'Token de refresco inválido'));
        }

        // Generate new access token
        const accessToken = generateAccessToken(user.id);

        res.status(200).json({
            success: true,
            data: { accessToken }
        });
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return next(createError(401, 'Token de refresco inválido'));
        }
        next(error);
    }
};

// Utility functions
const generateAccessToken = (userId) => {
    return jwt.sign(
        { id: userId },
        process.env.JWT_ACCESS_SECRET,
        { expiresIn: process.env.JWT_ACCESS_EXPIRE }
    );
};

const generateRefreshToken = (userId) => {
    return jwt.sign(
        { id: userId },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: process.env.JWT_REFRESH_EXPIRE }
    );
};