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
                            newItem["qty"] = temp["qty"] ? String(temp["qty"]) : null;
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


async function updateItemPriceList(tx, itemPriceList, item) {
    let removedItems = item?.ItemPriceList?.filter(oldItem => {
        let result = itemPriceList.find(newItem => newItem.id === oldItem.id)
        if (result) return false
        return true
    })

    console.log(itemPriceList, "item");

    let removedItemsId = removedItems.map(item => parseInt(item.id))

    await tx.ItemPriceList.deleteMany({
        where: {
            id: {
                in: removedItemsId
            }
        }
    })

    const promises = itemPriceList.map(async (priceItem) => {
        if (priceItem?.id) {
            return await tx.ItemPriceList.update({
                where: {
                    id: parseInt(priceItem.id)
                },

                data: {
                    itemId: priceItem?.itemId ? parseInt(priceItem?.itemId) : undefined,
                    sizeId: priceItem?.sizeId ? parseInt(priceItem?.sizeId) : undefined,
                    offerPrice: priceItem?.offerPrice ? priceItem?.offerPrice : undefined,
                    colorId: priceItem?.colorId ? parseInt(priceItem?.colorId) : undefined,
                    salesPrice: priceItem?.salesPrice ? priceItem?.salesPrice : undefined,
                    minStockQty: priceItem?.minStockQty ? priceItem?.minStockQty : undefined,


                }
            })
        } else {
            return await tx.ItemPriceList.create({
                data: {
                    itemId: parseInt(item?.id),
                    offerPrice: priceItem?.offerPrice ? priceItem?.offerPrice : undefined,
                    sizeId: priceItem?.sizeId ? parseInt(priceItem?.sizeId) : undefined,
                    colorId: priceItem?.colorId ? parseInt(priceItem?.colorId) : undefined,
                    salesPrice: priceItem?.salesPrice ? priceItem?.salesPrice : undefined,
                    minStockQty: priceItem?.minStockQty ? priceItem?.minStockQty : undefined,
                }
            })
        }
    })
    return Promise.all(promises)
}


async function update(id, body) {
    const { styleId, sizeId, name, hsnId, code, priceMethod, active, itemPriceList, sectionId, fields } = body



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

        data = await tx.item.update({
            where: {
                id: parseInt(id)
            },

            data: {
                styleId: styleId ? parseInt(styleId) : undefined,
                sizeId: sizeId ? parseInt(sizeId) : undefined,
                name: name ? name : undefined,
                hsnId: hsnId ? parseInt(hsnId) : undefined,
                code: code ? code : undefined,
                sectionId: sectionId ? parseInt(sectionId) : undefined,
                priceMethod: priceMethod ? priceMethod : undefined,
                active: active ? active : undefined,

                field1: fields?.[0] ?? "",
                field2: fields?.[1] ?? "",
                field3: fields?.[2] ?? "",
                field4: fields?.[3] ?? "",
                field5: fields?.[4] ?? "",

            },
            include: {
                ItemPriceList: true
            }





        })

        await updateItemPriceList(tx, itemPriceList, data)

    })
    return { statusCode: 0, data: data };
}

async function remove(id) {
    const data = await prisma.saleOrder.delete({
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
