import { NoRecordFound } from '../configs/Responses.js';
import { prisma } from '../lib/prisma.js';
import { getFinYearStartTimeEndTime } from '../utils/finYearHelper.js';
import { getYearShortCodeForFinYear } from '../utils/helper.js';
import { getTableRecordWithId } from '../utils/helperQueries.js';

function parseIntOrUndefined(value) {
    if (value === undefined || value === null || value === "") return undefined;
    const parsedValue = parseInt(value, 10);
    return Number.isNaN(parsedValue) ? undefined : parsedValue;
}




async function getNextDocId(branchId, shortCode, startTime, endTime) {


    let lastObject = await prisma.quotation.findFirst({
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
    const { companyId, active } = req.query;

    let data = await prisma.quotation.findMany({
        where: {
            active: active ? Boolean(active) : undefined,
        },
        include: {
            Party: {
                select: {
                    name: true,
                    BranchType: {
                        select: {
                            name: true
                        }
                    },
                    City: {
                        select: {
                            name: true
                        }
                    }
                },
            },
            QuotationItems: true,
            Saleorder: {
                select: {
                    id: true,
                    docId: true,
                },
            },
            _count: {
                select: {
                    Saleorder: true,

                }
            }
        },
        orderBy: {
            id: "desc"
        }
    });

    const result = await Promise.all(
        data.map(async (item) => {
            const paymentData = await prisma.payment.findMany({
                where: {
                    transactionType: "QUOTATION",
                    transactionId: item.id,
                },
            });

            return {
                ...item,
                paymentData, // ✅ attach per item
            };
        })
    );

    return { statusCode: 0, data: result };
}


async function getOne(id) {
    const childRecord = 0;
    const data = await prisma.Quotation.findUnique({
        where: {
            id: parseInt(id)
        },
        include: {
            QuotationItems: true
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

async function create(body) {
    const {
        customerId,
        discountType,
        discountValue,
        quoteItems,
        finYearId,
        branchId,
        termId,
        remarks,
        termsAndCondition,
        minimumAdvancePayment,
        packingChargeEnabled,
        packingCharge,
        shippingChargeEnabled,
        shippingCharge,
    } = await body


    let finYearDate = await getFinYearStartTimeEndTime(finYearId);
    const shortCode = finYearDate ? getYearShortCodeForFinYear(finYearDate?.startDateStartTime, finYearDate?.endDateEndTime) : "";
    let docId = await getNextDocId(branchId, shortCode, finYearDate?.startDateStartTime, finYearDate?.endDateEndTime);


    const data = await prisma.quotation.create(
        {
            data: {
                customerId: customerId ? parseInt(customerId) : undefined,
                discountType: discountType ? discountType : "",
                discountValue: discountValue ? discountValue : "",
                branchId: branchId ? parseInt(branchId) : undefined,
                docId: docId,
                termId: termId ? parseInt(termId) : undefined,
                minimumAdvancePayment: minimumAdvancePayment ? String(minimumAdvancePayment) : undefined,
                packingChargeEnabled: Boolean(packingChargeEnabled),
                packingCharge: packingChargeEnabled ? String(packingCharge || 0) : null,
                shippingChargeEnabled: Boolean(shippingChargeEnabled),
                shippingCharge: shippingChargeEnabled ? String(shippingCharge || 0) : null,
                remarks: remarks ? remarks : undefined,
                termsAndCondition: termsAndCondition ? termsAndCondition : undefined,
                QuotationItems: {
                    createMany: quoteItems?.length > 0 ? {
                        data: quoteItems?.filter(temp => temp.itemId).map((temp) => {
                            let newItem = {}
                            newItem["itemId"] = parseIntOrUndefined(temp["itemId"]);
                            newItem["sizeId"] = parseIntOrUndefined(temp["sizeId"]);
                            newItem["colorId"] = parseIntOrUndefined(temp["colorId"]);
                            newItem["hsnId"] = parseIntOrUndefined(temp["hsnId"]);
                            newItem["uomId"] = parseIntOrUndefined(temp["uomId"]);
                            newItem["qty"] = String(temp["qty"]);
                            newItem["price"] = String(temp["price"]);

                            newItem["discountType"] = temp["discountType"];
                            newItem["discountValue"] = String(temp["discountValue"] || "");
                            newItem["taxPercent"] = String(temp["taxPercent"]);
                            newItem["priceType"] = String(temp["priceType"]);
                            // newItem["taxMethod"] = String(temp["taxMethod"]);

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


        let updatedata = await tx.quoteItems.update({
            where: {
                id: parseInt(item.id)
            },
            data: {
                quotationId: parseInt(quotationId),
                itemId: parseIntOrUndefined(item["itemId"]),
                sizeId: parseIntOrUndefined(item["sizeId"]),
                colorId: parseIntOrUndefined(item["colorId"]),
                hsnId: parseIntOrUndefined(item["hsnId"]) || 0,
                uomId: parseIntOrUndefined(item["uomId"]),
                qty: item["qty"] ? item["qty"] : 0,
                price: item["price"] ? item["price"] : 0,

                discountType: item["discountType"] ? item["discountType"] : "",
                discountValue: item["discountValue"] ? item["discountValue"] : "",
                taxPercent: item["taxPercent"] ? item["taxPercent"] : "",
                priceType: item["priceType"] ? item["priceType"] : "",



            }
        })





    }


    else {
        let data = await tx.quoteItems.create({
            data: {
                quotationId: parseInt(quotationId),
                itemId: parseIntOrUndefined(item["itemId"]),
                sizeId: parseIntOrUndefined(item["sizeId"]),
                colorId: parseIntOrUndefined(item["colorId"]),
                uomId: parseIntOrUndefined(item["uomId"]),
                hsnId: parseIntOrUndefined(item["hsnId"]),
                qty: item["qty"] ? String(item["qty"]) : "",
                price: item["price"] ? String(item["price"]) : "",

                discountType: item["discountType"] ? String(item["discountType"]) : "",
                discountValue: item["discountValue"] ? String(item["discountValue"]) : "",
                taxPercent: item["taxPercent"] ? String(item["taxPercent"]) : "",
                priceType: item["priceType"] ? item["priceType"] : "",

            }
        })


    }
}

async function updateAllPInwardReturnItems(tx, directInwardReturnItems, directInwardOrReturnId, poType, poInwardOrDirectInward, storeId, branchId) {
    let promises = directInwardReturnItems?.map(async (item) => await updateOrCreate(tx, item, directInwardOrReturnId, poType, poInwardOrDirectInward, storeId, branchId))
    return Promise.all(promises)
}

async function update(id, body) {
    const {
        customerId,
        discountType,
        discountValue,
        quoteItems,
        branchId,
        termId,
        remarks,
        termsAndCondition,
        minimumAdvancePayment,
        packingChargeEnabled,
        packingCharge,
        shippingChargeEnabled,
        shippingCharge,
    } = await body

    const dataFound = await prisma.quotation.findUnique({
        where: {
            id: parseInt(id)
        },
        include: {
            QuotationItems: true
        }
    })
    if (!dataFound) return NoRecordFound("Quotation");

    let oldItemIds = dataFound?.QuotationItems.map(item => parseInt(item.id))
    let currentItemIds = quoteItems.filter(i => i?.id)?.map(item => parseInt(item.id))

    // Manual filtering for removed items if helper is not available/consistent
    let removedItemIds = oldItemIds.filter(id => !currentItemIds.includes(id));

    let piData;

    await prisma.$transaction(async (tx) => {
        // Delete removed items
        if (removedItemIds.length > 0) {
            await tx.quotationItems.deleteMany({
                where: {
                    id: { in: removedItemIds }
                }
            });
        }

        // Update main record
        piData = await tx.quotation.update({
            where: {
                id: parseInt(id)
            },
            data: {
                customerId: customerId ? parseInt(customerId) : undefined,
                discountType: discountType || "",
                discountValue: discountValue || "",
                branchId: branchId ? parseInt(branchId) : undefined,
                termId: termId ? parseInt(termId) : null,
                minimumAdvancePayment: minimumAdvancePayment ? String(minimumAdvancePayment) : null,
                packingChargeEnabled: Boolean(packingChargeEnabled),
                packingCharge: packingChargeEnabled ? String(packingCharge || 0) : null,
                shippingChargeEnabled: Boolean(shippingChargeEnabled),
                shippingCharge: shippingChargeEnabled ? String(shippingCharge || 0) : null,
                remarks: remarks || null,
                termsAndCondition: termsAndCondition || null,
            },
        })

        // Process items (Update or Create)
        for (const item of (quoteItems || []).filter(i => i.itemId)) {
            if (item.id) {
                await tx.quotationItems.update({
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
                await tx.quotationItems.create({
                    data: {
                        quotationId: piData.id,
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
    return { statusCode: 0, data: piData };
}

async function remove(id) {
    const data = await prisma.quotation.delete({
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
