import { PrismaClient } from '@prisma/client'
import { NoRecordFound } from '../configs/Responses.js';

const prisma = new PrismaClient()


async function get(req) {
    const { companyId, active, productBrandId, productCategoryId } = req.query

    const data = await prisma.product.findMany({
        where: {
            companyId: companyId ? parseInt(companyId) : undefined,
            active: active ? Boolean(active) : undefined,
            // productCategoryId: productCategoryId ? parseInt(productCategoryId) : undefined,
            // productSubCategoryId: productSubCategoryId ? parseInt(productSubCategoryId) : undefined,
            // productBrandId: productBrandId ? parseInt(productBrandId) : undefined
        },
        // include: {
        //     ProductUomPriceDetails: {
        //         include: {
        //             Uom: {
        //                 select: {
        //                     name: true
        //                 }
        //             }
        //         }
        //     }
        // }
    });
    return { statusCode: 0, data };
}


async function getOne(id) {
    const childRecord = await prisma.poBillItems.count({ where: { productBrandId: parseInt(id) } });
    const data = await prisma.product.findUnique({
        where: {
            id: parseInt(id)
        },
        // include: {
        //     ProductUomPriceDetails: {
        //         include: {
        //             Uom: {
        //                 select: {
        //                     name: true
        //                 }
        //             }
        //         }
        //     }
        // }
    })

    if (!data) return NoRecordFound("Product");
    return { statusCode: 0, data: { ...data, ...{ childRecord } } };
}



async function getSearch(req) {
    const { searchKey } = req.params
    const { companyId, active } = req.query
    const data = await prisma.product.findMany({
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
    const { name, taxPercent, hsnCode, price, lowPrice, mediumPrice, highPrice, companyId, active, uomId, description } = await body

    const data = await prisma.product.create(
        {
            data: {
                name, hsnCode, taxPercent, companyId: parseInt(companyId), active,
                price: parseFloat(price), lowPrice, mediumPrice, highPrice, uomId: parseInt(uomId), description,

            }
        }
    )
    return { statusCode: 0, data };
}

async function update(id, body) {
    const { name, taxPercent, hsnCode, price, lowPrice, mediumPrice, highPrice, active, uomId, description, companyId } = await body

    const dataFound = await prisma.product.findUnique({
        where: {
            id: parseInt(id)
        }
    })
    if (!dataFound) return NoRecordFound("Product");
    const data = await prisma.product.update({
        where: {
            id: parseInt(id),
        },
        data:
        {
            name, hsnCode, taxPercent, active, companyId: companyId ? parseInt(companyId) : undefined,
            price: parseFloat(price), lowPrice, mediumPrice,
            highPrice, uomId: parseInt(uomId), description,

        },
    })
    return { statusCode: 0, data };
};

async function remove(id) {
    const data = await prisma.product.delete({
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
