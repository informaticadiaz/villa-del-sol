import { Op } from 'sequelize';
import sequelize from '../config/database.js';
import { Owner, Apartment, Payment, Visitor } from '../models/index.js';
import { createError } from '../utils/error.js';

/**
 * Generate report of all owners and their properties
 */
export const generateOwnersReport = async (req, res, next) => {
    try {
        const owners = await Owner.findAll({
            include: [{
                model: Apartment,
                include: [{
                    model: Payment,
                    attributes: [
                        [sequelize.fn('SUM', sequelize.col('amount')), 'totalAmount'],
                        [sequelize.fn('COUNT', sequelize.col('id')), 'paymentCount']
                    ],
                    where: {
                        status: 'pending'
                    }
                }]
            }],
            attributes: {
                include: [
                    [sequelize.literal(`(
                        SELECT COUNT(*) FROM apartments 
                        WHERE apartments.owner_id = Owner.id
                    )`), 'apartmentCount']
                ]
            }
        });

        const ownersData = owners.map(owner => ({
            ownerInfo: owner,
            statistics: {
                totalApartments: owner.apartmentCount,
                totalPayments: owner.Apartments.reduce((sum, apt) => 
                    sum + apt.Payments.reduce((pSum, p) => pSum + p.amount, 0), 0),
                pendingPayments: owner.Apartments.reduce((sum, apt) => 
                    sum + (apt.Payments[0]?.totalAmount || 0), 0)
            }
        }));

        res.status(200).json({
            success: true,
            count: owners.length,
            data: ownersData
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Generate payment status report with optional date range
 */
export const generatePaymentsReport = async (req, res, next) => {
    try {
        const { startDate, endDate } = req.query;
        const whereClause = {};

        if (startDate || endDate) {
            whereClause.date = {};
            if (startDate) whereClause.date[Op.gte] = new Date(startDate);
            if (endDate) whereClause.date[Op.lte] = new Date(endDate);
        }

        const payments = await Payment.findAll({
            where: whereClause,
            include: [
                { 
                    model: Owner,
                    attributes: ['name', 'email']
                },
                {
                    model: Apartment,
                    attributes: ['number']
                }
            ],
            attributes: {
                include: [
                    [sequelize.fn('date_trunc', 'month', sequelize.col('date')), 'month']
                ]
            },
            order: [['date', 'DESC']]
        });

        // Calculate summary statistics using Sequelize aggregations
        const summary = await Payment.findAll({
            where: whereClause,
            attributes: [
                [sequelize.fn('SUM', sequelize.col('amount')), 'totalAmount'],
                [sequelize.fn('COUNT', sequelize.col('id')), 'totalPayments'],
                [sequelize.literal(`SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END)`), 'paidAmount'],
                [sequelize.literal(`COUNT(CASE WHEN status = 'paid' THEN 1 END)`), 'paidPayments']
            ],
            raw: true
        });

        // Group payments by month using Sequelize
        const monthlyPayments = await Payment.findAll({
            where: whereClause,
            attributes: [
                [sequelize.fn('date_trunc', 'month', sequelize.col('date')), 'month'],
                [sequelize.fn('SUM', sequelize.col('amount')), 'total'],
                [sequelize.literal(`SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END)`), 'paid'],
                [sequelize.literal(`SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END)`), 'pending']
            ],
            group: [sequelize.fn('date_trunc', 'month', sequelize.col('date'))],
            order: [[sequelize.fn('date_trunc', 'month', sequelize.col('date')), 'DESC']],
            raw: true
        });

        res.status(200).json({
            success: true,
            summary: {
                ...summary[0],
                pendingAmount: summary[0].totalAmount - summary[0].paidAmount,
                collectionRate: summary[0].totalAmount > 0 ? 
                    ((summary[0].paidAmount / summary[0].totalAmount) * 100).toFixed(2) + '%' : 
                    '0%'
            },
            monthlyBreakdown: monthlyPayments,
            data: payments
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Generate visitor statistics report
 */
export const generateVisitorsReport = async (req, res, next) => {
    try {
        const { startDate, endDate } = req.query;
        const whereClause = {};

        if (startDate || endDate) {
            whereClause.entryTime = {};
            if (startDate) whereClause.entryTime[Op.gte] = new Date(startDate);
            if (endDate) whereClause.entryTime[Op.lte] = new Date(endDate);
        }

        // Get visitors with apartment info
        const visitors = await Visitor.findAll({
            where: whereClause,
            include: [{
                model: Apartment,
                attributes: ['number'],
                include: [{
                    model: Owner,
                    attributes: ['name', 'email']
                }]
            }],
            order: [['entryTime', 'DESC']]
        });

        // Calculate statistics using Sequelize aggregations
        const statistics = await Visitor.findAll({
            where: whereClause,
            attributes: [
                [sequelize.fn('COUNT', sequelize.col('id')), 'totalVisits'],
                [sequelize.fn('COUNT', sequelize.fn('DISTINCT', sequelize.col('identification'))), 'uniqueVisitors'],
                [sequelize.literal(`
                    AVG(EXTRACT(EPOCH FROM (exit_time - entry_time))/60)
                `), 'averageVisitDuration']
            ],
            raw: true
        });

        // Get visitor frequency by apartment
        const visitorFrequency = await Visitor.findAll({
            where: whereClause,
            attributes: [
                'apartmentId',
                [sequelize.fn('COUNT', sequelize.col('id')), 'totalVisits'],
                [sequelize.fn('COUNT', sequelize.fn('DISTINCT', sequelize.col('identification'))), 'uniqueVisitors']
            ],
            include: [{
                model: Apartment,
                attributes: ['number']
            }],
            group: ['apartmentId', 'Apartment.id'],
            order: [[sequelize.fn('COUNT', sequelize.col('id')), 'DESC']],
            raw: true
        });

        res.status(200).json({
            success: true,
            summary: {
                ...statistics[0],
                averageVisitDuration: Math.round(statistics[0].averageVisitDuration || 0)
            },
            byApartment: visitorFrequency,
            data: visitors
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Generate report of apartment occupancy status
 */
export const generateApartmentStatusReport = async (req, res, next) => {
    try {
        // Get apartments with owner info
        const apartments = await Apartment.findAll({
            include: [{
                model: Owner,
                attributes: ['name', 'email']
            }],
            order: [['number', 'ASC']]
        });

        // Calculate statistics using Sequelize aggregations
        const statistics = await Apartment.findAll({
            attributes: [
                [sequelize.fn('COUNT', sequelize.col('id')), 'totalApartments'],
                [sequelize.literal(`COUNT(CASE WHEN status = 'occupied' THEN 1 END)`), 'occupiedApartments']
            ],
            raw: true
        });

        // Group by floor using Sequelize
        const byFloor = await Apartment.findAll({
            attributes: [
                [sequelize.literal('FLOOR(number::integer/100)'), 'floor'],
                [sequelize.fn('COUNT', sequelize.col('id')), 'total'],
                [sequelize.literal(`COUNT(CASE WHEN status = 'occupied' THEN 1 END)`), 'occupied'],
                [sequelize.literal(`COUNT(CASE WHEN status = 'unoccupied' THEN 1 END)`), 'unoccupied']
            ],
            group: [sequelize.literal('FLOOR(number::integer/100)')],
            order: [sequelize.literal('floor')],
            raw: true
        });

        res.status(200).json({
            success: true,
            summary: {
                ...statistics[0],
                unoccupiedApartments: statistics[0].totalApartments - statistics[0].occupiedApartments,
                occupancyRate: ((statistics[0].occupiedApartments / statistics[0].totalApartments) * 100).toFixed(2) + '%'
            },
            byFloor,
            data: apartments
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Generate report of pending payments
 */
export const generatePendingPaymentsReport = async (req, res, next) => {
    try {
        const pendingPayments = await Payment.findAll({
            where: { status: 'pending' },
            include: [
                {
                    model: Owner,
                    attributes: ['name', 'email']
                },
                {
                    model: Apartment,
                    attributes: ['number']
                }
            ],
            order: [['dueDate', 'ASC']]
        });

        // Calculate summary using Sequelize aggregations
        const summary = await Payment.findAll({
            where: { status: 'pending' },
            attributes: [
                [sequelize.fn('SUM', sequelize.col('amount')), 'totalPendingAmount'],
                [sequelize.fn('COUNT', sequelize.col('id')), 'totalPendingPayments'],
                [sequelize.fn('COUNT', sequelize.fn('DISTINCT', sequelize.col('ownerId'))), 'uniqueOwnersWithPending']
            ],
            raw: true
        });

        // Group by owner using Sequelize
        const byOwner = await Payment.findAll({
            where: { status: 'pending' },
            attributes: [
                'ownerId',
                [sequelize.fn('SUM', sequelize.col('amount')), 'totalPending'],
                [sequelize.fn('COUNT', sequelize.col('id')), 'paymentCount']
            ],
            include: [{
                model: Owner,
                attributes: ['name', 'email']
            }],
            group: ['ownerId', 'Owner.id'],
            raw: true
        });

        res.status(200).json({
            success: true,
            summary: summary[0],
            byOwner,
            data: pendingPayments
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Generate monthly payment collection report
 */
export const generateMonthlyPaymentsReport = async (req, res, next) => {
    try {
        const { month, year } = req.query;
        if (!month || !year) {
            return next(createError(400, 'Se requiere mes y año'));
        }

        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0);

        const payments = await Payment.findAll({
            where: {
                date: {
                    [Op.between]: [startDate, endDate]
                }
            },
            include: [
                {
                    model: Owner,
                    attributes: ['name', 'email']
                },
                {
                    model: Apartment,
                    attributes: ['number']
                }
            ]
        });

        // Calculate statistics using Sequelize
        const statistics = await Payment.findAll({
            where: {
                date: {
                    [Op.between]: [startDate, endDate]
                }
            },
            attributes: [
                [sequelize.fn('SUM', sequelize.col('amount')), 'totalCollected'],
                [sequelize.fn('COUNT', sequelize.col('id')), 'totalPayments'],
                [sequelize.literal(`COUNT(CASE WHEN status = 'paid' THEN 1 END)`), 'paidPayments']
            ],
            raw: true
        });

        // Calculate total expected payments
        const totalExpected = await calculateTotalExpectedPayments(month, year);

        res.status(200).json({
            success: true,
            summary: {
                month: startDate.toLocaleString('default', { month: 'long' }),
                year,
                totalExpected,
                totalCollected: statistics[0].totalCollected || 0,
                collectionRate: ((statistics[0].totalCollected / totalExpected) * 100).toFixed(2) + '%',
                totalPayments: statistics[0].totalPayments,
                paidPayments: statistics[0].paidPayments
            },
            data: payments
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Generate report of visitor frequency by apartment
 */
export const generateVisitorFrequencyReport = async (req, res, next) => {
    try {
        const { startDate, endDate } = req.query;
        const whereClause = {};

        if (startDate || endDate) {
            whereClause.entryTime = {};
            if (startDate) whereClause.entryTime[Op.gte] = new Date(startDate);
            if (endDate) whereClause.entryTime[Op.lte] = new Date(endDate);
        }

        const visitorFrequency = await Visitor.findAll({
            where: whereClause,
            attributes: [
                'apartmentId',
                [sequelize.fn('COUNT', sequelize.col('id')), 'totalVisits'],
                [sequelize.fn('COUNT', sequelize.fn('DISTINCT', sequelize.col('identification'))), 'uniqueVisitors'],
                [sequelize.fn('MAX', sequelize.col('entryTime')), 'lastVisit']
            ],
            include: [{
                model: Apartment,
                attributes: ['number'],
                include: [{
                    model: Owner,
                    attributes: ['name', 'email']
                }]
            }],
            group: ['apartmentId', 'Apartment.id', 'Apartment.number', 'Apartment.Owner.id', 'Apartment.Owner.name', 'Apartment.Owner.email'],
            order: [[sequelize.fn('COUNT', sequelize.col('id')), 'DESC']]
        });

        res.status(200).json({
            success: true,
            data: visitorFrequency
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Generate custom report based on specified parameters
 */
export const generateCustomReport = async (req, res, next) => {
    try {
        const { 
            startDate, 
            endDate, 
            includeOwners, 
            includePayments, 
            includeVisitors, 
            includeApartments 
        } = req.body;

        const report = {
            timeframe: {
                start: startDate,
                end: endDate
            }
        };

        if (includeOwners) {
            report.owners = await Owner.findAll({
                attributes: ['id', 'name', 'email'],
                include: [{
                    model: Apartment,
                    attributes: ['number', 'status']
                }]
            });
        }

        if (includePayments) {
            const whereClause = {};
            if (startDate || endDate) {
                whereClause.date = {};
                if (startDate) whereClause.date[Op.gte] = new Date(startDate);
                if (endDate) whereClause.date[Op.lte] = new Date(endDate);
            }

            report.payments = await Payment.findAll({
                where: whereClause,
                include: [
                    { model: Owner, attributes: ['name', 'email'] },
                    { model: Apartment, attributes: ['number'] }
                ]
            });
        }

        if (includeVisitors) {
            const whereClause = {};
            if (startDate || endDate) {
                whereClause.entryTime = {};
                if (startDate) whereClause.entryTime[Op.gte] = new Date(startDate);
                if (endDate) whereClause.entryTime[Op.lte] = new Date(endDate);
            }

            report.visitors = await Visitor.findAll({
                where: whereClause,
                include: [{
                    model: Apartment,
                    attributes: ['number']
                }]
            });
        }

        if (includeApartments) {
            report.apartments = await Apartment.findAll({
                include: [{
                    model: Owner,
                    attributes: ['name', 'email']
                }]
            });
        }

        res.status(200).json({
            success: true,
            data: report
        });
    } catch (error) {
        next(error);
    }
};

// Utility function to calculate expected payments
const calculateTotalExpectedPayments = async (month, year) => {
    const apartmentCount = await Apartment.count();
    const monthlyFee = process.env.MONTHLY_FEE || 100000;
    return apartmentCount * monthlyFee;
};