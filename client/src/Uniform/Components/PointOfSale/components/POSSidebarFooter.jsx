import React from 'react';
import { ShoppingCart, CreditCard, Printer } from 'lucide-react';

const POSSidebarFooter = ({
    isUnpaidBill,
    isReturnMode,
    isProcessing,
    cart,
    isReportOnly,
    isCancelBill,
    isAdmin,
    isPendingApproval,
    isRefund,
    printData,
    setPrintData,
    handleSaveUnpaid,
    handlePayNow,
    handleSaveAndPrint
}) => {
    // Resolve Dynamic Button Labels with better business names
    const getButtonLabel = () => {
        if (isReportOnly) return "Report View";
        if (isAdmin && isPendingApproval) return "Approve [F8]";

        if (isRefund) {
            return isReturnMode ? "Issue Credit [F8]" : "Issue Credit [F8]";
        }
        if (isReturnMode) return "Save Return [F8]";
        if (isUnpaidBill) return "Complete Payment [F8]";
        return "Pay [F8]";
    };


    // Resolve Dynamic Button Styles & Icons
    const buttonIcon = isRefund ? <CreditCard size={16} /> : (isReturnMode ? <ShoppingCart size={16} /> : <CreditCard size={16} />);
    const buttonColorClass = (isProcessing || cart.length === 0 || isReportOnly)
        ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
        : (isRefund ? 'bg-rose-600 text-white hover:bg-rose-700 active:scale-[0.98] shadow-rose-100' : 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-[0.98] shadow-indigo-100');

    return (
        <div className="p-3 bg-white border-t border-slate-100 space-y-2">
            <div className={`grid ${isUnpaidBill || isReturnMode ? 'grid-cols-1' : 'grid-cols-3'} gap-1.5`}>
                {!isUnpaidBill && !isReturnMode && (
                    <>
                        <button
                            disabled={isProcessing || cart.length === 0 || isReportOnly}
                            onClick={() => handleSaveUnpaid()}
                            className={`py-2 rounded-xl flex items-center justify-center gap-1 font-black text-[9px] uppercase tracking-widest transition-all shadow-lg ${(cart.length === 0 || isProcessing || isReportOnly) ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none' : 'bg-amber-500 text-white hover:bg-amber-600 active:scale-[0.98] shadow-amber-100'}`}
                        >
                            <ShoppingCart size={14} />
                            <span>Save [F9]</span>
                        </button>
                        <button
                            disabled={isProcessing || cart.length === 0 || isReportOnly}
                            onClick={() => handleSaveAndPrint()}
                            className={`py-2 rounded-xl flex items-center justify-center gap-1 font-black text-[9px] uppercase tracking-widest transition-all shadow-lg ${(cart.length === 0 || isProcessing || isReportOnly) ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none' : 'bg-emerald-600 text-white hover:bg-emerald-700 active:scale-[0.98] shadow-emerald-100'}`}
                        >
                            <Printer size={14} />
                            <span>Print [F7]</span>
                        </button>
                    </>
                )}
                <button
                    disabled={isProcessing || cart.length === 0 || isReportOnly || isCancelBill}
                    onClick={() => handlePayNow()}
                    className={`${(isUnpaidBill || isReturnMode) ? 'w-full' : ''} py-2 rounded-xl flex items-center justify-center gap-1 font-black text-[9px] uppercase tracking-widest transition-all shadow-lg ${buttonColorClass}`}
                >
                    {buttonIcon}
                    <span>{getButtonLabel()}</span>
                </button>
            </div>

            {printData && (
                <div className="bg-amber-50 p-2 rounded-xl border border-amber-100 flex items-center justify-between animate-in slide-in-from-bottom-2">
                    <span className="text-[9px] font-black text-amber-600 uppercase ml-2">Receipt Generated</span>
                    <button
                        onClick={() => setPrintData(null)}
                        className="p-1 px-3 bg-white text-amber-600 border border-amber-200 rounded-lg text-[10px] font-black hover:bg-amber-600 hover:text-white transition-all"
                    >
                        CLOSE
                    </button>
                </div>
            )}
        </div>
    );
};

export default POSSidebarFooter;
