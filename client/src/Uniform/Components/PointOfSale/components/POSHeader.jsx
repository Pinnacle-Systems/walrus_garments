import React from 'react';
import { ScanBarcode, Loader2, Search, Clock, ChevronDown } from 'lucide-react';
import { DropdownInputNew } from '../../../../Inputs';
import { ReturnType, TransactionType } from '../../../../Utils/DropdownData';

const POSHeader = ({
    isBarcodeLoading,
    scannerRef,
    searchQuery,
    setSearchQuery,
    handleScan,
    setShowReports,
    retailLocation,
    setSelectedReportSaleId,
    transactionType,
    setTransactionType,
    setShowReturnExchnageModal,
    selectedReportSaleId
}) => {
    return (
        <header className="h-14 bg-white border-b border-slate-200 px-4 flex items-center shrink-0 z-30 justify-between shadow-sm">
            <div className="flex items-center gap-4 flex-1">
                <div className="flex flex-col gap-0.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Transaction Type</label>
                    <div className="relative group">
                        <select
                            disabled={selectedReportSaleId}
                            value={transactionType}
                            onChange={(e) => {
                                setTransactionType(e.target.value);
                                if (e.target.value !== 'SALE') {
                                    setShowReturnExchnageModal(true);
                                }
                            }}
                            className="appearance-none bg-slate-50 border border-slate-200 text-slate-700 text-[10px] font-black uppercase tracking-wider pl-3 pr-8 py-1.5 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none cursor-pointer transition-all hover:bg-slate-100 disabled:opacity-50"
                        >
                            {TransactionType.map((item) => (
                                <option key={item.value} value={item.value}>
                                    {item.show === 'EXCHNAGE' ? 'EXCHANGE' : item.show}
                                </option>
                            ))}
                        </select>
                        <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-slate-600 transition-colors" />
                    </div>
                </div>
                <div className="flex-1 max-w-xl relative">
                    {isBarcodeLoading ? (
                        <Loader2 className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-500 animate-spin" size={16} />
                    ) : (
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    )}
                    <input
                        ref={scannerRef}
                        disabled={isBarcodeLoading || selectedReportSaleId}
                        placeholder={selectedReportSaleId ? "View Only Mode" : (isBarcodeLoading ? "Finding item..." : "Scan or Search Product Name / Barcode [F10]")}
                        className={`w-full pl-10 pr-4 py-2 rounded-lg text-sm transition-all font-medium border outline-none ${(isBarcodeLoading || selectedReportSaleId) ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed' : 'bg-slate-50 border-slate-200 focus:bg-white focus:border-indigo-500 placeholder:text-slate-400'}`}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={handleScan}
                    />
                </div>
            </div>
            <div className="flex items-center gap-6 ml-4">
                <button
                    onClick={() => { setSelectedReportSaleId(null); setShowReports(false) }}
                    className="flex items-center gap-2 text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg text-xs font-black hover:bg-indigo-100 hover:scale-105 active:scale-95 transition-all outline-none"
                >
                    <Clock size={16} /> <span className="hidden sm:inline">POS Reports</span>
                </button>
                <div className="hidden lg:flex flex-col items-end leading-none">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Active Store</span>
                    <span className="text-xs font-bold text-slate-700 mt-0.5">{retailLocation?.storeName || 'Main Terminal'}</span>
                </div>
                <div className="h-8 w-px bg-slate-200 mx-2" />
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 border border-indigo-100 font-black text-xs">
                        {/* User Initials Placeholder */}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default POSHeader;
