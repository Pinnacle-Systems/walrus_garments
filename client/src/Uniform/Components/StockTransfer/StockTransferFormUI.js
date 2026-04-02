import { FaFileAlt, FaWhatsapp } from "react-icons/fa";
import { ReusableInput } from "../Order/CommonInput";
import { useCallback, useEffect, useRef, useState } from "react";
import { findFromList, getCommonParams, isGridDatasValid } from "../../../Utils/helper";
import { DateInputNew, DropdownInput, DropdownInputNew, DropdownWithSearch, ReusableSearchableInput, TextInput, TextInputNew1 } from "../../../Inputs";
import { HiOutlineRefresh, HiPlus, HiX } from "react-icons/hi";
import { stockTransferType } from "../../../Utils/DropdownData";
import { useGetOrderByIdQuery, useGetStockValidationByIdQuery } from "../../../redux/uniformService/OrderService";
import { useGetPartyQuery } from "../../../redux/services/PartyMasterService";
import FormItems from "./FormItems";
import { useAddStockMutation, useDeleteStockMutation, useGetStockByIdQuery, useGetStockQuery, useUpdateStockMutation, useGetUnifiedStockQuery, useLazyGetUnifiedStockByBarcodeQuery } from "../../../redux/services/StockService";
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
import useInvalidateTags from "../../../CustomHooks/useInvalidateTags";
import Modal from "../../../UiComponents/Modal";
import BarCodePrintFormat from "./BarcodePrintFormat";

const StockTransferForm = ({
    docId, id, readOnly, setId, setForm,
    fromCustomerId, setFromCustomerId, onClose, setTransferType, transferType, toCustomerId, setToCustomerId, params, requirementId, setRequirementId,
    orderData, orderId, orderItems, setOrderItems, fromOrderId, setFromOrderId, setStockItems, stockItems, setTempOrderItems, tempOrderItems, tempStockItems, setTempStockItems,
    date, OnNew,
    yarnTotals, setYarnTotals, toOrderId, branchId

}) => {



    const [searchItem, setSearchItem] = useState("")
    const [searchColor, setSearchColor] = useState("")
    const [searchSize, setSearchSize] = useState("")
    const [deliveryChallanNo, setDeliveryChallanNo] = useState("")

    const [fromLocationId, setFromLocationId] = useState("")
    const [toLocationId, setToLocationId] = useState("")
    const [orderToGeneral, setOrderToGeneral] = useState(false)
    const [barcodePrintOpen, setBarcodePrintOpen] = useState(false);
    const [barcode, setBarcode] = useState("");


    const { data: colorList } = useGetColorMasterQuery({ params: { ...params } });
    const { data: uomList } = useGetUomQuery({ params });
    const { data: itemList } = useGetItemMasterQuery({ params });
    const { data: sizeList } = useGetSizeMasterQuery({ params });
    const { data: locationData } = useGetLocationMasterQuery({ params: { ...params } });

    const [invalidateTagsDispatch] = useInvalidateTags();


    const [addData] = useAddStockTransferMutation();
    const [updateData] = useUpdateStockTransferMutation();





    const { data: singleData, isLoading: isSingleDataLoading, isFetching: isSingleDataFetching, refetch } = useGetStockTransferByIdQuery(id, { skip: !id });


    const { data: allStockData, isLoading, isFetching } = useGetUnifiedStockQuery(
        {
            params: {
                ...params,
                storeId: fromLocationId,
                searchItem,
                searchColor,
                searchSize


            }
        }, { skip: id || !fromLocationId });

    const [triggerBarcodeSearch, { isLoading: isBarcodeLoading, isFetching: isBarcodeFetching }] = useLazyGetUnifiedStockByBarcodeQuery({ skip: !barcode });

    const handleBarcodeSearch = async (e) => {
        if (e.key === 'Enter' || e.type === 'blur') {
            if (!barcode) return;
            if (!fromLocationId) {
                Swal.fire({ title: "Please select From Location first", icon: "warning" });
                return;
            }

            try {
                const res = await triggerBarcodeSearch({ params: { barcode, storeId: fromLocationId, branchId } }).unwrap();
                if (res.statusCode === 0 && res.data) {
                    const newItem = {
                        ...res.data,
                        // transferQty: 1,
                        // stockQty: res.data.availableQty
                    };

                    console.log(newItem, "newItem");


                    // Check if already in list
                    const existsIndex = stockItems.findIndex(i =>
                        i.itemId === newItem.itemId &&
                        i.sizeId === newItem.sizeId &&
                        i.colorId === newItem.colorId
                    );
                    if (existsIndex !== -1) {
                        // ✅ UPDATE EXISTING ROW
                        const updatedItems = [...stockItems];

                        updatedItems[existsIndex] = {
                            ...updatedItems[existsIndex],
                            ...newItem,
                            // Optional: increase qty instead of replace
                            transferQty: (updatedItems[existsIndex].transferQty || 0) + 1,
                        };

                        setStockItems(updatedItems);
                    } else {
                        const firstEmptyIndex = stockItems.findIndex(i => !i.itemId);
                        if (firstEmptyIndex !== -1) {
                            const updatedItems = [...stockItems];
                            updatedItems[firstEmptyIndex] = newItem;
                            setStockItems(updatedItems);
                        } else {
                            setStockItems([...stockItems, newItem]);
                        }
                    }
                    setBarcode(""); // Clear barcode after successful scan
                } else {
                    Swal.fire({ title: res.message || "Stock not found", icon: "error" });
                }
            } catch (err) {
                console.error("Barcode search error:", err);
            }
        }
    };



    const data = {
        stockItems: stockItems?.filter(i => i.itemId),
        docId,
        toLocationId,
        fromLocationId,
        branchId,
        deliveryChallanNo

    }





    const syncFormWithDb = useCallback((data) => {




        if (id) {

            setFromLocationId(data?.fromLocationId ? data?.fromLocationId : "")
            setToLocationId(data?.toLocationId ? data?.toLocationId : "")
            setStockItems(data?.FromLocationTransferItems ? data?.FromLocationTransferItems : [])
            setDeliveryChallanNo(data?.deliveryChallanNo ? data?.deliveryChallanNo : "")

        } else {

            setFromLocationId(data?.fromLocationId ? data?.fromLocationId : "")
            setToLocationId(data?.toLocationId ? data?.toLocationId : "")
            setStockItems(data?.ToLocationTransferTtems ? data?.ToLocationTransferTtems : [])
            setDeliveryChallanNo(data?.deliveryChallanNo ? data?.deliveryChallanNo : "")

        }

    }, [orderId, id]);



    useEffect(() => {

        if (singleData?.data) {
            syncFormWithDb(singleData?.data)
        }

    }, [isSingleDataFetching, isSingleDataLoading, id, syncFormWithDb, singleData]);










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

            invalidateTagsDispatch()


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





    const validateData = (data) => {
        if (data?.fromLocationId && data?.toLocationId && data?.deliveryChallanNo) {
            return true;
        }


        return false;
    };

    const saveData = (nextProcess) => {
        console.log(data, "data")
        if (!validateData(data)) {
            Swal.fire({
                title: "Please fill all required fields...!",
                icon: "warning",

            });
            return
        }
        let mandatoryFields = ["transferQty"];

        if (!isGridDatasValid((data?.stockItems)?.filter(i => i.itemId), false, mandatoryFields)) {
            Swal.fire({
                title: "Please fill Transfer Qty  ",
                icon: "warning",
            });
            return;
        }



        if (!window.confirm("Are you sure save the details ...?")) {
            return;
        }

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


    if (isBarcodeFetching || isBarcodeLoading) return <Loader />


    return (
        <>
            <Modal
                isOpen={barcodePrintOpen}
                onClose={() => setBarcodePrintOpen(false)}
                widthClass={"px-2 h-[90%] w-[90%]"}
            >
                <BarCodePrintFormat
                    data={stockItems?.filter(i => i.itemId)}
                    // barCodePerPage={barCodePerPage}
                    sizeList={sizeList}
                    itemList={itemList}
                />
            </Modal>
            <div className="w-full h-full bg-[#f1f1f0] mx-auto rounded-md shadow-md px-2 py-1 ">
                <div className="flex justify-between items-center mb-1">
                    <h1 className="text-2xl font-bold text-gray-800">Stock Transfer</h1>
                    <div className="gap-4">
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

                                        <DropdownInputNew name="From Location"
                                            options={dropDownListObject(id ? storeOptions : storeOptions?.filter(item => item.active), "storeName", "id")}
                                            value={fromLocationId} setValue={setFromLocationId} required={true}
                                            readOnly={id || readOnly} clear={true}
                                        />
                                    </div>
                                    <div className="col-span-2">

                                        <DropdownInputNew name="To Location"
                                            options={dropDownListObject(id ? storeOptions : storeOptions?.filter(item => item.active && item.id != fromLocationId), "storeName", "id")}
                                            value={toLocationId} setValue={setToLocationId} required={true}
                                            disabled={!fromLocationId}
                                            readOnly={readOnly || !fromLocationId}
                                            clear={true}
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <TextInputNew1
                                            name="Delivery Challan No"
                                            type="text"
                                            value={deliveryChallanNo}
                                            setValue={setDeliveryChallanNo}
                                            readOnly={readOnly}
                                            required={true}
                                        // disabled={childRecord.current > 0}
                                        />
                                    </div>


                                    {/* <div className="ml-3 col-span-3 flex items-center justify-between">

                                        <div className="text-center">
                                            <p className="text-xs text-gray-400 uppercase">From</p>
                                            <p className="font-semibold text-slate-700">
                                                {findFromList(fromLocationId, locationData?.data, "storeName")}
                                            </p>
                                        </div>

                                        <div className="flex flex-col items-center px-4">
                                            <span className="text-gray-400 text-xl">➜</span>
                                            <span className="text-xs text-gray-400">Transfer</span>
                                        </div>

                                        <div className="text-center">
                                            <p className="text-xs text-gray-400 uppercase">To</p>
                                            <p className="font-semibold text-slate-700">
                                                {findFromList(toLocationId, locationData?.data, "storeName")}
                                            </p>
                                        </div>



                                    </div> */}
                                    <div className="col-span-3">
                                        <p className="block  font-bold text-slate-700 mb-1 text-xs">Barcode</p>

                                        <input
                                            name="Barcode"
                                            value={barcode}
                                            onChange={(e) => setBarcode(e.target.value)}
                                            onKeyDown={handleBarcodeSearch}
                                            // onBlur={handleBarcodeSearch}
                                            placeholder="Scan the Barcode"
                                            className="w-full px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                    {/* <div className="col-span-1">
                                        <button
                                            className="ml-4 px-4 py-2 mt-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition"
                                            onClick={() => setOrderToGeneral(true)}
                                        >
                                            Fill Stock
                                        </button>
                                    </div> */}










                                </div>
                            </div>
                        </div>


                    </div>
                    <div className="h-[430px]">
                        <FormItems id={id} orderItems={orderItems} setOrderItems={setOrderItems} setRequirementId={setRequirementId} requirementId={requirementId} yarnTotals={yarnTotals} setYarnTotals={setYarnTotals}
                            colorList={colorList?.data} tempOrderItems={tempOrderItems} setTempOrderItems={setTempOrderItems}
                            stockItems={stockItems} setStockItems={setStockItems} tempStockItems={tempStockItems} setTempStockItems={setTempStockItems} singleData={singleData}
                            toOrderId={toOrderId} fromOrderId={fromOrderId} orderData={orderData?.data} transferType={transferType}
                            fromLocationId={fromLocationId} locationData={locationData} itemList={itemList?.data} uomList={uomList?.data}
                            sizeList={sizeList?.data} toLocationId={toLocationId} orderToGeneral={orderToGeneral} setOrderToGeneral={setOrderToGeneral}
                            searchItem={searchItem} setSearchItem={setSearchItem}
                            searchColor={searchColor} setSearchColor={setSearchColor}
                            searchSize={searchSize} setSearchSize={setSearchSize}
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
                            <button className="bg-slate-600 text-white px-4 py-1 rounded-md hover:bg-slate-700 flex items-center text-sm"
                                onClick={() => setBarcodePrintOpen(true)}
                                disabled={findFromList(toLocationId, locationData?.data, "storeName") != "DISCOUNT SECTION"}
                            >
                                <FiPrinter className="w-4 h-4 mr-2" />
                                Barcode Generation
                            </button>

                        </div>
                    </div>

                </div>







            </div>
        </>
    )
}

export default StockTransferForm;







