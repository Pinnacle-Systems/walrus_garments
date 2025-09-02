import { PrismaClient } from "@prisma/client";
import { NoRecordFound } from "../configs/Responses.js";
import {
  exclude,
  getDateFromDateTime,
  getDateTimeRangeForCurrentYear,
  getRemovedItems,
  getYearShortCode,
} from "../utils/helper.js";
import { getTableRecordWithId } from "../utils/helperQueries.js";

const prisma = new PrismaClient();

async function getNextDocId(branchId) {
  const { startTime, endTime } = getDateTimeRangeForCurrentYear(new Date());
  let lastObject = await prisma.sample.findFirst({
    where: {
      branchId: parseInt(branchId),
      AND: [
        {
          createdAt: {
            gte: startTime,
          },
        },
        {
          createdAt: {
            lte: endTime,
          },
        },
      ],
    },
    orderBy: {
      id: "desc",
    },
  });
  const branchObj = await getTableRecordWithId(branchId, "branch");
  let newDocId = `${branchObj.branchCode}${getYearShortCode(
    new Date()
  )}/SAM/1`;

  if (lastObject) {
    newDocId = `${branchObj.branchCode}${getYearShortCode(new Date())}/SAM/${parseInt(lastObject.docId.split("/").at(-1)) + 1
      }`;
  }
  return newDocId;
}

async function manualFilterSearchData(searchBillDate, searchValidDate, data) {
  // if (!searchBillDate && !searchValidDate) return data
  return data.filter(
    (item) =>
      (searchBillDate
        ? String(getDateFromDateTime(item.createdAt)).includes(searchBillDate)
        : true) &&
      (searchValidDate
        ? String(getDateFromDateTime(item.validDate)).includes(searchValidDate)
        : true)
  );
}

async function get(req) {
  const {
    companyId,
    active,
    branchId,
    pagination,
    pageNumber,
    dataPerPage,
    searchSchool,
    searchContact,
    searchContactName,
    searchDocId,
    searchBillDate,
    searchValidDate,
  } = req.query;
  let data;

  data = await prisma.sample.findMany({
    where: {
      branchId: branchId ? parseInt(branchId) : undefined,
      active: active ? Boolean(active) : undefined,
      docId: Boolean(searchDocId)
        ? {
          contains: searchDocId,
        }
        : undefined,

    },
    orderBy: {
      id: "desc",
    },
    include: {

      Party: {
        select: {
          name: true,
          contactPersonEmail: true,
          contactPersonNumber: true,
        },
      },

    },
  });
  data = await manualFilterSearchData(searchBillDate, searchValidDate, data);
  let newDocId = await getNextDocId(branchId);
  let totalCount = data.length;
  if (pagination) {
    data = data.slice(
      (pageNumber - 1) * parseInt(dataPerPage),
      pageNumber * dataPerPage
    );
  }









  return { statusCode: 0, nextDocId: newDocId, data, totalCount };
}

async function getOne(id) {
  const childRecord = 0;
  const data = await prisma.sample.findUnique({
    where: {
      id: parseInt(id),
    },
    include: {
      Party: {
        select: {
          name: true,
          contactPersonEmail: true,
          contactPersonNumber: true,
        }
      },
      sampleDetails: {
        select: {
          sampleSizeDetails: true,
          id: true,
          sampleId: true,
          socksMaterialId: true,
          styleId: true,
          socksTypeId: true,
          filePath: true,
          sampleYarnDetails: true,
        },


      },
    },
  });
  if (!data) return NoRecordFound("party");
  return { statusCode: 0, data: { ...data, ...{ childRecord } } };
}

async function getSearch(req) {
  const { searchKey } = req.params;
  const { companyId, active } = req.query;
  const data = await prisma.sample.findMany({
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
    },
  });
  return { statusCode: 0, data: data };
}

export async function styleImageUpload(req) {
  const { comment } = req.body;

  const { id } = req.params;

  const data = await prisma.portionStyleImage.create({
    data: {
      sampleId: parseInt(id),
      image: req.file.filename,
      comment,
    },
  });
  return { statusCode: 0, data };
}

export async function removeStyleImage(id) {
  const data = await prisma.portionStyleImage.delete({
    where: {
      id: parseInt(id),
    },
  });
  return { statusCode: 0, data };
}

async function create(body) {
  const {

    active,
    userId,
    sampleDetails,
    draftSave,
    branchId,
    partyId,
    phone,
    contactPersonName,
    address,
    validDate,
    filePath,
    notes,
    term,
  } = await body;
  let data;
  let newDocId = await getNextDocId(branchId);
  data = await prisma.sample.create({
    data: {
      address,
      docId: newDocId,
      contactPersonName,
      createdById: userId ? parseInt(userId) : undefined,
      partyId: partyId ? parseInt(partyId) : undefined,
      filePath: filePath ? filePath : undefined,
      active: active && JSON.parse(active) ? JSON.parse(active) : undefined,
      branchId: branchId ? parseInt(branchId) : undefined,
      phone,
      validDate: validDate ? new Date(validDate) : undefined,
      notes: notes ? notes : undefined,
      term: term ? term : undefined,
      draftSave: draftSave ? JSON.parse(draftSave) : false,


      sampleDetails: JSON.parse(sampleDetails)?.length > 0
        ? {
          create: JSON.parse(sampleDetails).map((item) => ({
            styleId: item?.styleId ? parseInt(item.styleId) : undefined,
            socksMaterialId: item?.socksMaterialId ? parseInt(item.socksMaterialId) : undefined,
            socksTypeId: item?.socksTypeId ? parseInt(item.socksTypeId) : undefined,
            filePath: item?.filePath ? item?.filePath : undefined,

            sampleSizeDetails: item?.sampleSizeDetails?.length > 0
              ? {
                createMany: {
                  data: item?.sampleSizeDetails.map((sub) => ({
                    sizeId: sub?.sizeId ? parseInt(sub.sizeId) : undefined,
                    uomId: sub?.uomId ? parseInt(sub.uomId) : undefined,
                    qty: sub?.qty ? parseFloat(sub.qty) : undefined,
                    gsmId: sub?.gsmId ? parseInt(sub.gsmId) : undefined,
                    weight: sub?.weight ? sub?.weight : undefined,
                    yarnNeedleId: sub?.yarnNeedleId ? parseInt(sub.yarnNeedleId) : undefined,
                    remarks: sub?.remarks ? sub?.remarks : undefined,
                  })),
                },
              }
              : undefined,

            sampleYarnDetails: item?.sampleYarnDetails?.length > 0
              ? {
                createMany: {
                  data: item.sampleYarnDetails.map((yarn) => ({
                    colorId: yarn?.colorId ? parseInt(yarn.colorId) : undefined,
                    yarncategoryId: yarn?.yarncategoryId ? parseInt(yarn.yarncategoryId) : undefined,
                    yarnId: yarn?.yarnId ? parseInt(yarn.yarnId) : undefined,
                    count: yarn?.count ? String(yarn?.count) : undefined,
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

  return { statusCode: 0, data };
}

async function updateSampleDetails(tx, sampleDetails, sampleData, userId) {
  const promises = JSON.parse(sampleDetails || [])?.map(async (temp) => {
    const existingSampleDetail = await tx.sampleDetails.findUnique({
      where: { id: parseInt(temp.id) },
    });

    const newPatternValue = temp.pattern ? JSON.parse(temp.pattern) : false;
    const newCuttingValue = temp.cutting ? JSON.parse(temp.cutting) : false;
    const newPrintingValue = temp.printing ? JSON.parse(temp.printing) : false;
    const newEmbroidingValue = temp.embroiding ? JSON.parse(temp.embroiding) : false;
    const newStitchingValue = temp.stitching ? JSON.parse(temp.stitching) : false;
    const newIroningAndPackingValue = temp.ironingAndPacking ? JSON.parse(temp.ironingAndPacking) : false;


    return await tx.sampleDetails.update({
      where: {
        id: parseInt(temp.id),
      },
      data: {
        sampleId: sampleData.id ? parseInt(sampleData.id) : undefined,
        itemId: temp.itemId ? parseInt(temp.itemId) : undefined,
        itemTypeId: temp.itemTypeId ? parseInt(temp.itemTypeId) : undefined,
        colorId: temp.colorId ? parseInt(temp.colorId) : undefined,
        fabricId: temp.fabricId ? parseInt(temp.fabricId) : undefined,
        sizeId: temp.sizeId ? parseInt(temp.sizeId) : undefined,
        comment: temp.comment || "",
        filePath: temp.filePath || undefined,
        pattern: newPatternValue,
        patternUserId: newPatternValue
          ? existingSampleDetail?.pattern !== newPatternValue
            ? userId
            : existingSampleDetail?.patternUserId
          : existingSampleDetail?.patternUserId,

        cutting: newCuttingValue,
        cuttingUserId:
          existingSampleDetail?.cutting !== newCuttingValue
            ? newCuttingValue
              ? userId
              : null
            : existingSampleDetail?.cuttingUserId,

        printing: newPrintingValue,
        printingUserId: existingSampleDetail?.printing !== newPrintingValue
          ? newPrintingValue
            ? userId
            : null
          : existingSampleDetail?.printingUserId,

        embroiding: newEmbroidingValue,
        embroidingUserId: existingSampleDetail?.embroiding !== newEmbroidingValue
          ? newEmbroidingValue
            ? userId
            : null
          : existingSampleDetail?.embroidingUserId,

        stitching: newStitchingValue,
        stitchingUserId: existingSampleDetail?.stitching !== newStitchingValue
          ? newStitchingValue
            ? userId
            : null
          : existingSampleDetail?.stitchingUserId,

        ironingAndPacking: newIroningAndPackingValue,
        ironingAndPackingUserId: existingSampleDetail?.ironingAndPacking !== newIroningAndPackingValue
          ? newIroningAndPackingValue
            ? userId
            : null
          : existingSampleDetail?.ironingAndPackingUserId,

        embroidingDate: temp.embroidingDate ? new Date(temp.embroidingDate) : undefined,
        printingDate: temp.printingDate ? new Date(temp.printingDate) : undefined,
        cuttingDate: temp.cuttingDate ? new Date(temp.cuttingDate) : undefined,
        ironingAndPackingDate: temp.ironingAndPackingDate ? new Date(temp.ironingAndPackingDate) : undefined,
        stitchingDate: temp.stitchingDate ? new Date(temp.stitchingDate) : undefined,
        patternDate: temp.patternDate ? new Date(temp.patternDate) : undefined,

        printingFilePath: temp.printingFilePath || undefined,
        embroidingFilePath: temp.embroidingFilePath || undefined,
        ironingAndPackingFilePath: temp.ironingAndPackingFilePath || undefined,
      },
    });
  });

  return Promise.all(promises);
}



async function updateSampleDetailsBySampleFollow(
  tx,
  sampleDetails,
  sampleData
) {
  let removedItems = sampleData?.sampleDetails?.filter((oldItem) => {
    let result = JSON.parse(sampleDetails || [])?.find(
      (newItem) => newItem.id == oldItem.id
    );
    if (result) return false;
    return true;
  });
  let removedItemsId = removedItems?.map((item) => parseInt(item.id));
  await tx.sampleDetails.deleteMany({
    where: {
      id: {
        in: removedItemsId,
      },
    },
  });

  const promises = JSON.parse(sampleDetails || [])?.map(async (temp) => {
    if (temp?.id) {
      return await tx.sampleDetails.update({
        where: {
          id: parseInt(temp.id),
        },
        data: {
          sampleId: sampleData.id ? parseInt(sampleData.id) : undefined,
          colorId: temp.colorId ? parseInt(temp.colorId) : undefined,
          itemId: temp.itemId ? parseInt(temp.itemId) : undefined,
          itemTypeId: temp.itemTypeId ? parseInt(temp.itemTypeId) : undefined,
          fabricId: temp.fabricId ? parseInt(temp.fabricId) : undefined,
          sizeId: temp.sizeId ? parseInt(temp.sizeId) : undefined,
          // comment: temp.comment ? temp.comment : "",
          filePath: temp.filePath ? temp.filePath : undefined,
        },
      });
    } else {
      return await tx.sampleDetails.create({
        data: {
          sampleId: sampleData.id ? parseInt(sampleData.id) : undefined,
          itemId: temp.itemId ? parseInt(temp.itemId) : undefined,
          itemTypeId: temp.itemTypeId ? parseInt(temp.itemTypeId) : undefined,
          fabricId: temp.fabricId ? parseInt(temp.fabricId) : undefined,
          colorId: temp.colorId ? parseInt(temp.colorId) : undefined,
          sizeId: temp.sizeId ? parseInt(temp.sizeId) : undefined,
          // comment: temp.comment ? temp.comment : "",
          filePath: temp.filePath ? temp.filePath : undefined,
        },
      });
    }
  });
  return Promise.all(promises);
}

async function update(id, body) {
  let bodyData = await body;
  const {
    orderId,

    active,
    userId,

    branchId,
    partyId,
    phone,
    contactPersonName,
    address,
    validDate,
    companyId,

    merchandId,

    sampleDetails,
    notes,
    term,
  } = bodyData;
  let data;


  const parsedsampleDetails = JSON.parse(sampleDetails || "[]");
  console.log(parsedsampleDetails, "parsedsampleDetails")

  const incomingIds = parsedsampleDetails?.filter(i => i.id).map(i => parseInt(i.id));

  const dataFound = await prisma.sample.findUnique({
    where: {
      id: parseInt(id),
    },
  });
  if (!dataFound) return NoRecordFound("sample");

  await prisma.$transaction(async (tx) => {
    data = await tx.sample.update({
      where: {
        id: parseInt(id),

      },
      include: {
        sampleDetails: true,
      },
      data: {
        address,
        contactPersonName,
        userId: merchandId ? parseInt(merchandId) : undefined,
        updatedById: userId ? parseInt(userId) : undefined,
        partyId: partyId ? parseInt(partyId) : undefined,
        orderId: orderId ? parseInt(orderId) : undefined,
        companyId: companyId ? parseInt(companyId) : undefined,
        active: active && JSON.parse(active) ? JSON.parse(active) : undefined,
        branchId: branchId ? parseInt(branchId) : undefined,
        phone,
        validDate: validDate ? new Date(validDate) : undefined,
        notes: notes ? notes : undefined,
        term: term ? term : undefined,




        // sampleDetails: {
        //   deleteMany: {
        //     ...(incomingIds.length > 0 && {
        //       id: { notIn: incomingIds }
        //     })
        //   },

        //   update: parsedsampleDetails?.filter(item => item.id)?.map((item) => ({
        //     where: { id: parseInt(item.id) },
        //     data: {
        //       styleId: item?.styleId ? parseInt(item.styleId) : undefined,
        //       socksMaterialId: item?.socksMaterialId ? parseInt(item.socksMaterialId) : undefined,
        //       socksTypeId: item?.socksTypeId ? parseInt(item.socksTypeId) : undefined,
        //       filePath: item?.filePath ? item?.filePath : undefined,


        //       sampleSizeDetails: {
        //         deleteMany: {},
        //         createMany: {
        //           data: item?.sampleSizeDetails?.map((sub) => ({
        //             sizeId: sub?.sizeId ? parseInt(sub.sizeId) : undefined,
        //             uomId: sub?.uomId ? parseInt(sub.uomId) : undefined,
        //             qty: sub?.qty ? parseFloat(sub.qty) : undefined,
        //             gsmId: sub?.gsmId ? parseInt(sub.gsmId) : undefined,
        //             weight: sub?.weight ? sub?.weight : undefined,
        //             yarnNeedleId: sub?.yarnNeedleId ? parseInt(sub.yarnNeedleId) : undefined,
        //             remarks: sub?.remarks ? sub?.remarks : undefined,
        //           })) || [],
        //         },
        //       },


        //     },
        //   })),

        //   create: parsedsampleDetails.filter?.(item => !item.id)?.map((item) => ({
        //     styleId: item?.styleId ? parseInt(item.styleId) : undefined,
        //     socksMaterialId: item?.socksMaterialId ? parseInt(item.socksMaterialId) : undefined,
        //     socksTypeId: item?.socksTypeId ? parseInt(item.socksTypeId) : undefined,

        //     sampleSizeDetails: {
        //       createMany: {
        //         data: item?.sampleSizeDetails?.map((sub) => ({
        //           colorId: sub?.colorId ? parseInt(sub.colorId) : undefined,
        //           sizeId: sub?.sizeId ? parseInt(sub.sizeId) : undefined,
        //           uomId: sub?.uomId ? parseInt(sub.uomId) : undefined,
        //           qty: sub?.qty ? parseFloat(sub.qty) : undefined,
        //           gsmId: sub?.gsmId ? parseInt(sub.gsmId) : undefined,
        //           weight: sub?.weight ? sub?.weight : undefined,
        //           yarnNeedleId: sub?.yarnNeedleId ? parseInt(sub.yarnNeedleId) : undefined,
        //           remarks: sub?.remarks ? sub?.remarks : undefined,
        //         })) || [],
        //       },
        //     },


        //   })),
        // }


        sampleDetails: {
          deleteMany: {
            ...(incomingIds.length > 0 && {
              id: { notIn: incomingIds }
            })
          },

          update: parsedsampleDetails.filter(item => item.id)
            .map((item) => ({
              where: { id: parseInt(item.id) },


              data: {

                styleId: item?.styleId ? parseInt(item.styleId) : undefined,
                fiberContentId: item?.fiberContentId ? parseInt(item.fiberContentId) : undefined,
                socksMaterialId: item?.socksMaterialId ? parseInt(item.socksMaterialId) : undefined,
                socksTypeId: item?.socksTypeId ? parseInt(item.socksTypeId) : undefined,
                filePath: item?.filePath ? item?.filePath : undefined,



                sampleSizeDetails: {
                  deleteMany: {},
                  createMany: {
                    data: item?.sampleSizeDetails?.map((sub) => ({
                      sizeId: sub?.sizeId ? parseInt(sub.sizeId) : undefined,
                      // uomId: sub?.uomId ? parseInt(sub.uomId) : undefined,
                      qty: sub?.qty ? parseFloat(sub.qty) : undefined,
                      weight: sub?.weight ? sub?.weight : undefined,
                      remarks: sub?.remarks ? sub?.remarks : undefined,
                    })) || [],
                  },
                },

                sampleYarnDetails: {
                  deleteMany: {},
                  createMany: {
                    data: item?.sampleYarnDetails?.map((yarn) => ({
                      colorId: yarn?.colorId ? parseInt(yarn.colorId) : undefined,
                      yarncategoryId: yarn?.yarncategoryId ? parseInt(yarn.yarncategoryId) : undefined,
                      yarnId: yarn?.yarnId ? parseInt(yarn.yarnId) : undefined,
                      count: yarn?.count ? String(yarn?.count) : undefined,
                      yarnKneedleId: yarn?.yarnKneedleId ? parseInt(yarn.yarnKneedleId) : undefined,
                    })) || [],
                  },
                },
              },
            })),


          create: parsedsampleDetails.filter(item => !item.id)
            .map((item) => ({
              styleId: item?.styleId ? parseInt(item.styleId) : undefined,
              fiberContentId: item?.fiberContentId ? parseInt(item.fiberContentId) : undefined,
              socksMaterialId: item?.socksMaterialId ? parseInt(item.socksMaterialId) : undefined,
              socksTypeId: item?.socksTypeId ? parseInt(item.socksTypeId) : undefined,
              filePath: item?.filePath ? item?.filePath : undefined,

              sampleSizeDetails: {
                createMany: {
                  data: item?.orderSizeDetails?.map((sub) => ({
                    sizeId: sub?.sizeId ? parseInt(sub.sizeId) : undefined,
                    sizeMeasurement: sub?.sizeMeasurement || undefined,
                    qty: sub?.qty ? parseFloat(sub.qty) : undefined,
                  })) || [],
                },
              },

              sampleYarnDetails: {
                createMany: {
                  data: item?.sampleYarnDetails?.map((yarn) => ({
                    colorId: yarn?.colorId ? parseInt(yarn.colorId) : undefined,
                    yarncategoryId: yarn?.yarncategoryId ? parseInt(yarn.yarncategoryId) : undefined,
                    yarnId: yarn?.yarnId ? parseInt(yarn.yarnId) : undefined,
                    count: yarn?.count ? String(yarn?.count) : undefined,
                    yarnKneedleId: yarn?.yarnKneedleId ? parseInt(yarn.yarnKneedleId) : undefined,
                  })) || [],
                },
              },
            })),
        }




      },
    });


  });

  return { statusCode: 0, data };
}

async function remove(id) {
  const data = await prisma.sample.delete({
    where: {
      id: parseInt(id),
    },
  });
  return { statusCode: 0, data };
}

export async function createAttachment(req) {
  const { sampleId, comment, itemId, colorId, sizeId } = req.body;
  const data = await prisma.sampleDetails.create({
    data: {
      sampleId: sampleId ? parseInt(sampleId) : undefined,
      itemId: itemId ? parseInt(itemId) : undefined,

      colorId: colorId ? parseInt(colorId) : undefined,
      sizeId: sizeId ? parseInt(sizeId) : undefined,
      comment,
      filePath: req?.file?.filename,
    },
  });

  return { statusCode: 0, data };
}
export async function deleteAttachment(id) {
  const data = await prisma.sampleDetails.delete({
    where: {
      id: parseInt(id),
    },
  });
  return { statusCode: 0, data };
}
export async function updateAttachment(req) {
  const { id } = req.params;
  const { sampleId, comment, itemId, colorId, sizeId, isImageDeleted } =
    req.body;
  const data = await prisma.sampleDetails.update({
    where: {
      id: parseInt(id),
    },
    data: {
      sampleId: sampleId ? parseInt(sampleId) : undefined,
      itemId: itemId ? parseInt(itemId) : undefined,
      colorId: colorId ? parseInt(colorId) : undefined,
      sizeId: sizeId ? parseInt(sizeId) : undefined,
      comment,
      filePath:
        isImageDeleted && !JSON.parse(isImageDeleted)
          ? null
          : req?.file?.filename,
    },
  });
  return { statusCode: 0, data };
}

export { get, getOne, getSearch, create, update, remove };

