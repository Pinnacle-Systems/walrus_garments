import { NoRecordFound } from '../configs/Responses.js';
import { prisma } from '../lib/prisma.js';

async function get(req) {
    const { branchId, active } = req.query

    const data = await prisma.offer.findMany({
        where: {
            // branchId: branchId ? parseInt(branchId) : undefined,
            // active: active ? Boolean(active === 'true') : undefined,
        },
        include: {
            OfferScope: true,
            OfferRule: true,
            OfferTier: true
        },
        // orderBy: {
        //     priority: 'desc'
        // }
    });

    // const mappedData = data.map(item => ({
    //     ...item,
    //     validFrom: item.startTime || (item.OfferRule?.[0]?.conditions?.metadata?.validFrom || null),
    //     validTo: item.endTime || (item.OfferRule?.[0]?.conditions?.metadata?.validTo || null)
    // }));

    return { statusCode: 0, data: data };
}

async function getOne(id) {
    const data = await prisma.offer.findUnique({
        where: { id: parseInt(id) },
        include: {
            OfferScope: true,
            OfferRule: true,
            OfferTier: true
        }
    })
    if (!data) return NoRecordFound("Offer");
    const mappedData = {
        ...data,
        validFrom: data.startTime || (data.OfferRule?.[0]?.conditions?.metadata?.validFrom || null),
        validTo: data.endTime || (data.OfferRule?.[0]?.conditions?.metadata?.validTo || null)
    };
    return { statusCode: 0, data: mappedData };
}

async function getSearch(req) {
    const { searchKey } = req.params
    const { branchId, active } = req.query
    const data = await prisma.offer.findMany({
        where: {
            branchId: branchId ? parseInt(branchId) : undefined,
            active: active ? Boolean(active === 'true') : undefined,
            OR: [
                { name: { contains: searchKey } },
                { couponCode: { contains: searchKey } },
            ],
        },
        include: {
            OfferScope: true,
            OfferRule: true,
            OfferTier: true
        }
    })
    const mappedData = data.map(item => ({
        ...item,
        validFrom: item.startTime || (item.OfferRule?.[0]?.conditions?.metadata?.validFrom || null),
        validTo: item.endTime || (item.OfferRule?.[0]?.conditions?.metadata?.validTo || null)
    }));
    return { statusCode: 0, data: mappedData };
}

async function create(body) {
    const {
        name, code, description, offerType, active, priority,
        validFrom, validTo, startTime, endTime, daysOfWeek, noEndDate,
        scope, scopeSelection, selectionIds,
        conditions, conditionLogic,
        discountType, discountValue, maxDiscountValue,
        applyOn, tiers,
        itemSelection, minQty, minBillAmount, comboItems,
        couponCode, usageLimit, perCustomerLimit,
        freeItemId, freeItemQty, applyToClearance, applyToRegular
    } = await body

    const rawSelection = selectionIds || scopeSelection;
    const parsedSelection = typeof rawSelection === 'string' ? JSON.parse(rawSelection) : (rawSelection || []);

    const data = await prisma.offer.create({
        data: {
            name,
            code,
            offerType,
            active,
            applyToClearance: applyToClearance ? Boolean(applyToClearance) : false,
            applyToRegular: applyToRegular ? Boolean(applyToRegular) : false,
            priority: priority ? parseInt(priority) : 0,
            startTime: validFrom,
            endTime: validTo,
            daysOfWeek,
            noEndDate: noEndDate === true,
            scopeMode: scope,
            itemSelection,
            minQty: minQty ? parseFloat(minQty) : 0,
            minBillAmount: minBillAmount ? parseFloat(minBillAmount) : 0,
            comboItems,
            couponCode,
            usageLimit: usageLimit ? parseInt(usageLimit) : undefined,
            perCustomerLimit: perCustomerLimit ? parseInt(perCustomerLimit) : undefined,
            discountType,
            discountValue: discountValue ? parseFloat(discountValue) : 0,
            maxDiscountValue: maxDiscountValue ? parseFloat(maxDiscountValue) : 0,
            freeItemId: freeItemId ? parseInt(freeItemId) : undefined,
            freeItemQty: freeItemQty ? parseFloat(freeItemQty) : 1,
            // branchId: branchId ? parseInt(branchId) : undefined,
            OfferScope: {
                create: parsedSelection.map(s => ({
                    type: scope,
                    refId: parseInt(s.value || s)
                }))
            },
            OfferRule: {
                create: {
                    logic: conditionLogic || 'AND',
                    conditions: {
                        rules: conditions || [],
                        metadata: {
                            description,
                            validFrom,
                            validTo,
                            applyOn,
                            tiers: typeof tiers === 'string' ? JSON.parse(tiers) : (tiers || [])
                        }
                    }
                }
            },
            OfferTier: {
                create: (typeof tiers === 'string' ? JSON.parse(tiers) : (tiers || [])).map(t => ({
                    minQty: t.minQty ? parseFloat(t.minQty) : 0,
                    type: t.type,
                    value: t.value ? parseFloat(t.value) : 0
                }))
            }
        }
    })
    return {
        statusCode: 0,
        data: {
            ...data,
            validFrom: data.startTime,
            validTo: data.endTime
        }
    };
}

async function update(id, body) {
    const {
        name, code, description, offerType, active, priority,
        validFrom, validTo, startTime, endTime, daysOfWeek, noEndDate,
        scope, scopeSelection, selectionIds,
        conditions, conditionLogic,
        discountType, discountValue, maxDiscountValue,
        applyOn, tiers,
        itemSelection, minQty, minBillAmount, comboItems,
        couponCode, usageLimit, perCustomerLimit,
        freeItemId, freeItemQty, branchId, applyToClearance, applyToRegular
    } = await body

    const dataFound = await prisma.offer.findUnique({
        where: { id: parseInt(id) }
    })
    if (!dataFound) return NoRecordFound("Offer");

    const rawSelection = selectionIds || scopeSelection;
    const parsedSelection = typeof rawSelection === 'string' ? JSON.parse(rawSelection) : (rawSelection || []);

    const data = await prisma.offer.update({
        where: { id: parseInt(id) },
        data: {
            name,
            code,
            // offerType: offerType ? String(offerType) : undefined,
            active,
            applyToClearance: applyToClearance ? Boolean(applyToClearance) : false,
            applyToRegular: applyToRegular ? Boolean(applyToRegular) : false,
            priority: priority ? parseInt(priority) : undefined,
            startTime: validFrom,
            endTime: validTo,
            daysOfWeek,
            noEndDate: noEndDate === true,
            scopeMode: scope,
            itemSelection: itemSelection,
            minQty: minQty ? parseFloat(minQty) : undefined,
            minBillAmount: minBillAmount ? parseFloat(minBillAmount) : undefined,
            comboItems: comboItems,
            couponCode,
            usageLimit: usageLimit ? parseInt(usageLimit) : undefined,
            perCustomerLimit: perCustomerLimit ? parseInt(perCustomerLimit) : undefined,
            discountType,
            discountValue: discountValue ? parseFloat(discountValue) : undefined,
            maxDiscountValue: maxDiscountValue ? parseFloat(maxDiscountValue) : undefined,
            freeItemId: freeItemId ? parseInt(freeItemId) : undefined,
            freeItemQty: freeItemQty ? parseFloat(freeItemQty) : undefined,
            branchId: branchId ? parseInt(branchId) : undefined,
            OfferScope: {
                deleteMany: {},
                create: parsedSelection.map(s => ({
                    type: scope,
                    refId: parseInt(s.value || s)
                }))
            },
            OfferRule: {
                deleteMany: {},
                create: {
                    logic: conditionLogic || 'AND',
                    conditions: {
                        rules: conditions || [],
                        metadata: {
                            description,
                            validFrom,
                            validTo,
                            applyOn,
                            tiers: typeof tiers === 'string' ? JSON.parse(tiers) : (tiers || [])
                        }
                    }
                }
            },
            OfferTier: {
                deleteMany: {},
                create: (typeof tiers === 'string' ? JSON.parse(tiers) : (tiers || [])).map(t => ({
                    minQty: t.minQty ? parseFloat(t.minQty) : 0,
                    type: t.type,
                    value: t.value ? parseFloat(t.value) : 0
                }))
            }
        },
    })
    console.log(data, "offer create data")

    return {
        statusCode: 0,
        data: {
            ...data,
            validFrom: data.startTime,
            validTo: data.endTime
        }
    };
}

async function remove(id) {
    const data = await prisma.offer.delete({
        where: { id: parseInt(id) },
    })
    return { statusCode: 0, data };
}

async function createClearanceOffers(body) {
    const { items } = body;

    await prisma.$transaction(async (tx) => {
        for (const item of items) {
            if (!item.itemId || !item.clearanceBarcode || !item.manualClearancePrice) continue;

            // Check if offer already exists for this barcode
            const existingOfferRules = await tx.offerRule.findMany({
                where: {
                    offer: {
                        OfferScope: { some: { type: "Item", refId: parseInt(item.itemId) } }
                    }
                }
            });

            let offerExists = false;
            for (let rule of existingOfferRules) {
                const rulesArr = rule.conditions?.rules || [];
                if (rulesArr.some(r => r.field === "Specific Barcode" && String(r.value).trim() === String(item.clearanceBarcode).trim())) {
                    offerExists = true;
                    break;
                }
            }

            if (!offerExists) {
                // 1. Create the Offer
                await tx.offer.create({
                    data: {
                        name: `Clearance - ${item.clearanceBarcode}`,
                        code: `CLR-${item.clearanceBarcode}`,
                        discountType: "Override",
                        discountValue: parseFloat(item.manualClearancePrice || 0),
                        active: true,
                        scopeMode: "Item",
                        applyToClearance: true,
                        OfferScope: {
                            create: [{ type: "Item", refId: parseInt(item.itemId) }]
                        },
                        OfferRule: {
                            create: [{
                                logic: "AND",
                                conditions: {
                                    rules: [{ field: "Specific Barcode", operator: "==", value: String(item.clearanceBarcode).trim() }]
                                }
                            }]
                        }
                    }
                });

                // 2. Create the ItemBarcode
                const itemRecord = await tx.item.findUnique({ where: { id: parseInt(item.itemId) } });
                const isLegacy = itemRecord?.isLegacy;

                const priceListEntry = await tx.itemPriceList.findFirst({
                    where: {
                        itemId: parseInt(item.itemId),
                        sizeId: isLegacy ? null : (item.sizeId ? parseInt(item.sizeId) : null),
                        colorId: isLegacy ? null : (item.colorId ? parseInt(item.colorId) : null),
                    }
                });

                if (priceListEntry) {
                    const existingBarcode = await tx.itemBarcode.findFirst({
                        where: {
                            itemPriceListId: priceListEntry.id,
                            barcode: String(item.clearanceBarcode).trim(),
                            active: true
                        }
                    });

                    if (!existingBarcode) {
                        await tx.itemBarcode.create({
                            data: {
                                itemPriceListId: priceListEntry.id,
                                barcode: String(item.clearanceBarcode).trim(),
                                barcodeType: "CLEARANCE",
                                active: true
                            }
                        });
                    }
                }
            }
        }
    });

    return { statusCode: 0, message: "Offers created successfully" };
}

export {
    get,
    getOne,
    getSearch,
    create,
    update,
    remove,
    createClearanceOffers
}
