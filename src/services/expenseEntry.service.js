import { NoRecordFound } from '../configs/Responses.js';
import { prisma } from '../lib/prisma.js';
import { getFinYearStartTimeEndTime } from '../utils/finYearHelper.js';
import { getYearShortCodeForFinYear } from '../utils/helper.js';
import { getTableRecordWithId } from '../utils/helperQueries.js';



async function getNextDocId(branchId, shortCode, startTime, endTime) {


    let lastObject = await prisma.Expense.findFirst({
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
    let newDocId = `${branchObj.branchCode}/${shortCode}/EXP/1`
    if (lastObject) {
        newDocId = `${branchObj.branchCode}/${shortCode}/EXP/${parseInt(lastObject.docId.split("/").at(-1)) + 1}`
    }
    return newDocId
}

async function get(req) {
    const { companyId, active } = req.query

    let data = await prisma.Expense.findMany({
        where: {
            // companyId: companyId ? parseInt(companyId) : undefined,
            // active: active ? Boolean(active) : undefined,
        },

    });




    return { statusCode: 0, data };
}


async function getOne(id) {
    const childRecord = await prisma.state.count({ where: { countryId: parseInt(id) } });
    const data = await prisma.Expense.findUnique({
        where: {
            id: parseInt(id)
        },
        include: {
            ExpenseEntryItems: true
        }
    })
    if (!data) return NoRecordFound("Country");
    return { statusCode: 0, data: { ...data, ...{ childRecord } } };
}

async function getSearch(req) {
    const { searchKey } = req.params
    const { companyId, active } = req.query
    const data = await prisma.country.findMany({
        where: {
            companyId: companyId ? parseInt(companyId) : undefined,
            active: active ? Boolean(active) : undefined,
            OR: [
                {
                    name: {
                        contains: searchKey,
                    },
                },
                {
                    code: {
                        contains: searchKey,
                    },
                },
            ],
        }
    })
    return { statusCode: 0, data: data };
}


async function create(body) {
    const { expenseEntryItems, finYearId, branchId } = await body

    let finYearDate = await getFinYearStartTimeEndTime(finYearId);
    const shortCode = finYearDate ? getYearShortCodeForFinYear(finYearDate?.startDateStartTime, finYearDate?.endDateEndTime) : "";
    let docId = await getNextDocId(branchId, shortCode, finYearDate?.startDateStartTime, finYearDate?.endDateEndTime);

    const data = await prisma.Expense.create(
        {
            data: {
                docId: docId,
                branchId: branchId ? parseInt(branchId) : null,
                ExpenseEntryItems: {
                    createMany: expenseEntryItems?.length > 0 ? {
                        data: expenseEntryItems?.map((temp) => {
                            let newItem = {}
                            newItem["expenseCategoryId"] = temp["expenseCategoryId"] ? parseInt(temp["expenseCategoryId"]) : null;
                            newItem["description"] = temp["description"] ? String(temp["description"]) : null;
                            newItem["amount"] = temp["amount"] ? temp["amount"].toString() : null;
                            newItem["referenceNo"] = temp["referenceNo"] ? String(temp["referenceNo"]) : null;
                            return newItem
                        })
                    } : undefined
                }
            }
        }
    )
    return { statusCode: 0, data };
}

async function update(id, body) {
    const {
        expenseEntryItems,
        finYearId,
        branchId,
    } = await body

    const dataFound = await prisma.Expense.findUnique({
        where: {
            id: parseInt(id)
        },
        include: {
            ExpenseEntryItems: true
        }
    })
    if (!dataFound) return NoRecordFound("Sale Order");

    let oldItemIds = dataFound?.ExpenseEntryItems.map(item => parseInt(item.id))
    let currentItemIds = expenseEntryItems.filter(i => i?.id)?.map(item => parseInt(item.id))
    let removedItemIds = oldItemIds.filter(id => !currentItemIds.includes(id));

    let piData;

    await prisma.$transaction(async (tx) => {
        // Delete removed items
        if (removedItemIds.length > 0) {
            await tx.ExpenseEntryItems.deleteMany({
                where: {
                    id: { in: removedItemIds }
                }
            });
        }

        // Update main record
        piData = await tx.Expense.update({
            where: {
                id: parseInt(id)
            },
            data: {

            },
        })

        for (const item of (expenseEntryItems || []).filter(i => i.expenseCategoryId)) {
            if (item.id) {
                await tx.ExpenseEntryItems.update({
                    where: { id: parseInt(item.id) },
                    data: {
                        expenseCategoryId: item.expenseCategoryId ? parseInt(item.expenseCategoryId) : null,
                        description: item.description ? String(item.description) : null,
                        amount: item.amount ? item.amount.toString() : "0",
                        referenceNo: item.referenceNo ? String(item.referenceNo) : null,
                    }
                });
            } else {
                await tx.ExpenseEntryItems.create({
                    data: {
                        expenseCategoryId: item.expenseCategoryId ? parseInt(item.expenseCategoryId) : null,
                        description: item.description ? String(item.description) : null,
                        amount: item.amount ? item.amount.toString() : "0",
                        referenceNo: item.referenceNo ? String(item.referenceNo) : null,
                    }
                });
            }
        }
    })
    return { statusCode: 0, data: piData };
}

async function remove(id) {
    const data = await prisma.Expense.delete({
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
