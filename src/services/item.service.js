import { NoRecordFound } from '../configs/Responses.js';
import { prisma } from '../lib/prisma.js';

async function get(req) {
    const { companyId, active } = req.query
    const data = await prisma.item.findMany({
        include: {
            ItemPriceList: true,
            _count: {
                select: {
                    DirectItems: true,
                }
            }
        },

    });
    return { statusCode: 0, data };
}


async function getOne(id) {
    const childRecord = 0;
    const data = await prisma.item.findUnique({
        where: {
            id: parseInt(id)
        },
        include: {
            ItemPriceList: {
                select: {
                    id: true,
                    itemId: true,
                    colorId: true,
                    Color: {
                        select: {
                            name: true
                        }
                    },
                    minStockQty: true,

                    Size: {
                        select: {
                            name: true
                        }
                    },
                    sizeId: true,
                    purchasePrice: true,
                    salesPrice: true,
                    MinimumStockQty: true,

                }
            }
        }

    })
    if (!data) return NoRecordFound("item");

    return { statusCode: 0, data: { ...data, childRecord } };
}

async function getSearch(req) {
    const { searchKey } = req.params
    const { companyId, active } = req.query
    const data = await prisma.item.findMany({
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
    const { styleId, sizeId, name, hsnId, code, itemType, salesPrice, purchasePrice, purchaseTaxType, itemPriceList, priceMethod, active,
        sectionId
    } = body
    const data = await prisma.item.create({
        data: {
            styleId: styleId ? parseInt(styleId) : undefined,
            sizeId: sizeId ? parseInt(sizeId) : undefined,
            name: name ? name : undefined,
            hsnId: hsnId ? parseInt(hsnId) : undefined,
            code: code ? code : undefined,
            sectionId: sectionId ? parseInt(sectionId) : undefined,
            priceMethod: priceMethod ? priceMethod : undefined,
            // salesPrice: salesPrice ? salesPrice : undefined,
            // purchasePrice: purchasePrice ? purchasePrice : undefined,
            // purchaseTaxType: purchaseTaxType ? purchaseTaxType : undefined,
            // salesTaxType: salesTaxType ? salesTaxType : undefined,
            active: active ? active : undefined,

            ItemPriceList: itemPriceList?.length > 0
                ? {
                    create: itemPriceList.map((item) => ({
                        colorId: item?.colorId ? parseInt(item.colorId) : undefined,
                        sizeId: item?.sizeId ? parseInt(item.sizeId) : undefined,
                        purchasePrice: item?.purchasePrice || undefined,
                        salesPrice: item?.salesPrice || undefined,
                        minStockQty: item?.minStockQty ? item?.minStockQty : undefined,

                        MinimumStockQty: item?.MinimumStockQty?.length > 0
                            ? {
                                create: item?.MinimumStockQty?.filter(i => i.locationId)?.map((min) => ({
                                    minStockQty: min?.minStockQty ? String(min?.minStockQty) : "0",
                                    locationId: min?.locationId ? parseInt(min?.locationId) : undefined,


                                })),
                            }
                            : undefined,
                    })),
                }
                : undefined,


        }
    });



    return { statusCode: 0, data: { data } };
}

// async function updateStylePanel(tx, sampleDetails, sampleData) {




async function createItemPanelProcess(tx, itemPanelId, ItemPanelProcess, item) {

    let promises = ItemPanelProcess.map(async (temp, index) => {
        await tx.itemPanelProcess.create({
            data: {
                itemPanelId: parseInt(itemPanelId),
                processId: temp ? parseInt(temp) : undefined

            }
        })
    }
    )

    return Promise.all(promises)
}



async function updateOrCreate(tx, item, itemId) {

    if (item?.id) {

        let updatedata = await tx.itemPanel.update({
            where: {
                id: parseInt(item.id)
            },
            data: {
                itemId: parseInt(itemId),
                panelId: item["panelId"] ? parseInt(item["panelId"]) : undefined,

                ItemPanelProcess: {
                    deleteMany: {},
                }
            }
        })


        return await createItemPanelProcess(tx, updatedata?.id, item?.selectedAddons, item)

    } else {
        let data = await tx.itemPanel.create({
            data: {
                itemId: parseInt(itemId),
                panelId: item["panelId"] ? parseInt(item["panelId"]) : undefined,
            }
        })
        return await createItemPanelProcess(tx, data?.id, item?.selectedAddons, item)
    }

}

async function updateItemPanelData(tx, panelIdArray, itemId) {
    let promises = panelIdArray.map(async (item) => await updateOrCreate(tx, item, itemId))
    return Promise.all(promises)
}


async function deleteItemPanelId(tx, removeItemPanelIds) {
    return await tx.itemPanel.deleteMany({
        where: {
            id: {
                in: removeItemPanelIds
            }
        }
    })
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

    const promises = itemPriceList.map(async (item) => {
        if (item?.id) {
            return await tx.ItemPriceList.update({
                where: {
                    id: parseInt(item.id)
                },

                data: {
                    itemId: item?.itemId ? parseInt(item?.itemId) : undefined,
                    sizeId: item?.sizeId ? parseInt(item?.sizeId) : undefined,
                    purchasePrice: item?.purchasePrice ? item?.purchasePrice : undefined,
                    colorId: item?.colorId ? parseInt(item?.colorId) : undefined,
                    salesPrice: item?.salesPrice ? item?.salesPrice : undefined,
                    minStockQty: item?.minStockQty ? item?.minStockQty : undefined,


                }
            })
        } else {
            return await tx.ItemPriceList.create({
                data: {

                    purchasePrice: item?.purchasePrice ? item?.purchasePrice : undefined,
                    sizeId: item?.sizeId ? parseInt(item?.sizeId) : undefined,
                    colorId: item?.colorId ? parseInt(item?.colorId) : undefined,
                    salesPrice: item?.salesPrice ? item?.salesPrice : undefined,
                    minStockQty: item?.minStockQty ? item?.minStockQty : undefined,


                }
            })
        }
    })
    return Promise.all(promises)
}


async function update(id, body) {
    const { styleId, sizeId, name, hsnId, code, itemType, salesPrice, purchasePrice, purchaseTaxType, salesTaxType, priceMethod, active,

        itemPriceList, sectionId
    } = body



    const dataFound = await prisma.item.findUnique({
        where:
        {
            id: parseInt(id)
        },
        include: {
            ItemPriceList: true
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

                // salesPrice: salesPrice ? salesPrice : undefined,
                // purchasePrice: purchasePrice ? purchasePrice : undefined,
                // purchaseTaxType: purchaseTaxType ? purchaseTaxType : undefined,
                // salesTaxType: salesTaxType ? salesTaxType : undefined,
                active: active ? active : undefined,
            },
            include: {
                ItemPriceList: true
            }





        })

        await updateItemPriceList(tx, itemPriceList, data)

    })
    return { statusCode: 0, data: data };
}





// async function update(id, body) {

//     await checkIsItemIsUsed(id)

//     const { name, code, companyId, active, itemTypeId, itemDescription, panelId } = await body;

//     const dataFound = await prisma.item.findUnique({
//         where: { id: parseInt(id) },
//     });
//     if (!dataFound) return NoRecordFound("style");

//     const data = await prisma.$transaction(async (tx) => {
//         const updatedStyle = await tx.item.update({
//             where: { id: parseInt(id) },
//             data: {
//                 name,
//                 code,
//                 itemDescription,
//                 companyId: parseInt(companyId),
//                 itemTypeId: itemTypeId ? parseInt(itemTypeId) : undefined,
//                 active
//             },
//             include: {
//                 ItemPanel: {
//                     include: {
//                         ItemPanelProcess: true
//                     }
//                 }
//             }
//         });

//         await updateStylePanel(tx, panelId, updatedStyle);

//         return updatedStyle;
//     });

//     return { statusCode: 0, data };
// }


async function checkIsItemIsUsed(itemId) {

    let data = await prisma.$queryRaw`select *
    from sample sam
     LEFT JOIN 
     SampleDetails sd on sam.id = sd.sampleId
    where sd.itemId = ${itemId}
    `

    if (data?.length > 0) throw Error("This Item Is Already used in Sample")
    return

}

async function remove(id) {
    let data;

    // await checkIsItemIsUsed(id)
    data = await prisma.item.delete({
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
