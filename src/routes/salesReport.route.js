import express from 'express';
import { getSalesReport, getSalesmanSummaryReport, getOnlineSalesDeliveryReport, getOverAllSalesReport } from '../controllers/salesReport.controller.js';

const router = express.Router();

router.get('/', getSalesReport);
router.get('/salesman-summary', getSalesmanSummaryReport);
router.get('/online-sales-delivery', getOnlineSalesDeliveryReport);
router.get('/overall', getOverAllSalesReport);

export default router;
