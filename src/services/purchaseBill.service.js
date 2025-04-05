import { PrismaClient } from '@prisma/client'
import { NoRecordFound } from '../configs/Responses.js';
import { exclude, getDateFromDateTime, getDateTimeRangeForCurrentYear, getYearShortCode } from '../utils/helper.js';
import { getTableRecordWithId } from '../utils/helperQueries.js';


const prisma = new PrismaClient()


async function getNextDocId(branchId) {
    const { startTime, endTime } = getDateTimeRangeForCurrentYear(new Date());
    let lastObject = await prisma.purchaseBill.findFirst({
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
    let newDocId = `${branchObj.branchCode}/${getYearShortCode(new Date())}/PB/1`
    // let newDocId = `PB/1`

    if (lastObject) {
        newDocId = `${branchObj.branchCode}/${getYearShortCode(new Date())}/PB/${parseInt(lastObject.docId.split("/").at(-1)) + 1}`
        // newDocId = `PB/${parseInt(lastObject.docId.split("/").at(-1)) + 1}`

    }
    return newDocId
}

function manualFilterSearchData(searchBillDate, searchSupplierDcDate, searchSupplierDcNo, data) {
    return data.filter(item =>
        (searchBillDate ? String(getDateFromDateTime(item.createdAt)).includes(searchBillDate) : true) &&
        (searchSupplierDcDate ? String(getDateFromDateTime(item.dueDate)).includes(searchSupplierDcDate) : true) &&
        (searchSupplierDcNo ? String(item.supplierDcNo).includes(searchSupplierDcNo) : true)
    )
}

async function get(req) {
    const { companyId, fromDate, toDate, purchaseReport, filterSupplier, active, branchId, pagination, pageNumber, dataPerPage, searchDocId, searchBillDate, searchSupplierName, searchSupplierDcNo, searchSupplierDcDate } = req.query

    let data;
    //     if (purchaseReport) {
    //         data = await prisma.$queryRaw`

    // SELECT 
    //     party.name AS PartyName,
    //    po.supplierDcNo AS PartyInvoiceNo,
    //    po.createdAt as PurchaseDate,
    //    pobill.price AS Amount


    // FROM
    // PurchaseBill po
    // LEFT JOIN
    // PoBillItems pobill ON pobill.purchaseBillId=po.id
    // LEFT JOIN
    // party ON party.id = po.supplierId      
    // LEFT JOIN
    // branch ON branch.id = po.branchId
    // WHERE
    // po.branchId = ${branchId} AND po.createdAt BETWEEN ${fromDate} AND ${toDate}
    // GROUP BY  party.name, branch.branchName,po.supplierDcNo,po.createdAt, pobill.price;

    //         `;
    //         return { statusCode: 0, data };
    //     }

    data = await prisma.purchaseBill.findMany({
        where: {
            companyId: companyId ? parseInt(companyId) : undefined,
            active: active ? Boolean(active) : undefined,
            docId: Boolean(searchDocId) ?
                {
                    contains: searchDocId
                }
                : undefined,
            supplier: {
                name: Boolean(searchSupplierName) ? { contains: searchSupplierName } : undefined
            }
        },
        include: {
            supplier: {
                select: {
                    name: true
                }
            }
        }
    });


    data = manualFilterSearchData(searchBillDate, searchSupplierDcDate, searchSupplierDcNo, data)
    const totalCount = data.length

    if (pagination) {
        data = data.slice(((pageNumber - 1) * parseInt(dataPerPage)), pageNumber * dataPerPage)
    }
    let newDocId = await getNextDocId(branchId)

    return { statusCode: 0, nextDocId: newDocId, data, totalCount };
}


async function getOne(id) {
    const childRecord = 0;
    const data = await prisma.purchaseBill.findUnique({
        where: {
            id: parseInt(id)
        },
        include: {
            PoBillItems: {
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
                    price: true,
                    uomId: true,
                    stockQty: true,
                    salePrice: true
                }
            }
        }
    })

    if (!data) return NoRecordFound("purchaseBill");
    data["PoBillItems"] = await (async function getReturnQty() {
        const promises = data["PoBillItems"].map(async (i) => {
            const sql = `
            SELECT COALESCE(SUM(QTY),0) as returnQty FROM PoReturnItems WHERE purchaseBillItemsId=${i.id}
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
    const data = await prisma.purchaseBill.findMany({
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
async function createpoBillItems(tx, poBillItems, purchaseBill) {

    const promises = poBillItems.map(async (item) => {
        return await tx.poBillItems.create({
            data: {
                purchaseBillId: parseInt(purchaseBill.id),
                productBrandId: item?.productBrandId ? parseInt(item.productBrandId) : undefined,
                productCategoryId: item?.productCategoryId ? parseInt(item.productCategoryId) : undefined,
                productId: item?.productId ? parseInt(item.productId) : undefined,
                qty: item?.qty ? parseFloat(item.qty) : 0.000,
                price: item?.price ? parseFloat(item.price) : 0.000,
                uomId: item?.uomId ? parseFloat(item.uomId) : undefined,
                stockQty: item?.stockQty ? parseFloat(item.stockQty) : undefined,
                salePrice: item?.salePrice ? parseFloat(item.salePrice) : 0.000,

                Stock: {
                    create: {
                        inOrOut: "In",
                        productId: item?.productId ? parseInt(item.productId) : undefined,
                        qty: parseFloat(item.qty),
                        branchId: parseInt(purchaseBill.branchId),
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
    const { supplierId, dueDate, address, place, poBillItems, supplierDcNo, companyId, active, branchId, netBillValue } = await body
    let newDocId = await getNextDocId(branchId)
    await prisma.$transaction(async (tx) => {
        data = await tx.purchaseBill.create(
            {
                data: {
                    docId: newDocId, supplierDcNo,
                    address, place, supplierId: parseInt(supplierId),
                    companyId: parseInt(companyId), active,
                    dueDate: dueDate ? new Date(dueDate) : undefined,
                    branchId: parseInt(branchId),
                    netBillValue: parseInt(netBillValue),

                }
            })
        await createpoBillItems(tx, poBillItems, data)

    })
    return { statusCode: 0, data };
}




async function updatePoBillItems(tx, poBillItems, purchaseBill) {
    let removedItems = purchaseBill.PoBillItems.filter(oldItem => {
        let result = poBillItems.find(newItem => newItem.id === oldItem.id)
        if (result) return false
        return true
    })

    let removedItemsId = removedItems.map(item => parseInt(item.id))

    await tx.PoBillItems.deleteMany({
        where: {
            id: {
                in: removedItemsId
            }
        }
    })

    const promises = poBillItems.map(async (item) => {
        if (item?.id) {
            return await tx.poBillItems.update({
                where: {
                    id: parseInt(item.id)
                },
                data: {
                    purchaseBillId: parseInt(purchaseBill.id),
                    productBrandId: item?.productBrandId ? parseInt(item.productBrandId) : undefined,
                    productCategoryId: item?.productCategoryId ? parseInt(item.productCategoryId) : undefined,
                    productId: item?.productId ? parseInt(item.productId) : undefined,
                    qty: item?.qty ? parseFloat(item.qty) : 0.000,
                    price: item?.price ? parseFloat(item.price) : 0.000,
                    uomId: item?.uomId ? parseFloat(item.uomId) : undefined,
                    stockQty: item?.stockQty ? parseFloat(item.stockQty) : undefined,
                    salePrice: item?.salePrice ? parseFloat(item.salePrice) : 0.000,
                    Stock: {
                        update: {
                            inOrOut: "In",
                            productId: item?.productId ? parseInt(item.productId) : undefined,
                            qty: parseFloat(item.qty),
                            branchId: parseInt(purchaseBill.branchId),
                            uomId: item?.uomId ? parseInt(item.uomId) : undefined,
                            salePrice: item?.salePrice ? parseFloat(item.salePrice) : 0.000,
                        }
                    }
                }
            })
        } else {
            return await tx.poBillItems.create({
                data: {
                    purchaseBillId: parseInt(purchaseBill.id),
                    productBrandId: item?.productBrandId ? parseInt(item.productBrandId) : undefined,
                    productCategoryId: item?.productCategoryId ? parseInt(item.productCategoryId) : undefined,
                    productId: item?.productId ? parseInt(item.productId) : undefined,
                    qty: item?.qty ? parseFloat(item.qty) : 0.000,
                    price: item?.price ? parseFloat(item.price) : 0.000,
                    Stock: {
                        create: {
                            inOrOut: "In",
                            productId: item?.productId ? parseInt(item.productId) : undefined,
                            qty: parseFloat(item.qty),
                            branchId: parseInt(purchaseBill.branchId),
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
    const { supplierId, dueDate, address, place, poBillItems, companyId, supplierDcNo, branchId, active, netBillValue } = await body
    const dataFound = await prisma.purchaseBill.findUnique({
        where: {
            id: parseInt(id)
        }
    })
    if (!dataFound) return NoRecordFound("purchaseBill");
    await prisma.$transaction(async (tx) => {
        data = await tx.purchaseBill.update({
            where: {
                id: parseInt(id),
            },
            data: {
                address, place, supplierId: parseInt(supplierId), supplierDcNo,
                companyId: parseInt(companyId), active,
                dueDate: dueDate ? new Date(dueDate) : undefined,
                branchId: parseInt(branchId),
                netBillValue: parseInt(netBillValue),

            },
            include: {
                PoBillItems: true
            }
        })
        await updatePoBillItems(tx, poBillItems, data)
    })
    return { statusCode: 0, data };
};

async function remove(id) {
    const data = await prisma.purchaseBill.delete({
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