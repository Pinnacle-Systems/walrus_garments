import { NoRecordFound } from '../configs/Responses.js';
import { attachCurrentTime, getDateFromDateTime, getYearShortCodeForFinYear } from '../utils/helper.js';
import { getTableRecordWithId } from '../utils/helperQueries.js';
import { getFinYearStartTimeEndTime } from '../utils/finYearHelper.js';
import { prisma } from '../lib/prisma.js';

async function getNextDocId(branchId, shortCode, startTime, endTime) {
    let lastObject = await prisma.payment.findFirst({
        where: {
            branchId: parseInt(branchId),
            paymentType: "ADJUSTMENT",
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
    let newDocId = `${branchObj.branchCode}/${shortCode}/PADJ/1`
    if (lastObject && lastObject.docId) {
        const parts = lastObject.docId.split("/");
        const lastNum = parseInt(parts[parts.length - 1]);
        newDocId = `${branchObj.branchCode}/${shortCode}/PADJ/${lastNum + 1}`
    }
    return newDocId
}

async function get(req) {
    const { branchId, finYearId } = req.query;

    let data = await prisma.payment.findMany({
        where: {
            branchId: branchId ? parseInt(branchId) : undefined,
            paymentType: "ADJUSTMENT",
            isDeleted: false,
        },
        include: {
            Party: {
                select: {
                    name: true
                }
            }
        },
        orderBy: {
            id: "desc"
        }
    });

    let finYearDate = await getFinYearStartTimeEndTime(finYearId);
    const shortCode = finYearDate ? getYearShortCodeForFinYear(finYearDate?.startDateStartTime, finYearDate?.endDateEndTime) : "";
    let newDocId = finYearDate ? (await getNextDocId(branchId, shortCode, finYearDate?.startTime, finYearDate?.endTime)) : "";

    return { statusCode: 0, nextDocId: newDocId, data, totalCount: data.length };
}

async function getOne(id) {
    const data = await prisma.payment.findUnique({
        where: {
            id: parseInt(id)
        },
        include: {
            Party: true
        }
    })
    if (!data) return NoRecordFound("Payment Adjustment");
    return { statusCode: 0, data };
}

async function create(body) {
    try {
        const {
            branchId,
            date,
            referenceNumber,
            adjustmentType,
            paymentMode,
            reason,
            userId,
            finYearId
        } = body;

        let finYearDate = await getFinYearStartTimeEndTime(finYearId);
        const shortCode = finYearDate ? getYearShortCodeForFinYear(finYearDate?.startDateStartTime, finYearDate?.endDateEndTime) : "";
        let newDocId = finYearDate ? (await getNextDocId(branchId, shortCode, finYearDate?.startTime, finYearDate?.endTime)) : "";

        const dateWithTime = attachCurrentTime(date);

        const data = await prisma.payment.create({
            data: {
                docId: newDocId,
                referenceNumber: referenceNumber ? referenceNumber : null,
                adjustmentType: adjustmentType ? adjustmentType : null,
                adjustmentAmount: adjustmentAmount ? adjustmentAmount : null,
                paymentMode: paymentMode ? paymentMode : null,
                reason: reason ? reason : null,
                userId: userId ? parseInt(userId) : null,
                date: date ? date : null,
            }
        });

        return { statusCode: 0, data };
    } catch (error) {
        console.error("Error creating payment adjustment:", error);
        return { statusCode: 1, error: error.message };
    }
}

async function update(id, body) {
    try {
        const {
            branchId,
            date,
            referenceNumber,
            adjustmentType,
            paymentMode,
            reason,
            userId,
            finYearId
        } = body;

        const dataFound = await prisma.payment.findUnique({
            where: { id: parseInt(id) }
        });
        if (!dataFound) return NoRecordFound("Payment Adjustment");

        const data = await prisma.payment.update({
            where: { id: parseInt(id) },
            data: {
                docId: newDocId,
                referenceNumber: referenceNumber ? referenceNumber : null,
                adjustmentType: adjustmentType ? adjustmentType : null,
                adjustmentAmount: adjustmentAmount ? adjustmentAmount : null,
                paymentMode: paymentMode ? paymentMode : null,
                reason: reason ? reason : null,
                userId: userId ? parseInt(userId) : null,
                date: date ? date : null,
            }
        });

        return { statusCode: 0, data };
    } catch (error) {
        console.error("Error updating payment adjustment:", error);
        return { statusCode: 1, error: error.message };
    }
}

async function remove(id) {
    try {
        const data = await prisma.payment.update({
            where: { id: parseInt(id) },
            data: { isDeleted: true }
        });
        return { statusCode: 0, data };
    } catch (error) {
        return { statusCode: 1, error: error.message };
    }
}

export {
    get,
    getOne,
    create,
    update,
    remove
}
