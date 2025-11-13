import { NoRecordFound } from '../configs/Responses.js';
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function get(req) {
    const { companyId, active } = req.query
    const data = await prisma.StockReportControl.findMany({
        where: {
            companyId: companyId ? parseInt(companyId) : undefined,
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
    const { isStockReport } = await body
    const data = await prisma.StockReportControl.create(
        {
            data: {
                isStockReport
            }
        }
    )
    return { statusCode: 0, data };
}

async function update(id, body) {
    const { isStockReport } = await body
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
          isStockReport
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
