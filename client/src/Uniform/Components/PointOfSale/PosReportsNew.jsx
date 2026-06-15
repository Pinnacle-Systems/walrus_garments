import React from 'react'
import { useEffect, useState, useRef } from "react";
import { io as socketIO } from 'socket.io-client';
import { useGetPartyQuery } from "../../../redux/services/PartyMasterService"
import { Loader } from "../../../Basic/components";
import { findFromList, getCommonParams, getDateFromDateTimeToDisplay, getDateTimeFromDateTimeToDisplay } from "../../../Utils/helper";
import { showEntries } from '../../../Utils/DropdownData';
import secureLocalStorage from 'react-secure-storage';
import {
    useGetPoQuery
} from "../../../redux/uniformService/PoServices"
import { pageNumberToReactPaginateIndex, reactPaginateIndexToPageNumber } from '../../../Utils/helper';
import ReactPaginate from 'react-paginate';
import { FaChevronLeft, FaChevronRight, FaEllipsisV } from 'react-icons/fa';
import { useGetDirectInwardOrReturnQuery } from '../../../redux/uniformService/DirectInwardOrReturnServices';
import { useGetQuotationMasterQuery, useGetQuotationQuery } from '../../../redux/uniformService/quotationServices';
import { useGetPointOfSalesQuery, useCancelPointOfSalesMutation, useLazyGetPointOfSalesQuery } from '../../../redux/uniformService/PointOfSalesService';
import { FiPrinter, FiXCircle, FiRefreshCw, FiCalendar } from 'react-icons/fi';
import { PDFViewer } from '@react-pdf/renderer';
import Modal from '../../../UiComponents/Modal';
import PosMultiCopyPrint from './PosMultiCopyPrint';
import PosDeliveryReceiptPrint from './PosDeliveryReceiptPrint';
import { useGetBranchQuery } from '../../../redux/services/BranchMasterService';
import Swal from 'sweetalert2';



const PosReportsNew = ({
    onClick,
    onView,
    itemsPerPage = 15,
    onEdit,
    onDelete,
    onConvertToSaleOrder,
    onConvertToInvoice,
    onMakePayment,
    reportsTransactionType = "SALE",
    rowActions = true,
    lastRefresh,
    hasPermission,
    isActive

}) => {

    console.log(reportsTransactionType, "reportsTransactionType")

    const calculateQuotationNetAmount = (quotationItems = [], quotation = {}) => {
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

    const getPaidAmount = (paymentData = []) => {
        return paymentData.reduce(
            (acc, curr) => acc + parseFloat(curr?.paidAmount || 0),
            0
        );
    };

    const getRequiredAdvanceAmount = (dataObj) => {
        const minimumAdvanceAmount = parseFloat(dataObj?.minimumAdvancePayment || 0);
        if (minimumAdvanceAmount > 0) {
            return minimumAdvanceAmount;
        }

        return calculateQuotationNetAmount(dataObj?.QuotationItems, dataObj) * 0.25;
    };

    const shouldShowAdvanceReceipt = (dataObj) => {
        const paidAmount = getPaidAmount(dataObj?.paymentData);
        const requiredAdvanceAmount = getRequiredAdvanceAmount(dataObj);
        return paidAmount < requiredAdvanceAmount;
    };


    const branchId = secureLocalStorage.getItem(
        sessionStorage.getItem("sessionId") + "currentBranchId"
    );
    const [dataPerPage, setDataPerPage] = useState("16");
    const [serachDocNo, setSerachDocNo] = useState("");
    const [searchClientName, setSearchClientName] = useState("");
    const [searchDate, setSearchDate] = useState("");
    const [supplier, setSupplier] = useState("");
    const [searchMaterial, setSearchMaterial] = useState("")
    const [searchCustomerName, setSearchCustomerName] = useState("")
    const [billStatus, setBillStatus] = useState("")
    const [returnBill, setReturnBill] = useState("")
    const [exchangeBill, setExchangeBill] = useState("")

    const searchInputRef = useRef(null);

    useEffect(() => {
        if (isActive) {
            setSerachDocNo("");
            setSearchDate("");
            setBillStatus("");
            setSearchCustomerName("");
            setReturnBill("");
            setExchangeBill("");
            if (searchInputRef.current) {
                searchInputRef.current.focus();
            }
        }
    }, [isActive]);

    const [totalCount, setTotalCount] = useState(0);
    const [currentPageNumber, setCurrentPageNumber] = useState(1);
    const [activeActionMenuId, setActiveActionMenuId] = useState(null);
    const [hoveredDeleteId, setHoveredDeleteId] = useState(null);
    const [thermalPrintOpen, setThermalPrintOpen] = useState(false);
    const [printData, setPrintData] = useState(null);
    const { branchId: currentBranchId, companyId } = getCommonParams();
    const { data: branchList } = useGetBranchQuery({ params: { companyId } });
    const [cancelPointOfSales] = useCancelPointOfSalesMutation();
    const [triggerGetPOS] = useLazyGetPointOfSalesQuery();

    const handleCancel = async (id) => {
        const result = await Swal.fire({
            title: 'Cancel Bill?',
            text: 'This will void the bill and restore stock. This action cannot be undone.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#94a3b8',
            confirmButtonText: 'Yes, Cancel Bill'
        });

        if (result.isConfirmed) {
            try {
                const res = await cancelPointOfSales(id).unwrap();
                if (res.statusCode === 0) {
                    Swal.fire('Canceled!', 'The bill has been canceled and stock restored.', 'success');
                } else {
                    Swal.fire('Error', res.message || 'Failed to cancel bill', 'error');
                }
            } catch (err) {
                Swal.fire('Error', err.data?.message || 'Something went wrong', 'error');
            }
        }
    };


    const searchFields = {
        serachDocNo,
        searchClientName,
        searchDate,
        supplier,
        searchMaterial,
        searchCustomerName,
        reportsTransactionType,
        exchangeBill,
        returnBill

    };

    useEffect(() => {
        setCurrentPageNumber(1);
    }, [
        serachDocNo,
        searchClientName,
        searchDate,
        supplier,
        searchMaterial,
        searchCustomerName,
        reportsTransactionType,
        exchangeBill,
        returnBill
    ]);

    useEffect(() => {
        const handleClickOutside = () => setActiveActionMenuId(null);
        if (activeActionMenuId) {
            window.addEventListener('click', handleClickOutside);
        }
        return () => window.removeEventListener('click', handleClickOutside);
    }, [activeActionMenuId]);





    const { data: allData, isFetching, isLoading, refetch } = useGetPointOfSalesQuery({
        params: {
            branchId,
            ...searchFields,
            pagination: true,
            dataPerPage,
            currentPageNumber,
        }
    });




    useEffect(() => {
        if (allData?.data?.totalCount) {
            setTotalCount(allData?.data?.totalCount);
        }
    }, [allData, isLoading, isFetching]);

    useEffect(() => {
        if (lastRefresh) {
            refetch();
        }
    }, [lastRefresh, refetch]);

    useEffect(() => {
        const socketUrl = process.env.REACT_APP_SERVER_URL
        const socket = socketIO(socketUrl);

        socket.on('pos_changed', (data) => {
            if (data && parseInt(data.branchId) === parseInt(branchId)) {
                console.log("Real-time POS update received, refetching...");
                refetch();
            }
        });

        return () => {
            socket.disconnect();
        };
    }, [branchId, refetch]);

    const handleScannedBillNo = async (docNo) => {
        try {
            const response = await triggerGetPOS({ params: { serachDocNo: docNo } }).unwrap();
            if (response?.statusCode === 0 && response?.data?.length > 0) {
                const sale = response.data[0];

                if (sale.bilStatus === "PAID") {
                    Swal.fire({
                        title: "Already Paid",
                        text: `Bill ${docNo} is already paid.`,
                        icon: "info",
                    });
                    return;
                }
                if (sale.isCancel) {
                    Swal.fire({
                        title: "Cancelled Bill",
                        text: `Bill ${docNo} is cancelled.`,
                        icon: "warning",
                    });
                    return;
                }

                onEdit(sale, true);
            } else {
                Swal.fire({
                    title: "Not Found",
                    text: `Bill number ${docNo} not found.`,
                    icon: "error",
                });
            }
        } catch (error) {
            console.error("Error fetching bill by barcode:", error);
            Swal.fire({
                title: "Error",
                text: "Failed to fetch bill details.",
                icon: "error",
            });
        }
    };






    const isLoadingIndicator =
        isLoading || isFetching




    const totalPages = Math?.ceil((allData?.totalCount || 0) / parseInt(dataPerPage));
    const indexOfFirstItem = 0;
    const indexOfLastItem = Math.min(currentPageNumber * parseInt(dataPerPage), allData?.totalCount || 0);
    const currentItems = allData?.data?.slice(indexOfFirstItem, indexOfLastItem);


    console.log(indexOfFirstItem, 'indexOfFirstItem', currentItems)

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPageNumber(newPage);
        }
    };
    const Pagination = () => {
        // if (totalPages <= 1) return null;

        return (
            <div className="h-10 w-full flex flex-col sm:flex-row justify-between items-center p-2 bg-white border-t border-gray-200 ">
                <div className="text-sm text-gray-600 mb-2 sm:mb-0">
                    Showing {indexOfFirstItem + 1} to {indexOfLastItem} of {allData?.data?.totalCount || 0} entries
                </div>
                <div className="flex gap-1">
                    <button
                        onClick={() => handlePageChange(currentPageNumber - 1)}
                        disabled={currentPageNumber === 1}
                        className={`px-3 py-1 rounded-md ${currentPageNumber === 1
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-white text-gray-600 hover:bg-gray-100'
                            }`}
                    >
                        <FaChevronLeft className="inline" />
                    </button>

                    {Array?.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                            pageNum = i + 1;
                        } else if (currentPageNumber <= 3) {
                            pageNum = i + 1;
                        } else if (currentPageNumber >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                        } else {
                            pageNum = currentPageNumber - 2 + i;
                        }

                        return (
                            <button
                                key={pageNum}
                                onClick={() => handlePageChange(pageNum)}
                                className={`px-3 py-1 rounded-md ${currentPageNumber === pageNum
                                    ? 'bg-indigo-800 text-white'
                                    : 'bg-white text-gray-600 hover:bg-gray-100'
                                    }`}
                            >
                                {pageNum}
                            </button>
                        );
                    })}

                    {totalPages > 5 && currentPageNumber < totalPages - 2 && (
                        <span className="px-3 py-1">...</span>
                    )}

                    {totalPages > 5 && currentPageNumber < totalPages - 2 && (
                        <button
                            onClick={() => handlePageChange(totalPages)}
                            className={`px-3 py-1 rounded-md ${currentPageNumber === totalPages
                                ? 'bg-indigo-800 text-white'
                                : 'bg-white text-gray-600 hover:bg-gray-100'
                                }`}
                        >
                            {totalPages}
                        </button>
                    )}

                    <button
                        onClick={() => handlePageChange(currentPageNumber + 1)}
                        disabled={currentPageNumber === totalPages}
                        className={`px-3 py-1 rounded-md ${currentPageNumber === totalPages
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
        <div className="flex h-full min-h-0 w-full flex-col overflow-hidden">
            <Modal isOpen={thermalPrintOpen} onClose={() => setThermalPrintOpen(false)} widthClass="w-[300pt] h-[95%]">
                <PDFViewer style={{ width: "100%", height: "90vh" }}>
                    {printData?.bilStatus === "UNPAID" ? (
                        <PosDeliveryReceiptPrint
                            docId={printData?.docId}
                            date={printData?.date}
                            items={printData?.items}
                        />
                    ) : (
                        <PosMultiCopyPrint
                            {...printData}
                            branchData={branchList?.data?.find(b => b.id === branchId)}
                            showSummarySlip={printData?.showSummarySlip}
                        />
                    )}
                </PDFViewer>
            </Modal>

            <>
                <div className="flex h-full min-h-0 flex-col rounded-lg bg-[#F1F1F0] shadow-sm">
                    <div className="min-h-0 flex-1 overflow-auto">
                        <table>
                            <thead className="bg-gray-200 text-gray-800 ">
                                <tr className="">

                                    <th className=" px-1 py-1.5  font-bold text-[13px]  text-gray-900  text-center  w-12">
                                        <div className="">S No</div>
                                    </th>

                                    <th className=" px-3  font-bold text-[13px]  text-gray-900  text-center w-48">
                                        <div>Pos No</div>

                                    </th>

                                    <th className=" px-3  font-bold text-[13px]  text-gray-900  text-center w-36">
                                        <div>Pos Date</div>
                                    </th>


                                    <th className="w-48  px-3   font-bold text-[13px] text-gray-900  text-center ">
                                        <div>Bill Status</div>
                                    </th>
                                    {reportsTransactionType != "SALE" && (
                                        <th className="w-48  px-3   font-bold text-[13px] text-gray-900  text-center ">
                                            <div>Return Bill</div>
                                        </th>
                                    )}

                                    <th className="w-64  px-3   font-bold text-[13px] text-gray-900  text-center ">
                                        <div>Customer</div>
                                    </th>
                                    {reportsTransactionType == "SALE" && (
                                        <th className="w-48  px-3   font-bold text-[13px] text-gray-900  text-center ">
                                            <div>Return Bill</div>
                                        </th>
                                    )}
                                    <th className="w-14   px-3  font-bold text-[13px]  text-gray-900  text-center ">
                                        <div>Actions</div>
                                    </th>

                                </tr>
                                <tr className="">
                                    <th className=" px-1  font-bold text-[13px] justify-end  text-gray-900  text-center  w-12">
                                        <button
                                            onClick={() => {
                                                setSerachDocNo("");
                                                setSearchDate("");
                                                setBillStatus("");
                                                setSearchCustomerName("");
                                            }}
                                            className="p-1 text-gray-500 hover:text-indigo-600 transition-colors"
                                            title="Reset Filters"
                                        >
                                            <FiRefreshCw className="h-3.5 w-3.5" />
                                        </button>
                                    </th>

                                    <th className=" px-1 font-bold text-[13px] border  text-gray-900  text-center w-32">
                                        <input
                                            ref={searchInputRef}
                                            type="text"
                                            className="text-black h-5   w-full  px-1 focus:outline-none border  border-gray-400 rounded-md"
                                            placeholder="Search"
                                            value={serachDocNo}
                                            onChange={(e) => {
                                                setSerachDocNo(e.target.value);
                                            }}
                                            onKeyDown={async (e) => {
                                                if (e.key === "Enter") {
                                                    const scannedValue = serachDocNo.trim();
                                                    if (scannedValue && /\/(POS|RE)\//i.test(scannedValue)) {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        await handleScannedBillNo(scannedValue);
                                                    }
                                                }
                                            }}
                                        />
                                    </th>
                                    <th className="  px-1 font-bold text-[13px]  text-gray-900  text-center w-32">
                                        <div className="relative flex items-center">
                                            <input
                                                type="text"
                                                className="text-black h-5 w-full px-1 pr-6 focus:outline-none border border-gray-400 rounded-md"
                                                placeholder="Search"
                                                value={searchDate}
                                                onChange={(e) => {
                                                    setSearchDate(e.target.value);
                                                }}
                                            />
                                            <div className="absolute right-1 cursor-pointer text-gray-500 hover:text-indigo-600">
                                                <input
                                                    type="date"
                                                    className="absolute inset-0 opacity-0 cursor-pointer w-full"
                                                    onChange={(e) => {
                                                        setSearchDate(e.target.value);
                                                    }}
                                                />
                                                <FiCalendar className="h-3 w-3" />
                                            </div>
                                        </div>
                                    </th>
                                    <th className="  px-1 font-bold text-[13px]  text-gray-900  text-center ">
                                        <input
                                            type="text"
                                            className="text-black h-5   w-full   px-1 focus:outline-none border  border-gray-400 rounded-md"
                                            placeholder="Search"
                                            value={billStatus}
                                            onChange={(e) => {
                                                setBillStatus(e.target.value);
                                            }}
                                        />
                                    </th>
                                    {reportsTransactionType != "SALE" && (
                                        <th className="  px-1 font-bold text-[13px]  text-gray-900  text-center ">
                                            <input
                                                type="text"
                                                className="text-black h-5   w-full   px-1 focus:outline-none border  border-gray-400 rounded-md"
                                                placeholder="Search"
                                                value={returnBill}
                                                onChange={(e) => {
                                                    setReturnBill(e.target.value);
                                                }}
                                            />
                                        </th>

                                    )}

                                    <th className="  px-1 font-bold text-[13px]  text-gray-900  text-center ">
                                        <input
                                            type="text"
                                            className="text-black h-5   w-full   px-1 focus:outline-none border  border-gray-400 rounded-md"
                                            placeholder="Search"
                                            value={searchCustomerName}
                                            onChange={(e) => {
                                                setSearchCustomerName(e.target.value);
                                            }}
                                        />
                                    </th>
                                    {reportsTransactionType == "SALE" && (
                                        <th className="  px-1 font-bold text-[13px]  text-gray-900  text-center ">
                                            <input
                                                type="text"
                                                className="text-black h-5   w-full   px-1 focus:outline-none border  border-gray-400 rounded-md"
                                                placeholder="Search"
                                                value={exchangeBill}
                                                onChange={(e) => {
                                                    setExchangeBill(e.target.value);
                                                }}
                                            />
                                        </th>

                                    )}

                                    <th className="w-32 px-1 font-bold text-[13px] text-gray-900 text-center"></th>
                                    {/* <th className="w-14  px-1  font-bold text-[13px]  text-gray-900  text-center "></th> */}

                                </tr>
                            </thead>
                            {isLoadingIndicator ? (
                                <tbody>
                                    <tr>
                                        <td>
                                            <Loader />
                                        </td>
                                    </tr>
                                </tbody>
                            ) : (
                                <tbody className="border-2">
                                    {(currentItems ? currentItems : []).map((dataObj, index) => (
                                        <tr
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") {
                                                    onClick(dataObj.id);
                                                }
                                            }}
                                            tabIndex={0}
                                            key={dataObj.id}
                                            className={`hover:bg-gray-50 transition-colors border-b   border-gray-200 text-[12px] ${index % 2 === 0 ? "bg-white" : "bg-gray-100"
                                                }`}
                                            onClick={() => onClick(dataObj.id)}
                                        >
                                            <td className="text-center " >
                                                {index + 1}
                                            </td>

                                            <td className="py-1.5 text-left">
                                                <div className="flex items-center gap-2">
                                                    {dataObj.docId}

                                                </div>
                                            </td>


                                            <td className="py-1.5 text-left">
                                                {getDateTimeFromDateTimeToDisplay(dataObj.createdAt)}
                                            </td>

                                            <td className="py-1.5 text-left">
                                                {dataObj.isCancel ? (
                                                    <span className="bg-red-50 text-red-500 border border-red-200 px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider shadow-sm">
                                                        🚫 Cancelled
                                                    </span>
                                                ) : dataObj.docId === "DRAFT" && dataObj.approvalStatus === "PENDING" ? (
                                                    <span className="bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider shadow-sm">
                                                        ⏳ Discount Pending
                                                    </span>
                                                ) : dataObj.docId === "DRAFT" && dataObj.approvalStatus === "APPROVED" ? (
                                                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider shadow-sm animate-pulse">
                                                        💸 Ready for Payment
                                                    </span>
                                                ) : dataObj.docId !== "DRAFT" && dataObj.bilStatus === "PAID" ? (
                                                    <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider shadow-sm">
                                                        ✅ Paid
                                                    </span>
                                                ) : dataObj.docId !== "DRAFT" && dataObj.bilStatus === "UNPAID" ? (
                                                    <span className="bg-rose-50 text-rose-700 border border-rose-200 px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider shadow-sm">
                                                        ❌ Unpaid
                                                    </span>
                                                ) : (
                                                    <span className="bg-gray-50 text-gray-500 border border-gray-200 px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider shadow-sm">
                                                        {dataObj.bilStatus || "DRAFT"}
                                                    </span>
                                                )}
                                            </td>

                                            {reportsTransactionType !== "SALE" && (

                                                <td className="py-1.5 text-left">
                                                    {dataObj?.LinkedReturnBill?.docId}
                                                </td>
                                            )}


                                            <td className="py-1.5 text-left">
                                                {`${(dataObj?.Party?.name)?.toUpperCase()}`}
                                            </td>

                                            {reportsTransactionType == "SALE" && (

                                                <td className="py-1.5 text-left">
                                                    {dataObj?.LinkedExchangeBill?.docId}
                                                </td>
                                            )}
                                            {rowActions && (
                                                <td className="border-gray-200 px-2 h-8">
                                                    <div className="flex items-center justify-end gap-1">
                                                        {onView && (
                                                            <button
                                                                className="text-blue-600 flex items-center px-1 bg-blue-50 rounded hover:bg-blue-100 transition-colors"
                                                                onClick={(e) => { e.stopPropagation(); onEdit(dataObj); }}
                                                                title="View"
                                                            >
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                                                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                                                </svg>
                                                            </button>
                                                        )}
                                                        {onEdit && !(dataObj?.Saleorder?.length > 0) && (
                                                            <button
                                                                className="text-green-600 flex items-center px-1 bg-green-50 rounded hover:bg-green-100 transition-colors"
                                                                onClick={(e) => { e.stopPropagation(); onEdit(dataObj); }}
                                                                title="Edit"
                                                            >
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                                                </svg>
                                                            </button>
                                                        )}
                                                        {/* {onDelete && (
                                                            <button
                                                                className="text-red-800 flex items-center px-1 bg-red-50 rounded hover:bg-red-100 transition-colors"
                                                                onClick={(e) => { e.stopPropagation(); onDelete(dataObj.id, dataObj?._count); }}
                                                                title="Delete"
                                                            >
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                                                </svg>
                                                            </button>
                                                        )} */}
                                                        <div className="relative inline-block"
                                                            onMouseEnter={() =>
                                                                setHoveredDeleteId(dataObj.id)
                                                            }
                                                            onMouseLeave={() => setHoveredDeleteId(null)}
                                                        >
                                                            {onDelete && (
                                                                <button
                                                                    className="text-red-800 flex items-center gap-1 px-1 bg-red-50 rounded disabled:opacity-50"
                                                                    onClick={() =>
                                                                        hasPermission(() => onDelete(dataObj.id), "delete", dataObj?._count)
                                                                    }
                                                                    disabled={dataObj?.bilStatus == "PAID" || dataObj?.isBillClosed ? true : false}
                                                                >
                                                                    <svg
                                                                        xmlns="http://www.w3.org/2000/svg"
                                                                        className="h-4 w-4"
                                                                        viewBox="0 0 20 20"
                                                                        fill="currentColor"
                                                                    >
                                                                        <path
                                                                            fillRule="evenodd"
                                                                            d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                                                                            clipRule="evenodd"
                                                                        />
                                                                    </svg>
                                                                </button>
                                                            )}
                                                            {
                                                                (hoveredDeleteId === dataObj.id && (dataObj?.bilStatus == "PAID" || dataObj?.isBillClosed)) && (
                                                                    <div className="absolute left-full top-1/2 transform -translate-y-1/2 ml-2 px-3 py-2 bg-gray-900 text-white text-[12px] rounded shadow-lg w-64 z-50">
                                                                        Cannot delete. Child records exist.

                                                                    </div>
                                                                )}

                                                        </div>
                                                        <button
                                                            className="text-red-600 flex items-center px-1 bg-red-50 rounded hover:bg-red-100 transition-colors"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleCancel(dataObj.id);
                                                            }}
                                                            disabled={dataObj.bilStatus !== "UNPAID"}
                                                            title="Cancel Bill"
                                                        >
                                                            <FiXCircle className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            className="text-orange-600 flex items-center px-1 bg-orange-50 rounded hover:bg-orange-100 transition-colors"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                console.log(dataObj, "dataObj")
                                                                const received = dataObj.PosPayments?.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0) || 0;
                                                                const total = parseFloat(dataObj.netAmount || 0);
                                                                const balance = received - total;

                                                                // 2. Mapping
                                                                setPrintData({
                                                                    docId: dataObj.docId,
                                                                    date: dataObj.createdAt,
                                                                    customerData: dataObj.Party || { name: "Walk-in Customer" },
                                                                    items: dataObj.PosItems || [],
                                                                    payments: {
                                                                        cash: parseFloat(dataObj.PosPayments?.find(p => p.paymentMode === "Cash")?.amount || 0),
                                                                        upi: parseFloat(dataObj.PosPayments?.find(p => p.paymentMode === "UPI")?.amount || 0),
                                                                        card: parseFloat(dataObj.PosPayments?.find(p => p.paymentMode === "Card")?.amount || 0),
                                                                        online: parseFloat(dataObj.PosPayments?.find(p => p.paymentMode === "Online")?.amount || 0)
                                                                    },
                                                                    summary: {
                                                                        subtotal: total + parseFloat(dataObj.discountValue || 0), // (ஒரு தோராய கணக்கு)
                                                                        tax: 0,
                                                                        discount: parseFloat(dataObj.discountValue || 0),
                                                                        total: total,
                                                                        received: received,
                                                                        balance: balance,
                                                                        roundOff: parseFloat(dataObj.roundOff || 0)
                                                                    },
                                                                    branchData: branchList?.data?.find(b => b.id === dataObj.branchId),
                                                                    bilStatus: dataObj.bilStatus,
                                                                    printCopies: 2,
                                                                    showSummarySlip: false
                                                                });

                                                                setThermalPrintOpen(true);
                                                            }}
                                                            title="Thermal Print"
                                                        >
                                                            <FiPrinter className="h-4 w-4" />
                                                        </button>


                                                        {/* {dataObj.isCancel && (
                                                            <span className="text-red-500 text-[10px] font-bold uppercase border border-red-200 px-1 rounded bg-red-50">Canceled</span>
                                                        )} */}
                                                    </div>
                                                </td>
                                            )}

                                        </tr>
                                    ))}

                                </tbody>
                            )}
                        </table>

                    </div>
                    <div className="">
                        <Pagination />
                    </div>

                </div>
            </>

        </div>
    );
};

export default PosReportsNew;
