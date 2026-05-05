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

const PaymentAdjustmentFormContent = ({ id, setId, onClose }) => {


    const { branchId, companyId, finYearId, userId } = getCommonParams();

    const [readOnly, setReadOnly] = useState(false)
    const [docId, setDocId] = useState("")
    const [date, setDate] = useState(moment().format("YYYY-MM-DD"))
    const [adjustmentType, setAdjustmentType] = useState("")
    const [referenceNumber, setReferenceNumber] = useState("")
    const [adjustmentAmount, setAdjustmentAmount] = useState("")
    const [paymentMode, setPaymentMode] = useState("")
    const [reason, setReason] = useState("")

    const { data: nextDocData, refetch: refetchNextDoc } = useGetPaymentAdjustmentQuery({ branchId, finYearId });
    const { data: singleData, isFetching: isSingleFetching } = useGetPaymentAdjustmentByIdQuery(id, { skip: !id });

    const [addPaymentAdjustment] = useAddPaymentAdjustmentMutation();
    const [updatePaymentAdjustment] = useUpdatePaymentAdjustmentMutation();

    const resetForm = useCallback(() => {
        setAdjustmentType("");
        setReferenceNumber("");
        setAdjustmentAmount("");
        setPaymentMode("");
        setReason("");
        setDate(moment().format("YYYY-MM-DD"));
        if (!id) {
            refetchNextDoc();
        }
    }, [id, refetchNextDoc]);

    useEffect(() => {
        if (id && singleData?.data) {
            const data = singleData.data;
            setDocId(data.docId);
            setDate(moment(data.date).format("YYYY-MM-DD"));
            setAdjustmentType(data.transactionType);
            setReferenceNumber(data.paymentRefNo);
            setAdjustmentAmount(data.paidAmount);
            setPaymentMode(data.paymentMode);
            setReason(data.transaction);
            setReadOnly(true);
        } else if (!id && nextDocData) {
            setDocId(nextDocData.nextDocId);
            setReadOnly(false);
        }
    }, [id, singleData, nextDocData]);

    const handleSave = async (nextAction) => {
        if (!adjustmentType || !adjustmentAmount || !paymentMode || !reason) {
            Swal.fire({ icon: "warning", title: "Please fill all required fields" });
            return;
        }

        const payload = {
            branchId,
            companyId,
            finYearId,
            userId,
            date,
            adjustmentType,
            referenceNumber,
            adjustmentAmount,
            paymentMode,
            reason,
        };

        try {
            let result;
            if (id) {
                result = await updatePaymentAdjustment({ id, ...payload }).unwrap();
            } else {
                result = await addPaymentAdjustment(payload).unwrap();
            }

            if (result.statusCode === 0) {
                Swal.fire({ icon: "success", title: `Payment Adjustment ${id ? 'Updated' : 'Saved'} Successfully` });
                if (nextAction === "close") {
                    onClose();
                } else {
                    setId("");
                    resetForm();
                }
            } else {
                Swal.fire({ icon: "error", title: result.message || "Something went wrong" });
            }
        } catch (error) {
            Swal.fire({ icon: "error", title: "Internal Server Error" });
        }
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

            <div className="flex flex-col md:flex-row gap-2 justify-between flex-none bg-white p-2 rounded-md border border-slate-200 shadow-sm mt-auto mx-2 mb-2">
                <div className="flex gap-2 flex-wrap">
                    <button
                        onClick={() => handleSave("close")}
                        disabled={readOnly}
                        className="bg-indigo-500 text-white px-4 py-1.5 rounded-md hover:bg-indigo-600 flex items-center text-sm shadow-sm transition-all active:scale-95 disabled:opacity-50"
                    >
                        <HiOutlineRefresh className="w-4 h-4 mr-2" />
                        Save & Close
                    </button>
                    <button
                        onClick={() => handleSave("new")}
                        disabled={readOnly}
                        className="bg-indigo-500 text-white px-4 py-1.5 rounded-md hover:bg-indigo-600 flex items-center text-sm shadow-sm transition-all active:scale-95 disabled:opacity-50"
                    >
                        <FiSave className="w-4 h-4 mr-2" />
                        Save & New
                    </button>
                </div>
                <div className="flex gap-2 flex-wrap">
                    {id && (
                        <button 
                            className="bg-yellow-600 text-white px-4 py-1.5 rounded-md hover:bg-yellow-700 flex items-center text-sm shadow-sm transition-all active:scale-95"
                            onClick={() => setReadOnly(false)}
                        >
                            <FiEdit2 className="w-4 h-4 mr-2" />
                            Edit
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}

export default PaymentAdjustmentFormContent;