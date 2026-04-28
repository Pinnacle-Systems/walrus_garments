import express from 'express';
import { getSalesReport, getSalesmanSummaryReport, getOnlineSalesDeliveryReport } from '../controllers/salesReport.controller.js';

const router = express.Router();

router.get('/', getSalesReport);
router.get('/salesman-summary', getSalesmanSummaryReport);
router.get('/online-sales-delivery', getOnlineSalesDeliveryReport);

export default router;
