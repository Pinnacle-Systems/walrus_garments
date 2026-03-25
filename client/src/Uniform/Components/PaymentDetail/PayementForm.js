import { useCallback, useEffect, useRef, useState } from "react";
import FormHeader from "../../../Basic/components/FormHeader"
import { amountInWords, formatAmountIN, getCommonParams, getDateFromDateTime } from "../../../Utils/helper";
import { PaymentFlow, paymentModes, PaymentType, TransactionAgainst } from "../../../Utils/DropdownData";
import { useDispatch } from "react-redux";
import { useGetPartyByIdQuery, useGetPartyQuery } from "../../../redux/services/PartyMasterService";
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
import { useGetsaleOrderQuery } from "../../../redux/uniformService/saleOrderServices";
import { useGetSalesInvoiceQuery } from "../../../redux/uniformService/salesInvoiceServices";
import useInvalidateTags from "../../../CustomHooks/useInvalidateTags";
import { push } from "../../../redux/features/opentabs";

const PaymentForm = ({ id, setId, onClose, initialReadOnly = false, initialTransactionType, initialTransactionId,

    transactionId,
    transactionType,
    setTransactionId,
    setTransactionType
}) => {

    const calculateQuotationNetAmount = (quotationItems = []) => {
        return quotationItems.reduce((acc, curr) => {
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
    };

    const getQuotationOutstandingAmount = (quotation) => {
        if (!quotation) return 0;

        const quotationNetAmount = calculateQuotationNetAmount(quotation?.QuotationItems);

        const receivedAmount = (quotation?.paymentData || []).reduce(
            (acc, curr) => acc + parseFloat(curr?.paidAmount || 0),
            0
        );

        return Math.max(0, quotationNetAmount - receivedAmount);
    };


    const today = new Date().toISOString().split('T')[0];

    const { branchId, companyId, finYearId, userId } = getCommonParams();

    const [form, setForm] = useState(true);
    const [date, setDate] = useState(getDateFromDateTime(today));
    const [docId, setDocId] = useState("New");
    const [formReport, setFormReport] = useState(false)
    const [readOnly, setReadOnly] = useState(false);
    const [cvv, setCvv] = useState(moment.utc(new Date()).format("YYYY-MM-DD"));
    const [paymentMode, setPaymentMode] = useState('');
    const [paymentRefNo, setPaymentRefNo] = useState('');
    const [partyId, setPartyId] = useState("");
    const [paymentType, setPaymentType] = useState(
        initialTransactionType === "QUOTATION" ? "ADVANCE" : "INVOICE"
    );
    const [lockPrefilledTransactionFields, setLockPrefilledTransactionFields] = useState(
        Boolean(initialTransactionType === "QUOTATION" && initialTransactionId)
    );
    const [paidAmount, setPaidAmount] = useState('');
    const [discount, setDiscount] = useState('')
    const [balanceAmount, setBalanceAmount] = useState('');
    const [totalBillAmount, setTotalBillAmount] = useState('');
    const [totalPayAmount, setTotalPayAmount] = useState('')
    const [purchaseOrderForm, setPurchaseOrderForm] = useState("")
    const [paymentFlow, setPaymentFlow] = useState(initialTransactionType ? "Receipt" : "Receipt");



    const [refId, setRefId] = useState("");
    const [refDocId, setRefDocId] = useState("");

    const [searchValue, setSearchValue] = useState("");
    const [supplierId, setSupplierId] = useState("");
    const [currentHistoryPage, setCurrentHistoryPage] = useState(1);

    const childRecord = useRef(0);


    const dispatch = useDispatch()
    // const { data: allData, isLoading, isFetching } = useGetPaymentQuery({ params: { branchId, finYearId }, searchParams: searchValue });

    // const getNextDocId = useCallback(() => {

    //     if (id || isLoading || isFetching) return
    //     if (allData?.nextDocId) {
    //         setDocId(allData.nextDocId)
    //     }
    // }, [allData, isLoading, isFetching, id])

    // useEffect(getNextDocId, [getNextDocId])


    const { data: singleData } = useGetPaymentByIdQuery(id, { skip: !id });
    const {
        data: PartyData,
        isFetching: isSingleFetching,
        isLoading: isSingleLoading,
    } = useGetPartyByIdQuery(supplierId, { skip: !supplierId });

      const [invalidateTagsDispatch] = useInvalidateTags    ();



    const syncFormWithDb = useCallback(
        (data) => {
            if (!id) return
            // if (id) setReadOnly(true);
            // else setReadOnly(false);
            setDocId(data?.docId ? data?.docId : "New");
            if (data?.createdAt) setDate(moment.utc(data?.createdAt).format("YYYY-MM-DD"));
            setPaidAmount(data?.paidAmount || '');
            setDiscount(data?.discount || 0)
            setSupplierId(data?.partyId || '')
            setPaymentMode(data?.paymentMode || '');
            setPaymentType(data?.paymentType || 'INVOICE')
            setPaymentRefNo(data?.paymentRefNo || '');
            setRefId(data?.refId || '');
            setRefDocId(data?.refDocId || '');
            setTotalPayAmount(PartyData?.data?.soa ? data?.totalPaymentPurchaseBill : data?.totalPaymentSalesBill)
            setPartyId(data?.partyId || '');
            setTotalBillAmount(data?.totalBillAmount || '')
            setTransactionType(data?.transactionType)
            setTransactionId(data?.transactionId)
            setCvv(data?.cvv ? moment.utc(data?.cvv).format("YYYY-MM-DD") : moment.utc(new Date()).format("YYYY-MM-DD"))
            setPaymentFlow(data?.paymentFlow ? data?.paymentFlow : "Receipt")
            childRecord.current = data?.childRecord ? data?.childRecord : 0;

        }, [id])


    useEffect(() => {
        syncFormWithDb(singleData?.data);
    }, [syncFormWithDb, singleData])

    useEffect(() => {
        if (id) {
            setReadOnly(initialReadOnly);
        }
    }, [id, initialReadOnly]);

    useEffect(() => {
        if (!id && initialTransactionType === "QUOTATION" && initialTransactionId) {
            setLockPrefilledTransactionFields(true);
            setPaymentType("ADVANCE");
        } else if (!id && !initialTransactionType && !initialTransactionId) {
            setLockPrefilledTransactionFields(false);
        }
    }, [id, initialTransactionType, initialTransactionId]);


    useEffect(() => {
        if (!id) {
            if (transactionType && transactionId) {
                return;
            }

            setTotalBillAmount(PartyData?.data?.coa + PartyData?.data?.totaloutstanding - PartyData?.data?.totalPaymentAgainstInvoice);
        }
    }, [paymentType, PartyData, id, transactionType, transactionId]);

    const [addData] = useAddPaymentMutation();
    const [updateData] = useUpdatePaymentMutation();
    const [removeData] = useDeletePaymentMutation();


    console.log(cvv, "datecheck");

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
        transactionId

    }
    const validateData = (data) => {
        return data?.supplierId && data?.paidAmount && data?.paymentType && data?.paymentMode && data?.cvv && data?.paymentFlow
    }

    const handleSubmitCustom = async (callback, data, text, nextProcess) => {
        try {
            let returnData = await callback(data).unwrap();
            if (returnData.statusCode === 0) {
                setId("")
                syncFormWithDb(undefined)
                
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

    const onNew = () => {
        setId("");
        setReadOnly(false);
        setForm(true);
        setSearchValue("")
        setDocId("New");
        setCvv(moment.utc(new Date()).format("YYYY-MM-DD"));
        setPaymentMode('');
        setPaymentRefNo('');
        setPartyId("");
        setPaidAmount('');
        setDiscount('');
        setBalanceAmount('');
        setTotalPayAmount('');
        setSupplierId("");
        setLockPrefilledTransactionFields(false);
        setPaymentType("INVOICE");
        setPaymentFlow("Receipt");
        setTransactionType("");
        setTransactionId("");
        setRefDocId("");
        setRefId("");
        setTotalBillAmount("");
        syncFormWithDb(undefined);

    }
    const { data: supplierList } = useGetPartyQuery({ params: { branchId, finYearId, isAddessCombined: true } });

    const supplierData = supplierList?.data ? supplierList.data : [];

    const handleChange = (e) => {
        const value = e.target.value;
        // if (/^\d*$/.test(value)) {
        setPaidAmount(value);
        // }
    };
    const handleChange1 = (e) => {
        const value = e.target.value;
        setDiscount(value)

    }
    const inputRef = useRef(null);
    const customerRef = useRef(null)
    const customerDate = useRef(null)

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    // Fetch transaction lists
    const { data: paymentList } = useGetPaymentQuery({ params: { branchId, finYearId } });
    const { data: quotationList } = useGetQuotationQuery({ params: { branchId, finYearId } }, { skip: transactionType !== "QUOTATION" });
    const { data: saleOrderList } = useGetsaleOrderQuery({ params: { branchId, finYearId } }, { skip: transactionType !== "SALEORDER" });
    const { data: salesInvoiceList } = useGetSalesInvoiceQuery({ params: { branchId, finYearId } }, { skip: transactionType !== "SALESINVOICE" });

    const paymentHistory = (paymentList?.data || [])
        .filter((payment) =>
            String(payment?.transactionType || "") === String(transactionType || "")
            && String(payment?.transactionId || "") === String(transactionId || "")
            && payment?.paymentFlow === "Receipt"
        )
        .sort((a, b) => new Date(b?.createdAt || 0) - new Date(a?.createdAt || 0));
    const historyItemsPerPage = 10;
    const totalHistoryPages = Math.ceil(paymentHistory.length / historyItemsPerPage);
    const historyIndexOfLastItem = currentHistoryPage * historyItemsPerPage;
    const historyIndexOfFirstItem = historyIndexOfLastItem - historyItemsPerPage;
    const currentHistoryItems = paymentHistory.slice(historyIndexOfFirstItem, historyIndexOfLastItem);

    const getDocIdOptions = () => {
        let list = [];
        if (transactionType === "QUOTATION") list = quotationList?.data || [];
        else if (transactionType === "SALEORDER") list = saleOrderList?.data || [];
        else if (transactionType === "SALESINVOICE") list = salesInvoiceList?.data || [];

        // Filter by selected party if supplierId exists
        if (supplierId) {
            list = list.filter(item => String(item.customerId || item.partyId) === String(supplierId));
        }

        return list.map(item => ({ show: item.docId, value: item.id }));
    };

    useEffect(() => {
        if (id) return;

        if (!transactionType || !transactionId) {
            setTotalBillAmount('');
            setRefDocId('');
            setRefId('');
            return;
        }

        let transactionList = [];
        if (transactionType === "QUOTATION") transactionList = quotationList?.data || [];
        else if (transactionType === "SALEORDER") transactionList = saleOrderList?.data || [];
        else if (transactionType === "SALESINVOICE") transactionList = salesInvoiceList?.data || [];

        const selectedTransaction = transactionList.find(
            (item) => String(item.id) === String(transactionId)
        );

        if (!selectedTransaction) return;

        setRefId(selectedTransaction.id);
        setRefDocId(selectedTransaction.docId || "");

        if (selectedTransaction.customerId && String(supplierId || "") !== String(selectedTransaction.customerId)) {
            setSupplierId(selectedTransaction.customerId);
        }

        if (transactionType === "QUOTATION") {
            setTotalBillAmount(getQuotationOutstandingAmount(selectedTransaction).toFixed(2));
        }
    }, [id, transactionId, transactionType, quotationList, saleOrderList, salesInvoiceList]);



    useEffect(() => {
        if (!id && initialTransactionId && initialTransactionType) {
            const options = getDocIdOptions();
            const selected = options.find(opt => String(opt.value) === String(initialTransactionId));
            if (selected) {
                setRefDocId(selected.show);
                // If the list is loaded, we can also auto-fill the customer details based on the selected document
                let obj = [];
                if (initialTransactionType === "QUOTATION") obj = quotationList?.data;
                else if (initialTransactionType === "SALEORDER") obj = saleOrderList?.data;
                else if (initialTransactionType === "SALESINVOICE") obj = salesInvoiceList?.data;

                const matchingDoc = obj?.find(d => String(d.id) === String(initialTransactionId));
                if (matchingDoc && matchingDoc.customerId && !supplierId) {
                    setSupplierId(matchingDoc.customerId);
                }
            }
        }
    }, [initialTransactionId, initialTransactionType, quotationList, saleOrderList, salesInvoiceList, id]);

    useEffect(() => {
        setCurrentHistoryPage(1);
    }, [transactionId, transactionType]);

    const handleHistoryPageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalHistoryPages) {
            setCurrentHistoryPage(newPage);
        }
    };

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


            <div onKeyDown={handleKeyDown} className='md:items-start md:justify-items-center grid h-[85vh] relative'>

                <div className='flex flex-col w-full '>

                    <div className="w-full  mx-auto rounded-md shadow-lg px-2 overflow-y-auto">
                        <div className="flex justify-between items-center mb-1">
                            <h1 className="text-2xl font-bold text-gray-800">Payment</h1>
                            <button
                                onClick={() => {
                                    // onNew()
                                    onClose()
                                    //   RequirementRefetch()
                                }
                                }
                                className="text-indigo-600 hover:text-indigo-700"
                                title="Open Report"
                            >
                                <FaFileAlt className="w-5 h-5" />
                            </button>
                        </div>

                    </div>

                    <div className="w-full p-11 mt-3 bg-gray-100 border border-gray-200">
                        <div className="grid grid-cols-6 gap-6">
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
                                {/* <label htmlFor="paymentType" className="block text-xs font-bold text-gray-600 mb-1 ">
                                    {paymentFlow == "Receipt" ? "Customer" : "Supplier"} <span className="text-red-500">*</span>
                                </label> */}
                                {/* <DropdownInputNew
                                    ref={inputRef}

                                    className="block text-gray-600 font-medium mb-2"
                                    options={dropDownListObject(
                                        id
                                            ? supplierData
                                            : paymentFlow == "Receipt"
                                                ? supplierData.filter((value) => value.isClient && value.active)
                                                : supplierData.filter((value) => value.isSupplier && value.active),
                                        "name",
                                        "id"
                                    )}
                                    value={supplierId}
                                    setValue={setSupplierId}
                                    required
                                    readOnly={readOnly}
                                    disabled={childRecord.current > 0}
                                /> */}
                                <div className="col-span-3 overflow-visible">
                                    <ReusableSearchableInputNewCustomerwithBranches
                                        label={`${paymentFlow == "Receipt" ? "Customer" : "Supplier"}`}
                                        component={`${paymentFlow == "Receipt" ? "CustomerMaster" : "SupplierMaster"}`}
                                        placeholder={`Search ${paymentFlow == "Receipt" ? "Customer" : "Supplier"} Name...`}
                                        optionList={supplierData}
                                        setSearchTerm={(value) => setSupplierId(value)}
                                        searchTerm={supplierId}
                                        show={`${paymentFlow == "Receipt" ? "isClient" : "isSupplier"}`}
                                        required disabled={id}
                                    // ref={partyRef}
                                    />
                                </div>
                            </div>
                            <div className="mb-2">
                                <label htmlFor="paymentType" className="block text-xs font-bold text-gray-600 mb-1">
                                    Payment Type <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={paymentType}
                                    onChange={(e) => setPaymentType(e.target.value)}
                                    disabled={lockPrefilledTransactionFields}
                                    className="w-full px-3 py-1.5 border border-gray-300 rounded-lg  bg-white focus:outline-none focus:ring-emerald-500 block text-xs font-bold text-gray-600 mb-1"
                                >
                                    <option value="" disabled>Select a payment type</option>
                                    {PaymentType.map((type) => (
                                        <option key={type.value} value={type.value}>
                                            {type.show}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="mb-2">
                                <label htmlFor="transactionType" className="block text-xs font-bold text-gray-600 mb-1">
                                    Against Transaction
                                </label>
                                <select
                                    value={transactionType}
                                    onChange={(e) => setTransactionType(e.target.value)}
                                    disabled={lockPrefilledTransactionFields}
                                    className="w-full px-3 py-1.5 border border-gray-300 rounded-lg  bg-white focus:outline-none focus:ring-emerald-500 block text-xs font-bold text-gray-600 mb-1"
                                >
                                    <option value="" disabled>Select a transaction</option>
                                    {TransactionAgainst.map((type) => (
                                        <option key={type.value} value={type.value}>
                                            {type.show}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="mb-2">
                                <label htmlFor="refDocId" className="block text-xs font-bold text-gray-600 mb-1 ">
                                    Against Doc No
                                </label>
                                <DropdownInputNew
                                    className="block text-gray-600 font-medium mb-2"
                                    options={getDocIdOptions()}
                                    value={transactionId}
                                    readOnly={lockPrefilledTransactionFields}
                                    setValue={(val) => {
                                        setTransactionId(val);
                                        const options = getDocIdOptions();
                                        const selected = options.find(opt => opt.value === val);
                                        if (selected) setRefDocId(selected.show);
                                    }}
                                    required
                                />
                            </div>
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
                            <div>
                                <label className="block text-xs font-bold text-gray-600 mb-1">Outstanding Amount</label>
                                <input
                                    type="text"

                                    value={formatAmountIN((Number(totalBillAmount || 0)).toFixed(2))}
                                    onChange={(e) => setTotalBillAmount(e.target.value)}
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
                                    value={formatAmountIN(((Number(totalBillAmount || 0) - Number(paidAmount || 0) - Number(discount || 0)) || 0).toFixed(2))}
                                    onChange={(e) => setBalanceAmount(e.target.value)}
                                    className={`w-full px-3 py-1 border border-gray-300 bg-slate-100 rounded-lg ${(Number(totalBillAmount) - Number(paidAmount)) < 0 ? 'text-red-500' : 'text-green-800'
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
                                                <td colSpan="6" className="px-4 py-4 text-center text-slate-500 bg-white">
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
                            <button onClick={() => saveData("close")} className="bg-indigo-500 text-white px-4 py-1 rounded-md hover:bg-indigo-600 flex items-center text-sm">
                                <HiOutlineRefresh className="w-4 h-4 mr-2" />
                                Save & Close
                            </button>
                            <button onClick={() => saveData("new")} className="bg-indigo-500 text-white px-4 py-1 rounded-md hover:bg-indigo-600 flex items-center text-sm">
                                <FiSave className="w-4 h-4 mr-2" />
                                Save & New
                            </button>

                            {/* <button onClick={() => saveData("draft")} className="bg-indigo-500 text-white px-4 py-1 rounded-md hover:bg-indigo-600 flex items-center text-sm">
                            <HiOutlineRefresh className="w-4 h-4 mr-2" />
                            Draft Save
                        </button> */}
                        </div>

                        {/* Right Buttons */}
                        <div className="flex gap-2 flex-wrap mr-2">

                            <button className="bg-yellow-600 text-white px-4 py-1 rounded-md hover:bg-yellow-700 flex items-center text-sm"
                                onClick={() => setReadOnly(false)}
                            >
                                <FiEdit2 className="w-4 h-4 mr-2" />
                                Edit
                            </button>

                        </div>
                    </div>
                </div>

            </div>

        </>
    )
}

export default PaymentForm
