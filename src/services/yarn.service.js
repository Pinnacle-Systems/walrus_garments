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
    const data = await prisma.yarn.findUnique({
        where: {
            id: parseInt(id)
        },
        include: {
            YarnOnYarnBlend: true,
            yarnCounts: true,
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
    const { name, contentId, countsId, aliasName, hsn, yarnBlendDetails, taxPercent, companyId, active, countsList } = await body
    const data = await prisma.yarn.create(
        {
            data: {
                aliasName, hsnId : parseInt(hsn) , companyId: parseInt(companyId), active, name, countsId: countsId ?  parseInt(countsId) : "",
                contentId : contentId ?  parseInt(contentId) : undefined ,
                YarnOnYarnBlend: yarnBlendDetails ? {
                    createMany: {
                        data: yarnBlendDetails.map(blend => {
                            return { yarnBlendId: parseInt(blend.yarnBlendId), percentage: parseInt(blend.percentage) }
                        })
                    }
                } : undefined,
                yarnCounts: {
                    createMany: countsList?.length > 0 ? {
                        data: countsList?.map((temp) => {
                            let newItem = {}
                            newItem["name"] = temp["label"] ? temp["label"] : null;
                            newItem["value"] = temp["value"] ? String(temp["value"]) : null;
                            newItem["active"] = temp["active"] ? (temp["active"]) : false;


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
    const { name, yarnTypeId, countsId, aliasName, hsn, yarnBlendDetails, contentId, companyId, active, countsList } = await body
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
            aliasName, hsnId : parseInt(hsn), companyId: parseInt(companyId), active, name, countsId: parseInt(countsId),
            contentId: parseInt(contentId),
            YarnOnYarnBlend: yarnBlendDetails ? {
                deleteMany: {},
                createMany: {
                    data: yarnBlendDetails.map(blend => {
                        return { yarnBlendId: parseInt(blend.yarnBlendId), percentage: parseInt(blend.percentage) }
                    })
                }
            } : undefined,
            yarnCounts: {
                deleteMany: {},
                createMany: countsList.length > 0
                    ? {
                        data: countsList.map((temp) => ({
                            name: temp.label ? temp.label : undefined,
                            value: temp.value ? String(temp.value) : undefined,
                            active: temp.active ? temp.active : false
                        })),
                    }
                    : undefined,
            },

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
    getYarncounts,
    getOne,
    getSearch,
    create,
    update,
    remove
}
