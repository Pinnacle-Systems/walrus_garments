import { NoRecordFound } from '../configs/Responses.js';
import { prisma } from '../lib/prisma.js';

async function get(req) {
    const { companyId, active } = req.query
    const data = await prisma.partyContactDetails.findMany({


        where: {
            active: active ? Boolean(active) : undefined,
        }
    });

    return { statusCode: 0, data };
}


async function getOne(id) {
    const childRecord = 0;
    const data = await prisma.partyContactDetails.findUnique({
        where: {
            id: parseInt(id)
        }
    })
    if (!data) return NoRecordFound("counts");
    return { statusCode: 0, data: { ...data, ...{ childRecord } } };
}

async function getSearch(req) {
    const { searchKey } = req.params
    const { companyId, active } = req.query
    const data = await prisma.partyBranch.findMany({
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

    const {  contactPersonName, designation , department  , contactNumber , partyId , contactPersonEmail } = await body
    const data = await prisma.partyContactDetails.create(
        {
            data: {
              contactPersonName :  contactPersonName  ? contactPersonName : undefined  ,
              mobileNo  :   contactNumber  ? contactNumber   : undefined  ,
              Designation  :   designation   ?   designation : undefined  ,
              department  :    department   ?   department  : undefined  ,
              partyId   :  partyId   ?  parseInt(partyId)   : undefined   ,
                email  :  contactPersonEmail  ?  contactPersonEmail   : undefined,


            }
        }
    )
    return { statusCode: 0, data };
}

async function update(id, body) {
    const {  contactPersonName, designation , department  , contactNumber , partyId , contactPersonEmail } = await body
    const dataFound = await prisma.partyContactDetails.findUnique({
        where: {
            id: parseInt(id)
        }
    })
    if (!dataFound) return NoRecordFound("partyBranch");
    const data = await prisma.partyContactDetails.update({
        where: {
            id: parseInt(id),
        },
        data:
        {
                contactPersonName :  contactPersonName  ? contactPersonName : undefined  ,
              mobileNo  :   contactNumber  ? contactNumber   : undefined  ,
              Designation  :   designation   ?   designation : undefined  ,
              department  :    department   ?   department  : undefined  ,
              partyId   :  partyId   ?  parseInt(partyId)   : undefined   ,
            email  :  contactPersonEmail  ?  contactPersonEmail   : undefined,

        },
    })
    return { statusCode: 0, data };
};

async function remove(id) {
    const data = await prisma.partyContactDetails.delete({
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
