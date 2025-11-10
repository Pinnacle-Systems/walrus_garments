import React, { useEffect, useState, useCallback, useRef } from "react";
import { useGetPartyQuery, useGetPartyByIdQuery } from "../../../redux/services/PartyMasterService";
import { useGetPaytermMasterQuery } from "../../../redux/services/PayTermMasterServices";
// import { useGetTaxTemplateQuery } from '../../../redux/ErpServices/TaxTemplateServices';
import FormHeader from "../../../Basic/components/FormHeader";
import { toast } from "react-toastify";
import { DropdownInput, DateInput, TextInput, ReusableSearchableInput, DateInputNew } from "../../../Inputs";
import { dropDownListObject, } from '../../../Utils/contructObject';
// import { poTypes, } from '../../../Utils/DropdownData';
import PoItemsSelection from "./PoItemsSelection";
import moment from "moment";
// import PoSummary from "./PoSummary";
import Modal from "../../../UiComponents/Modal";
import { useGetBranchByIdQuery, useGetBranchQuery } from "../../../redux/services/BranchMasterService";
import {
    useGetLocationMasterQuery,
} from "../../../redux/uniformService/LocationMasterServices";
import { Loader } from '../../../Basic/components';
import {
    useAddDirectCancelOrReturnMutation, useDeleteDirectCancelOrReturnMutation,
    useGetDirectCancelOrReturnByIdQuery, useGetDirectCancelOrReturnQuery, useUpdateDirectCancelOrReturnMutation
}
    from "../../../redux/uniformService/DirectCancelOrReturnServices";
import { getCommonParams, isGridDatasValid, sumArray } from "../../../Utils/helper";
import { directOrPo, directOrPoreturn, MaterialType, poTypes, YarnMaterial } from "../../../Utils/DropdownData";
// import InwardItemsSelection from "./InwardItemsSelection";

import { FaFileAlt, FaWhatsapp } from "react-icons/fa";
import { FiEdit2, FiPrinter, FiSave } from "react-icons/fi";
import { HiOutlineRefresh, HiX } from "react-icons/hi";
import { ReusableInput } from "../Order/CommonInput";
// import ReturnItems from "./ReturnItems";
import Swal from "sweetalert2";
// import PrintFormatGreyYarnPurchaseReturn from "./NewPrintFormat/index.js"
import { useGetYarnMasterQuery } from "../../../redux/uniformService/YarnMasterServices.js";
import { useGetColorMasterQuery } from "../../../redux/uniformService/ColorMasterService.js";
import { useGetUnitOfMeasurementMasterQuery } from "../../../redux/uniformService/UnitOfMeasurementServices.js";
import { PDFViewer } from "@react-pdf/renderer";
import tw from "../../../Utils/tailwind-react-pdf.js";
// import YarnPurchaseOrderReturnPrintFormat from "./PrintFormat-PR/index.jsx";
import { useGetTermsAndConditionsQuery } from "../../../redux/services/TermsAndConditionsService.js";
import useTaxDetailsHook from "../../../CustomHooks/TaxHookDetails/index.js";
import { groupBy } from "lodash";
import ReturnItems from "./ReturnItems.js";
import { useAddAccessoryPurchaseReturnMutation, useDeleteAccessoryPurchaseReturnMutation, useGetAccessoryPurchaseReturnByIdQuery, useUpdateAccessoryPurchaseReturnMutation } from "../../../redux/uniformService/AccessoryPoReturnServices.js";
import AccessoryPurchaseOrderReturnPrintFormat from "./PrintFormat-PR/index.jsx";


const PurchaseReturnForm = ({ onClose, isLoading, isFetching, poInwardOrDirectInward, setPoInwardOrDirectInward, id, setId, allData, directInwardReturnItems, setDirectInwardReturnItems,
    colorList, uomList, accessoryList, sizeList

}) => {

    const [readOnly, setReadOnly] = useState(false);
    const [docId, setDocId] = useState("New")
    const [date, setDate] = useState();
    const [payTermId, setPayTermId] = useState("");
    const [dcDate, setDcDate] = useState("");
    const [transType, setTransType] = useState("Accessory");
    const [supplierId, setSupplierId] = useState("");
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
    const [showExtraCharge, setShowExtraCharge] = useState(false)
    const [showDiscount, setShowDiscount] = useState(false)
    const [term, setTerm] = useState("");
    const [notes, setNotes] = useState("");
    const [approvedBy, setApprovedBy] = useState("")
    const [suppliers, setSuppliers] = useState([
        "Supplier One",
        "Supplier Two",
        "Supplier Three",
    ]);
    const [contextMenu, setContextMenu] = useState(false)
    const handleRightClick = (event, rowIndex, type) => {
        event.preventDefault();
        setContextMenu({
            mouseX: event.clientX,
            mouseY: event.clientY,
            rowId: rowIndex,
            type,
        });
    };

    const handleCloseContextMenu = () => {
        setContextMenu(null);
    };


    const [taxTemplateId, setTaxTemplateId] = useState("4");

    console.log(storeId, "storeId")
    const [printModalOpen, setPrintModalOpen] = useState(false);



    const componentRef = useRef();


    // const branchIdFromApi = useRef(branchId);
    const params = {
        branchId, companyId
    };

    const { data: locationData } = useGetLocationMasterQuery({ params: { branchId }, searchParams: searchValue });

    const { data: supplierList } =
        useGetPartyQuery({ params: { ...params } });


    const { data: supplierDetails } =
        useGetPartyByIdQuery(supplierId, { skip: !supplierId });


    const { data: branchList } = useGetBranchQuery({ params: { companyId } });









    const {
        data: singleData,
        isFetching: isSingleFetching,
        isLoading: isSingleLoading,
    } = useGetAccessoryPurchaseReturnByIdQuery(id, { skip: !id });

    const [addData] = useAddAccessoryPurchaseReturnMutation();
    const [updateData] = useUpdateAccessoryPurchaseReturnMutation();

    const syncFormWithDb = useCallback((data) => {
        const today = new Date()
        if (id) {
            setReadOnly(true);
        } else {
            setReadOnly(false);
        }
        setTransType(data?.poType ? data.poType : "Accessory");
        setPoInwardOrDirectInward(data?.poInwardOrDirectInward ? data?.poInwardOrDirectInward : "PurchaseReturn")
        setDate(data?.createdAt ? moment.utc(data.createdAt).format("YYYY-MM-DD") : moment.utc(today).format("YYYY-MM-DD"));
        setDirectInwardReturnItems(data?.AccessoryReturnItems ? data.AccessoryReturnItems : []);
        if (data?.docId) {
            setDocId(data?.docId)
        }
        if (data?.date) setDate(data?.date);
        setPayTermId(data?.payTermId ? data?.payTermId : "");
        setSupplierId(data?.supplierId ? data?.supplierId : "");
        setDcDate(data?.dcDate ? moment.utc(data?.dcDate).format("YYYY-MM-DD") : "");
        setDcNo(data?.dcNo ? data.dcNo : "")
        setLocationId(data?.branchId ? data?.branchId : "")
        setStoreId(data?.storeId ? data.storeId : "")
        setVehicleNo(data?.vehicleNo ? data?.vehicleNo : "")
        setSpecialInstructions(data?.specialInstructions ? data?.specialInstructions : "")
        setRemarks(data?.remarks ? data?.remarks : "")
        // if (data?.branchId) {
        //     branchIdFromApi.current = data?.branchId
        // }
    }, [id]);



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
        date,
        supplierId, dcDate,
        payTermId,
        branchId, id, userId,
        storeId,
        directReturnItems: directInwardReturnItems?.filter(po => po?.accessoryId),
        discountType,
        discountValue,
        dcNo,
        remarks,
        specialInstructions,
        vehicleNo,
        finYearId
    }

    function isSupplierOutside() {
        if (supplierDetails) {
            return supplierDetails?.data?.City?.state?.name !== "TAMIL NADU"
        }
        return false
    }

    const validateData = (data) => {
        let mandatoryFields = ["uomId", "colorId", "price"];
        let lotMandatoryFields = ["qty"]
        if (transType === "GreyYarn" || transType === "DyedYarn") {
            mandatoryFields = [...mandatoryFields, "yarnId"]
            lotMandatoryFields = [...lotMandatoryFields, "noOfBags", "weightPerBag"]
        } else if (transType === "GreyFabric" || transType === "DyedFabric") {
            mandatoryFields = [...mandatoryFields, ...["fabricId", "designId", "gaugeId", "loopLengthId", "gsmId", "kDiaId", "fDiaId"]]
            lotMandatoryFields = [...lotMandatoryFields, "noOfRolls"]
        } else if (transType === "Accessory") {
            mandatoryFields = [...mandatoryFields, ...["accessoryId"]]
        }

        return data.poType && data.supplierId && data.dcDate && data.dcNo
            && data.directReturnItems.length !== 0

    }

    const handleSubmitCustom = async (callback, data, text ,nextProcess) => {
        try {
            let returnData;
            if (text === "Updated") {
                returnData = await callback(data).unwrap();
            } else {
                returnData = await callback(data).unwrap();
            }
            if (returnData.statusCode === 1) {
                toast.error(returnData.message);
            } else {
                // toast.success(text + "Successfully");
                Swal.fire({
                    icon: 'success',
                    title: `${text || 'Saved'} Successfully`,
                    showConfirmButton: false,
                    timer: 2000
                });

                setId("")
                syncFormWithDb(undefined)
            }

            if (returnData.statusCode === 0) {
                if (nextProcess === "new") {
                    onNew()
                    syncFormWithDb(undefined)
                    setReadOnly(false);

                }
                if (nextProcess === "close") {
                    onClose()
                }
            } else {
                toast.error(returnData?.message);
            }
        } catch (error) {
            console.log("handle");
        }
    };


    const saveData = (nextProcess) => {

        // if (!validateData(data)) {
        //     toast.info("Please fill all required fields...!", { position: "top-center" })
        //     return
        // }
        if (!window.confirm("Are you sure save the details ...?")) {
            return
        }
        if (id) {
            handleSubmitCustom(updateData, data, "Updated",nextProcess);
        } else {
            handleSubmitCustom(addData, data, "Added",nextProcess);
        }
    }



    const handleKeyDown = (event) => {
        let charCode = String.fromCharCode(event.which).toLowerCase();
        if ((event.ctrlKey || event.metaKey) && charCode === "s") {
            event.preventDefault();
            saveData();
        }
    };

    const onNew = () => {
        setId("");
        setSearchValue("");
        setReadOnly(false);
        syncFormWithDb(undefined)
        // getNextDocId()
        setDocId("New")
    };


    // useEffect(() => {
    //     if (id) return
    //     setDirectInwardReturnItems([])
    // }, [transType, id])



    console.log(transType === "DyedYarn" || transType === "GreyYarn", "party")
    function filterSupplier() {
        let finalSupplier = []
        // if (transType === "DyedYarn" ||  transType  === "GreyYarn") {
        //     finalSupplier = supplierList?.data?.filter(s => (s.isDy || s.isGy))
        // } 
        //   if (transType === "Accessory") {
        //     finalSupplier = supplierList?.data?.filter(s => (s.isAcc))
        // }
        // else {
        //     finalSupplier = supplierList?.data?.filter(s => s.Acc > 0)
        // }
        finalSupplier = supplierList?.data?.filter(s => s.isSupplier)
        return finalSupplier
    }
    let supplierListBasedOnSupply = filterSupplier()

    function getTotalIssuedQty() {
        if (transType === "Accessory") {
            return directInwardReturnItems.reduce((total, current) => {
                return total + parseFloat(current.qty)
            }, 0)
        }
        return directInwardReturnItems.reduce((total, current) => {
            return total + sumArray(current?.returnLotDetails ? current.returnLotDetails : [], "qty")
        }, 0)
    }

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


    // if (!branchList || !locationData) return <Loader />





    function getTotalQty() {
        let qty = directInwardReturnItems?.reduce((acc, curr) => { return acc + parseInt(curr?.qty ? curr?.qty : 0) }, 0)
        return parseInt(qty)
    }

    const handleAddSupplier = (newName) => {
        if (!suppliers.includes(newName)) {
            setSuppliers([...suppliers, newName]);
        }
    };


    const { data: branchdata } = useGetBranchByIdQuery(branchId, { skip: !branchId });

    const { data: termsAndCondition } = useGetTermsAndConditionsQuery({ params: { companyId } })
    const { isLoading: isTaxHookDetailsLoading, ...taxDetails } = useTaxDetailsHook({ poItems: directInwardReturnItems, taxTypeId: taxTemplateId, discountType, discountValue })

    const taxGroupWise = groupBy(directInwardReturnItems, "taxPercent");

    const [deliveryType, setDeliveryType] = useState("")
    const [deliveryToId, setDeliveryToId] = useState("")


    const { data: deliveryToBranch } = useGetBranchByIdQuery(deliveryToId, { skip: deliveryType === "ToParty" })
    const { data: deliveryToSupplier } = useGetPartyByIdQuery(deliveryToId, { skip: deliveryType === "ToSelf" })

    let deliveryTo = deliveryType === "ToParty" ? deliveryToSupplier?.data : deliveryToBranch?.data;

    console.log(taxGroupWise, "taxGroupWise")
    const dateRef = useRef(null);

    const ReturnRef = useRef(null);

    useEffect(() => {
        if (ReturnRef.current) {
            ReturnRef.current.focus();
        }
    }, []);


    if (isTaxHookDetailsLoading) return <Loader />

    return (
        <>
            <Modal isOpen={inwardItemSelection} onClose={() => setInwardItemSelection(false)} widthClass={"w-[95%] h-[90%] py-10"}>
                {
                    (poInwardOrDirectInward == "PurchaseReturn" || poInwardOrDirectInward == "GeneralReturn") ?
                        <PoItemsSelection setInwardItemSelection={setInwardItemSelection} transtype={transType}
                            supplierId={supplierId} poInwardOrDirectInward={poInwardOrDirectInward}
                            inwardItems={directInwardReturnItems}
                            setInwardItems={setDirectInwardReturnItems} readOnly={readOnly}
                        // storeId={storeId} 
                        />
                        :
                        // <InwardItemsSelection setInwardItemSelection={setInwardItemSelection} transtype={transType}
                        //     supplierId={supplierId}
                        //     storeId={storeId} poInwardOrDirectInward={poInwardOrDirectInward}
                        //     inwardItems={directInwardReturnItems}
                        //     setInwardItems={setDirectInwardReturnItems} />
                        <></>
                }

            </Modal>
            <Modal
                isOpen={printModalOpen}
                onClose={() => setPrintModalOpen(false)}
                widthClass={"w-[90%] h-[90%]"}
            >
                <PDFViewer style={tw("w-full h-full")}>
                    <AccessoryPurchaseOrderReturnPrintFormat
                        branchData={branchdata?.data}
                        data={id ? singleData?.data : "Null"}
                        singleData={id ? singleData?.data : "Null"}
                        date={id ? singleData?.data?.selectedDate : date}
                        docId={docId ? docId : ""}
                        remarks={remarks}
                        discountType={discountType}
                        poType={directOrPoreturn}
                        discountValue={discountValue}
                        ref={componentRef}
                        poNumber={docId} poDate={date} payTermId={payTermId}
                        poItems={directInwardReturnItems?.filter(item => item.accessoryId)}
                        supplierDetails={supplierDetails ? supplierDetails?.data : null}
                        taxDetails={taxDetails} taxTemplateId={taxTemplateId} deliveryType={deliveryType}
                        deliveryToId={deliveryToId} deliveryTo={deliveryTo} taxGroupWise={taxGroupWise}
                        termsAndCondition={termsAndCondition}
                        colorList={colorList} uomList={uomList} accessoryList={accessoryList} sizeList={sizeList} term={term}
                    />
                </PDFViewer>
            </Modal>


            <div className="w-full h-full bg-[#f1f1f0] mx-auto rounded-md shadow-md px-2 py-1 ">
                <div className="flex justify-between items-center mb-1">
                    <h1 className="text-2xl font-bold text-gray-800">Accessory Purchse Return</h1>
                    <button
                        onClick={onClose}
                        className="text-indigo-600 hover:text-indigo-700"
                        title="Open Report"
                    >
                        <FaFileAlt className="w-5 h-5" />
                    </button>
                </div>



                <div className="space-y-3 h-full ">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">


                        <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm col-span-1">
                            <h2 className="font-medium text-slate-700 mb-2">
                                Return Details
                            </h2>
                            <div className="grid grid-cols-2 gap-1">
                                <ReusableInput label="Doc. Id." value={docId} required={true} readOnly
                                />
                                <DateInput name="Doc Date" value={date} type={"date"} required={true} disabled={true} />



                                <DropdownInput name="Return Type"
                                    beforeChange={() => { setDirectInwardReturnItems([]) }}
                                    options={directOrPoreturn}
                                    value={poInwardOrDirectInward} setValue={setPoInwardOrDirectInward} required={true} readOnly={readOnly} ref={ReturnRef} />
                                <DropdownInput name="Po Type"

                                    options={MaterialType}
                                    value={transType}
                                    setValue={setTransType}
                                    required={true}
                                    readOnly={true} />

                            </div>
                        </div>


                        <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm col-span-1">
                            <h2 className="font-medium text-slate-700 mb-2">
                                Supplier Details
                            </h2>
                            <div className="grid grid-cols-2 gap-2">

                                <div className="col-span-2">

                                    <ReusableSearchableInput
                                        label="Supplier Id"
                                        component="PartyMaster"
                                        placeholder="Search Supplier Id..."
                                        optionList={supplierList?.data}
                                        setSearchTerm={(value) => { setSupplierId(value); }}
                                        searchTerm={supplierId}
                                        show={"isSupplier"}
                                        required={true}
                                        disabled={id}
                                    />
                                </div>
                                <TextInput name={"Dc No."} value={dcNo} setValue={setDcNo} readOnly={readOnly} required />

                                <DateInputNew type={"date"} ref={dateRef} name="Dc Date" value={dcDate} setValue={setDcDate} required={true} readOnly={readOnly} />
                            </div>

                        </div>
                        <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm col-span-1">
                            <h2 className="font-medium text-slate-700 mb-2">
                                Location Details
                            </h2>
                            <div className="grid grid-cols-2 gap-2">
                                <DropdownInput name="Location"
                                    options={branchList ? (dropDownListObject(id ? branchList.data : branchList.data.filter(item => item.active), "branchName", "id")) : []}
                                    value={locationId}
                                    setValue={(value) => { setLocationId(value); setStoreId("") }}
                                    required={true} readOnly={id || readOnly} />
                                <DropdownInput name="Store"
                                    options={dropDownListObject(id ? storeOptions : storeOptions?.filter(item => item.active), "storeName", "id")}
                                    value={storeId} setValue={setStoreId} required={true} readOnly={id || readOnly} />

                            </div>

                        </div>
                    </div>


                    <ReturnItems poInwardOrDirectInward={poInwardOrDirectInward} storeId={storeId} setStoreId={setStoreId}
                        removeItem={removeItem} transType={transType} isSupplierOutside={isSupplierOutside} directInwardReturnItems={directInwardReturnItems} setDirectInwardReturnItems={setDirectInwardReturnItems} supplierId={supplierId} setInwardItemSelection={setInwardItemSelection}
                        handleCloseContextMenu={handleCloseContextMenu} contextMenu={contextMenu} handleRightClick={handleRightClick} readOnly={readOnly}
                    />


                    <div className="grid grid-cols-3 gap-3">
                        <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm">
                            <h2 className="font-medium text-slate-700 mb-2 text-base">   Terms & Conditions</h2>
                            <textarea
                                // readOnly={readOnly}
                                value={term}
                                onChange={(e) => {
                                    setTerm(e.target.value)
                                }}
                                className="w-full h-20 overflow-auto px-2.5 py-2 text-xs border border-slate-300 rounded-md  focus:ring-1 focus:ring-indigo-200 focus:border-indigo-500"
                            // placeholder="Additional notes..."

                            />
                        </div>
                        <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm ">
                            <h2 className="font-medium text-slate-700 mb-2 text-base">Remarks</h2>
                            <textarea
                                // readOnly={readOnly}
                                value={remarks}
                                onChange={(e) => {
                                    setRemarks(e.target.value)
                                }}
                                className="w-full h-20 overflow-auto px-2.5 py-2 text-xs border border-slate-300 rounded-md  focus:ring-1 focus:ring-indigo-200 focus:border-indigo-500"
                            // placeholder="Additional notes..."
                            />
                        </div>
                        <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm">
                            <h2 className="font-semibold text-slate-800 mb-2 text-base">
                                Qty Summary
                            </h2>

                            <div className="space-y-1.5">
                                <div className="flex justify-between py-1 text-sm">
                                    <span className="text-slate-600">Total Qty (kg)</span>
                                    <span className="font-medium">{parseInt(getTotalQty())}  </span>
                                </div>


                            </div>
                        </div>




                    </div>

                    <div className="flex flex-col md:flex-row gap-2 justify-between mt-4">

                        <div className="flex gap-2 flex-wrap">
                            <button onClick={() => saveData("new")} className="bg-indigo-500 text-white px-4 py-1 rounded-md hover:bg-indigo-600 flex items-center text-sm">
                                <FiSave className="w-4 h-4 mr-2" />
                                Save & New
                            </button>
                            <button onClick={() => saveData("close")} className="bg-indigo-500 text-white px-4 py-1 rounded-md hover:bg-indigo-600 flex items-center text-sm">
                                <HiOutlineRefresh className="w-4 h-4 mr-2" />
                                Save & Close
                            </button>
                            <button onClick={() => saveData("draft")} className="bg-indigo-500 text-white px-4 py-1 rounded-md hover:bg-indigo-600 flex items-center text-sm">
                                <HiOutlineRefresh className="w-4 h-4 mr-2" />
                                Draft Save
                            </button>
                        </div>


                        <div className="flex gap-2 flex-wrap">

                            <button className="bg-yellow-600 text-white px-4 py-1 rounded-md hover:bg-yellow-700 flex items-center text-sm"
                                onClick={() => setReadOnly(false)}
                            >
                                <FiEdit2 className="w-4 h-4 mr-2" />
                                Edit
                            </button>
                            <button className="bg-emerald-600 text-white px-4 py-1 rounded-md hover:bg-emerald-700 flex items-center text-sm">
                                <FaWhatsapp className="w-4 h-4 mr-2" />
                                WhatsApp
                            </button>
                            <button className="bg-slate-600 text-white px-4 py-1 rounded-md hover:bg-slate-700 flex items-center text-sm"
                                onClick={() => {
                                    setPrintModalOpen(true)
                                }}
                            >
                                <FiPrinter className="w-4 h-4 mr-2" />
                                Print
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </ >

    )
}

export default PurchaseReturnForm