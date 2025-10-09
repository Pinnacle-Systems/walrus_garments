import { NoRecordFound } from '../configs/Responses.js';
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function get(req) {
    const { companyId, active } = req.query
    const data = await prisma.ExcessTolerance.findMany({
        include: {
            ExcessToleranceItems: true
        }
    });
    return { statusCode: 0, data };
}


async function getOne(id) {
    const childRecord = 0;
    const data = await prisma.ExcessTolerance.findUnique({
        where: {
            id: parseInt(id)
        },
        include: {
            ExcessToleranceItems: true
        }

    })
    if (!data) return NoRecordFound("counts");
    return { statusCode: 0, data: { ...data, ...{ childRecord } } };
}

export async function getToleranceItems(req) {
    const { companyId, active } = req.query
    const data = await prisma.ExcessToleranceItems.findMany({

    });
    return { statusCode: 0, data };
}

export async function getExcessToleranceItems(req) {
    const { companyId, active, materialId, poMaterial, excessType, orderType ,applyon} = req.query;
    let data;

    data = await prisma.ExcessToleranceItems.findMany({});
    
    console.log(data?.filter(item =>
             item?.materialId == materialId 
          &&   item?.excessType == excessType 
         &&    item?.orderType == orderType
        )
         ,"data")

    if (materialId && excessType && orderType &&  applyon) {
        data = data?.filter(item =>
            ( item?.materialId == materialId) &&
            ( item?.excessType == excessType) &&
            ( item?.orderType == orderType)  && 
             ( item?.applyon == applyon) 
        );
    }



    if (poMaterial) {
        const lowerMaterial = poMaterial.toLowerCase();
        data = data?.filter(item => item?.material?.toLowerCase() === lowerMaterial);
    }

    return { statusCode: 0, data, id: data?.[0]?.excessToleranceId };
}



async function getSearch(req) {
    const { searchKey } = req.params
    const { companyId, active } = req.query
    const data = await prisma.ExcessTolerance.findMany({

    })
    return { statusCode: 0, data: data };
}

async function create(body) {
    const { transaction, excessType, toleranceItems, materialId } = body; // no await needed


    const data = await prisma.ExcessTolerance.create({
        data: {
            materialId: materialId ? parseInt(materialId) : undefined,
            ExcessToleranceItems: {
                createMany: toleranceItems.length > 0
                    ? {
                        data: toleranceItems.map((temp) => ({
                            excessType: temp.excessType ? temp.excessType : undefined,
                            orderType: temp.orderType ? temp.orderType : undefined,
                            roundOfType: temp.roundOfType ? temp.roundOfType : "",
                            qty: temp?.qty ? temp?.qty : undefined,
                            from: temp?.from ? temp?.from : undefined,
                            to: temp?.to ? temp?.to : undefined,
                            excessQty: temp?.excessQty ? temp?.excessQty : undefined,
                            active: temp?.active ? temp?.active : false,
                            materialId: temp?.materialId ? parseInt(temp?.materialId) : "",
                            material: temp?.material ? temp?.material : undefined,
                            bagweight: temp?.bagweight ? temp?.bagweight : undefined,
                            applyon: temp?.applyon ? temp?.applyon : undefined,
                        })),
                    }
                    : undefined,
            },
        },

    });

    return { statusCode: 0, data };
}

async function update(id, body) {
    const { transaction, excessType, toleranceItems, materialId } = await body
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
        data: {
            materialId: materialId ? parseInt(materialId) : undefined,
            ExcessToleranceItems: {
                deleteMany: {},
                createMany: toleranceItems.length > 0
                    ? {
                        data: toleranceItems.map((temp) => ({
                            excessType: temp.excessType ? temp.excessType : undefined,
                            orderType: temp.orderType ? temp.orderType : undefined,
                            roundOfType: temp.roundOfType ? temp.roundOfType : "",
                            qty: temp?.qty ? temp?.qty : undefined,
                            from: temp?.from ? temp?.from : undefined,
                            to: temp?.to ? temp?.to : undefined,
                            excessQty: temp?.excessQty ? temp?.excessQty : undefined,
                            active: temp?.active ? temp?.active : false,
                            materialId: temp?.materialId ? parseInt(temp?.materialId) : "",
                            material: temp?.material ? temp?.material : undefined,
                            bagweight: temp?.bagweight ? temp?.bagweight : undefined,
                            applyon: temp?.applyon ? temp?.applyon : undefined,


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
