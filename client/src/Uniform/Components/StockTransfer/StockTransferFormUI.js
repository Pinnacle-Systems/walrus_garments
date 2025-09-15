import { FaFileAlt, FaWhatsapp } from "react-icons/fa";
import { ReusableInput } from "../Order/CommonInput";
import { useCallback, useEffect, useRef, useState } from "react";
import { findFromList, getCommonParams } from "../../../Utils/helper";
import { DateInputNew, DropdownInput, DropdownWithSearch, ReusableSearchableInput, TextInput } from "../../../Inputs";
import { HiOutlineRefresh, HiPlus, HiX } from "react-icons/hi";
import { stockTransferType } from "../../../Utils/DropdownData";
import { useGetOrderByIdQuery, useGetOrderItemsByIdNewQuery } from "../../../redux/uniformService/OrderService";
import { useGetPartyQuery } from "../../../redux/services/PartyMasterService";
import FormItems from "./FormItems";
import { useAddStockMutation, useDeleteStockMutation, useGetStockByIdQuery, useGetStockQuery, useUpdateStockMutation } from "../../../redux/services/StockService";
import { useGetColorMasterQuery } from "../../../redux/uniformService/ColorMasterService";
import { useGetYarnMasterQuery } from "../../../redux/uniformService/YarnMasterServices";
import { FiEdit2, FiPrinter, FiSave } from "react-icons/fi";
import Swal from "sweetalert2";
import { useAddStockTransferMutation, useGetStockTransferByIdQuery, useUpdateStockTransferMutation } from "../../../redux/uniformService/StockTransferService";
import { Loader } from "../../../Basic/components";

const StockTransferForm = ({
    docId, id,
    fromCustomerId, setFromCustomerId, onClose, setTransferType, transferType, partyId, setPartyId, params, requirementId, setRequirementId,
    orderData, orderId, setOrderId, orderItems, setOrderItems, fromOrderId, setFromOrderId, setStockItems, stockItems, setTempOrderItems, tempOrderItems, tempStockItems, setTempStockItems,
    date, OnNew,
    yarnTotals, setYarnTotals, toOrderId, setToOrderId

}) => {

    const { data: supplierList } = useGetPartyQuery({ params: { ...params } });
    const { data: colorList } = useGetColorMasterQuery({ params: { ...params } });
    const { data: yarnList } = useGetYarnMasterQuery({ params: { ...params } });



    // const { data: singleOrderData, isLoading: isSingleOrderLoading, isFetching: isSingleOrderFetching } = useGetOrderItemsByIdNewQuery({ id: orderId, stockValidation }, { skip: !orderId });


    const { data: singleOrderData, isLoading: isSingleOrderLoading, isFetching: isSingleOrderFetching } = useGetOrderByIdQuery(toOrderId, { skip: !toOrderId });

    const { data: fromOrderData, isLoading: isfromOrderLoading, isFetching: isfromOrderFetching } = useGetOrderByIdQuery(fromOrderId, { skip: !fromOrderId });



    const { data: singleData, isLoading: isSingleDataLoading, isFetching: isSingleDataFetching } = useGetStockTransferByIdQuery(id, { skip: !id });



    const {
        data: stockData,
        isFetching: stockFetching,
        isLoading: stockLoading,
    } = useGetStockByIdQuery(
        {
            params: {
                transferType,
                fromOrderId,
                storeId: 1
            },
        },
        {
            skip: !transferType && !fromOrderId, // skip only when nothing is selected
        }
    );
    const [addData] = useAddStockTransferMutation();
    const [updateData] = useUpdateStockTransferMutation();
    //   const [removeData] = useDeleteStockMutation();


    const data = {
        orderItems: orderItems?.filter(item => parseInt(item.transferQty) > 0),
        stockItems, fromOrderId, toOrderId, docId,

    }






    const syncFormWithDb = useCallback((data) => {




        if (id) {

            setOrderItems(data?.YarnTransferDetails ? data?.YarnTransferDetails : [])
            setStockItems(data?.StockTransferItems ? data?.StockTransferItems : [])

        } else {
            // setOrderItems(
            //         data?.RequirementPlanningForm(item => {

            //         const allColors = item?.RequirementYarnDetails?.map(yarn => yarn?.Color?.name)?.filter(Boolean)?.join(" - ");

            //         const RaiseIndenetYarnItems = item?.RequirementYarnDetails?.map(yarn => {

            //             const qty = item?.requirementSizeDetails?.reduce((sum, size) => {
            //                 console.log(
            //                     `Calculation => sum(${sum}) + size.weight(${size?.weight}) * yarn.percentage(${yarn?.percentage}) / 100`
            //                 );

            //                 return sum + (size?.weight * (yarn?.percentage / 100));
            //             }, 0);

            //             console.log(`✅ Yarn ${yarn?.Yarn.name || yarn?.id} final qty:`, qty);

            //             return {
            //                 ...yarn,
            //                 qty: Number(qty.toFixed(3)),
            //                 style: `${item?.OrderDetails?.style?.name} / ${allColors}`,
            //                 orderDetailsId: item.orderDetailsId,
            //             };
            //         });

            //         console.log(RaiseIndenetYarnItems, "RaiseIndenetYarnItems")

            //         return {

            //             RaiseIndenetYarnItems,
            //         };
            //     })
            // );
            setPartyId(data?.partyId ? data?.partyId : "")

            setTempOrderItems(data?.RequirementPlanningForm?.flatMap(item => {
                const allColors = item?.RequirementYarnDetails
                    ?.map(yarn => yarn?.Color?.name)
                    ?.filter(Boolean)
                    ?.join(" - ");

                return item?.RequirementYarnDetails?.map(yarn => {
                    const qty = item?.requirementSizeDetails?.reduce((sum, size) => {
                        console.log(
                            `Calculation => sum(${sum}) + size.weight(${size?.weight}) * yarn.percentage(${yarn?.percentage}) / 100`
                        );

                        return sum + (size?.weight * (yarn?.percentage / 100));
                    }, 0);

                    console.log(`✅ Yarn ${yarn?.Yarn?.name || yarn?.id} final qty:`, qty);

                    return {
                        ...yarn,
                        qty: Number(qty.toFixed(3)),
                        style: `${item?.OrderDetails?.style?.name} / ${allColors}`,
                        orderDetailsId: item.orderDetailsId,
                        orderId: item.orderId
                    };
                });
            }) ?? []
            );
        }










    }, [orderId, id]);


    useEffect(() => {

        if (singleData?.data) {
            syncFormWithDb(singleData?.data)
        }

    }, [isSingleDataFetching, isSingleDataLoading, id, syncFormWithDb, singleData]);


    useEffect(() => {

        if (singleOrderData?.data) {
            syncFormWithDb(singleOrderData?.data)
        }

    }, [isSingleOrderFetching, isSingleOrderLoading, orderId, syncFormWithDb, singleOrderData]);

    useEffect(() => {

        if (fromOrderData?.data) {

            setFromCustomerId(fromOrderData?.data?.partyId ? fromOrderData?.data?.partyId : undefined)

        }

    }, [isfromOrderFetching, isfromOrderLoading, fromOrderId, syncFormWithDb, fromOrderData]);


    useEffect(() => {

        if (stockData?.data) {
            // syncFormWithDb(stockData?.data)
            setTempStockItems(stockData?.data)
        }

    }, [stockFetching, stockLoading, fromOrderId, transferType, syncFormWithDb, stockData]);

    const handleSubmitCustom = async (callback, data, text) => {
        console.log(callback, "callback")
        try {
            let returnData;
            if (text === "Updated") {
                returnData = await callback(data).unwrap();
            } else {
                returnData = await callback(data).unwrap();
            }
            if (returnData.statusCode === 1) {
                // toast.error(returnData.message);
            } else {
                Swal.fire({
                    icon: 'success',
                    title: `${text || 'Saved'} Successfully`,
                    showConfirmButton: false,
                    timer: 2000
                });
                // setId("")
                syncFormWithDb(undefined)
            }
        } catch (error) {
            console.log("handle");
        }
    };

    const validateData = (data) => {
        if (data.dueDate) {
            return true;
        }


        return false;
    };


    const saveData = (nextProcess) => {
        // if (!validateData(data)) {
        //   toast.info("Please fill all required fields...!", { position: "top-center" })
        //   return
        // }
        if (!window.confirm("Are you sure save the details ...?")) {
            return
        }
        if (nextProcess == "draft" && !id) {
            console.log(nextProcess, "nextProcess")

            handleSubmitCustom(addData, data = { ...data, draftSave: true }, "Added", nextProcess);
        }


        else if (id && nextProcess == "draft") {

            handleSubmitCustom(updateData, data = { ...data, draftSave: true }, "Updated", nextProcess);
        }
        else if (id) {

            handleSubmitCustom(updateData, data, "Updated", nextProcess);
        } else {
            handleSubmitCustom(addData, data, "Added", nextProcess);
        }
    }

    const inputRef1 = useRef(null);
    const inputPartyRef = useRef(null);
    const styleRef = useRef(null);

    useEffect(() => {
        if (inputRef1.current) {
            inputRef1.current.focus();
        }
    }, []);


    if (isSingleOrderLoading || isSingleOrderFetching || stockFetching || stockLoading) return <Loader />


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
                            onClick={() => {
                                OnNew()
                                onClose()
                            }}
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
                                    setValue={(value) => { setTransferType(value); OnNew() }}
                                    required={true}
                                    ref={inputRef1}
                                    openOnFocus={true}

                                />
                            </div>
                        </div>
                        <div className="col-span-2 border border-slate-200 p-2 bg-white rounded-md shadow-sm">
                            <h2 className="font-medium text-slate-700 mb-2">Order Details</h2>

                            <div className="grid grid-cols-1">
                                <div className="grid grid-cols-3 gap-x-3 gap-y-3">

                                    {transferType === "Order" && (
                                        <>
                                            <DropdownWithSearch
                                                options={orderData?.data}

                                                value={fromOrderId}
                                                setValue={setFromOrderId}
                                                // readOnly={id ? true : false}
                                                labelField={"docId"}
                                                label={"From Order No"}
                                                className={"bg-gradient-to-r from-green-500 via-emerald-500 "}
                                            />
                                            <div className="col-span-2" >

                                                <TextInput name="From Customer"
                                                    value={findFromList(fromCustomerId, supplierList?.data, "name")}
                                                    setValue={setFromCustomerId}
                                                    required={true}
                                                    readOnly={true}
                                                />
                                            </div>


                                        </>
                                    )}


                                    <DropdownWithSearch
                                        options={orderData?.data?.filter(item => item.id !== parseInt(fromOrderId))}

                                        value={toOrderId}
                                        setValue={setToOrderId}
                                        // readOnly={id ? true : false}
                                        labelField={"docId"}
                                        label={"To Order No"}
                                        className={"bg-gradient-to-r from-blue-500 via-purple-500"}
                                    />
                                    <div className="col-span-2" >

                                        <TextInput
                                            name={transferType === "Order" ? "To Customer" : "Customer"}
                                            placeholder="Contact name"
                                            value={findFromList(partyId, supplierList?.data, "name")}
                                            // setValue={setContactPersonName}
                                            disabled={true}
                                        />
                                    </div>




                                </div>
                            </div>
                        </div>

                    </div>
                    <div>


                        <FormItems orderItems={orderItems} setOrderItems={setOrderItems} setRequirementId={setRequirementId} requirementId={requirementId} yarnTotals={yarnTotals} setYarnTotals={setYarnTotals}
                            colorList={colorList?.data} yarnList={yarnList?.data} tempOrderItems={tempOrderItems} setTempOrderItems={setTempOrderItems}
                            stockItems={stockItems} setStockItems={setStockItems} tempStockItems={tempStockItems} setTempStockItems={setTempStockItems}
                            toOrderId={toOrderId} fromOrderId={fromOrderId} orderData={orderData?.data}

                        />


                    </div>

                    <div className="flex flex-col md:flex-row gap-2 justify-between mt-4">
                        {/* Left Buttons */}
                        <div className="flex gap-2 flex-wrap">
                            <button
                                onClick={() => saveData("new")}
                                className="bg-indigo-500 text-white px-4 py-1 rounded-md hover:bg-indigo-600 flex items-center text-sm">
                                <FiSave className="w-4 h-4 mr-2" />
                                Save & New
                            </button>
                            <button
                                // onClick={() => saveData("close")}
                                className="bg-indigo-500 text-white px-4 py-1 rounded-md hover:bg-indigo-600 flex items-center text-sm">
                                <HiOutlineRefresh className="w-4 h-4 mr-2" />
                                Save & Close
                            </button>
                            <button
                                // onClick={() => saveData("draft")} 
                                className="bg-indigo-500 text-white px-4 py-1 rounded-md hover:bg-indigo-600 flex items-center text-sm">
                                <HiOutlineRefresh className="w-4 h-4 mr-2" />
                                Draft Save
                            </button>
                        </div>

                        {/* Right Buttons */}
                        <div className="flex gap-2 flex-wrap">
                            {/* <button className="bg-emerald-600 text-white px-4 py-1 rounded-md hover:bg-emerald-700 flex items-center text-sm">
                                                                       <FiShare2 className="w-4 h-4 mr-2" />
                                                                       Email
                                                                   </button> */}
                            <button className="bg-yellow-600 text-white px-4 py-1 rounded-md hover:bg-yellow-700 flex items-center text-sm"
                            // onClick={() => setReadOnly(false)}
                            >
                                <FiEdit2 className="w-4 h-4 mr-2" />
                                Edit
                            </button>
                            <button className="bg-emerald-600 text-white px-4 py-1 rounded-md hover:bg-emerald-700 flex items-center text-sm">
                                <FaWhatsapp className="w-4 h-4 mr-2" />
                                WhatsApp
                            </button>
                            <button className="bg-slate-600 text-white px-4 py-1 rounded-md hover:bg-slate-700 flex items-center text-sm"
                            // onClick={() => setPrintModalOpen(true)}
                            >
                                <FiPrinter className="w-4 h-4 mr-2" />
                                Print
                            </button>
                        </div>
                    </div>
                </div>


            </div>
        </>
    )
}

export default StockTransferForm;







