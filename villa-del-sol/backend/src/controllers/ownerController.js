import { Owner, Apartment, Payment, Visitor } from '../models/index.js';
import { createError } from '../utils/error.js';
import { sequelize } from '../utils/database.js';

/**
 * Get all owners
 * @param {Request} req 
 * @param {Response} res 
 * @param {NextFunction} next 
 */
export const getAllOwners = async (req, res, next) => {
    try {
        const owners = await Owner.findAll({
            attributes: { exclude: ['password'] },
            order: [['name', 'ASC']]
        });

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

        const owner = await Owner.findByPk(req.params.id, {
            attributes: { exclude: ['password'] }
        });

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
    const transaction = await sequelize.transaction();
    
    try {
        const { email } = req.body;

        // Check if owner already exists
        const existingOwner = await Owner.findOne({ 
            where: { email },
            transaction
        });

        if (existingOwner) {
            await transaction.rollback();
            return next(createError(400, 'Ya existe un propietario con ese email'));
        }

        const newOwner = await Owner.create(req.body, { transaction });

        await transaction.commit();

        // Remove password from response
        const ownerResponse = newOwner.toJSON();
        delete ownerResponse.password;

        res.status(201).json({
            success: true,
            data: ownerResponse
        });
    } catch (error) {
        await transaction.rollback();
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
    const transaction = await sequelize.transaction();
    
    try {
        // Verify if user is owner and updating their own information
        if (req.user.role === 'owner' && req.params.id !== req.user.id) {
            await transaction.rollback();
            return next(createError(403, 'No autorizado para actualizar esta información'));
        }

        // Check if email is being updated and is already taken
        if (req.body.email) {
            const existingOwner = await Owner.findOne({
                where: {
                    email: req.body.email,
                    id: { [Op.ne]: req.params.id }
                },
                transaction
            });

            if (existingOwner) {
                await transaction.rollback();
                return next(createError(400, 'El email ya está en uso'));
            }
        }

        const [updatedRows] = await Owner.update(req.body, {
            where: { id: req.params.id },
            returning: true,
            transaction
        });

        if (updatedRows === 0) {
            await transaction.rollback();
            return next(createError(404, 'Propietario no encontrado'));
        }

        const updatedOwner = await Owner.findByPk(req.params.id, {
            attributes: { exclude: ['password'] },
            transaction
        });

        await transaction.commit();

        res.status(200).json({
            success: true,
            data: updatedOwner
        });
    } catch (error) {
        await transaction.rollback();
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
    const transaction = await sequelize.transaction();
    
    try {
        // Check if owner has any apartments
        const hasApartments = await Apartment.count({
            where: { ownerId: req.params.id },
            transaction
        });

        if (hasApartments > 0) {
            await transaction.rollback();
            return next(createError(400, 'No se puede eliminar un propietario con apartamentos asignados'));
        }

        const deletedRows = await Owner.destroy({
            where: { id: req.params.id },
            transaction
        });

        if (deletedRows === 0) {
            await transaction.rollback();
            return next(createError(404, 'Propietario no encontrado'));
        }

        await transaction.commit();

        res.status(200).json({
            success: true,
            message: 'Propietario eliminado exitosamente'
        });
    } catch (error) {
        await transaction.rollback();
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

        const apartments = await Apartment.findAll({
            where: { ownerId: req.params.id },
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

        const payments = await Payment.findAll({
            where: { ownerId: req.params.id },
            order: [['date', 'DESC']]
        });

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

        // Get owner's apartments IDs
        const apartments = await Apartment.findAll({
            where: { ownerId: req.params.id },
            attributes: ['id']
        });

        const apartmentIds = apartments.map(apt => apt.id);

        // Get visitors for all owner's apartments
        const visitors = await Visitor.findAll({
            where: {
                apartmentId: {
                    [Op.in]: apartmentIds
                }
            },
            order: [['entryTime', 'DESC']]
        });

        res.status(200).json({
            success: true,
            count: visitors.length,
            data: visitors
        });
    } catch (error) {
        next(error);
    }
};