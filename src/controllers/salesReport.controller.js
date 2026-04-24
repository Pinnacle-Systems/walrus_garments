import { getSalesReport as _getSalesReport } from '../services/salesReport.service.js';

async function getSalesReport(req, res, next) {
    try {
        res.json(await _getSalesReport(req.query));
    } catch (err) {
        console.error(`Error `, err.message);
        res.status(500).json({ statusCode: 1, message: err.message });
    }
}

export {
    getSalesReport
};
