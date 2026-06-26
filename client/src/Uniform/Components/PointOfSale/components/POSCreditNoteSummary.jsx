import React from 'react';
import { CreditCard } from 'lucide-react';

const POSCreditNoteSummary = ({ cart, total, returnTotal, purchaseTotal, totalOfferReversal }) => {
    // Dynamic returns-only tax calculation
    const returnTax = cart.reduce((sum, item) => {
        if (!item.isReturn) return sum;
        const itemTaxPercent = parseFloat(item.taxPercent || item.Hsn?.tax || item.tax || 0);
        const itemValue = (parseFloat(item.price) || 0) * (parseFloat(item.qty) || 0);
        const itemTax = itemValue - (itemValue / (1 + (itemTaxPercent / 100)));
        return sum + itemTax;
    }, 0);

    const itemsReturned = Math.abs(returnTotal);
    const creditSubtotal = Math.max(0, itemsReturned - returnTax);

    return (
        <div className="space-y-2 shrink-0 bg-rose-50/20 border border-rose-100 p-3 rounded-2xl shadow-sm animate-in fade-in duration-200">
            <h3 className="text-[10px] font-black text-rose-500 uppercase tracking-widest flex items-center gap-2">
                <CreditCard size={12} className="text-rose-500" /> Credit Note Summary
            </h3>
            <div className="space-y-2">


                <div className="flex justify-between items-center text-xs font-bold text-rose-600">
                    <span className="text-[11px] uppercase tracking-wider">Items Returned</span>
                    <span>₹{itemsReturned.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>

                {totalOfferReversal > 0 && (
                    <>

                        <div className="flex justify-between items-center text-xs font-bold text-amber-600 bg-amber-50 py-1 rounded-lg border border-amber-100 mt-1 mb-1 animate-in slide-in-from-right-2">
                            <span className="text-[10px] uppercase tracking-wider">Offer Penalty</span>
                            <span>₹{totalOfferReversal.toLocaleString()}</span>
                        </div>
                    </>
                )}
                {purchaseTotal > 0 && (
                    <div className="flex justify-between items-center text-xs font-bold text-slate-600">
                        <span className="text-[11px] uppercase tracking-wider text-slate-400">Items Purchased</span>
                        <span>₹{purchaseTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                )}



                {/* <div className="flex justify-between items-center text-xs font-bold text-slate-600">
                    <span className="text-[11px] uppercase tracking-wider text-slate-400">Credit Subtotal</span>
                    <span>₹{creditSubtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div> */}

                {/* <div className="flex justify-between items-center text-xs font-bold text-slate-600">
                    <span className="text-[11px] uppercase tracking-wider text-slate-400">Tax Credited</span>
                    <span>₹{returnTax.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div> */}

                <div className={`flex justify-between items-center font-black text-lg pt-2.5 border-t mt-2 ${total > 0 ? 'border-amber-200 text-amber-600' : 'border-rose-200 text-rose-600'}`}>
                    <span className={`text-[12px] uppercase tracking-widest ${total > 0 ? 'text-amber-500' : 'text-rose-400'}`}>
                        {total > 0 ? 'Amount Payable' : 'Credit Issued'}
                    </span>
                    <span>₹{Math.abs(total).toLocaleString()}</span>
                </div>
            </div>
        </div>
    );
};

export default POSCreditNoteSummary;
