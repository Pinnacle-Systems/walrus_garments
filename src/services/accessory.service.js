import { PrismaClient } from '@prisma/client'
import { NoRecordFound } from '../configs/Responses.js';



const prisma = new PrismaClient()



async function get(req) {
    const { companyId, active } = req.query
    const data = await prisma.accessory.findMany({
        where: {
            companyId: companyId ? parseInt(companyId) : undefined,
            active: active ? Boolean(active) : undefined,
        }, include: {
            accessoryItem: {
                include: {
                    AccessoryGroup: true
                }
            }
        }
    });
    return { statusCode: 0, data };
}


async function getOne(id) {
    const childRecord = 0;
    const data = await prisma.accessory.findUnique({
        where: {
            id: parseInt(id)
        },
        include: {
            accessoryItem: true
        }
    })
    if (!data) return NoRecordFound("accessory");
    return { statusCode: 0, data: { ...data, ...{ childRecord } } };
}

async function getSearch(req) {
    const { companyId, active } = req.query
    const { searchKey } = req.params
    const data = await prisma.accessory.findMany({
        where: {
            country: {
                companyId: companyId ? parseInt(companyId) : undefined,
            },
            active: active ? Boolean(active) : undefined,
            OR: [
                {
                    aliasName: {
                        contains: searchKey,
                    },
                }
            ],
        }
    })
    return { statusCode: 0, data: data };
}

async function create(body) {
    const { aliasName, accessoryItemId, hsn, accessoryCategory, active, companyId } = await body
    const data = await prisma.accessory.create({
        data: {
            aliasName, accessoryItemId: parseInt(accessoryItemId), hsn, accessoryCategory,
            active, companyId: parseInt(companyId)
        },
    });
    return { statusCode: 0, data };
}

async function update(id, body) {
    const { aliasName, accessoryItemId, hsn, accessoryCategory, active, companyId } = await body
    const dataFound = await prisma.accessory.findUnique({
        where: {
            id: parseInt(id)
        }
    })
    if (!dataFound) return NoRecordFound("accessory");
    const data = await prisma.accessory.update({
        where: {
            id: parseInt(id),
        },
        data: {
            aliasName, accessoryItemId: parseInt(accessoryItemId), hsn, accessoryCategory,
            active, companyId: parseInt(companyId)
        },
    })
    return { statusCode: 0, data };
};

async function remove(id) {
    const data = await prisma.accessory.delete({
        where: {
            id: parseInt(id)
        },
    })
    return { statusCode: 0, data };
}

export {
    get,
    getOne,
    getSearch,
    create,
    update,
    remove
}
