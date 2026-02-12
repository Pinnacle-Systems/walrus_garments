import { prisma } from "../lib/prisma.js";

export async function poItemsTracking(id,item) {

    console.log(id,"ids");
    

    const alreadyInwardedData = await prisma?.directItems?.aggregate({
        where: {
            poItemsId: parseInt(id),
            // DirectInwardOrReturn: {
            //     poInwardOrDirectInward: "PurchaseInward"
            // },
            // directInwardOrReturnId: {
            //     lt: JSON.parse(purchaseInwardReturnId) ? parseInt(purchaseInwardReturnId) : undefined
            // }
        },
        _sum: {
            qty: true,
            noOfBags: true,
            noOfRolls: true
        }
    });


    const alreadyReturnedData = await prisma?.directReturnItems?.aggregate({
        where: {
            poItemsId: parseInt(id),
            // DirectReturnOrPoReturn: {
            //     poInwardOrDirectInward: "PurchaseReturn"
            // },
            // directReturnOrPoReturnId: {
            //     lt: JSON.parse(purchaseInwardReturnId) ? parseInt(purchaseInwardReturnId) : undefined
            // }
        },
        _sum: {
            qty: true,
            noOfBags: true,
            noOfRolls: true
        }
    });



    const alreadyCancelData = await prisma.cancelItems.aggregate({
        where: {
            poItemsId: parseInt(id),
            // PurchaseCancel: {
            //     poInwardOrDirectInward: "PurchaseCancel"
            // },
            cancelType: "CANCEL",
            // purchaseCancelId: {
            //     lt: JSON.parse(purchaseInwardReturnId) ? parseInt(purchaseInwardReturnId) : undefined
            // }
        },
        _sum: {
            qty: true,

        }
    });


    let cancelQty = alreadyCancelData?._sum.qty ? parseFloat(alreadyCancelData?._sum.qty).toFixed(3) : "0.000";
    let alreadyInwardedQty = alreadyInwardedData?._sum?.qty ? parseFloat(alreadyInwardedData._sum.qty).toFixed(3) : "0.000";
    let alreadyReturnedQty = alreadyReturnedData?._sum?.qty ? parseFloat(alreadyReturnedData._sum.qty).toFixed(3) : "0.000";



    return {
        ...item,
        cancelQty,
        alreadyInwardedQty,
        alreadyReturnedQty
    }

}