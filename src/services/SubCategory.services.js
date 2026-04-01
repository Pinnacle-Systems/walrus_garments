import { NoRecordFound } from '../configs/Responses.js';
import { prisma } from '../lib/prisma.js';

async function get(req) {
    const { companyId, active } = req.query

    const data = await prisma.subCategory.findMany({
        where: {
            active: active ? Boolean(active) : undefined,
        },


    });
    return { statusCode: 0, data };
}


async function getOne(id) {
    const data = await prisma.subCategory.findUnique({
        where: {
            id: parseInt(id)
        }
    })
    if (!data) return NoRecordFound("Country");
    return { statusCode: 0, data: { ...data } };
}

async function getSearch(req) {
    const { searchKey } = req.params
    const { companyId, active } = req.query
    const data = await prisma.subCategory.findMany({
        where: {
            companyId: companyId ? parseInt(companyId) : undefined,
            active: active ? Boolean(active) : undefined,
            OR: [
                {
                    name: {
                        contains: searchKey,
                    },
                },
                {
                    code: {
                        contains: searchKey,
                    },
                },
            ],
        }
    })
    return { statusCode: 0, data: data };
}

async function create(body) {
    const { name, code, companyId, active, itemCategoryId } = await body
    const data = await prisma.subCategory.create(
        {
            data: {
                itemCategoryId: itemCategoryId ? parseInt(itemCategoryId) : undefined,
                name, code, active
            }
        }
    )
    return { statusCode: 0, data };
}

async function update(id, body) {
    const { name, code, active, itemCategoryId } = await body
    const dataFound = await prisma.subCategory.findUnique({
        where: {
            id: parseInt(id)
        }
    })
    if (!dataFound) return NoRecordFound("Country");
    const data = await prisma.subCategory.update({
        where: {
            id: parseInt(id),
        },
        data:
        {
            name, code, active,
            itemCategoryId: itemCategoryId ? parseInt(itemCategoryId) : undefined,

        },
    })
    return { statusCode: 0, data };
};

async function remove(id) {
    const data = await prisma.subCategory.delete({
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
