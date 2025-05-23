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

            ShippingAddress: {
                select: {
                    id: true,
                    address: true
                }
            },
            ContactDetails: {
                select: {
                    id: true,
                    contactPersonName: true,
                    mobileNo: true,
                    email: true
                }
            }
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

async function kycForm(body) {
  const {
    companyName,
    mailId,
    gstNumber,
    panNumber,
    aadharNumber,
    registrationNumber,
    ownerName,
    contactNumber,
    email,
    address,
    cityState,
    pincode,
    businessType,
    productCategories,
    documents,
    userId,
  } = body;
 console.log(documents,"documents")
  try {
    const newKYC = await prisma.partyKYC.create({
      data: {
        companyName,
        gstNumber,
        panNumber,
        aadharNumber,
        registrationNumber,
        ownerName,
        contactNumber,
        email,mailId,
        address,
        cityState,
        pincode,
        businessType,
        productCategories,
        documents: documents ? documents.name : null,  
        createdById: userId ? parseInt(userId) : undefined,    
      },
    });
    return { statusCode: 0, data: newKYC };
  } catch (error) {
    console.error('Error adding party KYC:', error);    
    return { statusCode: 0, error: error };
  }
};



async function create(body) {
    const { name, code, aliasName, displayName, isSupplier, isBuyer, isClient, processDetails,
        cityId, pincode, panNo, tinNo, cstNo, cstDate,  yarn, fabric,isAcc,isGy,isDy,payTermDay,
        cinNo, faxNo, website,mail,certificate,
        gstNo, currencyId, costCode, igst, shippingAddress, contactDetails, accessoryGroup, accessoryItemList,

        companyId, active, userId } = await body
    let data;
  console.log(certificate,"mailId")
    data = await prisma.party.create(
        {
            data: {
                name, code, aliasName, displayName, isSupplier, isBuyer,  isClient,isAcc,isGy,isDy,
                cityId: cityId ? parseInt(cityId) : undefined, pincode: pincode ? parseInt(pincode) : undefined,
                panNo, tinNo, cstNo, cstDate: cstDate ? new Date(cstDate) : undefined,
                cinNo, faxNo, website,payTermDay,mailId: mail,
                gstNo, currencyId: currencyId ? parseInt(currencyId) : undefined, costCode,isIgst:igst ?igst:false,
                createdById: userId ? parseInt(userId) : undefined,
                companyId: parseInt(companyId), active, yarn, fabric,
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
                ,

                ShippingAddress: {
                    createMany: shippingAddress ? {
                        data: shippingAddress?.map((temp) => {
                            let newItem = {}
                            newItem["address"] = temp["address"] ? temp["address"] : null;
                            return newItem
                        })
                    } : undefined
                },
                ContactDetails: contactDetails ? {
                    createMany: {
                        data: contactDetails.map(item => {
                            let newItem = {};
                            newItem["contactPersonName"] = item["contactPersonName"];
                            newItem["mobileNo"] = item["mobileNo"];

                            newItem["email"] = item["email"];
                            return newItem
                        })
                    }
                } : undefined,

            }
        }
    )


    return { statusCode: 0, data };


}

async function update(id, body) {
    const { name, code, aliasName, displayName, address, isSupplier, isBuyer, isClient, igst, processDetails,
        cityId, pincode, panNo, tinNo, cstNo, cstDate, yarn, fabric, accessoryGroup, accessoryItemList,payTermDay,
        cinNo, faxNo, email, website,mail, shippingAddress, contactDetails, isContactOnly = false,isGy,isDy,isAcc,
        gstNo, isLeadForm = false,
        companyId, active, userId } = await body
    console.log(mail,"payTermDay for sql")
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
            ShippingAddress: {
                select: {
                    id: true,
                    address: true
                }
            },
            ContactDetails: {
                select: {
                    id: true,
                    contactPersonName: true,
                    mobileNo: true,
                    email: true
                }
            }



        }
    })
    console.log("dataFound", dataFound);
    if (!dataFound) return NoRecordFound("party");



    if (isContactOnly) {
        await prisma.$transaction(async (tx) => {
            data = await prisma.party.update({
                where: {
                    id: parseInt(id),
                },
                data: {
                    name, code, aliasName, displayName, address, isSupplier, isBuyer,payTermDay,
                    cityId: cityId ? parseInt(cityId) : undefined, pincode: pincode ? parseInt(pincode) : undefined,
                    panNo, tinNo, cstNo, cstDate: cstDate ? new Date(cstDate) : undefined,
                    cinNo, faxNo, email, website, isIgst:igst ?igst:false,
                    gstNo, yarn, fabric,mailId: mail,
                    createdById: userId ? parseInt(userId) : undefined,
                    companyId: companyId ? parseInt(companyId) : undefined, active,
                    accessoryGroup,
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
     })
    }
    else {

        await prisma.$transaction(async (tx) => {
            data = await prisma.party.update({
                where: {
                    id: parseInt(id),
                },
                data: {
                    name, code, aliasName, displayName, address, isBuyer, isSupplier, isIgst:igst ?igst:false, isClient,
                    cityId: cityId ? parseInt(cityId) : undefined, yarn, fabric,isAcc,isDy,isGy,
                    pincode: pincode ? parseInt(pincode) : undefined,
                    panNo, tinNo, cstNo, cstDate: cstDate ? new Date(cstDate) : undefined,
                    cinNo, faxNo, email, website,payTermDay,
                    gstNo,mailId:mail,
                    createdById: userId ? parseInt(userId) : undefined,
                    companyId: companyId ? parseInt(companyId) : undefined, active,
                    accessoryGroup,
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

            const oldShippingAddressIds = dataFound?.ShippingAddress?.map(item => parseInt(item.id));
            const oldContactDetailsIds = dataFound?.ContactDetails?.map(item => parseInt(item.id));
            const currentShippingAddressIds = shippingAddress?.filter(i => i?.id)?.map(item => parseInt(item.id));
            const currentContactDetailsIds = contactDetails?.filter(i => i?.id)?.map(item => parseInt(item.id));
            const removedShippingAddress = getRemovedItems(oldShippingAddressIds, currentShippingAddressIds);
            const removedContactDetails = getRemovedItems(oldContactDetailsIds, currentContactDetailsIds);
            await tx.ShippingAddress?.deleteMany({
                where: {
                    id: {
                        in: removedShippingAddress
                    }
                }
            })
            await tx.ContactDetails?.deleteMany({
                where: {
                    id: {
                        in: removedContactDetails
                    }
                }
            })


            await (async function updateShippingAddress() {
                const promises = shippingAddress?.map(async (h) => {

                    if (h?.id) {
                        await tx.ShippingAddress.update({
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
                        await tx.ShippingAddress.create({

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
                        await tx.ContactDetails.update({
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

                        await tx.ContactDetails.create({

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
    kycForm,
    update,
    remove
}
