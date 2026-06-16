import React from 'react';
import { ScanBarcode, Loader2, Search, Clock, ChevronDown, Eye, Plus } from 'lucide-react';
import { DropdownInputNew } from '../../../../Inputs';
import { ReturnType, TransactionType } from '../../../../Utils/DropdownData';
import { IoArrowBackCircleSharp } from 'react-icons/io5';
import Swal from 'sweetalert2';

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
    const [activeSuggestionIndex, setActiveSuggestionIndex] = React.useState(-1);
    const suggestionsContainerRef = React.useRef(null);
    const searchContainerRef = React.useRef(null);

    // Reset active index when suggestions list changes or when dropdown visibility changes
    React.useEffect(() => {
        setActiveSuggestionIndex(-1);
    }, [suggestions, showSuggestions]);

    // Scroll highlighted suggestion into view
    React.useEffect(() => {
        if (activeSuggestionIndex >= 0 && suggestionsContainerRef.current) {
            const activeEl = suggestionsContainerRef.current.children[activeSuggestionIndex];
            if (activeEl) {
                activeEl.scrollIntoView({ block: 'nearest' });
            }
        }
    }, [activeSuggestionIndex]);

    // Close suggestions dropdown when clicking outside the search container
    React.useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                showSuggestions &&
                searchContainerRef.current &&
                !searchContainerRef.current.contains(event.target)
            ) {
                setShowSuggestions(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showSuggestions, setShowSuggestions]);

    const handleInputKeyDown = (e) => {
        if (searchMode !== 'NAME' || !showSuggestions || !suggestions || suggestions.length === 0) {
            handleScan(e);
            return;
        }

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActiveSuggestionIndex((prevIndex) => {
                let nextIndex = prevIndex;
                for (let i = 0; i < suggestions.length; i++) {
                    nextIndex = (nextIndex + 1) % suggestions.length;
                    if (suggestions[nextIndex]) {
                        return nextIndex;
                    }
                }
                return prevIndex;
            });
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActiveSuggestionIndex((prevIndex) => {
                let nextIndex = prevIndex;
                if (nextIndex === -1) nextIndex = suggestions.length;
                for (let i = 0; i < suggestions.length; i++) {
                    nextIndex = (nextIndex - 1 + suggestions.length) % suggestions.length;
                    if (suggestions[nextIndex]) {
                        return nextIndex;
                    }
                }
                return prevIndex;
            });
        } else if (e.key === 'Enter') {
            if (activeSuggestionIndex >= 0 && activeSuggestionIndex < suggestions.length) {
                e.preventDefault();
                const item = suggestions[activeSuggestionIndex];
                if (item) {
                    onSelectSuggestion(item);
                    setActiveSuggestionIndex(-1);
                }
            } else {
                handleScan(e);
            }
        } else if (e.key === 'Escape') {
            e.preventDefault();
            setShowSuggestions(false);
            setActiveSuggestionIndex(-1);
        }
        else {
            handleScan(e);
        }
    };

    console.log(searchQuery, "searchQuery")
    return (
        <header className="hidden md:flex h-10 bg-white border-b border-slate-200 px-4 items-center shrink-0 z-30 justify-between shadow-sm">
            <div className="flex items-center gap-4 flex-1">
                {/* Search Mode Toggle */}


                <div className="flex flex-col gap-0.5">
                    {/* <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none">Transaction Type</label> */}
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
                <div className="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200 shadow-sm shrink-0">
                    <button
                        onClick={() => setSearchMode('NAME')}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider transition-all ${searchMode === 'NAME' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <Search size={12} />
                        Name
                    </button>
                    <button
                        onClick={() => setSearchMode('BARCODE')}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider transition-all ${searchMode === 'BARCODE' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <ScanBarcode size={12} />
                        Barcode
                    </button>

                </div>
                <div ref={searchContainerRef} className="flex-1 max-w-xl relative mt-1">
                    {isBarcodeLoading ? (
                        <Loader2 className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-500 animate-spin" size={16} />
                    ) : (
                        searchMode === 'BARCODE' ? <ScanBarcode className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} /> : <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    )}
                    <input
                        ref={scannerRef}
                        disabled={(isBarcodeLoading && searchMode === 'BARCODE') || selectedReportSaleId || transactionType === 'RETURN'}

                        placeholder={selectedReportSaleId ? "View Only Mode" : (transactionType === 'RETURN' ? "Scanning Disabled in Return Mode" : (searchMode === 'BARCODE' ? "Scan Barcode & Press Enter [F10]" : "Search Product Name..."))}
                        className={`w-full pl-10 pr-4 py-1 rounded-lg text-sm transition-all font-medium border outline-none ${((isBarcodeLoading && searchMode === 'BARCODE') || selectedReportSaleId || transactionType === 'RETURN') ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed' : 'bg-slate-50 border-slate-200 focus:bg-white focus:border-indigo-500 placeholder:text-slate-400'}`}
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            if (searchMode === 'NAME') setShowSuggestions(true);
                        }}
                        onKeyDown={handleInputKeyDown}
                    // onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    // onFocus={() => searchMode === 'NAME' && searchQuery?.length >= 1 && setShowSuggestions(true)}
                    />{console.log(searchQuery, "searchQuery")}

                    {showSuggestions && suggestions?.length > 0 && (
                        <div
                            ref={suggestionsContainerRef}
                            className="absolute top-full left-0 w-[1050px] max-w-[95vw] mt-1 bg-white border border-slate-200 rounded-lg shadow-xl z-50 max-h-[500px] overflow-y-auto py-0 animate-in fade-in slide-in-from-top-1 duration-200"
                        >
                            <div className="sticky top-0 bg-slate-50 border-b border-slate-200 px-4 py-2 grid grid-cols-12 text-[10px] font-black uppercase tracking-wider text-slate-500 z-10">
                                <div className="col-span-7 text-left">Item Name</div>
                                <div className="col-span-2 text-left">Size/Color</div>
                                <div className="col-span-1 text-left">Barcode Type</div>

                                <div className="col-span-1 text-right">Sale Price</div>
                                <div className="col-span-1 text-right">Stock</div>
                                {/* <div className="col-span-2 text-right">Location</div> */}
                            </div>

                            {suggestions?.map((item, idx) => {
                                const isHighlighted = idx === activeSuggestionIndex;
                                return (
                                    <button
                                        key={idx}
                                        onClick={() => {
                                            if (parseFloat(item.stockQty) <= 0) {
                                                Swal.fire({
                                                    icon: 'error',
                                                    title: 'Out of Stock',
                                                    text: 'This item is out of stock',
                                                })
                                                return;
                                            }
                                            onSelectSuggestion(item)
                                        }}
                                        onMouseEnter={() => {
                                            setActiveSuggestionIndex(idx);
                                        }}
                                        className={`w-full px-4 py-2.5 grid grid-cols-12 items-center text-left transition-colors border-b border-slate-100 last:border-0 ${isHighlighted
                                            ? 'bg-indigo-100 cursor-pointer font-bold'
                                            : 'hover:bg-indigo-50 cursor-pointer'
                                            }`}
                                    >
                                        {/* Item Name & Barcode */}
                                        <div className="col-span-7 flex flex-col pr-2">
                                            <span className="text-sm font-bold text-slate-800 uppercase whitespace-normal break-words" title={item.item_name}>
                                                {item.item_name}
                                            </span>
                                            <span className="text-sm font-bold text-slate-800 uppercase">
                                                {item.barcode}
                                            </span>
                                        </div>



                                        {/* Size & Color combined */}
                                        <div className="col-span-2 text-left text-xs font-medium text-slate-600">
                                            {item.size !== '-' ? item.size : ''}
                                            {item.size !== '-' && item.color !== '-' ? ' / ' : ''}
                                            {item.color !== '-' ? item.color : ''}
                                            {item.size === '-' && item.color === '-' ? '-' : ''}
                                        </div>
                                        <div className="col-span-1 text-sm font-bold flex flex-col pr-2">
                                            {item.barcodeType}

                                        </div>
                                        {/* Sale Price */}
                                        <div className="col-span-1 text-right text-xs font-bold text-slate-700">
                                            {item.salesPrice || 0}
                                        </div>

                                        {/* Stock */}
                                        <div className={`col-span-1 text-right text-xs font-black ${item.stockQty > 0 ? 'text-emerald-600' : 'text-rose-500'
                                            }`}>
                                            {item.stockQty}
                                        </div>

                                        {/* Location */}
                                        {/* <div className="col-span-2 text-right text-xs font-medium text-slate-500">
                                            {item.location || '-'}
                                        </div> */}
                                    </button>
                                );
                            })}
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
