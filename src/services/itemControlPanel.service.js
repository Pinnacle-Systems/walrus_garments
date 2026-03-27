import { NoRecordFound } from '../configs/Responses.js';
import { prisma } from '../lib/prisma.js';

const DEFAULT_BARCODE_GENERATION_METHOD = "STANDARD";

function withResolvedBarcodeGenerationMethod(record) {
    if (!record) return record;
    return {
        ...record,
        barcodeGenerationMethod: record.barcodeGenerationMethod || DEFAULT_BARCODE_GENERATION_METHOD,
    };
}

async function get(req) {
    const data = await prisma.ItemControlPanel.findMany();
    return { statusCode: 0, data: data.map(withResolvedBarcodeGenerationMethod) };
}


async function getOne(id) {
    const childRecord = 0;
    const data = await prisma.ItemControlPanel.findUnique({
        where: {
            id: parseInt(id)
        }
    })
    if (!data) return NoRecordFound("size");
    return { statusCode: 0, data: { ...withResolvedBarcodeGenerationMethod(data), ...{ childRecord } } };
}

async function getSearch(req) {
    const data = await prisma.ItemControlPanel.findMany();
    return { statusCode: 0, data: data.map(withResolvedBarcodeGenerationMethod) };
}

async function create(body) {
    const { field1, field2, field3, field4, field5, sectionType, barcodeGenerationMethod } = await body
    const data = await prisma.ItemControlPanel.create(
        {
            data: {
                sectionType: sectionType ? Boolean(sectionType) : false,
                barcodeGenerationMethod: barcodeGenerationMethod || DEFAULT_BARCODE_GENERATION_METHOD,
                field1: field1 ? field1 : undefined,
                field2: field2 ? field2 : undefined,
                field3: field3 ? field3 : undefined,
                field4: field4 ? field4 : undefined,
                field5: field5 ? field5 : undefined
            }
        }
    )
    return { statusCode: 0, data: withResolvedBarcodeGenerationMethod(data) };
}

async function update(id, body) {
    const { field1, field2, field3, field4, field5, sectionType, barcodeGenerationMethod } = await body
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
            barcodeGenerationMethod: barcodeGenerationMethod || DEFAULT_BARCODE_GENERATION_METHOD,
            field1: field1 ? field1 : "",
            field2: field2 ? field2 : '',
            field3: field3 ? field3 : "",
            field4: field4 ? field4 : "",
            field5: field5 ? field5 : "",

        },
    })
    return { statusCode: 0, data: withResolvedBarcodeGenerationMethod(data) };
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
