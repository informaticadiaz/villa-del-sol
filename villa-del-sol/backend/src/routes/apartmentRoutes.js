import { Router } from 'express';
import { 
    createApartment,
    getApartments,
    getApartmentById,
    updateApartment,
    deleteApartment,
    getApartmentsByOwner,
    updateApartmentStatus
} from '../controllers/apartmentController.js';
import { validate } from '../middleware/validate.js';
import { apartmentValidator } from '../utils/validators/apartmentValidator.js';
import { auth } from '../middleware/auth.js';
import { roleCheck } from '../middleware/roleCheck.js';

const router = Router();

/**
 * @route   POST /api/apartments
 * @desc    Create a new apartment
 * @access  Private (Admin)
 */
router.post('/', 
    auth, 
    roleCheck(['admin']), 
    validate(apartmentValidator.createApartment),
    createApartment
);

/**
 * @route   GET /api/apartments
 * @desc    Get all apartments with optional filters
 * @access  Private (Admin)
 */
router.get('/', 
    auth, 
    roleCheck(['admin']), 
    getApartments
);

/**
 * @route   GET /api/apartments/:id
 * @desc    Get apartment by ID
 * @access  Private (Admin, Owner of the apartment)
 */
router.get('/:id', 
    auth, 
    roleCheck(['admin', 'owner']), 
    getApartmentById
);

/**
 * @route   PUT /api/apartments/:id
 * @desc    Update apartment information
 * @access  Private (Admin)
 */
router.put('/:id', 
    auth, 
    roleCheck(['admin']), 
    validate(apartmentValidator.updateApartment),
    updateApartment
);

/**
 * @route   DELETE /api/apartments/:id
 * @desc    Delete an apartment
 * @access  Private (Admin)
 */
router.delete('/:id', 
    auth, 
    roleCheck(['admin']), 
    deleteApartment
);

/**
 * @route   GET /api/apartments/owner/:ownerId
 * @desc    Get all apartments belonging to a specific owner
 * @access  Private (Admin, Owner)
 */
router.get('/owner/:ownerId', 
    auth, 
    roleCheck(['admin', 'owner']), 
    getApartmentsByOwner
);

/**
 * @route   PATCH /api/apartments/:id/status
 * @desc    Update apartment status (occupied/unoccupied)
 * @access  Private (Admin)
 */
router.patch('/:id/status', 
    auth, 
    roleCheck(['admin']), 
    validate(apartmentValidator.updateStatus),
    updateApartmentStatus
);

export default router;