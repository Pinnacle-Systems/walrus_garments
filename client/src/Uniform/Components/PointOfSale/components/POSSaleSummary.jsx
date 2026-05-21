import React from 'react';
import { ShoppingCart, Gift, Zap } from 'lucide-react';

const POSSaleSummary = ({
    total,
    subtotal,
    totalOfferDiscount,
    appliedOffers,
    discount,
    setDiscount,
    discountRef,
    tax,
    roundOff,
    appliedCredit,
    exchangeSalesNo,
    netPayable,
    isRefund,
    isAdmin,
    isPendingApproval,
    selectedReportSaleId,
    isProcessing,
    cart,
    handleRequestDiscount,
    returnTotal = 0,
    purchaseTotal = 0
}) => {
    return (
        <div className="space-y-2 shrink-0 bg-white border border-slate-100 p-3 rounded-2xl shadow-sm animate-in fade-in duration-200">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <ShoppingCart size={12} /> Sale Summary
            </h3>
            <div className="space-y-2">
                {/* Exchange/Return Breakdown */}
                {returnTotal !== 0 && (
                    <div className="space-y-1 mb-2 pb-2 border-b border-dashed border-slate-100">
                        <div className="flex justify-between items-center text-xs font-bold text-slate-600">
                            <span className="text-[11px] uppercase tracking-wider text-slate-400">New Purchase</span>
                            <span>₹{purchaseTotal.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs font-bold text-rose-500">
                            <span className="text-[11px] uppercase tracking-wider">Return Amount</span>
                            <span>-₹{Math.abs(returnTotal).toLocaleString()}</span>
                        </div>
                    </div>
                )}
                <div className="flex justify-between items-center text-xs font-bold text-slate-600">
                    <span className="text-[11px] uppercase tracking-wider text-slate-400">Gross Total</span>
                    <span>₹{total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>

                <div className="flex justify-between items-center text-xs font-bold text-slate-600">
                    <span className="text-[11px] uppercase tracking-wider text-slate-400">Subtotal (Excl. Tax)</span>
                    <span>₹{subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>

                <div className="flex justify-between items-center text-emerald-500 text-xs font-bold">
                    <span className="text-[11px] uppercase tracking-wider">Manual Disc</span>
                    <div className="flex items-center gap-1">
                        <span>-₹</span>
                        <input
                            ref={discountRef}
                            type="number"
                            value={discount}
                            onChange={(e) => setDiscount(Number(e.target.value))}
                            disabled={!isAdmin || (selectedReportSaleId && !isPendingApproval)}
                            className="w-16 bg-white border border-emerald-200 rounded px-1.5 py-0.5 text-right outline-none text-emerald-600 focus:border-emerald-500 transition-colors disabled:opacity-50"
                            onFocus={(e) => e.target.select()}
                        />
                        {!isAdmin && (
                            <button
                                onClick={() => handleRequestDiscount()}
                                disabled={isProcessing || cart.length === 0 || selectedReportSaleId}
                                className="ml-1 px-2 py-1 bg-amber-100 text-amber-600 rounded-lg text-[9px] font-black uppercase hover:bg-amber-200 transition-colors disabled:opacity-50"
                            >
                                Request
                            </button>
                        )}
                    </div>
                </div>

                {(totalOfferDiscount > 0 || discount > 0) && (
                    <div className="flex justify-between items-center text-xs font-bold bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100">
                        <span className="text-[10px] uppercase tracking-wider text-emerald-500">You Save</span>
                        <span className="text-emerald-600 font-black">₹{(totalOfferDiscount + discount).toLocaleString()}</span>
                    </div>
                )}

                <div className="flex justify-between items-center text-xs font-bold text-slate-600">
                    <span className="text-[11px] uppercase tracking-wider text-slate-400">Tax Amount</span>
                    <span>₹{tax.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                
                <div className="flex justify-between items-center text-xs font-bold text-slate-600">
                    <span className="text-[11px] uppercase tracking-wider text-slate-400">Round Off</span>
                    <span>₹{roundOff.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>

                {appliedCredit > 0 && (
                    <div className="flex justify-between items-center text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg border border-indigo-100 mt-1">
                        <span className="text-[10px] uppercase tracking-wider">
                            Credit Applied {exchangeSalesNo ? `(Ref: ${exchangeSalesNo})` : ''}
                        </span>
                        <span>-₹{appliedCredit.toLocaleString()}</span>
                    </div>
                )}

                <div className={`flex justify-between items-center font-black text-lg pt-2.5 border-t border-slate-200 mt-2 ${isRefund ? 'text-rose-600' : 'text-indigo-700'}`}>
                    <span className={`text-[12px] uppercase tracking-widest ${isRefund ? 'text-rose-400' : 'text-indigo-400'}`}>
                        {isRefund ? 'Refund Amount' : 'Net Payable'}
                    </span>
                    <span>₹{Math.abs(netPayable).toLocaleString()}</span>
                </div>
            </div>
        </div>
    );
};

export default POSSaleSummary;
