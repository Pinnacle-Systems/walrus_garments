import express from 'express';
import { getSalesReport } from '../controllers/salesReport.controller.js';

const router = express.Router();

router.get('/', getSalesReport);

export default router;
