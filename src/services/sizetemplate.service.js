import { PrismaClient } from '@prisma/client';
import { NoRecordFound } from '../configs/Responses.js';
const prisma = new PrismaClient()


async function get(req) {
    const { companyId, active } = req.query
    const data = await prisma.sizeTemplate.findMany({
        where: {
            companyId: companyId ? parseInt(companyId) : undefined,
            active: active ? Boolean(active) : undefined,
        }
    });
    return { statusCode: 0, data };
}


async function getOne(id) {
    const childRecord = 0;
    const data = await prisma.sizeTemplate.findUnique({
        where: {
            id: parseInt(id)
        },
        include: {
            SizeTemplateOnSize: true
        }
    })
    if (!data) return NoRecordFound("sizeTemplate");
    return { statusCode: 0, data: { ...data, ...{ childRecord } } };
}

async function getSearch(req) {
    const { searchKey } = req.params
    const { companyId, active } = req.query
    const data = await prisma.sizeTemplate.findMany({
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
    const { name, companyId, active, selectedSizeList } = await body
    const data = await prisma.sizeTemplate.create(
        {
            data: {
                name, companyId: parseInt(companyId), active,
                SizeTemplateOnSize: {
                    createMany: {
                        data: selectedSizeList.map(item => { return { sizeId: item } })
                    }
                }
            }
        }
    )
    return { statusCode: 0, data };
}

async function update(id, body) {
    const { name, companyId, active, selectedSizeList } = await body
    const dataFound = await prisma.sizeTemplate.findUnique({
        where: {
            id: parseInt(id)
        }
    })
    if (!dataFound) return NoRecordFound("sizeTemplate");
    const data = await prisma.sizeTemplate.update({
        where: {
            id: parseInt(id),
        },
        data: {
            name, companyId: parseInt(companyId), active,
            SizeTemplateOnSize: {
                deleteMany: {},
                createMany: {
                    data: selectedSizeList.map(item => { return { sizeId: item } })
                }
            }
        }
    })
    return { statusCode: 0, data };
};

async function remove(id) {
    const data = await prisma.sizeTemplate.delete({
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
