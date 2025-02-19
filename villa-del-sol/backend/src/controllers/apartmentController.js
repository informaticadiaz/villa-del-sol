import { Apartment, Owner } from '../models/index.js';
import { createError } from '../utils/error.js';
import { Op } from 'sequelize';

/**
 * Create a new apartment
 * @param {Request} req 
 * @param {Response} res 
 * @param {NextFunction} next 
 */
export const createApartment = async (req, res, next) => {
    try {
        const newApartment = await Apartment.create(req.body);
        
        // Fetch the created apartment with its owner details
        const apartment = await Apartment.findByPk(newApartment.id, {
            include: [{
                model: Owner,
                attributes: ['name', 'email', 'phone']
            }]
        });
        
        res.status(201).json({
            success: true,
            data: apartment
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
        const whereClause = {};

        // Apply filters if provided
        if (status) whereClause.status = status;
        if (floor) whereClause.floor = floor;
        if (ownerId) whereClause.ownerId = ownerId;

        const apartments = await Apartment.findAll({
            where: whereClause,
            include: [{
                model: Owner,
                attributes: ['name', 'email', 'phone']
            }],
            order: [['number', 'ASC']]
        });

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
        const apartment = await Apartment.findByPk(req.params.id, {
            include: [{
                model: Owner,
                attributes: ['name', 'email', 'phone']
            }]
        });

        if (!apartment) {
            return next(createError(404, 'Apartamento no encontrado'));
        }

        // If user is owner, verify ownership
        if (req.user.role === 'owner' && apartment.ownerId !== req.user.id) {
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
        const [updated] = await Apartment.update(req.body, {
            where: { id: req.params.id },
            returning: true
        });

        if (!updated) {
            return next(createError(404, 'Apartamento no encontrado'));
        }

        const apartment = await Apartment.findByPk(req.params.id, {
            include: [{
                model: Owner,
                attributes: ['name', 'email', 'phone']
            }]
        });

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
        const apartment = await Apartment.findByPk(req.params.id);

        if (!apartment) {
            return next(createError(404, 'Apartamento no encontrado'));
        }

        // Check if apartment has an owner
        if (apartment.ownerId) {
            return next(createError(400, 'No se puede eliminar un apartamento con propietario asignado'));
        }

        await apartment.destroy();

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

        const apartments = await Apartment.findAll({
            where: { ownerId: req.params.ownerId },
            include: [{
                model: Owner,
                attributes: ['name', 'email', 'phone']
            }],
            order: [['number', 'ASC']]
        });

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

        const [updated] = await Apartment.update(
            { status },
            {
                where: { id: req.params.id },
                returning: true
            }
        );

        if (!updated) {
            return next(createError(404, 'Apartamento no encontrado'));
        }

        const apartment = await Apartment.findByPk(req.params.id, {
            include: [{
                model: Owner,
                attributes: ['name', 'email', 'phone']
            }]
        });

        res.status(200).json({
            success: true,
            data: apartment
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Bulk update apartment status
 * @param {Request} req 
 * @param {Response} res 
 * @param {NextFunction} next 
 */
export const bulkUpdateStatus = async (req, res, next) => {
    try {
        const { apartmentIds, status } = req.body;

        if (!['occupied', 'unoccupied'].includes(status)) {
            return next(createError(400, 'Estado de apartamento inválido'));
        }

        await Apartment.update(
            { status },
            {
                where: {
                    id: {
                        [Op.in]: apartmentIds
                    }
                }
            }
        );

        const updatedApartments = await Apartment.findAll({
            where: {
                id: {
                    [Op.in]: apartmentIds
                }
            },
            include: [{
                model: Owner,
                attributes: ['name', 'email', 'phone']
            }]
        });

        res.status(200).json({
            success: true,
            count: updatedApartments.length,
            data: updatedApartments
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get apartments statistics
 * @param {Request} req 
 * @param {Response} res 
 * @param {NextFunction} next 
 */
export const getApartmentStats = async (req, res, next) => {
    try {
        const totalApartments = await Apartment.count();
        const occupiedCount = await Apartment.count({
            where: { status: 'occupied' }
        });
        const floorStats = await Apartment.findAll({
            attributes: [
                'floor',
                [sequelize.fn('COUNT', sequelize.col('id')), 'total'],
                [sequelize.fn('COUNT', 
                    sequelize.literal("CASE WHEN status = 'occupied' THEN 1 END")), 
                'occupied']
            ],
            group: ['floor'],
            order: [['floor', 'ASC']]
        });

        res.status(200).json({
            success: true,
            data: {
                totalApartments,
                occupiedCount,
                unoccupiedCount: totalApartments - occupiedCount,
                occupancyRate: ((occupiedCount / totalApartments) * 100).toFixed(2),
                floorStats
            }
        });
    } catch (error) {
        next(error);
    }
};