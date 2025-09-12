import { FaFileAlt } from "react-icons/fa";
import { ReusableInput } from "../Order/CommonInput";
import { useCallback, useEffect, useState } from "react";
import { findFromList, getCommonParams } from "../../../Utils/helper";
import { DateInputNew, DropdownInput, DropdownWithSearch, ReusableSearchableInput, TextInput } from "../../../Inputs";
import { HiPlus, HiX } from "react-icons/hi";
import { stockTransferType } from "../../../Utils/DropdownData";
import { useGetOrderByIdQuery, useGetOrderItemsByIdNewQuery } from "../../../redux/uniformService/OrderService";
import { useGetPartyQuery } from "../../../redux/services/PartyMasterService";
import FormItems from "./FormItems";

const StockTransferForm = ({
    docId,
    fromOrderNo, onClose, setTransfetType, transferType, partyId, setPartyId, params, requirementId, setRequirementId,
    orderData, orderId, setOrderId, orderItems, setOrderItems,
    date,
    setFromOrderNo,


}) => {

    const { data: supplierList } = useGetPartyQuery({ params: { ...params } });

    let stockValidation = true
    const { data: singleOrderData, isLoading: isSingleOrderLoading, isFetching: isSingleOrderFetching } = useGetOrderItemsByIdNewQuery({ id: orderId, stockValidation }, { skip: !orderId });


    // useEffect(() => {
    //     if (!singleOrderData?.data?.orderDetails?.length) return;

    //     const orderQty = singleOrderData.data.orderDetails.reduce((acc, item) => {
    //         const totalQty = (item?.orderSizeDetails || []).reduce(
    //             (sum, s) => sum + (s.qty || 0),
    //             0
    //         );
    //         return acc + totalQty;
    //     }, 0);

    //     const updatedOrder = {
    //         ...singleOrderData.data,
    //         orderQty,
    //     };

    //     setOrderItems(updatedOrder);
    //     setPartyId(singleOrderData?.data?.partyId ? singleOrderData?.data?.partyId : "")

    // }, [orderId, singleOrderData?.data, isSingleOrderLoading, isSingleOrderFetching]);


    useEffect(() => {
        if (!singleOrderData?.data?.orderDetails?.length) return;

        const orderQty = singleOrderData?.data?.orderDetails.reduce((acc, item) => {
            const totalQty = (item?.orderSizeDetails || []).reduce(
                (sum, s) => sum + (s.qty || 0),
                0
            );
            return acc + totalQty;
        }, 0);


        const allYarns = singleOrderData?.data?.orderDetails?.flatMap(d => d.orderYarnDetails || []);


        const yarnTotals = allYarns?.reduce((acc, yarn) => {
            if (!acc[yarn?.yarnId]) {
                acc[yarn?.yarnId] = { ...yarn, totalQty: 0 };
            }
            acc[yarn.yarnId].totalQty += yarn.qty || 0;
            return acc;
        }, {});


        const combinedYarns = Object.values(yarnTotals);

        const updatedOrder = {
            ...singleOrderData.data,
            orderQty,
            yarnSummary: combinedYarns,
        };

        setOrderItems(updatedOrder);
    }, [orderId, singleOrderData?.data]);


    const syncFormWithDb = useCallback((data) => {




        setPartyId(data?.partyId ? data?.partyId : "")



        setOrderItems(
            data?.RequirementPlanningForm?.map(item => {
                const allColors = item?.RequirementYarnDetails
                    ?.map(yarn => yarn?.Color?.name)
                    .filter(Boolean)
                    .join(" - ");
                const RaiseIndenetYarnItems = item?.RequirementYarnDetails?.map(yarn => {
                    const qty = item?.requirementSizeDetails?.reduce(
                        (sum, size) => sum + (size?.weight * (yarn?.percentage / 100)),
                        0
                    );

                    return {
                        ...yarn,
                        qty: Number(qty.toFixed(3)),
                        orderDetailsId: item.orderDetailsId,

                    };
                });
                const totalYarnQty = RaiseIndenetYarnItems?.reduce(
                    (sum, yarn) => sum + yarn.qty,
                    0
                );
                return {
                    OrderDetails: {
                        style: {
                            name: `${item?.OrderDetails?.style?.name} / ${allColors}`
                        }
                    },
                    requirementPlanningFormId: item.id,
                    RaiseIndenetYarnItems,
                    totalYarnQty: Number(totalYarnQty?.toFixed(3)),
                };
            })
        );





    }, [orderId]);


    useEffect(() => {

        if (singleOrderData?.data) {
            syncFormWithDb(singleOrderData?.data)
        }

    }, [isSingleOrderFetching, isSingleOrderLoading, orderId, syncFormWithDb, singleOrderData]);
    console.log(orderItems, "orderItems");


    return (
        <>
            <div className="w-full bg-[#f1f1f0] mx-auto rounded-md shadow-md px-2 py-1 overflow-y-auto">
                <div className="flex justify-between items-center mb-1">
                    <h1 className="text-2xl font-bold text-gray-800">Stock Transfer</h1>
                    <div className="gpa-4">
                        {/* <button
                                        onClick={onClose}
                                        className="text-indigo-600 hover:text-indigo-700"
                                        title="Open Report"
                                    >
                                        <HiOutlineDocumentText className="w-7 h-6" />
                                    </button> */}
                        <button
                            onClick={onClose}
                            className="text-indigo-600 hover:text-indigo-700"
                            title="Open Report"
                        >
                            <FaFileAlt className="w-5 h-5" />
                        </button>
                    </div>

                </div>

                <div className="space-y-3 h-full ">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">


                        <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm col-span-1">
                            <h2 className="font-medium text-slate-700 mb-2">
                                Basic Details
                            </h2>
                            <div className="grid grid-cols-2 gap-1">
                                <ReusableInput label="Doc Id" readOnly value={docId} />
                                <ReusableInput label="Doc Date" value={date} type={"date"} required={true} readOnly={true} disabled />
                                <DropdownInput name="Stock Transfer Type"
                                    options={stockTransferType}
                                    value={transferType}
                                    setValue={setTransfetType}
                                    required={true}
                                // readOnly={readOnly}
                                />

                            </div>
                        </div>



                        <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm">
                            <h2 className="font-medium text-slate-700 mb-2">Customer Details</h2>

                            <div className="grid grid-cols-1">
                                <div className="grid grid-cols-2 gap-x-3 gap-y-3">



                                    <DropdownWithSearch
                                        options={orderData?.data}
                                        value={orderId}
                                        setValue={setOrderId}
                                        // readOnly={id ? true : false}
                                        labelField={"docId"}
                                        label={"Order No"}
                                    />
                                    <TextInput
                                        name="Customer"
                                        placeholder="Contact name"
                                        value={findFromList(partyId, supplierList?.data, "name")}
                                        // setValue={setContactPersonName}
                                        disabled={true}
                                    />                                    <TextInput name="To Order No" value={fromOrderNo} setValue={setFromOrderNo} required={true} readOnly={true} />
                                    <TextInput name="To Customer" value={fromOrderNo} setValue={setFromOrderNo} required={true} readOnly={true} />






                                </div>
                            </div>
                        </div>




                        <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm col-span-1">
                            <h2 className="font-medium text-slate-700 mb-2">
                            </h2>

                        </div>
                    </div>
                    <div>
                        <FormItems orderItems={orderItems} setOrderItems={setOrderItems} setRequirementId={setRequirementId} requirementId={requirementId} />

                    </div>
                </div>


            </div>
        </>
    )
}

export default StockTransferForm;