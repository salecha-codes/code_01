import { Router } from 'express';
import { submitFeedback } from '../controllers/feedbackController.js';
export function feedbackRoutes(limiter) {
  const router = Router();
  router.post('/', limiter, submitFeedback);
  return router;
}
