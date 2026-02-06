import { NoRecordFound } from '../configs/Responses.js';
import { getDateFromDateTime, getItemFullNameFromShortCode, getDateTimeRange, getYearShortCodeForFinYear } from '../utils/helper.js';
import { getTableRecordWithId } from "../utils/helperQueries.js"
import { createProgramDetails, updateProgramDetails } from "../utils/processDeliveryHelper.js"
import { groupAndSumItems } from '../utils/groupbyMultipleKeys.js';
import { createProcessDeliveryValidation } from '../validators/processDelivery.validator.js';
import { getTotalQty } from '../utils/ProcessHelpers/getTotalQuantity.js';
import { getFinYearStartTimeEndTime } from '../utils/finYearHelper.js';
import dataIntegrityValidation from "../validators/DataIntegregityValidation/index.js";
import { prisma } from "../lib/prisma.js";

async function getNextDocId(branchId, processId, shortCode, startTime, endTime) {
    let lastObject = await prisma.processDelivery.findFirst({
        where: {
            branchId: parseInt(branchId),
            processId: parseInt(processId),
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
    const processObj = await getTableRecordWithId(processId, "process")
    let newDocId = `${branchObj.branchCode}/${shortCode}/${processObj.code}/1`
    if (lastObject) {
        newDocId = `${branchObj.branchCode}/${shortCode}/${processObj.code}/${parseInt(lastObject.docId.split("/").at(-1)) + 1}`
    }
    return newDocId
}


function manualFilterSearchData(searchPoDate, searchDueDate, searchPoType, data) {
    return data.filter(item =>
        (searchPoDate ? String(getDateFromDateTime(item.delDate)).includes(searchPoDate) : true) &&
        (searchDueDate ? String(getDateFromDateTime(item.dueDate)).includes(searchDueDate) : true) &&
        (searchPoType ? (item.itemType.toLowerCase().includes(searchPoType.toLowerCase())) : true)

    )
}

async function get(req) {
    const { branchId, active, processId, pageNumber, dataPerPage,
        searchDocId, searchPoDate, searchSupplierAliasName, searchPoType, searchDueDate, pagination, searchProcessName,
        supplierId, finYearId, docIdOnly, startDate, endDate, filterParties, filterProcess } = req.query
    let totalCount;
    let finYearDate = await getFinYearStartTimeEndTime(finYearId);
    const shortCode = finYearDate ? getYearShortCodeForFinYear(finYearDate?.startTime, finYearDate?.endTime) : "";
    if (docIdOnly) {
        let docId;
        if (processId) {
            docId = await getNextDocId(branchId, processId, shortCode, finYearDate?.startTime, finYearDate?.endTime);
        }
        return { statusCode: 0, nextDocId: docId, totalCount };
    }
    const { startTime: startDateStartTime } = getDateTimeRange(startDate);
    const { endTime: endDateEndTime } = getDateTimeRange(endDate);
    let data = await prisma.processDelivery.findMany({
        where: {
            AND: [
                {
                    AND: (finYearDate) ? [
                        {
                            createdAt: {
                                gte: finYearDate.startTime
                            }
                        },
                        {
                            createdAt: {
                                lte: finYearDate.endTime
                            }
                        }
                    ] : undefined,
                },
                {
                    AND: (startDate && endDate) ? [
                        {
                            createdAt: {
                                gte: startDateStartTime
                            }
                        },
                        {
                            createdAt: {
                                lte: endDateEndTime
                            }
                        }
                    ] : undefined,
                }
            ],
            OR: supplierId || Boolean(filterParties) ? [
                {
                    supplierId: supplierId ? parseInt(supplierId) : undefined,
                },
                {
                    supplierId: Boolean(filterParties) ? {
                        in: filterParties.split(",").map(i => parseInt(i))
                    } : undefined,
                }
            ] : undefined,
            OR: processId || Boolean(filterProcess) ? [
                {
                    processId: processId ? parseInt(processId) : undefined,
                },
                {
                    processId: Boolean(filterProcess) ? {
                        in: filterProcess.split(",").map(i => parseInt(i))
                    } : undefined,
                }
            ] : undefined,
            branchId: branchId ? parseInt(branchId) : undefined,
            active: active ? Boolean(active) : undefined,
            docId: Boolean(searchDocId) ?
                {
                    contains: searchDocId
                }
                : undefined,
            supplier: {
                aliasName: Boolean(searchSupplierAliasName) ? { contains: searchSupplierAliasName } : undefined
            },
            Process: searchProcessName ? {
                name: {
                    contains: searchProcessName
                }
            } : undefined
        },
        orderBy: [
            {
                Process: {
                    name: 'asc'
                }
            },
            { docId: 'asc' }
        ],
        include: {
            supplier: {
                select: {
                    aliasName: true
                }
            },
            Process: {
                select: {
                    name: true
                }
            },
            ProcessDeliveryProgramDetails: {
                select: {
                    qty: true
                }
            }
        }
    });
    data = manualFilterSearchData(searchPoDate, searchDueDate, searchPoType, data)
    totalCount = data.length
    data = await getTotalQty(data)
    if (pagination) {
        data = data.slice(((pageNumber - 1) * parseInt(dataPerPage)), pageNumber * dataPerPage)
    }
    let docId;
    if (processId) {
        docId = await getNextDocId(branchId, processId, shortCode, finYearDate?.startTime, finYearDate?.endTime);
    }
    return { statusCode: 0, data, nextDocId: docId, totalCount };
}

export async function getProcessDeliveryProgramItems(req) {
    const { branchId, processBillEntryFilter, processId, pagination, pageNumber, dataPerPage,
        searchDocId, searchPoDate, searchSupplierAliasName, searchPoType, searchDueDate, billEntryId } = req.query
    console.log(billEntryId, "billEntryId")
    let data = []

    data = await prisma.processDeliveryProgramDetails.findMany({
        where: {
            ProcessDelivery: {
                docId: Boolean(searchDocId) ?
                    {
                        contains: searchDocId
                    }
                    : undefined,
                branchId: branchId ? parseInt(branchId) : undefined,
                processId: processId ? parseInt(processId) : undefined
            }
        },
        include: {
            ProcessDelivery: true,
            Yarn: {
                select: {
                    aliasName: true
                }
            },
            Color: {
                select: {
                    name: true
                }
            },
            Uom: {
                select: {
                    name: true
                }
            },
            Fabric: {
                select: {
                    aliasName: true
                }
            },
            Gauge: {
                select: {
                    name: true
                }
            },
            LoopLength: {
                select: {
                    name: true
                }
            },
            Design: {
                select: {
                    name: true
                }
            },
            Gsm: {
                select: {
                    name: true
                }
            },
            KDia: {
                select: {
                    name: true
                }
            },
            FDia: {
                select: {
                    name: true
                }
            },
            Size: {
                select: {
                    name: true
                }
            },
        }
    })

    const totalCount = data.length
    if (pagination) {
        data = data.slice(((pageNumber - 1) * parseInt(dataPerPage)), pageNumber * dataPerPage)
    }
    data = await (async function getAlreadyInwardedQty() {
        const promises = data.map(async (item) => {
            let newItem = structuredClone(item);
            let aggObj = await prisma.programInwardLotDetail.aggregate({
                where: {
                    ProgramInwardProgramDetailsId: {
                        processDeliveryProgramDetailsId: parseInt(item.id)
                    },
                },
                _sum: {
                    inwardQty: true,
                    inwardBags: true,
                    inwardRolls: true
                }
            })
            newItem["alreadyInwardedQty"] = aggObj?._sum?.inwardQty ? aggObj._sum.inwardQty : 0
            newItem["alreadyInwardedBags"] = aggObj?._sum?.inwardBags ? aggObj._sum.inwardBags : 0
            newItem["alreadyInwardedRolls"] = aggObj?._sum?.inwardRolls ? aggObj._sum.inwardRolls : 0
            let alreadyBillQty = await prisma.billEntryItems.aggregate({
                where: {
                    processDeliveryProgramDetailsId: parseInt(item.id),
                    BillEntry: billEntryId ? {
                        id: {
                            lt: JSON.parse(billEntryId) ? parseInt(billEntryId) : undefined
                        }
                    } : undefined
                },
                _sum: {
                    qty: true
                }
            })
            newItem["alreadyBillQty"] = alreadyBillQty?._sum?.qty ? alreadyBillQty?._sum?.qty : 0
            console.log(newItem["alreadyBillQty"], "alreadyBillQty")
            return newItem
        })
        return Promise.all(promises)
    })()
    if (processBillEntryFilter) {
        data = data.filter(item => item.alreadyInwardedQty > 0);
    }
    return { statusCode: 0, data, totalCount }
}


async function getOne(id, processInwardId, processDeliveryReturnId, query) {
    const { includeProcess } = query;
    const childRecord = 0;
    let data = await prisma.processDelivery.findUnique({
        where: {
            id: parseInt(id)
        },
        include: {
            supplier: {
                select: {
                    aliasName: true
                }
            },
            Process: includeProcess,
            ProcessDeliveryProgramDetails: {
                include: {
                    ProcessInwardDetails: {
                        include: {
                            ProcessInward: { select: { docId: true, dcDate: true, dcNo: true } },
                            lotDetails: true
                        }
                    },
                    Yarn: {
                        select: {
                            aliasName: true
                        }
                    },
                    Color: {
                        select: {
                            name: true
                        }
                    },
                    Uom: {
                        select: {
                            name: true
                        }
                    },
                    Fabric: {
                        select: {
                            aliasName: true
                        }
                    },
                    Gauge: {
                        select: {
                            name: true
                        }
                    },
                    LoopLength: {
                        select: {
                            name: true
                        }
                    },
                    Design: {
                        select: {
                            name: true
                        }
                    },
                    Gsm: {
                        select: {
                            name: true
                        }
                    },
                    KDia: {
                        select: {
                            name: true
                        }
                    },
                    FDia: {
                        select: {
                            name: true
                        }
                    },
                    Size: {
                        select: {
                            name: true
                        }
                    },
                    rawMaterials: {
                        include: {
                            Yarn: {
                                select: {
                                    aliasName: true
                                }
                            },
                            Color: {
                                select: {
                                    name: true
                                }
                            },
                            Uom: {
                                select: {
                                    name: true
                                }
                            },
                            Fabric: {
                                select: {
                                    aliasName: true
                                }
                            },
                            Gauge: {
                                select: {
                                    name: true
                                }
                            },
                            LoopLength: {
                                select: {
                                    name: true
                                }
                            },
                            Design: {
                                select: {
                                    name: true
                                }
                            },
                            Gsm: {
                                select: {
                                    name: true
                                }
                            },
                            KDia: {
                                select: {
                                    name: true
                                }
                            },
                            FDia: {
                                select: {
                                    name: true
                                }
                            },
                            Size: {
                                select: {
                                    name: true
                                }
                            },
                            Stock: true
                        }
                    }
                }
            }
        }
    })
    if (!data) return NoRecordFound("processDelivery");
    data["ProcessDeliveryProgramDetails"] = await async function getAlreadyInwardedQty() {
        let promises = data.ProcessDeliveryProgramDetails.map(async (item) => {
            let newItem = structuredClone(item);
            let aggObj = await prisma.programInwardLotDetail.aggregate({
                where: {
                    ProgramInwardProgramDetailsId: {
                        processInwardId: JSON.parse(processInwardId) ? { lt: parseInt(processInwardId) } : undefined,
                        processDeliveryProgramDetailsId: parseInt(item.id)
                    }
                },
                _sum: {
                    inwardQty: true,
                    inwardBags: true,
                    inwardRolls: true
                }
            })
            newItem["alreadyInwardedQty"] = aggObj?._sum?.inwardQty ? aggObj._sum.inwardQty : 0
            newItem["alreadyInwardedBags"] = aggObj?._sum?.inwardBags ? aggObj._sum.inwardBags : 0
            newItem["alreadyInwardedRolls"] = aggObj?._sum?.inwardRolls ? aggObj._sum.inwardRolls : 0
            const alreadyBillData = await prisma.billEntryItems.aggregate({
                where: {
                    processDeliveryProgramDetailsId: parseInt(item.id)
                },
                _sum: {
                    qty: true,
                }
            });
            newItem["alreadyBillQty"] = alreadyBillData?._sum?.qty ? alreadyBillData._sum.qty : 0
            newItem["rawMaterials"] = await (async function getAlreadyInwardedQtyRaw() {
                let promises = newItem.rawMaterials.map(async (item) => {
                    let newItem = structuredClone(item);
                    let alreadyUsedQty = await prisma.processInwardRawMaterialConsumptionDetails.aggregate({
                        where: {
                            rawMaterialsId: parseInt(item.id),
                            ProcessInwardProgramDetails: {
                                processInwardId: JSON.parse(processInwardId) ? { lt: parseInt(processInwardId) } : undefined,
                            }
                        },
                        _sum: {
                            consumptionQty: true,
                            lossQty: true
                        }
                    })
                    newItem["alreadyUsedQty"] = (alreadyUsedQty?._sum?.consumptionQty ? alreadyUsedQty._sum.consumptionQty : 0)
                        + (alreadyUsedQty?._sum?.lossQty ? alreadyUsedQty._sum.lossQty : 0)
                    let alreadyDeliveryReturnQty = await prisma.processDeliveryReturnRawMaterialDetails.aggregate({
                        where: {
                            rawMaterialsId: parseInt(item.id),
                            ProcessDeliveryReturnProgramDetails: {
                                processDeliveryReturnId: JSON.parse(processDeliveryReturnId) ? { lt: parseInt(processDeliveryReturnId) } : undefined,
                            }
                        },
                        _sum: {
                            returnQty: true,
                        }
                    })
                    newItem["alreadyDeliveryReturnQty"] = (alreadyDeliveryReturnQty?._sum?.returnQty ? alreadyDeliveryReturnQty._sum.returnQty : 0)
                    return newItem
                })
                return Promise.all(promises)
            })()
            return newItem
        })
        return Promise.all(promises)
    }()
    return { statusCode: 0, data: { ...data, ...{ childRecord } } };
}

async function getSearch(req) {
    const { companyId, active } = req.query
    const { searchKey } = req.params
    const data = await prisma.processDelivery.findMany({
        where: {
            country: {
                companyId: companyId ? parseInt(companyId) : undefined,
            },
            active: active ? Boolean(active) : undefined,
            OR: [
                {
                    aliasName: {
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
        delNo,
        delDate,
        dueDate,
        supplierId,
        branchId,
        active,
        storeId,
        styleId,
        processId,
        vehicleNo,
        specialInstructions,
        remarks,
        programDetails,
        itemType,
        finYearId,
        userId } = await body
    let processDelivery = 0;
    let finYearDate = await getFinYearStartTimeEndTime(finYearId);
    const shortCode = finYearDate ? getYearShortCodeForFinYear(finYearDate?.startTime, finYearDate?.endTime) : "";
    let docId = await getNextDocId(branchId, processId, shortCode, finYearDate?.startTime, finYearDate?.endTime);
    const processData = await getTableRecordWithId(processId, "process");
    const rawMaterialType = getItemFullNameFromShortCode(processData.io.split("_")[0]);
    const isValid = await createProcessDeliveryValidation(programDetails, rawMaterialType, storeId, branchId)
    if (!isValid) return { statusCode: 1, message: "Data Validation Failed" }
    await prisma.$transaction(async (tx) => {
        processDelivery = await tx.processDelivery.create({
            data: {
                itemType: itemType,
                delNo,
                docId,
                dueDate: dueDate ? new Date(dueDate) : undefined,
                delDate: delDate ? new Date(delDate) : undefined,
                supplierId: parseInt(supplierId),
                createdById: parseInt(userId),
                branchId: parseInt(branchId),
                active,
                storeId: parseInt(storeId),
                processId: parseInt(processId),
                styleId: styleId ? parseInt(styleId) : undefined,
                vehicleNo,
                specialInstructions,
                remarks,
            },
        })
        await (async function () {
            let promises = programDetails.map(async (program) => {
                return await createProgramDetails(tx, program, processDelivery);
            })
            return Promise.all(promises);
        })()
        await dataIntegrityValidation(tx);
    })
    return { statusCode: 0, data: processDelivery };
}

async function update(id, body) {
    const {
        delNo,
        delDate,
        dueDate,
        supplierId,
        branchId,
        active,
        storeId,
        styleId,
        processId,
        vehicleNo,
        specialInstructions,
        remarks,
        programDetails,
        itemType,
        userId } = await body
    const dataFound = await prisma.processDelivery.findUnique({
        where: {
            id: parseInt(id)
        }
    })
    if (!dataFound) return NoRecordFound("processDelivery");
    const groupedItem = groupAndSumItems(programDetails.flatMap(i => i.rawMaterials),
        [
            'yarnId', 'colorId', 'uomId',
            'fabricId', 'designId', 'guageId', 'loopLengthId', 'gsmId', 'kDiaId', 'fDia',
            'accessoryId', 'sizeId'
        ], "qty");
    let processDelivery;
    await prisma.$transaction(async (tx) => {
        processDelivery = await tx.processDelivery.update({
            where: {
                id: parseInt(id)
            },
            data: {
                itemType: itemType,
                delNo,
                dueDate: dueDate ? new Date(dueDate) : undefined,
                delDate: delDate ? new Date(delDate) : undefined,
                supplierId: parseInt(supplierId),
                createdById: parseInt(userId),
                branchId: parseInt(branchId),
                active,
                storeId: parseInt(storeId),
                processId: parseInt(processId),
                vehicleNo,
                styleId: styleId ? parseInt(styleId) : undefined,
                specialInstructions,
                remarks,
            },
            include: {
                ProcessDeliveryProgramDetails: {
                    include: {
                        rawMaterials: {
                            include: {
                                Stock: true
                            }
                        }
                    }
                }
            }
        })
        let removedItems = processDelivery.ProcessDeliveryProgramDetails.filter(oldItem => {
            let result = programDetails.find(newItem => newItem.id === oldItem.id)
            if (result) return false
            return true
        }).map(item => parseInt(item.id));
        await (async function () {
            let promises = removedItems.map(async (id) => {
                let removeProgramDetails = await tx.processDeliveryProgramDetails.delete({
                    where: {
                        id: parseInt(id)
                    },
                    include: {
                        rawMaterials: true
                    }
                })
                let promises = removeProgramDetails.rawMaterials.map(async (rawMaterialItem) => await tx.stock.delete({
                    where: {
                        id: rawMaterialItem.stockId
                    }
                }))
                return Promise.all(promises);
            })
            return Promise.all(promises);
        })()
        await (async function () {
            let promises = programDetails.map(async (program) => {
                return await updateProgramDetails(tx, program, processDelivery);
            })
            return Promise.all(promises);
        })()
        await dataIntegrityValidation(tx);
    })
    return { statusCode: 0, data: processDelivery };
};

async function remove(id) {
    let data = "";
    await prisma.$transaction(async (tx) => {
        const data = await tx.stock.deleteMany({
            where: {
                RawMaterials: {
                    ProcessDeliveryProgramDetails: {
                        processDeliveryId: parseInt(id)
                    }
                }
            }
        })
        await tx.processDelivery.delete({
            where: {
                id: parseInt(id)
            }
        })
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
