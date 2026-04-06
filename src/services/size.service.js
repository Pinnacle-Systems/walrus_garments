import { NoRecordFound } from '../configs/Responses.js';
import { prisma } from '../lib/prisma.js';

async function get(req) {

    const { companyId, active } = req.query

    console.log(companyId, active, "companyId, active ")

    let data = await prisma.size.findMany({
        where: {
            companyId: companyId ? parseInt(companyId) : undefined,
            active: active ? Boolean(active) : undefined,
        },
        include: {
            _count: {
                select: {
                    ItemPriceList: true,
                    DirectItems: true,
                    DirectReturnItems: true,
                    Stock: true,
                    SaleOrderItems: true,
                    SalesDeliveryItems: true,
                    QuotationItems: true,
                }

            }


        }
    });

    data = data.map((item) => {
        const types = [];

        if (item._count.ItemPriceList) types.push("Item Master");
        if (item._count.DirectItems) types.push("Purchase Inward Items");
        if (item._count.DirectReturnItems) types.push("Purchase Return Items");
        if (item._count.QuotationItems) types.push("Quotation Items");
        if (item._count.SaleOrderItems) types.push("Sale Order Items");
        if (item._count.SalesDeliveryItems) types.push("Sales Delivery Items");
        if (item._count.Stock) types.push("Stock");


        return {
            ...item,
            referencedIn: types.join(", ")

        };
    });


    return { statusCode: 0, data };
}


async function getOne(id) {
    const childRecord = await prisma.ItemPriceList.count({ where: { sizeId: parseInt(id) } });
    const data = await prisma.size.findUnique({
        where: {
            id: parseInt(id)
        }, include: {
            _count: {
                select: {
                    ItemPriceList: true,
                    DirectItems: true,
                    DirectReturnItems: true,
                    Stock: true,
                    SaleOrderItems: true,
                    SalesDeliveryItems: true,
                    QuotationItems: true,
                }

            }


        }
    })
    if (!data) return NoRecordFound("size");
    return { statusCode: 0, data: { ...data, ...{ childRecord } } };
}

async function getSearch(req) {
    const { searchKey } = req.params
    const { companyId, active, } = req.query
    const data = await prisma.size.findMany({
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
    const { name, companyId, active, accessory } = await body
    const data = await prisma.size.create(
        {
            data: {
                name, companyId: parseInt(companyId), active,
                // isAccessory: accessory
            }
        }
    )
    return { statusCode: 0, data };
}

async function update(id, body) {
    const { name, active, accessory } = await body
    const dataFound = await prisma.size.findUnique({
        where: {
            id: parseInt(id)
        }
    })
    if (!dataFound) return NoRecordFound("size");
    const data = await prisma.size.update({
        where: {
            id: parseInt(id),
        },
        data:
        {
            name, active,
            // isAccessory: accessory
        },
    })
    return { statusCode: 0, data };
};

async function remove(id) {
    const data = await prisma.size.delete({
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
