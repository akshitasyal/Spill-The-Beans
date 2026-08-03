// ============================================================
//  /api/admin routes — Full Admin API
// ============================================================
import { Router } from 'express';
import { AdminController } from '../controllers/AdminController.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = Router();

// Protect all admin endpoints
router.use(requireAuth);
router.use(requireAdmin);


// ── Products ──────────────────────────────────────────────
router.get('/products',          AdminController.listProducts);
router.post('/products',         AdminController.createProduct);
router.patch('/products/:id',    AdminController.updateProduct);
router.delete('/products/:id',   AdminController.deleteProduct);

// ── Categories ────────────────────────────────────────────
router.get('/categories',        AdminController.listCategories);
router.post('/categories',       AdminController.createCategory);
router.patch('/categories/:id',  AdminController.updateCategory);
router.delete('/categories/:id', AdminController.deleteCategory);

// ── Inventory ─────────────────────────────────────────────
router.get('/inventory',         AdminController.listInventory);
router.patch('/inventory/:id',   AdminController.updateInventory);

// ── Inventory History ─────────────────────────────────────
router.get('/inventory/history',  AdminController.listInventoryHistory);
router.post('/inventory/history', AdminController.createInventoryLog);

// ── Orders ────────────────────────────────────────────────
router.get('/orders',                 AdminController.listOrders);
router.get('/orders/:id',             AdminController.getOrder);
router.patch('/orders/:id/status',    AdminController.updateOrder);
router.patch('/orders/:id/courier',   AdminController.updateCourier);
router.post('/orders/:id/audit-log',  AdminController.logAuditAction);
router.patch('/orders/:id',           AdminController.updateOrder);
router.delete('/orders/:id',          AdminController.deleteOrder);

// ── Customers ─────────────────────────────────────────────
router.get('/customers',         AdminController.listCustomers);
router.get('/customers/:id',     AdminController.getCustomer);
router.patch('/customers/:id',   AdminController.updateCustomer);

// ── Coupons ───────────────────────────────────────────────
router.get('/coupons',           AdminController.listCoupons);
router.post('/coupons',          AdminController.createCoupon);
router.patch('/coupons/:id',     AdminController.updateCoupon);
router.delete('/coupons/:id',    AdminController.deleteCoupon);

// ── Reviews ───────────────────────────────────────────────
router.get('/reviews',                    AdminController.listReviews);
router.post('/reviews',                   AdminController.createReview);
router.patch('/reviews/:id/status',       AdminController.updateReviewStatus);
router.delete('/reviews/:id',             AdminController.deleteReview);

// ── Notifications ─────────────────────────────────────────
// Specific sub-routes MUST come before /:id to avoid conflicts
router.get('/notifications/unread-count', AdminController.getUnreadCount);
router.patch('/notifications/read-all',   AdminController.markAllNotificationsRead);
router.delete('/notifications/clear-read',AdminController.clearReadNotifications);
router.get('/notifications',              AdminController.listNotifications);
router.post('/notifications',             AdminController.createNotification);
router.patch('/notifications/:id/read',   AdminController.markNotificationRead);
router.delete('/notifications/:id',       AdminController.deleteNotification);

// ── Newsletter Subscribers ────────────────────────────────
router.get('/newsletter',                 AdminController.listSubscribers);
router.post('/newsletter/bulk-delete',    AdminController.bulkDeleteSubscribers);
router.delete('/newsletter/:id',          AdminController.deleteSubscriber);

// ── Analytics ─────────────────────────────────────────────
router.get('/analytics',                  AdminController.getAnalytics);

export default router;

