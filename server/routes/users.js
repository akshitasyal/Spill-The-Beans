// ============================================================
//  /api/users routes
// ============================================================
import { Router } from 'express';
import { UserController } from '../controllers/UserController.js';
import { validate } from '../middleware/validate.js';
import { updateUserSchema, addressSchema } from '../validation/schemas.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// Require authentication for user routes
router.use(requireAuth);

// Profile
router.get('/me',                                                    UserController.getByClerkId);
router.get('/:clerkId',                                              UserController.getByClerkId);
router.patch('/me',                      validate(updateUserSchema), UserController.update);
router.patch('/:clerkId',                validate(updateUserSchema), UserController.update);

// Addresses
router.get('/addresses',                                             UserController.getAddresses);
router.get('/:clerkId/addresses',                                    UserController.getAddresses);
router.post('/addresses',                validate(addressSchema),    UserController.addAddress);
router.post('/:clerkId/addresses',       validate(addressSchema),    UserController.addAddress);
router.patch('/addresses/:addressId',    validate(addressSchema.partial()), UserController.updateAddress);
router.patch('/:clerkId/addresses/:addressId', validate(addressSchema.partial()), UserController.updateAddress);
router.delete('/addresses/:addressId',                              UserController.deleteAddress);
router.delete('/:clerkId/addresses/:addressId',                      UserController.deleteAddress);

export default router;

