import { Prisma } from '@prisma/client'

import {
    get as _get, getOne as _getOne, getSearch as _getSearch, create as _create, update as _update, remove as _remove, upload as _upload,
    kycForm as kycFormService, removePartyBranch as _removePartyBranch , removePartyMaterial as _removePartyMaterial , getMaterialOne  as _getMaterialOne
    ,updateMaterial  as  _updateMaterial  , getContactOne  as _getContactOne , updateContact as _updateContact , removePartyContact as _removePartyContact ,
getPartyBranchOne  as _getPartyBranchOne ,




} from '../services/partyMaster.service.js';
import multer from 'multer';

async function get(req, res, next) {
    try {
        res.json(await _get(req));
        console.log(res.statusCode);
    } catch (err) {
        console.error(`Error `, err.message);
    }
}


async function getOne(req, res, next) {
    try {
        res.json(await _getOne(req.params.id));
        console.log(res.statusCode);
    } catch (err) {
        console.error(`Error`, err.message);
    }
}

async function getMaterialOne(req, res, next) {
    try {
        res.json(await _getMaterialOne(req.params.id));
        console.log(res.statusCode);
    } catch (err) {
        console.error(`Error`, err.message);
    }
}

async function getContactOne(req, res, next) {
    try {
        res.json(await _getContactOne(req.params.id));
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

export async function upload(req, res, next) {
    try {
        res.json(await _upload(req));
        console.log(res.statusCode);
    } catch (error) {
        console.error(`Error`, error.message);
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2002') {
                res.statusCode = 200;
                res.json({ statusCode: 1, message: `${error.meta.target.split("_")[1].toUpperCase()} Already exists` })
                console.log(res.statusCode)
            } else {
                res.json({ statusCode: 1, message: "Child Record Exists" })
            }
        } else {
            res.json({ statusCode: 1, message: (error?.message)?.match(/message: "(.*?)"/)?.[1] || error?.message })
        }
    }
}

async function create(req, res, next) {
    try {
        console.log("create")
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
async function kycFormController(req, res, next) {
    try {
        res.json(await kycFormService(req.body));
        console.log(res.statusCode);
        console.log("its working")
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
        console.log(`Error`, error.message);
    }
}



async function getPartyBranchOne(req, res, next) {
    try {
        res.json(await _getPartyBranchOne(req.params.id));
        console.log(res.statusCode);
    } catch (err) {
        console.error(`Error`, err.message);
    }
}


async function removePartyBranch(req, res, next) {
    console.log(req.params, "req.params")
    try {
        res.json(await _removePartyBranch(req.params.id));
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
        console.log(`Error`, error.message);
    }
}


async function removePartyMaterial(req, res, next) {
    console.log(req.params, "req.params")
    try {
        res.json(await _removePartyMaterial(req.params.id));
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
        console.log(`Error`, error.message);
    }
}


async function removePartyContact(req, res, next) {
    console.log(req.params, "req.params")
    try {
        res.json(await _removePartyContact(req.params.id));
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
        console.log(`Error`, error.message);
    }
}

async function updateMaterial(req, res, next) {
    console.log(req.params,"s")
    try {
        res.json(await _updateMaterial(req.params.id, req.body));
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

async function updateContact(req, res, next) {
    try {
        res.json(await _updateContact(req.params.id, req.body));
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

export {
    get,
    getOne,
    getMaterialOne,
    getContactOne,
    getSearch,
    create,
    kycFormController,
    update,
    remove,

    getPartyBranchOne,
    removePartyBranch,
    
    removePartyContact,
    removePartyMaterial,
 
    updateMaterial,
    updateContact
};
