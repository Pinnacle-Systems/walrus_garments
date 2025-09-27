import { NoRecordFound } from '../configs/Responses.js';
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function get(req) {
    const { companyId, active } = req.query
    const data = await prisma.ExcessTolerance.findMany({
        
    });
    return { statusCode: 0, data };
}


async function getOne(id) {
    const childRecord = 0;
    const data = await prisma.ExcessTolerance.findUnique({
        where: {
            id: parseInt(id)
        },
        include : {
                ExcessToleranceItems : true
            
        }
    })
    if (!data) return NoRecordFound("counts");
    return { statusCode: 0, data: { ...data, ...{ childRecord } } };
}

async function getSearch(req) {
    const { searchKey } = req.params
    const { companyId, active } = req.query
    const data = await prisma.ExcessTolerance.findMany({
      
    })
    return { statusCode: 0, data: data };
}

async function create(body) {
    const { transaction, excessType, toleranceItems , active} = await body
    const data = await prisma.ExcessTolerance.create(
        {
            data: {
                transaction, excessType,active,
                ExcessToleranceItems: {
                    createMany: toleranceItems?.length > 0 ? {
                        data: toleranceItems?.map((temp) => {
                            let newItem = {}
                            newItem["fromTolerance"] = temp["fromTolerance"] ? parseFloat(temp["fromTolerance"]) : null;
                            newItem["toTolerance"] = temp["toTolerance"] ? parseFloat(temp["toTolerance"]) : null;
                            newItem["qty"] = temp["qty"] ? parseFloat(temp["qty"]) : null;
                            newItem["notes"] = temp["notes"] ? parseFloat(temp["notes"]) : null;


                            return newItem
                        })
                    } : undefined
                }
            }
        }
    )
    return { statusCode: 0, data };
}

async function update(id, body) {
    const { transaction, excessType, toleranceItems , active} = await body
    const dataFound = await prisma.ExcessTolerance.findUnique({
        where: {
            id: parseInt(id)
        }
    })
    if (!dataFound) return NoRecordFound("counts");
    const data = await prisma.ExcessTolerance.update({
        where: {
            id: parseInt(id),
        },
        data:
        {
            transaction, excessType,active,
            ExcessToleranceItems: {
                deleteMany: {},
                createMany: toleranceItems.length > 0
                    ? {
                        data: toleranceItems.map((temp) => ({
                            fromTolerance: temp.fromTolerance ? parseFloat(temp.fromTolerance) : undefined,
                            toTolerance: temp.toTolerance ? parseFloat(temp.toTolerance) : undefined,
                            qty: temp.qty ? parseFloat(temp.qty) : "",
                            notes: temp.notes ? parseFloat(temp.notes) : "",


                        })),
                    }
                    : undefined,
            },
        },
    })
    return { statusCode: 0, data };
};

async function remove(id) {
    const data = await prisma.ExcessTolerance.delete({
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
