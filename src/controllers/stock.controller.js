import { Prisma } from '@prisma/client'

import {
    get as _get, getOne as _getOne, getSearch as _getSearch, create as _create, update as _update, remove as _remove,
    getPcsStock as _getPcsStock,
    _getAccessory,
    getMinStockAlertReport as _getMinStockAlertReport,
    _getOneAccessory, getStockReport as _getStockReport,
    createOpeningStock as _createOpeningStock,
    getUnifiedStock as _getUnifiedStock,
    getUnifiedStockReport as _getUnifiedStockReport,
    getUnifiedStockWithLegacyByBarcode as _getUnifiedStockWithLegacyByBarcode
} from '../services/stock.service.js';

async function get(req, res, next) {
    try {
        res.json(await _get(req));
        console.log(res.statusCode);
    } catch (err) {
        console.error(`Error `, err.message);
    }
}
export async function getPcsStock(req, res, next) {
    try {
        res.json(await _getPcsStock(req));
        console.log(res.statusCode);
    } catch (err) {
        console.error(`Error`, err.message);
    }
}

export async function getStockReport(req, res, next) {
    try {
        res.json(await _getStockReport(req));
        console.log(res.statusCode);
    } catch (err) {
        console.error(`Error`, err.message);
    }
}


export async function getMinStockAlertReport(req, res, next) {
    try {
        res.json(await _getMinStockAlertReport(req));
        console.log(res.statusCode);
    } catch (err) {
        console.error(`Error`, err.message);
    }
}


async function getOne(req, res, next) {

    try {
        res.json(await _getOne(req.params.id, req));
        console.log(res.statusCode);
    } catch (err) {
        console.error(`Error`, err.message);
    }
}

async function getSearch(req, res, next) {
    try {
        res.json(await _getSearch(req));
        console.log(res.statusCode);
    } catch (err) {
        console.error(`Error`, err.message);
    }
}

async function create(req, res, next) {
    try {
        res.json(await _create(req.body));
        console.log(res.statusCode);
    } catch (error) {
        console.error(`Error`, error.message);
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2002') {
                res.statusCode = 200;
                res.json({ statusCode: 1, message: `${error.meta.target.split("_")[1].toUpperCase()} Already exists` })
                console.log(res.statusCode)
            }
        } else {
            res.json({ statusCode: 1, message: error.message })
        }
    }
}

export async function createOpeningStock(req, res, next) {
    try {
        res.json(await _createOpeningStock(req.body));
        console.log(res.statusCode);
    } catch (error) {
        console.error(`Error`, error.message);
        res.json({ statusCode: 1, message: error.message });
    }
}

async function update(req, res, next) {
    try {
        res.json(await _update(req.params.id, req.body));
        console.log(res.statusCode);
    } catch (error) {
        console.error(`Error`, error.message);
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2002') {
                res.statusCode = 200;
                res.json({ statusCode: 1, message: `${error.meta.target.split("_")[1].toUpperCase()} Already exists` })
                console.log(res.statusCode)
            }
        } else {
            res.json({ statusCode: 1, message: error.message })
        }
    }
}

async function remove(req, res, next) {
    try {
        res.json(await _remove(req.params.id));
        console.log(res.statusCode);
    } catch (error) {
        if (error.code === 'P2025') {
            res.statusCode = 200;
            res.json({ statusCode: 1, message: `Record Not Found` })
            console.log(res.statusCode)
        }
        else if (error.code === "P2003") {
            res.statusCode = 200;
            res.json({ statusCode: 1, message: "Child record Exists" })
        }
        console.error(`Error`, error.message);
    }
}

async function getAccessory(req, res, next) {
    try {
        res.json(await _getAccessory(req));
        console.log(res.statusCode);
    } catch (err) {
        console.error(`Error `, err.message);
    }
}


async function getOneAccessory(req, res, next) {

    try {
        res.json(await _getOneAccessory(req.params.id, req));
        console.log(res.statusCode);
    } catch (err) {
        console.error(`Error`, err.message);
    }
}




export const getStockQty = async (req, res) => {


    try {
        const { storeId, itemId, colorId, sizeId } = req.query;

        if (!storeId || !itemId) {
            return res.status(400).json({
                message: "storeId and itemId are required",
            });
        }

        const stock = await prisma.stock.aggregate({
            _sum: {
                qty: true,
            },
            where: {
                storeId: Number(storeId),
                itemId: Number(itemId),
                colorId: colorId ? Number(colorId) : undefined,
                sizeId: sizeId ? Number(sizeId) : undefined,
            },
        });

        return res.json({
            qty: stock._sum.qty || 0,
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Internal Server Error",
        });
    }
};


export async function getUnifiedStock(req, res, next) {
    try {
        res.json(await _getUnifiedStock(req));
        console.log(res.statusCode);
    } catch (err) {
        console.error(`Error `, err.message);
    }
}


export async function getUnifiedStockReport(req, res, next) {
    try {
        res.json(await _getUnifiedStockReport(req));
    } catch (err) {
        console.error(`Error `, err.message);
    }
}

export async function getUnifiedStockWithLegacyByBarcode(req, res, next) {
    try {
        res.json(await _getUnifiedStockWithLegacyByBarcode(req));
    } catch (err) {
        console.error(`Error `, err.message);
    }
}


export {
    get,
    getOne,
    getSearch,
    create,
    update,
    remove,
    getAccessory,
    getOneAccessory
};
