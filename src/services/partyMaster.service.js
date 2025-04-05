import { PrismaClient } from '@prisma/client'
import { NoRecordFound } from '../configs/Responses.js';
import { exclude, getRemovedItems } from '../utils/helper.js';


const prisma = new PrismaClient()


async function get(req) {
    const { companyId, active } = req.query


    const data = await prisma.party.findMany({
        where: {
            companyId: companyId ? parseInt(companyId) : undefined,
            active: active ? Boolean(active) : undefined,
        },
        include: {

            PartyOnAccessoryItems: true,


            City: {
                select: {
                    name: true,
                    state: true
                }
            },
        }

    });
    return { statusCode: 0, data };
}


async function getOne(id) {
    const childRecord = 0;
    const data = await prisma.party.findUnique({
        where: {
            id: parseInt(id)
        },
        include: {
            PartyOnProcess: true,
            PartyOnAccessoryItems: true,
            City: {
                select: {
                    name: true,
                    state: true
                }
            },
            // PriceDetails: {
            //     select: {
            //         productId: true,
            //         price: true,
            //         Product: {
            //             select: {
            //                 name: true,
            //             }
            //         }
            //     }
            // },
            // ShippingAddress: {
            //     select: {
            //         id: true,
            //         address: true
            //     }
            // },
            // contactDetails: {
            //     select: {
            //         id: true,
            //         contactPersonName: true,
            //         mobileNo: true,
            //         email: true
            //     }
            // }
        }
    })
    if (!data) return NoRecordFound("party");
    return { statusCode: 0, data: { ...data, ...{ childRecord } } };
}

async function getSearch(req) {
    const { searchKey } = req.params
    const { companyId, active } = req.query
    const data = await prisma.party.findMany({
        where: {
            companyId: companyId ? parseInt(companyId) : undefined,
            active: active ? Boolean(active) : undefined,
            OR: [
                {
                    name: {
                        contains: searchKey,
                    },
                },
                {
                    code: {
                        contains: searchKey,
                    },
                },
            ],
        }
    })
    return { statusCode: 0, data: data };
}



export async function upload(req) {
    const { id } = req.params

    const { isDelete } = req.body
    const data = await prisma.party.update({
        where: {
            id: parseInt(id)
        },
        data: {
            logo: (isDelete && JSON.parse(isDelete)) ? "" : req.file.filename,
        }
    }
    )
    return { statusCode: 0, data };
}

async function create(body) {
    const { name, code, aliasName, displayName, address, isSupplier, isBuyer, isClient, processDetails,
        cityId, pincode, panNo, tinNo, cstNo, cstDate, isIgst, yarn, fabric,
        cinNo, faxNo, email, website, contactPersonName, contactMobile, isLeadForm = false,
        gstNo, currencyId, costCode, priceDetails, shippingAddress, contactDetails, accessoryGroup, accessoryItemList,

        companyId, active, userId } = await body
    let data;

    data = await prisma.party.create(
        {
            data: {
                name, code, aliasName, displayName, address, isSupplier, isBuyer, isClient, isIgst,
                cityId: cityId ? parseInt(cityId) : undefined, pincode: pincode ? pincode : undefined,
                panNo, tinNo, cstNo, cstDate: cstDate ? new Date(cstDate) : undefined,
                cinNo, faxNo, email, website, contactPersonName,
                gstNo, currencyId: currencyId ? parseInt(currencyId) : undefined, costCode,
                createdById: userId ? parseInt(userId) : undefined,
                companyId: parseInt(companyId), active, yarn, fabric,
                contactMobile,
                accessoryGroup,
                PartyOnAccessoryItems: accessoryItemList ? {
                    createMany: {
                        data: accessoryItemList.map(item => { return { accessoryItemId: item } })
                    }
                } : undefined,
                PartyOnProcess: processDetails ? {
                    createMany: {
                        data: processDetails.map(item => { return { processId: item } })
                    }
                } : undefined

                // PriceDetails: {
                //     createMany: priceDetails ? {
                //         data: priceDetails?.map((temp) => {
                //             let newItem = {}
                //             newItem["productId"] = temp["productId"] ? parseInt(temp["productId"]) : undefined;

                //             newItem["price"] = temp["price"] ? parseFloat(temp["price"]) : undefined;

                //             return newItem
                //         })
                //     } : undefined
                // },

                // ShippingAddress: {
                //     createMany: shippingAddress ? {
                //         data: shippingAddress?.map((temp) => {
                //             let newItem = {}
                //             newItem["address"] = temp["address"] ? temp["address"] : null;
                //             return newItem
                //         })
                //     } : undefined
                // },
                // contactDetails: contactDetails ? {
                //     createMany: {
                //         data: contactDetails.map(item => {
                //             let newItem = {};
                //             newItem["contactPersonName"] = item["contactPersonName"];
                //             newItem["mobileNo"] = item["mobileNo"];

                //             newItem["email"] = item["email"];
                //             return newItem
                //         })
                //     }
                // } : undefined,

            }
        }
    )


    return { statusCode: 0, data };
}

async function update(id, body) {
    const { name, code, aliasName, displayName, address, isSupplier, isBuyer, isClient, isIgst, processDetails,
        cityId, pincode, panNo, tinNo, cstNo, cstDate, yarn, fabric, accessoryGroup, accessoryItemList,
        cinNo, faxNo, email, website, contactPersonName, contactMobile, shippingAddress, contactDetails, isContactOnly = false,
        gstNo, priceDetails, isLeadForm = false,
        companyId, active, userId } = await body

    let data;

    const dataFound = await prisma.party.findUnique({
        where: {
            id: parseInt(id)
        },
        include: {

            City: {
                select: {
                    name: true,
                    state: true
                }
            },
            // PriceDetails: {
            //     select: {
            //         productId: true,
            //         price: true,
            //         Product: {
            //             select: {
            //                 name: true,
            //             }
            //         }
            //     }
            // },
            // ShippingAddress: {
            //     select: {
            //         id: true,
            //         address: true
            //     }
            // },
            // contactDetails: {
            //     select: {
            //         id: true,
            //         contactPersonName: true,
            //         mobileNo: true,
            //         email: true
            //     }
            // }
        }
    })
    if (!dataFound) return NoRecordFound("party");



    if (isContactOnly) {
        await prisma.$transaction(async (tx) => {
            data = await prisma.party.update({
                where: {
                    id: parseInt(id),
                },
                data: {
                    name, code, aliasName, displayName, address, isSupplier, isBuyer, isClient,
                    cityId: cityId ? parseInt(cityId) : undefined, pincode,
                    panNo, tinNo, cstNo, cstDate: cstDate ? new Date(cstDate) : undefined,
                    cinNo, faxNo, email, website, isIgst,
                    gstNo, yarn, fabric,
                    createdById: userId ? parseInt(userId) : undefined,
                    companyId: companyId ? parseInt(companyId) : undefined, active,
                    contactMobile, accessoryGroup,
                    PartyOnAccessoryItems: accessoryItemList ? {
                        deleteMany: {},
                        createMany: {
                            data: accessoryItemList.map(item => { return { accessoryItemId: item } })
                        }
                    } : undefined,
                    PartyOnProcess: processDetails ? {
                        deleteMany: {},
                        createMany: {
                            data: processDetails.map(item => { return { processId: item } })
                        }
                    } : undefined
                }


            })


            if (dataFound?.contactPersonName) {

                const oldContactDetailsIds = dataFound.contactDetails.map(item => parseInt(item.id));

                const currentContactDetailsIds = contactDetails?.filter(i => i?.id)?.map(item => parseInt(item.id));
                const removedContactDetails = getRemovedItems(oldContactDetailsIds, currentContactDetailsIds);

                await tx.contactDetails?.deleteMany({
                    where: {
                        id: {
                            in: removedContactDetails
                        }
                    }
                })

                await (async function updateContactDetails() {
                    const promises = contactDetails?.map(async (h) => {

                        if (h?.id) {
                            await tx.contactDetails.update({
                                where: {
                                    id: parseInt(h.id)
                                },
                                data: {
                                    partyId: parseInt(data?.id),
                                    contactPersonName: h.contactPersonName,
                                    mobileNo: h.mobileNo ? h.mobileNo : "",
                                    email: h.email ? h.email : ""

                                }
                            })
                        }

                        else {

                            await tx.contactDetails.create({

                                data: {
                                    partyId: parseInt(data?.id),
                                    contactPersonName: h.contactPersonName,
                                    mobileNo: h.mobileNo ? h.mobileNo : "",
                                    email: h.email ? h.email : ""
                                }
                            })

                        }


                    })
                    return Promise.all(promises)
                }())
            }

        })


    }
    else {

        await prisma.$transaction(async (tx) => {
            data = await prisma.party.update({
                where: {
                    id: parseInt(id),
                },
                data: {
                    name, code, aliasName, displayName, address, isSupplier, isBuyer, isClient,
                    cityId: cityId ? parseInt(cityId) : undefined, pincode, yarn, fabric,
                    panNo, tinNo, cstNo, cstDate: cstDate ? new Date(cstDate) : undefined,
                    cinNo, faxNo, email, website, contactPersonName, isIgst,
                    gstNo,
                    createdById: userId ? parseInt(userId) : undefined,
                    companyId: companyId ? parseInt(companyId) : undefined, active,
                    contactMobile, accessoryGroup,
                    PartyOnAccessoryItems: accessoryItemList ? {
                        deleteMany: {},
                        createMany: {
                            data: accessoryItemList.map(item => { return { accessoryItemId: item } })
                        }
                    } : undefined,
                    PartyOnProcess: processDetails ? {
                        deleteMany: {},
                        createMany: {
                            data: processDetails.map(item => { return { processId: item } })
                        }
                    } : undefined
                }

            })

            const oldShippingAddressIds = dataFound.ShippingAddress.map(item => parseInt(item.id));
            const oldContactDetailsIds = dataFound.contactDetails.map(item => parseInt(item.id));
            const currentShippingAddressIds = shippingAddress?.filter(i => i?.id)?.map(item => parseInt(item.id));
            const currentContactDetailsIds = contactDetails?.filter(i => i?.id)?.map(item => parseInt(item.id));
            const removedShippingAddress = getRemovedItems(oldShippingAddressIds, currentShippingAddressIds);
            const removedContactDetails = getRemovedItems(oldContactDetailsIds, currentContactDetailsIds);
            await tx.shippingAddress?.deleteMany({
                where: {
                    id: {
                        in: removedShippingAddress
                    }
                }
            })
            await tx.contactDetails?.deleteMany({
                where: {
                    id: {
                        in: removedContactDetails
                    }
                }
            })


            await (async function updateShippingAddress() {
                const promises = shippingAddress?.map(async (h) => {

                    if (h?.id) {
                        await tx.shippingAddress.update({
                            where: {
                                id: parseInt(h.id)
                            },
                            data: {
                                supplierId: parseInt(data?.id),
                                address: h.address,

                            }
                        })
                    }

                    else {
                        await tx.shippingAddress.create({

                            data: {
                                supplierId: parseInt(data?.id),
                                address: h.address,
                            }
                        })

                    }


                })
                return Promise.all(promises)
            }())


            await (async function updateContactDetails() {
                const promises = contactDetails?.map(async (h) => {

                    if (h?.id) {
                        await tx.contactDetails.update({
                            where: {
                                id: parseInt(h.id)
                            },
                            data: {
                                partyId: parseInt(data?.id),
                                contactPersonName: h.contactPersonName,
                                mobileNo: h.mobileNo ? h.mobileNo : "",
                                email: h.email ? h.email : ""

                            }
                        })
                    }

                    else {

                        await tx.contactDetails.create({

                            data: {
                                partyId: parseInt(data?.id),
                                contactPersonName: h.contactPersonName,
                                mobileNo: h.mobileNo ? h.mobileNo : "",
                                email: h.email ? h.email : ""
                            }
                        })

                    }


                })
                return Promise.all(promises)
            }())

        })


    }

    return { statusCode: 0, data };
};

async function remove(id) {
    const data = await prisma.party.delete({
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
