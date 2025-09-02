import { FaFileAlt, FaWhatsapp } from "react-icons/fa";
import { ReusableInput } from "../Order/CommonInput";
import { DropdownInput, DropdownWithSearch, TextInput } from "../../../Inputs";
import { FiEdit2, FiPrinter, FiSave } from "react-icons/fi";
import { HiOutlineRefresh } from "react-icons/hi";
import { useCallback, useEffect, useState } from "react";
import moment from "moment";
import FormItems from "./FormItems";
import { useGetOrderByIdQuery, useGetOrderItemsByIdNewQuery } from "../../../redux/uniformService/OrderService";
import { findFromList, getCommonParams } from "../../../Utils/helper";
import { useGetPartyQuery } from "../../../redux/services/PartyMasterService";
import { useAddRequirementPlanningFormMutation, useDeleteRequirementPlanningFormMutation, useGetRequirementPlanningFormByIdQuery, useUpdateRequirementPlanningFormMutation } from "../../../redux/uniformService/RequirementPlanningFormServices";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import { Colors, packingCover } from "../../../Utils/DropdownData";
import { useGetSocksMaterialQuery } from "../../../redux/uniformService/SocksMaterialMasterService";

const RequirmentForm = ({ id, setId, onClose, readOnly, setReadOnly, orderData, orderId, setOrderId }) => {




    const [docId, setDocId] = useState("New")
    const [showOrderForm, setShowOrderForm] = useState(true);
    const [active, setActive] = useState(true);
    const [styleId, setstyleId] = useState("");
    const [date, setDate] = useState(moment(new Date()).format("YYYY-MM-DD"));
    const [sampledetails, setSampleDetails] = useState([]);
    const [orderSizeDetails, setOrderSizeDetails] = useState([])
    const [orderYarnDetails, setOrderYarnDetails] = useState([])
    const [requirementForm, setRequirementForm] = useState([])
    const [partyId, setPartyId] = useState("");

    const { data: singleOrderData, isLoading: isSingleOrderLoading, isFetching: isSingleOrderFetching } = useGetOrderByIdQuery(orderId, { skip: !orderId });

    const { data: orderItemsData, isLoading: orderItemsDataLoading, isFetching: orderItemsDataFetching } = useGetOrderItemsByIdNewQuery({ id: styleId }, { skip: !styleId });

    const { data: singleData, isLoading: isSingleLoading, isFetching: isSingleFetching } = useGetRequirementPlanningFormByIdQuery(id, { skip: !id });

    const [addData] = useAddRequirementPlanningFormMutation();
    const [updateData] = useUpdateRequirementPlanningFormMutation();
    const [removeData] = useDeleteRequirementPlanningFormMutation();

    const { branchId, userId, companyId, finYearId } = getCommonParams()
    const params = {
        branchId, userId, finYearId
    };

    const { data: supplierList } =
        useGetPartyQuery({ params: { ...params } });


    const syncFormWithDb = useCallback((data) => {


        if (orderId) {
            setOrderSizeDetails(data?.orderSizeDetails ? data?.orderSizeDetails : [])
            setOrderYarnDetails(data?.orderYarnDetails ? data?.orderYarnDetails : [])
        }
        if (id) {
            setOrderSizeDetails(data?.requirementSizeDetails ? data?.requirementSizeDetails : [])
            setOrderYarnDetails(data?.RequirementYarnDetails ? data?.RequirementYarnDetails : [])
        }


    }, [styleId]);


    useEffect(() => {
        if (styleId && orderItemsData?.data) {
            syncFormWithDb(orderItemsData.data, styleId);
        }

    }, [orderItemsDataFetching, orderItemsDataLoading, styleId, syncFormWithDb, orderItemsData]);


    const { data: socksMaterialData } =
        useGetSocksMaterialQuery({ params: { ...params } });

    useEffect(() => {
        if (orderId && singleOrderData?.data) {
            setPartyId(singleOrderData?.data?.partyId || "")
        }

    }, [isSingleFetching, isSingleOrderLoading, orderId, singleOrderData]);



    useEffect(() => {
        if (id && singleData?.data) {
            syncFormWithDb(singleData.data, id);
        }

    }, [isSingleOrderFetching, isSingleLoading, id, singleData]);


    console.log(partyId, 'partyId');

    let data = {

        branchId, userId, companyId, docId,
        active,
        partyId, finYearId, orderYarnDetails, orderSizeDetails, orderId, styleId,
    }


    // const validateData = (data) => {

    //     if (orderDetails?.length > 0 && data.partyId) {
    //         return true
    //     }

    //     return false
    // }

    const handleSubmitCustom = async (callback, data, text, nextProcess) => {
        try {

            let returnData;
            if (text === "Updated") {
                returnData = await callback({ id, body: data }).unwrap();
            } else {
                returnData = await callback(data).unwrap();
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
        // if (!validateData(data)) {
        //     toast.info("Please fill all required fields...!", { position: "top-center" })
        //     return
        // }
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


    return (
        <>
            <div className="w-full bg-[#f1f1f0] mx-auto rounded-md shadow-md px-2 py-1 overflow-y-auto">
                <div className="flex justify-between items-center mb-1">
                    <h1 className="text-xl font-bold text-gray-800">Requirement Planning Form</h1>
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
                                Basic Details
                            </h2>
                            <div className="grid grid-cols-2 gap-1">
                                <ReusableInput label="Doc.Id" readOnly value={docId} />
                                <ReusableInput label="Date" value={date} type={"date"} required={true} readOnly={true} disabled />
                                <ReusableInput label="Delivery Date" value={date} type={"date"} required={true} readOnly={true} disabled />
                                <TextInput
                                    name="Job Number"
                                    placeholder="Contact name"
                                />
                                <DropdownWithSearch
                                    name="Sample orders"
                                    options={orderData?.data}
                                    value={orderId}
                                    setValue={setOrderId}
                                    // disabled={newSampleEntry ? false : true} 
                                    labelField={"docId"}
                                    label={"Order No"}
                                />
                                <DropdownWithSearch
                                    name="Sample orders"
                                    options={singleOrderData?.data?.orderDetails?.map(o => ({
                                        ...o,
                                        displayLabel: o?.style?.name
                                    }))}
                                    value={styleId}
                                    setValue={setstyleId}
                                    labelField={"displayLabel"}
                                    label={"Stytle Name"}
                                />
                            </div>
                        </div>







                        <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm col-span-1">
                            {/* <h2 className="font-medium text-slate-700 mb-2">
                                Order Details
                            </h2> */}
                            <div className="grid grid-cols-2 gap-x-3">



                                <DropdownInput name="Leg Color" options={Colors} required={true} />
                                <DropdownInput name="Foot Color" options={Colors} required={true} />
                                <DropdownInput name="Stripes Color" options={Colors} required={true} />
                                <DropdownWithSearch label={"socksType"} labelField={"name"} options={socksMaterialData?.data} type={"date"} required={true} />
                                <DropdownInput name="Packing Cover" options={packingCover} required={true} />
                                {/* <DropdownInput name="Packing Type"   required={true} /> */}

                            </div>

                        </div>

                        <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm col-span-1 ">
                            {/* <h2 className="font-medium text-slate-700 mb-2">
                                Contact Details
                            </h2> */}
                            <div className="grid grid-cols-2 gap-x-3">
                                <TextInput
                                    name="Customer"
                                    placeholder="Contact name"
                                    value={findFromList(partyId, supplierList?.data, "name")}
                                    // setValue={setContactPersonName}
                                    disabled={true}
                                />
                                <TextInput
                                    name="Contact Person"
                                    placeholder="Contact Person"
                                    value={findFromList(partyId, supplierList?.data, "contactPersonEmail")}
                                    // setValue={setContactPersonName}
                                    disabled={true}
                                />
                                <TextInput
                                    name="Contact Number"
                                    placeholder="Contact Number"
                                    value={findFromList(partyId, supplierList?.data, "contactPersonNumber")}
                                    // setValue={setPhone}
                                    disabled={true}
                                // onChange={(e) => setPhone(e.target.value)}

                                />



                            </div>
                        </div>
                    </div>


                    <fieldset className=''>

                        <FormItems sampleDetails={sampledetails} orderSizeDetails={orderSizeDetails} orderYarnDetails={orderYarnDetails} setOrderYarnDetails={setOrderYarnDetails}
                            setRequirementForm={setRequirementForm} requirementForm={requirementForm} readOnly={readOnly} setReadOnly={setReadOnly} id={id}
                        />

                    </fieldset>


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
    )
}

export default RequirmentForm;




