import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { getCommonParams, getDateFromDateTime, isGridDatasValid } from "../../../Utils/helper";
import { useAddBillEntryMutation, useDeleteBillEntryMutation, useGetBillEntryByIdQuery, useGetBillEntryQuery, useUpdateBillEntryMutation } from "../../../redux/uniformService/BillEntryServices";
import { useGetPartyBranchByIdQuery, useGetPartyByIdQuery, useGetPartyQuery } from "../../../redux/services/PartyMasterService";
import { useGetTaxTemplateQuery } from "../../../redux/services/TaxTemplateServices";
import useTaxDetailsHook from "../../../CustomHooks/TaxHookDetails";
import moment from "moment";
import Modal from "../../../UiComponents/Modal";


import { toast } from "react-toastify";
import PurchaseInwardFormReport from "./PurchaseInwardFormReport";
import { DateInputNew, DisabledInput, DropdownInput, ReusableSearchableInput, TextInput } from "../../../Inputs";
import { poTypes, YarnMaterial } from "../../../Utils/DropdownData";
import { dropDownListObject } from "../../../Utils/contructObject";
import { FaFileAlt, FaWhatsapp } from "react-icons/fa";
import { ReusableInput } from "../Order/CommonInput";
import { FiEdit2, FiPrinter, FiSave } from "react-icons/fi";
import { HiOutlineRefresh } from "react-icons/hi";
import YarnInwardItems from "./YarnInwardItems";
import PoItemsSelection from "./PoItemsSelection";
import { useGetHsnMasterQuery } from "../../../redux/services/HsnMasterServices";
import Swal from "sweetalert2";

const MODEL = "Bill Entry";


export const PurchaseBillEntry = ({
    onClose,
    inwardItemSelection, setInwardItemSelection,
    readOnly, setReadOnly,
    id, setId,
    date, setDate,
    poType, setPoType,
    supplierId, setSupplierId,
    docId, setDocId,
    summary, setSummary,
    inwardItems, setInwardItems,
    formReport, setFormReport,
    searchValue, setSearchValue,
    discountType, setDiscountType,
    discountValue, setDiscountValue,
    partyBillNo, setPartyBillNo,
    partyBillDate, setPartyBillDate,
    netBillValue, setNetBillValue,
    taxTemplateId, setTaxTemplateId,
    setContextMenu, contextMenu,
    supplierList, taxTypeList
}) => {


    const childRecord = useRef(0);

    const dispatch = useDispatch()


    const { branchId, companyId, finYearId, userId } = getCommonParams()

    const params = {
        branchId, companyId
    };


    const { data: supplierDetails } =
        useGetPartyByIdQuery(supplierId, { skip: !supplierId });



    const { data: allData, isLoading, isFetching } = useGetBillEntryQuery({ params: { branchId, finYearId } });

    const { isLoading: isTaxHookDetailsLoading, ...taxDetails } = useTaxDetailsHook({ poItems: inwardItems, taxTypeId: taxTemplateId, discountType, discountValue })

    const { data: hsnData } =
        useGetHsnMasterQuery({ params });

    const {
        data: singleData,
        isFetching: isSingleFetching,
        isLoading: isSingleLoading,
    } = useGetBillEntryByIdQuery({ id }, { skip: !id });

    function isSupplierOutside() {
        if (supplierDetails) {
            return supplierDetails?.data?.City?.state?.name !== "TAMIL NADU"
        }
        return false
    }

    const [addData] = useAddBillEntryMutation();
    const [updateData] = useUpdateBillEntryMutation();
    const [removeData] = useDeleteBillEntryMutation();


    const syncFormWithDb = useCallback((data) => {
        if (id) {
            setReadOnly(true);
        } else {
            setReadOnly(false);
        }
        if (data?.docId) {
            setDocId(data?.docId)
        }
        setPoType(data?.poType ? data.poType : "DyedYarn");
        setDiscountType(data?.discountType ? data?.discountType : "")
        setDiscountValue(data?.discountValue ? data?.discountValue : "0")
        setInwardItems(data?.BillEntryItems ? structuredClone(data.BillEntryItems) : [])
        if (data?.createdAt) setDate(moment.utc(data?.createdAt).format("YYYY-MM-DD"));
        setPartyBillNo(data?.partyBillNo ? data?.partyBillNo : "")
        setPartyBillDate(data?.partyBillDate ? moment.utc(data?.partyBillDate).format("YYYY-MM-DD") : "")
        setSupplierId(data?.supplierId ? data?.supplierId : "");
        setTaxTemplateId(data?.taxTemplateId ? data.taxTemplateId : "")
        setNetBillValue(data?.netBillValue ? data.netBillValue : "")
    }, [id]);

    // const getNextDocId = useCallback(() => {
    //     if (id) return
    //     if (allData?.nextDocId) {
    //         setDocId(allData.nextDocId)
    //     }
    // }, [allData, id])

    // useEffect(getNextDocId, [getNextDocId])

    useEffect(() => {
        if (id) {
            syncFormWithDb(singleData?.data);
        } else {
            syncFormWithDb(undefined);
        }
    }, [isSingleFetching, isSingleLoading, id, syncFormWithDb, singleData]);

    const data = {
        poType, supplierId,
        branchId, id, userId,
        partyBillNo, partyBillDate,
        netBillValue, taxTemplateId,
        billEntryItems: inwardItems,
        discountType, discountValue, finYearId
    }

    const validateData = (data) => {
        let mandatoryFields = ["qty"];
        return data.poType && data.supplierId && data.partyBillDate && data.partyBillNo
            && isGridDatasValid(data.billEntryItems, false, mandatoryFields)
    }

    const handleSubmitCustom = async (callback, data, text) => {
        try {
            let returnData;
            if (text === "Updated") {
                returnData = await callback({ id, body: data }).unwrap();
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
                }); setId("")
                syncFormWithDb(undefined)
            }
            dispatch({
                type: `Ledger/invalidateTags`,
                payload: ['Ledger'],
            });
            dispatch({
                type: `po/invalidateTags`,
                payload: ['po'],
            });
            dispatch({
                type: `DirectInwardOrReturn/invalidateTags`,
                payload: ['DirectInwardOrReturn'],
            });

        } catch (error) {
            console.log("handle", error);
        }
    };


    const saveData = () => {

        if (!validateData(data)) {
            Swal.fire({
                // title: "Total percentage exceeds 100%",
                title: "Please fill all required fields...!",
                icon: "error",
                timer: 1500,
                showConfirmButton: false,
            });
            return
        }

        if (parseFloat(taxDetails?.netAmount) !== parseFloat(netBillValue)) {

            Swal.fire({
                // title: "Total percentage exceeds 100%",
                title: "Net Bill Value Not Matching Net Amount...!",
                icon: "error",
                timer: 1500,
                showConfirmButton: false,
            });
            return
            // toast.info("Net Bill Value Not Matching Net Amount...!", { position: "top-center" })
            return
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

    const deleteData = async () => {
        if (id) {
            if (!window.confirm("Are you sure to delete...?")) {
                return;
            }
            try {
                await removeData(id)
                setId("");
                dispatch({
                    type: `po/invalidateTags`,
                    payload: ['po'],
                });
                dispatch({
                    type: `DirectInwardOrReturn/invalidateTags`,
                    payload: ['DirectInwardOrReturn'],
                });
                dispatch({
                    type: `Ledger/invalidateTags`,
                    payload: ['Ledger'],
                });
                onNew();
                toast.success("Deleted Successfully");
            } catch (error) {
                toast.error("something went wrong");
            }
        }
    };

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
    };



    function removeItem(id, isPoItem) {
        console.log(id, "iddddddddd", isPoItem)
        setInwardItems(localInwardItems => {
            let newItems = structuredClone(localInwardItems);
            newItems = newItems.filter(item => !((parseInt(item?.isPoItem ? item.poItemsId : item.directItemsId) === parseInt(id)) && (item.isPoItem === isPoItem)))
            return newItems
        });
    }

    const { data: branchList } = useGetPartyBranchByIdQuery({ params: { companyId } });

    const allSuppliers = supplierList ? supplierList.data : []

    function filterSupplier() {
        let finalSupplier = []
        if (poType.toLowerCase().includes("yarn")) {
            finalSupplier = allSuppliers.filter(s => s.yarn)
        } else if (poType.toLowerCase().includes("fabric")) {
            finalSupplier = allSuppliers.filter(s => s.fabric)
        } else {
            finalSupplier = allSuppliers.filter(s => s.PartyOnAccessoryItems.length > 0)
        }
        return finalSupplier
    }
    let supplierListBasedOnSupply = filterSupplier()

    // if (!branchList?.data) return <Loader />

    const handleRightClick = (event, rowIndex, gridId, isPoItem) => {
        event.preventDefault();
        setContextMenu({
            mouseX: event.clientX,
            mouseY: event.clientY,
            rowId: rowIndex,
            gridId: gridId,
            isPoItem: isPoItem


        });
    };
    const handleCloseContextMenu = () => {
        setContextMenu(null);
    };
    return (

        <>
            <Modal isOpen={inwardItemSelection} onClose={() => setInwardItemSelection(false)} widthClass={"w-[95%] h-[90%] py-10"}>
                <PoItemsSelection setInwardItemSelection={setInwardItemSelection} transtype={poType}
                    supplierId={supplierId} supplierList={supplierList}
                    inwardItems={inwardItems}
                    setInwardItems={setInwardItems} />
            </Modal>
            <div className="w-full bg-[#f1f1f0] mx-auto rounded-md shadow-md px-2 py-1 ">
                <div className="flex justify-between items-center mb-1">
                    <h1 className="text-2xl font-bold text-gray-800">Purchase Bill Entry </h1>
                    <button
                        onClick={onClose}
                        className="text-indigo-600 hover:text-indigo-700"
                        title="Open Report"
                    >
                        <FaFileAlt className="w-5 h-5" />
                    </button>
                </div>

            </div>
            <div className="space-y-3 h-full mt-2">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">


                    <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm col-span-1">
                        <h2 className="font-medium text-slate-700 mb-2">
                            Basic Details
                        </h2>
                        <div className="grid grid-cols-2 gap-1">


                            <ReusableInput label="Doc. Id" readOnly value={docId} />
                            <ReusableInput label="Doc Date" value={date} type={"date"} required={true} readOnly={true} disabled />


                        </div>
                    </div>




                    <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm col-span-1">
                        <h2 className="font-medium text-slate-700 mb-2">
                            Inward Details
                        </h2>
                        <div className="grid grid-cols-2 gap-1">
                            <div className="col-span-2">

                                <ReusableSearchableInput
                                    label="Supplier Id"
                                    component="PartyMaster"
                                    placeholder="Search Supplier Id..."
                                    optionList={supplierList?.data}
                                    // onDeleteItem={onDeleteItem}
                                    setSearchTerm={setSupplierId}
                                    searchTerm={supplierId}
                                    // ref={inputPartyRef}
                                    // nextRef={styleRef}
                                    show={"isSupplier"}
                                />
                            </div>
                            <DropdownInput
                                className={"w-[110px]"}
                                name="Po Type"
                                options={YarnMaterial}
                                value={poType}
                                setValue={setPoType}
                                required={true}
                                readOnly={id || readOnly}
                            />




                        </div>

                    </div>
                    <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm col-span-1">
                        <h2 className="font-medium text-slate-700 mb-2">
                            Supplier Details
                        </h2>
                        <div className="grid grid-cols-2 gap-1">

                            <TextInput name={"PartyBill No"} required value={partyBillNo} setValue={setPartyBillNo} readOnly={readOnly} />

                            <DateInputNew name={"PartyBill Date"} required value={partyBillDate} setValue={setPartyBillDate} type={"date"} readOnly={readOnly} />
                          
                            <TextInput name={"Net Bill Value"} value={netBillValue} setValue={setNetBillValue} readOnly={readOnly} required />

                            <DropdownInput name="Tax Type" options={dropDownListObject(taxTypeList ? taxTypeList.data : [], "name", "id")} value={taxTemplateId} setValue={setTaxTemplateId} required={true} readOnly={readOnly} />

                        </div>

                    </div>

                </div>
                <fieldset>
                    {
                        <YarnInwardItems billEntryId={id} handleDeleteRow={removeItem}
                            transType={poType} inwardItems={inwardItems} setInwardItems={setInwardItems}
                            readOnly={readOnly} isSupplierOutside={isSupplierOutside()}
                            setInwardItemSelection={setInwardItemSelection} supplierId={supplierId} handleRightClick={handleRightClick}
                            handleCloseContextMenu={handleCloseContextMenu} contextMenu={contextMenu} taxTemplateId={taxTemplateId} hsnData={hsnData}

                        />

                    }
                </fieldset>

                <div className="grid grid-cols-3 gap-3">
                    <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm">
                        <h2 className="font-medium text-slate-700 mb-2 text-base">Terms & Conditions</h2>
                        <textarea
                            readOnly={readOnly}
                            // value={term}
                            onChange={(e) => {
                                // setTerm(e.target.value)
                            }}
                            className="w-full h-20 overflow-auto px-2.5 py-2 text-xs border border-slate-300 rounded-md  focus:ring-1 focus:ring-indigo-200 focus:border-indigo-500"
                            placeholder="Additional notes..."

                        />

                    </div>




                    <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm ">
                        <h2 className="font-medium text-slate-700 mb-2 text-base">Notes</h2>
                        <textarea
                            readOnly={readOnly}
                            // value={notes}
                            onChange={(e) => {
                                // setNotes(e.target.value)
                            }}
                            className="w-full h-20 overflow-auto px-2.5 py-2 text-xs border border-slate-300 rounded-md  focus:ring-1 focus:ring-indigo-200 focus:border-indigo-500"
                            placeholder="Additional notes..."
                        />
                    </div>


                    {/* Pricing Summary (Grand Total) Section */}
                    <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm">
                        <h2 className="font-semibold text-slate-800 mb-2 text-base">
                            Qty Summary
                        </h2>

                        <div className="space-y-1.5">
                            <div className="flex justify-between py-1 text-sm">
                                <span className="text-slate-600">Total Qty</span>
                                {/* <span className="font-medium">{parseInt(getTotalQty())}   No's</span> */}
                            </div>



                            <div className="flex justify-between py-1 text-sm">
                                <span className="text-slate-600">Order By</span>
                                <input
                                    type="text"
                                    className="w-60 pl-2.5 pr-8 py-1 text-xs border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 cursor-pointer"
                                    placeholder="Order By"
                                    readOnly
                                // value={orderBy}
                                // onChange={(e) => setOrderBy(e.target.value)}
                                />
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
                        <button className="bg-slate-600 text-white px-4 py-1 rounded-md hover:bg-slate-700 flex items-center text-sm">
                            <FiPrinter className="w-4 h-4 mr-2" />
                            Print
                        </button>
                    </div>
                </div>
            </div>
        </>


    );
}