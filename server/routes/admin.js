// ============================================================
//  /api/admin routes — Product, Category, and Inventory Admin CRUD
// ============================================================
import { Router } from 'express';
import { AdminController } from '../controllers/AdminController.js';

const router = Router();

// Products
router.get('/products',     AdminController.listProducts);
router.post('/products',    AdminController.createProduct);
router.patch('/products/:id', AdminController.updateProduct);
router.delete('/products/:id', AdminController.deleteProduct);

// Categories
router.get('/categories',     AdminController.listCategories);
router.post('/categories',    AdminController.createCategory);
router.patch('/categories/:id', AdminController.updateCategory);
router.delete('/categories/:id', AdminController.deleteCategory);

// Inventory
router.get('/inventory',     AdminController.listInventory);
router.patch('/inventory/:id', AdminController.updateInventory);

// Orders
router.get('/orders',      AdminController.listOrders);
router.get('/orders/:id',  AdminController.getOrder);
router.patch('/orders/:id', AdminController.updateOrder);
router.delete('/orders/:id', AdminController.deleteOrder);

// Customers
router.get('/customers',      AdminController.listCustomers);
router.get('/customers/:id',  AdminController.getCustomer);
router.patch('/customers/:id', AdminController.updateCustomer);

// Coupons
router.get('/coupons',     AdminController.listCoupons);
router.post('/coupons',    AdminController.createCoupon);
router.patch('/coupons/:id', AdminController.updateCoupon);
router.delete('/coupons/:id', AdminController.deleteCoupon);

// Reviews
router.get('/reviews',           AdminController.listReviews);
router.patch('/reviews/:id/status', AdminController.updateReviewStatus);
router.delete('/reviews/:id',       AdminController.deleteReview);

export default router;
