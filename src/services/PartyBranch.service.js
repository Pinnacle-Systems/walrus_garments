import { NoRecordFound } from '../configs/Responses.js';
import { prisma } from '../lib/prisma.js';

async function get(req) {
    const { companyId, active } = req.query
    const data = await prisma.partyBranch.findMany({


        where: {
            active: active ? Boolean(active) : undefined,
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

    const { branchStateValues, partyId } = await body
    const data = await prisma.partyBranch.create(
        {
            data: {
                partyId: partyId || undefined,

                branchName: branchStateValues?.branchName || undefined,
                branchAliasName: branchStateValues?.branchAliasName || undefined,
                branchCode: branchStateValues?.branchCode || undefined,
                active: branchStateValues?.active ? branchStateValues?.active : false,
                branchCityId: branchStateValues?.branchCity || undefined,
                branchLandMark: branchStateValues?.branchLandMark || undefined,
                branchAddress: branchStateValues?.branchAddress || undefined,
                branchPincode: branchStateValues?.branchPincode || undefined,
                branchEmail: branchStateValues?.branchEmail || undefined,
                branchContactPerson: branchStateValues?.branchContactPerson || undefined,
                branchDesignation: branchStateValues?.branchContactDesignation || undefined,
                branchDepartment: branchStateValues?.branchContactDesignation || undefined,
                branchContact: branchStateValues?.branchContact || undefined,
                branchWebsite: branchStateValues?.branchWebsite || undefined,
                branchAccountNumber: branchStateValues?.branchAccountNumber || undefined,
                branchBankname: branchStateValues?.branchBankname || undefined,
                branchIfscCode: branchStateValues?.branchIfscCode || undefined,
                branchBankBranchName: branchStateValues?.branchBankBranchName || undefined,
                isMainBranch: branchStateValues?.isMainBranch || undefined,
                branchTypeId: branchStateValues?.branchTypeId || undefined,

            }
        }
    )
    return { statusCode: 0, data };
}

async function update(id, body) {
    const { branchStateValues, partyId, branchId } = await body
    console.log(branchStateValues, "branchStateValues")
    const dataFound = await prisma.PartyBranch.findUnique({
        where: {
            id: parseInt(id)
        }
    })
    if (!dataFound) return NoRecordFound("partyBranch");
    const data = await prisma.PartyBranch.update({
        where: {
            id: parseInt(id),
        },
        data:
        {
            partyId: partyId || undefined,
            branchName: branchStateValues?.branchName ? branchStateValues?.branchName : undefined,
            branchAliasName: branchStateValues?.branchAliasName ? branchStateValues?.branchAliasName : undefined,
            branchCode: branchStateValues?.branchCode ? branchStateValues?.branchCode : undefined,
            active: branchStateValues?.active ? branchStateValues?.active : false,
            branchCityId: branchStateValues?.branchCityId ? branchStateValues?.branchCityId : undefined,
            branchLandMark: branchStateValues?.branchLandMark ? branchStateValues?.branchLandMark : undefined,
            branchAddress: branchStateValues?.branchAddress ? branchStateValues?.branchAddress : undefined,
            branchPincode: branchStateValues?.branchPincode ? branchStateValues?.branchPincode : undefined,
            branchEmail: branchStateValues?.branchEmail ? branchStateValues?.branchEmail : undefined,
            branchContactPerson: branchStateValues?.branchContactPerson ? branchStateValues?.branchContactPerson : undefined,
            branchDesignation: branchStateValues?.branchContactDesignation ? branchStateValues?.branchContactDesignation : undefined,
            branchDepartment: branchStateValues?.branchContactDesignation ? branchStateValues?.branchContactDesignation : undefined,
            branchContact: branchStateValues?.branchContact ? branchStateValues?.branchContact : undefined,
            branchWebsite: branchStateValues?.branchWebsite ? branchStateValues?.branchWebsite : undefined,
            branchAccountNumber: branchStateValues?.branchAccountNumber ? branchStateValues?.branchAccountNumber : undefined,
            branchBankname: branchStateValues?.branchBankname ? branchStateValues?.branchBankname : undefined,
            branchIfscCode: branchStateValues?.branchIfscCode ? branchStateValues?.branchIfscCode : undefined,
            branchBankBranchName: branchStateValues?.branchBankBranchName ? branchStateValues?.branchBankBranchName : undefined,
            isMainBranch: branchStateValues?.isMainBranch ? branchStateValues?.isMainBranch : undefined,
            branchTypeId: branchStateValues?.branchTypeId ? branchStateValues?.branchTypeId : undefined,
        },
    })
    return { statusCode: 0, data };
};

async function remove(id) {
    const data = await prisma.PartyBranch.delete({
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
