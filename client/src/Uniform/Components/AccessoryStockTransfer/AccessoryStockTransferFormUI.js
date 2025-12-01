import { FaFileAlt, FaWhatsapp } from "react-icons/fa";
import { ReusableInput } from "../Order/CommonInput";
import { useCallback, useEffect, useRef, useState } from "react";
import { findFromList, getCommonParams } from "../../../Utils/helper";
import { DateInputNew, DropdownInput, DropdownWithSearch, ReusableSearchableInput, TextInput } from "../../../Inputs";
import { HiOutlineRefresh, HiPlus, HiX } from "react-icons/hi";
import { stockTransferType } from "../../../Utils/DropdownData";
import { useGetOrderByIdQuery, useGetStockValidationByIdQuery } from "../../../redux/uniformService/OrderService";
import { useGetPartyQuery } from "../../../redux/services/PartyMasterService";
import FormItems from "./FormItems";
import { useAddStockMutation, useDeleteStockMutation, useGetStockByIdQuery, useGetStockQuery, useUpdateStockMutation } from "../../../redux/services/StockService";
import { useGetColorMasterQuery } from "../../../redux/uniformService/ColorMasterService";
import { useGetYarnMasterQuery } from "../../../redux/uniformService/YarnMasterServices";
import { FiEdit2, FiPrinter, FiSave } from "react-icons/fi";
import Swal from "sweetalert2";
import { useAddStockTransferMutation, useGetStockTransferByIdQuery, useUpdateStockTransferMutation } from "../../../redux/uniformService/StockTransferService";
import { Loader } from "../../../Basic/components";
import { useGetaccessoryStockByIdQuery } from "../../../redux/services/AccessoryStockService";
import { useGetUomQuery } from "../../../redux/services/UomMasterService";
import { useGetAccessoryMasterQuery } from "../../../redux/uniformService/AccessoryMasterServices";
import { useGetSizeMasterQuery } from "../../../redux/uniformService/SizeMasterService";
import { useAddAccessoryStockTransferMutation, useGetAccessoryStockTransferByIdQuery, useUpdateAccessoryStockTransferMutation } from "../../../redux/uniformService/AcessoryStockTransferService";

const StockTransferForm = ({
    docId, id, readOnly, setId, setForm, setReadOnly,
    fromCustomerId, setFromCustomerId, onClose, setTransferType, transferType, toCustomerId, setToCustomerId, params, requirementId, setRequirementId,
    orderData, orderId, orderItems, setOrderItems, fromOrderId, setFromOrderId, setStockItems, stockItems, setTempOrderItems, tempOrderItems, tempStockItems, setTempStockItems,
    date, OnNew,
    yarnTotals, setYarnTotals, toOrderId, setToOrderId

}) => {



    const { data: supplierList } = useGetPartyQuery({ params: { ...params } });
    const { data: colorList } = useGetColorMasterQuery({ params: { ...params } });
    const { data: uomList } =
        useGetUomQuery({ params });

    const { data: accessoryList } =
        useGetAccessoryMasterQuery({ params });

    const { data: sizeList } =
        useGetSizeMasterQuery({ params });

    const { data: singleOrderData, isLoading: isSingleOrderLoading, isFetching: isSingleOrderFetching } = useGetStockValidationByIdQuery(toOrderId, { skip: !toOrderId });


    const { data: singleData, isLoading: isSingleDataLoading, isFetching: isSingleDataFetching, refetch } = useGetAccessoryStockTransferByIdQuery(id, { skip: !id });



    const {
        data: stockData, isFetching: stockFetching, isLoading: stockLoading, } = useGetaccessoryStockByIdQuery(
            {
                params: {
                    transferType,
                    fromOrderId,
                    storeId: 1
                },
            },
            {
                skip: transferType == "Order" && !fromOrderId

            }
        );
    const [addData] = useAddAccessoryStockTransferMutation();
    const [updateData] = useUpdateAccessoryStockTransferMutation();


    const data = {
        orderItems: orderItems?.filter(item => parseInt(item.transferQty) > 0),
        stockItems, fromOrderId, toOrderId, docId, transferType, fromCustomerId, toCustomerId, id


    }





    const syncFormWithDb = useCallback((data) => {




        if (id) {

            setOrderItems(data?.ToAccessoryTransferItems ? data?.ToAccessoryTransferItems : [])
            setStockItems(data?.FromAccessoryTransferItems ? data?.FromAccessoryTransferItems : [])
            setTransferType(data?.transferType ? data?.transferType : "")
            setFromCustomerId(data?.fromCustomerId ? data?.fromCustomerId : "")
            setToCustomerId(data?.toCustomerId ? data?.toCustomerId : "")

        } else {



            setToCustomerId(data?.partyId ? data?.partyId : "")





            setTempOrderItems(() => {

                const stockMap =
                    data?.AccessoryStock?.reduce((acc, item) => {
                        const key = `${item.accessoryId}-${item.colorId}-${item.uomId}-${item.sizeId}-${item?.orderDetailsId ? item?.orderDetailsId : ""}`;
                        acc[key] = (acc[key] || 0) + parseFloat(item.qty || 0);
                        return acc;
                    }, {}) || {};

                const result = data?.RequirementPlanningForm?.flatMap(form => {

                    const combinedColorName = form?.RequirementPlanningItems
                        ?.map(y => `${y.Color.name || ""}`.trim())
                        .join(" + ");

                    return form?.AccessoryRequirementPlanning?.map(item => {

                        const requiredQty = parseFloat(item?.requiredQty || 0);

                        const issuedQty = item?.AccessoryMaterialIssueItems?.reduce(
                            (sum, next) => sum + (parseFloat(next?.issueQty) || 0),
                            0
                        );

                        const remainingQty = Math.max(
                            parseFloat(item?.requiredQty || 0) - parseFloat(issuedQty || 0),
                            0
                        );

                        const poQty =
                            item?.AccessoryPoItems?.reduce((sum, p) => sum + parseFloat(p.qty || 0), 0) || 0;

                        const stockKey = `${item.accessoryId}-${item.colorId}-${item.uomId}-${item.sizeId}-${item?.orderDetailsId ? item?.orderDetailsId : ""}`;
                        const availableStock = stockMap[stockKey] || 0;

                        const usedStockQty = Math.min(requiredQty, availableStock);
                        const balanceQty = requiredQty - usedStockQty;

                        stockMap[stockKey] = availableStock - usedStockQty;

                        return {
                            ...item,
                            poQty,
                            requiredQty: Number(requiredQty?.toFixed(3)),
                            remainingQty: remainingQty,
                            issuedQty: Number(issuedQty?.toFixed(3)),
                            usedStockQty: Number(usedStockQty?.toFixed(3)),
                            balanceQty: Number(balanceQty?.toFixed(3)),
                            currentStock: Number(availableStock?.toFixed(3)),
                            orderDetailsId: form.orderDetailsId,
                            orderId: form.orderId,
                        };
                    });
                }) || [];

                return result;
            });
















        }

    }, [orderId, id]);


    console.log(tempOrderItems, "tempOrderItems")
    console.log(tempStockItems, "tempStockItems")

    console.log(orderItems, "orderItems")
    console.log(stockItems, "stockItems")

    console.log(stockData, "stockData")




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


    // useEffect(() => {

    //     if (fromOrderData?.data) {
    //         let data = fromOrderData?.data
    //         console.log()
    //         setFromCustomerId(fromOrderData?.data?.partyId ? fromOrderData?.data?.partyId : undefined)
    //        setTempStockItems(data?.map(item => ({
    //             ...item,
    //             stockQty: item?._sum?.qty
    //         })))


    //     }

    // }, [isfromOrderFetching, isfromOrderLoading, fromOrderId, syncFormWithDb, fromOrderData]);


    useEffect(() => {

        if (stockData?.data) {
            if (fromOrderId) {
                setFromCustomerId(stockData?.data?.[0]?.Order?.Party?.id ? stockData?.data?.[0]?.Order?.Party?.id : undefined)
                const grouped = Object.values(
                    stockData?.data?.reduce((acc, item) => {
                        const key = `${item.yarnId}-${item.colorId}-${item.orderId}-${item.orderDetailsId}`;

                        if (!acc[key]) {
                            acc[key] = {
                                ...item,
                                qty: item.qty
                            };
                        } else {
                            acc[key].qty += item.qty;
                        }

                        return acc;
                    }, {})
                );
                console.log(grouped, "grouped")
                setTempStockItems(grouped?.map(i => ({
                    ...i,
                    stockQty: i.qty,

                })))
            }
            else {

                setTempStockItems(stockData?.data?.map(item => ({
                    ...item,
                    stockQty: item?._sum?.qty
                })))
            }


        }

    }, [stockFetching, stockLoading, fromOrderId, transferType, syncFormWithDb, stockData]);



    const handleSubmitCustom = async (callback, data, text, nextProcess) => {
        console.log(callback, "callback")
        try {
            let returnData;
            if (text === "Updated") {
                returnData = await callback({id, body: data }).unwrap();
        } else {
            returnData = await callback(data).unwrap();
        }
        // if (returnData.statusCode === 1) {
        //     // toast.error(returnData.message);
        // } else {
        //     Swal.fire({
        //         icon: 'success',
        //         title: `${text || 'Saved'} Successfully`,
        //         showConfirmButton: false,
        //         timer: 2000
        //     });
        //     // setId("")
        //     syncFormWithDb(undefined)
        // }
        if (returnData?.statusCode === 0) {
            Swal.fire({
                title: text + "  " + "Successfully",
                icon: "success",

            });
            if (nextProcess == "new") {
                syncFormWithDb(undefined);
            }
            else {
                onClose()
            }

            // setId(returnData?.data?.id);
            // setForm(false)
            // refetch()



        } else {
            // toast.error(returnData?.message);
            Swal.fire({
                title: returnData?.message,
                icon: "error",
            });

        }
    } catch (error) {
        console.log("handle");
    }
};




function OrdergroupByYarnColor(arr) {
    return arr.reduce((acc, item) => {
        const key = `${item.yarnId}-${item.colorId}`;

        if (!acc[key]) {
            acc[key] = {
                yarnId: item.yarnId,
                colorId: item.colorId,
                Yarn: item?.Yarn?.name,
                Color: item?.Color.name,
                transferQty: 0
            };
        }

        acc[key].transferQty += Number(item.transferQty || 0);
        return acc;
    }, {});
}

function StockgroupByYarnColor(arr) {
    return arr.reduce((acc, item) => {
        const key = `${item.yarnId}-${item.colorId}`;

        if (!acc[key]) {
            acc[key] = {
                yarnId: item.yarnId,
                // Yarn: item?.Yarn?.name,
                // Color: item?.Color?.name,
                colorId: item.colorId,
                transferQty: 0

            };
        }

        acc[key].transferQty += Number(item.transferQty || 0);
        return acc;
    }, {});
}

const validateData = (data) => {
    if (data.fromOrderId && data?.toOrderId && data.transferType) {
        return true;
    }


    return false;
};

const saveData = (nextProcess) => {
    console.log(!validateQty(), "!validateQty()")

    // if (!validateData(data)) {
    //     Swal.fire({
    //         title: "Please fill all required fields...!",
    //         icon: "success",
    //     });
    //     return;
    // }

    function validateQty() {
        const g1 = OrdergroupByYarnColor(orderItems);
        const g2 = StockgroupByYarnColor(stockItems);

        for (const key of Object.keys(g1)) {
            const item1 = g1[key];
            const item2 = g2[key];

            if (item1?.transferQty > item2?.transferQty) {
                Swal.fire({
                    title: `Qty mismatch → Yarn  ${item1?.Yarn}, Color ${item1?.Color}, TransferQty: ${item1?.transferQty}, Issue Qty: ${item2?.transferQty}`,
                    icon: "warning",
                    width: "1000px",
                });
                return false;
            }
        }

        return true;
    }

    if (!validateQty()) {
        return;
    }

    // 4️⃣ Confirm popup
    if (!window.confirm("Are you sure save the details ...?")) {
        return;
    }

    // 5️⃣ Save logic
    if (nextProcess === "draft" && !id) {
        handleSubmitCustom(addData, { ...data, draftSave: true }, "Added", nextProcess);
    }
    else if (id && nextProcess === "draft") {
        handleSubmitCustom(updateData, { ...data, draftSave: true }, "Updated", nextProcess);
    }
    else if (id) {
        handleSubmitCustom(updateData, data, "Updated", nextProcess);
    }
    else {
        handleSubmitCustom(addData, data, "Added", nextProcess);
    }
};


const inputRef1 = useRef(null);


useEffect(() => {
    if (inputRef1.current) {
        inputRef1.current.focus();
    }
}, []);


if (isSingleOrderLoading || isSingleOrderFetching || stockFetching || stockLoading || isSingleDataLoading || isSingleDataFetching) return <Loader />


return (
    <>
        <div className="w-full h-[84vh] bg-[#f1f1f0] mx-auto rounded-md shadow-md px-2 py-1 ">
            <div className="flex justify-between items-center mb-1">
                <h1 className="text-2xl font-bold text-gray-800">Accessory Stock Transfer</h1>
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
                            setId(" ")
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
                <div className="grid grid-cols-1 md:grid-cols-5 gap-2">


                    <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm col-span-1">
                        <h2 className="font-medium text-slate-700 mb-2">
                            Basic Details
                        </h2>
                        <div className="grid grid-cols-2 gap-1">
                            <ReusableInput label="Doc Id" readOnly value={docId} />
                            <ReusableInput label="Doc Date" value={date} type={"date"} required={true} readOnly={true} disabled />

                        </div>
                    </div>
                    <div className="col-span-4 border border-slate-200 p-2 bg-white rounded-md shadow-sm">
                        <h2 className="font-medium text-slate-700 mb-2">Transfer Order Details</h2>

                        <div className="grid grid-cols-1">
                            <div className="grid grid-cols-10 gap-x-3 gap-y-1">
                                <div className="col-span-2">

                                    <DropdownInput name="Stock Transfer Type"
                                        options={stockTransferType}
                                        value={transferType}
                                        setValue={(value) => { setTransferType(value); OnNew() }}
                                        required={true}
                                        ref={inputRef1}
                                        openOnFocus={true}
                                        readOnly={readOnly}

                                    />
                                </div>

                                {transferType === "General" && (

                                    <div className="col-span-1" >

                                        <TextInput name="From Order"
                                            value={"General"}
                                            required={true}
                                            readOnly={true}
                                        // className={`${transferType == "General" ? "bg-purple-500 text-white" : ""}`}

                                        />
                                    </div>


                                )}
                                {transferType === "Order" && (
                                    <>
                                        <div className="col-span-1">




                                            {id ?
                                                <TextInput

                                                    name={"From Order No"}
                                                    value={findFromList(singleData?.data?.fromOrderId, orderData?.data, "docId")}
                                                // className={"bg-purple-400 text-white"}

                                                />
                                                :

                                                <DropdownWithSearch
                                                    options={orderData?.data?.filter(i => i.isPlanning)}

                                                    value={fromOrderId}
                                                    setValue={setFromOrderId}
                                                    // readOnly={id ? true : false}
                                                    labelField={"docId"}
                                                    label={"From Order No"}
                                                // className={"bg-gradient-to-r from-purple-500 via-purple-500"}
                                                // className={"bg-purple-400 text-white"}

                                                />

                                            }
                                        </div>
                                        <div className="col-span-3">

                                            <TextInput name="From Customer"
                                                value={findFromList(fromCustomerId, supplierList?.data, "name")}
                                                setValue={setFromCustomerId}
                                                required={true}
                                                readOnly={true}
                                            />
                                        </div>


                                    </>
                                )}




                                {id ?
                                    <TextInput

                                        name={"To Order No"}
                                        value={findFromList(singleData?.data?.toOrderId, orderData?.data, "docId")}
                                    // className={"bg-[#4ADE80]"}

                                    />
                                    :

                                    <DropdownWithSearch
                                        options={orderData?.data?.filter(item => item.id !== parseInt(fromOrderId) && item.isPlanning)}
                                        required={true}

                                        value={toOrderId}
                                        setValue={setToOrderId}
                                        // readOnly={id ? true : false}
                                        labelField={"docId"}
                                        label={"To Order No"}



                                    />

                                }

                                <div className="col-span-3" >

                                    <TextInput
                                        name={transferType === "Order" ? "To Customer" : "Customer"}
                                        placeholder="Contact name"
                                        value={findFromList(toCustomerId, supplierList?.data, "name")}
                                        // setValue={setContactPersonName}
                                        disabled={true}
                                    />
                                </div>




                            </div>
                        </div>
                    </div>

                </div>
                <div className="h-[55vh] overflow-y-auto">
                    <FormItems id={id} orderItems={orderItems} setOrderItems={setOrderItems} setRequirementId={setRequirementId} requirementId={requirementId} yarnTotals={yarnTotals} setYarnTotals={setYarnTotals}
                        colorList={colorList?.data} uomList={uomList?.data} tempOrderItems={tempOrderItems} setTempOrderItems={setTempOrderItems} accessoryList={accessoryList?.data} sizeList={sizeList?.data}
                        stockItems={stockItems} setStockItems={setStockItems} tempStockItems={tempStockItems} setTempStockItems={setTempStockItems} singleData={singleData} readOnly={readOnly} setReadOnly={setReadOnly}
                        toOrderId={toOrderId} fromOrderId={fromOrderId} orderData={orderData?.data} transferType={transferType}

                    />
                </div>
                <div className=" flex flex-col md:flex-row gap-2 justify-between mt-5">
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

                    </div>

                    <div className="flex gap-2 flex-wrap">

                        <button className="bg-yellow-600 text-white px-4 py-1 rounded-md hover:bg-yellow-700 flex items-center text-sm"
                            onClick={setReadOnly(false)}
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







