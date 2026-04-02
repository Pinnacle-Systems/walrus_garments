import { NoRecordFound } from '../configs/Responses.js';
import { exclude, base64Tobuffer } from "../utils/helper.js"
import { getFinYearStartTimeEndTime } from '../utils/finYearHelper.js';
import { getTableRecordWithId } from '../utils/helperQueries.js';
import { prisma } from '../lib/prisma.js';

const xprisma = prisma.$extends({
    result: {
        employee: {
            imageBase64: {
                needs: { image: true },
                compute(employee) {
                    return employee.image ? new Buffer(employee.image, 'binary').toString('base64') : null
                },
            },
        },
    },
})

async function getPaginated(req) {
    const { pageNumber, dataPerPage, branchId, active, searchKey } = req.query
    const totalCount = await xprisma.employee.count({
        where: {
            branchId: branchId ? parseInt(branchId) : undefined,
            active: active ? Boolean(active) : undefined,
            OR: [
                {
                    name: {
                        contains: searchKey,
                    },
                },
                {
                    regNo: {
                        contains: searchKey,
                    },
                },
                {
                    EmployeeCategory: {
                        name: {
                            contains: searchKey,
                        }
                    },
                },
                {
                    chamberNo: {
                        contains: searchKey,
                    },
                },
            ],
        },
    })
    const data = await xprisma.employee.findMany({
        skip: (parseInt(pageNumber) - 1) * parseInt(dataPerPage),
        take: parseInt(dataPerPage),
        where: {
            branchId: branchId ? parseInt(branchId) : undefined,
            active: active ? Boolean(active) : undefined,
            OR: [
                {
                    name: {
                        contains: searchKey,
                    },
                },
                {
                    regNo: {
                        contains: searchKey,
                    },
                },
                {
                    EmployeeCategory: {
                        name: {
                            contains: searchKey,
                        }
                    },
                },
                {
                    chamberNo: {
                        contains: searchKey,
                    },
                },
            ],
        },
        include: {
            EmployeeCategory: true
        }
    })
    return { statusCode: 0, data: data.map((d) => exclude({ ...d }, ["image"])), totalCount };
}
async function getEmployeeId(branchId, startTime, endTime) {

    let lastObject = await prisma.employee.findFirst({
        where: {
            branchId: parseInt(branchId),
            // isTaxBill: typeof (isTaxBill) === "undefined" ? undefined : JSON.parse(isTaxBill),
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
    console.log(lastObject, "lastObject")
    const code = "EMP"
    const branchObj = await getTableRecordWithId(branchId, "branch")
    let newDocId = `${branchObj.branchCode}/${code}/1`

    if (lastObject) {
        newDocId = `${branchObj.branchCode}/${code}/${parseInt(lastObject.regNo.split("/").at(-1)) + 1}`
    }
    console.log(newDocId, "newDocId")
    return newDocId
}
async function get(req) {
    const { branchId, active, employeeCategory, finYearId } = req.query
    let data = await xprisma.Employee.findMany({
        where: {
            branchId: branchId ? parseInt(branchId) : undefined,
            active: active ? Boolean(active) : undefined,
            EmployeeCategory: {
                name: employeeCategory
            }
        },
        include: {
            department: {
                select: {
                    name: true
                }
            },
            EmployeeCategory: true,
            _count: {
                select: {
                    User: true
                }
            }

        }
    })

    data = data.map((item) => {
        const types = [];

        if (item._count.User) types.push("User Master");


        return {
            ...item,
            referencedIn: types.join(", ")

        };
    });

    let finYearDate = await getFinYearStartTimeEndTime(finYearId);
    console.log("Regno", finYearDate)
    let Regno = finYearDate ? (await getEmployeeId(branchId, finYearDate?.startDateStartTime, finYearDate?.endDateEndTime)) : "";

    return { statusCode: 0, data: data.map((item) => exclude({ ...item }, ["image"])), Regno };
}


async function getOne(id) {
    const childRecord = await prisma.User.count({ where: { employeeId: parseInt(id) } });

    const data = await xprisma.employee.findUnique({
        where: {
            id: parseInt(id)
        },
        include: {
            permCity: {
                select: {
                    id: true
                }
            },
            localCity: {
                select: {
                    id: true
                }
            },
            department: {
                select: {
                    id: true
                }
            },
            EmployeeCategory: true
        }
    })
    if (!data) return NoRecordFound("Employee");
    return { statusCode: 0, data: exclude({ ...data, childRecord }, ["image"]) };
}

async function getSearch(req) {
    const searchKey = req.params.searchKey
    const { branchId, active } = req.query
    const data = await xprisma.employee.findMany({
        where: {
            branchId: branchId ? parseInt(branchId) : undefined,
            active: active ? Boolean(active) : undefined,
            OR: [
                {
                    name: {
                        contains: searchKey,
                    },
                },
                {
                    regNo: {
                        contains: searchKey,
                    },
                },
                {
                    department: {
                        name: {
                            contains: searchKey,
                        }
                    },
                },
                {
                    chamberNo: {
                        contains: searchKey,
                    },
                },
            ],
        },
        include: {
            department: {
                select: {
                    name: true
                }
            },
            EmployeeCategory: true
        }
    })
    return { statusCode: 0, data: data.map((item) => exclude({ ...item }, ["image"])) };
}

async function create(req) {
    const image = req.file
    const { branchId, name, email, chamberNo, joiningDate, fatherName, dob, gender, maritalStatus, bloodGroup,
        panNo, consultFee, salaryPerMonth, commissionCharges, mobile, accountNo, ifscNo, branchName, degree,
        specialization, localAddress, localCity, localPincode, permAddress, permCity,
        permPincode, department, employeeCategoryId, permanent, active, aadharNo, designation, bankName, employeeId, finYearId } = await req.body

    let finYearDate = await getFinYearStartTimeEndTime(finYearId);
    let regNo = finYearDate ? (await getEmployeeId(branchId, finYearDate?.startDateStartTime, finYearDate?.endDateEndTime)) : "";
    console.log("regNoregNo", regNo)

    const data = await prisma.employee.create(
        {
            data: {
                regNo: regNo ? regNo : undefined,
                employeeCategoryId: employeeCategoryId ? parseInt(employeeCategoryId) : undefined,
                branchId: branchId ? parseInt(branchId) : undefined,
                name: name ? name : undefined,
                email: email ? email : undefined,
                chamberNo: chamberNo ? chamberNo : undefined,
                fatherName: fatherName ? fatherName : undefined,
                dob: dob ? new Date(dob) : undefined,
                joiningDate: dob ? new Date(joiningDate) : undefined,
                gender: gender ? gender : undefined,
                maritalStatus: maritalStatus ? maritalStatus : undefined,
                departmentId: department ? parseInt(department) : undefined,
                active: active ? JSON.parse(active) : undefined,
                bloodGroup: bloodGroup ? bloodGroup : undefined,
                panNo: panNo ? panNo : undefined,
                consultFee: consultFee ? consultFee : undefined,
                salaryPerMonth: salaryPerMonth ? salaryPerMonth : undefined,
                commissionCharges: commissionCharges ? commissionCharges : undefined,
                mobile: mobile ? parseInt(mobile) : undefined,
                accountNo: accountNo ? accountNo : undefined,
                ifscNo: ifscNo ? ifscNo : undefined,
                branchName: branchName ? branchName : undefined,
                degree: degree ? degree : undefined,
                specialization,
                localAddress,
                localCity: localCity ? localCity : undefined,
                localPincode: localPincode ? parseInt(localPincode) : undefined,
                permAddress,
                permCityId: permCity ? parseInt(permCity) : undefined,
                permPincode: permPincode ? parseInt(permPincode) : undefined,
                image: image ? image.buffer : undefined,
                permanent: permanent ? JSON.parse(permanent) : undefined,
                aadharNo: aadharNo ? String(aadharNo) : undefined,
                bankName: bankName ? bankName : undefined,
                designation: designation ? designation : undefined,
                employeeId: employeeId ? employeeId : undefined

            }
        }
    )
    return { statusCode: 0, data: exclude({ ...data }, ["image"]) };
}

async function update(id, req) {
    const image = req.file
    const { name, email, regNo, chamberNo, joiningDate, fatherName, dob, gender, maritalStatus, bloodGroup,
        panNo, consultFee, salaryPerMonth, commissionCharges, mobile, accountNo, ifscNo, branchName, degree,
        specialization, localAddress, localCity, localPincode, permAddress, permCity, permPincode, department, employeeCategoryId, active,
        leavingReason, leavingDate, canRejoin, rejoinReason, isDeleteImage, aadharNo, designation, bankName, employeeId } = await req.body
    const dataFound = await prisma.employee.findFirst({
        where: {
            id: parseInt(id),
        },
    })
    let removeImage = isDeleteImage ? JSON.parse(isDeleteImage) : false;
    if (!dataFound) return NoRecordFound("Employee");
    const data = await prisma.employee.update({
        where: {
            id: parseInt(id),
        },
        data:
        {
            name, email, regNo, chamberNo, fatherName, dob: dob ? new Date(dob) : undefined, joiningDate: dob ? new Date(joiningDate) : undefined, gender, maritalStatus,
            bloodGroup, panNo, consultFee, salaryPerMonth, commissionCharges, mobile: mobile ? parseInt(mobile) : undefined, accountNo: accountNo,
            ifscNo, branchName, degree, specialization, localAddress,
            image: image ? image.buffer : (removeImage ? null : undefined),
            localCityId: localCity ? parseInt(localCity) : undefined,
            permCityId: permCity ? parseInt(permCity) : undefined,
            departmentId: department ? parseInt(department) : undefined,
            localPincode: localPincode ? parseInt(localPincode) : undefined, permAddress,
            permPincode: permPincode ? parseInt(permPincode) : undefined,
            employeeCategoryId: employeeCategoryId ? parseInt(employeeCategoryId) : undefined, active: active ? JSON.parse(active) : undefined,
            leavingDate: leavingDate ? new Date(leavingDate) : undefined, leavingReason, rejoinReason,
            canRejoin: canRejoin ? JSON.parse(canRejoin) : undefined,
            aadharNo: aadharNo ? String(aadharNo) : undefined,
            bankName: bankName ? bankName : undefined,
            designation: designation ? designation : undefined,
            employeeId: employeeId ? employeeId : undefined

        },
    })
    return { statusCode: 0, data: exclude({ ...data }, ["image"]) };
};

async function remove(id) {
    const data = await prisma.employee.delete({
        where: {
            id: parseInt(id)
        },
    })
    return { statusCode: 0, data };
}


export {
    get,
    getPaginated,
    getOne,
    getSearch,
    create,
    update,
    remove
}
