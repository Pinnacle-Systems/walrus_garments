import { NoRecordFound } from '../configs/Responses.js';
import { prisma } from '../lib/prisma.js';

async function get(req) {
    const { companyId, active } = req.query
    const data = await prisma.panel.findMany({
        where: {
            companyId: companyId ? parseInt(companyId) : undefined,
            active: active ? Boolean(active) : undefined,
        }
    });
    return { statusCode: 0, data };
}


async function getOne(id) {
    const childRecord = 0;
    const data = await prisma.panel.findUnique({
        where: {
            id: parseInt(id)
        }
    })
    if (!data) return NoRecordFound("panel");
    return { statusCode: 0, data: { ...data, ...{ childRecord } } };
}

async function getSearch(req) {
    const { searchKey } = req.params
    const { companyId, active } = req.query
    const data = await prisma.panel.findMany({
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
    const { name, code, companyId, active, itemTypeId } = await body
    const data = await prisma.panel.create(
        {
            data: {
                name, code, companyId: parseInt(companyId), active,
                // itemTypeId: itemTypeId ? parseInt(itemTypeId) : undefined,
            }
        }
    )
    return { statusCode: 0, data };
}

async function update(id, body) {
    const { name, code, active, itemTypeId } = await body
    const dataFound = await prisma.panel.findUnique({
        where: {
            id: parseInt(id)
        }
    })
    if (!dataFound) return NoRecordFound("panel");
    const data = await prisma.panel.update({
        where: {
            id: parseInt(id),
        },
        data:
        {
            name, code, active,
            //  itemTypeId: itemTypeId ? parseInt(itemTypeId) : undefined,
        },
    })
    return { statusCode: 0, data };
};

async function remove(id) {
    const data = await prisma.panel.delete({
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
