import express from 'express';
import {
  getNotifications,
  sendTestNotification,
  getStats,
  getClientNotifications,
  retryNotification,
} from '../controllers/notificationController.js';
import { authenticateToken } from '../middlewares/auth.js';
import { validateUUID } from '../middlewares/validation.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// GET /api/notifications/stats - Get notification statistics
router.get('/stats', getStats);

// GET /api/notifications/client/:clientId - Get notifications for a client
router.get('/client/:clientId', validateUUID('clientId'), getClientNotifications);

// POST /api/notifications/test - Send test notification
router.post('/test', sendTestNotification);

// POST /api/notifications/:id/retry - Retry failed notification
router.post('/:id/retry', validateUUID('id'), retryNotification);

// GET /api/notifications - Get all notifications
router.get('/', getNotifications);

export default router;
