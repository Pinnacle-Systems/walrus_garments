import { prisma } from "../lib/prisma"

let poInwardReturnItemsCount = await prisma.poInwardReturnItems.count({
    where: {
        poItemsId: 75
    }
})
console.log(poInwardReturnItemsCount)