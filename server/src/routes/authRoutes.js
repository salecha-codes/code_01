import { Router } from 'express';
import { authController } from '../controllers/authController.js';
import { requireAuth, requireCsrf } from '../middleware/authMiddleware.js';
export function authRoutes(config, loginLimiter) {
  const router = Router();
  const controller = authController(config);
  router.post('/login', loginLimiter, controller.login);
  router.get('/me', requireAuth(config), controller.me);
  router.post('/logout', requireAuth(config), requireCsrf(config), controller.logout);
  return router;
}
