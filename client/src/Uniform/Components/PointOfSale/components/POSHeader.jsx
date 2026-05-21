import React from 'react';
import { ScanBarcode, Loader2, Search, Clock, ChevronDown, Eye, Plus } from 'lucide-react';
import { DropdownInputNew } from '../../../../Inputs';
import { ReturnType, TransactionType } from '../../../../Utils/DropdownData';
import { IoArrowBackCircleSharp } from 'react-icons/io5';

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
    selectedReportSaleId,
    onNew,
    suggestions,
    showSuggestions,
    setShowSuggestions,
    onSelectSuggestion,
    searchMode,
    setSearchMode,
    cart
}) => {
    return (
        <header className="h-14 bg-white border-b border-slate-200 px-4 flex items-center shrink-0 z-30 justify-between shadow-sm">
            <div className="flex items-center gap-4 flex-1">
                {/* Search Mode Toggle */}
                <div className="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200 shadow-sm shrink-0">
                    <button
                        onClick={() => setSearchMode('BARCODE')}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider transition-all ${searchMode === 'BARCODE' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <ScanBarcode size={12} />
                        Barcode
                    </button>
                    <button
                        onClick={() => setSearchMode('NAME')}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider transition-all ${searchMode === 'NAME' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <Search size={12} />
                        Name
                    </button>
                </div>

                <div className="flex flex-col gap-0.5">
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none">Transaction Type</label>
                    <div className="relative group w-24">
                        <select
                            disabled={selectedReportSaleId || cart?.length > 0}
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
                {transactionType !== 'SALE' && (
                    <div>
                        <button
                            onClick={() => setShowReturnExchnageModal(true)}
                            className="flex items-center gap-1.5 text-indigo-600 bg-white border border-indigo-200 px-3 py-1.5 rounded-lg text-xs font-black hover:bg-indigo-50 hover:border-indigo-300 transition-all shadow-sm active:scale-95 outline-none"
                        >
                            <Eye size={14} />
                            View
                        </button>
                    </div>
                )}
                <div className="flex-1 max-w-xl relative mt-1">
                    {isBarcodeLoading ? (
                        <Loader2 className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-500 animate-spin" size={16} />
                    ) : (
                        searchMode === 'BARCODE' ? <ScanBarcode className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} /> : <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    )}
                    <input
                        ref={scannerRef}
                        disabled={isBarcodeLoading || selectedReportSaleId || transactionType === 'RETURN'}
                        placeholder={selectedReportSaleId ? "View Only Mode" : (transactionType === 'RETURN' ? "Scanning Disabled in Return Mode" : (searchMode === 'BARCODE' ? "Scan Barcode & Press Enter [F10]" : "Search Product Name..."))}
                        className={`w-full pl-10 pr-4 py-1 rounded-lg text-sm transition-all font-medium border outline-none ${(isBarcodeLoading || selectedReportSaleId || transactionType === 'RETURN') ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed' : 'bg-slate-50 border-slate-200 focus:bg-white focus:border-indigo-500 placeholder:text-slate-400'}`}
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            if (searchMode === 'NAME') setShowSuggestions(true);
                        }}
                        onKeyDown={handleScan}
                        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                        onFocus={() => searchMode === 'NAME' && searchQuery?.length >= 2 && setShowSuggestions(true)}
                    />

                    {/* Suggestions Dropdown */}{console.log(suggestions, "suggestions")}
                    {showSuggestions && suggestions?.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-xl z-50 max-h-64 overflow-y-auto py-1 animate-in fade-in slide-in-from-top-1 duration-200">
                            {suggestions.map((item, idx) => (
                                <button
                                    key={idx}
                                    disabled={item.stockQty <= 0}
                                    onClick={() => onSelectSuggestion(item)}
                                    className={`w-full text-left px-4 py-2 flex items-center justify-between transition-colors border-b border-slate-50 last:border-0 ${item.stockQty <= 0 ? 'opacity-50 cursor-not-allowed bg-slate-50' : 'hover:bg-indigo-50 cursor-pointer'}`}
                                >
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-slate-800">{item.item_name} | {item?.barcodeType} </span>
                                        <span className="text-[10px] text-slate-500 uppercase tracking-tight font-black">
                                            {item.size} | {item.color} | {item.barcode}
                                        </span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            <div className="flex items-center gap-4">
                <button
                    onClick={onNew}
                    className="flex items-center gap-2 text-indigo-600 bg-white border border-indigo-200 px-3 py-1.5 rounded-lg text-xs font-black hover:bg-indigo-50 hover:border-indigo-300 transition-all shadow-sm active:scale-95 outline-none"
                >
                    <Plus size={16} /> New
                </button>
                <button
                    onClick={() => { setSelectedReportSaleId(null); setShowReports(false) }}
                    title="Open Reports"
                    className="flex items-center gap-2 text-indigo-600 bg-indigo-50 rounded-lg text-xs font-black hover:bg-indigo-100 hover:scale-105 active:scale-95 transition-all outline-none p-1"
                >
                    <IoArrowBackCircleSharp className="w-7 h-7" />
                </button>
            </div>

        </header>
    );
};

export default POSHeader;
