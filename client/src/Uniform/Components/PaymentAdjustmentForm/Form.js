import { IoArrowBackCircleSharp } from "react-icons/io5";
import { ModeChip, getCommonParams } from "../../../Utils/helper";
import { useState, useEffect, useCallback } from "react";
import { ReusableInput } from "../Order/CommonInput";
import { DropdownInput, TextAreaNew, TextInputNew } from "../../../Inputs";
import { adjTypeData, paymentModes } from "../../../Utils/DropdownData";
import {
    useAddPaymentAdjustmentMutation,
    useUpdatePaymentAdjustmentMutation,
    useGetPaymentAdjustmentQuery,
    useGetPaymentAdjustmentByIdQuery
} from "../../../redux/services/PaymentAdjustmentService";
import Swal from "sweetalert2";
import { FiSave, FiEdit2 } from "react-icons/fi";
import { HiOutlineRefresh } from "react-icons/hi";
import moment from "moment";

const PaymentAdjustmentFormContent = ({
    id, setId, onClose, readOnly, hasPermission,
    setReadOnly, docId, setDocId, date, setDate, adjustmentType,
    setAdjustmentType, referenceNumber, setReferenceNumber, adjustmentAmount,
    setAdjustmentAmount, paymentMode, setPaymentMode, reason, setReason
}) => {


    const { branchId, companyId, finYearId, userId } = getCommonParams();



    const { data: singleData, isFetching: isSingleFetching, isLoading: isSingleLoading } = useGetPaymentAdjustmentByIdQuery(id, { skip: !id });

    const [addData] = useAddPaymentAdjustmentMutation();
    const [updateData] = useUpdatePaymentAdjustmentMutation();


    const syncFormWithDb = useCallback((data) => {
        const today = new Date();

        setDate(data?.date ? moment.utc(data.date).format("YYYY-MM-DD") : moment.utc(today).format("YYYY-MM-DD"));
        setDocId(data?.docId ? data?.docId : "New");
        setAdjustmentType(data?.adjustmentType ? data?.adjustmentType : "");
        setReferenceNumber(data?.referenceNumber ? data?.referenceNumber : "");
        setAdjustmentAmount(data?.adjustmentAmount ? data?.adjustmentAmount : "");
        setPaymentMode(data?.paymentMode ? data?.paymentMode : "");
        setReason(data?.reason ? data?.reason : "");
    }, [id]);

    useEffect(() => {
        if (id) syncFormWithDb(singleData?.data);
        else syncFormWithDb(undefined);
    }, [isSingleFetching, isSingleLoading, id, syncFormWithDb, singleData]);


    const validateData = (d) =>
        !!(d?.adjustmentType && d?.adjustmentAmount && d?.paymentMode && d?.reason);

    const handleSubmitCustom = async (callback, payload, text, nextProcess) => {
        try {
            const returnData = await callback(payload).unwrap();
            if (returnData.statusCode === 1) {
                Swal.fire({ icon: "error", title: returnData?.message, });
            } else {
                Swal.fire({ icon: "success", title: `${text || "Saved"} Successfully`, });
                if (returnData.statusCode === 0) {
                    if (nextProcess === "new") {
                        syncFormWithDb(undefined)
                        onNew();
                    } else {
                        syncFormWithDb(undefined)

                        onClose()
                    }

                } else {
                    // toast.error(returnData?.message);
                    Swal.fire({ icon: "error", title: returnData?.message, });
                }
            }
        } catch (error) {
            console.log("handle", error);
        }
    };


    const data = {
        branchId, finYearId, companyId, userId,
        adjustmentType,
        referenceNumber,
        adjustmentAmount,
        paymentMode,
        reason,
        date,
        docId,
    }


    const saveData = (nextProcess) => {


        if (!validateData(data)) {
            Swal.fire({ title: "Please fill all required fields...!", icon: "warning" });
            return;
        }


        if (!window.confirm("Are you sure save the details ...?")) return;

        if (nextProcess === "draft" && !id)
            handleSubmitCustom(addData, { ...data, draftSave: true }, "Added", nextProcess);
        else if (id && nextProcess === "draft")
            handleSubmitCustom(updateData, { ...data, draftSave: true }, "Updated", nextProcess);
        else if (id)
            handleSubmitCustom(updateData, data, "Updated", nextProcess);
        else
            handleSubmitCustom(addData, data, "Added", nextProcess);
    };

    return (
        <div className="flex flex-col h-full bg-[#f1f1f0] overflow-hidden">
            <div className="flex-none w-full bg-white mx-auto rounded-md shadow-sm px-2  border-b border-gray-200 mb-1">
                <div className="flex justify-between items-center py-1">
                    <h1 className="text-md font-bold text-gray-800">Payment Adjustment</h1>
                    <div className="flex flex-row gap-2">
                        <ModeChip id={id} readOnly={readOnly} />
                        <button
                            onClick={onClose}
                            className=" text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
                            title="Back"
                        >
                            <IoArrowBackCircleSharp className="w-7 h-7" />
                        </button>
                    </div>

                </div>
            </div>
            <div className="flex-grow flex flex-col min-h-0 space-y-3 overflow-hidden p-2">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 flex-none">
                    <div className="border border-slate-200 p-4 bg-white rounded-md shadow-sm col-span-4">
                        <h2 className="font-bold text-slate-700 mb-4 border-b pb-2">
                            Basic Details
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <ReusableInput label="Adjustment No" readOnly value={docId} />
                            <ReusableInput
                                label="Adjustment Date"
                                value={date}
                                setValue={setDate}
                                type={"date"}
                                required={true}
                                onChange={(e) => setDate(e.target.value)}
                                readOnly={readOnly}
                            />
                            <TextInputNew
                                name="Reference Number"
                                value={referenceNumber}
                                setValue={setReferenceNumber}
                                type={"text"}
                                readOnly={readOnly}
                            />
                            <DropdownInput
                                name="Adjustment Type"
                                options={adjTypeData}
                                value={adjustmentType}
                                setValue={setAdjustmentType}
                                required
                                readOnly={readOnly}
                            />
                            <TextInputNew
                                name="Adjustment Amount"
                                value={adjustmentAmount}
                                setValue={setAdjustmentAmount}
                                type={"number"}
                                required={true}
                                readOnly={readOnly}
                            />
                            <DropdownInput
                                name="Payment Mode"
                                options={paymentModes}
                                value={paymentMode}
                                setValue={setPaymentMode}
                                required
                                readOnly={readOnly}
                            />
                            <div className="md:col-span-2">
                                <TextAreaNew
                                    name="Reason"
                                    rows={1}
                                    value={reason}
                                    setValue={setReason}
                                    required
                                    readOnly={readOnly}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-2 justify-between flex-none bg-white p-2 rounded-md border border-slate-200 shadow-sm">
                <div className="flex gap-2 flex-wrap">
                    <button
                        onClick={() => hasPermission(() => saveData("close"), "save")}
                        disabled={readOnly}

                        className="bg-indigo-500 text-white px-4 py-1.5 rounded-md hover:bg-indigo-600 flex items-center text-sm shadow-sm transition-all active:scale-95">
                        <HiOutlineRefresh className="w-4 h-4 mr-2" />
                        Save & Close
                    </button>
                    <button
                        onClick={() => hasPermission(() => saveData("new"), "save")}
                        disabled={readOnly}
                        className="bg-indigo-500 text-white px-4 py-1.5 rounded-md hover:bg-indigo-600 flex items-center text-sm shadow-sm transition-all active:scale-95">
                        <FiSave className="w-4 h-4 mr-2" />
                        Save & New
                    </button>

                </div>
                <div className="flex gap-2 flex-wrap">
                    <button className="bg-yellow-600 text-white px-4 py-1.5 rounded-md hover:bg-yellow-700 flex items-center text-sm shadow-sm transition-all active:scale-95"
                        // onClick={() => setReadOnly(false)}
                        onClick={() => hasPermission(() => setReadOnly(false), "edit")}

                    >
                        <FiEdit2 className="w-4 h-4 mr-2" />
                        Edit
                    </button>

                </div>
            </div>
        </div>
    )
}

export default PaymentAdjustmentFormContent;