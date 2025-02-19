import { Payment, Owner, Apartment } from '../models/index.js';
import { Op } from 'sequelize';
import { createError } from '../utils/error.js';
import sequelize from '../config/database.js';

/**
 * Register a new payment
 * @param {Request} req 
 * @param {Response} res 
 * @param {NextFunction} next 
 */
export const registerPayment = async (req, res, next) => {
    try {
        const { ownerId, apartmentId, amount } = req.body;

        // Verify owner and apartment exist using Sequelize
        const owner = await Owner.findByPk(ownerId);
        if (!owner) {
            return next(createError(404, 'Propietario no encontrado'));
        }

        const apartment = await Apartment.findByPk(apartmentId);
        if (!apartment) {
            return next(createError(404, 'Apartamento no encontrado'));
        }

        // Verify apartment belongs to owner
        if (apartment.ownerId !== ownerId) {
            return next(createError(400, 'El apartamento no pertenece al propietario especificado'));
        }

        // Create payment using Sequelize
        const newPayment = await Payment.create({
            ...req.body,
            amount: parseFloat(amount) // Ensure proper decimal handling
        });

        // Eager load associations
        const savedPayment = await Payment.findByPk(newPayment.id, {
            include: [
                { model: Owner, attributes: ['name', 'email'] },
                { model: Apartment, attributes: ['number'] }
            ]
        });

        res.status(201).json({
            success: true,
            data: savedPayment
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get all payments with optional filters
 * @param {Request} req 
 * @param {Response} res 
 * @param {NextFunction} next 
 */
export const getAllPayments = async (req, res, next) => {
    try {
        const { status, startDate, endDate, ownerId, apartmentId } = req.query;
        const where = {};

        // Build where clause using Sequelize operators
        if (status) where.status = status;
        if (ownerId) where.ownerId = ownerId;
        if (apartmentId) where.apartmentId = apartmentId;
        if (startDate || endDate) {
            where.date = {};
            if (startDate) where.date[Op.gte] = new Date(startDate);
            if (endDate) where.date[Op.lte] = new Date(endDate);
        }

        const payments = await Payment.findAll({
            where,
            include: [
                { model: Owner, attributes: ['name', 'email'] },
                { model: Apartment, attributes: ['number'] }
            ],
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
 * Get payment statistics
 * @param {Request} req 
 * @param {Response} res 
 * @param {NextFunction} next 
 */
export const getPaymentStats = async (req, res, next) => {
    try {
        const { startDate, endDate } = req.query;
        const where = {};

        if (startDate || endDate) {
            where.date = {};
            if (startDate) where.date[Op.gte] = new Date(startDate);
            if (endDate) where.date[Op.lte] = new Date(endDate);
        }

        // Calculate statistics using Sequelize aggregates
        const stats = await Payment.findAll({
            where,
            attributes: [
                [sequelize.fn('SUM', sequelize.col('amount')), 'totalAmount'],
                [sequelize.fn('COUNT', sequelize.col('id')), 'totalPayments'],
                [sequelize.fn('AVG', sequelize.col('amount')), 'averagePayment'],
                [
                    sequelize.literal(`
                        SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END)
                    `),
                    'paidAmount'
                ],
                [
                    sequelize.literal(`
                        COUNT(CASE WHEN status = 'paid' THEN 1 END)
                    `),
                    'paidCount'
                ]
            ],
            raw: true
        });

        // Monthly aggregation using Sequelize
        const monthlyStats = await Payment.findAll({
            where,
            attributes: [
                [sequelize.fn('date_trunc', 'month', sequelize.col('date')), 'month'],
                [sequelize.fn('SUM', sequelize.col('amount')), 'totalAmount'],
                [sequelize.fn('COUNT', sequelize.col('id')), 'count']
            ],
            group: [sequelize.fn('date_trunc', 'month', sequelize.col('date'))],
            order: [[sequelize.fn('date_trunc', 'month', sequelize.col('date')), 'DESC']],
            raw: true
        });

        res.status(200).json({
            success: true,
            data: {
                summary: stats[0],
                monthlyBreakdown: monthlyStats
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get pending payments with owner details
 * @param {Request} req 
 * @param {Response} res 
 * @param {NextFunction} next 
 */
export const getPendingPayments = async (req, res, next) => {
    try {
        const pendingPayments = await Payment.findAll({
            where: { status: 'pending' },
            include: [
                { 
                    model: Owner,
                    attributes: ['name', 'email'],
                    required: true
                },
                { 
                    model: Apartment,
                    attributes: ['number'],
                    required: true
                }
            ],
            order: [['dueDate', 'ASC']]
        });

        // Group by owner using Sequelize
        const groupedByOwner = await Payment.findAll({
            where: { status: 'pending' },
            attributes: [
                'ownerId',
                [sequelize.fn('SUM', sequelize.col('amount')), 'totalPending'],
                [sequelize.fn('COUNT', sequelize.col('id')), 'paymentCount']
            ],
            include: [
                { 
                    model: Owner,
                    attributes: ['name', 'email'],
                    required: true
                }
            ],
            group: ['ownerId', 'Owner.id', 'Owner.name', 'Owner.email'],
            raw: true,
            nest: true
        });

        res.status(200).json({
            success: true,
            summary: {
                totalPending: pendingPayments.reduce((sum, p) => sum + parseFloat(p.amount), 0),
                totalCount: pendingPayments.length,
                uniqueOwners: groupedByOwner.length
            },
            byOwner: groupedByOwner,
            data: pendingPayments
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get payment history with detailed analytics
 * @param {Request} req 
 * @param {Response} res 
 * @param {NextFunction} next 
 */
export const getPaymentHistory = async (req, res, next) => {
    try {
        const { startDate, endDate } = req.query;
        const where = {};

        if (startDate || endDate) {
            where.date = {};
            if (startDate) where.date[Op.gte] = new Date(startDate);
            if (endDate) where.date[Op.lte] = new Date(endDate);
        }

        // Complex analytics using Sequelize
        const [payments, statistics] = await Promise.all([
            Payment.findAll({
                where,
                include: [
                    { model: Owner, attributes: ['name', 'email'] },
                    { model: Apartment, attributes: ['number'] }
                ],
                order: [['date', 'DESC']]
            }),
            Payment.findAll({
                where,
                attributes: [
                    [sequelize.fn('SUM', sequelize.col('amount')), 'totalAmount'],
                    [
                        sequelize.literal(`
                            SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END)
                        `),
                        'paidAmount'
                    ],
                    [
                        sequelize.literal(`
                            SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END)
                        `),
                        'pendingAmount'
                    ],
                    [sequelize.fn('COUNT', sequelize.col('id')), 'totalPayments'],
                    [
                        sequelize.literal(`
                            COUNT(CASE WHEN status = 'paid' THEN 1 END)
                        `),
                        'paidPayments'
                    ],
                    [
                        sequelize.literal(`
                            COUNT(CASE WHEN status = 'pending' THEN 1 END)
                        `),
                        'pendingPayments'
                    ]
                ],
                raw: true
            })
        ]);

        res.status(200).json({
            success: true,
            count: payments.length,
            summary: statistics[0],
            data: payments
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get payment by ID
 * @param {Request} req 
 * @param {Response} res 
 * @param {NextFunction} next 
 */
export const getPaymentById = async (req, res, next) => {
    try {
        const payment = await Payment.findByPk(req.params.id, {
            include: [
                { model: Owner, attributes: ['name', 'email'] },
                { model: Apartment, attributes: ['number'] }
            ]
        });

        if (!payment) {
            return next(createError(404, 'Pago no encontrado'));
        }

        // If user is owner, verify ownership
        if (req.user.role === 'owner' && payment.ownerId !== req.user.id) {
            return next(createError(403, 'No autorizado para ver este pago'));
        }

        res.status(200).json({
            success: true,
            data: payment
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update payment information
 * @param {Request} req 
 * @param {Response} res 
 * @param {NextFunction} next 
 */
export const updatePayment = async (req, res, next) => {
    try {
        const payment = await Payment.findByPk(req.params.id);

        if (!payment) {
            return next(createError(404, 'Pago no encontrado'));
        }

        await payment.update(req.body);

        const updatedPayment = await Payment.findByPk(payment.id, {
            include: [
                { model: Owner, attributes: ['name', 'email'] },
                { model: Apartment, attributes: ['number'] }
            ]
        });

        res.status(200).json({
            success: true,
            data: updatedPayment
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Delete a payment record
 * @param {Request} req 
 * @param {Response} res 
 * @param {NextFunction} next 
 */
export const deletePayment = async (req, res, next) => {
    try {
        const payment = await Payment.findByPk(req.params.id);

        if (!payment) {
            return next(createError(404, 'Pago no encontrado'));
        }

        await payment.destroy();

        res.status(200).json({
            success: true,
            message: 'Pago eliminado exitosamente'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get all payments for a specific owner
 * @param {Request} req 
 * @param {Response} res 
 * @param {NextFunction} next 
 */
export const getPaymentsByOwner = async (req, res, next) => {
    try {
        // Verify if user is owner and requesting their own payments
        if (req.user.role === 'owner' && req.params.ownerId !== req.user.id) {
            return next(createError(403, 'No autorizado para ver estos pagos'));
        }

        const payments = await Payment.findAll({
            where: { ownerId: req.params.ownerId },
            include: [
                { model: Apartment, attributes: ['number'] }
            ],
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
 * Get all payments for a specific apartment
 * @param {Request} req 
 * @param {Response} res 
 * @param {NextFunction} next 
 */
export const getPaymentsByApartment = async (req, res, next) => {
    try {
        // If user is owner, verify apartment ownership
        if (req.user.role === 'owner') {
            const apartment = await Apartment.findByPk(req.params.apartmentId);
            if (!apartment || apartment.ownerId !== req.user.id) {
                return next(createError(403, 'No autorizado para ver estos pagos'));
            }
        }

        const payments = await Payment.findAll({
            where: { apartmentId: req.params.apartmentId },
            include: [
                { model: Owner, attributes: ['name', 'email'] }
            ],
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