import { NoRecordFound } from '../configs/Responses.js';
import { prisma } from '../lib/prisma.js';

async function get(req) {
    const { branchId, active } = req.query

    const data = await prisma.collections.findMany({
        where: {
            // branchId: branchId ? parseInt(branchId) : undefined,
            // active: active ? Boolean(active === 'true') : undefined,
        },
        include: {
            CollectionItems: true
        }
    });

    return { statusCode: 0, data };
}

async function getOne(id) {
    const data = await prisma.collections.findUnique({
        where: {

            id: parseInt(id)
        },
        include: {
            CollectionItems: {
                select: {
                    id: true,
                    item: true,
                    itemId: true,
                    collectionId: true,
                }

            }
        }
    })
    if (!data) return NoRecordFound("Offer");
    return { statusCode: 0, data };
}

async function getSearch(req) {
    const { searchKey } = req.params
    const { branchId, active } = req.query
    const data = await prisma.offerDefinition.findMany({
        where: {
            branchId: branchId ? parseInt(branchId) : undefined,
            active: active ? Boolean(active === 'true') : undefined,
            OR: [
                { name: { contains: searchKey } },
                { couponCode: { contains: searchKey } },
            ],
        }
    })
    return { statusCode: 0, data };
}

async function create(body) {
    const {
        name, active, itemTypeList

    } = await body

    const data = await prisma.collections.create({
        data: {
            name,
            active,
            CollectionItems: {
                createMany: {
                    data: itemTypeList.map(item => ({
                        itemId: item?.value ? parseInt(item?.value) : undefined,
                    }))
                }
            }
        }
    })
    return { statusCode: 0, data };
}

async function update(id, body) {
    const {
        name, active, itemTypeList
    } = await body

    const dataFound = await prisma.collections.findUnique({
        where: { id: parseInt(id) }
    })
    if (!dataFound) return NoRecordFound("Offer");

    const data = await prisma.collections.update({
        where: { id: parseInt(id) },
        data: {
            name,
            active,
            CollectionItems: {
                deleteMany: {
                    collectionId: parseInt(id)
                },
                createMany: {
                    data: itemTypeList.map(item => ({
                        itemId: item?.value ? parseInt(item?.value) : undefined,
                    }))
                }
            }
        },
    })
    return { statusCode: 0, data };
}

async function remove(id) {
    const data = await prisma.collections.delete({
        where: { id: parseInt(id) },
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
