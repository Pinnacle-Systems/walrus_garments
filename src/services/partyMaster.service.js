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
            PartyMaterials :true,
            PartyContactDetails :true,
        }

    });
    const materialData = await prisma.rawMaterial.findMany({
        where: {
            active: active ? Boolean(active) : undefined,
        },
     

    });
    return { statusCode: 0, data ,materialData };
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
            PartyMaterials :true,
            partyBranch : true ,
             PartyContactDetails :true,



          
        }
    })
    if (!data) return NoRecordFound("party");
    console.log(data,"data")
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
    const { companyId, active, userId,name, code, aliasName, displayName, isSupplier, isBuyer, isClient, processDetails, partyBranch,
        cityId, pincode, panNo, tinNo, cstNo, cstDate, yarn, fabric, isAcc, isGy, isDy, payTermDay,
        cinNo, faxNo, website, mail,  address,
        gstNo, currencyId, costCode, igst, branchInfo, isForPartyBranch, accessoryGroup, rawMaterial,
        material,materialActive,partyMaterials,
        branchName,branchCode ,branchType , branchEmail , branchAddress , branchContactPerson , branchContact , 
        contactPersonName,department ,contact,designation ,

 } = await body
        
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
    //         if(isBranch){
    //              data = await prisma.partyBranch.create(
    //     {
    //         data: {
               
    //             partyId : id ? id : null,
    //             branchName: branchName || null,
    //             branchCode: branchCode || null,
    //             branchTypeId: branchType ? parseInt(branchType)  :  undefined,
    //             branchEmail: branchEmail || null,
    //             branchAddress: branchAddress || null,
    //             contactperson: branchContactPerson || null,
    //             contact: branchContact ||  null,
    //             designation: designation || null,

    //         }
             
    //     }
    // )


            
             
          
    //         }
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
                companyId: parseInt(companyId), active, yarn, fabric ,
                

             partyBranch: partyBranch
                            ? {
                                createMany: {
                                    data: [
                                    {
                                        branchName: branchName || null,
                                        branchCode: branchCode || null,
                                        branchTypeId: branchType ? parseInt(branchType)  :  undefined,
                                        branchEmail: branchEmail || null,
                                        branchAddress: branchAddress || null,
                                        contactperson: branchContactPerson || null,
                                        contact: branchContact ||  null,
                                        designation: designation || null,
                                    },
                                    ],
                                },
                                }
                            : undefined,
                            
               PartyContactDetails: {
                    createMany: {
                        data: [
                        {
                            contactPersonName: contactPersonName || null,
                            mobileNo: contact || null,
                            Designation: designation || null,
                            department: department || null,
                        },
                        ],
                    },
                    },



                PartyMaterials :  {
                      createMany: partyMaterials ? {
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
    }

//    if (isForPartyBranch) {
//     // await prisma.$transaction(async (tx) => {
//     //     // Optional: Delete existing branches
//     //     await tx.partyBranch.deleteMany({});

//     //     // Prepare new data
//     //     const branchData = branchInfo?.map((temp) => ({
//     //         partyId :temp.id,
//     //         branchEmail: temp.branchEmail || undefined,
//     //         branchName: temp.branchName || undefined,
//     //         branchCode: temp.branchCode || undefined,
//     //         branchAddress: temp.branchAddress || undefined,
//     //         branchContact: temp.branchContact ? temp.branchContact : undefined,
//     //     })) || [];

//     //     // Save new branches using createMany
//     //     data = await tx.partyBranch.createMany({
//     //         data: branchData,
//     //     });
//     // });


//     return { statusCode: 0, data };
// } 
    return { statusCode: 0, data };
}


async function partyMaterial( tx , partyMaterials  ,id){

    console.log(partyMaterials,"partyMaterials")
    
    let removedItems = partyMaterials?.filter(oldItem => {
        let result = partyMaterials.find(newItem => newItem.id === oldItem.id)
        if (result) return false
        return true
    })

    let removedItemsId = removedItems.map(item => parseInt(item.id))
    await tx.partyMaterials.deleteMany({
        where: {
            id: {
                in: removedItemsId
            }
        }
    })
    
    const promises = partyMaterials.map(async (temp) => {
        console.log(temp,"temp")
        if (temp?.id) {
            return await tx.partyMaterials.update({
                where: {
                    id: parseInt(temp?.id)
                },
                data: {
                    partyId : parseInt(id),
                    name: temp.name || undefined,
                    value:temp.value  || undefined,

                }
            })
        } else {
            return await tx.partyMaterials.create({
                data: {
                     partyId : parseInt(id),
                    name: temp.label || undefined,
                    value : temp.value || undefined,
        
                }
            })
        }
    })
    return Promise.all(promises)
}
async function update(id, body) {
    const { name, code, aliasName, userId, address, isSupplier, isBuyer, isClient, igst, processDetails, 
        cityId, pincode, panNo, tinNo, cstNo, cstDate, yarn, fabric, accessoryGroup, accessoryItemList, payTermDay,
        cinNo, faxNo, email, website, mail, shippingAddress, contactDetails, isForPartyBranch = false, isGy, isDy, isAcc,
        gstNo, isLeadForm = false, partyShippingAddress, partyContactDetails, branchEmail, rawMaterial, material , materialActive, branchContact,
        companyId, active, branchInfo, partyId , partyMaterials } = await body

    let data;
   if(rawMaterial){
                data = await prisma.update.create (
                    {
                        data :{
                            name : material  ?  material  : undefined ,
                            active :   materialActive  ? materialActive : false
                        }
                    }
                )
            }  
            else{
  const dataFound = await prisma.party.findUnique({
        where: {
            id: partyId ? parseInt(partyId) : parseInt(id)
        },
        include: {

            City: {
                select: {
                    name: true,
                    state: true
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

    if (!dataFound) return NoRecordFound("party");
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
            

            
        }
    })


    await partyMaterial(tx,partyMaterials  ,id)

})
            }
  

// if (isForPartyBranch) {
//     await prisma.$transaction(async (tx) => {

//         // Prepare new data
//         const branchData = branchInfo?.map((temp) => ({
//             partyId : parseInt(id),
//             branchEmail: temp.branchEmail || undefined,
//             branchName: temp.branchName || undefined,
//             branchCode: temp.branchCode || undefined,
//             branchAddress: temp.branchAddress || undefined,
//             branchContact: temp.branchContact ? temp.branchContact : undefined,
//         })) || [];

//         // Save new branches using createMany
//         data = await tx.partyBranch.createMany({
//             data: branchData,
//         });
//     });

//     return { statusCode: 0, data };
// }



    return { statusCode: 0, data };
};


async function updateMaterial(id, body) {
    console.log(body,'body',id)
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
            name : material
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
    updateMaterial,
    getMaterialOne
}
