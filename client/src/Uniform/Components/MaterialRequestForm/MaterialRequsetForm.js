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
import { useAddRequirementPlanningFormMutation, useDeleteRequirementPlanningFormMutation, useGetRequirementPlanningFormByIdQuery, useGetRequirementPlanningFormQuery, useUpdateRequirementPlanningFormMutation } from "../../../redux/uniformService/RequirementPlanningFormServices";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import { Colors, packingCover } from "../../../Utils/DropdownData";
import { useGetSocksMaterialQuery } from "../../../redux/uniformService/SocksMaterialMasterService";
import { useAddRaiseIndentMutation, useDeleteRaiseIndentMutation, useGetRaiseIndentByIdQuery, useUpdateRaiseIndentMutation } from "../../../redux/uniformService/RaiseIndenetServices";
import { useDispatch } from "react-redux";
import { Loader } from "../../../Basic/components";

const IndentRaiseForm = ({ id, setId, setDocId, onClose, readOnly, setReadOnly, orderData, orderId, setOrderId, orderAllDataRefetch,

    orderSizeDetails, setOrderSizeDetails, orderYarnDetails, setOrderYarnDetails, orderDetailsId, setOrderDetailsId, dueDate, setDuedate,

    partyId, setPartyId, docId, active, setShowOrderForm, date, sampleDetails, raiseIndentItems, setRaiseIndentItems, requirementId, setRequirementId,

    isMaterialRequset, setIsMaterialRequset, supplierList, setSubGridForm, subGridForm ,onNew



}) => {


    const { branchId, userId, companyId, finYearId } = getCommonParams()


    const { data: singleData, isLoading: isSingleLoading, isFetching: isSingleFetching } = useGetRaiseIndentByIdQuery(id, { skip: !id });
    const [addData] = useAddRaiseIndentMutation();
    const [updateData] = useUpdateRaiseIndentMutation();


    // const { data: requirementData, refetch } = useGetRequirementPlanningFormQuery({ params: { branchId, userId } });

    // const { data: singleOrderData, isLoading: isSingleOrderLoading, isFetching: isSingleOrderFetching } = useGetOrderByIdQuery(orderId, { skip: !orderId });

    const { data: singleOrderData, isLoading: isSingleOrderLoading, isFetching: isSingleOrderFetching } = useGetOrderItemsByIdNewQuery({ id: orderId, stockValidation: false }, { skip: !orderId });













    const syncFormWithDb = useCallback((data) => {



        if (id) {

            // setRaiseIndentItems(
            //     data?.RaiseIndentItems?.map(item => {
            //         const allColors = item?.RaiseIndenetYarnItems
            //             ?.map(yarn => yarn?.Color?.name)
            //             .filter(Boolean)
            //             .join(" - ");


            //         const raiseIndenetYarnItems = item?.RaiseIndenetYarnItems?.map(yarn => {
            //             return {
            //                 ...yarn,

            //             };
            //         });


            //         const totalYarnQty = raiseIndenetYarnItems?.reduce(
            //             (sum, yarn) => sum + yarn.qty,
            //             0
            //         );
            //         return {
            //             OrderDetails: {
            //                 style: {
            //                     name: `${item?.OrderDetails?.style?.name} / ${allColors}`
            //                 }
            //             },
            //             requirementPlanningFormId: item.id,
            //             orderdetailsId: item.orderDetailsId,
            //             raiseIndenetYarnItems,
            //             totalYarnQty: Number(totalYarnQty?.toFixed(3)),
            //         };
            //     })
            // );
            setRaiseIndentItems(data?.RaiseIndentItems ? data?.RaiseIndentItems : [])
            setDocId(data?.docId ? data?.docId : "")
            setOrderDetailsId(data?.orderDetailsId ? data?.orderDetailsId : "")
            setRequirementId(data?.requirementId ? data?.requirementId : "")
            setIsMaterialRequset(data?.isMaterialRequset ? data?.isMaterialRequset : false)
            setPartyId(data?.partyId ? data?.partyId : "")

        }
        else {

            setPartyId(data?.partyId ? data?.partyId : "")



            // setRaiseIndentItems(
            //     data?.RequirementPlanningForm?.map(item => {
            //         const allColors = item?.RequirementYarnDetails
            //             ?.map(yarn => yarn?.Color?.name)
            //             .filter(Boolean)
            //             .join(" - ");
            // const RaiseIndenetYarnItems = item?.RequirementYarnDetails?.map(yarn => {
            //     const qty = item?.requirementSizeDetails?.reduce(
            //         (sum, size) => sum + (size?.weight * (yarn?.percentage / 100)),
            //         0
            //     );

            //     return {
            //         ...yarn,
            //         qty: Number(qty.toFixed(3)),
            //         orderDetailsId: item.orderDetailsId,

            //     };
            // });
            //         const totalYarnQty = RaiseIndenetYarnItems?.reduce(
            //             (sum, yarn) => sum + yarn.qty,
            //             0
            //         );
            //         return {
            //             OrderDetails: {
            //                 style: {
            //                     name: `${item?.OrderDetails?.style?.name} / ${allColors}`
            //                 }
            //             },
            //             requirementPlanningFormId: item.id,
            //             RaiseIndenetYarnItems,
            //             totalYarnQty: Number(totalYarnQty?.toFixed(3)),
            //         };
            //     })
            // );
            setRaiseIndentItems(
                data?.RequirementPlanningForm?.flatMap(item => {
                    const allColors = item?.OrderDetails?.orderYarnDetails
                        ?.map(yarn => yarn?.Color?.name)
                        .filter(Boolean)
                        .join(" - ");

                

                    return item?.RequirementPlanningItems?.filter(i => i.isMaterialRequst != true)?.map(i => ({
                        ...i,
                        styleColor: `${item?.OrderDetails?.style?.name} / ${allColors}`,
                        requirementPlanningItemsId: i.id,
                    })) || [];
                })
            );

        }

    }, [orderId, id]);






    useEffect(() => {
        if (!id) return

        if (singleData?.data) {
            syncFormWithDb(singleData.data);
        }

    }, [isSingleLoading, isSingleFetching, id, syncFormWithDb, singleData]);





    useEffect(() => {

        if (id) return
        if (singleOrderData?.data) {
            syncFormWithDb(singleOrderData?.data)
        }

    }, [isSingleOrderFetching, isSingleOrderLoading, orderId, syncFormWithDb, singleOrderData]);








    let data = {

        branchId, userId, companyId, docId,
        active,
        partyId, finYearId, orderYarnDetails, orderSizeDetails, orderId, orderDetailsId, raiseIndentItems, isMaterialRequset, requirementId
    }



    const handleSubmitCustom = async (callback, data, text, nextProcess) => {
        try {

            let returnData;
            if (text === "Updated") {
                returnData = await callback({ id, body: data }).unwrap();
            } else {
                returnData = await callback(data).unwrap();
            }
            if (returnData.statusCode === 0) {
                Swal.fire({
                    title: text + "  " + "Successfully",
                    icon: "success",

                });
                if (nextProcess == "new") {
                    syncFormWithDb(undefined);
                    onNew()
                }
                else {
                    onClose()
                }

                // setId(returnData?.data?.id);
                setShowOrderForm(false)
                // refetch()



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

    if (isSingleLoading || isSingleFetching || isSingleOrderLoading || isSingleOrderFetching) return <Loader />


    return (
        <>
            <div className="w-full bg-[#f1f1f0] mx-auto rounded-md shadow-md px-2 py-1 overflow-y-auto">
                <div className="flex justify-between items-center mb-1">
                    <h1 className="text-xl font-bold text-gray-800">Material Request </h1>
                    <button
                        onClick={() => {
                            onClose()
                            setOrderId("")
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
                                {/* <ReusableInput label="Delivery Date" value={dueDate}  setValue={setDuedate} type={"date"} required={true} readOnly={readOnly}  /> */}
                                {/* <TextInput
                                    name="Job Number"
                                    placeholder="Contact name"
                                /> */}

                            </div>
                        </div>







                        <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm col-span-1">
                            <h2 className="font-medium text-slate-700 mb-2">
                                Order Details
                            </h2>
                            <div className="grid grid-cols-2 gap-x-3">


                                {id ?
                                    <TextInput

                                        name={"Order No"}
                                        value={findFromList(singleData?.data?.orderId, orderData?.data, "docId")}
                                    />
                                    :

                                    <DropdownWithSearch
                                        options={orderData?.data?.filter(i => i.isPlanning)}
                                        value={orderId}
                                        setValue={setOrderId}
                                        disabled={readOnly}
                                        labelField={"docId"}
                                        label={"Order No"}
                                    // ref
                                    />

                                }



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
                            setRaiseIndentItems={setRaiseIndentItems} raiseIndentItems={raiseIndentItems} readOnly={readOnly} setReadOnly={setReadOnly} id={id} isMaterialRequset={isMaterialRequset} setIsMaterialRequset={setIsMaterialRequset}
                            setRequirementId={setRequirementId} requirementId={requirementId} setSubGridForm={setSubGridForm} subGridForm={subGridForm}
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

export default IndentRaiseForm;




