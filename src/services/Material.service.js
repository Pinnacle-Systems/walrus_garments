import { NoRecordFound } from '../configs/Responses.js';
import { prisma } from '../lib/prisma.js';

async function get(req) {
    const { companyId, active } = req.query
    const data = await prisma.rawMaterial.findMany({
        where: {
            active: active ? Boolean(active) : undefined,
        }
    });
    return { statusCode: 0, data };
}


async function getOne(id) {
    const childRecord = 0;
    const data = await prisma.rawMaterial.findUnique({
        where: {
            id: parseInt(id)
        }
    })
    if (!data) return NoRecordFound("counts");
    return { statusCode: 0, data: { ...data, ...{ childRecord } } };
}

async function getSearch(req) {
    const { searchKey } = req.params
    const { companyId, active } = req.query
    const data = await prisma.rawMaterial.findMany({
        where: {
            companyId: companyId ? parseInt(companyId) : undefined,
            active: active ? Boolean(active) : undefined,
            OR: [
                {
                    name: {
                        contains: searchKey,
                    },
                },
            ],
        }
    })
    return { statusCode: 0, data: data };
}

async function create(body) {
    const { name, code, active,  material,
    materialActive,
    materialId } = await body
    const data = await prisma.rawMaterial.create(
        {
            data: {
            name  :  name , code, active 
            }
        }
    )
    return { statusCode: 0, data };
}

async function update(id, body) {
    const { name, code, active  ,  material,
    materialActive,
    materialId} = await body
    const dataFound = await prisma.rawMaterial.findUnique({
        where: {
            id: parseInt(id)
        }
    })
    if (!dataFound) return NoRecordFound("counts");
    const data = await prisma.rawMaterial.update({
        where: {
            id: parseInt(id),
        },
        data:
        {
            name  :  name , code, active 
        },
    })
    return { statusCode: 0, data };
};

async function remove(id) {
    const data = await prisma.rawMaterial.delete({
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
