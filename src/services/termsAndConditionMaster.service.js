import { NoRecordFound } from '../configs/Responses.js';
import { prisma } from '../lib/prisma.js';

async function get(req) {
    const { companyId, active, poType } = req.query
    let data = await prisma.termsAndConditionsNew.findMany({
        where: {
            active: active ? Boolean(active) : undefined,
        },
        include: {
            _count: {
                select: {
                    Quotation: true,
                    Saleorder: true,
                    SalesDelivery: true
                }
            }
        }
    });

    data = data.map((item) => {
        const types = [];

        if (item._count.Quotation) types.push("Quotation");
        if (item._count.Saleorder) types.push("Saleorder");
        if (item._count.SalesDelivery) types.push("SalesDelivery");

        return {
            ...item,
            referencedIn: types.join(", ")

        };
    });


    return { statusCode: 0, data };
}


async function getOne(id) {
    const childRecord = await prisma.quotation.count({ where: { termId: parseInt(id) } });
    const data = await prisma.termsAndConditionsNew.findUnique({
        where: {
            id: parseInt(id)
        }
    })
    if (!data) return NoRecordFound("termsAndConditions");
    return { statusCode: 0, data: { ...data, ...{ childRecord } } };
}

async function getSearch(req) {
    const { companyId, active } = req.query
    const { searchKey } = req.params
    const data = await prisma.termsAndConditionsNew.findMany({
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
    const { name, termsAndCondition, active } = await body
    const data = await prisma.termsAndConditionsNew.create({
        data: {
            termsAndCondition, active, name
        },
    });
    return { statusCode: 0, data };
}

async function update(id, body) {
    const { termsAndCondition, active, name } = await body
    const dataFound = await prisma.termsAndConditionsNew.findUnique({
        where: {
            id: parseInt(id)
        }
    })
    if (!dataFound) return NoRecordFound("termsAndConditions");
    const data = await prisma.termsAndConditionsNew.update({
        where: {
            id: parseInt(id),
        },
        data: {
            termsAndCondition, active, name
        },
    })
    return { statusCode: 0, data };
};

async function remove(id) {
    const data = await prisma.termsAndConditionsNew.delete({
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
