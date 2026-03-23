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
import { useGetQuotationQuery } from "../../../redux/uniformService/quotationServices";
import { useGetsaleOrderQuery } from "../../../redux/uniformService/saleOrderServices";
import { useGetSalesInvoiceQuery } from "../../../redux/uniformService/salesInvoiceServices";

const PaymentForm = ({ id, setId, onClose, initialTransactionType, initialTransactionId,

    transactionId,
    transactionType,
    setTransactionId,
    setTransactionType
}) => {


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
    const [paymentType, setPaymentType] = useState("INVOICE");
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

    console.log(PartyData, "partyData")

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
        if (!id) {


            setTotalBillAmount(PartyData?.data?.coa + PartyData?.data?.totaloutstanding - PartyData?.data?.totalPaymentAgainstInvoice);
        }
    }, [paymentType, PartyData]);

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
        transactionType,
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
                Swal.fire({
                    icon: 'success',
                    title: `${text || 'Saved'} Successfully`,
                    // showConfirmButton: false,
                    // timer: 2000
                });

                if (returnData.statusCode === 0) {
                    if (initialTransactionType && initialTransactionId) {
                        dispatch(push({ name: "PAYMENT DETAIL", transactionType: null, id: null }));
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
    const { data: quotationList } = useGetQuotationQuery({ params: { branchId, finYearId } }, { skip: transactionType !== "QUOTATION" });
    const { data: saleOrderList } = useGetsaleOrderQuery({ params: { branchId, finYearId } }, { skip: transactionType !== "SALEORDER" });
    const { data: salesInvoiceList } = useGetSalesInvoiceQuery({ params: { branchId, finYearId } }, { skip: transactionType !== "SALESINVOICE" });

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

                                    value={formatAmountIN((Number(totalBillAmount || 0) - Number(PartyData?.data?.totalDiscount || 0)).toFixed(2))}
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
                                    className="w-full px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-emerald-500"
                                    placeholder="0"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-600 mb-1">Balance Amount</label>
                                <input
                                    type="text"
                                    value={formatAmountIN(((Number(totalBillAmount) - Number(paidAmount) - Number(discount) - (Number(PartyData?.data?.totalDiscount) || 0)) || 0).toFixed(2))}
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