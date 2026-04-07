import { useEffect, useState, useCallback, useRef } from "react";
import { useGetPartyByIdQuery } from "../../../redux/services/PartyMasterService";
// import { useGetTaxTemplateQuery } from '../../../redux/ErpServices/TaxTemplateServices';
import { toast } from "react-toastify";
import { DropdownInput, DateInput, TextInput, ReusableSearchableInput, DateInputNew, ReusableSearchableInputNewCustomerwithBranches, TextAreaNew, TextInputNew1 } from "../../../Inputs";
import { dropDownListObject, } from '../../../Utils/contructObject';
// import { poTypes, } from '../../../Utils/DropdownData';
// eslint-disable-next-line no-unused-vars
import PoItemsSelection from "./PoItemsSelection";
import moment from "moment";
// import PoSummary from "./PoSummary";
import Modal from "../../../UiComponents/Modal";
import { useGetBranchByIdQuery } from "../../../redux/services/BranchMasterService";
import { Loader } from '../../../Basic/components';
import {
    useAddDirectCancelOrReturnMutation, useDeleteDirectCancelOrReturnMutation,
    useGetDirectCancelOrReturnByIdQuery, useUpdateDirectCancelOrReturnMutation
}
    from "../../../redux/uniformService/DirectCancelOrReturnServices";
import { getCommonParams, isGridDatasValid, sumArray } from "../../../Utils/helper";
import { useGetStockReportControlQuery } from "../../../redux/uniformService/StockReportControl.Services";
import { directOrPoreturn } from "../../../Utils/DropdownData";
import InwardItemsSelection from "./InwardItemsSelection";

import { FaWhatsapp } from "react-icons/fa";
import { FiEdit2, FiPrinter, FiSave } from "react-icons/fi";
import { HiOutlineRefresh } from "react-icons/hi";
import { ReusableInput } from "../Order/CommonInput";
import ReturnItems from "./ReturnItems";
import Swal from "sweetalert2";
import PrintFormatGreyYarnPurchaseReturn from "./NewPrintFormat/index.js"
import { PDFViewer } from "@react-pdf/renderer";
import tw from "../../../Utils/tailwind-react-pdf.js";
import YarnPurchaseOrderReturnPrintFormat from "./PrintFormat-PR/index.jsx";
import useTaxDetailsHook from "../../../CustomHooks/TaxHookDetails/index.js";
import { groupBy } from "lodash";
import { useGetDirectInwardOrReturnQuery } from "../../../redux/uniformService/DirectInwardOrReturnServices.js";
import { useGetItemPriceListQuery } from "../../../redux/uniformService/ItemMasterService.js";
import TransactionEntryShell from "../ReusableComponents/TransactionEntryShell.jsx";
import TransactionHeaderSection from "../ReusableComponents/TransactionHeaderSection.jsx";
import { useFormKeyboardNavigation } from "../../../CustomHooks/useFormKeyboardNavigation";
import PopUp from "./Pop.js";


const PurchaseReturnForm = ({ onClose, isLoading, isFetching, poInwardOrDirectInward, setPoInwardOrDirectInward, id, setId, allData, directInwardReturnItems, setDirectInwardReturnItems,
    supplierList, supplierDetails, payTermList, branchList,
    branchdata, itemList, colorList, uomList, supplierId, setSupplierId, locationData, termsAndCondition, sizeList, hasPermission, invalidateTagsDispatch, onNew, readOnly, setReadOnly,
    purchaseInwardIdProp

}) => {



    const componentRef = useRef();




    const [docId, setDocId] = useState("New")
    const [date, setDate] = useState();
    const [payTermId, setPayTermId] = useState("");
    const [dcDate, setDcDate] = useState(moment.utc(new Date()).format("YYYY-MM-DD"));
    const [transType, setTransType] = useState("DyedYarn");
    const [discountType, setDiscountType] = useState("Percentage");
    const [discountValue, setDiscountValue] = useState(0);
    const [locationId, setLocationId] = useState('');
    const [storeId, setStoreId] = useState("")
    const [dcNo, setDcNo] = useState("")
    const [searchValue, setSearchValue] = useState("");
    const [vehicleNo, setVehicleNo] = useState("");
    const [remarks, setRemarks] = useState("");
    const [specialInstructions, setSpecialInstructions] = useState("")
    const [inwardItemSelection, setInwardItemSelection] = useState(false)
    const { branchId, companyId, finYearId, userId } = getCommonParams()
    const [purchaseInwardId, setPurchaseInwardId] = useState(purchaseInwardIdProp || "")

    const [taxTemplateId, setTaxTemplateId] = useState("4");
    const [isHeaderOpen, setIsHeaderOpen] = useState(true);
    const [printModalOpen, setPrintModalOpen] = useState(false);
    const [isPrintOpen, setIsPrintOpen] = useState(false)
    const [nextprocess, setNextProcess] = useState("")





    const { refs, handlers, focusFirstInput } = useFormKeyboardNavigation();
    const {
        firstInputRef: nameRef,
        movedToNextSaveNewRef,
        saveCloseButtonRef,
        saveNewButtonRef,
    } = refs;



    const {
        data: singleData,
        isFetching: isSingleFetching,
        isLoading: isSingleLoading,
    } = useGetDirectCancelOrReturnByIdQuery(id, { skip: !id });

    const { data: stockControlData } = useGetStockReportControlQuery({ params: { branchId, companyId, userId, finYearId } });

    const [addData] = useAddDirectCancelOrReturnMutation();
    const [updateData] = useUpdateDirectCancelOrReturnMutation();

    const { data: itemPriceList } = useGetItemPriceListQuery({
        params: {
            branchId,
            companyId
        }
    });

    const syncFormWithDb = useCallback((data) => {
        const today = new Date()

        setTransType(data?.poType ? data.poType : "DyedYarn");
        setPoInwardOrDirectInward(data?.poInwardOrDirectInward ? data?.poInwardOrDirectInward : "DirectReturn")
        setDate(data?.createdAt ? moment.utc(data.createdAt).format("YYYY-MM-DD") : moment.utc(today).format("YYYY-MM-DD"));
        setDirectInwardReturnItems(data?.directReturnItems ? data.directReturnItems : []);

        setDocId(data?.docId ? data?.docId : "New")
        // if (data?.date) setDate(data?.date);
        setPayTermId(data?.payTermId ? data?.payTermId : "");
        setSupplierId(data?.supplierId ? data?.supplierId : "");
        setDcDate(data?.dcDate ? moment.utc(data?.dcDate).format("YYYY-MM-DD") : moment.utc(today).format("YYYY-MM-DD"));
        setDcNo(data?.dcNo ? data.dcNo : "")
        setLocationId(data?.branchId ? data.branchId : "")
        setStoreId(data?.storeId ? data.storeId : "")
        setVehicleNo(data?.vehicleNo ? data?.vehicleNo : "")
        setSpecialInstructions(data?.specialInstructions ? data?.specialInstructions : "")
        setRemarks(data?.remarks ? data?.remarks : "")
        if (data?.purchaseInwardId) setPurchaseInwardId(data.purchaseInwardId)
    }, [id]);


    const { data: purchaseInwardData } = useGetDirectInwardOrReturnQuery({
        params: {
            branchId,

        }
    });

    useEffect(() => {
        if (!isPrintOpen && !printModalOpen && !inwardItemSelection && directInwardReturnItems.length === 0) {
            focusFirstInput();
        }
    }, [focusFirstInput, isPrintOpen, printModalOpen, inwardItemSelection, directInwardReturnItems.length]);

    useEffect(() => {
        if (id) {
            syncFormWithDb(singleData?.data);
        } else {
            syncFormWithDb(undefined);
        }
    }, [isSingleFetching, isSingleLoading, id, syncFormWithDb, singleData]);

    const data = {
        poType: transType,
        poInwardOrDirectInward,
        supplierId, dcDate,
        payTermId,
        branchId, id, userId,
        storeId,
        directReturnItems: directInwardReturnItems?.filter(po => po?.itemId),
        discountType,
        discountValue,
        dcNo,
        remarks,
        specialInstructions,
        vehicleNo,
        finYearId, locationId,
        purchaseInwardId,
    }

    function isSupplierOutside() {
        if (supplierDetails) {
            return supplierDetails?.data?.City?.state?.name !== "TAMIL NADU"
        }
        return false
    }

    const validateData = (data) => {


        return data.supplierId
            && data.directReturnItems.length !== 0 && data?.locationId && data?.storeId && data?.purchaseInwardId

    }



    const handleSubmitCustom = async (callback, payload, text, nextProcess) => {
        try {
            setNextProcess(nextProcess)
            const returnData = await callback(payload).unwrap();
            invalidateTagsDispatch()
            if (returnData.statusCode === 1) {

                await Swal.fire({
                    icon: "error",
                    title: returnData.message,

                });
            } else {
                await Swal.fire({
                    icon: "success", title: `${text || "Saved"} Successfully`,
                    showConfirmButton: false,
                    timer: 1500,
                });
                if (returnData.statusCode === 0) {
                    if (nextProcess === "new") {
                        setIsPrintOpen(true)
                        // syncFormWithDb(undefined)

                    } else {
                        onClose()
                    }

                } else {
                    Swal.fire({
                        icon: "error",
                        title: returnData.message,
                        showConfirmButton: true,

                    });
                }
            }
        } catch (error) {
            console.log("handle", error);
        }
    };



    const saveData = (nextProcess) => {
        const config = stockControlData?.data?.[0];
        const mandatoryFields = [
            ...(config?.itemWise ? ["itemId"] : []),
            ...(config?.sizeWise ? ["sizeId"] : []),
            ...(config?.sizeColorWise ? ["colorId"] : []),
            ...Object.keys(config || {})
                .filter((key) => key.toLowerCase().includes("field") && !!config[key])
                .map((key) => key),
            "uomId",
            "barcode",
            "qty",
            "price",
        ];

        if (!validateData(data)) {


            Swal.fire({
                title: "Please fill all required fields...!",
                icon: "success",

            }); return
        }

        if (
            !isGridDatasValid(
                data?.directReturnItems?.filter((i) => i.itemId),
                false,
                mandatoryFields,
            )
        ) {
            Swal.fire({
                title: "Please fill all Return Items Mandatory fields...!",
                icon: "warning",
            });
            return;
        }

        if (!window.confirm("Are you sure save the details ...?")) {
            return
        }
        if (id) {
            handleSubmitCustom(updateData, data, "Updated", nextProcess);
        } else {
            handleSubmitCustom(addData, data, "Added", nextProcess);
        }
    }




    useEffect(() => {
        if (id) return
        setDirectInwardReturnItems([])
    }, [transType, id])







    useEffect(() => {
        if (id) return
        setDirectInwardReturnItems([]);
        setSupplierId("")
    }, [transType])


    const storeOptions = locationData ?
        locationData?.data?.filter(item => parseInt(item.locationId) === parseInt(locationId)) :
        [];

    function removeItem(id) {
        setDirectInwardReturnItems(directInwardItems => {
            let newItems = structuredClone(directInwardItems);
            newItems = newItems.filter(item => parseInt(item.poItemsId) !== parseInt(id))
            return newItems
        });
    }





    const { isLoading: isTaxHookDetailsLoading, ...taxDetails } = useTaxDetailsHook({ poItems: directInwardReturnItems, taxTypeId: taxTemplateId, discountType, discountValue })

    const taxGroupWise = groupBy(directInwardReturnItems, "taxPercent");

    const [deliveryType, setDeliveryType] = useState("")
    const [deliveryToId, setDeliveryToId] = useState("")


    const { data: deliveryToBranch } = useGetBranchByIdQuery(deliveryToId, { skip: deliveryType === "ToParty" })
    const { data: deliveryToSupplier } = useGetPartyByIdQuery(deliveryToId, { skip: deliveryType === "ToSelf" })

    let deliveryTo = deliveryType === "ToParty" ? deliveryToSupplier?.data : deliveryToBranch?.data;

    const summaryItems = [
        { label: "Purchase Return No", value: docId },
        { label: "Purchase Return Date", value: date },
        // { label: "Branch", value: branchList?.data?.find(item => String(item.id) === String(locationId))?.branchName },
        { label: "Location", value: storeOptions?.find(item => String(item.id) === String(storeId))?.storeName },
        {
            label: "Supplier",
            value: supplierList?.data?.find(item => String(item.id) === String(supplierId))?.name
        },
        { label: "Purchase Inward No", value: purchaseInwardData?.data?.find(i => String(i.id) === String(purchaseInwardId))?.docId },
        // { label: "Vehicle No", value: vehicleNo },
        // { label: "Delivery Person", value: specialInstructions },
    ];

    const footerContent = (
        <div className="flex flex-col gap-4">
            {/* Input Fields Section */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 border-b border-slate-100 ">
                <div className="col-span-2">
                    <TextAreaNew
                        name="Remarks"
                        value={remarks}
                        setValue={setRemarks}
                        placeholder="Enter remarks..."
                        readOnly={readOnly}
                        ref={saveCloseButtonRef}
                        tabIndex={0}
                    />
                </div>

                {/* <TextInput
                    name="Delivery Person"
                    value={specialInstructions}
                    setValue={setSpecialInstructions}
                    placeholder="Enter delivery person name..."
                    readOnly={readOnly}
                /> */}
                <TextInputNew1
                    name="Delivery Vehicle No"
                    value={vehicleNo}
                    setValue={setVehicleNo}
                    placeholder="Enter vehicle number..."
                    readOnly={readOnly}
                />
            </div>
            {/* Action Bar Section */}
            <div className="flex flex-col justify-between gap-2 md:flex-row">

                <div className="flex flex-wrap gap-2">

                    <button
                        onClick={() => hasPermission(() => saveData("close"), "create")}
                        ref={saveCloseButtonRef}
                        tabIndex={0}
                        onKeyDown={handlers.handleSaveCloseKeyDown(saveData)}
                        disabled={readOnly}
                        className="flex items-center rounded-md bg-indigo-500 px-4 py-1 text-sm text-white hover:bg-indigo-600"
                    >
                        <HiOutlineRefresh className="mr-2 h-4 w-4" />
                        Save & Close
                    </button>
                    <button
                        onClick={() => hasPermission(() => saveData("new"), "create")}
                        ref={saveNewButtonRef}
                        onKeyDown={handlers.handleSaveNewKeyDown(saveData)}
                        disabled={readOnly}

                        className="flex items-center rounded-md bg-indigo-500 px-4 py-1 text-sm text-white hover:bg-indigo-600"
                    >
                        <FiSave className="mr-2 h-4 w-4" />
                        Save & New
                    </button>
                </div>
                <div className="flex flex-wrap gap-2">
                    <button
                        className="flex items-center rounded-md bg-yellow-600 px-4 py-1 text-sm text-white hover:bg-yellow-700"
                        onClick={() => hasPermission(() => setReadOnly(false), "edit")}
                    >
                        <FiEdit2 className="mr-2 h-4 w-4" />
                        Edit
                    </button>
                    <button
                        className="flex items-center rounded-md bg-blue-600 px-4 py-1 text-sm text-white hover:bg-blue-700"
                        disabled={readOnly}

                        onClick={() => {
                            if (
                                directInwardReturnItems?.filter((i) => i.itemId)?.length === 0
                            ) {
                                Swal.fire({
                                    icon: "warning",
                                    title: "Please Fill At Least One Inward Item",
                                });
                                return;
                            }
                            setPrintModalOpen(true);
                        }}
                    >
                        <FiPrinter className="mr-2 h-4 w-4" />
                        Print
                    </button>
                </div>
            </div>
        </div>
    );






    if (isTaxHookDetailsLoading) return <Loader />

    return (
        <>
            <Modal
                isOpen={isPrintOpen}
                // onClose={() => setIsPrintOpen(false)}
                widthClass={"px-2 h-[48%] w-[40%]"} >

                <PopUp setIsPrintOpen={setIsPrintOpen} onClose={() => setIsPrintOpen(false)} setPrintModalOpen={setPrintModalOpen}
                    nextprocess={nextprocess} formclose={onClose} syncFormWithDb={syncFormWithDb} onNew={onNew} inputRef={nameRef}
                    setId={setId}
                    id={id} />
            </Modal>
            <Modal isOpen={inwardItemSelection}
                onClose={() => setInwardItemSelection(false)}
                widthClass={"w-[95%] h-[90%] py-10"}>
                {
                    (poInwardOrDirectInward == "PurchaseReturn" || poInwardOrDirectInward == "GeneralReturn") ?
                        <PoItemsSelection setInwardItemSelection={setInwardItemSelection} transtype={transType}
                            supplierId={supplierId} poInwardOrDirectInward={poInwardOrDirectInward}
                            inwardItems={directInwardReturnItems}
                            setInwardItems={setDirectInwardReturnItems} readOnly={readOnly}
                        // storeId={storeId} 
                        />
                        :
                        <InwardItemsSelection setInwardItemSelection={setInwardItemSelection} transtype={transType}
                            supplierId={supplierId}
                            storeId={storeId} poInwardOrDirectInward={poInwardOrDirectInward}
                            inwardItems={directInwardReturnItems}
                            setInwardItems={setDirectInwardReturnItems} purchaseInwardId={purchaseInwardId} movedToNextSaveNewRef={movedToNextSaveNewRef}

                        />
                }

            </Modal>{console.log(isPrintOpen, "isPrintOpen")}
            <Modal
                isOpen={printModalOpen}
                onClose={() => {
                    setPrintModalOpen(false);
                    if (isPrintOpen) {
                        setIsPrintOpen(false)
                        syncFormWithDb(undefined)
                    }
                }}
                widthClass={"w-[90%] h-[90%]"}
            >
                <PDFViewer style={tw("w-full h-full")}>
                    <YarnPurchaseOrderReturnPrintFormat
                        branchData={branchdata?.data}
                        data={id ? singleData?.data : "Null"}
                        singleData={id ? singleData?.data : "Null"}
                        date={id ? singleData?.data?.selectedDate : date}
                        docId={docId ? docId : ""}
                        remarks={remarks}
                        deliveryPerson={specialInstructions}
                        vehicleNo={vehicleNo}
                        discountType={discountType}
                        poType={directOrPoreturn}
                        discountValue={discountValue}
                        ref={componentRef}
                        poNumber={docId} poDate={date} payTermId={payTermId}
                        poItems={directInwardReturnItems?.filter(item => item?.itemId)}
                        supplierDetails={supplierDetails ? supplierDetails?.data : null}
                        // deliveryType={deliveryType} deliveryToId={deliveryToId} taxTemplateId={taxTemplateId}
                        itemList={itemList} uomList={uomList} colorList={colorList}
                        payTermList={payTermList} termsAndCondition={termsAndCondition} taxDetails={taxDetails}
                        deliveryTo={deliveryTo} taxGroupWise={taxGroupWise} sizeList={sizeList}
                    />
                </PDFViewer>
            </Modal >



            <div className="hidden">

                <PrintFormatGreyYarnPurchaseReturn
                    remarks={remarks}
                    discountType={discountType}
                    poType={directOrPoreturn}
                    discountValue={discountValue}
                    ref={componentRef}
                    poNumber={docId} poDate={date} payTermId={payTermId}
                    poItems={directInwardReturnItems.filter(item => item.yarnId || item.accessoryId || item.fabricId)}
                    supplierDetails={supplierDetails ? supplierDetails?.data : null}
                    singleData={singleData ? singleData.data : null}
                    deliveryType={deliveryType} deliveryToId={deliveryToId} taxTemplateId={taxTemplateId}
                    yarnList={itemList} uomList={uomList} colorList={colorList}
                />
            </div>

            <TransactionEntryShell
                title="Purchase Return"
                readOnly={readOnly}
                id={id}
                onClose={onClose}
                headerOpen={isHeaderOpen}
                setHeaderOpen={setIsHeaderOpen}
                summaryItems={summaryItems}
                openStateClassName="max-h-[420px] opacity-100 overflow-visible"
                footer={footerContent}
                headerContent={(
                    <div className="grid grid-cols-1 gap-2 md:grid-cols-[1.2fr_1.2fr_0.75fr_1fr_1.1fr]">


                        <TransactionHeaderSection title="Return Details" className="col-span-1" bodyClassName="grid-cols-2 md:grid-cols-[minmax(0,2fr)_minmax(0,2.4fr)]">
                            <ReusableInput label="Purchase Return No" value={docId} required={true} readOnly
                            />
                            <DateInputNew name="Purchase Return Date" value={date} type={"date"} required={true} readOnly={readOnly}
                                disabled={true}
                            />
                        </TransactionHeaderSection>
                        <TransactionHeaderSection title="Location Details" className="col-span-1" bodyClassName="grid-cols-2 gap-2">
                            {/* <DropdownInput name="Return Type"
                                    beforeChange={() => { setDirectInwardReturnItems([]) }}
                                    options={directOrPoreturn}
                                    value={poInwardOrDirectInward} setValue={setPoInwardOrDirectInward} required={true} readOnly={readOnly} />
                                */}
                            <DropdownInput name="Branch"
                                options={branchList ? (dropDownListObject(id ? branchList.data : branchList.data.filter(item => item.active), "branchName", "id")) : []}
                                value={locationId}
                                setValue={(value) => { setLocationId(value); setStoreId("") }}
                                required={true} readOnly={id || readOnly}
                                ref={nameRef}
                            />
                            <DropdownInput name="Location"
                                options={dropDownListObject(id ? storeOptions : storeOptions?.filter(item => item.active && item.storeName.includes("WAREHOUSE")), "storeName", "id")}
                                value={storeId} setValue={setStoreId} required={true} readOnly={id || readOnly} />

                        </TransactionHeaderSection>

                        <TransactionHeaderSection title="Supplier Details" className="col-span-3" bodyClassName="grid-cols-5 gap-2">

                            <div className="col-span-3">


                                <ReusableSearchableInputNewCustomerwithBranches
                                    label="Supplier Name"
                                    component="PartyMaster"
                                    placeholder="Search Supplier Name..."
                                    optionList={supplierList?.data}
                                    setSearchTerm={(value) => setSupplierId(value)}
                                    searchTerm={supplierId}
                                    show="isSupplier"
                                    required
                                    disabled={id}
                                // isShow={false}
                                />
                            </div>

                            <DropdownInput name="Purchase Inward No"
                                options={dropDownListObject(id ? purchaseInwardData?.data : purchaseInwardData?.data?.filter(i => i.supplierId == supplierId), "docId", "id")}
                                value={purchaseInwardId} setValue={setPurchaseInwardId} required={true} readOnly={id || readOnly}

                            />

                            <div className="w-28 mt-7">
                                <button
                                    className="flex items-center gap-1 px-1 py-[1px] text-[10px] font-medium text-indigo-700 bg-indigo-50 border border-indigo-200 rounded hover:bg-indigo-100 focus:outline-none focus:ring-1 focus:ring-indigo-300 transition-all"
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            e.preventDefault();
                                            setInwardItemSelection(true);
                                        }
                                    }}
                                    disabled={!supplierId || id}
                                    onClick={() => {
                                        if (!supplierId) {
                                            Swal.fire({
                                                icon: "warning",
                                                title: "Choose Supplier",
                                            });
                                            return;
                                        }
                                        if (!purchaseInwardId) {
                                            Swal.fire({
                                                icon: "warning",
                                                title: "Select Purchase Inward No",
                                            });
                                            return;
                                        }
                                        setInwardItemSelection(true);
                                    }}
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="w-3 h-3"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        strokeWidth={2}
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h10" />
                                    </svg>

                                    Fill Inward Items
                                </button>

                            </div>

                        </TransactionHeaderSection>

                    </div>
                )}
            >
                <div className="min-h-0 flex-1 overflow-hidden">
                    <ReturnItems poInwardOrDirectInward={poInwardOrDirectInward} storeId={storeId} setStoreId={setStoreId}
                        removeItem={removeItem} transType={transType} isSupplierOutside={isSupplierOutside} directInwardReturnItems={directInwardReturnItems} setDirectInwardReturnItems={setDirectInwardReturnItems} supplierId={supplierId} setInwardItemSelection={setInwardItemSelection}
                        supplierList={supplierList} supplierDetails={supplierDetails} payTermList={payTermList} branchList={branchList}
                        branchdata={branchdata} itemList={itemList} colorList={colorList} uomList={uomList} id={id} sizeList={sizeList}
                        purchaseInwardId={purchaseInwardId} itemPriceList={itemPriceList} headerOpen={isHeaderOpen} movedToNextSaveNewRef={movedToNextSaveNewRef} handlers={handlers} readOnly={readOnly}
                    />
                </div>
            </TransactionEntryShell>
        </>
    );
}

export default PurchaseReturnForm
