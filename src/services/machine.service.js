import { NoRecordFound } from '../configs/Responses.js';
import { prisma } from '../lib/prisma.js';

async function get(req) {
    const { companyId, active } = req.query
    console.log("hitgert")
    const data = await prisma.machine.findMany({


        where: {
            active: active ? Boolean(active) : undefined,
        }
    });
    console.log(data, "data")
    return { statusCode: 0, data };
}


async function getOne(id) {
    const childRecord = 0;
    const data = await prisma.machine.findUnique({
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
    const data = await prisma.counts.findMany({
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

    const { name, code, time, active } = await body
    const data = await prisma.machine.create(
        {
            data: {
                name, code, time: time ? parseFloat(time) : undefined, active
            }
        }
    )
    return { statusCode: 0, data };
}

async function update(id, body) {
    const { name, code, time, active } = await body
    const dataFound = await prisma.machine.findUnique({
        where: {
            id: parseInt(id)
        }
    })
    if (!dataFound) return NoRecordFound("Machine");
    const data = await prisma.machine.update({
        where: {
            id: parseInt(id),
        },
        data:
        {
            name, code, time: parseFloat(time), active
        },
    })
    return { statusCode: 0, data };
};

async function remove(id) {
    const data = await prisma.machine.delete({
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
