import { PrismaClient } from '@prisma/client'
import { NoRecordFound } from '../configs/Responses.js';



const prisma = new PrismaClient()
async function get(req) {
    const { companyId, active } = req.query
    const data = await prisma.dia.findMany({
        where: {
            companyId: companyId ? parseInt(companyId) : undefined,
            active: active ? Boolean(active) : undefined,
        }
    });
    return { statusCode: 0, data };
}


async function getOne(id) {
    const childRecord = 0;
    const data = await prisma.dia.findUnique({
        where: {
            id: parseInt(id)
        }
    })
    if (!data) return NoRecordFound("dia");
    return { statusCode: 0, data: { ...data, ...{ childRecord } } };
}

async function getSearch(req) {
    const { searchKey } = req.params
    const { companyId, active } = req.query
    const data = await prisma.dia.findMany({
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
    const { name, measurement, kDia, fDia, companyId, active } = await body
    const data = await prisma.dia.create(
        {
            data: {
                name, companyId: parseInt(companyId), active, measurement, kDia, fDia,
            }
        }
    )
    return { statusCode: 0, data };
}

async function update(id, body) {
    const { name, measurement, kDia, fDia, companyId, active } = await body
    const dataFound = await prisma.dia.findUnique({
        where: {
            id: parseInt(id)
        }
    })
    if (!dataFound) return NoRecordFound("dia");
    const data = await prisma.dia.update({
        where: {
            id: parseInt(id),
        },
        data:
        {
            name, active, measurement, kDia, fDia,
        },
    })
    return { statusCode: 0, data };
};

async function remove(id) {
    const data = await prisma.dia.delete({
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
