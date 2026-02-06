import { NoRecordFound } from '../configs/Responses.js';
import { prisma } from '../lib/prisma.js';

async function get(req) {
    const { active } = req.query
    let data = await prisma.class.findMany({
        where: {
            // companyId: companyId ? parseInt(companyId) : undefined,
            active: active ? Boolean(active) : undefined,
        }
});
const order = { "PLAYSCHOOL": 0, "PRE-KG": 1, "LKG": 2, "UKG": 3 };

const sortNumbersWithSuffix = (arr) => {
    return arr.sort((a, b) => {
        const extractParts = (str) => {
            let numPart = "";
            let suffixPart = "";

            for (let char of str) {
                if (!isNaN(char)) numPart += char; 
                else suffixPart += char; 
            }

            return [parseInt(numPart, 10) || Infinity, suffixPart || ""];
        };

        const getOrderIndex = (name) => {
            for (let key in order) {
                if (name.startsWith(key)) return order[key];
            }
            return Infinity; 
        };

     
        const orderA = getOrderIndex(a.name);
        const orderB = getOrderIndex(b.name);

        if (orderA !== orderB) return orderA - orderB; 

        const [numA, suffixA] = extractParts(a.name);
        const [numB, suffixB] = extractParts(b.name);

        if (numA !== numB) return numA - numB; 
        return suffixA.localeCompare(suffixB); 
    });
};


      data = sortNumbersWithSuffix(data);

 return { statusCode: 0, data};
}


async function getOne(id) {
    const childRecord = 0;
    const data = await prisma.class.findUnique({
        where: {
            id: parseInt(id)
        }
    })

    if (!data) return NoRecordFound("class");
    return { statusCode: 0, data: { ...data, ...{ childRecord } } };
}

async function getSearch(req) {
    const { searchKey } = req.params
    const { active } = req.query
    const data = await prisma.class.findMany({
        where: {
            // companyId: companyId ? parseInt(companyId) : undefined,
            active: active ? Boolean(active) : undefined,
            OR: [
                {
                    name: {
                        contains: searchKey,
                    },
                }
            ],
        }
    })
    return { statusCode: 0, data: data };
}

async function create(body) {
    const { name, code, companyId, active, classNameOnly } = await body
    const data = await prisma.class.create(
        {
            data: {
                name, code,
                // companyId: parseInt(companyId),
                active, classNameOnly
            }
        }
    )
    return { statusCode: 0, data };
}

async function update(id, body) {
    const { name, code, active, classNameOnly } = await body
    const dataFound = await prisma.class.findUnique({
        where: {
            id: parseInt(id)
        }
    })
    if (!dataFound) return NoRecordFound("class");
    const data = await prisma.class.update({
        where: {
            id: parseInt(id),
        },
        data:
        {
            name, code, active, classNameOnly
        },
    })
    return { statusCode: 0, data };
};


// async function checkIsItemIsUsed(classId) {

//     let data = await prisma.$queryRaw`select *
//     from item i
//     where i.classId = ${classId}
//     `
//     if (data?.length > 0) throw Error("This class Is Already used in  Item")
//     return

// }



async function remove(id) {
    let data;

    // await checkIsItemIsUsed(id)
    data = await prisma.class.delete({
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
