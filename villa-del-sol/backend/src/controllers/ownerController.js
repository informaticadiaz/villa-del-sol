import { Owner } from '../models/Owner.js';
import { Apartment } from '../models/Apartment.js';
import { Payment } from '../models/Payment.js';
import { Visitor } from '../models/Visitor.js';
import { createError } from '../utils/error.js';

/**
 * Get all owners
 * @param {Request} req 
 * @param {Response} res 
 * @param {NextFunction} next 
 */
export const getAllOwners = async (req, res, next) => {
    try {
        const owners = await Owner.find()
            .select('-password')
            .sort({ name: 1 });

        res.status(200).json({
            success: true,
            count: owners.length,
            data: owners
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get owner by ID
 * @param {Request} req 
 * @param {Response} res 
 * @param {NextFunction} next 
 */
export const getOwnerById = async (req, res, next) => {
    try {
        // Verify if user is owner and requesting their own information
        if (req.user.role === 'owner' && req.params.id !== req.user.id) {
            return next(createError(403, 'No autorizado para ver esta información'));
        }

        const owner = await Owner.findById(req.params.id)
            .select('-password');

        if (!owner) {
            return next(createError(404, 'Propietario no encontrado'));
        }

        res.status(200).json({
            success: true,
            data: owner
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Create a new owner
 * @param {Request} req 
 * @param {Response} res 
 * @param {NextFunction} next 
 */
export const createOwner = async (req, res, next) => {
    try {
        const { email } = req.body;

        // Check if owner already exists
        const existingOwner = await Owner.findOne({ email });
        if (existingOwner) {
            return next(createError(400, 'Ya existe un propietario con ese email'));
        }

        const newOwner = new Owner(req.body);
        const savedOwner = await newOwner.save();

        // Remove password from response
        savedOwner.password = undefined;

        res.status(201).json({
            success: true,
            data: savedOwner
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update owner information
 * @param {Request} req 
 * @param {Response} res 
 * @param {NextFunction} next 
 */
export const updateOwner = async (req, res, next) => {
    try {
        // Verify if user is owner and updating their own information
        if (req.user.role === 'owner' && req.params.id !== req.user.id) {
            return next(createError(403, 'No autorizado para actualizar esta información'));
        }

        // Check if email is being updated and is already taken
        if (req.body.email) {
            const existingOwner = await Owner.findOne({
                email: req.body.email,
                _id: { $ne: req.params.id }
            });

            if (existingOwner) {
                return next(createError(400, 'El email ya está en uso'));
            }
        }

        const owner = await Owner.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true, runValidators: true }
        ).select('-password');

        if (!owner) {
            return next(createError(404, 'Propietario no encontrado'));
        }

        res.status(200).json({
            success: true,
            data: owner
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Delete an owner
 * @param {Request} req 
 * @param {Response} res 
 * @param {NextFunction} next 
 */
export const deleteOwner = async (req, res, next) => {
    try {
        // Check if owner has any apartments
        const hasApartments = await Apartment.exists({ owner: req.params.id });
        if (hasApartments) {
            return next(createError(400, 'No se puede eliminar un propietario con apartamentos asignados'));
        }

        const owner = await Owner.findByIdAndDelete(req.params.id);

        if (!owner) {
            return next(createError(404, 'Propietario no encontrado'));
        }

        res.status(200).json({
            success: true,
            message: 'Propietario eliminado exitosamente'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get all apartments belonging to an owner
 * @param {Request} req 
 * @param {Response} res 
 * @param {NextFunction} next 
 */
export const getOwnerApartments = async (req, res, next) => {
    try {
        // Verify if user is owner and requesting their own apartments
        if (req.user.role === 'owner' && req.params.id !== req.user.id) {
            return next(createError(403, 'No autorizado para ver estos apartamentos'));
        }

        const apartments = await Apartment.find({ owner: req.params.id })
            .sort({ number: 1 });

        res.status(200).json({
            success: true,
            count: apartments.length,
            data: apartments
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get payment history for an owner
 * @param {Request} req 
 * @param {Response} res 
 * @param {NextFunction} next 
 */
export const getOwnerPayments = async (req, res, next) => {
    try {
        // Verify if user is owner and requesting their own payments
        if (req.user.role === 'owner' && req.params.id !== req.user.id) {
            return next(createError(403, 'No autorizado para ver estos pagos'));
        }

        const payments = await Payment.find({ owner: req.params.id })
            .sort({ date: -1 });

        res.status(200).json({
            success: true,
            count: payments.length,
            data: payments
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get visitor history for an owner's apartments
 * @param {Request} req 
 * @param {Response} res 
 * @param {NextFunction} next 
 */
export const getOwnerVisitors = async (req, res, next) => {
    try {
        // Verify if user is owner and requesting their own visitors
        if (req.user.role === 'owner' && req.params.id !== req.user.id) {
            return next(createError(403, 'No autorizado para ver estos visitantes'));
        }

        // Get owner's apartments
        const apartments = await Apartment.find({ owner: req.params.id })
            .select('_id');

        // Get visitors for all owner's apartments
        const visitors = await Visitor.find({
            apartment: { $in: apartments.map(apt => apt._id) }
        }).sort({ entryTime: -1 });

        res.status(200).json({
            success: true,
            count: visitors.length,
            data: visitors
        });
    } catch (error) {
        next(error);
    }
};