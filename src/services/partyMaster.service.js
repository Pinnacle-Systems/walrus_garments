import { PrismaClient } from '@prisma/client'
import { NoRecordFound } from '../configs/Responses.js';
import { exclude, getRemovedItems } from '../utils/helper.js';
import { parse } from 'path';


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
            partyBranch: true,

            City: {
                select: {
                    name: true,
                    state: true
                }
            },
            ShippingAddress: {
                select: {
                    id: true,
                    address: true,
                    aliasName: true
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
            partyBranch: true,
            City: {
                select: {
                    name: true,
                    state: true
                }
            },

            // ShippingAddress: {
            //     select: {
            //         id: true,
            //         address: true,
            //         aliasName: true
            //     }
            // },
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
                email, mailId,
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
    console.log("Hit")
    const { name, code, aliasName, displayName, isSupplier, isBuyer, isClient, processDetails, partyBranch,
        cityId, pincode, panNo, tinNo, cstNo, cstDate, yarn, fabric, isAcc, isGy, isDy, payTermDay,
        cinNo, faxNo, website, mail, certificate, address,
        gstNo, currencyId, costCode, igst, branchInfo, contactDetails, accessoryGroup, rawMaterial,
        material,materialActive,

        companyId, active, userId } = await body
        
        console.log(rawMaterial,"rawMaterial")

    let data;
            if(rawMaterial){
                data = await prisma.RawMaterial.create (
                    {
                        data :{
                            name : material  ?  material  : undefined ,
                            active :   materialActive  ? materialActive : false
                        }
                    }
                )
            }       
else{


    data = await prisma.party.create(
        {
            data: {
                name, code, aliasName, displayName, isSupplier, isBuyer, isClient, isAcc, isGy, isDy, address,
                cityId: cityId ? parseInt(cityId) : undefined, pincode: pincode ? parseInt(pincode) : undefined,
                panNo, tinNo, cstNo, cstDate: cstDate ? new Date(cstDate) : undefined,
                cinNo, faxNo, website, payTermDay, mailId: mail,
                gstNo, currencyId: currencyId ? parseInt(currencyId) : undefined, costCode, isIgst: igst ? igst : false,
                createdById: userId ? parseInt(userId) : undefined,
                companyId: parseInt(companyId), active, yarn, fabric,
                accessoryGroup,

                PartyBranch: {
                    createMany: partyBranch ? {
                        data: branchInfo?.map((temp) => {
                            let newItem = {}
                            newItem["branchType"] = temp["branchType"] ? temp["branchType"] : null;
                            newItem["branchName"] = temp["branchName"] ? temp["branchName"] : null;
                            newItem["branchCode"] = temp["branchCode"] ? temp["branchCode"] : null;
                            newItem["branchAddress"] = temp["branchAddress"] ? temp["branchAddress"] : null;
                            newItem["branchContact"] = temp["branchContact"] ? parseInt(temp["branchContact"]) : null;
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
    }
    return { statusCode: 0, data };
}

async function update(id, body) {
    const { name, code, aliasName, displayName, address, isSupplier, isBuyer, isClient, igst, processDetails, partyBranch,
        cityId, pincode, panNo, tinNo, cstNo, cstDate, yarn, fabric, accessoryGroup, accessoryItemList, payTermDay,
        cinNo, faxNo, email, website, mail, shippingAddress, contactDetails, isForPartyBranch = false, isGy, isDy, isAcc,
        gstNo, isLeadForm = false, partyShippingAddress, partyContactDetails, branchEmail, branchName, branchCode, branchAddress, branchContact,
        companyId, active, userId, partyId } = await body

    let data;

    // const dataFound = await prisma.party.findUnique({
    //     where: {
    //         id: partyId ? parseInt(partyId) : parseInt(id)
    //     },
    //     include: {

    //         City: {
    //             select: {
    //                 name: true,
    //                 state: true
    //             }
    //         },
    //         ContactDetails: {
    //             select: {
    //                 id: true,
    //                 contactPersonName: true,
    //                 mobileNo: true,
    //                 email: true
    //             }
    //         }
    //     }
    // })



        // await prisma.$transaction(async (tx) => {
        //     data = await prisma.partyBranch.create({
        //         data: {
        //             branchEmail, branchName, branchCode, branchAddress, branchContact, partyId: parseInt(partyId) ,
        //             PartyBranch: {
        //                 deleteMany: {},
        //                 createMany: partyBranch ? {
        //                     data: partyBranch?.map((temp) => {
        //                         let newItem = {}
        //                         newItem["branchType"] = temp["branchType"] ? temp["branchEmail"] : null;
        //                         newItem["branchName"] = temp["branchName"] ? temp["branchName"] : null;
        //                         newItem["branchCode"] = temp["branchCode"] ? temp["branchCode"] : null;
        //                         newItem["branchAddress"] = temp["branchAddress"] ? temp["branchAddress"] : null;
        //                         newItem["branchContact"] = temp["branchContact"] ? parseInt(temp["branchContact"]) : null;
        //                         return newItem
        //                     })
        //                 } : undefined
        //             },
        //         }
        //     })
        // })
        // return { statusCode: 0, data };
    

    await prisma.$transaction(async (tx) => {
        data = await prisma.party.update({
            where: {
                id: parseInt(id),
            },
            data: {
                name, code, aliasName, address, isBuyer, isSupplier,
                isClient,
                cityId: cityId ? parseInt(cityId) : undefined, isAcc, isDy, isGy,
                pincode: pincode ? parseInt(pincode) : undefined,
                panNo, faxNo, email, payTermDay,
                cstNo,
                gstNo, mailId: mail,
                createdById: userId ? parseInt(userId) : undefined,
                companyId: companyId ? parseInt(companyId) : undefined, active,
                ContactDetails: contactDetails?.length > 0 ? {
                    deleteMany: {},
                    createMany: {
                        data: contactDetails.map(h => {
                            return {
                                contactPersonName: h.contactPersonName,
                                mobileNo: h.mobileNo ? h.mobileNo : "",
                                email: h.email ? h.email : ""
                            }
                        })
                    }
                } : undefined,
                partyBranch: {
                    deleteMany: {},
                    createMany: partyBranch ? {
                        data: partyBranch?.map((temp) => {
                            let newItem = {}
                            newItem["brancType"] = temp["brancType"] ? temp["brancType
                                "] : null;
                            newItem["branchName"] = temp["branchName"] ? temp["branchName"] : null;
                            newItem["branchCode"] = temp["branchCode"] ? temp["branchCode"] : null;
                            newItem["branchAddress"] = temp["branchAddress"] ? temp["branchAddress"] : null;
                            newItem["branchContact"] = temp["branchContact"] ? parseInt(temp["branchContact"]) : null;
                            return newItem
                        })
                    } : undefined
                },
            }
        })
    })
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

async function removePartyBranch(partyBranchId) {

    const data = await prisma.partyBranch.delete({
        where: {
            id: parseInt(partyBranchId)
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
    remove,
    removePartyBranch,
}
