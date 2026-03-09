import { NoRecordFound } from '../configs/Responses.js';
import { prisma } from '../lib/prisma.js';

async function get(req) {
    const { companyId, active } = req.query
    const data = await prisma.StockReportControl.findMany({
        where: {
            active: active ? Boolean(active) : undefined,
        }
    });
    return { statusCode: 0, data };
}


async function getOne(id) {
    const childRecord = 0;
    const data = await prisma.StockReportControl.findUnique({
        where: {
            id: parseInt(id)
        }
    })
    if (!data) return NoRecordFound("StockReportControl");
    return { statusCode: 0, data: { ...data, ...{ childRecord } } };
}

async function getSearch(req) {
    const { searchKey } = req.params
    const { companyId, active } = req.query
    const data = await prisma.counts.findMany({
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
    const { itemWise, sizeWise, sizeColorWise, stockReports, field6, field7, field8, field9, field10 } = await body
    const data = await prisma.StockReportControl.create(
        {
            data: {
                itemWise: itemWise ? Boolean(itemWise) : false,
                sizeWise: sizeWise ? Boolean(sizeWise) : false,
                sizeColorWise: sizeColorWise ? Boolean(sizeColorWise) : false,
                field1: stockReports?.field1 ? stockReports?.field1 : "",
                field2: stockReports?.field2 ? stockReports?.field2 : "",
                field3: stockReports?.field3 ? stockReports?.field3 : "",
                field4: stockReports?.field4 ? stockReports?.field4 : "",
                field5: stockReports?.field5 ? stockReports?.field5 : "",
                field6: field6 ? field6 : "",
                field7: field7 ? field7 : "",
                field8: field8 ? field8 : "",
                field9: field9 ? field9 : "",
                field10: field10 ? field10 : "",
            }
        }
    )
    return { statusCode: 0, data };
}

async function update(id, body) {
    const { itemWise, sizeWise, sizeColorWise, stockReports, field6, field7, field8, field9, field10 } = await body
    const dataFound = await prisma.StockReportControl.findUnique({
        where: {
            id: parseInt(id)
        }
    })
    if (!dataFound) return NoRecordFound("StockReportControl");
    const data = await prisma.StockReportControl.update({
        where: {
            id: parseInt(id),
        },
        data:
        {
            itemWise: itemWise ? Boolean(itemWise) : false,
            sizeWise: sizeWise ? Boolean(sizeWise) : false,
            sizeColorWise: sizeColorWise ? Boolean(sizeColorWise) : false,
            field1: stockReports?.field1 ? stockReports?.field1 : "",
            field2: stockReports?.field2 ? stockReports?.field2 : "",
            field3: stockReports?.field3 ? stockReports?.field3 : "",
            field4: stockReports?.field4 ? stockReports?.field4 : "",
            field5: stockReports?.field5 ? stockReports?.field5 : "",
            field6: field6 ? field6 : "",
            field7: field7 ? field7 : "",
            field8: field8 ? field8 : "",
            field9: field9 ? field9 : "",
            field10: field10 ? field10 : "",
        },
    })
    return { statusCode: 0, data };
};

async function remove(id) {
    const data = await prisma.StockReportControl.delete({
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
