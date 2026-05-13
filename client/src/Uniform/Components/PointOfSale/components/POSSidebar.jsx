import React from 'react';
import { User, ShoppingCart, Gift, Zap, CreditCard } from 'lucide-react';
import Select from 'react-select';

const POSSidebar = ({
    isGuestCustomer,
    guestMobile,
    handleCustomerMobileChange,
    guestName,
    setGuestName,
    subtotal,
    totalOfferDiscount,
    appliedOffers,
    discount,
    setDiscount,
    discountRef,
    tax,
    roundOff,
    total,
    isProcessing,
    cart,
    handlePayNow,
    printData,
    setPrintData,
    returnTotal = 0,
    purchaseTotal = 0,
    selectedReportSaleId,
    isAdmin,
    handleRequestDiscount,
    handleSaveUnpaid,
    approvalStatus,
    currentBilStatus,
    transactionType,
    exchangeSalesNo,
    availableCredit = 0,
    availableReturnBills = [],
    selectedReturnBills = [],
    setSelectedReturnBills,
}) => {
    const netPayable = (parseFloat(total) - parseFloat(availableCredit));
    const isRefund = netPayable < 0;
    const isPendingApproval = approvalStatus === 'PENDING';
    const isUnpaidBill = currentBilStatus === 'UNPAID';
    const isReturnMode = transactionType === 'RETURN';
    const isReportOnly = selectedReportSaleId && !(isAdmin && isPendingApproval) && !isUnpaidBill;

    const appliedCredit = Math.min(Math.max(0, total), availableCredit);

    console.log(appliedCredit, "appliedCredit")
    console.log((parseFloat(total) - parseFloat(availableCredit)), "availableCredit", availableCredit)

    return (
        <aside className="w-[340px] border-l border-slate-200 bg-white flex flex-col shadow-2xl relative z-10 overflow-hidden h-full">
            <div className="flex-1 flex flex-col p-4 gap-4 overflow-hidden">
                {/* Module 1: Direct Customer Entry */}
                <div className="space-y-2 shrink-0 relative bg-white border border-slate-100 p-3 rounded-2xl shadow-sm overflow-hidden">
                    <div className="flex justify-between items-center">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <User size={12} /> Customer Identification
                        </h3>
                        {!isGuestCustomer && (
                            <span className="bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-tighter">Registered</span>
                        )}
                    </div>

                    <div className="space-y-2">
                        <div className="relative group">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 flex items-center gap-1.5 pointer-events-none group-focus-within:text-indigo-500">
                                <span className="text-[10px] font-black uppercase">🇮🇳 +91</span>
                            </div>
                            <input
                                type="text"
                                placeholder="Mobile (10 Digits)"
                                value={guestMobile}
                                onChange={(e) => handleCustomerMobileChange(e.target.value)}
                                disabled={selectedReportSaleId}
                                className="w-full pl-16 pr-3 py-1.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-black text-slate-800 outline-none focus:bg-white focus:border-indigo-400 focus:shadow-[0_0_15px_rgba(79,70,229,0.05)] transition-all font-mono disabled:opacity-50"
                            />
                        </div>

                        <div className="relative group">
                            <input
                                type="text"
                                placeholder="Customer Name"
                                value={guestName}
                                onChange={(e) => setGuestName(e.target.value)}
                                disabled={selectedReportSaleId}
                                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-black text-slate-800 outline-none focus:bg-white focus:border-indigo-400 transition-all disabled:opacity-50"
                            />
                        </div>

                        {availableReturnBills.length > 0 && (
                            <div className="mt-2 space-y-1">
                                <label className="text-[9px] font-black text-indigo-600 uppercase tracking-widest px-1">Against Returns</label>
                                <Select
                                    isMulti
                                    options={availableReturnBills.map(b => ({ value: b.id, label: b.docId }))}
                                    value={selectedReturnBills}
                                    onChange={setSelectedReturnBills}
                                    placeholder="Link bills..."
                                    className="text-[10px] font-bold"
                                    styles={{
                                        control: (base) => ({
                                            ...base,
                                            borderRadius: '0.75rem',
                                            border: '1px solid #f1f5f9',
                                            backgroundColor: '#f8fafc',
                                            minHeight: '28px',
                                            fontSize: '10px'
                                        }),
                                        valueContainer: (base) => ({
                                            ...base,
                                            padding: '0 8px'
                                        })
                                    }}
                                />
                            </div>
                        )}
                    </div>
                    <div className={`mt-2 p-2 rounded-xl flex items-center justify-between border border-dashed transition-all ${availableCredit > 0 ? 'bg-emerald-50 border-emerald-200 animate-in slide-in-from-top-1' : 'bg-slate-50/50 border-slate-100'}`}>
                        <div className="flex items-center gap-2">
                            <div className={`h-2 w-2 rounded-full ${availableCredit > 0 ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}></div>
                            <span className={`text-[10px] font-black uppercase tracking-wider ${availableCredit > 0 ? 'text-emerald-700' : 'text-slate-400'}`}>
                                {availableCredit > 0 ? 'Store Credit Found' : 'No Credit Available'}
                            </span>
                        </div>
                        {availableCredit > 0 && (
                            <span className="text-sm font-black text-emerald-600">
                                ₹{availableCredit.toLocaleString()}
                            </span>
                        )}
                    </div>
                </div>

                {/* Module 2: Sale Summary */}
                <div className="space-y-2 shrink-0 bg-white border border-slate-100 p-3 rounded-2xl shadow-sm">
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
                        {/* {totalOfferDiscount > 0 && (
                            <div className="space-y-1">
                                <div className="flex justify-between items-center text-violet-600 text-xs font-bold">
                                    <span className="text-[11px] uppercase tracking-wider flex items-center gap-1">
                                        <Gift size={11} className="text-violet-500" /> Offer Disc
                                    </span>
                                    <span>-₹{totalOfferDiscount.toLocaleString()}</span>
                                </div>
                                <div className="flex flex-wrap gap-1">
                                    {appliedOffers.map((off, idx) => (
                                        <span key={idx} className="bg-violet-50 text-violet-600 px-1.5 py-0.5 rounded text-[8px] font-black uppercase border border-violet-100/50 flex items-center gap-1">
                                            <Zap size={8} fill="currentColor" />{off.name}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )} */}
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
                        {/* <div className="flex justify-between items-center text-xs font-bold text-slate-600">
                            <span className="text-[11px] uppercase tracking-wider text-slate-400">CGST</span>
                            <span>₹{(tax / 2).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs font-bold text-slate-600">
                            <span className="text-[11px] uppercase tracking-wider text-slate-400">SGST</span>
                            <span>₹{(tax / 2).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div> */}
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

            </div>

            {/* Footer: Action Checkout */}
            <div className="p-3 bg-white border-t border-slate-100 space-y-2">
                <div className={`grid ${isUnpaidBill || isReturnMode ? 'grid-cols-1' : 'grid-cols-2'} gap-2`}>
                    {!isUnpaidBill && !isReturnMode && (
                        <button
                            disabled={isProcessing || cart.length === 0 || isReportOnly}
                            onClick={() => handleSaveUnpaid()}
                            className={`py-2 rounded-xl flex items-center justify-center gap-2 font-black text-[10px] uppercase tracking-widest transition-all shadow-lg ${(cart.length === 0 || isProcessing || isReportOnly) ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none' : 'bg-amber-500 text-white hover:bg-amber-600 active:scale-[0.98] shadow-amber-100'}`}
                        >
                            <ShoppingCart size={16} />
                            <span>Save [F9]</span>
                        </button>
                    )}
                    <button
                        disabled={isProcessing || cart.length === 0 || isReportOnly}
                        onClick={() => handlePayNow()}
                        className={`${(isUnpaidBill || isReturnMode) ? 'w-full' : ''} py-2 rounded-xl flex items-center justify-center gap-2 font-black text-[10px] uppercase tracking-widest transition-all shadow-lg ${(cart.length === 0 || isProcessing || isReportOnly) ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none' : (isRefund ? 'bg-rose-600 text-white hover:bg-rose-700 active:scale-[0.98] shadow-rose-100' : 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-[0.98] shadow-indigo-100')}`}
                    >
                        {isRefund ? <CreditCard size={16} /> : (isReturnMode ? <ShoppingCart size={16} /> : <CreditCard size={16} />)}
                        <span>{isReportOnly ? "Report View" : (isAdmin && isPendingApproval ? "Approve [F8]" : (isRefund ? 'Refund [F8]' : (isReturnMode ? "Save Return [F8]" : (isUnpaidBill ? 'Complete Payment [F8]' : 'Pay [F8]'))))}</span>
                    </button>
                </div>
                {printData && (
                    <div className="bg-amber-50 p-2 rounded-xl border border-amber-100 flex items-center justify-between animate-in slide-in-from-bottom-2">
                        <span className="text-[9px] font-black text-amber-600 uppercase ml-2">Receipt Generated</span>
                        <button onClick={() => setPrintData(null)} className="p-1 px-3 bg-white text-amber-600 border border-amber-200 rounded-lg text-[10px] font-black hover:bg-amber-600 hover:text-white transition-all">CLOSE</button>
                    </div>
                )}
            </div>
        </aside>
    );
};


export default POSSidebar;
