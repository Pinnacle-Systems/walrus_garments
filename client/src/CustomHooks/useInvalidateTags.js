import { useDispatch } from "react-redux";

const useInvalidateTags = () => {
    const dispatch = useDispatch();

    const apiInvalidateData = [
        {
            type: `Sample/invalidateTags`,
            payload: ["Sample"],
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

    ];

    function dispatchInvalidate() {
        apiInvalidateData.forEach(item => {
            dispatch(item);
        })
    }
    return [dispatchInvalidate];
};

export default useInvalidateTags;
