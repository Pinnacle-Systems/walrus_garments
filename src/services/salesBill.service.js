import { PrismaClient } from '@prisma/client'
import { NoRecordFound } from '../configs/Responses.js';
import { exclude, getDateFromDateTime, getDateTimeRange, getDateTimeRangeForCurrentYear, getYearShortCode } from '../utils/helper.js';
import { getTableRecordWithId } from '../utils/helperQueries.js';


const prisma = new PrismaClient()


async function getNextDocId(branchId) {
    const { startTime, endTime } = getDateTimeRangeForCurrentYear(new Date());
    let lastObject = await prisma.salesBill.findFirst({
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
    let newDocId = `${branchObj.branchCode}/${getYearShortCode(new Date())}/SB/1`
    // let newDocId = `PB/1`

    if (lastObject) {

        newDocId = `${branchObj.branchCode}/${getYearShortCode(new Date())}/SB/${parseInt(lastObject.docId.split("/").at(-1)) + 1}`
        // newDocId = `PB/${parseInt(lastObject.docId.split("/").at(-1)) + 1}`

    }
    return newDocId
}

function manualFilterSearchData(searchBillDate, data) {
    return data.filter(item =>
        (searchBillDate ? String(getDateFromDateTime(item.createdAt)).includes(searchBillDate) : true)
        // (searchSupplierDcDate ? String(getDateFromDateTime(item.dueDate)).includes(searchSupplierDcDate) : true) 
        // (searchPurchaseBillNo ?String(item.purchaseBillId).includes(searchPurchaseBillNo) : true) 
    )
}


async function get(req) {
    const { companyId, active, branchId, pagination, pageNumber, dataPerPage, searchDocId, searchBillDate, searchCustomerName, salesReport, fromDate, toDate } = req.query
    let data;
    const { startTime: startDateStartTime, endTime: startDateEndTime } = getDateTimeRange(fromDate);
    const { startTime: endDateStartTime, endTime: endDateEndTime } = getDateTimeRange(toDate);



    if (salesReport) {
        data = await prisma.$queryRaw`
SELECT 
    product.name AS Product,
    SUM(qty) as Qty,
    (SELECT 
            SUM(e.amount)
        FROM
            (SELECT 
                saleprice, SUM(qty), (saleprice * SUM(qty)) AS amount
            FROM
                salesBillItems sub
                LEFT JOIN
            Salesbill salesbill ON salesbill.id = sub.salesBillId
            WHERE
                sub.productId = salesbillitems.productId AND  salesbill.createdAt BETWEEN ${startDateStartTime} AND ${endDateEndTime}
               

            GROUP BY sub.saleprice) e) AS Amount
            FROM
            SalesBillItems salesBillItems 
  
                LEFT JOIN 
                SalesBill salebill ON salebill.id=salesBillItems.salesBillId
        LEFT JOIN
    product ON product.id = salesBillItems.productId
    WHERE
                salebill.createdAt BETWEEN ${startDateStartTime} AND ${endDateEndTime} 
GROUP BY salesBillItems.productId , product.name;

        `;
        return { statusCode: 0, data };
    }


    else {
        data = await prisma.salesBill.findMany({
            where: {
                companyId: companyId ? parseInt(companyId) : undefined,
                active: active ? Boolean(active) : undefined,
                docId: Boolean(searchDocId) ?
                    {
                        contains: searchDocId
                    }
                    : undefined,
                name: Boolean(searchCustomerName) ? {
                    contains: searchCustomerName
                } : undefined,
                supplier: {
                    name: Boolean(searchCustomerName) ? { contains: searchCustomerName } : undefined
                }
            },
            include: {
                SalesBillItems: {
                    select: {
                        qty: true,
                        salePrice: true
                    }
                }
            }
        });
    }


    data = manualFilterSearchData(searchBillDate, data)
    const totalCount = data.length

    if (pagination) {
        data = data.slice(((pageNumber - 1) * parseInt(dataPerPage)), pageNumber * dataPerPage)
    }
    let newDocId = await getNextDocId(branchId)
    return { statusCode: 0, nextDocId: newDocId, data, totalCount };
}


async function getOne(id) {
    const childRecord = 0;
    const data = await prisma.salesBill.findUnique({
        where: {
            id: parseInt(id)
        },
        include: {
            SalesBillItems: {
                select: {
                    id: true,
                    productBrandId: true,
                    ProductBrand: {
                        select: {
                            name: true
                        }
                    },
                    productCategoryId: true,
                    ProductCategory: {
                        select: {
                            name: true
                        }
                    },
                    Product: {
                        select: {
                            name: true
                        }
                    },
                    Uom: {
                        select: {
                            name: true
                        }
                    },
                    productId: true,
                    qty: true,
                    // price: true,
                    uomId: true,
                    stockQty: true,
                    salePrice: true
                }
            }
        }
    })
    if (!data) return NoRecordFound("salesBill");


    data["SalesBillItems"] = await (async function getReturnQty() {
        const promises = data["SalesBillItems"].map(async (i) => {
            const sql = `
            SELECT COALESCE(SUM(QTY),0) as returnQty FROM SalesReturnItems WHERE salesBillItemsId=${i.id}
            `
            console.log(sql);
            let returnQty = await prisma.$queryRawUnsafe(sql);
            i["alreadyReturnQty"] = returnQty[0]['returnQty']
            return i
        })
        return Promise.all(promises);
    })()
    return { statusCode: 0, data: { ...data, ...{ childRecord } } };
}

async function getSearch(req) {
    const { searchKey } = req.params
    const { companyId, active } = req.query
    const data = await prisma.salesBill.findMany({
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



async function createSalesBillItems(tx, salesBillItems, salesBill) {

    const promises = salesBillItems.map(async (item) => {
        return await tx.salesBillItems.create({
            data: {
                salesBillId: parseInt(salesBill.id),
                productBrandId: item?.productBrandId ? parseInt(item.productBrandId) : undefined,
                productCategoryId: item?.productCategoryId ? parseInt(item.productCategoryId) : undefined,
                productId: item?.productId ? parseInt(item.productId) : undefined,
                qty: item?.qty ? parseFloat(item.qty) : 0.000,
                stockQty: item?.stockQty ? parseFloat(item.stockQty) : 0.000,
                // price: item?.price ? parseFloat(item.price) : 0.000,
                uomId: item?.uomId ? parseInt(item.uomId) : undefined,
                salePrice: item?.salePrice ? parseFloat(item.salePrice) : 0.000,
                Stock: {
                    create: {
                        inOrOut: "Out",
                        productId: item?.productId ? parseInt(item.productId) : undefined,
                        qty: 0 - parseFloat(item.qty),
                        branchId: parseInt(salesBill.branchId),
                        uomId: item?.uomId ? parseInt(item.uomId) : undefined,
                        salePrice: item?.salePrice ? parseFloat(item.salePrice) : 0.000,
                    }
                }
            }
        })
    }
    )
    return Promise.all(promises)
}




async function create(body) {
    let data;
    const { dueDate, address, place, salesBillItems, companyId, active, branchId, contactMobile, name } = await body
    let newDocId = await getNextDocId(branchId)
    await prisma.$transaction(async (tx) => {
        data = await tx.salesBill.create(
            {
                data: {
                    docId: newDocId,
                    address, place, name,
                    contactMobile: contactMobile ? parseInt(contactMobile) : undefined,
                    companyId: parseInt(companyId), active,
                    dueDate: dueDate ? new Date(dueDate) : undefined,
                    branchId: parseInt(branchId),

                }
            })
        await createSalesBillItems(tx, salesBillItems, data)

    })
    return { statusCode: 0, data };
}




async function updateSalesBillItems(tx, salesBillItems, salesBill) {
    let removedItems = salesBill.SalesBillItems.filter(oldItem => {
        let result = salesBillItems.find(newItem => newItem.id === oldItem.id)
        if (result) return false
        return true
    })

    let removedItemsId = removedItems.map(item => parseInt(item.id))

    await tx.SalesBillItems.deleteMany({
        where: {
            id: {
                in: removedItemsId
            }
        }
    })

    const promises = salesBillItems.map(async (item) => {
        if (item?.id) {
            return await tx.salesBillItems.update({
                where: {
                    id: parseInt(item.id)
                },
                data: {
                    salesBillId: parseInt(salesBill.id),
                    productBrandId: item?.productBrandId ? parseInt(item.productBrandId) : undefined,
                    productCategoryId: item?.productCategoryId ? parseInt(item.productCategoryId) : undefined,
                    productId: item?.productId ? parseInt(item.productId) : undefined,
                    qty: item?.qty ? parseFloat(item.qty) : 0.000,
                    stockQty: item?.stockQty ? parseFloat(item.stockQty) : 0.000,
                    // price: item?.price ? parseFloat(item.price) : 0.000,
                    uomId: item?.uomId ? parseInt(item.uomId) : undefined,
                    salePrice: item?.salePrice ? parseFloat(item.salePrice) : 0.000,
                    Stock: {
                        update: {
                            inOrOut: "Out",
                            productId: item?.productId ? parseInt(item.productId) : undefined,
                            qty: 0 - parseFloat(item.qty),
                            branchId: parseInt(salesBill.branchId),
                            uomId: item?.uomId ? parseInt(item.uomId) : undefined,
                            salePrice: item?.salePrice ? parseFloat(item.salePrice) : 0.000,

                        }
                    }
                }
            })
        } else {
            return await tx.salesBillItems.create({
                data: {
                    salesBillId: parseInt(salesBill.id),
                    productBrandId: item?.productBrandId ? parseInt(item.productBrandId) : undefined,
                    productCategoryId: item?.productCategoryId ? parseInt(item.productCategoryId) : undefined,
                    productId: item?.productId ? parseInt(item.productId) : undefined,
                    qty: item?.qty ? parseFloat(item.qty) : 0.000,
                    stockQty: item?.stockQty ? parseFloat(item.stockQty) : 0.000,
                    price: item?.price ? parseFloat(item.price) : 0.000,
                    uomId: item?.uomId ? parseInt(item.uomId) : undefined,

                    Stock: {
                        create: {
                            inOrOut: "Out",
                            productId: item?.productId ? parseInt(item.productId) : undefined,
                            qty: 0 - parseFloat(item.qty),
                            branchId: parseInt(salesBill.branchId),
                            uomId: item?.uomId ? parseInt(item.uomId) : undefined,

                        }
                    }
                }
            })
        }
    })
    return Promise.all(promises)
}

async function update(id, body) {
    let data
    const { dueDate, address, place, salesBillItems, companyId, branchId, active, name, contactMobile } = await body
    const dataFound = await prisma.salesBill.findUnique({
        where: {
            id: parseInt(id)
        }
    })
    if (!dataFound) return NoRecordFound("salesBill");
    await prisma.$transaction(async (tx) => {
        data = await tx.salesBill.update({
            where: {
                id: parseInt(id),
            },
            data: {
                address, place,
                companyId: parseInt(companyId), active,
                dueDate: dueDate ? new Date(dueDate) : undefined,
                branchId: parseInt(branchId),
                name,
                contactMobile: contactMobile ? parseInt(contactMobile) : undefined,
            },
            include: {
                SalesBillItems: true
            }
        })
        await updateSalesBillItems(tx, salesBillItems, data)
    })
    return { statusCode: 0, data };
};

async function remove(id) {
    const data = await prisma.salesBill.delete({
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