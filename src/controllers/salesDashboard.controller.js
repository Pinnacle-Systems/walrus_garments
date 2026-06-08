import pkg from '@prisma/client';
const { Prisma } = pkg;

import {
    getTotalSales as _getTotalSales,
    getQuarterSales as _getQuarterSales,
    getYearlySales as _getYearlySales,
    getMonthlySales as _getMonthlySales,
    getWeeklySales as _getWeeklySales,
    getYearlySalesTable as _getYearlySalesTable,
    getQuarterSalesTable as _getQuarterSalesTable,
    getMonthlySalesTable as _getMonthlySalesTable,
    getWeeklySalesTable as _getWeeklySalesTable,
    getSlowMovement as _getSlowMovement,
    getLowVelocityItems as _getLowVelocityItems,
    getDeadStockItems as _getDeadStockItems
} from '../services/salesDashboard.service.js';

async function getTotalSales(req, res, next) {
    try {
        res.json(await _getTotalSales(req));
    } catch (err) {
        console.error(`Error `, err.message);
        res.status(500).json({ statusCode: 1, message: err.message });
    }
}

async function getQuarterSales(req, res, next) {
    try {
        res.json(await _getQuarterSales(req));
    } catch (err) {
        console.error(`Error `, err.message);
        res.status(500).json({ statusCode: 1, message: err.message });
    }
}

async function getYearlySales(req, res, next) {
    try {
        res.json(await _getYearlySales(req));
    } catch (err) {
        console.error(`Error `, err.message);
        res.status(500).json({ statusCode: 1, message: err.message });
    }
}


async function getMonthlySales(req, res, next) {
    try {
        res.json(await _getMonthlySales(req));
    } catch (err) {
        console.error(`Error `, err.message);
        res.status(500).json({ statusCode: 1, message: err.message });
    }
}


async function getWeeklySales(req, res, next) {
    try {
        res.json(await _getWeeklySales(req));
    } catch (err) {
        console.error(`Error `, err.message);
        res.status(500).json({ statusCode: 1, message: err.message });
    }
}

async function getYearlySalesTable(req, res, next) {
    try {
        res.json(await _getYearlySalesTable(req));
    } catch (err) {
        console.error(`Error `, err.message);
        res.status(500).json({ statusCode: 1, message: err.message });
    }
}

async function getQuarterSalesTable(req, res, next) {
    try {
        res.json(await _getQuarterSalesTable(req));
    } catch (err) {
        console.error(`Error `, err.message);
        res.status(500).json({ statusCode: 1, message: err.message });
    }
}

async function getMonthlySalesTable(req, res, next) {
    try {
        res.json(await _getMonthlySalesTable(req));
    } catch (err) {
        console.error(`Error `, err.message);
        res.status(500).json({ statusCode: 1, message: err.message });
    }
}

async function getWeeklySalesTable(req, res, next) {
    try {
        res.json(await _getWeeklySalesTable(req));
    } catch (err) {
        console.error(`Error `, err.message);
        res.status(500).json({ statusCode: 1, message: err.message });
    }
}


async function getSlowMovement(req, res, next) {
    try {
        res.json(await _getSlowMovement(req));
    } catch (err) {
        console.error(`Error `, err.message);
        res.status(500).json({ statusCode: 1, message: err.message });
    }
}


async function getLowVelocityItems(req, res, next) {
    try {
        res.json(await _getLowVelocityItems(req));
    } catch (err) {
        console.error(`Error `, err.message);
        res.status(500).json({ statusCode: 1, message: err.message });
    }
}


async function getDeadStockItems(req, res, next) {
    try {
        res.json(await _getDeadStockItems(req));
    } catch (err) {
        console.error(`Error `, err.message);
        res.status(500).json({ statusCode: 1, message: err.message });
    }
}



export {
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
};
