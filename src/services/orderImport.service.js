import { NoRecordFound } from '../configs/Responses.js';
import { read, utils } from "xlsx";
import { convertToImportFormat } from "../utils/excelDataTransform.js";
import { getFinYearStartTimeEndTime } from "../utils/finYearHelper.js";
import { getDateFromDateTime, getDateTimeRangeForCurrentYear, getYearShortCode, getYearShortCodeForFinYear } from "../utils/helper.js";
import { getTableRecordWithId } from "../utils/helperQueries.js";
import { createAllClass, createAllColor, createAllSize, getAllClass, getAllColor, getAllSize } from '../query/masters.js';
import { prisma } from '../lib/prisma.js';

async function getNextDocId(branchId) {

    const { startTime, endTime } = getDateTimeRangeForCurrentYear(new Date());
    let lastObject = await prisma.orderImport.findFirst({
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
    let newDocId = `${branchObj.branchCode}${getYearShortCode(new Date())}/ORDI/1`
    if (lastObject) {
        newDocId = `${branchObj.branchCode}${getYearShortCode(new Date())}/ORDI/${parseInt(lastObject.docId.split("/").at(-1)) + 1}`

    }
    return newDocId
}




const xprisma = prisma.$extends({
    result: {
        orderImport: {
            docDate: {
                needs: { createdAt: true },
                compute(orderImport) {
                    return getDateFromDateTime(orderImport?.createdAt)
                },
            },
        }
    },
})

async function get(req) {
    const { pagination, pageNumber, dataPerPage, branchId, finYearId, searchOrderId, searchDocId, searchDocDate, searchSupplierName, orderId
    } = req.query


    let finYearDate = await getFinYearStartTimeEndTime(finYearId);
    const shortCode = finYearDate ? getYearShortCodeForFinYear(finYearDate?.startTime, finYearDate?.endTime) : "";
    // let docId = await getNextDocId(branchId, shortCode, finYearDate?.startTime, finYearDate?.endTime);
    let newDocId = await getNextDocId(branchId)
    let data = await xprisma.orderImport.findMany({
        where: {
            docId: searchDocId ? { contains: searchDocId } : undefined,

            Party: searchSupplierName ? { name: { contains: searchSupplierName } } : undefined,

            Order: searchOrderId ? { docId: { contains: searchOrderId } } : undefined,

            orderId: orderId ? parseInt(orderId) : undefined,
        },
        include: {
            Party: {
                select: {
                    id: true,
                    name: true,
                }
            },
            Order: {
                select: {
                    docId: true,
                }
            }
        }
    });

    let totalCount = data.length;
    if (searchDocDate) {
        data = data.filter(i => i.docDate.includes(searchDocDate))
    }
    if (pagination) {
        data = data.slice(((pageNumber - 1) * parseInt(dataPerPage)), pageNumber * dataPerPage)
    }

    return { statusCode: 0, data, totalCount, nextDocId: newDocId };
}


async function getOne(id) {
    const childRecord = 0;
    const data = await prisma.orderImport.findUnique({
        where: {
            id: parseInt(id)
        },
        include: {
            Party: {
                select: {
                    name: true
                }
            },
            orderImportItems: true,
            additionalImportData: {
                select: {
                    orderImportId: true,
                    student_name: true,
                    class: true,
                    gender: true,
                    color: true,
                    bottomColor: true,
                    bottomsize: true,
                    size: true,
                    itemTypeId: true,
                    itemId: true,
                    colorId: true,
                    bottomColorId: true,
                    bottomSizeId: true,
                    sizeId: true,
                    qty: true,
                    classIds: true
                }
            }

        }
    })
    if (!data) return NoRecordFound("orderImport");

    return { statusCode: 0, data: { ...data, ...{ childRecord } } };
}


async function createAdditionalImportData(tx, additionalImportData, orderImportId) {
    const promises = additionalImportData.map(async (item) => {
        await tx.additionalImportData.create({
            data: {
                orderImportId: parseInt(orderImportId),
                // sizeId: item.sizeId ? parseInt(item.sizeId) : undefined,
                // bottomSizeId: item?.bottomSizeId ? parseInt(item?.bottomSizeId) : undefined,
                bottomColorId: item?.colorId ? parseInt(item?.colorId) : undefined,
                colorId: item?.colorId ? parseInt(item?.colorId) : undefined,
                itemId: item?.itemId ? parseInt(item?.itemId) : undefined,
                itemTypeId: item?.itemTypeId ? parseInt(item?.itemTypeId) : undefined,
                gender: item?.gender ? item?.gender : null,
                qty: item?.qty ? item?.qty : undefined,
                classIds: {
                    createMany: {
                        data: item.classIds.map(temp => ({
                            classId: temp.classId ? parseInt(temp.classId) : undefined,
                            qty: temp.qty ? parseInt(temp.qty) : undefined,
                            sizeId: temp.sizeId ? parseInt(temp.sizeId) : undefined,
                            bottomSizeId: temp?.sizeId ? parseInt(temp?.sizeId) : undefined,
                        }))
                    }
                },
            }
        })
    }
    )
    return Promise.all(promises)
}





async function createOrderImportItems(additionalImportData) {

    let orderImportArray = [];
    for (let i = 0; i < additionalImportData?.length; i++) {
        let obj = additionalImportData[i]
        let colorName = await getTableRecordWithId(parseInt(obj?.colorId), "color")
        colorName = colorName ? colorName.name : "";
        let bottomColor = await getTableRecordWithId(parseInt(obj?.colorId), "color")
        bottomColor = bottomColor ? bottomColor.name : "";
        let genderobj;
        if (obj?.gender === "MALE") {
            genderobj = "M"
        }
        else if (obj?.gender === "FEMALE") {
            genderobj = "F"
        }
        else {
            genderobj = "O"
        }


        for (let j = 0; j < obj?.classIds?.length; j++) {
            let newObj = obj?.classIds[j]

            let className = await getTableRecordWithId(newObj?.classId, "class")
            className = className ? className.name : "";
            let sizeName = await getTableRecordWithId(parseInt(newObj?.sizeId), "size")
            sizeName = sizeName ? sizeName.name : "";
            let bottomSize = await getTableRecordWithId(parseInt(newObj?.sizeId), "size")
            bottomSize = bottomSize ? bottomSize.name : "";

            for (let k = 0; k < newObj?.qty; k++) {


                let readyObj = {
                    classId: parseInt(newObj?.classId),
                    sizeId: parseInt(newObj?.sizeId),
                    bottomSizeId: parseInt(newObj?.sizeId),
                    bottomColorId: parseInt(obj?.colorId),
                    colorId: parseInt(obj?.colorId),
                    bottomColor: colorName,
                    student_name: "samplename",
                    class: className,
                    color: colorName,
                    size: sizeName,
                    bottomsize: sizeName,
                    gender: genderobj,
                }

                orderImportArray?.push(readyObj)

            }
        }
    }

    return orderImportArray

}




async function create(req) {
    // const { finYearId, branchId, userId } = await req.body
    const { userId, branchId, partyId, companyId, orderId, isCreateMasters, additionalImportData, isDirectImportItems } = await req.body
    // let finYearDate = await getFinYearStartTimeEndTime(finYearId);
    // const shortCode = finYearDate ? getYearShortCodeForFinYear(finYearDate?.startTime, finYearDate?.endTime) : "";
    // let docId = await getNextDocId(branchId, shortCode, finYearDate?.startTime, finYearDate?.endTime);
    let docId = await getNextDocId(branchId);
    let data;

    if (JSON.parse(isDirectImportItems)) {

        let tempOrderImportItems = await createOrderImportItems(additionalImportData);



        await prisma.$transaction(async (tx) => {
            data = await tx.orderImport.create({
                data: {
                    partyId: partyId ? parseInt(partyId) : undefined,
                    companyId: companyId ? parseInt(companyId) : undefined,
                    branchId: branchId ? parseInt(branchId) : undefined,
                    orderId: parseInt(orderId),
                    docId,
                    createdById: parseInt(userId),
                    isDirectImportItems,
                    orderImportItems: tempOrderImportItems?.length > 0 ? {
                        createMany: {
                            data: tempOrderImportItems?.map(temp => ({
                                classId: parseInt(temp?.classId),
                                sizeId: parseInt(temp?.sizeId),
                                bottomSizeId: parseInt(temp?.sizeId),
                                bottomColorId: parseInt(temp?.colorId),
                                colorId: parseInt(temp?.colorId),
                                bottomColor: temp?.color,
                                student_name: "samplename",
                                class: temp?.class,
                                color: temp?.color,
                                size: temp?.size,
                                bottomsize: temp?.size,
                                gender: temp?.gender,
                            }))
                        }
                    } : undefined
                }
            })

            await createAdditionalImportData(tx, additionalImportData, data?.id);

        })
        return { statusCode: 0, data };
    }
    else {
        let file = new Uint8Array(req.file.buffer)
        let workbook = read(file, { type: "array" });
        var sheet_name_list = workbook.SheetNames;
        const importedData = utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);
        let headerNames = importedData;
        headerNames = headerNames?.map(val => {
            return {
                ...val, BOTTOMSIZE: val?.BOTTOMSIZE ? val?.BOTTOMSIZE : val?.SIZE,
                BOTTOMCOLOR: val?.BOTTOMCOLOR ? val?.BOTTOMCOLOR : val?.COLOR
            }
        })

        const orderImportItems = convertToImportFormat(importedData, headerNames);


        let isCreateMastersValue = JSON.parse((isCreateMasters === "undefined" || typeof (isCreateMasters) === "undefined") ? false : isCreateMasters);
        return await prisma.$transaction(async (tx) => {
            const colorList = await getAllColor(tx);
            const bottomColorList = await getAllColor(tx);
            const sizeList = await getAllSize(tx);
            const bottomSizeList = await getAllSize(tx);
            const classList = await getAllClass(tx);
            const missingItemsInClassMaster = [...new Set(orderImportItems.filter(i => !(classList.map(i => i.name).includes(i.class))).map(i => i.class))];
            const missingItemsInSizeMaster = [...new Set(orderImportItems.filter(i => !(sizeList.map(i => i.name).includes(i.size))).map(i => i.size))];
            const missingItemsInBottomSizeMaster = [...new Set(orderImportItems.filter(i => !(bottomSizeList.map(i => i.name).includes(i.bottomsize))).map(i => i.bottomsize))];
            const missingItemsInBottomColorMaster = [...new Set(orderImportItems.filter(i => !(bottomColorList.map(i => i.name).includes(i.bottomcolor))).map(i => i.bottomcolor))];
            const missingItemsInColorMaster = [...new Set(orderImportItems.filter(i => !(colorList.map(i => i.name).includes(i.color))).map(i => i.color))];
            if (!isCreateMastersValue) {
                if (missingItemsInClassMaster.length > 0 || missingItemsInSizeMaster.length > 0 || missingItemsInColorMaster.length > 0 || missingItemsInBottomSizeMaster.length > 0 || missingItemsInBottomColorMaster.length > 0) {

                    let missingInfoArray = [];
                    if (missingItemsInClassMaster.length > 0) {
                        missingInfoArray.push("Class");
                    }
                    if (missingItemsInSizeMaster.length > 0) {
                        missingInfoArray.push("Size");
                    }
                    if (missingItemsInColorMaster.length > 0) {
                        missingInfoArray.push("Colors");
                    }
                    if (missingItemsInBottomSizeMaster.length > 0) {
                        missingInfoArray.push("bottomsize");
                    }
                    if (missingItemsInBottomColorMaster.length > 0) {
                        missingInfoArray.push("bottomcolor");
                    }
                    return { statusCode: 2, message: `Some Below ${missingInfoArray.join(",")} Not in Master...!!!`, data: { missingItemsInClassMaster, missingItemsInColorMaster, missingItemsInSizeMaster, missingItemsInBottomSizeMaster, missingItemsInBottomColorMaster } }
                }
            }
            let colorListUpdated;
            let sizeListUpdated;
            let bottomsizeListUpdated;
            let bottomColorListUpdated;
            let classListUpdated;
            if (isCreateMastersValue) {
                colorListUpdated = await createAllColor(tx, missingItemsInColorMaster);
                sizeListUpdated = await createAllSize(tx, missingItemsInSizeMaster);
                bottomsizeListUpdated = await createAllSize(tx, missingItemsInBottomSizeMaster);
                bottomColorListUpdated = await createAllColor(tx, missingItemsInBottomColorMaster);
                classListUpdated = await createAllClass(tx, missingItemsInClassMaster);
            } else {
                colorListUpdated = colorList;
                sizeListUpdated = sizeList;
                bottomsizeListUpdated = bottomSizeList;
                bottomColorListUpdated = bottomColorList;
                classListUpdated = classList;
            }
            let orderImportItemsForStoring = orderImportItems.map(item => ({
                ...item,
                classId: parseInt(classListUpdated.find(i => i.name === item.class)?.id),
                sizeId: parseInt(sizeListUpdated.find(i => i.name === item.size)?.id),
                bottomSizeId: parseInt(bottomsizeListUpdated.find(i => i.name === item.bottomsize)?.id),
                bottomColorId: parseInt(bottomColorListUpdated.find(i => i.name === item.bottomcolor)?.id),
                colorId: parseInt(colorListUpdated.find(i => i.name === item.color)?.id),
                bottomColor: item?.bottomcolor ? item?.bottomcolor : item?.color,

            }));

            const removeField = (fieldToRemove) => {
                return (orderImportItemsForStoring.map(({ [fieldToRemove]: _, ...rest }) => rest));
            };

            orderImportItemsForStoring = removeField("bottomcolor")
            data = await tx.orderImport.create(
                {
                    data: {
                        partyId: partyId ? parseInt(partyId) : undefined,
                        companyId: companyId ? parseInt(companyId) : undefined,
                        branchId: branchId ? parseInt(branchId) : undefined,
                        orderId: parseInt(orderId),
                        docId,
                        createdById: parseInt(userId),
                        orderImportItems: {
                            createMany: {
                                data: orderImportItemsForStoring
                            }
                        }
                    }
                }
            )
            return { statusCode: 0, data: orderImportItemsForStoring };
        })
    }







}

async function update(id, body) {
    const { name, code, active, orderId } = await body


    const dataFound = await prisma.orderImport.findUnique({
        where: {
            id: parseInt(id)
        }
    })
    if (!dataFound) return NoRecordFound("orderImport");
    const data = await prisma.orderImport.update({
        where: {
            id: parseInt(id),
        },
        data:
        {
            name, code, active, orderId: parseInt(orderId)
        },
    })
    return { statusCode: 0, data };
};

async function remove(id) {
    const data = await prisma.orderImport.delete({
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
