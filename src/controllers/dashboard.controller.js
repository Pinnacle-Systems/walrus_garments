import * as dashboardService from '../services/dashboard.service.js';

const getManagementInsights = async (req, res) => {
    try {
        const result = await dashboardService.getManagementInsights(req.query);
        res.status(result.statusCode === 0 ? 200 : 400).json(result);
    } catch (error) {
        res.status(500).json({ statusCode: 1, message: error.message });
    }
};

const getSalesAnalytics = async (req, res) => {
    try {
        const result = await dashboardService.getSalesAnalytics(req.query);
        res.status(result.statusCode === 0 ? 200 : 400).json(result);
    } catch (error) {
        res.status(500).json({ statusCode: 1, message: error.message });
    }
};

const getSalesBreakup = async (req, res) => {
    try {
        const result = await dashboardService.getSalesBreakup(req.query);
        res.status(result.statusCode === 0 ? 200 : 400).json(result);
    } catch (error) {
        res.status(500).json({ statusCode: 1, message: error.message });
    }
};

export { getManagementInsights, getSalesAnalytics, getSalesBreakup };
