import { Router } from 'express';
import { publicEvents } from '../controllers/eventController.js';
const router = Router();
router.get('/', publicEvents);
export default router;
