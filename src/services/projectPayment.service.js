import { PrismaClient } from '@prisma/client'
import { NoRecordFound } from '../configs/Responses.js';
import { getTableRecordWithId } from '../utils/helperQueries.js';
import { getDateTimeRangeForCurrentYear, getYearShortCode } from '../utils/helper.js';

const prisma = new PrismaClient()

async function getNextDocId(branchId, isExpenses = null) {

    if (isExpenses) {
        const { startTime, endTime } = getDateTimeRangeForCurrentYear(new Date());
        let lastObject = await prisma.projectExpenses.findFirst({
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
        let newDocId = `${branchObj.branchCode}/${getYearShortCode(new Date())}/EXPENSE/1`



        if (lastObject) {
            newDocId = `${branchObj.branchCode}/${getYearShortCode(new Date())}/EXPENSE/${parseInt(lastObject.docId.split("/").at(-1)) + 1}`


        }
        return newDocId
    }


    const { startTime, endTime } = getDateTimeRangeForCurrentYear(new Date());
    let lastObject = await prisma.projectPayment.findFirst({
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
    let newDocId = `${branchObj.branchCode}/${getYearShortCode(new Date())}/PAYMENT/1`



    if (lastObject) {
        newDocId = `${branchObj.branchCode}/${getYearShortCode(new Date())}/PAYMENT/${parseInt(lastObject.docId.split("/").at(-1)) + 1}`


    }
    return newDocId
}


async function get(req) {
    const { companyId, active, branchId, projectId, isExpenses } = req.query

    if (isExpenses) {
        const data = await prisma.projectExpenses.findMany({
            where: {
                companyId: companyId ? parseInt(companyId) : undefined,
                active: active ? Boolean(active) : undefined,
                projectId: projectId ? parseInt(projectId) : undefined

            },
            include: {
                projectExpensesItems: true
            }
        });

        let newDocId = await getNextDocId(branchId, true)

        return { statusCode: 0, nextDocId: newDocId, data };
    }
    const data = await prisma.projectPayment.findMany({
        where: {
            companyId: companyId ? parseInt(companyId) : undefined,
            active: active ? Boolean(active) : undefined,
            projectId: projectId ? parseInt(projectId) : undefined

        },

    });

    let newDocId = await getNextDocId(branchId)

    return { statusCode: 0, nextDocId: newDocId, data };
}


async function getOne(id, req) {

    const childRecord = 0;
    const { isExpenses } = req.query

    if (isExpenses) {
        const data = await prisma.projectExpenses.findUnique({
            where: {
                id: parseInt(id)
            },
            include: {
                projectExpensesItems: true
            }
        })
        if (!data) return NoRecordFound("projectExpenses");
        return { statusCode: 0, data: { ...data, ...{ childRecord } } };
    }
    const data = await prisma.projectPayment.findUnique({
        where: {
            id: parseInt(id)
        }
    })
    if (!data) return NoRecordFound("projectPayment");
    return { statusCode: 0, data: { ...data, ...{ childRecord } } };
}

async function getSearch(req) {
    const { searchKey } = req.params
    const { companyId, active } = req.query
    const data = await prisma.projectPayment.findMany({
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
    let data;
    let newDocId
    const { notes, alreadyPayment, projectId, partyId, companyId, branchId, projectAmount, amount, paymentMethod, isCompany, isPersonal, collectBy, handoverTo, isExpenses = null,
        invoiceNo, vendorId, invoiceValue, transportCost, validDate, projectExpensesItems, userDate, expenseType, foodCost, otherExpenses } = await body

    if (isExpenses) {
        newDocId = await getNextDocId(branchId, true)

        if (expenseType === "LABOUR") {
            data = await prisma.projectExpenses.create(
                {
                    data: {
                        docId: newDocId,

                        userDate: userDate ? new Date(userDate) : undefined,
                        notes, companyId: parseInt(companyId), branchId: parseInt(branchId),

                        projectId: parseInt(projectId),
                        foodCost,
                        transportCost,
                        expenseType,

                        projectExpensesItems: {
                            createMany: {
                                data: projectExpensesItems.map(temp => {
                                    let newItem = {}
                                    newItem["count"] = temp["count"];
                                    newItem["noOfShift"] = temp["noOfShift"];
                                    newItem["rate"] = parseFloat(temp["rate"]);
                                    newItem["isCompany"] = temp["isCompany"] ? Boolean(temp["isCompany"]) : undefined;
                                    newItem["isPersonal"] = temp["isPersonal"] ? Boolean(temp["isPersonal"]) : undefined;
                                    newItem["paymentMethod"] = temp["paymentMethod"];
                                    newItem["collectBy"] = temp["collectBy"] ? temp["collectBy"] : undefined;
                                    newItem["givenBy"] = temp["givenBy"] ? temp["givenBy"] : undefined;


                                    return newItem
                                }
                                )
                            }
                        }

                    }
                }
            )
        }
        else if (expenseType === "OTHER") {
            data = await prisma.projectExpenses.create(
                {
                    data: {
                        docId: newDocId,

                        userDate: userDate ? new Date(userDate) : undefined,
                        notes, companyId: parseInt(companyId), branchId: parseInt(branchId),

                        projectId: parseInt(projectId),
                        otherExpenses,
                        expenseType,



                    }
                }
            )
        }

        else {
            data = await prisma.projectExpenses.create(
                {
                    data: {
                        docId: newDocId, expenseType,
                        // validDate: validDate ? new Date(validDate) : undefined, 
                        userDate: userDate ? new Date(userDate) : undefined,
                        notes, companyId: parseInt(companyId), branchId: parseInt(branchId), vendorId: parseInt(vendorId), projectId: parseInt(projectId),
                        invoiceValue: parseFloat(invoiceValue), invoiceNo, transportCost,
                        // alreadyPayment: alreadyPayment ? parseFloat(alreadyPayment) : undefined,

                        projectExpensesItems: {
                            createMany: {
                                data: projectExpensesItems.map(temp => {
                                    let newItem = {}
                                    newItem["paymentDate"] = temp["paymentDate"] ? new Date(temp["paymentDate"]) : undefined,
                                        newItem["payment"] = parseFloat(temp["payment"]);
                                    newItem["isCompany"] = temp["isCompany"] ? Boolean(temp["isCompany"]) : undefined;
                                    newItem["isPersonal"] = temp["isPersonal"] ? Boolean(temp["isPersonal"]) : undefined;
                                    newItem["paymentMethod"] = temp["paymentMethod"];
                                    newItem["collectBy"] = temp["collectBy"] ? temp["collectBy"] : undefined;
                                    newItem["givenBy"] = temp["givenBy"] ? temp["givenBy"] : undefined;


                                    return newItem
                                }
                                )
                            }
                        }

                    }
                }
            )
        }

        return { statusCode: 0, data };
    }



    newDocId = await getNextDocId(branchId)
    data = await prisma.projectPayment.create(
        {
            data: {
                docId: newDocId, alreadyPayment: parseFloat(alreadyPayment), userDate: userDate ? new Date(userDate) : undefined,
                notes, companyId: parseInt(companyId), branchId: parseInt(branchId), partyId: parseInt(partyId), projectId: parseInt(projectId),
                projectAmount: parseFloat(projectAmount), amount: parseFloat(amount), paymentMethod, isCompany, isPersonal,
                collectBy, handoverTo,
            }
        }
    )
    return { statusCode: 0, data };
}

async function update(id, body) {

    const { notes, companyId, alreadyPayment, branchId, projectAmount, amount, userDate, expenseType, foodCost, otherExpenses,
        paymentMethod, isCompany, isPersonal, collectBy, handoverTo, partyId, projectId, isExpenses = null,
        invoiceNo, vendorId, invoiceValue, transportCost, validDate, projectExpensesItems } = await body
    if (isExpenses) {
        const dataFound = await prisma.projectExpenses.findUnique({
            where: {
                id: parseInt(id)
            }
        })
        if (!dataFound) return NoRecordFound("projectExpenses");


        let data;

        if (expenseType === "LABOUR") {
            data = await prisma.projectExpenses.update({
                where: {
                    id: parseInt(id),
                },
                data: {
                    docId: newDocId,

                    userDate: userDate ? new Date(userDate) : undefined,
                    notes, companyId: parseInt(companyId), branchId: parseInt(branchId),

                    projectId: parseInt(projectId),
                    foodCost,
                    transportCost,
                    expenseType,

                    projectExpensesItems: {
                        deleteMany: {},
                        createMany: {
                            data: projectExpensesItems.map(temp => {
                                let newItem = {}
                                newItem["count"] = temp["count"];
                                newItem["noOfShift"] = temp["noOfShift"];
                                newItem["rate"] = parseFloat(temp["rate"]);
                                newItem["isCompany"] = temp["isCompany"] ? Boolean(temp["isCompany"]) : undefined;
                                newItem["isPersonal"] = temp["isPersonal"] ? Boolean(temp["isPersonal"]) : undefined;
                                newItem["paymentMethod"] = temp["paymentMethod"];
                                newItem["collectBy"] = temp["collectBy"] ? temp["collectBy"] : undefined;
                                newItem["givenBy"] = temp["givenBy"] ? temp["givenBy"] : undefined;


                                return newItem
                            }
                            )
                        }
                    }

                }
            }
            )
        }

        else if (expenseType === "OTHER") {
            data = await prisma.projectExpenses.create(
                {
                    data: {
                        docId: newDocId,

                        userDate: userDate ? new Date(userDate) : undefined,
                        notes, companyId: parseInt(companyId), branchId: parseInt(branchId),

                        projectId: parseInt(projectId),
                        otherExpenses,
                        expenseType,



                    }
                }
            )
        }

        else {
            data = await prisma.projectExpenses.update({
                where: {
                    id: parseInt(id),
                },
                data: {
                    // validDate: validDate ? new Date(validDate) : undefined, 
                    userDate: userDate ? new Date(userDate) : undefined, expenseType,
                    notes, companyId: parseInt(companyId), branchId: parseInt(branchId),
                    vendorId: parseInt(vendorId), projectId: parseInt(projectId),
                    invoiceValue: parseFloat(invoiceValue), invoiceNo, transportCost,
                    // alreadyPayment: parseFloat(alreadyPayment || 0),

                    projectExpensesItems: {
                        deleteMany: {},
                        createMany: {
                            data: projectExpensesItems.map(temp => {
                                let newItem = {}
                                newItem["paymentDate"] = temp["paymentDate"] ? new Date(temp["paymentDate"]) : undefined,
                                    newItem["payment"] = parseFloat(temp["payment"]);
                                newItem["isCompany"] = temp["isCompany"] ? Boolean(temp["isCompany"]) : undefined;
                                newItem["isPersonal"] = temp["isPersonal"] ? Boolean(temp["isPersonal"]) : undefined;
                                newItem["paymentMethod"] = temp["paymentMethod"];
                                newItem["collectBy"] = temp["collectBy"] ? temp["collectBy"] : undefined;
                                newItem["givenBy"] = temp["givenBy"] ? temp["givenBy"] : undefined;


                                return newItem
                            }
                            )
                        }
                    }

                }
            })
        }

        return { statusCode: 0, data };
    }
    const dataFound = await prisma.projectPayment.findUnique({
        where: {
            id: parseInt(id)
        }
    })
    if (!dataFound) return NoRecordFound("projectPayment");
    const data = await prisma.projectPayment.update({
        where: {
            id: parseInt(id),
        },
        data:
        {
            notes, userDate: userDate ? new Date(userDate) : undefined,
            companyId: parseInt(companyId),
            branchId: parseInt(branchId),
            partyId: parseInt(partyId),
            projectId: parseInt(projectId),
            projectAmount: parseFloat(projectAmount),
            amount: parseFloat(amount),
            paymentMethod, isCompany, isPersonal,
            collectBy,
            handoverTo,
            alreadyPayment: alreadyPayment ? parseFloat(alreadyPayment) : undefined
        },
    })
    return { statusCode: 0, data };
};

async function remove(id, req) {
    const { isExpenses } = req.query
    if (isExpenses) {
        const data = await prisma.projectExpenses.delete({
            where: {
                id: parseInt(id)
            },
        })
        return { statusCode: 0, data };
    }
    const data = await prisma.projectPayment.delete({
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
