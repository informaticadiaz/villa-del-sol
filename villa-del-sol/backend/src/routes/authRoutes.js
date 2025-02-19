import { Router } from 'express';
import * as authController from '../controllers/authController.js';
import { validate } from '../middleware/validate.js';
import { auth } from '../middleware/auth.js';
import { roleCheck } from '../middleware/roleCheck.js';
import { authValidator } from '../utils/validators/authValidator.js';

const router = Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user (admin only can create new users)
 * @access  Private (Admin)
 */
router.post(
    '/register',
    auth,
    roleCheck(['admin']),
    validate(authValidator.register),
    authController.register
);

/**
 * @route   POST /api/auth/login
 * @desc    Login user and get token
 * @access  Public
 */
router.post(
    '/login',
    validate(authValidator.login),
    authController.login
);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user and invalidate token
 * @access  Private
 */
router.post(
    '/logout',
    auth,
    authController.logout
);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user information
 * @access  Private
 */
router.get(
    '/me',
    auth,
    authController.getCurrentUser
);

/**
 * @route   PUT /api/auth/change-password
 * @desc    Change user password
 * @access  Private
 */
router.put(
    '/change-password',
    auth,
    validate(authValidator.changePassword),
    authController.changePassword
);

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Send password reset email
 * @access  Public
 */
router.post(
    '/forgot-password',
    validate(authValidator.forgotPassword),
    authController.forgotPassword
);

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset password with token
 * @access  Public
 */
router.post(
    '/reset-password',
    validate(authValidator.resetPassword),
    authController.resetPassword
);

/**
 * @route   PUT /api/auth/update-profile
 * @desc    Update user profile information
 * @access  Private
 */
router.put(
    '/update-profile',
    auth,
    validate(authValidator.updateProfile),
    authController.updateProfile
);

/**
 * @route   POST /api/auth/refresh-token
 * @desc    Refresh access token using refresh token
 * @access  Public
 */
router.post(
    '/refresh-token',
    validate(authValidator.refreshToken),
    authController.refreshToken
);

export default router;