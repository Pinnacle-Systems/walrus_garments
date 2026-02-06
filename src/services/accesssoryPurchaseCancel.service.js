import { NoRecordFound } from '../configs/Responses.js';
import { billItemsFiltration, getDateFromDateTime, getRemovedItems, getYearShortCodeForFinYear, substract, balanceQtyCalculation, balanceReturnQtyCalculation, getYearShortCode } from '../utils/helper.js';
import { getTableRecordWithId } from "../utils/helperQueries.js"
import { createManyStockWithId, updateManyStockWithId } from '../utils/stockHelper.js';
import { getCancelItemsAlreadyData, getDirectInwardReturnItemsAlreadyData, getDirectInwardReturnItemsLotBreakUp } from '../utils/directInwardReturnQueries.js';
import { getFinYearStartTimeEndTime } from '../utils/finYearHelper.js';
import dataIntegrityValidation from "../validators/DataIntegregityValidation/index.js";
import { prisma } from '../lib/prisma.js';

async function getNextDocId(branchId, poInwardOrDirectInward, shortCode, startTime, endTime) {


    let lastObject = await prisma.AccesssoryPurchaseCancel.findFirst({
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
    let newDocId = `${branchObj.branchCode}${getYearShortCode(new Date())}/APC/1`
    if (lastObject) {
        newDocId = `${branchObj.branchCode}${getYearShortCode(new Date())}/APC/${parseInt(lastObject.docId.split("/").at(-1)) + 1}`
    }
    return newDocId
}


function manualFilterSearchData(searchPoDate, searchDueDate, searchPoType, data) {
    return data.filter(item =>
        (searchPoDate ? String(getDateFromDateTime(item.createdAt)).includes(searchPoDate) : true) &&
        (searchDueDate ? String(getDateFromDateTime(item.dueDate)).includes(searchDueDate) : true) &&
        (searchPoType ? (item.poType.toLowerCase().includes(searchPoType.toLowerCase())) : true)
    )
}


async function get(req) {
    const { branchId, active, poInwardOrDirectInward, pageNumber, dataPerPage, serachDocNo, searchDate, supplier,
        searchDocId, searchPoDate, searchSupplierAliasName, searchPoType, searchDueDate, pagination, finYearId } = req.query
    console.log(serachDocNo, "serachDocNo")
    let data;
    let totalCount;
    let finYearDate = await getFinYearStartTimeEndTime(finYearId);
    const shortCode = finYearDate ? getYearShortCodeForFinYear(finYearDate?.startTime, finYearDate?.endTime) : "";
    if (pagination) {
        data = await prisma.AccesssoryPurchaseCancel.findMany({
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
                // poInwardOrDirectInward,
                docId: serachDocNo ?
                    {
                        contains: serachDocNo
                    }
                    : undefined,
                supplier: {
                    aliasName: supplier ? { contains: supplier } : undefined
                }
            },
            orderBy: {
                id: "desc",
            },
            include: {
                supplier: {
                    select: {
                        aliasName: true,
                        name: true,
                    }
                }
            }
        });
        data = manualFilterSearchData(searchDate, searchDueDate, searchPoType, data)
        totalCount = data.length
        // data = data.slice(((pageNumber - 1) * parseInt(dataPerPage)), pageNumber * dataPerPage)
    } else {
        data = await prisma.AccesssoryPurchaseCancel.findMany({
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
                // poInwardOrDirectInward,
            },
            orderBy: {
                id: "desc",
            },
            include: {
                supplier: {
                    select: {
                        aliasName: true,
                        name: true,
                    }
                }
            }
        });
    }
    let docId = await getNextDocId(branchId, poInwardOrDirectInward, shortCode, finYearDate?.startTime, finYearDate?.endTime);
    return { statusCode: 0, data, nextDocId: docId, totalCount };
}



function manualFilterSearchDatacancelItems(searchPoDate, searchDueDate, searchPoType, data) {
    return data.filter(item =>
        (searchPoDate ? String(getDateFromDateTime(item.Po.createdAt)).includes(searchPoDate) : true) &&
        (searchDueDate ? String(getDateFromDateTime(item.Po.dueDate)).includes(searchDueDate) : true) &&
        (searchPoType ? (item.purchaseCancel.poType.toLowerCase().includes(searchPoType.toLowerCase())) : true)
    )
}

function manualFilterSearchDataPoItems(searchPoDate, searchDueDate, searchPoType, data) {
    return data.filter(item =>
        (searchPoDate ? String(getDateFromDateTime(item.Po.createdAt)).includes(searchPoDate) : true) &&
        (searchDueDate ? String(getDateFromDateTime(item.Po.dueDate)).includes(searchDueDate) : true) &&
        (searchPoType ? (item.Po.transType.toLowerCase().includes(searchPoType.toLowerCase())) : true)
    )
}




async function getOne(id) {
    const childRecord = 0;
    const data = await prisma.AccesssoryPurchaseCancel.findUnique({
        where: {
            id: parseInt(id)
        },
        include: {
            // cancelItems: {
            //     select: {
            //         id: true,
            //         Fabric: true,
            //         fabricId: true,
            //         Yarn: true,
            //         yarnId: true,
            //         Accessory: true,
            //         accessoryId: true,
            //         Color: true,
            //         colorId: true,
            //         Uom: true,
            //         uomId: true,
            //         Design: true,
            //         Gauge: true,
            //         LoopLength: true,
            //         Gsm: true,
            //         price: true,

            //         Size: true,
            //         designId: true,
            //         gaugeId: true,
            //         loopLengthId: true,
            //         gsmId: true,
            //         sizeId: true,
            //         KDia: true,
            //         kDiaId: true,
            //         FDia: true,
            //         fDiaId: true,
            //         purchaseCancelId: true,

            //         qty: true,


            //         poNo: true,
            //         poQty: true,

            //         poItemsId: true,
            //     }
            // }
            AccessoryCancelItems: true
        },
    })

    console.log(data, "data")
    data["AccessoryCancelItems"] = await getCancelItemsAlreadyData(data.id, "PurchaseCancel", data?.poType, data?.AccessoryCancelItems)
    if (!data) return NoRecordFound("purchaseCancel");
    return { statusCode: 0, data: { ...data, ...{ childRecord } } };
}

async function getSearch(req) {
    const { companyId, active } = req.query
    const { searchKey } = req.params
    const data = await prisma.purchaseCancel.findMany({
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

// async function createLotGridItems(tx, cancelItemsId, inwardLotDetails, item, poType, poInwardOrDirectInward, storeId, branchId) {
//     let processValid = false;
//     let promises = inwardLotDetails.map(async (temp, index) => {
//         await tx.inwardLotDetails.create({
//             data: {
//                 cancelItemsId: parseInt(cancelItemsId),
//                 lotNo: temp["lotNo"],
//                 qty: parseFloat(temp["qty"]),
//                 noOfRolls: parseInt(temp["noOfRolls"]),
//                 Stock: {
//                     create: {
//                         itemType: poType,
//                         inOrOut: poInwardOrDirectInward,
//                         branchId: parseInt(branchId),
//                         fabricId: item?.fabricId ? parseInt(item.fabricId) : undefined,
//                         colorId: item?.colorId ? parseInt(item.colorId) : undefined,
//                         uomId: item?.uomId ? parseInt(item.uomId) : undefined,
//                         designId: item?.designId ? parseInt(item.designId) : undefined,
//                         gaugeId: item?.gaugeId ? parseInt(item.gaugeId) : undefined,
//                         loopLengthId: item?.loopLengthId ? parseInt(item.loopLengthId) : undefined,
//                         gsmId: item?.gsmId ? parseInt(item.gsmId) : undefined,
//                         kDiaId: item?.kDiaId ? parseInt(item.kDiaId) : undefined,
//                         fDiaId: item?.fDiaId ? parseInt(item.fDiaId) : undefined,
//                         noOfBags: item?.noOfBags ? parseInt(item.noOfBags) : undefined,
//                         storeId: parseInt(storeId),
//                         noOfRolls: temp?.noOfRolls ? parseInt(temp.noOfRolls) : undefined,
//                         qty: parseFloat(temp.qty),
//                         lotNo: temp?.lotNo ? temp.lotNo : undefined,
//                     }
//                 }
//             }
//         })
//     }
//     )
//     await dataIntegrityValidation(tx, processValid = false);
//     return Promise.all(promises)
// }




async function createCancelItems(tx, accesssoryPurchaseCancelId, cancelItems, poType, poInwardOrDirectInward, storeId, branchId) {
    let promises

    console.log(poType == "DyedYarn" || poType == "GreyYarn")
    if (poType == "DyedYarn" || poType == "GreyYarn") {

        promises = cancelItems.map(async (item, index) => {
            const data = await tx.AccessoryCancelItems.create({
                data: {
                    accesssoryPurchaseCancelId: parseInt(accesssoryPurchaseCancelId),
                    yarnId: item["yarnId"] ? parseInt(item["yarnId"]) : undefined,
                    uomId: item["uomId"] ? parseInt(item["uomId"]) : undefined,
                    colorId: item["colorId"] ? parseInt(item["colorId"]) : undefined,
                    poQty: item["poQty"] ? parseFloat(item["poQty"]) : 0,
                    poNo: item["poNo"] ? item["poNo"] : undefined,
                    qty: item["qty"] ? parseFloat(item["qty"]) : 0,
                    price: item["price"] ? parseFloat(item["price"]) : 0,
                    poItemsId: item["poItemsId"] ? parseInt(item["poItemsId"]) : undefined,
                    // gsmId: item["gsmId"] ? parseInt(item["gsmId"]) : undefined,
                    cancelType: item["cancelType"] ? item["cancelType"] : "",



                }
            })


        }
        )


    }
    else {

        promises = cancelItems.map(async (item, index) => {
            const data = await tx.AccessoryCancelItems.create({
                data: {

                    accesssoryPurchaseCancelId: accesssoryPurchaseCancelId ? parseInt(accesssoryPurchaseCancelId) : "",
                    accessoryId: item["accessoryId"] ? parseInt(item["accessoryId"]) : "",
                    accessoryGroupId: item["accessoryGroupId"] ? parseInt(item["accessoryGroupId"]) : "",
                    // accessoryItemId: item["accessoryItemId"] ? parseInt(item["accessoryItemId"]) : "",
                    sizeId: item["sizeId"] ? parseInt(item["sizeId"]) : "",
                    colorId: item["colorId"] ? parseInt(item["colorId"]) : "",
                    uomId: item["uomId"] ? parseInt(item["uomId"]) : "",

                    qty: item["qty"] ? parseFloat(item["qty"]) : 0,
                    price: item["price"] ? parseFloat(item["price"]) : 0,
                    poQty: item["poQty"] ? parseFloat(item["poQty"]) : 0,
                    poNo: item["poNo"] ? item["poNo"] : "",
                    poItemsId: item["poItemsId"] ? parseInt(item["poItemsId"]) : "",
                    cancelType: item["cancelType"] ? item["cancelType"] : "",

                    // purchaseCancelId: parseInt(purchaseCancelId),
                    // accessoryId: parseInt(item["accessoryId"]),
                    // accessoryGroupId: parseInt(item["accessoryGroupId"]),
                    // accessoryItemId: parseInt(item["accessoryItemId"]),
                    // sizeId: item["sizeId"] ? parseInt(item["sizeId"]) : "",
                    // colorId: item["colorId"] ? parseInt(item["colorId"]) : "",




                }
            })
        }



        )
    }



    return Promise.all(promises)
}


async function create(body) {
    const { poType, poInwardOrDirectInward,
        supplierId, cancelItems, po, dcDate, storeId,
        payTermId,
        vehicleNo, specialInstructions, remarks,
        branchId, active, userId, finYearId } = await body
    let finYearDate = await getFinYearStartTimeEndTime(finYearId);
    const shortCode = finYearDate ? getYearShortCodeForFinYear(finYearDate?.startTime, finYearDate?.endTime) : "";
    let docId = await getNextDocId(branchId, poInwardOrDirectInward, shortCode, finYearDate?.startTime, finYearDate?.endTime);
    let data;
    let processValid;

    await prisma.$transaction(async (tx) => {

        data = await tx.AccesssoryPurchaseCancel.create({
            data: {
                poType, poInwardOrDirectInward,
                supplierId: parseInt(supplierId),
                branchId: parseInt(branchId),
                po: po ? po : undefined,

                active,
                createdById: parseInt(userId),
                remarks,
                docId

            },
        })
        await createCancelItems(tx, data.id, cancelItems, poType, poInwardOrDirectInward, branchId)
        // await dataIntegrityValidation(tx, processValid = false);
    })
    return { statusCode: 0, data };
}





export function getPoItemObject(item) {
    
    console.log(item, "item")
    let newItem = {};
        newItem["accessoryId"] = item["accessoryId"] ? parseInt(item["accessoryId"]) : "",
        newItem["accessoryGroupId"] = item["accessoryGroupId"] ? parseInt(item["accessoryGroupId"]) : "",
        // newItem["accessoryItemId"] = item["accessoryItemId"] ? parseInt(item["accessoryItemId"]) : "",
        newItem["sizeId"] = item["sizeId"] ? parseInt(item["sizeId"]) : "",
        newItem["colorId"] = item["colorId"] ? parseInt(item["colorId"]) : "",
        newItem["uomId"] = item["uomId"] ? parseInt(item["uomId"]) : "",
        newItem["qty"] = item["qty"] ? parseFloat(item["qty"]) : 0,
        newItem["price"] = item["price"] ? parseFloat(item["price"]) : 0,
        newItem["poQty"] = item["poQty"] ? parseFloat(item["poQty"]) : 0,
        newItem["poNo"] = item["poNo"] ? item["poNo"] : "",
        newItem["poItemsId"] = item["poItemsId"] ? parseInt(item["poItemsId"]) : "",
        newItem["cancelType"] = item["cancelType"] ? item["cancelType"] : ""




    return newItem;
}







async function update(id, body) {

    let processValid = false;
    const { poType, poInwardOrDirectInward,
        supplierId, cancelItems,
        remarks,
        branchId, active, userId } = await body


    const dataFound = await prisma.AccesssoryPurchaseCancel.findUnique({
        where: {
            id: parseInt(id)
        },
        include: {
            AccessoryCancelItems: true
        }
    })
    if (!dataFound) return NoRecordFound("accessoryPurchaseCancel");

    const isAlreadyItemAdded = id => {
        let item = dataFound?.AccessoryCancelItems?.find(item => parseInt(item.id) === parseInt(id))
        if (!item) return false
        return true
    }

    let newPoItems = cancelItems?.filter(item => !item?.id)
    let updatePoItems = cancelItems?.filter(item => isAlreadyItemAdded(item.id))

    let deletedItems = dataFound?.AccessoryCancelItems?.filter(item => {
        return !(cancelItems?.filter(item => item?.id).some(poItem => parseInt(poItem.id) === parseInt(item.id)))
    }).map(item => parseInt(item.id))

    let piData;

    await prisma.$transaction(async (tx) => {

        piData = await tx.AccesssoryPurchaseCancel.update({
            where: {
                id: parseInt(id)
            },
            data: {
                poType, poInwardOrDirectInward,
                supplierId: parseInt(supplierId),
                branchId: parseInt(branchId),
                remarks,
                active,
                updatedById: parseInt(userId),
                // AccessoryCancelItems: {
                //     deleteMany: {},
                //     createMany: cancelItems?.length > 0 ? {
                //         data: cancelItems.map(item => {

                //             let newItem = {};
                //             newItem["fabricId"] = item["fabricId"] ? parseInt(item["fabricId"]) : undefined,
                //                 newItem["accessoryId"] = item["accessoryId"] ? parseInt(item["accessoryId"]) : undefined,
                //                 accessoryGroupId = item["accessoryGroupId"] ? parseInt(item["accessoryGroupId"]) : undefined,
                //                 accessoryItemId = item["accessoryItemId"] ? parseInt(item["accessoryItemId"]) : undefined,
                //                 newItem["designId"] = item["designId"] ? parseInt(item["designId"]) : undefined,
                //                 newItem["gaugeId"] = item["gaugeId"] ? parseInt(item["gaugeId"]) : undefined,
                //                 newItem["loopLengthId"] = item["loopLengthId"] ? parseInt(item["loopLengthId"]) : undefined,
                //                 newItem["gsmId"] = item["gsmId"] ? parseInt(item["gsmId"]) : undefined,
                //                 newItem["kDiaId"] = item["kDiaId"] ? parseInt(item["kDiaId"]) : undefined,
                //                 newItem["fDiaId"] = item["fDiaId"] ? parseInt(item["fDiaId"]) : undefined,
                //                 newItem["uomId"] = item["uomId"] ? parseInt(item["uomId"]) : undefined,
                //                 newItem["colorId"] = item["colorId"] ? parseInt(item["colorId"]) : undefined,
                //                 newItem["qty"] = item["qty"] ? parseFloat(item["qty"]) : 0,
                //                 newItem["sizeId"] = item["sizeId"] ? parseInt(item["sizeId"]) : undefined,
                //                 newItem["poQty"] = item["poQty"] ? parseFloat(item["poQty"]) : 0,
                //                 newItem["poNo"] = item["poNo"] ? item["poNo"] : undefined,
                //                 newItem["cancelType"] = item["cancelType"] ? item["cancelType"] : "",

                //                 newItem["price"] = item["price"] ? parseFloat(item["price"]) : 0,
                //                 newItem["poItemsId"] = item["poItemsId"] ? parseInt(item["poItemsId"]) : undefined;
                //             return newItem
                //         })
                //     } : undefined
                // }
                AccessoryCancelItems: {
                    createMany: {
                        data: newPoItems?.map(item => getPoItemObject( item))
                    }
                }
            },
        })
        const updatePoItemsFunc = async () => {
            let promises = updatePoItems.map(async (item) => {
                return await tx.AccessoryCancelItems.update({
                    where: {
                        id: parseInt(item.id)
                    },
                    data: getPoItemObject(item)
                })
            })
            return Promise.all(promises)
        }
        await updatePoItemsFunc()
        await tx.AccessoryCancelItems.deleteMany({
            where: {
                id: {
                    in: deletedItems
                }
            }
        })
        // await dataIntegrityValidation(tx, processValid = false);
    })
    return { statusCode: 0, data: piData };
}




async function remove(id) {
    const data = await prisma.AccesssoryPurchaseCancel.delete({
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









