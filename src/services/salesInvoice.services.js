import { NoRecordFound } from '../configs/Responses.js';
import { prisma } from '../lib/prisma.js';
import { getFinYearStartTimeEndTime } from '../utils/finYearHelper.js';
import { getRemovedItems, getYearShortCodeForFinYear } from '../utils/helper.js';
import { getTableRecordWithId } from '../utils/helperQueries.js';




async function getNextDocId(branchId, shortCode, startTime, endTime) {


    let lastObject = await prisma.salesInvoice.findFirst({
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
    let newDocId = `${branchObj.branchCode}/${shortCode}/SD/1`
    if (lastObject) {
        newDocId = `${branchObj.branchCode}/${shortCode}/SD/${parseInt(lastObject.docId.split("/").at(-1)) + 1}`
    }
    return newDocId
}

async function get(req) {

    const { companyId, active } = req.query

    console.log(companyId, active, "companyId, active ")

    let data = await prisma.salesInvoice.findMany({
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
    const data = await prisma.salesInvoice.findUnique({
        where: {
            id: parseInt(id)
        },
        include: {
            SalesInvoiceItems: true
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
    const { customerId, discountType, discountValue, invoiceItems, finYearId, branchId } = await body


    let finYearDate = await getFinYearStartTimeEndTime(finYearId);
    const shortCode = finYearDate ? getYearShortCodeForFinYear(finYearDate?.startDateStartTime, finYearDate?.endDateEndTime) : "";
    let docId = await getNextDocId(branchId, shortCode, finYearDate?.startDateStartTime, finYearDate?.endDateEndTime);


    const data = await prisma.salesInvoice.create(
        {
            data: {
                customerId: customerId ? parseInt(customerId) : undefined,
                // discountType: discountType ? discountType : "",
                // discountValue: discountValue ? discountValue : "",
                // branchId: branchId ? parseInt(branchId) : "",
                docId: docId,
                SalesInvoiceItems: {
                    createMany: invoiceItems?.length > 0 ? {
                        data: invoiceItems?.map((temp) => {
                            let newItem = {}
                            newItem["itemId"] = temp["itemId"] ? parseInt(temp["itemId"]) : null;
                            newItem["sizeId"] = temp["sizeId"] ? parseInt(temp["sizeId"]) : null;
                            newItem["colorId"] = temp["colorId"] ? parseInt(temp["colorId"]) : null;
                            newItem["uomId"] = temp["uomId"] ? parseInt(temp["uomId"]) : null;
                            newItem["hsnId"] = temp["hsnId"] ? parseInt(temp["hsnId"]) : null;
                            newItem["qty"] = temp["qty"] ? temp["qty"] : null;
                            newItem["price"] = temp["price"] ? temp["price"] : null;


                            return newItem
                        })
                    } : undefined
                }
            }
        }
    )
    return { statusCode: 0, data };
}

async function updateOrCreate(tx, item, quotationId, poType, poInwardOrDirectInward, storeId, branchId) {

    if (item?.id) {


        let updatedata = await tx.SalesInvoiceItems.update({
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





    }


    else {
        let data = await tx.SalesInvoiceItems.create({
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


    }
}

async function updateAllPInwardReturnItems(tx, directInwardReturnItems, directInwardOrReturnId, poType, poInwardOrDirectInward, storeId, branchId) {
    let promises = directInwardReturnItems?.map(async (item) => await updateOrCreate(tx, item, directInwardOrReturnId, poType, poInwardOrDirectInward, storeId, branchId))
    return Promise.all(promises)
}

async function update(id, body) {
    const { customerId, discountType, discountValue, invoiceItems, branchId } = await body

    const dataFound = await prisma.salesInvoice.findUnique({
        where: {
            id: parseInt(id)
        },
        include: {
            SalesInvoiceItems: true
        }
    })
    if (!dataFound) return NoRecordFound("Sale Order");

    let oldItemIds = dataFound?.SalesInvoiceItems.map(item => parseInt(item.id))
    let currentItemIds = invoiceItems.filter(i => i?.id)?.map(item => parseInt(item.id))
    let removedItemIds = oldItemIds.filter(id => !currentItemIds.includes(id));

    let salesInvoiceData;

    await prisma.$transaction(async (tx) => {
        // Delete removed items
        if (removedItemIds.length > 0) {
            await tx.salesInvoiceItems.deleteMany({
                where: {
                    id: { in: removedItemIds }
                }
            });
        }

        // Update main record
        salesInvoiceData = await tx.salesInvoice.update({
            where: {
                id: parseInt(id)
            },
            data: {
                customerId: customerId ? parseInt(customerId) : undefined,

                branchId: branchId ? parseInt(branchId) : undefined,
            },
        })

        for (const item of (invoiceItems || []).filter(i => i.itemId)) {
            if (item.id) {
                await tx.salesInvoiceItems.update({
                    where: { id: parseInt(item.id) },
                    data: {
                        itemId: item.itemId ? parseInt(item.itemId) : null,
                        sizeId: item.sizeId ? parseInt(item.sizeId) : null,
                        colorId: item.colorId ? parseInt(item.colorId) : null,
                        uomId: item.uomId ? parseInt(item.uomId) : null,
                        hsnId: item.hsnId ? parseInt(item.hsnId) : null,
                        qty: item.qty ? item.qty.toString() : "0",
                        price: item.price ? item.price.toString() : "0",
                    }
                });
            } else {
                await tx.salesInvoiceItems.create({
                    data: {
                        salesInvoiceId: salesInvoiceData.id,
                        itemId: item.itemId ? parseInt(item.itemId) : null,
                        sizeId: item.sizeId ? parseInt(item.sizeId) : null,
                        colorId: item.colorId ? parseInt(item.colorId) : null,
                        uomId: item.uomId ? parseInt(item.uomId) : null,
                        hsnId: item.hsnId ? parseInt(item.hsnId) : null,
                        qty: item.qty ? item.qty.toString() : "0",
                        price: item.price ? item.price.toString() : "0",
                    }
                });
            }
        }
    })
    return { statusCode: 0, data: salesInvoiceData };
}
async function remove(id) {
    const data = await prisma.salesInvoice.delete({
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
