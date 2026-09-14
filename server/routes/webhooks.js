// ============================================================
//  /api/webhooks routes
// ============================================================
import { Router } from 'express';
import { WebhookController } from '../controllers/WebhookController.js';

const router = Router();

router.post('/shipmate', WebhookController.handleShipMateWebhook);

export default router;
