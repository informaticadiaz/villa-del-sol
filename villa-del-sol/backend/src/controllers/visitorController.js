import { Visitor } from '../models/Visitor.js';
import { Apartment } from '../models/Apartment.js';
import { createError } from '../utils/error.js';

/**
 * Register a new visitor
 * @param {Request} req 
 * @param {Response} res 
 * @param {NextFunction} next 
 */
export const registerVisitor = async (req, res, next) => {
    try {
        // Verify apartment exists
        const apartment = await Apartment.findById(req.body.apartment);
        if (!apartment) {
            return next(createError(404, 'Apartamento no encontrado'));
        }

        // Create visitor with entry time
        const newVisitor = new Visitor({
            ...req.body,
            entryTime: new Date()
        });

        const savedVisitor = await newVisitor.save();

        res.status(201).json({
            success: true,
            data: savedVisitor
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
        const query = {};

        // Apply filters if provided
        if (apartment) query.apartment = apartment;
        if (status) {
            query.exitTime = status === 'active' ? null : { $ne: null };
        }
        if (startDate || endDate) {
            query.entryTime = {};
            if (startDate) query.entryTime.$gte = new Date(startDate);
            if (endDate) query.entryTime.$lte = new Date(endDate);
        }

        const visitors = await Visitor.find(query)
            .populate('apartment', 'number')
            .sort({ entryTime: -1 });

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
        const visitor = await Visitor.findById(req.params.id)
            .populate('apartment', 'number');

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

        const visitor = await Visitor.findByIdAndUpdate(
            req.params.id,
            { $set: updateData },
            { new: true, runValidators: true }
        ).populate('apartment', 'number');

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
 * Register visitor checkout
 * @param {Request} req 
 * @param {Response} res 
 * @param {NextFunction} next 
 */
export const checkoutVisitor = async (req, res, next) => {
    try {
        const visitor = await Visitor.findById(req.params.id);

        if (!visitor) {
            return next(createError(404, 'Visitante no encontrado'));
        }

        if (visitor.exitTime) {
            return next(createError(400, 'El visitante ya realizó checkout'));
        }

        visitor.exitTime = new Date();
        await visitor.save();

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
            const apartment = await Apartment.findById(req.params.apartmentId);
            if (!apartment || apartment.owner.toString() !== req.user.id) {
                return next(createError(403, 'No autorizado para ver estos visitantes'));
            }
        }

        const visitors = await Visitor.find({ apartment: req.params.apartmentId })
            .sort({ entryTime: -1 });

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
        const visitors = await Visitor.find({ exitTime: null })
            .populate('apartment', 'number')
            .sort({ entryTime: -1 });

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
        const query = {};

        if (startDate || endDate) {
            query.entryTime = {};
            if (startDate) query.entryTime.$gte = new Date(startDate);
            if (endDate) query.entryTime.$lte = new Date(endDate);
        }

        const visitors = await Visitor.find(query)
            .populate('apartment', 'number')
            .sort({ entryTime: -1 });

        // Calculate statistics
        const stats = {
            totalVisits: visitors.length,
            uniqueVisitors: new Set(visitors.map(v => v.identification)).size,
            averageVisitDuration: calculateAverageVisitDuration(visitors),
            visitsPerApartment: calculateVisitsPerApartment(visitors)
        };

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
const calculateAverageVisitDuration = (visitors) => {
    const completedVisits = visitors.filter(v => v.exitTime);
    if (completedVisits.length === 0) return null;

    const totalDuration = completedVisits.reduce((sum, visit) => {
        return sum + (new Date(visit.exitTime) - new Date(visit.entryTime));
    }, 0);

    return Math.round(totalDuration / (completedVisits.length * 60000)); // Return average in minutes
};

const calculateVisitsPerApartment = (visitors) => {
    return visitors.reduce((acc, visitor) => {
        const aptNumber = visitor.apartment.number;
        if (!acc[aptNumber]) {
            acc[aptNumber] = {
                totalVisits: 0,
                uniqueVisitors: new Set()
            };
        }
        acc[aptNumber].totalVisits++;
        acc[aptNumber].uniqueVisitors.add(visitor.identification);
        return acc;
    }, {});
};