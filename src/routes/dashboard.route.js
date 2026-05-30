import express from 'express';
import * as dashboardController from '../controllers/dashboard.controller.js';

const router = express.Router();

router.get('/management-insights', dashboardController.getManagementInsights);
router.get('/sales-analytics', dashboardController.getSalesAnalytics);
router.get('/sales-breakup', dashboardController.getSalesBreakup);

export default router;
