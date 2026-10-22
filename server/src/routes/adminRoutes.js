import { Router } from 'express';
import { requireAuth, requireCsrf } from '../middleware/authMiddleware.js';
import { listFeedback } from '../controllers/feedbackController.js';
import { statistics } from '../controllers/analyticsController.js';
import { adminEvents, createEvent, updateEvent } from '../controllers/eventController.js';
export function adminRoutes(config) {
  const router = Router();
  router.use(requireAuth(config), requireCsrf(config));
  router.get('/feedback', listFeedback);
  router.get('/stats', statistics);
  router.get('/events', adminEvents);
  router.post('/events', createEvent);
  router.patch('/events/:id', updateEvent);
  return router;
}
