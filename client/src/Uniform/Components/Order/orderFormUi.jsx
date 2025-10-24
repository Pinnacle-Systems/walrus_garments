import { HiPlus, HiShare, HiPrinter, HiTrash, HiMinus, HiLocationMarker, HiCheck, HiOutlineDocumentText } from "react-icons/hi";
import { FaRegSave, FaWhatsapp } from "react-icons/fa";
import { FaFileAlt } from "react-icons/fa";
import { HiX, HiOutlineRefresh } from "react-icons/hi";
import {
    ReusableDropdown,
    ReusableInput,
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
import { findFromList, getCommonParams, isGridDatasValid } from "../../../Utils/helper";
import OrderItems from "./OrderItems";
import { packingCover } from "../../../Utils/DropdownData";
import DynamicRenderer from "./DynamicComponent";
import Modal from "../../../UiComponents/Modal";
import { DateInputNew, DropdownInput, DropdownWithSearch, ReusableSearchableInput, TextInput } from "../../../Inputs";
import Swal from "sweetalert2";
import "../../../../src/swapStyle.css";
import { MdDrafts } from "react-icons/md";
import { Loader } from "../../../Basic/components";

const OrderFormUi = ({ orderDetails, setOrderDetails, readOnly, setReadOnly, setId, id, onClose, supplierList, setShowOrderForm,

    socksTypeData, sizeList, styleList, yarnNeedleList,
    yarnList, countsList, fiberContent, yarnTypeList , colorlist , socksMaterialData

}) => {

    const [editingItem, setEditingItem] = useState("");
    const [term, setTerm] = useState("");
    const [options, setOptions] = useState("")


    const [notes, setNotes] = useState("");
    const [orderBy, setOrderBy] = useState("")
    const [showAddressPopup, setShowAddressPopup] = useState(false)


    const [docId, setDocId] = useState("New")
    const [active, setActive] = useState(true);
    const [validDate, setValidDate] = useState()
    const [phone, setPhone] = useState()
    const [address, setAddress] = useState()
    const [contactPersonName, setContactPersonName] = useState("");

    const [partyId, setPartyId] = useState("");
    const [date, setDate] = useState("");
    const { branchId, userId, companyId, finYearId } = getCommonParams()
    const [openModelForAddress, setOpenModelForAddress] = useState(false)
    const [packingCoverType, setPackingCoverType] = useState("")
    const [yarnItems, setYarnItems] = useState([])

    const params = {
        branchId, userId, finYearId
    };



    const {
        data: singleData,
        isFetching: isSingleFetching,
        isLoading: isSingleLoading,
    } = useGetOrderByIdQuery(id, { skip: !id });
    const [addData] = useAddOrderMutation();
    const [updateData] = useUpdateOrderMutation();
    const [removeData] = useDeletePartyMutation();



    const syncFormWithDb = useCallback((data) => {
        if (id) {
            setReadOnly(readOnly ? readOnly : false);
        }
        if (data?.docId) {
            setDocId(data?.docId)
        }
        setDate(data?.createdAt ? moment(data?.createdAt).format("YYYY-MM-DD") : moment(new Date()).format("YYYY-MM-DD"));
        setPartyId(data?.partyId ? data?.partyId : "");
        setContactPersonName(data?.contactPersonName ? data?.contactPersonName : "")
        setPhone(data?.phone ? data?.phone : "");
        setAddress(data?.address ? data?.address : "");
        setValidDate(data?.validDate ? moment(data?.validDate).format("YYYY-MM-DD") : "");
        setOrderDetails(data?.orderDetails ? data?.orderDetails : []);
        setPackingCoverType(data?.packingCoverType ? data?.packingCoverType : "");
        setNotes(data?.notes ? data?.notes : "")
        setOrderBy(data?.orderBy ? data?.orderBy : "");
        setTerm(data?.term ? data?.term : "")

    }, [id]);

    useEffect(() => {
        if (id) {
            syncFormWithDb(singleData?.data);
        } else {
            syncFormWithDb(undefined);
        }
    }, [isSingleFetching, isSingleLoading, id, syncFormWithDb, singleData]);

    let data = {

        branchId, id, userId, companyId, notes, term, orderBy, docId,
        packingCoverType,
        active,
        partyId, finYearId, phone, contactPersonName, address, validDate, orderDetails: orderDetails?.filter(item => item.styleId)

    }




    const validateData = (data) => {

        if (orderDetails?.length > 0 && data.partyId && data?.validDate) {
            return true
        }

        return false
    }

    // const validateData = (data) => {


    //     let mandatoryFields = ["styleId", "fiberContentId", "socksMaterialId", "socksTypeId"];
    //     let YarnmandatoryFields = ["colorId", "yarnId", "count", "yarnKneedleId"];
    //     let SizemandatoryFields = ["sizeId", "weight", "qty"];


    //     // let gridYarnDatasValid = data?.orderDetails.every(obj =>
    //     //     obj?.YarnDetails?.every(yarn =>
    //     //         YarnmandatoryFields.every(field =>
    //     //             yarn?.[field] &&
    //     //             yarn?.[field] !== "" &&
    //     //             yarn?.[field] !== null &&
    //     //             parseFloat(yarn?.[field]) !== 0
    //     //         )
    //     //     )
    //     // );
    //     // let gridSizeDatasValid = data?.orderDetails.every(obj =>
    //     //     obj?.YarnDetails?.every(yarn =>
    //     //         SizemandatoryFields.every(field =>
    //     //             yarn?.[field] &&
    //     //             yarn?.[field] !== "" &&
    //     //             yarn?.[field] !== null &&
    //     //             parseFloat(yarn?.[field]) !== 0
    //     //         )
    //     //     )
    //     // );



    //     // console.log(gridYarnDatasValid,"gridYarnDatasValid",gridSizeDatasValid,"gridSizeDatasValid")

    //     // return data.partyId && data.validDate 
    //     //     && isGridDatasValid(data.orderDetails, false, mandatoryFields) && data.orderDetails.length !== 0 

    //     //        && gridYarnDatasValid &&  gridSizeDatasValid

    //     if (!data?.orderDetails || data.orderDetails.length === 0) {
    //             Swal.fire({
    //                     title:"At least one order detail is required",
    //                     icon: "success",
    //                     draggable: true,
    //                     timer: 1000,
    //                     showConfirmButton: false,
    //                     didOpen: () => {
    //                         Swal.showLoading();
    //                     }
    //                 });
    //     }

    //     // for (let i = 0; i < data.orderDetails.length; i++) {
    //     //     let order = data.orderDetails[i];
    //     //     for (let field of mandatoryFields) {
    //     //         if (!order?.[field] || order[field] === "" || order[field] === null || parseFloat(order[field]) === 0) {
    //     //             // throw new Error(`Order ${i + 1}: Missing or invalid ${field}`);

    //     //             Swal.fire({
    //     //                 title:(`Order ${i + 1}: Missing or invalid ${field}`),
    //     //                 icon: "success",
    //     //                 draggable: true,
    //     //                 timer: 1000,
    //     //                 showConfirmButton: false,
    //     //                 didOpen: () => {
    //     //                     Swal.showLoading();
    //     //                 }
    //     //             });
    //     //         }
    //     //     }

    //     // }
    // }

    console.log(data, "datatata")

    const handleSubmitCustom = async (callback, data, text, nextProcess) => {
        try {
            const formData = new FormData();
            for (let key in data) {


                if (key === 'orderDetails') {
                    formData.append(key, JSON.stringify(data[key].map(i => ({ ...i, filePath: (i.filePath instanceof File) ? i.filePath.name : i.filePath }))));
                    data[key].forEach(option => {
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
            if (returnData.statusCode === 0) {
                if (nextProcess == "new") {
                    syncFormWithDb(undefined);
                }
                else {
                    onClose()
                }

                setId(returnData?.data?.id);
                setShowOrderForm(false)


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

            } else {
                toast.error(returnData?.message);
            }

        } catch (error) {
            console.log("handle", error);
        }
    };

    const saveData = (nextProcess) => {
        if (!validateData(data)) {
            // toast.info("Please fill all required fields...!", { position: "top-center" })
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





    // useEffect(() => {
    //     if (id) return
    //     if (!singleSupplier?.data || isSingleSupplierLoading || isSingleSupplierFetching) return
    //     if (!partyId) return
    //     setPhone(singleSupplier?.data?.contactPersonNumber ? singleSupplier?.data.contactPersonNumber : "")
    //     setContactPersonName(singleSupplier?.data?.contactPersonEmail ? singleSupplier?.data.contactPersonEmail : "");
    //     setAddress(singleSupplier?.data?.address ? singleSupplier?.data.address : "");
    //     setOptions(singleSupplier?.data?.PartyContactDetails)
    // }, [setPhone, setContactPersonName, partyId, singleSupplier, isSingleSupplierLoading, isSingleSupplierFetching])








    async function onDeleteItem(itemId) {
        try {

            await removeData(itemId).unwrap();
            Swal.fire({
                title: "Deleted Successfully",
                icon: "success",
                timer: 1000,

            });
        }
        catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Submission error',
                text: error.data?.message || 'Something went wrong!',
            });
        }

    }


    const dateRef = useRef(null);
    const inputPartyRef = useRef(null);
    const styleRef = useRef(null);

    useEffect(() => {
        if (dateRef.current) {
            dateRef.current.focus();
        }
    }, []);



    // if (isSingleFetching || isSingleLoading || isSingleSupplierLoading || isSingleSupplierFetching) return <Loader />


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
                    <h1 className="text-2xl font-bold text-gray-800">Order Information</h1>
                    <div className="gpa-4">
                        {/* <button
                            onClick={onClose}
                            className="text-indigo-600 hover:text-indigo-700"
                            title="Open Report"
                        >
                            <HiOutlineDocumentText className="w-7 h-6" />
                        </button> */}
                        <button
                            onClick={onClose}
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
                                Order Details
                            </h2>
                            <div className="grid grid-cols-2 gap-1">
                                <ReusableInput label="Order No" readOnly value={docId} />

                                <ReusableInput label="Order Date" value={date} type={"date"} required={true} readOnly={true} disabled />
                                <DateInputNew name="Delivery Date" type="date" value={validDate} setValue={setValidDate} readOnly={readOnly} ref={dateRef}
                                    nextRef={inputPartyRef} required={true}
                                />
                            </div>
                        </div>



                        <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm">
                            <h2 className="font-medium text-slate-700 mb-2">Customer Details</h2>

                            <div className="grid grid-cols-1">
                                <div className="grid grid-cols-2 gap-x-3 gap-y-3">
                                    <div className="col-span-2">
                                        <ReusableSearchableInput
                                            label="Customer Id"
                                            component="PartyMaster"
                                            placeholder="Search Customer Id..."
                                            optionList={supplierList?.data}
                                            onDeleteItem={onDeleteItem}
                                            setSearchTerm={setPartyId}
                                            searchTerm={partyId}
                                            ref={inputPartyRef}
                                            nextRef={styleRef}
                                            show={"isClient"}
                                        />
                                    </div>






                                    <div className="mb-3 col-span-2">
                                        <TextInput
                                            name="Address"
                                            placeholder="Contact name"
                                            value={findFromList(partyId, supplierList?.data, "address")}
                                            setValue={setAddress}
                                            disabled={true}
                                        // onChange={(e) => setPhone(e.target.value)}

                                        />



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
                                    value={findFromList(partyId, supplierList?.data, "contactPersonName")}
                                    setValue={setContactPersonName}
                                    disabled={true}
                                />
                                <TextInput
                                    name="Contact Number"
                                    placeholder="Contact Number"
                                    value={findFromList(partyId, supplierList?.data, "contactPersonNumber")}
                                    setValue={setPhone}
                                    disabled={true}
                                // onChange={(e) => setPhone(e.target.value)}

                                />
                                <TextInput
                                    name="Email"
                                    placeholder="Email"
                                    value={findFromList(partyId, supplierList?.data, "contactPersonEmail")}
                                    setValue={setPhone}
                                    disabled={true}
                                // onChange={(e) => setPhone(e.target.value)}

                                />
                            </div>
                        </div>
                    </div>
                    <fieldset className=''>

                        <OrderItems readOnly={readOnly} setOrderDetails={setOrderDetails} orderDetails={orderDetails} id={id}
                            yarnItems={yarnItems} setYarnItems={setYarnItems} styleRef={styleRef}

                            socksTypeData={socksTypeData} sizeList={sizeList} styleList={styleList} yarnNeedleList={yarnNeedleList}
                            yarnList={yarnList} countsList={countsList} fiberContent={fiberContent} yarnTypeList={yarnTypeList} colorlist={colorlist} socksMaterialData={socksMaterialData}

                        />
                    </fieldset>


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
            </div>

        </>

    );
};

export default OrderFormUi;
