import { Visitor, Apartment } from '../models/index.js';
import { createError } from '../utils/error.js';
import { Op } from 'sequelize';

/**
 * Register a new visitor
 * @param {Request} req 
 * @param {Response} res 
 * @param {NextFunction} next 
 */
export const registerVisitor = async (req, res, next) => {
    try {
        // Verify apartment exists
        const apartment = await Apartment.findByPk(req.body.apartment);
        if (!apartment) {
            return next(createError(404, 'Apartamento no encontrado'));
        }

        // Create visitor with entry time
        const newVisitor = await Visitor.create({
            ...req.body,
            entryTime: new Date()
        });

        res.status(201).json({
            success: true,
            data: newVisitor
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get all visitors with optional filters
 * @param {Request} req 
 * @param {Response} res 
 * @param {NextFunction} next 
 */
export const getAllVisitors = async (req, res, next) => {
    try {
        const { startDate, endDate, apartment, status } = req.query;
        const whereClause = {};

        // Apply filters if provided
        if (apartment) {
            whereClause.apartmentId = apartment;
        }

        if (status) {
            whereClause.exitTime = status === 'active' ? null : { [Op.ne]: null };
        }

        if (startDate || endDate) {
            whereClause.entryTime = {};
            if (startDate) {
                whereClause.entryTime[Op.gte] = new Date(startDate);
            }
            if (endDate) {
                whereClause.entryTime[Op.lte] = new Date(endDate);
            }
        }

        const visitors = await Visitor.findAll({
            where: whereClause,
            include: [{
                model: Apartment,
                attributes: ['number']
            }],
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

/**
 * Get visitor by ID
 * @param {Request} req 
 * @param {Response} res 
 * @param {NextFunction} next 
 */
export const getVisitorById = async (req, res, next) => {
    try {
        const visitor = await Visitor.findByPk(req.params.id, {
            include: [{
                model: Apartment,
                attributes: ['number']
            }]
        });

        if (!visitor) {
            return next(createError(404, 'Visitante no encontrado'));
        }

        res.status(200).json({
            success: true,
            data: visitor
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update visitor information
 * @param {Request} req 
 * @param {Response} res 
 * @param {NextFunction} next 
 */
export const updateVisitor = async (req, res, next) => {
    try {
        // Prevent updating certain fields
        const { entryTime, exitTime, ...updateData } = req.body;

        const visitor = await Visitor.findByPk(req.params.id);
        
        if (!visitor) {
            return next(createError(404, 'Visitante no encontrado'));
        }

        await visitor.update(updateData);
        
        // Reload visitor with apartment data
        await visitor.reload({
            include: [{
                model: Apartment,
                attributes: ['number']
            }]
        });

        res.status(200).json({
            success: true,
            data: visitor
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Register visitor checkout
 * @param {Request} req 
 * @param {Response} res 
 * @param {NextFunction} next 
 */
export const checkoutVisitor = async (req, res, next) => {
    try {
        const visitor = await Visitor.findByPk(req.params.id);

        if (!visitor) {
            return next(createError(404, 'Visitante no encontrado'));
        }

        if (visitor.exitTime) {
            return next(createError(400, 'El visitante ya realizó checkout'));
        }

        await visitor.update({ exitTime: new Date() });

        res.status(200).json({
            success: true,
            data: visitor
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get all visitors for a specific apartment
 * @param {Request} req 
 * @param {Response} res 
 * @param {NextFunction} next 
 */
export const getVisitorsByApartment = async (req, res, next) => {
    try {
        // If user is owner, verify apartment ownership
        if (req.user.role === 'owner') {
            const apartment = await Apartment.findByPk(req.params.apartmentId);
            if (!apartment || apartment.ownerId !== req.user.id) {
                return next(createError(403, 'No autorizado para ver estos visitantes'));
            }
        }

        const visitors = await Visitor.findAll({
            where: { apartmentId: req.params.apartmentId },
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

/**
 * Get all current visitors (not checked out)
 * @param {Request} req 
 * @param {Response} res 
 * @param {NextFunction} next 
 */
export const getCurrentVisitors = async (req, res, next) => {
    try {
        const visitors = await Visitor.findAll({
            where: {
                exitTime: null
            },
            include: [{
                model: Apartment,
                attributes: ['number']
            }],
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

/**
 * Get visitor history with date range filter
 * @param {Request} req 
 * @param {Response} res 
 * @param {NextFunction} next 
 */
export const getVisitorHistory = async (req, res, next) => {
    try {
        const { startDate, endDate } = req.query;
        const whereClause = {};

        if (startDate || endDate) {
            whereClause.entryTime = {};
            if (startDate) {
                whereClause.entryTime[Op.gte] = new Date(startDate);
            }
            if (endDate) {
                whereClause.entryTime[Op.lte] = new Date(endDate);
            }
        }

        const visitors = await Visitor.findAll({
            where: whereClause,
            include: [{
                model: Apartment,
                attributes: ['number']
            }],
            order: [['entryTime', 'DESC']]
        });

        // Calculate statistics using Sequelize aggregations
        const stats = await calculateVisitorStats(whereClause);

        res.status(200).json({
            success: true,
            statistics: stats,
            data: visitors
        });
    } catch (error) {
        next(error);
    }
};

// Utility functions
const calculateVisitorStats = async (whereClause) => {
    const [totalVisits, uniqueVisitors, averageDuration, visitsPerApartment] = await Promise.all([
        // Total visits
        Visitor.count({ where: whereClause }),
        
        // Unique visitors
        Visitor.count({
            where: whereClause,
            distinct: true,
            col: 'identification'
        }),
        
        // Average visit duration (for completed visits)
        Visitor.findAll({
            where: {
                ...whereClause,
                exitTime: { [Op.ne]: null }
            },
            attributes: [
                [
                    Sequelize.fn(
                        'AVG',
                        Sequelize.fn('EXTRACT', 'EPOCH', 
                            Sequelize.col('exitTime') - Sequelize.col('entryTime')
                        )
                    ),
                    'avgDuration'
                ]
            ],
            raw: true
        }),
        
        // Visits per apartment
        Visitor.findAll({
            where: whereClause,
            attributes: [
                'apartmentId',
                [Sequelize.fn('COUNT', Sequelize.col('*')), 'totalVisits'],
                [Sequelize.fn('COUNT', Sequelize.fn('DISTINCT', Sequelize.col('identification'))), 'uniqueVisitors']
            ],
            group: ['apartmentId'],
            include: [{
                model: Apartment,
                attributes: ['number']
            }],
            raw: true
        })
    ]);

    // Convert average duration from seconds to minutes
    const avgDurationMinutes = averageDuration[0].avgDuration 
        ? Math.round(averageDuration[0].avgDuration / 60) 
        : null;

    return {
        totalVisits,
        uniqueVisitors,
        averageVisitDuration: avgDurationMinutes ? `${avgDurationMinutes} minutes` : 'N/A',
        visitsPerApartment: visitsPerApartment.reduce((acc, curr) => {
            acc[curr['Apartment.number']] = {
                totalVisits: parseInt(curr.totalVisits),
                uniqueVisitors: parseInt(curr.uniqueVisitors)
            };
            return acc;
        }, {})
    };
};