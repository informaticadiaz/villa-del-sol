import { Payment } from '../models/Payment.js';
import { Owner } from '../models/Owner.js';
import { Apartment } from '../models/Apartment.js';
import { createError } from '../utils/error.js';

/**
 * Register a new payment
 * @param {Request} req 
 * @param {Response} res 
 * @param {NextFunction} next 
 */
export const registerPayment = async (req, res, next) => {
    try {
        // Verify owner and apartment exist
        const owner = await Owner.findById(req.body.owner);
        if (!owner) {
            return next(createError(404, 'Propietario no encontrado'));
        }

        const apartment = await Apartment.findById(req.body.apartment);
        if (!apartment) {
            return next(createError(404, 'Apartamento no encontrado'));
        }

        // Verify apartment belongs to owner
        if (apartment.owner.toString() !== req.body.owner) {
            return next(createError(400, 'El apartamento no pertenece al propietario especificado'));
        }

        const newPayment = new Payment(req.body);
        const savedPayment = await newPayment.save();

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
        const { status, startDate, endDate, owner, apartment } = req.query;
        const query = {};

        // Apply filters if provided
        if (status) query.status = status;
        if (owner) query.owner = owner;
        if (apartment) query.apartment = apartment;
        if (startDate || endDate) {
            query.date = {};
            if (startDate) query.date.$gte = new Date(startDate);
            if (endDate) query.date.$lte = new Date(endDate);
        }

        const payments = await Payment.find(query)
            .populate('owner', 'name email')
            .populate('apartment', 'number')
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
 * Get payment by ID
 * @param {Request} req 
 * @param {Response} res 
 * @param {NextFunction} next 
 */
export const getPaymentById = async (req, res, next) => {
    try {
        const payment = await Payment.findById(req.params.id)
            .populate('owner', 'name email')
            .populate('apartment', 'number');

        if (!payment) {
            return next(createError(404, 'Pago no encontrado'));
        }

        // If user is owner, verify ownership
        if (req.user.role === 'owner' && payment.owner._id.toString() !== req.user.id) {
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
        const payment = await Payment.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true, runValidators: true }
        )
        .populate('owner', 'name email')
        .populate('apartment', 'number');

        if (!payment) {
            return next(createError(404, 'Pago no encontrado'));
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
 * Delete a payment record
 * @param {Request} req 
 * @param {Response} res 
 * @param {NextFunction} next 
 */
export const deletePayment = async (req, res, next) => {
    try {
        const payment = await Payment.findById(req.params.id);

        if (!payment) {
            return next(createError(404, 'Pago no encontrado'));
        }

        await payment.remove();

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

        const payments = await Payment.find({ owner: req.params.ownerId })
            .populate('apartment', 'number')
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
 * Get all payments for a specific apartment
 * @param {Request} req 
 * @param {Response} res 
 * @param {NextFunction} next 
 */
export const getPaymentsByApartment = async (req, res, next) => {
    try {
        // If user is owner, verify apartment ownership
        if (req.user.role === 'owner') {
            const apartment = await Apartment.findById(req.params.apartmentId);
            if (!apartment || apartment.owner.toString() !== req.user.id) {
                return next(createError(403, 'No autorizado para ver estos pagos'));
            }
        }

        const payments = await Payment.find({ apartment: req.params.apartmentId })
            .populate('owner', 'name email')
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
 * Get all pending payments
 * @param {Request} req 
 * @param {Response} res 
 * @param {NextFunction} next 
 */
export const getPendingPayments = async (req, res, next) => {
    try {
        const payments = await Payment.find({ status: 'pending' })
            .populate('owner', 'name email')
            .populate('apartment', 'number')
            .sort({ dueDate: 1 });

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
 * Get payment history with date range filter
 * @param {Request} req 
 * @param {Response} res 
 * @param {NextFunction} next 
 */
export const getPaymentHistory = async (req, res, next) => {
    try {
        const { startDate, endDate } = req.query;
        const query = {};

        if (startDate || endDate) {
            query.date = {};
            if (startDate) query.date.$gte = new Date(startDate);
            if (endDate) query.date.$lte = new Date(endDate);
        }

        const payments = await Payment.find(query)
            .populate('owner', 'name email')
            .populate('apartment', 'number')
            .sort({ date: -1 });

        // Calculate summary statistics
        const totalAmount = payments.reduce((sum, payment) => sum + payment.amount, 0);
        const paidAmount = payments
            .filter(payment => payment.status === 'paid')
            .reduce((sum, payment) => sum + payment.amount, 0);
        const pendingAmount = totalAmount - paidAmount;

        res.status(200).json({
            success: true,
            count: payments.length,
            summary: {
                totalAmount,
                paidAmount,
                pendingAmount,
                totalPayments: payments.length,
                paidPayments: payments.filter(p => p.status === 'paid').length,
                pendingPayments: payments.filter(p => p.status === 'pending').length
            },
            data: payments
        });
    } catch (error) {
        next(error);
    }
};