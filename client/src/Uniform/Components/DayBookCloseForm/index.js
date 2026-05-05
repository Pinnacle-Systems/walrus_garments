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
    const [viewMode, setViewMode] = useState('summary'); // 'summary' or 'transactions'
    const [physicalDenominations, setPhysicalDenominations] = useState({
        '2000': 0, '500': 0, '200': 0, '100': 0, '50': 0, '20': 0, '10': 0, '5': 0, '2': 0, '1': 0
    });
    const [remarks, setRemarks] = useState('');

    const { data: summaryResponse, isLoading, isFetching, refetch } = useGetDayBookSummaryQuery({
        date: selectedDate,
        branchId
    });

    const [saveClosing, { isLoading: isSaving }] = useSaveDayBookClosingMutation();

    const summary = summaryResponse?.data || {};
    const { openingBalance = 0, posPayments = [], bulkPayments = [], expenses = [], isClosed = false, closedData = null } = summary;

    // Calculations
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
        bulkPayments.forEach(p => {
            const mode = (p.paymentMode || "").toLowerCase();
            const amt = parseFloat(p.paidAmount) || 0;
            if (mode.includes('cash')) bulkCash += amt;
            else if (mode.includes('upi')) bulkUpi += amt;
            else if (mode.includes('card')) bulkCard += amt;
            else if (mode.includes('online')) bulkOnline += amt;
        });

        let cashExp = 0;
        expenses.forEach(e => {
            if ((e.paymentMethod || "").toLowerCase().includes('cash')) {
                cashExp += parseFloat(e.amount) || 0;
            }
        });

        const totalCashIn = posCash + bulkCash;
        const totalUpi = posUpi + bulkUpi;
        const totalCard = posCard + bulkCard;
        const totalOnline = posOnline + bulkOnline;

        const totalPosSales = posCash + posUpi + posCard + posOnline;
        const totalBulkSales = bulkCash + bulkUpi + bulkCard + bulkOnline;

        const expectedCash = openingBalance + totalCashIn - cashExp;

        return {
            posCash, bulkCash, totalCashIn,
            totalUpi, totalCard, totalOnline,
            totalPosSales, totalBulkSales,
            cashExp, expectedCash
        };
    }, [posPayments, bulkPayments, expenses, openingBalance]);

    const physicalTotal = useMemo(() => {
        return Object.entries(physicalDenominations).reduce((sum, [denom, count]) => {
            return sum + (parseInt(denom) * (parseInt(count) || 0));
        }, 0);
    }, [physicalDenominations]);

    const difference = physicalTotal - totals.expectedCash;

    useEffect(() => {
        if (isClosed && closedData) {
            setRemarks(closedData.remarks || '');
            if (closedData.denominations) {
                try {
                    const denoms = typeof closedData.denominations === 'string' 
                        ? JSON.parse(closedData.denominations) 
                        : closedData.denominations;
                    setPhysicalDenominations(denoms);
                } catch (e) { console.error("Error parsing denominations", e); }
            }
        } else {
            setRemarks('');
            setPhysicalDenominations({
                '2000': 0, '500': 0, '200': 0, '100': 0, '50': 0, '20': 0, '10': 0, '5': 0, '2': 0, '1': 0
            });
        }
    }, [isClosed, closedData]);

    const handleDenominationChange = (denom, value) => {
        if (isClosed) return;
        setPhysicalDenominations(prev => ({ ...prev, [denom]: value }));
    };

    const handleCloseDay = async () => {
        if (isClosed) return;

        const result = await Swal.fire({
            title: 'Close Day?',
            text: `Are you sure you want to close accounts for ${moment(selectedDate).format('DD-MM-YYYY')}? This action cannot be undone.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#4f46e5',
            confirmButtonText: 'Yes, Close Day'
        });

        if (result.isConfirmed) {
            try {
                await saveClosing({
                    date: selectedDate,
                    branchId,
                    openingBalance,
                    posCashSales: totals.posCash,
                    bulkCashSales: totals.bulkCash,
                    otherReceipts: 0,
                    cashExpenses: totals.cashExp,
                    otherPayments: 0,
                    expectedCash: totals.expectedCash,
                    physicalCash: physicalTotal,
                    difference,
                    totalUpi: totals.totalUpi,
                    totalCard: totals.totalCard,
                    totalOnline: totals.totalOnline,
                    denominations: physicalDenominations,
                    remarks,
                    closedById: userId
                }).unwrap();
                Swal.fire('Closed!', 'Day Book has been closed successfully.', 'success');
                refetch();
            } catch (err) {
                Swal.fire('Error', err.data?.message || 'Failed to close Day Book', 'error');
            }
        }
    };

    if (isLoading) return <div className="flex items-center justify-center h-full">Loading Summary...</div>;

    return (
        <div className="p-6 bg-gray-50 min-h-screen font-sans">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <Wallet className="text-indigo-600" size={32} />
                        Day Book Closing
                    </h1>
                    <p className="text-gray-500 mt-1">Manage and finalize your daily accounts</p>
                </div>

                <div className="flex items-center gap-4 bg-white p-2 rounded-xl shadow-sm border">
                    <div className="flex items-center gap-2 px-3 border-r">
                        <CalendarIcon size={18} className="text-gray-400" />
                        <input 
                            type="date" 
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="border-none focus:ring-0 text-sm font-medium"
                        />
                    </div>
                    <button 
                        onClick={() => refetch()}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-indigo-600"
                        title="Refresh Data"
                    >
                        <RefreshCcw size={20} className={isFetching ? 'animate-spin' : ''} />
                    </button>
                </div>
            </div>

            {/* Status Banner */}
            {isClosed && (
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-xl mb-6 flex items-center gap-3"
                >
                    <CheckCircle2 className="text-green-600" />
                    <div>
                        <span className="font-bold">Day Closed!</span> This day's account was finalized by {closedData.closedBy?.username || 'User'} at {moment(closedData.createdAt).format('hh:mm A')}.
                    </div>
                </motion.div>
            )}

            {/* View Toggle */}
            <div className="flex p-1 bg-gray-200 rounded-xl w-fit mb-8 shadow-inner">
                <button 
                    onClick={() => setViewMode('summary')}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${viewMode === 'summary' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                >
                    <LayoutDashboard size={18} />
                    Summary View
                </button>
                <button 
                    onClick={() => setViewMode('transactions')}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${viewMode === 'transactions' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                >
                    <ListOrdered size={18} />
                    Transaction List
                </button>
            </div>

            <AnimatePresence mode="wait">
                {viewMode === 'summary' ? (
                    <motion.div 
                        key="summary"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="grid grid-cols-1 lg:grid-cols-12 gap-8"
                    >
                        {/* Financial Cards */}
                        <div className="lg:col-span-8 space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <SummaryCard title="Opening Balance" value={openingBalance} icon={<Wallet size={24} />} color="blue" />
                                <SummaryCard title="Cash In (Sales)" value={totals.totalCashIn} icon={<ArrowUpRight size={24} />} color="green" />
                                <SummaryCard title="Cash Out (Expenses)" value={totals.cashExp} icon={<ArrowDownLeft size={24} />} color="red" />
                                <SummaryCard title="Expected Cash" value={totals.expectedCash} icon={<AlertCircle size={24} />} color="indigo" highlight />
                            </div>

                            {/* Additional Sales Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-white p-5 rounded-2xl border shadow-sm flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center">
                                            <Save size={20} />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total POS Sales</p>
                                            <p className="text-xl font-bold text-gray-900">₹{totals.totalPosSales.toLocaleString()}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] text-gray-400 font-bold uppercase">Incl. Digital</p>
                                    </div>
                                </div>
                                <div className="bg-white p-5 rounded-2xl border shadow-sm flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                                            <ListOrdered size={20} />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Bulk Sales</p>
                                            <p className="text-xl font-bold text-gray-900">₹{totals.totalBulkSales.toLocaleString()}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] text-gray-400 font-bold uppercase">Incl. Digital</p>
                                    </div>
                                </div>
                            </div>

                            {/* Payment Mode Breakdown */}
                            <div className="bg-white rounded-2xl shadow-sm border p-6">
                                <h3 className="text-lg font-bold text-gray-900 mb-6">Payment Mode Summary</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <PaymentModeStat label="UPI Payments" value={totals.totalUpi} icon={<Smartphone size={20} />} color="purple" />
                                    <PaymentModeStat label="Card Payments" value={totals.totalCard} icon={<CreditCard size={20} />} color="orange" />
                                    <PaymentModeStat label="Online Transfer" value={totals.totalOnline} icon={<Globe size={20} />} color="teal" />
                                </div>
                            </div>

                            {/* Remarks */}
                            <div className="bg-white rounded-2xl shadow-sm border p-6">
                                <h3 className="text-lg font-bold text-gray-900 mb-4">Closing Remarks</h3>
                                <textarea 
                                    value={remarks}
                                    onChange={(e) => setRemarks(e.target.value)}
                                    disabled={isClosed}
                                    placeholder="Enter any notes or observations for the day..."
                                    className="w-full h-32 p-4 rounded-xl border focus:ring-2 focus:ring-indigo-500 bg-gray-50 disabled:bg-gray-100 transition-all outline-none text-gray-700"
                                />
                            </div>
                        </div>

                        {/* Denominations & Closing Action */}
                        <div className="lg:col-span-4 space-y-8">
                            <div className="bg-white rounded-2xl shadow-sm border p-6 overflow-hidden">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-lg font-bold text-gray-900">Physical Cash</h3>
                                    <div className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-bold uppercase tracking-wider">Verification</div>
                                </div>
                                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                                    {Object.keys(physicalDenominations).sort((a, b) => b - a).map(denom => (
                                        <div key={denom} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <span className="w-10 text-right font-bold text-gray-600">₹{denom}</span>
                                                <span className="text-gray-400">×</span>
                                                <input 
                                                    type="number" 
                                                    min="0"
                                                    value={physicalDenominations[denom]}
                                                    onChange={(e) => handleDenominationChange(denom, e.target.value)}
                                                    disabled={isClosed}
                                                    className="w-20 p-1.5 border rounded-lg text-center font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                                                />
                                            </div>
                                            <span className="font-mono text-gray-700">₹{(parseInt(denom) * (parseInt(physicalDenominations[denom]) || 0)).toLocaleString()}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-6 pt-6 border-t space-y-4">
                                    <div className="flex items-center justify-between text-gray-500">
                                        <span>Total Physical Cash</span>
                                        <span className="font-bold text-gray-900 text-xl">₹{physicalTotal.toLocaleString()}</span>
                                    </div>
                                    <div className={`flex items-center justify-between p-4 rounded-xl ${difference >= 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                        <span className="font-bold">Difference</span>
                                        <span className="font-bold text-xl">₹{difference.toLocaleString()}</span>
                                    </div>
                                    <button 
                                        onClick={handleCloseDay}
                                        disabled={isClosed || isSaving}
                                        className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg transition-all transform hover:scale-[1.02] active:scale-95 ${isClosed ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200'}`}
                                    >
                                        <Save size={20} />
                                        {isSaving ? 'Processing...' : isClosed ? 'Day Closed' : 'Finalize & Close Day'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div 
                        key="transactions"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-8"
                    >
                        {/* POS Transactions Table */}
                        <TransactionTable title="POS Sales Transactions" data={posPayments} type="pos" />
                        
                        {/* Bulk Sales Transactions Table */}
                        <TransactionTable title="Bulk Sales & Other Payments" data={bulkPayments} type="bulk" />
                        
                        {/* Expense Transactions Table */}
                        <TransactionTable title="Daily Expenses" data={expenses} type="expense" />
                    </motion.div>
                )}
            </AnimatePresence>

            <style dangerouslySetInnerHTML={{ __html: `
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: #f1f1f1; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
            `}} />
        </div>
    );
};

const SummaryCard = ({ title, value, icon, color, highlight = false }) => {
    const colors = {
        blue: 'bg-blue-50 text-blue-600 border-blue-100',
        green: 'bg-green-50 text-green-600 border-green-100',
        red: 'bg-red-50 text-red-600 border-red-100',
        indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    };

    return (
        <div className={`p-6 rounded-2xl border shadow-sm ${highlight ? 'bg-white border-indigo-200 ring-2 ring-indigo-50' : 'bg-white'}`}>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${colors[color]}`}>
                {icon}
            </div>
            <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
            <p className="text-2xl font-bold text-gray-900">₹{parseFloat(value).toLocaleString()}</p>
        </div>
    );
};

const PaymentModeStat = ({ label, value, icon, color }) => {
    const colorClasses = {
        purple: 'text-purple-600 bg-purple-50',
        orange: 'text-orange-600 bg-orange-50',
        teal: 'text-teal-600 bg-teal-50',
    };

    return (
        <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClasses[color]}`}>
                {icon}
            </div>
            <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{label}</p>
                <p className="text-lg font-bold text-gray-900">₹{parseFloat(value).toLocaleString()}</p>
            </div>
        </div>
    );
};

const TransactionTable = ({ title, data, type }) => {
    if (!data || data.length === 0) {
        return (
            <div className="bg-white rounded-2xl shadow-sm border p-8 text-center text-gray-500">
                <p className="text-lg font-medium">No {title} found for this date.</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
            <div className="p-6 border-b bg-gray-50/50">
                <h3 className="text-lg font-bold text-gray-900">{title}</h3>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 text-gray-400 text-xs font-bold uppercase tracking-widest border-b">
                        <tr>
                            <th className="px-6 py-4">Doc No</th>
                            <th className="px-6 py-4">Customer / Category</th>
                            <th className="px-6 py-4">Time</th>
                            <th className="px-6 py-4">Mode</th>
                            <th className="px-6 py-4 text-right">Amount</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y text-sm">
                        {data.map((item, idx) => (
                            <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 font-bold text-indigo-600">
                                    {type === 'pos' ? item.Pos?.docId : (type === 'bulk' ? item.docId : item.Expense?.docId)}
                                </td>
                                <td className="px-6 py-4 text-gray-600">
                                    {type === 'pos' ? (item.Pos?.Party?.name || 'Walk-in') : (type === 'bulk' ? (item.Party?.name || '-') : (item.ExpenseCategory?.name || 'Expense'))}
                                </td>
                                <td className="px-6 py-4 text-gray-500 font-mono">
                                    {moment(item.createdAt || item.date).format('hh:mm A')}
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                                        (item.paymentMode || item.paymentMethod || "").toLowerCase().includes('cash') ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                                    }`}>
                                        {item.paymentMode || item.paymentMethod}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right font-bold text-gray-900">
                                    ₹{parseFloat(item.amount || item.paidAmount || 0).toLocaleString()}
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
