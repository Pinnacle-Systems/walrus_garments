import { getDayBookSummary as _getSummary, createDayBook as _create } from '../services/dayBook.service.js';

async function getSummary(req, res, next) {
    try {
        res.json(await _getSummary(req));
    } catch (err) {
        console.error(`Error in getDayBookSummary: `, err.message);
        res.status(500).json({ statusCode: 1, message: err.message });
    }
}

async function create(req, res, next) {
    try {
        res.json(await _create(req.body));
    } catch (err) {
        console.error(`Error in createDayBook: `, err.message);
        res.status(500).json({ statusCode: 1, message: err.message });
    }
}

export {
    getSummary,
    create
};
