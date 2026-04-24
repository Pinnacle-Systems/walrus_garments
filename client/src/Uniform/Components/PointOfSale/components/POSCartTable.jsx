import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ScanBarcode, Gift, Trash2, RefreshCw, ShoppingCart, Eye } from 'lucide-react';

const POSCartTable = ({
    isBarcodeLoading,
    cart,
    activeRowIndex,
    setActiveRowIndex,
    updateQuantity,
    handleShowItemOffers,
    employees,
    handleRowSalesPersonChange,
    updateRate,
    removeFromCart,
    onViewStock,
    qtyInputRefs,
    selectedReportSaleId
}) => {

    console.log(cart, "cart")
    return (
        <main className="flex-1 min-w-0 bg-white flex flex-col relative">
            {/* Barcode Search Loader Overlay */}
            <AnimatePresence>
                {isBarcodeLoading && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-50 bg-white/60 backdrop-blur-[2px] flex items-center justify-center pointer-events-none"
                    >
                        <div className="bg-white p-6 rounded-[2rem] shadow-2xl border border-slate-100 flex flex-col items-center gap-4 scale-110 pointer-events-auto">
                            <div className="relative">
                                <div className="w-16 h-16 border-4 border-indigo-50 border-t-indigo-600 rounded-full animate-spin"></div>
                                <ScanBarcode className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-indigo-600" size={24} />
                            </div>
                            <div className="text-center">
                                <h4 className="text-xs font-black text-slate-800 uppercase tracking-[0.2em]">Checking Stock</h4>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter mt-1">Retrieving Barcode Data...</p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
            <div className="flex-1 overflow-auto bg-[#f8fafc]/30">
                <table className="w-full text-left border-separate border-spacing-0">
                    <thead className="sticky top-0 z-20 bg-white shadow-sm border-b border-slate-200">
                        <tr className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                            <th className="px-1.5 py-1.5 w-8 text-center border-r border-slate-200 uppercase">S No</th>
                            <th className="px-2 py-1.5 flex-1 min-w-[100px] border-r border-slate-200">Item </th>
                            <th className="px-2 py-1.5 w-24 text-center border-r border-slate-200">Color</th>
                            <th className="px-2 py-1.5 w-24 text-center border-r border-slate-200">Size</th>
                            <th className="px-2 py-1.5 w-14 text-center border-r border-slate-200">UoM</th>
                            <th className="px-2 py-1.5 w-16 text-center border-r border-slate-200">Stock Qty</th>
                            <th className="px-2 py-1.5 w-20 text-center border-r border-slate-200">Qty</th>
                            <th className="px-3 py-1.5 w-28 text-center border-r border-slate-200">Salesman</th>
                            <th className="px-2 py-1.5 w-28 text-right border-r border-slate-200 bg-slate-50/50">Price</th>
                            <th className="px-2 py-1.5 w-20 text-center bg-slate-50/50">Total</th>
                            <th className="px-1.5 py-1.5 w-8 text-center bg-slate-50/50"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {cart.map((item, index) => {
                            const cartKey = `${item.id}-${item.sizeId || 0}-${item.colorId || 0}-${item.uomId || 0}-${!!item.isReturn}`;
                            const rowTotal = (parseFloat(item.price) || 0) * (parseFloat(item.qty) || 0);
                            const isActiveRow = index === activeRowIndex;
                            return (
                                <tr
                                    key={cartKey}
                                    onClick={() => setActiveRowIndex(index)}
                                    className={`group transition-colors border-b border-slate-50 cursor-pointer ${isActiveRow ? 'bg-indigo-50/60 ring-1 ring-inset ring-indigo-200' : (item.priceType === 'offerPrice' ? 'bg-emerald-50/40' : 'hover:bg-indigo-50/30')}`}
                                >
                                    <td className="px-2 py-1 text-center text-[10px] font-bold text-slate-400 border-r border-slate-200">{index + 1}</td>
                                    <td className="px-3 py-1 border-r border-slate-200">
                                        <div className="text-[12px] font-black text-slate-800 uppercase leading-tight truncate max-w-[280px]">{item?.Item?.name}</div>
                                        <div className="flex flex-wrap items-center gap-1 mt-1">
                                            <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">{item.barcode}</span>
                                            {item.isReturn && (
                                                <span className="bg-red-600 text-white px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest shadow-lg flex items-center gap-1.5">
                                                    <RefreshCw size={10} className="text-red-200" />
                                                    RETURN
                                                </span>
                                            )}
                                            {parseFloat(item.salesPrice) > parseFloat(item.price) && !item.isReturn && (
                                                <span className="text-[10px] font-bold text-slate-300 line-through">₹{parseFloat(item.salesPrice).toLocaleString()}</span>
                                            )}
                                            {item.priceType === 'offerPrice' && (
                                                <span className="bg-emerald-600 text-white px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest shadow-lg flex items-center gap-1.5 animate-pulse">
                                                    <Gift size={10} fill="currentColor" className="text-emerald-200" />
                                                    {item.appliedOfferName || "Offer Applied"}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-2 py-1 text-center text-[10px] text-slate-500 font-black border-r border-slate-200 uppercase">{item?.Color?.name || '-'}</td>
                                    <td className="px-2 py-1 text-center text-[10px] text-slate-500 font-black border-r border-slate-200 uppercase">{item?.Size?.name || '-'}</td>
                                    <td className="px-2 py-1 text-center text-[10px] text-slate-500 font-black border-r border-slate-200 uppercase">{item?.Item?.Uom?.name || item?.Uom?.name || item?.uom || '-'}</td>
                                    <td className="px-2 py-1 text-center border-r border-slate-200">
                                        <div className="flex items-center justify-center gap-1.5">
                                            <span className="text-[10px] font-black text-slate-500 uppercase">{item?.stockQty || '0'}</span>
                                            {!item.isReturn && (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); onViewStock(item); }}
                                                    className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-all"
                                                    title="View Store-wise Stock"
                                                >
                                                    <Eye size={12} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-2 py-0.5 border-r border-slate-200">
                                        <div className="flex items-center gap-1 justify-center">
                                            <button 
                                                disabled={selectedReportSaleId}
                                                onClick={() => updateQuantity(item.id, -1, item.sizeId, item.colorId)} className="w-5 h-5 flex items-center justify-center bg-slate-100 rounded text-slate-600 hover:bg-slate-200 active:scale-95 transition-all">-</button>
                                            <input
                                                ref={ref => qtyInputRefs.current[cartKey] = ref}
                                                type="number"
                                                value={item.qty}
                                                onChange={(e) => updateQuantity(item.id, e.target.value, item.sizeId, item.colorId, true)}
                                                className="w-10 text-center bg-transparent text-[11px] font-black focus:outline-none"
                                                onFocus={(e) => { e.target.select(); setActiveRowIndex(index); }}
                                                disabled={selectedReportSaleId}
                                            />
                                            <button 
                                                disabled={selectedReportSaleId}
                                                onClick={() => updateQuantity(item.id, 1, item.sizeId, item.colorId)} className="w-5 h-5 flex items-center justify-center bg-slate-100 rounded text-slate-600 hover:bg-slate-200 active:scale-95 transition-all">+</button>
                                            <button
                                                disabled={selectedReportSaleId}
                                                onClick={(e) => { e.stopPropagation(); handleShowItemOffers(item); }}
                                                title="View Item Offers"
                                                className="p-1 text-indigo-600 bg-indigo-50 hover:text-white hover:bg-indigo-600 rounded transition-all flex items-center justify-center border border-indigo-100 hover:border-indigo-600 shrink-0"
                                            >
                                                <Gift size={13} fill="currentColor" />
                                            </button>
                                        </div>
                                    </td>
                                    <td className="px-2 py-0.5 border-r border-slate-200 text-center">
                                        {/* <select
                                            value={item.salesPersonId || ""}
                                            onChange={(e) => handleRowSalesPersonChange(index, e.target.value)}
                                            className="w-full bg-transparent text-[10px] font-black text-slate-700 outline-none border-none focus:ring-0 cursor-pointer text-center p-0"
                                        >
                                            <option value="">- SELECT -</option>
                                            {employees.map(emp => (
                                                <option key={emp.id} value={emp.id}>{emp.name}</option>
                                            ))}
                                        </select> */}
                                        <div className="text-[12px] font-bold text-slate-400 mt-0.5">
                                            {item.salesPersonBarcode || ""}
                                        </div>
                                    </td>
                                    <td className="px-2 py-0.5 border-r border-slate-200">
                                        <input
                                            type="number"
                                            value={item.price}
                                            onChange={(e) => updateRate(item.id, e.target.value, item.sizeId, item.colorId)}
                                            className={`w-full py-0.5 text-right bg-transparent border-transparent hover:border-slate-200 focus:bg-white focus:border-indigo-400 rounded transition-all font-black text-sm outline-none ${item.priceType === 'offerPrice' ? 'text-emerald-600' : 'text-slate-800'}`}
                                            onFocus={(e) => e.target.select()}
                                            disabled={selectedReportSaleId}
                                        />
                                    </td>
                                    <td className="px-2 py-1 text-right border-r border-slate-200 bg-slate-50/50 font-serif">
                                        <span className="text-[12px] font-black text-indigo-700">₹{rowTotal.toLocaleString()}</span>
                                    </td>
                                    <td className="px-2 py-1 text-center bg-slate-50/50">
                                        <button
                                            disabled={selectedReportSaleId}
                                            onClick={(e) => { e.stopPropagation(); removeFromCart(cartKey); }} className="p-1.5 text-slate-300 hover:text-red-500 transition-all rounded-lg hover:bg-red-50"><Trash2 size={14} /></button>
                                    </td>
                                </tr>
                            );
                        })}
                        {[...Array(Math.max(0, 15 - cart.length))].map((_, i) => (
                            <tr key={`empty-${i}`} className="h-8 border-b border-slate-50/30">
                                <td className="border-r border-slate-200"></td>
                                <td className="border-r border-slate-200"></td>
                                <td className="border-r border-slate-200"></td>
                                <td className="border-r border-slate-200"></td>
                                <td className="border-r border-slate-200"></td>
                                <td className="border-r border-slate-200"></td>
                                <td className="border-r border-slate-200"></td>
                                <td className="border-r border-slate-200"></td>
                                <td className="border-r border-slate-200"></td>
                                <td className="border-r border-slate-200 bg-slate-50/50"></td>
                                <td className="bg-slate-50/50"></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </main>
    );
};

export default POSCartTable;
