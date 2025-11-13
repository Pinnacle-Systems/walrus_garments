import { FaFileAlt, FaWhatsapp } from "react-icons/fa";
import { ReusableInput } from "../Order/CommonInput";
import { DropdownInput, DropdownWithSearch, TextInput } from "../../../Inputs";
import { FiEdit2, FiPrinter, FiSave } from "react-icons/fi";
import { HiOutlineRefresh } from "react-icons/hi";
import { useCallback, useEffect, useState } from "react";
import FormItems from "./FormItems";
import { useGetOrderByIdQuery, useGetOrderItemsByIdNewQuery, useGetStockValidationByIdQuery } from "../../../redux/uniformService/OrderService";
import { findFromList, getCommonParams } from "../../../Utils/helper";
import { useGetPartyQuery } from "../../../redux/services/PartyMasterService";
import { useAddRequirementPlanningFormMutation, useDeleteRequirementPlanningFormMutation, useGetRequirementPlanningFormByIdQuery, useGetRequirementPlanningFormQuery, useUpdateRequirementPlanningFormMutation } from "../../../redux/uniformService/RequirementPlanningFormServices";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import { Colors, packingCover } from "../../../Utils/DropdownData";
import { useGetSocksMaterialQuery } from "../../../redux/uniformService/SocksMaterialMasterService";
import { useGetRaiseIndentByIdQuery, useGetRaiseIndentQuery, useGetRaiseIndentStockValidationByIdQuery } from "../../../redux/uniformService/RaiseIndenetServices";
import { useAddMaterialIssueMutation, useDeleteMaterialIssueMutation, useUpdateMaterialIssueMutation } from "../../../redux/uniformService/MaterialIssueServices";
import { Loader } from "../../../Basic/components";

const MaterialIssueForm = ({ id, setId, onClose, readOnly, setReadOnly, orderData, orderId, setOrderId,

    orderSizeDetails, orderYarnDetails, orderDetailsId, setOrderDetailsId,

    partyId, setPartyId, docId, active, setShowOrderForm, date, requirementId, setRequirementId, issueItems, setIssueItems,

    isMaterialIssue, setIsMaterialIssue, materialRequstId, setMaterialRequstId



}) => {


    const { branchId, userId, companyId, finYearId } = getCommonParams()

    const params = { branchId, userId, finYearId };




    const { data: singleOrderData, isLoading: isSingleOrderLoading, isFetching: isSingleOrderFetching } = useGetOrderItemsByIdNewQuery({ id: orderId, stockValidation: false }, { skip: !orderId });





    const { data: materialRequstData, isLoading: isSingleMaterialRequstLoading, isFetching: isSingleMaterialRequstFetching } = useGetRaiseIndentStockValidationByIdQuery(materialRequstId, { skip: !materialRequstId });

    const [addData] = useAddMaterialIssueMutation();
    const [updateData] = useUpdateMaterialIssueMutation();


    const { data: supplierList } =
        useGetPartyQuery({ params: { ...params } });


    const syncFormWithDb = useCallback((data) => {


        if (id) {
            setIssueItems(data?.RaiseIndentItems ? data?.RaiseIndentItems : [])
            setOrderId(data?.orderId ? data?.orderId : "")
            setOrderDetailsId(data?.orderDetailsId ? data?.orderDetailsId : "")
            setMaterialRequstId(data?.id ? data?.id : "")
            setPartyId(data?.partyId ? data?.partyId : "")

        }
        else {
            setIssueItems(
                data?.RaiseIndentItems?.map(item => {
                    const allColors = item?.RaiseIndenetYarnItems
                        ?.map(yarn => yarn?.Color?.name)
                        .filter(Boolean)
                        .join(" - ");
                    const RaiseIndenetYarnItems = item?.RaiseIndenetYarnItems?.map(yarn => {


                        return {
                            ...yarn,

                        };
                    });
                    const totalYarnQty = RaiseIndenetYarnItems?.reduce(
                        (sum, yarn) => sum + yarn.qty,
                        0
                    );
                    return {
                        OrderDetails: {
                            style: {
                                name: `${item?.OrderDetails?.style?.name} / ${allColors}`
                            }
                        },
                        requirementPlanningFormId: item.requirementPlanningFormId,
                        orderdetailsId: item.orderdetailsId,
                        RaiseIndenetYarnItems,
                        totalYarnQty: Number(totalYarnQty?.toFixed(3)),
                    };
                })
            );
            setOrderId(data?.orderId ? data?.orderId : "")
            setOrderDetailsId(data?.orderDetailsId ? data?.orderDetailsId : "")
            setMaterialRequstId(data?.id ? data?.id : "")
            setPartyId(data?.partyId ? data?.partyId : "")

        }

    }, [orderDetailsId]);



    // useEffect(() => {
    //     if (orderDetailsId && orderItemsData?.data) {
    //         syncFormWithDb(orderItemsData.data, orderDetailsId);
    //     }

    // }, [orderItemsDataFetching, orderItemsDataLoading, orderDetailsId, syncFormWithDb, orderItemsData]);



    useEffect(() => {

        if (materialRequstData?.data) {
            syncFormWithDb(materialRequstData?.data)
        }

    }, [isSingleMaterialRequstLoading, isSingleMaterialRequstFetching, materialRequstId, materialRequstData]);




    useEffect(() => {
        const processYarnData = async () => {
            if (!singleOrderData?.data?.RaiseIndent?.[0]?.RaiseIndentItems) return;

                setPartyId(singleOrderData?.data?.partyId)

            const allYarns = singleOrderData?.data?.RaiseIndent[0]?.RaiseIndentItems?.flatMap(
                (item) => item?.RaiseIndenetYarnItems || []
            );


            console.log(allYarns, "allYarns");

            const Yarn = Object.values(
                allYarns.reduce((acc, item) => {
                    const key = `${item.yarnId}-${item.colorId}`;

                    if (!acc[key]) {
                        acc[key] = { ...item };
                    } else {
                        acc[key].qty += item.qty;
                    }
                    return acc;
                }, {})
            );

            const Stock = Object.values(
                singleOrderData?.data?.Stock?.reduce((acc, item) => {
                    const key = `${item.yarnId}-${item.colorId}`;

                    if (!acc[key]) {
                        acc[key] = { ...item };
                    } else {
                        acc[key].qty += item.qty;
                    }
                    return acc;
                }, {})
            );


            const fianl = Yarn?.map(req => {
                const stock = Stock?.find(
                    s => s.yarnId === req.yarnId && s.colorId === req.colorId
                );

                const availableQty = stock ? stock?.qty : 0;

                return {
                    ...req,
                    availableQty,
                    // balance: availableQty - req.qty, // +ve = extra, -ve = shortage
                };
            });

            console.log(Stock, "Stock");
            setIssueItems(fianl);
        };

        processYarnData();
    }, [isSingleOrderLoading, isSingleOrderFetching, materialRequstId, singleOrderData]);



    let data = {

        branchId, userId, companyId, docId,
        active,
        partyId, finYearId, orderYarnDetails, orderSizeDetails, orderId, orderDetailsId, isMaterialIssue, issueItems, indentRaiseId: materialRequstId
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


    if (isSingleMaterialRequstLoading || isSingleMaterialRequstFetching) return <Loader />

    return (
        <>
            <div className="w-full bg-[#f1f1f0] mx-auto rounded-md shadow-md px-2 py-1 overflow-y-auto">
                <div className="flex justify-between items-center mb-1">
                    <h1 className="text-xl font-bold text-gray-800">Material Issue Form</h1>
                    <button
                        onClick={() => {
                            onClose();
                            setMaterialRequstId("")
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

                                <TextInput
                                    name="Order No"
                                    placeholder="Order No"
                                    value={findFromList(orderId, orderData?.data, "docId")}
                                    disabled={true}

                                />
                                {/* <TextInput
                                    name="Style No"
                                    placeholder="Style No"
                                    // value={orderDetailsId}
                                    // value={findFromList(orderDetailsId, indentRaiseData.data, "docId")}

                                    disabled={true}

                                />  <TextInput
                                    name="Raise Indent No"
                                    placeholder="Raise Indent No"
                                    // value={inendentRaiseId}
                                    value={findFromList(setIndentRaiseId, indentRaiseData?.data, "docId")}

                                    disabled={true}

                                /> */}

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

                                />



                            </div>
                        </div>
                    </div>


                    <fieldset className=''>

                        <FormItems
                            setIssueItems={setIssueItems} issueItems={issueItems} readOnly={readOnly} setReadOnly={setReadOnly} id={id} isMaterialIssue={isMaterialIssue} setIsMaterialIssue={setIsMaterialIssue}
                            requirementId={requirementId} setRequirementId={setRequirementId}
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

export default MaterialIssueForm;




