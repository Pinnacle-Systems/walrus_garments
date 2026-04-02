import { NoRecordFound } from '../configs/Responses.js';
import { prisma } from '../lib/prisma.js';

async function get(req) {
    const { companyId, active } = req.query

    let data = await prisma.unitOfMeasurement.findMany({
        where: {
            active: active ? Boolean(active) : undefined,
        },
        include: {
            _count: {
                select: {
                    DirectItems: true,
                    DirectReturnItems: true,
                    LegacyStock: true,
                    Stock: true,
                    QuotationItems: true,
                    SaleOrderItems: true,
                    SalesInvoiceItems: true,
                    SalesDeliveryItems: true,
                    SalesReturnItems: true,
                }
            }
        }
    });

    data = data.map((item) => {
        const types = [];

        if (item._count.DirectItems) types.push("Purchase Inard Items");
        if (item._count.DirectReturnItems) types.push("Purchase Return Items");
        if (item._count.QuotationItems) types.push("QuotationItems");
        if (item._count.SaleOrderItems) types.push("SaleOrderItems");
        if (item._count.SalesInvoiceItems) types.push("SalesInvoiceItems");
        if (item._count.SalesDeliveryItems) types.push("SalesDeliveryItems");
        if (item._count.SalesReturnItems) types.push("SalesReturnItems");
        if (item._count.Stock) types.push("Stock");


        return {
            ...item,
            referencedIn: types.join(", ")

        };
    });

    return { statusCode: 0, data };
}


async function getOne(id) {
    const childRecord = await prisma.directItems.count({ where: { uomId: parseInt(id) } });

    const data = await prisma.unitOfMeasurement.findUnique({
        where: {
            id: parseInt(id)
        }
    })
    if (!data) return NoRecordFound("unitOfMeasurement");
    return { statusCode: 0, data: { ...data, ...{ childRecord } } };

}



async function getSearch(req) {
    const { searchKey } = req.params
    const { companyId, active } = req.query
    const data = await prisma.unitOfMeasurement.findMany({
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
    const { name, companyId, active } = await body
    console.log('its working')
    const data = await prisma.unitOfMeasurement.create(
        {
            data: {
                name, companyId: parseInt(companyId), active
            }
        }
    )
    return { statusCode: 0, data };
}

async function update(id, body) {
    const { name, active } = await body
    const dataFound = await prisma.unitOfMeasurement.findUnique({
        where: {
            id: parseInt(id)
        }
    })
    if (!dataFound) return NoRecordFound("unitOfMeasurement");
    const data = await prisma.unitOfMeasurement.update({
        where: {
            id: parseInt(id),
        },
        data:
        {
            name, active
        },
    })
    return { statusCode: 0, data };
};

async function remove(id) {
    const data = await prisma.unitOfMeasurement.delete({
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
