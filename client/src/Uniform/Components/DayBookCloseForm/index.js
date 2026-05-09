import React, { useState, useEffect, useMemo } from 'react';
import {
    LayoutDashboard,
    ListOrdered,
    Save,
    RefreshCcw,
    ArrowUpRight,
    ArrowDownLeft,
    Wallet,
    CreditCard,
    Smartphone,
    Globe,
    AlertCircle,
    CheckCircle2,
    Calendar as CalendarIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import moment from 'moment';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';
import { getCommonParams } from '../../../Utils/helper';
import {
    useGetDayBookSummaryQuery,
    useSaveDayBookClosingMutation
} from '../../../redux/uniformService/DayBookService';

const DayBookClosingForm = () => {
    const { branchId, userId } = getCommonParams();
    const [selectedDate, setSelectedDate] = useState(moment().format('YYYY-MM-DD'));
    const [remarks, setRemarks] = useState('');

    const { data: summaryResponse, isLoading, isFetching, refetch } = useGetDayBookSummaryQuery({
        date: selectedDate,
        branchId
    });

    const summary = summaryResponse?.data || {};
    const {
        openingBalance = 0,
        posPayments = [],
        bulkPayments = [],
        salesReturns = [],
        paymentAdjustments = [],
        expenses = [],
        isClosed = false,
        closedData = null
    } = summary;

    const combinedSalesList = useMemo(() => {
        const posList = Array.isArray(posPayments) ? posPayments.map(p => ({
            ...p,
            entryType: 'pos',
            time: p.createdAt || p.date,
            type: p.retunBillId ? "Exchange" : "POS Sale",
            // amount: p.amount
        })) : [];

        const bulkList = Array.isArray(bulkPayments) ? bulkPayments.map(p => ({
            ...p,
            entryType: 'bulk',
            time: p.createdAt || p.date,
            type: p.paymentType === "ADVANCE" ? "Advance" : "Bulk Sale",
            amount: p.paidAmount
        })) : [];

        const returnList = Array.isArray(salesReturns) ? salesReturns.map(p => {
            const total = (p.SalesReturnItems || []).reduce((acc, item) =>
                acc + (parseFloat(item.price) * parseFloat(item.qty)), 0);
            return { ...p, entryType: 'return', time: p.createdAt || p.date, amount: total, type: "Return" };
        }) : [];

        // const adjList = Array.isArray(paymentAdjustments) ? paymentAdjustments
        //     .map(p => ({
        //         ...p,
        //         entryType: 'adjustment',
        //         time: p.date,
        //         type: 'Adjustments',
        //         amount: p.adjustmentAmount
        //     })) : [];

        // const expList = Array.isArray(expenses) ? expenses.map(e => ({
        //     ...e,
        //     entryType: 'expense',
        //     time: e.Expense?.date,
        //     type: 'Expense',
        //     amount: e?.amount
        // })) : [];


        return [...posList, ...bulkList, ...returnList]
            .sort((a, b) => new Date(a.time) - new Date(b.time));

    }, [posPayments, bulkPayments, salesReturns, paymentAdjustments, expenses]);

    console.log(combinedSalesList, 'combinedSalesList')

    const combinedExpenseList = useMemo(() => {



        const returnList = Array.isArray(salesReturns) ? salesReturns.map(p => {
            const total = (p.SalesReturnItems || []).reduce((acc, item) =>
                acc + (parseFloat(item.price) * parseFloat(item.qty)), 0);
            return { ...p, entryType: 'return', time: p.createdAt || p.date, amount: total, type: "Return" };
        }) : [];

        const adjList = Array.isArray(paymentAdjustments) ? paymentAdjustments
            .map(p => ({
                ...p,
                entryType: 'adjustment',
                time: p.date,
                type: 'Adjustments',
                amount: p.adjustmentAmount
            })) : [];

        const expList = Array.isArray(expenses) ? expenses.map(e => ({
            ...e,
            entryType: 'expense',
            time: e.Expense?.date,
            type: 'Expense',
            amount: e?.amount
        })) : [];


        return [...returnList, ...adjList, ...expList]
            .sort((a, b) => new Date(a.time) - new Date(b.time));

    }, [posPayments, bulkPayments, salesReturns, paymentAdjustments, expenses]);


    const totals = useMemo(() => {
        let posCash = 0, posUpi = 0, posCard = 0, posOnline = 0;


        posPayments.forEach(p => {
            const mode = (p.paymentMode || "").toLowerCase();
            const amt = parseFloat(p.amount) || 0;
            if (mode.includes('cash')) posCash += amt;
            else if (mode.includes('upi')) posUpi += amt;
            else if (mode.includes('card')) posCard += amt;
            else if (mode.includes('online')) posOnline += amt;
        });

        let bulkCash = 0, bulkUpi = 0, bulkCard = 0, bulkOnline = 0;
        let totalAdvances = 0;
        let totalBulkSales = 0;
        bulkPayments.forEach(p => {
            const mode = (p.paymentMode || "").toLowerCase();
            const amt = parseFloat(p.paidAmount) || 0;

            if (p.paymentType === "ADVANCE") {
                totalAdvances += amt;
            } else {
                totalBulkSales += amt;
            }

            if (mode.includes('cash')) bulkCash += amt;
            else if (mode.includes('upi')) bulkUpi += amt;
            else if (mode.includes('card')) bulkCard += amt;
            else if (mode.includes('online')) bulkOnline += amt;
        });

        let adjCashIn = 0, adjUpi = 0, adjCard = 0, adjOnline = 0;
        let adjCashOut = 0
        let adjUpiOut = 0
        let adjCardOut = 0
        let adjOnlineOut = 0;
        paymentAdjustments.forEach(adj => {
            const amt = parseFloat(adj.adjustmentAmount) || 0;
            const mode = (adj.paymentMode || "").toLowerCase();
            if (adj.adjustmentType === 'PLUS') {
                if (mode.includes('cash')) adjCashIn += amt;
                else if (mode.includes('upi')) adjUpi += amt;
                else if (mode.includes('card')) adjCard += amt;
                else if (mode.includes('online')) adjOnline += amt;
            } else {
                if (mode.includes('cash')) adjCashOut += amt;
                else if (mode.includes('upi')) adjUpiOut += amt;
                else if (mode.includes('card')) adjCardOut += amt;
                else if (mode.includes('online')) adjOnlineOut += amt;
            }
        });

        let expense = 0;
        expenses.forEach(e => {
            expense += parseFloat(e.amount) || 0;

        });

        let cashReturns = 0;
        salesReturns.forEach(sr => {
            if ((sr.refundType || "").toLowerCase() === 'cash') {
                const total = (sr.SalesReturnItems || []).reduce((acc, item) => acc + (parseFloat(item.price) * parseFloat(item.qty)), 0);
                cashReturns += total;
            }
        });

        console.log({
            posCash,
            posUpi,
            posCard,
            posOnline,
            expense
        })

        const totalCashIn = posCash + bulkCash + adjCashIn;
        const totalUpi = posUpi + bulkUpi + adjUpi;
        const totalCard = posCard + bulkCard + adjCard;
        const totalOnline = posOnline + bulkOnline + adjOnline;


        const totalPosSales = posCash + posUpi + posCard + posOnline;


        const ajustAmountIn = adjCashIn + adjUpi + adjCard + adjOnline;
        const ajustAmountOut = adjCashOut + adjUpiOut + adjCardOut + adjOnlineOut;



        const netBalance = (totalPosSales + totalBulkSales + totalAdvances + ajustAmountIn) - (expense + ajustAmountOut + cashReturns);

        const closingBalance = openingBalance + netBalance

        return {
            posCash, bulkCash, adjCashIn, totalCashIn,
            totalUpi, totalCard, totalOnline,
            totalPosSales, totalBulkSales, totalAdvances,
            expense, adjCashOut, cashReturns, closingBalance, netBalance,
            ajustAmountIn, ajustAmountOut
        };
    }, [posPayments, bulkPayments, paymentAdjustments, expenses, openingBalance]);

    useEffect(() => {
        if (isClosed && closedData) {
            setRemarks(closedData.remarks || '');
        } else {
            setRemarks('');
        }
    }, [isClosed, closedData]);

    if (isLoading) return <div className="flex items-center justify-center h-full">Loading Summary...</div>;

    return (
        <div className="p-4 bg-gray-50 min-h-screen font-sans">
            {/* Header - COMPACT */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-2">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white shrink-0">
                        <Wallet size={20} />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900 leading-tight">Day Book Report</h1>
                        <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Daily Transaction & Balance</p>
                    </div>
                </div>

                <div className="flex items-center gap-2 bg-white p-1.5 rounded-lg shadow-sm border">
                    <div className="flex items-center gap-2 px-2 border-r">
                        <CalendarIcon size={14} className="text-gray-400" />
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="border-none focus:ring-0 text-xs font-bold p-0 bg-transparent"
                        />
                    </div>
                    <button
                        onClick={() => refetch()}
                        className="p-1 hover:bg-gray-100 rounded-md transition-colors text-indigo-600"
                        title="Refresh Data"
                    >
                        <RefreshCcw size={16} className={isFetching ? 'animate-spin' : ''} />
                    </button>
                </div>
            </div>

            {/* Dashboard Content - SCROLLABLE CONTAINER */}
            <div className="h-[calc(100vh-10rem)] overflow-y-auto pr-2 custom-scrollbar space-y-4">
                {/* 1. High Level Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <SummaryCard
                        title="Opening Balance"
                        value={openingBalance}
                        icon={<ArrowUpRight size={24} />}
                        color="green"
                    />
                    <SummaryCard
                        title="Total Collection"
                        value={totals.totalPosSales + totals.totalBulkSales + totals.totalAdvances}
                        icon={<ArrowUpRight size={24} />}
                        color="green"
                    />

                    <SummaryCard
                        title="Total Expenses"
                        value={totals.expense}
                        icon={<ArrowDownLeft size={24} />}
                        color="red"
                    />

                    <SummaryCard
                        title="Adjustment Amount"
                        value={totals.ajustAmountIn - totals.ajustAmountOut}
                        subValueIn={totals.ajustAmountIn}
                        subValueOut={totals.ajustAmountOut}
                        icon={<ArrowUpRight size={24} />}
                        color="blue"
                    />
                    <SummaryCard
                        title="Closing Balance"
                        value={totals.closingBalance}
                        icon={<AlertCircle size={24} />}
                        color="indigo"
                        highlight
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="bg-white rounded-xl shadow-sm border p-4">
                        <div className="flex items-center justify-between border-b pb-2 mb-3">
                            <h3 className="text-sm font-bold text-gray-900">Sales Summary</h3>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">By Channel</span>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                            <div className="p-3 bg-indigo-50 rounded-lg flex justify-between items-center">
                                <p className="text-[11px] font-bold text-indigo-400 uppercase">POS</p>
                                <p className="text-sm font-bold text-indigo-700">₹{totals.totalPosSales.toLocaleString()}</p>
                            </div>
                            <div className="p-3 bg-blue-50 rounded-lg flex justify-between items-center">
                                <p className="text-[11px] font-bold text-blue-400 uppercase">Bulk</p>
                                <p className="text-sm font-bold text-blue-700">₹{totals.totalBulkSales.toLocaleString()}</p>
                            </div>
                            <div className="p-3 bg-emerald-50 rounded-lg flex justify-between items-center">
                                <p className="text-[11px] font-bold text-emerald-400 uppercase">Advance</p>
                                <p className="text-sm font-bold text-emerald-700">₹{totals.totalAdvances.toLocaleString()}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border p-4">
                        <div className="flex items-center justify-between border-b pb-2 mb-3">
                            <h3 className="text-sm font-bold text-gray-900">Payment Breakdown</h3>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">By Mode</span>
                        </div>
                        <div className="grid grid-cols-4 gap-2">
                            <div className="text-center p-1.5 bg-gray-50 rounded-lg">
                                <p className="text-[9px] font-bold text-gray-400 uppercase">Cash</p>
                                <p className="text-xs font-bold text-green-600">₹{(totals.posCash + totals.bulkCash + totals.adjCashIn).toLocaleString()}</p>
                            </div>
                            <div className="text-center p-1.5 bg-gray-50 rounded-lg">
                                <p className="text-[9px] font-bold text-gray-400 uppercase">UPI</p>
                                <p className="text-xs font-bold text-purple-600">₹{totals.totalUpi.toLocaleString()}</p>
                            </div>
                            <div className="text-center p-1.5 bg-gray-50 rounded-lg">
                                <p className="text-[9px] font-bold text-gray-400 uppercase">Card</p>
                                <p className="text-xs font-bold text-orange-600">₹{totals.totalCard.toLocaleString()}</p>
                            </div>
                            <div className="text-center p-1.5 bg-gray-50 rounded-lg">
                                <p className="text-[9px] font-bold text-gray-400 uppercase">Online</p>
                                <p className="text-xs font-bold text-teal-600">₹{totals.totalOnline.toLocaleString()}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-4 grid grid-cols-2 gap-4">
                    <TransactionTable title="Pay In" data={combinedSalesList} type="combined" />
                    <TransactionTable title="Pay Out" data={combinedExpenseList} type="combined" />



                </div>

                {remarks && (
                    <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6">
                        <h3 className="text-sm font-bold text-indigo-900 uppercase tracking-widest mb-2">Closing Remarks</h3>
                        <p className="text-indigo-700 italic">"{remarks}"</p>
                    </div>
                )}
            </div>


            <style dangerouslySetInnerHTML={{
                __html: `
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: #f1f1f1; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
            `}} />
        </div>
    );
};

const SummaryCard = ({ title, value, icon, color, highlight = false, subValueIn, subValueOut }) => {
    const colors = {
        blue: 'bg-blue-50 text-blue-600 border-blue-100',
        green: 'bg-green-50 text-green-600 border-green-100',
        red: 'bg-red-50 text-red-600 border-red-100',
        indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    };

    return (
        <div className={`p-3 rounded-xl border shadow-sm ${highlight ? 'bg-white border-indigo-200 ring-2 ring-indigo-50' : 'bg-white'}`}>
            <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${colors[color]}`}>
                    {React.cloneElement(icon, { size: 20 })}
                </div>
                <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{title}</p>
                    <p className="text-lg font-bold text-gray-900 leading-tight">₹{parseFloat(value || 0).toLocaleString()}</p>
                    {(subValueIn !== undefined || subValueOut !== undefined) && (
                        <div className="flex gap-2 mt-0.5">
                            {subValueIn !== undefined && (
                                <span className="text-[9px] font-bold text-green-600 bg-green-50 px-1 rounded">In: ₹{parseFloat(subValueIn).toLocaleString()}</span>
                            )}
                            {subValueOut !== undefined && (
                                <span className="text-[9px] font-bold text-red-600 bg-red-50 px-1 rounded">Out: ₹{parseFloat(subValueOut).toLocaleString()}</span>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};



const TransactionTable = ({ title, data }) => {
    if (!data || data.length === 0) {
        return (
            <div className="bg-white rounded-xl shadow-sm border p-4 text-center text-gray-500">
                <p className="text-sm font-medium">No {title} found for this date.</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="px-4 py-2 border-b bg-gray-50/50 flex justify-between items-center">
                <h3 className="text-sm font-bold text-gray-900">{title}</h3>
                <span className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-bold">
                    Total: ₹{data.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0).toLocaleString()}
                </span>
            </div>
            <div className="overflow-x-auto max-h-[400px] overflow-y-auto custom-scrollbar">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 text-gray-400 text-[10px] font-bold uppercase tracking-widest border-b sticky top-0 z-10">
                        <tr>
                            <th className="px-4 py-2">Doc No</th>
                            <th className="px-4 py-2">Customer / Category</th>
                            <th className="px-4 py-2">Time</th>
                            <th className="px-4 py-2">Mode</th>
                            <th className="px-4 py-2">Type</th>

                            <th className="px-4 py-2 text-right">Amount</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y text-[11px]">
                        {data.map((item, idx) => (
                            <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                <td className="px-4 py-2 font-bold text-indigo-600">
                                    {item.entryType === 'pos' ? item.Pos?.docId :
                                        item.entryType === 'bulk' ? item.docId :
                                            item.entryType === 'return' ? item.docId :
                                                item.entryType === 'adjustment' ? item.docId :
                                                    item.entryType === 'adjustment_out' ? item.docId :
                                                        item.entryType === 'expense' ? item.Expense?.docId : item.docId}
                                </td>
                                <td className="px-4 py-2 text-gray-600">
                                    {item.entryType === 'pos' ? (item.Pos?.Party?.name || 'Walk-in') :
                                        item.entryType === 'bulk' ? (item.Party?.name || '-') :
                                            item.entryType === 'return' ? (item.Party?.name || 'Return') :
                                                item.entryType === 'adjustment' ? (item.reason || 'Adjustment') :
                                                    item.entryType === 'adjustment_out' ? (item.reason || 'Payout') :
                                                        item.entryType === 'expense' ? (item.ExpenseCategory?.name || 'Expense') : '-'}
                                </td>
                                <td className="px-4 py-2 text-gray-500 font-mono">
                                    {moment(item.time || item.createdAt || item.date).format('hh:mm A')}
                                </td>
                                <td className="px-4 py-2">
                                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${(item.paymentMode || item.paymentMethod || "").toLowerCase().includes('cash') ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                                        }`}>
                                        {item.paymentMode || item.paymentMethod}
                                    </span>
                                </td>

                                <td className="px-4 py-2 text-left font-bold text-gray-900">
                                    {item?.type}
                                </td>
                                <td className="px-4 py-2 text-right font-bold text-gray-900">
                                    ₹{parseFloat(item.amount || item.paidAmount || item.adjustmentAmount || 0).toLocaleString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default DayBookClosingForm;
