import React from 'react';
import { ScanBarcode, Loader2, Search, Clock, ChevronDown, Eye, Plus, RefreshCw, Printer, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { DropdownInputNew } from '../../../../Inputs';
import { ReturnType, TransactionType } from '../../../../Utils/DropdownData';
import { IoArrowBackCircleSharp } from 'react-icons/io5';
import Swal from 'sweetalert2';
import useLocalPrintAgentStatus from '../../../../hooks/useLocalPrintAgentStatus';
import { openLocalPrintAgentSetup } from '../../../../Utils/localPrintAgent';

const PRINT_ROLES = [
    { key: 'receipt', label: 'Receipt' },
    { key: 'barcode-label', label: 'Barcode Label' },
    { key: 'a4-invoice', label: 'A4 Invoice' },
];

function getRoleStatusLabel(connected, health, roleKey) {
    if (!connected) return 'Not Configured';
    const role = health?.roles?.[roleKey];
    if (!role || !role.configured) return 'Not Configured';
    if (role.configured && role.printerFound === false) return 'Printer Missing';
    return 'Ready';
}

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
    cart,
    currentBilStatus
}) => {
    const [activeSuggestionIndex, setActiveSuggestionIndex] = React.useState(-1);
    const suggestionsContainerRef = React.useRef(null);
    const searchContainerRef = React.useRef(null);
    const printAgentContainerRef = React.useRef(null);
    const [showPrintAgentDetails, setShowPrintAgentDetails] = React.useState(false);
    const { connected: printAgentConnected, loading: printAgentLoading, health: printAgentHealth, retry: retryPrintAgent } = useLocalPrintAgentStatus();

    // Close print agent status dropdown when clicking outside
    React.useEffect(() => {
        const handleClickOutsidePrintAgent = (event) => {
            if (
                showPrintAgentDetails &&
                printAgentContainerRef.current &&
                !printAgentContainerRef.current.contains(event.target)
            ) {
                setShowPrintAgentDetails(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutsidePrintAgent);
        return () => {
            document.removeEventListener('mousedown', handleClickOutsidePrintAgent);
        };
    }, [showPrintAgentDetails]);

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

    return (
        <header className="hidden md:flex h-10 bg-white border-b border-slate-200 px-4 items-center shrink-0 z-30 justify-between shadow-sm">
            <div className="flex items-center gap-4 flex-1">

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
                        disabled={(isBarcodeLoading && searchMode === 'BARCODE') || (selectedReportSaleId && currentBilStatus != "UNPAID")}
                        // disabled={(isBarcodeLoading && searchMode === 'BARCODE') || selectedReportSaleId}


                        placeholder={selectedReportSaleId && currentBilStatus != "UNPAID" ? "View Only Mode" : (transactionType === 'RETURN' ? "Search Product Name..." : (searchMode === 'BARCODE' ? "Scan Barcode & Press Enter [F10]" : "Search Product Name..."))}
                        className={`w-full pl-10 pr-4 py-1 rounded-lg text-sm transition-all font-medium border outline-none ${((isBarcodeLoading && searchMode === 'BARCODE') || selectedReportSaleId) ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed' : 'bg-slate-50 border-slate-200 focus:bg-white focus:border-indigo-500 placeholder:text-slate-400'}`}
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            if (searchMode === 'NAME') setShowSuggestions(true);
                        }}
                        onKeyDown={handleInputKeyDown}
                    // onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    // onFocus={() => searchMode === 'NAME' && searchQuery?.length >= 1 && setShowSuggestions(true)}
                    />{/* console.log removed */}

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
                <button
                    onClick={() => setShowReturnExchnageModal(true)}
                    disabled={selectedReportSaleId}
                    title="Return / Exchange"
                    className="flex items-center gap-1.5 text-slate-600 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-black hover:bg-slate-100 hover:text-slate-700 transition-all shadow-sm active:scale-95 outline-none disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap mt-1"
                >
                    <RefreshCw size={14} /> Return / Exchange
                </button>
            </div>
            <div className="flex items-center gap-4">
                <div ref={printAgentContainerRef} className="relative">
                    <button
                        onClick={() => setShowPrintAgentDetails((v) => !v)}
                        title="Local Print Agent Status"
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border shadow-sm transition-all ${printAgentConnected
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                            : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                            }`}
                    >
                        {printAgentLoading ? (
                            <Loader2 size={12} className="animate-spin" />
                        ) : printAgentConnected ? (
                            <CheckCircle2 size={12} />
                        ) : (
                            <AlertTriangle size={12} />
                        )}
                        Print Agent: {printAgentConnected ? 'Connected' : 'Not Connected'}
                    </button>

                    {showPrintAgentDetails && (
                        <div className="absolute top-full right-0 mt-1 w-72 bg-white border border-slate-200 rounded-lg shadow-xl z-50 p-3 text-left">
                            {!printAgentConnected ? (
                                <div className="flex flex-col gap-2">
                                    <p className="text-xs font-bold text-rose-600">Local Print Agent is not running on this machine.</p>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={retryPrintAgent}
                                            className="flex items-center gap-1 text-[11px] font-black uppercase text-indigo-600 bg-indigo-50 border border-indigo-200 px-2 py-1 rounded-md hover:bg-indigo-100"
                                        >
                                            <RefreshCw size={12} /> Retry
                                        </button>
                                        <button
                                            onClick={openLocalPrintAgentSetup}
                                            className="flex items-center gap-1 text-[11px] font-black uppercase text-slate-600 bg-slate-50 border border-slate-200 px-2 py-1 rounded-md hover:bg-slate-100"
                                        >
                                            <Printer size={12} /> Open Local Printer Setup
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-2">
                                    {printAgentHealth?.printerName && (
                                        <p className="text-[10px] text-slate-400">Printer (support info): {printAgentHealth.printerName}</p>
                                    )}
                                    {PRINT_ROLES.map((role) => {
                                        const statusLabel = getRoleStatusLabel(printAgentConnected, printAgentHealth, role.key);
                                        const isReady = statusLabel === 'Ready';
                                        return (
                                            <div key={role.key} className="flex items-center justify-between text-xs">
                                                <span className="font-bold text-slate-600">{role.label}:</span>
                                                <span className={`font-black ${isReady ? 'text-emerald-600' : 'text-amber-600'}`}>{statusLabel}</span>
                                            </div>
                                        );
                                    })}
                                    {PRINT_ROLES.some((role) => getRoleStatusLabel(printAgentConnected, printAgentHealth, role.key) !== 'Ready') && (
                                        <div className="flex flex-col gap-1 pt-1 border-t border-slate-100">
                                            <p className="text-[10px] text-slate-500">
                                                {PRINT_ROLES.find((role) => getRoleStatusLabel(printAgentConnected, printAgentHealth, role.key) === 'Not Configured')?.label || 'A'} printer is not configured for this counter.
                                            </p>
                                            <button
                                                onClick={openLocalPrintAgentSetup}
                                                className="flex items-center gap-1 text-[11px] font-black uppercase text-slate-600 bg-slate-50 border border-slate-200 px-2 py-1 rounded-md hover:bg-slate-100 w-fit"
                                            >
                                                <Printer size={12} /> Open Local Printer Setup
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
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
