import { NoRecordFound } from '../configs/Responses.js';
import { PrismaClient } from '@prisma/client'
import { getFinYearStartTimeEndTime } from "../utils/finYearHelper.js";
import { getDateFromDateTime, getYearShortCode, getYearShortCodeForFinYear } from "../utils/helper.js";
import { getTableRecordWithId } from '../utils/helperQueries.js';

const prisma = new PrismaClient()


function findIsNumber(docId) {
    const parts = docId?.split('/');
    const last = parts[parts?.length - 1];

    console.log(last, "lastttt")

    if (last == "Drift") {
        return false
    }
    else {
        return true
    }

    // return !isNaN(Number(last));
}

async function getNextDocId(branchId, shortCode, startTime, endTime, saveType, docId, isUpdate) {

    if (saveType) {
        return "Draft Save"
    }
    else if (isUpdate == "drift") {
        let lastObject = await prisma.order.findFirst({
            where: {
                branchId: parseInt(branchId),
                // docId: {
                //     not: findIsNumber(docId)
                // },
                draftSave: false,
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



        console.log(lastObject, "lastObjectlasttttt")
        const branchObj = await getTableRecordWithId(branchId, "branch")
        let newDocId = `${branchObj.branchCode}${getYearShortCode(new Date())}/ORD/1`
        if (lastObject) {
            newDocId = `${branchObj.branchCode}${getYearShortCode(new Date())}/ORD/${parseInt(lastObject.docId.split("/").at(-1)) + 1}`
        }
        return newDocId
    }
    else {
        let lastObject = await prisma.order.findFirst({
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
        let newDocId = `${branchObj.branchCode}${getYearShortCode(new Date())}/ORD/1`
        if (lastObject) {
            newDocId = `${branchObj.branchCode}${getYearShortCode(new Date())}/ORD/${parseInt(lastObject.docId.split("/").at(-1)) + 1}`
        }
        return newDocId
    }

}

const xprisma = prisma.$extends({
    result: {
        order: {
            docDate: {
                needs: { createdAt: true },
                compute(order) {
                    return getDateFromDateTime(order?.createdAt)
                },
            },
            delDate: {
                needs: { validDate: true },
                compute(order) {
                    return getDateFromDateTime(order?.validDate)
                }
            }
        }
    },
})

async function get(req) {
    const { pagination, pageNumber, dataPerPage, branchId, finYearId, searchDocId, searchDelDate, searchDocDate, partyId,

    } = req.query

    let finYearDate = await getFinYearStartTimeEndTime(finYearId);
    const shortCode = finYearDate ? getYearShortCodeForFinYear(finYearDate?.startTime, finYearDate?.endTime) : "";
    let newDocId = await getNextDocId(branchId, shortCode, finYearDate?.startTime, finYearDate?.endTime);
    let data = await xprisma.order.findMany({
        where: {
            branchId: branchId ? parseInt(branchId) : undefined,
            docId: Boolean(searchDocId) ?
                {
                    contains: searchDocId
                }
                : undefined,
            partyId: partyId ? parseInt(partyId) : undefined,
            // Party: { name: searchSupplierName ? { contains: searchSupplierName } : undefined }
        },
        orderBy: {
            id: "desc",
        },
        include: {
            Party: {
                select: {
                    id: true,
                    name: true
                }
            },
            orderDetails: {
                select  :{
                    fiberContentId : true ,
                    id : true , 
                    orderId : true  ,
                    socksMaterialId  : true ,
                    styleId : true ,
                    orderSizeDetails  : true  ,
                    orderYarnDetails  : true ,
                }
            }

        },


    });
    let totalCount = data.length;
    if (searchDocDate) {
        data = data.filter(i => i.docDate.includes(searchDocDate))
    }
    if (searchDelDate) {
        data = data.filter(i => i.delDate.includes(searchDelDate))
    }

    if (pagination) {
        data = data.slice(((pageNumber - 1) * parseInt(dataPerPage)), pageNumber * dataPerPage)
    }


    return { statusCode: 0, data, totalCount, nextDocId: newDocId };
}


async function getOne(id) {
    const childRecord = 0;
    let data = await prisma.order.findUnique({
        where: {
            id: parseInt(id)
        },
        include: {
            Party: {
                select: {
                    name: true
                }
            },
                   orderDetails: {
                select  :{
                    fiberContentId : true ,
                    id : true , 
                    orderId : true  ,
                    socksMaterialId  : true ,
                    styleId : true ,
                    socksTypeId : true,
                    sizeId : true,
                    orderSizeDetails  : true  ,
                    orderYarnDetails  : true ,
                }
            }
        }

    })
    if (!data) return NoRecordFound("order");


    return { statusCode: 0, data: { ...data, ...{ childRecord } } };
}



export async function getOrderItemsById(id, prevProcessId, packingCategory, packingType) {


    const childRecord = 0;
    let data = await prisma.order.findUnique({
        where: {
            id: parseInt(id)
        },
        include: {
            Party: {
                select: {
                    name: true
                }
            },
            orderDetails: true



        }
    })
    if (!data) return NoRecordFound("order");




    return { statusCode: 0, data: { ...data, ...{ childRecord } } };
}


async function create(req) {
    const { userId, branchId, partyId, finYearId, packingCoverType, notes, term, orderBy, draftSave,
        phone, contactPersonName, address, validDate, orderDetails } = await req.body
    let finYearDate = await getFinYearStartTimeEndTime(finYearId);
    const shortCode = finYearDate ? getYearShortCodeForFinYear(finYearDate?.startTime, finYearDate?.endTime) : "";
    let docId = await getNextDocId(branchId, shortCode, finYearDate?.startTime, finYearDate?.endTime, draftSave);
let orderDetailsParsed = [];


console.log(orderDetails,"orderDetails");

    let data;
    await prisma.$transaction(async (tx) => {

data = await tx.order.create({
  data: {
    docId,
    packingCoverType,
    partyId: partyId ? parseInt(partyId) : undefined,
    branchId: branchId ? parseInt(branchId) : undefined,
    createdById: parseInt(userId),
    contactPersonName,
    address,
    phone,
    notes,
    term,
    orderBy,
    validDate: validDate ? new Date(validDate) : undefined,
    draftSave: Boolean(draftSave),

    orderDetails: orderDetails?.length > 0
      ? {
          create: JSON.parse(orderDetails).map((item) => ({
            styleId: item?.styleId ? parseInt(item.styleId) : undefined,
            fiberContentId: item?.fiberContentId ? parseInt(item.fiberContentId) : undefined,
            socksMaterialId: item?.socksMaterialId ? parseInt(item.socksMaterialId) : undefined,
            socksTypeId: item?.socksTypeId ? parseInt(item.socksTypeId) : undefined,

            orderSizeDetails: item?.orderSizeDetails?.length > 0
              ? {
                  createMany: {
                    data: item.orderSizeDetails.map((sub) => ({
                      size: sub?.sizeId || undefined,
                      sizeId: sub?.sizeId ? parseInt(sub.sizeId) : undefined,
                      sizeMeasurement: sub?.sizeMeasurement || undefined,
                      qty: sub?.qty ? parseFloat(sub.qty) : undefined,
                    })),
                  },
                }
              : undefined,

            orderYarnDetails: item?.orderYarnDetails?.length > 0
              ? {
                  createMany: {
                    data: item.orderYarnDetails.map((yarn) => ({
                      yarncategoryId: yarn?.yarncategoryId ? parseInt(yarn.yarncategoryId) : undefined,
                      yarnId: yarn?.yarnId ? parseInt(yarn.yarnId) : undefined,
                      count: yarn?.count ?  yarn?.count  :  undefined,
                      yarnKneedleId: yarn?.yarnKneedleId ? parseInt(yarn.yarnKneedleId) : undefined,
                    })),
                  },
                }
              : undefined,
          })),
        }
      : undefined,
  },
});





    })

    return { statusCode: 0, data };

}



const update = async (id, body) => {
    const { docId, draftSave, finYearId, userId, branchId, partyId, orderDetails, contactPersonName, packingCoverType, address, phone, validDate, notes, term, orderBy,
    } = body;

    let finYearDate = await getFinYearStartTimeEndTime(finYearId);
    const shortCode = finYearDate ? getYearShortCodeForFinYear(finYearDate?.startTime, finYearDate?.endTime) : "";
    let docIdNumber = await getNextDocId(branchId, shortCode, finYearDate?.startTime, finYearDate?.endTime, false, docId, "drift");

console.log(orderDetails,"orderDetails")
    const dataFound = await prisma.order.findUnique({ where: { id: parseInt(id) } });
    if (!dataFound) return { statusCode: 404, message: "No record found for order" };

    let data;
    await prisma.$transaction(async (tx) => {
        data = await tx.order.update({
            where: {
                 id: parseInt(id) ,
                  
                },
                include: {
                        PoItems: true
                    },
            data: {
                docId: draftSave ? docIdNumber : dataFound?.docId,
                partyId: partyId ? parseInt(partyId) : undefined,
                packingCoverType,
                branchId: branchId ? parseInt(branchId) : undefined,
                contactPersonName,
                address,
                phone,
                validDate: validDate ? new Date(validDate) : undefined,
                updatedById: parseInt(userId), notes, term, orderBy, draftSave: Boolean(draftSave),
                // orderDetails: {
                //     deleteMany: {},
                //     createMany: {
                //         data: JSON.parse(orderDetails || []).map(temp => {
                //             let newItem = {}
                //             newItem["yarnNeedleId"] = temp["yarnNeedleId"] ? parseInt(temp["yarnNeedleId"]) : "";
                //             newItem["machineId"] = temp["machineId"] ? parseInt(temp["machineId"]) : "";
                //             newItem["fiberContentId"] = temp["fiberContentId"] ? parseInt(temp["fiberContentId"]) : "";
                //             newItem["qty"] = temp["qty"] ? parseFloat(temp["qty"]) : "";
                //             newItem["socksMaterialId"] = temp["socksMaterialId"] ? parseInt(temp["socksMaterialId"]) : "";
                //             newItem["sizeId"] = temp["sizeId"] ? parseInt(temp["sizeId"]) : "";
                //             newItem["styleId"] = temp["styleId"] ? parseInt(temp["styleId"]) : "";
                //             newItem["socksTypeId"] = temp["socksTypeId"] ? parseInt(temp["socksTypeId"]) : "";
                //             newItem["legcolorId"] = temp["legcolorId"] ? parseInt(temp["legcolorId"]) : "";
                //             newItem["footcolorId"] = temp["footcolorId"] ? parseInt(temp["footcolorId"]) : "";
                //             newItem["stripecolorId"] = temp["stripecolorId"] ? parseInt(temp["stripecolorId"]) : "";
                //             newItem["description"] = temp["description"] ? temp["description"] : "";
                //             newItem["measurements"] = temp["measurements"] ? temp["measurements"] : "";
                //             newItem["noOfStripes"] = temp["noOfStripes"] ? temp["noOfStripes"] : "";
                //             newItem["filePath"] = temp["filePath"] ? temp["filePath"] : "";
                //             return newItem
                //         }
                //         )
                //     }
                // }
                        orderDetails: {
                                   deleteMany: {},
                                        
                                   create :  orderDetails?.length  >  0   ?  
                                JSON.parse(orderDetails)?.map(item => ({
                                                styleId: item?.styleId ? parseInt(item.styleId) : undefined,
                                                }))   :  []

                        }



                                    },
                                });


    });

    return { statusCode: 0, data };
};


async function remove(id) {
    const data = await prisma.order.delete({
        where: {
            id: parseInt(id)
        },
    })
    return { statusCode: 0, data };
}

export {
    get,
    getOne,
    create,
    update,
    remove
}
