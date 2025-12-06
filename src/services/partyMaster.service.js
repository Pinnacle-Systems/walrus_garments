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
            PartyMaterials: true,
            PartyContactDetails: true,
        }

    });
    const materialData = await prisma.rawMaterial.findMany({
        where: {
            active: active ? Boolean(active) : undefined,
        },


    });
    return { statusCode: 0, data, materialData };
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
                    id: true,
                    name: true,
                    state: true
                }
            },
            Currency: {
                select: {
                    name: true,
                    id: true
                }
            },
            PartyMaterials: true,
            partyBranch: true,
            PartyContactDetails: true,
            BranchContactDetails: true,




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
    const {

        companyId, active, userId, name, partyCode, aliasName, displayName, isSupplier, isBuyer, isClient, processDetails, partyBranch,
        cityId, pincode, panNo, tinNo, cstNo, cstDate, yarn, fabric, isAcc, isGy, isDy, payTermDay,
        faxNo, website, mail, address,
        gstNo, currencyId, costCode, igst, contactNumber, alterContactNumber, email, rawMaterial,
        material, materialActive, partyMaterials,
        branchName, branchCode, branchType, branchEmail, branchAddress, branchContactPerson, branchContact,
        contactPersonName, department, contact, designation, isContact, id, isBranch, branchStateValues, isBranchContact,
        landMark, contactPersonEmail,
        bankname, bankBranchName, accountNumber, ifscCode, msmeNo, cinNo,
        PartyContactDetails,
    } = await body


    let data;




    data = await prisma.party.create(
        {
            data: {
                isClient, isSupplier, isBuyer, name, aliasName, code: partyCode, active, displayName,
                isAcc, isGy, isDy,

                address, landMark,
                cityId: cityId ? parseInt(cityId) : undefined, pincode: pincode ? parseInt(pincode) : undefined,
                email, contact: contact ? parseInt(contact) : undefined,



                currencyId: currencyId ? parseInt(currencyId) : undefined, payTermDay, panNo, gstNo,


                bankName: bankname, branchName: bankBranchName, accountNumber, ifscCode, msmeNo, cinNo,


                createdById: userId ? parseInt(userId) : undefined,
                companyId: parseInt(companyId),


                partyBranch: branchStateValues?.branchName
                    ? {
                        create: {

                            branchName: branchStateValues?.branchName || undefined,
                            branchAliasName: branchStateValues?.branchAliasName || undefined,
                            branchCode: branchStateValues?.branchCode || undefined,
                            active: branchStateValues?.active || false,
                            branchCityId: branchStateValues?.branchCityId || undefined,
                            branchLandMark: branchStateValues?.branchLandMark || undefined,
                            branchAddress: branchStateValues?.branchAddress || undefined,
                            branchPincode: branchStateValues?.branchPincode || undefined,
                            branchEmail: branchStateValues?.branchEmail || undefined,
                            branchContactPerson: branchStateValues?.branchContactPerson || undefined,
                            branchDesignation: branchStateValues?.branchDesignation || undefined,
                            branchDepartment: branchStateValues?.branchDepartment || undefined,
                            branchContact: branchStateValues?.branchContact || undefined,
                            branchWebsite: branchStateValues?.branchWebsite || undefined,
                            branchAccountNumber: branchStateValues?.branchAccountNumber || undefined,
                            branchBankname: branchStateValues?.branchBankname || undefined,
                            branchIfscCode: branchStateValues?.branchIfscCode || undefined,
                            branchBankBranchName: branchStateValues?.branchBankBranchName || undefined,
                            partyId: branchStateValues?.partyId || undefined,
                            isMainBranch: branchStateValues?.isMainBranch || undefined,
                            BranchType: branchStateValues?.BranchType || undefined,
                            branchTypeId: branchStateValues?.branchTypeId || undefined,
                            BranchContactDetails: {
                                create: {

                                    contactPersonName: branchStateValues?.branchContactPerson || null,
                                    mobileNo: branchStateValues?.branchContactPersonContact || null,
                                    designation: branchStateValues?.branchContactDesignation || null,
                                    department: branchStateValues?.branchContactDepartment || null,
                                    email: branchStateValues?.branchContactPersonEmail ? branchStateValues?.branchContactPersonEmail : undefined,

                                }
                            }
                        },

                    }

                    : undefined,

                PartyContactDetails: {
                    create: {

                        contactPersonName: contactPersonName || null,
                        mobileNo: contactNumber || null,
                        Designation: designation || null,
                        department: department || null,
                        email: contactPersonEmail ? contactPersonEmail : undefined,
                        // alterContactNumber: alterContactNumber || null,

                    },
                },



                PartyMaterials: {
                    createMany: partyMaterials.length > 0 ? {
                        data: partyMaterials?.map((temp) => {
                            let newItem = {}
                            // newItem["branchType"] = temp["branchType"] ? temp["branchType"] : null;
                            newItem["name"] = temp["label"] ? temp["label"] : null;
                            newItem["value"] = temp["value"] ? temp["value"] : null;


                            return newItem
                        })
                    } : undefined
                }


            }
        }
    )



    return { statusCode: 0, data };
}


async function partyMaterial(partyMaterials, id) {

    console.log(partyMaterials, "partyMaterials")

    let removedItems = partyMaterials?.filter(oldItem => {
        let result = partyMaterials.find(newItem => newItem.id === oldItem.id)
        if (result) return false
        return true
    })

    let removedItemsId = removedItems.map(item => parseInt(item.id))
    await partyMaterials.deleteMany({
        where: {
            id: {
                in: removedItemsId
            }
        }
    })

    const promises = partyMaterials.map(async (temp) => {
        console.log(temp, "temp")
        if (temp?.id) {
            return await partyMaterials.update({
                where: {
                    id: parseInt(temp?.id)
                },
                data: {
                    partyId: parseInt(id),
                    name: temp.name || undefined,
                    value: temp.value || undefined,

                }
            })
        } else {
            return await partyMaterials.create({
                data: {
                    partyId: parseInt(id),
                    name: temp.label || undefined,
                    value: temp.value || undefined,

                }
            })
        }
    })
    return Promise.all(promises)
}
// async function update(id, body) {
//     const { name, code, aliasName, userId, address, isSupplier, isBuyer, isClient, igst, processDetails, 
//         cityId, pincode, panNo, tinNo, cstNo, cstDate, yarn, fabric, accessoryGroup, accessoryItemList, payTermDay,
//         cinNo, faxNo, email, website, mail, shippingAddress, contactDetails, isForPartyBranch = false, isGy, isDy, isAcc,
//         gstNo, isLeadForm = false, partyShippingAddress, partyContactDetails, branchEmail, rawMaterial, material , materialActive, branchContact,
//         companyId, active, branchInfo, partyId , partyMaterials } = await body

//     let data;
//    if(rawMaterial){
//                 data = await prisma.update.create (
//                     {
//                         data :{
//                             name : material  ?  material  : undefined ,
//                             active :   materialActive  ? materialActive : false
//                         }
//                     }
//                 )
//             }  
//             else{
//   const dataFound = await prisma.party.findUnique({
//         where: {
//             id: partyId ? parseInt(partyId) : parseInt(id)
//         },
//         include: {

//             City: {
//                 select: {
//                     name: true,
//                     state: true
//                 }
//             },
//             PartyContactDetails :{
//                 select :{
//                     contactPersonName  : true ,
//                     mobileNo  : true  ,
//                     department  :  true  ,
//                     Designation  : true  ,

//                 }
//             }
//         }
//     })

//     if (!dataFound) return NoRecordFound("party");
// await prisma.$transaction(async (tx) => {
//     data = await prisma.party.update({
//         where: {
//             id: parseInt(id),
//         },
//         data: {
//             name, code, aliasName, address, isBuyer, isSupplier,
//             isClient,
//             cityId: cityId ? parseInt(cityId) : undefined, isAcc, isDy, isGy,
//             pincode: pincode ? parseInt(pincode) : undefined,
//             panNo, faxNo, email, payTermDay,
//             cstNo,
//             gstNo, mailId: mail,
//             createdById: userId ? parseInt(userId) : undefined,
//             companyId: companyId ? parseInt(companyId) : undefined, active,payTermDay, email


//         }   



//     })


//     await partyMaterial(tx,partyMaterials  ,id)

// })
//             }






//     return { statusCode: 0, data };
// };

async function update(id, body) {
    const {

        companyId, active, userId, name, partyCode, aliasName, displayName, isSupplier, isBuyer, isClient,
        processDetails, partyBranch, cityId, pincode, panNo, tinNo, cstNo, cstDate,
        yarn, fabric, isAcc, isGy, isDy, payTermDay,
        faxNo, website, mail, address, gstNo, currencyId, costCode, igst,
        contactNumber, alterContactNumber, email, rawMaterial, material, materialActive, partyMaterials,
        branchStateValues,
        contactPersonName, department, contact, designation, isContact, isBranch, isBranchContact,
        landMark, contactPersonEmail,
        bankname, bankBranchName, accountNumber, ifscCode, msmeNo, cinNo,
        PartyContactDetails, contactId
    } = body;


    console.log(typeof(partyMaterials),'partyMaterials');

    data = await prisma.party.update({
        where: { id: parseInt(id) },
        data: {
            isClient: isClient ? JSON.parse(isClient) : "",
            isSupplier: isSupplier ? JSON.parse(isSupplier) : "",
            name,
            aliasName,
            code: partyCode,
            active: active ? JSON.parse(active) : "",
            displayName,

            address,
            landMark,
            cityId: cityId ? parseInt(cityId) : undefined,
            pincode: pincode ? parseInt(pincode) : undefined,
            email,
            contact: contact ? parseInt(contact) : undefined,
            currencyId: currencyId ? parseInt(currencyId) : undefined,
            payTermDay,
            panNo,
            gstNo,
            bankName: bankname,
            branchName: bankBranchName,
            accountNumber,
            ifscCode,
            msmeNo,
            cinNo,
            createdById: userId ? parseInt(userId) : undefined,
            companyId: parseInt(companyId),

            partyBranch: branchStateValues?.branchName
                ? {
                    upsert: {
                        update: {
                            branchName: branchStateValues?.branchName || undefined,
                            branchAliasName: branchStateValues?.branchAliasName || undefined,
                            branchCode: branchStateValues?.branchCode || undefined,
                            active: branchStateValues?.active || false,
                            branchCityId: branchStateValues?.branchCityId || undefined,
                            branchLandMark: branchStateValues?.branchLandMark || undefined,
                            branchAddress: branchStateValues?.branchAddress || undefined,
                            branchPincode: branchStateValues?.branchPincode || undefined,
                            branchEmail: branchStateValues?.branchEmail || undefined,
                            branchContactPerson: branchStateValues?.branchContactPerson || undefined,
                            branchDesignation: branchStateValues?.branchDesignation || undefined,
                            branchDepartment: branchStateValues?.branchDepartment || undefined,
                            branchContact: branchStateValues?.branchContact || undefined,
                            branchWebsite: branchStateValues?.branchWebsite || undefined,
                            branchAccountNumber: branchStateValues?.branchAccountNumber || undefined,
                            branchBankname: branchStateValues?.branchBankname || undefined,
                            branchIfscCode: branchStateValues?.branchIfscCode || undefined,
                            branchBankBranchName: branchStateValues?.branchBankBranchName || undefined,
                            partyId: branchStateValues?.partyId || undefined,
                            isMainBranch: branchStateValues?.isMainBranch || undefined,
                            BranchType: branchStateValues?.BranchType || undefined,
                            branchTypeId: branchStateValues?.branchTypeId || undefined,
                            BranchContactDetails: {
                                upsert: {
                                    update: {
                                        contactPersonName: branchStateValues?.branchContactPerson || null,
                                        mobileNo: branchStateValues?.branchContactPersonContact || null,
                                        designation: branchStateValues?.branchContactDesignation || null,
                                        department: branchStateValues?.branchContactDepartment || null,
                                        email: branchStateValues?.branchContactPersonEmail || undefined,
                                        alterContactNumber: branchStateValues?.branchContactPersonAlterContact || null,
                                    },
                                    create: {
                                        contactPersonName: branchStateValues?.branchContactPerson || null,
                                        mobileNo: branchStateValues?.branchContactPersonContact || null,
                                        designation: branchStateValues?.branchContactDesignation || null,
                                        department: branchStateValues?.branchContactDepartment || null,
                                        email: branchStateValues?.branchContactPersonEmail || undefined,
                                        alterContactNumber: branchStateValues?.branchContactPersonAlterContact || null,

                                    },
                                },
                            },
                        },
                        create: {
                            branchName: branchStateValues?.branchName || undefined,
                            branchAliasName: branchStateValues?.branchAliasName || undefined,
                            branchCode: branchStateValues?.branchCode || undefined,
                            active: branchStateValues?.active || false,
                            branchCityId: branchStateValues?.branchCityId || undefined,
                            branchLandMark: branchStateValues?.branchLandMark || undefined,
                            branchAddress: branchStateValues?.branchAddress || undefined,
                            branchPincode: branchStateValues?.branchPincode || undefined,
                            branchEmail: branchStateValues?.branchEmail || undefined,
                            branchContactPerson: branchStateValues?.branchContactPerson || undefined,
                            branchDesignation: branchStateValues?.branchDesignation || undefined,
                            branchDepartment: branchStateValues?.branchDepartment || undefined,
                            branchContact: branchStateValues?.branchContact || undefined,
                            branchWebsite: branchStateValues?.branchWebsite || undefined,
                            branchAccountNumber: branchStateValues?.branchAccountNumber || undefined,
                            branchBankname: branchStateValues?.branchBankname || undefined,
                            branchIfscCode: branchStateValues?.branchIfscCode || undefined,
                            branchBankBranchName: branchStateValues?.branchBankBranchName || undefined,
                            partyId: branchStateValues?.partyId || undefined,
                            isMainBranch: branchStateValues?.isMainBranch || undefined,
                            BranchType: branchStateValues?.BranchType || undefined,
                            branchTypeId: branchStateValues?.branchTypeId || undefined,
                            BranchContactDetails: {
                                create: {
                                    contactPersonName: branchStateValues?.branchContactPerson || null,
                                    mobileNo: branchStateValues?.branchContactPersonContact || null,
                                    designation: branchStateValues?.branchContactDesignation || null,
                                    department: branchStateValues?.branchContactDepartment || null,
                                    email: branchStateValues?.branchContactPersonEmail || undefined,
                                },
                            },
                        },
                    },
                }
                : undefined,

            PartyContactDetails: {
                upsert: {
                    update: {
                        contactPersonName: contactPersonName || null,
                        mobileNo: contactNumber || null,
                        Designation: designation || null,
                        department: department || null,
                        email: contactPersonEmail || undefined,
                    },
                    create: {
                        contactPersonName: contactPersonName || null,
                        mobileNo: contactNumber || null,
                        Designation: designation || null,
                        department: department || null,
                        email: contactPersonEmail || undefined,
                    },
                },
            },

            PartyMaterials: {
                deleteMany: {},
                createMany: partyMaterials.length > 0
                    ? {
                        data: partyMaterials.map((temp) => ({
                            name: temp.label || null,
                            value: temp.value || null,
                        })),
                    }
                    : undefined,
            }
        },
    });


    return { statusCode: 0, data: data };
}

async function updateMaterial(id, body) {
    console.log(body, 'body', id)
    const { material, } = await body
    const dataFound = await prisma.rawMaterial.findUnique({
        where: {
            id: parseInt(id)
        }
    })
    if (!dataFound) return NoRecordFound("yarn");
    const data = await prisma.rawMaterial.update({
        where: {
            id: parseInt(id),
        },
        data: {
            name: material
        }
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

async function removePartyMaterial(partyBranchId) {

    const data = await prisma.rawMaterial.delete({
        where: {
            id: parseInt(partyBranchId)
        },
    })
    return { statusCode: 0, data };
}

async function removePartyContact(id) {

    const data = await prisma.partyContactDetails.delete({
        where: {
            id: parseInt(id)
        },
    })
    return { statusCode: 0, data };
}
async function getMaterialOne(id) {
    const childRecord = 0;
    const data = await prisma.rawMaterial.findUnique({
        where: {
            id: parseInt(id)
        },

    })
    if (!data) return NoRecordFound("party");
    return { statusCode: 0, data: { ...data, ...{ childRecord } } };
}

async function getContactOne(id) {
    const childRecord = 0;
    const data = await prisma.partyContactDetails.findUnique({
        where: {
            id: parseInt(id)
        },

    })
    if (!data) return NoRecordFound("party");
    return { statusCode: 0, data: { ...data, ...{ childRecord } } };
}

async function updateContact(id, body) {
    console.log(body, 'body', id)
    const { contactPersonName, designation, department, contactNumber } = await body
    const dataFound = await prisma.partyContactDetails.findUnique({
        where: {
            id: parseInt(id)
        }
    })
    if (!dataFound) return NoRecordFound("contact");
    const data = await prisma.partyContactDetails.update({
        where: {
            id: parseInt(id),
        },
        data: {
            contactPersonName: contactPersonName,
            mobileNo: contactNumber ? contactNumber : undefined,
            Designation: designation ? designation : undefined,
            department: department ? department : undefined,

        }
    })
    return { statusCode: 0, data };
};


async function getPartyBranchOne(id) {
    const childRecord = 0;
    const data = await prisma.PartyBranch.findUnique({
        where: {
            id: parseInt(id)
        },

    })
    if (!data) return NoRecordFound("party");
    return { statusCode: 0, data: { ...data, ...{ childRecord } } };
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
    removePartyMaterial,
    removePartyContact,
    updateMaterial,
    getMaterialOne,
    getContactOne,
    updateContact,
    getPartyBranchOne
}
