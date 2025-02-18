import { Router } from 'express';
import * as paymentController from '../controllers/paymentController.js';
import { auth } from '../middleware/auth.js';
import { roleCheck } from '../middleware/roleCheck.js';
import { validate } from '../middleware/validate.js';
import { paymentValidator } from '../utils/validators/paymentValidator.js';

const router = Router();

/**
 * @route   POST /api/payments
 * @desc    Register a new payment
 * @access  Private (Admin)
 */
router.post(
  '/',
  auth,
  roleCheck(['admin']),
  validate(paymentValidator.createPayment),
  paymentController.registerPayment
);

/**
 * @route   GET /api/payments
 * @desc    Get all payments with optional filters
 * @access  Private (Admin)
 */
router.get(
  '/',
  auth,
  roleCheck(['admin']),
  paymentController.getAllPayments
);

/**
 * @route   GET /api/payments/:id
 * @desc    Get payment by ID
 * @access  Private (Admin, Owner of the payment)
 */
router.get(
  '/:id',
  auth,
  roleCheck(['admin', 'owner']),
  paymentController.getPaymentById
);

/**
 * @route   PUT /api/payments/:id
 * @desc    Update payment information
 * @access  Private (Admin)
 */
router.put(
  '/:id',
  auth,
  roleCheck(['admin']),
  validate(paymentValidator.updatePayment),
  paymentController.updatePayment
);

/**
 * @route   DELETE /api/payments/:id
 * @desc    Delete a payment record
 * @access  Private (Admin)
 */
router.delete(
  '/:id',
  auth,
  roleCheck(['admin']),
  paymentController.deletePayment
);

/**
 * @route   GET /api/payments/owner/:ownerId
 * @desc    Get all payments for a specific owner
 * @access  Private (Admin, Owner)
 */
router.get(
  '/owner/:ownerId',
  auth,
  roleCheck(['admin', 'owner']),
  paymentController.getPaymentsByOwner
);

/**
 * @route   GET /api/payments/apartment/:apartmentId
 * @desc    Get all payments for a specific apartment
 * @access  Private (Admin, Owner of the apartment)
 */
router.get(
  '/apartment/:apartmentId',
  auth,
  roleCheck(['admin', 'owner']),
  paymentController.getPaymentsByApartment
);

/**
 * @route   GET /api/payments/pending
 * @desc    Get all pending payments
 * @access  Private (Admin)
 */
router.get(
  '/pending',
  auth,
  roleCheck(['admin']),
  paymentController.getPendingPayments
);

/**
 * @route   GET /api/payments/history
 * @desc    Get payment history with date range filter
 * @access  Private (Admin)
 */
router.get(
  '/history',
  auth,
  roleCheck(['admin']),
  paymentController.getPaymentHistory
);

export default router;