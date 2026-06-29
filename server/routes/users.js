// ============================================================
//  /api/users routes
// ============================================================
import { Router } from 'express';
import { UserController } from '../controllers/UserController.js';
import { validate } from '../middleware/validate.js';
import { createUserSchema, updateUserSchema, addressSchema } from '../validation/schemas.js';

const router = Router();

// Profile
router.post('/',                         validate(createUserSchema),  UserController.upsert);
router.get('/:clerkId',                                               UserController.getByClerkId);
router.patch('/:clerkId',                validate(updateUserSchema),  UserController.update);

// Addresses
router.get('/:clerkId/addresses',                                     UserController.getAddresses);
router.post('/:clerkId/addresses',       validate(addressSchema),     UserController.addAddress);
router.patch('/:clerkId/addresses/:addressId', validate(addressSchema.partial()), UserController.updateAddress);
router.delete('/:clerkId/addresses/:addressId',                       UserController.deleteAddress);

export default router;
