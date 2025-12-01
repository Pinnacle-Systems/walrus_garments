import { FaFileAlt, FaWhatsapp } from "react-icons/fa";
import { ReusableInput } from "../Order/CommonInput";
import { DropdownInput, DropdownWithSearch, MultiSelectDropdown, MultiSelectDropdownNew, TextInput } from "../../../Inputs";
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
import { Colors, packingCover, RequestMaterialType } from "../../../Utils/DropdownData";
import { useGetSocksMaterialQuery } from "../../../redux/uniformService/SocksMaterialMasterService";
import { useGetRaiseIndentByIdQuery, useGetRaiseIndentQuery, useGetRaiseIndentStockValidationByIdQuery } from "../../../redux/uniformService/RaiseIndenetServices";
import { useAddMaterialIssueMutation, useDeleteMaterialIssueMutation, useGetMaterialIssueByIdQuery, useGetMaterialIssueStockValidationByIdQuery, useUpdateMaterialIssueMutation } from "../../../redux/uniformService/MaterialIssueServices";
import { Loader } from "../../../Basic/components";
import { multiSelectOption } from "../../../Utils/contructObject";

const MaterialIssueForm = ({ id, setId, onClose, readOnly, setReadOnly, orderData, orderId, setOrderId, onNew,

    orderSizeDetails, orderYarnDetails, orderDetailsId, setOrderDetailsId,

    partyId, setPartyId, docId, active, setShowOrderForm, date, requirementId, setRequirementId, issueItems, setIssueItems,

    isMaterialIssue, setIsMaterialIssue, materialRequstId, setMaterialRequstId, alreadyIssuedItems, setAlreadyIssuedItems,

    Stock, setStock, setMaterialIssueTypeList, materialIssueTypeList,
    accessoryIssueItems, setAccessoryIssueItems, AccessoryStock, setAccessoryStock, isReport, setIsReport,



}) => {


    const { branchId, userId, companyId, finYearId } = getCommonParams()

    const params = { branchId, userId, finYearId };




    // const { data: singleOrderData, isLoading: isSingleOrderLoading, isFetching: isSingleOrderFetching } = useGetOrderItemsByIdNewQuery({ id: orderId, stockValidation: false }, { skip: !orderId });





    const { data: materialRequstData, isLoading: isSingleMaterialRequstLoading, isFetching: isSingleMaterialRequstFetching } = useGetRaiseIndentStockValidationByIdQuery(materialRequstId, { skip: !materialRequstId });


    const { data: singleData, isLoading: isSingleDataLoading, isFetching: isSingleDataFetching } = useGetMaterialIssueByIdQuery(id, { skip: !id });




    const [addData] = useAddMaterialIssueMutation();
    const [updateData] = useUpdateMaterialIssueMutation();


    const { data: supplierList } = useGetPartyQuery({ params: { ...params } });




    console.log(Stock, "Stock")

    const syncFormWithDb = useCallback((data) => {


        if (id) {
            setIssueItems(data?.MaterialIssueItems ? data?.MaterialIssueItems : [])
            const Stock = Object.values(
                (data?.Order?.Stock || []).reduce((acc, item) => {
                    const key = `${item.yarnId}-${item.colorId}`;

                    if (!acc[key]) {
                        acc[key] = { ...item };
                    } else {
                        acc[key].qty += item.qty;
                    }
                    return acc;
                }, {})
            );
            setStock(Stock);
            setIsReport(data?.MaterialIssueTypeList ? data?.MaterialIssueTypeList[0]?.value : "")

            setMaterialIssueTypeList(
                data?.MaterialIssueTypeList
                    ? data?.MaterialIssueTypeList?.map((item) => {
                        return {
                            value: item.value,
                            label: item.value,
                            id: item.id
                        };
                    })
                    : []
            );
                const AccessoryStock = Object.values(
                (data?.Order?.AccessoryStock || []).reduce((acc, item) => {
                    const key = `${item.accessoryId}-${item.colorId}-${item.uomId}`;

                    if (!acc[key]) {
                        acc[key] = { ...item };
                    } else {
                        acc[key].qty += item.qty;
                    }
                    return acc;
                }, {})
            );
            setAccessoryStock(AccessoryStock)
            setAccessoryIssueItems(data?.AccessoryMaterialIssueItems ?  data?.AccessoryMaterialIssueItems : [])
            setOrderId(data?.orderId ? data?.orderId : "")
            setOrderDetailsId(data?.orderDetailsId ? data?.orderDetailsId : "")
            setPartyId(data?.partyId ? data?.partyId : "")

        }
        else {

            setIsReport(data?.MaterialTypeList ? data?.MaterialTypeList[0]?.value : "")

            const mergedItems =
                data?.RaiseIndentItems?.map(riItem => {
                    // get all materialIssueItems that match yarn, color & planningItemId
                    const matches = data?.materialIssueItems?.filter(miItem =>
                        miItem.yarnId == riItem.yarnId &&
                        miItem.colorId == riItem.colorId &&
                        miItem.requirementPlanningItemsId == riItem.requirementPlanningItemsId   // or requirementPlanningItemsId
                    ) || [];
                    console.log(matches, "matches")


                    const totalIssueQty = matches?.reduce(
                        (sum, item) => sum + (Number(item.issueQty) || 0),
                        0
                    );

                    return {
                        ...riItem,
                        alreadyIssueQty: totalIssueQty,
                    };
                }) || [];

            setIssueItems(mergedItems);
            const Stock = Object.values(
                (data?.Order?.Stock || []).reduce((acc, item) => {
                    const key = `${item.yarnId}-${item.colorId}`;

                    if (!acc[key]) {
                        acc[key] = { ...item };
                    } else {
                        acc[key].qty += item.qty;
                    }
                    return acc;
                }, {})
            );
            setStock(Stock);



            const accessoryMergedItems =
                data?.AccessoryRaiseIndentItems?.map(riItem => {
                    // get all materialIssueItems that match yarn, color & planningItemId
                    const matches = data?.AccessoryMaterialIssueItems?.filter(miItem =>
                        miItem.accessoryId == riItem.accessoryId &&
                        miItem.accessoryGroupId == riItem.accessoryGroupId &&
                        miItem.requirementPlanningItemsId == riItem.requirementPlanningItemsId
                    ) || [];
                    console.log(matches, "matches")


                    const totalIssueQty = matches?.reduce(
                        (sum, item) => sum + (Number(item.issueQty) || 0),
                        0
                    );

                    return {
                        ...riItem,
                        alreadyIssueQty: totalIssueQty,
                    };
                }) || [];

            setAccessoryIssueItems(accessoryMergedItems)


            const accessoryStock = Object.values(
                (data?.Order?.AccessoryStock || []).reduce((acc, item) => {
                    const key = `${item.yarnId}-${item.colorId}`;

                    if (!acc[key]) {
                        acc[key] = { ...item };
                    } else {
                        acc[key].qty += item.qty;
                    }
                    return acc;
                }, {})
            );
            setAccessoryStock(accessoryStock)

            setAlreadyIssuedItems(data?.materialIssueItems ? data?.materialIssueItems : [])
            setOrderId(data?.orderId ? data?.orderId : "")
            setOrderDetailsId(data?.orderDetailsId ? data?.orderDetailsId : "")
            setMaterialRequstId(data?.id ? data?.id : "")
            setPartyId(data?.partyId ? data?.partyId : "")
            setMaterialIssueTypeList(
                data?.MaterialTypeList
                    ? data?.MaterialTypeList?.map((item) => {
                        return {
                            value: item.value,
                            label: item.value,
                        };
                    })
                    : []
            );

        }

    }, [orderDetailsId]);




    console.log(accessoryIssueItems, "accessoryIssueItems");
    console.log(AccessoryStock, "AccessoryStock");
    console.log(materialIssueTypeList, 'materialIssueTypeList')






    useEffect(() => {

        if (materialRequstData?.data) {
            syncFormWithDb(materialRequstData?.data)
        }

    }, [isSingleMaterialRequstLoading, isSingleMaterialRequstFetching, materialRequstId, materialRequstData]);


    useEffect(() => {

        if (singleData?.data) {
            syncFormWithDb(singleData?.data)
        }

    }, [isSingleDataFetching, isSingleDataLoading, id, singleData]);

    // useEffect(() => {
    //     const processYarnData = async () => {
    //         if (!singleOrderData?.data?.RaiseIndent?.[0]?.RaiseIndentItems) return;

    //         setPartyId(singleOrderData?.data?.partyId)

    //         const allYarns = singleOrderData?.data?.RaiseIndent[0]?.RaiseIndentItems?.flatMap(
    //             (item) => item?.RaiseIndenetYarnItems || []
    //         );



    //         console.log(allYarns, "allYarns");

    //         const Yarn = Object.values(
    //             allYarns?.reduce((acc, item) => {
    //                 const key = `${item.yarnId}-${item.colorId}`;

    //                 if (!acc[key]) {
    //                     acc[key] = { ...item };
    //                 } else {
    //                     acc[key].qty += item.qty;
    //                 }
    //                 return acc;
    //             }, {})
    //         );




    //         const MaterialIssue = Object.values(
    //            (singleOrderData?.data?.MaterialIssueItems || [])?.reduce((acc, item) => {
    //                 const key = `${item.yarnId}-${item.colorId}`;

    //                 if (!acc[key]) {
    //                     acc[key] = { ...item };
    //                 } else {
    //                     acc[key].qty += item.issueQty;
    //                 }
    //                 return acc;
    //             }, {})
    //         );


    //         const fianl = allYarns?.map(req => {

    //             const stock = Stock?.find(
    //                 s => s.yarnId == req.yarnId && s.colorId == req.colorId
    //             );

    //             const Issued = MaterialIssue?.find(
    //                 i => i.yarnId == req.yarnId && i.colorId == req.colorId
    //             )


    //             const availableQty = stock ? stock?.qty : 0;
    //             const alreadyIssueQty = Issued ? Issued?.issueQty : 0;

    //             return {

    //                 ...req,
    //                 availableQty,
    //                 alreadyIssueQty,
    //                 // balance: availableQty - req.qty, // +ve = extra, -ve = shortage
    //             };
    //         });

    //         console.log(MaterialIssue, "MaterialIssue")
    //         setIssueItems(fianl);
    //     };

    //     processYarnData();
    // }, [isSingleOrderLoading, isSingleOrderFetching, materialRequstId, singleOrderData]);



    let data = {

        branchId, userId, companyId, docId,
        active,
        partyId, finYearId, orderYarnDetails, orderSizeDetails, orderId, orderDetailsId, isMaterialIssue, indentRaiseId: materialRequstId,
        issueItems: issueItems?.filter(i => i.issueQty), materialRequstId, materialIssueTypeList,
        accessoryIssueItems: accessoryIssueItems?.filter(i => i.issueQty)
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
                    <h1 className="text-xl font-bold text-gray-800">Material Issue</h1>
                    <button
                        onClick={() => {
                            onClose();
                            setMaterialRequstId("")
                            onNew()
                        }}
                        className="text-indigo-600 hover:text-indigo-700"
                        title="Open Report"
                    >
                        <FaFileAlt className="w-5 h-5" />
                    </button>
                </div>

                <div className="space-y-3 h-full ">
                    <div className="grid grid-cols-1 md:grid-cols-10 gap-2">


                        <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm col-span-2">
                            <h2 className="font-medium text-slate-700 mb-2">
                                Basic Details
                            </h2>
                            <div className="grid grid-cols-2 gap-1">
                                <ReusableInput label="Material Issue Id" readOnly value={docId} />
                                <ReusableInput label="Date" value={date} type={"date"} required={true} readOnly={true} disabled />


                            </div>
                        </div>







                        <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm col-span-4">
                            <h2 className="font-medium text-slate-700 mb-2">
                                Order Details
                            </h2>
                            <div className="grid grid-cols-3 gap-x-3">
                                <div className="col-span-1">
                                    <TextInput
                                        name="Order No"
                                        placeholder="Order No"
                                        value={findFromList(orderId, orderData?.data, "docId")}
                                        disabled={true}

                                    />
                                </div>

                                {/* <MultiSelectDropdown
                                    name="Issue Material Type"
                                    required={true}
                                    disabled={!orderId}
                                    options={multiSelectOption(RequestMaterialType ? RequestMaterialType : [], "show", "value")}
                                    selected={materialTypeList}
                                    setSelected={(value) => {
                                        setMaterialTypeList(value)
                                        // setIsReport(value[0]?.value)
                                        // setRequestItems(value)

                                    }}
                                /> */}
                                <div className="col-span-2">
                                    <MultiSelectDropdownNew
                                        name="Issue Material Type"
                                        required={true}
                                        disabled={readOnly || id ? !singleData?.data?.orderId : !orderId}
                                        options={ id  ?   materialIssueTypeList : multiSelectOption(RequestMaterialType ? RequestMaterialType : [], "show", "value")}
                                        selected={materialIssueTypeList}
                                        setSelected={(value) => {
                                            setMaterialIssueTypeList(value)
                                            // setIsReport(value[0]?.value)
                                            // setRequestItems(value)

                                        }}
                                    />
                                </div>

                            </div>

                        </div>

                        <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm col-span-4 ">
                            <h2 className="font-medium text-slate-700 mb-2">
                                Contact Details
                            </h2>
                            <div className="grid grid-cols-1 gap-x-3">
                                <TextInput
                                    name="Customer"
                                    placeholder="Contact name"
                                    value={findFromList(partyId, supplierList?.data, "name")}
                                    // setValue={setContactPersonName}
                                    disabled={true}
                                />
                                {/* <TextInput
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

                                /> */}



                            </div>
                        </div>

                    </div>


                    <fieldset className='h-[55vh] overflow-y-auto'>

                        <FormItems
                            setIssueItems={setIssueItems} issueItems={issueItems} readOnly={readOnly} setReadOnly={setReadOnly} id={id} isMaterialIssue={isMaterialIssue} setIsMaterialIssue={setIsMaterialIssue}
                            requirementId={requirementId} setRequirementId={setRequirementId} Stock={Stock} setStock={setStock} materialTypeList={materialIssueTypeList} isReport={isReport} setIsReport={setIsReport} AccessoryStock={AccessoryStock}
                            accessoryIssueItems={accessoryIssueItems} setAccessoryIssueItems={setAccessoryIssueItems} setAccessoryStock={setAccessoryStock}
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




