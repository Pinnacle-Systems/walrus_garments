import { NoRecordFound } from '../configs/Responses.js';
import { prisma } from '../lib/prisma.js';
import { getDateTimeRangeForCurrentYear, getYearShortCode, getDateFromDateTime } from '../utils/helper.js';
import { getTableRecordWithId } from '../utils/helperQueries.js';

async function getNextDocId(branchId) {

    const { startTime, endTime } = getDateTimeRangeForCurrentYear(new Date());
    let lastObject = await prisma.quotes.findFirst({
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
    let newDocId = `${branchObj.branchCode}/${getYearShortCode(new Date())}/QUO/1`


    if (lastObject) {
        newDocId = `${branchObj.branchCode}/${getYearShortCode(new Date())}/QUO/${parseInt(lastObject.docId.split("/").at(-1)) + 1}`


    }
    return newDocId
}

function manualFilterSearchData(searchBillDate, searchValidDate, data) {
    console.log(data, "data")
    return data.filter(item =>
        (searchBillDate ? String(getDateFromDateTime(item.createdAt)).includes(searchBillDate) : true) &&
        (searchValidDate ? String(getDateFromDateTime(item.validDate)).includes(searchValidDate) : true)

    )
}

async function get(req) {
    const { companyId, fromDate, toDate, purchaseReport, filterSupplier, active, branchId, pagination, pageNumber, dataPerPage, searchDocId, searchBillDate, searchSupplierName, searchValidDate } = req.query

    let data;

    data = await prisma.quotes.findMany({
        where: {
            companyId: companyId ? parseInt(companyId) : undefined,
            active: active ? Boolean(active) : undefined,
            docId: Boolean(searchDocId) ?
                {
                    contains: searchDocId
                }
                : undefined,
            Party: Boolean(searchSupplierName) ? {
                name: {
                    contains: searchSupplierName
                }
            } : undefined

        },
        include: {
            QuotesItems: true
        }
    });


    data = manualFilterSearchData(searchBillDate, searchValidDate, data)
    const totalCount = data.length

    if (pagination) {
        data = data.slice(((pageNumber - 1) * parseInt(dataPerPage)), pageNumber * dataPerPage)
    }
    let newDocId = await getNextDocId(branchId)

    return { statusCode: 0, nextDocId: newDocId, data, totalCount };
}


async function getOne(id) {
    const childRecord = 0;
    const data = await prisma.quotes.findUnique({
        where: {
            id: parseInt(id)
        },
        include: {

            QuoteVersion: {
                select: {
                    quoteVersion: true,
                    priceRange: true
                }
            },
            QuotesItems: {
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
            },
            LeadForm: true,
        },

    })

    if (!data) return NoRecordFound("quotes");

    return { statusCode: 0, data: { ...data, ...{ childRecord } } };
}

async function getSearch(req) {
    const { searchKey } = req.params
    const { companyId, active } = req.query
    const data = await prisma.quotes.findMany({
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
    const { clientId, projectName, validDate, placeOfSupplyId, isDifferAddress,
        shippingAddress, billingId, billingAddress, quotesItems, shippingAddressId, isIgst, companyId,
        active, branchId, leadId, projectId, priceRange, transportCost, transportTax, totalDiscount, termsAndCondition } = await body
    let newDocId = await getNextDocId(branchId)
    await prisma.$transaction(async (tx) => {
        data = await tx.quotes.create(
            {
                data: {
                    docId: newDocId, isIgst, totalDiscount, transportCost, projectName, transportTax, termsAndCondition,
                    billingAddress, clientId: parseInt(clientId),
                    isDifferAddress, billingId: parseInt(billingId),
                    shippingAddress,
                    companyId: parseInt(companyId), active,
                    validDate: validDate ? new Date(validDate) : undefined,
                    branchId: parseInt(branchId),
                    placeOfSupplyId: parseInt(placeOfSupplyId),
                    leadId: leadId ? parseInt(leadId) : undefined,
                    projectId: projectId ? parseInt(projectId) : undefined,
                    // shippingAddressId: parseInt(shippingAddressId),

                    QuoteVersion: {
                        createMany: {
                            data: [{ quoteVersion: 1, priceRange }]
                        }
                    },
                    QuotesItems: {
                        createMany: {
                            data: quotesItems.map(temp => {
                                let newItem = {}
                                newItem["productId"] = parseInt(temp["productId"]);
                                newItem["uomId"] = parseInt(temp["uomId"]);
                                newItem["qty"] = parseFloat(temp["qty"]);
                                newItem["price"] = parseFloat(temp["price"]);
                                newItem["taxPercent"] = temp["taxPercent"];
                                newItem["hsnCode"] = temp["hsnCode"] ? temp["hsnCode"].toString() : null;
                                newItem["description"] = temp["description"];
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

    const { clientId, projectName, shippingAddress, quotesUpdate, billingId, isDifferAddress, isIgst, totalDiscount,
        transportCost, transportTax, validDate, placeOfSupplyId, billingAddress, quotesItems, shippingAddressId,
        companyId, active, branchId, leadId, projectId, quoteVersion, quoteType, isNewVersion, priceRange, lineItemsData, termsAndCondition } = await body

    if (quotesUpdate) {



        for (let i = 0; i < lineItemsData?.length; i++) {


            data = await prisma.quotesItems.findFirst({
                where: {
                    quotesId: parseInt(lineItemsData[i]["quotesId"]),
                    id: parseInt(lineItemsData[i]["id"]),
                    // planStartDate: lineItemsData[i]["planStartDate"] ? new Date(lineItemsData[i]["planStartDate"]) : undefined,
                    // planEndDate: lineItemsData[i]["planEndDate"] ? new Date(lineItemsData[i]["planEndDate"]) : undefined,

                },
            })



            if (data) {
                await prisma.quotesItems.updateMany({
                    where: {
                        id: parseInt(lineItemsData[i]["id"]),

                    },
                    data: {
                        planStartDate: lineItemsData[i]["planStartDate"] ? new Date(lineItemsData[i]["planStartDate"]) : undefined,
                        planEndDate: lineItemsData[i]["planEndDate"] ? new Date(lineItemsData[i]["planEndDate"]) : undefined,
                        leadDays: lineItemsData[i]["leadDays"] ? lineItemsData[i]["leadDays"] : ""
                    }
                })
            } else {
                await prisma.quotesItems.create({
                    data: {
                        id: parseInt(lineItemsData[i]["id"]),
                        planStartDate: lineItemsData[i]["planStartDate"] ? new Date(lineItemsData[i]["planStartDate"]) : undefined,
                        planEndDate: lineItemsData[i]["planEndDate"] ? new Date(lineItemsData[i]["planEndDate"]) : undefined,
                        leadDays: lineItemsData[i]["leadDays"] ? lineItemsData[i]["leadDays"] : ""
                    }
                })
            }
        }

    }


    else {
        const dataFound = await prisma.quotes.findUnique({
            where: {
                id: parseInt(id)
            },
            include: {
                QuotesItems: true,
                QuoteVersion: true
            }
        })



        const maxQuoteVersion = Math.max(...new Set(dataFound?.QuotesItems.filter(i => i?.quoteVersion).map(i => parseInt(i.quoteVersion))))
        if (!dataFound) return NoRecordFound("quotes");
        data = await prisma.quotes.update({
            where: {
                id: parseInt(id),
            },
            data: {
                billingAddress, clientId: parseInt(clientId), projectName,
                isIgst,
                totalDiscount,
                transportCost, transportTax, termsAndCondition,
                shippingAddress,
                // shippingAddressId: parseInt(shippingAddressId),
                isDifferAddress,
                billingId: billingId ? parseInt(billingId) : undefined,
                companyId: parseInt(companyId), active,
                validDate: validDate ? new Date(validDate) : undefined,
                branchId: parseInt(branchId),
                placeOfSupplyId: parseInt(placeOfSupplyId),
                leadId: quoteType === "New" ? parseInt(leadId) : leadId ? parseInt(leadId) : null,
                projectId: quoteType === "Existing" ? parseInt(projectId) : projectId ? parseInt(projectId) : null,
                quoteVersion: isNewVersion ? maxQuoteVersion + 1 : parseInt(quoteVersion),
                QuoteVersion: isNewVersion ? {
                    createMany: {
                        data: [{ quoteVersion: maxQuoteVersion + 1, priceRange }]
                    }
                } : undefined,
                QuotesItems: {
                    deleteMany: {},
                    createMany: {
                        data: quotesItems.map(temp => {
                            let newItem = {}
                            newItem["productId"] = parseInt(temp["productId"]);
                            newItem["description"] = temp["description"];
                            newItem["uomId"] = parseInt(temp["uomId"]);
                            newItem["qty"] = parseFloat(temp["qty"]);
                            newItem["price"] = parseFloat(temp["price"]);
                            newItem["taxPercent"] = temp["taxPercent"];
                            newItem["hsnCode"] = temp["hsnCode"] ? temp["hsnCode"].toString() : null;

                            newItem["discount"] = parseFloat(temp["discount"] || 0);
                            newItem["quoteVersion"] = (temp["quoteVersion"] == "New") ? parseInt(maxQuoteVersion + 1) : parseInt(temp["quoteVersion"])
                            return newItem
                        }
                        )
                    }
                }

            }

        })

    }



    return { statusCode: 0, data };
};



// async function updatePoBillItems(tx, poBillItems, quotes) {
//     let removedItems = quotes.PoBillItems.filter(oldItem => {
//         let result = poBillItems.find(newItem => newItem.id === oldItem.id)
//         if (result) return false
//         return true
//     })

//     let removedItemsId = removedItems.map(item => parseInt(item.id))

//     await tx.PoBillItems.deleteMany({
//         where: {
//             id: {
//                 in: removedItemsId
//             }
//         }
//     })

//     const promises = poBillItems.map(async (item) => {
//         if (item?.id) {
//             return await tx.poBillItems.update({
//                 where: {
//                     id: parseInt(item.id)
//                 },
//                 data: {
//                     quotesId: parseInt(quotes.id),
//                     productBrandId: item?.productBrandId ? parseInt(item.productBrandId) : undefined,
//                     productCategoryId: item?.productCategoryId ? parseInt(item.productCategoryId) : undefined,
//                     productId: item?.productId ? parseInt(item.productId) : undefined,
//                     qty: item?.qty ? parseFloat(item.qty) : 0.000,
//                     price: item?.price ? parseFloat(item.price) : 0.000,
//                     uomId: item?.uomId ? parseFloat(item.uomId) : undefined,
//                     stockQty: item?.stockQty ? parseFloat(item.stockQty) : undefined,
//                     salePrice: item?.salePrice ? parseFloat(item.salePrice) : 0.000,
//                     Stock: {
//                         update: {
//                             inOrOut: "In",
//                             productId: item?.productId ? parseInt(item.productId) : undefined,
//                             qty: parseFloat(item.qty),
//                             branchId: parseInt(quotes.branchId),
//                             uomId: item?.uomId ? parseInt(item.uomId) : undefined,
//                             salePrice: item?.salePrice ? parseFloat(item.salePrice) : 0.000,
//                         }
//                     }
//                 }
//             })
//         } else {
//             return await tx.poBillItems.create({
//                 data: {
//                     quotesId: parseInt(quotes.id),
//                     productBrandId: item?.productBrandId ? parseInt(item.productBrandId) : undefined,
//                     productCategoryId: item?.productCategoryId ? parseInt(item.productCategoryId) : undefined,
//                     productId: item?.productId ? parseInt(item.productId) : undefined,
//                     qty: item?.qty ? parseFloat(item.qty) : 0.000,
//                     price: item?.price ? parseFloat(item.price) : 0.000,
//                     Stock: {
//                         create: {
//                             inOrOut: "In",
//                             productId: item?.productId ? parseInt(item.productId) : undefined,
//                             qty: parseFloat(item.qty),
//                             branchId: parseInt(quotes.branchId),
//                         }
//                     }
//                 }
//             })
//         }
//     })
//     return Promise.all(promises)
// }



async function remove(id) {
    const data = await prisma.quotes.delete({
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