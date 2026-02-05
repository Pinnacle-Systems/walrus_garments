import { NoRecordFound } from '../configs/Responses.js';
import { prisma } from '../lib/prisma.js';

async function get(req) {
    const { companyId, active } = req.query
    const data = await prisma.itemType.findMany({
        where: {
            companyId: companyId ? parseInt(companyId) : undefined,
            active: active ? Boolean(active) : undefined,
        }
    });
    return { statusCode: 0, data };
}


async function getOne(id) {
    const childRecord = 0;
    const data = await prisma.itemType.findUnique({
        where: {
            id: parseInt(id)
        }
    })
    if (!data) return NoRecordFound("itemType");
    return { statusCode: 0, data: { ...data, ...{ childRecord } } };
}

async function getSearch(req) {
    const { searchKey } = req.params
    const { companyId, active } = req.query
    const data = await prisma.itemType.findMany({
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
    const { name, code, companyId, active, typeMethod, isTop, isBottom } = await body
    const data = await prisma.itemType.create(
        {
            data: {
                name, code, companyId: parseInt(companyId), active, isTop, isBottom
            }
        }
    )
    return { statusCode: 0, data };
}

async function update(id, body) {
    const { name, code, active, typeMethod, isTop, isBottom } = await body
    const dataFound = await prisma.itemType.findUnique({
        where: {
            id: parseInt(id)
        }
    })
    if (!dataFound) return NoRecordFound("itemType");
    const data = await prisma.itemType.update({
        where: {
            id: parseInt(id),
        },
        data:
        {
            name, code, active, isTop, isBottom
        },
    })
    return { statusCode: 0, data };
};


async function checkIsItemIsUsed(itemTypeId) {

    let data = await prisma.$queryRaw`select *
    from item i
    where i.itemTypeId = ${itemTypeId}
    `
    if (data?.length > 0) throw Error("This ItemType Is Already used in  Item")
    return

}



async function remove(id) {
    let data;

    await checkIsItemIsUsed(id)
    data = await prisma.itemType.delete({
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
