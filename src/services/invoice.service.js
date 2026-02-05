import { NoRecordFound } from '../configs/Responses.js';
import { prisma } from '../lib/prisma.js';
import { getDateTimeRangeForCurrentYear, getYearShortCode, getDateFromDateTime } from '../utils/helper.js';
import { getTableRecordWithId } from '../utils/helperQueries.js';

async function getNextDocId(branchId) {

    const { startTime, endTime } = getDateTimeRangeForCurrentYear(new Date());
    let lastObject = await prisma.invoice.findFirst({
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
    let newDocId = `${branchObj.branchCode}/${getYearShortCode(new Date())}/INV/1`


    if (lastObject) {
        newDocId = `${branchObj.branchCode}/${getYearShortCode(new Date())}/INV/${parseInt(lastObject.docId.split("/").at(-1)) + 1}`


    }
    return newDocId
}

function manualFilterSearchData(searchBillDate, searchProjectId, data) {
    return data.filter(item =>
        (searchBillDate ? String(getDateFromDateTime(item.createdAt)).includes(searchBillDate) : true)


    )
}

async function get(req) {
    const { companyId, active, branchId, pagination, pageNumber, dataPerPage, searchDocId, searchBillDate, searchSupplierName, searchProjectId } = req.query



    let data;

    data = await prisma.invoice.findMany({
        where: {
            companyId: companyId ? parseInt(companyId) : undefined,
            active: active ? Boolean(active) : undefined,
            docId: Boolean(searchDocId) ?
                {
                    contains: searchDocId
                }
                : undefined,

            Party: {
                name: Boolean(searchSupplierName) ? { contains: searchSupplierName } : undefined
            },

        },
        include: {
            InvoiceItems: true
        }
    });


    data = manualFilterSearchData(searchBillDate, searchProjectId, data)
    const totalCount = data.length

    if (pagination) {
        data = data.slice(((pageNumber - 1) * parseInt(dataPerPage)), pageNumber * dataPerPage)
    }
    let newDocId = await getNextDocId(branchId)

    return { statusCode: 0, nextDocId: newDocId, data, totalCount };
}


async function getOne(id) {
    const childRecord = 0;
    const data = await prisma.invoice.findUnique({
        where: {
            id: parseInt(id)
        },
        include: {

            InvoiceItems: {
                include: {
                    Product: {
                        select: {
                            name: true,
                            hsnCode: true,
                            description: true,
                        }
                    },
                    Uom: {
                        select: {
                            name: true
                        }
                    },
                }
            }
        }
    })

    if (!data) return NoRecordFound("invoice");

    return { statusCode: 0, data: { ...data, ...{ childRecord } } };
}

async function getSearch(req) {
    const { searchKey } = req.params
    const { companyId, active } = req.query
    const data = await prisma.invoice.findMany({
        where: {
            companyId: companyId ? parseInt(companyId) : undefined,
            active: active ? Boolean(active) : undefined,
            OR: [
                {
                    name: {
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
    const { clientId, invoiceItems, companyId, active, branchId, projectId, ewayBillNo } = await body
    let newDocId = await getNextDocId(branchId)
    await prisma.$transaction(async (tx) => {
        data = await tx.invoice.create(
            {
                data: {
                    docId: newDocId,
                    clientId: parseInt(clientId),
                    companyId: parseInt(companyId), active,
                    ewayBillNo,
                    branchId: parseInt(branchId),
                    projectId: projectId ? parseInt(projectId) : undefined,
                    InvoiceItems: {
                        createMany: {
                            data: invoiceItems.map(temp => {
                                let newItem = {}
                                newItem["productId"] = parseInt(temp["productId"]);
                                newItem["description"] = (temp["id"] ? temp["Product"]["description"] : temp["description"]);
                                newItem["hsnCode"] = temp["id"] ? parseInt(temp["Product"]["hsnCode"]) : parseInt(temp["hsnCode"]);
                                newItem["uomId"] = parseInt(temp["uomId"]);
                                newItem["qty"] = parseFloat(temp["qty"]);
                                newItem["price"] = parseFloat(temp["price"]);
                                newItem["taxPercent"] = temp["taxPercent"];
                                newItem["discount"] = parseFloat(temp["discount"] || 0);
                                return newItem
                            }
                            )
                        }
                    }

                }
            })


    })
    return { statusCode: 0, data };
}


async function update(id, body) {
    let data
    const { clientId, invoiceItems, companyId, active, branchId, projectId, ewayBillNo } = await body
    const dataFound = await prisma.invoice.findUnique({
        where: {
            id: parseInt(id)
        },
        include: {
            InvoiceItems: true,

        }
    })


    if (!dataFound) return NoRecordFound("invoice");
    data = await prisma.invoice.update({
        where: {
            id: parseInt(id),
        },
        data: {
            clientId: parseInt(clientId),
            companyId: parseInt(companyId), active,
            ewayBillNo,
            branchId: parseInt(branchId),
            projectId: projectId ? parseInt(projectId) : undefined,
            InvoiceItems: {
                deleteMany: {},
                createMany: {
                    data: invoiceItems.map(temp => {
                        let newItem = {}
                        newItem["productId"] = parseInt(temp["productId"]);

                        newItem["description"] = (temp["id"] ? temp["Product"]["description"] : temp["description"]);
                        newItem["hsnCode"] = temp["id"] ? parseInt(temp["Product"]["hsnCode"]) : parseInt(temp["hsnCode"]);
                        newItem["uomId"] = parseInt(temp["uomId"]);
                        newItem["qty"] = parseFloat(temp["qty"]);
                        newItem["price"] = parseFloat(temp["price"]);
                        newItem["taxPercent"] = temp["taxPercent"];

                        newItem["discount"] = parseFloat(temp["discount"] || 0);

                        return newItem
                    }
                    )
                }
            }

        }

    })





    return { statusCode: 0, data };
};







async function remove(id) {
    const data = await prisma.invoice.delete({
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