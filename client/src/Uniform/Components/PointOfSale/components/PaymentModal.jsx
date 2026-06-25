import React from 'react';
import { motion } from 'framer-motion';
import { Banknote, X, ScanBarcode, CreditCard, CheckCircle2, Info, Coins, Receipt, ArrowRight, UserCheck } from 'lucide-react';
import Swal from 'sweetalert2';

const PaymentModal = ({
    isOpen,
    onClose,
    total,
    paidCash,
    setPaidCash,
    paidUPI,
    setPaidUPI,
    paidOnline,
    setPaidOnline,
    paidCard,
    setPaidCard,
    upiRefNo,
    setUpiRefNo,
    receivedAmount,
    handleCheckout,
    isProcessing,
    checkRefNo,
    isAdmin,
    setIsProcessing,
    availableCredit = 0
}) => {
    if (!isOpen) return null;

    const transactionTotal = parseFloat(total) || 0;
    const customerCredit = parseFloat(availableCredit) || 0;

    const appliedCredit = Math.min(Math.max(0, transactionTotal), customerCredit);
    const netPayableAmount = Math.max(0, transactionTotal - appliedCredit);
    const refundAmount = transactionTotal < 0 ? Math.abs(transactionTotal) : 0;

    const isRefund = refundAmount > 0;
    const absNetPayable = isRefund ? refundAmount : netPayableAmount;


    /* console.log removed */

    // Scenario A: Refund Calculations
    const totalExcessCredit = absNetPayable;
    const instantRefundPaid = receivedAmount;
    const creditRetained = Math.max(0, totalExcessCredit - instantRefundPaid);

    // Disable Settle Logic:
    // Scenario A: Cashier cannot refund more than excess credit.
    // Scenario B: Cashier must collect the exact net payable.
    const isInvalid = isRefund
        ? (instantRefundPaid > totalExcessCredit)
        : (receivedAmount !== absNetPayable);

    return (
        <div className="fixed inset-0 z-[110] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-[2rem] w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col"
            >
                {/* Header */}
                <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div className="flex items-center gap-3">
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${isRefund ? 'bg-amber-50 text-amber-600' : 'bg-indigo-50 text-indigo-600'}`}>
                            {isRefund ? <Coins size={22} /> : <Banknote size={22} />}
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">
                                Invoice Settlement Desk
                            </h3>
                            <p className="text-xs font-extrabold text-slate-500 uppercase tracking-widest">
                                Verify totals, apply store credit, and finalize payment split
                            </p>
                        </div>
                    </div>

                    {/* Dynamic Status Badge */}
                    <div className="flex items-center gap-4">
                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${isRefund
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : absNetPayable === 0
                                ? 'bg-slate-100 text-slate-600 border border-slate-200'
                                : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            }`}>
                            {isRefund ? '🔵 Adjusting Credit' : absNetPayable === 0 ? '⚪ Balanced' : '🟢 Receiving Payment'}
                        </span>
                        <button onClick={onClose} className="p-2 hover:bg-slate-100 text-slate-400 hover:text-red-500 rounded-lg transition-all">
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Horizontal Content Grid */}
                <div className="flex flex-col md:flex-row flex-1">

                    {/* LEFT PANEL: Transaction Summary (40% width) */}
                    <div className="w-full md:w-[38%] bg-slate-50/70 p-8 border-r border-slate-100 flex flex-col justify-between space-y-6">
                        <div className="space-y-5">
                            <h4 className="text-xs font-black text-slate-600 uppercase tracking-widest flex items-center gap-2">
                                <Receipt size={14} /> Transaction Summary
                            </h4>

                            <div className="space-y-3">
                                <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-100">
                                    <span className="text-xs font-black text-slate-600 uppercase tracking-wider">Invoice Amount</span>
                                    <span className="text-lg font-black text-slate-800">₹{Math.abs(total).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                </div>

                                <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-100">
                                    <span className="text-xs font-black text-slate-600 uppercase tracking-wider">Available Store Credit</span>
                                    <span className="text-sm font-black text-slate-800">₹{parseFloat(availableCredit).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                </div>

                                {appliedCredit > 0 && (
                                    <div className="flex justify-between items-center bg-indigo-50/50 p-3 rounded-xl border border-indigo-100 text-indigo-700">
                                        <span className="text-xs font-black uppercase tracking-wider">Store Credit Applied</span>
                                        <span className="text-sm font-black">-₹{appliedCredit.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                    </div>
                                )}
                            </div>

                            <div className="pt-4 border-t border-dashed border-slate-200 flex justify-between items-center">
                                <span className="text-xs font-black text-slate-700 uppercase tracking-wider">
                                    {isRefund ? 'Excess Store Credit' : 'Net Balance to Collect'}
                                </span>
                                <span className={`text-3xl font-black font-serif ${isRefund ? 'text-amber-600' : 'text-indigo-700'}`}>
                                    ₹{absNetPayable.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </span>
                            </div>
                        </div>

                        {/* Status Guided Alerts */}
                        <div className="mt-auto">
                            {isRefund ? (
                                <div className="p-4 bg-amber-50 border border-amber-200/60 rounded-2xl flex gap-3 text-amber-800">
                                    <Info className="flex-shrink-0 mt-0.5" size={16} />
                                    <div className="space-y-1">
                                        <h5 className="text-[10px] font-black uppercase tracking-wider">Excess Credit Action</h5>
                                        <p className="text-[11px] leading-relaxed text-amber-700 font-medium">
                                            Customer has surplus credit. Settle any refund cash/UPI now. Remaining balance is saved under customer's ledger for future visits.
                                        </p>
                                    </div>
                                </div>
                            ) : absNetPayable === 0 ? (
                                <div className="p-4 bg-emerald-50 border border-emerald-200/60 rounded-2xl flex gap-3 text-emerald-800">
                                    <CheckCircle2 className="flex-shrink-0 mt-0.5" size={16} />
                                    <div className="space-y-1">
                                        <h5 className="text-[10px] font-black uppercase tracking-wider">Perfect Match</h5>
                                        <p className="text-[11px] leading-relaxed text-emerald-700 font-medium">
                                            Store credit fully settled the invoice. No extra payment required. Click Complete to finish!
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-4 bg-indigo-50 border border-indigo-200/60 rounded-2xl flex gap-3 text-indigo-800">
                                    <Info className="flex-shrink-0 mt-0.5" size={16} />
                                    <div className="space-y-1">
                                        <h5 className="text-[10px] font-black uppercase tracking-wider">Remaining Balance</h5>
                                        <p className="text-[11px] leading-relaxed text-indigo-700 font-medium">
                                            Store credit fully consumed. Settle the remaining balance on the right using cash, UPI or card.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* RIGHT PANEL: Settle & Mode Inputs (62% width) */}
                    <div className="w-full md:w-[62%] p-8 flex flex-col justify-between space-y-6">
                        <div className="space-y-4">
                            <h4 className="text-xs font-black text-slate-600 uppercase tracking-widest flex items-center gap-2">
                                <UserCheck size={14} /> Payment settlement distribution
                            </h4>

                            {/* Horizontal grid layout for payment mode inputs */}
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { id: 'cash', label: isRefund ? 'Settle Cash Return' : 'Collect Cash', icon: <Banknote size={14} />, value: paidCash, setter: setPaidCash, color: 'emerald' },
                                    { id: 'GPay', label: isRefund ? 'Settle GPay Refund' : 'Collect GPay', icon: <ScanBarcode size={14} />, value: paidUPI, setter: setPaidUPI, color: 'indigo' },
                                    { id: 'online', label: isRefund ? 'Settle Online Refund' : 'Collect Online / Bank', icon: <ScanBarcode size={14} />, value: paidOnline, setter: setPaidOnline, color: 'indigo' },
                                    { id: 'card', label: isRefund ? 'Settle Card Refund' : 'Collect Card', icon: <CreditCard size={14} />, value: paidCard, setter: setPaidCard, color: 'blue' }
                                ].map((pod) => (
                                    <div key={pod.id} className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex flex-col justify-between hover:border-slate-200 transition-all">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-1.5 text-slate-600">
                                                <span className={`text-${pod.color}-600`}>{pod.icon}</span>
                                                <span className="text-xs font-black uppercase tracking-wider">{pod.label}</span>
                                            </div>
                                            {/* Exact Fit Pill Button */}
                                            {!isRefund && absNetPayable > 0 && pod.value === 0 && (
                                                <button
                                                    type="button"
                                                    onClick={() => pod.setter(absNetPayable)}
                                                    className="text-[9px] font-black text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-2 py-0.5 rounded transition-all uppercase"
                                                >
                                                    Full
                                                </button>
                                            )}
                                        </div>
                                        <input
                                            type="number"
                                            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-lg font-black text-slate-900 outline-none focus:border-indigo-500 text-right transition-all"
                                            value={pod.value || ''}
                                            placeholder="0.00"
                                            onChange={(e) => pod.setter(Number(e.target.value))}
                                            onFocus={(e) => e.target.select()}
                                        />
                                    </div>
                                ))}
                            </div>

                            {/* Reference Input for UPI / Online */}
                            {((paidUPI > 0) || (paidOnline > 0)) && (
                                <div className="animate-in slide-in-from-top-1 duration-200">
                                    <label className="text-xs font-black text-slate-600 uppercase tracking-widest mb-1.5 block">
                                        Transaction Reference Number
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Enter Bank / UPI Transaction Reference ID (Optional)"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-extrabold text-slate-800 outline-none focus:border-indigo-500 transition-all placeholder:text-slate-400"
                                        value={upiRefNo}
                                        onChange={(e) => setUpiRefNo(e.target.value)}
                                    />
                                </div>
                            )}
                        </div>

                        {/* Scenario-specific instant distribution summary */}
                        <div className="space-y-3">
                            <div className="flex justify-between items-center text-xs font-black text-slate-600 uppercase px-2">
                                <span>{isRefund ? "Total Refund Entered" : "Total Payment Entered"}</span>
                                <span className={isInvalid ? "text-red-600 font-black" : "text-emerald-700 font-black"}>
                                    ₹{receivedAmount?.toLocaleString(undefined, { minimumFractionDigits: 2 })} / ₹{absNetPayable.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </span>
                            </div>

                            {isRefund ? (
                                <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-2.5">
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="font-black text-slate-500 uppercase tracking-wider">Instant Cashout/Refund:</span>
                                        <span className="font-black text-rose-600 text-sm">₹{instantRefundPaid.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                    </div>
                                    <div className="border-t border-slate-200/80 pt-2 flex justify-between items-center text-xs">
                                        <span className="font-black text-slate-600 uppercase tracking-wider">Save to Account:</span>
                                        <span className="font-black text-emerald-600 text-sm">₹{creditRetained.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                    </div>
                                </div>
                            ) : (
                                <div className={`p-4 rounded-2xl flex items-center justify-between shadow-lg transition-colors ${receivedAmount >= absNetPayable ? 'bg-emerald-600 text-white shadow-emerald-100' : 'bg-slate-100 text-slate-400'
                                    }`}>
                                    <div className="flex flex-col leading-none">
                                        <span className="text-xs font-black uppercase opacity-75 mb-1">
                                            {receivedAmount >= absNetPayable ? 'Change to Return' : 'Balance to Collect'}
                                        </span>
                                        <span className="text-2xl font-black">
                                            ₹{Math.abs(receivedAmount - absNetPayable).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                    {receivedAmount === absNetPayable ? <CheckCircle2 size={24} /> : <X size={24} />}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer Controls */}
                <div className="px-8 py-5 bg-slate-50 border-t border-slate-100 flex gap-4">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3.5 text-[11px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 hover:bg-slate-100 transition-all bg-white border border-slate-200 rounded-2xl"
                    >
                        Cancel (Esc)
                    </button>
                    <button
                        disabled={isInvalid || isProcessing}
                        onClick={async () => {
                            const trimmedRefNo = upiRefNo?.trim();
                            if ((paidUPI > 0 || paidOnline > 0) && trimmedRefNo) {
                                setIsProcessing(true);
                                try {
                                    const checkRes = await checkRefNo(trimmedRefNo).unwrap();
                                    if (checkRes.exists) {
                                        if (!isAdmin) {
                                            Swal.fire({
                                                title: "Reference Already Used",
                                                text: `Transaction ID ${trimmedRefNo} is already recorded in ${checkRes.source}. Only Admins can authorize duplicates.`,
                                                icon: "error"
                                            });
                                            setIsProcessing(false);
                                            return;
                                        } else {
                                            const confirmOverride = await Swal.fire({
                                                title: "Duplicate Reference Detected",
                                                text: `Ref No ${trimmedRefNo} found in ${checkRes.source}. Are you sure you want to authorize this duplicate?`,
                                                icon: "warning",
                                                showCancelButton: true,
                                                confirmButtonText: 'Yes, Authorize',
                                                cancelButtonText: 'No, Cancel'
                                            });
                                            if (!confirmOverride.isConfirmed) {
                                                setIsProcessing(false);
                                                return;
                                            }
                                        }
                                    }
                                } catch (err) {
                                    console.error("Ref Check Error:", err);
                                } finally {
                                    setIsProcessing(false);
                                }
                            }
                            await handleCheckout(null, null, "PAID", "RECEIPTWITHBILL");
                            onClose();
                        }}
                        className={`flex-[2] py-3.5 rounded-2xl flex items-center justify-center gap-3 font-black text-[11px] uppercase tracking-widest transition-all shadow-xl ${isInvalid || isProcessing
                            ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                            : isRefund
                                ? 'bg-amber-600 text-white hover:bg-amber-700 shadow-amber-100'
                                : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-100'
                            }`}
                    >
                        {isRefund ? <CreditCard size={16} /> : <CheckCircle2 size={16} />}
                        <span>{isRefund ? "Complete Settlement & Print" : "Complete Sale & Print"}</span>
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default PaymentModal;
