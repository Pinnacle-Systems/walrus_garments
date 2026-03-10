import { NoRecordFound } from '../configs/Responses.js';
import { prisma } from '../lib/prisma.js';
import { exclude, getRemovedItems } from '../utils/helper.js';
import { parse } from 'path';

async function get(req) {
    const { companyId, active, isAddressCombined } = req.query


    let data
    data = await prisma.party.findMany({
        where: {
            companyId: companyId ? parseInt(companyId) : undefined,
            active: active ? Boolean(active) : undefined,
        },
        include: {

            PartyOnAccessoryItems: true,
            partyBranch: true,
            BranchType: {
                select: {
                    name: true
                }
            },
            City: {
                select: {
                    name: true,
                    state: true
                }
            },
            PartyMaterials: true,
            PartyContactDetails: true,
            _count: {
                select: {
                    Order: true,
                    PoSupplier: true,
                    PurchaseCancel: true,
                    DirectInwardOrReturn: true,
                    DirectReturnOrPoReturn: true

                }
            }
        }

    });

    if (isAddressCombined) {
        data = data?.map(i => ({
            ...i,
            name: `${i.name}${i?.BranchType?.name ? ` / ${i.BranchType.name}` : ""
                }${i?.City?.name ? ` / ${i.City.name}` : ""}`

        }))
    }

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
        bankname, bankBranchName, accountNumber, ifscCode, msmeNo, cinNo, attachments, parentId,
        branchTypeId,
    } = await body


    let data;

    console.log(body, "body")



    data = await prisma.party.create(
        {
            data: {
                isClient, isSupplier,
                isBranch: isBranch ? Boolean(isBranch) : false,

                isBuyer, name, aliasName, code: partyCode, active, displayName,
                isAcc, isGy, isDy,

                address, landMark,
                cityId: cityId ? parseInt(cityId) : undefined, pincode: pincode ? parseInt(pincode) : undefined,
                email, contact: contact ? parseInt(contact) : undefined,



                currencyId: currencyId ? parseInt(currencyId) : undefined, payTermDay, panNo, gstNo,


                bankName: bankname, branchName: bankBranchName, accountNumber, ifscCode, msmeNo, cinNo,


                createdById: userId ? parseInt(userId) : undefined,
                companyId: parseInt(companyId),


                contactPersonName: contactPersonName ? contactPersonName : null,
                designation: designation ? designation : null,
                department: department ? department : null,
                contactPersonEmail: contactPersonEmail ? contactPersonEmail : null,
                contactPersonNumber: contactNumber ? contactNumber : null,
                branchTypeId: branchTypeId ? parseInt(branchTypeId) : undefined,
                parentId: parentId ? parentId : "",


                PartyAttachments: {
                    createMany: attachments?.length > 0 ? {
                        data: attachments?.map((temp) => {
                            let newItem = {}
                            // newItem["branchType"] = temp["branchType"] ? temp["branchType"] : null;
                            newItem["name"] = temp["name"] ? temp["name"] : null;
                            newItem["filePath"] = temp["filePath"] ? temp["filePath"] : null;


                            return newItem
                        })
                    } : undefined
                }


            }
        }
    )

    console.log(data, "data")

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


async function update(id, body) {

    console.log(body,"data for party update Query")
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
        PartyContactDetails, parentId, attachments, branchTypeId
    } = body;


    let data;
    data = await prisma.party.update({
        where: { id: parseInt(id) },
        data: {
            isClient: isClient ? JSON.parse(isClient) : "",
            isSupplier: isSupplier ? JSON.parse(isSupplier) : "",
            parentId : parentId  ? parseInt(parentId) : "",
            name,
            aliasName,
            code: partyCode,
            active: active ? JSON.parse(active) : "",
            displayName,
            isBranch: isBranch ? Boolean(isBranch) : false,

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
            branchTypeId: branchTypeId ? parseInt(branchTypeId) : undefined,

            contactPersonName: contactPersonName ? contactPersonName : null,
            designation: designation ? designation : null,
            department: department ? department : null,
            contactPersonEmail: contactPersonEmail ? contactPersonEmail : null,
            contactPersonNumber: contactNumber ? contactNumber : null,

            PartyAttachments: {
                createMany: attachments?.length > 0 ? {
                    data: JSON.parse(attachments)?.map((temp) => {
                        let newItem = {}
                        // newItem["branchType"] = temp["branchType"] ? temp["branchType"] : null;
                        newItem["name"] = temp["name"] ? temp["name"] : null;
                        newItem["filePath"] = temp["filePath"] ? temp["filePath"] : null;


                        return newItem
                    })
                } : undefined
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
