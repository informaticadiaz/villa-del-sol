import { Router } from 'express';
import * as ownerController from '../controllers/ownerController.js';
import { auth } from '../middleware/auth.js';
import { roleCheck } from '../middleware/roleCheck.js';
import { validate } from '../middleware/validate.js';
import { ownerValidator } from '../utils/validators/ownerValidator.js';

const router = Router();

/**
 * @route GET /api/owners
 * @desc Get all owners
 * @access Private - Admin only
 */
router.get(
  '/',
  auth,
  roleCheck(['admin']),
  ownerController.getAllOwners
);

/**
 * @route GET /api/owners/:id
 * @desc Get owner by ID
 * @access Private - Admin and Owner
 */
router.get(
  '/:id',
  auth,
  roleCheck(['admin', 'owner']),
  ownerController.getOwnerById
);

/**
 * @route POST /api/owners
 * @desc Create a new owner
 * @access Private - Admin only
 */
router.post(
  '/',
  auth,
  roleCheck(['admin']),
  validate(ownerValidator.createOwner),
  ownerController.createOwner
);

/**
 * @route PUT /api/owners/:id
 * @desc Update owner information
 * @access Private - Admin and Owner (self)
 */
router.put(
  '/:id',
  auth,
  roleCheck(['admin', 'owner']),
  validate(ownerValidator.updateOwner),
  ownerController.updateOwner
);

/**
 * @route DELETE /api/owners/:id
 * @desc Delete an owner
 * @access Private - Admin only
 */
router.delete(
  '/:id',
  auth,
  roleCheck(['admin']),
  ownerController.deleteOwner
);

/**
 * @route GET /api/owners/:id/apartments
 * @desc Get all apartments belonging to an owner
 * @access Private - Admin and Owner (self)
 */
router.get(
  '/:id/apartments',
  auth,
  roleCheck(['admin', 'owner']),
  ownerController.getOwnerApartments
);

/**
 * @route GET /api/owners/:id/payments
 * @desc Get payment history for an owner
 * @access Private - Admin and Owner (self)
 */
router.get(
  '/:id/payments',
  auth,
  roleCheck(['admin', 'owner']),
  ownerController.getOwnerPayments
);

/**
 * @route GET /api/owners/:id/visitors
 * @desc Get visitor history for an owner's apartments
 * @access Private - Admin and Owner (self)
 */
router.get(
  '/:id/visitors',
  auth,
  roleCheck(['admin', 'owner']),
  ownerController.getOwnerVisitors
);

export default router;