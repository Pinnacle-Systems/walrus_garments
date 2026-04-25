import { FaFileAlt, FaWhatsapp } from "react-icons/fa";
import { ReusableInput } from "../Order/CommonInput";
import { useCallback, useEffect, useRef, useState } from "react";
import { findFromList, getCommonParams, getConfiguredStockDrivenFields, isGridDatasValid } from "../../../Utils/helper";
import { ModeChip } from "../../../Utils/helper";
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
import { useGetItemMasterQuery, useGetItemPriceListQuery } from "../../../redux/uniformService/ItemMasterService";
import { useGetSizeMasterQuery } from "../../../redux/uniformService/SizeMasterService";
import { useGetoffersPromotionsQuery } from "../../../redux/uniformService/Offer&PromotionsService";
import { useGetcollectionsQuery } from "../../../redux/uniformService/CollectionsService";
import useInvalidateTags from "../../../CustomHooks/useInvalidateTags";
import Modal from "../../../UiComponents/Modal";
import BarCodePrintFormat from "./BarcodePrintFormat";
import { useFormKeyboardNavigation } from "../../../CustomHooks/useFormKeyboardNavigation";
import { useGetStockReportControlQuery } from "../../../redux/uniformService/StockReportControl.Services";
import { IoArrowBackCircleSharp } from "react-icons/io5";

import VarientsSelection from "./VarientsSelection";

const StockTransferForm = ({
    docId, setDocId, id, readOnly, setId, setForm,
    fromCustomerId, setFromCustomerId, onClose, setTransferType, transferType, toCustomerId, setToCustomerId, params, requirementId, setRequirementId,
    orderData, orderId, orderItems, setOrderItems, fromOrderId, setFromOrderId, setStockItems, stockItems, setTempOrderItems, tempOrderItems, tempStockItems, setTempStockItems,
    date, OnNew,
    yarnTotals, setYarnTotals, toOrderId, hasPermission, setReadOnly

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
    const { data: itemPriceList } = useGetItemPriceListQuery({ params });

    const { data: sizeList } = useGetSizeMasterQuery({ params });
    const { data: locationData } = useGetLocationMasterQuery({ params: { ...params } });
    const { data: stockReportControlData } = useGetStockReportControlQuery({ params });
    const { data: offersData } = useGetoffersPromotionsQuery({ params: { active: true } });
    const { data: collectionsData } = useGetcollectionsQuery({ params: { active: true } });

    const { branchId, userId, companyId, finYearId } = getCommonParams();


    const [invalidateTagsDispatch] = useInvalidateTags();
    const { refs, handlers, focusFirstInput } = useFormKeyboardNavigation();
    const {
        firstInputRef: nameRef,
        movedToNextSaveNewRef,
        saveNewButtonRef,
        saveCloseButtonRef,
    } = refs;

    const [addData] = useAddStockTransferMutation();
    const [updateData] = useUpdateStockTransferMutation();
    const stockDrivenFields = getConfiguredStockDrivenFields(stockReportControlData?.data?.[0]);

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

    const [barcodeMatches, setBarcodeMatches] = useState([]);
    const [barcodeModalOpen, setBarcodeModalOpen] = useState(false);

    const addScannedItems = (newItems) => {
        setStockItems(prev => {
            let updated = [...prev];
            let errors = [];

            newItems.forEach(item => {
                const availableStock = parseFloat(item.stockQty || item.qty || 0);
                const newItem = {
                    ...item,
                    transferQty: item.transferQty || 1,
                    stockQty: availableStock
                };

                const existsIndex = updated.findIndex(i =>
                    i.itemId === newItem.itemId &&
                    i.sizeId === newItem.sizeId &&
                    i.colorId === newItem.colorId &&
                    stockDrivenFields.every((field) => String(i?.[field.key] || "") === String(newItem?.[field.key] || ""))
                );

                if (existsIndex !== -1) {
                    const currentQty = parseFloat(updated[existsIndex].transferQty) || 0;
                    if (currentQty + 1 > availableStock) {
                        errors.push(item.item_name || "Item");
                        return;
                    }
                    updated[existsIndex] = {
                        ...updated[existsIndex],
                        ...newItem,
                        transferQty: currentQty + 1,
                    };
                } else {
                    if (1 > availableStock) {
                        errors.push(item.item_name || "Item");
                        return;
                    }
                    const firstEmptyIndex = updated.findIndex(i => !i.itemId);
                    if (firstEmptyIndex !== -1) {
                        updated[firstEmptyIndex] = newItem;
                    } else {
                        updated.push(newItem);
                    }
                }
            });

            if (errors.length > 0) {
                setTimeout(() => {
                    Swal.fire({
                        title: "Insufficient Stock",
                        text: `Could not transfer more than available stock for: ${[...new Set(errors)].join(", ")}`,
                        icon: "error"
                    });
                }, 0);
            }

            return updated;
        });
    };

    const handleBarcodeSearch = async (e) => {
        if (e.key === 'Enter' || e.type === 'blur') {
            if (!barcode) return;
            if (!fromLocationId) {
                Swal.fire({ title: "Please select From Location first", icon: "warning" });
                return;
            }

            try {
                const res = await triggerBarcodeSearch({ params: { barcode, storeId: fromLocationId, branchId } }).unwrap();

                if (res?.needsResolution) {
                    setBarcodeMatches(res.matches || []);
                    setBarcodeModalOpen(true);
                    return;
                }

                if (res.statusCode === 0 && res.data) {
                    addScannedItems([{ ...res.data }]);
                    setBarcode(""); // Clear barcode after successful scan
                } else {
                    Swal.fire({ title: res.message || "Stock not found", icon: "error" });
                }
            } catch (err) {
                console.error("Barcode search error:", err);
            }
        }
    };

    const onBarcodeResolutionConfirm = (selectedItems) => {
        addScannedItems(selectedItems);
        setBarcodeModalOpen(false);
        setBarcode(""); // Clear barcode after resolution
    };



    const data = {
        stockItems: stockItems?.filter(i => i.itemId),
        docId,
        toLocationId,
        fromLocationId,
        branchId,
        deliveryChallanNo,
        finYearId

    }





    const syncFormWithDb = useCallback((data) => {




        if (id) {
            setDocId(data?.docId ? data?.docId : "")
            setFromLocationId(data?.fromLocationId ? data?.fromLocationId : "")
            setToLocationId(data?.toLocationId ? data?.toLocationId : "")
            setStockItems(data?.FromLocationTransferItems ? data?.FromLocationTransferItems : [])
            setDeliveryChallanNo(data?.deliveryChallanNo ? data?.deliveryChallanNo : "")


        } else {
            setDocId(data?.docId ? data?.docId : "")

            setFromLocationId(data?.fromLocationId ? data?.fromLocationId : "")
            setToLocationId(data?.toLocationId ? data?.toLocationId : "")
            setStockItems(data?.FromLocationTransferItems ? data?.FromLocationTransferItems : [])
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
                    showConfirmButton: true,
                });


                if (nextProcess == "new") {
                    syncFormWithDb(undefined);
                    OnNew()
                }
                else {
                    onClose()
                    syncFormWithDb(undefined);
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


        if (findFromList(toLocationId, locationData?.data, "storeName") === "DISCOUNT SECTION") {
            const selectedItems = stockItems?.filter(i => i.itemId);
            for (const item of selectedItems) {
                const hasClearanceOffer = offersData?.data?.some(offer => {
                    if (!offer.applyToClearance) return false;
                    if (offer.scopeMode === 'Global') return true;

                    return offer.OfferScope?.some(scope => {
                        const type = String(scope.type).toLowerCase();
                        if (type === 'item' && scope.refId === parseInt(item.itemId)) return true;
                        if (type === 'collection') {
                            const collection = collectionsData?.data?.find(c => c.id === scope.refId);
                            return collection?.CollectionItems?.some(ci => ci.itemId === parseInt(item.itemId));
                        }
                        return false;
                    });
                });

                if (!hasClearanceOffer) {
                    const itemObj = (itemList?.data || itemList || [])?.find(i => parseInt(i.id) === parseInt(item.itemId));
                    Swal.fire({
                        title: "Offer Required",
                        text: `Item "${itemObj?.name || item.itemId}" does not have an active clearance offer.`,
                        icon: "error"
                    });
                    return;
                }
            }

            // const hasMismatch = selectedItems?.some(i =>
            //     parseFloat(i.stockQty || 0).toFixed(3) !== parseFloat(i.transferQty || 0).toFixed(3)
            // );
            // if (hasMismatch) {
            //     Swal.fire({
            //         title: "Validation Error",
            //         text: "For DISCOUNT SECTION, Stock Quantity and Transfer Quantity must match exactly for all items.",
            //         icon: "error",
            //     });
            //     return;
            // }
        }

        if (!validateData(data)) {
            Swal.fire({
                title: "Please fill all required fields...!",
                icon: "warning",

            });
            return
        }
        let mandatoryFields = ["transferQty"];
        mandatoryFields.push(...stockDrivenFields.map((field) => field.key));
        if (!isGridDatasValid((data?.stockItems)?.filter(i => i.itemId), false, mandatoryFields)) {
            Swal.fire({
                title: "Please fill Transfer Qty  ",
                icon: "warning",
            });
            return;
        }



        // if (findFromList(toLocationId, locationData?.data, "storeName") === "DISCOUNT SECTION") {
        //     const hasMismatch = stockItems?.filter(i => i.itemId)?.some(i => 
        //         parseFloat(i.stockQty || 0).toFixed(3) !== parseFloat(i.transferQty || 0).toFixed(3)
        //     );
        //     if (hasMismatch) {
        //         Swal.fire({
        //             title: "Validation Error",
        //             text: "For DISCOUNT SECTION, Stock Quantity and Transfer Quantity must match exactly for all items.",
        //             icon: "error",
        //         });
        //         return;
        //     }
        // }



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
                    itemPriceList={itemPriceList}
                    toLocationId={toLocationId}
                    locationData={locationData}
                    offersData={offersData}
                    collectionsData={collectionsData}
                />
            </Modal>
            <Modal
                isOpen={barcodeModalOpen}
                onClose={() => setBarcodeModalOpen(false)}
                widthClass={" h-[90%] w-[90%]"}
            >
                <VarientsSelection
                    matches={barcodeMatches}
                    onConfirm={onBarcodeResolutionConfirm}
                    onClose={() => setBarcodeModalOpen(false)}
                    stockDrivenFields={stockDrivenFields}
                />
            </Modal>
            <div className="flex flex-col h-full bg-[#f1f1f0] overflow-hidden">
                <div className="flex-none w-full bg-white mx-auto rounded-md shadow-sm px-2  border-b border-gray-200 mb-1">
                    <div className="flex justify-between items-center py-1">
                        <h1 className="text-md font-bold text-gray-800">Stock Transfer</h1>
                        <div className="flex flex-row gap-2">
                            <ModeChip id={id} readOnly={readOnly} />
                            <button
                                onClick={() => {
                                    OnNew()
                                    setId(" ")
                                    onClose()
                                }}
                                className=" text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
                                title="Open Report"
                            >
                                <IoArrowBackCircleSharp className="w-7 h-7" />
                            </button>
                        </div>

                    </div>
                </div>

                <div className="flex-grow flex flex-col min-h-0  space-y-3 overflow-hidden">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-2 flex-none">

                        <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm col-span-1">
                            <h2 className="font-bold text-slate-700 mb-1  b-1">
                                Basic Details
                            </h2>
                            <div className="grid grid-cols-2 gap-1">
                                <ReusableInput label="Transfer Id" readOnly value={docId} />
                                <ReusableInput label="Transfer Date" value={date} type={"date"} required={true} readOnly={true} disabled />

                            </div>
                        </div>
                        <div className="col-span-4 border border-slate-200 p-2 bg-white rounded-md shadow-sm">
                            <h2 className="font-bold text-slate-700 mb-1  b-1">Transfer Order Details</h2>

                            <div className="grid grid-cols-1">
                                <div className="grid grid-cols-10 gap-x-3 gap-y-1">
                                    <div className="col-span-2">

                                        <DropdownInputNew
                                            ref={nameRef}
                                            autoFocus={!id}
                                            openOnFocus={!id}
                                            name="From Location"
                                            options={dropDownListObject(id ? storeOptions : storeOptions?.filter(item => item.active), "storeName", "id")}
                                            value={fromLocationId}
                                            setValue={setFromLocationId}
                                            required={true}
                                            readOnly={id || readOnly}
                                            clear={true}
                                            disabled={id || toLocationId}
                                        />
                                    </div>

                                    <div className="col-span-2">

                                        <DropdownInputNew name="To Location"
                                            options={dropDownListObject(id ? storeOptions : storeOptions?.filter(item => item.active && item.id != fromLocationId), "storeName", "id")}
                                            value={toLocationId} setValue={setToLocationId} required={true}
                                            disabled={!fromLocationId || id}
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
                                            disabled={id}
                                        />
                                    </div>


                                    <div className="col-span-3">
                                        <p className="block  font-bold text-slate-700 mb-1 text-xs">Barcode</p>

                                        <input
                                            name="Barcode"
                                            value={barcode}
                                            onChange={(e) => setBarcode(e.target.value)}
                                            disabled={id}
                                            onKeyDown={handleBarcodeSearch}
                                            // onBlur={handleBarcodeSearch}
                                            placeholder="Scan the Barcode ..."
                                            className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>

                                    <div className="col-span-1">
                                        <button
                                            className="1 px-2 py-0.5 mt-6 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition"
                                            onClick={() => setOrderToGeneral(true)}
                                            disabled={id}
                                        >
                                            Available Stock
                                        </button>
                                    </div>









                                </div>
                            </div>
                        </div>


                    </div>
                    <div className="flex-grow flex flex-col min-h-0">
                        <FormItems id={id} orderItems={orderItems} setOrderItems={setOrderItems} setRequirementId={setRequirementId} requirementId={requirementId} yarnTotals={yarnTotals} setYarnTotals={setYarnTotals}
                            colorList={colorList?.data} tempOrderItems={tempOrderItems} setTempOrderItems={setTempOrderItems}
                            stockItems={stockItems} setStockItems={setStockItems} tempStockItems={tempStockItems} setTempStockItems={setTempStockItems} singleData={singleData}
                            toOrderId={toOrderId} fromOrderId={fromOrderId} orderData={orderData?.data} transferType={transferType}
                            fromLocationId={fromLocationId} locationData={locationData} itemList={itemList?.data} uomList={uomList?.data}
                            sizeList={sizeList?.data} toLocationId={toLocationId} orderToGeneral={orderToGeneral} setOrderToGeneral={setOrderToGeneral}
                            searchItem={searchItem} setSearchItem={setSearchItem}
                            searchColor={searchColor} setSearchColor={setSearchColor}
                            searchSize={searchSize} setSearchSize={setSearchSize}
                            stockDrivenFields={stockDrivenFields} readOnly={readOnly}
                            itemPriceList={itemPriceList?.data}
                            offersData={offersData?.data}
                            collectionsData={collectionsData?.data}
                        />
                    </div>
                    <div className="flex flex-col md:flex-row gap-2 justify-between flex-none bg-white p-2 rounded-md border border-slate-200 shadow-sm">
                        <div className="flex gap-2 flex-wrap">
                            <button
                                onClick={() => hasPermission(() => saveData("close"), "save")}
                                disabled={readOnly || id}

                                className="bg-indigo-500 text-white px-4 py-1.5 rounded-md hover:bg-indigo-600 flex items-center text-sm shadow-sm transition-all active:scale-95">
                                <HiOutlineRefresh className="w-4 h-4 mr-2" />
                                Save & Close

                            </button>
                            <button
                                onClick={() => hasPermission(() => saveData("new"), "save")}
                                disabled={readOnly || id}
                                className="bg-indigo-500 text-white px-4 py-1.5 rounded-md hover:bg-indigo-600 flex items-center text-sm shadow-sm transition-all active:scale-95">
                                <FiSave className="w-4 h-4 mr-2" />
                                Save & New
                            </button>


                        </div>

                        <div className="flex gap-2 flex-wrap">

                            <button className="bg-yellow-600 text-white px-4 py-1.5 rounded-md hover:bg-yellow-700 flex items-center text-sm shadow-sm transition-all active:scale-95"
                                onClick={() => hasPermission(() => setReadOnly(false), "edit")}
                            >
                                <FiEdit2 className="w-4 h-4 mr-2" />
                                Edit
                            </button>
                            <button className="bg-slate-600 text-white px-4 py-1.5 rounded-md hover:bg-slate-700 flex items-center text-sm shadow-sm transition-all active:scale-95"
                                onClick={() => {
                                    const selectedItems = stockItems?.filter(i => i.itemId && i.transferQty);

                                    if (!selectedItems?.length) {
                                        Swal.fire({
                                            icon: "error",
                                            text: "Please select at least one item and enter Transfer Quantity to print barcode",
                                        });
                                        return;
                                    }

                                    const isDiscountSection = findFromList(toLocationId, locationData?.data, "storeName") === "DISCOUNT SECTION";

                                    if (!isDiscountSection) return;

                                    // 1️⃣ Clearance barcode check
                                    const hasMissingClearanceBarcode = selectedItems.some(item => !item.clearanceBarcode);
                                    if (hasMissingClearanceBarcode) {
                                        Swal.fire({
                                            icon: "error",
                                            text: "Please generate clearance barcode for all items before printing",
                                        });
                                        return;
                                    }

                                    // 2️⃣ Clearance offer check
                                    for (const item of selectedItems) {
                                        const hasClearanceOffer = offersData?.data?.some(offer => {
                                            if (!offer.applyToClearance) return false;
                                            if (offer.scopeMode === 'Global') return true;

                                            return offer.OfferScope?.some(scope => {
                                                const type = String(scope.type).toLowerCase();
                                                if (type === 'item' && scope.refId === parseInt(item.itemId)) return true;
                                                if (type === 'collection') {
                                                    const collection = collectionsData?.data?.find(c => c.id === scope.refId);
                                                    return collection?.CollectionItems?.some(ci => ci.itemId === parseInt(item.itemId));
                                                }
                                                return false;
                                            });
                                        });

                                        if (!hasClearanceOffer) {
                                            const itemObj = (itemList?.data || itemList || [])?.find(i => parseInt(i.id) === parseInt(item.itemId));
                                            Swal.fire({
                                                title: "Offer Required",
                                                text: `Item "${itemObj?.name || item.itemId}" does not have an active clearance offer.`,
                                                icon: "error"
                                            });
                                            return;
                                        }
                                    }
                                    setBarcodePrintOpen(true)
                                }}
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
