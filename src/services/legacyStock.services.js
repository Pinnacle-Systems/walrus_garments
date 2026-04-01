import { NoRecordFound } from '../configs/Responses.js';
import { prisma } from '../lib/prisma.js';
import { getFinYearStartTimeEndTime } from '../utils/finYearHelper.js';
import { getYearShortCodeForFinYear } from '../utils/helper.js';
import { getTableRecordWithId } from '../utils/helperQueries.js';




async function getNextDocId(branchId, shortCode, startTime, endTime) {


    let lastObject = await prisma.legacyStock.findFirst({
        where: {
            branchId: parseInt(branchId),
            AND: [
                {
                    createdAt: {
                        gte: startTime

                    }
                },
                {
                    createdAt: {
                        lte: endTime
                    }
                }
            ],
        },
        orderBy: {
            id: 'desc'
        }
    });
    const branchObj = await getTableRecordWithId(branchId, "branch")
    let newDocId = `${branchObj.branchCode}/${shortCode}/QUO/1`
    if (lastObject) {
        newDocId = `${branchObj.branchCode}/${shortCode}/QUO/${parseInt(lastObject.docId.split("/").at(-1)) + 1}`
    }
    return newDocId
}

async function get(req) {

    const { companyId, active } = req.query

    console.log(companyId, active, "companyId, active ")

    let data = await prisma.Quotation.findMany({
        where: {
            active: active ? Boolean(active) : undefined,
        },
        include: {
            Party: {
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
    const data = await prisma.Quotation.findUnique({
        where: {
            id: parseInt(id)
        }
    })
    if (!data) return NoRecordFound("size");
    return { statusCode: 0, data: { ...data, ...{ childRecord } } };
}

async function getSearch(req) {
    const { searchKey } = req.params
    const { companyId, active, } = req.query
    const data = await prisma.Quotation.findMany({
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

async function isLegacyLocation(storeId) {
    if (!storeId) return false;
    const location = await prisma.location.findUnique({
        where: { id: parseInt(storeId) }
    });
    console.log(location, "location")
    if (location && (location.storeName.toLowerCase().includes('old'))) {
        return true;
    }
    return false;
}

async function create(body) {
    const { stockItems, storeId, branchId } = body;

    let data


    await prisma.$transaction(async (tx) => {

        const formattedData = stockItems.map(item => ({
            inOrOut: "OpeningStock",

            itemId: item?.itemId ? parseInt(item.itemId) : undefined,
            sizeId: item?.sizeId ? parseInt(item.sizeId) : undefined,
            colorId: item?.colorId ? parseInt(item.colorId) : undefined,
            uomId: item?.uomId ? parseInt(item.uomId) : undefined,

            price: item?.price ? parseFloat(item.price) : undefined,
            qty: item?.qty ? parseFloat(item.qty) : undefined,

            branchId: branchId ? parseInt(branchId) : undefined,
            storeId: storeId ? parseInt(storeId) : undefined,

            barcode: item?.barcode_no ? String(item.barcode_no) : undefined
        }));

        console.log(formattedData, "formattedData")
        return data = await tx.stock.createMany({ data: formattedData });

    });
    return { statusCode: 0, data: data };
}

async function updateOrCreate(tx, item, quotationId, poType, poInwardOrDirectInward, storeId, branchId) {

    if (item?.id) {


        let updatedata = await tx.directItems.update({
            where: {
                id: parseInt(item.id)
            },
            data: {
                quotationId: parseInt(quotationId),
                itemId: item["itemId"] ? parseInt(item["itemId"]) : undefined,
                sizeId: item["sizeId"] ? parseInt(item["sizeId"]) : undefined,
                colorId: item["colorId"] ? parseInt(item["colorId"]) : undefined,
                uomId: item["uomId"] ? parseInt(item["uomId"]) : undefined,
                hsnId: item["hsnId"] ? parseInt(item["hsnId"]) : 0,
                qty: item["qty"] ? item["qty"] : 0,
                price: item["price"] ? item["price"] : 0,




            }
        })

        await createYarnItemsUpdateStock(tx, poType, poInwardOrDirectInward, branchId, storeId, item, item?.id)




    }


    else {
        let data = await tx.directItems.create({
            data: {
                quotationId: parseInt(quotationId),
                itemId: item["itemId"] ? parseInt(item["itemId"]) : undefined,
                sizeId: item["sizeId"] ? parseInt(item["sizeId"]) : undefined,
                colorId: item["colorId"] ? parseInt(item["colorId"]) : undefined,
                uomId: item["uomId"] ? parseInt(item["uomId"]) : undefined,
                hsnId: item["hsnId"] ? parseInt(item["hsnId"]) : 0,
                qty: item["qty"] ? item["qty"] : 0,
                price: item["price"] ? item["price"] : 0,
            }
        })

        await createYarnItemsStock(tx, poType, poInwardOrDirectInward, branchId, storeId, item, item?.id)
        // await createYarnItemsStock(tx, poType, poInwardOrDirectInward, branchId, storeId, item, data?.id, partyId)

    }
}

async function updateAllPInwardReturnItems(tx, directInwardReturnItems, directInwardOrReturnId, poType, poInwardOrDirectInward, storeId, branchId) {
    let promises = directInwardReturnItems?.map(async (item) => await updateOrCreate(tx, item, directInwardOrReturnId, poType, poInwardOrDirectInward, storeId, branchId))
    return Promise.all(promises)
}

async function update(id, body) {
    const { customerId, discountType, discountValue, quotationItems } = await body


    const dataFound = await prisma.legacyStock.findUnique({
        where: {
            id: parseInt(id)
        },
        include: {
            QuotationItems: true
        }
    })
    if (!dataFound) return NoRecordFound("directInwardOrReturn");
    let piData;


    let oldDirectInwardReturnIds = dataFound?.QuotationItems.map(item => parseInt(item.id))
    let currentDirectInwardReturnIds = quotationItems.filter(i => i?.id)?.map(item => parseInt(item.id))
    let removeItemsPurchaseInwardReturnIds = getRemovedItems(oldDirectInwardReturnIds, currentDirectInwardReturnIds);

    console.log(removeItemsPurchaseInwardReturnIds, 'removeItemsPurchaseInwardReturnIds')

    await prisma.$transaction(async (tx) => {

        await deletePurchaseInwardReturnItems(tx, removeItemsPurchaseInwardReturnIds);
        await deleteStockReturnItems(tx, removeItemsPurchaseInwardReturnIds);

        piData = await tx.legacyStock.update({
            where: {
                id: parseInt(id)
            },
            data: {
                poType, poInwardOrDirectInward,
                supplierId: parseInt(partyId),
                branchId: parseInt(locationId),
                storeId: parseInt(storeId),
                dcNo,
                dcDate: dcDate ? new Date(dcDate) : undefined,
                vehicleNo, specialInstructions, remarks,
                active,
                updatedById: parseInt(userId),


            },
        })
        await updateAllPInwardReturnItems(tx, directInwardReturnItems, piData.id, poType, poInwardOrDirectInward, storeId, branchId)
    })
    return { statusCode: 0, data: piData };
}

async function remove(id) {
    const data = await prisma.ItemControlPanel.delete({
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
