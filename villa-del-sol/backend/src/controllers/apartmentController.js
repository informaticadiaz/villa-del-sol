import { Apartment } from '../models/Apartment.js';
import { createError } from '../utils/error.js';

/**
 * Create a new apartment
 * @param {Request} req 
 * @param {Response} res 
 * @param {NextFunction} next 
 */
export const createApartment = async (req, res, next) => {
    try {
        const newApartment = new Apartment(req.body);
        const savedApartment = await newApartment.save();
        
        res.status(201).json({
            success: true,
            data: savedApartment
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get all apartments with optional filters
 * @param {Request} req 
 * @param {Response} res 
 * @param {NextFunction} next 
 */
export const getApartments = async (req, res, next) => {
    try {
        const { status, floor, ownerId } = req.query;
        const query = {};

        // Apply filters if provided
        if (status) query.status = status;
        if (floor) query.floor = floor;
        if (ownerId) query.owner = ownerId;

        const apartments = await Apartment.find(query)
            .populate('owner', 'name email phone')
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
 * Get apartment by ID
 * @param {Request} req 
 * @param {Response} res 
 * @param {NextFunction} next 
 */
export const getApartmentById = async (req, res, next) => {
    try {
        const apartment = await Apartment.findById(req.params.id)
            .populate('owner', 'name email phone');

        if (!apartment) {
            return next(createError(404, 'Apartamento no encontrado'));
        }

        // If user is owner, verify ownership
        if (req.user.role === 'owner' && apartment.owner._id.toString() !== req.user.id) {
            return next(createError(403, 'No autorizado para ver este apartamento'));
        }

        res.status(200).json({
            success: true,
            data: apartment
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update apartment information
 * @param {Request} req 
 * @param {Response} res 
 * @param {NextFunction} next 
 */
export const updateApartment = async (req, res, next) => {
    try {
        const apartment = await Apartment.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true, runValidators: true }
        ).populate('owner', 'name email phone');

        if (!apartment) {
            return next(createError(404, 'Apartamento no encontrado'));
        }

        res.status(200).json({
            success: true,
            data: apartment
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Delete an apartment
 * @param {Request} req 
 * @param {Response} res 
 * @param {NextFunction} next 
 */
export const deleteApartment = async (req, res, next) => {
    try {
        const apartment = await Apartment.findById(req.params.id);

        if (!apartment) {
            return next(createError(404, 'Apartamento no encontrado'));
        }

        // Check if apartment has an owner
        if (apartment.owner) {
            return next(createError(400, 'No se puede eliminar un apartamento con propietario asignado'));
        }

        await apartment.remove();

        res.status(200).json({
            success: true,
            message: 'Apartamento eliminado exitosamente'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get all apartments belonging to a specific owner
 * @param {Request} req 
 * @param {Response} res 
 * @param {NextFunction} next 
 */
export const getApartmentsByOwner = async (req, res, next) => {
    try {
        // Verify if user is owner and requesting their own apartments
        if (req.user.role === 'owner' && req.params.ownerId !== req.user.id) {
            return next(createError(403, 'No autorizado para ver estos apartamentos'));
        }

        const apartments = await Apartment.find({ owner: req.params.ownerId })
            .populate('owner', 'name email phone')
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
 * Update apartment status (occupied/unoccupied)
 * @param {Request} req 
 * @param {Response} res 
 * @param {NextFunction} next 
 */
export const updateApartmentStatus = async (req, res, next) => {
    try {
        const { status } = req.body;

        if (!['occupied', 'unoccupied'].includes(status)) {
            return next(createError(400, 'Estado de apartamento inválido'));
        }

        const apartment = await Apartment.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true, runValidators: true }
        ).populate('owner', 'name email phone');

        if (!apartment) {
            return next(createError(404, 'Apartamento no encontrado'));
        }

        res.status(200).json({
            success: true,
            data: apartment
        });
    } catch (error) {
        next(error);
    }
};