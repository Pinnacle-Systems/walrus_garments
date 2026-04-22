import React from 'react';
import { motion } from 'framer-motion';
import { Banknote, X, ScanBarcode, CreditCard, CheckCircle2 } from 'lucide-react';

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
    setIsProcessing
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[110] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-[2rem] w-full max-w-md shadow-2xl overflow-hidden"
            >
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                            <Banknote size={20} />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Final Settlement</h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Select payment type & exact amount</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-50 text-slate-400 hover:text-red-500 rounded-lg transition-all"><X size={20} /></button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Amount Summary */}
                    <div className="bg-slate-50 rounded-2xl p-4 flex justify-between items-center border border-slate-100">
                        <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{total < 0 ? "Total Refundable" : "Total Payable"}</span>
                        <span className="text-2xl font-black text-indigo-700 font-serif">₹{Math.abs(total).toLocaleString()}</span>
                    </div>

                    {/* Split Inputs */}
                    <div className="grid grid-cols-1 gap-4">
                        {[
                            { id: 'cash', label: total < 0 ? 'Cash Return' : 'Cash Payment', icon: <Banknote size={14} />, value: paidCash, setter: setPaidCash, color: 'emerald' },
                            { id: 'upi', label: total < 0 ? 'UPI Refund' : 'UPI', icon: <ScanBarcode size={14} />, value: paidUPI, setter: setPaidUPI, color: 'indigo' },
                            { id: 'online', label: total < 0 ? 'Online Refund' : 'Online / Bank Transfer', icon: <ScanBarcode size={14} />, value: paidOnline, setter: setPaidOnline, color: 'indigo' },
                            { id: 'card', label: total < 0 ? 'Card Refund' : 'Card Payment', icon: <CreditCard size={14} />, value: paidCard, setter: setPaidCard, color: 'blue' }
                        ].map((pod) => (
                            <div key={pod.label} className="space-y-2">
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
                                        <span className={`text-${pod.color}-500 opacity-60`}>{pod.icon}</span>
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{pod.label}</span>
                                    </div>
                                    <input
                                        type="number"
                                        className="w-full bg-white border border-slate-200 rounded-xl pl-32 pr-4 py-4 text-sm font-black text-slate-800 outline-none focus:border-indigo-500 focus:shadow-[0_0_15px_rgba(79,70,229,0.05)] text-right transition-all"
                                        value={pod.value}
                                        onChange={(e) => pod.setter(Number(e.target.value))}
                                        onFocus={(e) => e.target.select()}
                                    />
                                </div>

                                {(pod.id === 'upi') && pod.value > 0 && (
                                    <input
                                        type="text"
                                        placeholder={`Enter ${pod.label} Reference No (Optional)`}
                                        className="w-full bg-slate-50 border border-slate-100 rounded-lg px-4 py-2 text-[10px] font-bold text-slate-600 outline-none focus:border-indigo-300 transition-all placeholder:text-slate-300"
                                        value={upiRefNo}
                                        onChange={(e) => setUpiRefNo(e.target.value)}
                                    />
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Balance Calc */}
                    <div className="space-y-3">
                        <div className="flex justify-between items-center text-[10px] font-black text-slate-400 uppercase px-2">
                            <span>{total < 0 ? "Total to Return" : "Sum Received"}</span>
                            <span>₹{receivedAmount?.toLocaleString()}</span>
                        </div>
                        <div className={`p-4 rounded-2xl flex items-center justify-between shadow-lg transition-colors ${receivedAmount >= Math.abs(total) ? 'bg-emerald-600 text-white shadow-emerald-100' : 'bg-slate-100 text-slate-400'}`}>
                            <div className="flex flex-col leading-none">
                                <span className="text-[10px] font-black uppercase opacity-60 mb-1">
                                    {total < 0 ? "Refund Balance" : `Balance to ${receivedAmount >= total ? 'Return' : 'Collect'}`}
                                </span>
                                <span className="text-xl font-black">₹{Math.abs(receivedAmount - Math.abs(total)).toLocaleString()}</span>
                            </div>
                            {receivedAmount >= Math.abs(total) ? <CheckCircle2 size={24} /> : <X size={24} />}
                        </div>
                    </div>
                </div>

                <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-3">
                    <button onClick={onClose} className="flex-1 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-all bg-white border border-slate-200 rounded-2xl">Cancel</button>
                    <button
                        disabled={receivedAmount < Math.abs(total) || isProcessing}
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
                            await handleCheckout();
                            onClose();
                        }}
                        className={`flex-[2] py-4 rounded-2xl flex items-center justify-center gap-3 font-black text-[11px] uppercase tracking-widest transition-all shadow-xl ${receivedAmount < total || isProcessing ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-100'}`}
                    >
                        <CheckCircle2 size={16} />
                        <span>Complete Sale & Print</span>
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default PaymentModal;
