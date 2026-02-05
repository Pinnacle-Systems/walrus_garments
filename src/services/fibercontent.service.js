import { NoRecordFound } from '../configs/Responses.js';
import { prisma } from '../lib/prisma.js';

async function get(req) {
    const { companyId, active } = req.query
    const data = await prisma.fiberContent.findMany({
        where: {
            companyId: companyId ? parseInt(companyId) : undefined,
            active: active ? Boolean(active) : undefined,
        }
    });
    return { statusCode: 0, data };
}


async function getOne(id) {
    const childRecord = 0;
    const data = await prisma.fiberContent.findUnique({
        where: {
            id: parseInt(id)
        },
        include: {
            fiberBlend: true
        }
    })
    if (!data) return NoRecordFound("fiberContent");
    return { statusCode: 0, data: { ...data, ...{ childRecord } } };
}

async function getSearch(req) {
    const { searchKey } = req.params
    const { companyId, active } = req.query
    const data = await prisma.fiberContent.findMany({
        where: {
            companyId: companyId ? parseInt(companyId) : undefined,
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
    const { aliasName, companyId, active, fiberBlend, fabricName } = await body
    const data = await prisma.fiberContent.create(
        {
            data: {
                aliasName, fabricName,
                fiberBlend: fiberBlend ? {
                    createMany: {
                        data: fiberBlend.map(blend => {
                            return { fabricId: parseInt(blend.fabricId), percentage: parseInt(blend.percentage) }
                        })
                    }
                } : undefined,
                companyId: parseInt(companyId), active
            }
        }
    )
    return { statusCode: 0, data };
}

async function update(id, body) {
    const { aliasName, fiberBlend, companyId, active, fabricName } = await body
    const dataFound = await prisma.fiberContent.findUnique({
        where: {
            id: parseInt(id)
        }
    })
    if (!dataFound) return NoRecordFound("yarn");
    const data = await prisma.fiberContent.update({
        where: {
            id: parseInt(id),
        },
        data: {
            aliasName, fabricName,
            fiberBlend: fiberBlend ? {
                deleteMany: {},
                createMany: {
                    data: fiberBlend.map(blend => {
                        return { fabricId: parseInt(blend.fabricId), percentage: parseInt(blend.percentage) }
                    })
                }
            } : undefined,
            companyId: parseInt(companyId), active
        }
    })
    return { statusCode: 0, data };
};

async function remove(id) {
    const data = await prisma.fiberContent.delete({
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
