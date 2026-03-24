import { useEffect, useState, useCallback, useRef } from "react";
import { useGetPartyByIdQuery } from "../../../redux/services/PartyMasterService";
// import { useGetTaxTemplateQuery } from '../../../redux/ErpServices/TaxTemplateServices';
import { toast } from "react-toastify";
import { DropdownInput, DateInput, TextInput, ReusableSearchableInput, DateInputNew } from "../../../Inputs";
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
import { getCommonParams, sumArray } from "../../../Utils/helper";
import { directOrPoreturn } from "../../../Utils/DropdownData";
import InwardItemsSelection from "./InwardItemsSelection";

import { FaFileAlt, FaWhatsapp } from "react-icons/fa";
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
import useInvalidateTags from "../../../CustomHooks/useInvalidateTags.js";
import { useGetItemPriceListQuery } from "../../../redux/uniformService/ItemMasterService.js";


const PurchaseReturnForm = ({ onClose, isLoading, isFetching, poInwardOrDirectInward, setPoInwardOrDirectInward, id, setId, allData, directInwardReturnItems, setDirectInwardReturnItems,
    supplierList, supplierDetails, payTermList, branchList,
    branchdata, itemList, colorList, uomList, supplierId, setSupplierId, locationData, termsAndCondition, sizeList, hasPermission

}) => {



    const componentRef = useRef();




    const [readOnly, setReadOnly] = useState(false);
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
    const [purchaseInwardId, setPurchaseInwardId] = useState("")

    const [taxTemplateId, setTaxTemplateId] = useState("4");

    const [printModalOpen, setPrintModalOpen] = useState(false);



    const [invalidateTagsDispatch] = useInvalidateTags();


    const {
        data: singleData,
        isFetching: isSingleFetching,
        isLoading: isSingleLoading,
    } = useGetDirectCancelOrReturnByIdQuery(id, { skip: !id });

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
        if (id) {
            setReadOnly(true);
        } else {
            setReadOnly(false);
        }
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
        setPurchaseInwardId(data?.purchaseInwardId ? data?.purchaseInwardId : "")
    }, [id]);


    const { data: purchaseInwardData } = useGetDirectInwardOrReturnQuery({
        params: {
            branchId,

        }
    });

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
        purchaseInwardId
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
            const returnData = await callback(payload).unwrap();
            if (returnData.statusCode === 1) {
                toast.error(returnData.message);
            } else {
                Swal.fire({ icon: "success", title: `${text || "Saved"} Successfully`, showConfirmButton: false });
                if (returnData.statusCode === 0) {
                    if (nextProcess === "new") {
                        syncFormWithDb(undefined)
                    } else {
                        onClose()
                    }

                } else {
                    toast.error(returnData?.message);
                }
            }
        } catch (error) {
            console.log("handle", error);
        }
    };



    const saveData = () => {

        if (!validateData(data)) {


            Swal.fire({
                title: "Please fill all required fields...!",
                icon: "success",

            }); return
        }
        if (!window.confirm("Are you sure save the details ...?")) {
            return
        }
        if (id) {
            handleSubmitCustom(updateData, data, "Updated");
        } else {
            handleSubmitCustom(addData, data, "Added");
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
                        <InwardItemsSelection setInwardItemSelection={setInwardItemSelection} transtype={transType}
                            supplierId={supplierId}
                            storeId={storeId} poInwardOrDirectInward={poInwardOrDirectInward}
                            inwardItems={directInwardReturnItems}
                            setInwardItems={setDirectInwardReturnItems} purchaseInwardId={purchaseInwardId}

                        />
                }

            </Modal>
            <Modal
                isOpen={printModalOpen}
                onClose={() => setPrintModalOpen(false)}
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
            </Modal>



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

            <div className="w-full bg-[#f1f1f0] mx-auto rounded-md shadow-md px-2 py-1 overflow-y-auto">
                <div className="flex justify-between items-center mb-1">
                    <h1 className="text-2xl font-bold text-gray-800">Purchase Return</h1>
                    <button onClick={onClose} className="text-indigo-600 hover:text-indigo-700" title="Open Report">
                        <FaFileAlt className="w-5 h-5" />
                    </button>
                </div>
            </div>
            <div className="w-full h-[78vh]  mx-auto rounded-md shadow-md  py-2 ">




                <div className="space-y-3 h-full ">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-2">


                        <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm col-span-1">
                            <h2 className="font-medium text-slate-700 mb-2">
                                Return Details
                            </h2>
                            <div className="grid grid-cols-2 gap-1">
                                <ReusableInput label="Purchase Return No" value={docId} required={true} readOnly
                                />
                                <DateInputNew name="Purchase Return Date" value={date} type={"date"} required={true} readOnly={readOnly} />





                            </div>
                        </div>
                        <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm col-span-2">
                            <h2 className="font-medium text-slate-700 mb-2">
                                Location Details
                            </h2>
                            <div className="grid grid-cols-3 gap-2">
                                <DropdownInput name="Return Type"
                                    beforeChange={() => { setDirectInwardReturnItems([]) }}
                                    options={directOrPoreturn}
                                    value={poInwardOrDirectInward} setValue={setPoInwardOrDirectInward} required={true} readOnly={readOnly} />
                                <DropdownInput name="Branch"
                                    options={branchList ? (dropDownListObject(id ? branchList.data : branchList.data.filter(item => item.active), "branchName", "id")) : []}
                                    value={locationId}
                                    setValue={(value) => { setLocationId(value); setStoreId("") }}
                                    required={true} readOnly={id || readOnly} />
                                <DropdownInput name="Location"
                                    options={dropDownListObject(id ? storeOptions : storeOptions?.filter(item => item.active && item?.storeName == "NEW WAREHOUSE"), "storeName", "id")}
                                    value={storeId} setValue={setStoreId} required={true} readOnly={id || readOnly} />

                            </div>

                        </div>

                        <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm col-span-2">
                            <h2 className="font-medium text-slate-700 mb-2">
                                Supplier Details
                            </h2>
                            <div className="grid grid-cols-3 gap-2">

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

                                <DropdownInput name="Purchase Inward No"
                                    options={dropDownListObject(id ? purchaseInwardData?.data : purchaseInwardData?.data?.filter(i => i.supplierId == supplierId), "docId", "id")}
                                    value={purchaseInwardId} setValue={setPurchaseInwardId} required={true} readOnly={id || readOnly} />


                            </div>

                        </div>

                    </div>

                    <div>
                        <ReturnItems poInwardOrDirectInward={poInwardOrDirectInward} storeId={storeId} setStoreId={setStoreId}
                            removeItem={removeItem} transType={transType} isSupplierOutside={isSupplierOutside} directInwardReturnItems={directInwardReturnItems} setDirectInwardReturnItems={setDirectInwardReturnItems} supplierId={supplierId} setInwardItemSelection={setInwardItemSelection}
                            supplierList={supplierList} supplierDetails={supplierDetails} payTermList={payTermList} branchList={branchList}
                            branchdata={branchdata} itemList={itemList} colorList={colorList} uomList={uomList} id={id} sizeList={sizeList}
                            purchaseInwardId={purchaseInwardId} itemPriceList={itemPriceList}
                        />
                    </div>






                </div>

                <div className="flex flex-col md:flex-row gap-2 justify-between mt-0">
                    <div className="flex gap-2 flex-wrap">
                        <button
                            onClick={() => hasPermission(() => saveData("new"), "create")}

                            className="bg-indigo-500 text-white px-4 py-1 rounded-md hover:bg-indigo-600 flex items-center text-sm">
                            <FiSave className="w-4 h-4 mr-2" />
                            Save & New
                        </button>
                        <button
                            onClick={() => hasPermission(() => saveData("close"), "create")}
                            className="bg-indigo-500 text-white px-4 py-1 rounded-md hover:bg-indigo-600 flex items-center text-sm">
                            <HiOutlineRefresh className="w-4 h-4 mr-2" />
                            Save & Close
                        </button>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                        <button className="bg-yellow-600 text-white px-4 py-1 rounded-md hover:bg-yellow-700 flex items-center text-sm"
                            // onClick={() => setReadOnly(false)}
                            onClick={() => hasPermission(() => setReadOnly(false), "edit")}

                        >
                            <FiEdit2 className="w-4 h-4 mr-2" />
                            Edit
                        </button>
                        <button className="bg-slate-600 text-white px-4 py-1 rounded-md hover:bg-slate-700 flex items-center text-sm"
                            onClick={() => {
                                setPrintModalOpen(true)
                                // handlePrint()
                            }}
                        >
                            <FiPrinter className="w-4 h-4 mr-2" />
                            Print
                        </button>
                    </div>
                </div>
            </div>
        </ >

    )
}

export default PurchaseReturnForm