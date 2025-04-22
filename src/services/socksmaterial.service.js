import { PrismaClient } from '@prisma/client'
import { NoRecordFound } from '../configs/Responses.js';

const prisma = new PrismaClient()

async function get(req) {

    const { companyId, active } = req.query
    
    let data = await prisma.socksMaterial.findMany({
        where: {
            companyId: companyId ? parseInt(companyId) : undefined,
            active: active ? Boolean(active) : undefined,
        }
    });
  
    const sortNumbersWithSuffix = (arr) => {
        return arr.sort((a, b) => {
          const extractParts = (str) => {
            const match = str.match(/^(\d+)([A-Za-z']*)$/);
            return match ? [parseInt(match[1]), match[2] || ""] : [Infinity, ""];
          };
      
          const [numA, suffixA] = extractParts(a.name.toString()); 
          const [numB, suffixB] = extractParts(b.name.toString()); 
      
          if (numA !== numB) return numA - numB;
          return suffixA.localeCompare(suffixB);
        });
      };
      
      let tempArray = [];
      
      data.forEach((item, index) => {  
        let newObj = {
          id: item.id,
          name: item.name,
          companyId: item.companyId,
          active: item.active
        };
        tempArray.push(newObj);
      });
      
      data = sortNumbersWithSuffix(tempArray);
      
      
    return { statusCode: 0, data };
}


async function getOne(id) {
    const childRecord = 0;
    const data = await prisma.socksMaterial.findUnique({
        where: {
            id: parseInt(id)
        }
    })
    if (!data) return NoRecordFound("size");
    return { statusCode: 0, data: { ...data, ...{ childRecord } } };
}

async function getSearch(req) {
    const { searchKey } = req.params
    const { companyId, active, } = req.query
    const data = await prisma.size.findMany({
        where: {
            companyId: companyId ? parseInt(companyId) : undefined,
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
    const { name, companyId, active, accessory } = await body
    const data = await prisma.socksMaterial.create(
        {
            data: {
                name, companyId: parseInt(companyId), active,
                // isAccessory: accessory
            }
        }
    )
    return { statusCode: 0, data };
}

async function update(id, body) {
    const { name, active, accessory } = await body
    const dataFound = await prisma.socksMaterial.findUnique({
        where: {
            id: parseInt(id)
        }
    })
    if (!dataFound) return NoRecordFound("size");
    const data = await prisma.socksMaterial.update({
        where: {
            id: parseInt(id),
        },
        data:
        {
            name,active,
           
        },
    })
    return { statusCode: 0, data };
};

async function remove(id) {
    const data = await prisma.socksMaterial.delete({
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
