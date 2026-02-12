import { NoRecordFound } from '../configs/Responses.js';
import { prisma } from '../lib/prisma.js';

async function get(req) {
    const { companyId, active } = req.query
    const data = await prisma.style.findMany({
        where: {

            companyId: companyId ? parseInt(companyId) : undefined,

            active: active ? Boolean(active) : undefined,
        },
        include : {
                _count : {
                    select : {
                        OrderDetails : true
                    }
                }
        }

    });
    return { statusCode: 0, data };
}


async function getOne(id) {
    const childRecord = 0;
    const data = await prisma.style.findUnique({
        where: {
            id: parseInt(id)
        },
 
    });

    if (!data) return NoRecordFound("style");

    // const modifiedData = {
    //     ...data,
    //     StylePanel: data.StylePanel.map(panel => ({
    //         panelId: panel.panelId,
    //         selectedAddons: panel.StylePanelProcess.map(process => process.processId)
    //     }))
    // };
    return { statusCode: 0, data: { ...data, ...{ childRecord } } };
}


async function getSearch(req) {
    const searchKey = req.params.searchKey
    const { branchId, active } = req.query
    const data = await prisma.style.findMany({
        where: {

            active: active ? Boolean(active) : undefined,
            OR: [
                {
                    name: {
                        contains: searchKey,
                    },
                },

            ],
        },

    })
    // return { statusCode: 0, data: data.map((item) => exclude({ ...item }, ["image"])) };
    return { statusCode: 0, data: data };

}

export async function upload(req) {
    const { id } = req.params
    const { isDelete } = req.body
    const data = await prisma.style.update({
        where: {
            id: parseInt(id)
        },
        data: {
            logo: (isDelete && JSON.parse(isDelete)) ? "" : req.file.filename,
        }
    }
    )
    return { statusCode: 0, data };
}


async function create(req) {
    String
    const { name, fabricId, colorId, companyId, active, styleCode, panelId, sku } = await req;
    const data = await prisma.style.create({
        data: {
            name,
            // styleCode, 
            sku,
            // fabricId: fabricId ? parseInt(fabricId) : null,
            // colorId: colorId ? parseInt(colorId) : null,
            active: active !== undefined ? JSON.parse(active) : undefined,
            companyId: companyId ? parseInt(companyId) : null,
        }
    });

    // const stylePanelData = await Promise.all(panelId.map(async (panel) => {
    //     return await prisma.stylePanel.create({
    //         data: {
    //             Style: { connect: { id: styleData.id } },
    //             Panel: { connect: { id: parseInt(panel.panelId) } }
    //         }
    //     });
    // }));

    // const stylePanelProcessData = await Promise.all(
    //     stylePanelData.map(async (stylePanel, index) => {
    //         return Promise.all(
    //             panelId[index].selectedAddons.map(async (addon) => {
    //                 return await prisma.stylePanelProcess.create({
    //                     data: {
    //                         StylePanel: { connect: { id: stylePanel.id } },
    //                         Process: { connect: { id: parseInt(addon) } }
    //                     }
    //                 });
    //             }));
    //     }));

    return { statusCode: 0, data };
}
async function updateStylePanel(tx, sampleDetails, sampleData) {


    const parsedSampleDetails = typeof sampleDetails === "string"
        ? JSON.parse(sampleDetails)
        : sampleDetails;

    const removedItems = sampleData.StylePanel.filter(oldItem => {
        return !parsedSampleDetails.some(newItem => newItem.panelId === oldItem.panelId);
    });

    const removedItemsId = removedItems.map(item => item.id);
    await tx.StylePanel.deleteMany({
        where: {
            id: { in: removedItemsId }
        }
    });
    const promises = parsedSampleDetails.map(async (panelDetail) => {
        const stylePanel = await tx.StylePanel.upsert({
            where: { panelId_styleId: { panelId: panelDetail.panelId, styleId: sampleData.id } },
            update: {},
            create: {
                panelId: panelDetail.panelId,
                styleId: sampleData.id,
            }
        });

        await tx.StylePanelProcess.deleteMany({
            where: { stylePanelId: stylePanel.id }
        });

        const processPromises = panelDetail.selectedAddons.map(async (addonId) => {
            return await tx.StylePanelProcess.create({
                data: {
                    stylePanelId: stylePanel.id,
                    processId: addonId
                }
            });
        });

        return Promise.all(processPromises);
    });

    return Promise.all(promises);
}

async function update(id, body) {


    const { name, fabricId, colorId, companyId, active, styleCode, panelId, sku } = await body;

    const dataFound = await prisma.style.findUnique({
        where: { id: parseInt(id) },
    });

    if (!dataFound) return NoRecordFound("style");


    const data = await prisma.style.update({
        where: { id: parseInt(id) },
        data: {
            name,
            sku,
            companyId: companyId ? parseInt(companyId) : null,
        },

    });

    // await updateStylePanel(tx, panelId, updatedStyle);

    // return updatedStyle;


    return { statusCode: 0, data };
}


async function remove(id) {
    const data = await prisma.style.delete({
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
