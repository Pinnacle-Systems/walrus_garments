import { Router } from 'express';
const router = Router();
import {
    getTotalSales,
    getQuarterSales,
    getYearlySales,
    getMonthlySales,
    getWeeklySales,
    getYearlySalesTable,
    getQuarterSalesTable,
    getMonthlySalesTable,
    getWeeklySalesTable,
    getSlowMovement,
    getLowVelocityItems,
    getDeadStockItems
} from '../controllers/salesDashboard.controller.js';



router.get('/totalSales', getTotalSales);


router.get('/quarterSales', getQuarterSales);


router.get('/yearlySales', getYearlySales);


router.get('/monthlysales', getMonthlySales);

router.get('/weeklySales', getWeeklySales);

router.get('/yearlysalesTable', getYearlySalesTable);
router.get('/quartersalesTable', getQuarterSalesTable);
router.get('/monthlysalesTable', getMonthlySalesTable);
router.get('/weeklySalesTable', getWeeklySalesTable);


router.get("/slowMovingItems", getSlowMovement);
router.get("/slowMovingItemsByVelocity", getLowVelocityItems);
router.get("/deadStock", getDeadStockItems);

export default router;