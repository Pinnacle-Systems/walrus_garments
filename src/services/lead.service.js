import { PrismaClient } from '@prisma/client'
import { NoRecordFound } from '../configs/Responses.js';
import { getDateTimeRangeForCurrentYear, getYearShortCode } from '../utils/helper.js';
import { getTableRecordWithId } from '../utils/helperQueries.js';


const prisma = new PrismaClient()


async function getNextDocId(branchId) {
    const { startTime, endTime } = getDateTimeRangeForCurrentYear(new Date());
    let lastObject = await prisma.leadForm.findFirst({
        where: {
            branchId: parseInt(branchId),
            AND: [
                {
                    createdAt: {
                        gte: startTime

                    }
                },
                {
                    createdAt: {
                        lte: endTime
                    }
                }
            ],
        },
        orderBy: {
            id: 'desc'
        }
    });
    const branchObj = await getTableRecordWithId(branchId, "branch")
    let newDocId = `${branchObj.branchCode}/${getYearShortCode(new Date())}/LD/1`
    // let newDocId = `PB/1`

    if (lastObject) {
        newDocId = `${branchObj.branchCode}/${getYearShortCode(new Date())}/LD/${parseInt(lastObject.docId.split("/").at(-1)) + 1}`
        // newDocId = `PB/${parseInt(lastObject.docId.split("/").at(-1)) + 1}`

    }
    return newDocId
}

function manualFilterSearchData(searchBillDate, data) {
    return data.filter(item =>
        (searchBillDate ? String(getDateFromDateTime(item.createdAt)).includes(searchBillDate) : true)

    )
}

function filterData(status, data) {



    if (status == "Leads") {
        return data.filter(item => !(item?.Quotes))
    }
    if (status == "Quotes") {
        return data.filter(item => (item?.Quotes && (new Date(item?.Quotes?.updatedAt).getTime() === new Date(item?.Quotes?.createdAt).getTime())))
    }
    if (status == "Revision") {

        return data.filter(item => (item?.Quotes && (new Date(item?.Quotes?.updatedAt).getTime() !== new Date(item?.Quotes?.createdAt).getTime()) && !item?.Quotes?.projectId))
    }
    if (status == "InProgress") {
        return data.filter(item => item?.Quotes?.projectId)
    }

}

async function get(req) {
    const { companyId, active, branchId, pagination, pageNumber, dataPerPage, searchDocId, searchBillDate, status, searchClientName, searchLocation, searchContact } = req.query

    let data;
    let totalCount;

    if (pagination) {
        data = await prisma.leadForm.findMany({
            where: {
                companyId: companyId ? parseInt(companyId) : undefined,
                active: active ? Boolean(active) : undefined,

                docId: Boolean(searchDocId) ?
                    {
                        contains: searchDocId
                    }
                    : undefined,
                location: Boolean(searchLocation) ?
                    {
                        contains: searchLocation
                    }
                    : undefined,
                contact: Boolean(searchContact) ?
                    {

                        equals: BigInt(searchContact)

                    }
                    : undefined,
                Party: {
                    name: Boolean(searchClientName) ? { contains: searchClientName } : undefined
                },
            },
            include: {
                Party: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                Quotes: true
            }

        });
        data = manualFilterSearchData(searchBillDate, data);
        totalCount = data.length
        data = data.slice(((pageNumber - 1) * parseInt(dataPerPage)), pageNumber * dataPerPage)
    }

    else {
        data = await prisma.leadForm.findMany({
            where: {
                companyId: companyId ? parseInt(companyId) : undefined,
                active: active ? Boolean(active) : undefined,
                docId: Boolean(searchDocId) ?
                    {
                        contains: searchDocId
                    }
                    : undefined,

            },
            include: {
                Party: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                Quotes: true
            }


        });

        if (status) {
            data = filterData(status, data)
        }


    }
    let newDocId = await getNextDocId(branchId)

    return { statusCode: 0, nextDocId: newDocId, data, totalCount };
}


async function getOne(id) {
    const childRecord = 0;
    const data = await prisma.leadForm.findUnique({
        where: {
            id: parseInt(id)
        },
        include: {
            Branch: {
                select: {
                    branchName: true,
                    contactName: true,
                    contactMobile: true,
                    contactEmail: true
                }
            }
        }
    })

    if (!data) return NoRecordFound("leadForm");

    return { statusCode: 0, data: { ...data, ...{ childRecord } } };
}

async function getSearch(req) {
    const { searchKey } = req.params
    const { companyId, active } = req.query
    const data = await prisma.leadForm.findMany({
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
    let data;
    const { name, referenceName, contact, location, phone, reason, workDescription, companyId, active, branchId, clientId, isClient = true, comment, dueDate, contactPersonName } = await body
    let newDocId = await getNextDocId(branchId)

    data = await prisma.leadForm.create(
        {
            data: {
                docId: newDocId, name, workDescription, comment, reason: reason ? reason : "",
                dueDate: dueDate ? new Date(dueDate) : undefined,
                contact: contact ? parseInt(contact) : undefined, location, active,
                companyId: parseInt(companyId),
                branchId: parseInt(branchId),
                clientId: parseInt(clientId), referenceName, contactPersonName,



            }
        })


    const dataFound = await prisma.party.findUnique({
        where: {
            id: parseInt(clientId)
        },
        include: {

            City: {
                select: {
                    name: true,
                    state: true
                }
            },
            PriceDetails: {
                select: {
                    productId: true,
                    price: true,
                    Product: {
                        select: {
                            name: true,
                        }
                    }
                }
            },
            ShippingAddress: {
                select: {
                    id: true,
                    address: true
                }
            },
            contactDetails: {
                select: {
                    id: true,
                    contactPersonName: true,
                    mobileNo: true,
                    email: true
                }
            }
        }
    })
    if (!dataFound) return NoRecordFound("party");

    let contactData = dataFound?.contactDetails?.find(val => val.contactPersonName == contactPersonName)


    if (contactData) {

        await prisma.contactDetails.update({
            where: {
                id: parseInt(contactData.id)
            },
            data: {
                mobileNo: contact ? contact.toString() : ""
            }
        })
    }
    else {

        await prisma.party.update({
            where: {
                id: parseInt(clientId),
            },
            data: {
                address: location, isClient, contactPersonName,
                contactMobile: contact ? contact.toString() : ""
            }
        })
    }

    return { statusCode: 0, data };
}


async function update(id, body) {
    let data
    const { name, contactPersonName, contact, phone, location, reason, referenceName, workDescription, active, status, clientId, isClient = true, comment, dueDate } = await body
    const dataFound = await prisma.leadForm.findUnique({
        where: {
            id: parseInt(id)
        }
    })
    if (!dataFound) return NoRecordFound("leadForm");

    data = await prisma.leadForm.update({
        where: {
            id: parseInt(id),
        },
        data: {
            name, workDescription, comment, referenceName, reason: reason ? reason : "",
            dueDate: dueDate ? new Date(dueDate) : undefined,
            contact: contact ? parseInt(contact) : undefined,
            location, active,
            status, contactPersonName,
            clientId: parseInt(clientId),
        }
    })

    const partyData = await prisma.party.findUnique({
        where: {
            id: parseInt(clientId)
        },
        include: {

            City: {
                select: {
                    name: true,
                    state: true
                }
            },
            PriceDetails: {
                select: {
                    productId: true,
                    price: true,
                    Product: {
                        select: {
                            name: true,
                        }
                    }
                }
            },
            ShippingAddress: {
                select: {
                    id: true,
                    address: true
                }
            },
            contactDetails: {
                select: {
                    id: true,
                    contactPersonName: true,
                    mobileNo: true,
                    email: true
                }
            }
        }
    })
    if (!partyData) return NoRecordFound("party");

    let contactData = partyData?.contactDetails?.find(val => val.contactPersonName === contactPersonName)


    if (contactData) {


        await prisma.contactDetails.update({
            where: {
                id: parseInt(contactData.id)
            },
            data: {
                mobileNo: contact ? contact.toString() : ""
            }
        })
    }
    else {


        await prisma.party.update({
            where: {
                id: parseInt(clientId),
            },
            data: {
                address: location, isClient, contactPersonName,
                contactMobile: contact ? contact.toString() : ""


            }
        })
    }

    return { statusCode: 0, data };
};

async function remove(id) {
    const data = await prisma.leadForm.delete({
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