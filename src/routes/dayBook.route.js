import { Router } from 'express';
const router = Router();
import { getSummary, create } from '../controllers/dayBook.controller.js';

router.get('/summary', getSummary);
router.post('/close', create);

export default router;
