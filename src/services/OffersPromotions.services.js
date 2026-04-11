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
            OfferRule: true
        },
        orderBy: {
            priority: 'desc'
        }
    });

    return { statusCode: 0, data };
}

async function getOne(id) {
    const data = await prisma.offer.findUnique({
        where: { id: parseInt(id) },
        include: {
            OfferScope: true,
            OfferRule: true
        }
    })
    if (!data) return NoRecordFound("Offer");
    return { statusCode: 0, data };
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
            OfferRule: true
        }
    })
    return { statusCode: 0, data };
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
        freeItemId, freeItemQty, branchId
    } = await body

    const rawSelection = selectionIds || scopeSelection;
    const parsedSelection = typeof rawSelection === 'string' ? JSON.parse(rawSelection) : (rawSelection || []);

    const data = await prisma.offer.create({
        data: {
            name,
            code,
            offerType,
            active,
            priority: priority ? parseInt(priority) : 0,
            startTime,
            endTime,
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
            branchId: branchId ? parseInt(branchId) : undefined,
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
            }
        }
    })
    return { statusCode: 0, data };
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
        freeItemId, freeItemQty, branchId
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
            offerType,
            active,
            priority: priority ? parseInt(priority) : undefined,
            startTime,
            endTime,
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
            }
        },
    })
    return { statusCode: 0, data };
}

async function remove(id) {
    const data = await prisma.offer.delete({
        where: { id: parseInt(id) },
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
