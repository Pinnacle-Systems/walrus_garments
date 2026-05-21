import React from 'react';
import { User, ShoppingCart, Gift, Zap, CreditCard } from 'lucide-react';
import Select from 'react-select';
import POSSaleSummary from './POSSaleSummary';
import POSCreditNoteSummary from './POSCreditNoteSummary';
import POSSidebarFooter from './POSSidebarFooter';

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
    handleSaveAndPrint,
    approvalStatus,
    currentBilStatus,
    transactionType,
    exchangeSalesNo,
    availableCredit = 0,
    availableReturnBills = [],
    selectedReturnBills = [],
    setSelectedReturnBills,
    isCancelBill
}) => {
    const netPayable = (parseFloat(total) - parseFloat(availableCredit));
    const isRefund = netPayable < 0;
    const isPendingApproval = approvalStatus === 'PENDING';
    const isUnpaidBill = currentBilStatus === 'UNPAID';
    const isReturnMode = transactionType === 'RETURN';


    console.log(isUnpaidBill, "isUnpaidBill")
    console.log(isPendingApproval, "isPendingApproval")
    console.log(selectedReportSaleId, "selectedReportSaleId")


    const isReportOnly = selectedReportSaleId && !(isAdmin && isPendingApproval) && currentBilStatus === 'PAID';

    const appliedCredit = Math.min(Math.max(0, total), availableCredit);

    console.log(appliedCredit, "appliedCredit")
    console.log((parseFloat(total) - parseFloat(availableCredit)), "availableCredit", availableCredit)

    return (
        <aside className="w-[340px] border-l border-slate-200 bg-white flex flex-col shadow-2xl relative z-10 overflow-hidden h-full select-text">
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
                                disabled={selectedReportSaleId || isReturnMode}
                                className="w-full pl-16 pr-3 py-1.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-black text-slate-800 outline-none focus:bg-white focus:border-indigo-400 focus:shadow-[0_0_15px_rgba(79,70,229,0.05)] transition-all font-mono disabled:opacity-50"
                            />
                        </div>

                        <div className="relative group">
                            <input
                                type="text"
                                placeholder="Customer Name"
                                value={guestName}
                                onChange={(e) => setGuestName(e.target.value)}
                                disabled={selectedReportSaleId || isReturnMode}
                                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-black text-slate-800 outline-none focus:bg-white focus:border-indigo-400 transition-all disabled:opacity-50"
                            />
                        </div>
                        {((availableCredit > 0 && availableReturnBills.length > 0) || selectedReturnBills) && (
                            <div className="mt-2 space-y-1">
                                <label className="text-[9px] font-black text-indigo-600 uppercase tracking-widest px-1">Against Returns</label>
                                <Select
                                    // Current list + linked bill-ai merge panrom
                                    options={(() => {
                                        const opts = availableReturnBills.map(b => ({ value: b.id, label: b.docId }));
                                        if (selectedReturnBills && !opts.some(o => o.value === selectedReturnBills.value)) {
                                            opts.push(selectedReturnBills);
                                        }
                                        return opts;
                                    })()}
                                    value={selectedReturnBills}
                                    onChange={setSelectedReturnBills}
                                    placeholder="Link bills..."
                                    isDisabled={!!selectedReportSaleId} // Edit mode-la change panna mudiyaadhu
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

                {/* Module 2: Sale Summary / Credit Note Summary */}
                {isReturnMode ? (
                    <POSCreditNoteSummary
                        cart={cart}
                        total={total}
                        returnTotal={returnTotal}
                        purchaseTotal={purchaseTotal}
                    />
                ) : (
                    <POSSaleSummary
                        total={total}
                        subtotal={subtotal}
                        totalOfferDiscount={totalOfferDiscount}
                        appliedOffers={appliedOffers}
                        discount={discount}
                        setDiscount={setDiscount}
                        discountRef={discountRef}
                        tax={tax}
                        roundOff={roundOff}
                        appliedCredit={appliedCredit}
                        exchangeSalesNo={exchangeSalesNo}
                        netPayable={netPayable}
                        isRefund={isRefund}
                        isAdmin={isAdmin}
                        isPendingApproval={isPendingApproval}
                        selectedReportSaleId={selectedReportSaleId}
                        isProcessing={isProcessing}
                        cart={cart}
                        handleRequestDiscount={handleRequestDiscount}
                        returnTotal={returnTotal}
                        purchaseTotal={purchaseTotal}
                    />
                )}

            </div>

            {/* Footer: Action Checkout */}
            <POSSidebarFooter
                isUnpaidBill={isUnpaidBill}
                isReturnMode={isReturnMode}
                isProcessing={isProcessing}
                cart={cart}
                isReportOnly={isReportOnly}
                isCancelBill={isCancelBill}
                isAdmin={isAdmin}
                isPendingApproval={isPendingApproval}
                isRefund={isRefund}
                printData={printData}
                setPrintData={setPrintData}
                handleSaveUnpaid={handleSaveUnpaid}
                handlePayNow={handlePayNow}
                handleSaveAndPrint={handleSaveAndPrint}
            />
        </aside>
    );
};


export default POSSidebar;
