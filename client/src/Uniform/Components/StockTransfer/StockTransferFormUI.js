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
import { dropDownListObject } from "../../../Utils/contructObject";
import { useGetLocationMasterQuery } from "../../../redux/uniformService/LocationMasterServices";
import { useGetUomQuery } from "../../../redux/services/UomMasterService";
import { useGetItemMasterQuery } from "../../../redux/uniformService/ItemMasterService";
import { useGetSizeMasterQuery } from "../../../redux/uniformService/SizeMasterService";

const StockTransferForm = ({
    docId, id, readOnly, setId, setForm,
    fromCustomerId, setFromCustomerId, onClose, setTransferType, transferType, toCustomerId, setToCustomerId, params, requirementId, setRequirementId,
    orderData, orderId, orderItems, setOrderItems, fromOrderId, setFromOrderId, setStockItems, stockItems, setTempOrderItems, tempOrderItems, tempStockItems, setTempStockItems,
    date, OnNew,
    yarnTotals, setYarnTotals, toOrderId, branchId

}) => {



    const [fromLocationId, setFromLocationId] = useState("")
    const [toLocationId, setToLocationId] = useState("")


    const { data: colorList } = useGetColorMasterQuery({ params: { ...params } });
    const { data: uomList } = useGetUomQuery({ params });
    const { data: itemList } = useGetItemMasterQuery({ params });
    const { data: sizeList } = useGetSizeMasterQuery({ params });
    const { data: locationData } = useGetLocationMasterQuery({ params: { ...params } });








    const { data: singleData, isLoading: isSingleDataLoading, isFetching: isSingleDataFetching, refetch } = useGetStockTransferByIdQuery(id, { skip: !id });


    const { data: allStockData, isLoading, isFetching } = useGetStockQuery({ params: { ...params, storeId: fromLocationId } });

    console.log(allStockData, "allStockData  ")



    const {
        data: stockData, isFetching: stockFetching, isLoading: stockLoading, } = useGetStockByIdQuery(
            { params: { storeId: toLocationId }, }, { skip: fromLocationId });




    const { data: singleOrderData, isLoading: isSingleOrderLoading, isFetching: isSingleOrderFetching } = useGetStockValidationByIdQuery(toOrderId, { skip: !toOrderId });

    const [addData] = useAddStockTransferMutation();
    const [updateData] = useUpdateStockTransferMutation();
    //   const [removeData] = useDeleteStockMutation();


    const data = {
        stockItems,  docId, 
        toLocationId,
        fromLocationId,
        branchId,


    }





    const syncFormWithDb = useCallback((data) => {




        if (id) {

            setFromLocationId(data?.fromLocationId ? data?.fromLocationId : "")
            setToLocationId(data?.toLocationId ? data?.toLocationId : "")
            setStockItems(data?.FromLocationTransferItems ? data?.FromLocationTransferItems : "")

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


        setTempStockItems(allStockData?.data?.map(item => ({
            ...item,
            stockQty: item?._sum?.qty
        })))





    }, [allStockData, isLoading, isFetching]);



    const handleSubmitCustom = async (callback, data, text, nextProcess) => {
        try {
            let returnData;
            if (text === "Updated") {
                returnData = await callback({ id, body: data }).unwrap();
            } else {
                returnData = await callback(data).unwrap();
            }

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



            } else {
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
        console.log(arr, "OrdergroupByYarnColor")
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
        console.log(arr, "StockgroupByYarnColor")

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

        if (transferType != "OrderToGeneral") {
            if (!validateQty()) {
                return;
            }
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




    const storeOptions = locationData ?
        locationData?.data?.filter(item => parseInt(item.locationId) === parseInt(params.branchId)) :
        []


    if (isSingleOrderLoading || isSingleOrderFetching || stockFetching || stockLoading || isSingleDataLoading || isSingleDataFetching) return <Loader />


    return (
        <>
            <div className="w-full h-[84vh] bg-[#f1f1f0] mx-auto rounded-md shadow-md px-2 py-1 ">
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

                                        <DropdownInput name="From Location"
                                            options={dropDownListObject(id ? storeOptions : storeOptions?.filter(item => item.active), "storeName", "id")}
                                            value={fromLocationId} setValue={setFromLocationId} required={true}
                                            readOnly={id || readOnly} clear={true}
                                        />
                                    </div>
                                    <div className="col-span-2">

                                        <DropdownInput name="To Location"
                                            options={dropDownListObject(id ? storeOptions : storeOptions?.filter(item => item.active && item.id != fromLocationId), "storeName", "id")}
                                            value={toLocationId} setValue={setToLocationId} required={true}
                                            disabled={!fromLocationId}
                                            readOnly={readOnly || !fromLocationId}
                                            clear={true}
                                        />
                                    </div>











                                </div>
                            </div>
                        </div>

                    </div>
                    <div className="h-[55vh] overflow-y-auto">
                        <FormItems id={id} orderItems={orderItems} setOrderItems={setOrderItems} setRequirementId={setRequirementId} requirementId={requirementId} yarnTotals={yarnTotals} setYarnTotals={setYarnTotals}
                            colorList={colorList?.data}  tempOrderItems={tempOrderItems} setTempOrderItems={setTempOrderItems}
                            stockItems={stockItems} setStockItems={setStockItems} tempStockItems={tempStockItems} setTempStockItems={setTempStockItems} singleData={singleData}
                            toOrderId={toOrderId} fromOrderId={fromOrderId} orderData={orderData?.data} transferType={transferType}
                            fromLocation={fromLocationId} locationData={locationData} itemList={itemList?.data} uomList={uomList?.data}
                            sizeList={sizeList?.data}
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







