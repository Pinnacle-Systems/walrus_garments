import { PrismaClient } from '@prisma/client'
import { NoRecordFound } from '../configs/Responses.js';

const prisma = new PrismaClient()

async function get(req) {
    const { companyId, active } = req.query
    const data = await prisma.yarnType.findMany({
        where: {
            companyId: companyId ? parseInt(companyId) : undefined,
            active: active ? Boolean(active) : undefined,
        }
    });
    return { statusCode: 0, data };
}


async function getYarncounts(req) {
    const { companyId, active } = req.query
    const data = await prisma.yarnCounts.findMany({
        where: {
            active: active ? Boolean(active) : undefined,
        }
    });
    return { statusCode: 0, data };
}

async function getOne(id) {
    const childRecord = 0;
    const data = await prisma.yarnType.findUnique({
        where: {
            id: parseInt(id)
        },
        include: {
            yarnCounts: true
        },

    })
    if (!data) return NoRecordFound("yarnType");
    return { statusCode: 0, data: { ...data, ...{ childRecord } } };
}

async function getSearch(req) {
    const { searchKey } = req.params
    const { companyId, active } = req.query
    const data = await prisma.yarnType.findMany({
        where: {
            companyId: companyId ? parseInt(companyId) : undefined,
            active: active ? Boolean(active) : undefined,
            OR: [
                {
                    name: {
                        contains: searchKey,
                    },
                }
            ],
        }
    })
    return { statusCode: 0, data: data };
}

async function create(body) {
    const { name, code, companyId, active, countsList } = await body
    const data = await prisma.yarnType.create(
        {
            data: {
                name, code, companyId: parseInt(companyId), active,
                yarnCounts: {
                    createMany: countsList?.length > 0 ? {
                        data: countsList?.map((temp) => {
                            let newItem = {}
                            newItem["name"] = temp["label"] ? temp["label"] : null;
                            newItem["value"] = temp["value"] ? String( temp["value"]) : null;
                            newItem["active"] = temp["active"] ? ( temp["active"]) : false;


                            return newItem
                        })
                    } : undefined
                }
            }
        }
    )
    return { statusCode: 0, data };
}

async function update(id, body) {
    const { name, code, active, countsList } = await body
    const dataFound = await prisma.yarnType.findUnique({
        where: {
            id: parseInt(id)
        }
    })
    if (!dataFound) return NoRecordFound("yarnType");
    const data = await prisma.yarnType.update({
        where: {
            id: parseInt(id),
        },
        data:
        {
            name, code, active,
            yarnCounts: {
                deleteMany: {},
                createMany: countsList.length > 0
                    ? {
                        data: countsList.map((temp) => ({
                            name: temp.label  ?  temp.label  :  undefined,
                            value: temp.value ? String(temp.value) : undefined,
                            active : temp.active ?   temp.active  : false
                        })),
                    }
                    : undefined,
            },

        },
    })
    return { statusCode: 0, data };
};

async function remove(id) {
    const data = await prisma.yarnType.delete({
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
    remove,
    getYarncounts
}
