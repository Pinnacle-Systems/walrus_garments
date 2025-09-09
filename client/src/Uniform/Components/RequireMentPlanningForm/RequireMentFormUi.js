import { FaFileAlt, FaWhatsapp } from "react-icons/fa";
import { ReusableInput } from "../Order/CommonInput";
import { DropdownInput, DropdownWithSearch, TextInput } from "../../../Inputs";
import { FiEdit2, FiPrinter, FiSave } from "react-icons/fi";
import { HiOutlineRefresh } from "react-icons/hi";
import { useCallback, useEffect, useState } from "react";
import FormItems from "./FormItems";
import { useGetOrderByIdQuery, useGetOrderItemsByIdNewQuery, useGetOrderItemsByIdQuery } from "../../../redux/uniformService/OrderService";
import { findFromList, getCommonParams } from "../../../Utils/helper";
import { useGetPartyQuery } from "../../../redux/services/PartyMasterService";
import { useAddRequirementPlanningFormMutation, useDeleteRequirementPlanningFormMutation, useGetRequirementPlanningFormByIdQuery, useUpdateRequirementPlanningFormMutation } from "../../../redux/uniformService/RequirementPlanningFormServices";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import { Colors, packingCover } from "../../../Utils/DropdownData";
import { useGetSocksMaterialQuery } from "../../../redux/uniformService/SocksMaterialMasterService";
import { useGetStyleMasterQuery } from "../../../redux/uniformService/StyleMasterService";

const RequirmentForm = ({ id, setId, onClose, readOnly, setReadOnly, orderData, orderId, setOrderId, setChildrecord,

    orderSizeDetails, setOrderSizeDetails, orderYarnDetails, setOrderYarnDetails, styleId, setstyleId, dueDate, setDuedate,

    partyId, setPartyId, docId, active, setShowOrderForm, date, sampleDetails, requirementForm, setRequirementForm, jobNumber, setJobNumber
}) => {


        const [combo,setCombo]  =  useState([])
        const [allColors,setAllColors]   =  useState([])
    const { data: singleData, isLoading: isSingleLoading, isFetching: isSingleFetching } = useGetRequirementPlanningFormByIdQuery(id, { skip: !id });
    const [addData] = useAddRequirementPlanningFormMutation();
    const [updateData] = useUpdateRequirementPlanningFormMutation();




    const { data: singleOrderData, isLoading: isSingleOrderLoading, isFetching: isSingleOrderFetching } = useGetOrderByIdQuery(orderId, { skip: !orderId });
    const { data: orderItemsData, isLoading: orderItemsDataLoading, isFetching: orderItemsDataFetching } = useGetOrderItemsByIdQuery({ id: styleId }, { skip: !styleId });


    const { branchId, userId, companyId, finYearId } = getCommonParams()
    const params = { branchId, userId, finYearId };


    const { data: supplierList } = useGetPartyQuery({ params: { ...params } });
    const { data: styleData } = useGetStyleMasterQuery({ params: { ...params } });



    const syncFormWithDb = useCallback((data) => {
        if (orderId) {
            setOrderSizeDetails(data?.orderSizeDetails ? data?.orderSizeDetails : [])
            setOrderYarnDetails(data?.orderYarnDetails ? data?.orderYarnDetails : [])
        }
        if (id) {
            setOrderSizeDetails(data?.requirementSizeDetails ? data?.requirementSizeDetails : [])
            setOrderYarnDetails(data?.RequirementYarnDetails ? data?.RequirementYarnDetails : [])
            setChildrecord(data?.childRecord ? data?.childRecord : 0)
            setOrderId(data?.orderId ? data?.orderId : "")
            setJobNumber(data?.jobNumber ? data?.jobNumber : "")
            setPartyId(data?.partyId ? data?.partyId : "")

        }

    }, [styleId]);





    console.log(styleId, "styleId");



    useEffect(() => {
        if (styleId && orderItemsData?.data) {
            syncFormWithDb(orderItemsData.data, styleId);
        }

    }, [orderItemsDataFetching, orderItemsDataLoading, styleId, syncFormWithDb, orderItemsData]);


    const { data: socksMaterialData } =
        useGetSocksMaterialQuery({ params: { ...params } });

        if (orderId && singleOrderData?.data) {
            setPartyId(singleOrderData?.data?.partyId || "")
        }

useEffect(() => {
    if (singleOrderData?.data?.orderDetails) {
        // Flatten all orderYarnDetails arrays
        const combined = singleOrderData?.data?.orderDetails?.flatMap(
            item => item?.orderYarnDetails || []
        );

        setCombo(combined); // save flattened array

        // Extract all color names and combine into one string
        const colors = combined
            .map(yarn => yarn?.Color?.name)   // get color names
            .filter(Boolean)               // remove undefined/null
            .join("/");                   // combine into a string

        setAllColors(colors);

        console.log(colors, "All Colors Combined");
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
                        onClick={() => {
                            onClose()
                            setId("")
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
                                Basic Details
                            </h2>
                            <div className="grid grid-cols-2 gap-1">
                                <ReusableInput label="Doc.Id" readOnly value={docId} />
                                <ReusableInput label="Date" value={date} type={"date"} required={true} readOnly={true} disabled />

                            </div>
                        </div>







                        <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm col-span-1">

                            <h2 className="font-medium text-slate-700 mb-2">
                                Order Details
                            </h2>
                            <div className="grid grid-cols-2 gap-x-3">



                                <DropdownWithSearch
                                    options={orderData?.data}
                                    value={orderId}
                                    setValue={setOrderId}
                                    readOnly={id ? true : false}
                                    labelField={"docId"}
                                    label={"Order No"}
                                />


                                {id ?


                                    <>

                                        <TextInput
                                            name="Stytle Name"
                                            placeholder="Stytle Name"
                                            value={findFromList(singleData?.data?.orderDetailsId, styleData?.data, "name")}
                                            setValue={setJobNumber}

                                        />{console.log(singleData?.data?.orderDetailsId, styleData?.data, "ddd")}
                                    </>

                                    :

                                    <DropdownWithSearch
                                        options={singleOrderData?.data?.orderDetails?.map(o => ({
                                            ...o,
                                            displayLabel: `${o?.style?.name} - ${allColors}`
                                        }))}
                                        value={styleId}
                                        setValue={setstyleId}
                                        labelField={"displayLabel"}
                                        label={"Stytle Name"}
                                        readOnly={id ? true : false}

                                    />}
                                <TextInput
                                    name="Job Number"
                                    placeholder="Contact name"
                                    value={jobNumber}
                                    setValue={setJobNumber}

                                />
                                {/* <DropdownInput name="Leg Color" options={Colors} required={true} />
                                <DropdownInput name="Foot Color" options={Colors} required={true} />
                                <DropdownInput name="Stripes Color" options={Colors} required={true} />
                                <DropdownWithSearch label={"socksType"} labelField={"name"} options={socksMaterialData?.data} type={"date"} required={true} />
                                <DropdownInput name="Packing Cover" options={packingCover} required={true} /> */}

                            </div>

                        </div>

                        <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm col-span-1 ">
                            <h2 className="font-medium text-slate-700 mb-2">
                                Contact Details
                            </h2>
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

                        <FormItems sampleDetails={sampleDetails} orderSizeDetails={orderSizeDetails} orderYarnDetails={orderYarnDetails} setOrderYarnDetails={setOrderYarnDetails}
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
    )
}

export default RequirmentForm;




