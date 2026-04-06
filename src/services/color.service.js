import { NoRecordFound } from '../configs/Responses.js';
import { prisma } from '../lib/prisma.js';

async function get(req) {
    const { companyId, active, isGrey } = req.query
    let data = await prisma.color.findMany({
        where: {
            active: active ? Boolean(active) : undefined,
        },
        include: {
            _count: {
                select: {
                    ItemPriceList: true,
                    DirectItems: true,
                    Stock: true
                }
            }
        }
    });

    data = data.map((item) => {
        const types = [];

        if (item._count.ItemPriceList) types.push("Item Master");
        if (item._count.DirectItems) types.push("Purchase Inward Items");
        if (item._count.Stock) types.push("Stock");


        return {
            ...item,
            referencedIn: types.join(", ")

        };
    });
    return { statusCode: 0, data };
}


async function getOne(id) {
    const childRecord = await prisma.ItemPriceList.count({ where: { colorId: parseInt(id) } });
    const data = await prisma.color.findUnique({
        where: {
            id: parseInt(id)
        }
    })
    if (!data) return NoRecordFound("color");
    return { statusCode: 0, data: { ...data, ...{ childRecord } } };
}

async function getSearch(req) {
    const { searchKey } = req.params
    const { companyId, active } = req.query
    const data = await prisma.color.findMany({
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
    const { name, active, pantone, isGrey, companyId, code } = await body
    const data = await prisma.color.create(
        {
            data: {
                name, active,
                pantone: pantone ? pantone : null,
                isGrey: isGrey ? isGrey : false,
                code: code ? String(code) : null,
                companyId: parseInt(companyId) ? parseInt(companyId) : undefined,
            }
        }
    )
    return { statusCode: 0, data };
}

async function update(id, body) {
    const { name, active, code } = await body
    const dataFound = await prisma.color.findUnique({
        where: {
            id: parseInt(id)
        }
    })
    if (!dataFound) return NoRecordFound("color");
    const data = await prisma.color.update({
        where: {
            id: parseInt(id),
        },
        data:
        {
            name, active, code
        },
    })
    return { statusCode: 0, data };
};

async function remove(id) {
    const data = await prisma.color.delete({
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
