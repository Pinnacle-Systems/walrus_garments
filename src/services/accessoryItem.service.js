import { NoRecordFound } from '../configs/Responses.js';

async function get(req) {
    const { companyId, active } = req.query
    const data = await prisma.accessoryItem.findMany({
        where: {
            companyId: companyId ? parseInt(companyId) : undefined,
            active: active ? Boolean(active) : undefined,
        }
    });
    return { statusCode: 0, data };
}


async function getOne(id) {
    const childRecord = 0;
    const data = await prisma.accessoryItem.findUnique({
        where: {
            id: parseInt(id)
        },
        include: {
            PartyOnAccessoryItems: true
        }
    })
    if (!data) return NoRecordFound("accessoryItem");
    return { statusCode: 0, data: { ...data, ...{ childRecord } } };
}

async function getSearch(req) {
    const { companyId, active } = req.query
    const { searchKey } = req.params
    const data = await prisma.accessoryItem.findMany({
        where: {
            country: {
                companyId: companyId ? parseInt(companyId) : undefined,
            },
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
    const { name, accessoryGroupId, active, companyId, partySuppliesItem } = await body
    const data = await prisma.accessoryItem.create({
        data: {
            name,
            active, companyId: companyId  ?  parseInt(companyId) :  undefined,
            accessoryGroupId : accessoryGroupId ? parseInt(accessoryGroupId) : 4,
            // PartyOnAccessoryItems: partySuppliesItem ? {
            //     createMany: {
            //         data: partySuppliesItem.map(party => { return { partyId: party } })
            //     }
            // } : undefined
        },
    });
    return { statusCode: 0, data };
}

async function update(id, body) {
    const { name, accessoryGroupId, active, companyId, partySuppliesItem } = await body
    const dataFound = await prisma.accessoryItem.findUnique({
        where: {
            id: parseInt(id)
        }
    })
    if (!dataFound) return NoRecordFound("accessoryItem");
    const data = await prisma.accessoryItem.update({
        where: {
            id: parseInt(id),
        },
        data: {
            name, 
            active, companyId: parseInt(companyId),
            // PartyOnAccessoryItems: partySuppliesItem ? {
            //     deleteMany: {},
            //     createMany: {
            //         data: partySuppliesItem.map(party => { return { partyId: party } })
            //     }
            // } : []
        },
    })
    return { statusCode: 0, data };
};

async function remove(id) {
    const data = await prisma.accessoryItem.delete({
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
