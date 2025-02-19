import { Router } from 'express';
import * as reportController from '../controllers/reportController.js';
import { auth } from '../middleware/auth.js';
import { roleCheck } from '../middleware/roleCheck.js';
import { validate } from '../middleware/validate.js';
import reportValidator from '../utils/validators/reportValidator.js';

const router = Router();

/**
 * @route   GET /api/reports/owners
 * @desc    Generate report of all owners and their properties
 * @access  Private (Admin)
 */
router.get(
    '/owners',
    auth,
    roleCheck(['admin']),
    reportController.generateOwnersReport
);

/**
 * @route   GET /api/reports/payments
 * @desc    Generate payment status report with optional date range
 * @access  Private (Admin)
 */
router.get(
    '/payments',
    auth,
    roleCheck(['admin']),
    validate(reportValidator.dateRangeValidation),
    reportController.generatePaymentsReport
);

/**
 * @route   GET /api/reports/visitors
 * @desc    Generate visitor statistics report
 * @access  Private (Admin)
 */
router.get(
    '/visitors',
    auth,
    roleCheck(['admin']),
    validate(reportValidator.dateRangeValidation),
    reportController.generateVisitorsReport
);

/**
 * @route   GET /api/reports/apartments/status
 * @desc    Generate report of apartment occupancy status
 * @access  Private (Admin)
 */
router.get(
    '/apartments/status',
    auth,
    roleCheck(['admin']),
    reportController.generateApartmentStatusReport
);

/**
 * @route   GET /api/reports/payments/pending
 * @desc    Generate report of pending payments
 * @access  Private (Admin)
 */
router.get(
    '/payments/pending',
    auth,
    roleCheck(['admin']),
    reportController.generatePendingPaymentsReport
);

/**
 * @route   GET /api/reports/payments/monthly
 * @desc    Generate monthly payment collection report
 * @access  Private (Admin)
 */
router.get(
    '/payments/monthly',
    auth,
    roleCheck(['admin']),
    validate(reportValidator.monthYearValidation),
    reportController.generateMonthlyPaymentsReport
);

/**
 * @route   GET /api/reports/visitors/frequency
 * @desc    Generate report of visitor frequency by apartment
 * @access  Private (Admin)
 */
router.get(
    '/visitors/frequency',
    auth,
    roleCheck(['admin']),
    validate(reportValidator.dateRangeValidation),
    reportController.generateVisitorFrequencyReport
);

/**
 * @route   POST /api/reports/custom
 * @desc    Generate custom report based on specified parameters
 * @access  Private (Admin)
 */
router.post(
    '/custom',
    auth,
    roleCheck(['admin']),
    validate(reportValidator.customReportValidation),
    reportController.generateCustomReport
);

export default router;