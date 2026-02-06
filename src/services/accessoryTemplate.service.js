import { NoRecordFound } from '../configs/Responses.js';
import {prisma} from "../lib/prisma.js";

async function get(req) {
    const { companyId, active } = req.query
    const data = await prisma.AccessoryTemplate.findMany({
        where: {
            active: active ? Boolean(active) : undefined,
        }
    });
    return { statusCode: 0, data };
}


async function getOne(id) {
    const childRecord = 0;
    const data = await prisma.accessoryTemplate.findUnique({
        where: {
            id: parseInt(id)
        },
        include : {
            AccessoryTemplateItems : {
                select  : {
                    id : true,
                    accessoryId : true,
                    accessoryCategoryId : true,
                    accessoryGroupId : true,
                    colorId : true,
                    sizeId : true,
                    accessoryTemplateId : true,
                    active  : true,
                    Accessory : {
                        select : {
                            aliasName : true,
                        }
                    },
                    AccessoryCategory : {
                        select : {
                            name : true,
                        }
                    },
                    AccessoryGroup : {
                        select : {
                            name : true,
                        }
                    },
                    Size : {
                        select : {
                            name : true,
                        }
                    },
                    Color : {
                        select : {
                            name : true,
                        }
                    },
                    
                }
            }
        }
    })
    if (!data) return NoRecordFound("accessoryGroup");
    return { statusCode: 0, data: { ...data, ...{ childRecord } } };
}

async function getSearch(req) {
    const { searchKey } = req.params
    const { companyId, active } = req.query
    const data = await prisma.AccessoryTemplate.findMany({
        where: {
            companyId: companyId ? parseInt(companyId) : undefined,
            active: active ? Boolean(active) : undefined,
            OR: [
                {
                    name: {
                        contains: searchKey,
                    },
                }
            ],
        }
    })
    return { statusCode: 0, data: data };
}

async function create(body) {
    const { name, templateItems, companyId, active } = await body
    const data = await prisma.AccessoryTemplate.create(
        {
            data: {
                templateName: name ? name : "",
                active: active ? Boolean(active) : false,
                AccessoryTemplateItems: templateItems?.length > 0
                    ? {
                        createMany: {
                            data: templateItems.map((sub) => ({
                                accessoryId: sub?.accessoryId ? parseInt(sub.accessoryId) : undefined,
                                accessoryCategoryId: sub?.accessoryCategoryId ? parseInt(sub.accessoryCategoryId) : undefined,
                                accessoryGroupId: sub?.accessoryGroupId ? parseInt(sub.accessoryGroupId) : undefined,
                                colorId: sub?.colorId ? parseInt(sub.colorId) : undefined,
                                sizeId: sub?.sizeId ? parseInt(sub.sizeId) : undefined,
                            })),
                        },
                    }
                    : undefined,
            }
        }
    )
    return { statusCode: 0, data };
}

async function update(id, body) {
    const { name, templateItems, companyId, active } = await body

    console.log(body,"body")

    const incomingIds = templateItems?.filter(i => i.id).map(i => parseInt(i.id));

    const dataFound = await prisma.AccessoryTemplate.findUnique({
        where: {
            id: parseInt(id)
        }
    })
    if (!dataFound) return NoRecordFound("accessoryGroup");
    const data = await prisma.AccessoryTemplate.update({
        where: {
            id: parseInt(id),
        },
        data:
        {
            templateName: name ? name : "",
            active: active ? Boolean(active) : false,

            AccessoryTemplateItems: {
                deleteMany: {
                    ...(incomingIds.length > 0 && {
                        id: { notIn: incomingIds }
                    })
                },

                update: templateItems
                    .filter(item => item.id)
                    .map((sub) => ({
                        where: { id: parseInt(sub.id) },
                        data: {
                            accessoryId: sub?.accessoryId ? parseInt(sub.accessoryId) : undefined,
                            accessoryCategoryId: sub?.accessoryCategoryId ? parseInt(sub.accessoryCategoryId) : undefined,
                            accessoryGroupId: sub?.accessoryGroupId ? parseInt(sub.accessoryGroupId) : undefined,
                            colorId: sub?.colorId ? parseInt(sub.colorId) : undefined,
                            sizeId: sub?.sizeId ? parseInt(sub.sizeId) : undefined,




                        },
                    })),

                create: templateItems
                    .filter(item => !item.id)
                    .map((sub) => ({
                        accessoryId: sub?.accessoryId ? parseInt(sub.accessoryId) : undefined,
                        accessoryCategoryId: sub?.accessoryCategoryId ? parseInt(sub.accessoryCategoryId) : undefined,
                        accessoryGroupId: sub?.accessoryGroupId ? parseInt(sub.accessoryGroupId) : undefined,
                        colorId: sub?.colorId ? parseInt(sub.colorId) : undefined,
                        sizeId: sub?.sizeId ? parseInt(sub.sizeId) : undefined,


                    })),
            }


            // AccessoryTemplateItems: item?.orderSizeDetails?.length > 0
            //     ? {
            //         createMany: {
            //             data: item.orderSizeDetails.map((sub) => ({
            //                 sizeId: sub?.sizeId ? parseInt(sub.sizeId) : undefined,
            //                 sizeMeasurement: sub?.sizeMeasurement || undefined,
            //                 qty: sub?.qty ? parseFloat(sub.qty) : undefined,
            //                 weight: sub?.weight ? parseFloat(sub.weight) : undefined,
            //                 uomId: sub?.uomId ? parseFloat(sub.uomId) : undefined,
            //             })),
            //         },
            //     }
            //     : undefined,
        },
    })
    return { statusCode: 0, data };
};

async function remove(id) {
    const data = await prisma.accessoryTemplate.delete({
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
