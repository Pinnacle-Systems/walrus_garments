import React from 'react';
import TransactionLineItemsSection, {
    transactionTableClassName,
    transactionTableHeadClassName,
    transactionTableHeaderCellClassName,
    transactionTableRowClassName,
    transactionTableCellClassName,
    transactionTableIndexCellClassName,
    transactionTableNumberInputClassName,
    transactionTableSelectInputClassName,
} from "../ReusableComponents/TransactionLineItemsSection";
import { HiInformationCircle, HiMinus, HiPlus } from 'react-icons/hi';
import { FiGift, FiSearch, FiTrash2 } from 'react-icons/fi';

const PosSalesReturnItems = ({
    deliveryItems = [],
    setDeliveryItems,
    exchangeItems = [],
    setExchangeItems = () => { },
    itemList = [],
    sizeList = [],
    colorList = [],
    uomList = [],
    locations = [],
    readOnly,
    handleRightClick,
    contextMenu,
    handleCloseContextMenu,
    setInwardItemSelection,
    exchangeSearchQuery,
    setExchangeSearchQuery,
    handleExchangeScan,
    exchangeScannerRef,
    returnTotal = 0,
    exchangeTotal = 0,
    netAmount = 0,
    handlePayNow,
    // New Props for Offers
    handleShowItemOffers,
    selectedOffersByRow,
    cartWithOffers,
    employees,
    getStockByBarcode,
    resolveBarcodeMatch
}) => {
    const compactHeaderCellClassName = transactionTableHeaderCellClassName;
    const compactCellClassName = transactionTableCellClassName;

    const removeFromExchange = (index) => {
        setExchangeItems(prev => prev.filter((_, i) => i !== index));
    };

    const updateExchangeQty = (index, delta, isDirect = false) => {
        setExchangeItems(prev => prev.map((item, i) => {
            if (i === index) {
                const stockLimit = parseFloat(item.stockQty) || 9999;
                let newQty = isDirect ? Math.max(1, parseFloat(delta) || 1) : Math.max(1, (parseFloat(item.qty) || 0) + delta);
                if (newQty > stockLimit) newQty = stockLimit;
                return { ...item, qty: newQty };
            }
            return item;
        }));
    };

    const updateExchangeRate = (index, value) => {
        setExchangeItems(prev => prev.map((item, i) => i === index ? { ...item, rate: parseFloat(value) || 0, price: parseFloat(value) || 0, salesPrice: parseFloat(value) || 0 } : item));
    };

    const handleLocationChange = async (index, currentItem) => {
        if (!resolveBarcodeMatch || !getStockByBarcode) return;
        try {
            const res = await getStockByBarcode({ params: { barcode: currentItem.barcode, branchId: currentItem.branchId } }).unwrap();
            const resolvedData = res?.needsResolution ? await resolveBarcodeMatch(res.matches || []) : res?.data;
            if (res?.needsResolution && !resolvedData) return;
            
            const selectedLocation = Array.isArray(resolvedData) ? resolvedData[0] : resolvedData;
            if (selectedLocation) {
                setExchangeItems(prev => prev.map((item, i) => i === index ? { 
                    ...item, 
                    sourceStoreId: parseInt(selectedLocation.storeId || selectedLocation.locationId),
                    stockQty: selectedLocation.stockQty || item.stockQty
                } : item));
            }
        } catch (error) {
            console.error("Location resolution failed", error);
        }
    };

    const handleSalesmanChange = (index, empId) => {
        const emp = employees.find(e => e.id === parseInt(empId));
        setExchangeItems(prev => prev.map((item, i) => i === index ? { 
            ...item, 
            salesPersonId: emp?.id || null, 
            salesPersonName: emp?.name || null,
            salesPersonCode: emp?.employeeId || emp?.regNo || null
        } : item));
    };

    const handleSalesmanCodeChange = (index, code) => {
        const emp = employees.find(e => (e.employeeId || e.regNo || "").toString().toLowerCase() === code.toString().toLowerCase());
        setExchangeItems(prev => prev.map((item, i) => i === index ? { 
            ...item, 
            salesPersonId: emp?.id || null, 
            salesPersonName: emp?.name || null,
            salesPersonCode: code,
            salesPersonIdResolved: !!emp
        } : item));
    };

    return (
        <div className="flex flex-col h-full bg-slate-50 overflow-hidden">
            {/* Split View for Return and Exchange */}
            <div className="flex-1 flex flex-col xl:flex-row gap-4 p-4 min-h-0">
                
                {/* Return Items Section (Left Side) - Slightly narrower or equal */}
                <div className="flex-[0.8] flex flex-col min-h-0 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex justify-between items-center bg-gradient-to-r from-red-50/50 to-transparent">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center text-red-600 shadow-sm">
                                <HiMinus className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-slate-800">Return Items</h3>
                                <p className="text-[10px] text-slate-500 font-medium">{deliveryItems.length} items to inward</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setInwardItemSelection(true)}
                            className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-[10px] font-bold hover:bg-indigo-700 transition-all shadow-md active:scale-95"
                        >
                            + Fill from Bill
                        </button>
                    </div>

                    <div className="flex-1 overflow-auto custom-scrollbar">
                        <table className="w-full border-collapse">
                            <thead className="bg-slate-50/80 backdrop-blur-sm sticky top-0 z-10">
                                <tr className="border-b border-slate-100">
                                    <th className="p-3 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider w-10">#</th>
                                    <th className="p-3 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider">Item Details</th>
                                    <th className="p-3 text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider w-20">Qty</th>
                                    <th className="p-3 text-right text-[10px] font-bold text-slate-400 uppercase tracking-wider w-24">Price</th>
                                    <th className="p-3 text-right text-[10px] font-bold text-slate-400 uppercase tracking-wider w-28">Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {deliveryItems.map((row, index) => (
                                    <tr key={index} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="p-3 text-[11px] text-slate-400 font-medium text-center">{index + 1}</td>
                                        <td className="p-3">
                                            <div className="flex flex-col gap-0.5">
                                                <span className="text-[11px] font-bold text-slate-700 group-hover:text-indigo-600 transition-colors">{row.itemName || row.item_name}</span>
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-[9px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-md border border-slate-200/50">{row.barcode}</span>
                                                    <span className="text-[9px] text-slate-500 font-medium">{row.sizeName} | {row.colorName}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-3 text-center">
                                            <span className="text-[11px] font-black text-slate-700 bg-slate-100/50 px-2.5 py-1 rounded-lg border border-slate-100">{row.qty}</span>
                                        </td>
                                        <td className="p-3 text-right text-[11px] text-slate-600 font-mono">₹{parseFloat(row.price || 0).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                                        <td className="p-3 text-right text-[11px] font-bold text-slate-800 font-mono">₹{(parseFloat(row.qty || 0) * parseFloat(row.price || 0)).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                                    </tr>
                                ))}
                                {deliveryItems.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="p-12 text-center">
                                            <div className="flex flex-col items-center gap-2 opacity-40">
                                                <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 border-2 border-dashed border-slate-200">
                                                    <HiInformationCircle className="w-6 h-6" />
                                                </div>
                                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">No Return Items</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    <div className="p-4 bg-red-50/50 border-t border-red-100 flex justify-between items-center backdrop-blur-sm">
                        <span className="text-[10px] font-bold text-red-600 uppercase tracking-widest">Total Return Value</span>
                        <span className="text-lg font-black text-red-700 font-mono">₹{returnTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                </div>

                {/* Exchange Items Section (Right Side) - Full POS Power */}
                <div className="flex-1 flex flex-col min-h-0 bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden">
                    <div className="px-5 py-3 bg-white border-b border-slate-100">
                        <div className="flex justify-between items-center mb-3">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600 shadow-sm">
                                    <HiPlus className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-slate-800">Exchange Items</h3>
                                    <p className="text-[10px] text-emerald-600 font-bold">{exchangeItems.length} items to outward</p>
                                </div>
                            </div>
                        </div>
                        {/* Barcode Scanner Input */}
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                                <FiSearch className="h-4 w-4" />
                            </div>
                            <input
                                ref={exchangeScannerRef}
                                type="text"
                                className="block w-full pl-11 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                                placeholder="Scan items for exchange..."
                                value={exchangeSearchQuery}
                                onChange={(e) => setExchangeSearchQuery(e.target.value)}
                                onKeyDown={handleExchangeScan}
                            />
                            <div className="absolute inset-y-0 right-0 pr-4 flex items-center gap-2">
                                <span className="text-[9px] font-bold text-slate-400 bg-white border border-slate-200 px-1.5 py-0.5 rounded shadow-sm">ENTER</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 overflow-auto custom-scrollbar">
                        <table className="w-full border-collapse">
                            <thead className="bg-slate-50/80 backdrop-blur-sm sticky top-0 z-10 border-b border-slate-100">
                                <tr>
                                    <th className="p-2 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest w-10">SNo</th>
                                    <th className="p-2 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">New Product</th>
                                    <th className="p-1.5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest w-16">Size</th>
                                    <th className="p-1.5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest w-16">Color</th>
                                    <th className="p-1.5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest w-24">Salesman</th>
                                    <th className="p-1.5 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest w-14">Stock</th>
                                    <th className="p-1.5 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest w-20">Qty</th>
                                    <th className="p-1.5 text-right text-[10px] font-bold text-slate-400 uppercase tracking-widest w-24">Price</th>
                                    <th className="p-1.5 text-right text-[10px] font-bold text-slate-400 uppercase tracking-widest w-8"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {cartWithOffers.map((item, index) => {
                                    const cartKey = `${item.id || item.itemId}-${item.sizeId}-${item.colorId}`;
                                    const hasOffer = !!selectedOffersByRow[cartKey];
                                    
                                    return (
                                        <tr key={index} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="p-1.5 text-[11px] text-slate-400 font-medium text-center align-middle">{index + 1}</td>
                                            <td className="p-1.5 align-middle">
                                                <div className="flex items-center gap-2">
                                                    <div className="flex flex-col min-w-0">
                                                        <span className="text-[11px] font-bold text-slate-800 truncate max-w-[150px]">{item.itemName || item.item_name}</span>
                                                        <span className="text-[9px] font-medium text-slate-400">{item.barcode}</span>
                                                    </div>
                                                    {item.barcodeType === 'CLEARANCE' && (
                                                        <span className="px-1 py-0.5 bg-amber-100 text-amber-700 text-[8px] font-black rounded uppercase border border-amber-200 shrink-0">CLR</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="p-1.5 align-middle">
                                                <span className="text-[10px] font-bold text-slate-600 uppercase bg-slate-50 px-1.5 py-0.5 rounded block text-center truncate">{item.sizeName || item.size || '-'}</span>
                                            </td>
                                            <td className="p-1.5 align-middle">
                                                <span className="text-[10px] font-bold text-slate-600 uppercase bg-slate-50 px-1.5 py-0.5 rounded block text-center truncate">{item.colorName || item.color || '-'}</span>
                                            </td>
                                            <td className="p-1.5 align-middle">
                                                <input
                                                    type="text"
                                                    placeholder="Code"
                                                    className={`w-full text-[10px] bg-white border ${item.salesPersonId ? 'border-emerald-200 bg-emerald-50/30 text-emerald-700' : 'border-slate-200 text-slate-600'} rounded px-1.5 py-0.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-black text-center`}
                                                    value={item.salesPersonCode || ''}
                                                    onChange={(e) => handleSalesmanCodeChange(index, e.target.value)}
                                                />
                                            </td>
                                            <td className="p-1.5 align-middle text-center">
                                                <span className="text-[11px] font-black text-indigo-600">{item.stockQty?.toLocaleString() || 0}</span>
                                            </td>
                                            <td className="p-1.5 align-middle text-center">
                                                <div className="flex items-center justify-center gap-1">
                                                    <div className="flex items-center justify-center gap-0.5">
                                                        <button 
                                                            onClick={() => updateExchangeQty(index, -1)}
                                                            className="w-5 h-5 flex items-center justify-center bg-white border border-slate-200 rounded text-slate-400 hover:bg-slate-50 hover:text-red-500 transition-all"
                                                        >
                                                            <HiMinus className="w-2 h-2" />
                                                        </button>
                                                        <input
                                                            type="number"
                                                            className="w-8 h-6 bg-slate-50 border border-slate-200 rounded text-center text-[10px] font-black text-slate-800 outline-none p-0"
                                                            value={item.qty}
                                                            onChange={(e) => updateExchangeQty(index, e.target.value, true)}
                                                        />
                                                        <button 
                                                            onClick={() => updateExchangeQty(index, 1)}
                                                            className="w-5 h-5 flex items-center justify-center bg-white border border-slate-200 rounded text-slate-400 hover:bg-slate-50 hover:text-emerald-500 transition-all"
                                                        >
                                                            <HiPlus className="w-2 h-2" />
                                                        </button>
                                                    </div>
                                                    
                                                    <button 
                                                        onClick={() => handleShowItemOffers(item)}
                                                        title={hasOffer ? item.appliedOfferName : "Apply Offer"}
                                                        className={`w-6 h-6 flex items-center justify-center rounded transition-all border shrink-0 ${
                                                            hasOffer 
                                                            ? 'bg-emerald-50 text-emerald-600 border-emerald-200' 
                                                            : 'bg-slate-50 text-slate-400 border-slate-200'
                                                        }`}
                                                    >
                                                        <FiGift className={`w-2.5 h-2.5 ${hasOffer ? 'animate-bounce' : ''}`} />
                                                    </button>
                                                </div>
                                            </td>
                                            <td className="p-1.5 align-middle text-right">
                                                <div className="flex flex-col items-end leading-tight">
                                                    {hasOffer ? (
                                                        <div className="flex flex-col items-end">
                                                            <span className="text-[8px] text-slate-400 line-through font-mono">₹{parseFloat(item.salesPrice || item.price).toLocaleString()}</span>
                                                            <span className="text-[10px] font-black text-emerald-600 font-mono">₹{parseFloat(item.price).toLocaleString()}</span>
                                                        </div>
                                                    ) : (
                                                        <input 
                                                            type="number"
                                                            className="w-14 text-right bg-transparent border-none text-[10px] font-black text-slate-800 focus:outline-none p-0 font-mono"
                                                            value={item.price}
                                                            onChange={(e) => updateExchangeRate(index, e.target.value)}
                                                        />
                                                    )}
                                                    <span className="text-[8px] font-bold text-slate-400 font-mono">₹{(parseFloat(item.qty || 0) * parseFloat(item.price || 0)).toLocaleString()}</span>
                                                </div>
                                            </td>
                                            <td className="p-1.5 text-center align-middle">
                                                <button 
                                                    onClick={() => removeFromExchange(index)}
                                                    className="w-6 h-6 flex items-center justify-center text-slate-300 hover:text-red-500 transition-all"
                                                >
                                                    <FiTrash2 className="w-3 h-3" />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {exchangeItems.length === 0 && (
                                    <tr>
                                        <td colSpan={9} className="p-16 text-center">
                                            <div className="flex flex-col items-center gap-4">
                                                <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-300 border-2 border-dashed border-slate-200 animate-pulse">
                                                    <FiSearch className="w-8 h-8" />
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">No Exchange Items</p>
                                                    <p className="text-[10px] text-slate-400 font-medium">Scan an item barcode (F10) to start exchange</p>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    
                    {/* Enhanced Footer for Exchange */}
                    <div className="p-4 bg-emerald-50/30 border-t border-emerald-100 backdrop-blur-sm">
                        <div className="flex justify-between items-center">
                            <div className="flex flex-col">
                                <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-[0.2em] mb-1">Exchange Summary</span>
                                <div className="flex items-center gap-4">
                                    <div className="flex flex-col">
                                        <span className="text-[9px] text-slate-400 font-bold uppercase">Subtotal</span>
                                        <span className="text-sm font-black text-slate-700 font-mono">₹{exchangeTotal.toLocaleString()}</span>
                                    </div>
                                    <div className="w-px h-6 bg-slate-200"></div>
                                    <div className="flex flex-col">
                                        <span className="text-[9px] text-red-400 font-bold uppercase">Manual Disc.</span>
                                        <span className="text-sm font-black text-red-500 font-mono">-₹0.00</span>
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="text-[8px] font-black text-emerald-500 uppercase tracking-[0.3em] block mb-1">Net Outward</span>
                                <span className="text-2xl font-black text-emerald-700 font-mono tracking-tighter">₹{exchangeTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #e2e8f0;
                    border-radius: 20px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #cbd5e1;
                }
            `}</style>
        </div>
    );
};

export default PosSalesReturnItems;