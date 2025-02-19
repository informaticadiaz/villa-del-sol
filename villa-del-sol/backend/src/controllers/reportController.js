import { Owner } from '../models/Owner.js';
import { Apartment } from '../models/Apartment.js';
import { Payment } from '../models/Payment.js';
import { Visitor } from '../models/Visitor.js';
import { createError } from '../utils/error.js';

/**
 * Generate report of all owners and their properties
 * @param {Request} req 
 * @param {Response} res 
 * @param {NextFunction} next 
 */
export const generateOwnersReport = async (req, res, next) => {
    try {
        const owners = await Owner.find().select('-password');
        
        // Get apartments for each owner
        const ownersData = await Promise.all(owners.map(async (owner) => {
            const apartments = await Apartment.find({ owner: owner._id });
            const payments = await Payment.find({ owner: owner._id });
            
            const totalPayments = payments.reduce((sum, payment) => sum + payment.amount, 0);
            const pendingPayments = payments
                .filter(payment => payment.status === 'pending')
                .reduce((sum, payment) => sum + payment.amount, 0);

            return {
                ownerInfo: owner,
                apartments: apartments,
                statistics: {
                    totalApartments: apartments.length,
                    totalPayments,
                    pendingPayments,
                    paymentStatus: totalPayments > 0 ? 
                        ((totalPayments - pendingPayments) / totalPayments * 100).toFixed(2) + '%' : 
                        '0%'
                }
            };
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
 * @param {Request} req 
 * @param {Response} res 
 * @param {NextFunction} next 
 */
export const generatePaymentsReport = async (req, res, next) => {
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
        
        // Group payments by month
        const monthlyPayments = payments.reduce((acc, payment) => {
            const month = payment.date.toLocaleString('default', { month: 'long', year: 'numeric' });
            if (!acc[month]) {
                acc[month] = {
                    total: 0,
                    paid: 0,
                    pending: 0
                };
            }
            acc[month].total += payment.amount;
            if (payment.status === 'paid') {
                acc[month].paid += payment.amount;
            } else {
                acc[month].pending += payment.amount;
            }
            return acc;
        }, {});

        res.status(200).json({
            success: true,
            summary: {
                totalAmount,
                paidAmount,
                pendingAmount: totalAmount - paidAmount,
                collectionRate: totalAmount > 0 ? 
                    ((paidAmount / totalAmount) * 100).toFixed(2) + '%' : 
                    '0%',
                totalPayments: payments.length,
                paidPayments: payments.filter(p => p.status === 'paid').length,
                pendingPayments: payments.filter(p => p.status === 'pending').length
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
 * @param {Request} req 
 * @param {Response} res 
 * @param {NextFunction} next 
 */
export const generateVisitorsReport = async (req, res, next) => {
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
        const totalVisits = visitors.length;
        const uniqueVisitors = new Set(visitors.map(v => v.identification)).size;
        
        // Group by apartment
        const visitorsByApartment = visitors.reduce((acc, visitor) => {
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

        // Convert Set to size for JSON
        Object.keys(visitorsByApartment).forEach(apt => {
            visitorsByApartment[apt].uniqueVisitors = visitorsByApartment[apt].uniqueVisitors.size;
        });

        res.status(200).json({
            success: true,
            summary: {
                totalVisits,
                uniqueVisitors,
                averageVisitDuration: calculateAverageVisitDuration(visitors),
                mostVisitedApartments: getMostVisitedApartments(visitorsByApartment)
            },
            byApartment: visitorsByApartment,
            data: visitors
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Generate report of apartment occupancy status
 * @param {Request} req 
 * @param {Response} res 
 * @param {NextFunction} next 
 */
export const generateApartmentStatusReport = async (req, res, next) => {
    try {
        const apartments = await Apartment.find()
            .populate('owner', 'name email')
            .sort({ number: 1 });

        const totalApartments = apartments.length;
        const occupiedApartments = apartments.filter(apt => apt.status === 'occupied').length;
        
        // Group by floor
        const byFloor = apartments.reduce((acc, apt) => {
            const floor = Math.floor(apt.number / 100); // Assuming apartment numbers like 101, 102, etc.
            if (!acc[floor]) {
                acc[floor] = {
                    total: 0,
                    occupied: 0,
                    unoccupied: 0
                };
            }
            acc[floor].total++;
            acc[floor][apt.status]++;
            return acc;
        }, {});

        res.status(200).json({
            success: true,
            summary: {
                totalApartments,
                occupiedApartments,
                unoccupiedApartments: totalApartments - occupiedApartments,
                occupancyRate: ((occupiedApartments / totalApartments) * 100).toFixed(2) + '%'
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
 * @param {Request} req 
 * @param {Response} res 
 * @param {NextFunction} next 
 */
export const generatePendingPaymentsReport = async (req, res, next) => {
    try {
        const pendingPayments = await Payment.find({ status: 'pending' })
            .populate('owner', 'name email')
            .populate('apartment', 'number')
            .sort({ dueDate: 1 });

        // Group by owner
        const byOwner = pendingPayments.reduce((acc, payment) => {
            const ownerId = payment.owner._id.toString();
            if (!acc[ownerId]) {
                acc[ownerId] = {
                    ownerInfo: payment.owner,
                    totalPending: 0,
                    payments: []
                };
            }
            acc[ownerId].totalPending += payment.amount;
            acc[ownerId].payments.push(payment);
            return acc;
        }, {});

        const totalPending = pendingPayments.reduce((sum, payment) => sum + payment.amount, 0);

        res.status(200).json({
            success: true,
            summary: {
                totalPendingAmount: totalPending,
                totalPendingPayments: pendingPayments.length,
                uniqueOwnersWithPending: Object.keys(byOwner).length
            },
            byOwner,
            data: pendingPayments
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Generate monthly payment collection report
 * @param {Request} req 
 * @param {Response} res 
 * @param {NextFunction} next 
 */
export const generateMonthlyPaymentsReport = async (req, res, next) => {
    try {
        const { month, year } = req.query;
        if (!month || !year) {
            return next(createError(400, 'Se requiere mes y año'));
        }

        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0);

        const payments = await Payment.find({
            date: {
                $gte: startDate,
                $lte: endDate
            }
        }).populate('owner', 'name email')
          .populate('apartment', 'number');

        const totalExpected = await calculateTotalExpectedPayments(month, year);
        const totalCollected = payments
            .filter(payment => payment.status === 'paid')
            .reduce((sum, payment) => sum + payment.amount, 0);

        res.status(200).json({
            success: true,
            summary: {
                month: startDate.toLocaleString('default', { month: 'long' }),
                year,
                totalExpected,
                totalCollected,
                collectionRate: ((totalCollected / totalExpected) * 100).toFixed(2) + '%',
                totalPayments: payments.length,
                paidPayments: payments.filter(p => p.status === 'paid').length
            },
            data: payments
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Generate report of visitor frequency by apartment
 * @param {Request} req 
 * @param {Response} res 
 * @param {NextFunction} next 
 */
export const generateVisitorFrequencyReport = async (req, res, next) => {
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
            .populate({
                path: 'apartment',
                populate: {
                    path: 'owner',
                    select: 'name email'
                }
            });

        // Calculate frequency statistics
        const frequencyStats = calculateVisitorFrequency(visitors);

        res.status(200).json({
            success: true,
            summary: {
                totalVisits: visitors.length,
                periodStart: startDate || 'All time',
                periodEnd: endDate || 'Current',
                averageVisitsPerApartment: (visitors.length / frequencyStats.uniqueApartments).toFixed(2)
            },
            frequency: frequencyStats.byApartment,
            data: visitors
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Generate custom report based on specified parameters
 * @param {Request} req 
 * @param {Response} res 
 * @param {NextFunction} next 
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
            report.owners = await generateOwnerSection();
        }

        if (includePayments) {
            report.payments = await generatePaymentSection(startDate, endDate);
        }

        if (includeVisitors) {
            report.visitors = await generateVisitorSection(startDate, endDate);
        }

        if (includeApartments) {
            report.apartments = await generateApartmentSection();
        }

        res.status(200).json({
            success: true,
            data: report
        });
    } catch (error) {
        next(error);
    }
};

// Utility functions
const calculateAverageVisitDuration = (visitors) => {
    const completedVisits = visitors.filter(v => v.exitTime);
    if (completedVisits.length === 0) return 'N/A';

    const totalDuration = completedVisits.reduce((sum, visit) => {
        return sum + (new Date(visit.exitTime) - new Date(visit.entryTime));
    }, 0);

    const avgMinutes = totalDuration / (completedVisits.length * 60000);
    return `${Math.round(avgMinutes)} minutes`;
};

const getMostVisitedApartments = (visitorsByApartment, limit = 5) => {
    return Object.entries(visitorsByApartment)
        .sort((a, b) => b[1].totalVisits - a[1].totalVisits)
        .slice(0, limit)
        .map(([aptNumber, stats]) => ({
            apartmentNumber: aptNumber,
            ...stats
        }));
};

const calculateVisitorFrequency = (visitors) => {
    const byApartment = visitors.reduce((acc, visitor) => {
        const aptNumber = visitor.apartment.number;
        if (!acc[aptNumber]) {
            acc[aptNumber] = {
                apartmentInfo: {
                    number: aptNumber,
                    owner: visitor.apartment.owner
                },
                visitCount: 0,
                uniqueVisitors: new Set(),
                averageVisitDuration: 0,
                lastVisit: null
            };
        }
        acc[aptNumber].visitCount++;
        acc[aptNumber].uniqueVisitors.add(visitor.identification);
        acc[aptNumber].lastVisit = visitor.entryTime;
        return acc;
    }, {});

    // Convert Sets to sizes and calculate final stats
    Object.values(byApartment).forEach(apt => {
        apt.uniqueVisitors = apt.uniqueVisitors.size;
    });

    return {
        uniqueApartments: Object.keys(byApartment).length,
        byApartment
    };
};

const calculateTotalExpectedPayments = async (month, year) => {
    const apartments = await Apartment.find();
    // Assuming a fixed monthly fee per apartment
    const monthlyFee = process.env.MONTHLY_FEE || 100000; // Default value if not set
    return apartments.length * monthlyFee;
};

const generateOwnerSection = async () => {
    const owners = await Owner.find().select('-password');
    const ownerStats = await Promise.all(owners.map(async (owner) => {
        const apartments = await Apartment.find({ owner: owner._id });
        const payments = await Payment.find({ owner: owner._id });
        
        return {
            owner: {
                id: owner._id,
                name: owner.name,
                email: owner.email
            },
            apartmentCount: apartments.length,
            paymentStats: {
                total: payments.reduce((sum, p) => sum + p.amount, 0),
                pending: payments
                    .filter(p => p.status === 'pending')
                    .reduce((sum, p) => sum + p.amount, 0)
            }
        };
    }));

    return ownerStats;
};

const generatePaymentSection = async (startDate, endDate) => {
    const query = {};
    if (startDate || endDate) {
        query.date = {};
        if (startDate) query.date.$gte = new Date(startDate);
        if (endDate) query.date.$lte = new Date(endDate);
    }

    const payments = await Payment.find(query)
        .populate('owner', 'name email')
        .populate('apartment', 'number');

    return {
        total: payments.reduce((sum, p) => sum + p.amount, 0),
        count: payments.length,
        paid: payments.filter(p => p.status === 'paid').length,
        pending: payments.filter(p => p.status === 'pending').length
    };
};

const generateVisitorSection = async (startDate, endDate) => {
    const query = {};
    if (startDate || endDate) {
        query.entryTime = {};
        if (startDate) query.entryTime.$gte = new Date(startDate);
        if (endDate) query.entryTime.$lte = new Date(endDate);
    }

    const visitors = await Visitor.find(query);
    
    return {
        totalVisits: visitors.length,
        uniqueVisitors: new Set(visitors.map(v => v.identification)).size,
        averageDuration: calculateAverageVisitDuration(visitors)
    };
};

const generateApartmentSection = async () => {
    const apartments = await Apartment.find();
    
    return {
        total: apartments.length,
        occupied: apartments.filter(a => a.status === 'occupied').length,
        unoccupied: apartments.filter(a => a.status === 'unoccupied').length,
        byFloor: apartments.reduce((acc, apt) => {
            const floor = Math.floor(apt.number / 100);
            if (!acc[floor]) acc[floor] = 0;
            acc[floor]++;
            return acc;
        }, {})
    };
};