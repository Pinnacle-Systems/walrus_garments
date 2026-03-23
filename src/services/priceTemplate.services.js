import { NoRecordFound } from '../configs/Responses.js';
import { prisma } from '../lib/prisma.js';
import { getFinYearStartTimeEndTime } from '../utils/finYearHelper.js';
import { getYearShortCodeForFinYear } from '../utils/helper.js';
import { getTableRecordWithId } from '../utils/helperQueries.js';




async function get(req) {

    const { companyId, active } = req.query

    console.log(companyId, active, "companyId, active ")

    let data = await prisma.priceTemplate.findMany({
        include: {
            PriceTemplateDetails: true,
            Item: {
                select: {
                    name: true
                }
            }
        }

    });



    return { statusCode: 0, data };
}


async function getOne(id) {
    const childRecord = 0;
    const data = await prisma.priceTemplate.findUnique({
        where: {
            id: parseInt(id)
        },
        include: {
            PriceTemplateDetails: true
        }
    })
    if (!data) return NoRecordFound("size");
    return { statusCode: 0, data: { ...data, ...{ childRecord } } };
}

async function getSearch(req) {
    const { searchKey } = req.params
    const { companyId, active, } = req.query
    const data = await prisma.saleOrder.findMany({
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
    const { itemId, priceTemplate, finYearId, branchId } = await body



    const data = await prisma.priceTemplate.create(
        {
            data: {
                itemId: itemId ? parseInt(itemId) : undefined,

                PriceTemplateDetails: {
                    createMany: priceTemplate?.length > 0 ? {
                        data: priceTemplate?.map((temp) => {
                            let newItem = {}
                            newItem["itemId"] = itemId ? parseInt(itemId) : null;
                            newItem["minQty"] = temp["minQty"] ? String(temp["minQty"]) : null;
                            newItem["maxQty"] = temp["maxQty"] ? String(temp["maxQty"]) : null;

                            newItem["price"] = temp["price"] ? parseFloat(temp["price"]) : null;



                            return newItem
                        })
                    } : undefined
                }
            }
        }
    )
    return { statusCode: 0, data };
}


async function updateItemPriceList(tx, priceTemplate, item, itemId) {
    let removedItems = item?.PriceTemplateDetails?.filter(oldItem => {
        let result = priceTemplate.find(newItem => newItem.id === oldItem.id)
        if (result) return false
        return true
    })

    console.log(priceTemplate, "priceTemplate");

    let removedItemsId = removedItems.map(item => parseInt(item.id))

    await tx.PriceTemplateDetails.deleteMany({
        where: {
            id: {
                in: removedItemsId
            }
        }
    })

    const promises = priceTemplate.map(async (priceItem) => {
        if (priceItem?.id) {
            return await tx.PriceTemplateDetails.update({
                where: {
                    id: parseInt(priceItem.id)
                },

                data: {
                    itemId: priceItem?.itemId ? parseInt(priceItem?.itemId) : undefined,
                    minQty: priceItem?.minQty ? String(priceItem?.minQty) : undefined,
                    maxQty: priceItem?.maxQty ? String(priceItem?.maxQty) : undefined,
                    price: priceItem?.price ? parseFloat(priceItem?.price) : undefined,


                }
            })
        } else {
            return await tx.PriceTemplateDetails.create({
                data: {
                    itemId: itemId ? parseInt(itemId) : undefined,
                    minQty: priceItem?.minQty ? String(priceItem?.minQty) : undefined,
                    maxQty: priceItem?.maxQty ? String(priceItem?.maxQty) : undefined,
                    price: priceItem?.price ? parseFloat(priceItem?.price) : undefined,
                }
            })
        }
    })
    return Promise.all(promises)
}


async function update(id, body) {
    const { itemId, priceTemplate } = body



    const dataFound = await prisma.priceTemplate.findUnique({
        where:
        {
            id: parseInt(id)
        },
        include: {
            PriceTemplateDetails: true
        }

    });
    if (!dataFound) return NoRecordFound("item");
    let data;




    await prisma.$transaction(async (tx) => {

        data = await tx.priceTemplate.update({
            where: {
                id: parseInt(id)
            },

            data: {
                itemId: itemId ? parseInt(itemId) : undefined,
            },
            include: {
                PriceTemplateDetails: true
            }





        })

        await updateItemPriceList(tx, priceTemplate, data, itemId)

    })
    return { statusCode: 0, data: data };
}

async function remove(id) {
    const data = await prisma.priceTemplate.delete({
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
