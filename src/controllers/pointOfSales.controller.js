import { Prisma } from '@prisma/client'

import { get as _get, getOne as _getOne, getSearch as _getSearch, create as _create, update as _update, remove as _remove, cancel as _cancel, checkReferenceNumber as _checkRef, getPartyCreditBalance as _getPartyCreditBalance, requestDiscount as _requestDiscount, approveDiscount as _approveDiscount } from '../services/pointOfSales.services.js';

async function get(req, res, next) {
    try {
        res.json(await _get(req));
    } catch (err) {
        console.error(`Error `, err.message);
    }
}

async function getOne(req, res, next) {
    try {
        res.json(await _getOne(req.params.id));
    } catch (err) {
        console.error(`Error`, err.message);
    }
}

async function getSearch(req, res, next) {
    try {
        res.json(await _getSearch(req));
    } catch (err) {
        console.error(`Error`, err.message);
    }
}

async function create(req, res, next) {
    try {
        const responseData = await _create(req.body);
        res.json(responseData);
        if (responseData && responseData.statusCode === 0) {
            const io = req.app.get('socketio');
            if (io) {
                io.emit('pos_changed', {
                    action: 'REFRESH_LIST',
                    branchId: req.body.branchId,
                    timestamp: Date.now()
                });
            }
        }
    } catch (error) {
        console.error(`Error`, error.message);
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2002') {
                res.statusCode = 200;
                res.json({ statusCode: 1, message: `${error.meta.target.split("_")[1].toUpperCase()} Already exists` })
            }
        } else {
            res.json({ statusCode: 1, message: error.message })
        }
    }
}

async function update(req, res, next) {
    try {
        const responseData = await _update(req.params.id, req.body);
        res.json(responseData);
        if (responseData && responseData.statusCode === 0) {
            const io = req.app.get('socketio');
            if (io) {
                io.emit('pos_changed', {
                    action: 'REFRESH_LIST',
                    branchId: req.body.branchId,
                    timestamp: Date.now()
                });
            }
        }
    } catch (error) {
        console.error(`Error`, error.message);
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2002') {
                res.statusCode = 200;
                res.json({ statusCode: 1, message: `${error.meta.target.split("_")[1].toUpperCase()} Already exists` })
            }
        } else {
            res.json({ statusCode: 1, message: error.message })
        }
    }
}

async function remove(req, res, next) {
    try {
        const responseData = await _remove(req.params.id);
        res.json(responseData);
        console.log(responseData?.data, "responseData")

        if (responseData && responseData.statusCode === 0 && responseData.data) {
            const io = req.app.get('socketio');
            if (io) {
                io.emit('pos_changed', {
                    action: 'REFRESH_LIST',
                    branchId: responseData.data.deletedPos.branchId,
                    timestamp: Date.now()
                });
            }
        }
    } catch (error) {
        if (error.code === 'P2025') {
            res.statusCode = 200;
            res.json({ statusCode: 1, message: `Record Not Found` })
        }
        else if (error.code === "P2003") {
            res.statusCode = 200;
            res.json({ statusCode: 1, message: "Child record Exists" })
        }
        console.error(`Error`, error.message);
    }
}

async function checkReferenceNumber(req, res, next) {
    try {
        res.json(await _checkRef(req));
    } catch (err) {
        console.error(`Error`, err.message);
        res.json({ statusCode: 1, message: err.message });
    }
}

async function getPartyCreditBalance(req, res, next) {
    try {
        res.json(await _getPartyCreditBalance(req));
    } catch (err) {
        console.error(`Error`, err.message);
        res.json({ statusCode: 1, message: err.message });
    }
}

async function cancel(req, res, next) {
    try {
        const responseData = await _cancel(req.params.id);
        res.json(responseData);
        if (responseData && responseData.statusCode === 0 && responseData.data) {
            const io = req.app.get('socketio');
            if (io) {
                io.emit('pos_changed', {
                    action: 'REFRESH_LIST',
                    branchId: responseData.data.branchId,
                    timestamp: Date.now()
                });
            }
        }
    } catch (error) {
        console.error(`Error`, error.message);
        res.json({ statusCode: 1, message: error.message })
    }
}

async function requestDiscount(req, res, next) {
    try {
        const responseData = await _requestDiscount(req.body);
        res.json(responseData);
        if (responseData && responseData.statusCode === 0) {
            const io = req.app.get('socketio');
            if (io) {
                io.emit('pos_changed', {
                    action: 'REFRESH_LIST',
                    branchId: req.body.branchId,
                    timestamp: Date.now()
                });
            }
        }
    } catch (error) {
        console.error(`Error`, error.message);
        res.json({ statusCode: 1, message: error.message });
    }
}

async function approveDiscount(req, res, next) {
    try {
        const responseData = await _approveDiscount(req.params.id, req.body);
        res.json(responseData);
        if (responseData && responseData.statusCode === 0 && responseData.data) {
            const io = req.app.get('socketio');
            if (io) {
                io.emit('pos_changed', {
                    action: 'REFRESH_LIST',
                    branchId: responseData.data.branchId,
                    timestamp: Date.now()
                });
            }
        }
    } catch (error) {
        console.error(`Error`, error.message);
        res.json({ statusCode: 1, message: error.message });
    }
}

export {
    get,
    getOne,
    getSearch,
    create,
    update,
    remove,
    cancel,
    checkReferenceNumber,
    getPartyCreditBalance,
    requestDiscount,
    approveDiscount
};
