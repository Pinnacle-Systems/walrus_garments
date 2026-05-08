import { 
    getSalesReport as _getSalesReport,
    getSalesmanSummaryReport as _getSalesmanSummaryReport,
    getOnlineSalesDeliveryReport as _getOnlineSalesDeliveryReport,
    getOverAllSalesReport as _getOverAllSalesReport
} from '../services/salesReport.service.js';

async function getSalesReport(req, res, next) {
    try {
        res.json(await _getSalesReport(req.query));
    } catch (err) {
        console.error(`Error `, err.message);
        res.status(500).json({ statusCode: 1, message: err.message });
    }
}

async function getSalesmanSummaryReport(req, res, next) {
    try {
        res.json(await _getSalesmanSummaryReport(req.query));
    } catch (err) {
        console.error(`Error `, err.message);
        res.status(500).json({ statusCode: 1, message: err.message });
    }
}

async function getOnlineSalesDeliveryReport(req, res, next) {
    try {
        res.json(await _getOnlineSalesDeliveryReport(req.query));
    } catch (err) {
        console.error(`Error `, err.message);
        res.status(500).json({ statusCode: 1, message: err.message });
    }
}

async function getOverAllSalesReport(req, res, next) {
    try {
        res.json(await _getOverAllSalesReport(req.query));
    } catch (err) {
        console.error(`Error `, err.message);
        res.status(500).json({ statusCode: 1, message: err.message });
    }
}

export {
    getSalesReport,
    getSalesmanSummaryReport,
    getOnlineSalesDeliveryReport,
    getOverAllSalesReport
};
