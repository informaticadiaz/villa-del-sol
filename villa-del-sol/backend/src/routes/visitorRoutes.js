import { Router } from 'express';
import * as visitorController from '../controllers/visitorController.js';
import { auth } from '../middleware/auth.js';
import { roleCheck } from '../middleware/roleCheck.js';
import { validate } from '../middleware/validate.js';
import { visitorValidator } from '../utils/validators/visitorValidator.js';

const router = Router();

/**
 * @route   POST /api/visitors
 * @desc    Register a new visitor
 * @access  Private (Admin, Security Guard)
 */
router.post(
  '/',
  auth,
  roleCheck(['admin', 'security']),
  validate(visitorValidator.createVisitor),
  visitorController.registerVisitor
);

/**
 * @route   GET /api/visitors
 * @desc    Get all visitors with optional filters
 * @access  Private (Admin, Security Guard)
 */
router.get(
  '/',
  auth,
  roleCheck(['admin', 'security']),
  visitorController.getAllVisitors
);

/**
 * @route   GET /api/visitors/:id
 * @desc    Get visitor by ID
 * @access  Private (Admin, Security Guard)
 */
router.get(
  '/:id',
  auth,
  roleCheck(['admin', 'security']),
  visitorController.getVisitorById
);

/**
 * @route   PUT /api/visitors/:id
 * @desc    Update visitor information
 * @access  Private (Admin, Security Guard)
 */
router.put(
  '/:id',
  auth,
  roleCheck(['admin', 'security']),
  validate(visitorValidator.updateVisitor),
  visitorController.updateVisitor
);

/**
 * @route   PATCH /api/visitors/:id/checkout
 * @desc    Register visitor checkout time
 * @access  Private (Admin, Security Guard)
 */
router.patch(
  '/:id/checkout',
  auth,
  roleCheck(['admin', 'security']),
  visitorController.checkoutVisitor
);

/**
 * @route   GET /api/visitors/apartment/:apartmentId
 * @desc    Get all visitors for a specific apartment
 * @access  Private (Admin, Security Guard, Owner of the apartment)
 */
router.get(
  '/apartment/:apartmentId',
  auth,
  roleCheck(['admin', 'security', 'owner']),
  visitorController.getVisitorsByApartment
);

/**
 * @route   GET /api/visitors/current
 * @desc    Get all current visitors (not checked out)
 * @access  Private (Admin, Security Guard)
 */
router.get(
  '/current',
  auth,
  roleCheck(['admin', 'security']),
  visitorController.getCurrentVisitors
);

/**
 * @route   GET /api/visitors/history
 * @desc    Get visitor history with date range filter
 * @access  Private (Admin)
 */
router.get(
  '/history',
  auth,
  roleCheck(['admin']),
  visitorController.getVisitorHistory
);

export default router;