import { useDispatch } from "react-redux";

const useInvalidateTags = () => {
    const dispatch = useDispatch();

    const apiInvalidateData = [
        {
            type: `Sample/invalidateTags`,
            payload: ["Sample"],
        },
        {
            type: `branchTypeMaster/invalidateTags`,
            payload: ["branchType"],
        },
        {
            type: `PartyMaster/invalidateTags`,
            payload: ["Party"],
        },
        {
            type: `locationMaster/invalidateTags`,
            payload: ["LocationMaster"],
        },
        {
            type: `po/invalidateTags`,
            payload: ["po"],
        },
        {
            type: `purchaseCancel/invalidateTags`,
            payload: ["PurchaseCancel"],
        },

        {
            type: `directInwardOrReturn/invalidateTags`,
            payload: ["DirectInwardOrReturn"],
        },
        {
            type: `directCancelOrReturn/invalidateTags`,
            payload: ["DirectCancelOrReturn"],
        },
        {
            type: `billEntry/invalidateTags`,
            payload: ["BillEntry"],
        },
        {
            type: `accessoryPo/invalidateTags`,
            payload: ["accessoryPo"],
        },
        {
            type: `AccessoryPurchaseCancel/invalidateTags`,
            payload: ["AccessoryPurchaseCancel"],
        },
        {
            type: `AccessoryPurchaseInward/invalidateTags`,
            payload: ["AccessoryPurchaseInward"],
        },
        {
            type: `AccessoryPurchaseReturn/invalidateTags`,
            payload: ["AccessoryPurchaseReturn"],
        },
        {
            type: `stock/invalidateTags`,
            payload: ["Stock"],
        },
        {
            type: `ItemControlPanel/invalidateTags`,
            payload: ["ItemControlPanel"],
        },
        {
            type: `pageMaster/invalidateTags`,
            payload: ["Pages"],
        },
        {
            type: `Quotation/invalidateTags`,
            payload: ["Quotation"],
        },
        {
            type: `saleOrder/invalidateTags`,
            payload: ["saleOrder"],
        },
        {
            type: `salesInvoice/invalidateTags`,
            payload: ["salesInvoice"],
        },
        {
            type: `salesDelivery/invalidateTags`,
            payload: ["salesDelivery"],
        },
        {
            type: `salesReturn/invalidateTags`,
            payload: ["salesReturn"],
        },

    ];

    function dispatchInvalidate() {
        apiInvalidateData.forEach(item => {
            dispatch(item);
        })
    }
    return [dispatchInvalidate];
};

export default useInvalidateTags;
