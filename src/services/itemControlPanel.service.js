import { NoRecordFound } from '../configs/Responses.js';
import { prisma } from '../lib/prisma.js';

async function get(req) {

    const { companyId, active } = req.query

    console.log(companyId, active, "companyId, active ")

    let data = await prisma.ItemControlPanel.findMany({
        where: {
            active: active ? Boolean(active) : undefined,
        }
    });



    return { statusCode: 0, data };
}


async function getOne(id) {
    const childRecord = 0;
    const data = await prisma.ItemControlPanel.findUnique({
        where: {
            id: parseInt(id)
        }
    })
    if (!data) return NoRecordFound("size");
    return { statusCode: 0, data: { ...data, ...{ childRecord } } };
}

async function getSearch(req) {
    const { searchKey } = req.params
    const { companyId, active, } = req.query
    const data = await prisma.ItemControlPanel.findMany({
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
    const { field1, field2, field3, field4, field5, sectionType, sizeWise, sizeColor } = await body
    const data = await prisma.ItemControlPanel.create(
        {
            data: {
                sectionType: sectionType ? Boolean(sectionType) : false,
                sizeWise: sizeWise ? Boolean(sizeWise) : false,
                size_color_wise: sizeColor ? sizeColor : false,
                field1: field1 ? field1 : undefined,
                field2: field2 ? field2 : undefined,
                field3: field3 ? field3 : undefined,
                field4: field4 ? field4 : undefined,
                field5: field5 ? field5 : undefined
            }
        }
    )
    return { statusCode: 0, data };
}

async function update(id, body) {
    const { field1, field2, field3, field4, field5, sectionType, sizeWise, sizeColor } = await body
    const dataFound = await prisma.ItemControlPanel.findUnique({
        where: {
            id: parseInt(id)
        }
    })
    if (!dataFound) return NoRecordFound("Section");
    const data = await prisma.ItemControlPanel.update({
        where: {
            id: parseInt(id),
        },
        data:
        {

            sectionType: sectionType ? Boolean(sectionType) : false,
            sizeWise: sizeWise ? Boolean(sizeWise) : false,
            size_color_wise: sizeColor ? sizeColor : false,
            field1: field1 ? field1 : "",
            field2: field2 ? field2 : '',
            field3: field3 ? field3 : "",
            field4: field4 ? field4 : "",
            field5: field5 ? field5 : ""

        },
    })
    return { statusCode: 0, data };
};

async function remove(id) {
    const data = await prisma.ItemControlPanel.delete({
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
