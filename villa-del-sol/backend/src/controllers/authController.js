import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
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

        // Check if user already exists
        const existingUser = await User.findOne({ 
            $or: [{ email }, { username }] 
        });
        
        if (existingUser) {
            return next(createError(400, 'Usuario o email ya existe'));
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user
        const user = new User({
            username,
            email,
            password: hashedPassword,
            role
        });

        // Save user
        const savedUser = await user.save();

        // Remove password from response
        savedUser.password = undefined;

        res.status(201).json({
            success: true,
            data: savedUser
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

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return next(createError(401, 'Credenciales inválidas'));
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return next(createError(401, 'Credenciales inválidas'));
        }

        // Generate tokens
        const accessToken = generateAccessToken(user._id);
        const refreshToken = generateRefreshToken(user._id);

        // Save refresh token to user
        user.refreshToken = refreshToken;
        await user.save();

        // Remove password from response
        user.password = undefined;

        res.status(200).json({
            success: true,
            data: {
                user,
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
        // Clear refresh token in database
        const user = await User.findById(req.user.id);
        user.refreshToken = null;
        await user.save();

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
        const user = await User.findById(req.user.id).select('-password');
        
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

        // Get user
        const user = await User.findById(req.user.id);

        // Verify current password
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return next(createError(401, 'Contraseña actual incorrecta'));
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);

        await user.save();

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

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return next(createError(404, 'No existe usuario con ese email'));
        }

        // Generate reset token
        const resetToken = generateResetToken();
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpire = Date.now() + 3600000; // 1 hour

        await user.save();

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

        // Find user with valid reset token
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) {
            return next(createError(400, 'Token inválido o expirado'));
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        
        // Clear reset token fields
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save();

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

        // Check if email is already taken
        if (email) {
            const existingUser = await User.findOne({ 
                email, 
                _id: { $ne: req.user.id } 
            });
            
            if (existingUser) {
                return next(createError(400, 'Email ya está en uso'));
            }
        }

        // Update user
        const user = await User.findByIdAndUpdate(
            req.user.id,
            { username, email },
            { new: true, runValidators: true }
        ).select('-password');

        res.status(200).json({
            success: true,
            data: user
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

        // Check if user exists and token matches
        const user = await User.findOne({
            _id: decoded.id,
            refreshToken
        });

        if (!user) {
            return next(createError(401, 'Token de refresco inválido'));
        }

        // Generate new access token
        const accessToken = generateAccessToken(user._id);

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

const generateResetToken = () => {
    return crypto.randomBytes(20).toString('hex');
};