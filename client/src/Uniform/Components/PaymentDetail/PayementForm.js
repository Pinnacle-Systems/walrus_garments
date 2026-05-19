import { useCallback, useEffect, useRef, useState } from "react";
import FormHeader from "../../../Basic/components/FormHeader"
import { amountInWords, findFromList, formatAmountIN, getCommonParams, getDateFromDateTime } from "../../../Utils/helper";
import { PaymentFlow, paymentModes, PaymentType, TransactionAgainst } from "../../../Utils/DropdownData";
import { useDispatch } from "react-redux";
import { useGetPartyByIdQuery, useGetPartyQuery, useGetPartyOutstandingBalanceQuery } from "../../../redux/services/PartyMasterService";
import moment from "moment";
import { toast } from "react-toastify";
import { DropdownInputNew, ReusableSearchableInputNewCustomerwithBranches, TextInputNew } from "../../../Inputs";
import { dropDownListObject } from "../../../Utils/contructObject";
import { toWords } from "number-to-words";
import { HiOutlineRefresh } from "react-icons/hi";
import { FiEdit2, FiPrinter, FiSave } from "react-icons/fi";
import { FaFileAlt } from "react-icons/fa";
import Swal from "sweetalert2";
import { useAddPaymentMutation, useDeletePaymentMutation, useGetPaymentByIdQuery, useUpdatePaymentMutation } from "../../../redux/services/PaymentService";
import { useGetPaymentQuery } from "../../../redux/services/PaymentService";
import { useGetQuotationQuery } from "../../../redux/uniformService/quotationServices";
import { useGetSalesInvoiceQuery } from "../../../redux/uniformService/salesInvoiceServices";
import { push } from "../../../redux/features/opentabs";
import { useGetsaleOrderQuery } from "../../../redux/uniformService/saleOrderServices";
import { PDFViewer } from "@react-pdf/renderer";
import Modal from "../../../UiComponents/Modal";
import PaymentThermalPrint from "./PaymentThermalPrint";
import { useGetBranchQuery } from "../../../redux/services/BranchMasterService";

const PaymentForm = ({
    id, setId, onClose, initialReadOnly = false, initialTransactionType, initialTransactionId,
    transactionId, transactionType, setTransactionId, setTransactionType,
    docId, setDocId, cvv, setCvv, paymentMode, setPaymentMode,
    paymentRefNo, setPaymentRefNo, partyId, setPartyId,
    paymentType, setPaymentType, paidAmount, setPaidAmount,
    discount, setDiscount, balanceAmount, setBalanceAmount,
    totalBillAmount, setTotalBillAmount,
    billAmount, setBillAmount,
    totalPayAmount, setTotalPayAmount,
    supplierId, setSupplierId, paymentFlow, setPaymentFlow,
    lockPrefilledTransactionFields, setLockPrefilledTransactionFields,
    linkedPaymentOverrideEnabled, setLinkedPaymentOverrideEnabled,
    refId, setRefId, refDocId, setRefDocId,
    currentHistoryPage, setCurrentHistoryPage,
    readOnly, setReadOnly, childRecord,
    onNew, paymentHistory, setPaymentHistory, invalidateTagsDispatch,
    outstandingAmount, setOutStandingAmount
}) => {

    const calculateQuotationNetAmount = (quotationItems = [], quotation) => {
        const packingCharge = parseFloat(quotation?.packingCharge || 0);
        const shippingCharge = parseFloat(quotation?.shippingCharge || 0);
        const courierCharge = parseFloat(quotation?.courierCharge || 0);

        const itemsTotal = quotationItems.reduce((acc, curr) => {
            const price = parseFloat(curr?.price || 0);
            const qty = parseFloat(curr?.qty || 0);
            const taxPercent = parseFloat(curr?.taxPercent || 0);
            const taxMethod = curr?.taxMethod || "Inclusive";
            const discountType = curr?.discountType;
            const discountValue = parseFloat(curr?.discountValue || 0);

            const gross = price * qty;
            let discountedAmount = gross;

            if (discountType === "Percentage") {
                discountedAmount = gross - (gross * discountValue) / 100;
            } else if (discountType === "Flat") {
                discountedAmount = gross - discountValue;
            }

            discountedAmount = Math.max(0, discountedAmount);

            if (taxMethod === "Inclusive" && taxPercent > 0) {
                return acc + discountedAmount;
            }

            return acc + discountedAmount + (discountedAmount * taxPercent) / 100;
        }, 0);

        return itemsTotal + packingCharge + shippingCharge + courierCharge;
    };

    const getQuotationOutstandingAmount = (quotation) => {
        if (!quotation) return 0;

        const quotationNetAmount = calculateQuotationNetAmount(quotation?.QuotationItems, quotation);

        setPaymentHistory(quotation?.paymentData);

        const receivedAmount = (quotation?.paymentData || []).filter(i => i.paymentFlow !== 'Payout').reduce(
            (acc, curr) => acc + parseFloat(curr?.paidAmount || 0),
            0
        );




        return Math.max(0, quotationNetAmount - receivedAmount);
    };

    const getSalesInvoiceOutstandingAmount = (salesInvoice) => {
        if (!salesInvoice) return 0;

        const salesInvoiceNetAmount = calculateQuotationNetAmount(salesInvoice?.SalesInvoiceItems, salesInvoice);
        setPaymentHistory(salesInvoice?.paymentData);

        const receivedAmount = (salesInvoice?.paymentData || []).filter(i => i.paymentFlow !== 'Payout').reduce(
            (acc, curr) => acc + parseFloat(curr?.paidAmount || 0),
            0
        );

        const advanceReceivedAmount = (salesInvoice?.advancePaymentData || []).reduce(
            (acc, curr) => acc + parseFloat(curr?.paidAmount || 0),
            0
        );

        return Math.max(0, salesInvoiceNetAmount - receivedAmount - advanceReceivedAmount);
    };


    const getSalesOrderOutstandingAmount = (salesOrder) => {
        if (!salesOrder) return 0;



        const salesOrderNetAmount = calculateQuotationNetAmount(salesOrder?.SaleOrderItems, salesOrder);
        setPaymentHistory(salesOrder?.paymentData);

        const receivedAmount = (salesOrder?.paymentData || []).filter(i => i.paymentFlow !== 'Payout').reduce(
            (acc, curr) => acc + parseFloat(curr?.paidAmount || 0),
            0
        );

        const advanceReceivedAmount = (salesOrder?.advancePaymentData || []).reduce(
            (acc, curr) => acc + parseFloat(curr?.paidAmount || 0),
            0
        );



        return Math.max(0, salesOrderNetAmount - receivedAmount - advanceReceivedAmount);
    };



    const { branchId, finYearId, userId, companyId } = getCommonParams();
    const { data: branchList } = useGetBranchQuery({ params: { companyId } });
    const [thermalPrintOpen, setThermalPrintOpen] = useState(false);

    const hasLinkedTransaction = Boolean(transactionType && transactionId);
    const areLinkedFieldsLocked = readOnly || lockPrefilledTransactionFields;



    const dispatch = useDispatch()


    const { data: allData, isLoading, isFetching } = useGetPaymentQuery({ params: { branchId, } });

    const { data: singleData } = useGetPaymentByIdQuery(id, { skip: !id });
    // const {
    //     data: PartyData,
    //     isFetching: isSingleFetching,
    //     isLoading: isSingleLoading,
    // } = useGetPartyByIdQuery(supplierId, { skip: !supplierId });

    const { data: outstandingData, isFetching: isOutstandingFetching, isLoading: isOutstandingLoading } = useGetPartyOutstandingBalanceQuery(supplierId, {
        skip: !supplierId || paymentFlow !== "Payout"
    });

    useEffect(() => {
        if (paymentFlow === "Payout") {
            // setTotalBillAmount(outstandingData?.data?.outstandingBalance || 0);
            setOutStandingAmount(outstandingData?.data?.outstandingBalance || 0);
        }
    }, [outstandingData, isOutstandingFetching, isOutstandingLoading, supplierId])

    console.log(transactionType, "transactionType")

    const syncFormWithDb = useCallback(
        (data) => {

            console.log(data, "data in sync")
            // if (!id) return
            if (id) {
                setTransactionType(data?.transactionType)
                setTransactionId(data?.transactionId)
            }

            setDocId(data?.docId ? data?.docId : "New");
            // if (data?.createdAt) setDate(moment.utc(data?.createdAt).format("YYYY-MM-DD"));
            setPaidAmount(data?.paidAmount || '');
            setDiscount(data?.discount || 0)
            setSupplierId(data?.partyId || '')
            setPaymentMode(data?.paymentMode || '');
            setPaymentType(data?.paymentType || 'ADVANCE')
            setPaymentRefNo(data?.paymentRefNo || '');
            setRefId(data?.refId || '');
            setRefDocId(data?.refDocId || '');
            setPartyId(data?.partyId || '');
            setTotalBillAmount(data?.totalBillAmount || '')
            // setBillAmount(data?.totalBillAmount || '')

            setCvv(data?.cvv ? moment.utc(data?.cvv).format("YYYY-MM-DD") : moment.utc(new Date()).format("YYYY-MM-DD"))
            setPaymentFlow(data?.paymentFlow ? data?.paymentFlow : "Receipt")
            childRecord.current = data?.childRecord ? data?.childRecord : 0;
            setLinkedPaymentOverrideEnabled(false);
            setLockPrefilledTransactionFields(Boolean(data?.transactionType && data?.transactionId));

            setOutStandingAmount(data?.outstandingAmount ? data?.outstandingAmount : 0)


        }, [id])


    console.log(totalBillAmount, "totalBillAmount")

    useEffect(() => {
        if (id && singleData?.data) {
            syncFormWithDb(singleData.data);
        } else if (!id) {
            syncFormWithDb(null);
        }
    }, [id, singleData, syncFormWithDb]);



    useEffect(() => {
        if (id) {
            setReadOnly(initialReadOnly);
        }
    }, [id, initialReadOnly]);

    useEffect(() => {
        if (!id && initialTransactionType && initialTransactionId) {
            setLockPrefilledTransactionFields(true);
            if (initialTransactionType === "QUOTATION") {
                setPaymentType("ADVANCE");
            }
            setLinkedPaymentOverrideEnabled(false);
        } else if (!id && !initialTransactionType && !initialTransactionId) {
            setLockPrefilledTransactionFields(false);
            setLinkedPaymentOverrideEnabled(false);
        }
    }, [id, initialTransactionType, initialTransactionId]);

    const enableLinkedPaymentOverride = () => {
        if (!window.confirm("Unlock the protected fields for this linked payment so you can make changes?")) {
            return;
        }
        setLockPrefilledTransactionFields(false);
        setLinkedPaymentOverrideEnabled(true);
    };


    // useEffect(() => {
    //     if (!id) {
    //         if (transactionType && transactionId) {
    //             return;
    //         }

    //         setTotalBillAmount(PartyData?.data?.coa + PartyData?.data?.totaloutstanding - PartyData?.data?.totalPaymentAgainstInvoice);
    //     }
    // }, [paymentType, PartyData, id, transactionType, transactionId]);

    const [addData, { isLoading: isAdding }] = useAddPaymentMutation();
    const [updateData, { isLoading: isUpdating }] = useUpdatePaymentMutation();
    const [removeData, { isLoading: isDeleting }] = useDeletePaymentMutation();

    const isSaving = isAdding || isUpdating;



    const data = {
        id,
        branchId,
        paymentMode,
        cvv,
        paidAmount,
        paymentRefNo,
        discount,
        supplierId,
        paymentType,
        transactionType,
        refId,
        refDocId,
        finYearId,
        userId,
        totalBillAmount,
        totalAmount: parseFloat(paidAmount || 0) + parseFloat(discount || 0),
        paymentFlow,
        transactionId,
        billAmount,
        outstandingAmount

    }
    const validateData = (data) => {
        if (data?.paymentFlow === "Payout") {
            return data?.supplierId && data?.paidAmount && data?.paymentMode && data?.cvv && data?.paymentFlow;
        }
        return data?.supplierId && data?.paidAmount && data?.paymentType && data?.paymentMode && data?.cvv && data?.paymentFlow;
    }

    const handleSubmitCustom = async (callback, data, text, nextProcess) => {
        try {
            let returnData = await callback(data).unwrap();
            if (returnData.statusCode === 0) {
                setId("")

                if (returnData.statusCode === 0) {
                    Swal.fire({
                        icon: 'success',
                        title: `${text || 'Saved'} Successfully`,
                        // showConfirmButton: false,
                        // timer: 2000
                    });
                    invalidateTagsDispatch()

                    if (initialTransactionType && initialTransactionId) {
                        dispatch(push({ name: "PAYMENTS", transactionType: null, id: null }));
                    }

                    if (nextProcess === "new") {
                        onNew()
                        syncFormWithDb(undefined)
                        setReadOnly(false);

                    }
                    if (nextProcess === "close") {
                        onClose()
                    }
                }
            } else {
                toast.error(returnData?.message)
            }
            dispatch({
                type: `partyMaster/invalidateTags`,
                payload: ['Party'],
            });
        } catch (error) {
            console.log("handle")
        }

    }
    const saveData = (nextProcess) => {
        if (!validateData(data)) {
            Swal.fire({
                title: "Please fill all required fields...!",
                icon: "error",

            }); return
        }

        let foundItem;
        if (id) {
            foundItem = allData?.data
                ?.filter((i) => i.id !== id)
                ?.some(
                    (item) =>
                        item.paymentRefNo?.trim().toLowerCase() == paymentRefNo?.trim().toLowerCase());
        } else {
            foundItem = allData?.data?.some(
                (item) => item.paymentRefNo?.trim().toLowerCase() === paymentRefNo?.trim().toLowerCase()
            );
        }
        if (foundItem) {
            Swal.fire({
                text: "The Payment Ref No already exists.",
                icon: "warning",
                didClose: () => {
                    inputRef?.current?.focus();
                }
            });
            return false;
        }

        if (data?.amount < 0) {
            // toast.info("Amount Cannot be Negative...!!!", { position: "top-center" })
            Swal.fire({
                title: "Amount Cannot be Negative...!!!",
                icon: "error",

            });
            return
        }
        if (!window.confirm("Are you sure save the details ...?")) {
            return
        }
        if (id) {
            handleSubmitCustom(updateData, data, "Updated", nextProcess)
        } else {
            handleSubmitCustom(addData, data, "Added", nextProcess)
        }
    }

    const deleteData = async () => {
        if (id) {
            if (!window.confirm("Are you sure to delete...?")) {
                return
            }
            try {
                await removeData(id).unwrap();
                setId("");
                toast.success("Deleted Successfully");
                dispatch({
                    type: `partyMaster/invalidateTags`,
                    payload: ['Party'],
                });
            } catch (error) {
                toast.error("something went wrong")
            }
            ;
        }
    }

    const handleKeyDown = (event) => {
        let charCode = String.fromCharCode(event.which).toLowerCase();
        if ((event.ctrlKey || event.metaKey) && charCode === 's') {
            event.preventDefault();
            saveData();
        }
    }




    const handleChange = (e) => {
        const value = e.target.value;

        if (paymentFlow == "Payout") {
            if (value > outstandingAmount) {
                Swal.fire({
                    title: `Amount Cannot be Greater than Outstanding Amount(${formatAmountIN(outstandingAmount)})!!!`,
                    icon: "error",

                });
                return
            }
        }

        setPaidAmount(value);
    };

    const inputRef = useRef(null);


    useEffect(() => {
        inputRef.current?.focus();
    }, []);



    const { data: quotationList } = useGetQuotationQuery({ params: { branchId, finYearId } });
    const { data: salesInvoiceList } = useGetSalesInvoiceQuery({ params: { branchId, finYearId } });
    const { data: salesOrderList } = useGetsaleOrderQuery({ params: { branchId, finYearId } });

    // const paymentHistory = (paymentList?.data || [])
    //     .filter((payment) =>
    //         String(payment?.transactionType || "") === String(transactionType || "")
    //         && String(payment?.transactionId || "") === String(transactionId || "")
    //         && payment?.paymentFlow === "Receipt"
    //     )
    //     .sort((a, b) => new Date(b?.createdAt || 0) - new Date(a?.createdAt || 0));


    const historyItemsPerPage = 10;
    const totalHistoryPages = Math.ceil(paymentHistory.length / historyItemsPerPage);
    const historyIndexOfLastItem = currentHistoryPage * historyItemsPerPage;
    const historyIndexOfFirstItem = historyIndexOfLastItem - historyItemsPerPage;
    const currentHistoryItems = paymentHistory.slice(historyIndexOfFirstItem, historyIndexOfLastItem);

    const getDocIdOptions = () => {
        let list = [];
        if (transactionType === "QUOTATION") {
            list = (quotationList?.data || []).filter(q => !q.Saleorder || q.Saleorder.length === 0);
        }
        else if (transactionType === "SALESORDER") {
            list = salesOrderList?.data || [];
        }
        else if (transactionType === "SALESINVOICE") {
            list = salesInvoiceList?.data || [];
        }

        // Filter by selected party if supplierId exists
        if (supplierId) {
            list = list.filter(item => String(item.customerId || item.partyId) === String(supplierId));
        }

        return list.map(item => ({ show: item.docId, value: item.id }));
    };

    useEffect(() => {
        if (!transactionType || !transactionId) {
            if (!id) {
                // setTotalBillAmount('');
                setOutStandingAmount('')
                setBillAmount('');
                setRefDocId('');
                setRefId('');
            }
            return;
        }

        let transactionList = [];
        if (transactionType === "QUOTATION") transactionList = quotationList?.data || [];
        else if (transactionType === "SALESINVOICE") transactionList = salesInvoiceList?.data || [];
        else if (transactionType === "SALESORDER") transactionList = salesOrderList?.data || [];
        const selectedTransaction = transactionList.find(
            (item) => String(item.id) === String(transactionId)
        );

        console.log(transactionList, "transactionList")
        if (!selectedTransaction) return;

        if (!id) {
            setRefId(selectedTransaction.id);
            setRefDocId(selectedTransaction.docId || "");

            if (selectedTransaction.customerId && String(supplierId || "") !== String(selectedTransaction.customerId)) {
                setSupplierId(selectedTransaction.customerId);
            }
        }

        if (transactionType === "QUOTATION") {
            const billVal = calculateQuotationNetAmount(selectedTransaction?.QuotationItems, selectedTransaction);
            if (!id) {
                setTotalBillAmount(billVal.toFixed(2));
                // setTotalBillAmount(getQuotationOutstandingAmount(selectedTransaction).toFixed(2));
                setOutStandingAmount(getQuotationOutstandingAmount(selectedTransaction).toFixed(2));

            } else {
                setPaymentHistory(selectedTransaction?.paymentData || []);
            }
        } else if (transactionType === "SALESINVOICE") {
            const billVal = calculateQuotationNetAmount(selectedTransaction?.SalesInvoiceItems, selectedTransaction);
            if (!id) {
                setTotalBillAmount(billVal.toFixed(2));
                // setTotalBillAmount(getSalesInvoiceOutstandingAmount(selectedTransaction).toFixed(2));
                setOutStandingAmount(getSalesInvoiceOutstandingAmount(selectedTransaction).toFixed(2));
            } else {
                setPaymentHistory(selectedTransaction?.paymentData || []);
            }
        } else if (transactionType === "SALESORDER") {
            const billVal = calculateQuotationNetAmount(selectedTransaction?.SaleOrderItems, selectedTransaction);
            if (!id) {
                setTotalBillAmount(billVal.toFixed(2));
                // setTotalBillAmount(getSalesOrderOutstandingAmount(selectedTransaction).toFixed(2));
                setOutStandingAmount(getSalesOrderOutstandingAmount(selectedTransaction).toFixed(2));
            } else {
                setPaymentHistory(selectedTransaction?.paymentData || []);
            }
        }
    }, [id, transactionId, transactionType, quotationList, salesInvoiceList, salesOrderList]);



    useEffect(() => {
        if (!id && initialTransactionId && initialTransactionType) {
            const options = getDocIdOptions();
            const selected = options.find(opt => String(opt.value) === String(initialTransactionId));
            if (selected) {
                setRefDocId(selected.show);
                // If the list is loaded, we can also auto-fill the customer details based on the selected document
                let obj = [];
                if (initialTransactionType === "QUOTATION") obj = quotationList?.data;
                else if (initialTransactionType === "SALESINVOICE") obj = salesInvoiceList?.data;

                const matchingDoc = obj?.find(d => String(d.id) === String(initialTransactionId));
                if (matchingDoc && matchingDoc.customerId && !supplierId) {
                    setSupplierId(matchingDoc.customerId);
                }
            }
        }
    }, [initialTransactionId, initialTransactionType, quotationList, salesInvoiceList, id]);

    useEffect(() => {
        setCurrentHistoryPage(1);
    }, [transactionId, transactionType]);

    const handleHistoryPageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalHistoryPages) {
            setCurrentHistoryPage(newPage);
        }
    };

    // Auto-set transactionType based on paymentType
    useEffect(() => {
        if (!id) {
            if (paymentType === "ADVANCE") {
                setTransactionType("QUOTATION");
            } else if (paymentType === "INVOICE") {
                setTransactionType("SALESORDER");
            }
        }
    }, [paymentType, id]);

    // Default paymentType based on customer's pending documents
    useEffect(() => {
        if (!id && supplierId && paymentFlow === "Receipt" && quotationList?.data) {
            const pendingQuos = quotationList.data.filter(
                q => String(q.customerId) === String(supplierId) && (!q.Saleorder || q.Saleorder.length === 0)
            );

            if (pendingQuos.length > 0) {
                setPaymentType("ADVANCE");
            } else {
                setPaymentType("INVOICE");
            }
        }
    }, [supplierId, quotationList, id, paymentFlow]);

    const HistoryPagination = () => {
        if (paymentHistory.length <= historyItemsPerPage) return null;

        return (
            <div className="h-10 w-full flex flex-col sm:flex-row justify-between items-center p-2 bg-white border-t border-gray-200">
                <div className="text-sm text-gray-600 mb-2 sm:mb-0">
                    Showing {historyIndexOfFirstItem + 1} to {Math.min(historyIndexOfLastItem, paymentHistory.length)} of {paymentHistory.length} entries
                </div>
                <div className="flex gap-1">
                    <button
                        onClick={() => handleHistoryPageChange(currentHistoryPage - 1)}
                        disabled={currentHistoryPage === 1}
                        className={`px-3 py-1 rounded-md ${currentHistoryPage === 1
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-white text-gray-600 hover:bg-gray-100'
                            }`}
                    >
                        <FaChevronLeft className="inline" />
                    </button>

                    {Array.from({ length: Math.min(5, totalHistoryPages) }, (_, i) => {
                        let pageNum;
                        if (totalHistoryPages <= 5) {
                            pageNum = i + 1;
                        } else if (currentHistoryPage <= 3) {
                            pageNum = i + 1;
                        } else if (currentHistoryPage >= totalHistoryPages - 2) {
                            pageNum = totalHistoryPages - 4 + i;
                        } else {
                            pageNum = currentHistoryPage - 2 + i;
                        }

                        return (
                            <button
                                key={pageNum}
                                onClick={() => handleHistoryPageChange(pageNum)}
                                className={`px-3 py-1 rounded-md ${currentHistoryPage === pageNum
                                    ? 'bg-indigo-800 text-white'
                                    : 'bg-white text-gray-600 hover:bg-gray-100'
                                    }`}
                            >
                                {pageNum}
                            </button>
                        );
                    })}

                    {totalHistoryPages > 5 && currentHistoryPage < totalHistoryPages - 2 && (
                        <span className="px-3 py-1">...</span>
                    )}

                    {totalHistoryPages > 5 && currentHistoryPage < totalHistoryPages - 2 && (
                        <button
                            onClick={() => handleHistoryPageChange(totalHistoryPages)}
                            className={`px-3 py-1 rounded-md ${currentHistoryPage === totalHistoryPages
                                ? 'bg-indigo-800 text-white'
                                : 'bg-white text-gray-600 hover:bg-gray-100'
                                }`}
                        >
                            {totalHistoryPages}
                        </button>
                    )}

                    <button
                        onClick={() => handleHistoryPageChange(currentHistoryPage + 1)}
                        disabled={currentHistoryPage === totalHistoryPages}
                        className={`px-3 py-1 rounded-md ${currentHistoryPage === totalHistoryPages
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-white text-gray-600 hover:bg-gray-100'
                            }`}
                    >
                        <FaChevronRight className="inline" />
                    </button>
                </div>
            </div>
        );
    };

    return (
        <>
            <Modal isOpen={thermalPrintOpen} onClose={() => setThermalPrintOpen(false)} widthClass="w-[300pt] h-[95%]">
                <PDFViewer style={{ width: "100%", height: "90vh" }}>
                    <PaymentThermalPrint
                        paymentData={singleData?.data}
                        branchData={branchList?.data?.find(b => b.id === branchId)}
                    />
                </PDFViewer>
            </Modal>


            <div onKeyDown={handleKeyDown} className='md:items-start md:justify-items-center grid h-[85vh] relative'>

                <div className='flex flex-col w-full '>

                    <div className="w-full shrink-0 rounded-md bg-white px-2  shadow-md mb-1">
                        <div className="flex justify-between items-center bg-white py-1 ">
                            <h1 className="text-lg font-bold text-gray-800">Payment</h1>
                            <button
                                onClick={() => {
                                    onClose()
                                    if (initialTransactionType && initialTransactionId) {
                                        dispatch(push({ name: "PAYMENTS", transactionType: null, id: null }));
                                    }
                                }}

                                className="text-indigo-600 hover:text-indigo-700"
                                title="Open Report"
                            >
                                <FaFileAlt className="w-5 h-5" />
                            </button>
                        </div>

                    </div>

                    <div className="w-full px-1  pb-4  bg-gray-100 border border-gray-200">
                        <div className="grid grid-cols-7 mt-4 gap-x-1 gap-y-3">
                            <div className="">
                                <label className="block text-xs font-bold text-gray-600 mb-1">Payment No</label>
                                <input
                                    type="text"
                                    value={docId}
                                    className="w-full px-3 py-1.5 border border-gray-300 rounded-lg bg-slate-100 text-xs"
                                    readOnly
                                />
                            </div>
                            <TextInputNew
                                name="Payment Date"
                                value={cvv}
                                setValue={setCvv}
                                type="date"
                                required
                                ref={inputRef}

                            />
                            <div className="mb-2">
                                <label htmlFor="paymentType" className="block text-xs font-bold text-gray-600 mb-1">
                                    Payment Flow <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={paymentFlow}
                                    onChange={(e) => setPaymentFlow(e.target.value)}
                                    disabled={areLinkedFieldsLocked}
                                    className="w-full px-3 py-1.5 border border-gray-300 rounded-lg  bg-white focus:outline-none focus:ring-emerald-500 block text-xs font-bold text-gray-600 mb-1"
                                >
                                    <option value="" disabled>Select a payment Flow</option>
                                    {PaymentFlow.map((type) => (
                                        <option key={type.value} value={type.value}>
                                            {type.show}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="mb-2 col-span-2">

                                <div className="col-span-3 overflow-visible">
                                    <ReusableSearchableInputNewCustomerwithBranches
                                        label={"Customer Name"}
                                        component="PartyMaster"
                                        placeholder={`Search Customer Name...`}
                                        // optionList={supplierData}
                                        setSearchTerm={(value) => setSupplierId(value)}
                                        searchTerm={supplierId}
                                        show={"both"}
                                        required
                                        disabled={areLinkedFieldsLocked}
                                        isBillable={paymentFlow == "Payout" ? false : true}
                                        isRetunBillable={paymentFlow == "Payout" ? true : false}
                                    // ref={partyRef}
                                    />
                                </div>
                            </div>
                            {paymentFlow !== "Payout" && (
                                <div className="mb-2">
                                    <label htmlFor="paymentType" className="block text-xs font-bold text-gray-600 mb-1">
                                        Payment Type <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={paymentType}
                                        onChange={(e) => setPaymentType(e.target.value)}
                                        disabled={areLinkedFieldsLocked}
                                        className="w-full px-3 py-1.5 border border-gray-300 rounded-lg  bg-white focus:outline-none focus:ring-emerald-500 block text-xs font-bold text-gray-600 mb-1"
                                    >
                                        <option value="" disabled>Select a payment type</option>
                                        {PaymentType.filter(type => {
                                            if (type.value === "ADVANCE") {
                                                // Show Advance only if there are pending quotations for this customer
                                                const pendingQuos = (quotationList?.data || []).filter(
                                                    q => String(q.customerId) === String(supplierId) && (!q.Saleorder || q.Saleorder.length === 0)
                                                );
                                                return pendingQuos.length > 0;
                                            }
                                            return true;
                                        }).map((type) => (
                                            <option key={type.value} value={type.value}>
                                                {type.show}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}
                            {/* <div className="mb-2" >
                                <label htmlFor="transactionType" className="block text-xs font-bold text-gray-600 mb-1">
                                    Against Transaction
                                </label>
                                <select
                                    value={transactionType}
                                    onChange={(e) => setTransactionType(e.target.value)}
                                    disabled={areLinkedFieldsLocked}
                                    className="w-full px-3 py-1.5 border border-gray-300 rounded-lg  bg-white focus:outline-none focus:ring-emerald-500 block text-xs font-bold text-gray-600 mb-1"
                                >
                                    <option value="" disabled>Select a transaction</option>
                                    {TransactionAgainst.map((type) => (
                                        <option key={type.value} value={type.value}>
                                            {type.show}
                                        </option>
                                    ))}
                                </select>
                            </div> */}
                            {paymentFlow !== "Payout" && (
                                <div className="mb-2">
                                    <label htmlFor="refDocId" className="block text-xs font-bold text-gray-600 mb-1 ">
                                        Against Doc No
                                    </label>
                                    <DropdownInputNew
                                        className="block text-gray-600 font-medium mb-2"
                                        options={getDocIdOptions()}
                                        value={transactionId}
                                        readOnly={areLinkedFieldsLocked}
                                        setValue={(val) => {
                                            setTransactionId(val);
                                            setRefId(val);
                                            const options = getDocIdOptions();
                                            const selected = options.find(opt => String(opt.value) === String(val));
                                            if (selected) setRefDocId(selected.show);

                                            let transactionList = [];
                                            if (transactionType === "QUOTATION") transactionList = quotationList?.data || [];
                                            else if (transactionType === "SALESINVOICE") transactionList = salesInvoiceList?.data || [];
                                            else if (transactionType === "SALESORDER") transactionList = salesOrderList?.data || [];
                                            const selectedTransaction = transactionList.find(
                                                (item) => String(item.id) === String(val)
                                            );
                                            console.log(transactionType, "transactionType")

                                            if (selectedTransaction) {
                                                if (transactionType === "QUOTATION") {
                                                    const billVal = calculateQuotationNetAmount(selectedTransaction?.QuotationItems, selectedTransaction);
                                                    setTotalBillAmount(billVal.toFixed(2));
                                                    // setTotalBillAmount(getQuotationOutstandingAmount(selectedTransaction).toFixed(2));
                                                    setOutStandingAmount(getQuotationOutstandingAmount(selectedTransaction).toFixed(2));
                                                } else if (transactionType === "SALESINVOICE") {
                                                    const billVal = calculateQuotationNetAmount(selectedTransaction?.SalesInvoiceItems, selectedTransaction);
                                                    setTotalBillAmount(billVal.toFixed(2));
                                                    // setTotalBillAmount(getSalesInvoiceOutstandingAmount(selectedTransaction).toFixed(2));
                                                    setOutStandingAmount(getSalesInvoiceOutstandingAmount(selectedTransaction).toFixed(2));
                                                } else if (transactionType === "SALESORDER") {
                                                    const billVal = calculateQuotationNetAmount(selectedTransaction?.SaleOrderItems, selectedTransaction);
                                                    setTotalBillAmount(billVal.toFixed(2));
                                                    // setTotalBillAmount(getSalesOrderOutstandingAmount(selectedTransaction).toFixed(2));
                                                    setOutStandingAmount(getSalesOrderOutstandingAmount(selectedTransaction).toFixed(2));
                                                }
                                            }
                                        }}
                                        required
                                    />
                                </div>
                            )}
                            <div className="mb-4">
                                <label htmlFor="paymentType" className="block text-xs font-bold text-gray-600 mb-1">
                                    Payment Mode <span className="text-red-500">*</span>
                                </label>
                                <DropdownInputNew

                                    className="text-sm"
                                    options={paymentModes}
                                    value={paymentMode}
                                    setValue={setPaymentMode}
                                    required
                                    readOnly={readOnly}
                                />
                            </div>


                            <div>
                                <label className="block text-xs font-bold text-gray-600 mb-1">Reference No</label>
                                <input
                                    type="text"
                                    onChange={(e) => setPaymentRefNo(e.target.value)}
                                    value={paymentRefNo}
                                    className="w-full px-3 py-1 border border-gray-300 text-gray-700 rounded-lg focus:outline-none focus:ring-emerald-500"
                                    placeholder="Reference No"
                                />
                            </div>
                            {paymentFlow !== "Payout" && (
                                <div>
                                    <label className="block text-xs font-bold text-gray-600 mb-1">Total Bill Amount</label>
                                    <input
                                        type="text"
                                        value={formatAmountIN((Number(totalBillAmount || 0)).toFixed(2))}
                                        className="w-full px-3 py-1 border border-gray-300 bg-slate-100 text-gray-800 font-semibold rounded-lg focus:outline-none focus:ring-emerald-500"
                                        placeholder="0"
                                        disabled
                                    />
                                </div>
                            )}
                            <div>
                                <label className="block text-xs font-bold text-gray-600 mb-1">Outstanding Amount</label>
                                <input
                                    type="text"

                                    value={formatAmountIN((Number(outstandingAmount || 0)).toFixed(2))}
                                    // onChange={(e) => setTotalBillAmount(e.target.value)}
                                    onChange={(e) => setOutStandingAmount(e.target.value)}

                                    className="w-full px-3 py-1 border border-gray-300 bg-slate-100 text-red-500 font-semibold rounded-lg focus:outline-none focus:ring-emerald-500"
                                    placeholder="0"
                                    disabled
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-600 mb-1">Paid Amount<span className="text-red-500">*</span> </label>
                                <input
                                    type="number"
                                    value={paidAmount}
                                    onChange={handleChange}
                                    readOnly={readOnly}
                                    disabled={readOnly}
                                    className={`w-full px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-emerald-500 ${readOnly ? "bg-slate-100 text-slate-500 cursor-not-allowed" : ""
                                        }`}
                                    placeholder="0"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-600 mb-1">Balance Amount</label>
                                <input
                                    type="text"
                                    value={formatAmountIN(((Number(outstandingAmount || 0) - Number(paidAmount || 0) - Number(discount || 0)) || 0).toFixed(2))}
                                    onChange={(e) => setBalanceAmount(e.target.value)}
                                    className={`w-full px-3 py-1 border border-gray-300 bg-slate-100 rounded-lg ${(Number(outstandingAmount) - Number(paidAmount)) < 0 ? 'text-red-500' : 'text-green-800'
                                        } focus:outline-none focus:ring-emerald-500 font-semibold`}
                                    placeholder="0"
                                    disabled
                                />
                            </div>
                        </div>

                        <div className="mt-5 justify-center items-center">
                            {/* <p className="text-sm text-gray-700">
                                Amount in words: <span className="text-green-700 font-semibold">      
                                    {toWords(parseInt(paidAmount ? paidAmount : 0))}</span>
                            </p> */}
                            <p className="text-sm text-gray-700 text-center">
                                Amount in words: <span className="text-green-700 font-semibold">
                                    {amountInWords(parseFloat(paidAmount ? paidAmount : 0))}

                                </span>
                            </p>
                        </div>

                    </div>

                    {transactionId && (
                        <div className="inline-block mt-4 rounded-lg bg-[#F1F1F0] shadow-sm overflow-hidden">
                            <div className="px-4 py-3 border-b border-gray-200 bg-white">
                                <h2 className="text-sm font-bold text-gray-800">Payment History</h2>
                            </div>
                            <div className="mt-2 max-h-[28vh] overflow-auto">
                                <table className="table-fixed">
                                    <thead className="bg-gray-200 text-gray-800">
                                        <tr>
                                            <th className="px-2 py-1.5 font-medium text-[13px] text-gray-900 text-center w-12">
                                                <div>S No</div>
                                            </th>
                                            <th className="px-3 py-1.5 font-medium text-[13px] text-gray-900 text-left w-40">
                                                <div>Payment No</div>
                                            </th>
                                            <th className="px-3 py-1.5 font-medium text-[13px] text-gray-900 text-left w-40">
                                                <div>Payment For</div>
                                            </th>
                                            <th className="px-3 py-1.5 font-medium text-[13px] text-gray-900 text-left w-40">
                                                <div>Doc Id</div>
                                            </th>
                                            <th className="px-3 py-1.5 font-medium text-[13px] text-gray-900 text-left w-28">
                                                <div>Payment Date</div>
                                            </th>
                                            <th className="px-3 py-1.5 font-medium text-[13px] text-gray-900 text-left w-24">
                                                <div>Mode</div>
                                            </th>
                                            <th className="px-3 py-1.5 font-medium text-[13px] text-gray-900 text-left w-32">
                                                <div>Reference No</div>
                                            </th>
                                            <th className="px-3 py-1.5 font-medium text-[13px] text-gray-900 text-right w-32">
                                                <div>Received Amount</div>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="border-2">
                                        {paymentHistory.length > 0 ? (
                                            currentHistoryItems.map((payment, index) => (
                                                <tr
                                                    key={payment.id}
                                                    className={`hover:bg-gray-50 transition-colors border-b border-gray-200 text-[12px] ${(historyIndexOfFirstItem + index) % 2 === 0 ? "bg-white" : "bg-gray-100"
                                                        }`}
                                                >
                                                    <td className="text-center">{historyIndexOfFirstItem + index + 1}</td>
                                                    <td className="px-3 py-1.5 text-left">{payment.docId}</td>
                                                    <td className="px-3 py-1.5 text-left">{payment.transactionType}</td>
                                                    <td className="px-3 py-1.5 text-left">
                                                        {findFromList(payment?.transactionId,
                                                            payment.transactionType == "QUOTATION" ? quotationList?.data : salesOrderList?.data,
                                                            "docId"
                                                        )}</td>

                                                    <td className="px-3 py-1.5 text-left">
                                                        {payment.cvv ? moment.utc(payment.cvv).format("DD-MM-YYYY") : ""}
                                                    </td>
                                                    <td className="px-3 py-1.5 text-left">{payment.paymentMode}</td>
                                                    <td className="px-3 py-1.5 text-left">{payment.paymentRefNo || "-"}</td>
                                                    <td className="px-3 py-1.5 text-right font-medium text-emerald-700">
                                                        Rs.{formatAmountIN((Number(payment.paidAmount || 0)).toFixed(2))}
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="8" className="px-4 py-4 text-center text-slate-500 bg-white">
                                                    No payment history found for this document.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            <HistoryPagination />
                        </div>
                    )}


                </div>
                <div className='flex flex-col absolute bottom-3 w-full'>

                    <div className="flex flex-col md:flex-row gap-2 justify-between mt-4">
                        {/* Left Buttons */}
                        <div className="flex gap-2 ml-2 flex-wrap">
                            <button disabled={isSaving} onClick={() => saveData("close")} className={`text-white px-4 py-1 rounded-md flex items-center text-sm ${isSaving ? 'bg-indigo-300 cursor-not-allowed' : 'bg-indigo-500 hover:bg-indigo-600'}`}>
                                <HiOutlineRefresh className={`w-4 h-4 mr-2 ${isSaving ? 'animate-spin' : ''}`} />
                                {isSaving ? 'Saving...' : 'Save & Close'}
                            </button>
                            <button disabled={isSaving} onClick={() => saveData("new")} className={`text-white px-4 py-1 rounded-md flex items-center text-sm ${isSaving ? 'bg-indigo-300 cursor-not-allowed' : 'bg-indigo-500 hover:bg-indigo-600'}`}>
                                <FiSave className={`w-4 h-4 mr-2 ${isSaving ? 'animate-spin' : ''}`} />
                                {isSaving ? 'Saving...' : 'Save & New'}
                            </button>

                            {/* <button onClick={() => saveData("draft")} className="bg-indigo-500 text-white px-4 py-1 rounded-md hover:bg-indigo-600 flex items-center text-sm">
                            <HiOutlineRefresh className="w-4 h-4 mr-2" />
                            Draft Save
                        </button> */}
                        </div>

                        {/* Right Buttons */}
                        <div className="flex flex-col items-start gap-1 mr-2 md:items-end">
                            <div className="flex gap-2 flex-wrap">
                                {hasLinkedTransaction && !readOnly && (
                                    <button
                                        type="button"
                                        onClick={enableLinkedPaymentOverride}
                                        disabled={!areLinkedFieldsLocked}
                                        className={`rounded-md px-4 py-1 text-sm font-semibold text-white flex items-center ${areLinkedFieldsLocked
                                            ? "bg-red-600 hover:bg-red-700"
                                            : "bg-red-300 cursor-not-allowed"
                                            }`}
                                    >
                                        Edit Protected Fields
                                    </button>
                                )}

                                <button className="bg-yellow-600 text-white px-4 py-1 rounded-md hover:bg-yellow-700 flex items-center text-sm"
                                    onClick={() => setReadOnly(false)}
                                >
                                    <FiEdit2 className="w-4 h-4 mr-2" />
                                    Edit
                                </button>
                                {id && (
                                    <button
                                        className="bg-orange-600 text-white px-4 py-1 rounded-md hover:bg-orange-700 flex items-center text-sm"
                                        onClick={() => setThermalPrintOpen(true)}
                                    >
                                        <FiPrinter className="w-4 h-4 mr-2" />
                                        Print Receipt
                                    </button>
                                )}
                            </div>

                            {linkedPaymentOverrideEnabled && !readOnly && (
                                <div className="text-[11px] text-amber-700 whitespace-nowrap md:text-right">
                                    Protected fields are unlocked for editing. Save after updating the required values.
                                </div>
                            )}
                        </div>
                    </div>
                </div>

            </div>

        </>
    )
}

export default PaymentForm
