import { PrismaClient } from '@prisma/client'
import { NoRecordFound } from '../configs/Responses.js';
import { getRemovedItems } from '../utils/helper.js';

const prisma = new PrismaClient()


async function get(req) {
    const { companyId, active } = req.query
    const data = await prisma.item.findMany({
        where: {
            companyId: companyId ? parseInt(companyId) : undefined,
            active: active ? Boolean(active) : undefined,
        },
        include: {
            ItemType: true,
            ItemPanel: {
                select: {
                    id: true,
                    panelId: true,
                    ItemPanelProcess: {
                        select: {
                            processId: true
                        }

                    }
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
            ItemType: true,
            ItemPanel: {
                select: {
                    id: true,
                    panelId: true,
                    ItemPanelProcess: {
                        select: {
                            processId: true
                        }

                    }
                }
            }
        }
    })
    if (!data) return NoRecordFound("item");
    const modifiedData = {
        ...data,
        ItemPanel: data.ItemPanel.map(panel => ({
            panelId: panel.panelId,
            id: panel.id,
            selectedAddons: panel.ItemPanelProcess.map(process => process.processId)
        }))
    }
    return { statusCode: 0, data: { ...modifiedData, childRecord } };
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
    const { name, code, companyId, active, itemTypeId, itemDescription, panelId } = body
    const itemdata = await prisma.item.create({
        data: {
            name,
            code,
            itemDescription,
            companyId: parseInt(companyId),
            itemTypeId: itemTypeId ? parseInt(itemTypeId) : undefined,
            active
        }
    });

    const itemPanelData = await Promise.all(
        panelId.map(async (panel) => {
            return await prisma.itemPanel.create({
                data: {
                    Item: { connect: { id: itemdata.id } },
                    Panel: { connect: { id: parseInt(panel.panelId) } }
                }
            });
        })
    );

    const itemPanelProcessData = await Promise.all(
        itemPanelData.map(async (itemPanel, index) => {
            if (panelId[index]?.selectedAddons) {
                return Promise.all(
                    panelId[index].selectedAddons.map(async (addon) => {
                        return await prisma.itemPanelProcess.create({
                            data: {
                                ItemPanel: { connect: { id: itemPanel.id } },
                                Process: { connect: { id: parseInt(addon) } }
                            }
                        });
                    })
                );
            }
            return [];
        })
    );

    return { statusCode: 0, data: { item: itemdata, panels: itemPanelData, panelProcesses: itemPanelProcessData } };
}

// async function updateStylePanel(tx, sampleDetails, sampleData) {
//     const parsedSampleDetails = typeof sampleDetails === "string"
//         ? JSON.parse(sampleDetails)
//         : sampleDetails;

//     const removedItems = sampleData.ItemPanel.filter(oldItem => {
//         return !parsedSampleDetails.some(newItem => newItem.panelId == oldItem.panelId);
//     });

//     const removedItemsId = removedItems.map(item => item.id);
//     await tx.ItemPanel.deleteMany({
//         where: {
//             id: { in: removedItemsId }
//         }
//     });
//     const promises = parsedSampleDetails.map(async (panelDetail) => {
//         const ItemPanel = await tx.ItemPanel.upsert({
//             where: { panelId_itemId: { panelId: panelDetail.panelId, itemId: sampleData.id } },
//             update: {},
//             create: {
//                 panelId: panelDetail.panelId,
//                 itemId: sampleData.id,
//             }
//         });

//         await tx.ItemPanelProcess.deleteMany({
//             where: { itemPanelId: ItemPanel.id }
//         });

//         const processPromises = panelDetail.selectedAddons.map(async (addonId) => {
//             return await tx.ItemPanelProcess.create({
//                 data: {
//                     itemPanelId: ItemPanel.id,
//                     processId: addonId
//                 }
//             });
//         });

//         return Promise.all(processPromises);
//     });

//     return Promise.all(promises);
// }




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


async function update(id, body) {
    const { name, code, companyId, active, itemTypeId, itemDescription, panelId } = await body;



    const dataFound = await prisma.item.findUnique({
        where:
        {
            id: parseInt(id)
        },
        include: {
            ItemPanel: {
                select: {
                    id: true,
                    Panel: true,
                    panelId: true,
                    itemId: true,
                    ItemPanelProcess: true

                }
            }
        }
    });
    if (!dataFound) return NoRecordFound("item");
    let panelData;


    let oldPanelIds = dataFound.ItemPanel.map(item => parseInt(item.id))
    let currentPanelIds = panelId.filter(i => i?.id)?.map(item => parseInt(item.id))
    let removeItemPanelIds = getRemovedItems(oldPanelIds, currentPanelIds);

    console.log(removeItemPanelIds, "removeItemPanelIds")

    await prisma.$transaction(async (tx) => {

        await deleteItemPanelId(tx, removeItemPanelIds);
        panelData = await tx.item.update({
            where: {
                id: parseInt(id)
            },
            data: {
                name,
                code,
                itemDescription,
                companyId: parseInt(companyId),
                itemTypeId: itemTypeId ? parseInt(itemTypeId) : undefined,
                active
            },
        })
        await updateItemPanelData(tx, panelId, panelData.id)

    })
    return { statusCode: 0, data: panelData };
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

    await checkIsItemIsUsed(id)
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
