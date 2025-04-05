import { PrismaClient } from '@prisma/client'
import { NoRecordFound } from '../configs/Responses.js';

const prisma = new PrismaClient()

async function get(req) {
    const { companyId, active } = req.query
    const data = await prisma.yarn.findMany({
        where: {
            companyId: companyId ? parseInt(companyId) : undefined,
            active: active ? Boolean(active) : undefined,
        }
    });
    return { statusCode: 0, data };
}


async function getOne(id) {
    const childRecord = 0;
    const data = await prisma.yarn.findUnique({
        where: {
            id: parseInt(id)
        },
        include: {
            YarnOnYarnBlend: true
        }
    })
    if (!data) return NoRecordFound("yarn");
    return { statusCode: 0, data: { ...data, ...{ childRecord } } };
}

async function getSearch(req) {
    const { searchKey } = req.params
    const { companyId, active } = req.query
    const data = await prisma.yarn.findMany({
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
    const { contentId, yarnTypeId, countsId, aliasName, hsn, yarnBlendDetails, taxPercent, companyId, active } = await body
    const data = await prisma.yarn.create(
        {
            data: {
                contentId: contentId ? parseInt(contentId) : null,
                yarnTypeId: yarnTypeId ?  parseInt(yarnTypeId) : null,
                countsId: countsId ? parseInt(countsId) : null,
                taxPercent: taxPercent ?  parseInt(taxPercent) : null,
                aliasName, hsn,
                YarnOnYarnBlend: yarnBlendDetails ? {
                    createMany: {
                        data: yarnBlendDetails.map(blend => {
                            return { yarnBlendId: parseInt(blend.yarnBlendId), percentage: parseInt(blend.percentage) }
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
    const { contentId, yarnTypeId, countsId, aliasName, hsn, yarnBlendDetails, taxPercent, companyId, active } = await body
    const dataFound = await prisma.yarn.findUnique({
        where: {
            id: parseInt(id)
        }
    })
    if (!dataFound) return NoRecordFound("yarn");
    const data = await prisma.yarn.update({
        where: {
            id: parseInt(id),
        },
        data: {
            contentId: parseInt(contentId),
            yarnTypeId: parseInt(yarnTypeId),
            countsId: parseInt(countsId),
            taxPercent: parseInt(taxPercent),
            aliasName, hsn,
            YarnOnYarnBlend: yarnBlendDetails ? {
                deleteMany: {},
                createMany: {
                    data: yarnBlendDetails.map(blend => {
                        return { yarnBlendId: parseInt(blend.yarnBlendId), percentage: parseInt(blend.percentage) }
                    })
                }
            } : undefined,
            companyId: parseInt(companyId), active
        }
    })
    return { statusCode: 0, data };
};

async function remove(id) {
    const data = await prisma.yarn.delete({
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
