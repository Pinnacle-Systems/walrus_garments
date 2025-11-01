import { NoRecordFound } from '../configs/Responses.js';
import { getDateFromDateTime, getYearShortCodeForFinYear } from '../utils/helper.js';
import { getAlreadyPaidAmount, getTableRecordWithId } from "../utils/helperQueries.js"
import billEntyItemsValidation from '../validators/billEntry.validator.js';
import { getFinYearStartTimeEndTime } from '../utils/finYearHelper.js';
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function getNextDocId(branchId, isProcessBillEntry, shortCode, startTime, endTime) {
    let lastObject = await prisma.AccessoryBillEntry.findFirst({
        where: {
            branchId: parseInt(branchId),
            isProcessBillEntry: isProcessBillEntry && JSON.parse(isProcessBillEntry),
            isDirect: true,
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
    let code = (isProcessBillEntry && JSON.parse(isProcessBillEntry)) ? "PRBN" : "PBN";
    let newDocId = `${branchObj.branchCode}/${shortCode}/${code}/1`
    if (lastObject) {
        newDocId = `${branchObj.branchCode}/${shortCode}/${code}/${parseInt(lastObject.docId.split("/").at(-1)) + 1}`
    }
    return newDocId
}


function manualFilterSearchData(searchPoType, searchPoDate, searchPartyBillNo, data) {
    return data.filter(item =>
        (searchPoType ? (item.poType.toLowerCase().includes(searchPoType.toLowerCase())) : true)
        &&
        (searchPoDate ? String(getDateFromDateTime(item.createdAt)).includes(searchPoDate) : true)
        &&
        (searchPartyBillNo ? String(item.partyBillNo).includes(searchPartyBillNo) : true)
    )
}


async function get(req) {
    const { branchId, active, pageNumber, dataPerPage,
        searchDocId, searchSupplierAliasName, searchPoType, searchPartyBillNo, searchPoDate, pagination, payOutFiltration, isProcessBillEntry, finYearId, payerType , searchDate , supplier , searchMaterial } = req.query
    let data;
    let totalCount;
    let finYearDate = await getFinYearStartTimeEndTime(finYearId);
    const shortCode = finYearDate ? getYearShortCodeForFinYear(finYearDate?.startDateStartTime, finYearDate?.endDateEndTime) : "";
  
  
    if (pagination) {
        data = await prisma.AccessoryBillEntry.findMany({
            where: {
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
                branchId: branchId ? parseInt(branchId) : undefined,
                active: active ? Boolean(active) : undefined,
                isProcessBillEntry: isProcessBillEntry ? JSON.parse(isProcessBillEntry) : undefined,
                printingJobWorkId: null,
                finishedGoodsSalesId: null,
                rawMaterialsSalesId: null,
                poType : searchMaterial ? searchMaterial  :  undefined ,
                docId: Boolean(searchDocId) ?
                    {
                        contains: searchDocId
                    }
                    : undefined,
                supplier: {
                    name: Boolean(supplier) ? { contains: supplier } : undefined
                },
            },
            select: {
                id: true
            }
        });

        
        data = await (async function () {
            let promises = data.map(async (item) => {
                let d = await getOne(item.id, null, null)
                return d.data
            })
            return Promise.all(promises)
        })()
        console.log(data, "data")

        if (payOutFiltration) {
            data = data.filter(item => parseFloat(item.alreadyPaidAmount) < parseFloat(item.netBillValue))
        }

        data = manualFilterSearchData(searchPoType, searchDate, searchPartyBillNo, data)
        
        totalCount = data.length
        // data = data.slice(((pageNumber - 1) * parseInt(dataPerPage)), pageNumber * dataPerPage)
    } else {
        data = await prisma.AccessoryBillEntry.findMany({
            where: {
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
                branchId: branchId ? parseInt(branchId) : undefined,
                active: active ? Boolean(active) : undefined,
                isProcessBillEntry: isProcessBillEntry ? JSON.parse(isProcessBillEntry) : undefined,
                
                // isDirect: true,
            },
            include : {
                supplier : {
                    select : {
                        name : true ,
                        aliasName : true
                    }
                }
            }
        });
    }
    let docId = finYearDate ? (await getNextDocId(branchId, isProcessBillEntry, shortCode, finYearDate?.startTime, finYearDate?.endTime)) : "";
    return { statusCode: 0, data, nextDocId: docId, totalCount };
}

async function getOne(id, payOutId, advanceAdjustMentId) {
    const childRecord = 0;
    const data = await prisma.AccessoryBillEntry.findUnique({
        where: {
            id: parseInt(id)
        },
        include: {
            AccessoryBillEntryItems: true,
            Store: {
                select: {
                    locationId: true
                }
            },
            supplier: {
                select: {
                    aliasName: true
                }
            },
        },
    })
    if (!data) return NoRecordFound("AccessoryBillEntryItems");
    let alreadyPaidAmount = await getAlreadyPaidAmount(id, payOutId, advanceAdjustMentId)
    return { statusCode: 0, data: { ...data, ...{ childRecord }, alreadyPaidAmount } };
}

async function getSearch(req) {
    const { companyId, active } = req.query
    const { searchKey } = req.params
    const data = await prisma.AccessoryBillEntry.findMany({
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
    const { poType,   supplierId, billEntryItems, partyBillNo, partyBillDate,   netBillValue, taxTemplateId, processId,
        branchId, active, userId, discountType, discountValue, isProcessBillEntry, finYearId } = await body 
        
    let finYearDate = await getFinYearStartTimeEndTime(finYearId);
    const shortCode = finYearDate ? getYearShortCodeForFinYear(finYearDate?.startDateStartTime, finYearDate?.endDateEndTime) : "";
    let docId = await getNextDocId(branchId, isProcessBillEntry, shortCode, finYearDate?.startDateStartTime, finYearDate?.endDateEndTime);
    // const isValid = await billEntyItemsValidation(billEntryItems, null, isProcessBillEntry)
    // if (!isValid) return { statusCode: 1, message: "Data Validation Failed" }
    const data = await prisma.AccessoryBillEntry.create({
        data: {
            poType,
            processId: processId ? parseInt(processId) : undefined,
            taxTemplateId: parseInt(taxTemplateId),
            netBillValue: parseInt(netBillValue),
            docId,
            partyBillNo,
            partyBillDate: partyBillDate ? new Date(partyBillDate) : undefined,
            supplierId: parseInt(supplierId),
            branchId: parseInt(branchId),
            active,
            discountType, discountValue: discountValue ? parseFloat(discountValue) : "",
            createdById: parseInt(userId),
            isProcessBillEntry: isProcessBillEntry ? JSON.parse(isProcessBillEntry) : undefined,
            AccessoryBillEntryItems: {
                createMany: {
                    data: billEntryItems.map(item => {
                        let newItem = {}
                        if (item.isPoItem) {
                            newItem["accessoryPoItemsId"] = parseInt(item["accessoryPoItemsId"]);
                        } else if (isProcessBillEntry) {
                            newItem["processDeliveryProgramDetailsId"] = parseInt(item["processDeliveryProgramDetailsId"])
                        } else {
                            newItem["accessoryInwardItemsId"] = item["accessoryInwardItemsId"]  ?   parseInt(item["accessoryInwardItemsId"])  : "  "
                        }
                        newItem["price"] = item["price"] ?  parseFloat(item["price"]) : ""
                        newItem["discountType"] = item["discountType"] ? item["discountType"] : ""
                        newItem["notes"] = item["notes"] ? item["notes"] : ""
                        newItem["discountValue"] = item["discountValue"] ?  parseInt(item["discountValue"])  : ""
                        newItem["qty"] = item["qty"]  ?  parseFloat(item["qty"]) : ""
                        newItem["taxPercent"] = item?.taxPercent ? parseFloat(item["taxPercent"]) : undefined;
                        newItem["isPoItem"] = item?.isPoItem  ?  item?.isPoItem : false
                        return newItem
                    })
                }
            },
            // Ledger: {
            //     create: {
            //         EntryType: isProcessBillEntry ? "Process_Bill" : "Purchase_Bill",
            //         LedgerType: "Supplier",
            //         creditOrDebit: "Credit",
            //         partyId: parseInt(supplierId),
            //         amount: parseFloat(netBillValue),
            //         partyBillNo,
            //         partyBillDate: partyBillDate ? new Date(partyBillDate) : undefined,
            //     }
            // }
        }
    });
    return { statusCode: 0, data };
}

function findRemovedItems(dataFound, billEntryItems) {
    let removedItems = dataFound.BillEntryItems.filter(oldItem => {
        let result = billEntryItems.find(newItem => newItem.id === oldItem.id)
        if (result) return false
        return true
    })
    return removedItems
}

async function deleteBillEntryItems(tx, removeItemsBillEntryItemsIds) {
    return await tx.billEntryItems.deleteMany({
        where: {
            id: {
                in: removeItemsBillEntryItemsIds
            }
        }
    })
}


async function updateOrCreate(tx, item, billEntryId, isProcessBillEntry) {
    let newItem = {}
    if (item.isPoItem) {
        newItem["poItemsId"] = parseInt(item["poItemsId"]);
    } else if (isProcessBillEntry) {
        newItem["processDeliveryProgramDetailsId"] = parseInt(item["processDeliveryProgramDetailsId"])
    } else {
        newItem["directItemsId"] = parseInt(item["directItemsId"])
    }
    newItem["price"] = parseFloat(item["price"])
    newItem["notes"] = item["notes"]
    newItem["discountType"] = item["discountType"]
    newItem["discountValue"] = parseInt(item["discountValue"])
    newItem["taxPercent"] = item?.taxPercent ? parseFloat(item["taxPercent"]) : undefined;
    newItem["qty"] = parseFloat(item["qty"]);
    newItem["isPoItem"] = item.isPoItem
    if (item?.id) {
        await tx.billEntryItems.update({
            where: {
                id: parseInt(item.id)
            },
            data: newItem
        })
    } else {
        await tx.billEntryItems.create({
            data: {
                ...newItem,
                billEntryId: parseInt(billEntryId)
            }
        })
    }
    return newItem
}

async function updateAllBillEntryItems(tx, billEntryItems, billEntryId, isProcessBillEntry) {
    let promises = billEntryItems.map(async (item) => await updateOrCreate(tx, item, billEntryId, isProcessBillEntry))
    return Promise.all(promises)
}

async function update(id, body) {
    const { poType,
        supplierId, billEntryItems, partyBillNo, partyBillDate,
        netBillValue, taxTemplateId, processId,
        branchId, active, userId, discountType, discountValue, isProcessBillEntry } = await body
    const dataFound = await prisma.billEntry.findUnique({
        where: {
            id: parseInt(id)
        },
        include: {
            BillEntryItems: true
        }
    })
    // const isBillEntryItemsValid = await billEntyItemsValidation(billEntryItems, id, isProcessBillEntry);
    // if (!isBillEntryItemsValid) return { statusCode: 1, message: "Data Validation Failed" }
    if (!dataFound) return NoRecordFound("billEntry");
    let billEntryData;
    let removedItems = findRemovedItems(dataFound, billEntryItems);
    let removeItemsBillEntryItemsIds = removedItems.map(item => parseInt(item.id))
    await prisma.$transaction(async (tx) => {
        await deleteBillEntryItems(tx, removeItemsBillEntryItemsIds);
        billEntryData = await tx.billEntry.update({
            where: {
                id: parseInt(id)
            },
            data: {
                poType,
                processId: processId ? parseInt(processId) : undefined,
                taxTemplateId: parseInt(taxTemplateId),
                netBillValue: parseInt(netBillValue),
                partyBillNo,
                partyBillDate: partyBillDate ? new Date(partyBillDate) : undefined,
                supplierId: parseInt(supplierId),
                branchId: parseInt(branchId),
                active,
                updatedById: parseInt(userId),
                discountType, discountValue: discountValue ? parseFloat(discountValue) : undefined,
                isProcessBillEntry: isProcessBillEntry ? JSON.parse(isProcessBillEntry) : undefined,
                Ledger: {
                    update: {
                        EntryType: isProcessBillEntry ? "Process_Bill" : "Purchase_Bill",
                        LedgerType: "Supplier",
                        creditOrDebit: "Credit",
                        partyId: parseInt(supplierId),
                        amount: parseFloat(netBillValue),
                        partyBillNo: partyBillNo ? partyBillNo : undefined,
                        partyBillDate: partyBillDate ? new Date(partyBillDate) : undefined,
                    }
                }
            },
        })
        await updateAllBillEntryItems(tx, billEntryItems, billEntryData.id, isProcessBillEntry)
    })
    return { statusCode: 0, data: billEntryData };
};

async function remove(id) {
    const data = await prisma.billEntry.delete({
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
