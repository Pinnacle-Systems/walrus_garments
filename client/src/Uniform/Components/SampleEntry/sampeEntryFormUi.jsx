import { HiPlus, HiShare, HiPrinter, HiTrash, HiMinus, HiLocationMarker, HiCheck } from "react-icons/hi";
import { FaWhatsapp } from "react-icons/fa";
import { FaFileAlt } from "react-icons/fa";
import { HiX, HiOutlineRefresh } from "react-icons/hi";
import {
    ReusableDropdown,
    ReusableInput,
    ReusableSearchableInput,
} from "./CommonInput";

import { FiSave, FiPlusCircle, FiMail, FiPrinter, FiX, FiCopy, FiShare2, FiEdit2 } from "react-icons/fi";
import AddressForm from "../../../Shocks/CommonReport/AddressForm";
import React, { useEffect, useState, useRef, useCallback } from "react";
import {
    useGetOrderQuery,
    useGetOrderByIdQuery,
    useAddOrderMutation,
    useUpdateOrderMutation,
    useDeleteOrderMutation,
} from "../../../redux/uniformService/OrderService";
import { useDeletePartyMutation, useGetPartyByIdQuery, useGetPartyQuery } from "../../../redux/services/PartyMasterService";
import { toast } from "react-toastify";
import moment from "moment";
import { findFromList, getCommonParams, renameFile } from "../../../Utils/helper";
import { packingCover } from "../../../Utils/DropdownData";
import DynamicRenderer from "./DynamicComponent";
import Modal from "../../../UiComponents/Modal";
import { DropdownInput, DropdownWithSearch, TextInput } from "../../../Inputs";
import Swal from "sweetalert2";
import "../../../../src/swapStyle.css";
import { useAddSampleMutation, useGetSampleByIdQuery, useGetSampleQuery, useUpdateSampleMutation } from "../../../redux/uniformService/SampleService";
import SampleItems from "./SampleItems";

const SampleEntryUi = ({ allData, isLoading, isFetching, sampleDetails, setSampleDetails, readOnly, setReadOnly, setId, id, onClose, partyData,
    orderData, setOrderId, orderId, singleOrderData, isSingleOrderLoading, isSingleOrderFetching }) => {
    const [suppliers, setSuppliers] = useState([
        "Supplier One",
        "Supplier Two",
        "Supplier Three",
    ]);
    const [showExtraCharge, setShowExtraCharge] = useState(false)
    const [showDiscount, setShowDiscount] = useState(false)
    const [isEditing, setIsEditing] = useState(false);
    const [editingItem, setEditingItem] = useState("");
    const [term, setTerm] = useState("");
    const [newSampleEntry, setNewSampleEntry] = useState(false)




    const [notes, setNotes] = useState("");
    const [orderBy, setOrderBy] = useState("")
    const [showAddressPopup, setShowAddressPopup] = useState(false)

    const handleAddSupplier = (newName) => {
        if (!suppliers.includes(newName)) {
            setSuppliers([...suppliers, newName]);
        }
    };

    const [docId, setDocId] = useState("New")
    const [active, setActive] = useState(true);
    const [validDate, setValidDate] = useState()
    const [phone, setPhone] = useState()
    const [address, setAddress] = useState()
    const [contactPersonName, setContactPersonName] = useState("");

    const [partyId, setPartyId] = useState("");
    const [date, setDate] = useState("");
    const childRecord = useRef(0);
    const [openModelForAddress, setOpenModelForAddress] = useState(false)
    const [customerCode, setCustomerCode] = useState("")

    const { branchId, userId, companyId, finYearId } = getCommonParams()
    const params = {
        branchId, userId, finYearId
    };
    const { data: supplierList } =
        useGetPartyQuery({ params: { ...params } });

    // const { data: allData, isLoading, isFetching } = useGetOrderQuery({ params, searchParams: '' });


    const getNextDocId = useCallback(() => {
        if (id || isLoading || isFetching) return
        if (allData?.nextDocId) {
            setDocId(allData.nextDocId)
        }
    }, [allData, isLoading, isFetching, id])

    useEffect(getNextDocId, [getNextDocId])




    // const {
    //     data: singleOrderData,
    //     isFetching: isSingleOrderFetching,
    //     isLoading: isSingleOrderLoading,
    // } = useGetOrderByIdQuery(orderId, { skip: !orderId });
    // const [addData] = useAddOrderMutation();
    // const [updateData] = useUpdateOrderMutation();
    const [removeData] = useDeletePartyMutation();

    const {
        data: singleData,
        isFetching: isSingleFetching,
        isLoading: isSingleLoading,
    } = useGetSampleByIdQuery(id, { skip: !id });
    const [addData] = useAddSampleMutation()
    const [updateData] = useUpdateSampleMutation();



    const syncFormWithDb = useCallback((data, sampleDetails) => {
        console.log("data", data)
        if (id || orderId) {
            setReadOnly(readOnly ? readOnly : false);
        }
        if (id) {
            setDocId(data?.docId)
        }
        setDate(data?.createdAt ? moment(data?.createdAt).format("YYYY-MM-DD") : moment(new Date()).format("YYYY-MM-DD"));
        setPartyId(data?.partyId ? data?.partyId : "");
        // setContactPersonName(data?.contactPersonName ? data?.contactPersonName : "")
        // setPhone(data?.phone ? data?.phone : "");
        setAddress(data?.address ? data?.address : "");
        setValidDate(data?.validDate ? moment(data?.validDate).format("YYYY-MM-DD") : "");
        // setOrderId(data?.orderId   ? data?.orderId  : undefined )
        // setSampleDetails(sampleDetails)

        setCustomerCode(data?.packingCoverType ? data?.packingCoverType : "");
        setNotes(data?.notes ? data?.notes : "")
        setOrderBy(data?.orderBy ? data?.orderBy : "");
        setTerm(data?.term ? data?.term : "")

    }, [orderId, id]);


    useEffect(() => {
        if (orderId) {
            syncFormWithDb(singleOrderData?.data, singleOrderData?.data?.orderDetails);
            setSampleDetails(
                singleOrderData?.data?.orderDetails?.map(item => ({
                    ...item,
                    sampleSizeDetails: item?.orderSizeDetails || [],
                    sampleYarnDetails: item?.orderYarnDetails

                }))
            );


        }
        else if (id) {
            syncFormWithDb(singleData?.data, singleData?.data?.sampleDetails);
            setSampleDetails(singleData?.data?.sampleDetails)
        }

        else {
            syncFormWithDb(undefined);
        }
    }, [isSingleOrderFetching, isSingleOrderLoading, orderId, syncFormWithDb, singleOrderData, singleData, isSingleFetching, isSingleLoading, id]);


    let data = {
        branchId, id, userId, companyId, notes, term, orderBy, docId,
        packingCoverType: customerCode,
        active,
        partyId, finYearId, phone, contactPersonName, address, validDate,
        sampleDetails
        // : sampleDetails
        //     ?.filter(item => item.styleId)
        //     .map(item => ({
        //         ...item,
        //         sampleSizeDetails: item?.sampleSizeDetails?.filter(size => size.qty) || [],
        //         sampleYarnDetails : item?.orderYarnDetails
        //     }))
        //     .filter(item => item.sampleSizeDetails.length > 0)
    }

    console.log(data, "dataaa")




    const validateData = (data) => {

        if (sampleDetails?.length > 0 && data.partyId) {
            return true
        }

        return false
    }

    const handleSubmitCustom = async (callback, data, text, nextProcess) => {
        try {
            const formData = new FormData();
            for (let key in data) {

                if (key === 'sampleDetails') {
                    formData.append(key, JSON.stringify(data[key].map(i => ({ ...i, filePath: (i.filePath instanceof File) ? i.filePath.name : i.filePath }))));
                    data[key].forEach(option => {
                        console.log(option?.filePath instanceof File, "filePath")
                        if (option?.filePath instanceof File) {
                            formData.append('images', option.filePath);
                        }
                    });
                } else {
                    formData.append(key, data[key]);
                }
            }

            let returnData;
            if (text === "Updated") {
                console.log(formData, "formData")
                returnData = await callback({ id, body: formData }).unwrap();
            } else {
                returnData = await callback(formData).unwrap();
            }
            setId(returnData?.data?.id)
            if (returnData.statusCode === 0) {
                if (nextProcess == "new") {
                    syncFormWithDb(undefined);
                }
                else {
                    onClose()
                }

                // setId(returnData?.data?.id);



                Swal.fire({
                    title: text + "  " + "Successfully",
                    icon: "success",
                    draggable: true,
                    timer: 1000,
                    showConfirmButton: false,
                    didOpen: () => {
                        Swal.showLoading();
                    }
                });
                // toast.success(text + "Successfully");

            } else {
                toast.error(returnData?.message);
            }

        } catch (error) {
            console.log("handle", error);
        }
    };

    const saveData = (nextProcess) => {
        if (!validateData(data)) {
            toast.info("Please fill all required fields...!", { position: "top-center" })
            return
        }
        if (!window.confirm("Are you sure save the details ...?")) {
            return
        }
        if (nextProcess == "draft" && !id) {


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


    const handleKeyDown = (event) => {
        let charCode = String.fromCharCode(event.which).toLowerCase();
        if ((event.ctrlKey || event.metaKey) && charCode === "s") {
            event.preventDefault();
            saveData();
        }
    };

    const onNew = () => {
        setId("");
        setReadOnly(false);
        setSampleDetails([]);

    }
    useEffect(() => {
        if (Array.isArray(sampleDetails) && sampleDetails.length >= 1) return;

        setSampleDetails(prev => {
            const safePrev = Array.isArray(prev) ? prev : [];
            const newArray = Array.from({ length: 1 - safePrev.length }, () => ({
                yarnNeedleId: "", machineId: "", fiberContentId: "", description: "", socksMaterialId: "", uomId: "",
                measurements: "", sizeId: "", styleId: "", legcolorId: "", footcolorId: "",
                stripecolorId: "", noOfStripes: "0", socksTypeId: "", sampleQty: 0.00, sampleWeight: 0.00,
                sampleSizeDetails: [{ qty: 0.00, sizeId: "", weight: "" }]
            }));

            return [...safePrev, ...newArray];
        });
    }, [setSampleDetails, sampleDetails]);




    // useEffect(() => {
    //     if (id) return
    //     if (!singleSupplier?.data || isSingleSupplierLoading || isSingleSupplierFetching) return
    //     if (!partyId) return
    //     setPhone(singleSupplier?.data?.contactMobile ? singleSupplier?.data.contactMobile : "")
    //     setContactPersonName(singleSupplier?.data?.contactPersonName ? singleSupplier?.data.contactPersonName : "");
    //     setAddress(singleSupplier?.data?.address ? singleSupplier?.data.address : "");
    // }, [setPhone, setContactPersonName, partyId, singleSupplier, isSingleSupplierLoading, isSingleSupplierFetching])


    let itemHeading = [
        "S.No.",
        "Style",
        "Image",
        "Needle",
        "Machine",
        "Fab.Content",
        "Desc",
        "Material",
        "Socks.Type",
        "Leg.col",
        "Foot.col",
        "Stripe.col",
        "N.Stripe",
        "Size",
        "S.Mea",
        "Qty",
        "Edit/Del"
    ]


    async function onDeleteItem(itemId) {
        await removeData(itemId).unwrap();
    }

    function getTotalQty() {
        return sampleDetails?.reduce((acc, curr) => {
            const sizeQty = curr?.sampleSizeDetails?.reduce(
                (sAcc, sCurr) => sAcc + (parseInt(sCurr?.qty) || 0),
                0
            );
            return acc + sizeQty;
        }, 0) || 0;
    }


    return (
        <>


            <Modal
                isOpen={openModelForAddress}
                onClose={() => setOpenModelForAddress(false)}
                widthClass={"w-[10%] h-[10%]"}
            >
                <DynamicRenderer openModelForAddress={openModelForAddress} componentName={"PartyMaster"}
                    editingItem={editingItem} onCloseForm={() => { setOpenModelForAddress(false); setShowAddressPopup(true) }} />
            </Modal>

            <div className="w-full bg-[#f1f1f0] mx-auto rounded-md shadow-md px-2 py-1 overflow-y-auto">
                <div className="flex justify-between items-center mb-1">
                    <h1 className="text-2xl font-bold text-gray-800">Sample Entry</h1>
                    <button
                        onClick={() => {
                            setOrderId("")
                            setId("")
                            setSampleDetails([]);
                            onClose();
                        }}
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
                                Sample Details
                            </h2>
                            <div className="grid grid-cols-2 gap-1">
                                <ReusableInput label="Sample.No" readOnly value={docId} />
                                <ReusableInput label="Date" value={date} type={"date"} required={true} readOnly={true} />
                                {/* <ReusableInput label="Deleivery Date" type="date" value={validDate} setValue={setValidDate}  /> */}

                                <div className="flex items-center gap-2 text-xs text-slate-500 mb-1 item-center mt-4 mr-5 ">
                                    <span className="text-xs font-bold text-slate-700 mb-1 ">Direct Sample</span>
                                    <input
                                        type="checkbox"
                                        onClick={() => {
                                            setNewSampleEntry(!newSampleEntry)
                                            syncFormWithDb(undefined);
                                            setSampleDetails([]);
                                            setOrderId("")
                                        }}
                                        disabled={orderId}
                                    />
                                </div>
                                <DropdownWithSearch
                                    name="Orders"
                                    options={orderData?.data}
                                    value={orderId}
                                    setValue={setOrderId}
                                    disabled={newSampleEntry ? true : false}
                                    labelField={"docId"}
                                    label={"Orders"}

                                />
                            </div>
                        </div>



                        <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm">
                            <h2 className="font-medium text-slate-700 mb-2">Customer Details</h2>

                            <div className="grid grid-cols-1">
                                <div className="grid grid-cols-2 gap-x-3 gap-y-3">
                                    <div className="col-span-2">
                                        {/* <ReusableSearchableInput
                                            label="Customer Id"
                                            component="PartyMaster"
                                            placeholder="Search Customer Id..."
                                            optionList={supplierList?.data}
                                            onAddItem={handleAddSupplier}
                                            onDeleteItem={onDeleteItem}
                                            setSearchTerm={setPartyId}
                                            searchTerm={partyId}
                                            disabled={true}
                                        /> */}
                                        <label className="block text-xs font-bold text-slate-700 mb-1">
                                            Customer
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                className="w-full pl-2.5 pr-8 py-1.5 text-xs border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 "
                                                placeholder=""
                                                disabled
                                                value={findFromList(partyId, supplierList?.data, "code")}
                                            // onClick={() => setShowAddressPopup(true)}
                                            />


                                        </div>
                                    </div>


                                    <div className="mb-3">
                                        <label className="block text-xs font-bold text-slate-700 mb-1">
                                            Address
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                className="w-full pl-2.5 pr-8 py-1.5 text-xs border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 "
                                                placeholder="Select address"
                                                disabled
                                                value={findFromList(partyId, supplierList?.data, "address")}
                                            // onClick={() => setShowAddressPopup(true)}
                                            />


                                        </div>




                                    </div>




                                </div>
                            </div>
                        </div>



                        <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm col-span-1">
                            <h2 className="font-medium text-slate-700 mb-2">
                                Contact Details
                            </h2>
                            <div className="grid grid-cols-2 gap-x-3">
                                <TextInput
                                    name="Contact Person"
                                    placeholder="Contact name"
                                    value={findFromList(partyId, supplierList?.data, "contactPersonEmail")}
                                    setValue={setContactPersonName}
                                    disabled={true}
                                />
                                <TextInput
                                    name="Phone"
                                    placeholder="Contact name"
                                    value={findFromList(partyId, supplierList?.data, "contactPersonNumber")}
                                    setValue={setPhone}
                                    disabled={true}
                                // onChange={(e) => setPhone(e.target.value)}

                                />

                            </div>
                        </div>
                    </div>




                    <div>
                        <SampleItems newSampleEntry={newSampleEntry} readOnly={readOnly} itemHeading={itemHeading}

                            setSampleDetails={setSampleDetails} sampleDetails={sampleDetails} id={id} orderId={orderId}
                        />
                    </div>




                    <div className="grid grid-cols-3 gap-3">
                        <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm">
                            <h2 className="font-medium text-slate-700 mb-2 text-base">   Terms & Conditions</h2>
                            <textarea
                                // disabled={true}
                                value={term}
                                onChange={(e) => {
                                    setTerm(e.target.value)
                                }}
                                className="w-full h-10 overflow-auto px-2.5 py-2 text-xs border border-slate-300 rounded-md  focus:ring-1 focus:ring-indigo-200 focus:border-indigo-500"
                                placeholder="Additional notes..."

                            />

                        </div>



                        <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm ">
                            <h2 className="font-medium text-slate-700 mb-2 text-base">Notes</h2>
                            <textarea
                                // disabled={true}
                                value={notes}
                                onChange={(e) => {
                                    setNotes(e.target.value)
                                }}
                                className="w-full h-10 overflow-auto px-2.5 py-2 text-xs border border-slate-300 rounded-md  focus:ring-1 focus:ring-indigo-200 focus:border-indigo-500"
                                placeholder="Additional notes..."
                            />
                        </div>


                        <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm">
                            <h2 className="font-semibold text-slate-800 mb-2 text-base">
                                Qty Summary
                            </h2>

                            <div className="space-y-1.5">
                                <div className="flex justify-between py-1 text-sm">
                                    <span className="text-slate-600">Total Qty</span>
                                    <span className="font-medium">{parseInt(getTotalQty())}   No's</span>
                                </div>




                            </div>
                        </div>




                    </div>

                    <div className="flex flex-col md:flex-row gap-2 justify-between mt-4">
                        {/* Left Buttons */}
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

                        {/* Right Buttons */}
                        <div className="flex gap-2 flex-wrap">
                            {/* <button className="bg-emerald-600 text-white px-4 py-1 rounded-md hover:bg-emerald-700 flex items-center text-sm">
                                <FiShare2 className="w-4 h-4 mr-2" />
                                Email
                            </button> */}
                            <button className="bg-yellow-600 text-white px-4 py-1 rounded-md hover:bg-yellow-700 flex items-center text-sm"
                                onClick={() => setReadOnly(false)}
                            >
                                <FiEdit2 className="w-4 h-4 mr-2" />
                                Edit
                            </button>
                            {/* <button className="bg-emerald-600 text-white px-4 py-1 rounded-md hover:bg-emerald-700 flex items-center text-sm">
                                <FaWhatsapp className="w-4 h-4 mr-2" />
                                WhatsApp
                            </button> */}
                            <button className="bg-slate-600 text-white px-4 py-1 rounded-md hover:bg-slate-700 flex items-center text-sm">
                                <FiPrinter className="w-4 h-4 mr-2" />
                                Print
                            </button>
                        </div>
                    </div>
                </div>
            </div>

        </>

    );
};

export default SampleEntryUi;
